#!/bin/bash

# YarnMarket AI - Railway Deployment Script
# This script automates the deployment of all services to Railway

set -e

echo "========================================"
echo "YarnMarket AI - Railway Deployment"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
echo -e "${YELLOW}Checking Railway CLI installation...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${RED}ERROR: Railway CLI not found!${NC}"
    echo -e "${YELLOW}Please install Railway CLI: npm install -g @railway/cli${NC}"
    exit 1
fi
echo -e "${GREEN}Railway CLI found!${NC}"
echo ""

# Set project ID
PROJECT_ID="2e108d5e-72e9-47d8-859a-dedd14a21244"
echo -e "${CYAN}Using Railway Project ID: $PROJECT_ID${NC}"
echo ""

# Link to Railway project
echo -e "${YELLOW}Linking to Railway project...${NC}"
railway link $PROJECT_ID

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}WARNING: .env file not found!${NC}"
    echo -e "${YELLOW}Please create a .env file with all required environment variables.${NC}"
    echo -e "${YELLOW}See .env.example for reference.${NC}"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local service_path=$2
    local description=$3

    echo ""
    echo "========================================"
    echo -e "${CYAN}Deploying: $service_name${NC}"
    echo -e "Path: $service_path"
    echo -e "Description: $description"
    echo "========================================"

    # Check if service path exists
    if [ ! -d "$service_path" ]; then
        echo -e "${RED}ERROR: Service path not found: $service_path${NC}"
        return 1
    fi

    # Deploy using Railway CLI
    cd "$service_path"
    echo -e "${YELLOW}Deploying from: $service_path${NC}"
    railway up -d

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}SUCCESS: $service_name deployed!${NC}"
        cd - > /dev/null
        return 0
    else
        echo -e "${RED}ERROR: Failed to deploy $service_name${NC}"
        cd - > /dev/null
        return 1
    fi
}

# Step 1: Deploy Infrastructure Services (if not already deployed)
echo ""
echo "========================================"
echo -e "${CYAN}STEP 1: Infrastructure Services${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}Please ensure the following services are deployed in your Railway project:${NC}"
echo "  1. PostgreSQL"
echo "  2. MongoDB"
echo "  3. Redis"
echo "  4. RabbitMQ (Docker image: rabbitmq:3-management)"
echo "  5. Weaviate (Docker image: semitechnologies/weaviate:latest)"
echo "  6. ClickHouse (Docker image: clickhouse/clickhouse-server:latest)"
echo ""
echo -e "${YELLOW}You can add these from Railway Dashboard > New Service > Database/Docker Image${NC}"
echo ""
read -p "Have you deployed all infrastructure services? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please deploy infrastructure services first, then run this script again.${NC}"
    exit 1
fi

# Step 2: Deploy Application Services
echo ""
echo "========================================"
echo -e "${CYAN}STEP 2: Application Services${NC}"
echo "========================================"

SUCCESS_COUNT=0
FAIL_COUNT=0

# Array of services
declare -a services=(
    "webhook-handler|services/webhook-handler|WhatsApp webhook handler (Go)"
    "conversation-engine|services/conversation-engine|AI conversation engine (Python FastAPI)"
    "message-worker|services/message-worker|RabbitMQ message worker (Python)"
    "dashboard-api|services/dashboard-api|Admin dashboard API (Python FastAPI)"
    "merchant-api|services/merchant-api|Merchant operations API (NestJS)"
    "rag-system|services/rag-system|RAG vector search system (Python)"
    "analytics-service|services/analytics-service|Analytics service (Python)"
)

for service in "${services[@]}"; do
    IFS='|' read -r name path description <<< "$service"
    if deploy_service "$name" "$path" "$description"; then
        ((SUCCESS_COUNT++))
    else
        ((FAIL_COUNT++))
    fi
    sleep 2
done

# Step 3: Deploy Frontend Applications
echo ""
echo "========================================"
echo -e "${CYAN}STEP 3: Frontend Applications${NC}"
echo "========================================"

declare -a frontend_services=(
    "vendor-dashboard|web/dashboard|Vendor dashboard (Next.js 14)"
    "admin-dashboard|apps/dashboard-nextjs|Admin dashboard (Next.js 15)"
)

for service in "${frontend_services[@]}"; do
    IFS='|' read -r name path description <<< "$service"
    if deploy_service "$name" "$path" "$description"; then
        ((SUCCESS_COUNT++))
    else
        ((FAIL_COUNT++))
    fi
    sleep 2
done

# Summary
echo ""
echo "========================================"
echo -e "${CYAN}Deployment Summary${NC}"
echo "========================================"
echo -e "${GREEN}Successfully deployed: $SUCCESS_COUNT services${NC}"
echo -e "${RED}Failed deployments: $FAIL_COUNT services${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}All services deployed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Set environment variables for each service in Railway Dashboard"
    echo "2. Configure WhatsApp webhook URL (see RAILWAY_SETUP.md)"
    echo "3. Initialize database schema"
    echo "4. Test the deployment"
else
    echo -e "${RED}Some deployments failed. Please check the errors above.${NC}"
fi

echo ""
echo -e "${CYAN}Visit your Railway project: https://railway.app/project/$PROJECT_ID${NC}"
echo ""
