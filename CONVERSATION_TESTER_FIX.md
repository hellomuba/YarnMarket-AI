# Conversation Tester "No Response" Fix

## Issue
Conversation tester sends messages successfully but displays "No response" from the AI.

## Root Cause
The frontend was looking for `result.data.response` or `result.data.message`, but the conversation engine API returns `result.data.text` (per the `ConversationResponse` model).

## Fix Applied

### File: `apps/conversation-tester/app/page.tsx`

**Changed line 104**:
```typescript
// Before
content: result.data.response || result.data.message || 'No response',

// After
content: result.data.text || result.data.response || result.data.message || 'No response',
```

**Added debugging logs** (lines 91-97, 115-117):
```typescript
console.log('Sending payload:', JSON.stringify(payload, null, 2))
console.log('API Response:', JSON.stringify(result.data, null, 2))
console.error('Full error object:', err)
console.error('Error response:', err.response?.data)
console.error('Error status:', err.response?.status)
```

## How to Debug

### Step 1: Check Browser Console
Open the conversation tester and open browser Developer Tools (F12), then send a message. Look for:

```
Sending payload: {
  "merchant_id": "3",
  "customer_phone": "+2348012345678",
  "message": {
    "id": "test_...",
    "from": "+2348012345678",
    "timestamp": "2025-12-14T...",
    "type": "text",
    "text": "I want to buy fabric"
  },
  "conversation_history": []
}

API Response: {
  "text": "Good evening! Welcome to Textile Store Kano...",
  "language": "english",
  "message_type": "text",
  "confidence": 0.85,
  "intent_type": "product_inquiry",
  ...
}
```

### Step 2: Check Conversation Engine URL
In the tester, click "Settings" and verify the Engine URL is set correctly:
- Local: `http://localhost:8003`
- Railway: `https://yarnmarket-ai-conversation-engine-production.up.railway.app`

### Step 3: Test Conversation Engine Health
```bash
# Local
curl http://localhost:8003/health

# Railway
curl https://yarnmarket-ai-conversation-engine-production.up.railway.app/health

# Expected response:
{
  "status": "healthy",
  "service": "conversation-engine",
  "version": "1.0.0"
}
```

### Step 4: Check Conversation Engine Logs
Look for errors in the conversation engine logs:

```bash
# Railway
railway logs -s conversation-engine

# Look for:
# ✅ Conversation Engine initialized successfully
# Processing message from +2348012345678
# Calling primary LLM: kimi-k2 (attempt 1)
# ✅ Primary LLM (kimi-k2) responded successfully
```

## Possible Issues

### Issue 1: Conversation Engine Not Initialized
**Symptom**: 500 error with "Conversation engine not initialized"

**Check logs for**:
```
❌ Failed to initialize [component]
```

**Solution**: Check that all environment variables are set:
- `MOONSHOT_API_KEY` or `OPENAI_API_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `MONGODB_URL`

### Issue 2: LLM API Failure
**Symptom**: Timeout or "LLM API error"

**Check logs for**:
```
Primary LLM attempt 1 failed: [error]
Primary LLM attempt 2 failed: [error]
Primary LLM attempt 3 failed: [error]
Fallback LLM also failed: [error]
```

**Solution**:
1. Verify `MOONSHOT_API_KEY` is valid
2. Check `MOONSHOT_API_BASE=https://api.moonshot.cn/v1`
3. Verify `OPENAI_API_KEY` is set for fallback

### Issue 3: Database Connection Error
**Symptom**: 500 error with database error in logs

**Check logs for**:
```
Failed to connect to database
```

**Solution**: Verify database connection strings:
- `DATABASE_URL` (PostgreSQL)
- `MONGODB_URL`
- `REDIS_URL`

### Issue 4: Missing Merchant Data
**Symptom**: Error about merchant not found

**Check if merchants exist**:
```sql
SELECT id, business_name, status FROM merchants WHERE id IN ('1', '2', '3');
```

**Solution**: Ensure test merchants exist in database

## Testing After Fix

1. **Deploy updated code** to Railway
2. **Open conversation tester**
3. **Open browser console** (F12)
4. **Send test message**: "Hello"
5. **Check console logs**:
   - Should see "Sending payload"
   - Should see "API Response" with `text` field
   - AI response should display in chat
6. **Check conversation engine logs**:
   - Should see "Processing message from..."
   - Should see "Primary LLM (kimi-k2) responded successfully"

## Expected Flow

```
User sends message
   ↓
Frontend creates payload with merchant_id, customer_phone, message
   ↓
POST /conversation/process
   ↓
Conversation Engine processes:
   ├── Get merchant settings (database)
   ├── Get customer profile (database)
   ├── Detect language
   ├── Classify intent
   ├── Call LLM (Kimi K2 → fallback to GPT)
   └── Generate response
   ↓
Return ConversationResponse with "text" field
   ↓
Frontend displays in chat
```

## Quick Test Command

```bash
# Test the API directly
curl -X POST https://your-engine.railway.app/conversation/process \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "1",
    "customer_phone": "+2348012345678",
    "message": {
      "id": "test_123",
      "from": "+2348012345678",
      "timestamp": "2025-12-14T22:00:00Z",
      "type": "text",
      "text": "Hello"
    },
    "conversation_history": []
  }'
```

Expected response:
```json
{
  "text": "Good evening! Welcome...",
  "language": "english",
  "message_type": "text",
  "confidence": 0.9,
  "intent_type": "greeting",
  "requires_human": false,
  "mentioned_products": [],
  "price_mentioned": null,
  "negotiation_stage": null,
  "quick_replies": [],
  "buttons": [],
  "image_url": null,
  "audio_url": null,
  "response_id": "resp_...",
  "generated_at": "2025-12-14T22:00:01.234567"
}
```

## Summary

The fix changes the conversation tester to correctly read the `text` field from the API response instead of looking for non-existent `response` or `message` fields.

**Files modified**:
- `apps/conversation-tester/app/page.tsx` (lines 104, 91-97, 115-117)

**Next steps**:
1. Deploy to Railway
2. Test with browser console open
3. Check conversation engine logs
4. Verify Kimi API is responding
