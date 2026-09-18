import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Save, RefreshCw, Sparkles, Image, CheckCircle2, ArrowRight,
  ExternalLink, Award, Shield, BookOpen, Landmark, ChevronRight, UploadCloud
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AboutPageStudio() {
  const { success, error } = useToast();
  const location = useLocation();

  const initialTab = location.hash ? location.hash.replace('#', '') : 'header';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    // 1. Header
    about_tibetan_eyebrow: '༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པའི་ལོ་རྒྱུས། • Sacred Monastic Heritage',
    about_page_title: 'About Drodul Phendey Ling Foundation',
    about_page_subtitle: 'Established in the tranquil Himalayan foothills of Gelephu, Sarpang Dzongkhag, Bhutan, to nurture authentic Buddha Dharma, train monk scholars, and build the historic 108ft Great Druk Wangyel Peace Stupa.',

    // 2. Pillars
    about_pillar_1_title: 'Sacred Lineage & Vision',
    about_pillar_1_desc: 'Rooted in authentic Vajrayana and Mahayana traditions, our mission is to cultivate universal compassion, wisdom, and an enlightened sanctuary where monastic and lay practitioners realize inner peace.',
    about_pillar_2_title: 'Shedra Monastic University',
    about_pillar_2_desc: 'Providing 350+ enrolled monks with full residential scholarships, classical Tibetan linguistics, Abhidharma, Madhyamaka philosophy, debate epistemics, and contemplative solitary retreats.',
    about_pillar_3_title: 'Great Peace Stupa',
    about_pillar_3_desc: 'The monumental 108-foot Great Druk Wangyel Peace Stupa serves as a beacon of harmony, housing sacred relic chambers, 108 stone-carved prayer wheels, and pacifying discord for all beings.',

    // 3. Leadership
    about_leader_pill: 'Monastic Leadership',
    about_leader_heading: 'Venerable Spiritual Guidance',
    about_leader_name: 'Khenpo Tashi Dorji',
    about_leader_title: 'Abbot & Principal of Shedra Academy',
    about_leader_bio: 'Having completed nine years of rigorous Shedra curriculum and traditional solitary mountain retreat, Khenpo Rinpoche oversees the monastic training, sacred stupa construction, and philanthropic welfare programs in Gelephu, Bhutan.',
    about_leader_blessing: 'May every stone carved for this Stupa, every mantra chanted in this Shedra, bring peace to a troubled world.',
    about_leader_image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
    about_leader_cta_text: 'Contact Abbot Office',
    about_leader_cta_link: '/contact',

    // 4. Statutory
    about_statutory_badge: 'Official Accreditation',
    about_statutory_title: 'Statutory Trust & Accountability',
    about_statutory_desc: 'Drodul Phendey Ling Foundation operates in strict accordance with the Religious Organizations Act of the Kingdom of Bhutan. Our accounts are audited annually by certified independent chartered accountants and submitted to statutory regulatory authorities.',
    about_rob_title: 'ROB Registered',
    about_rob_text: 'Accredited by the Commission for Religious Organizations of Bhutan',
    about_tax_title: '80G Tax-Deductible',
    about_tax_text: '100% tax exemption eligible for devotees and corporate sponsors',
    about_audit_title: 'Independent Audit',
    about_audit_text: 'Statutory audited accounts published annually for donor transparency',
  });

  useEffect(() => {
    if (location.hash) {
      setActiveTab(location.hash.replace('#', ''));
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
        success('About Us studio changes saved successfully! Public page updated.');
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
    { id: 'header', label: '1. Header Banner', icon: Sparkles },
    { id: 'pillars', label: '2. Three Pillars', icon: Award },
    { id: 'leadership', label: '3. Abbot & Leadership', icon: Landmark },
    { id: 'statutory', label: '4. Statutory Trust & 80G', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
        <p className="text-xs">Loading About Us Studio configuration...</p>
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
                About Us Studio & Mandate Controller
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#0F172A] uppercase">
                Section Controller
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage the sacred mandate, core pillars, abbot guidance profile, and Bhutanese statutory trust.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-200 text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            <span>Preview About Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#B89628] hover:to-[#96781D] text-[#0F172A] font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Publishing...' : 'Publish Changes Live'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sub-Tabs */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-2 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            About Sections
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

        {/* Form Content */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          {/* ========================================================= */}
          {/* 1. HEADER BANNER                                          */}
          {/* ========================================================= */}
          {activeTab === 'header' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/60 text-rose-900">
                <h3 className="font-bold text-sm text-[#0F172A]">About Header Banner</h3>
                <p className="text-xs text-rose-800 mt-0.5">
                  Update the Tibetan invocation eyebrow, page title, and mission narrative.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan Header Eyebrow</label>
                <input
                  type="text"
                  value={form.about_tibetan_eyebrow || ''}
                  onChange={(e) => handleChange('about_tibetan_eyebrow', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Page Title</label>
                <input
                  type="text"
                  value={form.about_page_title || ''}
                  onChange={(e) => handleChange('about_page_title', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Organizational Description</label>
                <textarea
                  rows={4}
                  value={form.about_page_subtitle || ''}
                  onChange={(e) => handleChange('about_page_subtitle', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. THREE PILLARS                                          */}
          {/* ========================================================= */}
          {activeTab === 'pillars' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-amber-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Core Organizational Pillars</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Update the 3 luxury cards highlighting Sacred Lineage, Shedra University, and the Great Peace Stupa.
                </p>
              </div>

              <div className="space-y-4">
                {/* Pillar 1 */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-[#721C24]">Pillar 1: Sacred Lineage & Vision</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={form.about_pillar_1_title || ''}
                      onChange={(e) => handleChange('about_pillar_1_title', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Description</label>
                    <textarea
                      rows={3}
                      value={form.about_pillar_1_desc || ''}
                      onChange={(e) => handleChange('about_pillar_1_desc', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-blue-800">Pillar 2: Shedra Monastic University</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={form.about_pillar_2_title || ''}
                      onChange={(e) => handleChange('about_pillar_2_title', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Description</label>
                    <textarea
                      rows={3}
                      value={form.about_pillar_2_desc || ''}
                      onChange={(e) => handleChange('about_pillar_2_desc', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-amber-700">Pillar 3: Great Peace Stupa</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={form.about_pillar_3_title || ''}
                      onChange={(e) => handleChange('about_pillar_3_title', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Description</label>
                    <textarea
                      rows={3}
                      value={form.about_pillar_3_desc || ''}
                      onChange={(e) => handleChange('about_pillar_3_desc', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. LEADERSHIP & ABBOT                                     */}
          {/* ========================================================= */}
          {activeTab === 'leadership' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-amber-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Monastic Leadership & Abbot Guidance</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Update Khenpo Rinpoche's biographical profile, titles, photo portrait, and lineage blessing quote.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section Pill</label>
                  <input
                    type="text"
                    value={form.about_leader_pill || ''}
                    onChange={(e) => handleChange('about_leader_pill', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section Heading</label>
                  <input
                    type="text"
                    value={form.about_leader_heading || ''}
                    onChange={(e) => handleChange('about_leader_heading', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Abbot Full Legal & Religious Name</label>
                  <input
                    type="text"
                    value={form.about_leader_name || ''}
                    onChange={(e) => handleChange('about_leader_name', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Abbot Official Title</label>
                  <input
                    type="text"
                    value={form.about_leader_title || ''}
                    onChange={(e) => handleChange('about_leader_title', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-[#721C24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Abbot Biography</label>
                <textarea
                  rows={4}
                  value={form.about_leader_bio || ''}
                  onChange={(e) => handleChange('about_leader_bio', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lineage Blessing Quote</label>
                <textarea
                  rows={2}
                  value={form.about_leader_blessing || ''}
                  onChange={(e) => handleChange('about_leader_blessing', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-serif italic"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Abbot Portrait Photo</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.about_leader_image || ''}
                      onChange={(e) => handleChange('about_leader_image', e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                    <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors">
                      <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                      <span>{uploading ? 'Uploading...' : 'Upload Portrait'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={(e) => handleImageUpload(e, 'about_leader_image')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {form.about_leader_image && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-300">
                      <img src={form.about_leader_image} alt="Abbot Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={form.about_leader_cta_text || ''}
                    onChange={(e) => handleChange('about_leader_cta_text', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Button Target Link</label>
                  <input
                    type="text"
                    value={form.about_leader_cta_link || ''}
                    onChange={(e) => handleChange('about_leader_cta_link', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. STATUTORY TRUST                                        */}
          {/* ========================================================= */}
          {activeTab === 'statutory' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-emerald-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Statutory Trust & Accountability Banner</h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Update legal compliance, Commission for Religious Organizations of Bhutan (ROB) accreditation, and 80G tax terms.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section Badge</label>
                  <input
                    type="text"
                    value={form.about_statutory_badge || ''}
                    onChange={(e) => handleChange('about_statutory_badge', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={form.about_statutory_title || ''}
                    onChange={(e) => handleChange('about_statutory_title', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Statutory Trust Description</label>
                <textarea
                  rows={3}
                  value={form.about_statutory_desc || ''}
                  onChange={(e) => handleChange('about_statutory_desc', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Box 1 */}
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-amber-800">Box 1: ROB Registration</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={form.about_rob_title || ''}
                      onChange={(e) => handleChange('about_rob_title', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Description</label>
                    <textarea
                      rows={2}
                      value={form.about_rob_text || ''}
                      onChange={(e) => handleChange('about_rob_text', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Box 2 */}
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-emerald-800">Box 2: 80G Tax-Deductible</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={form.about_tax_title || ''}
                      onChange={(e) => handleChange('about_tax_title', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Description</label>
                    <textarea
                      rows={2}
                      value={form.about_tax_text || ''}
                      onChange={(e) => handleChange('about_tax_text', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Box 3 */}
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                  <h4 className="font-bold text-xs text-blue-800">Box 3: Independent Audit</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={form.about_audit_title || ''}
                      onChange={(e) => handleChange('about_audit_title', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Description</label>
                    <textarea
                      rows={2}
                      value={form.about_audit_text || ''}
                      onChange={(e) => handleChange('about_audit_text', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
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
              <span>{saving ? 'Publishing Changes...' : 'Save & Publish All About Us Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
