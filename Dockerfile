# -------- Stage 1: Build Dependencies --------
    FROM python:3.10-slim AS builder

    WORKDIR /app
    
    # Install system dependencies (only if needed)
    RUN apt-get update && apt-get install -y \
        build-essential \
        && rm -rf /var/lib/apt/lists/*
    
    # Copy only requirements first (better caching)
    COPY requirements.txt .
    
    # Install dependencies into a separate folder
    RUN pip install --no-cache-dir --user -r requirements.txt
    
    # -------- Stage 2: Final Runtime Image --------
    FROM python:3.10-slim
    
    WORKDIR /app
    
    # Copy installed dependencies from builder
    COPY --from=builder /root/.local /root/.local
    
    # Add local bin to PATH
    ENV PATH=/root/.local/bin:$PATH
    
    # Copy app source code
    COPY . .
    
    # Expose port
    EXPOSE 8000
    
    # Run app
    CMD ["uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "8000"]
