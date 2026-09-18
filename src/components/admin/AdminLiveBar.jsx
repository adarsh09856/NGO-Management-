import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Edit3, Eye, Settings, ExternalLink, Sparkles, Layers,
  ShieldCheck, Zap, LayoutDashboard, Layout
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROUTE_STUDIO_MAP = {
  '/': { label: 'Homepage Studio', href: '/admin/pages/home', defaultSection: 'hero' },
  '/about': { label: 'About Us Studio', href: '/admin/pages/about', defaultSection: 'about-header' },
  '/donate': { label: 'Donations Studio', href: '/admin/donate-settings', defaultSection: 'donate-hero' },
  '/prayer-request': { label: 'Ceremonial Prayers Studio', href: '/admin/pages/prayers', defaultSection: 'prayers' },
  '/shedra': { label: 'Shedra Monastic Studio', href: '/admin/pages/shedra', defaultSection: 'shedra' },
  '/learning': { label: 'Dharma LMS Studio', href: '/admin/learning', defaultSection: 'learning' },
  '/news-events': { label: 'Ceremonies & Gazette', href: '/admin/prayer-requests', defaultSection: 'media' },
  '/blog': { label: 'Sacred Gazette Studio', href: '/admin/blog', defaultSection: 'blog' },
  '/gallery': { label: 'Sacred Gallery Studio', href: '/admin/gallery', defaultSection: 'gallery' },
  '/contact': { label: 'Secretariat & Contact Studio', href: '/admin/pages/contact', defaultSection: 'contact' },
};

export default function AdminLiveBar({ onOpenEditor }) {
  const { user } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const [editMode, setEditMode] = useState(() => {
    return localStorage.getItem('ngo_visual_edit_mode') === 'true';
  });

  const roleSlug = user?.role?.slug || user?.role_slug;
  const isAuthorized =
    roleSlug === 'super_admin' ||
    roleSlug === 'admin' ||
    roleSlug === 'staff' ||
    roleSlug === 'hr_manager' ||
    roleSlug === 'accountant';

  useEffect(() => {
    if (isAuthorized && !pathname.startsWith('/admin')) {
      document.body.classList.add('has-admin-live-bar');
    } else {
      document.body.classList.remove('has-admin-live-bar');
    }
    return () => {
      document.body.classList.remove('has-admin-live-bar');
    };
  }, [isAuthorized, pathname]);

  useEffect(() => {
    if (editMode && !pathname.startsWith('/admin')) {
      document.body.classList.add('ngo-visual-edit-on');
      localStorage.setItem('ngo_visual_edit_mode', 'true');
    } else {
      document.body.classList.remove('ngo-visual-edit-on');
      localStorage.setItem('ngo_visual_edit_mode', 'false');
    }
    return () => {
      document.body.classList.remove('ngo-visual-edit-on');
    };
  }, [editMode, pathname]);

  // If not logged in as admin or staff, or on admin pages, render nothing
  if (!isAuthorized || pathname.startsWith('/admin')) {
    return null;
  }

  // Resolve current studio
  const currentStudio = ROUTE_STUDIO_MAP[pathname] || {
    label: 'Site Studios',
    href: '/admin/pages',
    defaultSection: 'hero'
  };

  const handleQuickDrawer = () => {
    if (onOpenEditor) {
      onOpenEditor(currentStudio.defaultSection || 'hero', currentStudio.label, currentStudio.href);
    } else {
      window.dispatchEvent(
        new CustomEvent('ngo:open-live-editor', {
          detail: {
            section: currentStudio.defaultSection || 'hero',
            sectionTitle: currentStudio.label,
            studioHref: currentStudio.href
          }
        })
      );
    }
  };

  return (
    <>
      {/* Spacer so content does not hide behind the fixed bar */}
      <div style={{ height: 38 }} aria-hidden="true" />
      <header
        aria-label="Admin Live Visual Editing Bar"
        className="fixed top-0 left-0 right-0 z-[60] bg-[#0F172A] text-white px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs border-b border-[#D4AF37]/40 shadow-xl flex items-center justify-between gap-2 select-none overflow-x-auto whitespace-nowrap no-scrollbar"
      >
        {/* Left: Admin Identity & Current Studio */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <div className="w-5 h-5 rounded-md bg-[#721C24] border border-[#D4AF37] text-white flex items-center justify-center font-bold text-[10px] shadow-xs flex-shrink-0">
            ☸
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-white hidden sm:inline">Drodul Admin</span>
            <span className="font-semibold text-white inline sm:hidden">Admin</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-[#D4AF37] font-mono text-[11px] truncate max-w-[90px] sm:max-w-[140px]">
              {user?.fullName || user?.email || 'Staff'}
            </span>
          </div>

          {/* Dynamic Studio Quick Link */}
          <Link
            to={currentStudio.href}
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#D4AF37]/20 text-[#F6E05E] hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-[11px] font-semibold transition-colors flex-shrink-0"
            title={`Open ${currentStudio.label} in Admin Panel`}
          >
            <Edit3 className="w-3 h-3 text-[#D4AF37]" />
            <span>Edit in {currentStudio.label}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </Link>

          {/* All Pages Studio Hub */}
          <Link
            to="/admin/pages"
            className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 text-[11px] transition-colors flex-shrink-0"
            title="Browse all 10 CMS page studios"
          >
            <Layout className="w-3 h-3 text-[#D4AF37]" />
            <span>Pages CMS Hub</span>
          </Link>
        </div>

        {/* Center: Live Visual Edit Toggle */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full font-semibold transition-all shadow-xs cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
              editMode
                ? 'bg-[#D4AF37] text-slate-950 ring-2 ring-[#F6E05E] font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
            title={editMode ? 'Turn off visual edit mode' : 'Turn on visual edit mode and highlighted badges'}
          >
            {editMode ? (
              <>
                <Edit3 className="w-3 h-3 text-slate-950 flex-shrink-0" />
                <span className="hidden sm:inline">VISUAL EDIT: ON</span>
                <span className="inline sm:hidden">EDIT: ON</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="hidden sm:inline">VISUAL EDIT: OFF</span>
                <span className="inline sm:hidden">EDIT: OFF</span>
              </>
            )}
          </button>
          {editMode && (
            <span className="text-[11px] text-[#F6E05E]/90 font-mono hidden xl:inline">
              (In-place section badges active)
            </span>
          )}
        </div>

        {/* Right: Quick Modal & Admin Console */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleQuickDrawer}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#F6E05E] text-xs font-semibold border border-[#D4AF37]/40 transition-colors flex-shrink-0 cursor-pointer"
            title="Open In-Place Live Section Editor"
          >
            <Zap className="w-3 h-3 text-[#D4AF37]" />
            <span>Quick Editor</span>
          </button>

          <Link
            to="/admin"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-lg bg-[#721C24] hover:bg-[#8B2E24] text-white text-[11px] sm:text-xs font-semibold shadow-xs transition-colors whitespace-nowrap flex-shrink-0"
            title="Open Full Admin Console"
          >
            <LayoutDashboard className="w-3 h-3 text-white/90" />
            <span className="hidden xs:inline sm:inline">Admin Console</span>
            <span className="inline xs:hidden sm:hidden">Admin</span>
            <ExternalLink className="w-2.5 h-2.5 text-white/80" />
          </Link>
        </div>
      </header>
    </>
  );
}
