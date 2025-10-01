import { useCallback } from 'react';
import { useSuiWallet } from '@/contexts/SuiWalletContext';
import { MedipayTransactionBuilder } from '@/lib/medipay';
import { useToast } from './use-toast';
import { PaymentType } from '@/types';

export interface CreateInvoiceParams {
    institutionCapId: string;
    patientAddress: string;
    doctorAddress: string;
    serviceDescription: string;
    totalAmount: number;
    insuranceCoveredAmount: number;
    paymentType: PaymentType;
}

export interface UseInvoiceReturn {
    createInvoice: (params: CreateInvoiceParams) => Promise<string | null>;
    approveInvoiceByInsurance: (insuranceCapId: string, invoiceId: string, claimId: string) => Promise<string | null>;
    payInvoiceCash: (invoiceId: string, amount: number) => Promise<string | null>;
    payInvoiceInsurance: (insuranceCapId: string, invoiceId: string, amount: number) => Promise<string | null>;
    payInvoiceInsurancePortion: (insuranceCapId: string, invoiceId: string, amount: number) => Promise<string | null>;
    payInvoicePatientCopay: (invoiceId: string, amount: number) => Promise<string | null>;
    isLoading: boolean;
}

export function useInvoice(): UseInvoiceReturn {
    const { executeTransaction, isConnected } = useSuiWallet();
    const { toast } = useToast();

    const createInvoice = useCallback(async (params: CreateInvoiceParams): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to create an invoice.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.createInvoice(
                params.institutionCapId,
                params.patientAddress,
                params.doctorAddress,
                params.serviceDescription,
                params.totalAmount,
                params.insuranceCoveredAmount,
                params.paymentType
            ).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Invoice Created",
                description: "Invoice has been successfully created on the blockchain.",
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Invoice Creation Failed",
                description: error.message || "Failed to create invoice. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    const approveInvoiceByInsurance = useCallback(async (
        insuranceCapId: string,
        invoiceId: string,
        claimId: string
    ): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to approve an invoice.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.approveInvoiceByInsurance(insuranceCapId, invoiceId, claimId).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Invoice Approved",
                description: "Invoice has been successfully approved by insurance.",
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Approval Failed",
                description: error.message || "Failed to approve invoice. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    const payInvoiceCash = useCallback(async (invoiceId: string, amount: number): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to pay an invoice.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.payInvoiceCash(invoiceId, amount).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Payment Successful",
                description: `Invoice paid with $${amount} in cash.`,
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Payment Failed",
                description: error.message || "Failed to pay invoice. Please try again.",
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
                description: "Please connect your Sui wallet to pay an invoice.",
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
                description: `Invoice paid with $${amount} by insurance.`,
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Payment Failed",
                description: error.message || "Failed to pay invoice. Please try again.",
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
                description: "Please connect your Sui wallet to pay an invoice.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.payInvoiceInsurancePortion(insuranceCapId, invoiceId, amount).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Insurance Portion Paid",
                description: `Insurance portion of $${amount} paid successfully.`,
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Payment Failed",
                description: error.message || "Failed to pay invoice portion. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    const payInvoicePatientCopay = useCallback(async (invoiceId: string, amount: number): Promise<string | null> => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Sui wallet to pay an invoice.",
                variant: "destructive",
            });
            return null;
        }

        try {
            const builder = new MedipayTransactionBuilder();
            const txb = builder.payInvoicePatientCopay(invoiceId, amount).getTransactionBlock();

            const hash = await executeTransaction(txb);

            toast({
                title: "Copay Paid",
                description: `Patient copay of $${amount} paid successfully.`,
            });

            return hash;
        } catch (error: any) {
            toast({
                title: "Payment Failed",
                description: error.message || "Failed to pay copay. Please try again.",
                variant: "destructive",
            });
            return null;
        }
    }, [isConnected, executeTransaction, toast]);

    return {
        createInvoice,
        approveInvoiceByInsurance,
        payInvoiceCash,
        payInvoiceInsurance,
        payInvoiceInsurancePortion,
        payInvoicePatientCopay,
        isLoading: false, // Could be enhanced with loading state
    };
}
