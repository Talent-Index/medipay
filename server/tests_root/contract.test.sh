#!/bin/bash

# Smart Contract Test Runner
# Tests Sui Move contracts

set -e

echo "🧪 Running Smart Contract Tests..."
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to contracts directory
cd medipay_contracts

echo ""
echo "${YELLOW}1. Building Move contracts...${NC}"
sui move build
echo "${GREEN}✓ Build successful${NC}"

echo ""
echo "${YELLOW}2. Running Move tests...${NC}"
sui move test
echo "${GREEN}✓ Tests passed${NC}"

echo ""
echo "${YELLOW}3. Checking contract syntax...${NC}"
sui move build --lint
echo "${GREEN}✓ Syntax check passed${NC}"

echo ""
echo "${YELLOW}4. Running test coverage analysis...${NC}"
sui move test --coverage
echo "${GREEN}✓ Coverage analysis complete${NC}"

echo ""
echo "${GREEN}✅ All smart contract tests passed!${NC}"
echo "=================================="

