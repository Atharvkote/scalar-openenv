"""
Task definitions for FoodDash OpenEnv.

Each task models a different intensity of restaurant peak-hour service.
All numeric parameters are intentionally deterministic so that scores
are reproducible across runs without seeding.

Task Difficulty Design
----------------------
easy   — 4 orders, generous patience, no VIPs, 16 steps, fail_limit=2.
         Intended to be solvable by any reasonable heuristic. Baseline score: ~1.0.

medium — 10 orders including VIPs (every 3rd), tighter patience, 22 steps, fail_limit=5.
         Requires balancing VIP priority against avoiding queue starvation.
         Baseline score target: 0.65–0.85.

hard   — 20 orders, most are high-priority, patience as low as 2 steps,
         kitchen capacity still only 2, AND a surprise rush injection at step 5
         that adds 2 VIP orders already partially expired.
         Fail limit is generous (12) but the sheer volume defeats naive agents.
         Baseline score target: 0.35–0.55.

Field Reference
---------------
num_orders          : Orders spawned at reset().
max_steps           : Episode length hard cap.
max_kitchen_capacity: Simultaneous orders that can be in "processing" state.
patience_base       : Minimum patience ticks assigned to any order.
patience_spread     : Patience is patience_base + (idx % patience_spread).
vip_every           : Every N-th order (1-indexed) is VIP. 0 = no VIPs.
fail_limit          : Episode ends early when this many orders have failed.
rush_injection_step : Step at which surprise rush orders are injected. 9999 = never.
rush_order_count    : How many rush orders to inject.
"""

from __future__ import annotations

from typing import Any, Dict

TASKS: Dict[str, Dict[str, Any]] = {
    # ------------------------------------------------------------------
    # EASY — Lunchtime lull: small queue, no VIPs, plenty of time.
    # ------------------------------------------------------------------
    "easy": {
        "num_orders": 4,
        "max_steps": 16,
        "max_kitchen_capacity": 2,
        "patience_base": 5,
        "patience_spread": 2,      # patience in {5, 6}
        "vip_every": 0,            # no VIP orders
        "fail_limit": 2,
    },

    # ------------------------------------------------------------------
    # MEDIUM — Dinner rush: larger queue, VIP guests, less patience.
    # ------------------------------------------------------------------
    "medium": {
        "num_orders": 10,
        "max_steps": 22,
        "max_kitchen_capacity": 2,
        "patience_base": 4,
        "patience_spread": 3,      # patience in {4, 5, 6}
        "vip_every": 3,            # every 3rd order is VIP
        "fail_limit": 5,
    },

    # ------------------------------------------------------------------
    # HARD — Saturday peak: dense high-priority queue + mid-game rush.
    # The rush arrives at step 5 with wait_time=1 already set — agent
    # must react within the same step or lose those VIP orders.
    # ------------------------------------------------------------------
    "hard": {
        "num_orders": 20,
        "max_steps": 15,           # tight — only 15 steps for 20+ orders
        "max_kitchen_capacity": 2,
        "patience_base": 2,        # orders expire fast
        "patience_spread": 4,      # patience in {2, 3, 4, 5}
        "vip_every": 2,            # every 2nd order is VIP
        "fail_limit": 12,
        "rush_injection_step": 5,  # surprise at step 5
        "rush_order_count": 2,     # 2 nearly-expired high-priority VIP orders
    },
}