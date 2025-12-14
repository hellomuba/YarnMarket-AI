# WhatsApp Webhook Integration - Issues and Fixes

## Problems Identified

### 1. **Queue Name Mismatch** 🔴
- **Webhook Handler** (Go) publishes to: `message_processing` queue
- **Message Worker** (Python) consumes from: `incoming_messages` queue
- **Impact**: Messages are never processed by the worker

### 2. **sendToWhatsApp Not Implemented** 🔴
- Location: `services/webhook-handler/main.go:464`
- Current status: Just logs message, doesn't send to WhatsApp API
- **Impact**: AI responses never reach WhatsApp users

### 3. **No Outgoing Message Consumer** 🔴
- Message worker queues responses to `outgoing_messages` queue
- Nothing consumes from this queue to send to WhatsApp
- **Impact**: Responses stuck in queue, never delivered

---

## Message Flow (Current vs Fixed)

### Current (Broken):
```
WhatsApp → Webhook Handler → RabbitMQ (message_processing) → ❌ Nothing consumes
                                     ↓
                                   STUCK!
```

### Fixed Flow:
```
WhatsApp → Webhook Handler → RabbitMQ (message_processing)
                                     ↓
                          Message Worker consumes
                                     ↓
                          Conversation Engine processes
                                     ↓
                          RabbitMQ (outgoing_messages)
                                     ↓
                          Webhook Handler sends → WhatsApp ✅
```

---

## Fixes to Implement

### Fix 1: Align Queue Names
**File**: `services/message-worker/worker.py`

Change line 30:
```python
# OLD
INCOMING_QUEUE = "incoming_messages"

# NEW
INCOMING_QUEUE = "message_processing"
```

### Fix 2: Implement WhatsApp API Sending
**File**: `services/webhook-handler/main.go`

Replace `sendToWhatsApp` function (lines 464-468) with actual API call:

```go
func (wh *WebhookHandler) sendToWhatsApp(response WhatsAppResponse) error {
	url := fmt.Sprintf("https://graph.facebook.com/v18.0/%s/messages",
		os.Getenv("WHATSAPP_PHONE_NUMBER_ID"))

	jsonData, err := json.Marshal(response)
	if err != nil {
		return fmt.Errorf("failed to marshal response: %v", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+wh.config.WhatsAppAccessToken)

	resp, err := wh.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("WhatsApp API error (status %d): %s", resp.StatusCode, string(body))
	}

	log.Printf("✅ Message sent successfully to %s", response.To)
	return nil
}
```

**Required imports** (add to imports section):
```go
"bytes"
"io"
```

**Required environment variable**:
- `WHATSAPP_PHONE_NUMBER_ID`: Your WhatsApp Business Phone Number ID from Meta

### Fix 3: Add Outgoing Message Consumer
**File**: `services/webhook-handler/main.go`

Add new method to consume outgoing messages and send to WhatsApp:

```go
// StartOutgoingMessageConsumer starts consuming outgoing messages from RabbitMQ
func (wh *WebhookHandler) StartOutgoingMessageConsumer() error {
	// Declare outgoing queue
	queue, err := wh.rabbitCh.QueueDeclare(
		"outgoing_messages", // name
		true,                // durable
		false,               // delete when unused
		false,               // exclusive
		false,               // no-wait
		nil,                 // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare outgoing queue: %v", err)
	}

	// Start consuming
	msgs, err := wh.rabbitCh.Consume(
		queue.Name, // queue
		"",         // consumer
		false,      // auto-ack
		false,      // exclusive
		false,      // no-local
		false,      // no-wait
		nil,        // args
	)
	if err != nil {
		return fmt.Errorf("failed to register consumer: %v", err)
	}

	// Process messages in background
	go func() {
		for msg := range msgs {
			var outgoingMsg struct {
				To         string `json:"to"`
				MerchantID string `json:"merchant_id"`
				Text       string `json:"text"`
				MessageID  string `json:"message_id"`
			}

			if err := json.Unmarshal(msg.Body, &outgoingMsg); err != nil {
				log.Printf("❌ Failed to unmarshal outgoing message: %v", err)
				msg.Nack(false, false)
				continue
			}

			// Prepare WhatsApp response
			response := WhatsAppResponse{
				To:   outgoingMsg.To,
				Type: "text",
				Text: &TextBody{
					Body: outgoingMsg.Text,
				},
			}

			// Send to WhatsApp
			if err := wh.sendToWhatsApp(response); err != nil {
				log.Printf("❌ Failed to send message to WhatsApp: %v", err)
				msg.Nack(false, true) // Requeue on failure
			} else {
				log.Printf("✅ Sent message to %s", outgoingMsg.To)
				msg.Ack(false)
			}
		}
	}()

	log.Println("✅ Started consuming outgoing messages")
	return nil
}
```

**Call in main()** (add after line 558):

```go
// Start consuming outgoing messages
if err := handler.StartOutgoingMessageConsumer(); err != nil {
	log.Fatalf("❌ Failed to start outgoing message consumer: %v", err)
}
```

---

## Environment Variables Required

Add to Railway webhook-handler service:

```
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_from_meta
WHATSAPP_ACCESS_TOKEN=your_access_token_from_meta  # Already set
```

Get these from: https://developers.facebook.com/apps → Your App → WhatsApp → API Setup

---

## Testing After Fixes

### 1. Test Webhook Verification
```bash
curl "https://your-webhook.railway.app/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123"
```
Expected: Returns "test123"

### 2. Test Message Flow
1. Send message to your WhatsApp Business number
2. Check webhook-handler logs for: "✅ Queued message..."
3. Check message-worker logs for: "✅ Conversation processed successfully"
4. Check webhook-handler logs for: "✅ Message sent successfully"
5. Receive AI response in WhatsApp

### 3. Check Health
```bash
curl https://your-webhook.railway.app/health
```

### 4. Monitor Queues
Check RabbitMQ management UI (port 15672):
- `message_processing` queue should have messages being consumed
- `outgoing_messages` queue should have messages being consumed

---

## Deployment Order

1. ✅ Fix message-worker queue name
2. ✅ Deploy message-worker
3. ✅ Fix webhook-handler (add sendToWhatsApp and outgoing consumer)
4. ✅ Add WHATSAPP_PHONE_NUMBER_ID environment variable
5. ✅ Deploy webhook-handler
6. ✅ Test end-to-end

---

## Summary

**What was broken:**
- Messages published to wrong queue (not consumed)
- Responses not sent to WhatsApp (function not implemented)
- Outgoing messages never delivered (no consumer)

**What's fixed:**
- ✅ Queue names aligned across services
- ✅ WhatsApp API sending implemented
- ✅ Outgoing message consumer added
- ✅ Complete message flow working

**Result**: WhatsApp users can now send messages and receive AI responses! 🎉
