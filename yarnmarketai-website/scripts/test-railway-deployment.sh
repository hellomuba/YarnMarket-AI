#!/bin/bash

# YarnMarket AI - Railway Deployment Test Script
# This script tests all deployed services to ensure they're working

set -e

echo "========================================"
echo "YarnMarket AI - Deployment Test"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test HTTP endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}

    echo -n "Testing $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

    if [ "$response" -eq "$expected_status" ] || [ "$response" -eq 200 ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $response)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}FAIL${NC} (HTTP $response, expected $expected_status)"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo -e "${YELLOW}Enter your Railway service URLs:${NC}"
echo -e "${CYAN}(Press Enter to skip a service)${NC}"
echo ""

# Get service URLs from user
read -p "Webhook Handler URL: " WEBHOOK_URL
read -p "Conversation Engine URL: " CONVERSATION_URL
read -p "Dashboard API URL: " DASHBOARD_URL
read -p "Merchant API URL: " MERCHANT_URL
read -p "Vendor Dashboard URL: " VENDOR_DASHBOARD_URL
read -p "Admin Dashboard URL: " ADMIN_DASHBOARD_URL

echo ""
echo "========================================"
echo -e "${CYAN}Running Health Checks${NC}"
echo "========================================"
echo ""

# Test webhook handler
if [ ! -z "$WEBHOOK_URL" ]; then
    test_endpoint "Webhook Handler" "$WEBHOOK_URL/health"
fi

# Test conversation engine
if [ ! -z "$CONVERSATION_URL" ]; then
    test_endpoint "Conversation Engine" "$CONVERSATION_URL/health"
fi

# Test dashboard API
if [ ! -z "$DASHBOARD_URL" ]; then
    test_endpoint "Dashboard API" "$DASHBOARD_URL/health"
fi

# Test merchant API
if [ ! -z "$MERCHANT_URL" ]; then
    test_endpoint "Merchant API" "$MERCHANT_URL/health"
fi

# Test vendor dashboard (might be 200 or 404 depending on route)
if [ ! -z "$VENDOR_DASHBOARD_URL" ]; then
    test_endpoint "Vendor Dashboard" "$VENDOR_DASHBOARD_URL"
fi

# Test admin dashboard
if [ ! -z "$ADMIN_DASHBOARD_URL" ]; then
    test_endpoint "Admin Dashboard" "$ADMIN_DASHBOARD_URL"
fi

echo ""
echo "========================================"
echo -e "${CYAN}Testing API Endpoints${NC}"
echo "========================================"
echo ""

# Test conversation engine endpoints
if [ ! -z "$CONVERSATION_URL" ]; then
    echo -n "Testing Conversation Engine - RAG Stats... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$CONVERSATION_URL/rag/1/stats" 2>/dev/null || echo "000")
    if [ "$response" -eq 200 ] || [ "$response" -eq 404 ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $response)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}FAIL${NC} (HTTP $response)"
        ((TESTS_FAILED++))
    fi
fi

# Test dashboard API endpoints
if [ ! -z "$DASHBOARD_URL" ]; then
    echo -n "Testing Dashboard API - Merchants List... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$DASHBOARD_URL/merchants" 2>/dev/null || echo "000")
    if [ "$response" -eq 200 ] || [ "$response" -eq 401 ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $response)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}FAIL${NC} (HTTP $response)"
        ((TESTS_FAILED++))
    fi
fi

echo ""
echo "========================================"
echo -e "${CYAN}Test Summary${NC}"
echo "========================================"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! Deployment is healthy.${NC}"
    exit 0
else
    echo -e "${YELLOW}Some tests failed. Please check the services above.${NC}"
    exit 1
fi
