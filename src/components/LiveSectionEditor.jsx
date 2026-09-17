import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Save, RefreshCw, Sparkles, Image, CheckCircle2,
  Globe, Heart, Phone, Mail, MapPin, Building, BookOpen,
  FileText, ExternalLink, Sliders, Shield, Award, Landmark
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function LiveSectionEditor({
  isOpen,
  onClose,
  initialSection = 'hero'
}) {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState(initialSection);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State covering all sections
  const [formData, setFormData] = useState({
    // 1. Hero
    home_hero_title: '',
    home_hero_subtitle: '',
    home_hero_image: '',
    home_hero_cta_text: 'Offer Dana',
    home_hero_cta_link: '/donate',

    // 2. About Band & Page
    home_about_title: '',
    home_about_description: '',
    about_page_title: '',
    about_page_subtitle: '',
    about_pillar_1_title: '',
    about_pillar_1_desc: '',
    about_pillar_2_title: '',
    about_pillar_2_desc: '',
    about_pillar_3_title: '',
    about_pillar_3_desc: '',
    about_leader_name: '',
    about_leader_title: '',
    about_leader_bio: '',
    about_history_text: '',

    // 3. Contact Info
    contact_address: '',
    contact_phone: '',
    contact_email: '',
    contact_hours: '',
    contact_map_url: '',

    // 4. Donate & Banking
    donate_hero_title: '',
    donate_hero_subtitle: '',
    donation_preset_amounts: '500, 1100, 2100, 5100, 11000',
    donation_default_amount: '1100',
    bank_name: '',
    bank_account_name: '',
    bank_account_no: '',
    bank_swift_code: '',
    bank_branch: '',
    tax_exempt_reg: '',
    tax_80g_order_no: '',

    // 5. Header & Utility
    header_phone: '',
    header_email: '',
    header_location: '',
    header_announcement: '',
    header_announcement_on: 'true',

    // 6. Footer & Social
    footer_copyright: '',
    social_facebook: '',
    social_instagram: '',
    social_youtube: ''
  });

  useEffect(() => {
    if (initialSection) setActiveTab(initialSection);
  }, [initialSection]);

  // Load existing settings on open
  useEffect(() => {
    if (!isOpen) return;
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.data?.success && res.data.data) {
          setFormData((prev) => ({
            ...prev,
            ...res.data.data
          }));
        }
      } catch (err) {
        console.error('Failed to load settings in editor:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/settings', { settings: formData });
      if (res.data?.success) {
        // Dispatch instant event for all public React components
        window.dispatchEvent(
          new CustomEvent('ngo:settings-updated', {
            detail: { settings: formData, section: activeTab }
          })
        );
        success('Changes published and live instantly across all pages!');
      } else {
        error(res.data?.message || 'Failed to save changes');
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  // In-place Image Uploader
  const handleImageUpload = async (e, targetKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      setUploadingImage(true);
      const res = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data.url) {
        handleChange(targetKey, res.data.url);
        success('Image uploaded successfully!');
      }
    } catch (err) {
      error('Image upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const tabs = [
    { id: 'hero', label: 'Home Hero', icon: Sparkles },
    { id: 'about', label: 'About & Mandate', icon: BookOpen },
    { id: 'contact', label: 'Contact Info', icon: Phone },
    { id: 'donate', label: 'Donation & Bank', icon: Heart },
    { id: 'navbar', label: 'Header & Announcement', icon: Globe },
    { id: 'footer', label: 'Footer & Social', icon: Building }
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#D4AF37]/40">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#0F172A] text-white border-b border-[#1E293B] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1E293B] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold text-sm">
              ☸
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                <span>Universal Live Section Editor</span>
                <span className="text-[10px] bg-[#D4AF37] text-[#0F172A] px-1.5 py-0.5 rounded font-bold uppercase">
                  Real-time
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">
                Edits reflect immediately on all public pages with zero page reload
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center overflow-x-auto no-scrollbar bg-[#F8FAFC] border-b border-[#E2E8F0] px-3 pt-2 flex-shrink-0 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition-all whitespace-nowrap border-t-2 ${
                  isSelected
                    ? 'bg-white text-[#0F172A] border-[#D4AF37] shadow-sm'
                    : 'text-gray-500 hover:text-[#0F172A] border-transparent hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar text-xs">
          {loading ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37]" />
              <p>Loading live configuration from database...</p>
            </div>
          ) : (
            <>
              {/* ========================================================= */}
              {/* 1. HERO SECTION TAB                                       */}
              {/* ========================================================= */}
              {activeTab === 'hero' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-amber-900">
                    <p className="font-bold">Homepage Hero Banner</p>
                    <p className="text-[11px] text-amber-700">
                      Controls the top cinematic showcase, mission title, and call to action on the public home page.
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Hero Main Title</label>
                    <input
                      type="text"
                      value={formData.home_hero_title || ''}
                      onChange={(e) => handleChange('home_hero_title', e.target.value)}
                      placeholder="Sacred Dharma Sanctuary & 108ft Peace Stupa"
                      className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Hero Subtitle / Description</label>
                    <textarea
                      rows={3}
                      value={formData.home_hero_subtitle || ''}
                      onChange={(e) => handleChange('home_hero_subtitle', e.target.value)}
                      placeholder="Dedicated to the preservation of sacred Vajrayana Buddhist heritage..."
                      className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Hero Background Image URL</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={formData.home_hero_image || ''}
                        onChange={(e) => handleChange('home_hero_image', e.target.value)}
                        placeholder="https://images.unsplash.com/... or /uploads/..."
                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-mono text-[11px]"
                      />
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors">
                          <Image className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{uploadingImage ? 'Uploading...' : 'Upload Image from Computer'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingImage}
                            onChange={(e) => handleImageUpload(e, 'home_hero_image')}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {formData.home_hero_image && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                          <img
                            src={formData.home_hero_image}
                            alt="Hero Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={formData.home_hero_cta_text || ''}
                        onChange={(e) => handleChange('home_hero_cta_text', e.target.value)}
                        placeholder="Offer Dana"
                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">CTA Button Link</label>
                      <input
                        type="text"
                        value={formData.home_hero_cta_link || ''}
                        onChange={(e) => handleChange('home_hero_cta_link', e.target.value)}
                        placeholder="/donate"
                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 2. ABOUT & MANDATE TAB                                    */}
              {/* ========================================================= */}
              {activeTab === 'about' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 text-blue-900">
                    <p className="font-bold">Monastery Mandate & About Page</p>
                    <p className="text-[11px] text-blue-700">
                      Update the sacred mandate band on homepage and the core pillars on the dedicated /about page.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="font-bold text-gray-900 border-b pb-1 text-xs">Homepage Mandate Band</h4>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Band Headline</label>
                      <input
                        type="text"
                        value={formData.home_about_title || ''}
                        onChange={(e) => handleChange('home_about_title', e.target.value)}
                        placeholder="The Sacred Mandate of Drodul Phendey Ling"
                        className="w-full p-2.5 rounded-lg border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Band Description</label>
                      <textarea
                        rows={2}
                        value={formData.home_about_description || ''}
                        onChange={(e) => handleChange('home_about_description', e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <h4 className="font-bold text-gray-900 border-b pb-1 text-xs">About Page Core Pillars</h4>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Pillar 1 Title</label>
                      <input
                        type="text"
                        value={formData.about_pillar_1_title || ''}
                        onChange={(e) => handleChange('about_pillar_1_title', e.target.value)}
                        placeholder="Sacred Lineage & Vision"
                        className="w-full p-2 rounded-lg border border-gray-300"
                      />
                      <textarea
                        rows={2}
                        value={formData.about_pillar_1_desc || ''}
                        onChange={(e) => handleChange('about_pillar_1_desc', e.target.value)}
                        placeholder="Pillar 1 description..."
                        className="w-full p-2 mt-1 rounded-lg border border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Pillar 2 Title</label>
                      <input
                        type="text"
                        value={formData.about_pillar_2_title || ''}
                        onChange={(e) => handleChange('about_pillar_2_title', e.target.value)}
                        placeholder="Shedra Monastic University"
                        className="w-full p-2 rounded-lg border border-gray-300"
                      />
                      <textarea
                        rows={2}
                        value={formData.about_pillar_2_desc || ''}
                        onChange={(e) => handleChange('about_pillar_2_desc', e.target.value)}
                        placeholder="Pillar 2 description..."
                        className="w-full p-2 mt-1 rounded-lg border border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Pillar 3 Title</label>
                      <input
                        type="text"
                        value={formData.about_pillar_3_title || ''}
                        onChange={(e) => handleChange('about_pillar_3_title', e.target.value)}
                        placeholder="Great Peace Stupa"
                        className="w-full p-2 rounded-lg border border-gray-300"
                      />
                      <textarea
                        rows={2}
                        value={formData.about_pillar_3_desc || ''}
                        onChange={(e) => handleChange('about_pillar_3_desc', e.target.value)}
                        placeholder="Pillar 3 description..."
                        className="w-full p-2 mt-1 rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <h4 className="font-bold text-gray-900 border-b pb-1 text-xs">Spiritual Leadership</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Leader Name</label>
                        <input
                          type="text"
                          value={formData.about_leader_name || ''}
                          onChange={(e) => handleChange('about_leader_name', e.target.value)}
                          placeholder="H.E. Khenpo Karma Rinpoche"
                          className="w-full p-2 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Leader Title</label>
                        <input
                          type="text"
                          value={formData.about_leader_title || ''}
                          onChange={(e) => handleChange('about_leader_title', e.target.value)}
                          placeholder="Abbot & Spiritual Director"
                          className="w-full p-2 rounded-lg border border-gray-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Leader Bio</label>
                      <textarea
                        rows={2}
                        value={formData.about_leader_bio || ''}
                        onChange={(e) => handleChange('about_leader_bio', e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 3. CONTACT INFO TAB                                       */}
              {/* ========================================================= */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-emerald-900">
                    <p className="font-bold">Contact Details & Visiting Hours</p>
                    <p className="text-[11px] text-emerald-700">
                      Synchronized across the /contact page, footer, and topbar.
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Monastery Physical Address</label>
                    <textarea
                      rows={2}
                      value={formData.contact_address || ''}
                      onChange={(e) => handleChange('contact_address', e.target.value)}
                      placeholder="Great Druk Wangyel Peace Stupa Complex, Gelephu, Sarpang Dzongkhag, Kingdom of Bhutan"
                      className="w-full p-2.5 rounded-lg border border-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Contact Telephone</label>
                      <input
                        type="text"
                        value={formData.contact_phone || ''}
                        onChange={(e) => handleChange('contact_phone', e.target.value)}
                        placeholder="+975 17556559"
                        className="w-full p-2.5 rounded-lg border border-gray-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Official Email Address</label>
                      <input
                        type="email"
                        value={formData.contact_email || ''}
                        onChange={(e) => handleChange('contact_email', e.target.value)}
                        placeholder="contact@drodulphendeyling.org"
                        className="w-full p-2.5 rounded-lg border border-gray-300 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Office Visiting Hours</label>
                    <input
                      type="text"
                      value={formData.contact_hours || ''}
                      onChange={(e) => handleChange('contact_hours', e.target.value)}
                      placeholder="Mon - Sat: 08:00 AM - 05:00 PM BST"
                      className="w-full p-2.5 rounded-lg border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Google Maps Embed Link</label>
                    <input
                      type="text"
                      value={formData.contact_map_url || ''}
                      onChange={(e) => handleChange('contact_map_url', e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="w-full p-2.5 rounded-lg border border-gray-300 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 4. DONATE & BANKING TAB                                   */}
              {/* ========================================================= */}
              {activeTab === 'donate' && (
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/60 text-rose-900">
                    <p className="font-bold">Dana Offerings, Presets & BoB Banking</p>
                    <p className="text-[11px] text-rose-700">
                      Configures the giving presets, bank deposit details, and 80G tax registration numbers.
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Donate Page Headline</label>
                    <input
                      type="text"
                      value={formData.donate_hero_title || ''}
                      onChange={(e) => handleChange('donate_hero_title', e.target.value)}
                      placeholder="Offer Dana • Accumulate Merit for All Beings"
                      className="w-full p-2.5 rounded-lg border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Donate Hero Subtitle</label>
                    <textarea
                      rows={2}
                      value={formData.donate_hero_subtitle || ''}
                      onChange={(e) => handleChange('donate_hero_subtitle', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Preset Amounts (Comma Separated)</label>
                      <input
                        type="text"
                        value={formData.donation_preset_amounts || ''}
                        onChange={(e) => handleChange('donation_preset_amounts', e.target.value)}
                        placeholder="500, 1100, 2100, 5100, 11000"
                        className="w-full p-2.5 rounded-lg border border-gray-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Default Selected Amount</label>
                      <input
                        type="number"
                        value={formData.donation_default_amount || '1100'}
                        onChange={(e) => handleChange('donation_default_amount', e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-3">
                    <h4 className="font-bold text-gray-900 border-b pb-1 text-xs">Bank Transfer Account</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={formData.bank_name || ''}
                          onChange={(e) => handleChange('bank_name', e.target.value)}
                          placeholder="Bank of Bhutan (BoB)"
                          className="w-full p-2 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Account Number</label>
                        <input
                          type="text"
                          value={formData.bank_account_no || ''}
                          onChange={(e) => handleChange('bank_account_no', e.target.value)}
                          placeholder="200847291038"
                          className="w-full p-2 rounded-lg border border-gray-300 font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-700 font-bold mb-1">SWIFT / BIC Code</label>
                        <input
                          type="text"
                          value={formData.bank_swift_code || ''}
                          onChange={(e) => handleChange('bank_swift_code', e.target.value)}
                          placeholder="BHUBBTBT"
                          className="w-full p-2 rounded-lg border border-gray-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Branch</label>
                        <input
                          type="text"
                          value={formData.bank_branch || ''}
                          onChange={(e) => handleChange('bank_branch', e.target.value)}
                          placeholder="Gelephu Main Branch"
                          className="w-full p-2 rounded-lg border border-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Tax Exemption Reg. No.</label>
                      <input
                        type="text"
                        value={formData.tax_exempt_reg || ''}
                        onChange={(e) => handleChange('tax_exempt_reg', e.target.value)}
                        placeholder="DPL/TAX-EXEMPT/BTN/2026/80G-092"
                        className="w-full p-2 rounded-lg border border-gray-300 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">80G Order Number</label>
                      <input
                        type="text"
                        value={formData.tax_80g_order_no || ''}
                        onChange={(e) => handleChange('tax_80g_order_no', e.target.value)}
                        placeholder="CIT(E)/THIMPHU/80G/2026-27/AAATD1234F"
                        className="w-full p-2 rounded-lg border border-gray-300 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 5. HEADER & UTILITY BAR TAB                               */}
              {/* ========================================================= */}
              {activeTab === 'navbar' && (
                <div className="space-y-4">
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/60 text-purple-900">
                    <p className="font-bold">Top Utility Bar & Header Announcements</p>
                    <p className="text-[11px] text-purple-700">
                      Configure the scrolling announcement banner, religious celebration alerts, and contact links.
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Top Announcement Message</label>
                    <textarea
                      rows={2}
                      value={formData.header_announcement || ''}
                      onChange={(e) => handleChange('header_announcement', e.target.value)}
                      placeholder="☸ Welcoming Devotees to the Historic 108ft Great Druk Wangyel Peace Stupa • 80G Tax Exemption Available"
                      className="w-full p-2.5 rounded-lg border border-gray-300"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="font-bold text-gray-700">Announcement Bar Visible?</label>
                    <button
                      type="button"
                      onClick={() =>
                        handleChange(
                          'header_announcement_on',
                          formData.header_announcement_on === 'true' ? 'false' : 'true'
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        formData.header_announcement_on === 'true'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-gray-100 text-gray-500 border border-gray-300'
                      }`}
                    >
                      {formData.header_announcement_on === 'true' ? '✓ Enabled' : '✕ Hidden'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Header Phone</label>
                      <input
                        type="text"
                        value={formData.header_phone || ''}
                        onChange={(e) => handleChange('header_phone', e.target.value)}
                        placeholder="+975 17556559"
                        className="w-full p-2.5 rounded-lg border border-gray-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Header Email</label>
                      <input
                        type="email"
                        value={formData.header_email || ''}
                        onChange={(e) => handleChange('header_email', e.target.value)}
                        placeholder="contact@drodulphendeyling.org"
                        className="w-full p-2.5 rounded-lg border border-gray-300 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Header Location Tag</label>
                    <input
                      type="text"
                      value={formData.header_location || ''}
                      onChange={(e) => handleChange('header_location', e.target.value)}
                      placeholder="Gelephu, Sarpang, Bhutan"
                      className="w-full p-2.5 rounded-lg border border-gray-300"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 6. FOOTER & SOCIAL TAB                                    */}
              {/* ========================================================= */}
              {activeTab === 'footer' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-800">
                    <p className="font-bold">Footer & Social Channels</p>
                    <p className="text-[11px] text-slate-600">
                      Manage copyright statements and external community channels.
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Footer Copyright Notice</label>
                    <textarea
                      rows={2}
                      value={formData.footer_copyright || ''}
                      onChange={(e) => handleChange('footer_copyright', e.target.value)}
                      placeholder="© 2026 Drodul Phendey Ling Foundation..."
                      className="w-full p-2.5 rounded-lg border border-gray-300"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Facebook URL</label>
                      <input
                        type="url"
                        value={formData.social_facebook || ''}
                        onChange={(e) => handleChange('social_facebook', e.target.value)}
                        placeholder="https://facebook.com/drodulphendeyling"
                        className="w-full p-2 rounded-lg border border-gray-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Instagram URL</label>
                      <input
                        type="url"
                        value={formData.social_instagram || ''}
                        onChange={(e) => handleChange('social_instagram', e.target.value)}
                        placeholder="https://instagram.com/drodulphendeyling"
                        className="w-full p-2 rounded-lg border border-gray-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">YouTube Channel URL</label>
                      <input
                        type="url"
                        value={formData.social_youtube || ''}
                        onChange={(e) => handleChange('social_youtube', e.target.value)}
                        placeholder="https://youtube.com/@drodulphendeyling"
                        className="w-full p-2 rounded-lg border border-gray-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pinned Action Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-200 font-bold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving || loading}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#B89628] hover:to-[#96781D] text-[#0F172A] font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing Live...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publish Changes Live</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
