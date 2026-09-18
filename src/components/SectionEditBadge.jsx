import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, ExternalLink, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Universal Section Edit Badge matching HAB specification
 * Shows a glowing amber badge for authenticated administrators/staff
 * Provides both Quick In-Page Edit (Zap modal popup) and full Admin Studio (ExternalLink)
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

  // Section to Studio exact routing map
  let resolvedStudioHref = studioHref;
  if (!resolvedStudioHref) {
    switch (sectionKey) {
      case 'hero':
        resolvedStudioHref = '/admin/pages/home#hero';
        break;
      case 'stats':
        resolvedStudioHref = '/admin/pages/home#stats';
        break;
      case 'campaigns':
        resolvedStudioHref = '/admin/pages/home#campaigns';
        break;
      case 'documentary':
        resolvedStudioHref = '/admin/pages/home#documentary';
        break;
      case 'pillars':
        resolvedStudioHref = '/admin/pages/home#pillars';
        break;
      case 'prayers':
        resolvedStudioHref = '/admin/pages/home#prayers';
        break;
      case 'prayer':
      case 'prayer-hero':
      case 'prayer-header':
        resolvedStudioHref = '/admin/pages/prayers#hero';
        break;
      case 'prayer-lamps':
      case 'prayer-butterlamps':
        resolvedStudioHref = '/admin/pages/prayers#butterlamps';
        break;
      case 'prayer-pujas':
      case 'prayer-form':
        resolvedStudioHref = '/admin/pages/prayers#pujas';
        break;
      case 'prayer-schedule':
        resolvedStudioHref = '/admin/pages/prayers#schedule';
        break;
      case 'shedra':
        resolvedStudioHref = '/admin/pages/shedra#hero';
        break;
      case 'shedra-hero':
        resolvedStudioHref = '/admin/pages/shedra#hero';
        break;
      case 'shedra-curriculum':
      case 'shedra-shastras':
        resolvedStudioHref = '/admin/pages/shedra#curriculum';
        break;
      case 'shedra-facilities':
        resolvedStudioHref = '/admin/pages/shedra#facilities';
        break;
      case 'shedra-admissions':
      case 'shedra-verify':
        resolvedStudioHref = '/admin/pages/shedra#admissions';
        break;
      case 'learning':
      case 'learning-hero':
        resolvedStudioHref = '/admin/learning';
        break;
      case 'blog':
      case 'blog-hero':
        resolvedStudioHref = '/admin/blog';
        break;
      case 'gallery':
      case 'gallery-hero':
        resolvedStudioHref = '/admin/gallery';
        break;
      case 'news':
      case 'news-hero':
        resolvedStudioHref = '/admin/blog';
        break;
      case 'about-header':
      case 'about':
        resolvedStudioHref = '/admin/pages/about#header';
        break;
      case 'about-pillars':
        resolvedStudioHref = '/admin/pages/about#pillars';
        break;
      case 'leadership':
        resolvedStudioHref = '/admin/pages/about#leadership';
        break;
      case 'statutory':
        resolvedStudioHref = '/admin/pages/about#statutory';
        break;
      case 'donate-hero':
      case 'donate':
        resolvedStudioHref = '/admin/donate-settings#hero';
        break;
      case 'donate-presets':
        resolvedStudioHref = '/admin/donate-settings#presets';
        break;
      case 'banking':
        resolvedStudioHref = '/admin/donate-settings#bank';
        break;
      case 'tax':
        resolvedStudioHref = '/admin/donate-settings#tax';
        break;
      case 'header':
      case 'navbar':
        resolvedStudioHref = '/admin/site-settings#header';
        break;
      case 'footer':
        resolvedStudioHref = '/admin/site-settings#footer';
        break;
      case 'contact':
      case 'contact-hero':
        resolvedStudioHref = '/admin/pages/contact#hero';
        break;
      case 'contact-seat':
      case 'contact-info':
        resolvedStudioHref = '/admin/pages/contact#seat';
        break;
      case 'contact-dir':
      case 'contact-departments':
        resolvedStudioHref = '/admin/pages/contact#directory';
        break;
      case 'contact-hours':
      case 'contact-map':
      case 'contact-visiting':
        resolvedStudioHref = '/admin/pages/contact#visiting';
        break;
      case 'social':
        resolvedStudioHref = '/admin/site-settings#social';
        break;
      default:
        resolvedStudioHref = '/admin/pages/home';
    }
  }

  const handleQuickClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickEdit) {
      onQuickEdit(sectionKey);
    } else {
      window.dispatchEvent(
        new CustomEvent('ngo:open-live-editor', {
          detail: {
            section: sectionKey,
            sectionTitle: displayLabel,
            studioHref: resolvedStudioHref
          }
        })
      );
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
          title={`Quick edit ${displayLabel} in popup modal`}
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
