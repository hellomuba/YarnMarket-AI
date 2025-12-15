# Merchant Setup Guide for WhatsApp Integration

## Problem
You're getting this error:
```
❌ No merchant found for phone 16505551111
```

This means the WhatsApp Business phone number is not configured in your database.

---

## Solution: Add Your Merchant to Database

### Step 1: Get Your WhatsApp Business Details

Go to Meta Developer Console → Your App → WhatsApp → API Setup

You need these values:
- **Phone Number ID**: Found in API Setup (e.g., `123456789`)
- **WhatsApp Business Account ID (WABA ID)**: Found in API Setup
- **Display Phone Number**: The phone number shown to customers (e.g., `+1 650-555-1111` or `16505551111`)

### Step 2: Option A - Use Admin Dashboard (Recommended)

1. Go to: `https://admin-dashboard-yarnmarket.railway.app/merchants`
2. Click **"Add Merchant"** or edit existing merchant
3. Fill in:
   - **Business Name**: Your store name
   - **Phone Number**: `16505551111` (or your actual WhatsApp number - no + or spaces)
   - **Phone Number ID**: `123456123` (from Meta Console)
   - **Status**: `active`
   - **Business Type**: `general` or your type
4. Click **Save**

### Step 3: Option B - Direct Database Update (Advanced)

#### Get Your Environment Variables First

You need your actual values from Meta Console:
```bash
# From Meta Developer Console → WhatsApp → Configuration
WHATSAPP_PHONE_NUMBER_ID=your_actual_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id
DISPLAY_PHONE_NUMBER=your_display_number
```

#### Run SQL Script

Connect to your Railway PostgreSQL database and run:

```sql
-- Add required columns if they don't exist
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS phone_number_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id VARCHAR(100);

-- Insert your merchant
-- IMPORTANT: Replace values with YOUR actual WhatsApp details
INSERT INTO merchants (
    business_name,
    phone_number,              -- Display phone from Meta (no + or -)
    phone_number_id,           -- Phone Number ID from Meta Console
    whatsapp_business_account_id,  -- WABA ID from Meta Console
    business_type,
    status,
    contact_phone,
    email
) VALUES (
    'Your Store Name',
    '16505551111',            -- ← Replace with YOUR display phone number
    'YOUR_PHONE_NUMBER_ID',   -- ← Replace with YOUR phone_number_id
    'YOUR_WABA_ID',           -- ← Replace with YOUR WABA ID
    'general',
    'active',
    '16505551111',
    'your-email@example.com'
)
ON CONFLICT (phone_number)
DO UPDATE SET
    phone_number_id = EXCLUDED.phone_number_id,
    whatsapp_business_account_id = EXCLUDED.whatsapp_business_account_id,
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- Verify it was added
SELECT id, business_name, phone_number, phone_number_id, status
FROM merchants
WHERE phone_number = '16505551111';  -- ← Replace with YOUR phone
```

---

## Important Notes

### Phone Number Format
The `phone_number` in the database must match EXACTLY what Meta sends in the webhook:

**Meta sends**:
```json
"metadata": {
  "display_phone_number": "16505551111",
  "phone_number_id": "123456123"
}
```

**Your database must have**:
- `phone_number` = `16505551111` (exact match, no + or spaces)
- `phone_number_id` = `123456123` (from Meta Console)
- `status` = `active`

### Required Columns

The webhook handler looks for merchants with:
```sql
WHERE phone_number = '16505551111'
  AND status = 'active'
  AND phone_number_id IS NOT NULL
```

So you MUST have:
1. ✅ `phone_number` column - matches Meta's display_phone_number
2. ✅ `phone_number_id` column - from Meta Console
3. ✅ `status` column - must be 'active'

---

## Testing After Setup

### 1. Verify Merchant in Database

```sql
SELECT
    id,
    business_name,
    phone_number,
    phone_number_id,
    status,
    created_at
FROM merchants
WHERE status = 'active'
  AND phone_number_id IS NOT NULL;
```

Should return at least one row with your merchant.

### 2. Send Test Message from Meta

1. Go to Meta Developer Console → WhatsApp → API Setup
2. Use the test tool to send a message
3. Check webhook-handler logs:

**Before (Error)**:
```
🔍 Looking up merchant for phone: 16505551111
❌ No merchant found for phone 16505551111
```

**After (Success)**:
```
🔍 Looking up merchant for phone: 16505551111
✅ Found merchant ID: 1 for phone 16505551111
📨 Queuing message to RabbitMQ
✅ Message published to queue: message_processing
```

### 3. Full Flow Test

Send "Hello" from WhatsApp and watch logs:

**webhook-handler**:
```
✅ Found merchant ID: 1
✅ Message published to queue
```

**message-worker**:
```
📥 Received message from queue
Calling conversation engine...
✅ Response received from conversation engine
✅ WhatsApp message sent successfully
```

**conversation-engine**:
```
Processing message from +234...
Calling primary LLM: kimi-k2 (attempt 1)
✅ Primary LLM (kimi-k2) responded successfully
```

---

## Using Your Own WhatsApp Number (Production)

When ready to use your own WhatsApp Business number:

1. **Get verified WhatsApp Business number** from Meta
2. **Update merchant in database**:
   ```sql
   UPDATE merchants
   SET
       phone_number = 'YOUR_REAL_NUMBER',
       phone_number_id = 'YOUR_REAL_PHONE_NUMBER_ID',
       whatsapp_business_account_id = 'YOUR_REAL_WABA_ID'
   WHERE id = 1;
   ```
3. **Update environment variables** in Railway:
   ```bash
   WHATSAPP_PHONE_NUMBER_ID=your_real_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_real_access_token
   ```
4. **Reconfigure webhook** in Meta Console with your real number

---

## Quick Reference: Where to Find IDs

### Phone Number ID
1. Meta Developer Console
2. Your App → WhatsApp → API Setup
3. Look for **"Phone number ID"** field
4. Example: `123456789012345`

### WABA ID (WhatsApp Business Account ID)
1. Meta Developer Console
2. Your App → WhatsApp → Getting Started
3. Look for **"WhatsApp Business Account ID"**
4. Example: `123456789012345`

### Display Phone Number
1. Meta Developer Console
2. Your App → WhatsApp → API Setup
3. The phone number shown to customers
4. Format in webhook: `16505551111` (no + or -)
5. **This is what goes in `merchants.phone_number`**

---

## Troubleshooting

### Still Getting "No merchant found"?

**Check 1**: Phone number format
```sql
-- What's in database?
SELECT phone_number FROM merchants WHERE status = 'active';

-- What's Meta sending?
-- Check webhook-handler logs for: "Looking up merchant for phone: XXXXXX"
```

**Check 2**: Status is active
```sql
SELECT status FROM merchants WHERE phone_number = '16505551111';
-- Must return: 'active'
```

**Check 3**: phone_number_id is set
```sql
SELECT phone_number_id FROM merchants WHERE phone_number = '16505551111';
-- Must NOT be NULL
```

### Merchant exists but still not working?

Clear Redis cache:
```bash
# In Railway, go to Redis service
# Or run locally:
redis-cli FLUSHDB
```

Then try sending message again.

---

## Summary

**Quick Fix**:
1. Go to admin dashboard
2. Add/edit merchant with WhatsApp number `16505551111`
3. Set `phone_number_id` to `123456123` (or your actual ID)
4. Set status to `active`
5. Save
6. Send test message from Meta

**Expected Result**:
✅ Webhook finds merchant
✅ Message queued to RabbitMQ
✅ AI processes and responds
✅ You receive reply on WhatsApp

Done! 🚀
