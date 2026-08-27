import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Context & Hooks
import { useAuth } from './context/AuthContext';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DonationModal from './components/DonationModal';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Donate from './pages/public/Donate';
import PrayerRequest from './pages/public/PrayerRequest';
import NewsEvents from './pages/public/NewsEvents';
import NewsDetail from './pages/public/NewsDetail';
import Gallery from './pages/public/Gallery';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Donor Portal Pages
import DonorLayout from './pages/donor/DonorLayout';
import DonorDashboard from './pages/donor/DonorDashboard';

// Student / Monk Portal Pages
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';

// Admin Portal Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddDonation from './pages/admin/AddDonation';
import AllDonations from './pages/admin/AllDonations';
import Campaigns from './pages/admin/Campaigns';
import DonorsDirectory from './pages/admin/DonorsDirectory';
import MoneyReceipts from './pages/admin/MoneyReceipts';
import AccountsDashboard from './pages/admin/AccountsDashboard';
import Expenses from './pages/admin/Expenses';
import InventoryDashboard from './pages/admin/InventoryDashboard';
import LMSOverview from './pages/admin/LMSOverview';
import StudentsMonks from './pages/admin/StudentsMonks';
import Certificates from './pages/admin/Certificates';
import HRMEmployees from './pages/admin/HRMEmployees';
import PayrollRuns from './pages/admin/PayrollRuns';
import CRMContacts from './pages/admin/CRMContacts';
import ProjectsTasks from './pages/admin/ProjectsTasks';
import CMSManager from './pages/admin/CMSManager';
import UsersRoles from './pages/admin/UsersRoles';
import AuditLog from './pages/admin/AuditLog';
import SystemSettings from './pages/admin/SystemSettings';
import ReportsHub from './pages/admin/ReportsHub';

// Protected Route Helpers
function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="p-8 text-center text-gray-500">Authenticating...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
}

function RequireDonor({ children }) {
  const { user, loading, isDonor } = useAuth();
  if (loading) return <div className="p-8 text-center text-gray-500">Authenticating...</div>;
  if (!user || !isDonor) return <Navigate to="/login" replace />;
  return children;
}

function RequireStudent({ children }) {
  const { user, loading, isStudent } = useAuth();
  if (loading) return <div className="p-8 text-center text-gray-500">Authenticating...</div>;
  if (!user || !isStudent) return <Navigate to="/login" replace />;
  return children;
}

// Layout Wrapper for Public Website Pages
function PublicLayoutWrapper({ children, onOpenDonate }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenDonate={onOpenDonate} />
      <main className="flex-1">{children}</main>
      <Footer onOpenDonate={onOpenDonate} />
    </div>
  );
}

export default function App() {
  const [globalDonateOpen, setGlobalDonateOpen] = useState(false);

  return (
    <>
      <Routes>
        {/* PUBLIC WEBSITE ROUTES */}
        <Route path="/" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><Home /></PublicLayoutWrapper>} />
        <Route path="/about" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><About /></PublicLayoutWrapper>} />
        <Route path="/activities" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><About /></PublicLayoutWrapper>} />
        <Route path="/programs" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><About /></PublicLayoutWrapper>} />
        <Route path="/get-involved" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><Donate /></PublicLayoutWrapper>} />
        <Route path="/resources" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><About /></PublicLayoutWrapper>} />
        <Route path="/contact" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><Contact /></PublicLayoutWrapper>} />
        <Route path="/donate" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><Donate /></PublicLayoutWrapper>} />
        <Route path="/prayer-request" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><PrayerRequest /></PublicLayoutWrapper>} />
        <Route path="/news-events" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><NewsEvents /></PublicLayoutWrapper>} />
        <Route path="/news-events/:slug" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><NewsDetail /></PublicLayoutWrapper>} />
        <Route path="/gallery" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><Gallery /></PublicLayoutWrapper>} />
        <Route path="/login" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><Login /></PublicLayoutWrapper>} />
        <Route path="/donor/login" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><Login /></PublicLayoutWrapper>} />
        <Route path="/student/login" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><Login /></PublicLayoutWrapper>} />
        <Route path="/admin/login" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><Login /></PublicLayoutWrapper>} />
        <Route path="/register" element={<PublicLayoutWrapper onOpenDonate={() => setGlobalDonateOpen(true)}><Register /></PublicLayoutWrapper>} />

        {/* DONOR PORTAL ROUTES */}
        <Route path="/donor" element={<RequireDonor><DonorLayout /></RequireDonor>}>
          <Route index element={<DonorDashboard />} />
          <Route path="donations" element={<DonorDashboard />} />
          <Route path="pledges" element={<DonorDashboard />} />
          <Route path="profile" element={<DonorDashboard />} />
        </Route>

        {/* STUDENT / MONK PORTAL ROUTES */}
        <Route path="/student" element={<RequireStudent><StudentLayout /></RequireStudent>}>
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<StudentDashboard />} />
          <Route path="attendance" element={<StudentDashboard />} />
          <Route path="certificates" element={<StudentDashboard />} />
        </Route>

        {/* ADMIN & STAFF PORTAL ROUTES */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="donations" element={<AllDonations />} />
          <Route path="donations/add" element={<AddDonation />} />
          <Route path="donations/recurring" element={<AllDonations />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="donors" element={<DonorsDirectory />} />
          <Route path="receipts" element={<MoneyReceipts />} />

          <Route path="accounts" element={<AccountsDashboard />} />
          <Route path="accounts/ledger" element={<AccountsDashboard />} />
          <Route path="accounts/expenses" element={<Expenses />} />
          <Route path="accounts/vouchers" element={<AccountsDashboard />} />
          <Route path="accounts/banks" element={<AccountsDashboard />} />

          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="inventory/items" element={<InventoryDashboard />} />
          <Route path="inventory/stock-movement" element={<InventoryDashboard />} />
          <Route path="inventory/suppliers" element={<InventoryDashboard />} />

          <Route path="lms" element={<LMSOverview />} />
          <Route path="students" element={<StudentsMonks />} />
          <Route path="certificates" element={<Certificates />} />

          <Route path="hrm/employees" element={<HRMEmployees />} />
          <Route path="hrm/attendance" element={<HRMEmployees />} />
          <Route path="hrm/leave" element={<HRMEmployees />} />
          <Route path="payroll" element={<PayrollRuns />} />
          <Route path="payroll/casual-labor" element={<PayrollRuns />} />

          <Route path="projects" element={<ProjectsTasks />} />
          <Route path="crm" element={<CRMContacts />} />
          <Route path="cms" element={<CMSManager />} />
          <Route path="users" element={<UsersRoles />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="audit-logs" element={<AuditLog />} />
          <Route path="reports" element={<ReportsHub />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Donation Modal */}
      <DonationModal
        isOpen={globalDonateOpen}
        onClose={() => setGlobalDonateOpen(false)}
        defaultAmount={5000}
      />
    </>
  );
}
