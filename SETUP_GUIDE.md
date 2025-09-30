# Setup and Configuration Guide

Complete setup guide for connecting frontend, backend, and blockchain components of MediPay.

## 🚀 Quick Setup (5 minutes)

```bash
# 1. Clone and setup
git clone <repository>
cd medipay

# 2. Run automated setup
npm run test:setup

# 3. Configure environment
cp env.example .env
cp server/env.example server/.env
# Edit both .env files with your configuration

# 4. Start backend
cd server && npm run dev

# 5. Start frontend (new terminal)
npm run dev
```

---

## 📋 Prerequisites

### Required

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v8+ (comes with Node.js)
- **PostgreSQL** database (we recommend [Neon](https://neon.tech))
- **Sui Wallet** browser extension ([Install](https://chrome.google.com/webstore/detail/sui-wallet))

### Optional

- **Sui CLI** (for smart contract development) ([Install Guide](https://docs.sui.io/build/install))
- **Docker** (for local database) ([Install](https://www.docker.com/))

---

## 🔧 Step-by-Step Setup

### 1. Frontend Configuration

#### Install Dependencies

```bash
npm install
```

#### Create Environment File

```bash
cp env.example .env
```

#### Configure Frontend `.env`

```env
# API Configuration
VITE_API_URL=http://localhost:4000
VITE_API_BASE_URL=http://localhost:4000/api

# Sui Blockchain Configuration
VITE_SUI_NETWORK=testnet
VITE_SUI_PACKAGE_ID=your_package_id_here
VITE_SUI_INVOICE_CAPABILITY=your_capability_id
VITE_SUI_MEDICAL_RECORD_CAPABILITY=your_capability_id
VITE_SUI_PRESCRIPTION_CAPABILITY=your_capability_id

# Feature Flags
VITE_ENABLE_BLOCKCHAIN=true
VITE_ENABLE_RLS=true

# Environment
NODE_ENV=development
```

#### Test Frontend

```bash
npm run dev
# Should start on http://localhost:8080
```

---

### 2. Backend Configuration

#### Install Dependencies

```bash
cd server
npm install
```

#### Create Environment File

```bash
cp env.example .env
```

#### Configure Backend `.env`

```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:8080

# Security
ENABLE_RLS=true

# Blockchain
SUI_NETWORK=testnet
SUI_PACKAGE_ID=your_package_id_here
```

#### Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Verify RLS is enabled
npm run verify:rls
```

Expected output:
```
✅ All RLS policies enabled
✅ 11 tables protected
✅ 33 security policies active
```

#### Test Backend

```bash
npm run dev
# Should start on http://localhost:4000

# In another terminal, test health endpoint
curl http://localhost:4000/health
# Should return: {"status":"ok"}
```

---

### 3. Database Setup

#### Option A: Neon (Recommended)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` in `server/.env`

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
```

#### Option B: Local PostgreSQL

```bash
# Install PostgreSQL
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql

# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Ubuntu

# Create database
createdb medipay

# Update .env
DATABASE_URL="postgresql://localhost:5432/medipay"
```

#### Option C: Docker

```bash
# Start PostgreSQL container
docker run --name medipay-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=medipay \
  -p 5432:5432 \
  -d postgres:15

# Update .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/medipay"
```

---

### 4. Blockchain Setup

#### Install Sui Wallet

1. Install [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet) extension
2. Create or import wallet
3. Switch to testnet
4. Get test SUI from [faucet](https://discord.com/channels/916379725201563759/971488439931392130)

#### Install Sui CLI (Optional)

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui

# Check installation
sui --version
```

#### Deploy Smart Contracts

```bash
# Navigate to contracts
cd medipay_contracts

# Build contracts
sui move build

# Deploy to testnet
sui client publish --gas-budget 100000000 --network testnet

# Copy package ID from output
# Update VITE_SUI_PACKAGE_ID in .env
```

---

### 5. API Integration

#### Test API Connection

```bash
# Start backend
cd server && npm run dev

# Test health endpoint
curl http://localhost:4000/health

# Test protected endpoint (should return 401)
curl http://localhost:4000/api/invoices

# Test with authentication
curl -H "x-user-address: 0xTEST" http://localhost:4000/api/invoices
```

#### Use API in Frontend

The API client is already configured in `src/lib/api.ts`.

```typescript
// In your React component
import { useInvoices } from '@/hooks/useApi';

function MyComponent() {
  const { data, isLoading, error } = useInvoices();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data?.map(invoice => ...)}</div>;
}
```

---

## 🧪 Verify Setup

### Run All Tests

```bash
# Automated comprehensive test
bash run-tests.sh

# Or run individual tests
npm run test:setup      # Environment setup
npm run test:contracts  # Smart contracts
npm run test:e2e       # End-to-end
npm run test:integration # Integration tests
```

### Manual Verification Checklist

- [ ] Frontend runs on http://localhost:8080
- [ ] Backend runs on http://localhost:4000
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Database connection works (`npm run verify:rls`)
- [ ] Sui wallet connects
- [ ] API requests work with authentication
- [ ] Smart contracts build successfully

---

## 🔗 Connecting Everything

### Frontend → Backend

The connection is configured via:

1. **Environment Variables** (`.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:4000/api
   ```

2. **API Client** (`src/lib/api.ts`):
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
   ```

3. **Vite Proxy** (`vite.config.ts`):
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:4000',
       changeOrigin: true,
     },
   }
   ```

### Backend → Database

Connection via Prisma:

1. **Environment** (`server/.env`):
   ```env
   DATABASE_URL="postgresql://..."
   ```

2. **Prisma Client** (`server/src/lib/prisma.ts`):
   ```typescript
   import { PrismaClient } from '@prisma/client';
   export const prisma = new PrismaClient();
   ```

3. **RLS Middleware** (`server/src/middleware/rls.middleware.ts`):
   ```typescript
   // Sets user context for Row Level Security
   await prisma.$executeRaw`SELECT set_config('app.user_address', ${address}, true)`;
   ```

### Frontend → Blockchain

Connection via Sui SDK:

1. **Wallet Context** (`src/contexts/SuiWalletContext.tsx`):
   ```typescript
   import { useCurrentAccount } from '@mysten/dapp-kit';
   ```

2. **Transaction Execution**:
   ```typescript
   import { suiClient } from '@/lib/sui';
   const result = await executeTransaction(txb);
   ```

---

## 🔐 Security Configuration

### Row Level Security (RLS)

RLS is automatically enabled when you run migrations:

```bash
cd server
npm run prisma:migrate
npm run verify:rls
```

### Authentication Flow

1. User connects Sui wallet
2. Wallet address extracted from account
3. Address sent in `x-user-address` header
4. RLS middleware sets database context
5. Database filters data based on user role

### Testing RLS

```bash
# Different users should see different data
curl -H "x-user-address: 0xPATIENT_1" http://localhost:4000/api/invoices
curl -H "x-user-address: 0xPATIENT_2" http://localhost:4000/api/invoices
# Should return different results
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Problem: Frontend won't start**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Problem: API calls fail**
```bash
# Check backend is running
curl http://localhost:4000/health

# Check CORS settings in server/src/index.ts
# Ensure API URL in .env is correct
```

### Backend Issues

**Problem: Backend won't start**
```bash
# Check database connection
cd server
npm run verify:rls

# Check environment variables
cat .env | grep DATABASE_URL

# Check port availability
lsof -i :4000
```

**Problem: Database connection fails**
```bash
# Test connection string
psql "postgresql://user:pass@host/db"

# Regenerate Prisma client
npm run prisma:generate

# Reset database (⚠️ deletes data)
npm run prisma:migrate reset
```

### Blockchain Issues

**Problem: Wallet won't connect**
- Install Sui Wallet extension
- Switch to correct network (testnet)
- Refresh page
- Check browser console for errors

**Problem: Transactions fail**
- Ensure wallet has test SUI
- Check package ID is correct
- Verify network matches (testnet/mainnet)
- Check gas budget is sufficient

---

## 📚 Next Steps

After setup:

1. **Explore Features**
   - Connect wallet and explore dashboards
   - Create test invoices
   - Test medical records
   - Try insurance features

2. **Development**
   - Read [TESTING.md](TESTING.md) for testing guide
   - Review [README.md](README.md) for API documentation
   - Check [SUI_INTEGRATION.md](SUI_INTEGRATION.md) for blockchain guide

3. **Deployment**
   - Deploy frontend to Vercel
   - Deploy backend to Railway
   - Deploy contracts to Sui mainnet

---

## 🆘 Getting Help

If you encounter issues:

1. **Check Logs**
   - Frontend: Browser console
   - Backend: Terminal output
   - Database: `server/prisma/migrations`

2. **Run Diagnostics**
   ```bash
   npm run test:setup  # Environment check
   npm run test:all    # Comprehensive tests
   ```

3. **Review Documentation**
   - [README.md](README.md) - Main documentation
   - [TESTING.md](TESTING.md) - Testing guide
   - [Server RLS Docs](server/README_RLS.md) - Security guide

4. **Common Issues**
   - Port conflicts: Change ports in `.env`
   - Database errors: Check connection string
   - RLS errors: Re-run migrations
   - Blockchain errors: Check network and package ID

---

## ✅ Setup Complete!

Your MediPay platform should now be fully configured and running:

- ✅ Frontend: http://localhost:8080
- ✅ Backend: http://localhost:4000
- ✅ Database: Connected with RLS
- ✅ Blockchain: Sui testnet

**Start developing!** 🚀

