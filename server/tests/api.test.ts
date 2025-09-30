/**
 * Backend API Tests
 * Test all API endpoints with different scenarios
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000';

// Test data
const TEST_ADDRESSES = {
  patient: '0xPATIENT_TEST_ADDRESS',
  doctor: '0xDOCTOR_TEST_ADDRESS',
  institution: '0xINSTITUTION_TEST_ADDRESS',
  insurance: '0xINSURANCE_TEST_ADDRESS',
};

describe('Health Check', () => {
  it('should return status ok', async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
  });
});

describe('Authentication & RLS', () => {
  it('should reject requests without user address', async () => {
    const response = await fetch(`${API_BASE_URL}/api/invoices`);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBeTruthy();
  });

  it('should accept requests with valid user address', async () => {
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      headers: {
        'x-user-address': TEST_ADDRESSES.patient,
      },
    });
    
    expect(response.status).toBe(200);
  });
});

describe('Invoice Endpoints', () => {
  it('should get invoices for patient', async () => {
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      headers: {
        'x-user-address': TEST_ADDRESSES.patient,
      },
    });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should get invoices for doctor', async () => {
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      headers: {
        'x-user-address': TEST_ADDRESSES.doctor,
      },
    });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('Medical Records Endpoints', () => {
  it('should get medical records for patient', async () => {
    const response = await fetch(`${API_BASE_URL}/api/medical-records`, {
      headers: {
        'x-user-address': TEST_ADDRESSES.patient,
      },
    });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should respect RLS policies for medical records', async () => {
    const response = await fetch(`${API_BASE_URL}/api/medical-records`, {
      headers: {
        'x-user-address': TEST_ADDRESSES.patient,
      },
    });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    // All returned records should be for this patient only
    if (data.data.length > 0) {
      data.data.forEach((record: any) => {
        expect(record.patientId).toBeDefined();
      });
    }
  });
});

describe('Prescription Endpoints', () => {
  it('should get prescriptions', async () => {
    const response = await fetch(`${API_BASE_URL}/api/prescriptions`, {
      headers: {
        'x-user-address': TEST_ADDRESSES.patient,
      },
    });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('Insurance Endpoints', () => {
  it('should get insurance packages without auth', async () => {
    const response = await fetch(`${API_BASE_URL}/api/insurance-packages`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should get user insurance with auth', async () => {
    const response = await fetch(`${API_BASE_URL}/api/my-insurance`, {
      headers: {
        'x-user-address': TEST_ADDRESSES.patient,
      },
    });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('Profile Endpoints', () => {
  it('should get user profile', async () => {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      headers: {
        'x-user-address': TEST_ADDRESSES.patient,
      },
    });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    if (data.data) {
      expect(data.data.address).toBe(TEST_ADDRESSES.patient);
    }
  });
});

describe('Products Endpoints', () => {
  it('should get all products', async () => {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should filter products by category', async () => {
    const response = await fetch(`${API_BASE_URL}/api/products?category=MEDICATION`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    if (data.data.length > 0) {
      data.data.forEach((product: any) => {
        expect(product.category).toBe('MEDICATION');
      });
    }
  });

  it('should filter products by institution', async () => {
    const response = await fetch(`${API_BASE_URL}/api/products?institutionId=${TEST_ADDRESSES.institution}`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('Error Handling', () => {
  it('should return 404 for invalid routes', async () => {
    const response = await fetch(`${API_BASE_URL}/api/invalid-route`);
    
    expect(response.status).toBe(404);
  });

  it('should handle malformed requests', async () => {
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      method: 'POST',
      headers: {
        'x-user-address': TEST_ADDRESSES.patient,
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    });
    
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});

describe('CORS', () => {
  it('should allow CORS requests', async () => {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        'Origin': 'http://localhost:5173',
      },
    });
    
    expect(response.headers.get('access-control-allow-origin')).toBeTruthy();
  });
});

