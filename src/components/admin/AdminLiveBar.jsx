import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, LayoutDashboard, ExternalLink, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLiveBar({ onOpenEditor }) {
  const { user } = useAuth();

  const roleSlug = user?.role?.slug || user?.role_slug;
  const isAuthorized =
    roleSlug === 'super_admin' ||
    roleSlug === 'admin' ||
    roleSlug === 'staff' ||
    roleSlug === 'hr_manager' ||
    roleSlug === 'accountant';

  if (!isAuthorized) return null;

  return (
    <aside
      aria-label="Admin Live Mode Bar"
      className="sticky top-0 z-[60] bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white border-b border-[#D4AF37]/40 shadow-lg px-3 sm:px-6 py-1.5 flex items-center justify-between text-xs backdrop-blur-md"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="text-[#D4AF37] font-bold text-[11px] uppercase tracking-wider hidden xs:inline">
          Live Editor
        </span>
        <span className="text-gray-300 text-[11px] truncate">
          Logged in as <strong className="text-white">{user?.fullName || 'Staff'}</strong> ({roleSlug}) • Click any badge to edit
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {onOpenEditor && (
          <button
            type="button"
            onClick={() => onOpenEditor('hero')}
            className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0F172A] border border-[#D4AF37]/40 text-[10.5px] font-bold transition-colors flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            <span>Open Editor</span>
          </button>
        )}

        <Link
          to="/admin"
          className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white border border-white/20 text-[10.5px] font-bold transition-colors flex items-center gap-1"
        >
          <LayoutDashboard className="w-3 h-3 text-[#D4AF37]" />
          <span className="hidden sm:inline">Admin Panel</span>
        </Link>
      </div>
    </aside>
  );
}
