"""Gymnasium-style environment wrapping ``RestaurantSimulator``."""

from __future__ import annotations

import logging
import os
from typing import Any, Optional

from openenv.config import MAX_STEPS, REWARD_WEIGHTS, TARGET_KITCHEN_LOAD
from openenv.models import Action, Observation, Reward
from openenv.node_bridge import NodeBridge
from openenv.simulator import RestaurantSimulator

logger = logging.getLogger(__name__)


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


class FoodDashEnv:
    """
    ``reset`` / ``step`` / ``state`` API with scalar rewards and done flag.

    Rewards are continuous and expose a structured breakdown in ``info``.

    Parameters
    ----------
    task_config : dict, optional
        Task configuration (seed, n_orders, etc.).
    node_api_url : str or None, optional
        Base URL of the Node.js FoodDash backend (e.g. ``http://localhost:5000``).
        When set the environment will attempt to fetch real order data at reset
        time and push status updates during steps.  Falls back silently to the
        built-in simulator when the backend is unavailable.
    """

    def __init__(
        self,
        task_config: Optional[dict[str, Any]] = None,
        node_api_url: Optional[str] = None,
    ) -> None:
        self._config: dict[str, Any] = task_config or {}
        self._sim = RestaurantSimulator()
        self._step: int = 0
        self._episode_rewards: list[float] = []
        self._last_obs: Observation = self._blank_obs()

        # Node.js bridge ------------------------------------------------
        url = node_api_url or os.getenv("NODE_API_URL")
        self._bridge: Optional[NodeBridge] = NodeBridge(url) if url else None
        self._node_orders: list[dict[str, Any]] = []
        self._node_connected: bool = False

    def _blank_obs(self) -> Observation:
        return Observation(
            pending_orders=[],
            active_orders=[],
            kitchen_load=0.0,
            avg_wait_time=0.0,
            kitchen_capacity_remaining=0,
            current_capacity=0,
            time=0,
            last_action_result="",
        )

    # ------------------------------------------------------------------
    # Node.js integration helpers
    # ------------------------------------------------------------------

    def _try_fetch_node_orders(self) -> list[dict[str, Any]]:
        """
        Attempt to pull orders from the Node backend.

        Returns a (possibly empty) list.  On failure the list is empty and the
        simulator's deterministic data is used instead.  This is the **fallback
        mode** required by Task 3.
        """
        if self._bridge is None:
            return []
        try:
            orders = self._bridge.fetch_orders()
            if orders:
                self._node_connected = True
                logger.info(
                    "Node bridge connected — fetched %d real orders", len(orders)
                )
            return orders
        except Exception as exc:
            logger.warning("Node bridge fetch failed, using simulator data: %s", exc)
            self._node_connected = False
            return []

    def _push_status_to_node(self, order_id: Any, status: str) -> None:
        """Fire-and-forget status update to Node.js (non-blocking)."""
        if self._bridge is None or not self._node_connected:
            return
        try:
            self._bridge.update_order_status(str(order_id), status)
        except Exception:
            pass  # intentionally silent

    # ------------------------------------------------------------------
    # Core API
    # ------------------------------------------------------------------

    def reset(self, task_config: Optional[dict[str, Any]] = None) -> Observation:
        if task_config is not None:
            self._config = task_config
        self._step = 0
        self._episode_rewards = []

        # Attempt to fetch real orders from Node.js (fallback: empty)
        self._node_orders = self._try_fetch_node_orders()

        self._sim.reset(self._config)
        self._last_obs = self._build_observation()
        return self._last_obs

    def _build_observation(self) -> Observation:
        state = self._sim.get_state()
        pending = [order for order in state.orders if order["status"] == "pending"]
        active = [order for order in state.orders if order["status"] == "active"]
        return Observation(
            pending_orders=pending,
            active_orders=active,
            kitchen_load=state.kitchen_load,
            avg_wait_time=state.avg_wait_time,
            kitchen_capacity_remaining=state.kitchen_capacity_remaining,
            current_capacity=state.current_capacity,
            time=state.time,
            last_action_result=self._sim.last_action_result,
        )

    def _compute_step_reward(self, action: Action, events: dict[str, Any]) -> Reward:
        """Compose a multi-factor continuous reward for this transition."""
        weights = REWARD_WEIGHTS
        state = self._sim.get_state()
        feedback = events.get("action_feedback", {})

        completed_events = list(events.get("completed", []))
        on_time_count = sum(1 for event in completed_events if event.get("on_time"))
        vip_on_time_count = sum(1 for event in completed_events if event.get("vip_on_time"))
        completed_count = len(completed_events)
        service_speed_score = _clamp01(
            (completed_count / float(max(1, state.current_capacity))) * 0.75
            + (on_time_count / float(max(1, completed_count))) * 0.25
            if completed_count
            else 0.0
        )
        fairness_score = float(state.fairness_score)
        efficiency_score = _clamp01(
            0.6 * (1.0 - abs(state.kitchen_load - TARGET_KITCHEN_LOAD) / TARGET_KITCHEN_LOAD)
            + 0.4 * state.efficiency_score
        )
        recommendation_component = 0.0
        if feedback.get("recommendation_correct") is True:
            recommendation_component = 1.0
        elif feedback.get("recommendation_correct") is False:
            recommendation_component = -0.4

        overload_penalty = float(events.get("overload_ratio", 0.0))
        starvation_penalty = min(
            1.0,
            (len(events.get("timed_out", [])) + len(events.get("auto_rejected", [])))
            / float(max(1, state.total_orders)),
        )
        rejection_penalty = min(
            1.0,
            (len(events.get("auto_rejected", [])) + (1 if feedback.get("manual_reject") else 0))
            / float(max(1, state.total_orders)),
        )
        invalid_penalty = 0.08 if feedback.get("invalid_action") else 0.0
        vip_deadline_bonus = min(1.0, vip_on_time_count / float(max(1, completed_count))) if completed_count else 0.0

        components = {
            "service_speed_score": round(service_speed_score, 4),
            "fairness_score": round(fairness_score, 4),
            "recommendation_accuracy": round(recommendation_component, 4),
            "kitchen_efficiency": round(efficiency_score, 4),
            "overload_penalty": round(overload_penalty, 4),
            "starvation_penalty": round(starvation_penalty, 4),
            "rejection_penalty": round(rejection_penalty, 4),
            "invalid_action_penalty": round(invalid_penalty, 4),
            "vip_deadline_bonus": round(vip_deadline_bonus, 4),
        }

        total = (
            weights["service_speed"] * service_speed_score
            + weights["fairness"] * (fairness_score - 0.5)
            + weights["recommendation_accuracy"] * recommendation_component
            + weights["kitchen_efficiency"] * (efficiency_score - 0.35)
            + weights["vip_deadline_bonus"] * vip_deadline_bonus
            - weights["overload_penalty"] * overload_penalty
            - weights["starvation_penalty"] * starvation_penalty
            - weights["rejection_penalty"] * rejection_penalty
            - invalid_penalty
        )
        reason = ",".join(f"{name}={value:.3f}" for name, value in components.items())
        return Reward(value=float(total), reason=reason, components=components)

    def step(self, action: Action | dict[str, Any]) -> tuple[Observation, float, bool, dict[str, Any]]:
        self._step += 1
        parsed_action = Action.model_validate(action)
        self._sim.apply_action(parsed_action)
        events = self._sim.step_time()
        reward = self._compute_step_reward(parsed_action, events)
        self._episode_rewards.append(reward.value)

        # Push completed-order statuses to Node.js (fire-and-forget)
        for completed in events.get("completed", []):
            self._push_status_to_node(completed["id"], "Delivered")

        observation = self._build_observation()
        self._last_obs = observation
        done = self._step >= int(self._config.get("max_steps", MAX_STEPS)) or self._sim.all_completed()

        info: dict[str, Any] = {
            "reward_detail": reward.model_dump(),
            "step": self._step,
            "time": self._sim.get_state().time,
            "events": events,
            "completion_events": events.get("completed", []),
            "node_connected": self._node_connected,
            "node_orders_count": len(self._node_orders),
        }
        return observation, reward.value, done, info

    def heuristic_menu_suggestion(
        self,
        anchor_order_id: Optional[int] = None,
        user_id: Optional[int] = None,
    ) -> int:
        """Public hook for inference and baseline agents."""
        return self._sim.heuristic_recommendation(anchor_order_id=anchor_order_id, user_id=user_id)

    def state(self) -> dict[str, Any]:
        """Full episode-visible state for grading and debugging."""
        state = self._sim.get_state()
        rec_acc = (
            state.recommendation_correct / state.recommendation_attempts
            if state.recommendation_attempts
            else 0.0
        )
        return {
            "step": self._step,
            "max_steps": int(self._config.get("max_steps", MAX_STEPS)),
            "avg_wait_time": state.avg_wait_time,
            "mean_completed_wait": state.mean_completed_wait,
            "kitchen_load": float(state.kitchen_load),
            "mean_kitchen_load": float(state.mean_kitchen_load),
            "kitchen_capacity_remaining": state.kitchen_capacity_remaining,
            "current_capacity": state.current_capacity,
            "completed": state.completed,
            "rejected": state.rejected,
            "on_time_completed": state.on_time_completed,
            "starved_orders": state.starved_orders,
            "total_orders": state.total_orders,
            "recommendation_attempts": state.recommendation_attempts,
            "recommendation_correct": state.recommendation_correct,
            "recommendation_accuracy": rec_acc,
            "fairness_score": state.fairness_score,
            "efficiency_score": state.efficiency_score,
            "vip_total": state.vip_total,
            "vip_completed": state.vip_completed,
            "vip_on_time": state.vip_on_time,
            "low_priority_total": state.low_priority_total,
            "low_priority_completed": state.low_priority_completed,
            "low_priority_on_time": state.low_priority_on_time,
            "priority_wait_gap": state.priority_wait_gap,
            "overloaded_ticks": state.overloaded_ticks,
            "overload_events": state.overload_events,
            "episode_reward_sum": sum(self._episode_rewards),
            "episode_rewards": list(self._episode_rewards),
            "config": dict(self._config),
            "node_connected": self._node_connected,
            "node_orders_fetched": len(self._node_orders),
        }


def state_snapshot_for_grading(env: FoodDashEnv) -> dict[str, Any]:
    """Flatten ``env.state()`` for the ``graders`` module."""
    return env.state()
