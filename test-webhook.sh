#!/bin/bash

# YarnMarket AI - WhatsApp Webhook Test Script
# Tests the complete webhook flow

echo "======================================"
echo "YarnMarket AI Webhook Test"
echo "======================================"
echo ""

# Configuration
WEBHOOK_URL="https://yarnmarket-ai-webhook-handler-production.up.railway.app"
CONVERSATION_ENGINE_URL="https://yarnmarket-ai-conversation-engine-production.up.railway.app"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Step 1: Testing webhook-handler health..."
HEALTH_RESPONSE=$(curl -s "${WEBHOOK_URL}/health")
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ webhook-handler is healthy${NC}"
    echo "$HEALTH_RESPONSE"
else
    echo -e "${RED}❌ webhook-handler health check failed${NC}"
    echo "$HEALTH_RESPONSE"
    exit 1
fi

echo ""
echo "Step 2: Testing conversation-engine health..."
ENGINE_HEALTH=$(curl -s "${CONVERSATION_ENGINE_URL}/health")
if echo "$ENGINE_HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ conversation-engine is healthy${NC}"
    echo "$ENGINE_HEALTH"
else
    echo -e "${RED}❌ conversation-engine health check failed${NC}"
    echo "$ENGINE_HEALTH"
fi

echo ""
echo "Step 3: Testing webhook endpoint with sample WhatsApp message..."
echo -e "${YELLOW}Sending test message...${NC}"

WEBHOOK_RESPONSE=$(curl -s -X POST "${WEBHOOK_URL}/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15550000000",
            "phone_number_id": "PHONE_NUMBER_ID"
          },
          "contacts": [{
            "profile": {"name": "Test User"},
            "wa_id": "2348012345678"
          }],
          "messages": [{
            "from": "2348012345678",
            "id": "wamid.test_'$(date +%s)'",
            "timestamp": "'$(date +%s)'",
            "type": "text",
            "text": {"body": "Hello, this is a test message"}
          }]
        },
        "field": "messages"
      }]
    }]
  }')

if echo "$WEBHOOK_RESPONSE" | grep -q "received"; then
    echo -e "${GREEN}✅ Webhook accepted the message${NC}"
    echo "Response: $WEBHOOK_RESPONSE"
else
    echo -e "${RED}❌ Webhook rejected the message${NC}"
    echo "Response: $WEBHOOK_RESPONSE"
fi

echo ""
echo "Step 4: Testing direct conversation engine..."
echo -e "${YELLOW}Sending test conversation...${NC}"

CONVERSATION_RESPONSE=$(curl -s -X POST "${CONVERSATION_ENGINE_URL}/conversation/process" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "1",
    "customer_phone": "+2348012345678",
    "message": {
      "id": "test_'$(date +%s)'",
      "from": "+2348012345678",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
      "type": "text",
      "text": "Hello"
    }
  }')

if echo "$CONVERSATION_RESPONSE" | grep -q "text"; then
    echo -e "${GREEN}✅ Conversation engine responded${NC}"
    echo "Response: $CONVERSATION_RESPONSE" | jq '.' 2>/dev/null || echo "$CONVERSATION_RESPONSE"
else
    echo -e "${RED}❌ Conversation engine failed${NC}"
    echo "Response: $CONVERSATION_RESPONSE"
fi

echo ""
echo "======================================"
echo "Test Summary"
echo "======================================"
echo ""
echo "✅ Next Steps:"
echo "1. Check Railway logs for webhook-handler to see if message was queued"
echo "2. Check Railway logs for message-worker to see if message was consumed"
echo "3. Check Railway logs for conversation-engine to see if AI processed it"
echo ""
echo "🔍 To test with real WhatsApp:"
echo "1. Configure webhook in Meta Developer Console:"
echo "   URL: ${WEBHOOK_URL}/webhook"
echo "2. Send a message from your WhatsApp to your business number"
echo "3. Monitor the logs in Railway dashboard"
echo ""
