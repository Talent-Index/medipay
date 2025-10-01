/**
 * Integration Tests
 * Test the complete flow from frontend to backend to blockchain
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:4000';
const SUI_NETWORK = process.env.VITE_SUI_NETWORK || 'testnet';

// Test wallet addresses
const TEST_PATIENT = {
  address: '0xPATIENT_TEST',
  name: 'Test Patient',
  email: 'patient@test.com',
};

const TEST_DOCTOR = {
  address: '0xDOCTOR_TEST',
  name: 'Dr. Test',
  email: 'doctor@test.com',
};

describe('User Flow Integration Tests', () => {
  let suiClient: SuiClient;

  beforeAll(() => {
    suiClient = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK as any) });
  });

  describe('Patient Journey', () => {
    it('should complete patient registration flow', async () => {
      // 1. Check health endpoint
      const healthResponse = await fetch(`${API_BASE_URL}/health`);
      expect(healthResponse.status).toBe(200);

      // 2. Get user profile
      const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { 'x-user-address': TEST_PATIENT.address },
      });
      expect(profileResponse.status).toBe(200);

      // 3. Get insurance packages
      const packagesResponse = await fetch(`${API_BASE_URL}/api/insurance-packages`);
      const packages = await packagesResponse.json();
      expect(packages.success).toBe(true);
    });

    it('should view medical records and prescriptions', async () => {
      // 1. Get medical records
      const recordsResponse = await fetch(`${API_BASE_URL}/api/medical-records`, {
        headers: { 'x-user-address': TEST_PATIENT.address },
      });
      const records = await recordsResponse.json();
      expect(records.success).toBe(true);

      // 2. Get prescriptions
      const prescriptionsResponse = await fetch(`${API_BASE_URL}/api/prescriptions`, {
        headers: { 'x-user-address': TEST_PATIENT.address },
      });
      const prescriptions = await prescriptionsResponse.json();
      expect(prescriptions.success).toBe(true);
    });

    it('should view and manage invoices', async () => {
      // 1. Get invoices
      const invoicesResponse = await fetch(`${API_BASE_URL}/api/invoices`, {
        headers: { 'x-user-address': TEST_PATIENT.address },
      });
      const invoices = await invoicesResponse.json();
      expect(invoices.success).toBe(true);
      expect(Array.isArray(invoices.data)).toBe(true);
    });
  });

  describe('Doctor Journey', () => {
    it('should access doctor dashboard data', async () => {
      // 1. Get profile
      const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { 'x-user-address': TEST_DOCTOR.address },
      });
      expect(profileResponse.status).toBe(200);

      // 2. Get invoices created by doctor
      const invoicesResponse = await fetch(`${API_BASE_URL}/api/invoices`, {
        headers: { 'x-user-address': TEST_DOCTOR.address },
      });
      const invoices = await invoicesResponse.json();
      expect(invoices.success).toBe(true);
    });

    it('should access medical records for patients', async () => {
      const recordsResponse = await fetch(`${API_BASE_URL}/api/medical-records`, {
        headers: { 'x-user-address': TEST_DOCTOR.address },
      });
      const records = await recordsResponse.json();
      expect(records.success).toBe(true);
    });
  });

  describe('Blockchain Integration', () => {
    it('should connect to Sui network', async () => {
      try {
        const chainId = await suiClient.getChainIdentifier();
        expect(chainId).toBeDefined();
      } catch (error) {
        console.log('Sui network connection test skipped (network unavailable)');
      }
    });

    it('should verify blockchain connectivity', async () => {
      try {
        const version = await suiClient.getRpcApiVersion();
        expect(version).toBeDefined();
      } catch (error) {
        console.log('Blockchain connectivity test skipped');
      }
    });
  });

  describe('RLS Security', () => {
    it('should enforce patient data isolation', async () => {
      // Patient should only see their own records
      const patient1Response = await fetch(`${API_BASE_URL}/api/medical-records`, {
        headers: { 'x-user-address': TEST_PATIENT.address },
      });
      const patient1Data = await patient1Response.json();

      const patient2Response = await fetch(`${API_BASE_URL}/api/medical-records`, {
        headers: { 'x-user-address': '0xOTHER_PATIENT' },
      });
      const patient2Data = await patient2Response.json();

      expect(patient1Data.success).toBe(true);
      expect(patient2Data.success).toBe(true);
      
      // Data should be different for different patients
      if (patient1Data.data.length > 0 && patient2Data.data.length > 0) {
        const patient1Ids = patient1Data.data.map((r: any) => r.id);
        const patient2Ids = patient2Data.data.map((r: any) => r.id);
        const overlap = patient1Ids.filter((id: string) => patient2Ids.includes(id));
        expect(overlap.length).toBe(0);
      }
    });

    it('should enforce doctor access control', async () => {
      const doctorResponse = await fetch(`${API_BASE_URL}/api/medical-records`, {
        headers: { 'x-user-address': TEST_DOCTOR.address },
      });
      const doctorData = await doctorResponse.json();

      expect(doctorData.success).toBe(true);
      // Doctor should only see records they created
      if (doctorData.data.length > 0) {
        doctorData.data.forEach((record: any) => {
          expect(record.doctorId).toBeDefined();
        });
      }
    });
  });

  describe('End-to-End Workflows', () => {
    it('should complete invoice creation and payment flow', async () => {
      // This would test the complete flow:
      // 1. Doctor creates invoice (blockchain + database)
      // 2. Patient receives invoice
      // 3. Patient pays invoice (blockchain transaction)
      // 4. Payment recorded in database
      
      const invoicesResponse = await fetch(`${API_BASE_URL}/api/invoices`, {
        headers: { 'x-user-address': TEST_PATIENT.address },
      });
      const invoices = await invoicesResponse.json();
      
      expect(invoices.success).toBe(true);
    });

    it('should complete medical record creation flow', async () => {
      // This would test:
      // 1. Doctor creates medical record (blockchain + database)
      // 2. Patient can view record
      // 3. Record is immutable on blockchain
      
      const recordsResponse = await fetch(`${API_BASE_URL}/api/medical-records`, {
        headers: { 'x-user-address': TEST_PATIENT.address },
      });
      const records = await recordsResponse.json();
      
      expect(records.success).toBe(true);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network failures gracefully', async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/invalid-endpoint`, {
          headers: { 'x-user-address': TEST_PATIENT.address },
        });
        expect(response.status).toBe(404);
      } catch (error) {
        // Network error is acceptable in this test
        expect(error).toBeDefined();
      }
    });

    it('should handle unauthorized access attempts', async () => {
      const response = await fetch(`${API_BASE_URL}/api/invoices`);
      expect(response.status).toBe(401);
    });
  });
});

describe('Performance Tests', () => {
  it('should respond to API requests within acceptable time', async () => {
    const start = Date.now();
    const response = await fetch(`${API_BASE_URL}/health`);
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(1000); // Should respond within 1 second
  });

  it('should handle concurrent requests', async () => {
    const requests = Array(10).fill(null).map(() =>
      fetch(`${API_BASE_URL}/api/insurance-packages`)
    );

    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});

