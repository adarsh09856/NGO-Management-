import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Save, RefreshCw, Sparkles, MapPin, Phone, Mail, Clock,
  ExternalLink, Compass, Heart, BookOpen, Users, ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ContactPageStudio() {
  const { success, error } = useToast();
  const location = useLocation();

  const initialTab = location.hash ? location.hash.replace('#', '') : 'hero';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    // 1. Hero
    contact_hero_badge: '༄༅། །འབྲེལ་གཏུགས་དང་ཞབས་ཞུ། · Sacred Connection',
    contact_hero_title: 'Connect with Drodul Phendey Ling',
    contact_hero_subtitle: 'Whether you wish to sponsor stupa construction, request ceremonial monastic pujas, enroll in the Shedra academy, or visit our holy sanctuary in Gelephu, our secretariat is at your service.',

    // 2. Secretariat Seat
    contact_seat_name: 'Drodul Phendey Ling Monastic Foundation Secretariat',
    contact_seat_address: 'Great Druk Wangyel Peace Stupa Complex, Gelephu, Sarpang Dzongkhag, Kingdom of Bhutan',
    contact_seat_pobox: 'P.O. Box 210, Gelephu Post Office, Sarpang, Bhutan',
    contact_seat_reg: 'ROB Registered Religious Organization: ROB/2018/092',

    // 3. Directory
    contact_general_phone: '+975 17556559',
    contact_general_email: 'contact@drodulphendeyling.org',
    contact_abbot_email: 'abbot@drodulphendeyling.org',
    contact_dana_email: 'donations@drodulphendeyling.org',
    contact_shedra_email: 'shedra@drodulphendeyling.org',

    // 4. Visiting Hours & Map
    contact_hours_weekdays: 'Monday - Saturday: 08:00 AM - 05:00 PM (BST)',
    contact_hours_sunday: 'Sunday: 09:00 AM - 01:00 PM (Sanctuary Open for Circumambulation)',
    contact_map_url: 'https://maps.google.com/maps?q=Gelephu%20Bhutan&t=&z=13&ie=UTF8&iwloc=&output=embed',
    contact_map_coords: '26.8833° N, 90.4998° E (Gelephu Himalayan Foothills)',
    contact_visiting_notice: 'Modest attire required within the stupa inner circumambulation courtyard. Photography is prohibited inside the upper relic sanctuary.',
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
        success('Monastery Secretariat & Contact studio changes saved! Live page updated.');
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
    { id: 'hero', label: '1. Hero & Inscriptions', icon: Sparkles },
    { id: 'seat', label: '2. Secretariat Seat & Address', icon: MapPin },
    { id: 'directory', label: '3. Contact Directory', icon: Phone },
    { id: 'visiting', label: '4. Visiting Hours & Map', icon: Clock },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
        <p className="text-xs">Loading Secretariat & Contact Studio configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] p-6 rounded-2xl text-white border border-[#1E293B] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1E293B] border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-md">
            📍
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-serif-brand text-white">Monastery Secretariat & Contact Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#721C24] text-amber-200 border border-amber-400/30 uppercase tracking-wider">
                Full CMS Control
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-light">
              Manage registered seat, official phone/email directory, and visitor map for <code className="text-amber-300">/contact</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/contact"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <span>View Public /contact</span>
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
              <h3 className="text-base font-bold text-[#0F172A] font-serif-brand">Contact Page Hero & Inscription</h3>
              <p className="text-xs text-gray-500">Configure sacred Tibetan mantra badge and headline copy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Tibetan Eyebrow Inscription</label>
                <input
                  type="text"
                  value={form.contact_hero_badge || ''}
                  onChange={(e) => handleChange('contact_hero_badge', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-tibetan"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Hero Heading</label>
                <input
                  type="text"
                  value={form.contact_hero_title || ''}
                  onChange={(e) => handleChange('contact_hero_title', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold text-[#0F172A]"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Hero Lede Paragraph</label>
                <textarea
                  rows={3}
                  value={form.contact_hero_subtitle || ''}
                  onChange={(e) => handleChange('contact_hero_subtitle', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECRETARIAT SEAT */}
        {activeTab === 'seat' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A] font-serif-brand">Secretariat Physical Seat & Legal Address</h3>
              <p className="text-xs text-gray-500">Configure official monastic foundation location details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Official Seat Legal Name</label>
                <input
                  type="text"
                  value={form.contact_seat_name || ''}
                  onChange={(e) => handleChange('contact_seat_name', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Full Physical Campus Address</label>
                <input
                  type="text"
                  value={form.contact_seat_address || ''}
                  onChange={(e) => handleChange('contact_seat_address', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Postal Box & Zip</label>
                <input
                  type="text"
                  value={form.contact_seat_pobox || ''}
                  onChange={(e) => handleChange('contact_seat_pobox', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">ROB Statutory Registration String</label>
                <input
                  type="text"
                  value={form.contact_seat_reg || ''}
                  onChange={(e) => handleChange('contact_seat_reg', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A] font-serif-brand">Official Department Directory</h3>
              <p className="text-xs text-gray-500">Manage phone lines, WhatsApp numbers, and departmental email inboxes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">General Secretariat Phone</label>
                <input
                  type="text"
                  value={form.contact_general_phone || ''}
                  onChange={(e) => handleChange('contact_general_phone', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">General Inquiries Email</label>
                <input
                  type="email"
                  value={form.contact_general_email || ''}
                  onChange={(e) => handleChange('contact_general_email', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Abbot's Office Email</label>
                <input
                  type="email"
                  value={form.contact_abbot_email || ''}
                  onChange={(e) => handleChange('contact_abbot_email', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Stupa Dana & Treasury Desk Email</label>
                <input
                  type="email"
                  value={form.contact_dana_email || ''}
                  onChange={(e) => handleChange('contact_dana_email', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Shedra Academic Admissions Email</label>
                <input
                  type="email"
                  value={form.contact_shedra_email || ''}
                  onChange={(e) => handleChange('contact_shedra_email', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VISITING HOURS & MAP */}
        {activeTab === 'visiting' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A] font-serif-brand">Pilgrim Visiting Hours & Map Embed</h3>
              <p className="text-xs text-gray-500">Configure visiting hours, pilgrim guidelines, and Google Map iframe coordinates.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Weekday Visiting Hours</label>
                <input
                  type="text"
                  value={form.contact_hours_weekdays || ''}
                  onChange={(e) => handleChange('contact_hours_weekdays', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Sunday Sanctuary Hours</label>
                <input
                  type="text"
                  value={form.contact_hours_sunday || ''}
                  onChange={(e) => handleChange('contact_hours_sunday', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Google Maps Embed URL (iframe source)</label>
                <input
                  type="text"
                  value={form.contact_map_url || ''}
                  onChange={(e) => handleChange('contact_map_url', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Pilgrim Sacred Etiquette & Dress Code Notice</label>
                <textarea
                  rows={3}
                  value={form.contact_visiting_notice || ''}
                  onChange={(e) => handleChange('contact_visiting_notice', e.target.value)}
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
