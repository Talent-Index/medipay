import { useCallback } from 'react';
import { useSuiWallet } from '@/contexts/SuiWalletContext';
import { MedipayTransactionBuilder } from '@/lib/medipay';
import { useToast } from './use-toast';

export interface CreatePrescriptionParams {
    doctorCapId: string;
    patientAddress: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    quantity: number;
    instructionsHash: number[];
}

export interface UsePrescriptionReturn {
    createPrescription: (params: CreatePrescriptionParams) => Promise<string | null>;
    isLoading: boolean;
}

export function usePrescription(): UsePrescriptionReturn {
    const { executeTransaction, isConnected } = useSuiWallet();
    const { toast } = useToast();

    const createPrescription = useCallback(async (params: CreatePrescriptionParams): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to create a prescription.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.createPrescription(
                params.doctorCapId,
                params.patientAddress,
                params.medicationName,
                params.dosage,
                params.frequency,
                params.durationDays,
                params.quantity,
                params.instructionsHash
            ).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Prescription Created",
                description: "Prescription has been successfully created on the blockchain.",
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Creation Failed",
                description: error.message || "Failed to create prescription. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    return {
        createPrescription,
        isLoading: false, // Could be enhanced with loading state
    };
}
