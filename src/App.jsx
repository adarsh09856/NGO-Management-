import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Context & Hooks
import { useAuth } from './context/AuthContext';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DonationModal from './components/DonationModal';
import AmbientAuroraBackground from './components/AmbientAuroraBackground';
import AdminLiveBar from './components/admin/AdminLiveBar';
import LiveSectionEditor from './components/LiveSectionEditor';

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
import Shedra from './pages/public/Shedra';
import Tracking from './pages/public/Tracking';
import CustomPage from './pages/public/CustomPage';

// Admin Login
import AdminLogin from './pages/admin/AdminLogin';

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
import PaymentGateways from './pages/admin/PaymentGateways';
import PaymentApprovals from './pages/admin/PaymentApprovals';
import CurrencyManager from './pages/admin/CurrencyManager';
import ReportsHub from './pages/admin/ReportsHub';
import StudentsMonks from './pages/admin/StudentsMonks';
import LMSOverview from './pages/admin/LMSOverview';
import Certificates from './pages/admin/Certificates';

// Dedicated CMS Page Studios (HAB Parity)
import PagesDirectory from './pages/admin/PagesDirectory';
import NavigationManager from './pages/admin/NavigationManager';
import HomePageStudio from './pages/admin/HomePageStudio';
import AboutPageStudio from './pages/admin/AboutPageStudio';
import ShedraPageStudio from './pages/admin/ShedraPageStudio';
import PrayersPageStudio from './pages/admin/PrayersPageStudio';
import ContactPageStudio from './pages/admin/ContactPageStudio';
import DonateSettingsStudio from './pages/admin/DonateSettingsStudio';
import SiteSettingsStudio from './pages/admin/SiteSettingsStudio';

// Dedicated Student / Monk Portal
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentCourseDetail from './pages/student/StudentCourseDetail';
import StudentCertificates from './pages/student/StudentCertificates';

// Enterprise Protected Route Guard & 404 Handler
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFound from './pages/public/NotFound';

export default function App() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [liveEditorState, setLiveEditorState] = useState({
    isOpen: false,
    sectionKey: 'hero',
    sectionTitle: '',
    studioHref: '',
    customPageData: null
  });

  // Global listener so any section badge can open the in-place editor modal
  React.useEffect(() => {
    const handleOpen = (e) => {
      if (e.detail) {
        setLiveEditorState({
          isOpen: true,
          sectionKey: e.detail.section || 'hero',
          sectionTitle: e.detail.sectionTitle || '',
          studioHref: e.detail.studioHref || '',
          customPageData: e.detail.customPageData || null
        });
      } else {
        setLiveEditorState((prev) => ({ ...prev, isOpen: true }));
      }
    };
    window.addEventListener('ngo:open-live-editor', handleOpen);
    return () => window.removeEventListener('ngo:open-live-editor', handleOpen);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1F2937] relative">
      <AmbientAuroraBackground />
      <Routes>
        {/* ========================================================= */}
        {/* 1. PUBLIC WEBSITE PORTAL                                  */}
        {/* ========================================================= */}
        <Route
          path="/*"
          element={
            <div className="flex flex-col min-h-screen">
              <AdminLiveBar
                onOpenEditor={(sec, title, href, pageData) =>
                  setLiveEditorState({
                    isOpen: true,
                    sectionKey: sec || 'hero',
                    sectionTitle: title || '',
                    studioHref: href || '',
                    customPageData: pageData || null
                  })
                }
              />
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
                  <Route path="/pages/:slug" element={<CustomPage />} />
                  <Route path="/pages" element={<Navigate to="/" replace />} />
                  <Route path="/shedra" element={<Shedra />} />
                  <Route path="/courses" element={<Shedra />} />
                  <Route path="/verify-certificate" element={<Shedra />} />
                  <Route path="/tracking" element={<Tracking />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              {donateModalOpen && <DonationModal onClose={() => setDonateModalOpen(false)} />}
              <LiveSectionEditor
                isOpen={liveEditorState.isOpen}
                onClose={() => setLiveEditorState((prev) => ({ ...prev, isOpen: false, customPageData: null }))}
                sectionKey={liveEditorState.sectionKey}
                sectionTitle={liveEditorState.sectionTitle}
                studioHref={liveEditorState.studioHref}
                customPageData={liveEditorState.customPageData}
              />
            </div>
          }
        />

        {/* ========================================================= */}
        {/* 2. DEDICATED ADMIN / STAFF LOGIN                          */}
        {/* ========================================================= */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ========================================================= */}
        {/* 3. UNIFIED USER / MEMBER PANEL (AUTHENTICATED ZONE)       */}
        {/* ========================================================= */}
        <Route
          path="/user/*"
          element={
            <ProtectedRoute zone="authenticated" allowedRoles={['donor', 'super_admin', 'staff']}>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="donations" element={<UserDashboard />} />
          <Route path="prayers" element={<UserDashboard />} />
          <Route path="profile" element={<UserDashboard />} />
        </Route>

        {/* ========================================================= */}
        {/* 3.1. DEDICATED MONASTIC STUDENT / SCHOLAR PORTAL          */}
        {/* ========================================================= */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute zone="authenticated" allowedRoles={['student_monk', 'super_admin']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:id" element={<StudentCourseDetail />} />
          <Route path="certificates" element={<StudentCertificates />} />
        </Route>

        {/* ========================================================= */}
        {/* 4. ADMIN & STAFF ROLE-RESTRICTED PORTAL (404 FOR OTHERS)  */}
        {/* ========================================================= */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute zone="admin" allowedRoles={['super_admin', 'admin', 'accountant', 'hr_manager', 'staff']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />

          {/* Donations & Receipts */}
          <Route path="donations/new" element={<AddDonation />} />
          <Route path="donations" element={<AllDonations />} />
          <Route path="payments" element={<PaymentApprovals />} />
          <Route path="payment-approvals" element={<PaymentApprovals />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="donors" element={<DonorsDirectory />} />
          <Route path="receipts" element={<MoneyReceipts />} />
          <Route path="payment-gateways" element={<PaymentGateways />} />
          <Route path="currency" element={<CurrencyManager />} />

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

          {/* Shedra Monastic Sangha & LMS */}
          <Route path="monks" element={<StudentsMonks />} />
          <Route path="lms" element={<LMSOverview />} />
          <Route path="certificates" element={<Certificates />} />

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

          {/* Dedicated CMS Studios & Menus */}
          <Route path="pages" element={<PagesDirectory />} />
          <Route path="navigation" element={<NavigationManager />} />
          <Route path="pages/home" element={<HomePageStudio />} />
          <Route path="pages/about" element={<AboutPageStudio />} />
          <Route path="pages/shedra" element={<ShedraPageStudio />} />
          <Route path="pages/prayers" element={<PrayersPageStudio />} />
          <Route path="pages/contact" element={<ContactPageStudio />} />
          <Route path="donate-settings" element={<DonateSettingsStudio />} />
          <Route path="site-settings" element={<SiteSettingsStudio />} />
        </Route>
      </Routes>
    </div>
  );
}
