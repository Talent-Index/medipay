import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TransactionExplorer from "./pages/TransactionExplorer";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientInvoices from "./pages/patient/PatientInvoices";
import PatientTransactions from "./pages/patient/PatientTransactions";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientSettings from "./pages/patient/PatientSettings";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import NewDoctorDashboard from "./pages/doctor/NewDoctorDashboard";
import DoctorInvoices from "./pages/doctor/DoctorInvoices";
import DoctorRecords from "./pages/doctor/DoctorRecords";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorCreateInvoice from "./pages/doctor/DoctorCreateInvoice";
import DoctorReports from "./pages/doctor/DoctorReports";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import InstitutionDashboard from "./pages/institution/InstitutionDashboard";
import InstitutionTransactions from "./pages/institution/InstitutionTransactions";
import InsuranceDashboard from "./pages/insurance/InsuranceDashboard";
import InsuranceTransactions from "./pages/insurance/InsuranceTransactions";
import InsuranceClaims from "./pages/insurance/InsuranceClaims";
import InsuranceReports from "./pages/insurance/InsuranceReports";
import InsuranceProfile from "./pages/insurance/InsuranceProfile";
import InsuranceSettings from "./pages/insurance/InsuranceSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            <Route path="transactions" element={<PatientTransactions />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="settings" element={<PatientSettings />} />
          </Route>
          
          {/* Doctor Routes */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<NewDoctorDashboard />} />
            <Route path="legacy" element={<DoctorDashboard />} />
            <Route path="create" element={<DoctorCreateInvoice />} />
            <Route path="invoices" element={<DoctorInvoices />} />
            <Route path="records" element={<DoctorRecords />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="reports" element={<DoctorReports />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="settings" element={<DoctorSettings />} />
          </Route>

          {/* Institution Routes */}
          <Route path="/institution" element={
            <ProtectedRoute allowedRoles={['institution']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<InstitutionDashboard />} />
            <Route path="transactions" element={<InstitutionTransactions />} />
            <Route path="insurance-payments" element={<div>Insurance Payments</div>} />
            <Route path="products" element={<div>Product Management</div>} />
            <Route path="users" element={<div>User Management</div>} />
            <Route path="reports" element={<div>Financial Reports</div>} />
            <Route path="profile" element={<div>Institution Profile</div>} />
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
            <Route path="reports" element={<InsuranceReports />} />
            <Route path="profile" element={<InsuranceProfile />} />
            <Route path="settings" element={<InsuranceSettings />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
