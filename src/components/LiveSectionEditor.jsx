import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  X, Save, AlertCircle, CheckCircle2, Loader2, Edit3,
  ExternalLink, Type, Link2, Image as ImageIcon, BarChart2,
  Sliders, ShieldCheck, Sparkles, UploadCloud, Flame, Building2,
  BookOpen, Video, Heart, Landmark, GraduationCap
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import AdvancedEditorSuite from './admin/AdvancedEditorSuite';

export default function LiveSectionEditor({
  isOpen,
  onClose,
  sectionKey = 'hero',
  sectionTitle,
  studioHref,
  onSaved,
  customPageData
}) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sub-tabs: CONTENT | ACTIONS | MEDIA | CARDS
  const [activeTab, setActiveTab] = useState('CONTENT');

  // Custom Page State for in-place live editing of /pages/:slug
  const isCustomPage = sectionKey === 'custom-page' || Boolean(customPageData);
  const [customPageForm, setCustomPageForm] = useState(customPageData || {});
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Form State
  const [form, setForm] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Load existing settings on open
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);
    setSavedSuccess(false);
    setActiveTab('CONTENT');

    if (isCustomPage) {
      if (customPageData) {
        setCustomPageForm({
          ...customPageData,
          gallery_images: Array.isArray(customPageData.gallery_images) ? customPageData.gallery_images : [],
          social_links: customPageData.social_links || { facebook: '', instagram: '', youtube: '', whatsapp: '' },
          cta_button: customPageData.cta_button || { label: '', url: '', style: 'primary' },
          is_published: Boolean(customPageData.is_published),
          show_in_header_nav: Boolean(customPageData.show_in_header_nav ?? customPageData.show_in_header),
          show_in_footer_nav: Boolean(customPageData.show_in_footer_nav ?? customPageData.show_in_footer),
        });
        setLoading(false);
      } else {
        const path = window.location.pathname;
        if (path.startsWith('/pages/')) {
          const slug = path.replace('/pages/', '');
          api.get(`/pages/${slug}`).then(res => {
            if (isMounted && res.data?.success && res.data.page) {
              const p = res.data.page;
              let gallery = p.gallery_images;
              if (typeof gallery === 'string') { try { gallery = JSON.parse(gallery); } catch (_) { gallery = []; } }
              let soc = p.social_links;
              if (typeof soc === 'string') { try { soc = JSON.parse(soc); } catch (_) { soc = {}; } }
              let cta = p.cta_button;
              if (typeof cta === 'string') { try { cta = JSON.parse(cta); } catch (_) { cta = null; } }
              setCustomPageForm({
                ...p,
                gallery_images: Array.isArray(gallery) ? gallery : [],
                social_links: soc || { facebook: '', instagram: '', youtube: '', whatsapp: '' },
                cta_button: cta || { label: '', url: '', style: 'primary' },
                is_published: Boolean(p.is_published),
                show_in_header_nav: Boolean(p.show_in_header),
                show_in_footer_nav: Boolean(p.show_in_footer),
              });
            }
          }).catch(err => {
            console.error('Failed to load custom page data:', err);
          }).finally(() => {
            if (isMounted) setLoading(false);
          });
        } else {
          setLoading(false);
        }
      }
      return;
    }

    async function loadData() {
      try {
        const res = await api.get('/settings');
        if (isMounted && res.data?.success && res.data.data) {
          setForm(res.data.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load settings in editor:', err);
          setErrorMsg('Failed to load settings. Please refresh or check connection.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, sectionKey, isCustomPage, customPageData]);

  if (!isOpen || !mounted) return null;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e, targetKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploading(true);
      setErrorMsg(null);
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data.url) {
        updateField(targetKey, res.data.url);
        toastSuccess('Image uploaded successfully!');
      } else {
        toastError(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      toastError(err.response?.data?.message || err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      if (isCustomPage) {
        const pageId = customPageData?.id || customPageForm?.id;
        if (!pageId) throw new Error('Missing page identifier for custom page update.');

        const finalCategory = isCreatingCategory && customCategoryInput.trim()
          ? customCategoryInput.trim()
          : customPageForm.category || 'General';

        const payload = {
          ...customPageForm,
          category: finalCategory,
        };

        const res = await api.put(`/pages/${pageId}`, payload);
        if (!res.data?.success) {
          throw new Error(res.data?.message || 'Failed to save custom page');
        }

        window.dispatchEvent(
          new CustomEvent('ngo:page-updated', {
            detail: { page: payload }
          })
        );
        window.dispatchEvent(new CustomEvent('ngo:content-updated'));

        if (onSaved) onSaved(payload);

        setSavedSuccess(true);
        toastSuccess('Custom page updated & live instantly across website!');
        setTimeout(() => {
          onClose();
          if (payload.slug && payload.slug !== customPageData?.slug) {
            window.location.href = `/pages/${payload.slug}`;
          } else {
            window.location.reload();
          }
        }, 800);
        return;
      }

      const res = await api.put('/settings', { settings: form });
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to save settings');
      }

      // Dispatch real-time zero-reload events across all public React components
      window.dispatchEvent(
        new CustomEvent('ngo:settings-updated', {
          detail: { settings: form, section: sectionKey }
        })
      );
      window.dispatchEvent(new CustomEvent('ngo:content-updated'));

      if (onSaved) onSaved(form);

      setSavedSuccess(true);
      toastSuccess('Section changes saved & live instantly across website!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save section changes';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Resolve Titles & Studio Link
  const SECTION_META = {
    hero: {
      title: 'Hero Section & Sacred Mission',
      studio: '/admin/pages/home#hero',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    stats: {
      title: 'Impact Stats & Counters',
      studio: '/admin/pages/home#stats',
      hasActions: false,
      hasMedia: false,
      hasCards: true
    },
    campaigns: {
      title: 'Featured Campaigns & Causes',
      studio: '/admin/pages/home#campaigns',
      hasActions: true,
      hasMedia: false,
      hasCards: true
    },
    documentary: {
      title: 'Monastery Documentary Film & Story',
      studio: '/admin/pages/home#documentary',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    pillars: {
      title: 'Four Sacred Pillars of Activity',
      studio: '/admin/pages/home#pillars',
      hasActions: true,
      hasMedia: false,
      hasCards: true
    },
    prayers: {
      title: 'Butter Lamp Puja & Ceremonies',
      studio: '/admin/pages/home#prayers',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    prayer: {
      title: 'Butter Lamp Puja & Ceremonies',
      studio: '/admin/pages/home#prayers',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    shedra: {
      title: 'Shedra Monastic Sangha & LMS',
      studio: '/admin/pages/home#shedra',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    learning: {
      title: 'Dharma LMS & Video Teachings',
      studio: '/admin/learning',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    blog: {
      title: 'Sacred Gazette & Articles',
      studio: '/admin/blog',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    'about-header': {
      title: 'About Page Header & Heritage',
      studio: '/admin/pages/about#header',
      hasActions: false,
      hasMedia: true,
      hasCards: false
    },
    about: {
      title: 'About Monastery & Mandate',
      studio: '/admin/pages/about#header',
      hasActions: true,
      hasMedia: true,
      hasCards: true
    },
    'about-pillars': {
      title: 'Three Sacred Core Pillars',
      studio: '/admin/pages/about#pillars',
      hasActions: false,
      hasMedia: false,
      hasCards: true
    },
    leadership: {
      title: 'Abbot & Spiritual Leadership',
      studio: '/admin/pages/about#leadership',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    statutory: {
      title: 'Statutory Trust, ROB & 80G',
      studio: '/admin/pages/about#statutory',
      hasActions: false,
      hasMedia: false,
      hasCards: true
    },
    'donate-hero': {
      title: 'Donation Hero & Mission',
      studio: '/admin/donate-settings#hero',
      hasActions: false,
      hasMedia: true,
      hasCards: false
    },
    donate: {
      title: 'Donations & Sacred Giving',
      studio: '/admin/donate-settings#hero',
      hasActions: true,
      hasMedia: true,
      hasCards: true
    },
    'donate-presets': {
      title: 'Donation Presets & Offering Tiers',
      studio: '/admin/donate-settings#presets',
      hasActions: false,
      hasMedia: false,
      hasCards: true
    },
    banking: {
      title: 'Direct Bank Wire & Remittance Details',
      studio: '/admin/donate-settings#bank',
      hasActions: false,
      hasMedia: true,
      hasCards: true
    },
    tax: {
      title: '80G Tax Exemption & Governance',
      studio: '/admin/donate-settings#tax',
      hasActions: false,
      hasMedia: false,
      hasCards: false
    },
    header: {
      title: 'Header, Top Bar & Announcement',
      studio: '/admin/site-settings#header',
      hasActions: true,
      hasMedia: false,
      hasCards: false
    },
    navbar: {
      title: 'Header, Top Bar & Announcement',
      studio: '/admin/site-settings#header',
      hasActions: true,
      hasMedia: false,
      hasCards: false
    },
    footer: {
      title: 'Footer Ashtamangala & Legal',
      studio: '/admin/site-settings#footer',
      hasActions: true,
      hasMedia: false,
      hasCards: true
    },
    contact: {
      title: 'Monastery Secretariat & Contact Info',
      studio: '/admin/pages/contact#hero',
      hasActions: true,
      hasMedia: false,
      hasCards: false
    },
    'contact-hero': {
      title: 'Contact Desk Hero & Inscription',
      studio: '/admin/pages/contact#hero',
      hasActions: false,
      hasMedia: false,
      hasCards: false
    },
    'contact-seat': {
      title: 'Secretariat Seat & Address',
      studio: '/admin/pages/contact#seat',
      hasActions: false,
      hasMedia: false,
      hasCards: false
    },
    'contact-dir': {
      title: 'Department Contact Directory',
      studio: '/admin/pages/contact#directory',
      hasActions: false,
      hasMedia: false,
      hasCards: true
    },
    'contact-visiting': {
      title: 'Visiting Hours & Monastery Map',
      studio: '/admin/pages/contact#visiting',
      hasActions: false,
      hasMedia: false,
      hasCards: false
    },
    'shedra-hero': {
      title: 'Shedra Academy Hero Banner',
      studio: '/admin/pages/shedra#hero',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    'shedra-curriculum': {
      title: 'Five Great Shastras of Shedra',
      studio: '/admin/pages/shedra#curriculum',
      hasActions: false,
      hasMedia: false,
      hasCards: true
    },
    'shedra-facilities': {
      title: 'Monastic Campus Facilities',
      studio: '/admin/pages/shedra#facilities',
      hasActions: false,
      hasMedia: false,
      hasCards: true
    },
    'shedra-admissions': {
      title: 'Shedra Admissions & Benefits',
      studio: '/admin/pages/shedra#admissions',
      hasActions: true,
      hasMedia: false,
      hasCards: true
    },
    'prayer-hero': {
      title: 'Ceremonial Prayers Hero Banner',
      studio: '/admin/pages/prayers#hero',
      hasActions: false,
      hasMedia: false,
      hasCards: false
    },
    'prayer-lamps': {
      title: '108 Butter Lamp Offering Tiers',
      studio: '/admin/pages/prayers#butterlamps',
      hasActions: false,
      hasMedia: false,
      hasCards: true
    },
    'prayer-pujas': {
      title: 'Traditional Sacred Pujas',
      studio: '/admin/pages/prayers#pujas',
      hasActions: false,
      hasMedia: false,
      hasCards: true
    },
    'prayer-schedule': {
      title: 'Shrine Daily Ritual Schedule',
      studio: '/admin/pages/prayers#schedule',
      hasActions: false,
      hasMedia: false,
      hasCards: true
    },
    'learning-hero': {
      title: 'Dharma LMS Hero Banner',
      studio: '/admin/learning',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    'blog-hero': {
      title: 'Sacred Gazette Hero Banner',
      studio: '/admin/blog',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    gallery: {
      title: 'Sacred Photo Gallery & Visual Archives',
      studio: '/admin/gallery',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    'gallery-hero': {
      title: 'Sacred Media Archives Hero Banner',
      studio: '/admin/gallery',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    news: {
      title: 'Monastery Gazette & News Events',
      studio: '/admin/prayer-requests?tab=news',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    'news-hero': {
      title: 'News & Events Hero Banner',
      studio: '/admin/prayer-requests?tab=news',
      hasActions: true,
      hasMedia: true,
      hasCards: false
    },
    social: {
      title: 'Social Media Channels',
      studio: '/admin/site-settings#social',
      hasActions: true,
      hasMedia: false,
      hasCards: false
    }
  };

  const meta = SECTION_META[sectionKey] || {
    title: sectionTitle || 'Section Settings',
    studio: studioHref || '/admin/pages',
    hasActions: true,
    hasMedia: true,
    hasCards: true
  };

  const displayTitle = sectionTitle || meta.title;
  const targetStudio = studioHref || meta.studio;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full ${isCustomPage ? 'max-w-4xl xl:max-w-5xl' : 'max-w-3xl'} bg-white rounded-2xl border border-slate-200 shadow-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden select-text animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex-shrink-0 p-4 sm:p-5 border-b border-slate-200 bg-[#0F172A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center shadow-xs flex-shrink-0 font-bold text-lg font-serif">
              ☸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight font-serif-brand">
                  {isCustomPage ? (customPageForm.title || customPageData?.title || 'Custom Page') : displayTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  In-Place Quick Edit
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 font-light">
                Updates save directly to database & synchronize live across the public site without full reload.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close editor modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Tabs (only for standard sections) */}
        {!isCustomPage && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('CONTENT')}
              className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'CONTENT'
                  ? 'border-[#721C24] text-[#721C24]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Headlines & Text</span>
            </button>

            {meta.hasActions && (
              <button
                type="button"
                onClick={() => setActiveTab('ACTIONS')}
                className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'ACTIONS'
                    ? 'border-[#721C24] text-[#721C24]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Call-to-Action Buttons</span>
              </button>
            )}

            {meta.hasMedia && (
              <button
                type="button"
                onClick={() => setActiveTab('MEDIA')}
                className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'MEDIA'
                    ? 'border-[#721C24] text-[#721C24]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Media & Visuals</span>
              </button>
            )}

            {meta.hasCards && (
              <button
                type="button"
                onClick={() => setActiveTab('CARDS')}
                className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'CARDS'
                    ? 'border-[#721C24] text-[#721C24]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Stats & Cards Details</span>
              </button>
            )}
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 no-scrollbar">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {savedSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Changes published live to database! Real-time sync complete.</span>
              </div>
            )}

            {isCustomPage ? (
              <AdvancedEditorSuite
                form={customPageForm}
                onChange={(updated) => setCustomPageForm((prev) => ({ ...prev, ...updated }))}
                isCreatingCategory={isCreatingCategory}
                setIsCreatingCategory={setIsCreatingCategory}
                customCategoryInput={customCategoryInput}
                setCustomCategoryInput={setCustomCategoryInput}
              />
            ) : loading ? (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#721C24]" />
                <p className="text-xs font-medium">Fetching section fields from database...</p>
              </div>
            ) : (
              <>
                {/* ---------------------------------------------------- */}
                {/* SUB-TAB 1: HEADLINES & TEXT                          */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'CONTENT' && (
                  <div className="space-y-4">
                    {/* SECTION: HERO */}
                    {sectionKey === 'hero' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tibetan Eyebrow / Sacred Badge
                          </label>
                          <input
                            type="text"
                            value={form.home_hero_badge || ''}
                            onChange={(e) => updateField('home_hero_badge', e.target.value)}
                            placeholder="༄༅། །དགེ་ལེགས་ཀྱི་གནས། • Sacred Himalayan Sanctuary"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#721C24]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Hero Main Title
                          </label>
                          <input
                            type="text"
                            value={form.home_hero_title || ''}
                            onChange={(e) => updateField('home_hero_title', e.target.value)}
                            placeholder="BUILDING A SACRED LEGACY OF PEACE & WISDOM"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-[#721C24]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Hero Mission Paragraph / Subtitle
                          </label>
                          <textarea
                            rows={3}
                            value={form.home_hero_subtitle || ''}
                            onChange={(e) => updateField('home_hero_subtitle', e.target.value)}
                            placeholder="Constructing the monumental 108ft Great Druk Wangyel Peace Stupa..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-[#721C24]"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: STATS */}
                    {sectionKey === 'stats' && (
                      <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
                        <p className="font-bold">Stats Ribbon Quick Editor</p>
                        <p className="text-amber-800">
                          Switch to the <span className="font-bold">"Stats & Cards Details"</span> tab above to configure all 4 counter metrics, labels, and subheadings.
                        </p>
                      </div>
                    )}

                    {/* SECTION: CAMPAIGNS */}
                    {sectionKey === 'campaigns' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Section Badge / Pill</label>
                          <input
                            type="text"
                            value={form.campaigns_badge || ''}
                            onChange={(e) => updateField('campaigns_badge', e.target.value)}
                            placeholder="Sacred Philanthropy"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Section Main Heading</label>
                          <input
                            type="text"
                            value={form.campaigns_title || ''}
                            onChange={(e) => updateField('campaigns_title', e.target.value)}
                            placeholder="Current Monastic & Stupa Campaigns"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Section Description / Subtitle</label>
                          <textarea
                            rows={2}
                            value={form.campaigns_subtitle || ''}
                            onChange={(e) => updateField('campaigns_subtitle', e.target.value)}
                            placeholder="Sacred appeals directly financing peace stupas, monk nutrition, and scholarship..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: DOCUMENTARY */}
                    {sectionKey === 'documentary' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Documentary Eyebrow</label>
                          <input
                            type="text"
                            value={form.doc_badge || ''}
                            onChange={(e) => updateField('doc_badge', e.target.value)}
                            placeholder="Monastery Documentary & Vision"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Story Main Heading</label>
                          <input
                            type="text"
                            value={form.home_about_title || ''}
                            onChange={(e) => updateField('home_about_title', e.target.value)}
                            placeholder="From Sacred Lineage to Global World Peace"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Full Documentary Narrative</label>
                          <textarea
                            rows={4}
                            value={form.home_about_description || ''}
                            onChange={(e) => updateField('home_about_description', e.target.value)}
                            placeholder="Nestled in the tranquil Himalayan foothills of Gelephu, Bhutan..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: PILLARS */}
                    {sectionKey === 'pillars' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Section Pill</label>
                          <input
                            type="text"
                            value={form.home_pillars_badge || ''}
                            onChange={(e) => updateField('home_pillars_badge', e.target.value)}
                            placeholder="Our Noble Mission"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Section Heading</label>
                          <input
                            type="text"
                            value={form.home_pillars_title || ''}
                            onChange={(e) => updateField('home_pillars_title', e.target.value)}
                            placeholder="Four Pillars of Sacred Merit"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Section Subtitle</label>
                          <textarea
                            rows={2}
                            value={form.home_pillars_subtitle || ''}
                            onChange={(e) => updateField('home_pillars_subtitle', e.target.value)}
                            placeholder="Dedicated programs empowering Buddhist scholarship, architectural preservation, and spiritual welfare."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: PRAYERS */}
                    {(sectionKey === 'prayers' || sectionKey === 'prayer') && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Ceremonial Pill</label>
                          <input
                            type="text"
                            value={form.home_prayers_badge || ''}
                            onChange={(e) => updateField('home_prayers_badge', e.target.value)}
                            placeholder="Consecrated Daily Prayers"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Puja Heading</label>
                          <input
                            type="text"
                            value={form.home_prayers_title || ''}
                            onChange={(e) => updateField('home_prayers_title', e.target.value)}
                            placeholder="Offer 108 Sacred Butter Lamps For World Peace & Family Health"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Puja Description</label>
                          <textarea
                            rows={3}
                            value={form.home_prayers_subtitle || ''}
                            onChange={(e) => updateField('home_prayers_subtitle', e.target.value)}
                            placeholder="Submit personal prayer intentions and names of loved ones. Our resident Shedra monks chant consecrated prayers..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: SHEDRA */}
                    {sectionKey === 'shedra' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Shedra Pill</label>
                          <input
                            type="text"
                            value={form.shedra_hero_badge || ''}
                            onChange={(e) => updateField('shedra_hero_badge', e.target.value)}
                            placeholder="Shedra Higher Buddhist University"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Shedra Title</label>
                          <input
                            type="text"
                            value={form.shedra_hero_title || ''}
                            onChange={(e) => updateField('shedra_hero_title', e.target.value)}
                            placeholder="Training Monastic Scholars in Classical Philosophy & Contemplation"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Shedra Subtitle</label>
                          <textarea
                            rows={3}
                            value={form.shedra_hero_subtitle || ''}
                            onChange={(e) => updateField('shedra_hero_subtitle', e.target.value)}
                            placeholder="Rigorous 9-year Buddhist academic curriculum including Madhyamaka, Pramana epistemics, Vinaya..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: ABOUT HEADER */}
                    {(sectionKey === 'about-header' || sectionKey === 'about') && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan Eyebrow Inscription</label>
                          <input
                            type="text"
                            value={form.about_tibetan_eyebrow || ''}
                            onChange={(e) => updateField('about_tibetan_eyebrow', e.target.value)}
                            placeholder="༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པའི་ལོ་རྒྱུས། • Sacred Monastic Heritage"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">About Page Title</label>
                          <input
                            type="text"
                            value={form.about_page_title || ''}
                            onChange={(e) => updateField('about_page_title', e.target.value)}
                            placeholder="About Drodul Phendey Ling Foundation"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">About Page Subtitle</label>
                          <textarea
                            rows={3}
                            value={form.about_page_subtitle || ''}
                            onChange={(e) => updateField('about_page_subtitle', e.target.value)}
                            placeholder="Established in the tranquil Himalayan foothills of Gelephu, Sarpang Dzongkhag, Bhutan..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: LEADERSHIP */}
                    {sectionKey === 'leadership' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Abbot / Leader Name</label>
                            <input
                              type="text"
                              value={form.about_leader_name || ''}
                              onChange={(e) => updateField('about_leader_name', e.target.value)}
                              placeholder="Khenpo Tashi Dorji"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Spiritual Title</label>
                            <input
                              type="text"
                              value={form.about_leader_title || ''}
                              onChange={(e) => updateField('about_leader_title', e.target.value)}
                              placeholder="Abbot & Principal of Shedra Academy"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Leadership Biography</label>
                          <textarea
                            rows={3}
                            value={form.about_leader_bio || ''}
                            onChange={(e) => updateField('about_leader_bio', e.target.value)}
                            placeholder="Having completed nine years of rigorous Shedra curriculum and traditional solitary mountain retreat..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Lineage Blessing Quote</label>
                          <input
                            type="text"
                            value={form.about_leader_blessing || ''}
                            onChange={(e) => updateField('about_leader_blessing', e.target.value)}
                            placeholder="May every stone carved for this Stupa, every mantra chanted in this Shedra, bring peace to a troubled world."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs italic"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: DONATE HERO */}
                    {(sectionKey === 'donate-hero' || sectionKey === 'donate') && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Donation Eyebrow Badge</label>
                          <input
                            type="text"
                            value={form.donate_hero_badge || ''}
                            onChange={(e) => updateField('donate_hero_badge', e.target.value)}
                            placeholder="☸ མཆོད་འབུལ། • Sacred Monastic Philanthropy"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Donation Page Title</label>
                          <input
                            type="text"
                            value={form.donate_hero_title || ''}
                            onChange={(e) => updateField('donate_hero_title', e.target.value)}
                            placeholder="Make A Meritorious Offering for Peace & Buddha Dharma"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Donation Page Subtitle</label>
                          <textarea
                            rows={3}
                            value={form.donate_hero_subtitle || ''}
                            onChange={(e) => updateField('donate_hero_subtitle', e.target.value)}
                            placeholder="Every offering directly finances the 108ft Great Druk Wangyel Peace Stupa..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: HEADER / NAVBAR */}
                    {(sectionKey === 'header' || sectionKey === 'navbar') && (
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Monastery Brand Heading</label>
                            <input
                              type="text"
                              value={form.site_name || ''}
                              onChange={(e) => updateField('site_name', e.target.value)}
                              placeholder="DRODUL PHENDEY LING"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan Sacred Title</label>
                            <input
                              type="text"
                              value={form.site_tibetan_name || ''}
                              onChange={(e) => updateField('site_tibetan_name', e.target.value)}
                              placeholder="འགྲོ་འདུལ་ཕན་བདེ་གླིང་།"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-serif"
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Top Golden Announcement Bar
                          </span>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Banner Announcement Text</label>
                            <input
                              type="text"
                              value={form.header_announcement || ''}
                              onChange={(e) => updateField('header_announcement', e.target.value)}
                              placeholder="༄༅། །108-Foot Great Druk Wangyel Peace Stupa Consecration & Daily Butter Lamp Prayers"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Link Target</label>
                              <input
                                type="text"
                                value={form.header_announcement_link || ''}
                                onChange={(e) => updateField('header_announcement_link', e.target.value)}
                                placeholder="/prayer-request"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Banner Visibility</label>
                              <select
                                value={form.header_announcement_on || 'true'}
                                onChange={(e) => updateField('header_announcement_on', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                              >
                                <option value="true">Enabled (Visible)</option>
                                <option value="false">Hidden (Disabled)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Header Action Call to Action
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Button Label</label>
                              <input
                                type="text"
                                value={form.header_cta_label || ''}
                                onChange={(e) => updateField('header_cta_label', e.target.value)}
                                placeholder="Offer Dana"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Destination URL</label>
                              <input
                                type="text"
                                value={form.header_cta_link || ''}
                                onChange={(e) => updateField('header_cta_link', e.target.value)}
                                placeholder="/donate"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Button Status</label>
                              <select
                                value={form.header_cta_on || 'true'}
                                onChange={(e) => updateField('header_cta_on', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                              >
                                <option value="true">Enabled (Visible)</option>
                                <option value="false">Hidden</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Secretariat Helpline Phone</label>
                            <input
                              type="text"
                              value={form.contact_phone || ''}
                              onChange={(e) => updateField('contact_phone', e.target.value)}
                              placeholder="+975 6 251 222"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Official Secretariat Email</label>
                            <input
                              type="email"
                              value={form.contact_email || ''}
                              onChange={(e) => updateField('contact_email', e.target.value)}
                              placeholder="secretariat@drodulphendeyling.bt"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECTION: FOOTER */}
                    {sectionKey === 'footer' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Configure all public footer settings: mandate summary, statutory tax exemption, Ashtamangala symbol accent bar, secretariat contact details, and newsletter dispatches.
                        </div>

                        {/* 1. Monastery Mandate & Blessing */}
                        <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            1. Monastic Mission & Inscription
                          </span>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Tibetan Ashtamangala Blessing Script
                            </label>
                            <input
                              type="text"
                              value={form.footer_tibetan_blessing || ''}
                              onChange={(e) => updateField('footer_tibetan_blessing', e.target.value)}
                              placeholder="༄༅། །བཀྲ་ཤིས་བདེ་ལེགས་ཕུན་སུམ་ཚོགས།"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-tibetan"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Foundation Mandate Summary Description
                            </label>
                            <textarea
                              rows={3}
                              value={form.footer_description || ''}
                              onChange={(e) => updateField('footer_description', e.target.value)}
                              placeholder="Registered Buddhist charitable foundation dedicated to constructing the 108ft Great Druk Wangyel Peace Stupa..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Copyright Notice
                            </label>
                            <input
                              type="text"
                              value={form.footer_copyright || ''}
                              onChange={(e) => updateField('footer_copyright', e.target.value)}
                              placeholder="© 2026 Drodul Phendey Ling Foundation · All Rights Reserved"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>

                        {/* 2. Statutory Charity & 80G Tax Exemption */}
                        <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            2. Statutory Charity Registration & 80G Tax Exemption
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Charity Badge Title
                              </label>
                              <input
                                type="text"
                                value={form.footer_charity_title || ''}
                                onChange={(e) => updateField('footer_charity_title', e.target.value)}
                                placeholder="Kingdom of Bhutan Registered Charity"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                ROB Registration & Tax Status
                              </label>
                              <input
                                type="text"
                                value={form.footer_charity_reg || ''}
                                onChange={(e) => updateField('footer_charity_reg', e.target.value)}
                                placeholder="ROB Reg: ROB/CP-04/2021 · 100% Tax Deductible"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Eight Auspicious Symbols (Ashtamangala) Accent Bar
                            </label>
                            <select
                              value={form.footer_show_ashtamangala || 'true'}
                              onChange={(e) => updateField('footer_show_ashtamangala', e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                            >
                              <option value="true">Visible (Display 8 Golden Auspicious Symbols ☸ 🪷 ♾ 🏺 🎏 🚩 ☂ 🐚)</option>
                              <option value="false">Hidden (Do not display accent bar)</option>
                            </select>
                          </div>
                        </div>

                        {/* 3. Dharma Dispatches Newsletter */}
                        <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            3. Dharma Dispatches Newsletter
                          </span>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Newsletter Section Title
                            </label>
                            <input
                              type="text"
                              value={form.footer_newsletter_title || ''}
                              onChange={(e) => updateField('footer_newsletter_title', e.target.value)}
                              placeholder="Dharma Dispatches"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Newsletter Description Subtext
                            </label>
                            <textarea
                              rows={2}
                              value={form.footer_newsletter_desc || ''}
                              onChange={(e) => updateField('footer_newsletter_desc', e.target.value)}
                              placeholder="Receive auspicious lunar calendar notices, puja live-stream links, and stupa construction reports directly in your inbox."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>

                        {/* 4. Secretariat Contact Details */}
                        <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            4. Official Secretariat Contact Info
                          </span>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Secretariat Campus Address
                            </label>
                            <input
                              type="text"
                              value={form.contact_address || ''}
                              onChange={(e) => updateField('contact_address', e.target.value)}
                              placeholder="Gelephu, Sarpang Dzongkhag, Bhutan"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Helpline Phone Number
                              </label>
                              <input
                                type="text"
                                value={form.contact_phone || ''}
                                onChange={(e) => updateField('contact_phone', e.target.value)}
                                placeholder="+975 17556559"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Official Email Address
                              </label>
                              <input
                                type="email"
                                value={form.contact_email || ''}
                                onChange={(e) => updateField('contact_email', e.target.value)}
                                placeholder="contact@drodulphendeyling.org"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECTION: CONTACT */}
                    {(sectionKey === 'contact' || sectionKey === 'contact-hero') && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan Eyebrow Inscription</label>
                          <input
                            type="text"
                            value={form.contact_hero_badge || ''}
                            onChange={(e) => updateField('contact_hero_badge', e.target.value)}
                            placeholder="༄༅། །འབྲེལ་གཏུགས་དང་ཞབས་ཞུ། · Sacred Connection"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-tibetan"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Contact Page Headline</label>
                          <input
                            type="text"
                            value={form.contact_hero_title || ''}
                            onChange={(e) => updateField('contact_hero_title', e.target.value)}
                            placeholder="Connect with Drodul Phendey Ling"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Contact Page Subtitle</label>
                          <textarea
                            rows={3}
                            value={form.contact_hero_subtitle || ''}
                            onChange={(e) => updateField('contact_hero_subtitle', e.target.value)}
                            placeholder="Whether you wish to sponsor stupa construction, request ceremonial monastic pujas, enroll in the Shedra academy..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </>
                    )}

                    {sectionKey === 'contact-seat' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Official Foundation Seat Name</label>
                          <input
                            type="text"
                            value={form.contact_seat_name || ''}
                            onChange={(e) => updateField('contact_seat_name', e.target.value)}
                            placeholder="Drodul Phendey Ling Monastic Foundation Secretariat"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Physical Campus Address</label>
                          <textarea
                            rows={2}
                            value={form.contact_seat_address || form.contact_address || ''}
                            onChange={(e) => {
                              updateField('contact_seat_address', e.target.value);
                              updateField('contact_address', e.target.value);
                            }}
                            placeholder="Great Druk Wangyel Peace Stupa Complex, Gelephu, Sarpang Dzongkhag, Kingdom of Bhutan"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Postal Box</label>
                            <input
                              type="text"
                              value={form.contact_seat_pobox || ''}
                              onChange={(e) => updateField('contact_seat_pobox', e.target.value)}
                              placeholder="P.O. Box 210, Gelephu Post Office"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">ROB Registration</label>
                            <input
                              type="text"
                              value={form.contact_seat_reg || ''}
                              onChange={(e) => updateField('contact_seat_reg', e.target.value)}
                              placeholder="ROB/2018/092"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {sectionKey === 'contact-dir' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">General Inquiries Phone</label>
                            <input
                              type="text"
                              value={form.contact_general_phone || form.contact_phone || ''}
                              onChange={(e) => {
                                updateField('contact_general_phone', e.target.value);
                                updateField('contact_phone', e.target.value);
                              }}
                              placeholder="+975 17556559"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">General Inquiries Email</label>
                            <input
                              type="email"
                              value={form.contact_general_email || form.contact_email || ''}
                              onChange={(e) => {
                                updateField('contact_general_email', e.target.value);
                                updateField('contact_email', e.target.value);
                              }}
                              placeholder="contact@drodulphendeyling.org"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Abbot Office Email</label>
                            <input
                              type="email"
                              value={form.contact_abbot_email || ''}
                              onChange={(e) => updateField('contact_abbot_email', e.target.value)}
                              placeholder="abbot@drodulphendeyling.org"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Stupa Dana Email</label>
                            <input
                              type="email"
                              value={form.contact_dana_email || ''}
                              onChange={(e) => updateField('contact_dana_email', e.target.value)}
                              placeholder="donations@drodulphendeyling.org"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {sectionKey === 'contact-visiting' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Weekday Visiting Hours</label>
                            <input
                              type="text"
                              value={form.contact_hours_weekdays || ''}
                              onChange={(e) => updateField('contact_hours_weekdays', e.target.value)}
                              placeholder="Mon - Sat: 08:00 AM - 05:00 PM BST"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Sunday Sanctuary Hours</label>
                            <input
                              type="text"
                              value={form.contact_hours_sunday || ''}
                              onChange={(e) => updateField('contact_hours_sunday', e.target.value)}
                              placeholder="Sunday: 09:00 AM - 01:00 PM"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Pilgrim Etiquette Notice</label>
                          <textarea
                            rows={2}
                            value={form.contact_visiting_notice || ''}
                            onChange={(e) => updateField('contact_visiting_notice', e.target.value)}
                            placeholder="Modest attire required within the stupa inner circumambulation courtyard..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION: SHEDRA HERO */}
                    {sectionKey === 'shedra-hero' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Shedra Hero Badge</label>
                          <input
                            type="text"
                            value={form.shedra_hero_badge || ''}
                            onChange={(e) => updateField('shedra_hero_badge', e.target.value)}
                            placeholder="Center for Advanced Buddhist Epistemology & Scholastic Studies"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Shedra Page Title</label>
                          <input
                            type="text"
                            value={form.shedra_hero_title || ''}
                            onChange={(e) => updateField('shedra_hero_title', e.target.value)}
                            placeholder="Drodul Phendey Ling Shedra Monastic Academy"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Shedra Lede Subtitle</label>
                          <textarea
                            rows={3}
                            value={form.shedra_hero_subtitle || ''}
                            onChange={(e) => updateField('shedra_hero_subtitle', e.target.value)}
                            placeholder="Rooted in the ancient Nalanda scholastic lineage of Bhutan..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: SHEDRA CURRICULUM */}
                    {sectionKey === 'shedra-curriculum' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Section Eyebrow</label>
                          <input
                            type="text"
                            value={form.shedra_shastras_badge || ''}
                            onChange={(e) => updateField('shedra_shastras_badge', e.target.value)}
                            placeholder="Scholastic Heritage"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                          <input
                            type="text"
                            value={form.shedra_shastras_title || ''}
                            onChange={(e) => updateField('shedra_shastras_title', e.target.value)}
                            placeholder="The Five Great Shastras"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Curriculum Summary</label>
                          <textarea
                            rows={2}
                            value={form.shedra_shastras_subtitle || ''}
                            onChange={(e) => updateField('shedra_shastras_subtitle', e.target.value)}
                            placeholder="Every monk scholar must master debate, textual translation..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: SHEDRA FACILITIES */}
                    {sectionKey === 'shedra-facilities' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Facilities Section Title</label>
                          <input
                            type="text"
                            value={form.shedra_fac_title || ''}
                            onChange={(e) => updateField('shedra_fac_title', e.target.value)}
                            placeholder="Monastic Campus & Sacred Architecture"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Facilities Summary</label>
                          <textarea
                            rows={2}
                            value={form.shedra_fac_desc || ''}
                            onChange={(e) => updateField('shedra_fac_desc', e.target.value)}
                            placeholder="Purpose-built traditional stone architecture housing modern classrooms..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: SHEDRA ADMISSIONS */}
                    {sectionKey === 'shedra-admissions' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Admissions Eyebrow Pill</label>
                          <input
                            type="text"
                            value={form.shedra_admit_pill || ''}
                            onChange={(e) => updateField('shedra_admit_pill', e.target.value)}
                            placeholder="Join the Academy"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Admissions Main Heading</label>
                          <input
                            type="text"
                            value={form.shedra_admit_title || ''}
                            onChange={(e) => updateField('shedra_admit_title', e.target.value)}
                            placeholder="Study Buddhist Dialectics & Epistemology"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Admissions Description</label>
                          <textarea
                            rows={2}
                            value={form.shedra_admit_desc || ''}
                            onChange={(e) => updateField('shedra_admit_desc', e.target.value)}
                            placeholder="Drodul Phendey Ling Shedra welcomes applications from ordained novice monks..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: PRAYERS HERO */}
                    {(sectionKey === 'prayer-hero' || sectionKey === 'prayer' || sectionKey === 'prayer-header') && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan Inscription / Eyebrow</label>
                          <input
                            type="text"
                            value={form.prayer_tibetan_eyebrow || ''}
                            onChange={(e) => updateField('prayer_tibetan_eyebrow', e.target.value)}
                            placeholder="༄༅། །མར་མེ་སྨོན་ལམ། • Consecrated Sangha Pujas & Butter Lamps"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-tibetan"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Prayers Page Heading</label>
                          <input
                            type="text"
                            value={form.prayer_hero_title || ''}
                            onChange={(e) => updateField('prayer_hero_title', e.target.value)}
                            placeholder="Sacred Prayer Dedication & Offerings"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Prayers Lede Subtitle</label>
                          <textarea
                            rows={3}
                            value={form.prayer_hero_subtitle || ''}
                            onChange={(e) => updateField('prayer_hero_subtitle', e.target.value)}
                            placeholder="Our resident monastic Sangha at Drodul Phendey Ling recites daily consecrated prayers..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: PRAYER LAMPS */}
                    {sectionKey === 'prayer-lamps' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Butter Lamps Badge</label>
                          <input
                            type="text"
                            value={form.prayer_lamp_badge || ''}
                            onChange={(e) => updateField('prayer_lamp_badge', e.target.value)}
                            placeholder="Altar Illuminations"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Section Heading</label>
                          <input
                            type="text"
                            value={form.prayer_lamp_title || ''}
                            onChange={(e) => updateField('prayer_lamp_title', e.target.value)}
                            placeholder="108 Sacred Butter Lamp Illuminations"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                      </>
                    )}

                    {/* SECTION: PRAYER PUJAS */}
                    {sectionKey === 'prayer-pujas' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Pujas Section Heading</label>
                        <input
                          type="text"
                          value={form.prayer_puja_heading || ''}
                          onChange={(e) => updateField('prayer_puja_heading', e.target.value)}
                          placeholder="Traditional Ceremonial Pujas Conducted"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>
                    )}

                    {/* SECTION: PRAYER SCHEDULE */}
                    {sectionKey === 'prayer-schedule' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Schedule Section Title</label>
                          <input
                            type="text"
                            value={form.prayer_schedule_title || ''}
                            onChange={(e) => updateField('prayer_schedule_title', e.target.value)}
                            placeholder="Daily Monastic Puja Timetable"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Schedule Summary</label>
                          <textarea
                            rows={2}
                            value={form.prayer_schedule_desc || ''}
                            onChange={(e) => updateField('prayer_schedule_desc', e.target.value)}
                            placeholder="Consecrated offerings are conducted at dawn and dusk..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Morning Session</label>
                            <input
                              type="text"
                              value={form.prayer_schedule_morning || ''}
                              onChange={(e) => updateField('prayer_schedule_morning', e.target.value)}
                              placeholder="05:30 AM - 07:30 AM: Morning Sang Offering"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Evening Session</label>
                            <input
                              type="text"
                              value={form.prayer_schedule_evening || ''}
                              onChange={(e) => updateField('prayer_schedule_evening', e.target.value)}
                              placeholder="05:00 PM - 07:00 PM: 108 Butter Lamps"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECTION: DHARMA LEARNING & LMS */}
                    {(sectionKey === 'learning' || sectionKey === 'learning-hero') && (
                      <div className="space-y-3.5">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Customize Dharma Learning headline, Tibetan inscription, and video course catalog intro.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Section Eyebrow Tag</label>
                            <input
                              type="text"
                              value={form.learning_hero_eyebrow || ''}
                              onChange={(e) => updateField('learning_hero_eyebrow', e.target.value)}
                              placeholder="SACRED DHARMA ARCHIVES & LMS"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan Sacred Title</label>
                            <input
                              type="text"
                              value={form.learning_hero_tibetan || ''}
                              onChange={(e) => updateField('learning_hero_tibetan', e.target.value)}
                              placeholder="ཆོས་ཀྱི་བཀའ་ཁྲིད།"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-serif"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Main Heading</label>
                          <input
                            type="text"
                            value={form.learning_hero_title || ''}
                            onChange={(e) => updateField('learning_hero_title', e.target.value)}
                            placeholder="Buddhist Teachings, Sutras & Sacred Audio-Visual Discourses"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle & Course Catalog Overview</label>
                          <textarea
                            rows={3}
                            value={form.learning_hero_subtitle || ''}
                            onChange={(e) => updateField('learning_hero_subtitle', e.target.value)}
                            placeholder="Explore foundational Buddhist philosophy, meditation guides, and traditional monastic chantings recorded directly at Drodul Phendey Ling Monastery."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION: BLOG & SACRED GAZETTE */}
                    {(sectionKey === 'blog' || sectionKey === 'blog-hero') && (
                      <div className="space-y-3.5">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Customize Monastery Blog, spiritual articles headline, and Gazette editorial text.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Section Eyebrow Tag</label>
                            <input
                              type="text"
                              value={form.blog_hero_eyebrow || ''}
                              onChange={(e) => updateField('blog_hero_eyebrow', e.target.value)}
                              placeholder="MONASTIC CHRONICLES & DHARMA WRITINGS"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan Sacred Title</label>
                            <input
                              type="text"
                              value={form.blog_hero_tibetan || ''}
                              onChange={(e) => updateField('blog_hero_tibetan', e.target.value)}
                              placeholder="དགོན་པའི་གནས་ཚུལ།"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-serif"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Main Heading</label>
                          <input
                            type="text"
                            value={form.blog_hero_title || ''}
                            onChange={(e) => updateField('blog_hero_title', e.target.value)}
                            placeholder="Sacred Gazette & Spiritual Reflections"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle & Introduction</label>
                          <textarea
                            rows={3}
                            value={form.blog_hero_subtitle || ''}
                            onChange={(e) => updateField('blog_hero_subtitle', e.target.value)}
                            placeholder="Essays, abbot dharma discourses, and historical accounts from our monastic lineage."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION: NEWS & EVENTS */}
                    {(sectionKey === 'news' || sectionKey === 'news-hero') && (
                      <div className="space-y-3.5">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Customize Ceremonies, auspicious feast days, and official news announcements.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Section Eyebrow Tag</label>
                            <input
                              type="text"
                              value={form.news_hero_eyebrow || ''}
                              onChange={(e) => updateField('news_hero_eyebrow', e.target.value)}
                              placeholder="SACRED FEAST DAYS & GATHERINGS"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan Sacred Title</label>
                            <input
                              type="text"
                              value={form.news_hero_tibetan || ''}
                              onChange={(e) => updateField('news_hero_tibetan', e.target.value)}
                              placeholder="དུས་ཆེན་དང་མཛད་སྒོ།"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-serif"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Main Heading</label>
                          <input
                            type="text"
                            value={form.news_hero_title || ''}
                            onChange={(e) => updateField('news_hero_title', e.target.value)}
                            placeholder="Monastic Ceremonies, Pujas & Official Gazette"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle & Intro</label>
                          <textarea
                            rows={3}
                            value={form.news_hero_subtitle || ''}
                            onChange={(e) => updateField('news_hero_subtitle', e.target.value)}
                            placeholder="Stay informed about upcoming lunar calendar pujas, annual Drubchen retreats, and consecrations."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION: SACRED GALLERY */}
                    {(sectionKey === 'gallery' || sectionKey === 'gallery-hero') && (
                      <div className="space-y-3.5">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Customize Sacred Gallery headlines, photographic archival descriptions, and category tags.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Section Eyebrow Tag</label>
                            <input
                              type="text"
                              value={form.gallery_hero_eyebrow || ''}
                              onChange={(e) => updateField('gallery_hero_eyebrow', e.target.value)}
                              placeholder="SACRED VISUAL ARCHIVES"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan Sacred Title</label>
                            <input
                              type="text"
                              value={form.gallery_hero_tibetan || ''}
                              onChange={(e) => updateField('gallery_hero_tibetan', e.target.value)}
                              placeholder="སྐུ་པར་མཛོད་ཁང་།"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-serif"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Main Heading</label>
                          <input
                            type="text"
                            value={form.gallery_hero_title || ''}
                            onChange={(e) => updateField('gallery_hero_title', e.target.value)}
                            placeholder="Sacred Photographs, Shrine Consecrations & Monastic Life"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle & Introduction</label>
                          <textarea
                            rows={3}
                            value={form.gallery_hero_subtitle || ''}
                            onChange={(e) => updateField('gallery_hero_subtitle', e.target.value)}
                            placeholder="A visual journey across our sacred monastery, Abbot blessings, Stupa construction, and daily monastic disciplines."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION: DONATE PRESETS & TIERS */}
                    {sectionKey === 'donate-presets' && (
                      <div className="space-y-3.5">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Configure donation tier presets and offering dedications.
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Section Heading</label>
                          <input
                            type="text"
                            value={form.donate_presets_title || ''}
                            onChange={(e) => updateField('donate_presets_title', e.target.value)}
                            placeholder="Sacred Offering Tiers & Generosity Presets"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Offering Rationale</label>
                          <textarea
                            rows={2}
                            value={form.donate_presets_subtitle || ''}
                            onChange={(e) => updateField('donate_presets_subtitle', e.target.value)}
                            placeholder="Choose an auspicious offering amount to support monastic Sangha food, medicine, and Stupa construction."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Merit Dedication Notice</label>
                          <input
                            type="text"
                            value={form.donate_presets_merit_note || ''}
                            onChange={(e) => updateField('donate_presets_merit_note', e.target.value)}
                            placeholder="All offerings are dedicated daily in perpetual Sangha prayers."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION: BANKING & UPI REMITTANCE */}
                    {sectionKey === 'banking' && (
                      <div className="space-y-3.5">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Direct Bank Wire and UPI Remittance details displayed on public donation portal.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                            <input
                              type="text"
                              value={form.donate_bank_title || ''}
                              onChange={(e) => updateField('donate_bank_title', e.target.value)}
                              placeholder="Direct Bank Wire & Electronic Remittance"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                            <input
                              type="text"
                              value={form.bank_name || ''}
                              onChange={(e) => updateField('bank_name', e.target.value)}
                              placeholder="Bank of Bhutan (BoB)"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Beneficiary Account Name</label>
                            <input
                              type="text"
                              value={form.bank_account_name || ''}
                              onChange={(e) => updateField('bank_account_name', e.target.value)}
                              placeholder="Drodul Phendey Ling Foundation"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                            <input
                              type="text"
                              value={form.bank_account_no || ''}
                              onChange={(e) => updateField('bank_account_no', e.target.value)}
                              placeholder="202888999123"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
                            <input
                              type="text"
                              value={form.bank_ifsc || ''}
                              onChange={(e) => updateField('bank_ifsc', e.target.value)}
                              placeholder="BOBT0000101"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">SWIFT / BIC Code</label>
                            <input
                              type="text"
                              value={form.bank_swift_code || ''}
                              onChange={(e) => updateField('bank_swift_code', e.target.value)}
                              placeholder="BOBTBT22"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">UPI ID (VPA)</label>
                            <input
                              type="text"
                              value={form.bank_upi_id || ''}
                              onChange={(e) => updateField('bank_upi_id', e.target.value)}
                              placeholder="drodul@bob"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Bank Branch Address</label>
                          <input
                            type="text"
                            value={form.bank_branch || ''}
                            onChange={(e) => updateField('bank_branch', e.target.value)}
                            placeholder="Gelephu Main Branch, Sarpang Dzongkhag, Bhutan"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION: 80G TAX EXEMPTION & GOVERNANCE */}
                    {sectionKey === 'tax' && (
                      <div className="space-y-3.5">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Configure 80G Tax Exemption, Income Tax Act clause, and receipt certification policies.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                            <input
                              type="text"
                              value={form.tax_exempt_title || ''}
                              onChange={(e) => updateField('tax_exempt_title', e.target.value)}
                              placeholder="80G Tax Exemption & Statutory Governance"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">80G Registration / Order Number</label>
                            <input
                              type="text"
                              value={form.tax_exempt_reg || ''}
                              onChange={(e) => updateField('tax_exempt_reg', e.target.value)}
                              placeholder="ROB/CH-048/2021"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Income Tax Act Clause</label>
                            <input
                              type="text"
                              value={form.tax_exempt_clause || ''}
                              onChange={(e) => updateField('tax_exempt_clause', e.target.value)}
                              placeholder="Section 80G(5)(vi) / Religious Organization Exemption"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Exemption Percentage</label>
                            <input
                              type="text"
                              value={form.tax_exempt_percent || ''}
                              onChange={(e) => updateField('tax_exempt_percent', e.target.value)}
                              placeholder="50% Deduction for Eligible Donors"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Issuing Authority</label>
                          <input
                            type="text"
                            value={form.tax_exempt_authority || ''}
                            onChange={(e) => updateField('tax_exempt_authority', e.target.value)}
                            placeholder="Commission for Religious Organizations (CRO), Royal Government of Bhutan"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Issuance Timeline</label>
                            <input
                              type="text"
                              value={form.tax_exempt_timeline || ''}
                              onChange={(e) => updateField('tax_exempt_timeline', e.target.value)}
                              placeholder="Official 80G tax receipt dispatched via email within 24 hours"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Tax Inquiries Email</label>
                            <input
                              type="email"
                              value={form.tax_exempt_email || ''}
                              onChange={(e) => updateField('tax_exempt_email', e.target.value)}
                              placeholder="treasury@drodulphendeyling.bt"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECTION: STATUTORY TRUST & GOVERNANCE */}
                    {sectionKey === 'statutory' && (
                      <div className="space-y-3.5">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Trust deed registration, NPO compliance, and governance summary.
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                          <input
                            type="text"
                            value={form.about_statutory_title || ''}
                            onChange={(e) => updateField('about_statutory_title', e.target.value)}
                            placeholder="Statutory Trust & Legal Transparency"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Trust Registration Number</label>
                            <input
                              type="text"
                              value={form.tax_exempt_reg || ''}
                              onChange={(e) => updateField('tax_exempt_reg', e.target.value)}
                              placeholder="ROB/CH-048/2021"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">FCRA Foreign Inflow Compliance</label>
                            <input
                              type="text"
                              value={form.about_statutory_fcra || ''}
                              onChange={(e) => updateField('about_statutory_fcra', e.target.value)}
                              placeholder="Registered for Overseas Wire Donations"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Trust Governance Summary</label>
                          <textarea
                            rows={3}
                            value={form.about_statutory_summary || ''}
                            onChange={(e) => updateField('about_statutory_summary', e.target.value)}
                            placeholder="Drodul Phendey Ling is governed by an independent Board of Trustees and Abbot Council, audited annually by certified chartered accountants."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION: THREE SACRED PILLARS */}
                    {sectionKey === 'about-pillars' && (
                      <div className="space-y-3.5">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Configure Three Pillars of Monastery Mandate (Dharma, Sangha, Humanitarian Aid).
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                            <input
                              type="text"
                              value={form.about_pillars_title || ''}
                              onChange={(e) => updateField('about_pillars_title', e.target.value)}
                              placeholder="Three Sacred Pillars of Our Mandate"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan Subtitle</label>
                            <input
                              type="text"
                              value={form.about_pillars_tibetan || ''}
                              onChange={(e) => updateField('about_pillars_tibetan', e.target.value)}
                              placeholder="དམ་ཆོས་འཛིན་སྐྱོང་།"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-serif"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Pillars Narrative Overview</label>
                          <textarea
                            rows={2}
                            value={form.about_pillars_intro || ''}
                            onChange={(e) => updateField('about_pillars_intro', e.target.value)}
                            placeholder="Our mission embodies authentic Buddhist preservation, monastic university scholarship, and compassionate outreach."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION: SOCIAL MEDIA CHANNELS */}
                    {sectionKey === 'social' && (
                      <div className="space-y-3.5">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Configure public social media portals, YouTube live stream, and WhatsApp Sangha hotline.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Page URL</label>
                            <input
                              type="text"
                              value={form.social_facebook || ''}
                              onChange={(e) => updateField('social_facebook', e.target.value)}
                              placeholder="https://facebook.com/drodulphendeyling"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">YouTube Channel URL</label>
                            <input
                              type="text"
                              value={form.social_youtube || ''}
                              onChange={(e) => updateField('social_youtube', e.target.value)}
                              placeholder="https://youtube.com/@drodulphendeyling"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Instagram URL</label>
                            <input
                              type="text"
                              value={form.social_instagram || ''}
                              onChange={(e) => updateField('social_instagram', e.target.value)}
                              placeholder="https://instagram.com/drodulphendeyling"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Twitter / X URL</label>
                            <input
                              type="text"
                              value={form.social_twitter || ''}
                              onChange={(e) => updateField('social_twitter', e.target.value)}
                              placeholder="https://x.com/drodulphendey"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Sangha Helpline</label>
                            <input
                              type="text"
                              value={form.social_whatsapp || ''}
                              onChange={(e) => updateField('social_whatsapp', e.target.value)}
                              placeholder="+97517112233"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* SUB-TAB 2: BUTTONS & CTAs                            */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'ACTIONS' && (
                  <div className="space-y-4">
                    {sectionKey === 'hero' && (
                      <>
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Configure primary and secondary CTA buttons shown in the hero banner.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Primary Button</span>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Button Label</label>
                              <input
                                type="text"
                                value={form.home_hero_cta_text || ''}
                                onChange={(e) => updateField('home_hero_cta_text', e.target.value)}
                                placeholder="OFFER DANA / DONATE"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Button Link</label>
                              <input
                                type="text"
                                value={form.home_hero_cta_link || ''}
                                onChange={(e) => updateField('home_hero_cta_link', e.target.value)}
                                placeholder="/donate"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Secondary Button</span>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Button Label</label>
                              <input
                                type="text"
                                value={form.home_hero_cta2_text || ''}
                                onChange={(e) => updateField('home_hero_cta2_text', e.target.value)}
                                placeholder="DISCOVER SACRED MANDATE"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Button Link</label>
                              <input
                                type="text"
                                value={form.home_hero_cta2_link || ''}
                                onChange={(e) => updateField('home_hero_cta2_link', e.target.value)}
                                placeholder="/about"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {sectionKey === 'campaigns' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">View All Button Label</label>
                          <input
                            type="text"
                            value={form.campaigns_cta_text || ''}
                            onChange={(e) => updateField('campaigns_cta_text', e.target.value)}
                            placeholder="View All Causes"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">View All Link Target</label>
                          <input
                            type="text"
                            value={form.campaigns_cta_link || ''}
                            onChange={(e) => updateField('campaigns_cta_link', e.target.value)}
                            placeholder="/donate"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {sectionKey === 'documentary' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Primary Button Label</label>
                          <input
                            type="text"
                            value={form.doc_cta1_text || ''}
                            onChange={(e) => updateField('doc_cta1_text', e.target.value)}
                            placeholder="WATCH FULL FILM"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Button Label</label>
                          <input
                            type="text"
                            value={form.doc_cta2_text || ''}
                            onChange={(e) => updateField('doc_cta2_text', e.target.value)}
                            placeholder="PHOTO ARCHIVES"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {(sectionKey === 'prayers' || sectionKey === 'prayer') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">CTA Button Text</label>
                          <input
                            type="text"
                            value={form.home_prayers_cta_text || ''}
                            onChange={(e) => updateField('home_prayers_cta_text', e.target.value)}
                            placeholder="OFFER BUTTER LAMPS NOW"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">CTA Destination Link</label>
                          <input
                            type="text"
                            value={form.home_prayers_cta_link || ''}
                            onChange={(e) => updateField('home_prayers_cta_link', e.target.value)}
                            placeholder="/prayer-request"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {sectionKey === 'leadership' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">CTA Button Text</label>
                          <input
                            type="text"
                            value={form.about_leader_cta_text || ''}
                            onChange={(e) => updateField('about_leader_cta_text', e.target.value)}
                            placeholder="Contact Abbot Office"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">CTA Destination Link</label>
                          <input
                            type="text"
                            value={form.about_leader_cta_link || ''}
                            onChange={(e) => updateField('about_leader_cta_link', e.target.value)}
                            placeholder="/contact"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION: FOOTER ACTIONS & NAVIGATION */}
                    {sectionKey === 'footer' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Manage footer navigation columns and public legal links.
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Dynamic Footer Program Columns
                          </span>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            The footer displays dynamic column menus (Sacred Programs, Devotee Portals, etc.) managed centrally in the Navigation Studio.
                          </p>
                          <Link
                            to="/admin/navigation"
                            onClick={onClose}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#721C24] hover:bg-[#8B2E24] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            <span>Open Navigation Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Legal & Policy Link Targets
                          </span>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Privacy Policy Link Target</label>
                            <input
                              type="text"
                              value={form.footer_privacy_url || ''}
                              onChange={(e) => updateField('footer_privacy_url', e.target.value)}
                              placeholder="/about"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Terms of Dana Link Target</label>
                            <input
                              type="text"
                              value={form.footer_terms_url || ''}
                              onChange={(e) => updateField('footer_terms_url', e.target.value)}
                              placeholder="/about"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Office Link Target</label>
                            <input
                              type="text"
                              value={form.footer_contact_url || ''}
                              onChange={(e) => updateField('footer_contact_url', e.target.value)}
                              placeholder="/contact"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECTION: HEADER / NAVBAR ACTIONS */}
                    {(sectionKey === 'header' || sectionKey === 'navbar') && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Navigation Menus & Public Pages
                          </span>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Organize all dropdown menus, reorder links, or add new navigation routes in Navigation Studio.
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <Link
                              to="/admin/navigation"
                              onClick={onClose}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#721C24] hover:bg-[#8B2E24] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                            >
                              <span>Open Navigation Studio</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              to="/admin/pages"
                              onClick={onClose}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                            >
                              <span>All Pages Directory</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECTION: DHARMA LEARNING ACTIONS */}
                    {(sectionKey === 'learning' || sectionKey === 'learning-hero') && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Catalog Action Button Label</label>
                            <input
                              type="text"
                              value={form.learning_cta_label || ''}
                              onChange={(e) => updateField('learning_cta_label', e.target.value)}
                              placeholder="Explore Video Teachings"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Button Link Destination</label>
                            <input
                              type="text"
                              value={form.learning_cta_url || ''}
                              onChange={(e) => updateField('learning_cta_url', e.target.value)}
                              placeholder="/learning#catalog"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Manage Learning Videos</span>
                            <span className="text-[11px] text-slate-500">Upload and organize Dharma lectures in Learning Studio</span>
                          </div>
                          <Link
                            to="/admin/learning"
                            onClick={onClose}
                            className="px-3 py-1.5 rounded-lg bg-[#721C24] text-white text-xs font-bold hover:bg-[#8B2E24] transition-colors inline-flex items-center gap-1 flex-shrink-0"
                          >
                            <span>Open LMS Studio</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* SECTION: BLOG ACTIONS */}
                    {(sectionKey === 'blog' || sectionKey === 'blog-hero') && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Read Teachings Button Label</label>
                            <input
                              type="text"
                              value={form.blog_cta_label || ''}
                              onChange={(e) => updateField('blog_cta_label', e.target.value)}
                              placeholder="Browse Spiritual Gazette"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Button Link Destination</label>
                            <input
                              type="text"
                              value={form.blog_cta_url || ''}
                              onChange={(e) => updateField('blog_cta_url', e.target.value)}
                              placeholder="/blog#articles"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Manage Monastery Blog</span>
                            <span className="text-[11px] text-slate-500">Write, publish, and edit spiritual articles in Blog Studio</span>
                          </div>
                          <Link
                            to="/admin/blog"
                            onClick={onClose}
                            className="px-3 py-1.5 rounded-lg bg-[#721C24] text-white text-xs font-bold hover:bg-[#8B2E24] transition-colors inline-flex items-center gap-1 flex-shrink-0"
                          >
                            <span>Open Blog Studio</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* SECTION: NEWS & EVENTS ACTIONS */}
                    {(sectionKey === 'news' || sectionKey === 'news-hero') && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Ceremonies CTA Button Label</label>
                            <input
                              type="text"
                              value={form.news_cta_label || ''}
                              onChange={(e) => updateField('news_cta_label', e.target.value)}
                              placeholder="View Consecration Calendar"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Button Link Destination</label>
                            <input
                              type="text"
                              value={form.news_cta_url || ''}
                              onChange={(e) => updateField('news_cta_url', e.target.value)}
                              placeholder="/news-events#calendar"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Manage Ceremonies & Events</span>
                            <span className="text-[11px] text-slate-500">Schedule pujas, Drubchen retreats, and RSVP rosters</span>
                          </div>
                          <Link
                            to="/admin/prayer-requests?tab=news"
                            onClick={onClose}
                            className="px-3 py-1.5 rounded-lg bg-[#721C24] text-white text-xs font-bold hover:bg-[#8B2E24] transition-colors inline-flex items-center gap-1 flex-shrink-0"
                          >
                            <span>Ceremonies Desk</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* SECTION: SACRED GALLERY ACTIONS */}
                    {(sectionKey === 'gallery' || sectionKey === 'gallery-hero') && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Archives Button Label</label>
                            <input
                              type="text"
                              value={form.gallery_cta_label || ''}
                              onChange={(e) => updateField('gallery_cta_label', e.target.value)}
                              placeholder="View Photo Archive"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Button Link Destination</label>
                            <input
                              type="text"
                              value={form.gallery_cta_url || ''}
                              onChange={(e) => updateField('gallery_cta_url', e.target.value)}
                              placeholder="/gallery#photos"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Upload Sacred Photos</span>
                            <span className="text-[11px] text-slate-500">Upload high-resolution monastic photography into Gallery Studio</span>
                          </div>
                          <Link
                            to="/admin/gallery"
                            onClick={onClose}
                            className="px-3 py-1.5 rounded-lg bg-[#721C24] text-white text-xs font-bold hover:bg-[#8B2E24] transition-colors inline-flex items-center gap-1 flex-shrink-0"
                          >
                            <span>Gallery Studio</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* SUB-TAB 3: MEDIA & VISUALS                           */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'MEDIA' && (
                  <div className="space-y-4">
                    {/* Hero Background Image */}
                    {sectionKey === 'hero' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">Hero Background Banner Image</label>
                        {form.home_hero_image && (
                          <div className="relative rounded-xl overflow-hidden aspect-video max-h-48 border border-slate-200 bg-slate-900">
                            <img
                              src={form.home_hero_image}
                              alt="Hero preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.home_hero_image || ''}
                            onChange={(e) => updateField('home_hero_image', e.target.value)}
                            placeholder="https://... or /uploads/..."
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0 transition-colors">
                            <UploadCloud className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'home_hero_image')}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Documentary Poster & Video */}
                    {sectionKey === 'documentary' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Video Streaming / Embed URL</label>
                          <input
                            type="text"
                            value={form.doc_video_url || ''}
                            onChange={(e) => updateField('doc_video_url', e.target.value)}
                            placeholder="https://www.youtube.com/embed/... or .mp4"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Video Duration Badge</label>
                          <input
                            type="text"
                            value={form.doc_duration || ''}
                            onChange={(e) => updateField('doc_duration', e.target.value)}
                            placeholder="8:24 mins"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Documentary Poster Cover Image</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={form.doc_poster_image || ''}
                              onChange={(e) => updateField('doc_poster_image', e.target.value)}
                              placeholder="https://... or /uploads/..."
                              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                            <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0">
                              <UploadCloud className="w-4 h-4" />
                              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'doc_poster_image')}
                                className="hidden"
                                disabled={uploading}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Leadership Portrait */}
                    {sectionKey === 'leadership' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">Abbot Portrait Photo</label>
                        {form.about_leader_image && (
                          <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-[#D4AF37] bg-slate-900">
                            <img
                              src={form.about_leader_image}
                              alt="Abbot preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.about_leader_image || ''}
                            onChange={(e) => updateField('about_leader_image', e.target.value)}
                            placeholder="https://... or /uploads/..."
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0">
                            <UploadCloud className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'about_leader_image')}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Donate Hero Image */}
                    {(sectionKey === 'donate-hero' || sectionKey === 'donate') && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">Donation Page Banner Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.donate_hero_image || ''}
                            onChange={(e) => updateField('donate_hero_image', e.target.value)}
                            placeholder="https://... or /uploads/..."
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0">
                            <UploadCloud className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'donate_hero_image')}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Learning Banner Image */}
                    {(sectionKey === 'learning' || sectionKey === 'learning-hero') && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">Dharma LMS Hero Banner Image</label>
                        {form.learning_hero_image && (
                          <div className="relative rounded-xl overflow-hidden aspect-video max-h-48 border border-slate-200 bg-slate-900">
                            <img
                              src={form.learning_hero_image}
                              alt="Learning Banner"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.learning_hero_image || ''}
                            onChange={(e) => updateField('learning_hero_image', e.target.value)}
                            placeholder="https://... or /uploads/..."
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0 transition-colors">
                            <UploadCloud className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'learning_hero_image')}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Blog Banner Image */}
                    {(sectionKey === 'blog' || sectionKey === 'blog-hero') && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">Gazette Hero Banner Image</label>
                        {form.blog_hero_image && (
                          <div className="relative rounded-xl overflow-hidden aspect-video max-h-48 border border-slate-200 bg-slate-900">
                            <img
                              src={form.blog_hero_image}
                              alt="Blog Banner"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.blog_hero_image || ''}
                            onChange={(e) => updateField('blog_hero_image', e.target.value)}
                            placeholder="https://... or /uploads/..."
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0 transition-colors">
                            <UploadCloud className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'blog_hero_image')}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* News Banner Image */}
                    {(sectionKey === 'news' || sectionKey === 'news-hero') && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">Ceremonies Hero Banner Image</label>
                        {form.news_hero_image && (
                          <div className="relative rounded-xl overflow-hidden aspect-video max-h-48 border border-slate-200 bg-slate-900">
                            <img
                              src={form.news_hero_image}
                              alt="News Banner"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.news_hero_image || ''}
                            onChange={(e) => updateField('news_hero_image', e.target.value)}
                            placeholder="https://... or /uploads/..."
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0 transition-colors">
                            <UploadCloud className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'news_hero_image')}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Gallery Banner Image */}
                    {(sectionKey === 'gallery' || sectionKey === 'gallery-hero') && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">Gallery Hero Banner Image</label>
                        {form.gallery_hero_image && (
                          <div className="relative rounded-xl overflow-hidden aspect-video max-h-48 border border-slate-200 bg-slate-900">
                            <img
                              src={form.gallery_hero_image}
                              alt="Gallery Banner"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.gallery_hero_image || ''}
                            onChange={(e) => updateField('gallery_hero_image', e.target.value)}
                            placeholder="https://... or /uploads/..."
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0 transition-colors">
                            <UploadCloud className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'gallery_hero_image')}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Banking UPI QR Code */}
                    {sectionKey === 'banking' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">Official UPI Payment QR Code Image</label>
                        {form.bank_qr_image && (
                          <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-[#D4AF37] bg-white p-2 flex items-center justify-center">
                            <img
                              src={form.bank_qr_image}
                              alt="Bank QR Code"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.bank_qr_image || ''}
                            onChange={(e) => updateField('bank_qr_image', e.target.value)}
                            placeholder="https://... or /uploads/..."
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0 transition-colors">
                            <UploadCloud className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'bank_qr_image')}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* SUB-TAB 4: STATS & CARDS                             */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'CARDS' && (
                  <div className="space-y-4">
                    {/* STATS SECTION: 4 COUNTERS */}
                    {sectionKey === 'stats' && (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((idx) => (
                          <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Stat #{idx} Number/Metric
                              </label>
                              <input
                                type="text"
                                value={form[`stat${idx}_num`] || ''}
                                onChange={(e) => updateField(`stat${idx}_num`, e.target.value)}
                                placeholder={idx === 1 ? '108 Ft' : idx === 2 ? '350+' : idx === 3 ? '100k+' : '40+ Nations'}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Stat #{idx} Label
                              </label>
                              <input
                                type="text"
                                value={form[`stat${idx}_label`] || ''}
                                onChange={(e) => updateField(`stat${idx}_label`, e.target.value)}
                                placeholder={idx === 1 ? 'Monumental Stupa' : idx === 2 ? 'Monastic Scholars' : idx === 3 ? 'Consecrated Prayers' : 'Global Patronage'}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Stat #{idx} Sub-Caption
                              </label>
                              <input
                                type="text"
                                value={form[`stat${idx}_sub`] || ''}
                                onChange={(e) => updateField(`stat${idx}_sub`, e.target.value)}
                                placeholder={idx === 1 ? 'Gelephu, Bhutan' : idx === 2 ? 'Shedra university scholars' : idx === 3 ? 'Sacred butter lamps' : 'International devotees'}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* PILLARS: 4 SACRED PILLARS */}
                    {sectionKey === 'pillars' && (
                      <div className="space-y-4">
                        {[
                          { id: 1, name: 'Pillar 1 (World Peace Stupa)' },
                          { id: 2, name: 'Pillar 2 (Shedra Monastic Institute)' },
                          { id: 3, name: 'Pillar 3 (Consecrated Prayers & Pujas)' },
                          { id: 4, name: 'Pillar 4 (Digital Dharma & Texts)' }
                        ].map((p) => (
                          <div key={p.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">{p.name}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={form[`home_pillar${p.id}_title`] || ''}
                                onChange={(e) => updateField(`home_pillar${p.id}_title`, e.target.value)}
                                placeholder="Title"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold"
                              />
                              <input
                                type="text"
                                value={form[`home_pillar${p.id}_badge`] || ''}
                                onChange={(e) => updateField(`home_pillar${p.id}_badge`, e.target.value)}
                                placeholder="Pill / Badge"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>
                            <textarea
                              rows={2}
                              value={form[`home_pillar${p.id}_desc`] || ''}
                              onChange={(e) => updateField(`home_pillar${p.id}_desc`, e.target.value)}
                              placeholder="Description"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ABOUT PILLARS: 3 PILLARS */}
                    {(sectionKey === 'about-pillars' || sectionKey === 'about') && (
                      <div className="space-y-4">
                        {[1, 2, 3].map((idx) => (
                          <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-800">Core Pillar #{idx}</label>
                            <input
                              type="text"
                              value={form[`about_pillar_${idx}_title`] || ''}
                              onChange={(e) => updateField(`about_pillar_${idx}_title`, e.target.value)}
                              placeholder={`Pillar ${idx} Title`}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold"
                            />
                            <textarea
                              rows={2}
                              value={form[`about_pillar_${idx}_desc`] || ''}
                              onChange={(e) => updateField(`about_pillar_${idx}_desc`, e.target.value)}
                              placeholder={`Pillar ${idx} Description`}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* BANKING WIRE DETAILS */}
                    {sectionKey === 'banking' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">Bank Name</label>
                            <input
                              type="text"
                              value={form.bank_name || ''}
                              onChange={(e) => updateField('bank_name', e.target.value)}
                              placeholder="Bank of Bhutan (BoB)"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">Beneficiary Account Name</label>
                            <input
                              type="text"
                              value={form.bank_account_name || ''}
                              onChange={(e) => updateField('bank_account_name', e.target.value)}
                              placeholder="Drodul Phendey Ling Foundation"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">Account Number</label>
                            <input
                              type="text"
                              value={form.bank_account_no || ''}
                              onChange={(e) => updateField('bank_account_no', e.target.value)}
                              placeholder="202888999123"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">SWIFT Code</label>
                            <input
                              type="text"
                              value={form.bank_swift_code || ''}
                              onChange={(e) => updateField('bank_swift_code', e.target.value)}
                              placeholder="BOBTBT22"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Branch Name</label>
                          <input
                            type="text"
                            value={form.bank_branch || ''}
                            onChange={(e) => updateField('bank_branch', e.target.value)}
                            placeholder="Gelephu Main Branch, Bhutan"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* STATUTORY TRUST & 80G */}
                    {sectionKey === 'statutory' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">ROB Registration No</label>
                            <input
                              type="text"
                              value={form.tax_exempt_reg || ''}
                              onChange={(e) => updateField('tax_exempt_reg', e.target.value)}
                              placeholder="ROB-2024-089"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">80G Tax Exemption Order No</label>
                            <input
                              type="text"
                              value={form.tax_80g_order_no || ''}
                              onChange={(e) => updateField('tax_80g_order_no', e.target.value)}
                              placeholder="CIT(E)/80G/2024-25/A-108"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SHEDRA: 5 GREAT SHASTRAS */}
                    {sectionKey === 'shedra-curriculum' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-xs font-bold text-[#721C24]">Shastra 1: Madhyamaka (Middle Way)</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={form.shastra1_title || ''}
                              onChange={(e) => updateField('shastra1_title', e.target.value)}
                              placeholder="Title"
                              className="text-xs p-2 rounded-lg border border-slate-200 font-bold"
                            />
                            <input
                              type="text"
                              value={form.shastra1_years || ''}
                              onChange={(e) => updateField('shastra1_years', e.target.value)}
                              placeholder="Years (e.g. Years 4 - 6)"
                              className="text-xs p-2 rounded-lg border border-slate-200 font-mono"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={form.shastra1_desc || ''}
                            onChange={(e) => updateField('shastra1_desc', e.target.value)}
                            placeholder="Description"
                            className="w-full text-xs p-2 rounded-lg border border-slate-200"
                          />
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-xs font-bold text-[#721C24]">Shastra 2: Prajnaparamita (Wisdom)</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={form.shastra2_title || ''}
                              onChange={(e) => updateField('shastra2_title', e.target.value)}
                              placeholder="Title"
                              className="text-xs p-2 rounded-lg border border-slate-200 font-bold"
                            />
                            <input
                              type="text"
                              value={form.shastra2_years || ''}
                              onChange={(e) => updateField('shastra2_years', e.target.value)}
                              placeholder="Years"
                              className="text-xs p-2 rounded-lg border border-slate-200 font-mono"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={form.shastra2_desc || ''}
                            onChange={(e) => updateField('shastra2_desc', e.target.value)}
                            placeholder="Description"
                            className="w-full text-xs p-2 rounded-lg border border-slate-200"
                          />
                        </div>
                      </div>
                    )}

                    {/* SHEDRA: CAMPUS FACILITIES */}
                    {sectionKey === 'shedra-facilities' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <label className="text-xs font-bold text-slate-800">Facility 1: Debate Courtyard</label>
                          <input
                            type="text"
                            value={form.shedra_fac_1_title || ''}
                            onChange={(e) => updateField('shedra_fac_1_title', e.target.value)}
                            placeholder="Stone Debate Courtyard"
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 font-bold"
                          />
                          <textarea
                            rows={2}
                            value={form.shedra_fac_1_desc || ''}
                            onChange={(e) => updateField('shedra_fac_1_desc', e.target.value)}
                            placeholder="Open-air terrace where monks assemble daily..."
                            className="w-full text-xs p-2 rounded-lg border border-slate-200"
                          />
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <label className="text-xs font-bold text-slate-800">Facility 2: Scriptorium Library</label>
                          <input
                            type="text"
                            value={form.shedra_fac_2_title || ''}
                            onChange={(e) => updateField('shedra_fac_2_title', e.target.value)}
                            placeholder="Pecha Library"
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 font-bold"
                          />
                          <textarea
                            rows={2}
                            value={form.shedra_fac_2_desc || ''}
                            onChange={(e) => updateField('shedra_fac_2_desc', e.target.value)}
                            placeholder="Houses rare woodblock pechas..."
                            className="w-full text-xs p-2 rounded-lg border border-slate-200"
                          />
                        </div>
                      </div>
                    )}

                    {/* SHEDRA: ADMISSIONS BENEFITS */}
                    {sectionKey === 'shedra-admissions' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-800">Monastic Scholarship Benefits</label>
                        <input
                          type="text"
                          value={form.shedra_benefit_1 || ''}
                          onChange={(e) => updateField('shedra_benefit_1', e.target.value)}
                          placeholder="Benefit 1: Full monastic scholarship, boarding, meals"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200"
                        />
                        <input
                          type="text"
                          value={form.shedra_benefit_2 || ''}
                          onChange={(e) => updateField('shedra_benefit_2', e.target.value)}
                          placeholder="Benefit 2: Degrees recognized under Monastic Council"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200"
                        />
                        <input
                          type="text"
                          value={form.shedra_benefit_3 || ''}
                          onChange={(e) => updateField('shedra_benefit_3', e.target.value)}
                          placeholder="Benefit 3: Daily debate practice in courtyards"
                          className="w-full text-xs p-2 rounded-lg border border-slate-200"
                        />
                      </div>
                    )}

                    {/* PRAYERS: 108 BUTTER LAMP TIERS */}
                    {sectionKey === 'prayer-lamps' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold">Tier 1 Lamps</label>
                            <input
                              type="number"
                              value={form.prayer_tier_1_count || 21}
                              onChange={(e) => updateField('prayer_tier_1_count', Number(e.target.value))}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold">Tier 1 Offering (BTN)</label>
                            <input
                              type="number"
                              value={form.prayer_tier_1_amt || 500}
                              onChange={(e) => updateField('prayer_tier_1_amt', Number(e.target.value))}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold">Tier 2 Lamps (108)</label>
                            <input
                              type="number"
                              value={form.prayer_tier_2_count || 108}
                              onChange={(e) => updateField('prayer_tier_2_count', Number(e.target.value))}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold">Tier 2 Offering (BTN)</label>
                            <input
                              type="number"
                              value={form.prayer_tier_2_amt || 1500}
                              onChange={(e) => updateField('prayer_tier_2_amt', Number(e.target.value))}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PRAYERS: PUJAS */}
                    {sectionKey === 'prayer-pujas' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                          <label className="text-xs font-bold text-slate-800">Puja 1: Mahakala Protector</label>
                          <input
                            type="text"
                            value={form.prayer_puja_1_title || ''}
                            onChange={(e) => updateField('prayer_puja_1_title', e.target.value)}
                            placeholder="Mahakala & Dharmapala Protector Puja"
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 font-bold"
                          />
                          <textarea
                            rows={2}
                            value={form.prayer_puja_1_desc || ''}
                            onChange={(e) => updateField('prayer_puja_1_desc', e.target.value)}
                            placeholder="Wrathful guardian rites chanted at dusk..."
                            className="w-full text-xs p-2 rounded-lg border border-slate-200"
                          />
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                          <label className="text-xs font-bold text-slate-800">Puja 2: Medicine Buddha</label>
                          <input
                            type="text"
                            value={form.prayer_puja_2_title || ''}
                            onChange={(e) => updateField('prayer_puja_2_title', e.target.value)}
                            placeholder="Medicine Buddha Healing Dharani"
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 font-bold"
                          />
                          <textarea
                            rows={2}
                            value={form.prayer_puja_2_desc || ''}
                            onChange={(e) => updateField('prayer_puja_2_desc', e.target.value)}
                            placeholder="Recitations for swift recovery..."
                            className="w-full text-xs p-2 rounded-lg border border-slate-200"
                          />
                        </div>
                      </div>
                    )}

                    {/* SECTION: FOOTER ASHTAMANGALA SYMBOLS & PREVIEW */}
                    {sectionKey === 'footer' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Eight Auspicious Symbols (Ashtamangala / བཀྲ་ཤིས་རྟགས་བརྒྱད) sacred visual preview.
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900 text-white border border-[#D4AF37]/40 space-y-3">
                          <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
                            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                              Auspicious Accent Bar Preview
                            </span>
                            <span className="text-[10px] text-gray-400 font-tibetan">
                              བཀྲ་ཤིས་རྟགས་བརྒྱད།
                            </span>
                          </div>

                          <div className="flex items-center justify-around py-3 text-2xl text-[#D4AF37] bg-black/40 rounded-xl border border-[#D4AF37]/20 select-none">
                            <span title="☸ Dharmachakra (Wheel of Law)">☸</span>
                            <span title="🪷 Padma (Lotus of Purity)">🪷</span>
                            <span title="♾ Shrivatsa (Endless Knot)">♾</span>
                            <span title="🏺 Kalasha (Treasure Vase)">🏺</span>
                            <span title="🎏 Matsyayugma (Golden Fishes)">🎏</span>
                            <span title="🚩 Dhvaja (Victory Banner)">🚩</span>
                            <span title="☂ Chatra (Parasol)">☂</span>
                            <span title="🐚 Shankha (Conch Shell)">🐚</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px] text-gray-300 font-light">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                              <strong className="text-[#D4AF37] block font-medium">☸ Dharmachakra</strong>
                              <span>Buddha's teaching</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                              <strong className="text-[#D4AF37] block font-medium">🪷 Lotus</strong>
                              <span>Spiritual purity</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                              <strong className="text-[#D4AF37] block font-medium">♾ Endless Knot</strong>
                              <span>Interdependence</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                              <strong className="text-[#D4AF37] block font-medium">🏺 Treasure Vase</strong>
                              <span>Spiritual abundance</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                              <strong className="text-[#D4AF37] block font-medium">🎏 Golden Fishes</strong>
                              <span>Liberation & joy</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                              <strong className="text-[#D4AF37] block font-medium">🚩 Victory Banner</strong>
                              <span>Triumph over delusions</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                              <strong className="text-[#D4AF37] block font-medium">☂ Parasol</strong>
                              <span>Sacred protection</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                              <strong className="text-[#D4AF37] block font-medium">🐚 Conch Shell</strong>
                              <span>Call to Dharma</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECTION: DONATE PRESETS & OFFERING TIERS */}
                    {sectionKey === 'donate-presets' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Configure the 5 standard donation preset buttons shown on the donation checkout form.
                        </div>

                        {[
                          { tier: 1, defaultAmount: 500, defaultLabel: 'Daily Sangha Meals & Tea' },
                          { tier: 2, defaultAmount: 1100, defaultLabel: 'Perpetual Butter Lamp Offering' },
                          { tier: 3, defaultAmount: 2500, defaultLabel: 'Monk Robes & Sacred Study Texts' },
                          { tier: 4, defaultAmount: 5000, defaultLabel: 'Monthly Sangha Medical Care' },
                          { tier: 5, defaultAmount: 10000, defaultLabel: '108ft Peace Stupa Gold Leaf Plating' }
                        ].map(({ tier, defaultAmount, defaultLabel }) => (
                          <div key={tier} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Tier #{tier} Amount (₹ / Nu.)
                              </label>
                              <input
                                type="number"
                                value={form[`donate_tier_${tier}_amount`] ?? defaultAmount}
                                onChange={(e) => updateField(`donate_tier_${tier}_amount`, e.target.value)}
                                placeholder={String(defaultAmount)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Merit Dedication Description
                              </label>
                              <input
                                type="text"
                                value={form[`donate_tier_${tier}_label`] ?? defaultLabel}
                                onChange={(e) => updateField(`donate_tier_${tier}_label`, e.target.value)}
                                placeholder={defaultLabel}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SECTION: SHRINE DAILY RITUAL SCHEDULE CARDS */}
                    {sectionKey === 'prayer-schedule' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                          Daily Shrine Ritual Session Cards (Dawn, Midday, Afternoon, Dusk).
                        </div>

                        {[
                          { id: 1, session: 'Dawn Sang & Tara Puja', defaultTime: '05:30 AM - 07:30 AM', defaultDesc: 'Purification smoke offering and recitation of the 21 Praises to Tara.' },
                          { id: 2, session: 'Midday Monastic Study & Debate', defaultTime: '10:00 AM - 12:30 PM', defaultDesc: 'Traditional epistemological dialectic debate by Shedra monks.' },
                          { id: 3, session: 'Afternoon Mahakala Dharmapala Puja', defaultTime: '03:00 PM - 04:30 PM', defaultDesc: 'Sacred wrathful protector offerings for world peace and overcoming obstacles.' },
                          { id: 4, session: 'Evening 108 Butter Lamp Illumination', defaultTime: '05:00 PM - 07:00 PM', defaultDesc: 'Lighting of consecrated brass butter lamps with perpetual dedication chantings.' }
                        ].map(({ id, session, defaultTime, defaultDesc }) => (
                          <div key={id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Session #{id} Name</label>
                                <input
                                  type="text"
                                  value={form[`prayer_session_${id}_title`] ?? session}
                                  onChange={(e) => updateField(`prayer_session_${id}_title`, e.target.value)}
                                  placeholder={session}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Daily Timetable</label>
                                <input
                                  type="text"
                                  value={form[`prayer_session_${id}_time`] ?? defaultTime}
                                  onChange={(e) => updateField(`prayer_session_${id}_time`, e.target.value)}
                                  placeholder={defaultTime}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Session Ritual Description</label>
                              <textarea
                                rows={2}
                                value={form[`prayer_session_${id}_desc`] ?? defaultDesc}
                                onChange={(e) => updateField(`prayer_session_${id}_desc`, e.target.value)}
                                placeholder={defaultDesc}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 flex-shrink-0">
            {/* Direct Studio Deep Link */}
            <Link
              to={targetStudio}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#721C24] hover:text-[#0F172A] transition-colors"
              title="Open full studio in admin panel"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Open Full Studio in Admin Panel</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#721C24] hover:bg-[#8B2E24] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Save & Publish Live</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
