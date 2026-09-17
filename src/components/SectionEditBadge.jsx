import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, ExternalLink, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Universal Section Edit Badge matching HAB specification
 * Shows a glowing amber badge for authenticated administrators/staff
 * Provides both Quick In-Page Edit (Zap) and full Admin Studio (ExternalLink)
 */
export default function SectionEditBadge({
  sectionKey,
  sectionLabel,
  label,
  studioHref,
  onQuickEdit,
  position = 'top-3 right-3',
  className
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

  const displayLabel = label || sectionLabel || 'Edit Section';

  // Default studio mapping if not explicitly passed
  let resolvedStudioHref = studioHref;
  if (!resolvedStudioHref) {
    switch (sectionKey) {
      case 'hero':
      case 'stats':
      case 'documentary':
        resolvedStudioHref = '/admin/system-settings';
        break;
      case 'campaigns':
        resolvedStudioHref = '/admin/campaigns';
        break;
      case 'about':
      case 'pillars':
      case 'leadership':
        resolvedStudioHref = '/admin/system-settings';
        break;
      case 'contact':
        resolvedStudioHref = '/admin/crm';
        break;
      case 'donate':
      case 'banking':
        resolvedStudioHref = '/admin/donations';
        break;
      case 'navbar':
      case 'footer':
        resolvedStudioHref = '/admin/system-settings';
        break;
      case 'prayer':
      case 'prayers':
        resolvedStudioHref = '/admin/prayer-requests';
        break;
      case 'gallery':
        resolvedStudioHref = '/admin/gallery';
        break;
      case 'media':
      case 'news':
      case 'events':
        resolvedStudioHref = '/admin/prayer-requests';
        break;
      case 'blog':
        resolvedStudioHref = '/admin/blog';
        break;
      case 'learning':
        resolvedStudioHref = '/admin/learning';
        break;
      case 'shedra':
        resolvedStudioHref = '/admin/monks';
        break;
      default:
        resolvedStudioHref = '/admin/system-settings';
    }
  }

  const handleQuickClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickEdit) {
      onQuickEdit(sectionKey);
    } else {
      window.dispatchEvent(new CustomEvent('ngo:open-live-editor', { detail: { section: sectionKey } }));
    }
  };

  const posClasses = className || position;

  return (
    <aside
      className={`ngo-section-edit-badge absolute ${posClasses} z-40 items-center gap-1.5 bg-[#0F172A]/95 text-white text-[11px] font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-[#D4AF37]/60 shadow-xl backdrop-blur-md transition-all hover:bg-[#0F172A] pointer-events-auto flex`}
      aria-label={`Visual edit options for ${displayLabel}`}
    >
      {/* Pulse Dot & Section Label */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
        <span className="text-[#F6E05E] font-semibold text-[10px] sm:text-[11px] hidden xs:inline">{displayLabel}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 ml-1.5 border-l border-slate-700 pl-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={handleQuickClick}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#F6E05E] font-semibold border border-[#D4AF37]/40 transition-colors cursor-pointer text-[10px] sm:text-[10.5px]"
          title={`Quick edit ${displayLabel} in slide-over drawer`}
        >
          <Zap className="w-2.5 h-2.5 text-[#D4AF37]" />
          <span>Quick Edit</span>
        </button>

        {resolvedStudioHref && (
          <Link
            to={resolvedStudioHref}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#721C24] hover:bg-[#8B2E24] text-white font-bold transition-colors shadow-xs text-[10px] sm:text-[10.5px]"
            title={`Open full ${displayLabel} studio in Admin`}
          >
            <Edit3 className="w-2.5 h-2.5 text-white" />
            <span className="hidden sm:inline">Studio</span>
            <ExternalLink className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white/80" />
          </Link>
        )}
      </div>
    </aside>
  );
}
