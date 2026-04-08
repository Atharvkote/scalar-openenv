"""Pydantic models for observations, actions, and reward payloads."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class OrderView(BaseModel):
    """Single order exposed to the agent."""

    id: int
    table_id: int
    user_id: int
    status: str
    order_priority: str
    prep_time: float = Field(description="Remaining prep time when active or total prep time when pending.")
    prep_complexity: int = Field(description="Preparation complexity on a 1-3 scale.")
    customer_patience: float = Field(description="Maximum desirable wait before the customer becomes dissatisfied.")
    patience_remaining: float
    wait_time: float = Field(description="Elapsed wait in tick units.")
    queue_position: int
    arrival_time: int
    vip_deadline: Optional[int] = None


class Observation(BaseModel):
    """Environment observation after reset or step."""

    pending_orders: list[dict[str, Any]]
    active_orders: list[dict[str, Any]]
    kitchen_load: float
    avg_wait_time: float
    kitchen_capacity_remaining: int
    current_capacity: int
    time: int
    last_action_result: str


class Action(BaseModel):
    """Agent action; fields depend on action_type."""

    action_type: str
    order_id: Optional[int] = None
    order_ids: Optional[list[int]] = None
    user_id: Optional[int] = None


class Reward(BaseModel):
    """Structured reward breakdown."""

    value: float
    reason: str
    components: dict[str, float] = Field(default_factory=dict)
