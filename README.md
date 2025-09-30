# MediPay - Blockchain Healthcare Payment Platform

<div align="center">

**A secure, decentralized healthcare payment and records management system built on Sui blockchain**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![Sui](https://img.shields.io/badge/Sui-Blockchain-4DA2FF.svg)](https://sui.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791.svg)](https://neon.tech/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Security](#-security)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)

---

## 🎯 Overview

**MediPay** is a cutting-edge healthcare payment and records management platform that leverages blockchain technology to provide secure, transparent, and immutable healthcare transactions.

### Key Highlights

- 🔐 **Enterprise-Grade Security** - Row Level Security (RLS) with PostgreSQL
- ⛓️ **Blockchain Integration** - Sui blockchain for immutable records  
- 🏥 **Multi-Role Support** - Patients, Doctors, Institutions, Insurance
- 💳 **Flexible Payments** - Cash, insurance, and split payment options
- 📊 **Real-time Dashboard** - Modern UI with comprehensive analytics
- 🔒 **HIPAA Compliant** - Healthcare data privacy and security

---

## ✨ Features

### 👤 Patient Features
- 📱 Personal dashboard with medical history
- 💊 Prescription management
- 🏥 Secure medical records access
- 💰 Invoice and payment management
- 🔍 Transaction explorer

### 👨‍⚕️ Doctor Features
- 📝 Create medical records
- 💊 Issue prescriptions
- 📋 Patient management
- 💵 Invoice creation
- 📊 Dashboard analytics

### 🏥 Institution Features
- 👥 Staff management
- 🛒 Product management
- 📈 Financial dashboard
- 🔐 Role-based access control

### 🏛️ Insurance Features
- 📋 Claims management
- 👥 Patient coverage management
- 💰 Payment processing
- 📊 Analytics dashboard

---

## 🛠️ Tech Stack

### Frontend
- React 18.3 + TypeScript
- Vite 7.1
- Tailwind CSS + shadcn/ui
- Zustand + TanStack Query
- React Router v6

### Backend
- Node.js 18+ + Express
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- Row Level Security (RLS)

### Blockchain
- Sui Blockchain
- Move Language
- @mysten/sui.js SDK

---

## 🏗️ Architecture

```
Frontend (React) → API Layer (Express + RLS) → Database (PostgreSQL)
                                             → Blockchain (Sui)
```

**Data Flow:**
1. User connects Sui wallet
2. RLS middleware sets user context
3. Database filters data based on role
4. Critical data stored on blockchain
5. Immutable audit trail

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm v8+
- PostgreSQL (Neon account)
- Sui Wallet browser extension

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/medipay.git
cd medipay

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database URL

# Run database migrations
npm run prisma:migrate

# Verify RLS is enabled
npm run verify:rls
```

### Start Development

```bash
# Terminal 1 - Backend
cd server
npm run dev
# Runs on http://localhost:4000

# Terminal 2 - Frontend
npm run dev  
# Runs on http://localhost:5173
```

### First Steps

1. Open http://localhost:5173
2. Click "Connect Sui Wallet"
3. Select your role
4. Explore the dashboard!

---

## 📁 Project Structure

```
medipay/
├── src/                    # Frontend source
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   └── types/            # TypeScript types
│
├── server/                # Backend source
│   ├── src/
│   │   ├── lib/          # Core utilities
│   │   ├── middleware/   # Express middleware
│   │   └── routes/       # API routes
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── migrations/   # DB migrations
│   └── docs/             # RLS documentation
│
├── medipay_contracts/     # Smart contracts
│   ├── sources/          # Move contracts
│   └── tests/            # Contract tests
│
└── docs/                  # Documentation
```

---

## 💻 Development

### Frontend Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview build
npm run lint       # Lint code
```

### Backend Commands

```bash
cd server

npm run dev                # Start dev server
npm run build              # Build TypeScript
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run verify:rls         # Verify RLS status
```

### Smart Contract Commands

```bash
cd medipay_contracts

sui move build     # Build contracts
sui move test      # Test contracts
sui client publish # Deploy contracts
```

---

## 🌐 Deployment

### Frontend (Vercel)

```bash
npm i -g vercel
vercel
vercel --prod
```

### Backend (Railway)

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Database (Neon)

Already configured ✅
- Serverless PostgreSQL
- RLS enabled
- Auto-scaling

### Smart Contracts (Sui)

```bash
cd medipay_contracts
sui client publish --gas-budget 100000000 --network testnet
# Update PACKAGE_ID in src/lib/sui.ts
```

---

## 🔐 Security

### Row Level Security (RLS)

Comprehensive database security with:
- ✅ 11 tables protected
- ✅ 33 security policies
- ✅ Role-based access control
- ✅ Wallet-based authentication

**Quick Verification:**
```bash
cd server
npm run verify:rls
```

**Documentation:**
- [README_RLS.md](server/README_RLS.md) - Main RLS docs
- [RLS_QUICK_START.md](server/RLS_QUICK_START.md) - Quick reference
- [RLS_GUIDE.md](server/RLS_GUIDE.md) - Complete guide

### Blockchain Security

- Immutable records on Sui
- Cryptographic signatures
- Smart contract auditing
- Capability-based permissions

---

## 📡 API Documentation

### Base URL

```
Development: http://localhost:4000/api
Production: https://api.medipay.com/api
```

### Authentication

All protected endpoints require wallet address header:

```bash
curl -H "x-user-address: 0x123..." http://localhost:4000/api/invoices
```

### Available Endpoints

#### Public
```
GET  /health                  # Health check
GET  /api/insurance-packages  # List packages
GET  /api/products           # List products
```

#### Protected (Authentication Required)
```
GET  /api/profile            # User profile
GET  /api/invoices           # User's invoices
GET  /api/medical-records    # Medical records
GET  /api/prescriptions      # Prescriptions
GET  /api/my-insurance       # User's insurance
```

### Example Request

```bash
# Get user's invoices
curl -H "x-user-address: 0xPATIENT123" \
  http://localhost:4000/api/invoices
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "inv_123",
      "serviceDescription": "General Consultation",
      "totalAmount": "150.00",
      "status": "PENDING"
    }
  ]
}
```

**Full API Docs:** [RLS_TESTING.md](server/RLS_TESTING.md)

---

## ⛓️ Smart Contracts

### Contract Functions

#### Create Invoice
```move
create_invoice(
    capability: &InvoiceCapability,
    patient_id: String,
    doctor_id: String,
    service: String,
    amount: u64,
    ...
)
```

#### Create Medical Record
```move
create_medical_record(
    capability: &MedicalRecordCapability,
    patient_id: String,
    diagnosis: String,
    ...
)
```

#### Create Prescription  
```move
create_prescription(
    capability: &PrescriptionCapability,
    medication_name: String,
    dosage: String,
    ...
)
```

### Frontend Usage

```typescript
import { HealthcareTransaction } from '@/lib/sui';

const txb = new HealthcareTransaction()
  .createInvoice({
    patientId: 'patient-123',
    service: 'Consultation',
    amount: 150
  })
  .getTransactionBlock();

await executeTransaction(txb);
```

**Full Blockchain Guide:** [SUI_INTEGRATION.md](SUI_INTEGRATION.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Make changes and commit: `git commit -m "feat: description"`
4. Push to branch: `git push origin feature/name`
5. Create Pull Request

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

---

## 📚 Documentation

### Main Docs
- [README.md](README.md) - This file
- [SUI_INTEGRATION.md](SUI_INTEGRATION.md) - Blockchain guide

### Backend Docs
- [README_RLS.md](server/README_RLS.md) - RLS documentation
- [RLS_QUICK_START.md](server/RLS_QUICK_START.md) - Quick start
- [RLS_GUIDE.md](server/RLS_GUIDE.md) - Implementation guide
- [RLS_TESTING.md](server/RLS_TESTING.md) - Testing guide

---

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] Multi-role dashboards
- [x] Invoice management
- [x] Medical records
- [x] Row Level Security

### Phase 2: Enhanced Features 🚧
- [ ] Multi-signature operations
- [ ] Advanced analytics
- [ ] Mobile application
- [ ] Automated testing

### Phase 3: Enterprise 📋
- [ ] Telemedicine integration
- [ ] AI diagnostics
- [ ] Multi-tenant support
- [ ] Compliance certifications

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/medipay/issues)
- **Docs:** Read documentation in this repository
- **Email:** support@medipay.com

### Troubleshooting

**Frontend:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Backend:**
```bash
cd server
npx prisma migrate reset
npm run prisma:generate
```

---

## 🙏 Acknowledgments

- Sui Foundation - Blockchain infrastructure
- Neon - Serverless PostgreSQL
- shadcn/ui - UI components
- Prisma - Database ORM

---

<div align="center">

**Built with ❤️ by the MediPay Team**

[Website](https://medipay.com) • [Docs](https://docs.medipay.com) • [API](https://api.medipay.com)

</div>
