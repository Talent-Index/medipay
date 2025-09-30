module medipay_contracts::medipay_contracts {
    use std::string::String;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::vec_set::{Self, VecSet};

    // ==================== Error Codes ====================
    const ENotAuthorized: u64 = 0;
    const EInsufficientFunds: u64 = 2;
    const EInvalidAmount: u64 = 3;
    const EInvalidStatus: u64 = 4;
    const EInvalidPaymentType: u64 = 6;

    // ==================== Status Codes ====================
    const STATUS_PENDING: u8 = 0;
    const STATUS_APPROVED: u8 = 1;
    const STATUS_PAID: u8 = 2;
    const STATUS_PARTIALLY_PAID: u8 = 5;

    // ==================== Payment Types ====================
    const PAYMENT_CASH: u8 = 0;
    const PAYMENT_INSURANCE: u8 = 1;
    const PAYMENT_SPLIT: u8 = 2;

    // ==================== Core Objects ====================

    public struct Patient has key {
        id: UID,
        wallet_address: address,
        patient_id: String,
        insurance_policy_id: Option<ID>,
        created_at: u64,
    }

    public struct Invoice has key, store {
        id: UID,
        patient_address: address,
        doctor_address: address,
        institution_address: address,
        service_description: String,
        total_amount: u64,
        insurance_covered_amount: u64,
        patient_copay_amount: u64,
        payment_type: u8,
        status: u8,
        created_at: u64,
        approved_at: Option<u64>,
        insurance_paid_at: Option<u64>,
        patient_paid_at: Option<u64>,
        insurance_claim_id: Option<String>,
        insurance_payment_id: Option<ID>,
        patient_payment_id: Option<ID>,
    }

    public struct PaymentRecord has key, store {
        id: UID,
        invoice_id: ID,
        patient_address: address,
        recipient_address: address,
        amount: u64,
        payment_type: u8,
        timestamp: u64,
        transaction_hash: address,
    }

    public struct MedicalRecord has key, store {
        id: UID,
        patient_address: address,
        doctor_address: address,
        institution_address: address,
        encrypted_data_hash: vector<u8>,
        storage_reference: String,
        visit_date: u64,
        created_at: u64,
        authorized_viewers: VecSet<address>,
    }

    public struct MedicalRecordAccess has key, store {
        id: UID,
        record_id: ID,
        granted_to: address,
        granted_by: address,
        expiry: Option<u64>,
        can_delegate: bool,
    }

    public struct Prescription has key, store {
        id: UID,
        patient_address: address,
        doctor_address: address,
        medication_name: String,
        dosage: String,
        frequency: String,
        duration_days: u64,
        quantity: u64,
        instructions_hash: vector<u8>,
        created_at: u64,
        filled: bool,
        pharmacy_address: Option<address>,
    }

    public struct InsurancePolicy has key {
        id: UID,
        patient_address: address,
        insurance_company_address: address,
        policy_number: String,
        coverage_amount: u64,
        deductible: u64,
        active: bool,
        created_at: u64,
        expires_at: u64,
    }

    // ==================== Capabilities ====================

    public struct DoctorCap has key {
        id: UID,
        doctor_address: address,
        license_number: String,
        institution_address: address,
    }

    public struct InstitutionCap has key {
        id: UID,
        institution_address: address,
        institution_name: String,
    }

    public struct InsuranceCap has key {
        id: UID,
        insurance_company_address: address,
        company_name: String,
    }

    // ==================== Events ====================

    public struct InvoiceCreated has copy, drop {
        invoice_id: ID,
        patient_address: address,
        amount: u64,
        payment_type: u8,
    }

    public struct InvoiceApproved has copy, drop {
        invoice_id: ID,
        approved_by: address,
        timestamp: u64,
    }

    public struct PaymentCompleted has copy, drop {
        invoice_id: ID,
        payment_record_id: ID,
        amount: u64,
        payment_type: u8,
    }

    public struct MedicalRecordCreated has copy, drop {
        record_id: ID,
        patient_address: address,
        doctor_address: address,
    }

    public struct AccessGranted has copy, drop {
        record_id: ID,
        granted_to: address,
        granted_by: address,
    }

    public struct PrescriptionCreated has copy, drop {
        prescription_id: ID,
        patient_address: address,
        doctor_address: address,
    }

    // ==================== Init Function ====================

    fun init(_ctx: &mut TxContext) {
        // Module initialization
    }

    // ==================== Patient Functions ====================

    public fun register_patient(
        patient_id: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let patient = Patient {
            id: object::new(ctx),
            wallet_address: tx_context::sender(ctx),
            patient_id,
            insurance_policy_id: option::none(),
            created_at: clock::timestamp_ms(clock),
        };
        transfer::transfer(patient, tx_context::sender(ctx));
    }

    // ==================== Invoice Functions ====================

    public fun create_invoice(
        _cap: &InstitutionCap,
        patient_address: address,
        doctor_address: address,
        service_description: String,
        total_amount: u64,
        insurance_covered_amount: u64,
        payment_type: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(total_amount > 0, EInvalidAmount);
        assert!(insurance_covered_amount <= total_amount, EInvalidAmount);
        assert!(
            payment_type == PAYMENT_CASH || 
            payment_type == PAYMENT_INSURANCE || 
            payment_type == PAYMENT_SPLIT, 
            EInvalidPaymentType
        );

        let invoice_uid = object::new(ctx);
        let invoice_id = object::uid_to_inner(&invoice_uid);

        let patient_copay = if (payment_type == PAYMENT_SPLIT) {
            total_amount - insurance_covered_amount
        } else if (payment_type == PAYMENT_CASH) {
            total_amount
        } else {
            0
        };

        let invoice = Invoice {
            id: invoice_uid,
            patient_address,
            doctor_address,
            institution_address: tx_context::sender(ctx),
            service_description,
            total_amount,
            insurance_covered_amount,
            patient_copay_amount: patient_copay,
            payment_type,
            status: STATUS_PENDING,
            created_at: clock::timestamp_ms(clock),
            approved_at: option::none(),
            insurance_paid_at: option::none(),
            patient_paid_at: option::none(),
            insurance_claim_id: option::none(),
            insurance_payment_id: option::none(),
            patient_payment_id: option::none(),
        };

        event::emit(InvoiceCreated {
            invoice_id,
            patient_address,
            amount: total_amount,
            payment_type,
        });

        transfer::share_object(invoice);
    }

    public fun approve_invoice_by_insurance(
        _cap: &InsuranceCap,
        invoice: &mut Invoice,
        claim_id: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(invoice.payment_type == PAYMENT_INSURANCE || invoice.payment_type == PAYMENT_SPLIT, EInvalidPaymentType);
        assert!(invoice.status == STATUS_PENDING, EInvalidStatus);

        invoice.status = STATUS_APPROVED;
        invoice.approved_at = option::some(clock::timestamp_ms(clock));
        invoice.insurance_claim_id = option::some(claim_id);

        event::emit(InvoiceApproved {
            invoice_id: object::uid_to_inner(&invoice.id),
            approved_by: tx_context::sender(ctx),
            timestamp: clock::timestamp_ms(clock),
        });
    }

    public fun pay_invoice_cash(
        invoice: &mut Invoice,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(invoice.payment_type == PAYMENT_CASH, EInvalidPaymentType);
        assert!(invoice.status == STATUS_PENDING, EInvalidStatus);
        assert!(coin::value(&payment) >= invoice.total_amount, EInsufficientFunds);
        assert!(tx_context::sender(ctx) == invoice.patient_address, ENotAuthorized);

        invoice.status = STATUS_PAID;
        invoice.patient_paid_at = option::some(clock::timestamp_ms(clock));

        let record_uid = object::new(ctx);
        let record_id = object::uid_to_inner(&record_uid);
        let invoice_id = object::uid_to_inner(&invoice.id);
        
        let payment_record = PaymentRecord {
            id: record_uid,
            invoice_id,
            patient_address: invoice.patient_address,
            recipient_address: invoice.institution_address,
            amount: invoice.total_amount,
            payment_type: PAYMENT_CASH,
            timestamp: clock::timestamp_ms(clock),
            transaction_hash: object::id_to_address(&invoice_id),
        };

        invoice.patient_payment_id = option::some(record_id);

        event::emit(PaymentCompleted {
            invoice_id,
            payment_record_id: record_id,
            amount: invoice.total_amount,
            payment_type: PAYMENT_CASH,
        });

        transfer::public_transfer(payment, invoice.institution_address);
        transfer::transfer(payment_record, invoice.patient_address);
    }

    public fun pay_invoice_insurance(
        _cap: &InsuranceCap,
        invoice: &mut Invoice,
        payment: Coin<SUI>,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        assert!(invoice.payment_type == PAYMENT_INSURANCE, EInvalidPaymentType);
        assert!(invoice.status == STATUS_APPROVED, EInvalidStatus);
        assert!(coin::value(&payment) >= invoice.total_amount, EInsufficientFunds);

        invoice.status = STATUS_PAID;
        invoice.insurance_paid_at = option::some(clock::timestamp_ms(clock));

        let record_uid = object::new(_ctx);
        let record_id = object::uid_to_inner(&record_uid);
        let invoice_id = object::uid_to_inner(&invoice.id);
        
        let payment_record = PaymentRecord {
            id: record_uid,
            invoice_id,
            patient_address: invoice.patient_address,
            recipient_address: invoice.institution_address,
            amount: invoice.total_amount,
            payment_type: PAYMENT_INSURANCE,
            timestamp: clock::timestamp_ms(clock),
            transaction_hash: object::id_to_address(&invoice_id),
        };

        invoice.insurance_payment_id = option::some(record_id);

        event::emit(PaymentCompleted {
            invoice_id,
            payment_record_id: record_id,
            amount: invoice.total_amount,
            payment_type: PAYMENT_INSURANCE,
        });

        transfer::public_transfer(payment, invoice.institution_address);
        transfer::transfer(payment_record, invoice.patient_address);
    }

    public fun pay_invoice_insurance_portion(
        _cap: &InsuranceCap,
        invoice: &mut Invoice,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(invoice.payment_type == PAYMENT_SPLIT, EInvalidPaymentType);
        assert!(invoice.status == STATUS_APPROVED, EInvalidStatus);
        assert!(coin::value(&payment) >= invoice.insurance_covered_amount, EInsufficientFunds);

        invoice.status = STATUS_PARTIALLY_PAID;
        invoice.insurance_paid_at = option::some(clock::timestamp_ms(clock));

        let record_uid = object::new(ctx);
        let record_id = object::uid_to_inner(&record_uid);
        let invoice_id = object::uid_to_inner(&invoice.id);
        
        let payment_record = PaymentRecord {
            id: record_uid,
            invoice_id,
            patient_address: invoice.patient_address,
            recipient_address: invoice.institution_address,
            amount: invoice.insurance_covered_amount,
            payment_type: PAYMENT_INSURANCE,
            timestamp: clock::timestamp_ms(clock),
            transaction_hash: object::id_to_address(&invoice_id),
        };

        invoice.insurance_payment_id = option::some(record_id);

        event::emit(PaymentCompleted {
            invoice_id,
            payment_record_id: record_id,
            amount: invoice.insurance_covered_amount,
            payment_type: PAYMENT_INSURANCE,
        });

        transfer::public_transfer(payment, invoice.institution_address);
        transfer::transfer(payment_record, invoice.patient_address);
    }

    public fun pay_invoice_patient_copay(
        invoice: &mut Invoice,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(invoice.payment_type == PAYMENT_SPLIT, EInvalidPaymentType);
        assert!(invoice.status == STATUS_PARTIALLY_PAID, EInvalidStatus);
        assert!(coin::value(&payment) >= invoice.patient_copay_amount, EInsufficientFunds);
        assert!(tx_context::sender(ctx) == invoice.patient_address, ENotAuthorized);

        invoice.status = STATUS_PAID;
        invoice.patient_paid_at = option::some(clock::timestamp_ms(clock));

        let record_uid = object::new(ctx);
        let record_id = object::uid_to_inner(&record_uid);
        let invoice_id = object::uid_to_inner(&invoice.id);
        
        let payment_record = PaymentRecord {
            id: record_uid,
            invoice_id,
            patient_address: invoice.patient_address,
            recipient_address: invoice.institution_address,
            amount: invoice.patient_copay_amount,
            payment_type: PAYMENT_CASH,
            timestamp: clock::timestamp_ms(clock),
            transaction_hash: object::id_to_address(&invoice_id),
        };

        invoice.patient_payment_id = option::some(record_id);

        event::emit(PaymentCompleted {
            invoice_id,
            payment_record_id: record_id,
            amount: invoice.patient_copay_amount,
            payment_type: PAYMENT_CASH,
        });

        transfer::public_transfer(payment, invoice.institution_address);
        transfer::transfer(payment_record, invoice.patient_address);
    }

    // ==================== Medical Record Functions ====================

    public fun create_medical_record(
        _cap: &DoctorCap,
        patient_address: address,
        institution_address: address,
        encrypted_data_hash: vector<u8>,
        storage_reference: String,
        visit_date: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let record_uid = object::new(ctx);
        let record_id = object::uid_to_inner(&record_uid);
        
        let mut authorized_viewers = vec_set::empty<address>();
        vec_set::insert(&mut authorized_viewers, patient_address);
        vec_set::insert(&mut authorized_viewers, tx_context::sender(ctx));

        let medical_record = MedicalRecord {
            id: record_uid,
            patient_address,
            doctor_address: tx_context::sender(ctx),
            institution_address,
            encrypted_data_hash,
            storage_reference,
            visit_date,
            created_at: clock::timestamp_ms(clock),
            authorized_viewers,
        };

        event::emit(MedicalRecordCreated {
            record_id,
            patient_address,
            doctor_address: tx_context::sender(ctx),
        });

        transfer::transfer(medical_record, patient_address);
    }

    public fun grant_medical_record_access(
        record: &mut MedicalRecord,
        viewer_address: address,
        expiry: Option<u64>,
        can_delegate: bool,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == record.patient_address || vec_set::contains(&record.authorized_viewers, &sender), ENotAuthorized);

        vec_set::insert(&mut record.authorized_viewers, viewer_address);

        let access_cap = MedicalRecordAccess {
            id: object::new(ctx),
            record_id: object::uid_to_inner(&record.id),
            granted_to: viewer_address,
            granted_by: sender,
            expiry,
            can_delegate,
        };

        event::emit(AccessGranted {
            record_id: object::uid_to_inner(&record.id),
            granted_to: viewer_address,
            granted_by: sender,
        });

        transfer::transfer(access_cap, viewer_address);
    }

    public fun revoke_medical_record_access(
        record: &mut MedicalRecord,
        viewer_address: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == record.patient_address, ENotAuthorized);
        vec_set::remove(&mut record.authorized_viewers, &viewer_address);
    }

    // ==================== Prescription Functions ====================

    public fun create_prescription(
        _cap: &DoctorCap,
        patient_address: address,
        medication_name: String,
        dosage: String,
        frequency: String,
        duration_days: u64,
        quantity: u64,
        instructions_hash: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(quantity > 0, EInvalidAmount);

        let prescription_uid = object::new(ctx);
        let prescription_id = object::uid_to_inner(&prescription_uid);

        let prescription = Prescription {
            id: prescription_uid,
            patient_address,
            doctor_address: tx_context::sender(ctx),
            medication_name,
            dosage,
            frequency,
            duration_days,
            quantity,
            instructions_hash,
            created_at: clock::timestamp_ms(clock),
            filled: false,
            pharmacy_address: option::none(),
        };

        event::emit(PrescriptionCreated {
            prescription_id,
            patient_address,
            doctor_address: tx_context::sender(ctx),
        });

        transfer::transfer(prescription, patient_address);
    }

    // ==================== Capability Creation Functions ====================

    public fun create_doctor_capability(
        license_number: String,
        institution_address: address,
        ctx: &mut TxContext
    ) {
        let cap = DoctorCap {
            id: object::new(ctx),
            doctor_address: tx_context::sender(ctx),
            license_number,
            institution_address,
        };
        transfer::transfer(cap, tx_context::sender(ctx));
    }

    public fun create_institution_capability(
        institution_name: String,
        ctx: &mut TxContext
    ) {
        let cap = InstitutionCap {
            id: object::new(ctx),
            institution_address: tx_context::sender(ctx),
            institution_name,
        };
        transfer::transfer(cap, tx_context::sender(ctx));
    }

    public fun create_insurance_capability(
        company_name: String,
        ctx: &mut TxContext
    ) {
        let cap = InsuranceCap {
            id: object::new(ctx),
            insurance_company_address: tx_context::sender(ctx),
            company_name,
        };
        transfer::transfer(cap, tx_context::sender(ctx));
    }

    // ==================== View Functions ====================

    public fun is_invoice_paid(invoice: &Invoice): bool {
        invoice.status == STATUS_PAID
    }

    public fun is_invoice_partially_paid(invoice: &Invoice): bool {
        invoice.status == STATUS_PARTIALLY_PAID
    }

    public fun get_invoice_total_amount(invoice: &Invoice): u64 {
        invoice.total_amount
    }

    public fun get_invoice_insurance_amount(invoice: &Invoice): u64 {
        invoice.insurance_covered_amount
    }

    public fun get_invoice_patient_copay(invoice: &Invoice): u64 {
        invoice.patient_copay_amount
    }

    public fun get_remaining_balance(invoice: &Invoice): u64 {
        if (invoice.status == STATUS_PENDING) {
            invoice.total_amount
        } else if (invoice.status == STATUS_PARTIALLY_PAID) {
            invoice.patient_copay_amount
        } else {
            0
        }
    }

    public fun verify_medical_record_hash(
        record: &MedicalRecord,
        hash_to_verify: vector<u8>
    ): bool {
        record.encrypted_data_hash == hash_to_verify
    }

    public fun has_medical_record_access(
        record: &MedicalRecord,
        viewer: address
    ): bool {
        vec_set::contains(&record.authorized_viewers, &viewer)
    }
}