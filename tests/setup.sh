#!/bin/bash

# Test Setup Script
# Prepares the environment for testing

set -e

echo "🔧 Setting up test environment..."
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo ""
echo "${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "${GREEN}✓ Node.js ${NODE_VERSION} installed${NC}"
else
    echo "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check npm
echo ""
echo "${YELLOW}Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "${GREEN}✓ npm ${NPM_VERSION} installed${NC}"
else
    echo "${RED}✗ npm not found${NC}"
    exit 1
fi

# Install frontend dependencies
echo ""
echo "${YELLOW}Installing frontend dependencies...${NC}"
npm install
echo "${GREEN}✓ Frontend dependencies installed${NC}"

# Install backend dependencies
echo ""
echo "${YELLOW}Installing backend dependencies...${NC}"
cd server
npm install
echo "${GREEN}✓ Backend dependencies installed${NC}"
cd ..

# Check for .env files
echo ""
echo "${YELLOW}Checking environment configuration...${NC}"
if [ -f ".env" ]; then
    echo "${GREEN}✓ Frontend .env found${NC}"
else
    echo "${YELLOW}⚠ Frontend .env not found${NC}"
    echo "  Creating from env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "${GREEN}✓ Created .env from env.example${NC}"
        echo "${YELLOW}  ⚠ Please update .env with your configuration${NC}"
    fi
fi

if [ -f "server/.env" ]; then
    echo "${GREEN}✓ Backend .env found${NC}"
else
    echo "${YELLOW}⚠ Backend .env not found${NC}"
    echo "  Creating from env.example..."
    if [ -f "server/env.example" ]; then
        cp server/env.example server/.env
        echo "${GREEN}✓ Created server/.env from env.example${NC}"
        echo "${YELLOW}  ⚠ Please update server/.env with your DATABASE_URL${NC}"
    fi
fi

# Check database connection
echo ""
echo "${YELLOW}Checking database...${NC}"
cd server
if [ ! -z "$DATABASE_URL" ] || grep -q "DATABASE_URL" .env 2>/dev/null; then
    echo "${GREEN}✓ Database URL configured${NC}"
    
    # Try to run migrations
    echo "  Running database migrations..."
    if npm run prisma:generate > /dev/null 2>&1; then
        echo "${GREEN}  ✓ Prisma client generated${NC}"
    else
        echo "${YELLOW}  ⚠ Could not generate Prisma client${NC}"
    fi
else
    echo "${YELLOW}⚠ DATABASE_URL not configured${NC}"
    echo "  Please set DATABASE_URL in server/.env"
fi
cd ..

# Check Sui CLI
echo ""
echo "${YELLOW}Checking Sui blockchain tools...${NC}"
if command -v sui &> /dev/null; then
    SUI_VERSION=$(sui --version 2>/dev/null || echo "unknown")
    echo "${GREEN}✓ Sui CLI installed: ${SUI_VERSION}${NC}"
    
    # Check active environment
    if sui client active-env &> /dev/null; then
        ACTIVE_ENV=$(sui client active-env)
        echo "${GREEN}✓ Sui active environment: ${ACTIVE_ENV}${NC}"
    fi
else
    echo "${YELLOW}⚠ Sui CLI not found${NC}"
    echo "  Install from: https://docs.sui.io/build/install"
    echo "  (Smart contract tests will be skipped)"
fi

# Build contracts if Sui is available
if command -v sui &> /dev/null; then
    echo ""
    echo "${YELLOW}Building smart contracts...${NC}"
    if [ -d "medipay_contracts" ]; then
        cd medipay_contracts
        if sui move build > /dev/null 2>&1; then
            echo "${GREEN}✓ Smart contracts built successfully${NC}"
        else
            echo "${YELLOW}⚠ Smart contract build failed${NC}"
        fi
        cd ..
    else
        echo "${YELLOW}⚠ medipay_contracts directory not found${NC}"
    fi
fi

# Make test scripts executable
echo ""
echo "${YELLOW}Setting up test scripts...${NC}"
chmod +x tests/*.sh 2>/dev/null || true
echo "${GREEN}✓ Test scripts ready${NC}"

# Create test data directory if needed
mkdir -p tests/data

# Final summary
echo ""
echo "${GREEN}✅ Setup Complete!${NC}"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start the backend:"
echo "   ${YELLOW}cd server && npm run dev${NC}"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "3. Run tests:"
echo "   ${YELLOW}npm run test:all${NC}      # Run all tests"
echo "   ${YELLOW}npm run test:api${NC}      # API tests only"
echo "   ${YELLOW}npm run test:e2e${NC}      # End-to-end tests"
echo "   ${YELLOW}npm run test:contracts${NC} # Smart contract tests"
echo ""
echo "4. Configure environment variables:"
echo "   - Edit ${YELLOW}.env${NC} for frontend config"
echo "   - Edit ${YELLOW}server/.env${NC} for backend config"
echo ""

