#!/bin/bash

# Quick Start Script
# Gets MediPay up and running in minutes

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear

echo ""
echo "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo "${CYAN}║                                                            ║${NC}"
echo "${CYAN}║              MediPay Quick Start Setup                     ║${NC}"
echo "${CYAN}║                                                            ║${NC}"
echo "${CYAN}║    Blockchain Healthcare Payment & Records Platform        ║${NC}"
echo "${CYAN}║                                                            ║${NC}"
echo "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Step 1: Check prerequisites
echo "${BLUE}Step 1: Checking prerequisites...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "${GREEN}✓ Node.js ${NODE_VERSION} installed${NC}"
else
    echo "${RED}✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "${GREEN}✓ npm ${NPM_VERSION} installed${NC}"
else
    echo "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check for Sui CLI (optional)
if command -v sui &> /dev/null; then
    SUI_VERSION=$(sui --version 2>/dev/null || echo "unknown")
    echo "${GREEN}✓ Sui CLI installed${NC}"
    HAS_SUI=true
else
    echo "${YELLOW}⚠ Sui CLI not found (optional - install from https://docs.sui.io/build/install)${NC}"
    HAS_SUI=false
fi

# Step 2: Install dependencies
echo ""
echo "${BLUE}Step 2: Installing dependencies...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "${YELLOW}Installing frontend dependencies...${NC}"
npm install --silent
echo "${GREEN}✓ Frontend dependencies installed${NC}"

echo "${YELLOW}Installing backend dependencies...${NC}"
cd server
npm install --silent
cd ..
echo "${GREEN}✓ Backend dependencies installed${NC}"

# Step 3: Setup environment
echo ""
echo "${BLUE}Step 3: Setting up environment configuration...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend .env
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "${GREEN}✓ Created frontend .env from example${NC}"
    fi
else
    echo "${YELLOW}• Frontend .env already exists${NC}"
fi

# Backend .env
if [ ! -f "server/.env" ]; then
    if [ -f "server/env.example" ]; then
        cp server/env.example server/.env
        echo "${GREEN}✓ Created backend .env from example${NC}"
    fi
else
    echo "${YELLOW}• Backend .env already exists${NC}"
fi

# Check for DATABASE_URL
if grep -q "DATABASE_URL=" server/.env 2>/dev/null && ! grep -q "DATABASE_URL=\"postgresql://username" server/.env; then
    echo "${GREEN}✓ Database URL configured${NC}"
    HAS_DB=true
else
    echo "${RED}✗ Database URL not configured${NC}"
    echo ""
    echo "${YELLOW}Please update server/.env with your DATABASE_URL${NC}"
    echo "${YELLOW}Example: DATABASE_URL=\"postgresql://user:pass@host.neon.tech/db?sslmode=require\"${NC}"
    echo ""
    read -p "Press Enter to continue (will skip database setup)..." 
    HAS_DB=false
fi

# Step 4: Database setup
if [ "$HAS_DB" = true ]; then
    echo ""
    echo "${BLUE}Step 4: Setting up database...${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd server
    
    echo "${YELLOW}Generating Prisma client...${NC}"
    if npm run prisma:generate > /dev/null 2>&1; then
        echo "${GREEN}✓ Prisma client generated${NC}"
    else
        echo "${YELLOW}⚠ Could not generate Prisma client${NC}"
    fi
    
    echo "${YELLOW}Running database migrations...${NC}"
    if npm run prisma:migrate > /dev/null 2>&1; then
        echo "${GREEN}✓ Database migrations complete${NC}"
    else
        echo "${YELLOW}⚠ Could not run migrations${NC}"
    fi
    
    echo "${YELLOW}Verifying Row Level Security...${NC}"
    if npm run verify:rls > /dev/null 2>&1; then
        echo "${GREEN}✓ RLS policies enabled${NC}"
    else
        echo "${YELLOW}⚠ RLS verification incomplete${NC}"
    fi
    
    cd ..
else
    echo ""
    echo "${YELLOW}Step 4: Skipping database setup (DATABASE_URL not configured)${NC}"
fi

# Step 5: Build smart contracts
if [ "$HAS_SUI" = true ]; then
    echo ""
    echo "${BLUE}Step 5: Building smart contracts...${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
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
else
    echo ""
    echo "${YELLOW}Step 5: Skipping smart contracts (Sui CLI not installed)${NC}"
fi

# Final instructions
echo ""
echo "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo "${CYAN}║                                                            ║${NC}"
echo "${CYAN}║                   Setup Complete! 🎉                       ║${NC}"
echo "${CYAN}║                                                            ║${NC}"
echo "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""
echo "${GREEN}Next Steps:${NC}"
echo ""
echo "${YELLOW}1. Start the backend:${NC}"
echo "   cd server && npm run dev"
echo ""
echo "${YELLOW}2. In a new terminal, start the frontend:${NC}"
echo "   npm run dev"
echo ""
echo "${YELLOW}3. Open your browser:${NC}"
echo "   http://localhost:8080"
echo ""
echo "${YELLOW}4. Run tests (optional):${NC}"
echo "   bash run-tests.sh"
echo ""
echo "${CYAN}────────────────────────────────────────────────────────────${NC}"
echo ""
echo "${BLUE}📚 Documentation:${NC}"
echo "   • README.md         - Main documentation"
echo "   • SETUP_GUIDE.md    - Detailed setup guide"
echo "   • TESTING.md        - Testing guide"
echo "   • SUI_INTEGRATION.md - Blockchain guide"
echo ""
echo "${BLUE}🆘 Need Help?${NC}"
echo "   • Check SETUP_GUIDE.md for troubleshooting"
echo "   • Run: npm run test:setup"
echo ""
echo "${GREEN}Happy coding! 🚀${NC}"
echo ""

