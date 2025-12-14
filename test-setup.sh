#!/bin/bash

# YarnMarket AI - Complete Docker Test Setup
# This script sets up and tests all components

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🗣️  YarnMarket AI - Docker Test Setup${NC}"
echo -e "${BLUE}=====================================${NC}"

# Step 1: Setup environment
echo -e "\n${BLUE}📝 Step 1: Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.test .env
    echo -e "${GREEN}✅ Created .env from test template${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists, using existing file${NC}"
fi

# Step 2: Start all services
echo -e "\n${BLUE}🚀 Step 2: Starting all Docker services...${NC}"
echo -e "${BLUE}This will start:${NC}"
echo -e "${BLUE}- PostgreSQL (Database)${NC}"
echo -e "${BLUE}- Redis (Cache)${NC}" 
echo -e "${BLUE}- MongoDB (Conversations)${NC}"
echo -e "${BLUE}- ClickHouse (Analytics)${NC}"
echo -e "${BLUE}- RabbitMQ (Message Queue)${NC}"
echo -e "${BLUE}- Webhook Handler (Go)${NC}"
echo -e "${BLUE}- Conversation Engine (Python)${NC}"
echo -e "${BLUE}- Merchant API (Node.js)${NC}"
echo -e "${BLUE}- Analytics Service (Python)${NC}"
echo -e "${BLUE}- Prometheus (Monitoring)${NC}"
echo -e "${BLUE}- Grafana (Dashboards)${NC}"

docker-compose up -d

# Step 3: Wait for services to be ready
echo -e "\n${BLUE}⏳ Step 3: Waiting for services to start...${NC}"
sleep 30

# Step 4: Health checks
echo -e "\n${BLUE}🏥 Step 4: Running health checks...${NC}"

services=(
    "webhook-handler:8080"
    "conversation-engine:8001" 
    "merchant-api:3001"
    "analytics-service:8002"
)

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    echo -n "Checking $name... "
    
    if curl -sf "http://localhost:$port/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
        echo -e "${YELLOW}💡 Try: docker-compose logs $name${NC}"
    fi
done

# Step 5: Check databases
echo -e "\n${BLUE}🗄️  Step 5: Checking databases...${NC}"

echo -n "PostgreSQL... "
if docker-compose exec -T postgres pg_isready -U yarnmarket > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ready${NC}"
else
    echo -e "${RED}❌ Not ready${NC}"
fi

echo -n "Redis... "
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    echo -e "${GREEN}✅ Ready${NC}"
else
    echo -e "${RED}❌ Not ready${NC}"
fi

echo -n "MongoDB... "
if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping').ok" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ready${NC}"
else
    echo -e "${RED}❌ Not ready${NC}"
fi

# Step 6: Test WhatsApp webhook
echo -e "\n${BLUE}📱 Step 6: Testing WhatsApp webhook...${NC}"

webhook_verify=$(curl -s "http://localhost:8080/webhook?hub.mode=subscribe&hub.verify_token=test_verify_token_12345&hub.challenge=test_challenge")

if [ "$webhook_verify" = "test_challenge" ]; then
    echo -e "${GREEN}✅ Webhook verification working${NC}"
else
    echo -e "${RED}❌ Webhook verification failed${NC}"
fi

# Step 7: Test conversation processing
echo -e "\n${BLUE}🤖 Step 7: Testing AI conversation...${NC}"

conversation_test=$(curl -s -X POST "http://localhost:8001/conversation/process" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "id": "test_msg_001",
      "from": "+2348012345678",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
      "type": "text",
      "text": "Good morning! How much is this shirt?"
    },
    "merchant_id": "test_merchant",
    "customer_phone": "+2348012345678",
    "conversation_history": []
  }' 2>/dev/null)

if echo "$conversation_test" | grep -q "text"; then
    echo -e "${GREEN}✅ AI conversation working${NC}"
    echo -e "${BLUE}Sample response: $(echo "$conversation_test" | jq -r '.text' 2>/dev/null | head -c 50)...${NC}"
else
    echo -e "${RED}❌ AI conversation failed${NC}"
fi

# Step 8: Show access URLs
echo -e "\n${BLUE}🌐 Step 8: Access URLs${NC}"
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}🔗 Webhook Handler:      http://localhost:8080/health${NC}"
echo -e "${GREEN}🤖 Conversation Engine:  http://localhost:8001/health${NC}" 
echo -e "${GREEN}📱 Merchant API:         http://localhost:3001/health${NC}"
echo -e "${GREEN}📊 Analytics Service:    http://localhost:8002/health${NC}"
echo -e "${GREEN}📈 Grafana Dashboard:    http://localhost:3000 (admin/grafana_admin_2024)${NC}"
echo -e "${GREEN}🐰 RabbitMQ Management:  http://localhost:15672 (yarnmarket/rabbit_test_2024)${NC}"
echo -e "${GREEN}📊 Prometheus:           http://localhost:9090${NC}"

# Step 9: Show useful commands
echo -e "\n${BLUE}🛠️  Step 9: Useful Commands${NC}"
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}📋 View all services:     docker-compose ps${NC}"
echo -e "${GREEN}📜 View logs:            docker-compose logs -f [service-name]${NC}"
echo -e "${GREEN}🛑 Stop all services:    docker-compose down${NC}"
echo -e "${GREEN}🧹 Clean up everything:  docker-compose down -v --remove-orphans${NC}"
echo -e "${GREEN}🔄 Restart a service:    docker-compose restart [service-name]${NC}"

# Step 10: Test conversation example
echo -e "\n${BLUE}💬 Step 10: Sample Conversation Test${NC}"
echo -e "${GREEN}====================================${NC}"
cat << 'EOF'
# Test a Nigerian Pidgin conversation:
curl -X POST "http://localhost:8001/conversation/process" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "id": "msg_001",
      "from": "+2348012345678", 
      "timestamp": "2024-01-01T10:00:00Z",
      "type": "text",
      "text": "Abeg, how much be this shoe? I wan buy am but the price too high o!"
    },
    "merchant_id": "test_merchant",
    "customer_phone": "+2348012345678"
  }'

# Test English conversation:
curl -X POST "http://localhost:8001/conversation/process" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "id": "msg_002",
      "from": "+2348087654321",
      "timestamp": "2024-01-01T10:05:00Z", 
      "type": "text",
      "text": "Good afternoon! Do you have this shirt in blue color?"
    },
    "merchant_id": "test_merchant",
    "customer_phone": "+2348087654321"
  }'
EOF

echo -e "\n${GREEN}🎉 YarnMarket AI Docker setup complete!${NC}"
echo -e "${GREEN}All services are running and ready for testing.${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo -e "${BLUE}1. Visit Grafana dashboard: http://localhost:3000${NC}"
echo -e "${BLUE}2. Test the sample conversations above${NC}"
echo -e "${BLUE}3. Check the logs: docker-compose logs -f conversation-engine${NC}"
echo -e "${BLUE}4. Try the mobile app development setup${NC}"