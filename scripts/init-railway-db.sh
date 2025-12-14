#!/bin/bash

# YarnMarket AI - Railway Database Initialization Script
# This script initializes the PostgreSQL database on Railway

set -e

echo "========================================"
echo "Railway Database Initialization"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}ERROR: Railway CLI not found!${NC}"
    echo -e "${YELLOW}Please install: npm install -g @railway/cli${NC}"
    exit 1
fi

# Check if init-db.sql exists
if [ ! -f "scripts/init-db.sql" ]; then
    echo -e "${RED}ERROR: init-db.sql not found!${NC}"
    echo -e "${YELLOW}Please run this script from the project root directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}This script will initialize the PostgreSQL database on Railway.${NC}"
echo -e "${YELLOW}Make sure you have linked to your Railway project first.${NC}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo -e "${CYAN}Initializing database schema...${NC}"
echo ""

# Run the init script
railway run psql "\$DATABASE_URL" -f scripts/init-db.sql

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}SUCCESS: Database initialized!${NC}"
    echo ""
    echo -e "${CYAN}Verifying tables...${NC}"
    echo ""

    # Verify tables were created
    railway run psql "\$DATABASE_URL" -c "\dt"

    echo ""
    echo -e "${GREEN}Database initialization complete!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Create a merchant account via admin dashboard"
    echo "2. Upload product catalog"
    echo "3. Test the conversation flow"
else
    echo ""
    echo -e "${RED}ERROR: Database initialization failed!${NC}"
    echo -e "${YELLOW}Please check the error messages above.${NC}"
    exit 1
fi
