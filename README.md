---
title: Food Dash Env
emoji: 🍽️
colorFrom: red
colorTo: pink
sdk: docker
sdk_version: "27.5.1"
app_file: app.py
app_port: 8000
pinned: false
---

# OPEN ENV - Resturant Dispatch RL ENV
## Overview

**resturant-dispatch-env** is a deterministic reinforcement learning environment designed to simulate restaurant operations under peak-hour conditions. The agent is responsible for dispatching incoming orders while balancing service quality, urgency, and kitchen capacity.

This environment is suitable for policy evaluation, benchmarking, and studying decision-making under constrained, multi-objective scenarios.


## Motivation

Restaurant dispatch is a constrained optimization problem:

* Delays increase the likelihood of customer churn
* Over-prioritizing urgent orders can leave high-value orders unfinished
* Excessive workload reduces kitchen efficiency

This environment captures these competing objectives in a reproducible and controlled setting.


## Environment Design

### State Representation

Each order contains:

```json
{
  "id": 1,
  "status": "pending | processing | done | failed",
  "prep_time": 3,
  "priority": "low | medium | high",
  "wait_time": 0,
  "patience": 5,
  "is_vip": false
}
```

Global state includes:

* `step_count`, `max_steps`
* `max_kitchen_capacity`
* `total_completed`, `total_failed`
* `overload_penalty_counter`
* deterministic rush-hour configuration flags


### Action Space

```json
{
  "action_type": "process | prioritize | idle",
  "order_id": 7
}
```

* `process`: Start a pending order if capacity allows
* `prioritize`: Accelerate or rescue a specific order
* `idle`: Take no action for the current step


### Environment Dynamics

At each step:

1. Rush orders may be injected deterministically (hard mode)
2. Agent action is applied
3. Pending orders increase `wait_time`
4. Orders exceeding patience (`wait_time > patience`) become `failed`
5. Processing orders reduce `prep_time`; completed when `prep_time <= 0`
6. Exceeding capacity incurs overload penalties


## Decision-Making Challenges

The agent must balance:

* **Urgency**: Orders close to expiration require immediate attention
* **Priority value**: High-priority and VIP orders yield higher rewards
* **Capacity control**: Overloading reduces long-term performance

A missed-opportunity penalty is applied when urgent orders exist but are ignored.


## Reward Function

Each step starts with a reward of `0`, then applies:

* `+1.0` for order completion
* `+0.5` for high-priority completion
* `+0.3` for VIP completion
* `+0.4` for saving an urgent order
* `+0.2` for a valid processing action
* `-1.0` for failed order
* `-0.5` for overload event
* `-0.3` for ignoring urgent orders
* `-0.2` for invalid action
* `-0.02` step penalty

Final reward is clamped to the range `[-1.0, 1.0]`.


## Task Configurations

### Easy

* 4 orders
* Kitchen capacity: 2
* Moderate patience

### Medium

* 10 orders
* Mixed priorities and VIP distribution
* Tighter patience constraints

### Hard

* 20 base orders
* Kitchen capacity: 2
* Low patience range (2–5)
* High density of priority and VIP orders
* Deterministic rush injection at step 5
* High failure risk under poor policies


## Example Episode

* Step 1: Process a high-value order → positive reward
* Step 2: Urgent queue appears; incorrect action → penalty
* Step 3: Order exceeds patience → strong negative reward
* Step 4: Rescue + completion → positive reward

Example reward trajectory:

```
0.20 → -0.30 → 0.50 → -1.00
```


## Evaluation Method

Final score is computed as:

```
score = (completed / total) 
      - (failed / total) * 0.7 
      - (overload_penalty_counter * 0.05)
```

Score is clamped to the range `[0, 1]`.


## API Usage

### Endpoints

* `POST /reset`

  ```json
  { "task": "easy | medium | hard" }
  ```

* `POST /step`

  ```json
  { "action_type": "process | prioritize | idle", "order_id": 1 }
  ```

* `GET /state`

* `GET /health`


### Example Requests

```bash
curl -X POST http://localhost:8000/reset \
-H "Content-Type: application/json" \
-d '{"task":"hard"}'

curl -X POST http://localhost:8000/step \
-H "Content-Type: application/json" \
-d '{"action_type":"process","order_id":1}'

curl -X POST http://localhost:8000/step \
-H "Content-Type: application/json" \
-d '{"action_type":"prioritize","order_id":2}'
```


## Key Properties

* Deterministic and reproducible environment
* Multi-objective reward design with both incentives and penalties
* Realistic trade-offs between urgency, value, and capacity
* Hard mode introduces dynamic demand spikes and strict constraints


## Use Cases

* Reinforcement learning experimentation
* Policy benchmarking and comparison
* Simulation of constrained decision systems
* Academic and research-oriented environments

