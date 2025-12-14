# Railway Environment Variables Template

This document lists all environment variables required for each service in Railway.

## How to Set Environment Variables in Railway

1. Go to your Railway project: https://railway.app/project/2e108d5e-72e9-47d8-859a-dedd14a21244
2. Click on a service
3. Go to "Variables" tab
4. Add the variables listed below for that service
5. Use Railway's **Reference Variables** feature to reference other services (e.g., `${{Postgres.DATABASE_URL}}`)

---

## Infrastructure Services

### PostgreSQL
No additional configuration needed. Railway automatically provides:
- `DATABASE_URL` (use this in other services as `${{Postgres.DATABASE_URL}}`)

### MongoDB
No additional configuration needed. Railway automatically provides:
- `MONGO_URL` (use this in other services as `${{MongoDB.MONGO_URL}}`)

### Redis
No additional configuration needed. Railway automatically provides:
- `REDIS_URL` (use this in other services as `${{Redis.REDIS_URL}}`)

### RabbitMQ (Docker Image: `rabbitmq:3-management`)
Set these environment variables:
```
RABBITMQ_DEFAULT_USER=yarnmarket
RABBITMQ_DEFAULT_PASS=<generate_strong_password>
```

Railway will expose:
- Internal URL: `amqp://yarnmarket:<password>@rabbitmq.railway.internal:5672/`
- Management UI: Port 15672 (enable public domain to access)

### Weaviate (Docker Image: `semitechnologies/weaviate:latest`)
Set these environment variables:
```
AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true
PERSISTENCE_DATA_PATH=/var/lib/weaviate
DEFAULT_VECTORIZER_MODULE=none
ENABLE_MODULES=text2vec-openai
CLUSTER_HOSTNAME=weaviate
```

Add a **Volume**:
- Mount Path: `/var/lib/weaviate`
- Size: 10GB (adjust based on your needs)

### ClickHouse (Docker Image: `clickhouse/clickhouse-server:latest`)
Set these environment variables:
```
CLICKHOUSE_DB=yarnmarket
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=<generate_strong_password>
```

Add a **Volume**:
- Mount Path: `/var/lib/clickhouse`
- Size: 20GB (adjust based on your needs)

---

## Application Services

### 1. webhook-handler (Go)

**Root Directory**: `services/webhook-handler`

**Environment Variables**:
```
# WhatsApp Configuration
WHATSAPP_VERIFY_TOKEN=<your_verify_token>
WHATSAPP_ACCESS_TOKEN=<your_whatsapp_access_token>
WHATSAPP_PHONE_NUMBER_ID=<your_phone_number_id>
WHATSAPP_BUSINESS_ACCOUNT_ID=<your_business_account_id>

# RabbitMQ
RABBITMQ_URL=amqp://yarnmarket:<password>@rabbitmq.railway.internal:5672/

# Server
PORT=8082
```

**Public Domain**: ✅ ENABLE (needed for WhatsApp webhook)

---

### 2. conversation-engine (Python FastAPI)

**Root Directory**: `services/conversation-engine`

**Environment Variables**:
```
# OpenAI
OPENAI_API_KEY=<your_openai_api_key>

# Database URLs (use Railway references)
DATABASE_URL=${{Postgres.DATABASE_URL}}
MONGODB_URI=${{MongoDB.MONGO_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Weaviate
WEAVIATE_HOST=weaviate.railway.internal
WEAVIATE_PORT=8080
WEAVIATE_SCHEME=http

# Internal Services
RAG_SYSTEM_URL=http://rag-system.railway.internal:8004

# Server
PORT=8003
ENVIRONMENT=production

# Optional: Logging
LOG_LEVEL=INFO
```

**Public Domain**: ✅ ENABLE (for frontend access)

---

### 3. message-worker (Python)

**Root Directory**: `services/message-worker`

**Environment Variables**:
```
# RabbitMQ
RABBITMQ_URL=amqp://yarnmarket:<password>@rabbitmq.railway.internal:5672/

# Conversation Engine
CONVERSATION_ENGINE_URL=http://conversation-engine.railway.internal:8003

# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Logging
LOG_LEVEL=INFO
```

**Public Domain**: ❌ No (internal service only)

---

### 4. dashboard-api (Python FastAPI)

**Root Directory**: `services/dashboard-api`

**Environment Variables**:
```
# Database URLs
DATABASE_URL=${{Postgres.DATABASE_URL}}
MONGODB_URI=${{MongoDB.MONGO_URL}}

# ClickHouse
CLICKHOUSE_HOST=clickhouse.railway.internal
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=<same_as_clickhouse_password>

# Server
PORT=8005
ENVIRONMENT=production

# CORS (update with your frontend URLs)
CORS_ORIGINS=https://your-vendor-dashboard.railway.app,https://your-admin-dashboard.railway.app
```

**Public Domain**: ✅ ENABLE (for frontend access)

---

### 5. merchant-api (NestJS)

**Root Directory**: `services/merchant-api`

**Environment Variables**:
```
# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
JWT_SECRET=<generate_strong_random_string>
JWT_EXPIRATION=7d

# Server
PORT=3005
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-vendor-dashboard.railway.app
```

**Public Domain**: ✅ ENABLE (for frontend access)

---

### 6. rag-system (Python FastAPI)

**Root Directory**: `services/rag-system`

**Environment Variables**:
```
# Weaviate
WEAVIATE_HOST=weaviate.railway.internal
WEAVIATE_PORT=8080
WEAVIATE_SCHEME=http

# OpenAI
OPENAI_API_KEY=<your_openai_api_key>

# Server
PORT=8004
ENVIRONMENT=production
```

**Public Domain**: ❌ No (internal service only)

---

### 7. analytics-service (Python)

**Root Directory**: `services/analytics-service`

**Environment Variables**:
```
# ClickHouse
CLICKHOUSE_HOST=clickhouse.railway.internal
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=<same_as_clickhouse_password>

# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Server
PORT=8006
ENVIRONMENT=production
```

**Public Domain**: ❌ No (internal service only)

---

## Frontend Applications

### 8. vendor-dashboard (Next.js 14)

**Root Directory**: `web/dashboard`

**Environment Variables**:
```
# API URLs (use your Railway public domains)
NEXT_PUBLIC_API_URL=https://conversation-engine-production.railway.app
NEXT_PUBLIC_MERCHANT_API_URL=https://merchant-api-production.railway.app
NEXT_PUBLIC_DASHBOARD_API_URL=https://dashboard-api-production.railway.app

# Weaviate (if accessed from frontend)
NEXT_PUBLIC_WEAVIATE_URL=https://weaviate-production.railway.app

# App Configuration
NEXT_PUBLIC_APP_NAME=YarnMarket AI
NEXT_PUBLIC_APP_URL=https://your-vendor-dashboard.railway.app

# Server-side only
SECRET_KEY=<generate_strong_random_string>
```

**Public Domain**: ✅ ENABLE

---

### 9. admin-dashboard (Next.js 15)

**Root Directory**: `apps/dashboard-nextjs`

**Environment Variables**:
```
# API URLs
NEXT_PUBLIC_DASHBOARD_API_URL=https://dashboard-api-production.railway.app
NEXT_PUBLIC_ANALYTICS_API_URL=https://analytics-service-production.railway.app

# App Configuration
NEXT_PUBLIC_APP_NAME=YarnMarket Admin
NEXT_PUBLIC_APP_URL=https://your-admin-dashboard.railway.app

# WebSocket (for real-time updates)
NEXT_PUBLIC_WS_URL=wss://dashboard-api-production.railway.app

# Server-side only
SECRET_KEY=<generate_strong_random_string>
```

**Public Domain**: ✅ ENABLE

---

## Quick Setup Checklist

- [ ] PostgreSQL deployed and running
- [ ] MongoDB deployed and running
- [ ] Redis deployed and running
- [ ] RabbitMQ deployed with credentials
- [ ] Weaviate deployed with volume
- [ ] ClickHouse deployed with volume and credentials
- [ ] webhook-handler deployed with public domain
- [ ] conversation-engine deployed with all environment variables
- [ ] message-worker deployed
- [ ] dashboard-api deployed with public domain
- [ ] merchant-api deployed with public domain
- [ ] rag-system deployed
- [ ] analytics-service deployed
- [ ] vendor-dashboard deployed with public domain
- [ ] admin-dashboard deployed with public domain
- [ ] All services showing "Active" status in Railway
- [ ] Database schema initialized
- [ ] WhatsApp webhook configured

---

## Important Notes

### Railway Internal Networking
Railway provides internal networking between services using the pattern:
```
{service-name}.railway.internal:{port}
```

Example:
- `postgres.railway.internal:5432`
- `weaviate.railway.internal:8080`
- `conversation-engine.railway.internal:8003`

### Using Reference Variables
Instead of hardcoding database URLs, use Railway's reference syntax:
```
${{ServiceName.VARIABLE_NAME}}
```

Example:
- `${{Postgres.DATABASE_URL}}`
- `${{MongoDB.MONGO_URL}}`
- `${{Redis.REDIS_URL}}`

### Generating Strong Secrets
Use these commands to generate strong secrets:
```bash
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Bash
openssl rand -base64 32
```

### Service Dependencies
Ensure services are deployed in this order:
1. Infrastructure (databases, queues)
2. Core services (rag-system, conversation-engine)
3. Worker services (message-worker)
4. API services (dashboard-api, merchant-api)
5. Frontend applications
