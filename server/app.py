"""
FoodDash OpenEnv — FastAPI Server
==================================

Exposes the FoodDash environment over HTTP so it can be used as a
Hugging Face Space endpoint and validated by `openenv validate`.

Endpoints
---------
POST /reset          Reset the environment for a named task.
POST /step           Submit one action and advance the environment.
GET  /state          Return the full internal state (for debugging/graders).
GET  /health         Liveness probe — always returns 200 {"status": "ok"}.
GET  /test           Run a complete self-test across all three tasks and
                     return a JSON report with per-task scores.

Design Notes
------------
• A single global FoodDashEnv instance is shared across requests.
  For concurrent multi-agent evaluation, spawn separate processes or
  use the environment directly in-process.

• The /test endpoint runs synchronously inside an async context using
  asyncio — it is intentionally sequential so scores are reproducible.
"""

from __future__ import annotations

import asyncio
import os
import time
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

from openenv.env import FoodDashEnv
from openenv.graders import grade
from openenv.models import Action
from openenv.tasks import TASKS

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="food-dash-openenv",
    description=(
        "Peak-hour restaurant management RL environment. "
        "Implements the OpenEnv step/reset/state spec."
    ),
    version="1.1.0",
)

# Shared environment instance
env = FoodDashEnv()


def _task_catalog() -> Dict[str, Dict[str, Any]]:
    """Return JSON-friendly task metadata for the root overview endpoint."""
    return {
        task_name: {
            "num_orders": int(config["num_orders"]),
            "max_steps": int(config["max_steps"]),
            "max_kitchen_capacity": int(config["max_kitchen_capacity"]),
            "patience_base": int(config["patience_base"]),
            "patience_spread": int(config["patience_spread"]),
            "vip_every": int(config["vip_every"]),
            "fail_limit": int(config["fail_limit"]),
            "rush_injection_step": int(config.get("rush_injection_step", 9999)),
            "rush_order_count": int(config.get("rush_order_count", 0)),
        }
        for task_name, config in TASKS.items()
    }


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class ResetRequest(BaseModel):
    task: str = "easy"


class TestReport(BaseModel):
    summary: str
    tasks: List[Dict[str, Any]]
    all_passed: bool
    total_time_seconds: float


# ---------------------------------------------------------------------------
# Core endpoints
# ---------------------------------------------------------------------------

@app.get(
    "/",
    summary="API overview",
    response_description="Detailed API metadata, features, routes, and environment rules.",
)
async def root() -> Dict[str, Any]:
    """
    Return a machine-readable overview of the API.

    This is intended as a landing-page JSON payload for users,
    validators, and clients that want to discover available routes,
    request formats, environment rules, and task settings.
    """
    return {
        "message": "FoodDash OpenEnv API is running",
        "service": {
            "name": app.title,
            "version": app.version,
            "description": app.description,
            "environment_type": "deterministic reinforcement learning environment",
            "domain": "peak-hour restaurant dispatch and kitchen capacity management",
        },
        "documentation": {
            "openapi_json": "/openapi.json",
            "swagger_ui": "/docs",
            "redoc": "/redoc",
        },
        "features": [
            "Deterministic restaurant dispatch environment for reproducible evaluation",
            "Three difficulty levels: easy, medium, and hard",
            "FastAPI endpoints for reset, step, state inspection, and health checks",
            "Built-in self-test, smoke-test, and inference-style evaluation routes",
            "Reward shaping for urgency, priority, VIP handling, and overload control",
            "Hard-mode rush injection for dynamic mid-episode stress testing",
        ],
        "action_space": {
            "type": "single discrete action with optional target order",
            "schema": {
                "action_type": ["process", "prioritize", "idle"],
                "order_id": "integer or null",
            },
            "rules": [
                "process moves a pending order into the kitchen if capacity allows",
                "prioritize reduces urgency risk or remaining prep time for a targeted order",
                "idle advances the system without acting on any order",
                "invalid action types or invalid targets are penalized",
            ],
            "example": {"action_type": "process", "order_id": 1},
        },
        "observation_space": {
            "order_fields": [
                "id",
                "status",
                "prep_time",
                "priority",
                "wait_time",
                "patience",
                "is_vip",
            ],
            "global_fields": [
                "step_count",
                "max_steps",
                "max_kitchen_capacity",
                "total_completed",
                "total_failed",
                "overload_penalty_counter",
                "rush_injected",
            ],
        },
        "system_rules": {
            "step_flow": [
                "Inject rush orders when the configured hard-task rush step is reached",
                "Apply the agent action",
                "Increase wait_time for pending orders and fail any that exceed patience",
                "Decrease prep_time for processing orders and complete any that reach zero",
                "Apply reward bonuses and penalties, then clip reward to [-1.0, 1.0]",
                "Check episode termination conditions",
            ],
            "termination_conditions": [
                "All orders are in terminal states",
                "All orders are completed",
                "Failed orders reach the task fail_limit",
                "step_count reaches max_steps",
            ],
            "reward_rules": {
                "base_step_penalty": -0.02,
                "valid_process_bonus": 0.2,
                "critical_save_bonus": 0.4,
                "completion_bonus": 1.0,
                "high_priority_completion_bonus": 0.5,
                "vip_completion_bonus": 0.3,
                "expired_order_penalty": -1.0,
                "ignored_urgent_order_penalty": -0.3,
                "invalid_action_penalty": -0.2,
                "over_capacity_penalty": -0.5,
                "reward_clip_range": [-1.0, 1.0],
            },
            "kitchen_rules": {
                "max_parallel_processing_defined_per_task": True,
                "over_capacity_is_penalized": True,
                "shared_global_environment_used_by_reset_and_step": True,
                "test_endpoints_use_fresh_environment_instances": True,
            },
        },
        "tasks": _task_catalog(),
        "routes": [
            {
                "path": "/",
                "method": "GET",
                "purpose": "API overview and system documentation",
                "response_keys": [
                    "message",
                    "service",
                    "documentation",
                    "features",
                    "action_space",
                    "observation_space",
                    "system_rules",
                    "tasks",
                    "routes",
                    "current_environment",
                ],
            },
            {
                "path": "/reset",
                "method": "POST",
                "purpose": "Reset the shared environment for a selected task",
                "request_body": {"task": "easy | medium | hard"},
                "response_keys": ["observation", "reward", "done", "info"],
            },
            {
                "path": "/step",
                "method": "POST",
                "purpose": "Apply one action and advance the environment by one tick",
                "request_body": {
                    "action_type": "process | prioritize | idle",
                    "order_id": "integer | null",
                },
                "response_keys": ["observation", "reward", "done", "info"],
            },
            {
                "path": "/state",
                "method": "GET",
                "purpose": "Return the full internal environment state for debugging and grading",
                "response_keys": [
                    "task",
                    "step_count",
                    "orders",
                    "total_completed",
                    "total_failed",
                    "overload_penalty_counter",
                    "rush_injected",
                ],
            },
            {
                "path": "/health",
                "method": "GET",
                "purpose": "Basic liveness probe",
                "response_example": {"status": "ok"},
            },
            {
                "path": "/test",
                "method": "GET",
                "purpose": "Run the full heuristic self-test across easy, medium, and hard tasks",
                "response_keys": ["summary", "all_passed", "total_time_seconds", "tasks"],
            },
            {
                "path": "/test/smoke",
                "method": "GET",
                "purpose": "Run a lightweight reset-plus-step smoke test",
                "response_keys": [
                    "ok",
                    "task",
                    "reset_observation",
                    "step_reward",
                    "step_done",
                    "score",
                ],
            },
            {
                "path": "/test/inference",
                "method": "GET",
                "purpose": "Run a deterministic short rollout that mirrors inference behavior",
                "response_keys": ["ok", "results"],
            },
        ],
        "current_environment": {
            "task": env.current_task,
            "step_count": env.step_count,
            "max_steps": env.max_steps,
            "max_kitchen_capacity": env.max_kitchen_capacity,
            "total_orders": len(env.orders),
            "total_completed": env.total_completed,
            "total_failed": env.total_failed,
            "overload_penalty_counter": env.overload_penalty_counter,
            "rush_injected": env._rush_injected,
        },
    }

@app.post(
    "/reset",
    summary="Reset the environment",
    response_description="Initial observation plus metadata.",
)
async def reset(payload: ResetRequest | None = None) -> Dict[str, Any]:
    """
    Reset the shared environment for the given task.

    Request body (optional):
        {"task": "easy" | "medium" | "hard"}

    Returns the initial observation, reward=0.0, done=false, info={}.
    """
    task_name = payload.task if payload else "easy"
    try:
        observation = await env.reset(task=task_name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "observation": observation.model_dump(),
        "reward": 0.0,
        "done": env.is_done(),
        "info": {},
    }


@app.post(
    "/step",
    summary="Submit one action",
    response_description="Observation, reward, done flag, and diagnostic info.",
)
async def step(payload: Action) -> Dict[str, Any]:
    """
    Advance the environment by one tick.

    Request body:
        {"action_type": "process" | "prioritize" | "idle", "order_id": <int> | null}

    Returns the full StepResponse.
    """
    result = await env.step(action=payload.model_dump())
    return result.model_dump()


@app.get(
    "/state",
    summary="Full internal state",
    response_description="Complete environment state including all order details.",
)
async def state() -> Dict[str, Any]:
    """
    Return the full internal state of the environment.
    Includes all order statuses, wait times, prep times, and configuration.
    NOT part of the agent's observation space — provided for debugging and graders.
    """
    return env.state()


@app.get(
    "/health",
    summary="Health check",
    response_description='{"status": "ok"}',
)
async def health() -> Dict[str, str]:
    """Liveness probe. Returns 200 if the server is up."""
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# /test endpoint — self-contained correctness test
# ---------------------------------------------------------------------------

@app.get(
    "/test",
    summary="Self-test across all tasks",
    response_description="Per-task scores, pass/fail, and timing.",
)
async def test_all_tasks() -> JSONResponse:
    """
    Run a complete heuristic episode for each task (easy, medium, hard)
    and return a structured report.

    This endpoint is useful for:
    - Verifying the environment works end-to-end after deployment.
    - Checking grader scores are in [0, 1] (required by hackathon validators).
    - Smoke-testing after code changes.

    Each task is run with the built-in heuristic agent (no LLM required).
    The /test endpoint is idempotent — it creates a fresh FoodDashEnv
    internally and does not mutate the shared environment used by /step.
    """
    t0 = time.perf_counter()
    task_results: List[Dict[str, Any]] = []
    all_passed = True

    for task_name in ["easy", "medium", "hard"]:
        task_env = FoodDashEnv()
        await task_env.reset(task=task_name)

        rewards: List[float] = []
        steps = 0

        for _ in range(task_env.max_steps):
            if task_env.is_done():
                break

            action = _heuristic_action(task_env)
            result = await task_env.step(action)
            rewards.append(float(result.reward))
            steps += 1

            if result.done:
                break

        score = float(grade(task_env))
        passed = 0.0 < score < 1.0

        if not passed:
            all_passed = False

        final_state = task_env.state()

        task_results.append({
            "task": task_name,
            "score": round(score, 4),
            "steps_taken": steps,
            "total_orders": len(task_env.orders),
            "completed": final_state["total_completed"],
            "failed": final_state["total_failed"],
            "overload_events": final_state["overload_penalty_counter"],
            "rush_injected": final_state["rush_injected"],
            "total_reward": round(sum(rewards), 4),
            "avg_reward_per_step": round(sum(rewards) / max(steps, 1), 4),
            "score_in_valid_range": passed,
        })

    elapsed = round(time.perf_counter() - t0, 3)

    report = {
        "summary": "All tasks passed" if all_passed else "One or more tasks produced out-of-range scores",
        "all_passed": all_passed,
        "total_time_seconds": elapsed,
        "tasks": task_results,
    }

    status_code = 200 if all_passed else 500
    return JSONResponse(content=report, status_code=status_code)


@app.get(
    "/test/smoke",
    summary="Quick smoke test",
    response_description="Endpoint health and basic reset/step checks.",
)
async def test_smoke() -> Dict[str, Any]:
    """
    Lightweight API smoke test intended for users after deployment.
    Does not mutate the shared global environment.
    """
    smoke_env = FoodDashEnv()
    reset_obs = await smoke_env.reset("easy")
    first_pending = next((o for o in smoke_env.orders if o["status"] == "pending"), None)
    if first_pending is None:
        raise HTTPException(status_code=500, detail="No pending orders after reset")

    step_result = await smoke_env.step(
        {"action_type": "process", "order_id": int(first_pending["id"])}
    )
    score = float(grade(smoke_env))
    return {
        "ok": True,
        "task": "easy",
        "reset_observation": reset_obs.model_dump(),
        "step_reward": round(float(step_result.reward), 2),
        "step_done": bool(step_result.done),
        "score": round(score, 4),
    }


@app.get(
    "/test/inference",
    summary="Inference-like deterministic test run",
    response_description="Per-step rewards and final score for each task.",
)
async def test_inference() -> Dict[str, Any]:
    """
    Deterministic policy rollout over all tasks.
    Mirrors inference behavior without external API calls.
    """
    results: List[Dict[str, Any]] = []
    for task_name in ["easy", "medium", "hard"]:
        local_env = FoodDashEnv()
        await local_env.reset(task_name)
        rewards: List[float] = []
        for _ in range(min(10, local_env.max_steps)):
            if local_env.is_done():
                break
            action = _heuristic_action(local_env)
            step_result = await local_env.step(action)
            rewards.append(float(step_result.reward))
            if step_result.done:
                break
        results.append(
            {
                "task": task_name,
                "steps": len(rewards),
                "rewards": [round(r, 2) for r in rewards],
                "score": round(float(grade(local_env)), 4),
                "completed": local_env.total_completed,
                "failed": local_env.total_failed,
            }
        )
    return {"ok": True, "results": results}


# ---------------------------------------------------------------------------
# Heuristic agent (duplicated here so api.py has no inference.py dependency)
# ---------------------------------------------------------------------------

def _heuristic_action(task_env: FoodDashEnv) -> Dict[str, Any]:
    """Priority-queue heuristic — same logic as inference.py."""
    pending = [o for o in task_env.orders if o["status"] == "pending"]
    processing = [o for o in task_env.orders if o["status"] == "processing"]
    capacity_free = len(processing) < task_env.max_kitchen_capacity

    def time_to_expire(o):
        return int(o["patience"]) - int(o["wait_time"])

    def value_rank(o):
        if bool(o["is_vip"]):
            return 0
        if o["priority"] == "high":
            return 1
        if o["priority"] == "medium":
            return 2
        return 3

    # Rescue urgent orders first
    urgent = [o for o in pending if time_to_expire(o) <= 1]
    if urgent:
        urgent.sort(key=lambda o: (time_to_expire(o), value_rank(o), int(o["id"])))
        chosen = urgent[0]
        if capacity_free:
            return {"action_type": "process", "order_id": int(chosen["id"])}
        return {"action_type": "prioritize", "order_id": int(chosen["id"])}

    # Fill empty slots with most time-pressured order
    if pending and capacity_free:
        pending.sort(key=lambda o: (time_to_expire(o), value_rank(o), int(o["id"])))
        return {"action_type": "process", "order_id": int(pending[0]["id"])}

    # Speed up slowest processing order to free slot sooner
    if processing:
        processing.sort(key=lambda o: (-int(o["prep_time"]), int(o["id"])))
        return {"action_type": "prioritize", "order_id": int(processing[0]["id"])}

    return {"action_type": "idle", "order_id": None}


def main() -> None:
    """Run the FastAPI app using environment-configurable host and port."""
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("server.app:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
