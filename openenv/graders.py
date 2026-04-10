"""
Grader for FoodDash OpenEnv.

Scoring Philosophy
------------------
The grader produces a single scalar in (0.0, 1.0) that captures:

  1. Throughput   — fraction of orders successfully completed.
  2. Failure cost — fraction of orders that expired, weighted at 0.8
                    (failing is almost as bad as not completing).
  3. Overload tax — each tick the kitchen ran over-capacity deducts 0.08,
                    penalising agents that abuse the emergency-prioritize
                    mechanic to force orders into a full kitchen.

Formula
-------
    raw = (completed / total)
          - (failed / total) * 0.8
          - (overload_penalty_counter * 0.08)

    score = clip(raw, 0.0001, 0.9999)

Score Interpretation
--------------------
  1.00        Perfect — all orders completed, kitchen never overloaded.
  0.75–0.99   Excellent — very few failures or minor overload.
  0.50–0.74   Good — some losses but majority completed.
  0.25–0.49   Mediocre — significant failures or repeated overload.
  0.00–0.24   Poor — more than half the orders lost.

Note: The score is always non-negative; a run that fails catastrophically
simply scores 0.0 rather than going negative.
"""

from __future__ import annotations

from .env import FoodDashEnv

MIN_SCORE = 0.0001
MAX_SCORE = 0.9999


def grade(env: FoodDashEnv) -> float:
    """
    Compute the final episode score for a completed FoodDash episode.

    Parameters
    ----------
    env : FoodDashEnv
        The environment *after* the episode has finished.

    Returns
    -------
    float
        Score in (0.0, 1.0).
    """
    total = len(env.orders)
    if total == 0:
        return MIN_SCORE

    completed = sum(1 for o in env.orders if o["status"] == "done")
    failed = sum(1 for o in env.orders if o["status"] == "failed")

    raw_score = (
        (completed / total)
        - (failed / total) * 0.8
        - (env.overload_penalty_counter * 0.08)
    )

    return float(max(MIN_SCORE, min(MAX_SCORE, raw_score)))
