#!/usr/bin/env python3
"""
Inference agent for the Food Dash OpenEnv environment.

Supports two modes:
  --mode direct   (default) Run the environment in-process (for grading)
  --mode http     Call the FastAPI server via HTTP (production pipeline)

Environment variables:
  API_BASE_URL   — OpenAI-compatible base URL (default https://api.openai.com/v1)
  MODEL_NAME     — Model id (e.g. gpt-4o-mini)
  HF_TOKEN       — API key (OpenAI or compatible)
  OPENENV_API_URL — FastAPI server base URL (default http://localhost:8000)
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from typing import Any

# ---------------------------------------------------------------------------
# Path setup
# ---------------------------------------------------------------------------
_this_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(os.path.dirname(_this_dir))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from openenv.env import FoodDashEnv
from openenv.graders import grade_easy, grade_hard, grade_medium
from openenv.models import Action
from openenv.tasks import get_task

ENV_NAME = "food-dash-env"
BASE_URL = os.getenv("OPENENV_API_URL", "http://localhost:8000")


# =============================================================================
# Utilities
# =============================================================================

def _format_float(value: float, digits: int = 2) -> str:
    return f"{float(value):.{digits}f}"


def _format_bool(value: bool) -> str:
    return "true" if value else "false"


def _format_action(action: Action) -> str:
    action_type = action.action_type.lower().strip()
    if action_type in {"prioritize", "prioritize_order"}:
        return f"prioritize_order(order_id={action.order_id})"
    if action_type == "delay_order":
        return f"delay_order(order_id={action.order_id})"
    if action_type in {"recommend", "recommend_item", "submit_recommendation"}:
        return f"recommend_item(user_id={action.user_id})"
    if action_type == "split_kitchen_load":
        order_ids = action.order_ids or ([] if action.order_id is None else [action.order_id])
        joined = ",".join(str(order_id) for order_id in order_ids)
        return f"split_kitchen_load(order_ids={joined})"
    if action_type == "reject_order":
        return f"reject_order(order_id={action.order_id})"
    return "noop()"


def _urgency_score(order: dict[str, Any]) -> float:
    priority_bonus = {"vip": 5.0, "normal": 2.8, "low": 1.8}.get(str(order.get("order_priority")), 1.0)
    patience_remaining = float(order.get("patience_remaining", 0.0))
    patience_pressure = max(0.0, 5.0 - patience_remaining)
    return (
        priority_bonus
        + float(order.get("wait_time", 0.0)) * 0.55
        + float(order.get("prep_complexity", 1)) * 0.85
        + patience_pressure * 1.1
    )


# =============================================================================
# Heuristic Agent
# =============================================================================

def _action_from_heuristic(env, obs, task_cfg, step):
    pending = list(obs.pending_orders or []) if hasattr(obs, "pending_orders") else list(obs.get("pending_orders", []))
    active = list(obs.active_orders or []) if hasattr(obs, "active_orders") else list(obs.get("active_orders", []))

    if not hasattr(env, "_last_order_id"):
        env._last_order_id = None

    if not pending and not active:
        return Action(action_type="noop")

    load = obs.kitchen_load if hasattr(obs, "kitchen_load") else obs.get("kitchen_load", 0)
    capacity_left = obs.kitchen_capacity_remaining if hasattr(obs, "kitchen_capacity_remaining") else obs.get("kitchen_capacity_remaining", 0)

    # 1. FILL KITCHEN
    if capacity_left > 0 and pending:
        best = max(pending, key=lambda o: o["wait_time"] + 2 * (o["order_priority"] == "vip"))
        oid = int(best["id"])
        env._last_order_id = oid
        return Action(action_type="prioritize_order", order_id=oid)

    # 2. STARVATION PROTECTION
    starving = [o for o in pending if o["patience_remaining"] <= 2]
    if starving:
        worst = max(starving, key=lambda o: o["wait_time"])
        oid = int(worst["id"])
        env._last_order_id = oid
        return Action(action_type="prioritize_order", order_id=oid)

    # 3. OVERLOAD CONTROL
    if load > 0.85 and len(pending) >= 2:
        ids = [int(pending[0]["id"]), int(pending[1]["id"])]
        return Action(action_type="split_kitchen_load", order_ids=ids)

    # 4. VIP URGENCY
    vip_orders = [o for o in pending if o["order_priority"] == "vip"]
    if vip_orders:
        best = max(vip_orders, key=lambda o: o["wait_time"])
        oid = int(best["id"])
        env._last_order_id = oid
        return Action(action_type="prioritize_order", order_id=oid)

    # 5. FAIRNESS (LOW PRIORITY)
    low_orders = [o for o in pending if o["order_priority"] == "low"]
    if low_orders:
        worst = max(low_orders, key=lambda o: o["wait_time"])
        if worst["wait_time"] > 6:
            oid = int(worst["id"])
            env._last_order_id = oid
            return Action(action_type="prioritize_order", order_id=oid)

    # 6. GLOBAL SCORING
    def score(o):
        p = {"vip": 6, "normal": 3, "low": 2}.get(o["order_priority"], 1)
        return p + 0.8 * o["wait_time"] + 0.3 * o["prep_complexity"]

    candidates = pending + active
    if not candidates:
        return Action(action_type="noop")

    sorted_orders = sorted(candidates, key=score, reverse=True)

    # 7. ANTI-LOOP
    for o in sorted_orders:
        oid = int(o["id"])
        if oid != env._last_order_id:
            env._last_order_id = oid
            return Action(action_type="prioritize_order", order_id=oid)

    oid = int(sorted_orders[step % len(sorted_orders)]["id"])
    env._last_order_id = oid
    return Action(action_type="prioritize_order", order_id=oid)


# =============================================================================
# LLM Agent (optional)
# =============================================================================

def _try_get_openai_client():
    """Try to create an OpenAI client, return (client, model) or (None, None)."""
    try:
        from openai import OpenAI
    except ImportError:
        return None, None

    base_url = os.environ.get("API_BASE_URL", "").strip()
    model = os.environ.get("MODEL_NAME", "").strip()
    api_key = os.environ.get("HF_TOKEN", "").strip()

    if not all([base_url, model, api_key]):
        return None, model or "heuristic"

    try:
        client = OpenAI(base_url=base_url.rstrip("/"), api_key=api_key, max_retries=0, timeout=2.0)
        return client, model
    except Exception:
        return None, model or "heuristic"


def _action_from_llm(client, model: str, obs: Any, task_cfg: dict[str, Any]) -> Action | None:
    if client is None:
        return None
    system = (
        "You control a restaurant operations simulator. "
        "Reply with exactly one JSON object and no markdown. "
        'Schema: {"action_type": str, "order_id": int|null, "order_ids": list[int]|null, "user_id": int|null}. '
        "Allowed action_type values: prioritize_order, delay_order, recommend_item, split_kitchen_load, reject_order, noop. "
        "Use prioritize_order for urgent orders, split_kitchen_load for two queued orders, "
        "recommend_item when recommendation quality is worth the time trade-off, and reject_order only as a last resort."
    )
    user_payload = {
        "task": task_cfg.get("name"),
        "time": obs.time if hasattr(obs, "time") else obs.get("time"),
        "pending_orders": obs.pending_orders if hasattr(obs, "pending_orders") else obs.get("pending_orders"),
        "active_orders": obs.active_orders if hasattr(obs, "active_orders") else obs.get("active_orders"),
        "kitchen_load": obs.kitchen_load if hasattr(obs, "kitchen_load") else obs.get("kitchen_load"),
        "kitchen_capacity_remaining": obs.kitchen_capacity_remaining if hasattr(obs, "kitchen_capacity_remaining") else obs.get("kitchen_capacity_remaining"),
        "avg_wait_time": obs.avg_wait_time if hasattr(obs, "avg_wait_time") else obs.get("avg_wait_time"),
        "last_action_result": obs.last_action_result if hasattr(obs, "last_action_result") else obs.get("last_action_result"),
    }
    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(user_payload)},
            ],
            temperature=0.1,
            max_tokens=140,
        )
        text = (resp.choices[0].message.content or "").strip()
        if "```" in text:
            text = text.split("```")[1].removeprefix("json").strip()
        return Action.model_validate(json.loads(text))
    except Exception:
        return None


# =============================================================================
# Grading
# =============================================================================

def _grade(task_id: str, snapshot: dict[str, Any]) -> float:
    if task_id == "easy":
        return grade_easy(snapshot)
    if task_id == "medium":
        return grade_medium(snapshot)
    return grade_hard(snapshot)


# =============================================================================
# Direct Mode (in-process, for grading)
# =============================================================================

def _run_task_direct(task_id: str, client, model: str) -> dict[str, Any]:
    cfg = get_task(task_id)
    env = FoodDashEnv(cfg)
    obs = env.reset(cfg)
    task_client = client

    print(f"[START] task={task_id} env={ENV_NAME} model={model} mode=direct")

    rewards: list[float] = []
    step = 0
    done = False

    while not done:
        act = _action_from_llm(task_client, model, obs, cfg)
        if act is None:
            task_client = None
            act = _action_from_heuristic(env, obs, cfg, step)

        obs, reward, done, _info = env.step(act)
        step = int(_info.get("step", step + 1))
        rewards.append(float(reward))

        print(
            "[STEP] "
            f"step={step} "
            f"action={_format_action(act)} "
            f"reward={_format_float(reward)} "
            f"done={_format_bool(done)} "
            "error=null"
        )

        if step >= int(cfg.get("max_steps", 200)):
            done = True

    snap = env.state()
    score = _grade(task_id, snap)
    rewards_str = ",".join(_format_float(value) for value in rewards)
    print(f"[END] success=true steps={step} score={score:.4f} rewards={rewards_str}")

    return {
        "task": task_id,
        "success": True,
        "steps": step,
        "score": score,
        "rewards": rewards,
    }


# =============================================================================
# HTTP Mode (calls FastAPI server)
# =============================================================================

def _http_request(method: str, path: str, json_data: dict | None = None, retries: int = 3) -> dict:
    """HTTP request with retry logic."""
    import requests

    url = f"{BASE_URL}{path}"
    last_exc = None

    for attempt in range(retries):
        try:
            if method == "GET":
                resp = requests.get(url, timeout=10)
            else:
                resp = requests.post(url, json=json_data or {}, timeout=10)

            if resp.status_code == 200:
                return resp.json()
            else:
                last_exc = Exception(f"HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            last_exc = exc
            if attempt < retries - 1:
                time.sleep(0.5 * (attempt + 1))

    raise last_exc or Exception("HTTP request failed")


def _run_task_http(task_id: str) -> dict[str, Any]:
    print(f"[START] task={task_id} env={ENV_NAME} mode=http base_url={BASE_URL}")

    # Reset
    obs_data = _http_request("POST", "/reset", {"task": task_id})

    rewards: list[float] = []
    step = 0
    done = False

    # We need a dummy object to hold _last_order_id for the heuristic
    class _Ctx:
        _last_order_id = None
    ctx = _Ctx()

    while not done:
        # Build a simple namespace for observations
        class _Obs:
            pass
        obs = _Obs()
        obs.pending_orders = obs_data.get("pending_orders", [])
        obs.active_orders = obs_data.get("active_orders", [])
        obs.kitchen_load = obs_data.get("kitchen_load", 0)
        obs.kitchen_capacity_remaining = obs_data.get("kitchen_capacity_remaining", 0)
        obs.avg_wait_time = obs_data.get("avg_wait_time", 0)
        obs.last_action_result = obs_data.get("last_action_result", "")
        obs.time = obs_data.get("time", 0)

        cfg = get_task(task_id)
        act = _action_from_heuristic(ctx, obs, cfg, step)

        # Step via HTTP
        step_payload = {"action_type": act.action_type}
        if act.order_id is not None:
            step_payload["order_id"] = act.order_id
        if act.order_ids is not None:
            step_payload["order_ids"] = act.order_ids
        if act.user_id is not None:
            step_payload["user_id"] = act.user_id

        try:
            result = _http_request("POST", "/step", step_payload)
        except Exception as exc:
            print(f"[ERROR] Step failed: {exc}")
            break

        obs_data = result.get("observation", {})
        reward = float(result.get("reward", 0.0))
        done = bool(result.get("done", False))
        step_info = result.get("info", {})
        step = int(step_info.get("step", step + 1))

        rewards.append(reward)
        print(
            "[STEP] "
            f"step={step} "
            f"action={_format_action(act)} "
            f"reward={_format_float(reward)} "
            f"done={_format_bool(done)} "
            "error=null"
        )

        if step >= int(cfg.get("max_steps", 200)):
            done = True

    # Get final state for grading
    try:
        snap = _http_request("GET", "/state")
    except Exception:
        snap = {}

    score = _grade(task_id, snap) if snap else 0.0
    rewards_str = ",".join(_format_float(v) for v in rewards)
    print(f"[END] success=true steps={step} score={score:.4f} rewards={rewards_str}")

    return {
        "task": task_id,
        "success": True,
        "steps": step,
        "score": score,
        "rewards": rewards,
    }


# =============================================================================
# Main
# =============================================================================

def main() -> None:
    parser = argparse.ArgumentParser(description="Food Dash OpenEnv Inference Agent")
    parser.add_argument(
        "--mode",
        choices=["direct", "http"],
        default="direct",
        help="direct = in-process env (default, for grading); http = call FastAPI server",
    )
    parser.add_argument(
        "--tasks",
        nargs="+",
        choices=["easy", "medium", "hard"],
        default=["easy", "medium", "hard"],
        help="Which tasks to run (default: all three)",
    )
    args = parser.parse_args()

    results: list[dict[str, Any]] = []

    if args.mode == "http":
        print(f"[INFO] HTTP mode — connecting to {BASE_URL}")
        for task_id in args.tasks:
            try:
                results.append(_run_task_http(task_id))
            except Exception as exc:
                print(f"[END] success=false steps=0 score=0.0000 rewards=")
                sys.stderr.write(f"task={task_id} error={exc}\n")
                results.append({
                    "task": task_id, "success": False, "steps": 0,
                    "score": 0.0, "rewards": [],
                })
    else:
        # Direct mode — try LLM, fall back to heuristic
        client, model = _try_get_openai_client()
        if client:
            print(f"[INFO] Direct mode — LLM model: {model}")
        else:
            model = model or "heuristic"
            print(f"[INFO] Direct mode — using heuristic agent (no LLM configured)")

        for task_id in args.tasks:
            try:
                results.append(_run_task_direct(task_id, client, model))
            except Exception as exc:
                print(f"[END] success=false steps=0 score=0.0000 rewards=")
                sys.stderr.write(f"task={task_id} error={exc}\n")
                results.append({
                    "task": task_id, "success": False, "steps": 0,
                    "score": 0.0, "rewards": [],
                })

    if results:
        norm = sum(r["score"] for r in results) / len(results)
        print(f"\n[SUMMARY] normalized_mean_score={norm:.4f}")
        sys.stderr.write(f"normalized_mean_score={norm:.4f}\n")


if __name__ == "__main__":
    main()
