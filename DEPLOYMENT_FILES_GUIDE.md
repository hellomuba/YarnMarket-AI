# Railway Deployment Files - Guide

This document explains all the Railway deployment files created for YarnMarket AI.

## Overview

The YarnMarket AI project has been equipped with automated Railway deployment tools to streamline the deployment process. All necessary configuration files, scripts, and documentation have been created.

## File Structure

```
YarnMarket AI/
├── railway.toml                          # Project-wide Railway config
├── .railwayignore                        # Files to exclude from deployment
├── deploy-railway.ps1                    # Automated deployment (PowerShell)
├── deploy-railway.sh                     # Automated deployment (Bash)
├── RAILWAY_SETUP.md                      # Complete deployment guide
├── RAILWAY_QUICKSTART.md                 # Quick 30-min deployment guide
├── RAILWAY_ENV_TEMPLATE.md               # Environment variables reference
├── DEPLOYMENT_FILES_GUIDE.md             # This file
├── services/
│   ├── webhook-handler/
│   │   └── railway.json                  # Service-specific config
│   ├── conversation-engine/
│   │   └── railway.json
│   ├── message-worker/
│   │   └── railway.json
│   ├── dashboard-api/
│   │   └── railway.json
│   ├── merchant-api/
│   │   └── railway.json
│   ├── rag-system/
│   │   └── railway.json
│   └── analytics-service/
│       └── railway.json
├── web/
│   └── dashboard/
│       └── railway.json
├── apps/
│   └── dashboard-nextjs/
│       └── railway.json
└── scripts/
    ├── init-railway-db.sh                # Database init (Bash)
    ├── init-railway-db.ps1               # Database init (PowerShell)
    └── test-railway-deployment.sh        # Deployment verification
```

## Files Explained

### 1. Configuration Files

#### `railway.toml`
- **Purpose**: Project-wide Railway configuration
- **Contents**: Build and deployment settings for all services
- **When to use**: Automatically used by Railway when deploying

#### `.railwayignore`
- **Purpose**: Exclude unnecessary files from Railway deployments
- **Similar to**: `.gitignore` but for Railway
- **Benefits**: Faster deployments, smaller image sizes, no secrets uploaded

#### `services/*/railway.json`
- **Purpose**: Service-specific Railway configuration
- **What it defines**:
  - Build command
  - Start command
  - Restart policy
- **Example** (`webhook-handler/railway.json`):
  ```json
  {
    "build": {
      "builder": "nixpacks",
      "buildCommand": "go build -o webhook-handler"
    },
    "deploy": {
      "startCommand": "./webhook-handler",
      "restartPolicyType": "on_failure"
    }
  }
  ```

### 2. Deployment Scripts

#### `deploy-railway.ps1` (Windows PowerShell)
- **Purpose**: Automated deployment of all services to Railway
- **Usage**:
  ```powershell
  .\deploy-railway.ps1
  ```
- **What it does**:
  1. Checks Railway CLI installation
  2. Links to your Railway project
  3. Prompts to verify infrastructure services are deployed
  4. Deploys all application services sequentially
  5. Deploys frontend applications
  6. Provides deployment summary
- **Interactive**: Asks for confirmation before proceeding
- **Safe**: Won't overwrite services without warning

#### `deploy-railway.sh` (Linux/Mac/Git Bash)
- **Purpose**: Same as PowerShell version but for Unix-like systems
- **Usage**:
  ```bash
  bash deploy-railway.sh
  ```
- **Identical functionality** to PowerShell version

### 3. Database Scripts

#### `scripts/init-railway-db.ps1` (PowerShell)
- **Purpose**: Initialize PostgreSQL database schema on Railway
- **Usage**:
  ```powershell
  .\scripts\init-railway-db.ps1
  ```
- **What it does**:
  1. Checks Railway CLI and database script exist
  2. Runs `scripts/init-db.sql` on Railway PostgreSQL
  3. Verifies tables were created
  4. Lists next steps

#### `scripts/init-railway-db.sh` (Bash)
- **Purpose**: Same as PowerShell version for Unix systems
- **Usage**:
  ```bash
  bash scripts/init-railway-db.sh
  ```

### 4. Testing Scripts

#### `scripts/test-railway-deployment.sh`
- **Purpose**: Verify all deployed services are working correctly
- **Usage**:
  ```bash
  bash scripts/test-railway-deployment.sh
  ```
- **What it tests**:
  - Health endpoints for all services
  - API endpoints availability
  - Frontend accessibility
  - Service response codes
- **Output**: Pass/Fail summary with color coding

### 5. Documentation

#### `RAILWAY_SETUP.md` (Complete Guide)
- **Purpose**: Comprehensive deployment documentation
- **Length**: ~500 lines
- **Contents**:
  - Prerequisites
  - Detailed step-by-step deployment
  - WhatsApp webhook configuration
  - Database initialization
  - Verification and testing
  - Troubleshooting
  - Cost optimization
  - Monitoring
- **When to use**: First-time deployment or troubleshooting

#### `RAILWAY_QUICKSTART.md` (Quick Guide)
- **Purpose**: Fast-track deployment in 30 minutes
- **Length**: ~150 lines
- **Contents**:
  - 5-step deployment process
  - Quick reference tables
  - Essential commands only
  - Minimal explanations
- **When to use**: When you know what you're doing and want speed

#### `RAILWAY_ENV_TEMPLATE.md` (Environment Variables)
- **Purpose**: Complete reference for all environment variables
- **Length**: ~400 lines
- **Organization**: By service
- **Contents**:
  - Required variables for each service
  - Railway reference variable syntax
  - Public domain settings
  - Sample values
  - Security notes
- **When to use**: Setting up or troubleshooting environment variables

#### `DEPLOYMENT_FILES_GUIDE.md` (This File)
- **Purpose**: Explain all deployment files
- **When to use**: Understanding the deployment system

## How to Use These Files

### Scenario 1: First-Time Deployment

**Recommended Path**:
1. Read `RAILWAY_QUICKSTART.md` (5 min)
2. Run `deploy-railway.ps1` or `deploy-railway.sh`
3. Refer to `RAILWAY_ENV_TEMPLATE.md` while setting environment variables
4. Run `scripts/init-railway-db.ps1` to initialize database
5. Follow WhatsApp webhook setup in `RAILWAY_SETUP.md`
6. Run `scripts/test-railway-deployment.sh` to verify

**Estimated Time**: 30-40 minutes

### Scenario 2: Troubleshooting a Failed Deployment

**Recommended Path**:
1. Check `RAILWAY_SETUP.md` → Troubleshooting section
2. Review service logs in Railway Dashboard
3. Verify environment variables against `RAILWAY_ENV_TEMPLATE.md`
4. Re-run deployment script for failed service

### Scenario 3: Deploying a Single Service

**Recommended Path**:
```bash
# Navigate to service directory
cd services/webhook-handler

# Deploy just this service
railway up -d
```

The `railway.json` in that directory will configure the deployment.

### Scenario 4: Understanding Environment Variables

**Recommended Path**:
1. Open `RAILWAY_ENV_TEMPLATE.md`
2. Find your service section
3. Copy the environment variables
4. Paste into Railway Dashboard → Service → Variables
5. Replace placeholder values with actual credentials

### Scenario 5: Updating a Service

**Recommended Path**:
1. Make code changes
2. Commit and push to GitHub
3. Railway auto-deploys from GitHub
4. **OR** manually trigger: `railway up -s <service-name>`

## Configuration Customization

### Modifying Build Commands

Edit the `railway.json` file in the service directory:

```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm install && npm run build"  // <-- Change this
  }
}
```

### Modifying Start Commands

```json
{
  "deploy": {
    "startCommand": "npm start"  // <-- Change this
  }
}
```

### Adding Service-Specific Environment Variables

Use Railway Dashboard:
1. Go to service
2. Variables tab
3. Add new variable
4. Click "Deploy" to apply changes

### Excluding More Files from Deployment

Edit `.railwayignore`:
```
# Add your patterns
my-local-folder/
*.local.js
```

## Railway Project Information

- **Project ID**: `2e108d5e-72e9-47d8-859a-dedd14a21244`
- **Project URL**: https://railway.app/project/2e108d5e-72e9-47d8-859a-dedd14a21244
- **GitHub Repo**: https://github.com/hellomuba/YarnMarket-AI

## Common Commands

```bash
# Link to project
railway link 2e108d5e-72e9-47d8-859a-dedd14a21244

# Deploy all services (from root)
.\deploy-railway.ps1

# Deploy single service
cd services/webhook-handler
railway up -d

# View logs
railway logs -s webhook-handler -f

# Check status
railway status

# Initialize database
.\scripts\init-railway-db.ps1

# Test deployment
bash scripts/test-railway-deployment.sh

# Open Railway dashboard
railway open
```

## Railway Service Names

When deployed, your services will have these names in Railway:

| Service | Railway Name | Public Domain Needed? |
|---------|--------------|----------------------|
| Webhook Handler | `webhook-handler` | ✅ Yes |
| Conversation Engine | `conversation-engine` | ✅ Yes |
| Message Worker | `message-worker` | ❌ No |
| Dashboard API | `dashboard-api` | ✅ Yes |
| Merchant API | `merchant-api` | ✅ Yes |
| RAG System | `rag-system` | ❌ No |
| Analytics Service | `analytics-service` | ❌ No |
| Vendor Dashboard | `vendor-dashboard` | ✅ Yes |
| Admin Dashboard | `admin-dashboard` | ✅ Yes |

## File Maintenance

### When to Update These Files

#### `railway.json`
- When changing build/start commands
- When updating deployment strategy
- When adding health checks

#### `RAILWAY_ENV_TEMPLATE.md`
- When adding new environment variables
- When services change
- When API URLs change

#### `.railwayignore`
- When adding new folders to exclude
- When adding sensitive files
- When optimizing deployment size

#### Deployment scripts
- When adding new services
- When changing deployment order
- When updating project structure

## Security Notes

### Never Commit These to Git

The following are already in `.gitignore`:
- `.env` files with real credentials
- Private keys
- Access tokens

### Safe to Commit

All files created here are safe to commit:
- `railway.json` files (no secrets)
- Deployment scripts (use variables)
- Documentation files
- `.railwayignore`

### Best Practices

1. **Use Railway Reference Variables**: `${{Postgres.DATABASE_URL}}`
2. **Store secrets in Railway Dashboard**: Not in code
3. **Use `.railwayignore`**: Exclude sensitive files
4. **Rotate credentials regularly**: Especially API keys
5. **Use environment-specific configs**: Dev vs production

## Getting Help

### Documentation
1. **This Guide**: Understanding the files
2. **RAILWAY_QUICKSTART.md**: Fast deployment
3. **RAILWAY_SETUP.md**: Detailed deployment
4. **RAILWAY_ENV_TEMPLATE.md**: Environment variables

### Support Channels
- **GitHub Issues**: https://github.com/hellomuba/YarnMarket-AI/issues
- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Support**: support@railway.app

## Changelog

### 2024-12-13 - Initial Creation
- Created all Railway deployment files
- Added automated deployment scripts
- Created comprehensive documentation
- Added database initialization scripts
- Added deployment verification scripts

## Next Steps

After reviewing this guide:

1. **Start Deployment**: Use `RAILWAY_QUICKSTART.md`
2. **Set Up Environment**: Use `RAILWAY_ENV_TEMPLATE.md`
3. **Configure Services**: Follow `RAILWAY_SETUP.md`
4. **Test Deployment**: Run `test-railway-deployment.sh`
5. **Monitor**: Use Railway Dashboard

---

**Happy Deploying!**

If you have questions, check `RAILWAY_SETUP.md` or open an issue on GitHub.
