"""Task presets for OpenEnv / hackathon evaluation."""

from __future__ import annotations

from typing import Any, Callable


def easy_task() -> dict[str, Any]:
    """
    Small lunch rush.

    Few orders, light arrivals, and one VIP customer. The focus is on learning
    sensible prioritization while keeping low-priority customers from being ignored.
    """
    return {
        "name": "easy",
        "n_orders": 6,
        "n_tables": 3,
        "kitchen_capacity": 2,
        "capacity_schedule": {},
        "priority_weights": {"vip": 1, "normal": 4, "low": 1},
        "complexity_weights": [0.45, 0.40, 0.15],
        "patience_range": [9, 14],
        "arrival_window": 2,
        "initial_visible_orders": 4,
        "seed": 42,
        "max_steps": 80,
        "focus": "service_speed_and_fairness",
    }


def medium_task() -> dict[str, Any]:
    """
    Busy service with recommendations enabled.

    The agent must trade off direct kitchen actions against recommendation actions
    while keeping throughput and fairness strong.
    """
    return {
        "name": "medium",
        "n_orders": 12,
        "n_tables": 6,
        "kitchen_capacity": 3,
        "capacity_schedule": {6: 2, 10: 3},
        "priority_weights": {"vip": 2, "normal": 7, "low": 3},
        "complexity_weights": [0.30, 0.45, 0.25],
        "patience_range": [8, 13],
        "arrival_window": 5,
        "initial_visible_orders": 5,
        "seed": 4242,
        "max_steps": 150,
        "include_recommendation": True,
        "focus": "throughput_plus_recommendation_quality",
    }


def hard_task() -> dict[str, Any]:
    """
    Stress scenario with staggered demand and kitchen disruption.

    Twenty-six orders arrive over time, VIP deadlines are tight, the kitchen loses
    capacity mid-episode, and the agent must manage overload, fairness, and speed.
    """
    return {
        "name": "hard",
        "n_orders": 26,
        "n_tables": 9,
        "kitchen_capacity": 4,
        "capacity_schedule": {5: 3, 8: 2, 12: 3, 16: 4},
        "priority_weights": {"vip": 4, "normal": 12, "low": 10},
        "complexity_weights": [0.20, 0.45, 0.35],
        "patience_range": [8, 13],
        "arrival_window": 9,
        "initial_visible_orders": 6,
        "seed": 1337,
        "max_steps": 190,
        "include_recommendation": True,
        "kitchen_overload": True,
        "focus": "conflicting_objectives_under_pressure",
    }


TASK_REGISTRY: dict[str, Callable[[], dict[str, Any]]] = {
    "easy": easy_task,
    "medium": medium_task,
    "hard": hard_task,
}


def get_task(name: str) -> dict[str, Any]:
    if name not in TASK_REGISTRY:
        raise KeyError(f"Unknown task: {name}")
    return TASK_REGISTRY[name]()
