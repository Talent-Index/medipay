# 🚀 RLS Quick Start

## ✅ What's Done

Row Level Security (RLS) is now **fully enabled** on your Neon database with 11 tables protected and ready to use!

## 🔐 How It Works

RLS automatically filters database queries based on the user's wallet address. No user can access another user's private data.

## 📡 Using the API

### Start the Server
```bash
cd /home/amosoluoch/Desktop/sha-clone/server
npm run dev
```

### Make Authenticated Requests
```bash
# Add your wallet address in the header
curl -H "x-user-address: YOUR_WALLET_ADDRESS" \
  http://localhost:4000/api/invoices
```

### Available Endpoints

| Endpoint | Auth Required | What You Get |
|----------|---------------|--------------|
| `/health` | ❌ | Health check |
| `/api/profile` | ✅ | Your profile |
| `/api/invoices` | ✅ | Your invoices only |
| `/api/medical-records` | ✅ | Your records (patient) or patient records (doctor) |
| `/api/prescriptions` | ✅ | Your prescriptions |
| `/api/my-insurance` | ✅ | Your insurance |
| `/api/insurance-packages` | Optional | All available packages |
| `/api/products` | Optional | All products |

## 🎯 Quick Test

```bash
# 1. Check health
curl http://localhost:4000/health

# 2. Try without auth (should fail)
curl http://localhost:4000/api/invoices

# 3. Try with your wallet (replace with real address)
curl -H "x-user-address: 0x1234567890..." \
  http://localhost:4000/api/invoices
```

## 💻 Add to Your Routes

```typescript
import { rlsMiddleware } from './middleware/rls.middleware';

app.get('/api/my-data', rlsMiddleware, async (req, res) => {
  const data = await prisma.yourModel.findMany();
  // RLS automatically filters to user's data
  res.json(data);
});
```

## 🔑 Security Rules

- **Patients** → See only their own medical data
- **Doctors** → See their patients' data
- **Institutions** → Manage their own records
- **Insurance** → Access insurance-related data

## 📚 Documentation

- **RLS_SUMMARY.md** - Complete overview
- **RLS_GUIDE.md** - Detailed documentation  
- **RLS_TESTING.md** - Testing examples

## 🎉 You're Ready!

RLS is active and protecting your data. Just add the `rlsMiddleware` to your routes and include the user's wallet address in request headers!

---
📝 **Next**: Integrate with your frontend by adding the wallet address to all API calls.
