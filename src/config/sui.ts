import { getFullnodeUrl } from '@mysten/sui.js/client';
import { createNetworkConfig } from '@mysten/dapp-kit';

// Replace with your deployed package ID
export const PACKAGE_ID = import.meta.env.SUI_DEPLOYED_PACKAGE_ID ?? ""; // From deployment

export const CLOCK_OBJECT_ID = '0x6'; // Sui system clock

// Medipay contract configuration
export const MEDIPAY_CONTRACT = {
    PACKAGE_ID: PACKAGE_ID,
    MODULE_NAME: 'medipay_contracts',
    OBJECT_TYPES: {
        PATIENT: `${PACKAGE_ID}::medipay_contracts::Patient`,
        INVOICE: `${PACKAGE_ID}::medipay_contracts::Invoice`,
        PAYMENT_RECORD: `${PACKAGE_ID}::medipay_contracts::PaymentRecord`,
        MEDICAL_RECORD: `${PACKAGE_ID}::medipay_contracts::MedicalRecord`,
        MEDICAL_RECORD_ACCESS: `${PACKAGE_ID}::medipay_contracts::MedicalRecordAccess`,
        PRESCRIPTION: `${PACKAGE_ID}::medipay_contracts::Prescription`,
        INSURANCE_POLICY: `${PACKAGE_ID}::medipay_contracts::InsurancePolicy`,
        DOCTOR_CAP: `${PACKAGE_ID}::medipay_contracts::DoctorCap`,
        INSTITUTION_CAP: `${PACKAGE_ID}::medipay_contracts::InstitutionCap`,
        INSURANCE_CAP: `${PACKAGE_ID}::medipay_contracts::InsuranceCap`,
    },
    FUNCTIONS: {
        // Patient
        REGISTER_PATIENT: 'register_patient',
        // Invoice
        CREATE_INVOICE: 'create_invoice',
        APPROVE_INVOICE_BY_INSURANCE: 'approve_invoice_by_insurance',
        PAY_INVOICE_CASH: 'pay_invoice_cash',
        PAY_INVOICE_INSURANCE: 'pay_invoice_insurance',
        PAY_INVOICE_INSURANCE_PORTION: 'pay_invoice_insurance_portion',
        PAY_INVOICE_PATIENT_COPAY: 'pay_invoice_patient_copay',
        // Medical Record
        CREATE_MEDICAL_RECORD: 'create_medical_record',
        GRANT_MEDICAL_RECORD_ACCESS: 'grant_medical_record_access',
        REVOKE_MEDICAL_RECORD_ACCESS: 'revoke_medical_record_access',
        // Prescription
        CREATE_PRESCRIPTION: 'create_prescription',
        // Capabilities
        CREATE_DOCTOR_CAPABILITY: 'create_doctor_capability',
        CREATE_INSTITUTION_CAPABILITY: 'create_institution_capability',
        CREATE_INSURANCE_CAPABILITY: 'create_insurance_capability',
        // View functions
        IS_INVOICE_PAID: 'is_invoice_paid',
        IS_INVOICE_PARTIALLY_PAID: 'is_invoice_partially_paid',
        GET_INVOICE_TOTAL_AMOUNT: 'get_invoice_total_amount',
        GET_INVOICE_INSURANCE_AMOUNT: 'get_invoice_insurance_amount',
        GET_INVOICE_PATIENT_COPAY: 'get_invoice_patient_copay',
        GET_REMAINING_BALANCE: 'get_remaining_balance',
        VERIFY_MEDICAL_RECORD_HASH: 'verify_medical_record_hash',
        HAS_MEDICAL_RECORD_ACCESS: 'has_medical_record_access',
    }
} as const;

// Network configuration
const { networkConfig, useNetworkVariable, useNetworkVariables } =
    createNetworkConfig({
        testnet: {
            url: getFullnodeUrl('testnet'),
        },
        mainnet: {
            url: getFullnodeUrl('mainnet'),
        },
    });

export { useNetworkVariable, useNetworkVariables, networkConfig };
