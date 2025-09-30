export interface Invoice {
    id: string;
    patient_address: string;
    doctor_address: string;
    institution_address: string;
    service_description: string;
    total_amount: number;
    insurance_covered_amount: number;
    patient_copay_amount: number;
    payment_type: PaymentType;
    status: InvoiceStatus;
    created_at: number;
    approved_at?: number;
    insurance_paid_at?: number;
    patient_paid_at?: number;
    insurance_claim_id?: string;
}

export enum PaymentType {
    CASH = 0,
    INSURANCE = 1,
    SPLIT = 2,
}

export enum InvoiceStatus {
    PENDING = 0,
    APPROVED = 1,
    PAID = 2,
    PARTIALLY_PAID = 5,
}

export interface MedicalRecord {
    id: string;
    patient_address: string;
    doctor_address: string;
    encrypted_data_hash: string;
    storage_reference: string;
    visit_date: number;
    created_at: number;
}

export interface PaymentRecord {
    id: string;
    invoice_id: string;
    amount: number;
    payment_type: PaymentType;
    timestamp: number;
}

export interface InsurancePackage {
    id: string;
    name: string;
    description: string;
    premium_amount: number;
}

export interface PatientInsurance {
    id: string;
    patient_address: string;
    insurance_package_id: string;
    coverage_start: number;
    coverage_end: number;
}

export interface InsurancePackageService {
    id: string;
    insurance_package_id: string;
    service_description: string;
    coverage_amount: number;
}

export interface User {
    id: string;
    address: string;
    role?: UserRole;
    name: string;
    email: string;
    phone?: string;
    created_at: number;
}

export enum UserRole {
    PATIENT = 'patient',
    DOCTOR = 'doctor',
    INSTITUTION = 'institution',
    INSURANCE = 'insurance',
}