# YarnMarket AI - Railway Deployment Guide

Complete guide to deploying YarnMarket AI on Railway.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Deployment Steps](#detailed-deployment-steps)
4. [WhatsApp Webhook Configuration](#whatsapp-webhook-configuration)
5. [Database Initialization](#database-initialization)
6. [Verification & Testing](#verification--testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Tools
- ✅ Railway account ([railway.app](https://railway.app))
- ✅ GitHub account with access to [YarnMarket-AI repo](https://github.com/hellomuba/YarnMarket-AI)
- ✅ OpenAI API key ([platform.openai.com](https://platform.openai.com))
- ✅ WhatsApp Business API access (Meta Business Account)
- ✅ Railway CLI installed: `npm install -g @railway/cli`

### Before You Start
1. **Fork or access** the repository: https://github.com/hellomuba/YarnMarket-AI
2. **Get your WhatsApp credentials**:
   - Business Phone Number ID
   - Access Token
   - Verify Token (create a random string)
3. **Get your OpenAI API key** from https://platform.openai.com/api-keys
4. **Login to Railway CLI**:
   ```bash
   railway login
   ```

---

## Quick Start

### Option A: Automated Deployment (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hellomuba/YarnMarket-AI.git
   cd YarnMarket-AI
   ```

2. **Run the deployment script**:
   ```powershell
   # Windows PowerShell
   .\deploy-railway.ps1

   # OR Git Bash / WSL
   bash deploy-railway.sh
   ```

3. **Follow the prompts** and deploy infrastructure services manually first
4. **Script will deploy** all application services automatically

### Option B: Manual Deployment

Follow the [Detailed Deployment Steps](#detailed-deployment-steps) below.

---

## Detailed Deployment Steps

### Step 1: Set Up Railway Project

1. **Link to your existing project**:
   ```bash
   railway link 2e108d5e-72e9-47d8-859a-dedd14a21244
   ```

2. **Verify connection**:
   ```bash
   railway status
   ```

---

### Step 2: Deploy Infrastructure Services

Deploy these services **manually** through Railway Dashboard as they require specific configuration.

#### 2.1 PostgreSQL

1. Go to [Railway Dashboard](https://railway.app/project/2e108d5e-72e9-47d8-859a-dedd14a21244)
2. Click **"+ New Service"**
3. Select **"Database" → "PostgreSQL"**
4. Service name: `postgres`
5. Railway automatically provides `DATABASE_URL` variable

#### 2.2 MongoDB

1. Click **"+ New Service"**
2. Select **"Database" → "MongoDB"**
3. Service name: `mongodb`
4. Railway automatically provides `MONGO_URL` variable

#### 2.3 Redis

1. Click **"+ New Service"**
2. Select **"Database" → "Redis"**
3. Service name: `redis`
4. Railway automatically provides `REDIS_URL` variable

#### 2.4 RabbitMQ

1. Click **"+ New Service"**
2. Select **"Docker Image"**
3. Image: `rabbitmq:3-management`
4. Service name: `rabbitmq`
5. Add environment variables:
   ```
   RABBITMQ_DEFAULT_USER=yarnmarket
   RABBITMQ_DEFAULT_PASS=<generate_strong_password>
   ```
6. **Note the password** - you'll need it for other services

**Optional**: Enable public domain for management UI (port 15672)

#### 2.5 Weaviate (Vector Database)

1. Click **"+ New Service"**
2. Select **"Docker Image"**
3. Image: `semitechnologies/weaviate:latest`
4. Service name: `weaviate`
5. Add environment variables:
   ```
   AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true
   PERSISTENCE_DATA_PATH=/var/lib/weaviate
   DEFAULT_VECTORIZER_MODULE=none
   ENABLE_MODULES=text2vec-openai
   CLUSTER_HOSTNAME=weaviate
   ```
6. **Add Volume**:
   - Click "Settings" → "Volumes"
   - Mount Path: `/var/lib/weaviate`
   - Size: 10GB

#### 2.6 ClickHouse (Analytics Database)

1. Click **"+ New Service"**
2. Select **"Docker Image"**
3. Image: `clickhouse/clickhouse-server:latest`
4. Service name: `clickhouse`
5. Add environment variables:
   ```
   CLICKHOUSE_DB=yarnmarket
   CLICKHOUSE_USER=default
   CLICKHOUSE_PASSWORD=<generate_strong_password>
   ```
6. **Add Volume**:
   - Click "Settings" → "Volumes"
   - Mount Path: `/var/lib/clickhouse`
   - Size: 20GB

**Wait for all infrastructure services to show "Active" status before proceeding.**

---

### Step 3: Deploy Application Services

Now deploy application services **from GitHub**.

#### 3.1 webhook-handler (WhatsApp Webhook)

1. Click **"+ New Service"**
2. Select **"GitHub Repo"**
3. Choose: `hellomuba/YarnMarket-AI`
4. Service name: `webhook-handler`
5. **Settings**:
   - Root Directory: `services/webhook-handler`
   - Build Command: (auto-detected)
   - Start Command: `./webhook-handler`
6. **Environment Variables** (see [RAILWAY_ENV_TEMPLATE.md](RAILWAY_ENV_TEMPLATE.md)):
   ```
   WHATSAPP_VERIFY_TOKEN=<your_verify_token>
   WHATSAPP_ACCESS_TOKEN=<your_whatsapp_access_token>
   WHATSAPP_PHONE_NUMBER_ID=<your_phone_number_id>
   RABBITMQ_URL=amqp://yarnmarket:<password>@rabbitmq.railway.internal:5672/
   PORT=8082
   ```
7. **Settings → Networking**:
   - ✅ Enable **"Generate Domain"**
   - Note the public URL (needed for WhatsApp webhook)

#### 3.2 conversation-engine (AI Engine)

1. Click **"+ New Service"** → **"GitHub Repo"**
2. Choose: `hellomuba/YarnMarket-AI`
3. Service name: `conversation-engine`
4. **Settings**:
   - Root Directory: `services/conversation-engine`
5. **Environment Variables**:
   ```
   OPENAI_API_KEY=<your_openai_api_key>
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   MONGODB_URI=${{MongoDB.MONGO_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   WEAVIATE_HOST=weaviate.railway.internal
   WEAVIATE_PORT=8080
   WEAVIATE_SCHEME=http
   RAG_SYSTEM_URL=http://rag-system.railway.internal:8004
   PORT=8003
   ENVIRONMENT=production
   ```
6. **Enable public domain** (for API access)

#### 3.3 message-worker (Queue Worker)

1. Click **"+ New Service"** → **"GitHub Repo"**
2. Service name: `message-worker`
3. **Settings**:
   - Root Directory: `services/message-worker`
4. **Environment Variables**:
   ```
   RABBITMQ_URL=amqp://yarnmarket:<password>@rabbitmq.railway.internal:5672/
   CONVERSATION_ENGINE_URL=http://conversation-engine.railway.internal:8003
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   ```
5. **No public domain needed** (internal service)

#### 3.4 dashboard-api (Admin API)

1. Click **"+ New Service"** → **"GitHub Repo"**
2. Service name: `dashboard-api`
3. **Settings**:
   - Root Directory: `services/dashboard-api`
4. **Environment Variables**:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   MONGODB_URI=${{MongoDB.MONGO_URL}}
   CLICKHOUSE_HOST=clickhouse.railway.internal
   CLICKHOUSE_PORT=8123
   CLICKHOUSE_USER=default
   CLICKHOUSE_PASSWORD=<clickhouse_password>
   PORT=8005
   ENVIRONMENT=production
   ```
5. **Enable public domain**

#### 3.5 merchant-api (Merchant API)

1. Click **"+ New Service"** → **"GitHub Repo"**
2. Service name: `merchant-api`
3. **Settings**:
   - Root Directory: `services/merchant-api`
4. **Environment Variables**:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<generate_strong_random_string>
   JWT_EXPIRATION=7d
   PORT=3005
   NODE_ENV=production
   ```
5. **Enable public domain**

#### 3.6 rag-system (Vector Search)

1. Click **"+ New Service"** → **"GitHub Repo"**
2. Service name: `rag-system`
3. **Settings**:
   - Root Directory: `services/rag-system`
4. **Environment Variables**:
   ```
   WEAVIATE_HOST=weaviate.railway.internal
   WEAVIATE_PORT=8080
   WEAVIATE_SCHEME=http
   OPENAI_API_KEY=<your_openai_api_key>
   PORT=8004
   ENVIRONMENT=production
   ```
5. **No public domain needed**

#### 3.7 analytics-service (Analytics)

1. Click **"+ New Service"** → **"GitHub Repo"**
2. Service name: `analytics-service`
3. **Settings**:
   - Root Directory: `services/analytics-service`
4. **Environment Variables**:
   ```
   CLICKHOUSE_HOST=clickhouse.railway.internal
   CLICKHOUSE_PORT=8123
   CLICKHOUSE_USER=default
   CLICKHOUSE_PASSWORD=<clickhouse_password>
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   PORT=8006
   ```

---

### Step 4: Deploy Frontend Applications

#### 4.1 vendor-dashboard (Vendor UI)

1. Click **"+ New Service"** → **"GitHub Repo"**
2. Service name: `vendor-dashboard`
3. **Settings**:
   - Root Directory: `web/dashboard`
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://<conversation-engine-url>.railway.app
   NEXT_PUBLIC_MERCHANT_API_URL=https://<merchant-api-url>.railway.app
   NEXT_PUBLIC_DASHBOARD_API_URL=https://<dashboard-api-url>.railway.app
   NEXT_PUBLIC_APP_NAME=YarnMarket AI
   ```
   Replace `<...-url>` with actual Railway domains
5. **Enable public domain**
6. **Note the URL** - this is your vendor dashboard

#### 4.2 admin-dashboard (Admin UI)

1. Click **"+ New Service"** → **"GitHub Repo"**
2. Service name: `admin-dashboard`
3. **Settings**:
   - Root Directory: `apps/dashboard-nextjs`
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_DASHBOARD_API_URL=https://<dashboard-api-url>.railway.app
   NEXT_PUBLIC_ANALYTICS_API_URL=https://<analytics-service-url>.railway.app
   NEXT_PUBLIC_APP_NAME=YarnMarket Admin
   ```
5. **Enable public domain**

---

## WhatsApp Webhook Configuration

### Get Your Webhook URL

After deploying `webhook-handler`, get the public URL:
```
https://<your-webhook-handler>.railway.app/webhook
```

### Configure in Meta Developer Console

1. **Go to** [Meta for Developers](https://developers.facebook.com)
2. **Select your app** (or create new WhatsApp Business app)
3. Navigate to **WhatsApp → Configuration**
4. **Edit Webhook**:
   - Callback URL: `https://<your-webhook-handler>.railway.app/webhook`
   - Verify Token: (same as `WHATSAPP_VERIFY_TOKEN` in your env vars)
5. Click **"Verify and Save"**
6. **Subscribe to webhook fields**:
   - ✅ `messages`
   - ✅ `message_status`

### Test Webhook

1. **Send a test message** to your WhatsApp Business number
2. **Check logs** in Railway:
   ```bash
   railway logs -s webhook-handler
   ```
3. **Verify** message appears in logs

---

## Database Initialization

### Initialize PostgreSQL Schema

You have two options:

#### Option A: Using Railway CLI

```bash
# Connect to your Railway PostgreSQL
railway run psql $DATABASE_URL -f scripts/init-db.sql
```

#### Option B: Using Railway Dashboard

1. **Go to** PostgreSQL service
2. **Click "Data" tab**
3. **Open Query Editor**
4. **Copy and paste** contents of `scripts/init-db.sql`
5. **Execute** the SQL script

#### Option C: Using psql directly

1. **Get DATABASE_URL** from Railway PostgreSQL service
2. **Run**:
   ```bash
   psql "<DATABASE_URL>" -f scripts/init-db.sql
   ```

### Verify Database

```bash
# Connect to database
railway run psql $DATABASE_URL

# Check tables
\dt

# Should see tables like:
# - merchants
# - customers
# - products
# - conversations
# - messages
# etc.
```

---

## Verification & Testing

### 1. Check Service Health

Test all services are running:

```bash
# Webhook Handler
curl https://<webhook-handler-url>.railway.app/health

# Conversation Engine
curl https://<conversation-engine-url>.railway.app/health

# Dashboard API
curl https://<dashboard-api-url>.railway.app/health

# RAG System (internal, test from Railway CLI)
railway run -s rag-system curl http://localhost:8004/health
```

Expected response: `{"status": "healthy"}` or similar

### 2. Test Message Flow

1. **Send WhatsApp message** to your business number
2. **Check logs**:
   ```bash
   railway logs -s webhook-handler -f
   railway logs -s message-worker -f
   railway logs -s conversation-engine -f
   ```
3. **Verify** message flows through all services
4. **Check** you receive a response on WhatsApp

### 3. Test RAG System

```bash
# Index a test product
curl -X POST https://<conversation-engine-url>.railway.app/merchant/1/catalog/index

# Check RAG stats
curl https://<conversation-engine-url>.railway.app/rag/1/stats
```

### 4. Access Dashboards

1. **Vendor Dashboard**: `https://<vendor-dashboard-url>.railway.app`
2. **Admin Dashboard**: `https://<admin-dashboard-url>.railway.app`

---

## Monitoring & Logs

### View Logs in Railway

```bash
# All services
railway logs

# Specific service
railway logs -s webhook-handler
railway logs -s conversation-engine

# Follow logs (real-time)
railway logs -s message-worker -f
```

### Railway Dashboard Monitoring

1. **Go to each service** in Railway Dashboard
2. **Metrics tab** shows:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count
3. **Deployments tab** shows build logs
4. **Logs tab** shows runtime logs

### Set Up Alerts

1. **Railway Settings** → **Integrations**
2. **Add** Slack/Discord webhook for deployment notifications
3. **Monitor** resource usage to avoid unexpected costs

---

## Troubleshooting

### Common Issues

#### 1. Service Won't Start

**Check**:
- Build logs in Railway Dashboard
- Missing environment variables
- Syntax errors in code

**Fix**:
```bash
# View build logs
railway logs -s <service-name>

# Trigger rebuild
railway up -s <service-name>
```

#### 2. Database Connection Failed

**Check**:
- PostgreSQL/MongoDB/Redis is running (Active status)
- `DATABASE_URL` is correct
- Service has network access

**Fix**:
- Use Railway reference variables: `${{Postgres.DATABASE_URL}}`
- Check "Service Variables" tab in Railway

#### 3. RabbitMQ Connection Error

**Check**:
- RabbitMQ service is running
- Credentials match in all services
- Internal networking is correct

**Fix**:
- Use: `amqp://yarnmarket:<password>@rabbitmq.railway.internal:5672/`
- Verify password matches `RABBITMQ_DEFAULT_PASS`

#### 4. Weaviate Not Accessible

**Check**:
- Weaviate service is Active
- Volume is mounted at `/var/lib/weaviate`
- Environment variables are set

**Fix**:
```bash
# Test from another service
railway run -s conversation-engine curl http://weaviate.railway.internal:8080/v1/.well-known/ready
```

#### 5. WhatsApp Webhook Verification Failed

**Check**:
- `WHATSAPP_VERIFY_TOKEN` matches in both Railway and Meta console
- Webhook handler has public domain enabled
- URL is correct: `https://<domain>.railway.app/webhook`

**Fix**:
- Check webhook-handler logs during verification
- Ensure service is running before verification

#### 6. Frontend Can't Connect to API

**Check**:
- API services have public domains enabled
- `NEXT_PUBLIC_API_URL` variables are correct
- CORS is configured in backend

**Fix**:
- Update frontend environment variables with correct URLs
- Add frontend domain to backend CORS settings

### Get Help

1. **Railway Discord**: https://discord.gg/railway
2. **Railway Docs**: https://docs.railway.app
3. **YarnMarket Issues**: https://github.com/hellomuba/YarnMarket-AI/issues

---

## Cost Optimization

### Railway Pricing

- **Free Tier**: $5 credit/month
- **Pro Plan**: $20/month + usage
- **Usage charges**: CPU, memory, bandwidth

### Optimization Tips

1. **Use smaller instances** for low-traffic services
2. **Enable sleep mode** for development environments
3. **Monitor resource usage** regularly
4. **Use caching** (Redis) to reduce database queries
5. **Optimize Docker images** (multi-stage builds)

### Resource Limits

Set resource limits for each service:
1. **Service Settings** → **Resources**
2. **Set**:
   - Memory limit (e.g., 512MB for small services)
   - CPU limit (e.g., 1 vCPU)
3. **Monitor** and adjust based on usage

---

## Next Steps

After successful deployment:

1. ✅ **Add merchant accounts** via admin dashboard
2. ✅ **Upload product catalogs**
3. ✅ **Configure cultural intelligence settings**
4. ✅ **Test conversation flows**
5. ✅ **Set up monitoring and alerts**
6. ✅ **Configure backup strategy**
7. ✅ **Document your deployment** (custom domains, etc.)

---

## Useful Commands Reference

```bash
# Railway CLI Commands
railway login                    # Login to Railway
railway link <project-id>        # Link to project
railway status                   # Show project status
railway logs                     # View all logs
railway logs -s <service>        # View service logs
railway logs -f                  # Follow logs
railway run <command>            # Run command in Railway environment
railway up                       # Deploy current directory
railway up -s <service>          # Deploy specific service
railway variables               # List environment variables
railway variables set KEY=value  # Set environment variable
railway open                     # Open project in browser

# Database Commands
railway run psql $DATABASE_URL              # Connect to PostgreSQL
railway run mongosh $MONGO_URL              # Connect to MongoDB
railway run redis-cli -u $REDIS_URL         # Connect to Redis

# Health Checks
curl https://<service-url>/health           # Check service health
```

---

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/hellomuba/YarnMarket-AI/issues
- **Railway Support**: support@railway.app
- **Documentation**: This file and `RAILWAY_ENV_TEMPLATE.md`

---

**Your Railway Project**: https://railway.app/project/2e108d5e-72e9-47d8-859a-dedd14a21244

**GitHub Repository**: https://github.com/hellomuba/YarnMarket-AI
