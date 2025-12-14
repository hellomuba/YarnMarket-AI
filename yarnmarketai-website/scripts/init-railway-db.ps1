# YarnMarket AI - Railway Database Initialization Script (PowerShell)
# This script initializes the PostgreSQL database on Railway

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Railway Database Initialization" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
$railwayCli = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayCli) {
    Write-Host "ERROR: Railway CLI not found!" -ForegroundColor Red
    Write-Host "Please install: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Check if init-db.sql exists
if (-not (Test-Path "scripts\init-db.sql")) {
    Write-Host "ERROR: init-db.sql not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "This script will initialize the PostgreSQL database on Railway." -ForegroundColor Yellow
Write-Host "Make sure you have linked to your Railway project first." -ForegroundColor Yellow
Write-Host ""
$continue = Read-Host "Continue? (y/n)"
if ($continue -ne "y") {
    exit 1
}

Write-Host ""
Write-Host "Initializing database schema..." -ForegroundColor Cyan
Write-Host ""

# Run the init script
railway run psql "`$DATABASE_URL" -f scripts/init-db.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: Database initialized!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifying tables..." -ForegroundColor Cyan
    Write-Host ""

    # Verify tables were created
    railway run psql "`$DATABASE_URL" -c "\dt"

    Write-Host ""
    Write-Host "Database initialization complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Create a merchant account via admin dashboard" -ForegroundColor White
    Write-Host "2. Upload product catalog" -ForegroundColor White
    Write-Host "3. Test the conversation flow" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "ERROR: Database initialization failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    exit 1
}
