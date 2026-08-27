import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, HeartHandshake, GraduationCap, Users, Award,
  Landmark, Warehouse, UserCheck, FolderKanban, MessageSquareShare,
  BarChart3, UserCog, Globe, Settings, ClipboardList, ChevronDown,
  ChevronRight, Star, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  // Collapsible menu group states
  const [donationOpen, setDonationOpen] = useState(
    location.pathname.startsWith('/admin/donations') || location.pathname.startsWith('/admin/campaigns') || location.pathname.startsWith('/admin/donors') || location.pathname.startsWith('/admin/receipts')
  );
  const [accountsOpen, setAccountsOpen] = useState(location.pathname.startsWith('/admin/accounts'));
  const [inventoryOpen, setInventoryOpen] = useState(location.pathname.startsWith('/admin/inventory'));
  const [hrmOpen, setHrmOpen] = useState(location.pathname.startsWith('/admin/hrm') || location.pathname.startsWith('/admin/payroll'));

  const isActive = (path) => location.pathname === path;

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden animate-fadeIn backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#3B0A13] text-gray-200 flex flex-col border-r border-[#4A0E17] shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Crest Header with Close button on mobile */}
        <div className="p-4 border-b border-[#4E0D19] flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#4A0E17] border-2 border-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow">
              <span className="text-[#D4AF37] text-base font-serif font-bold">☸</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-serif-brand font-bold text-xs tracking-wider text-white uppercase leading-snug truncate">
                DRODUL PHENDEY LING
              </h2>
              <p className="text-[8.5px] text-[#D4AF37] tracking-widest uppercase truncate">
                Admin CRM Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-white rounded"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="px-4 py-2.5 border-b border-[#4E0D19] bg-[#330810]/70 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#4A0E17] border border-[#D4AF37] flex items-center justify-center text-xs font-bold text-[#D4AF37] flex-shrink-0">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{user?.fullName || 'Admin User'}</h4>
            <div className="flex items-center space-x-1.5 text-[10px] text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
              <span className="truncate">{user?.role?.name || 'Super Administrator'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Menus (Scrollable & Touch friendly) */}
        <nav className="flex-1 overflow-y-auto py-2.5 px-2 space-y-1 text-xs">
          {/* 1. Dashboard */}
          <Link
            to="/admin"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/admin') ? 'bg-[#5A121E] text-white font-bold border-l-4 border-[#D4AF37]' : 'text-gray-300 hover:bg-[#4A0E17] hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>Dashboard</span>
          </Link>

          {/* 2. Donation Management */}
          <div>
            <button
              type="button"
              onClick={() => setDonationOpen(!donationOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-gray-300 hover:bg-[#4A0E17] hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-3">
                <HeartHandshake className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span className="font-semibold">Donation Management</span>
              </div>
              {donationOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            </button>
            {donationOpen && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-[11px]">
                <Link to="/admin/donations/add" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/donations/add') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Add Donation
                </Link>
                <Link to="/admin/donations" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/donations') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  All Donations
                </Link>
                <Link to="/admin/donations/recurring" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/donations/recurring') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Recurring Donations
                </Link>
                <Link to="/admin/campaigns" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/campaigns') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Campaigns
                </Link>
                <Link to="/admin/donors" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/donors') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Donors
                </Link>
                <Link to="/admin/receipts" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/receipts') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Receipts
                </Link>
              </div>
            )}
          </div>

          {/* 3. Training & LMS */}
          <Link
            to="/admin/lms"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/admin/lms') ? 'bg-[#5A121E] text-white font-bold border-l-4 border-[#D4AF37]' : 'text-gray-300 hover:bg-[#4A0E17] hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>Training & LMS</span>
          </Link>

          {/* 4. Students & Monks */}
          <Link
            to="/admin/students"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/admin/students') ? 'bg-[#5A121E] text-white font-bold border-l-4 border-[#D4AF37]' : 'text-gray-300 hover:bg-[#4A0E17] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>Students & Monks</span>
          </Link>

          {/* 5. Certification */}
          <Link
            to="/admin/certificates"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/admin/certificates') ? 'bg-[#5A121E] text-white font-bold border-l-4 border-[#D4AF37]' : 'text-gray-300 hover:bg-[#4A0E17] hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>Certification</span>
          </Link>

          {/* 6. Accounts & Finance */}
          <div>
            <button
              type="button"
              onClick={() => setAccountsOpen(!accountsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-gray-300 hover:bg-[#4A0E17] hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Landmark className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span className="font-semibold">Accounts & Finance</span>
              </div>
              {accountsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            </button>
            {accountsOpen && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-[11px]">
                <Link to="/admin/accounts" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/accounts') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Dashboard
                </Link>
                <Link to="/admin/accounts/ledger" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/accounts/ledger') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Transactions & Income
                </Link>
                <Link to="/admin/accounts/expenses" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/accounts/expenses') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Expenses & Claims
                </Link>
                <Link to="/admin/accounts/vouchers" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/accounts/vouchers') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Vouchers & Ledger
                </Link>
                <Link to="/admin/accounts/banks" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/accounts/banks') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Bank Accounts
                </Link>
              </div>
            )}
          </div>

          {/* 7. Inventory & Store */}
          <div>
            <button
              type="button"
              onClick={() => setInventoryOpen(!inventoryOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-gray-300 hover:bg-[#4A0E17] hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Warehouse className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span className="font-semibold">Inventory & Store</span>
              </div>
              {inventoryOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            </button>
            {inventoryOpen && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-[11px]">
                <Link to="/admin/inventory" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/inventory') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Dashboard
                </Link>
                <Link to="/admin/inventory/items" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/inventory/items') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Items Directory
                </Link>
                <Link to="/admin/inventory/stock-movement" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/inventory/stock-movement') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Stock Movement
                </Link>
                <Link to="/admin/inventory/suppliers" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/inventory/suppliers') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Suppliers
                </Link>
              </div>
            )}
          </div>

          {/* 8. HRM & Payroll */}
          <div>
            <button
              type="button"
              onClick={() => setHrmOpen(!hrmOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-gray-300 hover:bg-[#4A0E17] hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span className="font-semibold">HRM & Payroll</span>
              </div>
              {hrmOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            </button>
            {hrmOpen && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-[11px]">
                <Link to="/admin/hrm/employees" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/hrm/employees') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Employees
                </Link>
                <Link to="/admin/hrm/attendance" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/hrm/attendance') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Mark Attendance
                </Link>
                <Link to="/admin/hrm/leave" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/hrm/leave') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Leave Requests
                </Link>
                <Link to="/admin/payroll" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/payroll') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Monthly Payroll Runs
                </Link>
                <Link to="/admin/payroll/casual-labor" onClick={handleNavClick} className={`block py-1 px-2 rounded ${isActive('/admin/payroll/casual-labor') ? 'text-[#D4AF37] font-bold bg-[#4A0E17]' : 'text-gray-400 hover:text-white'}`}>
                  Casual Labor
                </Link>
              </div>
            )}
          </div>

          {/* 9. Projects & Events */}
          <Link
            to="/admin/projects"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/admin/projects') ? 'bg-[#5A121E] text-white font-bold border-l-4 border-[#D4AF37]' : 'text-gray-300 hover:bg-[#4A0E17] hover:text-white'
            }`}
          >
            <FolderKanban className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>Projects & Events</span>
          </Link>

          {/* 10. CRM & Communication */}
          <Link
            to="/admin/crm"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/admin/crm') ? 'bg-[#5A121E] text-white font-bold border-l-4 border-[#D4AF37]' : 'text-gray-300 hover:bg-[#4A0E17] hover:text-white'
            }`}
          >
            <MessageSquareShare className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>CRM & Communication</span>
          </Link>

          {/* 11. Reports & Analytics */}
          <Link
            to="/admin/reports"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/admin/reports') ? 'bg-[#5A121E] text-white font-bold border-l-4 border-[#D4AF37]' : 'text-gray-300 hover:bg-[#4A0E17] hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>Reports & Analytics</span>
          </Link>

          {/* 12. Users & Roles */}
          <Link
            to="/admin/users"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/admin/users') ? 'bg-[#5A121E] text-white font-bold border-l-4 border-[#D4AF37]' : 'text-gray-300 hover:bg-[#4A0E17] hover:text-white'
            }`}
          >
            <UserCog className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>Users & Roles</span>
          </Link>

          {/* 13. Website & CMS */}
          <Link
            to="/admin/cms"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/admin/cms') ? 'bg-[#5A121E] text-white font-bold border-l-4 border-[#D4AF37]' : 'text-gray-300 hover:bg-[#4A0E17] hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>Website & CMS</span>
          </Link>

          {/* 14. System Settings */}
          <Link
            to="/admin/settings"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/admin/settings') ? 'bg-[#5A121E] text-white font-bold border-l-4 border-[#D4AF37]' : 'text-gray-300 hover:bg-[#4A0E17] hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>System Settings</span>
          </Link>

          {/* 15. Audit Log */}
          <Link
            to="/admin/audit-logs"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/admin/audit-logs') ? 'bg-[#5A121E] text-white font-bold border-l-4 border-[#D4AF37]' : 'text-gray-300 hover:bg-[#4A0E17] hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <span>Audit Log</span>
          </Link>
        </nav>

        {/* Quick Access Footer Strip */}
        <div className="p-3 border-t border-[#4E0D19] bg-[#2E070F] text-xs text-[#D4AF37] flex items-center space-x-2">
          <Star className="w-4 h-4 fill-[#D4AF37]" />
          <span className="font-semibold">Quick Access</span>
        </div>
      </aside>
    </>
  );
}
