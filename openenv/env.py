"""
FoodDash OpenEnv — Deterministic Restaurant Management Environment.

Problem Domain
--------------
A kitchen during peak hours receives a stream of dine-in orders.
Each order has a priority level, a VIP flag, a preparation time (how many
ticks of "processing" it needs before completion), and a patience value
(how many ticks it will wait in "pending" before the customer leaves).

The agent controls a kitchen with limited capacity (max 2 simultaneous
cooking slots). Each tick the agent takes exactly one action:

  process(order_id)    → move a pending order into a cooking slot
  prioritize(order_id) → shave 1 tick off wait_time or prep_time
  idle                 → do nothing (wastes the tick)

The agent must balance:
  • Throughput  — get as many orders done as possible
  • Triage      — save urgent orders before patience runs out
  • Priority    — high-priority and VIP orders yield bonus reward
  • Capacity    — overloading the kitchen incurs a per-step penalty

State transitions (per step, in order)
---------------------------------------
1. Rush order injection (hard task only, at rush_injection_step).
2. Agent action is applied.
3. Every pending order accumulates +1 wait_time.
   If wait_time > patience → status = "failed".
4. Every processing order loses 1 prep_time.
   If prep_time <= 0 → status = "done".
5. Reward is computed and clipped to [-1.0, 1.0].
6. Termination is checked.

Episode Termination
--------------------
The episode ends when ANY of these conditions is true:
  • All orders are in a terminal state (done or failed).
  • All orders are done (perfect completion).
  • total_failed >= fail_limit.
  • step_count >= max_steps.

Reward Decomposition (per step)
---------------------------------
  -0.02  base time cost (encourages efficiency)
  +0.20  successfully starting to process a valid order
  +0.40  saving a critically urgent order (would have failed next tick)
  +1.00  order completes this step
  +0.50  bonus if completed order is high priority
  +0.30  bonus if completed order is VIP
  -1.00  per order that expires this step
  -0.30  ignoring any urgent order when one or more exist
  -0.20  invalid action (bad target, kitchen full, etc.)
  -0.50  kitchen over-capacity (processing > max_kitchen_capacity)

All rewards are clipped to [-1.0, 1.0] after summation.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from .models import Observation, StepResponse
from .tasks import TASKS


class FoodDashEnv:
    """Peak-hour restaurant management environment with competing objectives."""

    # ------------------------------------------------------------------
    # Construction
    # ------------------------------------------------------------------

    def __init__(self) -> None:
        self.orders: List[Dict[str, object]] = []
        self.current_task: str = "easy"
        self.step_count: int = 0
        self.max_steps: int = 20
        self.max_kitchen_capacity: int = 2
        self.total_completed: int = 0
        self.total_failed: int = 0
        self.overload_penalty_counter: int = 0
        self.fail_limit: int = 1
        self.rush_injection_step: int = 9999
        self.rush_order_count: int = 0
        self._rush_injected: bool = False

    # ------------------------------------------------------------------
    # OpenEnv API: reset / step / state / close
    # ------------------------------------------------------------------

    async def reset(self, task: str = "easy") -> Observation:
        """
        Reset the environment to a fresh episode for the specified task.

        Parameters
        ----------
        task : str
            One of "easy", "medium", "hard".

        Returns
        -------
        Observation
            Aggregated initial state (all orders pending, nothing in kitchen).
        """
        if task not in TASKS:
            raise ValueError(
                f"Unknown task '{task}'. Available tasks: {list(TASKS.keys())}"
            )

        config = TASKS[task]
        self.current_task = task
        self.step_count = 0
        self.max_steps = int(config["max_steps"])
        self.max_kitchen_capacity = int(config["max_kitchen_capacity"])
        self.total_completed = 0
        self.total_failed = 0
        self.overload_penalty_counter = 0
        self.fail_limit = int(config["fail_limit"])
        self.rush_injection_step = int(config.get("rush_injection_step", 9999))
        self.rush_order_count = int(config.get("rush_order_count", 0))
        self._rush_injected = False

        self.orders = []
        num_orders = int(config["num_orders"])

        for idx in range(num_orders):
            priority = self._assign_priority(task, idx)
            is_vip = (
                int(config["vip_every"]) > 0
                and (idx + 1) % int(config["vip_every"]) == 0
            )

            # Prep time: 2–5 ticks; high-priority orders take slightly longer to cook.
            prep_time = 2 + (idx % 4)
            if priority == "high":
                prep_time += 1

            patience = int(config["patience_base"]) + (idx % int(config["patience_spread"]))
            if is_vip:
                patience += 1  # VIPs get marginally more grace

            self.orders.append(
                {
                    "id": idx + 1,
                    "status": "pending",
                    "prep_time": prep_time,
                    "priority": priority,
                    "wait_time": 0,
                    "patience": patience,
                    "is_vip": is_vip,
                }
            )

        return self._build_observation()

    async def step(self, action: Dict[str, object]) -> StepResponse:
        """
        Advance the environment by one tick.

        Parameters
        ----------
        action : dict
            Must contain keys "action_type" (str) and optionally "order_id" (int).

        Returns
        -------
        StepResponse
            observation, reward, done, info dict.
        """
        self.step_count += 1
        reward: float = -0.02  # base time cost every tick
        info: Dict[str, object] = {"last_action_error": None}

        # --- 1. Possibly inject rush orders (hard task) ---
        self._inject_rush_orders_if_due()

        # Snapshot urgent orders BEFORE action so the agent is penalised
        # for ignoring them even if they expire this tick.
        urgent_ids = self._get_urgent_order_ids()

        # --- 2. Parse action ---
        action_type, order_id = self._parse_action(action)

        if action_type not in {"process", "prioritize", "idle"}:
            action_type = "idle"
            reward -= 0.2
            info["last_action_error"] = "invalid_action_type"

        # --- 3. Apply action ---
        saved_critical = False
        acted_on_urgent = False

        target = self._find_order(order_id)

        if action_type == "process":
            reward, info, saved_critical, acted_on_urgent = self._apply_process(
                target, urgent_ids, reward, info
            )

        elif action_type == "prioritize":
            reward, info, saved_critical, acted_on_urgent = self._apply_prioritize(
                target, urgent_ids, reward, info
            )

        # Check if the explicitly targeted order was urgent
        if isinstance(order_id, int) and order_id in urgent_ids:
            acted_on_urgent = True

        # Penalty for ignoring urgency
        if urgent_ids and not acted_on_urgent:
            reward -= 0.3

        # --- 4. Age pending orders (patience check) ---
        failed_this_step = self._age_pending_orders()

        # --- 5. Advance processing orders ---
        completed_this_step = self._advance_processing_orders()

        # --- 6. Compute completion / failure rewards ---
        for order in completed_this_step:
            reward += 1.0
            if order["priority"] == "high":
                reward += 0.5
            if bool(order["is_vip"]):
                reward += 0.3

        reward -= 1.0 * len(failed_this_step)

        # --- 7. Kitchen overload penalty ---
        processing_count = self._count_status("processing")
        if processing_count > self.max_kitchen_capacity:
            self.overload_penalty_counter += 1
            reward -= 0.5

        # --- 8. Save-critical bonus ---
        if saved_critical:
            reward += 0.4

        # --- 9. Update counters ---
        self.total_completed = self._count_status("done")
        self.total_failed = self._count_status("failed")

        # Clip reward
        reward = max(-1.0, min(1.0, reward))

        done = self.is_done()

        return StepResponse(
            observation=self._build_observation(),
            reward=float(reward),
            done=done,
            info={
                **info,
                "total_completed": self.total_completed,
                "total_failed": self.total_failed,
                "overload_penalty_counter": self.overload_penalty_counter,
                "rush_injected": self._rush_injected,
            },
        )

    def state(self) -> Dict[str, object]:
        """
        Full internal state — used for debugging, visualisation, and /state endpoint.
        NOT part of the agent's observation; reveals hidden order details.
        """
        return {
            "task": self.current_task,
            "step_count": self.step_count,
            "max_steps": self.max_steps,
            "max_kitchen_capacity": self.max_kitchen_capacity,
            "total_completed": self.total_completed,
            "total_failed": self.total_failed,
            "overload_penalty_counter": self.overload_penalty_counter,
            "fail_limit": self.fail_limit,
            "rush_injection_step": self.rush_injection_step,
            "rush_order_count": self.rush_order_count,
            "rush_injected": self._rush_injected,
            "orders": [order.copy() for order in self.orders],
        }

    async def close(self) -> None:
        """Release resources (no-op for in-process environments)."""
        return None

    # ------------------------------------------------------------------
    # Termination
    # ------------------------------------------------------------------

    def is_done(self) -> bool:
        """Return True if the episode has reached any terminal condition."""
        if not self.orders:
            return False

        terminal = {"done", "failed"}
        all_terminal = all(o["status"] in terminal for o in self.orders)
        all_completed = all(o["status"] == "done" for o in self.orders)
        too_many_failures = self.total_failed >= self.fail_limit
        time_up = self.step_count >= self.max_steps

        return all_terminal or all_completed or too_many_failures or time_up

    # ------------------------------------------------------------------
    # Internal helpers — action application
    # ------------------------------------------------------------------

    def _apply_process(
        self,
        target: Optional[Dict[str, object]],
        urgent_ids: set,
        reward: float,
        info: Dict[str, object],
    ):
        saved_critical = False
        acted_on_urgent = False

        if target is None or target["status"] != "pending":
            reward -= 0.2
            info["last_action_error"] = "invalid_process_target"
        elif self._count_status("processing") >= self.max_kitchen_capacity:
            reward -= 0.2
            info["last_action_error"] = "kitchen_at_capacity"
        else:
            if self._is_urgent(target):
                saved_critical = True
                acted_on_urgent = True
            target["status"] = "processing"
            reward += 0.2  # valid process bonus

        return reward, info, saved_critical, acted_on_urgent

    def _apply_prioritize(
        self,
        target: Optional[Dict[str, object]],
        urgent_ids: set,
        reward: float,
        info: Dict[str, object],
    ):
        saved_critical = False
        acted_on_urgent = False

        if target is None:
            reward -= 0.2
            info["last_action_error"] = "invalid_prioritize_target"

        elif target["status"] == "pending":
            if self._is_urgent(target):
                saved_critical = True
                acted_on_urgent = True
                # Emergency pull — force into kitchen even if at/over capacity.
                # This is the only way to exceed capacity legitimately and incurs
                # the overload penalty but saves the order.
                target["status"] = "processing"
                target["wait_time"] = max(0, int(target["wait_time"]) - 1)
            else:
                # Normal prioritize: reduce wait to lower expiry risk.
                target["wait_time"] = max(0, int(target["wait_time"]) - 1)

        elif target["status"] == "processing":
            # Speed up cooking.
            target["prep_time"] = max(0, int(target["prep_time"]) - 1)
            if int(target["id"]) in urgent_ids:
                acted_on_urgent = True

        else:
            reward -= 0.2
            info["last_action_error"] = "invalid_prioritize_status"

        return reward, info, saved_critical, acted_on_urgent

    # ------------------------------------------------------------------
    # Internal helpers — state transitions
    # ------------------------------------------------------------------

    def _age_pending_orders(self) -> List[Dict[str, object]]:
        """Increment wait_time for all pending orders; expire those past patience."""
        failed = []
        for order in self.orders:
            if order["status"] == "pending":
                order["wait_time"] = int(order["wait_time"]) + 1
                if int(order["wait_time"]) > int(order["patience"]):
                    order["status"] = "failed"
                    failed.append(order)
        return failed

    def _advance_processing_orders(self) -> List[Dict[str, object]]:
        """Decrement prep_time for all processing orders; complete those at 0."""
        completed = []
        for order in self.orders:
            if order["status"] == "processing":
                order["prep_time"] = int(order["prep_time"]) - 1
                if int(order["prep_time"]) <= 0:
                    order["prep_time"] = 0
                    order["status"] = "done"
                    completed.append(order)
        return completed

    def _inject_rush_orders_if_due(self) -> None:
        """Inject surprise rush orders on the configured step (hard task only)."""
        if self._rush_injected:
            return
        if self.step_count < self.rush_injection_step:
            return
        if self.rush_order_count <= 0:
            return

        next_id = len(self.orders) + 1
        for idx in range(self.rush_order_count):
            self.orders.append(
                {
                    "id": next_id + idx,
                    "status": "pending",
                    "prep_time": 2 + (idx % 2),    # 2 or 3 ticks to cook
                    "priority": "high",
                    "wait_time": 1,                  # already waiting — near expiry
                    "patience": 2 + (idx % 2),       # patience 2 or 3
                    "is_vip": True,
                }
            )
        self._rush_injected = True

    # ------------------------------------------------------------------
    # Internal helpers — observation / query
    # ------------------------------------------------------------------

    def _build_observation(self) -> Observation:
        pending_orders = [o for o in self.orders if o["status"] == "pending"]
        avg_wait = (
            sum(float(o["wait_time"]) for o in pending_orders) / len(pending_orders)
            if pending_orders
            else 0.0
        )
        return Observation(
            pending_orders=sum(1 for o in self.orders if o["status"] == "pending"),
            processing_orders=sum(1 for o in self.orders if o["status"] == "processing"),
            completed_orders=sum(1 for o in self.orders if o["status"] == "done"),
            failed_orders=sum(1 for o in self.orders if o["status"] == "failed"),
            avg_wait_time=round(avg_wait, 2),
            high_priority_pending=sum(
                1 for o in pending_orders if o["priority"] == "high" or bool(o["is_vip"])
            ),
            urgent_orders=sum(1 for o in pending_orders if self._is_urgent(o)),
        )

    def _get_urgent_order_ids(self) -> set:
        return {
            int(o["id"])
            for o in self.orders
            if o["status"] == "pending" and self._is_urgent(o)
        }

    def _is_urgent(self, order: Dict[str, object]) -> bool:
        """An order is urgent when it is 1 tick away from expiring."""
        if order["status"] != "pending":
            return False
        return int(order["wait_time"]) >= int(order["patience"]) - 1

    def _find_order(self, order_id: object) -> Optional[Dict[str, object]]:
        if not isinstance(order_id, int):
            return None
        for order in self.orders:
            if order["id"] == order_id:
                return order
        return None

    def _count_status(self, status: str) -> int:
        return sum(1 for o in self.orders if o["status"] == status)

    @staticmethod
    def _assign_priority(task: str, idx: int) -> str:
        """
        Deterministic priority assignment.
        Hard task is intentionally biased toward high-priority orders.
        """
        base = ("low", "medium", "high")[idx % 3]

        if task == "hard":
            # ~67 % of hard orders are high-priority
            if idx % 4 == 0 or idx % 2 == 0:
                return "high"
        elif task == "medium":
            if idx % 5 == 0:
                return "high"

        return base

    @staticmethod
    def _parse_action(action: object):
        """Safely extract action_type and order_id from a dict or Action model."""
        if isinstance(action, dict):
            action_type = str(action.get("action_type", "idle"))
            order_id = action.get("order_id")
        else:
            # Support passing a Pydantic Action model directly
            action_type = getattr(action, "action_type", "idle")
            order_id = getattr(action, "order_id", None)
        return action_type, order_id