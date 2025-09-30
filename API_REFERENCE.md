# API Reference

Complete API reference for the MediPay backend.

## Base URL

```
Development: http://localhost:4000
Production: https://api.medipay.com
```

## Authentication

All protected endpoints require the `x-user-address` header containing the user's Sui wallet address.

```bash
curl -H "x-user-address: 0x123..." http://localhost:4000/api/endpoint
```

---

## Health Check

### GET /health

Check API server status (no authentication required).

**Response:**
```json
{
  "status": "ok"
}
```

---

## User Profile

### GET /api/profile

Get authenticated user's profile.

**Headers:**
- `x-user-address`: User's wallet address (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "address": "0x123...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "avatar": "https://...",
    "role": "PATIENT",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Invoices

### GET /api/invoices

Get user's invoices (filtered by RLS based on user role).

**Headers:**
- `x-user-address`: User's wallet address (required)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "inv_123",
      "patientId": "patient_123",
      "doctorId": "doctor_123",
      "institutionId": "inst_123",
      "serviceDescription": "General Consultation",
      "totalAmount": "150.00",
      "status": "PENDING",
      "paymentType": "CASH",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "patient": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "doctor": {
        "name": "Dr. Smith",
        "email": "smith@hospital.com"
      },
      "institution": {
        "name": "City Hospital"
      }
    }
  ]
}
```

**Access Control:**
- Patients: See only their own invoices
- Doctors: See invoices they created
- Institutions: See all their invoices
- Insurance: See invoices for their covered patients

---

## Medical Records

### GET /api/medical-records

Get medical records accessible to the user.

**Headers:**
- `x-user-address`: User's wallet address (required)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "rec_123",
      "patientId": "patient_123",
      "doctorId": "doctor_123",
      "diagnosis": "Common Cold",
      "symptoms": "Fever, cough",
      "treatment": "Rest and fluids",
      "visitDate": "2024-01-01T00:00:00.000Z",
      "blockchainTxHash": "0xabc...",
      "patient": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "doctor": {
        "name": "Dr. Smith"
      }
    }
  ]
}
```

**Access Control:**
- Patients: See only their own records
- Doctors: See records they created
- Institutions: See records from their facility
- Insurance: No access

---

## Prescriptions

### GET /api/prescriptions

Get prescriptions accessible to the user.

**Headers:**
- `x-user-address`: User's wallet address (required)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "presc_123",
      "patientId": "patient_123",
      "doctorId": "doctor_123",
      "medicationName": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "instructions": "Take with food",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-01-08T00:00:00.000Z",
      "blockchainTxHash": "0xdef...",
      "patient": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "doctor": {
        "name": "Dr. Smith"
      }
    }
  ]
}
```

**Access Control:**
- Patients: See only their own prescriptions
- Doctors: See prescriptions they issued
- Institutions: See prescriptions from their facility
- Insurance: No access

---

## Insurance

### GET /api/insurance-packages

Get available insurance packages (public endpoint).

**Headers:** None required

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "pkg_123",
      "name": "Basic Health Plan",
      "description": "Essential coverage",
      "monthlyPremium": "50.00",
      "coverageLimit": "10000.00",
      "deductible": "500.00",
      "services": [
        {
          "id": "srv_1",
          "serviceName": "General Consultation",
          "coveragePercentage": "80.00"
        }
      ]
    }
  ]
}
```

### GET /api/my-insurance

Get user's insurance coverage.

**Headers:**
- `x-user-address`: User's wallet address (required)

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "ins_123",
      "patientId": "patient_123",
      "packageId": "pkg_123",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z",
      "status": "ACTIVE",
      "insurancePackage": {
        "name": "Basic Health Plan",
        "monthlyPremium": "50.00",
        "services": [...]
      }
    }
  ]
}
```

**Access Control:**
- Patients: See only their own insurance
- Insurance companies: See all their customers
- Others: No access

---

## Products

### GET /api/products

Get products/services catalog.

**Query Parameters:**
- `category` (optional): Filter by category (MEDICATION, MEDICAL_SUPPLY, SERVICE, OTHER)
- `institutionId` (optional): Filter by institution

**Headers:** None required (public endpoint)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "prod_123",
      "institutionId": "inst_123",
      "name": "Paracetamol 500mg",
      "description": "Pain reliever",
      "category": "MEDICATION",
      "price": "5.00",
      "stockQuantity": 100,
      "isActive": true,
      "institution": {
        "name": "City Pharmacy",
        "address": "123 Main St"
      }
    }
  ]
}
```

**Example Requests:**
```bash
# All products
curl http://localhost:4000/api/products

# Filter by category
curl http://localhost:4000/api/products?category=MEDICATION

# Filter by institution
curl http://localhost:4000/api/products?institutionId=inst_123
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Authentication required. Please provide x-user-address header"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "path": "/api/invalid-endpoint"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

---

## Using the API Client

### In React Components

```typescript
import { useInvoices, useMedicalRecords } from '@/hooks/useApi';

function MyComponent() {
  const { data: invoices, isLoading, error } = useInvoices();
  const { data: records } = useMedicalRecords();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {invoices?.map(invoice => (
        <div key={invoice.id}>{invoice.serviceDescription}</div>
      ))}
    </div>
  );
}
```

### Direct API Calls

```typescript
import { api } from '@/lib/api';

// Get invoices
const response = await api.invoices.list(walletAddress);
console.log(response.data);

// Get profile
const profile = await api.profile.get(walletAddress);
console.log(profile.data);

// Get insurance packages
const packages = await api.insurance.packages();
console.log(packages.data);
```

---

## Rate Limiting

Currently no rate limiting is enforced in development. Production will have:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per authenticated user

---

## CORS Configuration

Development accepts requests from:
- http://localhost:5173
- http://localhost:8080

Production will be configured for specific domains.

---

## Additional Resources

- [Setup Guide](SETUP_GUIDE.md) - Environment setup
- [Testing Guide](TESTING.md) - API testing
- [RLS Documentation](server/README_RLS.md) - Security policies
- [Main README](README.md) - Project overview

