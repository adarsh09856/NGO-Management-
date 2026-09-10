import React, { useState, useEffect } from 'react';
import {
  Settings, Save, Database, Shield, Globe, CreditCard, Mail, Download,
  RefreshCw, CheckCircle2, FileText, Palette, Sliders, Server, Landmark, Lock,
  Phone, MapPin, Check, AlertCircle, ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SystemSettings() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('legal'); // 'legal' | 'branding' | 'header' | 'payments' | 'donations' | 'email' | 'backup'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    // 1. Legal & Identity
    site_name: 'Drodul Phendey Ling Foundation',
    tax_exempt_reg: 'DPL/TAX-EXEMPT/BTN/2026/80G-092',
    tax_80g_order_no: 'CIT(E)/THIMPHU/80G/2026-27/AAATD1234F',
    pan_number: 'AAATD1234F',
    phone: '+975 17556559',
    email: 'contact@drodulphendeyling.org',
    address: 'Great Druk Wangyel Peace Stupa, Gelephu, Sarpang, Bhutan',
    country: 'Bhutan',

    // 2. Branding
    tibetan_title: '༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།',
    site_tagline: 'Building Peace. Empowering Lives.',
    crest_symbol: '☸',
    primary_color: '#D4AF37',
    accent_color: '#BE123C',

    // 3. Header & Utility Bar
    header_phone: '+975 17556559',
    header_email: 'contact@drodulphendeyling.org',
    header_location: 'Gelephu, Sarpang, Bhutan',
    header_prayer_desk_link: '/prayer-request',
    header_shedra_link: '/student',

    // 4. Payment Gateways
    currency: 'INR',
    razorpay_key_id: 'rzp_test_drodulphendeyling_sandbox',
    razorpay_key_secret: '',
    stripe_publishable_key: 'pk_test_drodulphendeyling_sandbox',
    stripe_secret_key: '',

    // 5. Donation Presets & Bank Instructions
    donation_preset_amounts: '500, 1100, 2100, 5100, 11000',
    donation_default_amount: '1100',
    donation_currencies: 'INR, Nu. BTN, USD',
    bank_name: 'Bank of Bhutan (BoB)',
    bank_account_name: 'Drodul Phendey Ling Foundation',
    bank_account_no: '200847291038',
    bank_swift_code: 'BHUBBTBT',
    bank_branch: 'Gelephu Main Branch',

    // 6. Email & SMTP
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_user: 'donations@drodulphendeyling.org',
    smtp_pass: '',
    smtp_from_name: 'Drodul Phendey Ling Foundation',
    smtp_secure: 'false'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success && res.data.data) {
        setSettings(prev => ({
          ...prev,
          ...res.data.data
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/settings', { settings });
      if (res.data.success) {
        success('System configuration saved successfully!');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDatabaseBackup = async () => {
    try {
      setBackingUp(true);
      const res = await api.post('/backup');
      if (res.data.success) {
        success(`Backup completed! SQL dump: ${res.data.data?.filename || 'database_backup.sql'} (${res.data.data?.size || 'saved'})`);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Backup failed');
    } finally {
      setBackingUp(false);
    }
  };

  const tabs = [
    { id: 'legal', label: '1. Legal & 80G Tax', icon: Landmark },
    { id: 'branding', label: '2. Branding & Identity', icon: Palette },
    { id: 'header', label: '3. Header & Utility Bar', icon: Globe },
    { id: 'payments', label: '4. Payment Gateways', icon: CreditCard },
    { id: 'donations', label: '5. Presets & Bank Instructions', icon: FileText },
    { id: 'email', label: '6. SMTP & Mailer', icon: Mail },
    { id: 'backup', label: '7. Backup & Infrastructure', icon: Database }
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-serif-brand">
        Loading system configuration matrix...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A] flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#D4AF37]" />
            <span>System Settings & Site Control Matrix</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            100% dynamic site configuration: tax credentials, gateway keys, visual branding, utility header, and database archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDatabaseBackup}
            disabled={backingUp}
            className="px-3.5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{backingUp ? 'Exporting SQL...' : 'Run DB Backup'}</span>
          </button>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-gray-200 gap-1 pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center space-x-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-[#E11D48] text-[#E11D48] bg-rose-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. LEGAL & 80G TAX */}
        {activeTab === 'legal' && (
          <div className="monastery-card p-6 space-y-6">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#D4AF37]" />
                  <span>Foundation Legal Entity & 80G Tax Exemption</span>
                </h3>
                <p className="text-[11px] text-gray-500">
                  Legal credentials printed automatically on official 80G donation receipts and compliance reports.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                Active Legal Entity
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Official Legal Name</label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">80G Tax Exemption Registration</label>
                <input
                  type="text"
                  value={settings.tax_exempt_reg}
                  onChange={(e) => handleChange('tax_exempt_reg', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">80G Tax Exemption Order No.</label>
                <input
                  type="text"
                  value={settings.tax_80g_order_no}
                  onChange={(e) => handleChange('tax_80g_order_no', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Permanent Account Number (PAN / TAN)</label>
                <input
                  type="text"
                  value={settings.pan_number}
                  onChange={(e) => handleChange('pan_number', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Country of Jurisdiction</label>
                <input
                  type="text"
                  value={settings.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Headquarters Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official Legal Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Monastery Physical Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. BRANDING & VISUAL IDENTITY */}
        {activeTab === 'branding' && (
          <div className="monastery-card p-6 space-y-6">
            <div className="border-b pb-3">
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#D4AF37]" />
                <span>Monastery Brand & Visual Typography</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Configure primary colors, Tibetan script titles, crest symbols, and site-wide branding.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">English Brand Title</label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-serif-brand font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tibetan Sacred Title (དབུ་ཅན)</label>
                <input
                  type="text"
                  value={settings.tibetan_title}
                  onChange={(e) => handleChange('tibetan_title', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-serif"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Foundation Mission Tagline</label>
                <input
                  type="text"
                  value={settings.site_tagline}
                  onChange={(e) => handleChange('site_tagline', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 italic"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Dharmachakra / Sacred Crest Symbol</label>
                <input
                  type="text"
                  value={settings.crest_symbol}
                  onChange={(e) => handleChange('crest_symbol', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Primary Gold Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      className="w-8 h-8 rounded border p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primary_color}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      className="w-full p-2 rounded border border-gray-300 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Crimson Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.accent_color}
                      onChange={(e) => handleChange('accent_color', e.target.value)}
                      className="w-8 h-8 rounded border p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.accent_color}
                      onChange={(e) => handleChange('accent_color', e.target.value)}
                      className="w-full p-2 rounded border border-gray-300 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. HEADER & UTILITY BAR */}
        {activeTab === 'header' && (
          <div className="monastery-card p-6 space-y-6">
            <div className="border-b pb-3">
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D4AF37]" />
                <span>Top Utility Header & Direct Quick Links</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Controls the contact phone, official email, monastery location text, and top links visible across all public pages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Header Phone (Display & Call link)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={settings.header_phone}
                    onChange={(e) => handleChange('header_phone', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Header Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={settings.header_email}
                    onChange={(e) => handleChange('header_email', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Header Monastery Location Badge</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={settings.header_location}
                    onChange={(e) => handleChange('header_location', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Prayer Request Desk URL</label>
                <input
                  type="text"
                  value={settings.header_prayer_desk_link}
                  onChange={(e) => handleChange('header_prayer_desk_link', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Shedra Monk & Scholar Portal URL</label>
                <input
                  type="text"
                  value={settings.header_shedra_link}
                  onChange={(e) => handleChange('header_shedra_link', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. PAYMENT GATEWAYS */}
        {activeTab === 'payments' && (
          <div className="monastery-card p-6 space-y-6">
            <div className="border-b pb-3">
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                <span>Payment Gateways & API Credentials</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Configure Razorpay (India & SAARC) and Stripe (Global) live and sandbox credentials with timing-safe signature verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={settings.razorpay_key_id}
                  onChange={(e) => handleChange('razorpay_key_id', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Razorpay Key Secret <span className="text-gray-400 font-normal">(Encrypted server-side)</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={settings.razorpay_key_secret}
                  onChange={(e) => handleChange('razorpay_key_secret', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Stripe Publishable Key</label>
                <input
                  type="text"
                  value={settings.stripe_publishable_key}
                  onChange={(e) => handleChange('stripe_publishable_key', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Stripe Secret Key <span className="text-gray-400 font-normal">(Encrypted server-side)</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={settings.stripe_secret_key}
                  onChange={(e) => handleChange('stripe_secret_key', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Default Base Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-bold"
                >
                  <option value="INR">INR (₹ Indian Rupee / Bhutan Ngultrum Parity)</option>
                  <option value="BTN">Nu. BTN (Bhutanese Ngultrum)</option>
                  <option value="USD">USD ($ United States Dollar)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 5. DONATION PRESETS & BANK INSTRUCTIONS */}
        {activeTab === 'donations' && (
          <div className="monastery-card p-6 space-y-6">
            <div className="border-b pb-3">
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <span>Donation Presets & Bank Wire Instructions</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Preset donation pills displayed in the giving modal and official Bank of Bhutan wire instructions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Donation Preset Amounts (Comma-separated)
                </label>
                <input
                  type="text"
                  value={settings.donation_preset_amounts}
                  onChange={(e) => handleChange('donation_preset_amounts', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">Example: 500, 1100, 2100, 5100, 11000</p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Default Pre-selected Amount</label>
                <input
                  type="number"
                  value={settings.donation_default_amount}
                  onChange={(e) => handleChange('donation_default_amount', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2 pt-4 border-t">
                <h4 className="font-serif-brand font-bold text-xs uppercase tracking-wider text-[#0F172A] mb-3">
                  Direct Bank Wire Details (Bank of Bhutan)
                </h4>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={settings.bank_name}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Beneficiary Account Name</label>
                <input
                  type="text"
                  value={settings.bank_account_name}
                  onChange={(e) => handleChange('bank_account_name', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={settings.bank_account_no}
                  onChange={(e) => handleChange('bank_account_no', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">SWIFT / BIC Code</label>
                <input
                  type="text"
                  value={settings.bank_swift_code}
                  onChange={(e) => handleChange('bank_swift_code', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={settings.bank_branch}
                  onChange={(e) => handleChange('bank_branch', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. EMAIL & SMTP */}
        {activeTab === 'email' && (
          <div className="monastery-card p-6 space-y-6">
            <div className="border-b pb-3">
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span>SMTP Mail Server Configuration</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Outgoing transactional mail delivery for 80G tax receipts, student course notifications, and password reset dispatches.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtp_host}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">SMTP Port</label>
                <input
                  type="text"
                  value={settings.smtp_port}
                  onChange={(e) => handleChange('smtp_port', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">SMTP Username / Email</label>
                <input
                  type="text"
                  value={settings.smtp_user}
                  onChange={(e) => handleChange('smtp_user', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  SMTP App Password <span className="text-gray-400 font-normal">(Encrypted)</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={settings.smtp_pass}
                  onChange={(e) => handleChange('smtp_pass', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">From Sender Display Name</label>
                <input
                  type="text"
                  value={settings.smtp_from_name}
                  onChange={(e) => handleChange('smtp_from_name', e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. BACKUP & INFRASTRUCTURE */}
        {activeTab === 'backup' && (
          <div className="monastery-card p-6 space-y-6">
            <div className="border-b pb-3">
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#D4AF37]" />
                <span>Automated Database Backups & Infrastructure Health</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Cryptographic SQL archive creation, database ping latency monitoring, and disaster recovery exports.
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold text-sm text-[#0F172A]">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                <span>Zero-Data Loss Architecture</span>
              </div>
              <p className="text-[11px] text-gray-700 leading-relaxed">
                Triggering a database backup locks transactional state, dumps all schemas (users, donations, monks, ledger, audit chain), compresses the output, and archives it into the safe backups repository.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDatabaseBackup}
                  disabled={backingUp}
                  className="px-4 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-[#D4AF37] rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>{backingUp ? 'Generating SQL Dump...' : 'Export Complete SQL Backup'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded font-bold text-xs uppercase tracking-wider shadow flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving System Configuration...' : 'Save Configuration Matrix'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
