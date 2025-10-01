/**
 * React hook for API integration
 * Provides easy access to API client with wallet authentication
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to get user profile
 */
export function useUserProfile() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['profile', account?.address],
    queryFn: async () => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.profile.get(account.address);
      return response.data;
    },
    enabled: !!account?.address,
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const account = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<{ name: string; email: string; phone: string; avatar: string }>) => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.profile.update(account.address, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', account?.address] });
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    },
    onError: (err: any) => {
      toast({ title: 'Update failed', description: err.message || 'Please try again.', variant: 'destructive' });
    }
  });
}

/**
 * Hook to get invoices
 */
export function useInvoices() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['invoices', account?.address],
    queryFn: async () => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.invoices.list(account.address);
      return response.data;
    },
    enabled: !!account?.address,
  });
}

/**
 * Hook to get medical records
 */
export function useMedicalRecords() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['medical-records', account?.address],
    queryFn: async () => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.medicalRecords.list(account.address);
      return response.data as Array<any>;
    },
    enabled: !!account?.address,
  });
}

/**
 * Hook to get prescriptions
 */
export function usePrescriptions() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['prescriptions', account?.address],
    queryFn: async () => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.prescriptions.list(account.address);
      return response.data;
    },
    enabled: !!account?.address,
  });
}

/**
 * Hook to get insurance packages
 */
export function useInsurancePackages() {
  return useQuery({
    queryKey: ['insurance-packages'],
    queryFn: async () => {
      const response = await api.insurance.packages();
      return response.data;
    },
  });
}

/**
 * Hook to get insurance claims
 */
export function useInsuranceClaims() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['insurance-claims', account?.address],
    queryFn: async () => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.insurance.claims(account.address);
      return response.data;
    },
    enabled: !!account?.address,
  });
}

/**
 * Hook to get insurance patients
 */
export function useInsurancePatients() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['insurance-patients', account?.address],
    queryFn: async () => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.insurance.patients(account.address);
      return response.data;
    },
    enabled: !!account?.address,
  });
}

/**
 * Hook to create insurance patient
 */
export function useCreateInsurancePatient() {
  const account = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientData: { name: string; email: string; phone?: string; policyId: string }) => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.insurance.createPatient(account.address, patientData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-patients', account?.address] });
      toast({ title: 'Patient added', description: 'New patient has been successfully added.' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to add patient', description: err.message || 'Please try again.', variant: 'destructive' });
    }
  });
}

/**
 * Hook to get user's insurance
 */
export function useMyInsurance() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['my-insurance', account?.address],
    queryFn: async () => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.insurance.my(account.address);
      return response.data;
    },
    enabled: !!account?.address,
  });
}

/**
 * Hook to get products
 */
export function useProducts(filters?: { category?: string; institutionId?: string }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await api.products.list(filters);
      return response.data;
    },
  });
}

/**
 * Hook to get institution invoices
 */
export function useInstitutionInvoices() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['institution-invoices', account?.address],
    queryFn: async () => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.invoices.listByInstitution(account.address);
      return response.data;
    },
    enabled: !!account?.address,
  });
}

/**
 * Hook to get institution transactions
 */
export function useInstitutionTransactions() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['institution-transactions', account?.address],
    queryFn: async () => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.transactions.listByInstitution(account.address);
      return response.data;
    },
    enabled: !!account?.address,
  });
}

/**
 * Hook to get institution users
 */
export function useInstitutionUsers() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['institution-users', account?.address],
    queryFn: async () => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.institution.users(account.address);
      return response.data;
    },
    enabled: !!account?.address,
  });
}

/**
 * Hook to get institution insurance payments
 */
export function useInstitutionPayments() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['institution-payments', account?.address],
    queryFn: async () => {
      if (!account?.address) throw new Error('No wallet connected');
      const response = await api.institution.payments(account.address);
      return response.data;
    },
    enabled: !!account?.address,
  });
}

/**
 * Hook to check API health
 */
export function useApiHealth() {
  return useQuery({
    queryKey: ['api-health'],
    queryFn: () => api.health.check(),
    refetchInterval: 30000, // Check every 30 seconds
  });
}

/**
 * Generic mutation hook for API operations
 */
export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }

      // Show success toast
      toast({
        title: 'Success',
        description: 'Operation completed successfully',
      });

      // Call custom success handler
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // Show error toast
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });

      // Call custom error handler
      options?.onError?.(error as Error, variables);
    },
  });
}

// Export all hooks
export default {
  useUserProfile,
  useInvoices,
  useMedicalRecords,
  usePrescriptions,
  useInsurancePackages,
  useMyInsurance,
  useProducts,
  useApiHealth,
  useApiMutation,
};
