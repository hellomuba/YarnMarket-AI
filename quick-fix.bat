@echo off
echo 🔧 YarnMarket AI - Quick Fix Script
echo ===================================

echo.
echo 1. Stopping all services...
docker-compose down

echo.
echo 2. Cleaning up Docker system...
docker system prune -f --volumes

echo.
echo 3. Building and starting services (this may take a few minutes)...
docker-compose up -d --build

echo.
echo 4. Waiting for services to start...
timeout /t 45 /nobreak >nul

echo.
echo 5. Checking service health...
echo Webhook Handler:
curl -sf "http://localhost:8080/health" && echo ✅ Healthy || echo ❌ Unhealthy

echo Conversation Engine:
curl -sf "http://localhost:8001/health" && echo ✅ Healthy || echo ❌ Unhealthy

echo Merchant API:  
curl -sf "http://localhost:3001/health" && echo ✅ Healthy || echo ❌ Unhealthy

echo Analytics Service:
curl -sf "http://localhost:8002/health" && echo ✅ Healthy || echo ❌ Unhealthy

echo.
echo 6. Testing WhatsApp webhook...
curl -s "http://localhost:8080/webhook?hub.mode=subscribe&hub.verify_token=test_verify_token_12345&hub.challenge=TEST123" | findstr "TEST123" >nul && echo ✅ Webhook working || echo ❌ Webhook failed

echo.
echo 7. Service Status:
docker-compose ps

echo.
echo 🎉 Quick fix complete!
echo.
echo 🌐 Access URLs:
echo - Webhook: http://localhost:8080/health
echo - AI Engine: http://localhost:8001/health  
echo - Merchant API: http://localhost:3001/health
echo - Analytics: http://localhost:8002/health
echo - Grafana: http://localhost:3000 (admin/grafana_admin_2024)
echo - RabbitMQ: http://localhost:15672 (yarnmarket/rabbit_test_2024)

echo.
echo 💡 If any service is unhealthy, check logs with:
echo    docker-compose logs [service-name]
echo.
echo 📝 To test the AI conversation:
echo curl -X POST "http://localhost:8001/conversation/process" -H "Content-Type: application/json" -d "{\"message\":{\"id\":\"test\",\"from\":\"+234\",\"timestamp\":\"2024-01-01T10:00:00Z\",\"type\":\"text\",\"text\":\"Hello!\"},\"merchant_id\":\"test\",\"customer_phone\":\"+234\"}"

pause