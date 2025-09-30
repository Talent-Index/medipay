import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TransactionExplorer from "./pages/TransactionExplorer";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientInvoices from "./pages/patient/PatientInvoices";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import NotFound from "./pages/NotFound";
import NewDoctorDashboard from "./pages/doctor/NewDoctorDashboard";
import InstitutionDashboard from "./pages/institution/InstitutionDashboard";
import InsuranceDashboard from "./pages/insurance/InsuranceDashboard";
import InsuranceClaims from "./pages/insurance/InsuranceClaims";
import InsuranceTransactions from "./pages/insurance/InsuranceTransactions";
import InsurancePolicies from "./pages/insurance/InsurancePolicies";
import InsurancePatients from "./pages/insurance/InsurancePatients";
import InsuranceSettings from "./pages/insurance/InsuranceSettings";
import UserManagement from "./components/institution/UserManagement";
import ProductManagement from "./components/institution/ProductManagement";

const Router = () => (

    <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/transactions" element={<TransactionExplorer />} />

        {/* Patient Routes */}
        <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['patient']}>
                <DashboardLayout />
            </ProtectedRoute>
        }>
            <Route index element={<PatientDashboard />} />
            <Route path="invoices" element={<PatientInvoices />} />
            <Route path="transactions" element={<div>Patient Transactions</div>} />
            <Route path="records" element={<div>Medical Records</div>} />
            <Route path="settings" element={<div>Patient Settings</div>} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
                <DashboardLayout />
            </ProtectedRoute>
        }>
            <Route index element={<NewDoctorDashboard />} />
            <Route path="legacy" element={<DoctorDashboard />} />
            <Route path="create" element={<div>Create Invoice</div>} />
            <Route path="records" element={<div>Medical Records</div>} />
            <Route path="prescriptions" element={<div>Prescriptions</div>} />
            <Route path="settings" element={<div>Doctor Settings</div>} />
        </Route>

        {/* Institution Routes */}
        <Route path="/institution" element={
            <ProtectedRoute allowedRoles={['institution']}>
                <DashboardLayout />
            </ProtectedRoute>
        }>
            <Route index element={<InstitutionDashboard />} />
            <Route path="transactions" element={<div>Institution Transactions</div>} />
            <Route path="insurance-payments" element={<div>Insurance Payments</div>} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<div>Institution Settings</div>} />
        </Route>

        {/* Insurance Routes */}
        <Route path="/insurance" element={
            <ProtectedRoute allowedRoles={['insurance']}>
                <DashboardLayout />
            </ProtectedRoute>
        }>
            <Route index element={<InsuranceDashboard />} />
            <Route path="claims" element={<InsuranceClaims />} />
            <Route path="transactions" element={<InsuranceTransactions />} />
            <Route path="policies" element={<InsurancePolicies />} />
            <Route path="patients" element={<InsurancePatients />} />
            <Route path="settings" element={<InsuranceSettings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
    </Routes>
);

export { Router };
