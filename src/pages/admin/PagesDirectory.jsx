import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, Layout, Sparkles, Heart, Flame, GraduationCap, Video,
  Image, Newspaper, Phone, ExternalLink, Edit3, CheckCircle2, ChevronRight,
  Plus, Search, Trash2, Eye, Compass, X, Save, AlertCircle, Loader2,
  Share2, ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AdvancedEditorSuite from '../../components/admin/AdvancedEditorSuite';

export default function PagesDirectory() {
  const { success, error } = useToast();

  const [customPages, setCustomPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [directoryTab, setDirectoryTab] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Initial Form State
  const initialFormState = {
    title: '',
    slug: '',
    category: 'General',
    excerpt: '',
    content: '',
    banner_url: '',
    video_url: '',
    gallery_images: [],
    social_links: { facebook: '', instagram: '', youtube: '', whatsapp: '' },
    cta_button: { label: '', url: '', style: 'primary' },
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    is_published: true,
    show_in_header_nav: false,
    show_in_footer_nav: false,
  };

  const [form, setForm] = useState(initialFormState);

  // Load Custom Pages from API
  const loadCustomPages = async () => {
    try {
      setLoadingPages(true);
      const res = await api.get('/pages?all=true');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCustomPages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load custom pages:', err);
    } finally {
      setLoadingPages(false);
    }
  };

  useEffect(() => {
    loadCustomPages();
  }, []);

  const handleOpenCreate = () => {
    setEditingPageId(null);
    setForm(initialFormState);
    setModalError(null);
    setIsCreatingCategory(false);
    setCustomCategoryInput('');
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPageId(p.id);
    setForm({
      title: p.title || '',
      slug: p.slug || '',
      category: p.category || 'General',
      excerpt: p.excerpt || '',
      content: p.content || '',
      banner_url: p.banner_url || '',
      video_url: p.video_url || '',
      gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : [],
      social_links: p.social_links || { facebook: '', instagram: '', youtube: '', whatsapp: '' },
      cta_button: p.cta_button || { label: '', url: '', style: 'primary' },
      seo_title: p.seo_title || '',
      seo_description: p.seo_description || '',
      seo_keywords: p.seo_keywords || '',
      is_published: Boolean(p.is_published),
      show_in_header_nav: Boolean(p.show_in_header_nav),
      show_in_footer_nav: Boolean(p.show_in_footer_nav),
    });
    setModalError(null);
    setIsCreatingCategory(false);
    setCustomCategoryInput('');
    setModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    try {
      const res = await api.delete(`/pages/${id}`);
      if (res.data?.success) {
        success('Custom page deleted successfully.');
        loadCustomPages();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete page.');
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!form.title.trim()) {
      setModalError('Page Title is required.');
      return;
    }

    setSaving(true);
    setModalError(null);

    const payload = {
      ...form,
      category: isCreatingCategory && customCategoryInput.trim()
        ? customCategoryInput.trim()
        : form.category || 'General',
    };

    try {
      let res;
      if (editingPageId) {
        res = await api.put(`/pages/${editingPageId}`, payload);
      } else {
        res = await api.post('/pages', payload);
      }

      if (res.data?.success) {
        success(editingPageId ? 'Page updated successfully!' : 'New page created and published!');
        setModalOpen(false);
        loadCustomPages();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to save page.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered Custom Pages
  const filteredPages = customPages.filter((p) => {
    const matchesSearch =
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Core Monastic Studios
  const coreStudios = [
    {
      id: 'home',
      name: 'Homepage Portal',
      tibetan: 'གཙོ་ངོས།',
      route: '/',
      studioUrl: '/admin/pages/home',
      icon: Layout,
      sectionsCount: 8,
      sections: ['Hero Showcase', 'Impact Stats', 'Campaigns', 'Documentary', '4 Pillars', 'Butter Lamps', 'Dharma Videos', 'Wisdom Journal'],
    },
    {
      id: 'about',
      name: 'About Monastery & Mandate',
      tibetan: 'ལོ་རྒྱུས།',
      route: '/about',
      studioUrl: '/admin/pages/about',
      icon: Sparkles,
      sectionsCount: 4,
      sections: ['Header Banner', '3 Sacred Pillars', 'Abbot & Spiritual Leadership', 'Statutory Trust & 80G'],
    },
    {
      id: 'shedra',
      name: 'Shedra Monastic Academy',
      tibetan: 'བཤད་གྲྭ།',
      route: '/shedra',
      studioUrl: '/admin/pages/shedra',
      icon: GraduationCap,
      sectionsCount: 4,
      sections: ['Monastic Hero', '5 Great Shastras', 'Monastic Facilities', 'Admissions & Scholarships'],
    },
    {
      id: 'prayers',
      name: 'Ceremonial Prayers & Butter Lamps',
      tibetan: 'མར་མེ་སྨོན་ལམ།',
      route: '/prayer-request',
      studioUrl: '/admin/pages/prayers',
      icon: Flame,
      sectionsCount: 4,
      sections: ['Hero Banner', '108 Butter Lamps', 'Puja Categories', 'Shrine Daily Schedule'],
    },
    {
      id: 'donate',
      name: 'Donations & Banking Wire',
      tibetan: 'མཆོད་འབུལ།',
      route: '/donate',
      studioUrl: '/admin/donate-settings',
      icon: Heart,
      sectionsCount: 3,
      sections: ['Hero Banner', 'Active Causes', 'Official Bank Wire & 80G'],
    },
    {
      id: 'contact',
      name: 'Secretariat & Inquiries',
      tibetan: 'འབྲེལ་གཏུགས།',
      route: '/contact',
      studioUrl: '/admin/pages/contact',
      icon: Phone,
      sectionsCount: 4,
      sections: ['Hero & Inscription', 'Secretariat Seat Address', 'Department Directory', 'Visiting Hours & Map'],
    },
  ];

  // Filtered Core Studios
  const filteredCoreStudios = coreStudios.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.route || '').toLowerCase().includes(q) ||
      (p.tibetan || '').includes(searchQuery)
    );
  });

  const availableCategories = Array.from(
    new Set([
      'General',
      'Sacred Stupa',
      'Shedra Academy',
      'Butter Lamps',
      'Monastic Heritage',
      'Rituals & Pujas',
      'Pilgrimage',
      'Announcements',
      ...customPages.map((p) => p.category).filter(Boolean)
    ])
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] p-6 rounded-2xl text-white border border-[#1E293B] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1E293B] border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-md">
            ☸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-brand font-bold text-xl text-white">
                Website Pages &amp; Studios
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#0F172A] uppercase">
                CMS Hub
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Create bespoke custom pages, edit core section narratives, manage video embeds, and optimize search engine SEO.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#b89528] text-[#0F172A] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Page</span>
          </button>

          <Link
            to="/admin/navigation"
            className="px-3.5 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-200 text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Navigation Menus</span>
          </Link>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-300 text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DIRECTORY TABS CONTROLLER                                  */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDirectoryTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              directoryTab === 'all'
                ? 'bg-[#8B2E24] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>All Website Pages ({coreStudios.length + customPages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDirectoryTab('custom')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              directoryTab === 'custom'
                ? 'bg-[#8B2E24] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bespoke Custom Pages ({customPages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDirectoryTab('studios')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              directoryTab === 'studios'
                ? 'bg-[#8B2E24] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Core Monastic Studios ({coreStudios.length})</span>
          </button>
        </div>

        {/* Global Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search all pages &amp; studios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. ALL WEBSITE PAGES (COMBINED WORDPRESS-GRADE DIRECTORY) */}
      {/* ========================================================= */}
      {directoryTab === 'all' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-gray-900 flex items-center gap-2">
                <span>Unified Website Directory</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                  {filteredCoreStudios.length + filteredPages.length} Listed
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Complete overview of foundational system pages and dynamic bespoke chronicles.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#b89528] text-[#0F172A] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Custom Page</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Page Name &amp; URL</th>
                    <th className="px-4 py-3">Architecture Type</th>
                    <th className="px-4 py-3">Structure / Features</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {/* Core Studios Rows */}
                  {filteredCoreStudios.map((studio) => {
                    const Icon = studio.icon || Layout;
                    return (
                      <tr key={`core-${studio.id}`} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#0F172A] border border-slate-200 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-[#D4AF37]" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                                <span>{studio.name}</span>
                                <span className="font-tibetan text-[11px] text-amber-700 font-normal">
                                  {studio.tibetan}
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                                {studio.route}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            <Layout className="w-3 h-3 text-indigo-600" />
                            <span>Core System Studio</span>
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-gray-600 text-[11px]">
                            {studio.sectionsCount} Sections ({studio.sections.slice(0, 2).join(', ')}...)
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Live
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <a
                              href={studio.route}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Preview Public Page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>

                            <Link
                              to={studio.studioUrl}
                              className="px-2.5 py-1.5 bg-[#8B2E24] hover:bg-[#a0362b] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Studio</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Dynamic Custom Pages Rows */}
                  {filteredPages.map((page) => (
                    <tr key={`custom-${page.id}`} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-serif text-sm shrink-0">
                            ☸
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-xs sm:text-sm">
                              {page.title}
                            </div>
                            <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                              /pages/{page.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Bespoke Dynamic ({page.category || 'General'})</span>
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {page.video_url ? (
                            <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                              <Video className="w-3 h-3 text-blue-600" />
                              <span>Video</span>
                            </span>
                          ) : null}
                          {page.gallery_images && page.gallery_images.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                              <Image className="w-3 h-3 text-purple-600" />
                              <span>{page.gallery_images.length} Photos</span>
                            </span>
                          ) : null}
                          {!page.video_url && (!page.gallery_images || page.gallery_images.length === 0) && (
                            <span className="text-gray-400 text-[11px]">Rich Text Chronicle</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {page.is_published ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-200 text-gray-700">
                            Draft (Admin Only)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/pages/${page.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Public Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(page)}
                            className="px-2.5 py-1.5 bg-[#8B2E24] hover:bg-[#a0362b] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(page.id, page.title)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCoreStudios.length === 0 && filteredPages.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        No pages found matching &quot;{searchQuery}&quot;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. BESPOKE CUSTOM PAGES ONLY TAB                          */}
      {/* ========================================================= */}
      {directoryTab === 'custom' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-gray-900 flex items-center gap-2">
                <span>Bespoke Custom Pages</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  {customPages.length} Pages
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Custom pages with rich storytelling, interactive video players, photo galleries, and live Google SERP previews.
              </p>
            </div>

            {/* Filter / Category Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
              >
                <option value="All">All Categories</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-3.5 py-1.5 bg-[#8B2E24] text-white rounded-xl text-xs font-bold hover:bg-[#a0362b] cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Page</span>
              </button>
            </div>
          </div>

          {/* Custom Pages Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {loadingPages ? (
              <div className="p-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#8B2E24]" />
                <span>Loading custom pages...</span>
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto text-xl font-serif">
                  ☸
                </div>
                <h3 className="font-bold text-sm text-gray-800">No Custom Pages Found</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {searchQuery
                    ? 'No pages match your search criteria. Try a different search term.'
                    : 'Start by clicking "+ Create New Page" to publish rich chronicles, stupa construction reports, or retreat announcements.'}
                </p>
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="px-4 py-2 bg-[#8B2E24] text-white rounded-xl text-xs font-bold hover:bg-[#a0362b] cursor-pointer"
                  >
                    + Create First Custom Page
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Page Title &amp; Slug</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Media / Video</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Menus</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredPages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900 text-xs sm:text-sm">
                            {page.title}
                          </div>
                          <div className="text-[11px] font-mono text-gray-500 flex items-center gap-1 mt-0.5">
                            <span>/pages/{page.slug}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] bg-gray-100 text-gray-800 font-semibold">
                            {page.category || 'General'}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {page.video_url ? (
                              <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium" title="Playable Video Attached">
                                <Video className="w-3 h-3 text-blue-600" />
                                <span>Video</span>
                              </span>
                            ) : null}
                            {page.gallery_images && page.gallery_images.length > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium" title="Photo Gallery Attached">
                                <Image className="w-3 h-3 text-purple-600" />
                                <span>{page.gallery_images.length} Photos</span>
                              </span>
                            ) : null}
                            {!page.video_url && (!page.gallery_images || page.gallery_images.length === 0) && (
                              <span className="text-gray-400 text-[11px]">—</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {page.is_published ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-200 text-gray-700">
                              Draft (Admin Only)
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-[10.5px]">
                            {page.show_in_header_nav ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-medium border border-amber-200">
                                Header
                              </span>
                            ) : null}
                            {page.show_in_footer_nav ? (
                              <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-700 font-medium border border-slate-200">
                                Footer
                              </span>
                            ) : null}
                            {!page.show_in_header_nav && !page.show_in_footer_nav && (
                              <span className="text-gray-400">Direct Link</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              to={`/pages/${page.slug}`}
                              target="_blank"
                              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Public Page"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(page)}
                              className="px-2.5 py-1.5 bg-[#8B2E24] hover:bg-[#a0362b] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(page.id, page.title)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Page"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CORE MONASTIC PAGE STUDIOS TAB                         */}
      {/* ========================================================= */}
      {directoryTab === 'studios' && (
        <div className="space-y-4">
          <div>
            <h2 className="font-serif-brand font-bold text-lg text-gray-900">
              Core Monastic Page Studios
            </h2>
            <p className="text-xs text-gray-500">
              Dedicated administrative studios for the foundational public portal pages and shrine sections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCoreStudios.map((p) => {
              const Icon = p.icon || Layout;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F172A] border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                          <span className="font-tibetan text-xs text-amber-800">{p.tibetan}</span>
                          <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] leading-tight">
                            {p.name}
                          </h3>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Live
                      </span>
                    </div>

                    <div className="py-3.5 space-y-2">
                      <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium">
                        <span>Configured Sections</span>
                        <span className="font-bold text-gray-900">{p.sectionsCount} Sections</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.sections.map((sec, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10.5px] text-slate-700 font-medium"
                          >
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={p.route}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <Link
                      to={p.studioUrl}
                      className="px-3.5 py-1.5 rounded-lg bg-[#8B2E24] hover:bg-[#a0362b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Edit Page</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CREATE / EDIT CUSTOM PAGE MODAL (ADVANCED EDITOR SUITE)   */}
      {/* ========================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[94dvh] flex flex-col my-auto overflow-hidden text-gray-900"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/90 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-2 rounded-xl bg-[#8B2E24]/10 text-[#8B2E24] shrink-0">
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B2E24]" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900">
                      {editingPageId ? 'Edit Custom Page' : 'Create New Custom Page'}
                    </h2>
                    {form.slug && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 truncate max-w-[180px]">
                        /pages/{form.slug}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    WordPress-Grade Content Suite · Video Player Preview · Live Google SERP
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {modalError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <AdvancedEditorSuite
                form={form}
                onChange={(updated) => setForm((prev) => ({ ...prev, ...updated }))}
                availableCategories={availableCategories}
                isCreatingCategory={isCreatingCategory}
                setIsCreatingCategory={setIsCreatingCategory}
                customCategoryInput={customCategoryInput}
                setCustomCategoryInput={setCustomCategoryInput}
              />
            </form>

            {/* Modal Footer Controls */}
            <div className="px-4 sm:px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-200 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#a0362b] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Page...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingPageId ? 'Save Changes' : 'Publish Custom Page'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
