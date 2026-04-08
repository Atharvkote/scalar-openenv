# ==========================================
# FOOD DASH - Full Stack Multi-Service Docker Build
# Deploys: Node.js Backend + React Frontend + Python OpenEnv
# ==========================================

# ==========================================
# STAGE 1: Build React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /build/client

# Copy client package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci --frozen-lockfile

# Copy frontend source
COPY client/ ./

# Build for production
RUN npm run build

# ==========================================
# STAGE 2: Build Backend Dependencies
# ==========================================
FROM node:20-alpine AS backend-builder

WORKDIR /build/server

# Copy server package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --frozen-lockfile

# ==========================================
# STAGE 3: Final Production Image
# ==========================================
FROM node:20-bookworm

# Install Python 3 and pip
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create application directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PORT=5000 \
    PYTHON_PORT=8000 \
    NODE_API_URL=http://localhost:5000

# ==========================================
# Setup Node.js Backend
# ==========================================

# Copy built node_modules from backend-builder
COPY --from=backend-builder /build/server/node_modules ./server/node_modules

# Copy server source code
COPY server/ ./server/

# ==========================================
# Setup React Frontend
# ==========================================

# Create public directory in server for static files
RUN mkdir -p ./server/public

# Copy built frontend dist to server public directory
COPY --from=frontend-builder /build/client/dist ./server/public/

# Copy client source (in case needed)
COPY client/ ./client/

# ==========================================
# Setup Python OpenEnv
# ==========================================

# Copy root-level Python requirements
COPY requirements.txt ./requirements.txt

# Install Python dependencies
RUN python3 -m pip install --no-cache-dir --break-system-packages -r requirements.txt

# Copy root-level configuration and code
COPY openenv/ ./openenv/
COPY api.py ./api.py
COPY inference.py ./inference.py
COPY openenv.yaml ./openenv.yaml

# Create logs and data directories
RUN mkdir -p ./server/logs ./data

# ==========================================
# Expose Ports
# ==========================================

# Node.js backend API on 5000
EXPOSE 5000

# Python FastAPI OpenEnv on 8000
EXPOSE 8000

# ==========================================
# Create Production Start Script
# ==========================================

RUN printf '#!/bin/bash\nset -e\n\necho "================================================"\necho "Starting FOOD DASH Multi-Service Application"\necho "================================================"\n\n# Start Python FastAPI Server in background\necho "[1/2] Starting FastAPI Server (OpenEnv) on 0.0.0.0:8000..."\ncd /app\npython3 -m uvicorn api:app --host 0.0.0.0 --port 8000 --workers 2 > /tmp/uvicorn.log 2>&1 &\nPYTHON_PID=$!\necho "FastAPI PID: $PYTHON_PID"\nsleep 3\n\n# Check if Python process is running\nif ! kill -0 $PYTHON_PID 2>/dev/null; then\n    echo "[ERROR] FastAPI failed to start. Logs:"\n    cat /tmp/uvicorn.log\n    exit 1\nfi\n\n# Start Node.js Backend Server\necho "[2/2] Starting Node.js Backend Server on 0.0.0.0:5000..."\ncd /app/server\nnode server.js > /tmp/nodejs.log 2>&1 &\nNODE_PID=$!\necho "Node.js PID: $NODE_PID"\nsleep 3\n\n# Check if Node process is running\nif ! kill -0 $NODE_PID 2>/dev/null; then\n    echo "[ERROR] Node.js failed to start. Logs:"\n    cat /tmp/nodejs.log\n    exit 1\nfi\n\necho "================================================"\necho "All services started successfully!"\necho "API: http://localhost:5000"\necho "OpenEnv: http://localhost:8000/docs"\necho "================================================"\necho ""\n\n# Trap signals and forward to children\ntrap "echo \"Stopping services...\"; kill $PYTHON_PID $NODE_PID 2>/dev/null || true; exit 0" SIGTERM SIGINT\n\n# Wait for both processes\nwait $PYTHON_PID $NODE_PID\n' > /app/start.sh && chmod +x /app/start.sh

# ==========================================
# Health Check
# ==========================================

HEALTHCHECK --interval=30s --timeout=15s --start-period=50s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# ==========================================
# Run Application
# ==========================================

CMD ["/app/start.sh"]
