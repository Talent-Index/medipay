# Row Level Security (RLS) Guide

## Overview

This application uses PostgreSQL Row Level Security (RLS) to ensure data isolation and security at the database level. RLS policies automatically filter data based on the current user's wallet address.

## How It Works

### RLS Policies

Each table has policies that control:
- **SELECT**: What rows a user can read
- **INSERT**: What rows a user can create
- **UPDATE**: What rows a user can modify
- **DELETE**: What rows a user can delete

### User Context

RLS policies use a session variable `app.current_user_address` to identify the current user. This must be set before any database queries.

## Implementation

### 1. Setting User Context

The user's wallet address should be provided in HTTP headers:

```bash
# Option 1: Using x-user-address header
curl -H "x-user-address: 0x123..." http://localhost:4000/api/invoices

# Option 2: Using authorization header
curl -H "authorization: Bearer 0x123..." http://localhost:4000/api/invoices
```

### 2. Using RLS Middleware

#### Protected Routes (Requires Authentication)

```typescript
import { rlsMiddleware } from './middleware/rls.middleware';

// Apply to specific routes
app.get('/api/invoices', rlsMiddleware, async (req, res) => {
  // RLS context is already set
  const invoices = await prisma.invoice.findMany();
  res.json(invoices);
});

// The user will only see invoices they're authorized to view
```

#### Optional RLS Routes (Public + Protected Data)

```typescript
import { optionalRlsMiddleware } from './middleware/rls.middleware';

// Apply to routes that have both public and user-specific data
app.get('/api/insurance-packages', optionalRlsMiddleware, async (req, res) => {
  // Public data (insurance packages) + user-specific data if authenticated
  const packages = await prisma.insurancePackage.findMany({
    include: {
      services: true,
      // Will only include user's insurance if authenticated
      patientInsurance: true
    }
  });
  res.json(packages);
});
```

### 3. Manual RLS Context Setting

For custom use cases:

```typescript
import { setRLSContext, withRLSContext } from './lib/rls';
import { prisma } from './lib/prisma';

// Method 1: Set context manually
await setRLSContext(prisma, userAddress);
const invoices = await prisma.invoice.findMany();

// Method 2: Use callback wrapper
const invoices = await withRLSContext(prisma, userAddress, async () => {
  return await prisma.invoice.findMany();
});
```

## RLS Policy Rules

### Users Table
- ✅ Users can view their own profile
- ✅ Users can view profiles of people they interact with (doctors, patients, institutions)
- ✅ Users can only create/update their own profile

### Invoices Table
- ✅ Patients can view their own invoices
- ✅ Doctors can view invoices for their patients
- ✅ Institutions can view invoices they created
- ✅ Insurance companies can view all invoices
- ✅ Only doctors and institutions can create invoices

### Medical Records Table
- ✅ Patients can view their own medical records
- ✅ Doctors can view records for their patients
- ✅ Only doctors can create/update medical records

### Prescriptions Table
- ✅ Patients can view their own prescriptions
- ✅ Doctors can view prescriptions they wrote
- ✅ Only doctors can create/update prescriptions

### Payment Records Table
- ✅ Users can view payments they made
- ✅ Users involved in the invoice can view its payments

### Insurance Packages & Services
- ✅ Everyone can view available packages and services
- ✅ Only insurance companies can create/update packages

### Patient Insurance
- ✅ Patients can view their own insurance
- ✅ Insurance companies can view all patient insurance
- ✅ Patients and insurance companies can create insurance records

### Institution Staff
- ✅ Institutions can manage their own staff
- ✅ Staff members can view their own records

### Products
- ✅ Everyone can view products
- ✅ Institutions can only manage their own products

### Transactions
- ✅ Users can view transactions related to their invoices
- ✅ Insurance and institution users can view more transactions

## Testing RLS

### 1. Verify RLS is Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

### 2. Test Policies

```typescript
// As a patient
await setRLSContext(prisma, patientAddress);
const records = await prisma.medicalRecord.findMany();
// Should only return patient's own records

// As a doctor
await setRLSContext(prisma, doctorAddress);
const records = await prisma.medicalRecord.findMany();
// Should return records for doctor's patients
```

## Security Best Practices

1. **Always set RLS context** before database queries in authenticated routes
2. **Validate wallet addresses** before setting RLS context
3. **Use the middleware** for consistent RLS application
4. **Test policies** thoroughly for each user role
5. **Monitor query performance** - complex RLS policies can impact performance

## Troubleshooting

### No Data Returned
- Verify RLS context is set correctly
- Check that the user address matches database records
- Ensure policies allow the operation

### Permission Denied Errors
- User is trying to access unauthorized data
- RLS policies are working correctly
- Verify user role and permissions

### Performance Issues
- RLS policies add query complexity
- Consider indexes on foreign key columns
- Use `EXPLAIN ANALYZE` to debug slow queries

## Disabling RLS (Development Only)

⚠️ **Never disable RLS in production!**

For development/testing only:

```sql
-- Disable RLS on a table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## Migration Reference

RLS was enabled via migration: `20250930200141_enable_rls`

To view the exact policies:
```bash
cat prisma/migrations/20250930200141_enable_rls/migration.sql
```
