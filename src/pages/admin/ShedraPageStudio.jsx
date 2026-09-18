import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Save, RefreshCw, Sparkles, Image, CheckCircle2, ArrowRight,
  ExternalLink, GraduationCap, BookOpen, Building2, UserCheck,
  ChevronRight, UploadCloud, Award
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ShedraPageStudio() {
  const { success, error } = useToast();
  const location = useLocation();

  const initialTab = location.hash ? location.hash.replace('#', '') : 'hero';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    // 1. Hero
    shedra_hero_badge: 'Center for Advanced Buddhist Epistemology & Scholastic Studies',
    shedra_hero_title: 'Drodul Phendey Ling Shedra Monastic Academy',
    shedra_hero_subtitle: 'Rooted in the ancient Nalanda scholastic lineage of Bhutan, our Shedra trains monk scholars in the Five Great Treatises of Buddhist Philosophy over a rigorous 9-year Master of Buddhist Studies (Acharya) curriculum.',
    shedra_hero_image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1400&q=80',
    shedra_hero_cta1_text: 'Explore Curriculum',
    shedra_hero_cta1_link: '#curriculum',
    shedra_hero_cta2_text: 'Verify Certificate',
    shedra_hero_cta2_link: '#verify',

    // 2. 5 Great Shastras
    shedra_shastras_badge: 'Scholastic Heritage',
    shedra_shastras_title: 'The Five Great Shastras',
    shedra_shastras_subtitle: 'Every monk scholar must master debate, textual translation, and meditation upon the five comprehensive pillars of classical Indian and Tibetan Buddhism.',
    shastra1_title: 'Madhyamaka (Middle Way)',
    shastra1_desc: 'Emptiness beyond extremes, demonstrating that all phenomena lack inherent existence yet appear dependently.',
    shastra1_sanskrit: 'Prajña / Sunyata',
    shastra1_years: 'Years 4 - 6',
    shastra2_title: 'Prajnaparamita (Wisdom)',
    shastra2_desc: 'The stages of realization of the Bodhisattva path, spanning all 8 categories and 70 points of insight.',
    shastra2_sanskrit: 'Abhisamayālankāra',
    shastra2_years: 'Years 1 - 3',
    shastra3_title: 'Pramana (Valid Cognition)',
    shastra3_desc: 'Formal epistemology and rigorous Buddhist debate, establishing valid perception, inference, and direct insight.',
    shastra3_sanskrit: 'Dharmakirti Logic',
    shastra3_years: 'Years 1 - 2',
    shastra4_title: 'Vinaya (Monastic Discipline)',
    shastra4_desc: 'The code of vows, mindful conduct, and ethical harmony essential for preserving the sacred Sangha.',
    shastra4_sanskrit: 'Pratimoksha',
    shastra4_years: 'Years 7 - 8',
    shastra5_title: 'Abhidharma (Psychology)',
    shastra5_desc: 'Metaphysical breakdown of mind, consciousness, mental factors, cosmology, and the mechanisms of karma.',
    shastra5_sanskrit: 'Vasubandhu Treasury',
    shastra5_years: 'Years 2 - 3',

    // 3. Monastic Facilities
    shedra_fac_title: 'Monastic Campus & Sacred Architecture',
    shedra_fac_desc: 'Purpose-built traditional stone architecture housing modern monastic classrooms, solitary debate quadrangles, and an extensive scriptorium.',
    shedra_fac_1_title: 'Stone Debate Courtyard',
    shedra_fac_1_desc: 'Open-air stone terrace where monks assemble daily for rigorous dialectical debate, testing each other on philosophical propositions.',
    shedra_fac_2_title: 'Sacred Scriptorium & Pecha Library',
    shedra_fac_2_desc: 'Houses thousands of rare woodblock pechas, Kangyur and Tengyur canons, and digital translation workstations.',
    shedra_fac_3_title: 'Solitary Retreat Kutis',
    shedra_fac_3_desc: 'Quiet meditation quarters nestled in the Gelephu foothills for graduates undertaking traditional 3-year, 3-month solitary retreats.',

    // 4. Admissions Criteria
    shedra_admit_pill: 'Join the Academy',
    shedra_admit_title: 'Study Buddhist Dialectics & Epistemology',
    shedra_admit_desc: 'Drodul Phendey Ling Shedra welcomes applications from ordained novice monks, transferred monastic scholars, and lay devotees seeking deep immersion in Buddhist classical philosophy.',
    shedra_benefit_1: 'Full monastic scholarship, boarding, and meals provided for all enrolled monks',
    shedra_benefit_2: 'Degrees recognized under Bhutanese Monastic Educational Council',
    shedra_benefit_3: 'Daily debate practice in traditional stone courtyards',
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
        success('Shedra Academy Studio changes saved successfully! Public page updated.');
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
    { id: 'hero', label: '1. Hero & Mission', icon: Sparkles },
    { id: 'curriculum', label: '2. Five Great Shastras', icon: BookOpen },
    { id: 'facilities', label: '3. Campus Facilities', icon: Building2 },
    { id: 'admissions', label: '4. Admissions & Benefits', icon: GraduationCap },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
        <p className="text-xs">Loading Shedra Academy Studio configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] p-6 rounded-2xl text-white border border-[#1E293B] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1E293B] border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-md">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-serif-brand text-white">Shedra Monastic Academy Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#721C24] text-amber-200 border border-amber-400/30 uppercase tracking-wider">
                Full CMS Control
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-light">
              Manage Buddhist philosophy curriculum, campus facilities, and admissions for <code className="text-amber-300">/shedra</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/shedra"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <span>View Public /shedra</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="monastic-maroon-btn px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-[#D4AF37]" />}
            <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-gray-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#721C24] text-white shadow-md border border-[#D4AF37]/50'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* TAB 1: HERO */}
        {activeTab === 'hero' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A] font-serif-brand">Shedra Page Hero Banner & Vision</h3>
              <p className="text-xs text-gray-500">Configure top hero inscriptions, titles, and background visuals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Hero Badge / Accreditation Eyebrow</label>
                <input
                  type="text"
                  value={form.shedra_hero_badge || ''}
                  onChange={(e) => handleChange('shedra_hero_badge', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Primary Headline</label>
                <input
                  type="text"
                  value={form.shedra_hero_title || ''}
                  onChange={(e) => handleChange('shedra_hero_title', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold text-[#0F172A]"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Hero Lede Paragraph</label>
                <textarea
                  rows={3}
                  value={form.shedra_hero_subtitle || ''}
                  onChange={(e) => handleChange('shedra_hero_subtitle', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Hero Background Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.shedra_hero_image || ''}
                    onChange={(e) => handleChange('shedra_hero_image', e.target.value)}
                    className="flex-1 text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-mono"
                  />
                  <label className="px-4 py-3 bg-slate-900 text-amber-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 flex items-center gap-1.5 flex-shrink-0">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'shedra_hero_image')}
                    />
                  </label>
                </div>
                {form.shedra_hero_image && (
                  <div className="mt-2 w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={form.shedra_hero_image} alt="Hero Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Primary CTA Text</label>
                <input
                  type="text"
                  value={form.shedra_hero_cta1_text || ''}
                  onChange={(e) => handleChange('shedra_hero_cta1_text', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Primary CTA Target Link</label>
                <input
                  type="text"
                  value={form.shedra_hero_cta1_link || ''}
                  onChange={(e) => handleChange('shedra_hero_cta1_link', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FIVE GREAT SHASTRAS */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A] font-serif-brand">The Five Great Shastras of Buddhist Scholarship</h3>
              <p className="text-xs text-gray-500">Edit titles, commentarial lineages, and study year distributions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Section Eyebrow</label>
                <input
                  type="text"
                  value={form.shedra_shastras_badge || ''}
                  onChange={(e) => handleChange('shedra_shastras_badge', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Section Title</label>
                <input
                  type="text"
                  value={form.shedra_shastras_title || ''}
                  onChange={(e) => handleChange('shedra_shastras_title', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold"
                />
              </div>

              {/* Shastra 1 */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2.5 md:col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#721C24]">Shastra 1: Madhyamaka</span>
                  <input
                    type="text"
                    value={form.shastra1_years || ''}
                    onChange={(e) => handleChange('shastra1_years', e.target.value)}
                    placeholder="e.g. Years 4 - 6"
                    className="text-[11px] p-1.5 rounded-lg border border-gray-300 bg-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={form.shastra1_title || ''}
                    onChange={(e) => handleChange('shastra1_title', e.target.value)}
                    placeholder="Title"
                    className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                  />
                  <input
                    type="text"
                    value={form.shastra1_sanskrit || ''}
                    onChange={(e) => handleChange('shastra1_sanskrit', e.target.value)}
                    placeholder="Sanskrit Term"
                    className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  value={form.shastra1_desc || ''}
                  onChange={(e) => handleChange('shastra1_desc', e.target.value)}
                  placeholder="Description"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </div>

              {/* Shastra 2 */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2.5 md:col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#721C24]">Shastra 2: Prajnaparamita</span>
                  <input
                    type="text"
                    value={form.shastra2_years || ''}
                    onChange={(e) => handleChange('shastra2_years', e.target.value)}
                    placeholder="Years"
                    className="text-[11px] p-1.5 rounded-lg border border-gray-300 bg-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={form.shastra2_title || ''}
                    onChange={(e) => handleChange('shastra2_title', e.target.value)}
                    placeholder="Title"
                    className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                  />
                  <input
                    type="text"
                    value={form.shastra2_sanskrit || ''}
                    onChange={(e) => handleChange('shastra2_sanskrit', e.target.value)}
                    placeholder="Sanskrit Term"
                    className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  value={form.shastra2_desc || ''}
                  onChange={(e) => handleChange('shastra2_desc', e.target.value)}
                  placeholder="Description"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </div>

              {/* Shastra 3 */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2.5 md:col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#721C24]">Shastra 3: Pramana (Valid Cognition)</span>
                  <input
                    type="text"
                    value={form.shastra3_years || ''}
                    onChange={(e) => handleChange('shastra3_years', e.target.value)}
                    placeholder="Years"
                    className="text-[11px] p-1.5 rounded-lg border border-gray-300 bg-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={form.shastra3_title || ''}
                    onChange={(e) => handleChange('shastra3_title', e.target.value)}
                    placeholder="Title"
                    className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                  />
                  <input
                    type="text"
                    value={form.shastra3_sanskrit || ''}
                    onChange={(e) => handleChange('shastra3_sanskrit', e.target.value)}
                    placeholder="Sanskrit Term"
                    className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  value={form.shastra3_desc || ''}
                  onChange={(e) => handleChange('shastra3_desc', e.target.value)}
                  placeholder="Description"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CAMPUS FACILITIES */}
        {activeTab === 'facilities' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A] font-serif-brand">Monastic Campus Facilities</h3>
              <p className="text-xs text-gray-500">Manage descriptions for debate courtyards, library, and retreat huts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Section Title</label>
                <input
                  type="text"
                  value={form.shedra_fac_title || ''}
                  onChange={(e) => handleChange('shedra_fac_title', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Section Summary</label>
                <textarea
                  rows={2}
                  value={form.shedra_fac_desc || ''}
                  onChange={(e) => handleChange('shedra_fac_desc', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Facility 1 */}
              <div className="p-4 rounded-xl border border-gray-200 space-y-2 bg-gray-50">
                <label className="text-xs font-bold text-[#0F172A]">Facility 1: Debate Courtyard</label>
                <input
                  type="text"
                  value={form.shedra_fac_1_title || ''}
                  onChange={(e) => handleChange('shedra_fac_1_title', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
                <textarea
                  rows={2}
                  value={form.shedra_fac_1_desc || ''}
                  onChange={(e) => handleChange('shedra_fac_1_desc', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </div>

              {/* Facility 2 */}
              <div className="p-4 rounded-xl border border-gray-200 space-y-2 bg-gray-50">
                <label className="text-xs font-bold text-[#0F172A]">Facility 2: Pecha Scriptorium</label>
                <input
                  type="text"
                  value={form.shedra_fac_2_title || ''}
                  onChange={(e) => handleChange('shedra_fac_2_title', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
                <textarea
                  rows={2}
                  value={form.shedra_fac_2_desc || ''}
                  onChange={(e) => handleChange('shedra_fac_2_desc', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ADMISSIONS */}
        {activeTab === 'admissions' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A] font-serif-brand">Admissions & Monastic Benefits</h3>
              <p className="text-xs text-gray-500">Configure application headers and student monk benefit bullet points.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Admissions Headline</label>
                <input
                  type="text"
                  value={form.shedra_admit_title || ''}
                  onChange={(e) => handleChange('shedra_admit_title', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Admissions Description</label>
                <textarea
                  rows={2}
                  value={form.shedra_admit_desc || ''}
                  onChange={(e) => handleChange('shedra_admit_desc', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Monastic Benefit 1</label>
                <input
                  type="text"
                  value={form.shedra_benefit_1 || ''}
                  onChange={(e) => handleChange('shedra_benefit_1', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Monastic Benefit 2</label>
                <input
                  type="text"
                  value={form.shedra_benefit_2 || ''}
                  onChange={(e) => handleChange('shedra_benefit_2', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Save Action */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Link
            to="/admin/pages"
            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 font-semibold"
          >
            <span>← Back to Pages Directory</span>
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="monastic-maroon-btn px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#D4AF37]" />}
            <span>{saving ? 'Publishing Changes...' : 'Save & Synchronize Live'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
