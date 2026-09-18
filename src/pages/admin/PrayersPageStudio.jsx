import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Save, RefreshCw, Sparkles, Image, CheckCircle2, ArrowRight,
  ExternalLink, Flame, Heart, Shield, Clock, ChevronRight, UploadCloud
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function PrayersPageStudio() {
  const { success, error } = useToast();
  const location = useLocation();

  const initialTab = location.hash ? location.hash.replace('#', '') : 'hero';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    // 1. Hero
    prayer_tibetan_eyebrow: '༄༅། །མར་མེ་སྨོན་ལམ། • Consecrated Sangha Pujas & Butter Lamps',
    prayer_hero_title: 'Sacred Prayer Dedication & Offerings',
    prayer_hero_subtitle: 'Our resident monastic Sangha at Drodul Phendey Ling recites daily consecrated prayers and illuminates brass butter lamps before the holy altar for world peace, health, longevity, and obstacle clearance.',

    // 2. Butter Lamps Offerings
    prayer_lamp_badge: 'Altar Illuminations',
    prayer_lamp_title: '108 Sacred Butter Lamp Illuminations',
    prayer_tier_1_count: 21,
    prayer_tier_1_amt: 500,
    prayer_tier_1_label: '21 Lamps (Noble Tara Blessing)',
    prayer_tier_2_count: 108,
    prayer_tier_2_amt: 1500,
    prayer_tier_2_label: '108 Lamps (Full Sacred Mala)',
    prayer_tier_3_count: 500,
    prayer_tier_3_amt: 5000,
    prayer_tier_3_label: '500 Lamps (Grand Shrine Offering)',
    prayer_tier_4_count: 1000,
    prayer_tier_4_amt: 10000,
    prayer_tier_4_label: '1,000 Lamps (Monumental Stupa Merit)',

    // 3. Sacred Pujas
    prayer_puja_heading: 'Traditional Ceremonial Pujas Conducted',
    prayer_puja_1_title: 'Mahakala & Dharmapala Protector Puja',
    prayer_puja_1_desc: 'Wrathful guardian rites chanted at dusk to clear severe karmic obstacles and pacify negative energies.',
    prayer_puja_2_title: 'Medicine Buddha Healing Dharani',
    prayer_puja_2_desc: 'Recitations for swift recovery from illness, surgery, physical affliction, and mental suffering.',
    prayer_puja_3_title: '21 Praises to Noble Tara',
    prayer_puja_3_desc: 'Swift mother of compassion invocation for protection from fear, danger, and fulfilling virtuous intentions.',
    prayer_puja_4_title: 'Bardo & Amitabha Memorial Dedications',
    prayer_puja_4_desc: 'Consecrated name recitations guiding deceased relatives safely through the transitional bardo realm.',

    // 4. Shrine Schedule
    prayer_schedule_title: 'Daily Monastic Puja Timetable',
    prayer_schedule_desc: 'Consecrated offerings are conducted at dawn and dusk according to traditional astrological lunar cycles.',
    prayer_schedule_morning: '05:30 AM - 07:30 AM: Morning Sang Offering & Mahakala Repelling',
    prayer_schedule_evening: '05:00 PM - 07:00 PM: 108 Butter Lamp Illumination & Tara Dharani',
    prayer_schedule_lunar: '10th & 25th Lunar Days: Grand Guru Rinpoche & Dakini Tsog Offerings',
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

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', { settings: form });
      if (res.data?.success) {
        success('Prayer & Ceremonies studio changes saved! Public page updated live.');
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
    { id: 'butterlamps', label: '2. 108 Butter Lamps Tiers', icon: Flame },
    { id: 'pujas', label: '3. Puja Categories', icon: Heart },
    { id: 'schedule', label: '4. Shrine Daily Schedule', icon: Clock },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
        <p className="text-xs">Loading Ceremonial Prayers Studio configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] p-6 rounded-2xl text-white border border-[#1E293B] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1E293B] border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-md">
            🪔
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-serif-brand text-white">Ceremonial Prayers & Butter Lamps Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#721C24] text-amber-200 border border-amber-400/30 uppercase tracking-wider">
                Full CMS Control
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-light">
              Manage holy butter lamp dedication tiers, puja types, and shrine schedules for <code className="text-amber-300">/prayer-request</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/prayer-request"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <span>View Public /prayer-request</span>
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
              <h3 className="text-base font-bold text-[#0F172A] font-serif-brand">Prayers Page Banner & Inscription</h3>
              <p className="text-xs text-gray-500">Configure sacred Tibetan mantra eyebrow and hero lede text.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Tibetan Eyebrow Inscription</label>
                <input
                  type="text"
                  value={form.prayer_tibetan_eyebrow || ''}
                  onChange={(e) => handleChange('prayer_tibetan_eyebrow', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-tibetan"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Hero Heading</label>
                <input
                  type="text"
                  value={form.prayer_hero_title || ''}
                  onChange={(e) => handleChange('prayer_hero_title', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold text-[#0F172A]"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Hero Lede Paragraph</label>
                <textarea
                  rows={3}
                  value={form.prayer_hero_subtitle || ''}
                  onChange={(e) => handleChange('prayer_hero_subtitle', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUTTER LAMPS */}
        {activeTab === 'butterlamps' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A] font-serif-brand">108 Butter Lamp Offering Tiers</h3>
              <p className="text-xs text-gray-500">Configure lamp count buttons, suggested donations, and spiritual descriptions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tier 1 */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-[#721C24]">Tier 1 Offering</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Lamps Count</label>
                    <input
                      type="number"
                      value={form.prayer_tier_1_count || 21}
                      onChange={(e) => handleChange('prayer_tier_1_count', Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Offering (BTN)</label>
                    <input
                      type="number"
                      value={form.prayer_tier_1_amt || 500}
                      onChange={(e) => handleChange('prayer_tier_1_amt', Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-mono font-bold"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={form.prayer_tier_1_label || ''}
                  onChange={(e) => handleChange('prayer_tier_1_label', e.target.value)}
                  placeholder="Tier Label"
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>

              {/* Tier 2 */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-[#721C24]">Tier 2 Offering (Default 108)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Lamps Count</label>
                    <input
                      type="number"
                      value={form.prayer_tier_2_count || 108}
                      onChange={(e) => handleChange('prayer_tier_2_count', Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Offering (BTN)</label>
                    <input
                      type="number"
                      value={form.prayer_tier_2_amt || 1500}
                      onChange={(e) => handleChange('prayer_tier_2_amt', Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-mono font-bold"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={form.prayer_tier_2_label || ''}
                  onChange={(e) => handleChange('prayer_tier_2_label', e.target.value)}
                  placeholder="Tier Label"
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>

              {/* Tier 3 */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-[#721C24]">Tier 3 Offering (500 Lamps)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Lamps Count</label>
                    <input
                      type="number"
                      value={form.prayer_tier_3_count || 500}
                      onChange={(e) => handleChange('prayer_tier_3_count', Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Offering (BTN)</label>
                    <input
                      type="number"
                      value={form.prayer_tier_3_amt || 5000}
                      onChange={(e) => handleChange('prayer_tier_3_amt', Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-mono font-bold"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={form.prayer_tier_3_label || ''}
                  onChange={(e) => handleChange('prayer_tier_3_label', e.target.value)}
                  placeholder="Tier Label"
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>

              {/* Tier 4 */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-[#721C24]">Tier 4 Offering (1,000 Lamps)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Lamps Count</label>
                    <input
                      type="number"
                      value={form.prayer_tier_4_count || 1000}
                      onChange={(e) => handleChange('prayer_tier_4_count', Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Offering (BTN)</label>
                    <input
                      type="number"
                      value={form.prayer_tier_4_amt || 10000}
                      onChange={(e) => handleChange('prayer_tier_4_amt', Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-mono font-bold"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={form.prayer_tier_4_label || ''}
                  onChange={(e) => handleChange('prayer_tier_4_label', e.target.value)}
                  placeholder="Tier Label"
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PUJA CATEGORIES */}
        {activeTab === 'pujas' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A] font-serif-brand">Sacred Ceremonial Pujas</h3>
              <p className="text-xs text-gray-500">Edit titles and descriptions of pujas conducted for devotees.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Puja 1 */}
              <div className="p-4 rounded-xl border border-gray-200 space-y-2 bg-gray-50">
                <label className="text-xs font-bold text-[#0F172A]">Puja 1: Mahakala Protector</label>
                <input
                  type="text"
                  value={form.prayer_puja_1_title || ''}
                  onChange={(e) => handleChange('prayer_puja_1_title', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
                <textarea
                  rows={2}
                  value={form.prayer_puja_1_desc || ''}
                  onChange={(e) => handleChange('prayer_puja_1_desc', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </div>

              {/* Puja 2 */}
              <div className="p-4 rounded-xl border border-gray-200 space-y-2 bg-gray-50">
                <label className="text-xs font-bold text-[#0F172A]">Puja 2: Medicine Buddha</label>
                <input
                  type="text"
                  value={form.prayer_puja_2_title || ''}
                  onChange={(e) => handleChange('prayer_puja_2_title', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
                <textarea
                  rows={2}
                  value={form.prayer_puja_2_desc || ''}
                  onChange={(e) => handleChange('prayer_puja_2_desc', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </div>

              {/* Puja 3 */}
              <div className="p-4 rounded-xl border border-gray-200 space-y-2 bg-gray-50">
                <label className="text-xs font-bold text-[#0F172A]">Puja 3: 21 Taras</label>
                <input
                  type="text"
                  value={form.prayer_puja_3_title || ''}
                  onChange={(e) => handleChange('prayer_puja_3_title', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
                <textarea
                  rows={2}
                  value={form.prayer_puja_3_desc || ''}
                  onChange={(e) => handleChange('prayer_puja_3_desc', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </div>

              {/* Puja 4 */}
              <div className="p-4 rounded-xl border border-gray-200 space-y-2 bg-gray-50">
                <label className="text-xs font-bold text-[#0F172A]">Puja 4: Bardo Memorial</label>
                <input
                  type="text"
                  value={form.prayer_puja_4_title || ''}
                  onChange={(e) => handleChange('prayer_puja_4_title', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                />
                <textarea
                  rows={2}
                  value={form.prayer_puja_4_desc || ''}
                  onChange={(e) => handleChange('prayer_puja_4_desc', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SHRINE SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A] font-serif-brand">Shrine Daily Ritual Schedule</h3>
              <p className="text-xs text-gray-500">Configure chanting hours, butter lamp illumination times, and lunar feast dates.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Morning Session Timing</label>
                <input
                  type="text"
                  value={form.prayer_schedule_morning || ''}
                  onChange={(e) => handleChange('prayer_schedule_morning', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Evening Session Timing</label>
                <input
                  type="text"
                  value={form.prayer_schedule_evening || ''}
                  onChange={(e) => handleChange('prayer_schedule_evening', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Lunar Feast & Tsog Observance</label>
                <input
                  type="text"
                  value={form.prayer_schedule_lunar || ''}
                  onChange={(e) => handleChange('prayer_schedule_lunar', e.target.value)}
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
