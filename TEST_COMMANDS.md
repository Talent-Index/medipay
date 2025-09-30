# Test Commands Reference

Quick reference for all testing commands in the MediPay platform.

## 🚀 Quick Start

```bash
# Automated setup and run all tests
bash quick-start.sh
bash run-tests.sh
```

---

## 📋 Main Test Commands

### Comprehensive Testing
```bash
# Run ALL tests (recommended)
bash run-tests.sh

# Quick environment check
npm run test:setup
```

---

## 🧪 Test Categories

### 1. Environment Setup
```bash
# Verify environment configuration
npm run test:setup
bash tests/setup.sh

# Check backend health
curl http://localhost:4000/health

# Verify database and RLS
cd server && npm run verify:rls
```

### 2. Backend API Tests
```bash
# Run all API tests
cd server
npm run test
npm run test:api

# Watch mode (auto-rerun on changes)
npm run test:watch

# Test RLS policies
npm run test:rls
npm run verify:rls
```

### 3. Smart Contract Tests
```bash
# Run contract tests
npm run test:contracts
bash tests/contract.test.sh

# Direct Sui commands
cd medipay_contracts
sui move build
sui move test
sui move test --coverage
```

### 4. Integration Tests
```bash
# Frontend-backend integration
npm run test:integration
tsx tests/integration.test.ts
```

### 5. End-to-End Tests
```bash
# Complete E2E test suite
npm run test:e2e
bash tests/e2e.test.sh
```

---

## 🎯 Test Scenarios

### Test Individual Endpoints
```bash
# Health check
curl http://localhost:4000/health

# Public endpoint (no auth)
curl http://localhost:4000/api/insurance-packages

# Protected endpoint (with auth)
curl -H "x-user-address: 0xTEST_ADDRESS" \
  http://localhost:4000/api/invoices

# Test different users (RLS)
curl -H "x-user-address: 0xPATIENT_1" \
  http://localhost:4000/api/medical-records
  
curl -H "x-user-address: 0xDOCTOR_1" \
  http://localhost:4000/api/medical-records
```

### Test API Client
```bash
# In browser console or Node.js
import { api } from '@/lib/api';

// Test profile
const profile = await api.profile.get('0xYOUR_ADDRESS');
console.log(profile);

// Test invoices
const invoices = await api.invoices.list('0xYOUR_ADDRESS');
console.log(invoices);
```

---

## 🔍 Debugging Commands

### Check Services
```bash
# Check if backend is running
curl http://localhost:4000/health
lsof -i :4000

# Check if frontend is running
curl http://localhost:8080
lsof -i :8080

# Check database connection
cd server
npx prisma studio
```

### View Logs
```bash
# Backend logs (when running)
cd server && npm run dev

# Frontend logs
npm run dev

# Test output
bash run-tests.sh 2>&1 | tee test-output.log
```

### Database Operations
```bash
cd server

# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Reset database (⚠️ deletes data)
npx prisma migrate reset

# Verify RLS
npm run verify:rls
```

---

## 🛠️ Development Workflow

### Daily Development
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Run tests after changes
npm run test:e2e
```

### Before Committing
```bash
# Run linter
npm run lint

# Run all tests
bash run-tests.sh

# Check types
npm run build
cd server && npm run build
```

### Before Deploying
```bash
# Verify everything
npm run test:all

# Build production
npm run build

# Test production build
npm run preview
```

---

## 📊 Test Coverage

### Run Coverage Reports
```bash
# Smart contracts coverage
cd medipay_contracts
sui move test --coverage

# Backend coverage (if configured)
cd server
npm run test:coverage  # (requires jest setup)
```

---

## 🔐 Security Testing

### Test RLS Policies
```bash
# Verify all policies
cd server && npm run verify:rls

# Test specific scenarios
curl -H "x-user-address: 0xPATIENT" \
  http://localhost:4000/api/invoices

curl -H "x-user-address: 0xDOCTOR" \
  http://localhost:4000/api/invoices
```

### Test Authentication
```bash
# Should fail (no auth)
curl http://localhost:4000/api/invoices

# Should succeed (with auth)
curl -H "x-user-address: 0xTEST" \
  http://localhost:4000/api/invoices
```

### Test CORS
```bash
curl -H "Origin: http://localhost:5173" \
  -I http://localhost:4000/health
```

---

## ⚡ Performance Testing

### Response Time
```bash
# Measure API response
time curl http://localhost:4000/health

# Multiple requests
for i in {1..10}; do
  time curl http://localhost:4000/api/insurance-packages
done
```

### Load Testing
```bash
# Simple concurrent requests
seq 1 100 | xargs -n1 -P10 curl http://localhost:4000/health
```

---

## 🐛 Troubleshooting Commands

### Fix Common Issues
```bash
# Reset node_modules
rm -rf node_modules package-lock.json
npm install

# Reset backend
cd server
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate

# Reset database
cd server
npx prisma migrate reset
npm run verify:rls
```

### Check Environment
```bash
# Node version
node -v  # Should be 18+

# npm version
npm -v

# Sui version (if installed)
sui --version

# Check environment files
cat .env
cat server/.env
```

### Verify Installation
```bash
# Run setup check
npm run test:setup

# Manual verification
echo "Frontend port:"
lsof -i :8080

echo "Backend port:"
lsof -i :4000

echo "Database:"
cd server && npm run verify:rls
```

---

## 📝 Test Data

### Create Test Users
```bash
# In Prisma Studio or SQL
cd server && npm run prisma:studio

# Or via API (if endpoints exist)
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"address":"0xTEST","name":"Test User","role":"PATIENT"}'
```

### Test Addresses
```bash
# Patient
PATIENT_ADDRESS="0xPATIENT_TEST_123"

# Doctor  
DOCTOR_ADDRESS="0xDOCTOR_TEST_123"

# Institution
INSTITUTION_ADDRESS="0xINSTITUTION_TEST_123"

# Insurance
INSURANCE_ADDRESS="0xINSURANCE_TEST_123"
```

---

## 🎬 Complete Test Sequence

### Full Test Run
```bash
#!/bin/bash

# 1. Setup
echo "Setting up environment..."
npm run test:setup

# 2. Start backend
echo "Starting backend..."
cd server && npm run dev &
BACKEND_PID=$!
sleep 5

# 3. Run tests
echo "Running tests..."
cd ..
npm run test:contracts
npm run test:e2e
npm run test:integration
cd server && npm run test:api

# 4. Cleanup
echo "Cleaning up..."
kill $BACKEND_PID

echo "Tests complete!"
```

---

## 📚 Additional Resources

- **[TESTING.md](TESTING.md)** - Complete testing guide
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Setup and configuration
- **[API_REFERENCE.md](API_REFERENCE.md)** - API documentation
- **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)** - Integration overview

---

## 🚀 Quick Reference

### Most Used Commands
```bash
# Setup
bash quick-start.sh

# Development
cd server && npm run dev  # Terminal 1
npm run dev              # Terminal 2

# Testing
bash run-tests.sh        # All tests
npm run test:e2e        # Quick E2E test

# Debugging
npm run test:setup       # Check environment
cd server && npm run verify:rls  # Check security
```

### Emergency Commands
```bash
# Reset everything
rm -rf node_modules server/node_modules
npm install && cd server && npm install && cd ..
cd server && npx prisma migrate reset

# Check status
curl http://localhost:4000/health
npm run test:setup

# Rebuild
npm run build
cd server && npm run build
```

---

**For detailed explanations and troubleshooting, see [TESTING.md](TESTING.md)**

