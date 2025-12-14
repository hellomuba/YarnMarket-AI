# 🚀 YarnMarket AI Deployment Guide

## Quick Start

```bash
# Setup environment
make setup

# Start development
make start

# Deploy to production
./scripts/deploy.sh production
```

## 📋 Prerequisites

### Development Environment
- **Docker & Docker Compose**: Latest version
- **Node.js**: v18+ for web dashboard
- **Python**: 3.11+ for AI services
- **Go**: 1.21+ for webhook handler

### Production Environment
- **Kubernetes Cluster**: v1.25+
- **kubectl**: Configured and authenticated
- **Docker Registry**: For container images
- **WhatsApp Business API**: Account and credentials
- **SSL Certificate**: For HTTPS endpoints

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  WhatsApp API   │───▶│ Webhook Handler │───▶│ Message Queue   │
│    (Incoming)   │    │      (Go)       │    │   (RabbitMQ)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐    ┌────────▼────────┐
                       │  Merchant API   │    │ Conversation    │
                       │   (NestJS)      │    │   Engine        │
                       └─────────────────┘    │   (Python)      │
                                              └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌────────▼────────┐
│ Mobile App      │───▶│ Web Dashboard   │    │ AI Models &     │
│ (React Native) │    │   (Next.js)     │    │ Cultural Intel  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Development Setup

### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

Required environment variables:
```env
# Database passwords
POSTGRES_PASSWORD=your_secure_password
MONGO_PASSWORD=your_secure_password
RABBITMQ_PASSWORD=your_secure_password

# WhatsApp Business API
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# OpenAI API (for GPT-4 fallback)
OPENAI_API_KEY=your_openai_key

# Security
JWT_SECRET=your_jwt_secret_minimum_32_chars

# Monitoring
GRAFANA_PASSWORD=your_grafana_password
```

### 2. Start Development Environment

```bash
# Start all services
make start

# View logs
make logs

# Check service status
make status
```

### 3. Verify Installation

```bash
# Health checks
curl http://localhost:8080/health  # Webhook Handler
curl http://localhost:8001/health  # Conversation Engine
curl http://localhost:3001/health  # Merchant API
curl http://localhost:8002/health  # Analytics Service

# Access web interfaces
open http://localhost:3000  # Grafana Dashboard
open http://localhost:15672 # RabbitMQ Management
```

## 🌐 Production Deployment

### 1. Pre-deployment Checklist

- [ ] Kubernetes cluster configured and accessible
- [ ] Docker registry credentials configured
- [ ] SSL certificates obtained
- [ ] WhatsApp Business API configured
- [ ] Database backup strategy implemented
- [ ] Monitoring alerts configured

### 2. Deploy Infrastructure

```bash
# Create namespace and secrets
kubectl create namespace yarnmarket-prod

# Create database secrets
kubectl create secret generic database-secret \
  --from-literal=postgres-url="postgresql://user:pass@host:5432/db" \
  --from-literal=redis-url="redis://host:6379" \
  --from-literal=mongodb-url="mongodb://user:pass@host:27017/db" \
  -n yarnmarket-prod

# Create API keys secret
kubectl create secret generic api-keys \
  --from-literal=openai-api-key="your-openai-key" \
  --from-literal=whatsapp-access-token="your-whatsapp-token" \
  -n yarnmarket-prod
```

### 3. Run Deployment Script

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

### 4. Configure WhatsApp Webhook

```bash
# Get webhook URL
kubectl get ingress -n yarnmarket-prod

# Configure WhatsApp Business API
curl -X POST "https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/webhooks" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://your-domain.com/webhook",
    "verify_token": "your_verify_token"
  }'
```

## 📊 Monitoring & Observability

### Metrics Dashboards

- **Grafana**: `https://your-domain.com/grafana`
- **Prometheus**: `https://your-domain.com/prometheus`
- **Application Metrics**: `https://your-domain.com/metrics`

### Key Metrics to Monitor

#### Business Metrics
- Active conversations count
- Conversion rate (conversations → sales)
- Average response time
- Customer satisfaction score
- Daily/weekly revenue
- Language distribution

#### Technical Metrics
- Request latency (p95, p99)
- Error rates by service
- Memory/CPU usage
- Database connection pools
- Queue depths
- Model inference time

#### Cultural Intelligence Metrics
- Language detection accuracy
- Code-switching frequency
- Negotiation success rate
- Response appropriateness score

### Alerts Configuration

Critical alerts are configured for:
- Service downtime
- High error rates (>5%)
- Response time degradation (>1s p95)
- Memory usage (>90%)
- Queue backlog (>1000 messages)
- Low conversion rate (<30%)

## 🔒 Security Considerations

### Data Protection
- All conversations encrypted at rest
- PII data retention policy (90 days)
- GDPR compliance for EU customers
- WhatsApp Business API compliance

### Access Control
- Role-based access control (RBAC)
- API rate limiting
- JWT token expiration
- Network policies in Kubernetes

### Monitoring
- Audit logs for all admin actions
- Failed login attempt monitoring
- Unusual traffic pattern detection

## 🚀 Scaling Guidelines

### Horizontal Scaling

The system auto-scales based on:
- **Conversation Engine**: CPU >70% or >100 active conversations per pod
- **Webhook Handler**: CPU >80% or >500 requests/second per pod
- **Merchant API**: CPU >75% or >200 requests/second per pod

```yaml
# Example HPA configuration
minReplicas: 5
maxReplicas: 50
targetCPUUtilizationPercentage: 70
```

### Vertical Scaling

Recommended resource limits:
```yaml
conversation-engine:
  requests: { memory: "2Gi", cpu: "1000m" }
  limits: { memory: "4Gi", cpu: "2000m" }

webhook-handler:
  requests: { memory: "512Mi", cpu: "500m" }
  limits: { memory: "1Gi", cpu: "1000m" }
```

### Database Scaling

- **PostgreSQL**: Read replicas for analytics queries
- **MongoDB**: Sharding by merchant_id for conversation data
- **Redis**: Cluster mode for high availability
- **ClickHouse**: Distributed tables for analytics

## 🛠️ Maintenance & Updates

### Rolling Updates

```bash
# Update specific service
kubectl set image deployment/conversation-engine \
  conversation-engine=yarnmarket/conversation-engine:v1.1.0 \
  -n yarnmarket-prod

# Monitor rollout
kubectl rollout status deployment/conversation-engine -n yarnmarket-prod
```

### Database Migrations

```bash
# Run migrations
kubectl exec deployment/merchant-api -n yarnmarket-prod -- npm run db:migrate

# Backup before migrations
kubectl exec deployment/postgresql -n yarnmarket-prod -- pg_dump yarnmarket > backup.sql
```

### Model Updates

```bash
# Update AI models (zero-downtime)
kubectl create configmap ai-models-v2 --from-file=models/ -n yarnmarket-prod
kubectl patch deployment conversation-engine -p '{"spec":{"template":{"spec":{"volumes":[{"name":"ai-models","configMap":{"name":"ai-models-v2"}}]}}}}' -n yarnmarket-prod
```

## 🐛 Troubleshooting

### Common Issues

#### High Response Time
```bash
# Check conversation engine logs
kubectl logs -l app=conversation-engine -n yarnmarket-prod --tail=100

# Check resource usage
kubectl top pods -l app=conversation-engine -n yarnmarket-prod

# Scale up if needed
kubectl scale deployment conversation-engine --replicas=20 -n yarnmarket-prod
```

#### WhatsApp Webhook Failures
```bash
# Check webhook handler logs
kubectl logs -l app=webhook-handler -n yarnmarket-prod --tail=100

# Verify webhook URL accessibility
curl -I https://your-domain.com/webhook

# Check WhatsApp API status
curl -I https://graph.facebook.com/v18.0/me?access_token=YOUR_TOKEN
```

#### Database Connection Issues
```bash
# Check database pods
kubectl get pods -l app=postgresql -n yarnmarket-prod

# Check connection from app
kubectl exec deployment/conversation-engine -n yarnmarket-prod -- \
  python -c "import psycopg2; psycopg2.connect('$DATABASE_URL')"
```

### Performance Optimization

#### Conversation Engine Optimization
```bash
# Enable model quantization
export MODEL_QUANTIZATION=true

# Increase batch size for better GPU utilization
export MAX_BATCH_SIZE=64

# Enable response caching
export ENABLE_RESPONSE_CACHE=true
```

#### Database Query Optimization
```sql
-- Create indexes for faster conversation lookups
CREATE INDEX CONCURRENTLY idx_conversations_customer_timestamp 
ON conversations(customer_phone, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_conversations_merchant_status 
ON conversations(merchant_id, status) WHERE status = 'active';
```

## 📞 Support

### Documentation
- **API Documentation**: `https://your-domain.com/api/docs`
- **Architecture Diagrams**: `/docs/architecture/`
- **Runbooks**: `/docs/runbooks/`

### Getting Help
- **GitHub Issues**: Report bugs and feature requests
- **Slack Channel**: `#yarnmarket-ai-support`
- **Email**: `support@yarnmarket.ai`

### Emergency Contacts
- **On-call Engineer**: +234-XXX-XXX-XXXX
- **System Admin**: +234-XXX-XXX-XXXX
- **WhatsApp Business Support**: Meta Business Support

---

**🎉 Congratulations!** You've successfully deployed YarnMarket AI - the most advanced conversational commerce platform for Nigerian markets!