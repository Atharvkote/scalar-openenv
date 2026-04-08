"""
Pure-Python deterministic restaurant simulator.

The simulator models a small restaurant operation with staggered arrivals,
priority customers, finite kitchen capacity, recommendation decisions,
and fairness trade-offs between VIP and low-priority customers.
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass
from typing import Any, Optional

from openenv.config import (
    FAIRNESS_WAIT_GAP_TOLERANCE,
    FOCUS_PROGRESS_BONUS,
    MIN_PROGRESS_PER_TICK,
    OVERLOAD_PROGRESS_PENALTY,
    PATIENCE_GRACE_TICKS,
    SPLIT_PROGRESS_BONUS,
    TARGET_KITCHEN_LOAD,
)
from openenv.models import Action

PRIORITY_RANK: dict[str, int] = {
    "low": 1,
    "normal": 2,
    "vip": 3,
}


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


@dataclass
class SimOrder:
    id: int
    table_id: int
    user_id: int
    menu_item_id: int
    category_id: int
    priority: str
    prep_complexity: int
    prep_total: int
    prep_remaining: float
    patience_limit: int
    arrival_tick: int
    vip_deadline: Optional[int]
    wait_time: float = 0.0
    status: str = "scheduled"  # scheduled | pending | active | completed | rejected
    queue_position: int = 0
    started_at: Optional[int] = None
    completed_at: Optional[int] = None
    late: bool = False
    timed_out: bool = False
    rejected_reason: Optional[str] = None
    focus_bonus_ticks: int = 0
    split_bonus_ticks: int = 0


@dataclass
class SimulatorState:
    """Snapshot for grading and observations."""

    orders: list[dict[str, Any]]
    kitchen_load: float
    mean_kitchen_load: float
    avg_wait_time: float
    time: int
    completed: int
    rejected: int
    total_orders: int
    on_time_completed: int
    starved_orders: int
    recommendation_attempts: int
    recommendation_correct: int
    mean_completed_wait: float
    kitchen_capacity_remaining: int
    current_capacity: int
    overloaded_ticks: int
    overload_events: int
    fairness_score: float
    efficiency_score: float
    vip_total: int
    vip_completed: int
    vip_on_time: int
    low_priority_total: int
    low_priority_completed: int
    low_priority_on_time: int
    priority_wait_gap: float
    last_recommendation: Optional[tuple[int, int]] = None  # (user_id, item_id)


class RestaurantSimulator:
    """
    Discrete-time kitchen simulation.

    * Pending queue is ordered; front is pulled into active slots first.
    * Kitchen has ``kitchen_slots`` parallel prep pipelines.
    * ``kitchen_load`` is average utilization of active stations in [0, 1].
    """

    MENU_ITEMS: int = 50
    CATEGORIES: int = 8

    def __init__(self) -> None:
        self._rng: random.Random = random.Random(0)
        self._seed: int = 0
        self._orders: dict[int, SimOrder] = {}
        self._pending_ids: list[int] = []
        self._time: int = 0
        self._base_capacity: int = 3
        self._capacity_schedule: dict[int, int] = {}
        self._last_action_message: str = "init"
        self._last_action_feedback: dict[str, Any] = {}
        self._recommend_attempts: int = 0
        self._recommend_correct: int = 0
        self._last_recommendation: Optional[tuple[int, int]] = None
        self._completed_wait_sum: float = 0.0
        self._n_completed: int = 0
        self._ground_truth_item: dict[int, int] = {}
        self._affinity: list[list[float]] = []
        self._overloaded_ticks: int = 0
        self._overload_events: int = 0
        self._was_overloaded_last_tick: bool = False
        self._load_sum: float = 0.0
        self._tick_count: int = 0

    def _effective_capacity(self) -> int:
        return max(1, int(self._capacity_schedule.get(self._time, self._base_capacity)))

    def _release_arrivals(self) -> list[int]:
        released: list[int] = []
        for order in self._orders.values():
            if order.status == "scheduled" and order.arrival_tick <= self._time:
                order.status = "pending"
                released.append(order.id)
        released.sort()
        self._pending_ids.extend(released)
        self._refresh_queue_positions()
        return released

    def _refresh_queue_positions(self) -> None:
        for order in self._orders.values():
            order.queue_position = 0
        for index, order_id in enumerate(self._pending_ids, start=1):
            self._orders[order_id].queue_position = index

    def _build_affinity_matrix(self) -> None:
        """Deterministic lift-like matrix used for recommendation scoring."""
        self._affinity = []
        for i in range(self.CATEGORIES):
            row = []
            for j in range(self.CATEGORIES):
                value = 0.22 + 0.11 * math.sin((i * 7 + j * 11 + self._seed) % 19)
                row.append(min(1.0, max(0.0, value)))
            self._affinity.append(row)

    def ground_truth_menu_item(self, user_id: int) -> int:
        return self._ground_truth_item[user_id]

    def heuristic_recommendation(
        self,
        anchor_order_id: Optional[int] = None,
        user_id: Optional[int] = None,
    ) -> int:
        """Deterministic recommendation heuristic."""
        anchor_cat: Optional[int] = None
        if anchor_order_id is not None and anchor_order_id in self._orders:
            anchor_cat = self._orders[anchor_order_id].category_id
        elif user_id is not None:
            for order in self._orders.values():
                if order.user_id == user_id:
                    anchor_cat = order.category_id
                    break
        if anchor_cat is None:
            anchor_cat = (self._seed + (user_id or 0)) % self.CATEGORIES
        best_j = 1
        best_score = -1.0
        for j in range(1, self.MENU_ITEMS + 1):
            cat_j = (j - 1) % self.CATEGORIES
            score = self._affinity[anchor_cat][cat_j]
            if score > best_score:
                best_score = score
                best_j = j
        return best_j

    def reset(self, config: dict[str, Any]) -> SimulatorState:
        """Initialize episode from task config."""
        self._seed = int(config.get("seed", 42))
        self._rng = random.Random(self._seed)
        self._base_capacity = max(1, int(config.get("kitchen_capacity", 3)))
        self._capacity_schedule = {
            int(key): max(1, int(value))
            for key, value in dict(config.get("capacity_schedule", {})).items()
        }
        n_orders = int(config["n_orders"])
        n_tables = int(config.get("n_tables", 1))
        priority_weights = dict(config.get("priority_weights", {"vip": 1, "normal": 4, "low": 1}))
        complexity_weights = list(config.get("complexity_weights", [0.35, 0.45, 0.20]))
        patience_range = tuple(config.get("patience_range", [8, 14]))
        arrival_window = int(config.get("arrival_window", 0))
        initial_visible_orders = int(
            config.get("initial_visible_orders", min(n_orders, self._base_capacity + 1))
        )

        self._build_affinity_matrix()
        self._orders = {}
        self._pending_ids = []
        self._time = 0
        self._recommend_attempts = 0
        self._recommend_correct = 0
        self._last_recommendation = None
        self._completed_wait_sum = 0.0
        self._n_completed = 0
        self._last_action_message = "reset"
        self._last_action_feedback = {}
        self._overloaded_ticks = 0
        self._overload_events = 0
        self._was_overloaded_last_tick = False
        self._load_sum = 0.0
        self._tick_count = 0
        self._ground_truth_item = {}

        priority_names = ["vip", "normal", "low"]
        priority_probs = [priority_weights.get(name, 0) for name in priority_names]

        for i in range(n_orders):
            oid = i + 1
            table_id = (i % n_tables) + 1 if n_tables > 0 else 1
            user_id = 1000 + oid
            menu_item_id = self._rng.randint(1, self.MENU_ITEMS)
            category_id = (menu_item_id - 1) % self.CATEGORIES
            priority = self._rng.choices(priority_names, weights=priority_probs, k=1)[0]
            prep_complexity = self._rng.choices([1, 2, 3], weights=complexity_weights, k=1)[0]
            prep = self._rng.randint(2, 4) + prep_complexity * 2
            if priority == "vip":
                prep += 1
            patience_limit = self._rng.randint(int(patience_range[0]), int(patience_range[1]))
            if priority == "vip":
                patience_limit = max(5, patience_limit - 2)
            elif priority == "low":
                patience_limit += 2
            patience_limit = max(5, patience_limit - max(0, prep_complexity - 1))
            arrival_tick = 0 if i < initial_visible_orders else self._rng.randint(1, arrival_window)
            vip_deadline = arrival_tick + max(4, patience_limit - 1) if priority == "vip" else None
            order = SimOrder(
                id=oid,
                table_id=table_id,
                user_id=user_id,
                menu_item_id=menu_item_id,
                category_id=category_id,
                priority=priority,
                prep_complexity=prep_complexity,
                prep_total=prep,
                prep_remaining=float(prep),
                patience_limit=patience_limit,
                arrival_tick=arrival_tick,
                vip_deadline=vip_deadline,
            )
            self._orders[oid] = order
            gt = (
                (self._seed * 92837111) ^ (user_id * 131542391) ^ (category_id * 104729)
            ) % self.MENU_ITEMS + 1
            self._ground_truth_item[user_id] = int(gt)

        self._release_arrivals()
        self._record_load_snapshot()
        return self.get_state()

    def _active_orders(self) -> list[SimOrder]:
        return [o for o in self._orders.values() if o.status == "active"]

    def _compute_kitchen_load(self, current_capacity: Optional[int] = None) -> float:
        capacity = current_capacity or self._effective_capacity()
        actives = self._active_orders()
        if not actives or capacity <= 0:
            return 0.0
        weighted_load = []
        for o in actives:
            denom = max(o.prep_total, 1.0)
            weighted_load.append(
                min(1.2, (0.45 + 0.18 * o.prep_complexity) * (o.prep_remaining / denom))
            )
        return _clamp01(sum(weighted_load) / float(capacity))

    def _avg_wait(self) -> float:
        live = [
            o
            for o in self._orders.values()
            if o.status not in {"completed", "rejected"} and o.arrival_tick <= self._time
        ]
        if not live:
            return 0.0
        return sum(o.wait_time for o in live) / len(live)

    def _mean_wait_for_priority(self, priority: str) -> float:
        visible = [
            o
            for o in self._orders.values()
            if o.priority == priority and o.arrival_tick <= self._time
        ]
        if not visible:
            return 0.0
        return sum(o.wait_time for o in visible) / len(visible)

    def _fairness_score(self) -> float:
        low_orders = [o for o in self._orders.values() if o.priority == "low"]
        low_total = len(low_orders)
        if low_total == 0:
            low_starvation = 0.0
            low_on_time = 1.0
        else:
            low_starvation = sum(1 for o in low_orders if o.timed_out) / float(low_total)
            completed_low = [o for o in low_orders if o.status == "completed"]
            low_on_time = (
                sum(1 for o in completed_low if not o.late) / float(max(1, len(completed_low)))
                if completed_low
                else 0.0
            )

        vip_orders = [o for o in self._orders.values() if o.priority == "vip"]
        vip_completed = [o for o in vip_orders if o.status == "completed"]
        vip_on_time = (
            sum(1 for o in vip_completed if not o.late) / float(max(1, len(vip_completed)))
            if vip_completed
            else 1.0
        )
        service_gap = max(0.0, vip_on_time - low_on_time - 0.35)
        wait_gap = max(
            0.0,
            self._mean_wait_for_priority("low")
            - self._mean_wait_for_priority("vip")
            - FAIRNESS_WAIT_GAP_TOLERANCE,
        )
        return _clamp01(1.0 - 0.55 * low_starvation - 0.25 * service_gap - 0.20 * _clamp01(wait_gap / 8.0))

    def _efficiency_score(self) -> float:
        if self._tick_count <= 0:
            return 0.0
        mean_load = self._load_sum / float(self._tick_count)
        load_score = _clamp01(1.0 - abs(mean_load - TARGET_KITCHEN_LOAD) / TARGET_KITCHEN_LOAD)
        overload_rate = self._overloaded_ticks / float(self._tick_count)
        return _clamp01(0.7 * load_score + 0.3 * (1.0 - overload_rate))

    def get_state(self) -> SimulatorState:
        current_capacity = self._effective_capacity()
        completed_orders = [o for o in self._orders.values() if o.status == "completed"]
        rejected_orders = [o for o in self._orders.values() if o.status == "rejected"]
        vip_orders = [o for o in self._orders.values() if o.priority == "vip"]
        low_orders = [o for o in self._orders.values() if o.priority == "low"]
        vip_completed = [o for o in vip_orders if o.status == "completed"]
        low_completed = [o for o in low_orders if o.status == "completed"]
        mean_done = (self._completed_wait_sum / self._n_completed) if self._n_completed else 0.0
        return SimulatorState(
            orders=[self._order_to_dict(o) for o in self._orders.values()],
            kitchen_load=self._compute_kitchen_load(current_capacity),
            mean_kitchen_load=(self._load_sum / float(self._tick_count)) if self._tick_count else 0.0,
            avg_wait_time=self._avg_wait(),
            time=self._time,
            completed=len(completed_orders),
            rejected=len(rejected_orders),
            total_orders=len(self._orders),
            on_time_completed=sum(1 for o in completed_orders if not o.late),
            starved_orders=sum(1 for o in self._orders.values() if o.timed_out),
            recommendation_attempts=self._recommend_attempts,
            recommendation_correct=self._recommend_correct,
            mean_completed_wait=mean_done,
            kitchen_capacity_remaining=max(0, current_capacity - len(self._active_orders())),
            current_capacity=current_capacity,
            overloaded_ticks=self._overloaded_ticks,
            overload_events=self._overload_events,
            fairness_score=self._fairness_score(),
            efficiency_score=self._efficiency_score(),
            vip_total=len(vip_orders),
            vip_completed=len(vip_completed),
            vip_on_time=sum(1 for o in vip_completed if not o.late),
            low_priority_total=len(low_orders),
            low_priority_completed=len(low_completed),
            low_priority_on_time=sum(1 for o in low_completed if not o.late),
            priority_wait_gap=max(
                0.0,
                self._mean_wait_for_priority("low")
                - self._mean_wait_for_priority("vip")
                - FAIRNESS_WAIT_GAP_TOLERANCE,
            ),
            last_recommendation=self._last_recommendation,
        )

    def _order_to_dict(self, o: SimOrder) -> dict[str, Any]:
        patience_remaining = max(0.0, float(o.patience_limit) - float(o.wait_time))
        return {
            "id": o.id,
            "table_id": o.table_id,
            "user_id": o.user_id,
            "status": o.status,
            "order_priority": o.priority,
            "prep_time": round(o.prep_remaining if o.status == "active" else float(o.prep_total), 2),
            "prep_complexity": o.prep_complexity,
            "customer_patience": float(o.patience_limit),
            "patience_remaining": round(patience_remaining, 2),
            "wait_time": round(o.wait_time, 2),
            "queue_position": o.queue_position,
            "arrival_time": o.arrival_tick,
            "vip_deadline": o.vip_deadline,
        }

    def apply_action(self, action: Action) -> None:
        """Mutate simulation state according to action."""
        at = action.action_type.lower().strip()
        self._last_action_feedback = {}

        if at in ("noop", "wait", "idle"):
            self._last_action_message = "noop"
            return

        if at in ("prioritize", "prioritize_order"):
            if action.order_id is None:
                self._last_action_message = "prioritize_missing_order_id"
                self._last_action_feedback["invalid_action"] = True
                return
            oid = int(action.order_id)
            order = self._orders.get(oid)
            if order is None or order.status not in {"pending", "active"}:
                self._last_action_message = f"prioritize_invalid_{oid}"
                self._last_action_feedback["invalid_action"] = True
                return
            if order.status == "pending":
                self._pending_ids.remove(oid)
                self._pending_ids.insert(0, oid)
                self._refresh_queue_positions()
            else:
                order.focus_bonus_ticks = max(order.focus_bonus_ticks, 2)
            self._last_action_message = f"prioritized_{oid}"
            self._last_action_feedback["prioritized_order"] = oid
            self._last_action_feedback["prioritized_priority"] = order.priority
            return

        if at == "delay_order":
            if action.order_id is None:
                self._last_action_message = "delay_missing_order_id"
                self._last_action_feedback["invalid_action"] = True
                return
            oid = int(action.order_id)
            if oid not in self._pending_ids:
                self._last_action_message = f"delay_invalid_{oid}"
                self._last_action_feedback["invalid_action"] = True
                return
            self._pending_ids.remove(oid)
            self._pending_ids.append(oid)
            self._refresh_queue_positions()
            self._last_action_message = f"delayed_{oid}"
            self._last_action_feedback["delayed_order"] = oid
            self._last_action_feedback["delayed_priority"] = self._orders[oid].priority
            return

        if at in ("recommend", "recommend_item", "submit_recommendation"):
            if action.user_id is None:
                self._last_action_message = "recommend_missing_user_id"
                self._last_action_feedback["invalid_action"] = True
                return
            uid = int(action.user_id)
            suggested_item = (
                int(action.order_id)
                if action.order_id is not None
                else self.heuristic_recommendation(user_id=uid)
            )
            self._recommend_attempts += 1
            self._last_recommendation = (uid, suggested_item)
            gt = self._ground_truth_item.get(uid, -1)
            if suggested_item == gt:
                self._recommend_correct += 1
                self._last_action_message = f"recommend_correct_{uid}"
                self._last_action_feedback["recommendation_correct"] = True
            else:
                self._last_action_message = f"recommend_wrong_{uid}"
                self._last_action_feedback["recommendation_correct"] = False
            self._last_action_feedback["recommendation_user"] = uid
            return

        if at == "split_kitchen_load":
            raw_ids = action.order_ids or ([int(action.order_id)] if action.order_id is not None else [])
            target_ids: list[int] = []
            seen: set[int] = set()
            for raw_id in raw_ids:
                oid = int(raw_id)
                if oid in seen:
                    continue
                seen.add(oid)
                order = self._orders.get(oid)
                if order is not None and order.status in {"pending", "active"}:
                    target_ids.append(oid)
            if not target_ids:
                self._last_action_message = "split_invalid"
                self._last_action_feedback["invalid_action"] = True
                return
            pending_targets = [oid for oid in target_ids if self._orders[oid].status == "pending"]
            if pending_targets:
                remaining = [oid for oid in self._pending_ids if oid not in pending_targets]
                pending_targets.sort(
                    key=lambda oid: (
                        self._orders[oid].prep_complexity,
                        -PRIORITY_RANK[self._orders[oid].priority],
                    )
                )
                self._pending_ids = pending_targets + remaining
            for oid in target_ids:
                self._orders[oid].split_bonus_ticks = max(self._orders[oid].split_bonus_ticks, 2)
            self._refresh_queue_positions()
            self._last_action_message = "split_load_" + "_".join(str(oid) for oid in target_ids)
            self._last_action_feedback["split_orders"] = target_ids
            return

        if at == "reject_order":
            if action.order_id is None:
                self._last_action_message = "reject_missing_order_id"
                self._last_action_feedback["invalid_action"] = True
                return
            oid = int(action.order_id)
            order = self._orders.get(oid)
            if order is None or order.status in {"completed", "rejected"}:
                self._last_action_message = f"reject_invalid_{oid}"
                self._last_action_feedback["invalid_action"] = True
                return
            if oid in self._pending_ids:
                self._pending_ids.remove(oid)
            order.status = "rejected"
            order.rejected_reason = "manual_reject"
            self._refresh_queue_positions()
            self._last_action_message = f"rejected_{oid}"
            self._last_action_feedback["rejected_order"] = oid
            self._last_action_feedback["manual_reject"] = True
            return

        self._last_action_message = f"unknown_action_{at}"
        self._last_action_feedback["invalid_action"] = True

    def _record_load_snapshot(self) -> None:
        current_capacity = self._effective_capacity()
        self._load_sum += self._compute_kitchen_load(current_capacity)
        self._tick_count += 1

    def step_time(self) -> dict[str, Any]:
        """
        Advance one tick: release arrivals, update waits, progress prep, and refill the kitchen.
        Returns event dict for reward shaping.
        """
        self._time += 1
        arrivals = self._release_arrivals()
        events: dict[str, Any] = {
            "arrivals": arrivals,
            "completed": [],
            "timed_out": [],
            "auto_rejected": [],
            "action_feedback": dict(self._last_action_feedback),
            "overload_ratio": 0.0,
        }

        for o in self._orders.values():
            if o.status in {"pending", "active"}:
                o.wait_time += 1.0
                if o.wait_time > float(o.patience_limit) and not o.timed_out:
                    o.timed_out = True
                    events["timed_out"].append(o.id)

        for o in list(self._orders.values()):
            if o.status == "pending" and o.wait_time > float(o.patience_limit + PATIENCE_GRACE_TICKS):
                o.status = "rejected"
                o.rejected_reason = "timeout_reject"
                o.timed_out = True
                if o.id in self._pending_ids:
                    self._pending_ids.remove(o.id)
                events["auto_rejected"].append(o.id)

        current_capacity = self._effective_capacity()
        active_orders = self._active_orders()
        overload_amount = max(0, len(active_orders) - current_capacity)
        overload_complexity = max(
            0.0,
            sum(o.prep_complexity for o in active_orders) - current_capacity * 1.7,
        )
        overload_ratio = min(1.0, overload_amount / float(max(1, current_capacity)) + overload_complexity / 8.0)
        events["overload_ratio"] = overload_ratio

        overloaded = overload_ratio > 0.0
        if overloaded:
            self._overloaded_ticks += 1
            if not self._was_overloaded_last_tick:
                self._overload_events += 1
        self._was_overloaded_last_tick = overloaded

        for o in self._orders.values():
            if o.status == "active":
                progress = 1.0
                if o.focus_bonus_ticks > 0:
                    progress += FOCUS_PROGRESS_BONUS
                    o.focus_bonus_ticks -= 1
                if o.split_bonus_ticks > 0:
                    progress += SPLIT_PROGRESS_BONUS
                    o.split_bonus_ticks -= 1
                progress -= OVERLOAD_PROGRESS_PENALTY * overload_ratio
                progress = max(MIN_PROGRESS_PER_TICK, progress)
                o.prep_remaining -= progress
                if o.prep_remaining <= 0:
                    o.prep_remaining = 0.0
                    o.status = "completed"
                    o.completed_at = self._time
                    o.late = o.wait_time > float(o.patience_limit)
                    self._completed_wait_sum += o.wait_time
                    self._n_completed += 1
                    events["completed"].append(
                        {
                            "id": o.id,
                            "priority": o.priority,
                            "wait": round(o.wait_time, 2),
                            "on_time": not o.late,
                            "vip_on_time": o.priority == "vip" and not o.late,
                        }
                    )

        active_count = len(self._active_orders())
        while active_count < current_capacity and self._pending_ids:
            next_id = self._pending_ids.pop(0)
            o = self._orders[next_id]
            o.status = "active"
            o.started_at = self._time
            o.prep_remaining = float(o.prep_total)
            active_count += 1

        self._refresh_queue_positions()
        self._record_load_snapshot()
        return events

    @property
    def last_action_result(self) -> str:
        return self._last_action_message

    def all_completed(self) -> bool:
        return all(o.status in {"completed", "rejected"} for o in self._orders.values())

    def pending_prioritize_snapshot(self) -> tuple[list[int], dict[int, float]]:
        """Longest-wait prioritization checks (public for env reward)."""
        ids = list(self._pending_ids)
        waits = {oid: self._orders[oid].wait_time for oid in ids}
        return ids, waits
