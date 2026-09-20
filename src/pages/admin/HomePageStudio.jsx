import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Save, RefreshCw, Sparkles, Image, CheckCircle2, ArrowRight,
  ExternalLink, Sliders, Landmark, GraduationCap, Flame, Globe,
  Play, BookOpen, ChevronRight, Award, UploadCloud, Heart, Video
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function HomePageStudio() {
  const { success, error } = useToast();
  const location = useLocation();

  // Pick tab from hash or default to hero
  const initialTab = location.hash ? location.hash.replace('#', '') : 'hero';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    // 1. Hero
    home_hero_badge: '༄༅། །དགེ་ལེགས་ཀྱི་གནས། • Sacred Himalayan Sanctuary',
    home_hero_title: 'BUILDING A SACRED LEGACY OF PEACE & WISDOM',
    home_hero_subtitle: 'Constructing the monumental 108ft Great Druk Wangyel Peace Stupa, expanding the Shedra Monastic University, and illuminating daily butter lamp pujas in Gelephu, Bhutan.',
    home_hero_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80',
    home_hero_cta_text: 'OFFER DANA / DONATE',
    home_hero_cta_link: '/donate',
    home_hero_cta2_text: 'DISCOVER SACRED MANDATE',
    home_hero_cta2_link: '/about',

    // 2. Stats
    stat1_num: '108 Ft',
    stat1_label: 'Monumental Stupa',
    stat1_sub: 'Gelephu, Bhutan',
    stat2_num: '350+',
    stat2_label: 'Monastic Scholars',
    stat2_sub: 'Shedra university scholars',
    stat3_num: '100k+',
    stat3_label: 'Consecrated Prayers',
    stat3_sub: 'Dedicated merit prayers',
    stat4_num: '40+ Nations',
    stat4_label: 'Global Patronage',
    stat4_sub: 'Official 80G tax receipt',

    // 3. Campaigns
    home_campaigns_pill: 'Sacred Philanthropy',
    home_campaigns_title: 'Current Monastic & Stupa Campaigns',
    home_campaigns_cta_text: 'View All Causes',
    home_campaigns_cta_link: '/donate',

    // 4. Documentary
    home_doc_pill: 'Sacred Vision & Lineage',
    home_doc_title: 'From Sacred Lineage to Global World Peace',
    home_doc_desc: 'Nestled in the tranquil Himalayan foothills of Gelephu, Bhutan, Drodul Phendey Ling Foundation brings together revered Buddhist masters, dedicated monk scholars, and international patrons to preserve centuries-old Tibetan Buddhist heritage and complete the historic Great Druk Wangyel Peace Stupa.',
    home_doc_video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    home_doc_image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
    home_doc_duration: 'Duration: 12 mins · 4K Cinema',
    home_doc_btn1_text: 'WATCH FULL FILM',
    home_doc_btn2_text: 'PHOTO ARCHIVES',
    home_doc_btn2_link: '/gallery',

    // 5. Four Pillars
    home_pillars_pill: 'Our Noble Mission',
    home_pillars_title: 'Four Pillars of Sacred Merit',
    home_pillars_subtitle: 'Dedicated programs empowering Buddhist scholarship, architectural preservation, and spiritual welfare.',
    pillar1_title: 'World Peace Stupa',
    pillar1_desc: 'The 108-foot Great Druk Wangyel Peace Stupa houses sacred relics, 108 prayer wheels, and serves as a spiritual sanctuary for global harmony.',
    pillar1_link_text: 'Support Stupa Build',
    pillar1_link_url: '/donate',
    pillar2_title: 'Shedra Monastic Institute',
    pillar2_desc: 'Residential monastic higher university providing full scholarships, classical Dharma curriculum, philosophical debate, and retreat facilities.',
    pillar2_link_text: 'Learn About Shedra',
    pillar2_link_url: '/shedra',
    pillar3_title: 'Consecrated Prayers & Pujas',
    pillar3_desc: 'Conducting daily Mahakala protector pujas, Medicine Buddha healing rituals, and 108 butter lamp illuminations for global sponsors.',
    pillar3_link_text: 'Request Dedication',
    pillar3_link_url: '/prayer-request',
    pillar4_title: 'Digital Dharma & Texts',
    pillar4_desc: 'Digitizing sacred woodblock pecha manuscripts, preserving rare Vajrayana commentary texts, and translating treatises for global scholars.',
    pillar4_link_text: 'Explore Dharma LMS',
    pillar4_link_url: '/learning',

    // 6. Butter Lamp Callout
    home_butterlamp_badge: 'Consecrated Daily Prayers',
    home_butterlamp_title: 'Offer 108 Sacred Butter Lamps',
    home_butterlamp_subtitle: 'For World Peace & Family Health',
    home_butterlamp_desc: 'Submit personal prayer intentions and names of loved ones. Our resident Shedra monks chant consecrated prayers and illuminate 108 brass butter lamps in the holy shrine altar.',
    home_butterlamp_cta_text: 'OFFER BUTTER LAMPS NOW',
    home_butterlamp_cta_link: '/prayer-request',
    home_butterlamp_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',

    // 7. Learning Discourses
    home_learning_pill: 'Digital Dharma Library',
    home_learning_title: 'Open Video Discourses & Teachings',
    home_learning_cta_text: 'View All Lectures',
    home_learning_cta_link: '/learning',

    // 8. Blog & Journal
    home_blog_pill: 'Monastery Publications',
    home_blog_title: 'Wisdom Articles & Spiritual Insights',
    home_blog_cta_text: 'Read All Articles',
    home_blog_cta_link: '/blog',
  });

  useEffect(() => {
    if (location.hash) {
      const h = location.hash.replace('#', '');
      setActiveTab(h);
    }
  }, [location.hash]);

  useEffect(() => {
    setLoading(true);
    api.get('/settings')
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setForm((prev) => ({ ...prev, ...res.data.data }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleImageUpload = async (e, fieldKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);

    setUploading(true);
    try {
      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data.url) {
        handleChange(fieldKey, res.data.url);
        success('Image uploaded and synced!');
      } else {
        error(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      error('Failed to upload image: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', { settings: form });
      if (res.data?.success) {
        success('Homepage studio changes saved successfully! Public page updated.');
        window.dispatchEvent(new CustomEvent('ngo:settings-updated', { detail: { settings: form } }));
      } else {
        error(res.data?.message || 'Failed to save settings');
      }
    } catch (err) {
      error('Error saving settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'hero', label: '1. Hero Banner', icon: Sparkles },
    { id: 'stats', label: '2. Impact Stats', icon: Landmark },
    { id: 'campaigns', label: '3. Campaigns Band', icon: Heart },
    { id: 'documentary', label: '4. Documentary', icon: Play },
    { id: 'pillars', label: '5. Four Pillars', icon: Award },
    { id: 'prayers', label: '6. Butter Lamps', icon: Flame },
    { id: 'learning', label: '7. Dharma LMS', icon: Video },
    { id: 'blog', label: '8. Wisdom Journal', icon: BookOpen },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
        <p className="text-xs">Loading Homepage Studio configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] p-6 rounded-2xl text-white border border-[#1E293B] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1E293B] border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-md">
            ☸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-brand font-bold text-xl text-white">
                Homepage Studio & CMS Controller
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#0F172A] uppercase">
                Section Controller
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Full control over all 8 homepage sections with real-time public synchronization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-200 text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            <span>Preview Homepage</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#B89628] hover:to-[#96781D] text-[#0F172A] font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Publishing...' : 'Publish Changes Live'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Sidebar Sub-Tabs + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Tabs */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-2 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Homepage Sections
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isSelected
                    ? 'bg-[#721C24] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                <span className="flex-1">{tab.label}</span>
                <ChevronRight className={`w-3 h-3 ${isSelected ? 'opacity-100' : 'opacity-40'}`} />
              </button>
            );
          })}
        </div>

        {/* Section Form Content */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          {/* ========================================================= */}
          {/* 1. HERO BANNER                                            */}
          {/* ========================================================= */}
          {activeTab === 'hero' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-amber-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Hero Banner & Cinematic Mission</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Controls the primary landing banner, Tibetan invocation eyebrow, headlines, and call-to-action buttons.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan / English Eyebrow Badge</label>
                <input
                  type="text"
                  value={form.home_hero_badge || ''}
                  onChange={(e) => handleChange('home_hero_badge', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Main Hero Title</label>
                <input
                  type="text"
                  value={form.home_hero_title || ''}
                  onChange={(e) => handleChange('home_hero_title', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hero Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={form.home_hero_subtitle || ''}
                  onChange={(e) => handleChange('home_hero_subtitle', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Background Image URL / Computer Upload</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.home_hero_image || ''}
                      onChange={(e) => handleChange('home_hero_image', e.target.value)}
                      placeholder="https://images.unsplash.com/... or /uploads/..."
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                    <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors">
                      <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                      <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={(e) => handleImageUpload(e, 'home_hero_image')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {form.home_hero_image && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200">
                      <img src={form.home_hero_image} alt="Hero Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Button Text</label>
                  <input
                    type="text"
                    value={form.home_hero_cta_text || ''}
                    onChange={(e) => handleChange('home_hero_cta_text', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Button Link</label>
                  <input
                    type="text"
                    value={form.home_hero_cta_link || ''}
                    onChange={(e) => handleChange('home_hero_cta_link', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Button Text</label>
                  <input
                    type="text"
                    value={form.home_hero_cta2_text || ''}
                    onChange={(e) => handleChange('home_hero_cta2_text', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Button Link</label>
                  <input
                    type="text"
                    value={form.home_hero_cta2_link || ''}
                    onChange={(e) => handleChange('home_hero_cta2_link', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. IMPACT STATS                                           */}
          {/* ========================================================= */}
          {activeTab === 'stats' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/60 text-blue-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Impact Stats Ribbon</h3>
                <p className="text-xs text-blue-800 mt-0.5">
                  Update the four key metrics displayed in the floating ribbon beneath the hero.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stat 1 */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-amber-800">Stat 1: Monumental Stupa</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Number</label>
                    <input
                      type="text"
                      value={form.stat1_num || ''}
                      onChange={(e) => handleChange('stat1_num', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Label</label>
                    <input
                      type="text"
                      value={form.stat1_label || ''}
                      onChange={(e) => handleChange('stat1_label', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Sub-label</label>
                    <input
                      type="text"
                      value={form.stat1_sub || ''}
                      onChange={(e) => handleChange('stat1_sub', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-[#721C24]">Stat 2: Monastic Scholars</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Number</label>
                    <input
                      type="text"
                      value={form.stat2_num || ''}
                      onChange={(e) => handleChange('stat2_num', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Label</label>
                    <input
                      type="text"
                      value={form.stat2_label || ''}
                      onChange={(e) => handleChange('stat2_label', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Sub-label</label>
                    <input
                      type="text"
                      value={form.stat2_sub || ''}
                      onChange={(e) => handleChange('stat2_sub', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-amber-700">Stat 3: Consecrated Prayers</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Number</label>
                    <input
                      type="text"
                      value={form.stat3_num || ''}
                      onChange={(e) => handleChange('stat3_num', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Label</label>
                    <input
                      type="text"
                      value={form.stat3_label || ''}
                      onChange={(e) => handleChange('stat3_label', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Sub-label</label>
                    <input
                      type="text"
                      value={form.stat3_sub || ''}
                      onChange={(e) => handleChange('stat3_sub', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-emerald-800">Stat 4: Global Patronage</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Number</label>
                    <input
                      type="text"
                      value={form.stat4_num || ''}
                      onChange={(e) => handleChange('stat4_num', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Label</label>
                    <input
                      type="text"
                      value={form.stat4_label || ''}
                      onChange={(e) => handleChange('stat4_label', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Sub-label</label>
                    <input
                      type="text"
                      value={form.stat4_sub || ''}
                      onChange={(e) => handleChange('stat4_sub', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. CAMPAIGNS                                              */}
          {/* ========================================================= */}
          {activeTab === 'campaigns' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-emerald-900 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A]">Featured Campaigns Band</h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Controls the header titles and links. Individual campaigns are managed in the Campaigns Suite.
                  </p>
                </div>
                <Link
                  to="/admin/campaigns"
                  className="px-3.5 py-1.5 rounded-lg bg-[#721C24] text-white text-xs font-bold hover:bg-[#8B2E24] transition-colors"
                >
                  Manage Causes →
                </Link>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section Pill</label>
                <input
                  type="text"
                  value={form.home_campaigns_pill || ''}
                  onChange={(e) => handleChange('home_campaigns_pill', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section Heading</label>
                <input
                  type="text"
                  value={form.home_campaigns_title || ''}
                  onChange={(e) => handleChange('home_campaigns_title', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">View All Link Text</label>
                  <input
                    type="text"
                    value={form.home_campaigns_cta_text || ''}
                    onChange={(e) => handleChange('home_campaigns_cta_text', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">View All Link Target</label>
                  <input
                    type="text"
                    value={form.home_campaigns_cta_link || ''}
                    onChange={(e) => handleChange('home_campaigns_cta_link', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. DOCUMENTARY                                            */}
          {/* ========================================================= */}
          {activeTab === 'documentary' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200/60 text-purple-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Monastery Documentary & Vision Banner</h3>
                <p className="text-xs text-purple-800 mt-0.5">
                  Update the video showcase, duration badge, narrative story, and action buttons.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Header Pill</label>
                <input
                  type="text"
                  value={form.home_doc_pill || ''}
                  onChange={(e) => handleChange('home_doc_pill', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Story Main Heading</label>
                <input
                  type="text"
                  value={form.home_doc_title || ''}
                  onChange={(e) => handleChange('home_doc_title', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Story Description</label>
                <textarea
                  rows={4}
                  value={form.home_doc_desc || ''}
                  onChange={(e) => handleChange('home_doc_desc', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video Embed URL (YouTube/Vimeo)</label>
                <input
                  type="text"
                  value={form.home_doc_video_url || ''}
                  onChange={(e) => handleChange('home_doc_video_url', e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video Thumbnail / Poster Image</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.home_doc_image || ''}
                      onChange={(e) => handleChange('home_doc_image', e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                    <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors">
                      <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                      <span>{uploading ? 'Uploading...' : 'Upload Poster'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={(e) => handleImageUpload(e, 'home_doc_image')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration Badge Text</label>
                  <input
                    type="text"
                    value={form.home_doc_duration || ''}
                    onChange={(e) => handleChange('home_doc_duration', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Button 1 Text</label>
                  <input
                    type="text"
                    value={form.home_doc_btn1_text || ''}
                    onChange={(e) => handleChange('home_doc_btn1_text', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Button 2 Text</label>
                  <input
                    type="text"
                    value={form.home_doc_btn2_text || ''}
                    onChange={(e) => handleChange('home_doc_btn2_text', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. FOUR PILLARS                                           */}
          {/* ========================================================= */}
          {activeTab === 'pillars' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-amber-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Four Sacred Pillars of Activity</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Update the titles, descriptions, and CTA links for all four organizational pillars.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pillar 1 */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-amber-800">Pillar 1: World Peace Stupa</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={form.pillar1_title || ''}
                      onChange={(e) => handleChange('pillar1_title', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Description</label>
                    <textarea
                      rows={3}
                      value={form.pillar1_desc || ''}
                      onChange={(e) => handleChange('pillar1_desc', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Link Text / Target</label>
                    <input
                      type="text"
                      value={form.pillar1_link_text || ''}
                      onChange={(e) => handleChange('pillar1_link_text', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-[#721C24]">Pillar 2: Shedra Monastic Institute</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={form.pillar2_title || ''}
                      onChange={(e) => handleChange('pillar2_title', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Description</label>
                    <textarea
                      rows={3}
                      value={form.pillar2_desc || ''}
                      onChange={(e) => handleChange('pillar2_desc', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Link Text / Target</label>
                    <input
                      type="text"
                      value={form.pillar2_link_text || ''}
                      onChange={(e) => handleChange('pillar2_link_text', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-amber-700">Pillar 3: Consecrated Prayers & Pujas</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={form.pillar3_title || ''}
                      onChange={(e) => handleChange('pillar3_title', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Description</label>
                    <textarea
                      rows={3}
                      value={form.pillar3_desc || ''}
                      onChange={(e) => handleChange('pillar3_desc', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Link Text / Target</label>
                    <input
                      type="text"
                      value={form.pillar3_link_text || ''}
                      onChange={(e) => handleChange('pillar3_link_text', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Pillar 4 */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-emerald-800">Pillar 4: Digital Dharma & Texts</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={form.pillar4_title || ''}
                      onChange={(e) => handleChange('pillar4_title', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Description</label>
                    <textarea
                      rows={3}
                      value={form.pillar4_desc || ''}
                      onChange={(e) => handleChange('pillar4_desc', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Link Text / Target</label>
                    <input
                      type="text"
                      value={form.pillar4_link_text || ''}
                      onChange={(e) => handleChange('pillar4_link_text', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. BUTTER LAMPS                                           */}
          {/* ========================================================= */}
          {activeTab === 'prayers' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-amber-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Butter Lamp Offering Callout Banner</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Update the high-impact warm candlelight callout on the homepage.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={form.home_butterlamp_badge || ''}
                  onChange={(e) => handleChange('home_butterlamp_badge', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Main Heading</label>
                  <input
                    type="text"
                    value={form.home_butterlamp_title || ''}
                    onChange={(e) => handleChange('home_butterlamp_title', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gold Foil Subtitle</label>
                  <input
                    type="text"
                    value={form.home_butterlamp_subtitle || ''}
                    onChange={(e) => handleChange('home_butterlamp_subtitle', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Callout Description</label>
                <textarea
                  rows={3}
                  value={form.home_butterlamp_desc || ''}
                  onChange={(e) => handleChange('home_butterlamp_desc', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={form.home_butterlamp_cta_text || ''}
                    onChange={(e) => handleChange('home_butterlamp_cta_text', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={form.home_butterlamp_cta_link || ''}
                    onChange={(e) => handleChange('home_butterlamp_cta_link', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. DHARMA LMS                                             */}
          {/* ========================================================= */}
          {activeTab === 'learning' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/60 text-blue-900 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A]">Dharma Video Lectures Band</h3>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Controls section titles. Videos and lessons are managed in the LMS Studio.
                  </p>
                </div>
                <Link
                  to="/admin/learning"
                  className="px-3.5 py-1.5 rounded-lg bg-[#721C24] text-white text-xs font-bold hover:bg-[#8B2E24] transition-colors"
                >
                  Manage Videos →
                </Link>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Header Pill</label>
                <input
                  type="text"
                  value={form.home_learning_pill || ''}
                  onChange={(e) => handleChange('home_learning_pill', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section Heading</label>
                <input
                  type="text"
                  value={form.home_learning_title || ''}
                  onChange={(e) => handleChange('home_learning_title', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">View All Button Text</label>
                  <input
                    type="text"
                    value={form.home_learning_cta_text || ''}
                    onChange={(e) => handleChange('home_learning_cta_text', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">View All Link Target</label>
                  <input
                    type="text"
                    value={form.home_learning_cta_link || ''}
                    onChange={(e) => handleChange('home_learning_cta_link', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 8. WISDOM JOURNAL                                         */}
          {/* ========================================================= */}
          {activeTab === 'blog' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/60 text-rose-900 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A]">Wisdom Journal Articles Band</h3>
                  <p className="text-xs text-rose-800 mt-0.5">
                    Controls section titles. Articles and authors are managed in the Blog Suite.
                  </p>
                </div>
                <Link
                  to="/admin/blog"
                  className="px-3.5 py-1.5 rounded-lg bg-[#721C24] text-white text-xs font-bold hover:bg-[#8B2E24] transition-colors"
                >
                  Manage Articles →
                </Link>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Header Pill</label>
                <input
                  type="text"
                  value={form.home_blog_pill || ''}
                  onChange={(e) => handleChange('home_blog_pill', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section Heading</label>
                <input
                  type="text"
                  value={form.home_blog_title || ''}
                  onChange={(e) => handleChange('home_blog_title', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">View All Button Text</label>
                  <input
                    type="text"
                    value={form.home_blog_cta_text || ''}
                    onChange={(e) => handleChange('home_blog_cta_text', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">View All Link Target</label>
                  <input
                    type="text"
                    value={form.home_blog_cta_link || ''}
                    onChange={(e) => handleChange('home_blog_cta_link', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sticky Bottom Save Action */}
          <div className="pt-6 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#B89628] hover:to-[#96781D] text-[#0F172A] font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Publishing Changes...' : 'Save & Publish All Homepage Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
