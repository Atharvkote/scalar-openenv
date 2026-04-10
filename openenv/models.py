"""
Pydantic models for FoodDash OpenEnv.

Defines the full typed contract for Actions, Observations, and StepResponse
as required by the OpenEnv specification.
"""

from __future__ import annotations

from typing import Any, Dict, Literal, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Action
# ---------------------------------------------------------------------------

class Action(BaseModel):
    """
    Agent action submitted to the environment each step.

    action_type:
        "process"    — Move a pending order into the kitchen (starts cooking).
                       Fails if kitchen is at max capacity or order is not pending.
        "prioritize" — Reduces wait_time (pending) or prep_time (processing) by 1.
                       For critically urgent pending orders this also force-starts them.
        "idle"       — Do nothing this step (incurs base time penalty only).

    order_id:
        Integer ID of the target order. Required for "process" and "prioritize".
        Ignored (and should be None) for "idle".
    """

    action_type: Literal["process", "prioritize", "idle"] = Field(
        default="process",
        description="Type of kitchen action to take.",
    )
    order_id: Optional[int] = Field(
        default=None,
        description="ID of the order to act on. Required for process/prioritize.",
    )


# ---------------------------------------------------------------------------
# Observation
# ---------------------------------------------------------------------------

class Observation(BaseModel):
    """
    Partial environment observation returned after each step.

    Aggregated statistics only — the agent does NOT see the full order list
    directly via the observation (use /state for full introspection).
    """

    pending_orders: int = Field(description="Number of orders waiting to be processed.")
    processing_orders: int = Field(description="Number of orders currently in the kitchen.")
    completed_orders: int = Field(description="Number of successfully completed orders.")
    failed_orders: int = Field(description="Number of orders that exceeded patience and were lost.")
    avg_wait_time: float = Field(description="Mean wait_time across all currently pending orders.")
    high_priority_pending: int = Field(
        description="Count of pending orders that are high-priority or VIP."
    )
    urgent_orders: int = Field(
        description="Count of pending orders within 1 step of expiry (wait >= patience - 1)."
    )


# ---------------------------------------------------------------------------
# StepResponse
# ---------------------------------------------------------------------------

class StepResponse(BaseModel):
    """Full response envelope returned by env.step()."""

    observation: Observation = Field(description="Aggregated state after the action.")
    reward: float = Field(description="Scalar reward signal in [-1.0, 1.0].")
    done: bool = Field(description="Whether the episode has terminated.")
    info: Dict[str, Any] = Field(
        default_factory=dict,
        description=(
            "Diagnostic dictionary. Keys: last_action_error, total_completed, "
            "total_failed, overload_penalty_counter, rush_injected."
        ),
    )