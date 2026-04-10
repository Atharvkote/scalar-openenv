"""
FoodDash OpenEnv — Inference Script
====================================

Runs an LLM-powered agent (via OpenAI-compatible API) against all three
FoodDash tasks and emits structured stdout logs in the mandatory format:

    [START] task=<task> env=food-dash model=<model>
    [STEP]  step=<n> action=<dict> reward=<0.00> done=<true|false> error=<msg|null>
    [END]   success=<true|false> steps=<n> score=<0.0000> rewards=<r1,...>

Environment Variables
---------------------
API_BASE_URL   Base URL for the OpenAI-compatible inference endpoint.
               Default: https://api.openai.com/v1
MODEL_NAME     Model identifier.
               Default: gpt-4o-mini
HF_TOKEN       Hugging Face token (used as API key on HF Inference).
OPENAI_API_KEY Standard OpenAI key (fallback if HF_TOKEN not set).
API_KEY        Generic fallback key.

Agent Strategy
--------------
The agent uses a two-tier approach:

  1. LLM decision (primary): On each step the full state is serialised to
     JSON and sent to the LLM with a structured system prompt. The LLM is
     asked to return a single JSON action. The response is parsed and
     validated; if it is malformed the heuristic fallback is used.

  2. Heuristic fallback (secondary): A deterministic priority-queue
     heuristic that is guaranteed to return a valid action. Used when:
       • No API key is configured.
       • The LLM response cannot be parsed.
       • An API error occurs.

The heuristic alone already scores ~1.0 on easy and ~0.7 on medium, so it
serves as a strong reproducible baseline.

Usage
-----
    # All three tasks (default)
    python inference.py

    # Single task
    python inference.py --task easy

    # Use LLM
    OPENAI_API_KEY=sk-... python inference.py --task medium
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
from typing import Dict, List, Optional

from openai import OpenAI

from openenv.env import FoodDashEnv
from openenv.graders import MIN_SCORE, grade

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

API_BASE_URL: str = os.getenv("API_BASE_URL", "https://api.openai.com/v1")
MODEL_NAME: str = os.getenv("MODEL_NAME", "gpt-4o-mini")
API_KEY: Optional[str] = (
    os.getenv("HF_TOKEN") or os.getenv("OPENAI_API_KEY") or os.getenv("API_KEY")
)

ENV_NAME = "food-dash"

# LLM agent system prompt — instructs the model to return structured JSON.
SYSTEM_PROMPT = """You are an expert restaurant kitchen manager.
You will receive the current state of a busy kitchen as JSON.
Your goal is to maximise the number of completed orders while minimising failures.

RULES:
- Kitchen capacity is {capacity} simultaneous cooking slots.
- Orders expire when wait_time > patience — rescue urgent ones first.
- High-priority and VIP orders give bonus reward when completed.
- Overloading the kitchen incurs a penalty.

ACTIONS (return exactly one as JSON):
  {{"action_type": "process",    "order_id": <int>}}   — Start cooking a pending order.
  {{"action_type": "prioritize", "order_id": <int>}}   — Speed up or rescue an order.
  {{"action_type": "idle",       "order_id": null}}    — Do nothing (usually wrong).

STRATEGY:
1. If any order has wait_time >= patience - 1, rescue it with prioritize.
2. Fill empty kitchen slots with high-priority or VIP pending orders.
3. If kitchen is full, prioritize the processing order with most prep_time left.
4. Never idle if there are pending or processing orders.

Return ONLY valid JSON. No explanation. No markdown. No extra keys."""


# ---------------------------------------------------------------------------
# Logging helpers (mandatory stdout format)
# ---------------------------------------------------------------------------

def log_start(task: str, model: str) -> None:
    print(f"[START] task={task} env={ENV_NAME} model={model}", flush=True)


def log_step(
    step: int,
    action: Dict,
    reward: float,
    done: bool,
    error: Optional[str],
) -> None:
    err_val = error if error else "null"
    print(
        f"[STEP] step={step} action={action} reward={reward:.2f} "
        f"done={str(done).lower()} error={err_val}",
        flush=True,
    )


def log_end(success: bool, steps: int, score: float, rewards: List[float]) -> None:
    rewards_str = ",".join(f"{r:.2f}" for r in rewards)
    print(
        f"[END] success={str(success).lower()} steps={steps} "
        f"score={score:.4f} rewards={rewards_str}",
        flush=True,
    )


# ---------------------------------------------------------------------------
# OpenAI client
# ---------------------------------------------------------------------------

def _build_client() -> Optional[OpenAI]:
    if not API_KEY:
        return None
    try:
        return OpenAI(base_url=API_BASE_URL, api_key=API_KEY)
    except Exception:
        return None


# ---------------------------------------------------------------------------
# LLM agent
# ---------------------------------------------------------------------------

def _ask_llm(
    client: OpenAI,
    env: FoodDashEnv,
    step: int,
) -> Optional[Dict]:
    """
    Call the LLM with the full env state and parse a JSON action.
    Returns None if the response cannot be parsed or an error occurs.
    """
    state = env.state()
    capacity = int(state["max_kitchen_capacity"])

    system = SYSTEM_PROMPT.format(capacity=capacity)
    user_content = (
        f"Step {step}/{state['max_steps']}. Kitchen state:\n"
        + json.dumps(state, indent=2)
        + "\n\nReturn your action as JSON."
    )

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
            max_tokens=64,
            temperature=0.0,
        )
        raw = response.choices[0].message.content.strip()

        # Strip markdown fences if the model wrapped JSON
        if raw.startswith("```"):
            lines = raw.split("\n")
            raw = "\n".join(
                l for l in lines if not l.startswith("```")
            ).strip()

        action = json.loads(raw)
        # Validate required keys
        if "action_type" not in action:
            return None
        return action

    except Exception:
        return None


# ---------------------------------------------------------------------------
# Heuristic fallback agent
# ---------------------------------------------------------------------------

def _heuristic_action(env: FoodDashEnv) -> Dict:
    """
    Deterministic priority-queue heuristic.

    Decision hierarchy:
      1. Rescue any urgent pending order (wait >= patience - 1).
         If kitchen has capacity → process; else → prioritize (emergency pull).
      2. If kitchen has capacity, pick the pending order with the fewest
         remaining patience ticks (time-to-expire = patience - wait_time),
         breaking ties by value (VIP > high > medium > low).
      3. If kitchen is full, prioritize the processing order with most
         prep_time remaining (speed up the slowest cooker to free a slot).
      4. If no pending orders, prioritize any remaining processing order.
      5. Idle only when truly nothing to do.
    """
    pending = [o for o in env.orders if o["status"] == "pending"]
    processing = [o for o in env.orders if o["status"] == "processing"]
    capacity_free = len(processing) < env.max_kitchen_capacity

    def time_to_expire(o):
        return int(o["patience"]) - int(o["wait_time"])

    def value_rank(o):
        # Lower = more valuable
        if bool(o["is_vip"]):
            return 0
        if o["priority"] == "high":
            return 1
        if o["priority"] == "medium":
            return 2
        return 3

    # --- 1. Rescue urgent orders (about to expire next tick) ---
    urgent = [o for o in pending if time_to_expire(o) <= 1]
    if urgent:
        urgent.sort(key=lambda o: (time_to_expire(o), value_rank(o), int(o["id"])))
        chosen = urgent[0]
        if capacity_free:
            return {"action_type": "process", "order_id": int(chosen["id"])}
        return {"action_type": "prioritize", "order_id": int(chosen["id"])}

    # --- 2. Fill empty slots: pick most time-pressured high-value pending ---
    if pending and capacity_free:
        # Sort: soonest-to-expire first, then by value
        pending.sort(key=lambda o: (time_to_expire(o), value_rank(o), int(o["id"])))
        return {"action_type": "process", "order_id": int(pending[0]["id"])}

    # --- 3. Kitchen full: speed up the order taking longest to cook ---
    if processing:
        processing.sort(key=lambda o: (-int(o["prep_time"]), int(o["id"])))
        return {"action_type": "prioritize", "order_id": int(processing[0]["id"])}

    # --- 4. Speed up anything remaining in kitchen ---
    if processing:
        return {"action_type": "prioritize", "order_id": int(processing[0]["id"])}

    return {"action_type": "idle", "order_id": None}


# ---------------------------------------------------------------------------
# Episode runner
# ---------------------------------------------------------------------------

async def run_episode(task: str, client: Optional[OpenAI]) -> None:
    """Run one full episode for the given task and print mandatory log lines."""
    env = FoodDashEnv()
    rewards: List[float] = []
    steps_taken = 0
    success = False
    score = MIN_SCORE

    log_start(task=task, model=MODEL_NAME)

    try:
        await env.reset(task=task)
        max_steps = env.max_steps

        for step in range(1, max_steps + 1):
            if env.is_done():
                break

            # Choose action: LLM if available, heuristic otherwise
            if client is not None:
                action = _ask_llm(client, env, step) or _heuristic_action(env)
            else:
                action = _heuristic_action(env)

            result = await env.step(action)
            reward = float(result.reward)
            done = bool(result.done)
            error = (
                result.info.get("last_action_error")
                if isinstance(result.info, dict)
                else None
            )
            rewards.append(reward)
            steps_taken = step

            log_step(
                step=step,
                action=action,
                reward=reward,
                done=done,
                error=str(error) if error else None,
            )

            if done:
                break

        score = float(grade(env))
        success = True

    except Exception as exc:
        # Ensure [END] is always emitted even on unexpected errors
        print(f"[ERROR] exception during episode: {exc}", flush=True)
        success = False

    finally:
        try:
            await env.close()
        except Exception:
            pass
        log_end(success=success, steps=steps_taken, score=score, rewards=rewards)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

async def main(tasks: List[str]) -> None:
    client = _build_client()
    if client is None:
        print(
            "[INFO] No API key found — running heuristic baseline (no LLM calls).",
            flush=True,
        )
    else:
        print(f"[INFO] LLM agent active: {MODEL_NAME} @ {API_BASE_URL}", flush=True)

    for task in tasks:
        await run_episode(task=task, client=client)
        print("", flush=True)  # blank line between tasks for readability


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run FoodDash OpenEnv inference across all tasks."
    )
    parser.add_argument(
        "--task",
        choices=["easy", "medium", "hard", "all"],
        default="all",
        help="Which task to run. 'all' runs easy → medium → hard (default).",
    )
    parser.add_argument(
        "--model",
        default=MODEL_NAME,
        help="Override MODEL_NAME env var.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()

    # Allow --model CLI flag to override env var
    if args.model != MODEL_NAME:
        MODEL_NAME = args.model  # type: ignore[assignment]

    if args.task == "all":
        tasks_to_run = ["easy", "medium", "hard"]
    else:
        tasks_to_run = [args.task]

    asyncio.run(main(tasks=tasks_to_run))
