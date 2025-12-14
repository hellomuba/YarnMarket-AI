# YarnMarket AI Conversation Tester

A standalone web UI for testing the YarnMarket AI Conversation Engine.

## Features

- ✅ Test conversation engine API endpoints
- ✅ Health check monitoring
- ✅ Customizable merchant ID and customer phone
- ✅ Quick test message examples
- ✅ Real-time response display

## Usage

### Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3003`

### Environment Variables

- `NEXT_PUBLIC_CONVERSATION_ENGINE_URL` - Conversation engine API URL (default: http://localhost:8003)

### Railway Deployment

This app is configured for automatic deployment on Railway. Set the environment variable:

```
NEXT_PUBLIC_CONVERSATION_ENGINE_URL=https://your-conversation-engine.railway.app
```

## Quick Test

1. Enter your conversation engine URL
2. Set merchant ID and customer phone (or use defaults)
3. Type a message or click a quick example
4. Click "Test Conversation" to see the AI response
5. Use "Health Check" to verify the engine is running
