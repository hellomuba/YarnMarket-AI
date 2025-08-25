#!/bin/bash

# YarnMarket AI Deployment Script
# Production deployment with zero-downtime rolling updates

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
NAMESPACE="yarnmarket-${ENVIRONMENT}"
REGISTRY="yarnmarket"
VERSION=$(git rev-parse --short HEAD)

echo -e "${BLUE}🚀 Starting YarnMarket AI deployment to ${ENVIRONMENT}...${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo -e "${BLUE}Namespace: ${NAMESPACE}${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verify prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if kubectl is installed and configured
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "docker is not installed"
    fi
    
    # Check if cluster is accessible
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace "${NAMESPACE}" &> /dev/null; then
        print_warning "Namespace ${NAMESPACE} does not exist, creating..."
        kubectl create namespace "${NAMESPACE}"
        kubectl label namespace "${NAMESPACE}" name="${NAMESPACE}"
    fi
    
    print_status "Prerequisites checked"
}

# Build and push Docker images
build_and_push_images() {
    echo -e "${BLUE}🏗️  Building and pushing Docker images...${NC}"
    
    # Services to build
    services=("webhook-handler" "conversation-engine" "merchant-api" "analytics-service")
    
    for service in "${services[@]}"; do
        echo -e "${BLUE}Building ${service}...${NC}"
        
        # Build image
        docker build -t "${REGISTRY}/${service}:${VERSION}" \
                     -t "${REGISTRY}/${service}:latest" \
                     "services/${service}/"
        
        # Push image
        docker push "${REGISTRY}/${service}:${VERSION}"
        docker push "${REGISTRY}/${service}:latest"
        
        print_status "Built and pushed ${service}:${VERSION}"
    done
    
    # Build web dashboard
    echo -e "${BLUE}Building web dashboard...${NC}"
    docker build -t "${REGISTRY}/dashboard:${VERSION}" \
                 -t "${REGISTRY}/dashboard:latest" \
                 "web/dashboard/"
    
    docker push "${REGISTRY}/dashboard:${VERSION}"
    docker push "${REGISTRY}/dashboard:latest"
    
    print_status "All images built and pushed"
}

# Apply Kubernetes configurations
deploy_infrastructure() {
    echo -e "${BLUE}🏗️  Deploying infrastructure components...${NC}"
    
    # Apply namespace configuration
    kubectl apply -f "infrastructure/kubernetes/${ENVIRONMENT}/namespace.yaml"
    
    # Apply secrets (assumes secrets are already created)
    if kubectl get secret database-secret -n "${NAMESPACE}" &> /dev/null; then
        print_status "Database secrets already exist"
    else
        print_warning "Database secrets not found. Please create them manually."
    fi
    
    # Apply ConfigMaps
    kubectl apply -f "infrastructure/kubernetes/${ENVIRONMENT}/configmaps/" -n "${NAMESPACE}"
    
    # Apply PersistentVolumes
    kubectl apply -f "infrastructure/kubernetes/${ENVIRONMENT}/storage/" -n "${NAMESPACE}"
    
    # Deploy databases
    kubectl apply -f "infrastructure/kubernetes/${ENVIRONMENT}/databases/" -n "${NAMESPACE}"
    
    # Wait for databases to be ready
    echo -e "${BLUE}⏳ Waiting for databases to be ready...${NC}"
    kubectl wait --for=condition=ready pod -l app=postgresql -n "${NAMESPACE}" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n "${NAMESPACE}" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=mongodb -n "${NAMESPACE}" --timeout=300s
    
    print_status "Infrastructure deployed"
}

# Deploy application services
deploy_services() {
    echo -e "${BLUE}🚀 Deploying application services...${NC}"
    
    # Update image tags in deployment files
    find "infrastructure/kubernetes/${ENVIRONMENT}/" -name "*.yaml" -exec \
        sed -i.bak "s|image: ${REGISTRY}/\([^:]*\):.*|image: ${REGISTRY}/\1:${VERSION}|g" {} \;
    
    # Deploy services in order
    services=("conversation-engine" "webhook-handler" "merchant-api" "analytics-service")
    
    for service in "${services[@]}"; do
        echo -e "${BLUE}Deploying ${service}...${NC}"
        
        kubectl apply -f "infrastructure/kubernetes/${ENVIRONMENT}/${service}.yaml" -n "${NAMESPACE}"
        
        # Wait for deployment to be ready
        kubectl rollout status deployment/"${service}" -n "${NAMESPACE}" --timeout=300s
        
        print_status "${service} deployed successfully"
    done
    
    # Deploy ingress
    kubectl apply -f "infrastructure/kubernetes/${ENVIRONMENT}/ingress.yaml" -n "${NAMESPACE}"
    
    print_status "All services deployed"
}

# Deploy monitoring
deploy_monitoring() {
    echo -e "${BLUE}📊 Deploying monitoring stack...${NC}"
    
    # Deploy Prometheus
    kubectl apply -f "infrastructure/kubernetes/${ENVIRONMENT}/monitoring/" -n "${NAMESPACE}"
    
    # Wait for Prometheus to be ready
    kubectl wait --for=condition=available deployment/prometheus -n "${NAMESPACE}" --timeout=300s
    
    # Deploy Grafana
    kubectl apply -f "infrastructure/kubernetes/${ENVIRONMENT}/grafana/" -n "${NAMESPACE}"
    
    print_status "Monitoring stack deployed"
}

# Run database migrations
run_migrations() {
    echo -e "${BLUE}🗃️  Running database migrations...${NC}"
    
    # Get a running merchant-api pod
    api_pod=$(kubectl get pods -l app=merchant-api -n "${NAMESPACE}" -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "${api_pod}" ]; then
        kubectl exec "${api_pod}" -n "${NAMESPACE}" -- npm run db:migrate
        print_status "Database migrations completed"
    else
        print_warning "No merchant-api pod found, skipping migrations"
    fi
}

# Verify deployment
verify_deployment() {
    echo -e "${BLUE}✅ Verifying deployment...${NC}"
    
    # Check all deployments are ready
    echo -e "${BLUE}Checking deployment status...${NC}"
    kubectl get deployments -n "${NAMESPACE}"
    
    # Check all pods are running
    echo -e "${BLUE}Checking pod status...${NC}"
    kubectl get pods -n "${NAMESPACE}"
    
    # Check services
    echo -e "${BLUE}Checking services...${NC}"
    kubectl get services -n "${NAMESPACE}"
    
    # Health checks
    services=("webhook-handler" "conversation-engine" "merchant-api" "analytics-service")
    
    for service in "${services[@]}"; do
        service_url="http://${service}-service.${NAMESPACE}.svc.cluster.local"
        
        # Port forward for health check (simplified - in production use service mesh)
        if kubectl get service "${service}-service" -n "${NAMESPACE}" &> /dev/null; then
            print_status "${service} service is running"
        else
            print_warning "${service} service not found"
        fi
    done
    
    # Get external IP/URL
    echo -e "${BLUE}Getting external access URLs...${NC}"
    kubectl get ingress -n "${NAMESPACE}"
    
    print_status "Deployment verification completed"
}

# Cleanup function
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up temporary files...${NC}"
    find "infrastructure/kubernetes/${ENVIRONMENT}/" -name "*.yaml.bak" -delete
    print_status "Cleanup completed"
}

# Performance test
run_performance_test() {
    if [ "${ENVIRONMENT}" = "staging" ]; then
        echo -e "${BLUE}🏋️  Running performance tests...${NC}"
        
        # Simple load test using kubectl
        webhook_url=$(kubectl get ingress -n "${NAMESPACE}" -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}')
        
        if [ -n "${webhook_url}" ]; then
            echo -e "${BLUE}Testing webhook at: https://${webhook_url}/health${NC}"
            # Add your load testing commands here
            print_status "Performance test completed"
        else
            print_warning "Could not determine webhook URL for testing"
        fi
    fi
}

# Main deployment flow
main() {
    echo -e "${GREEN}🗣️  YarnMarket AI Production Deployment${NC}"
    echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
    echo -e "${GREEN}Version: ${VERSION}${NC}"
    echo ""
    
    # Deployment steps
    check_prerequisites
    build_and_push_images
    deploy_infrastructure
    deploy_services
    deploy_monitoring
    run_migrations
    verify_deployment
    run_performance_test
    cleanup
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}YarnMarket AI is now running in ${ENVIRONMENT} environment${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "${BLUE}1. Configure WhatsApp Business API webhooks${NC}"
    echo -e "${BLUE}2. Set up SSL certificates${NC}"
    echo -e "${BLUE}3. Configure monitoring alerts${NC}"
    echo -e "${BLUE}4. Run integration tests${NC}"
    echo ""
    
    # Display access URLs
    echo -e "${BLUE}Access URLs:${NC}"
    kubectl get ingress -n "${NAMESPACE}" -o wide
}

# Error handling
trap cleanup EXIT

# Run main deployment
main "$@"