# YarnMarket AI - WhatsApp Webhook Test Script (PowerShell)
# Tests the complete webhook flow

Write-Host "======================================"  -ForegroundColor Cyan
Write-Host "YarnMarket AI Webhook Test"  -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$WEBHOOK_URL = "https://yarnmarket-ai-webhook-handler-production.up.railway.app"
$CONVERSATION_ENGINE_URL = "https://yarnmarket-ai-conversation-engine-production.up.railway.app"

# Test 1: webhook-handler health
Write-Host "Step 1: Testing webhook-handler health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$WEBHOOK_URL/health" -Method Get
    Write-Host "✅ webhook-handler is healthy" -ForegroundColor Green
    Write-Host ($healthResponse | ConvertTo-Json)
} catch {
    Write-Host "❌ webhook-handler health check failed" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""

# Test 2: conversation-engine health
Write-Host "Step 2: Testing conversation-engine health..." -ForegroundColor Yellow
try {
    $engineHealth = Invoke-RestMethod -Uri "$CONVERSATION_ENGINE_URL/health" -Method Get
    Write-Host "✅ conversation-engine is healthy" -ForegroundColor Green
    Write-Host ($engineHealth | ConvertTo-Json)
} catch {
    Write-Host "❌ conversation-engine health check failed" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""

# Test 3: Send test webhook
Write-Host "Step 3: Testing webhook endpoint with sample WhatsApp message..." -ForegroundColor Yellow
Write-Host "Sending test message..." -ForegroundColor DarkYellow

$timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$webhookPayload = @{
    object = "whatsapp_business_account"
    entry = @(
        @{
            id = "WHATSAPP_BUSINESS_ACCOUNT_ID"
            changes = @(
                @{
                    value = @{
                        messaging_product = "whatsapp"
                        metadata = @{
                            display_phone_number = "15550000000"
                            phone_number_id = "PHONE_NUMBER_ID"
                        }
                        contacts = @(
                            @{
                                profile = @{
                                    name = "Test User"
                                }
                                wa_id = "2348012345678"
                            }
                        )
                        messages = @(
                            @{
                                from = "2348012345678"
                                id = "wamid.test_$timestamp"
                                timestamp = "$timestamp"
                                type = "text"
                                text = @{
                                    body = "Hello, this is a test message"
                                }
                            }
                        )
                    }
                    field = "messages"
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $webhookResponse = Invoke-RestMethod -Uri "$WEBHOOK_URL/webhook" -Method Post -Body $webhookPayload -ContentType "application/json"
    Write-Host "✅ Webhook accepted the message" -ForegroundColor Green
    Write-Host "Response: $($webhookResponse | ConvertTo-Json)"
} catch {
    Write-Host "❌ Webhook rejected the message" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""

# Test 4: Direct conversation engine test
Write-Host "Step 4: Testing direct conversation engine..." -ForegroundColor Yellow
Write-Host "Sending test conversation..." -ForegroundColor DarkYellow

$conversationPayload = @{
    merchant_id = "1"
    customer_phone = "+2348012345678"
    message = @{
        id = "test_$timestamp"
        from = "+2348012345678"
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        type = "text"
        text = "Hello"
    }
} | ConvertTo-Json -Depth 10

try {
    $conversationResponse = Invoke-RestMethod -Uri "$CONVERSATION_ENGINE_URL/conversation/process" -Method Post -Body $conversationPayload -ContentType "application/json"
    Write-Host "✅ Conversation engine responded" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    Write-Host ($conversationResponse | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Conversation engine failed" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Check Railway logs for webhook-handler to see if message was queued"
Write-Host "2. Check Railway logs for message-worker to see if message was consumed"
Write-Host "3. Check Railway logs for conversation-engine to see if AI processed it"
Write-Host ""
Write-Host "To test with real WhatsApp:" -ForegroundColor Yellow
Write-Host "1. Configure webhook in Meta Developer Console:"
Write-Host "   URL: $WEBHOOK_URL/webhook"
Write-Host "2. Send a message from your WhatsApp to your business number"
Write-Host "3. Monitor the logs in Railway dashboard"
Write-Host ""
