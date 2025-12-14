# YarnMarket AI - Testing & Verification Guide

## Quick Start - Testing Your System

### 1. Start All Services

```bash
# Start Docker services
docker-compose up -d

# Wait 30-60 seconds for services to initialize
# Check service status
docker-compose ps
```

### 2. Run System Health Check

```bash
# Run comprehensive system test
python test_system.py
```

This will check:
- ✓ All microservices (conversation-engine, webhook-handler, dashboard-api, rag-system)
- ✓ Database connections (PostgreSQL, MongoDB, Redis)
- ✓ Environment variables
- ✓ API endpoints

### 3. Test OpenAI Conversation Engine

```bash
# Test AI conversation functionality
python test_chat.py
```

This tests:
- ✓ Nigerian Pidgin English responses
- ✓ English responses
- ✓ Price negotiation
- ✓ Customer service scenarios

## Detailed Service Testing

### Test Individual Services

#### Conversation Engine
```bash
# Health check
curl http://localhost:8003/health

# Test conversation (requires service running)
curl -X POST http://localhost:8003/conversation/process \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "1",
    "customer_phone": "+2348012345678",
    "message": "Good morning! I wan buy fabric"
  }'
```

#### Webhook Handler
```bash
# Health check
curl http://localhost:8082/health

# Test webhook
curl -X POST http://localhost:8082/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": []
  }'
```

#### Dashboard API
```bash
# Health check
curl http://localhost:8005/health

# Get merchants
curl http://localhost:8005/api/merchants
```

#### RAG System
```bash
# Health check
curl http://localhost:8004/health

# Test product search
curl -X POST http://localhost:8004/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "red fabric",
    "merchant_id": "1"
  }'
```

### Test Database Connections

#### PostgreSQL
```bash
# Connect to database
docker-compose exec postgres psql -U yarnmarket -d yarnmarket

# Check tables
\dt

# Check products
SELECT * FROM products LIMIT 5;

# Exit
\q
```

#### MongoDB
```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u yarnmarket -p your_mongo_password

# Check databases
show dbs

# Use yarnmarket database
use yarnmarket

# Check collections
show collections

# Check conversations
db.conversations.find().limit(5)

# Exit
exit
```

#### Redis
```bash
# Connect to Redis
docker-compose exec redis redis-cli -a your_redis_password

# Check keys
KEYS *

# Exit
exit
```

## Test Frontend Applications

### Vendor Dashboard (Next.js 14)
```bash
cd web/dashboard
npm run dev
# Open http://localhost:3000
```

Test:
- Login page
- Product management
- Conversation view
- Analytics
- Settings

### Admin Dashboard (Next.js 15)
```bash
cd apps/dashboard-nextjs
npm run dev
# Open http://localhost:3002
```

## Common Issues & Solutions

### Issue: Docker services not starting
```bash
# Check Docker Desktop is running
# View logs
docker-compose logs

# Rebuild services
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Database connection failed
```bash
# Check if database containers are running
docker-compose ps

# Check database logs
docker-compose logs postgres
docker-compose logs mongodb
docker-compose logs redis

# Restart database
docker-compose restart postgres
```

### Issue: Conversation engine errors
```bash
# Check logs
docker-compose logs conversation-engine

# Check environment variables
cat .env | grep OPENAI

# Restart service
docker-compose restart conversation-engine
```

### Issue: Port already in use
```bash
# Find process using port (e.g., 8003)
# Windows
netstat -ano | findstr :8003

# Kill process
taskkill /PID <process_id> /F

# Restart service
docker-compose restart conversation-engine
```

## Environment Variables Checklist

Make sure these are set in your `.env` file:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Database
DATABASE_URL=postgresql://yarnmarket:password@localhost:5434/yarnmarket
POSTGRES_PASSWORD=your_postgres_password
MONGO_PASSWORD=your_mongo_password
REDIS_PASSWORD=your_redis_password

# WhatsApp
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token

# Services
CONVERSATION_ENGINE_URL=http://conversation-engine:8003
RAG_SYSTEM_URL=http://rag-system:8004
```

## Verify Everything is Working

Run this complete test sequence:

```bash
# 1. Start services
docker-compose up -d && sleep 30

# 2. Check service health
python test_system.py

# 3. Test AI conversation
python test_chat.py

# 4. Check each service manually
curl http://localhost:8003/health  # conversation-engine
curl http://localhost:8082/health  # webhook-handler
curl http://localhost:8005/health  # dashboard-api
curl http://localhost:8004/health  # rag-system

# 5. Test vendor dashboard
cd web/dashboard && npm run dev
# Open http://localhost:3000

# 6. Test admin dashboard
cd apps/dashboard-nextjs && npm run dev
# Open http://localhost:3002
```

## Success Criteria

Your system is working correctly if:

- ✅ All Docker services show "healthy" status
- ✅ `test_system.py` shows all tests passing
- ✅ `test_chat.py` successfully generates AI responses
- ✅ All health endpoints return HTTP 200
- ✅ Databases accept connections
- ✅ Vendor dashboard loads without errors
- ✅ Admin dashboard loads and shows data

## Getting Help

If tests fail:
1. Check Docker Desktop is running
2. View service logs: `docker-compose logs <service-name>`
3. Verify .env file has all required variables
4. Check ports aren't in use by other applications
5. Try rebuilding: `docker-compose down && docker-compose up --build -d`

## Next Steps After Testing

Once everything is working:
1. Add products via vendor dashboard
2. Test WhatsApp conversation flow
3. Monitor analytics
4. Configure AI response settings
5. Set up webhooks for production
