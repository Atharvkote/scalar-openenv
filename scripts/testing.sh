cd /home/claude/food-dash-env && python -c "
import asyncio
import sys
sys.path.insert(0, '.')

# Simulate what /test does
from openenv.env import FoodDashEnv
from openenv.grader import grade
from openenv.api import _heuristic_action
import time

async def run_test():
    t0 = time.perf_counter()
    results = []
    for task_name in ['easy', 'medium', 'hard']:
        task_env = FoodDashEnv()
        await task_env.reset(task=task_name)
        rewards = []
        steps = 0
        for _ in range(task_env.max_steps):
            if task_env.is_done():
                break
            action = _heuristic_action(task_env)
            result = await task_env.step(action)
            rewards.append(float(result.reward))
            steps += 1
            if result.done:
                break
        score = float(grade(task_env))
        s = task_env.state()
        results.append({
            'task': task_name,
            'score': round(score, 4),
            'completed': s['total_completed'],
            'failed': s['total_failed'],
            'total': len(task_env.orders),
            'steps': steps,
            'valid_range': 0.0 < score < 1.0,
        })
        print(f'  {task_name:8s} score={score:.4f}  completed={s[\"total_completed\"]}  failed={s[\"total_failed\"]}  steps={steps}  valid={0.0 < score < 1.0}')
    elapsed = round(time.perf_counter() - t0, 3)
    print(f'Total time: {elapsed}s')
    print(f'All passed: {all(r[\"valid_range\"] for r in results)}')

asyncio.run(run_test())
" 2>&1
