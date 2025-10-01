# Testing Guide

Complete guide for testing the MediPay platform including backend API, smart contracts, and integration tests.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Test Setup](#test-setup)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [API Testing](#api-testing)
- [Smart Contract Testing](#smart-contract-testing)
- [Integration Testing](#integration-testing)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 8+
- Sui CLI (for contract tests)
- Running database instance
- Backend server running on port 4000

### Initial Setup

```bash
# 1. Run setup script
npm run test:setup

# 2. Start backend (in separate terminal)
cd server
npm run dev

# 3. Run all tests
npm run test:all
```

---

## 🔧 Test Setup

### 1. Environment Configuration

Create `.env` files from examples:

```bash
# Frontend
cp env.example .env

# Backend
cp server/env.example server/.env
```

Update environment variables:

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:4000
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SUI_NETWORK=testnet
```

**Backend `server/.env`:**
```env
DATABASE_URL="postgresql://..."
PORT=4000
NODE_ENV=development
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server && npm install
```

### 3. Database Setup

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
npm run verify:rls
```

---

## 🧪 Running Tests

### All Tests

```bash
npm run test:all
```

This runs:
1. Setup and validation
2. Smart contract tests
3. End-to-end tests
4. Integration tests

### Individual Test Suites

```bash
# Setup only
npm run test:setup

# Smart contracts
npm run test:contracts

# End-to-end tests
npm run test:e2e

# Integration tests
npm run test:integration

# Backend API tests
cd server
npm run test:api

# RLS verification
cd server
npm run test:rls
```

---

## 📝 Test Types

### 1. Unit Tests

Test individual components and functions.

**Location:** `server/tests/api.test.ts`

**Run:**
```bash
cd server
npm run test:api
```

**Example:**
```typescript
// Test invoice endpoint
describe('Invoice Endpoints', () => {
  it('should get invoices for patient', async () => {
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      headers: { 'x-user-address': TEST_PATIENT_ADDRESS },
    });
    expect(response.status).toBe(200);
  });
});
```

### 2. Smart Contract Tests

Test Move smart contracts on Sui blockchain.

**Location:** `medipay_contracts/tests/`

**Run:**
```bash
npm run test:contracts
# or directly:
cd medipay_contracts
sui move test
```

**Example:**
```move
#[test]
fun test_create_invoice() {
    // Test invoice creation
    let invoice = create_invoice(/* params */);
    assert!(invoice.amount > 0, 0);
}
```

### 3. Integration Tests

Test frontend-backend-blockchain integration.

**Location:** `tests/integration.test.ts`

**Run:**
```bash
npm run test:integration
```

**Example:**
```typescript
describe('Patient Journey', () => {
  it('should complete patient flow', async () => {
    // 1. Connect wallet
    // 2. Fetch profile
    // 3. View records
    // 4. Pay invoice
  });
});
```

### 4. End-to-End Tests

Test complete user workflows.

**Location:** `tests/e2e.test.sh`

**Run:**
```bash
npm run test:e2e
```

Tests:
- Backend health
- API endpoints
- Database connection
- Security (RLS)
- Performance
- CORS configuration

---

## 🔌 API Testing

### Manual API Testing

Use curl or Postman:

```bash
# Health check
curl http://localhost:4000/health

# Get invoices (with auth)
curl -H "x-user-address: 0xYOUR_ADDRESS" \
  http://localhost:4000/api/invoices

# Get insurance packages (public)
curl http://localhost:4000/api/insurance-packages

# Get profile
curl -H "x-user-address: 0xYOUR_ADDRESS" \
  http://localhost:4000/api/profile
```

### Using the API Client

In React components:

```typescript
import { useInvoices, useMedicalRecords } from '@/hooks/useApi';

function MyComponent() {
  const { data: invoices, isLoading } = useInvoices();
  const { data: records } = useMedicalRecords();
  
  // Use the data
}
```

### Testing Protected Endpoints

All protected endpoints require the `x-user-address` header:

```bash
# Valid request
curl -H "x-user-address: 0x123..." \
  http://localhost:4000/api/invoices

# Response: 200 OK with data

# Invalid request (no header)
curl http://localhost:4000/api/invoices

# Response: 401 Unauthorized
```

---

## ⛓️ Smart Contract Testing

### Build Contracts

```bash
cd medipay_contracts
sui move build
```

### Run Tests

```bash
# Run all tests
sui move test

# Run with coverage
sui move test --coverage

# Run specific test
sui move test test_create_invoice
```

### Test Structure

```move
#[test_only]
module medipay::test_utils {
    // Test utilities
}

#[test]
fun test_invoice_creation() {
    // Test logic
}

#[test]
#[expected_failure]
fun test_invalid_amount() {
    // Test error handling
}
```

### Deploy and Test

```bash
# Deploy to testnet
sui client publish --gas-budget 100000000 --network testnet

# Update package ID in .env
VITE_SUI_PACKAGE_ID=0x...

# Test transactions
sui client call --function create_invoice --module medipay_contracts
```

---

## 🔗 Integration Testing

### Frontend-Backend Integration

Test API client with real backend:

```typescript
import { api } from '@/lib/api';

// Test profile fetch
const response = await api.profile.get(walletAddress);
console.log(response.data);

// Test invoices
const invoices = await api.invoices.list(walletAddress);
console.log(invoices.data);
```

### Backend-Database Integration

Test RLS policies:

```bash
cd server
npm run verify:rls
```

Expected output:
```
✅ All RLS policies enabled
✅ 11 tables protected
✅ 33 security policies active
```

### Blockchain Integration

Test Sui transactions:

```typescript
import { suiClient } from '@/lib/sui';

// Test connection
const chainId = await suiClient.getChainIdentifier();
console.log('Connected to:', chainId);

// Test transaction
const txb = new TransactionBlock();
// ... build transaction
const result = await executeTransaction(txb);
```

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Check if port is in use
lsof -i :4000

# Check database connection
cd server
npm run verify:rls

# Check environment variables
cat server/.env
```

### Database Issues

```bash
# Reset database
cd server
npx prisma migrate reset

# Regenerate client
npm run prisma:generate

# Verify connection
npm run verify:rls
```

### Sui Contract Issues

```bash
# Check Sui CLI
sui --version

# Check active environment
sui client active-env

# Switch environment
sui client switch --env testnet

# Get active address
sui client active-address
```

### Test Failures

1. **Connection Errors:**
   - Ensure backend is running: `cd server && npm run dev`
   - Check API URL in `.env`
   - Verify database connection

2. **Authentication Errors:**
   - Check wallet is connected
   - Verify user address header
   - Check RLS policies

3. **Contract Errors:**
   - Rebuild contracts: `sui move build`
   - Check package ID in `.env`
   - Verify Sui network connection

### Common Issues

**Issue: Tests timeout**
```bash
# Increase timeout in test config
# Or run tests individually
npm run test:api
npm run test:contracts
```

**Issue: RLS verification fails**
```bash
cd server
# Re-run migrations
npm run prisma:migrate
# Verify again
npm run verify:rls
```

**Issue: Frontend can't connect to backend**
```bash
# Check CORS settings in server/src/index.ts
# Ensure API URL is correct in .env
# Check backend is running on correct port
```

---

## 📊 Test Coverage

### Backend Coverage

```bash
cd server
npm run test:api
# Check console for results
```

### Contract Coverage

```bash
cd medipay_contracts
sui move test --coverage
```

### Integration Coverage

```bash
npm run test:e2e
# Check test output for pass/fail status
```

---

## 🎯 Best Practices

1. **Always run setup first:**
   ```bash
   npm run test:setup
   ```

2. **Keep backend running during tests:**
   ```bash
   cd server && npm run dev
   ```

3. **Test in sequence:**
   ```bash
   npm run test:all
   ```

4. **Check logs for errors:**
   ```bash
   # Backend logs
   cd server && npm run dev
   
   # Frontend logs
   npm run dev
   ```

5. **Use test addresses:**
   ```typescript
   const TEST_ADDRESSES = {
     patient: '0xPATIENT_TEST',
     doctor: '0xDOCTOR_TEST',
   };
   ```

---

## 📚 Additional Resources

- [API Documentation](README.md#api-documentation)
- [RLS Testing Guide](server/RLS_TESTING.md)
- [Sui Integration Guide](SUI_INTEGRATION.md)
- [Backend Setup](server/README_RLS.md)

---

## 🆘 Getting Help

If tests continue to fail:

1. Check all services are running
2. Review error messages carefully
3. Verify environment configuration
4. Check database connection
5. Review [README.md](README.md) for setup steps

**Quick Health Check:**
```bash
# Backend
curl http://localhost:4000/health

# Database
cd server && npm run verify:rls

# Contracts (if Sui installed)
cd medipay_contracts && sui move build
```

---

**Happy Testing! 🧪**

