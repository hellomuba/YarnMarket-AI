# YarnMarket AI - Railway Deployment Script
# This script automates the deployment of all services to Railway

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YarnMarket AI - Railway Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "Checking Railway CLI installation..." -ForegroundColor Yellow
$railwayCli = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayCli) {
    Write-Host "ERROR: Railway CLI not found!" -ForegroundColor Red
    Write-Host "Please install Railway CLI: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}
Write-Host "Railway CLI found!" -ForegroundColor Green
Write-Host ""

# Set project ID
$PROJECT_ID = "2e108d5e-72e9-47d8-859a-dedd14a21244"
Write-Host "Using Railway Project ID: $PROJECT_ID" -ForegroundColor Cyan
Write-Host ""

# Link to Railway project
Write-Host "Linking to Railway project..." -ForegroundColor Yellow
railway link $PROJECT_ID

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with all required environment variables." -ForegroundColor Yellow
    Write-Host "See .env.example for reference." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Do you want to continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Function to deploy a service
function Deploy-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [string]$Description
    )

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Deploying: $ServiceName" -ForegroundColor Cyan
    Write-Host "Path: $ServicePath" -ForegroundColor Gray
    Write-Host "Description: $Description" -ForegroundColor Gray
    Write-Host "========================================" -ForegroundColor Cyan

    # Check if service path exists
    if (-not (Test-Path $ServicePath)) {
        Write-Host "ERROR: Service path not found: $ServicePath" -ForegroundColor Red
        return $false
    }

    # Deploy using Railway CLI
    Push-Location $ServicePath
    Write-Host "Deploying from: $ServicePath" -ForegroundColor Yellow
    railway up -d

    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: $ServiceName deployed!" -ForegroundColor Green
        Pop-Location
        return $true
    } else {
        Write-Host "ERROR: Failed to deploy $ServiceName" -ForegroundColor Red
        Pop-Location
        return $false
    }
}

# Step 1: Deploy Infrastructure Services (if not already deployed)
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "STEP 1: Infrastructure Services" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Please ensure the following services are deployed in your Railway project:" -ForegroundColor Yellow
Write-Host "  1. PostgreSQL" -ForegroundColor White
Write-Host "  2. MongoDB" -ForegroundColor White
Write-Host "  3. Redis" -ForegroundColor White
Write-Host "  4. RabbitMQ (Docker image: rabbitmq:3-management)" -ForegroundColor White
Write-Host "  5. Weaviate (Docker image: semitechnologies/weaviate:latest)" -ForegroundColor White
Write-Host "  6. ClickHouse (Docker image: clickhouse/clickhouse-server:latest)" -ForegroundColor White
Write-Host ""
Write-Host "You can add these from Railway Dashboard > New Service > Database/Docker Image" -ForegroundColor Yellow
Write-Host ""
$infraReady = Read-Host "Have you deployed all infrastructure services? (y/n)"
if ($infraReady -ne "y") {
    Write-Host "Please deploy infrastructure services first, then run this script again." -ForegroundColor Yellow
    exit 1
}

# Step 2: Deploy Application Services
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "STEP 2: Application Services" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$services = @(
    @{
        Name = "webhook-handler"
        Path = "services/webhook-handler"
        Description = "WhatsApp webhook handler (Go)"
    },
    @{
        Name = "conversation-engine"
        Path = "services/conversation-engine"
        Description = "AI conversation engine (Python FastAPI)"
    },
    @{
        Name = "message-worker"
        Path = "services/message-worker"
        Description = "RabbitMQ message worker (Python)"
    },
    @{
        Name = "dashboard-api"
        Path = "services/dashboard-api"
        Description = "Admin dashboard API (Python FastAPI)"
    },
    @{
        Name = "merchant-api"
        Path = "services/merchant-api"
        Description = "Merchant operations API (NestJS)"
    },
    @{
        Name = "rag-system"
        Path = "services/rag-system"
        Description = "RAG vector search system (Python)"
    },
    @{
        Name = "analytics-service"
        Path = "services/analytics-service"
        Description = "Analytics service (Python)"
    }
)

$successCount = 0
$failCount = 0

foreach ($service in $services) {
    $result = Deploy-Service -ServiceName $service.Name -ServicePath $service.Path -Description $service.Description
    if ($result) {
        $successCount++
    } else {
        $failCount++
    }
    Start-Sleep -Seconds 2
}

# Step 3: Deploy Frontend Applications
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "STEP 3: Frontend Applications" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$frontendServices = @(
    @{
        Name = "vendor-dashboard"
        Path = "web/dashboard"
        Description = "Vendor dashboard (Next.js 14)"
    },
    @{
        Name = "admin-dashboard"
        Path = "apps/dashboard-nextjs"
        Description = "Admin dashboard (Next.js 15)"
    }
)

foreach ($service in $frontendServices) {
    $result = Deploy-Service -ServiceName $service.Name -ServicePath $service.Path -Description $service.Description
    if ($result) {
        $successCount++
    } else {
        $failCount++
    }
    Start-Sleep -Seconds 2
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Successfully deployed: $successCount services" -ForegroundColor Green
Write-Host "Failed deployments: $failCount services" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "All services deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Set environment variables for each service in Railway Dashboard" -ForegroundColor White
    Write-Host "2. Configure WhatsApp webhook URL (see RAILWAY_SETUP.md)" -ForegroundColor White
    Write-Host "3. Initialize database schema" -ForegroundColor White
    Write-Host "4. Test the deployment" -ForegroundColor White
} else {
    Write-Host "Some deployments failed. Please check the errors above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Visit your Railway project: https://railway.app/project/$PROJECT_ID" -ForegroundColor Cyan
Write-Host ""
