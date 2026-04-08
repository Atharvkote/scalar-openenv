"""Global configuration for the Food Dash OpenEnv simulation."""

# Episode and reproducibility
MAX_STEPS: int = 200
SEED: int = 42

# Reward shaping
REWARD_WEIGHTS: dict[str, float] = {
    "service_speed": 0.34,
    "fairness": 0.22,
    "recommendation_accuracy": 0.16,
    "kitchen_efficiency": 0.18,
    "overload_penalty": 0.22,
    "starvation_penalty": 0.24,
    "rejection_penalty": 0.12,
    "vip_deadline_bonus": 0.08,
}

# Reward and grading thresholds
FAST_WAIT_RATIO: float = 0.85  # completion faster than this vs initial estimate → "fast"
HIGH_WAIT_THRESHOLD: float = 25.0  # average wait above this triggers penalty scaling
WAIT_NORM: float = 40.0  # for normalizing wait penalty

WAIT_TARGETS: dict[str, float] = {
    "easy": 18.0,
    "medium": 24.0,
    "hard": 32.0,
}
TARGET_KITCHEN_LOAD: float = 0.78
FAIRNESS_WAIT_GAP_TOLERANCE: float = 2.0
PATIENCE_GRACE_TICKS: int = 2

# Simulation dynamics
FOCUS_PROGRESS_BONUS: float = 0.35
SPLIT_PROGRESS_BONUS: float = 0.18
OVERLOAD_PROGRESS_PENALTY: float = 0.18
MIN_PROGRESS_PER_TICK: float = 0.45
