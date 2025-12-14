# Railway Deployment - Quick Start Guide

This is a condensed guide to deploy YarnMarket AI to Railway in under 30 minutes.

## Prerequisites Checklist

- [ ] Railway account ([railway.app](https://railway.app))
- [ ] Railway CLI installed: `npm install -g @railway/cli`
- [ ] OpenAI API key
- [ ] WhatsApp Business API credentials
- [ ] GitHub access to [hellomuba/YarnMarket-AI](https://github.com/hellomuba/YarnMarket-AI)

## 5-Step Deployment Process

### Step 1: Login & Link (2 min)

```bash
railway login
railway link 2e108d5e-72e9-47d8-859a-dedd14a21244
```

### Step 2: Deploy Infrastructure (10 min)

In [Railway Dashboard](https://railway.app/project/2e108d5e-72e9-47d8-859a-dedd14a21244), add these services:

| Service | Type | Image/Template | Notes |
|---------|------|----------------|-------|
| PostgreSQL | Database | PostgreSQL | Auto-configured |
| MongoDB | Database | MongoDB | Auto-configured |
| Redis | Database | Redis | Auto-configured |
| RabbitMQ | Docker | `rabbitmq:3-management` | Set `RABBITMQ_DEFAULT_USER` & `RABBITMQ_DEFAULT_PASS` |
| Weaviate | Docker | `semitechnologies/weaviate:latest` | Add 10GB volume at `/var/lib/weaviate` |
| ClickHouse | Docker | `clickhouse/clickhouse-server:latest` | Add 20GB volume at `/var/lib/clickhouse` |

**Wait for all to show "Active" status.**

### Step 3: Deploy Application Services (10 min)

Run the automated deployment script:

```powershell
# Windows
.\deploy-railway.ps1

# OR Linux/Mac/Git Bash
bash deploy-railway.sh
```

The script will deploy:
- webhook-handler
- conversation-engine
- message-worker
- dashboard-api
- merchant-api
- rag-system
- analytics-service
- vendor-dashboard
- admin-dashboard

### Step 4: Configure Environment Variables (5 min)

For each service, set environment variables in Railway Dashboard → Service → Variables tab.

**Quick Reference** (full details in [RAILWAY_ENV_TEMPLATE.md](RAILWAY_ENV_TEMPLATE.md)):

#### webhook-handler
```
WHATSAPP_VERIFY_TOKEN=<your_token>
WHATSAPP_ACCESS_TOKEN=<your_token>
WHATSAPP_PHONE_NUMBER_ID=<your_id>
RABBITMQ_URL=amqp://yarnmarket:<password>@rabbitmq.railway.internal:5672/
PORT=8082
```
✅ **Enable public domain**

#### conversation-engine
```
OPENAI_API_KEY=<your_key>
DATABASE_URL=${{Postgres.DATABASE_URL}}
MONGODB_URI=${{MongoDB.MONGO_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
WEAVIATE_HOST=weaviate.railway.internal
WEAVIATE_PORT=8080
WEAVIATE_SCHEME=http
RAG_SYSTEM_URL=http://rag-system.railway.internal:8004
PORT=8003
```
✅ **Enable public domain**

#### Other services
See [RAILWAY_ENV_TEMPLATE.md](RAILWAY_ENV_TEMPLATE.md) for complete configuration.

### Step 5: Initialize & Configure (5 min)

#### Initialize Database
```bash
# Run from project root
railway run psql "$DATABASE_URL" -f scripts/init-db.sql

# OR use the script
bash scripts/init-railway-db.sh
```

#### Configure WhatsApp Webhook
1. Get webhook URL: `https://<webhook-handler-url>.railway.app/webhook`
2. Go to [Meta Developer Console](https://developers.facebook.com)
3. WhatsApp → Configuration → Edit Webhook
4. Enter URL and verify token
5. Subscribe to `messages` and `message_status`

## Verification

```bash
# Test services
curl https://<webhook-handler-url>.railway.app/health
curl https://<conversation-engine-url>.railway.app/health
curl https://<dashboard-api-url>.railway.app/health

# OR use the test script
bash scripts/test-railway-deployment.sh
```

## Access Your Deployment

- **Vendor Dashboard**: `https://<vendor-dashboard-url>.railway.app`
- **Admin Dashboard**: `https://<admin-dashboard-url>.railway.app`
- **Railway Project**: https://railway.app/project/2e108d5e-72e9-47d8-859a-dedd14a21244

## Next Steps

1. Create merchant account in admin dashboard
2. Upload product catalog
3. Send test WhatsApp message
4. Monitor logs: `railway logs -f`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Service won't start | Check environment variables and build logs |
| Database connection failed | Use Railway reference variables: `${{Postgres.DATABASE_URL}}` |
| WhatsApp webhook fails | Verify token matches, ensure public domain enabled |
| Can't access frontend | Check CORS settings, verify API URLs in env vars |

**Full documentation**: [RAILWAY_SETUP.md](RAILWAY_SETUP.md)

## Support

- **Detailed Guide**: [RAILWAY_SETUP.md](RAILWAY_SETUP.md)
- **Environment Variables**: [RAILWAY_ENV_TEMPLATE.md](RAILWAY_ENV_TEMPLATE.md)
- **GitHub Issues**: https://github.com/hellomuba/YarnMarket-AI/issues
- **Railway Discord**: https://discord.gg/railway

---

**Estimated Total Time**: 30-40 minutes

**Your Railway Project**: https://railway.app/project/2e108d5e-72e9-47d8-859a-dedd14a21244
