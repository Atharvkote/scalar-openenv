#!/bin/bash

# ==========================================
# FOOD DASH - Docker Build & Deploy Script
# Quick setup and deployment for local/production
# Usage: bash docker-build.sh [build|deploy|test|clean|logs]
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="food-dash"
IMAGE_TAG="latest"
CONTAINER_NAME="food-dash-app"
REGISTRY_USER=""  # Set to push to Docker Hub

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker found: $(docker --version)"
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose found: $(docker-compose --version)"
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_warn ".env file not found"
        print_info "Creating .env from .env.example..."
        cp .env.example .env
        print_warn "Please edit .env with your configuration:"
        print_warn "  - MONGODB_URI"
        print_warn "  - REDIS_URL"
        print_warn "  - JWT_SECRET"
        print_warn "  - API keys (OpenAI, Google, Razorpay)"
        echo ""
    fi
}

# Build Docker image
build_image() {
    print_header "Building Docker Image"
    
    # Check if Dockerfile exists
    if [ ! -f Dockerfile ]; then
        print_error "Dockerfile not found"
        exit 1
    fi
    
    print_info "Building image: ${IMAGE_NAME}:${IMAGE_TAG}"
    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} \
                 -t ${IMAGE_NAME}:latest \
                 --progress=plain \
                 .
    
    if [ $? -eq 0 ]; then
        print_success "Image built successfully"
        print_info "Image size: $(docker images ${IMAGE_NAME}:${IMAGE_TAG} --format '{{.Size}}')"
    else
        print_error "Failed to build image"
        exit 1
    fi
}

# Deploy with Docker Compose
deploy_compose() {
    print_header "Deploying with Docker Compose"
    
    # Check if docker-compose.yml exists
    if [ ! -f docker-compose.yml ]; then
        print_error "docker-compose.yml not found"
        exit 1
    fi
    
    print_info "Starting services..."
    docker-compose up -d
    
    sleep 3
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Services started"
        docker-compose ps
    else
        print_error "Failed to start services"
        docker-compose logs
        exit 1
    fi
}

# Deploy standalone container
deploy_standalone() {
    print_header "Deploying Standalone Container"
    
    # Stop existing container if running
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_info "Stopping existing container..."
        docker stop ${CONTAINER_NAME} || true
        docker rm ${CONTAINER_NAME} || true
    fi
    
    print_info "Starting container..."
    docker run -d \
        --name ${CONTAINER_NAME} \
        --env-file .env \
        -p 5000:5000 \
        -p 8000:8000 \
        --restart unless-stopped \
        --health-cmd="curl -f http://localhost:5000/api/health || exit 1" \
        --health-interval=30s \
        --health-timeout=10s \
        --health-retries=3 \
        ${IMAGE_NAME}:${IMAGE_TAG}
    
    sleep 2
    
    if docker ps | grep -q ${CONTAINER_NAME}; then
        print_success "Container started: ${CONTAINER_NAME}"
    else
        print_error "Failed to start container"
        docker logs ${CONTAINER_NAME}
        exit 1
    fi
}

# Test deployment
test_deployment() {
    print_header "Testing Deployment"
    
    print_info "Waiting for services to be ready..."
    sleep 5
    
    # Test backend health
    print_info "Testing backend health..."
    if curl -s http://localhost:5000/api/health | grep -q "running"; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        exit 1
    fi
    
    # Test Python OpenEnv
    print_info "Testing Python OpenEnv..."
    if curl -s http://localhost:8000/health | grep -q "healthy"; then
        print_success "Python OpenEnv health check passed"
    else
        print_warn "Python OpenEnv not responding (may still be starting)"
    fi
    
    # Test API endpoints
    print_info "Testing API endpoints..."
    
    # Health endpoint
    HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
    if [ $HEALTH_CODE -eq 200 ]; then
        print_success "API health endpoint working (HTTP ${HEALTH_CODE})"
    else
        print_error "API health endpoint failed (HTTP ${HEALTH_CODE})"
    fi
}

# View logs
view_logs() {
    print_header "Service Logs"
    
    if docker-compose ps | grep -q "food-dash"; then
        print_info "Docker Compose logs:"
        docker-compose logs -f --tail=50
    elif docker ps | grep -q ${CONTAINER_NAME}; then
        print_info "Container logs:"
        docker logs -f --tail=50 ${CONTAINER_NAME}
    else
        print_error "No active deployment found"
    fi
}

# Clean up Docker resources
cleanup() {
    print_header "Cleaning Up"
    
    # Stop and remove containers
    if docker-compose ps | grep -q "food-dash"; then
        print_info "Stopping Docker Compose services..."
        docker-compose down
        print_success "Docker Compose services stopped"
    fi
    
    # Remove standalone container
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_info "Removing standalone container..."
        docker stop ${CONTAINER_NAME} || true
        docker rm ${CONTAINER_NAME} || true
        print_success "Container removed"
    fi
    
    # Remove images
    if docker images ${IMAGE_NAME}:${IMAGE_TAG} | grep -q ${IMAGE_NAME}; then
        print_info "Removing Docker image..."
        docker rmi ${IMAGE_NAME}:${IMAGE_TAG}
        print_success "Image removed"
    fi
}

# Push to registry
push_to_registry() {
    print_header "Pushing to Docker Registry"
    
    if [ -z "${REGISTRY_USER}" ]; then
        print_error "REGISTRY_USER not set"
        print_info "Set REGISTRY_USER environment variable or edit script"
        exit 1
    fi
    
    print_info "Logging into Docker Hub..."
    docker login
    
    REGISTRY_IMAGE="${REGISTRY_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
    
    print_info "Tagging image as ${REGISTRY_IMAGE}..."
    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY_IMAGE}
    
    print_info "Pushing to registry..."
    docker push ${REGISTRY_IMAGE}
    
    print_success "Image pushed successfully"
}

# Show usage
show_usage() {
    echo ""
    echo "FOOD DASH Docker Build & Deploy Script"
    echo ""
    echo "Usage: bash docker-build.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build              Build Docker image"
    echo "  deploy             Deploy with Docker Compose"
    echo "  deploy-standalone  Deploy as standalone container"
    echo "  test               Test deployment"
    echo "  logs               View service logs"
    echo "  clean              Stop and remove containers"
    echo "  push               Push image to Docker registry (requires Docker Hub account)"
    echo "  all                Build and deploy everything"
    echo "  help               Show this help message"
    echo ""
    echo "Quick Start:"
    echo "  1. bash docker-build.sh build        # Build image"
    echo "  2. bash docker-build.sh deploy       # Start services"
    echo "  3. bash docker-build.sh test         # Verify everything works"
    echo "  4. Open http://localhost in browser  # Access application"
    echo ""
}

# Main script logic
main() {
    COMMAND="${1:-help}"
    
    case ${COMMAND} in
        build)
            check_prerequisites
            build_image
            ;;
        deploy)
            check_prerequisites
            build_image
            deploy_compose
            test_deployment
            ;;
        deploy-standalone)
            check_prerequisites
            build_image
            deploy_standalone
            test_deployment
            ;;
        test)
            test_deployment
            ;;
        logs)
            view_logs
            ;;
        clean)
            cleanup
            ;;
        push)
            push_to_registry
            ;;
        all)
            check_prerequisites
            build_image
            deploy_compose
            test_deployment
            print_header "✓ Deployment Complete!"
            print_success "Application is running on http://localhost"
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: ${COMMAND}"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
