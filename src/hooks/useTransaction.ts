import { useCallback } from 'react';
import { useSuiWallet } from '@/contexts/SuiWalletContext';
import { MedipayTransactionBuilder } from '@/lib/medipay';
import { useToast } from './use-toast';

export interface UseTransactionReturn {
    payInvoiceCash: (invoiceId: string, amount: number) => Promise<string | null>;
    payInvoiceInsurance: (insuranceCapId: string, invoiceId: string, amount: number) => Promise<string | null>;
    payInvoiceInsurancePortion: (insuranceCapId: string, invoiceId: string, amount: number) => Promise<string | null>;
    payInvoicePatientCopay: (invoiceId: string, amount: number) => Promise<string | null>;
    isLoading: boolean;
}

export function useTransaction(): UseTransactionReturn {
    const { executeTransaction, isConnected } = useSuiWallet();
    const { toast } = useToast();

    const payInvoiceCash = useCallback(async (invoiceId: string, amount: number): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to make a payment.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.payInvoiceCash(invoiceId, amount).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Cash Payment Successful",
                description: `Payment of $${amount} processed successfully.`,
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Payment Failed",
                description: error.message || "Failed to process payment. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    const payInvoiceInsurance = useCallback(async (
        insuranceCapId: string,
        invoiceId: string,
        amount: number
    ): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to make a payment.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.payInvoiceInsurance(insuranceCapId, invoiceId, amount).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Insurance Payment Successful",
                description: `Insurance payment of $${amount} processed successfully.`,
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Payment Failed",
                description: error.message || "Failed to process insurance payment. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    const payInvoiceInsurancePortion = useCallback(async (
        insuranceCapId: string,
        invoiceId: string,
        amount: number
    ): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to make a payment.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.payInvoiceInsurancePortion(insuranceCapId, invoiceId, amount).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Insurance Portion Payment Successful",
                description: `Insurance portion payment of $${amount} processed successfully.`,
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Payment Failed",
                description: error.message || "Failed to process insurance portion payment. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    const payInvoicePatientCopay = useCallback(async (invoiceId: string, amount: number): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to make a payment.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.payInvoicePatientCopay(invoiceId, amount).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Copay Payment Successful",
                description: `Patient copay of $${amount} processed successfully.`,
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Payment Failed",
                description: error.message || "Failed to process copay payment. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    return {
        payInvoiceCash,
        payInvoiceInsurance,
        payInvoiceInsurancePortion,
        payInvoicePatientCopay,
        isLoading: false, // Could be enhanced with loading state
    };
}
