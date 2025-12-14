# YarnMarket AI Dashboard Setup Guide

## 🚀 Quick Start (Using Mock API)

The dashboard is pre-configured to use mock data for testing. Simply run:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3002` with mock data.

## 🔌 Connecting to Real API

### Step 1: Update Environment Variables

Edit `.env.local` and change these values:

```bash
# Set to false to use real API
NEXT_PUBLIC_USE_MOCK_API=false

# Your backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8005

# WebSocket URL for real-time updates  
NEXT_PUBLIC_WS_URL=ws://localhost:8005/ws
```

### Step 2: Ensure Your Backend Services Are Running

Make sure these services are running:

1. **Dashboard API** (Port 8005)
2. **Go Webhook Handler** (Port 8082) 
3. **Python Conversation Engine** (Port 8003)
4. **PostgreSQL** (Port 5432)
5. **Redis** (Port 6379/6381)
6. **MongoDB** (Port 27017)
7. **RabbitMQ** (Port 5672)
8. **ChromaDB** (Port 8002)

### Step 3: Check Service Health

You can verify your services are running by checking:

- Dashboard API: `http://localhost:8005/health`
- Go Webhook: `http://localhost:8082/health` 
- Python Engine: `http://localhost:8003/health`

## 🐳 Docker Setup

If you're using Docker, make sure all services are running:

```bash
# Check running containers
docker ps

# Start all services (if you have docker-compose.yml)
docker-compose up -d

# View logs
docker-compose logs -f dashboard-api
```

## 🔧 Expected API Endpoints

The dashboard expects these endpoints on your backend:

### Merchants
- `GET /api/merchants` - List all merchants
- `POST /api/merchants` - Create merchant
- `PUT /api/merchants/{id}` - Update merchant
- `DELETE /api/merchants/{id}` - Delete merchant

### Messages
- `GET /api/messages` - List messages (with filters)
- `POST /api/messages/{id}/retry` - Retry failed message

### Conversations
- `GET /api/conversations` - List conversations (with filters)

### System
- `GET /api/metrics` - System metrics
- `GET /health` - Health check

### Test Console
- `POST /api/test-console/send-message` - Send test message

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/test-connection` - Test connections

## 🛠️ Backend API Implementation

Here's a minimal FastAPI implementation for your backend:

```python
# services/dashboard-api/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI(title="YarnMarket Dashboard API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "services": {
            "postgresql": "healthy",
            "redis": "healthy", 
            "mongodb": "healthy",
            "rabbitmq": "healthy"
        }
    }

@app.get("/api/merchants")
async def get_merchants():
    # Connect to your PostgreSQL merchants table
    return []

@app.post("/api/merchants")
async def create_merchant(merchant_data: dict):
    # Insert into PostgreSQL merchants table
    return merchant_data

# Add other endpoints as needed...

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
```

## 🔍 Troubleshooting

### Dashboard Not Loading
- Check if Next.js dev server is running on port 3002
- Verify `.env.local` configuration
- Clear browser cache and cookies

### API Connection Issues
- Verify backend services are running
- Check CORS configuration in your API
- Verify API endpoints return expected data format
- Check browser network tab for failed requests

### Mock Data Not Working
- Ensure `NEXT_PUBLIC_USE_MOCK_API=true` in `.env.local`
- Restart the dev server after changing environment variables
- Check browser console for JavaScript errors

### Merchant Creation Not Working
- Verify API endpoint `/api/merchants` accepts POST requests
- Check request/response format matches expected interface
- Verify CORS headers allow POST requests
- Check server logs for errors

## 📊 Data Formats

The dashboard expects these data formats:

### Merchant
```json
{
  "id": 1,
  "business_name": "Tech Solutions Ltd",
  "phone_number": "+234701234567",
  "email": "contact@example.com",
  "business_type": "electronics",
  "status": "active",
  "total_messages": 45,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Message
```json
{
  "id": "msg_001",
  "from_phone": "+234701111111", 
  "merchant_id": "1",
  "content": "Hello, I want to buy iPhone 14",
  "type": "text",
  "status": "processed",
  "ai_response": "Hello! We have iPhone 14 available...",
  "created_at": "2024-01-20T14:22:00Z"
}
```

### Conversation
```json
{
  "id": "conv_001",
  "customer_phone": "+234701111111",
  "merchant_id": "1", 
  "merchant_business_name": "Tech Solutions Ltd",
  "status": "active",
  "message_count": 5,
  "messages": [...],
  "created_at": "2024-01-20T14:20:00Z"
}
```

## 🆘 Support

If you encounter issues:

1. Check this setup guide
2. Verify your backend API is running and accessible
3. Check browser console for errors
4. Verify data formats match expected interfaces
5. Test API endpoints directly with tools like Postman

For development, the mock API provides realistic data to test all dashboard features without needing a full backend.
