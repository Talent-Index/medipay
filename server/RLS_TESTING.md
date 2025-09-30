# RLS Testing Guide

## Quick Start

The server now includes Row Level Security (RLS) on all database tables. Use these examples to test the implementation.

## Available API Endpoints

All RLS-protected endpoints require authentication via headers:

### Authentication Headers

```bash
# Option 1: x-user-address header
-H "x-user-address: YOUR_WALLET_ADDRESS"

# Option 2: Authorization header
-H "authorization: Bearer YOUR_WALLET_ADDRESS"
```

### Endpoints

#### 1. Health Check (No Auth Required)
```bash
curl http://localhost:4000/health
```

#### 2. Get User Profile (Protected)
```bash
curl -H "x-user-address: 0x123..." http://localhost:4000/api/profile
```

#### 3. Get User's Invoices (Protected)
```bash
# Returns only invoices the user can access
curl -H "x-user-address: 0x123..." http://localhost:4000/api/invoices
```

#### 4. Get Medical Records (Protected)
```bash
# Patients see their own records
# Doctors see their patients' records
curl -H "x-user-address: 0x123..." http://localhost:4000/api/medical-records
```

#### 5. Get Prescriptions (Protected)
```bash
curl -H "x-user-address: 0x123..." http://localhost:4000/api/prescriptions
```

#### 6. Get Insurance Packages (Public)
```bash
# No auth required - public data
curl http://localhost:4000/api/insurance-packages
```

#### 7. Get User's Insurance (Protected)
```bash
curl -H "x-user-address: 0x123..." http://localhost:4000/api/my-insurance
```

#### 8. Get Products (Public with optional auth)
```bash
# Public - all active products
curl http://localhost:4000/api/products

# Filter by category
curl "http://localhost:4000/api/products?category=medication"

# Filter by institution
curl "http://localhost:4000/api/products?institutionId=0x456..."
```

## Testing Scenarios

### Scenario 1: Patient Access
```bash
# As a patient, get your invoices
PATIENT_ADDRESS="0xPATIENT123"
curl -H "x-user-address: $PATIENT_ADDRESS" \
  http://localhost:4000/api/invoices

# Expected: Only invoices where patient is involved
```

### Scenario 2: Doctor Access
```bash
# As a doctor, get medical records
DOCTOR_ADDRESS="0xDOCTOR456"
curl -H "x-user-address: $DOCTOR_ADDRESS" \
  http://localhost:4000/api/medical-records

# Expected: Only records for doctor's patients
```

### Scenario 3: Institution Access
```bash
# As an institution, get invoices
INSTITUTION_ADDRESS="0xINSTITUTION789"
curl -H "x-user-address: $INSTITUTION_ADDRESS" \
  http://localhost:4000/api/invoices

# Expected: Only invoices created by this institution
```

### Scenario 4: Insurance Company Access
```bash
# As an insurance company, get all invoices
INSURANCE_ADDRESS="0xINSURANCE999"
curl -H "x-user-address: $INSURANCE_ADDRESS" \
  http://localhost:4000/api/invoices

# Expected: All invoices (insurance can see everything)
```

### Scenario 5: Unauthorized Access
```bash
# Try to access without authentication
curl http://localhost:4000/api/invoices

# Expected: 401 Unauthorized error
```

## Testing with Different User Roles

### 1. Create Test Users

First, insert test users directly in the database:

```sql
-- Patient
INSERT INTO users (id, address, role, name, email) 
VALUES ('patient1', '0xPATIENT123', 'PATIENT', 'John Doe', 'patient@example.com');

-- Doctor
INSERT INTO users (id, address, role, name, email) 
VALUES ('doctor1', '0xDOCTOR456', 'DOCTOR', 'Dr. Smith', 'doctor@example.com');

-- Institution
INSERT INTO users (id, address, role, name, email) 
VALUES ('institution1', '0xINSTITUTION789', 'INSTITUTION', 'City Hospital', 'hospital@example.com');

-- Insurance
INSERT INTO users (id, address, role, name, email) 
VALUES ('insurance1', '0xINSURANCE999', 'INSURANCE', 'Health Insurance Co', 'insurance@example.com');
```

### 2. Create Test Data

```sql
-- Create an invoice
INSERT INTO invoices (id, "patientAddress", "doctorAddress", "institutionAddress", 
  "serviceDescription", "totalAmount", "insuranceCoveredAmount", "patientCopayAmount", "paymentType")
VALUES ('inv1', '0xPATIENT123', '0xDOCTOR456', '0xINSTITUTION789', 
  'General Checkup', 100.00, 80.00, 20.00, 'SPLIT');
```

### 3. Test RLS Policies

```bash
# Test 1: Patient can see their invoice
curl -H "x-user-address: 0xPATIENT123" http://localhost:4000/api/invoices
# Should return the invoice

# Test 2: Doctor can see their patient's invoice
curl -H "x-user-address: 0xDOCTOR456" http://localhost:4000/api/invoices
# Should return the invoice

# Test 3: Random user cannot see the invoice
curl -H "x-user-address: 0xRANDOM000" http://localhost:4000/api/invoices
# Should return empty array []

# Test 4: Insurance can see all invoices
curl -H "x-user-address: 0xINSURANCE999" http://localhost:4000/api/invoices
# Should return all invoices
```

## Verifying RLS is Working

### Check RLS Status
```bash
# Connect to your database and run:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

All tables should show `rowsecurity = t` (true).

### View RLS Policies
```bash
# See all policies:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Common Issues

### Issue 1: "User address is required"
**Cause**: No authentication header provided  
**Solution**: Add `x-user-address` or `authorization` header

### Issue 2: Empty results when you expect data
**Cause**: RLS policies are working correctly - user doesn't have access  
**Solution**: Verify the user address matches data in database

### Issue 3: "Failed to set security context"
**Cause**: Invalid user address or database connection issue  
**Solution**: Check user address format and database connectivity

## Performance Testing

```bash
# Test query performance with RLS
curl -w "\nTime: %{time_total}s\n" \
  -H "x-user-address: 0xPATIENT123" \
  http://localhost:4000/api/invoices
```

## Integration with Frontend

### Example: React/TypeScript

```typescript
// utils/api.ts
const API_URL = 'http://localhost:4000/api';

async function fetchWithAuth(endpoint: string, userAddress: string) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'x-user-address': userAddress,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}

// Usage
const invoices = await fetchWithAuth('/invoices', walletAddress);
```

### Example: Web3 Integration

```typescript
import { useAccount } from 'wagmi'; // or your Web3 library

function MyComponent() {
  const { address } = useAccount();
  
  useEffect(() => {
    if (address) {
      fetchWithAuth('/invoices', address)
        .then(data => console.log(data))
        .catch(err => console.error(err));
    }
  }, [address]);
}
```

## Next Steps

1. ✅ RLS is enabled on all tables
2. ✅ Policies are configured for all user roles
3. ✅ Middleware is set up for automatic RLS context
4. ✅ Example routes demonstrate usage
5. 📝 Add your custom routes using the middleware
6. 🔐 Implement proper wallet signature verification
7. 🧪 Add comprehensive integration tests

## Support

For detailed information, see:
- `RLS_GUIDE.md` - Complete RLS documentation
- `prisma/migrations/20250930200141_enable_rls/migration.sql` - RLS policies source
