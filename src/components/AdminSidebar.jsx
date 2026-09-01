import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, HeartHandshake, Video, Newspaper, Image as ImageIcon,
  Landmark, Warehouse, UserCheck, FolderKanban, MessageSquareShare,
  BarChart3, UserCog, Settings, ClipboardList, ChevronDown, ChevronRight, X, Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const roleSlug = user?.role?.slug || user?.role_slug || 'super_admin';
  const isSuperAdmin = roleSlug === 'super_admin';
  const isAccountant = roleSlug === 'accountant';
  const isStaff = roleSlug === 'staff' || roleSlug === 'hr_manager';

  // Collapsible menu states
  const [donationOpen, setDonationOpen] = useState(
    location.pathname.startsWith('/admin/donations') || location.pathname.startsWith('/admin/campaigns') || location.pathname.startsWith('/admin/receipts')
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
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0F172A] text-gray-200 flex flex-col border-r border-[#0F172A] shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Crest Header */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0F172A] border-2 border-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow">
              <span className="text-[#D4AF37] text-base font-serif font-bold">☸</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-serif-brand font-bold text-xs tracking-wider text-white uppercase leading-snug truncate">
                DRODUL PHENDEY LING
              </h2>
              <p className="text-[8.5px] text-[#D4AF37] tracking-widest uppercase truncate">
                {isSuperAdmin ? 'Super Admin Portal' : isAccountant ? 'Finance Portal' : 'Staff Portal'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs scrollbar-thin">
          {/* 1. DASHBOARD */}
          <Link
            to="/admin"
            onClick={handleNavClick}
            className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
              isActive('/admin')
                ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />
            <span>Dashboard Overview</span>
          </Link>

          {/* 2. DONATION MANAGEMENT (Super Admin & Accountant) */}
          {(isSuperAdmin || isAccountant) && (
            <div>
              <button
                type="button"
                onClick={() => setDonationOpen(!donationOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:bg-[#0F172A] hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <HeartHandshake className="w-4 h-4 text-[#D4AF37]" />
                  <span>Donation Management</span>
                </div>
                {donationOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
              </button>

              {donationOpen && (
                <div className="pl-8 pr-2 py-1 space-y-1 text-[11px]">
                  <Link
                    to="/admin/donations/new"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/donations/new') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Add New Donation
                  </Link>
                  <Link
                    to="/admin/donations"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/donations') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • All Donations List
                  </Link>
                  <Link
                    to="/admin/receipts"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/receipts') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Money Receipts (80G)
                  </Link>
                  <Link
                    to="/admin/donors"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/donors') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Donors Directory
                  </Link>
                  <Link
                    to="/admin/campaigns"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/campaigns') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Campaigns & Causes
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 3. SIMPLIFIED LEARNING VIDEOS MANAGER (Super Admin & Staff) */}
          {(isSuperAdmin || isStaff) && (
            <Link
              to="/admin/learning"
              onClick={handleNavClick}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/learning')
                  ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'
              }`}
            >
              <Video className="w-4 h-4 text-[#D4AF37]" />
              <span>Learning Videos (Public)</span>
            </Link>
          )}

          {/* 4. BLOG & ARTICLES MANAGER (Super Admin & Staff) */}
          {(isSuperAdmin || isStaff) && (
            <Link
              to="/admin/blog"
              onClick={handleNavClick}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/blog')
                  ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'
              }`}
            >
              <Newspaper className="w-4 h-4 text-[#D4AF37]" />
              <span>Blog & Articles</span>
            </Link>
          )}

          {/* 5. GALLERY MANAGER (Super Admin & Staff) */}
          {(isSuperAdmin || isStaff) && (
            <Link
              to="/admin/gallery"
              onClick={handleNavClick}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/gallery')
                  ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
              <span>Gallery (Photos & Videos)</span>
            </Link>
          )}

          {/* 6. ACCOUNTS & EXPENSES (Super Admin & Accountant) */}
          {(isSuperAdmin || isAccountant) && (
            <div>
              <button
                type="button"
                onClick={() => setAccountsOpen(!accountsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:bg-[#0F172A] hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Landmark className="w-4 h-4 text-[#D4AF37]" />
                  <span>Accounts & Finance</span>
                </div>
                {accountsOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
              </button>

              {accountsOpen && (
                <div className="pl-8 pr-2 py-1 space-y-1 text-[11px]">
                  <Link
                    to="/admin/accounts"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/accounts') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Finance Dashboard
                  </Link>
                  <Link
                    to="/admin/accounts/expenses"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/accounts/expenses') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Expenses & Claims
                  </Link>
                  <Link
                    to="/admin/accounts/vouchers"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/accounts/vouchers') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Payment Vouchers
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 7. INVENTORY & STORE (Super Admin & Staff) */}
          {(isSuperAdmin || isStaff) && (
            <div>
              <button
                type="button"
                onClick={() => setInventoryOpen(!inventoryOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:bg-[#0F172A] hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Warehouse className="w-4 h-4 text-[#D4AF37]" />
                  <span>Inventory & Store</span>
                </div>
                {inventoryOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
              </button>

              {inventoryOpen && (
                <div className="pl-8 pr-2 py-1 space-y-1 text-[11px]">
                  <Link
                    to="/admin/inventory"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/inventory') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Store Stock Items
                  </Link>
                  <Link
                    to="/admin/inventory/stock-in"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/inventory/stock-in') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Inward Stock Entry
                  </Link>
                  <Link
                    to="/admin/inventory/stock-out"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/inventory/stock-out') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Issue / Consume Stock
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 8. HRM & PAYROLL (Super Admin & Accountant) */}
          {(isSuperAdmin || isAccountant) && (
            <div>
              <button
                type="button"
                onClick={() => setHrmOpen(!hrmOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:bg-[#0F172A] hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>HRM & Payroll</span>
                </div>
                {hrmOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
              </button>

              {hrmOpen && (
                <div className="pl-8 pr-2 py-1 space-y-1 text-[11px]">
                  <Link
                    to="/admin/hrm/employees"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/hrm/employees') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Employee Directory
                  </Link>
                  <Link
                    to="/admin/hrm/attendance"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/hrm/attendance') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Daily Attendance
                  </Link>
                  <Link
                    to="/admin/payroll"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/payroll') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Payroll Runs & Slips
                  </Link>
                  <Link
                    to="/admin/payroll/casual-labor"
                    onClick={handleNavClick}
                    className={`block py-1 px-2 rounded hover:text-white ${
                      isActive('/admin/payroll/casual-labor') ? 'text-[#D4AF37] font-bold bg-[#0F172A]' : 'text-gray-400'
                    }`}
                  >
                    • Casual / Daily Labor
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 9. PROJECTS & TASKS (Super Admin & Staff) */}
          {(isSuperAdmin || isStaff) && (
            <Link
              to="/admin/projects"
              onClick={handleNavClick}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/projects')
                  ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-[#D4AF37]" />
              <span>Projects & Stupa Tasks</span>
            </Link>
          )}

          {/* 10. CRM CONTACTS (Super Admin & Staff) */}
          {(isSuperAdmin || isStaff) && (
            <Link
              to="/admin/crm"
              onClick={handleNavClick}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/crm')
                  ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'
              }`}
            >
              <MessageSquareShare className="w-4 h-4 text-[#D4AF37]" />
              <span>CRM & Donor Relations</span>
            </Link>
          )}

          {/* 11. PRAYER REQUESTS (Super Admin & Staff) */}
          {(isSuperAdmin || isStaff) && (
            <Link
              to="/admin/prayer-requests"
              onClick={handleNavClick}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/prayer-requests')
                  ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 text-[#D4AF37]" />
              <span>Prayer Dedications</span>
            </Link>
          )}

          {/* 12. REPORTS (Super Admin & Accountant) */}
          {(isSuperAdmin || isAccountant) && (
            <Link
              to="/admin/reports"
              onClick={handleNavClick}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/reports')
                  ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
              <span>Reports & Analytics</span>
            </Link>
          )}

          {/* 13. USERS, AUDIT & SETTINGS (Super Admin Only) */}
          {isSuperAdmin && (
            <>
              <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                System Administration
              </div>

              <Link
                to="/admin/users"
                onClick={handleNavClick}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/admin/users')
                    ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                    : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'
                }`}
              >
                <UserCog className="w-4 h-4 text-[#D4AF37]" />
                <span>Users & Roles (RBAC)</span>
              </Link>

              <Link
                to="/admin/audit-logs"
                onClick={handleNavClick}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/admin/audit-logs')
                    ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                    : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-[#D4AF37]" />
                <span>Security Audit Trail</span>
              </Link>

              <Link
                to="/admin/settings"
                onClick={handleNavClick}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/admin/settings')
                    ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                    : 'text-gray-300 hover:bg-[#0F172A] hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 text-[#D4AF37]" />
                <span>System Settings & Backup</span>
              </Link>
            </>
          )}
        </nav>

        {/* Footer User Info */}
        <div className="p-3 border-t border-[#1E293B] bg-[#2E070F] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#0F172A] border border-[#D4AF37] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{user?.fullName || 'Super Admin'}</p>
              <p className="text-[9px] text-[#D4AF37] truncate capitalize">{user?.role?.name || roleSlug}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
