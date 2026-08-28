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
import Learning from './pages/public/Learning';
import Blog from './pages/public/Blog';
import BlogDetail from './pages/public/BlogDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Unified User Panel
import UserLayout from './pages/user/UserLayout';
import UserDashboard from './pages/user/UserDashboard';

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
import HRMEmployees from './pages/admin/HRMEmployees';
import PayrollRuns from './pages/admin/PayrollRuns';
import CRMContacts from './pages/admin/CRMContacts';
import ProjectsTasks from './pages/admin/ProjectsTasks';
import CMSManager from './pages/admin/CMSManager';
import BlogManager from './pages/admin/BlogManager';
import LearningManager from './pages/admin/LearningManager';
import GalleryManager from './pages/admin/GalleryManager';
import UsersRoles from './pages/admin/UsersRoles';
import AuditLog from './pages/admin/AuditLog';
import SystemSettings from './pages/admin/SystemSettings';
import ReportsHub from './pages/admin/ReportsHub';

// Protected Route Helpers
function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="p-8 text-center text-gray-500">Authenticating...</div>;
  if (!user || !isAdmin) return <Navigate to="/login?portal=admin" replace />;
  return children;
}

function RequireUser({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-gray-500">Authenticating...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2D1810]">
      <Routes>
        {/* ========================================================= */}
        {/* 1. PUBLIC WEBSITE PORTAL                                  */}
        {/* ========================================================= */}
        <Route
          path="/*"
          element={
            <div className="flex flex-col min-h-screen">
              <Navbar onOpenDonate={() => setDonateModalOpen(true)} />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/donate" element={<Donate />} />
                  <Route path="/prayer-request" element={<PrayerRequest />} />
                  <Route path="/news-events" element={<NewsEvents />} />
                  <Route path="/news-events/:slug" element={<NewsDetail />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/learning" element={<Learning />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
              {donateModalOpen && <DonationModal onClose={() => setDonateModalOpen(false)} />}
            </div>
          }
        />

        {/* ========================================================= */}
        {/* 2. UNIFIED USER / MEMBER PANEL                            */}
        {/* ========================================================= */}
        <Route
          path="/user/*"
          element={
            <RequireUser>
              <UserLayout />
            </RequireUser>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="donations" element={<UserDashboard />} />
          <Route path="prayers" element={<UserDashboard />} />
          <Route path="profile" element={<UserDashboard />} />
        </Route>

        {/* Backward Compatibility Redirects for old separate portals */}
        <Route path="/donor/*" element={<Navigate to="/user" replace />} />
        <Route path="/student/*" element={<Navigate to="/learning" replace />} />

        {/* ========================================================= */}
        {/* 3. ADMIN & STAFF ROLE-RESTRICTED PORTAL                   */}
        {/* ========================================================= */}
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />

          {/* Donations & Receipts */}
          <Route path="donations/new" element={<AddDonation />} />
          <Route path="donations" element={<AllDonations />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="donors" element={<DonorsDirectory />} />
          <Route path="receipts" element={<MoneyReceipts />} />

          {/* Accounts & Finance */}
          <Route path="accounts" element={<AccountsDashboard />} />
          <Route path="accounts/expenses" element={<Expenses />} />
          <Route path="accounts/vouchers" element={<AccountsDashboard />} />

          {/* Inventory */}
          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="inventory/stock-in" element={<InventoryDashboard />} />
          <Route path="inventory/stock-out" element={<InventoryDashboard />} />

          {/* Simplified Learning & Videos */}
          <Route path="learning" element={<LearningManager />} />

          {/* Blog & Articles */}
          <Route path="blog" element={<BlogManager />} />

          {/* Gallery (Photos & Videos) */}
          <Route path="gallery" element={<GalleryManager />} />

          {/* HRM & Payroll */}
          <Route path="hrm/employees" element={<HRMEmployees />} />
          <Route path="hrm/attendance" element={<HRMEmployees />} />
          <Route path="payroll" element={<PayrollRuns />} />
          <Route path="payroll/casual-labor" element={<PayrollRuns />} />

          {/* CRM & Projects */}
          <Route path="crm" element={<CRMContacts />} />
          <Route path="projects" element={<ProjectsTasks />} />
          <Route path="prayer-requests" element={<CMSManager />} />

          {/* Super Admin Management */}
          <Route path="users" element={<UsersRoles />} />
          <Route path="audit-logs" element={<AuditLog />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="reports" element={<ReportsHub />} />
        </Route>
      </Routes>
    </div>
  );
}
