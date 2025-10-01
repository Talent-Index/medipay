#[test_only]
module medipay_contracts::medipay_contracts_tests {
    use sui::test_scenario::{Self as test, Scenario, next_tx, ctx};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::test_utils;
    use std::string;
    
    use medipay_contracts::medipay_contracts::{
        Self as medipay,
        DoctorCap,
        InstitutionCap,
        InsuranceCap,
        Invoice,
        PaymentRecord,
        MedicalRecord,
        Prescription,
        Patient
    };

    // Test addresses
    const HOSPITAL: address = @0xA1;
    const DOCTOR: address = @0xD1;
    const PATIENT: address = @0xB1;
    const INSURANCE: address = @0xC1;

    // Test helper: Create a test clock
    fun create_clock(scenario: &mut Scenario): Clock {
        clock::create_for_testing(ctx(scenario))
    }

    // Test helper: Mint test SUI
    fun mint_sui(amount: u64, scenario: &mut Scenario): Coin<SUI> {
        coin::mint_for_testing<SUI>(amount, ctx(scenario))
    }

    // ==================== Capability Tests ====================

    #[test]
    fun test_create_institution_capability() {
        let mut scenario = test::begin(HOSPITAL);
        
        // Hospital creates capability
        next_tx(&mut scenario, HOSPITAL);
        {
            medipay::create_institution_capability(
                string::utf8(b"City Hospital"),
                ctx(&mut scenario)
            );
        };

        // Verify capability was created and transferred
        next_tx(&mut scenario, HOSPITAL);
        {
            let cap = test::take_from_sender<InstitutionCap>(&scenario);
            test::return_to_sender(&scenario, cap);
        };

        test::end(scenario);
    }

    #[test]
    fun test_create_doctor_capability() {
        let mut scenario = test::begin(DOCTOR);
        
        next_tx(&mut scenario, DOCTOR);
        {
            medipay::create_doctor_capability(
                string::utf8(b"LIC-12345"),
                HOSPITAL,
                ctx(&mut scenario)
            );
        };

        next_tx(&mut scenario, DOCTOR);
        {
            let cap = test::take_from_sender<DoctorCap>(&scenario);
            test::return_to_sender(&scenario, cap);
        };

        test::end(scenario);
    }

    #[test]
    fun test_create_insurance_capability() {
        let mut scenario = test::begin(INSURANCE);
        
        next_tx(&mut scenario, INSURANCE);
        {
            medipay::create_insurance_capability(
                string::utf8(b"HealthCare Inc"),
                ctx(&mut scenario)
            );
        };

        next_tx(&mut scenario, INSURANCE);
        {
            let cap = test::take_from_sender<InsuranceCap>(&scenario);
            test::return_to_sender(&scenario, cap);
        };

        test::end(scenario);
    }

    // ==================== Patient Registration Tests ====================

    #[test]
    fun test_register_patient() {
        let mut scenario = test::begin(PATIENT);
        let clock = create_clock(&mut scenario);
        
        next_tx(&mut scenario, PATIENT);
        {
            medipay::register_patient(
                string::utf8(b"PATIENT-001"),
                &clock,
                ctx(&mut scenario)
            );
        };

        next_tx(&mut scenario, PATIENT);
        {
            let patient = test::take_from_sender<Patient>(&scenario);
            test::return_to_sender(&scenario, patient);
        };

        test_utils::destroy(clock);
        test::end(scenario);
    }

    // ==================== Invoice Tests ====================

    #[test]
    fun test_create_cash_invoice() {
        let mut scenario = test::begin(HOSPITAL);
        let clock = create_clock(&mut scenario);

        // Create institution capability
        next_tx(&mut scenario, HOSPITAL);
        {
            medipay::create_institution_capability(
                string::utf8(b"City Hospital"),
                ctx(&mut scenario)
            );
        };

        // Create invoice
        next_tx(&mut scenario, HOSPITAL);
        {
            let cap = test::take_from_sender<InstitutionCap>(&scenario);
            
            medipay::create_invoice(
                &cap,
                PATIENT,
                DOCTOR,
                string::utf8(b"X-Ray Examination"),
                500, // total_amount
                0,   // insurance_covered_amount
                0,   // PAYMENT_CASH
                &clock,
                ctx(&mut scenario)
            );
            
            test::return_to_sender(&scenario, cap);
        };

        // Verify invoice was created as shared object
        next_tx(&mut scenario, HOSPITAL);
        {
            let invoice = test::take_shared<Invoice>(&scenario);
            assert!(medipay::get_invoice_total_amount(&invoice) == 500, 0);
            assert!(medipay::get_invoice_patient_copay(&invoice) == 500, 1);
            test::return_shared(invoice);
        };

        test_utils::destroy(clock);
        test::end(scenario);
    }

    #[test]
    fun test_create_split_payment_invoice() {
        let mut scenario = test::begin(HOSPITAL);
        let clock = create_clock(&mut scenario);

        next_tx(&mut scenario, HOSPITAL);
        {
            medipay::create_institution_capability(
                string::utf8(b"City Hospital"),
                ctx(&mut scenario)
            );
        };

        next_tx(&mut scenario, HOSPITAL);
        {
            let cap = test::take_from_sender<InstitutionCap>(&scenario);
            
            medipay::create_invoice(
                &cap,
                PATIENT,
                DOCTOR,
                string::utf8(b"Surgery"),
                2000, // total
                1600, // insurance covers 80%
                2,    // PAYMENT_SPLIT
                &clock,
                ctx(&mut scenario)
            );
            
            test::return_to_sender(&scenario, cap);
        };

        next_tx(&mut scenario, HOSPITAL);
        {
            let invoice = test::take_shared<Invoice>(&scenario);
            assert!(medipay::get_invoice_total_amount(&invoice) == 2000, 0);
            assert!(medipay::get_invoice_insurance_amount(&invoice) == 1600, 1);
            assert!(medipay::get_invoice_patient_copay(&invoice) == 400, 2);
            test::return_shared(invoice);
        };

        test_utils::destroy(clock);
        test::end(scenario);
    }

    // ==================== Payment Tests ====================

    #[test]
    fun test_cash_payment_flow() {
        let mut scenario = test::begin(HOSPITAL);
        let clock = create_clock(&mut scenario);

        // Setup: Create capability and invoice
        next_tx(&mut scenario, HOSPITAL);
        {
            medipay::create_institution_capability(
                string::utf8(b"City Hospital"),
                ctx(&mut scenario)
            );
        };

        next_tx(&mut scenario, HOSPITAL);
        {
            let cap = test::take_from_sender<InstitutionCap>(&scenario);
            medipay::create_invoice(
                &cap,
                PATIENT,
                DOCTOR,
                string::utf8(b"Consultation"),
                500, 0, 0,
                &clock,
                ctx(&mut scenario)
            );
            test::return_to_sender(&scenario, cap);
        };

        // Patient pays
        next_tx(&mut scenario, PATIENT);
        {
            let mut invoice = test::take_shared<Invoice>(&scenario);
            let payment = mint_sui(500, &mut scenario);
            
            medipay::pay_invoice_cash(
                &mut invoice,
                payment,
                &clock,
                ctx(&mut scenario)
            );
            
            assert!(medipay::is_invoice_paid(&invoice), 0);
            test::return_shared(invoice);
        };

        // Verify payment record received by patient
        next_tx(&mut scenario, PATIENT);
        {
            let record = test::take_from_sender<PaymentRecord>(&scenario);
            test::return_to_sender(&scenario, record);
        };

        test_utils::destroy(clock);
        test::end(scenario);
    }

    #[test]
    fun test_split_payment_flow() {
        let mut scenario = test::begin(HOSPITAL);
        let clock = create_clock(&mut scenario);

        // Setup capabilities
        next_tx(&mut scenario, HOSPITAL);
        {
            medipay::create_institution_capability(
                string::utf8(b"City Hospital"),
                ctx(&mut scenario)
            );
        };

        next_tx(&mut scenario, INSURANCE);
        {
            medipay::create_insurance_capability(
                string::utf8(b"HealthCare Inc"),
                ctx(&mut scenario)
            );
        };

        // Create split invoice
        next_tx(&mut scenario, HOSPITAL);
        {
            let cap = test::take_from_sender<InstitutionCap>(&scenario);
            medipay::create_invoice(
                &cap,
                PATIENT,
                DOCTOR,
                string::utf8(b"Surgery"),
                2000, 1600, 2, // 80/20 split
                &clock,
                ctx(&mut scenario)
            );
            test::return_to_sender(&scenario, cap);
        };

        // Insurance approves
        next_tx(&mut scenario, INSURANCE);
        {
            let cap = test::take_from_sender<InsuranceCap>(&scenario);
            let mut invoice = test::take_shared<Invoice>(&scenario);
            
            medipay::approve_invoice_by_insurance(
                &cap,
                &mut invoice,
                string::utf8(b"CLAIM-2024-001"),
                &clock,
                ctx(&mut scenario)
            );
            
            test::return_shared(invoice);
            test::return_to_sender(&scenario, cap);
        };

        // Insurance pays their portion
        next_tx(&mut scenario, INSURANCE);
        {
            let cap = test::take_from_sender<InsuranceCap>(&scenario);
            let mut invoice = test::take_shared<Invoice>(&scenario);
            let payment = mint_sui(1600, &mut scenario);
            
            medipay::pay_invoice_insurance_portion(
                &cap,
                &mut invoice,
                payment,
                &clock,
                ctx(&mut scenario)
            );
            
            assert!(medipay::is_invoice_partially_paid(&invoice), 0);
            assert!(medipay::get_remaining_balance(&invoice) == 400, 1);
            
            test::return_shared(invoice);
            test::return_to_sender(&scenario, cap);
        };

        // Patient pays copay
        next_tx(&mut scenario, PATIENT);
        {
            let mut invoice = test::take_shared<Invoice>(&scenario);
            let payment = mint_sui(400, &mut scenario);
            
            medipay::pay_invoice_patient_copay(
                &mut invoice,
                payment,
                &clock,
                ctx(&mut scenario)
            );
            
            assert!(medipay::is_invoice_paid(&invoice), 0);
            assert!(medipay::get_remaining_balance(&invoice) == 0, 1);
            
            test::return_shared(invoice);
        };

        // Verify patient received both payment records
        next_tx(&mut scenario, PATIENT);
        {
            let record1 = test::take_from_sender<PaymentRecord>(&scenario);
            let record2 = test::take_from_sender<PaymentRecord>(&scenario);
            test::return_to_sender(&scenario, record1);
            test::return_to_sender(&scenario, record2);
        };

        test_utils::destroy(clock);
        test::end(scenario);
    }

    // ==================== Medical Record Tests ====================

    #[test]
    fun test_create_medical_record() {
        let mut scenario = test::begin(DOCTOR);
        let clock = create_clock(&mut scenario);

        // Create doctor capability
        next_tx(&mut scenario, DOCTOR);
        {
            medipay::create_doctor_capability(
                string::utf8(b"LIC-12345"),
                HOSPITAL,
                ctx(&mut scenario)
            );
        };

        // Create medical record
        next_tx(&mut scenario, DOCTOR);
        {
            let cap = test::take_from_sender<DoctorCap>(&scenario);
            let hash = b"encrypted_data_hash_here";
            
            medipay::create_medical_record(
                &cap,
                PATIENT,
                HOSPITAL,
                hash,
                string::utf8(b"ipfs://QmXxx..."),
                1234567890,
                &clock,
                ctx(&mut scenario)
            );
            
            test::return_to_sender(&scenario, cap);
        };

        // Verify patient received the record
        next_tx(&mut scenario, PATIENT);
        {
            let record = test::take_from_sender<MedicalRecord>(&scenario);
            assert!(medipay::has_medical_record_access(&record, PATIENT), 0);
            assert!(medipay::has_medical_record_access(&record, DOCTOR), 1);
            test::return_to_sender(&scenario, record);
        };

        test_utils::destroy(clock);
        test::end(scenario);
    }

    #[test]
    fun test_grant_and_revoke_medical_record_access() {
        let mut scenario = test::begin(DOCTOR);
        let clock = create_clock(&mut scenario);
        let other_doctor = @0xD2;

        // Setup: Create capability and record
        next_tx(&mut scenario, DOCTOR);
        {
            medipay::create_doctor_capability(
                string::utf8(b"LIC-12345"),
                HOSPITAL,
                ctx(&mut scenario)
            );
        };

        next_tx(&mut scenario, DOCTOR);
        {
            let cap = test::take_from_sender<DoctorCap>(&scenario);
            medipay::create_medical_record(
                &cap,
                PATIENT,
                HOSPITAL,
                b"hash",
                string::utf8(b"ipfs://QmXxx..."),
                1234567890,
                &clock,
                ctx(&mut scenario)
            );
            test::return_to_sender(&scenario, cap);
        };

        // Patient grants access to another doctor
        next_tx(&mut scenario, PATIENT);
        {
            let mut record = test::take_from_sender<MedicalRecord>(&scenario);
            
            medipay::grant_medical_record_access(
                &mut record,
                other_doctor,
                option::none(),
                false,
                ctx(&mut scenario)
            );
            
            assert!(medipay::has_medical_record_access(&record, other_doctor), 0);
            test::return_to_sender(&scenario, record);
        };

        // Patient revokes access
        next_tx(&mut scenario, PATIENT);
        {
            let mut record = test::take_from_sender<MedicalRecord>(&scenario);
            
            medipay::revoke_medical_record_access(
                &mut record,
                other_doctor,
                ctx(&mut scenario)
            );
            
            assert!(!medipay::has_medical_record_access(&record, other_doctor), 0);
            test::return_to_sender(&scenario, record);
        };

        test_utils::destroy(clock);
        test::end(scenario);
    }

    // ==================== Prescription Tests ====================

    #[test]
    fun test_create_prescription() {
        let mut scenario = test::begin(DOCTOR);
        let clock = create_clock(&mut scenario);

        next_tx(&mut scenario, DOCTOR);
        {
            medipay::create_doctor_capability(
                string::utf8(b"LIC-12345"),
                HOSPITAL,
                ctx(&mut scenario)
            );
        };

        next_tx(&mut scenario, DOCTOR);
        {
            let cap = test::take_from_sender<DoctorCap>(&scenario);
            
            medipay::create_prescription(
                &cap,
                PATIENT,
                string::utf8(b"Amoxicillin"),
                string::utf8(b"500mg"),
                string::utf8(b"Twice daily"),
                7, // days
                14, // quantity
                b"instruction_hash",
                &clock,
                ctx(&mut scenario)
            );
            
            test::return_to_sender(&scenario, cap);
        };

        next_tx(&mut scenario, PATIENT);
        {
            let prescription = test::take_from_sender<Prescription>(&scenario);
            test::return_to_sender(&scenario, prescription);
        };

        test_utils::destroy(clock);
        test::end(scenario);
    }

    // ==================== Error Tests ====================

    #[test]
    #[expected_failure(abort_code = medipay::ENotAuthorized)]
    fun test_unauthorized_payment() {
        let mut scenario = test::begin(HOSPITAL);
        let clock = create_clock(&mut scenario);
        let unauthorized_user = @0xBAD;

        // Setup invoice
        next_tx(&mut scenario, HOSPITAL);
        {
            medipay::create_institution_capability(
                string::utf8(b"City Hospital"),
                ctx(&mut scenario)
            );
        };

        next_tx(&mut scenario, HOSPITAL);
        {
            let cap = test::take_from_sender<InstitutionCap>(&scenario);
            medipay::create_invoice(
                &cap,
                PATIENT,
                DOCTOR,
                string::utf8(b"Test"),
                500, 0, 0,
                &clock,
                ctx(&mut scenario)
            );
            test::return_to_sender(&scenario, cap);
        };

        // Unauthorized user tries to pay
        next_tx(&mut scenario, unauthorized_user);
        {
            let mut invoice = test::take_shared<Invoice>(&scenario);
            let payment = mint_sui(500, &mut scenario);
            
            medipay::pay_invoice_cash(
                &mut invoice,
                payment,
                &clock,
                ctx(&mut scenario)
            );
            
            test::return_shared(invoice);
        };

        test_utils::destroy(clock);
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = medipay::EInsufficientFunds)]
    fun test_insufficient_payment() {
        let mut scenario = test::begin(HOSPITAL);
        let clock = create_clock(&mut scenario);

        next_tx(&mut scenario, HOSPITAL);
        {
            medipay::create_institution_capability(
                string::utf8(b"City Hospital"),
                ctx(&mut scenario)
            );
        };

        next_tx(&mut scenario, HOSPITAL);
        {
            let cap = test::take_from_sender<InstitutionCap>(&scenario);
            medipay::create_invoice(
                &cap,
                PATIENT,
                DOCTOR,
                string::utf8(b"Test"),
                500, 0, 0,
                &clock,
                ctx(&mut scenario)
            );
            test::return_to_sender(&scenario, cap);
        };

        next_tx(&mut scenario, PATIENT);
        {
            let mut invoice = test::take_shared<Invoice>(&scenario);
            let payment = mint_sui(400, &mut scenario); // Not enough!
            
            medipay::pay_invoice_cash(
                &mut invoice,
                payment,
                &clock,
                ctx(&mut scenario)
            );
            
            test::return_shared(invoice);
        };

        test_utils::destroy(clock);
        test::end(scenario);
    }
}