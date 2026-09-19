import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, HeartHandshake, Video, Newspaper, Image as ImageIcon,
  Landmark, Warehouse, UserCheck, FolderKanban, MessageSquareShare,
  BarChart3, UserCog, Settings, ClipboardList, X, Flame,
  GraduationCap, Award, BookOpen, CreditCard, Coins, PlusCircle,
  Users, ChevronRight, ChevronDown, ExternalLink, Globe, Sliders, Sparkles, Phone,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export default function AdminSidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const { currency, currencySymbol } = useCurrency();
  const location = useLocation();

  const roleSlug = user?.role?.slug || user?.role_slug || 'super_admin';
  const isSuperAdmin = roleSlug === 'super_admin';
  const isAccountant = roleSlug === 'accountant';
  const isStaff = roleSlug === 'staff' || roleSlug === 'hr_manager';

  const isPageStudioActive = location.pathname.startsWith('/admin/pages') ||
                             location.pathname === '/admin/donate-settings' ||
                             location.pathname === '/admin/site-settings';

  const [pagesOpen, setPagesOpen] = useState(isPageStudioActive);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    if (isPageStudioActive) {
      setPagesOpen(true);
    }
  }, [location.pathname]);

  // Periodically fetch pending UTR count for live treasury notification badge
  useEffect(() => {
    let isMounted = true;
    async function loadPendingCount() {
      try {
        const res = await api.get('/payments/approvals?limit=1&status=pending');
        if (isMounted && res.data?.success && res.data?.data?.summary) {
          setPendingApprovalsCount(res.data.data.summary.pendingCount || 0);
        }
      } catch (e) {
        // silent fail if unauthenticated or network error
      }
    }
    loadPendingCount();
    const interval = setInterval(loadPendingCount, 25000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden animate-fadeIn backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0F172A] text-gray-200 flex flex-col border-r border-[#1E293B] shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Crest Header */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between flex-shrink-0 bg-[#0B0F19]">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0F172A] border-2 border-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-[#D4AF37] text-base font-serif font-bold">☸</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-serif-brand font-bold text-xs tracking-wider text-white uppercase leading-snug truncate">
                DRODUL PHENDEY LING
              </h2>
              <p className="text-[9px] text-[#D4AF37] tracking-widest uppercase truncate font-medium">
                {isSuperAdmin ? 'Super Admin Portal' : isAccountant ? 'Finance Portal' : 'Staff Workspace'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs no-scrollbar">
          {/* 1. OVERVIEW */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Overview
            </div>
            <Link
              to="/admin"
              onClick={handleNavClick}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                isActive('/admin', true)
                  ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />
              <span className="flex-1">Dashboard Overview</span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold uppercase tracking-wider">Live</span>
            </Link>
          </div>

          {/* 1.5. WEB & PAGE STUDIOS (CMS) - SIMPLIFIED WITH COLLAPSIBLE SUB-MENUS */}
          {(isSuperAdmin || isStaff) && (
            <div>
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                <span>Web & Content</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-[#D4AF37] font-bold tracking-wider">CMS</span>
              </div>
              <div className="space-y-0.5">
                {/* Main Collapsible Item */}
                <button
                  type="button"
                  onClick={() => setPagesOpen(!pagesOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                    isPageStudioActive
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Globe className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span className="truncate">Website Pages</span>
                  </div>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-400/20 text-[#D4AF37] font-semibold">
                      8 Pages
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                        pagesOpen ? 'transform rotate-180 text-[#D4AF37]' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Collapsible Sub-menu items */}
                {pagesOpen && (
                  <div className="pl-3 pr-1 pt-1 pb-1 space-y-0.5 border-l-2 border-[#D4AF37]/30 ml-4 animate-fadeIn">
                    <Link
                      to="/admin/pages"
                      onClick={handleNavClick}
                      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11.5px] transition-all ${
                        isActive('/admin/pages', true)
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                          : 'text-gray-300 hover:bg-[#1E293B] hover:text-white'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="flex-1 truncate">All Pages Directory</span>
                      <span className="text-[9px] px-1 rounded bg-amber-400/20 text-[#D4AF37] font-mono">A–Z</span>
                    </Link>

                    <Link
                      to="/admin/pages/home"
                      onClick={handleNavClick}
                      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11.5px] transition-all ${
                        isActive('/admin/pages/home')
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                          : 'text-gray-300 hover:bg-[#1E293B] hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="flex-1 truncate">Homepage Studio</span>
                      <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-300">8 Sec</span>
                    </Link>

                    <Link
                      to="/admin/pages/about"
                      onClick={handleNavClick}
                      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11.5px] transition-all ${
                        isActive('/admin/pages/about')
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                          : 'text-gray-300 hover:bg-[#1E293B] hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="flex-1 truncate">About Us Studio</span>
                      <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-300">4 Sec</span>
                    </Link>

                    <Link
                      to="/admin/pages/shedra"
                      onClick={handleNavClick}
                      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11.5px] transition-all ${
                        isActive('/admin/pages/shedra')
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                          : 'text-gray-300 hover:bg-[#1E293B] hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="flex-1 truncate">Shedra Academy</span>
                      <span className="text-[9px] px-1 rounded bg-indigo-500/20 text-indigo-300">4 Sec</span>
                    </Link>

                    <Link
                      to="/admin/pages/prayers"
                      onClick={handleNavClick}
                      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11.5px] transition-all ${
                        isActive('/admin/pages/prayers')
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                          : 'text-gray-300 hover:bg-[#1E293B] hover:text-white'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="flex-1 truncate">Ceremonial Prayers</span>
                      <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300">4 Sec</span>
                    </Link>

                    <Link
                      to="/admin/pages/contact"
                      onClick={handleNavClick}
                      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11.5px] transition-all ${
                        isActive('/admin/pages/contact')
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                          : 'text-gray-300 hover:bg-[#1E293B] hover:text-white'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="flex-1 truncate">Secretariat &amp; Contact</span>
                      <span className="text-[9px] px-1 rounded bg-slate-500/20 text-slate-300">4 Sec</span>
                    </Link>

                    <Link
                      to="/admin/donate-settings"
                      onClick={handleNavClick}
                      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11.5px] transition-all ${
                        isActive('/admin/donate-settings')
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                          : 'text-gray-300 hover:bg-[#1E293B] hover:text-white'
                      }`}
                    >
                      <HeartHandshake className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="flex-1 truncate">Donate &amp; Banking</span>
                      <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300">Bank/80G</span>
                    </Link>

                    <Link
                      to="/admin/site-settings"
                      onClick={handleNavClick}
                      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11.5px] transition-all ${
                        isActive('/admin/site-settings')
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                          : 'text-gray-300 hover:bg-[#1E293B] hover:text-white'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="flex-1 truncate">Global Site Settings</span>
                      <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300">Header/Footer</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. DONATIONS & FINANCE (Super Admin & Accountant) */}
          {(isSuperAdmin || isAccountant) && (
            <div>
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Donations & Finance
              </div>
              <div className="space-y-0.5">
                <Link
                  to="/admin/payments"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/payments') || isActive('/admin/payment-approvals')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">Payment Approvals</span>
                  {pendingApprovalsCount > 0 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-extrabold uppercase tracking-wider animate-pulse shadow-xs">
                      {pendingApprovalsCount}
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider">
                      Treasury
                    </span>
                  )}
                </Link>

                <Link
                  to="/admin/donations"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/donations')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">Donations</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-400/20 text-[#D4AF37] font-semibold uppercase tracking-wider">Track</span>
                </Link>

                <Link
                  to="/admin/campaigns"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/campaigns')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <Flame className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">Campaigns & Causes</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold uppercase tracking-wider">Appeals</span>
                </Link>

                <Link
                  to="/admin/donors"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/donors')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">Donors Directory</span>
                </Link>

                <Link
                  to="/admin/receipts"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/receipts')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">Money Receipts</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-semibold uppercase tracking-wider">80G</span>
                </Link>

                <Link
                  to="/admin/accounts"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/accounts')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <Landmark className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">Accounts & Expenses</span>
                </Link>

                <Link
                  to="/admin/payment-gateways"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/payment-gateways')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <Coins className="w-4 h-4 text-[#D4AF37]" />
                  <span>Payment Gateways</span>
                </Link>
              </div>
            </div>
          )}

          {/* 3. OPERATIONS & HR (Super Admin & Staff) */}
          {(isSuperAdmin || isStaff || isAccountant) && (
            <div>
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Operations & Management
              </div>
              <div className="space-y-0.5">
                <Link
                  to="/admin/inventory"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/inventory')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <Warehouse className="w-4 h-4 text-[#D4AF37]" />
                  <span>Inventory & Store</span>
                </Link>

                <Link
                  to="/admin/hrm/employees"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/hrm')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>HRM & Attendance</span>
                </Link>

                <Link
                  to="/admin/payroll"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/payroll')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <Coins className="w-4 h-4 text-[#D4AF37]" />
                  <span>Payroll & Wages</span>
                </Link>

                <Link
                  to="/admin/projects"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/projects')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <FolderKanban className="w-4 h-4 text-[#D4AF37]" />
                  <span>Projects & Tasks</span>
                </Link>

                <Link
                  to="/admin/crm"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/crm')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <MessageSquareShare className="w-4 h-4 text-[#D4AF37]" />
                  <span>CRM & Inquiries</span>
                </Link>
              </div>
            </div>
          )}

          {/* 4. CONTENT & DHARMA MEDIA */}
          {(isSuperAdmin || isStaff) && (
            <div>
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Content & Dharma Media
              </div>
              <div className="space-y-0.5">
                <Link
                  to="/admin/prayer-requests"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/prayer-requests')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-[#D4AF37]" />
                  <span>CMS News & Prayers</span>
                </Link>

                <Link
                  to="/admin/blog"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/blog')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <Newspaper className="w-4 h-4 text-[#D4AF37]" />
                  <span>Blog & Articles</span>
                </Link>

                <Link
                  to="/admin/gallery"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/gallery')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                  <span>Gallery Photos</span>
                </Link>

                <Link
                  to="/admin/learning"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/learning')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <Video className="w-4 h-4 text-[#D4AF37]" />
                  <span>Learning Videos</span>
                </Link>
              </div>
            </div>
          )}

          {/* 5. SHEDRA ACADEMY */}
          {(isSuperAdmin || isStaff) && (
            <div>
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Shedra Monastic Sangha
              </div>
              <div className="space-y-0.5">
                <Link
                  to="/admin/monks"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/monks')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">Monastic Scholars</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-400/20 text-[#D4AF37] font-semibold uppercase tracking-wider">Sangha</span>
                </Link>

                <Link
                  to="/admin/lms"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/lms')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">Curriculum & LMS</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold uppercase tracking-wider">LMS</span>
                </Link>

                <Link
                  to="/admin/certificates"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/certificates')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">Certificates</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider">Verify</span>
                </Link>
              </div>
            </div>
          )}

          {/* 6. ADMINISTRATION & SYSTEM */}
          {isSuperAdmin && (
            <div>
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Administration
              </div>
              <div className="space-y-0.5">
                <Link
                  to="/admin/users"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/users')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <UserCog className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">Users & Roles</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold uppercase tracking-wider">Security</span>
                </Link>

                <Link
                  to="/admin/settings"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/settings')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">System Settings</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-400/20 text-[#D4AF37] font-semibold uppercase tracking-wider">Sync</span>
                </Link>

                <Link
                  to="/admin/audit-logs"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/audit-logs')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">Audit Logs</span>
                </Link>

                <Link
                  to="/admin/reports"
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                    isActive('/admin/reports')
                      ? 'bg-[#1E293B] text-white border-l-4 border-[#D4AF37] font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                  <span className="flex-1">Reports & Export</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold uppercase tracking-wider">PDF</span>
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Quick Action Pinned Footer */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0B0F19] flex-shrink-0 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] flex items-center justify-between px-1">
            <span>Quick Actions</span>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white flex items-center gap-1 font-normal lowercase text-[10px]"
              title="View live public site in new tab"
            >
              <span>live site</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <Link
              to="/admin/donations/new"
              onClick={handleNavClick}
              className="px-2 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#D4AF37] hover:text-[#0F172A] text-gray-200 transition-colors flex items-center justify-center gap-1 font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37] group-hover:text-inherit" />
              <span>+ Donation</span>
            </Link>

            <Link
              to="/admin/prayer-requests"
              onClick={handleNavClick}
              className="px-2 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#D4AF37] hover:text-[#0F172A] text-gray-200 transition-colors flex items-center justify-center gap-1 font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37] group-hover:text-inherit" />
              <span>+ Event</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
