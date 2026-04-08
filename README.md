# Open ENV Environment

## Overview

This repository contains **OpenEnv** — a reinforcement learning environment framework with Hugging Face Hub integration and FastAPI-based deployment.

---

## ⚡ Quick Start (Docker - 5 Minutes)

**System Requirements:**
- Docker & Docker Compose installed

**Start all services:**
```bash
docker-compose up --build
```

**Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:5000/api
- OpenEnv API: http://localhost:8000  
- API Docs: http://localhost:8000/docs

**Run test script:**
```bash
bash docker-test.sh
```

That's it! All services including MongoDB, Redis, Node.js backend, React frontend, and Python OpenEnv API are running.

---

## OpenEnv

OpenEnv is a simulated environment that exposes interactive episodes through a REST API. It provides:

- **Environment Simulation**: State management, action execution, and episode control
- **REST API**: FastAPI endpoints for environment interaction
- **OpenAI Integration**: Built-in support for LLM-based agent interactions
- **Grading System**: Automatic evaluation of agent performance
- **Node.js Bridge**: Optional integration with external Node.js services

### Key Features

- **Episode Management**: Reset and step through environment states
- **Action Validation**: Automatic action normalization and validation
- **State Snapshots**: Get current environment state at any time
- **Simulator Mode**: Fallback simulation when external services unavailable


## Hugging Face Hub Deployment

Deploy OpenEnv to Hugging Face Hub for easy sharing and access:

### Files Required

Place your model/environment files in the repository:

```
huggingface/
├── config.json          # Environment configuration
├── environment.pkl      # Serialized environment
├── requirements.txt     # Python dependencies
└── README.md           # Hub documentation
```

### Deployment Steps

1. **Create Hugging Face Repository**
   ```bash
   huggingface-cli login
   huggingface-cli repo create food-dash-env
   ```

2. **Push to Hub**
   ```bash
   git clone https://huggingface.co/your-username/food-dash-env
   cd food-dash-env
   # Add files and commit
   git add .
   git commit -m "Initial environment"
   git push
   ```

3. **Access via Inference API**
   ```python
   from huggingface_hub import InferenceApi
   
   api = InferenceApi("your-username/food-dash-env", token=YOUR_TOKEN)
   result = api.post(json={"action": 0})
   ```

### Environment Card

Create a `README.md` in your Hugging Face repo describing:
- Environment purpose and task
- Action/observation space
- Example usage
- Training benchmarks


## Setup & Installation

### Prerequisites

- Python 3.8+
- Node.js 16+ (optional, for Node bridge integration)
- Docker (optional, for containerized deployment)

### Local Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd food-dash-env
   ```

2. **Install Python Dependencies**
   ```bash
   pip install -r openenv/server/requirements.txt
   ```

3. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration:
   # - OPENAI_API_KEY (for LLM features)
   # - DATABASE_URL (if using external database)
   # - NODE_BACKEND_URL (if using Node.js backend)
   ```

4. **Start OpenEnv Server**
   ```bash
   python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
   ```

   Or use the inference agent directly:
   ```bash
   # Direct mode (in-process)
   python inference.py --mode direct --tasks easy medium hard
   
   # HTTP mode (via API)
   python inference.py --mode http --tasks easy medium hard
   ```

   Server will be available at `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/health`

### Quick Start with Root API Interface

Start the root-level API interface directly:

```bash
# Using uvicorn
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload

# Or run directly
python api.py
```

Access at `http://localhost:8000`

---

## Docker Setup

### Quick Start with Docker Compose

1. **Ensure Docker and Docker Compose are installed**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Configure environment (optional)**
   ```bash
   cp .env.example .env
   # Edit .env to add your API keys (optional for development)
   ```

3. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - MongoDB on port 27017
   - Redis on port 6379
   - Node.js Backend on port 5000
   - Python OpenEnv API on port 8000
   - React Frontend at http://localhost

4. **Access the application**
   ```
   Frontend:     http://localhost
   Backend API:  http://localhost:5000/api
   OpenEnv API:  http://localhost:8000
   OpenEnv Docs: http://localhost:8000/docs
   ```

### Automated Docker Test

Verify your Docker setup with the test script:

```bash
bash docker-test.sh
```

This script checks:
- Docker and Docker Compose installation
- All required files (Dockerfile, api.py, etc.)
- Service startup and health
- API endpoint availability
- Database connectivity

### Comprehensive Docker Documentation

See [DOCKER.md](DOCKER.md) for:
- Advanced configuration
- Troubleshooting guide
- Production deployment
- Performance tuning
- CI/CD integration
- Backup and maintenance

### Docker Compose Override

To use external MongoDB/Redis:

```bash
# Create docker-compose.override.yml
version: "3.9"
services:
  food-dash:
    environment:
      MONGODB_URI: mongodb+srv://user:pass@cluster.mongodb.net/food_dash
      REDIS_URL: redis://:pass@host:6379
```

Then:
```bash
docker-compose up
```

### Troubleshooting Docker

**Check service status:**
```bash
docker-compose ps
```

**View logs:**
```bash
docker-compose logs -f              # All services
docker-compose logs -f mongodb      # MongoDB only
docker-compose logs -f redis        # Redis only
docker-compose logs -f food-dash    # App only
```

**Check specific container:**
```bash
docker-compose exec food-dash bash  # Access app shell
```

**Verify connectivity - inside container:**
```bash
docker-compose exec food-dash curl http://localhost:8000/health
docker-compose exec food-dash python3 -c "import sys; print(sys.path)"
```

**Common issues:**

| Issue | Solution |
|-------|----------|
| Port already in use | Change ports in docker-compose.yml |
| MongoDB won't start | Check `docker-compose logs mongodb` for auth issues |
| FastAPI not starting | Verify requirements.txt is installed: `docker-compose logs food-dash` |
| Node.js won't connect to MongoDB | Check MONGODB_URI and credentials |
| Permission denied on /app | May need docker rebuild with: `docker-compose build --no-cache` |

**Test Docker Setup:**

Run the automated test script:
```bash
bash docker-test.sh
```

Or manually test each service:
```bash
# Test Backend API
curl http://localhost:5000/api/health

# Test OpenEnv API
curl http://localhost:8000/health

# Test MongoDB
docker-compose exec mongodb mongosh --eval "db.runCommand('ping').ok"

# Test Redis
docker-compose exec redis redis-cli ping
```

**Clean restart:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## Troubleshooting

1. **Build Docker Image**
   ```bash
   docker build -f openenv/server/dockerfile -t food-dash-env:latest .
   ```

2. **Run Container**
   ```bash
   docker run -p 8000:8000 \
     -e OPENAI_API_KEY=<your-key> \
     food-dash-env:latest
   ```

3. **Using Docker Compose**
   ```bash
   docker-compose up -d openenv
   ```


## API Usage

### Root API Interface (`api.py`)

Main entry point for all API requests:

```bash
curl http://localhost:8000/
```

#### Reset Environment

```bash
curl -X POST http://localhost:8000/env/reset \
  -H "Content-Type: application/json" \
  -d '{"task": "easy"}'
```

#### Step Environment

```bash
curl -X POST http://localhost:8000/env/step \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "prioritize_order",
    "order_id": 1
  }'
```

Response:
```json
{
  "observation": {...},
  "reward": 1.0,
  "done": false,
  "info": {...}
}
```

#### Get Environment State

```bash
curl http://localhost:8000/env/state
```

#### Get Environment Info

```bash
curl http://localhost:8000/env/info
```

## Inference Agent

Run pre-configured agents against the environment for evaluation and benchmarking.

### Direct Mode (In-Process)

Evaluate all tasks using the environment locally:

```bash
python inference.py --mode direct --tasks easy medium hard
```

Features:
- Heuristic agent (default)
- LLM integration (with OpenAI API key)
- Action validation and logging
- Automatic grading

### HTTP Mode (Via API)

Call running API server:

```bash
# Terminal 1: Start API
python -m uvicorn api:app --reload

# Terminal 2: Run inference
python inference.py --mode http --tasks easy medium hard
```

### Environment Variables

```bash
# For LLM agent
export API_BASE_URL="https://api.openai.com/v1"
export MODEL_NAME="gpt-4o-mini"
export HF_TOKEN="your-api-key"

# For HTTP mode
export OPENENV_API_URL="http://localhost:8000"

# Then run inference
python inference.py --mode http --tasks easy
```

### Output Format

Each run produces:
- `[START]` — Task initialization
- `[STEP]` — Per-step results (action, reward, done status)
- `[END]` — Task completion with score and rewards
- `[SUMMARY]` — Mean normalized score across all tasks

### OpenEnv Direct Endpoints

For raw OpenEnv server access (bypass root API):

#### Health Check

```bash
curl http://localhost:8000/health
```

#### Direct Reset


## Configuration

### `openenv.yaml`

Root-level environment specification defining:
- Action space (types, constraints)
- Observation space (state structure)
- Task definitions (easy, medium, hard)
- Backend configuration (Node.js API endpoints)
- Module entry point

### `requirements.txt`

Python dependencies for the environment:
```
pydantic>=2.5.0
openai>=1.40.0
fastapi>=0.110.0
uvicorn>=0.29.0
requests>=2.31.0
```

### `api.py`

Main FastAPI application:
- Initializes environment from `openenv.yaml`
- Exposes `/env` endpoints
- Integrates with OpenEnv backend
- CORS and logging middleware

### `inference.py`

Configurable inference agent with:
- **Heuristic agent**: Priority queue ordering, fairness, VIP handling
- **LLM agent**: Optional OpenAI integration with fallback
- **Grading system**: Task-specific evaluation
- **HTTP client**: API server interaction with retries

### `openenv/config.py`

Configure environment parameters:
- Action space definition
- Observation space structure
- Reward function parameters
- Episode length limits

### `openenv/models.py`

Define data models for:
- Environment state
- Actions
- Observations
- Agent performance metrics


## Development

### Project Structure

```
food-dash-env/
├── api.py                  # Root API interface (main entry point)
├── inference.py            # Inference agent (direct/HTTP modes)
├── openenv.yaml            # Environment specification
├── requirements.txt        # Python dependencies
├── docker-compose.yml      # Container orchestration
├── Dockerfile              # Application container definition
├── README.md              # This file
├── client/                # React frontend
├── server/                # Node.js backend
└── openenv/               # RL Environment framework
    ├── __init__.py
    ├── config.py           # Configuration parameters
    ├── env.py             # Main environment class
    ├── models.py          # Data models
    ├── tasks.py           # Task definitions
    ├── graders.py         # Evaluation/grading logic
    ├── simulator.py       # Simulation engine
    ├── node_bridge.py     # Node.js integration
    └── server/
        ├── app.py         # FastAPI application
        ├── dockerfile     # Docker configuration
        └── requirements.txt
```

### Running Tests

```bash
pytest openenv/tests/
```


## Deployment Options

| Platform | Command | File | Notes |
|----------|---------|------|-------|
| **Local API** | `python -m uvicorn api:app --reload` | `api.py` | Main REST API |
| **Inference (Direct)** | `python inference.py --mode direct` | `inference.py` | In-process evaluation |
| **Inference (HTTP)** | `python inference.py --mode http` | `inference.py` | Via API server |
| **Docker** | `docker run -p 8000:8000 food-dash-env:latest` | `Dockerfile` | Production |
| **Compose** | `docker-compose up` | `docker-compose.yml` | Multi-service |
| **Hugging Face** | Push to Hub + use Inference API | `openenv.yaml` | Serverless |


## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8000 already in use | Change port: `--port 8001` |
| OpenAI API errors | Verify `OPENAI_API_KEY` is set |
| Node backend unreachable | Server runs in simulator mode (no Node dependency) |
| CORS errors | Check allowed origins in `app.py` |


## License

See LICENSE file for details.
