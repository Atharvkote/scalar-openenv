"""
FOOD DASH OpenEnv — FastAPI Server

Exposes the FoodDashEnv as a REST API compatible with OpenEnv validations.
Connects to the Node.js FoodDash backend when available (falls back to
simulator-only mode).

Endpoints:
  POST /reset          — Initialize/reset environment
  POST /step           — Execute one action
  GET  /state          — Get current state
  GET  /health         — Health check
  GET  /docs           — API documentation (Swagger UI)
"""

import logging
import os
import sys
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Path setup — make sure project root is importable
# ---------------------------------------------------------------------------
_this_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(os.path.dirname(_this_dir))  # openenv/server → openenv → project root
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from openenv.env import FoodDashEnv
from openenv.models import Action
from openenv.tasks import get_task


# =============================================================================
# Pydantic Models
# =============================================================================
class ResetRequest(BaseModel):
    """Request body for /reset endpoint."""
    task: str = Field("easy", description="Task: easy, medium, or hard")


class StepRequest(BaseModel):
    """Request body for /step endpoint."""
    action_type: str
    order_id: Optional[int] = None
    order_ids: Optional[list] = None
    user_id: Optional[int] = None


# =============================================================================
# Logging
# =============================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# =============================================================================
# Configuration
# =============================================================================
NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:5000")

# =============================================================================
# FastAPI App
# =============================================================================
app = FastAPI(
    title="FOOD DASH OpenEnv",
    description="Restaurant order management RL environment connected to FoodDash backend",
    version="1.0.0",
)

# CORS — allow all origins for local dev (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global environment instance
_env_instance: FoodDashEnv | None = None
_current_task: str = "easy"

logger.info("FOOD DASH OpenEnv API initialized")
logger.info("Node.js backend URL: %s", NODE_API_URL)


# =============================================================================
# Health & Metadata
# =============================================================================
@app.get("/health", response_class=PlainTextResponse)
async def health_check() -> str:
    """Health check endpoint."""
    return "ok"


@app.get("/info", response_class=JSONResponse)
async def info() -> dict:
    """Environment metadata."""
    return {
        "name": "food-dash-env",
        "version": "1.0.0",
        "spec": "openenv-0.1",
        "tasks": ["easy", "medium", "hard"],
        "node_api_url": NODE_API_URL,
        "status": "ready",
    }


# =============================================================================
# OpenEnv API Endpoints
# =============================================================================
@app.post("/reset")
async def reset_env(body: Optional[ResetRequest] = None) -> dict:
    """
    Reset the environment.

    Request body (optional):
      {
        "task": "easy" | "medium" | "hard"  (default: "easy")
      }

    Returns:
      observation (dict): Initial observation from reset()
    """
    global _env_instance, _current_task

    try:
        task_id = "easy"
        if body:
            task_id = body.task

        # Validate task
        if task_id not in ("easy", "medium", "hard"):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid task: {task_id}. Must be one of: easy, medium, hard",
            )

        _current_task = task_id
        cfg = get_task(task_id)

        # Create env with Node.js bridge
        _env_instance = FoodDashEnv(cfg, node_api_url=NODE_API_URL)
        obs = _env_instance.reset(cfg)

        logger.info(f"Environment reset for task: {task_id}")
        return obs.model_dump()

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during reset: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/step")
async def step_env(body: StepRequest) -> dict:
    """
    Execute one environment step.

    Request body:
      {
        "action_type": "prioritize_order" | "delay_order" | "recommend_item" | "split_kitchen_load" | "reject_order" | "noop",
        "order_id": int | null,
        "order_ids": [int] | null,
        "user_id": int | null
      }

    Returns:
      {
        "observation": dict,
        "reward": float,
        "done": bool,
        "info": dict
      }
    """
    global _env_instance

    try:
        if _env_instance is None:
            raise HTTPException(
                status_code=400,
                detail="Environment not initialized. Call /reset first.",
            )

        # Create action
        action = Action(
            action_type=body.action_type,
            order_id=body.order_id,
            order_ids=body.order_ids,
            user_id=body.user_id,
        )

        # Step
        obs, reward, done, info = _env_instance.step(action)

        logger.info(
            f"Step executed: action={action.action_type}, reward={reward:.2f}, done={done}"
        )

        return {
            "observation": obs.model_dump(),
            "reward": reward,
            "done": done,
            "info": info,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during step: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/state")
async def get_state() -> dict:
    """
    Get the complete environment state (for grading).

    Returns:
      state (dict): Full internal state from env.state()
    """
    global _env_instance

    try:
        if _env_instance is None:
            raise HTTPException(
                status_code=400,
                detail="Environment not initialized. Call /reset first.",
            )

        state = _env_instance.state()
        logger.info(f"State retrieved: task={_current_task}")
        return state

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving state: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Root & Docs
# =============================================================================
@app.get("/")
async def root() -> dict:
    """API root."""
    return {
        "message": "FOOD DASH OpenEnv API",
        "docs": "/docs",
        "openapi": "/openapi.json",
        "endpoints": {
            "/health": "GET — Health check",
            "/info": "GET — Environment metadata",
            "/reset": "POST — Reset environment",
            "/step": "POST — Execute action",
            "/state": "GET — Get episode state",
        },
    }


# =============================================================================
# Error Handlers
# =============================================================================
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# =============================================================================
# Startup
# =============================================================================
@app.on_event("startup")
async def startup_event() -> None:
    """Initialize on startup."""
    logger.info("FOOD DASH OpenEnv API starting up...")
    logger.info("Available tasks: easy, medium, hard")
    logger.info("Node.js backend: %s", NODE_API_URL)
    logger.info("Visit /docs for interactive documentation")


if __name__ == "__main__":
    import uvicorn

    # Default port 8000 for local dev; PORT env var for HF Spaces / Docker
    port = int(os.getenv("PORT", 8000))
    host = "0.0.0.0"

    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
