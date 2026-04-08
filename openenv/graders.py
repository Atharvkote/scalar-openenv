"""
Deterministic scoring (0.0–1.0) from episode snapshots.

No randomness: pure functions of ``state_snapshot_for_grading`` outputs.
"""

from __future__ import annotations

from typing import Any

from openenv.config import WAIT_TARGETS


def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def _ratio(numerator: float, denominator: float, default: float = 0.0) -> float:
    if denominator <= 0:
        return default
    return numerator / denominator


def _metrics(snapshot: dict[str, Any], task_name: str) -> dict[str, float]:
    total_orders = float(max(1, int(snapshot.get("total_orders", 1))))
    recommendation_attempts = float(snapshot.get("recommendation_attempts", 0))
    return {
        "completion_rate": _ratio(float(snapshot.get("completed", 0)), total_orders),
        "on_time_rate": _ratio(float(snapshot.get("on_time_completed", 0)), total_orders),
        "recommendation_score": (
            0.25
            if recommendation_attempts <= 0 and task_name in {"medium", "hard"}
            else (
                0.5
                if recommendation_attempts <= 0
                else _ratio(float(snapshot.get("recommendation_correct", 0)), recommendation_attempts)
            )
        ),
        "wait_score": _clamp01(
            1.0
            - float(snapshot.get("mean_completed_wait") or snapshot.get("avg_wait_time", 0.0))
            / WAIT_TARGETS[task_name]
        ),
        "fairness_score": _clamp01(float(snapshot.get("fairness_score", 0.0))),
        "efficiency_score": _clamp01(float(snapshot.get("efficiency_score", 0.0))),
        "vip_service_score": _ratio(
            float(snapshot.get("vip_on_time", 0)),
            float(max(1, int(snapshot.get("vip_total", 0)))),
            default=1.0,
        ),
        "starvation_rate": _ratio(float(snapshot.get("starved_orders", 0)), total_orders),
        "rejection_rate": _ratio(float(snapshot.get("rejected", 0)), total_orders),
        "overload_rate": _ratio(
            float(snapshot.get("overloaded_ticks", 0)),
            float(max(1, int(snapshot.get("step", 0)))),
        ),
    }


def grade_easy(snapshot: dict[str, Any]) -> float:
    metrics = _metrics(snapshot, "easy")
    return _clamp01(
        0.32 * metrics["completion_rate"]
        + 0.26 * metrics["on_time_rate"]
        + 0.20 * metrics["fairness_score"]
        + 0.14 * metrics["wait_score"]
        + 0.10 * metrics["efficiency_score"]
        - 0.10 * metrics["starvation_rate"]
        - 0.06 * metrics["rejection_rate"]
    )


def grade_medium(snapshot: dict[str, Any]) -> float:
    metrics = _metrics(snapshot, "medium")
    return _clamp01(
        0.26 * metrics["completion_rate"]
        + 0.20 * metrics["on_time_rate"]
        + 0.18 * metrics["fairness_score"]
        + 0.14 * metrics["recommendation_score"]
        + 0.12 * metrics["wait_score"]
        + 0.10 * metrics["efficiency_score"]
        - 0.10 * metrics["starvation_rate"]
        - 0.05 * metrics["rejection_rate"]
        - 0.03 * metrics["overload_rate"]
    )


def grade_hard(snapshot: dict[str, Any]) -> float:
    metrics = _metrics(snapshot, "hard")
    return _clamp01(
        0.24 * metrics["completion_rate"]
        + 0.18 * metrics["on_time_rate"]
        + 0.16 * metrics["fairness_score"]
        + 0.10 * metrics["recommendation_score"]
        + 0.12 * metrics["vip_service_score"]
        + 0.10 * metrics["efficiency_score"]
        + 0.10 * metrics["wait_score"]
        - 0.10 * metrics["starvation_rate"]
        - 0.06 * metrics["rejection_rate"]
        - 0.06 * metrics["overload_rate"]
    )
