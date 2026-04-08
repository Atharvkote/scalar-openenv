# ==========================================
# FOOD DASH - Docker Build & Deploy Script (Windows PowerShell)
# Quick setup and deployment for local/production
# Usage: .\docker-build.ps1 -Command build|deploy|test|clean|logs
# ==========================================

param(
    [Parameter(Position=0)]
    [ValidateSet('build', 'deploy', 'deploy-standalone', 'test', 'logs', 'clean', 'push', 'all', 'help')]
    [string]$Command = 'help',
    
    [string]$ImageName = 'food-dash',
    [string]$ImageTag = 'latest',
    [string]$ContainerName = 'food-dash-app',
    [string]$RegistryUser = ''
)

# Color functions
function Write-Header {
    param([string]$Text)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "[+] $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "[-] $Text" -ForegroundColor Red
}

function Write-Warn {
    param([string]$Text)
    Write-Host "[!] $Text" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Text)
    Write-Host "[*] $Text" -ForegroundColor Cyan
}

# Check prerequisites
function Check-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    # Check Docker
    try {
        $dockerVersion = docker --version
        Write-Success $dockerVersion
    }
    catch {
        Write-Error "Docker is not installed"
        exit 1
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version
        Write-Success $composeVersion
    }
    catch {
        Write-Error "Docker Compose is not installed"
        exit 1
    }
    
    # Check .env file
    if (-not (Test-Path ".env")) {
        Write-Warn ".env file not found"
        Write-Info "Creating .env from .env.example..."
        Copy-Item ".env.example" ".env"
        Write-Warn "Please edit .env with your configuration:"
        Write-Warn "  - MONGODB_URI"
        Write-Warn "  - REDIS_URL"
        Write-Warn "  - JWT_SECRET"
        Write-Warn "  - API keys (OpenAI, Google, Razorpay)"
        Write-Host ""
    }
}

# Build Docker image
function Build-Image {
    Write-Header "Building Docker Image"
    
    # Check if Dockerfile exists
    if (-not (Test-Path "Dockerfile")) {
        Write-Error "Dockerfile not found"
        exit 1
    }
    
    Write-Info "Building image: ${ImageName}:${ImageTag}"
    docker build -t "${ImageName}:${ImageTag}" -t "${ImageName}:latest" --progress=plain .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Image built successfully"
        $imageSize = docker images ${ImageName}:${ImageTag} --format "{{.Size}}"
        Write-Info "Image size: $imageSize"
    }
    else {
        Write-Error "Failed to build image"
        exit 1
    }
}

# Deploy with Docker Compose
function Deploy-Compose {
    Write-Header "Deploying with Docker Compose"
    
    # Check if docker-compose.yml exists
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Error "docker-compose.yml not found"
        exit 1
    }
    
    Write-Info "Starting services..."
    docker-compose up -d
    
    Start-Sleep -Seconds 3
    
    # Check if services are running
    $status = docker-compose ps
    if ($status -match "Up") {
        Write-Success "Services started"
        Write-Host $status
    }
    else {
        Write-Error "Failed to start services"
        docker-compose logs
        exit 1
    }
}

# Deploy standalone container
function Deploy-Standalone {
    Write-Header "Deploying Standalone Container"
    
    # Stop existing container if running
    $existingContainer = docker ps -a --format "{{.Names}}" | Select-String -Pattern "^${ContainerName}$"
    if ($existingContainer) {
        Write-Info "Stopping existing container..."
        docker stop $ContainerName 2> $null
        docker rm $ContainerName 2> $null
    }
    
    Write-Info "Starting container..."
    docker run -d `
        --name $ContainerName `
        --env-file .env `
        -p 5000:5000 `
        -p 8000:8000 `
        --restart unless-stopped `
        --health-cmd "curl -f http://localhost:5000/api/health || exit 1" `
        --health-interval=30s `
        --health-timeout=10s `
        --health-retries=3 `
        "${ImageName}:${ImageTag}"
    
    Start-Sleep -Seconds 2
    
    $running = docker ps | Select-String -Pattern $ContainerName
    if ($running) {
        Write-Success "Container started: $ContainerName"
    }
    else {
        Write-Error "Failed to start container"
        docker logs $ContainerName
        exit 1
    }
}

# Test deployment
function Test-Deployment {
    Write-Header "Testing Deployment"
    
    Write-Info "Waiting for services to be ready..."
    Start-Sleep -Seconds 5
    
    # Test backend health
    Write-Info "Testing backend health..."
    try {
        $health = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5
        if ($health.Content -match "running") {
            Write-Success "Backend health check passed"
            Write-Host $health.Content
        }
        else {
            Write-Error "Backend health check failed"
            exit 1
        }
    }
    catch {
        Write-Error "Failed to connect to backend: $_"
        exit 1
    }
}

# View logs
function View-Logs {
    Write-Header "Service Logs"
    
    # Check if docker-compose is in use
    $status = docker-compose ps 2> $null
    if ($status -match "food-dash") {
        Write-Info "Docker Compose logs:"
        docker-compose logs -f --tail=50
    }
    else {
        # Check for standalone container
        $running = docker ps | Select-String -Pattern $ContainerName
        if ($running) {
            Write-Info "Container logs:"
            docker logs -f --tail=50 $ContainerName
        }
        else {
            Write-Error "No active deployment found"
        }
    }
}

# Clean up Docker resources
function Cleanup {
    Write-Header "Cleaning Up"
    
    # Stop and remove Docker Compose services
    $composeStatus = docker-compose ps 2> $null
    if ($composeStatus -match "food-dash") {
        Write-Info "Stopping Docker Compose services..."
        docker-compose down
        Write-Success "Docker Compose services stopped"
    }
    
    # Remove standalone container
    $containerExists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "^${ContainerName}$"
    if ($containerExists) {
        Write-Info "Removing container..."
        docker stop $ContainerName 2> $null
        docker rm $ContainerName 2> $null
        Write-Success "Container removed"
    }
    
    # Remove image
    $imageExists = docker images ${ImageName}:${ImageTag} | Select-String -Pattern $ImageName
    if ($imageExists) {
        Write-Info "Removing Docker image..."
        docker rmi "${ImageName}:${ImageTag}"
        Write-Success "Image removed"
    }
}

# Push to registry
function Push-ToRegistry {
    Write-Header "Pushing to Docker Registry"
    
    if ([string]::IsNullOrEmpty($RegistryUser)) {
        Write-Error "REGISTRY_USER not set"
        Write-Info "Set -RegistryUser parameter or edit script"
        exit 1
    }
    
    Write-Info "Logging into Docker Hub..."
    docker login
    
    $registryImage = "${RegistryUser}/${ImageName}:${ImageTag}"
    
    Write-Info "Tagging image as $registryImage..."
    docker tag "${ImageName}:${ImageTag}" $registryImage
    
    Write-Info "Pushing to registry..."
    docker push $registryImage
    
    Write-Success "Image pushed successfully"
}

# Show usage
function Show-Usage {
    @"

FOOD DASH Docker Build & Deploy Script (Windows)

Usage: .\docker-build.ps1 [-Command] [command-name] [Options]

Commands:
  build              Build Docker image
  deploy             Build and deploy with Docker Compose
  deploy-standalone  Deploy as standalone container
  test               Test deployment
  logs               View service logs
  clean              Stop and remove containers/image
  push               Push image to Docker registry
  all                Build and deploy everything
  help               Show this help message

Options:
  -ImageName        Docker image name (default: food-dash)
  -ImageTag         Docker image tag (default: latest)
  -ContainerName    Container name (default: food-dash-app)
  -RegistryUser     Docker Hub username (for push command)

Examples:
  # Build image
  .\docker-build.ps1 -Command build

  # Build and deploy
  .\docker-build.ps1 -Command deploy

  # Deploy standalone
  .\docker-build.ps1 -Command deploy-standalone

  # Test deployment
  .\docker-build.ps1 -Command test

  # View logs
  .\docker-build.ps1 -Command logs

  # Clean up everything
  .\docker-build.ps1 -Command clean

  # Push to Docker Hub
  .\docker-build.ps1 -Command push -RegistryUser myusername

  # Build everything and deploy
  .\docker-build.ps1 -Command all

Quick Start (Windows):
  1. .\docker-build.ps1 build          # Build image
  2. .\docker-build.ps1 deploy         # Start services
  3. .\docker-build.ps1 test           # Verify everything works
  4. Open http://localhost in browser  # Access application

"@
}

# Main logic
switch ($Command) {
    'build' {
        Check-Prerequisites
        Build-Image
    }
    'deploy' {
        Check-Prerequisites
        Build-Image
        Deploy-Compose
        Test-Deployment
    }
    'deploy-standalone' {
        Check-Prerequisites
        Build-Image
        Deploy-Standalone
        Test-Deployment
    }
    'test' {
        Test-Deployment
    }
    'logs' {
        View-Logs
    }
    'clean' {
        Cleanup
    }
    'push' {
        Push-ToRegistry
    }
    'all' {
        Check-Prerequisites
        Build-Image
        Deploy-Compose
        Test-Deployment
        Write-Header "[SUCCESS] Deployment Complete!"
        Write-Success "Application is running on http://localhost"
    }
    'help' {
        Show-Usage
    }
    default {
        Write-Error "Unknown command: $Command"
        Show-Usage
        exit 1
    }
}
