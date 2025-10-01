import { useCallback } from 'react';
import { useSuiWallet } from '@/contexts/SuiWalletContext';
import { MedipayTransactionBuilder } from '@/lib/medipay';
import { useToast } from './use-toast';

export interface CreateMedicalRecordParams {
    doctorCapId: string;
    patientAddress: string;
    institutionAddress: string;
    encryptedDataHash: number[];
    storageReference: string;
    visitDate: number;
}

export interface UseMedicalRecordReturn {
    createMedicalRecord: (params: CreateMedicalRecordParams) => Promise<string | null>;
    grantMedicalRecordAccess: (
        recordId: string,
        viewerAddress: string,
        expiry?: number | null,
        canDelegate?: boolean
    ) => Promise<string | null>;
    revokeMedicalRecordAccess: (recordId: string, viewerAddress: string) => Promise<string | null>;
    isLoading: boolean;
}

export function useMedicalRecord(): UseMedicalRecordReturn {
    const { executeTransaction, isConnected } = useSuiWallet();
    const { toast } = useToast();

    const createMedicalRecord = useCallback(async (params: CreateMedicalRecordParams): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to create a medical record.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.createMedicalRecord(
                params.doctorCapId,
                params.patientAddress,
                params.institutionAddress,
                params.encryptedDataHash,
                params.storageReference,
                params.visitDate
            ).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Medical Record Created",
                description: "Medical record has been successfully created on the blockchain.",
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Creation Failed",
                description: error.message || "Failed to create medical record. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    const grantMedicalRecordAccess = useCallback(async (
        recordId: string,
        viewerAddress: string,
        expiry: number | null = null,
        canDelegate: boolean = false
    ): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to grant access.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.grantMedicalRecordAccess(recordId, viewerAddress, expiry, canDelegate).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Access Granted",
                description: "Medical record access has been successfully granted.",
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Access Grant Failed",
                description: error.message || "Failed to grant access. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    const revokeMedicalRecordAccess = useCallback(async (
        recordId: string,
        viewerAddress: string
    ): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to revoke access.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.revokeMedicalRecordAccess(recordId, viewerAddress).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Access Revoked",
                description: "Medical record access has been successfully revoked.",
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Access Revocation Failed",
                description: error.message || "Failed to revoke access. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    return {
        createMedicalRecord,
        grantMedicalRecordAccess,
        revokeMedicalRecordAccess,
        isLoading: false, // Could be enhanced with loading state
    };
}
