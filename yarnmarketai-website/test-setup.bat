@echo off
REM YarnMarket AI - Complete Docker Test Setup (Windows)

echo.
echo 🗣️  YarnMarket AI - Docker Test Setup
echo =====================================

REM Step 1: Setup environment
echo.
echo 📝 Step 1: Setting up environment...
if not exist .env (
    copy .env.test .env >nul
    echo ✅ Created .env from test template
) else (
    echo ⚠️  .env already exists, using existing file
)

REM Step 2: Start all services
echo.
echo 🚀 Step 2: Starting all Docker services...
echo This will start:
echo - PostgreSQL (Database)
echo - Redis (Cache) 
echo - MongoDB (Conversations)
echo - ClickHouse (Analytics)
echo - RabbitMQ (Message Queue)
echo - Webhook Handler (Go)
echo - Conversation Engine (Python)
echo - Merchant API (Node.js)
echo - Analytics Service (Python)
echo - Prometheus (Monitoring)
echo - Grafana (Dashboards)

docker-compose up -d

REM Step 3: Wait for services
echo.
echo ⏳ Step 3: Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Step 4: Health checks
echo.
echo 🏥 Step 4: Running health checks...

echo Checking webhook-handler...
curl -sf "http://localhost:8080/health" >nul 2>&1 && echo ✅ Healthy || echo ❌ Unhealthy

echo Checking conversation-engine...
curl -sf "http://localhost:8001/health" >nul 2>&1 && echo ✅ Healthy || echo ❌ Unhealthy

echo Checking merchant-api...
curl -sf "http://localhost:3001/health" >nul 2>&1 && echo ✅ Healthy || echo ❌ Unhealthy

echo Checking analytics-service...
curl -sf "http://localhost:8002/health" >nul 2>&1 && echo ✅ Healthy || echo ❌ Unhealthy

REM Step 5: Test webhook
echo.
echo 📱 Step 5: Testing WhatsApp webhook...
curl -s "http://localhost:8080/webhook?hub.mode=subscribe&hub.verify_token=test_verify_token_12345&hub.challenge=test_challenge" | findstr "test_challenge" >nul && echo ✅ Webhook verification working || echo ❌ Webhook verification failed

REM Step 6: Show access URLs
echo.
echo 🌐 Access URLs
echo ====================================
echo 🔗 Webhook Handler:      http://localhost:8080/health
echo 🤖 Conversation Engine:  http://localhost:8001/health
echo 📱 Merchant API:         http://localhost:3001/health
echo 📊 Analytics Service:    http://localhost:8002/health
echo 📈 Grafana Dashboard:    http://localhost:3000 (admin/grafana_admin_2024)
echo 🐰 RabbitMQ Management:  http://localhost:15672 (yarnmarket/rabbit_test_2024)
echo 📊 Prometheus:           http://localhost:9090

REM Step 7: Show commands
echo.
echo 🛠️  Useful Commands
echo ====================================
echo 📋 View all services:     docker-compose ps
echo 📜 View logs:            docker-compose logs -f [service-name]
echo 🛑 Stop all services:    docker-compose down
echo 🧹 Clean up everything:  docker-compose down -v --remove-orphans
echo 🔄 Restart a service:    docker-compose restart [service-name]

echo.
echo 🎉 YarnMarket AI Docker setup complete!
echo All services should be running and ready for testing.
echo.
echo Next steps:
echo 1. Visit Grafana dashboard: http://localhost:3000
echo 2. Check service status: docker-compose ps
echo 3. View logs: docker-compose logs -f conversation-engine
echo 4. Test the conversation API with the examples below

echo.
echo 💬 Sample API Test Commands:
echo ============================
echo.
echo # Test Nigerian Pidgin conversation:
echo curl -X POST "http://localhost:8001/conversation/process" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"message\":{\"id\":\"msg_001\",\"from\":\"+2348012345678\",\"timestamp\":\"2024-01-01T10:00:00Z\",\"type\":\"text\",\"text\":\"Abeg, how much be this shoe?\"},\"merchant_id\":\"test_merchant\",\"customer_phone\":\"+2348012345678\"}"
echo.
echo # Test English conversation:
echo curl -X POST "http://localhost:8001/conversation/process" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"message\":{\"id\":\"msg_002\",\"from\":\"+2348087654321\",\"timestamp\":\"2024-01-01T10:05:00Z\",\"type\":\"text\",\"text\":\"Good afternoon! Do you have this in blue?\"},\"merchant_id\":\"test_merchant\",\"customer_phone\":\"+2348087654321\"}"

pause