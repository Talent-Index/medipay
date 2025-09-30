import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient } from '@mysten/sui.js/client';
import { bcs } from '@mysten/sui.js/bcs';
import { MEDIPAY_CONTRACT, CLOCK_OBJECT_ID, PACKAGE_ID } from '@/config/sui';
import { suiClient } from './sui';

// Utility functions for Medipay contract interactions

export class MedipayTransactionBuilder {
    private txb: TransactionBlock;

    constructor() {
        this.txb = new TransactionBlock();
    }

    // Patient functions
    registerPatient(patientId: string) {
        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.REGISTER_PATIENT}`,
            arguments: [
                this.txb.pure.string(patientId),
                this.txb.object(CLOCK_OBJECT_ID),
            ],
        });
        return this;
    }

    // Invoice functions
    createInvoice(
        institutionCapId: string,
        patientAddress: string,
        doctorAddress: string,
        serviceDescription: string,
        totalAmount: number,
        insuranceCoveredAmount: number,
        paymentType: number
    ) {
        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.CREATE_INVOICE}`,
            arguments: [
                this.txb.object(institutionCapId),
                this.txb.pure.address(patientAddress),
                this.txb.pure.address(doctorAddress),
                this.txb.pure.string(serviceDescription),
                this.txb.pure.u64(totalAmount),
                this.txb.pure.u64(insuranceCoveredAmount),
                this.txb.pure.u8(paymentType),
                this.txb.object(CLOCK_OBJECT_ID),
            ],
        });
        return this;
    }

    approveInvoiceByInsurance(
        insuranceCapId: string,
        invoiceId: string,
        claimId: string
    ) {
        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.APPROVE_INVOICE_BY_INSURANCE}`,
            arguments: [
                this.txb.object(insuranceCapId),
                this.txb.object(invoiceId),
                this.txb.pure.string(claimId),
                this.txb.object(CLOCK_OBJECT_ID),
            ],
        });
        return this;
    }

    payInvoiceCash(invoiceId: string, amount: number) {
        const [coin] = this.txb.splitCoins(this.txb.gas, [this.txb.pure.u64(amount)]);

        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.PAY_INVOICE_CASH}`,
            arguments: [
                this.txb.object(invoiceId),
                coin,
                this.txb.object(CLOCK_OBJECT_ID),
            ],
        });
        return this;
    }

    payInvoiceInsurance(insuranceCapId: string, invoiceId: string, amount: number) {
        const [coin] = this.txb.splitCoins(this.txb.gas, [this.txb.pure.u64(amount)]);

        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.PAY_INVOICE_INSURANCE}`,
            arguments: [
                this.txb.object(insuranceCapId),
                this.txb.object(invoiceId),
                coin,
                this.txb.object(CLOCK_OBJECT_ID),
            ],
        });
        return this;
    }

    payInvoiceInsurancePortion(insuranceCapId: string, invoiceId: string, amount: number) {
        const [coin] = this.txb.splitCoins(this.txb.gas, [this.txb.pure.u64(amount)]);

        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.PAY_INVOICE_INSURANCE_PORTION}`,
            arguments: [
                this.txb.object(insuranceCapId),
                this.txb.object(invoiceId),
                coin,
                this.txb.object(CLOCK_OBJECT_ID),
            ],
        });
        return this;
    }

    payInvoicePatientCopay(invoiceId: string, amount: number) {
        const [coin] = this.txb.splitCoins(this.txb.gas, [this.txb.pure.u64(amount)]);

        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.PAY_INVOICE_PATIENT_COPAY}`,
            arguments: [
                this.txb.object(invoiceId),
                coin,
                this.txb.object(CLOCK_OBJECT_ID),
            ],
        });
        return this;
    }

    // Medical Record functions
    createMedicalRecord(
        doctorCapId: string,
        patientAddress: string,
        institutionAddress: string,
        encryptedDataHash: number[],
        storageReference: string,
        visitDate: number
    ) {
        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.CREATE_MEDICAL_RECORD}`,
            arguments: [
                this.txb.object(doctorCapId),
                this.txb.pure.address(patientAddress),
                this.txb.pure.address(institutionAddress),
                this.txb.pure(bcs.vector(bcs.u8()).serialize(encryptedDataHash)),
                this.txb.pure.string(storageReference),
                this.txb.pure.u64(visitDate),
                this.txb.object(CLOCK_OBJECT_ID),
            ],
        });
        return this;
    }

    grantMedicalRecordAccess(
        recordId: string,
        viewerAddress: string,
        expiry: number | null,
        canDelegate: boolean
    ) {
        const expiryArg = expiry !== null ? this.txb.pure(bcs.option(bcs.u64()).serialize(expiry)) : this.txb.pure(bcs.option(bcs.u64()).serialize(null));

        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.GRANT_MEDICAL_RECORD_ACCESS}`,
            arguments: [
                this.txb.object(recordId),
                this.txb.pure.address(viewerAddress),
                expiryArg,
                this.txb.pure.bool(canDelegate),
            ],
        });
        return this;
    }

    revokeMedicalRecordAccess(recordId: string, viewerAddress: string) {
        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.REVOKE_MEDICAL_RECORD_ACCESS}`,
            arguments: [
                this.txb.object(recordId),
                this.txb.pure.address(viewerAddress),
            ],
        });
        return this;
    }

    // Prescription functions
    createPrescription(
        doctorCapId: string,
        patientAddress: string,
        medicationName: string,
        dosage: string,
        frequency: string,
        durationDays: number,
        quantity: number,
        instructionsHash: number[]
    ) {
        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.CREATE_PRESCRIPTION}`,
            arguments: [
                this.txb.object(doctorCapId),
                this.txb.pure.address(patientAddress),
                this.txb.pure.string(medicationName),
                this.txb.pure.string(dosage),
                this.txb.pure.string(frequency),
                this.txb.pure.u64(durationDays),
                this.txb.pure.u64(quantity),
                this.txb.pure(bcs.vector(bcs.u8()).serialize(instructionsHash)),
                this.txb.object(CLOCK_OBJECT_ID),
            ],
        });
        return this;
    }

    // Capability creation functions
    createDoctorCapability(licenseNumber: string, institutionAddress: string) {
        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.CREATE_DOCTOR_CAPABILITY}`,
            arguments: [
                this.txb.pure.string(licenseNumber),
                this.txb.pure.address(institutionAddress),
            ],
        });
        return this;
    }

    createInstitutionCapability(institutionName: string) {
        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.CREATE_INSTITUTION_CAPABILITY}`,
            arguments: [
                this.txb.pure.string(institutionName),
            ],
        });
        return this;
    }

    createInsuranceCapability(companyName: string) {
        this.txb.moveCall({
            target: `${MEDIPAY_CONTRACT.PACKAGE_ID}::${MEDIPAY_CONTRACT.MODULE_NAME}::${MEDIPAY_CONTRACT.FUNCTIONS.CREATE_INSURANCE_CAPABILITY}`,
            arguments: [
                this.txb.pure.string(companyName),
            ],
        });
        return this;
    }

    // Get the transaction block
    getTransactionBlock() {
        return this.txb;
    }

    // Set gas budget
    setGasBudget(budget: number) {
        this.txb.setGasBudget(budget);
        return this;
    }
}

// View function callers - TODO: Implement with correct devInspect API
// export const medipayView = {
//     // Add view functions later
// };
