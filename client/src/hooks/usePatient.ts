import { useCallback } from 'react';
import { useSuiWallet } from '@/contexts/SuiWalletContext';
import { MedipayTransactionBuilder } from '@/lib/medipay';
import { useToast } from './use-toast';

export interface UsePatientReturn {
    registerPatient: (patientId: string) => Promise<string | null>;
    isLoading: boolean;
}

export function usePatient(): UsePatientReturn {
    const { executeTransaction, isConnected } = useSuiWallet();
    const { toast } = useToast();

    const registerPatient = useCallback(async (patientId: string): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to register a patient.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.registerPatient(patientId).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Patient Registered",
                description: "Patient has been successfully registered on the blockchain.",
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message || "Failed to register patient. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    return {
        registerPatient,
        isLoading: false, // Could be enhanced with loading state
    };
}
