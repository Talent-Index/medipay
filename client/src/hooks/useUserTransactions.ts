import { useState, useEffect, useCallback } from 'react';
import { useSuiWallet } from '@/contexts/SuiWalletContext';
import { suiClient } from '@/lib/sui';
import { PACKAGE_ID } from '@/config/sui';
import { useToast } from './use-toast';

export interface UserTransaction {
    id: string;
    type: 'invoice' | 'medical_record' | 'prescription' | 'payment';
    status: 'pending' | 'confirmed' | 'failed' | 'approved' | 'partially_paid';
    amount?: number;
    timestamp: number;
    description: string;
    blockchainHash?: string;
    relatedId?: string;
    paymentMethod?: 'cash' | 'insurance';
    patientName?: string;
    doctorName?: string;
    invoiceDetails?: {
        serviceDescription: string;
        totalAmount: number;
        insuranceCoveredAmount: number;
        patientCopayAmount: number;
        paymentType: string;
        doctorAddress: string;
        institutionAddress: string;
    };
}

export interface UseUserTransactionsReturn {
    transactions: UserTransaction[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

// Helper function to fetch patient name from wallet address
const fetchPatientName = async (walletAddress: string): Promise<string> => {
    try {
        const ownedObjects = await suiClient.getOwnedObjects({
            owner: walletAddress,
            options: {
                showType: true,
                showContent: true,
            },
        });

        const patientObject = ownedObjects.data.find(obj =>
            obj.data?.type?.includes('Patient')
        );

        if (patientObject?.data?.content) {
            const content = patientObject.data.content as any;
            return content.fields?.patient_id || `Patient ${walletAddress.slice(-6)}`;
        }
    } catch (error) {
        console.warn('Failed to fetch patient name:', error);
    }
    return `Patient ${walletAddress.slice(-6)}`;
};

// Helper function to fetch doctor name from wallet address
const fetchDoctorName = async (walletAddress: string): Promise<string> => {
    try {
        const ownedObjects = await suiClient.getOwnedObjects({
            owner: walletAddress,
            options: {
                showType: true,
                showContent: true,
            },
        });

        const doctorCapObject = ownedObjects.data.find(obj =>
            obj.data?.type?.includes('DoctorCap')
        );

        if (doctorCapObject?.data?.content) {
            const content = doctorCapObject.data.content as any;
            return `Dr. ${content.fields?.license_number || walletAddress.slice(-6)}`;
        }
    } catch (error) {
        console.warn('Failed to fetch doctor name:', error);
    }
    return `Dr. ${walletAddress.slice(-6)}`;
};

export function useUserTransactions(): UseUserTransactionsReturn {
    const { address } = useSuiWallet();
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<UserTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserTransactions = useCallback(async () => {
        if (!address) {
            setTransactions([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const userTransactions: UserTransaction[] = [];

            // Query for objects owned by the user that are related to Medipay
            const ownedObjects = await suiClient.getOwnedObjects({
                owner: address,
                options: {
                    showType: true,
                    showContent: true,
                },
            });

            // Filter objects related to Medipay package
            const medipayObjects = ownedObjects.data.filter(obj =>
                obj.data?.type?.includes(PACKAGE_ID)
            );

            // Process each object to extract transaction data
            for (const obj of medipayObjects) {
                if (!obj.data?.content) continue;

                const content = obj.data.content as any;
                const objectId = obj.data.objectId;

                // Check object type and extract relevant data
                if (content.type?.includes('Invoice')) {
                    const statusMap = {
                        0: 'pending',
                        1: 'approved',
                        2: 'confirmed',
                        5: 'partially_paid'
                    } as const;

                    const paymentTypeMap = {
                        0: 'cash',
                        1: 'insurance',
                        2: 'split'
                    } as const;

                    // Fetch patient and doctor names
                    const patientAddress = content.fields?.patient_address;
                    const doctorAddress = content.fields?.doctor_address;

                    const [patientName, doctorName] = await Promise.all([
                        patientAddress ? fetchPatientName(patientAddress) : Promise.resolve(undefined),
                        doctorAddress ? fetchDoctorName(doctorAddress) : Promise.resolve(undefined),
                    ]);

                    userTransactions.push({
                        id: objectId,
                        type: 'invoice',
                        status: statusMap[content.fields?.status as keyof typeof statusMap] || 'pending',
                        amount: Number(content.fields?.total_amount || 0),
                        timestamp: Number(content.fields?.created_at || Date.now()),
                        description: `Invoice for ${content.fields?.service_description || 'medical service'}`,
                        blockchainHash: objectId,
                        relatedId: objectId,
                        patientName,
                        doctorName,
                        invoiceDetails: {
                            serviceDescription: content.fields?.service_description || '',
                            totalAmount: Number(content.fields?.total_amount || 0),
                            insuranceCoveredAmount: Number(content.fields?.insurance_covered_amount || 0),
                            patientCopayAmount: Number(content.fields?.patient_copay_amount || 0),
                            paymentType: paymentTypeMap[content.fields?.payment_type as keyof typeof paymentTypeMap] || 'cash',
                            doctorAddress: content.fields?.doctor_address || '',
                            institutionAddress: content.fields?.institution_address || '',
                        },
                    });
                } else if (content.type?.includes('PaymentRecord')) {
                    // For PaymentRecord, we need to fetch the associated Invoice details
                    const invoiceId = content.fields?.invoice_id;
                    let invoiceDetails = undefined;
                    let patientName = undefined;
                    let doctorName = undefined;

                    if (invoiceId) {
                        try {
                            const invoiceObject = await suiClient.getObject({
                                id: invoiceId,
                                options: {
                                    showContent: true,
                                },
                            });

                            if (invoiceObject.data?.content) {
                                const invoiceContent = invoiceObject.data.content as any;
                                const paymentTypeMap = {
                                    0: 'cash',
                                    1: 'insurance',
                                    2: 'split'
                                } as const;

                                invoiceDetails = {
                                    serviceDescription: invoiceContent.fields?.service_description || '',
                                    totalAmount: Number(invoiceContent.fields?.total_amount || 0),
                                    insuranceCoveredAmount: Number(invoiceContent.fields?.insurance_covered_amount || 0),
                                    patientCopayAmount: Number(invoiceContent.fields?.patient_copay_amount || 0),
                                    paymentType: paymentTypeMap[invoiceContent.fields?.payment_type as keyof typeof paymentTypeMap] || 'cash',
                                    doctorAddress: invoiceContent.fields?.doctor_address || '',
                                    institutionAddress: invoiceContent.fields?.institution_address || '',
                                };

                                // Fetch patient and doctor names from invoice
                                const patientAddress = invoiceContent.fields?.patient_address;
                                const doctorAddress = invoiceContent.fields?.doctor_address;

                                [patientName, doctorName] = await Promise.all([
                                    patientAddress ? fetchPatientName(patientAddress) : Promise.resolve(undefined),
                                    doctorAddress ? fetchDoctorName(doctorAddress) : Promise.resolve(undefined),
                                ]);
                            }
                        } catch (err) {
                            console.warn('Failed to fetch invoice details for payment record:', err);
                        }
                    }

                    const paymentTypeMap = {
                        0: 'cash',
                        1: 'insurance'
                    } as const;

                    userTransactions.push({
                        id: objectId,
                        type: 'payment',
                        status: 'confirmed',
                        amount: Number(content.fields?.amount || 0),
                        timestamp: Number(content.fields?.timestamp || Date.now()),
                        description: `Payment of $${Number(content.fields?.amount || 0)} via ${paymentTypeMap[content.fields?.payment_type as keyof typeof paymentTypeMap] || 'cash'}`,
                        blockchainHash: content.fields?.transaction_hash || objectId,
                        relatedId: invoiceId,
                        paymentMethod: paymentTypeMap[content.fields?.payment_type as keyof typeof paymentTypeMap] || 'cash',
                        patientName,
                        doctorName,
                        invoiceDetails,
                    });
                } else if (content.type?.includes('MedicalRecord')) {
                    // Fetch patient name for medical records
                    const patientAddress = content.fields?.patient_address;
                    const patientName = patientAddress ? await fetchPatientName(patientAddress) : undefined;

                    userTransactions.push({
                        id: objectId,
                        type: 'medical_record',
                        status: 'confirmed',
                        timestamp: Number(content.fields?.visit_date || Date.now()),
                        description: 'Medical record created',
                        blockchainHash: objectId,
                        relatedId: objectId,
                        patientName,
                    });
                } else if (content.type?.includes('Prescription')) {
                    // Fetch patient name for prescriptions
                    const patientAddress = content.fields?.patient_address;
                    const patientName = patientAddress ? await fetchPatientName(patientAddress) : undefined;

                    userTransactions.push({
                        id: objectId,
                        type: 'prescription',
                        status: 'confirmed',
                        timestamp: Number(content.fields?.created_at || Date.now()),
                        description: `Prescription for ${content.fields?.medication_name || 'medication'}`,
                        blockchainHash: objectId,
                        relatedId: objectId,
                        patientName,
                    });
                }
            }

            // Also query for transactions where the user was the sender
            const sentTransactions = await suiClient.queryTransactionBlocks({
                filter: {
                    FromAddress: address,
                },
                options: {
                    showInput: true,
                    showEffects: true,
                    showEvents: true,
                },
                limit: 50,
            });

            // Process sent transactions
            for (const tx of sentTransactions.data) {
                if (tx.effects?.status?.status === 'success') {
                    userTransactions.push({
                        id: tx.digest,
                        type: 'payment',
                        status: 'confirmed',
                        timestamp: Number(tx.timestampMs || Date.now()),
                        description: 'Payment transaction',
                        blockchainHash: tx.digest,
                    });
                }
            }

            // Sort transactions by timestamp (most recent first)
            userTransactions.sort((a, b) => b.timestamp - a.timestamp);

            setTransactions(userTransactions);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch user transactions';
            setError(errorMessage);
            toast({
                title: "Error Fetching Transactions",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [address, toast]);

    useEffect(() => {
        fetchUserTransactions();
    }, [fetchUserTransactions]);

    return {
        transactions,
        isLoading,
        error,
        refetch: fetchUserTransactions,
    };
}
