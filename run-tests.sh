#!/bin/bash

# Main Test Runner Script
# Comprehensive test execution for the entire platform

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo ""
echo "${CYAN}╔════════════════════════════════════════╗${NC}"
echo "${CYAN}║                                        ║${NC}"
echo "${CYAN}║     MediPay Platform Test Suite       ║${NC}"
echo "${CYAN}║                                        ║${NC}"
echo "${CYAN}╔════════════════════════════════════════╗${NC}"
echo ""

# Check if backend is running
echo "${YELLOW}Checking backend status...${NC}"
if curl -s http://localhost:4000/health | grep -q "ok"; then
    echo "${GREEN}✓ Backend is running${NC}"
    BACKEND_RUNNING=true
else
    echo "${RED}✗ Backend is not running${NC}"
    echo "${YELLOW}Starting backend in background...${NC}"
    cd server
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    echo "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    echo "${YELLOW}Waiting for backend to be ready...${NC}"
    sleep 5
    BACKEND_RUNNING=false
fi

# Test categories
run_category() {
    local category=$1
    local command=$2
    local description=$3
    
    echo ""
    echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${CYAN}Testing: $description${NC}"
    echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if eval $command; then
        echo "${GREEN}✓ $description - PASSED${NC}"
        return 0
    else
        echo "${RED}✗ $description - FAILED${NC}"
        return 1
    fi
}

# Track results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test 1: Setup validation
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_category "SETUP" "bash tests/setup.sh" "Environment Setup"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test 2: Smart Contracts (if Sui is available)
if command -v sui &> /dev/null; then
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if run_category "CONTRACTS" "bash tests/contract.test.sh" "Smart Contracts"; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    echo ""
    echo "${YELLOW}⚠ Sui CLI not found - skipping contract tests${NC}"
fi

# Test 3: Backend API
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_category "API" "cd server && npm run test:api" "Backend API"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test 4: RLS Verification
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_category "SECURITY" "cd server && npm run verify:rls" "Row Level Security"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test 5: End-to-End
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_category "E2E" "bash tests/e2e.test.sh" "End-to-End Tests"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test 6: Integration Tests
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if run_category "INTEGRATION" "npm run test:integration" "Integration Tests"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Cleanup
if [ "$BACKEND_RUNNING" = false ]; then
    echo ""
    echo "${YELLOW}Stopping backend...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    echo "${GREEN}✓ Backend stopped${NC}"
fi

# Final Results
echo ""
echo "${CYAN}╔════════════════════════════════════════╗${NC}"
echo "${CYAN}║                                        ║${NC}"
echo "${CYAN}║          Test Results Summary          ║${NC}"
echo "${CYAN}║                                        ║${NC}"
echo "${CYAN}╔════════════════════════════════════════╗${NC}"
echo ""
echo "  Total Tests:   ${TOTAL_TESTS}"
echo "  ${GREEN}Passed:        ${PASSED_TESTS}${NC}"
echo "  ${RED}Failed:        ${FAILED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo "${GREEN}║                                        ║${NC}"
    echo "${GREEN}║     ✓ ALL TESTS PASSED!                ║${NC}"
    echo "${GREEN}║                                        ║${NC}"
    echo "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo ""
    exit 0
else
    echo "${RED}╔════════════════════════════════════════╗${NC}"
    echo "${RED}║                                        ║${NC}"
    echo "${RED}║     ✗ SOME TESTS FAILED                ║${NC}"
    echo "${RED}║                                        ║${NC}"
    echo "${RED}╔════════════════════════════════════════╗${NC}"
    echo ""
    echo "${YELLOW}Please review the logs above for details${NC}"
    echo ""
    exit 1
fi

