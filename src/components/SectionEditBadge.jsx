import React from 'react';
import { Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Universal Section Edit Badge
 * Shows a gold pencil badge for authenticated administrators/staff
 * Clicking opens the live section editor for that specific section
 */
export default function SectionEditBadge({
  sectionKey,
  sectionLabel = 'Edit Section',
  onQuickEdit,
  position = 'top-3 right-3'
}) {
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
    <div className={`absolute ${position} z-30 group animate-fadeIn pointer-events-auto`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onQuickEdit) onQuickEdit(sectionKey);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F172A]/90 hover:bg-[#0F172A] text-[#D4AF37] hover:text-white border border-[#D4AF37]/60 hover:border-[#D4AF37] shadow-lg backdrop-blur-md text-[10.5px] font-bold tracking-wide transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        title={`Edit ${sectionLabel} in real-time`}
        aria-label={`Edit ${sectionLabel}`}
      >
        <Edit3 className="w-3 h-3 text-[#D4AF37] animate-pulse" />
        <span className="hidden sm:inline font-sans">{sectionLabel}</span>
      </button>
    </div>
  );
}
