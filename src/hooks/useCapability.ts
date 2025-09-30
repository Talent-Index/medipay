import { useCallback } from 'react';
import { useSuiWallet } from '@/contexts/SuiWalletContext';
import { MedipayTransactionBuilder } from '@/lib/medipay';
import { useToast } from './use-toast';

export interface UseCapabilityReturn {
    createDoctorCapability: (licenseNumber: string, institutionAddress: string) => Promise<string | null>;
    createInstitutionCapability: (institutionName: string) => Promise<string | null>;
    createInsuranceCapability: (companyName: string) => Promise<string | null>;
    isLoading: boolean;
}

export function useCapability(): UseCapabilityReturn {
    const { executeTransaction, isConnected } = useSuiWallet();
    const { toast } = useToast();

    const createDoctorCapability = useCallback(async (
        licenseNumber: string,
        institutionAddress: string
    ): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to create a doctor capability.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.createDoctorCapability(licenseNumber, institutionAddress).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Doctor Capability Created",
                description: "Doctor capability has been successfully created on the blockchain.",
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Creation Failed",
                description: error.message || "Failed to create doctor capability. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    const createInstitutionCapability = useCallback(async (institutionName: string): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to create an institution capability.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.createInstitutionCapability(institutionName).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Institution Capability Created",
                description: "Institution capability has been successfully created on the blockchain.",
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Creation Failed",
                description: error.message || "Failed to create institution capability. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    const createInsuranceCapability = useCallback(async (companyName: string): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to create an insurance capability.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.createInsuranceCapability(companyName).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Insurance Capability Created",
                description: "Insurance capability has been successfully created on the blockchain.",
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Creation Failed",
                description: error.message || "Failed to create insurance capability. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    return {
        createDoctorCapability,
        createInstitutionCapability,
        createInsuranceCapability,
        isLoading: false, // Could be enhanced with loading state
    };
}
