-- Enable Row Level Security on all tables

-- Enable RLS on users table
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on invoices table
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on medical_records table
ALTER TABLE "medical_records" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on prescriptions table
ALTER TABLE "prescriptions" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on payment_records table
ALTER TABLE "payment_records" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on insurance_packages table
ALTER TABLE "insurance_packages" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on patient_insurance table
ALTER TABLE "patient_insurance" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on insurance_package_services table
ALTER TABLE "insurance_package_services" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on institution_staff table
ALTER TABLE "institution_staff" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on products table
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on transactions table
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Users can view their own profile and profiles of users they interact with
CREATE POLICY "users_select_policy" ON "users"
  FOR SELECT
  USING (
    "address" = current_setting('app.current_user_address', true)
    OR "id" IN (
      SELECT DISTINCT "patientAddress" FROM "invoices" WHERE "doctorAddress" = current_setting('app.current_user_address', true)
      UNION
      SELECT DISTINCT "doctorAddress" FROM "invoices" WHERE "patientAddress" = current_setting('app.current_user_address', true)
      UNION
      SELECT DISTINCT "institutionAddress" FROM "invoices" WHERE "patientAddress" = current_setting('app.current_user_address', true) OR "doctorAddress" = current_setting('app.current_user_address', true)
    )
  );

CREATE POLICY "users_insert_policy" ON "users"
  FOR INSERT
  WITH CHECK ("address" = current_setting('app.current_user_address', true));

CREATE POLICY "users_update_policy" ON "users"
  FOR UPDATE
  USING ("address" = current_setting('app.current_user_address', true))
  WITH CHECK ("address" = current_setting('app.current_user_address', true));

-- Create policies for invoices table
-- Patients, doctors, institutions, and insurance can see invoices related to them
CREATE POLICY "invoices_select_policy" ON "invoices"
  FOR SELECT
  USING (
    "patientAddress" = current_setting('app.current_user_address', true)
    OR "doctorAddress" = current_setting('app.current_user_address', true)
    OR "institutionAddress" = current_setting('app.current_user_address', true)
    OR EXISTS (
      SELECT 1 FROM "users" WHERE "address" = current_setting('app.current_user_address', true) AND "role" = 'INSURANCE'
    )
  );

CREATE POLICY "invoices_insert_policy" ON "invoices"
  FOR INSERT
  WITH CHECK (
    "doctorAddress" = current_setting('app.current_user_address', true)
    OR "institutionAddress" = current_setting('app.current_user_address', true)
  );

CREATE POLICY "invoices_update_policy" ON "invoices"
  FOR UPDATE
  USING (
    "doctorAddress" = current_setting('app.current_user_address', true)
    OR "institutionAddress" = current_setting('app.current_user_address', true)
    OR EXISTS (
      SELECT 1 FROM "users" WHERE "address" = current_setting('app.current_user_address', true) AND "role" = 'INSURANCE'
    )
  );

-- Create policies for medical_records table
-- Only patients and their doctors can see medical records
CREATE POLICY "medical_records_select_policy" ON "medical_records"
  FOR SELECT
  USING (
    "patientAddress" = current_setting('app.current_user_address', true)
    OR "doctorAddress" = current_setting('app.current_user_address', true)
  );

CREATE POLICY "medical_records_insert_policy" ON "medical_records"
  FOR INSERT
  WITH CHECK ("doctorAddress" = current_setting('app.current_user_address', true));

CREATE POLICY "medical_records_update_policy" ON "medical_records"
  FOR UPDATE
  USING ("doctorAddress" = current_setting('app.current_user_address', true));

-- Create policies for prescriptions table
-- Only patients and their doctors can see prescriptions
CREATE POLICY "prescriptions_select_policy" ON "prescriptions"
  FOR SELECT
  USING (
    "patientAddress" = current_setting('app.current_user_address', true)
    OR "doctorAddress" = current_setting('app.current_user_address', true)
  );

CREATE POLICY "prescriptions_insert_policy" ON "prescriptions"
  FOR INSERT
  WITH CHECK ("doctorAddress" = current_setting('app.current_user_address', true));

CREATE POLICY "prescriptions_update_policy" ON "prescriptions"
  FOR UPDATE
  USING ("doctorAddress" = current_setting('app.current_user_address', true));

-- Create policies for payment_records table
CREATE POLICY "payment_records_select_policy" ON "payment_records"
  FOR SELECT
  USING (
    "payerAddress" = current_setting('app.current_user_address', true)
    OR EXISTS (
      SELECT 1 FROM "invoices" i 
      WHERE i."id" = "payment_records"."invoiceId" 
      AND (
        i."patientAddress" = current_setting('app.current_user_address', true)
        OR i."doctorAddress" = current_setting('app.current_user_address', true)
        OR i."institutionAddress" = current_setting('app.current_user_address', true)
      )
    )
  );

CREATE POLICY "payment_records_insert_policy" ON "payment_records"
  FOR INSERT
  WITH CHECK ("payerAddress" = current_setting('app.current_user_address', true));

-- Create policies for insurance_packages table
-- Everyone can view insurance packages
CREATE POLICY "insurance_packages_select_policy" ON "insurance_packages"
  FOR SELECT
  USING (true);

CREATE POLICY "insurance_packages_insert_policy" ON "insurance_packages"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users" WHERE "address" = current_setting('app.current_user_address', true) AND "role" = 'INSURANCE'
    )
  );

CREATE POLICY "insurance_packages_update_policy" ON "insurance_packages"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "users" WHERE "address" = current_setting('app.current_user_address', true) AND "role" = 'INSURANCE'
    )
  );

-- Create policies for patient_insurance table
CREATE POLICY "patient_insurance_select_policy" ON "patient_insurance"
  FOR SELECT
  USING (
    "patientAddress" = current_setting('app.current_user_address', true)
    OR EXISTS (
      SELECT 1 FROM "users" WHERE "address" = current_setting('app.current_user_address', true) AND "role" = 'INSURANCE'
    )
  );

CREATE POLICY "patient_insurance_insert_policy" ON "patient_insurance"
  FOR INSERT
  WITH CHECK (
    "patientAddress" = current_setting('app.current_user_address', true)
    OR EXISTS (
      SELECT 1 FROM "users" WHERE "address" = current_setting('app.current_user_address', true) AND "role" = 'INSURANCE'
    )
  );

CREATE POLICY "patient_insurance_update_policy" ON "patient_insurance"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "users" WHERE "address" = current_setting('app.current_user_address', true) AND "role" = 'INSURANCE'
    )
  );

-- Create policies for insurance_package_services table
-- Everyone can view insurance package services
CREATE POLICY "insurance_package_services_select_policy" ON "insurance_package_services"
  FOR SELECT
  USING (true);

CREATE POLICY "insurance_package_services_insert_policy" ON "insurance_package_services"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users" WHERE "address" = current_setting('app.current_user_address', true) AND "role" = 'INSURANCE'
    )
  );

CREATE POLICY "insurance_package_services_update_policy" ON "insurance_package_services"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "users" WHERE "address" = current_setting('app.current_user_address', true) AND "role" = 'INSURANCE'
    )
  );

-- Create policies for institution_staff table
CREATE POLICY "institution_staff_select_policy" ON "institution_staff"
  FOR SELECT
  USING (
    "institutionId" = current_setting('app.current_user_address', true)
    OR "userId" = (SELECT "id" FROM "users" WHERE "address" = current_setting('app.current_user_address', true))
  );

CREATE POLICY "institution_staff_insert_policy" ON "institution_staff"
  FOR INSERT
  WITH CHECK ("institutionId" = current_setting('app.current_user_address', true));

CREATE POLICY "institution_staff_update_policy" ON "institution_staff"
  FOR UPDATE
  USING ("institutionId" = current_setting('app.current_user_address', true));

CREATE POLICY "institution_staff_delete_policy" ON "institution_staff"
  FOR DELETE
  USING ("institutionId" = current_setting('app.current_user_address', true));

-- Create policies for products table
-- Everyone can view products
CREATE POLICY "products_select_policy" ON "products"
  FOR SELECT
  USING (true);

CREATE POLICY "products_insert_policy" ON "products"
  FOR INSERT
  WITH CHECK ("institutionId" = current_setting('app.current_user_address', true));

CREATE POLICY "products_update_policy" ON "products"
  FOR UPDATE
  USING ("institutionId" = current_setting('app.current_user_address', true));

CREATE POLICY "products_delete_policy" ON "products"
  FOR DELETE
  USING ("institutionId" = current_setting('app.current_user_address', true));

-- Create policies for transactions table
CREATE POLICY "transactions_select_policy" ON "transactions"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "invoices" i
      WHERE i."id" = "transactions"."invoiceId"
      AND (
        i."patientAddress" = current_setting('app.current_user_address', true)
        OR i."doctorAddress" = current_setting('app.current_user_address', true)
        OR i."institutionAddress" = current_setting('app.current_user_address', true)
      )
    )
    OR EXISTS (
      SELECT 1 FROM "users" WHERE "address" = current_setting('app.current_user_address', true) AND "role" IN ('INSURANCE', 'INSTITUTION')
    )
  );

CREATE POLICY "transactions_insert_policy" ON "transactions"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users" WHERE "address" = current_setting('app.current_user_address', true) AND "role" IN ('DOCTOR', 'INSTITUTION', 'INSURANCE')
    )
  );

-- Create a function to set the current user address
CREATE OR REPLACE FUNCTION set_current_user_address(user_address TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_address', user_address, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION set_current_user_address TO PUBLIC;