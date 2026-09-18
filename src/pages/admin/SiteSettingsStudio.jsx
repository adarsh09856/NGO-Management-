import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Save, RefreshCw, Globe, Phone, Mail, MapPin, Building,
  CheckCircle2, ArrowRight, ExternalLink, ChevronRight, Share2, Palette
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SiteSettingsStudio() {
  const { success, error } = useToast();
  const location = useLocation();

  const initialTab = location.hash ? location.hash.replace('#', '') : 'header';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    // 1. Header & Utility
    header_location: 'Gelephu, Bhutan',
    header_phone: '+975 17556559',
    header_email: 'contact@drodulphendeyling.org',
    header_announcement: '༄༅། །108-Foot Great Druk Wangyel Peace Stupa Consecration & Daily Butter Lamp Prayers',
    header_announcement_link: '/prayer-request',
    header_announcement_on: 'true',

    // 2. Footer
    footer_tibetan_blessing: '༄༅། །བཀྲ་ཤིས་བདེ་ལེགས་ཕུན་སུམ་ཚོགས།',
    footer_copyright: '© 2026 Drodul Phendey Ling Foundation · All Rights Reserved',
    footer_description: 'Registered Religious Organization (ROB) in the Kingdom of Bhutan dedicated to the preservation of Buddhist heritage, monk education, and monumental peace stupas.',

    // 3. Contact Info
    contact_seat_label: 'Official Monastic Seat',
    contact_seat_title: 'Monastery Secretariat',
    contact_address: 'Drodul Phendey Ling Foundation, Near Peace Stupa Complex, Gelephu, Sarpang Dzongkhag, Kingdom of Bhutan',
    contact_phone: '+975 17556559 / +975 06 251122',
    contact_email: 'contact@drodulphendeyling.org',
    contact_hours: 'Mon – Sat: 8:00 AM – 5:00 PM (BST) · Closed on Auspicious Chokhor Duchen',

    // 4. Social & Digital
    social_facebook: 'https://facebook.com/drodulphendeyling',
    social_instagram: 'https://instagram.com/drodulphendeyling',
    social_youtube: 'https://youtube.com/@drodulphendeyling',
    social_whatsapp: '+97517556559',

    // 5. Brand
    brand_dzongkha_name: 'དྲོ་བདུལ་ཕན་བདེ་གླིང་།',
    brand_english_name: 'Drodul Phendey Ling Foundation',
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
        success('Global site settings updated successfully! Public layout updated.');
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
    { id: 'header', label: '1. Header & Utility Bar', icon: Globe },
    { id: 'contact', label: '2. Secretariat Contact', icon: Phone },
    { id: 'footer', label: '3. Footer & Legal Strip', icon: Building },
    { id: 'social', label: '4. Social & External Links', icon: Share2 },
    { id: 'brand', label: '5. Brand & Nomenclature', icon: Palette },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
        <p className="text-xs">Loading Site Settings Studio...</p>
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
                Global Site Settings Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#0F172A] uppercase">
                Global CMS
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Control the top utility bar, marquee announcement, global footer, secretariat contact details, and social channels.
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
            <span>Preview Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#B89628] hover:to-[#96781D] text-[#0F172A] font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Publishing...' : 'Publish Global Settings'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sub-Tabs */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-2 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Global Layout
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
          {/* 1. HEADER & UTILITY BAR                                   */}
          {/* ========================================================= */}
          {activeTab === 'header' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-amber-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Header & Top Utility Bar</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Displayed at the very top of all public pages across desktop and mobile devices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location Label</label>
                  <input
                    type="text"
                    value={form.header_location || ''}
                    onChange={(e) => handleChange('header_location', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Header Phone Number</label>
                  <input
                    type="text"
                    value={form.header_phone || ''}
                    onChange={(e) => handleChange('header_phone', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Header Email Address</label>
                  <input
                    type="text"
                    value={form.header_email || ''}
                    onChange={(e) => handleChange('header_email', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Top Announcement Marquee Copy</label>
                <input
                  type="text"
                  value={form.header_announcement || ''}
                  onChange={(e) => handleChange('header_announcement', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Link Target</label>
                  <input
                    type="text"
                    value={form.header_announcement_link || ''}
                    onChange={(e) => handleChange('header_announcement_link', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Announcement Ticker?</label>
                  <select
                    value={form.header_announcement_on || 'true'}
                    onChange={(e) => handleChange('header_announcement_on', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-bold"
                  >
                    <option value="true">YES - Show Announcement on Public Site</option>
                    <option value="false">NO - Hide Announcement</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. SECRETARIAT CONTACT INFO                               */}
          {/* ========================================================= */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/60 text-blue-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Monastery Secretariat Information</h3>
                <p className="text-xs text-blue-800 mt-0.5">
                  Governs contact cards on `/contact`, footer address, and official correspondence dispatches.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Seat Eyebrow Label</label>
                  <input
                    type="text"
                    value={form.contact_seat_label || ''}
                    onChange={(e) => handleChange('contact_seat_label', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Seat Heading</label>
                  <input
                    type="text"
                    value={form.contact_seat_title || ''}
                    onChange={(e) => handleChange('contact_seat_title', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physical Monastery Address</label>
                <textarea
                  rows={2}
                  value={form.contact_address || ''}
                  onChange={(e) => handleChange('contact_address', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Secretariat Telephone / WhatsApp</label>
                  <input
                    type="text"
                    value={form.contact_phone || ''}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Dispatch Email</label>
                  <input
                    type="text"
                    value={form.contact_email || ''}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Office & Visiting Hours</label>
                <input
                  type="text"
                  value={form.contact_hours || ''}
                  onChange={(e) => handleChange('contact_hours', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. FOOTER                                                 */}
          {/* ========================================================= */}
          {activeTab === 'footer' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/60 text-rose-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Footer & Legal Strip</h3>
                <p className="text-xs text-rose-800 mt-0.5">
                  Controls the bottom sacred blessing banner, copyright notice, and foundation description.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan Auspicious Blessing</label>
                <input
                  type="text"
                  value={form.footer_tibetan_blessing || ''}
                  onChange={(e) => handleChange('footer_tibetan_blessing', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-tibetan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Copyright Line</label>
                <input
                  type="text"
                  value={form.footer_copyright || ''}
                  onChange={(e) => handleChange('footer_copyright', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Foundation Mission Description</label>
                <textarea
                  rows={3}
                  value={form.footer_description || ''}
                  onChange={(e) => handleChange('footer_description', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. SOCIAL & EXTERNAL CHANNELS                             */}
          {/* ========================================================= */}
          {activeTab === 'social' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200/60 text-purple-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Social & Digital Channels</h3>
                <p className="text-xs text-purple-800 mt-0.5">
                  Links displayed in the public footer, contact page, and communication dispatches.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Page URL</label>
                  <input
                    type="text"
                    value={form.social_facebook || ''}
                    onChange={(e) => handleChange('social_facebook', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Profile URL</label>
                  <input
                    type="text"
                    value={form.social_instagram || ''}
                    onChange={(e) => handleChange('social_instagram', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">YouTube Channel URL</label>
                  <input
                    type="text"
                    value={form.social_youtube || ''}
                    onChange={(e) => handleChange('social_youtube', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Hotline Number</label>
                  <input
                    type="text"
                    value={form.social_whatsapp || ''}
                    onChange={(e) => handleChange('social_whatsapp', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. BRAND & IDENTITY                                       */}
          {/* ========================================================= */}
          {activeTab === 'brand' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-amber-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Brand Nomenclature</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Official name rendered across page titles, crests, and receipts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Dzongkha Tibetan Name</label>
                  <input
                    type="text"
                    value={form.brand_dzongkha_name || ''}
                    onChange={(e) => handleChange('brand_dzongkha_name', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-tibetan text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official English Name</label>
                  <input
                    type="text"
                    value={form.brand_english_name || ''}
                    onChange={(e) => handleChange('brand_english_name', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
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
              <span>{saving ? 'Publishing Changes...' : 'Save & Publish Global Site Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
