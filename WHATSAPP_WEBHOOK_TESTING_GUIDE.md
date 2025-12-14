# WhatsApp Webhook Testing Guide

## Overview
This guide helps you test the complete WhatsApp message flow from webhook to AI response.

## Architecture Flow
```
WhatsApp Message
    ↓
webhook-handler (Go) - Receives webhook, validates, queues to RabbitMQ
    ↓
RabbitMQ - Message queue (message_processing)
    ↓
message-worker (Python) - Consumes queue, calls conversation-engine
    ↓
conversation-engine (Python) - AI processing with Kimi K2
    ↓
message-worker - Receives response, sends back to WhatsApp
    ↓
WhatsApp - User receives AI reply
```

---

## Step 1: Verify Environment Variables

### webhook-handler Service (Railway)
Required environment variables:
```bash
PORT=8082
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
RABBITMQ_URL=amqp://...
WHATSAPP_VERIFY_TOKEN=your_verify_token_here
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
CONVERSATION_API_URL=https://your-conversation-engine.railway.app
```

### message-worker Service (Railway)
Required environment variables:
```bash
RABBITMQ_URL=amqp://...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
MONGODB_URL=mongodb://...
CONVERSATION_ENGINE_URL=https://your-conversation-engine.railway.app
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

### conversation-engine Service (Railway)
Required environment variables (including Kimi):
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
MONGODB_URL=mongodb://...
WEAVIATE_HOST=...
WEAVIATE_PORT=...
OPENAI_API_KEY=your_openai_key
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token

# Kimi AI Configuration
MOONSHOT_API_KEY=sk-bBEFpDBHpQcJm28anujWSOUI3QhUKZx7Ua7TOwuu0uTmlqRD
PRIMARY_LLM=kimi-k2
FALLBACK_LLM=gpt-4o-mini
KIMI_MODEL=moonshot-v1-128k
GPT_MODEL=gpt-4o-mini
MOONSHOT_API_BASE=https://api.moonshot.cn/v1
ENABLE_LLM_FALLBACK=true
LLM_MAX_RETRIES=3
LLM_REQUEST_TIMEOUT=30.0
```

---

## Step 2: Check Service Health

### Test webhook-handler Health
```bash
curl https://your-webhook-handler.railway.app/health

# Expected response:
{
  "status": "healthy",
  "service": "webhook-handler",
  "timestamp": "2025-12-14T23:22:39Z"
}
```

### Test conversation-engine Health
```bash
curl https://your-conversation-engine.railway.app/health

# Expected response:
{
  "status": "healthy",
  "service": "conversation-engine",
  "version": "1.0.0"
}
```

---

## Step 3: Verify RabbitMQ Queue Setup

Check Railway logs for **webhook-handler**:
```
✅ Database connection established
✅ RabbitMQ queue declared: message_processing
Starting webhook handler on :8082
```

Check Railway logs for **message-worker**:
```
Connected to RabbitMQ
Consuming from queue: message_processing
Waiting for messages...
```

---

## Step 4: Configure WhatsApp Business API

### 4.1 Set Up Webhook URL in Meta Developer Console

1. Go to https://developers.facebook.com/apps
2. Select your app → WhatsApp → Configuration
3. Set Webhook URL: `https://your-webhook-handler.railway.app/webhook`
4. Set Verify Token: (same as `WHATSAPP_VERIFY_TOKEN` env var)
5. Click "Verify and Save"

### 4.2 Subscribe to Webhook Fields
Check these fields in Meta Developer Console:
- ✅ messages
- ✅ message_status (optional)

---

## Step 5: Test Webhook Verification

Meta will send a GET request to verify your webhook:
```
GET /webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE_STRING
```

**Check webhook-handler logs** for:
```
Webhook verification: mode=subscribe, token=YOUR_TOKEN
✅ Webhook verification successful
```

If you see `❌ Webhook verification failed`, your verify token doesn't match.

---

## Step 6: Send Test Message from WhatsApp

### Option A: Use Your Phone
1. Save your WhatsApp Business number in your contacts
2. Send a message: "Hello"

### Option B: Use Meta Test Number
1. Go to Meta Developer Console → WhatsApp → API Setup
2. Use the "Send and receive messages" test tool
3. Send a test message

---

## Step 7: Monitor the Message Flow

### 7.1 webhook-handler Logs (First)
Look for:
```
📨 Received message from +234XXXXXXXXXX
Message queued to RabbitMQ: message_id_here
✅ Message published to queue: message_processing
```

### 7.2 message-worker Logs (Second)
Look for:
```
📥 Received message from queue
Processing message from +234XXXXXXXXXX
Calling conversation engine: POST /conversation/process
```

### 7.3 conversation-engine Logs (Third)
Look for:
```
Processing message from +234XXXXXXXXXX
Detecting language...
Calling primary LLM: kimi-k2 (attempt 1)
✅ Primary LLM (kimi-k2) responded successfully
Returning response: "Good evening! Welcome..."
```

### 7.4 message-worker Logs (Fourth - Response)
Look for:
```
✅ Received response from conversation engine
Sending WhatsApp message to +234XXXXXXXXXX
✅ WhatsApp message sent successfully
Message ID: wamid.xxx
```

### 7.5 WhatsApp (Final)
Your phone should receive the AI reply!

---

## Step 8: Troubleshooting

### Issue 1: "Webhook verification failed"
**Symptom**: Meta can't verify webhook
**Fix**:
- Check `WHATSAPP_VERIFY_TOKEN` matches in both Railway and Meta Console
- Ensure webhook-handler is deployed and accessible

### Issue 2: "Message received but no response"
**Symptom**: Message reaches webhook but no AI reply

**Debug Steps**:
1. Check webhook-handler logs for "Message published to queue"
2. Check message-worker logs for "Received message from queue"
3. Check conversation-engine logs for "Processing message"

**Common Causes**:
- RabbitMQ connection issue → Check `RABBITMQ_URL`
- message-worker not running → Check Railway service status
- conversation-engine error → Check logs for errors

### Issue 3: "RabbitMQ connection failed"
**Symptom**: Logs show "failed to connect to RabbitMQ"

**Fix**:
- Verify RabbitMQ is running (check Railway/docker-compose)
- Check `RABBITMQ_URL` format: `amqp://user:pass@host:5672/`
- Ensure both webhook-handler and message-worker use same URL

### Issue 4: "WhatsApp API error"
**Symptom**: Logs show "Failed to send WhatsApp message"

**Fix**:
- Verify `WHATSAPP_ACCESS_TOKEN` is valid
- Check `WHATSAPP_PHONE_NUMBER_ID` is correct
- Ensure token has `whatsapp_business_messaging` permission

### Issue 5: "Kimi not being used"
**Symptom**: Logs show "Calling primary LLM: gpt-4o-mini" instead of kimi-k2

**Fix**:
- Add Kimi env vars to conversation-engine (see Step 1)
- Check logs for "PRIMARY_LLM=kimi-k2"
- Redeploy conversation-engine after adding vars

---

## Step 9: Test with cURL (Manual Testing)

### Test Direct Webhook Handler
```bash
curl -X POST https://your-webhook-handler.railway.app/webhook \
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
            "wa_id": "15551234567"
          }],
          "messages": [{
            "from": "15551234567",
            "id": "wamid.test123",
            "timestamp": "1702598400",
            "type": "text",
            "text": {"body": "Hello"}
          }]
        },
        "field": "messages"
      }]
    }]
  }'

# Expected response:
{"status": "received"}
```

### Test Direct Conversation Engine
```bash
curl -X POST https://your-conversation-engine.railway.app/conversation/process \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "1",
    "customer_phone": "+2348012345678",
    "message": {
      "id": "test123",
      "from": "+2348012345678",
      "timestamp": "2025-12-14T23:00:00Z",
      "type": "text",
      "text": "Hello"
    }
  }'

# Expected response:
{
  "text": "Good evening! Welcome to our store...",
  "language": "english",
  "intent": "greeting",
  "merchant_id": "1"
}
```

---

## Step 10: Success Indicators

### ✅ Everything Working
When you send "Hello" from WhatsApp, you should see:

1. **webhook-handler logs**: Message received and queued
2. **message-worker logs**: Message consumed and sent to engine
3. **conversation-engine logs**: "Primary LLM (kimi-k2) responded"
4. **message-worker logs**: Response sent to WhatsApp
5. **Your phone**: Receives AI reply in < 3 seconds

### ✅ Kimi Integration Working
```
Calling primary LLM: kimi-k2 (attempt 1)
✅ Primary LLM (kimi-k2) responded successfully
```

### ✅ Fallback Working (if Kimi fails)
```
Primary LLM attempt 1 failed: ...
Primary LLM attempt 2 failed: ...
Primary LLM attempt 3 failed: ...
Trying fallback LLM: gpt-4o-mini
✅ Fallback LLM (gpt-4o-mini) responded successfully
```

---

## Quick Checklist

Before sending test message, verify:
- [ ] webhook-handler deployed and healthy
- [ ] message-worker deployed and running
- [ ] conversation-engine deployed with Kimi env vars
- [ ] RabbitMQ accessible to both webhook-handler and message-worker
- [ ] WhatsApp webhook configured in Meta Console
- [ ] Webhook verified successfully (green checkmark in Meta Console)
- [ ] All access tokens are valid and not expired

---

## Common Test Scenarios

### Test 1: Simple Greeting
**Send**: "Hello"
**Expected**: AI greeting in detected language (English/Pidgin/etc.)

### Test 2: Product Search
**Send**: "I need a red dress"
**Expected**: AI searches products and shows matches

### Test 3: Language Detection
**Send**: "Wetin dey happen?" (Pidgin)
**Expected**: AI responds in Nigerian Pidgin

### Test 4: Image Upload
**Send**: Photo of a product
**Expected**: AI analyzes image and suggests similar products

---

## Monitoring Dashboard

Check these URLs for real-time metrics:
- Prometheus: http://localhost:9092 (if running locally)
- Grafana: http://localhost:3004 (if running locally)
- RabbitMQ Management: Railway dashboard or local http://localhost:15673

---

## Need Help?

If messages aren't flowing:
1. Check all 3 service logs in Railway (webhook-handler, message-worker, conversation-engine)
2. Verify all environment variables are set
3. Test each service's health endpoint
4. Try the cURL tests above to isolate the issue

**The most common issue**: Missing or incorrect environment variables. Double-check every service has all required vars!
