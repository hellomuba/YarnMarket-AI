.PHONY: setup build start stop clean test lint

# Setup development environment
setup:
	@echo "🔧 Setting up YarnMarket AI development environment..."
	cp .env.example .env
	@echo "📝 Please edit .env with your configuration values"
	docker-compose pull
	@echo "✅ Setup complete! Run 'make start' to begin development"

# Build all services
build:
	@echo "🏗️  Building YarnMarket AI services..."
	docker-compose build

# Start all services
start:
	@echo "🚀 Starting YarnMarket AI services..."
	docker-compose up -d
	@echo "✅ Services started! Check status with 'make status'"

# Stop all services
stop:
	@echo "🛑 Stopping YarnMarket AI services..."
	docker-compose down

# Show service status
status:
	@echo "📊 YarnMarket AI Service Status:"
	docker-compose ps

# View logs
logs:
	docker-compose logs -f

# Clean up containers and volumes
clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker-compose down -v --remove-orphans
	docker system prune -f

# Run tests
test:
	@echo "🧪 Running tests..."
	docker-compose exec conversation-engine python -m pytest tests/
	docker-compose exec merchant-api npm test

# Lint code
lint:
	@echo "🔍 Linting code..."
	docker-compose exec conversation-engine python -m black . --check
	docker-compose exec conversation-engine python -m flake8 .
	docker-compose exec merchant-api npm run lint

# Database migrations
migrate:
	@echo "📊 Running database migrations..."
	docker-compose exec merchant-api npm run db:migrate

# Initialize databases with sample data
seed:
	@echo "🌱 Seeding databases with sample data..."
	docker-compose exec conversation-engine python scripts/seed_data.py

# Monitor services
monitor:
	@echo "📈 Opening monitoring dashboard..."
	open http://localhost:3000

# Development helpers
dev-webhook:
	@echo "🔗 Starting ngrok for webhook development..."
	ngrok http 8080

dev-logs-conversation:
	docker-compose logs -f conversation-engine

dev-logs-webhook:
	docker-compose logs -f webhook-handler

# Production deployment
deploy-staging:
	@echo "🚀 Deploying to staging..."
	kubectl apply -f infrastructure/kubernetes/staging/

deploy-prod:
	@echo "🚀 Deploying to production..."
	kubectl apply -f infrastructure/kubernetes/production/

# Health checks
health:
	@echo "🏥 Checking service health..."
	curl -f http://localhost:8080/health || echo "❌ Webhook handler unhealthy"
	curl -f http://localhost:8001/health || echo "❌ Conversation engine unhealthy"
	curl -f http://localhost:3001/health || echo "❌ Merchant API unhealthy"