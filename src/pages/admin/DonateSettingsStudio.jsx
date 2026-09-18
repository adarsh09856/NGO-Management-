import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Save, RefreshCw, Sparkles, Image, CheckCircle2, ArrowRight,
  ExternalLink, Building2, Shield, Heart, Coins, ChevronRight, UploadCloud
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function DonateSettingsStudio() {
  const { success, error } = useToast();
  const location = useLocation();

  const initialTab = location.hash ? location.hash.replace('#', '') : 'hero';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    // 1. Hero
    donate_hero_badge: '☸ མཆོད་འབུལ། • Sacred Monastic Philanthropy',
    donate_hero_title: 'Offer Dana: Build Sacred Merit & World Peace',
    donate_hero_subtitle: 'Every contribution directly funds the construction of the Great Druk Wangyel Peace Stupa, covers living and educational expenses for resident Shedra monks, and provides free community welfare services.',
    donate_hero_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1400&q=80',

    // 2. Presets
    donate_preset_amounts: '500, 1000, 2500, 5000, 11000',
    donate_default_amount: '1000',

    // 3. Bank Wire
    bank_title: 'Direct Bank Transfer / Wire Details',
    bank_subtitle: 'Devotees preferring direct RTGS, NEFT, or international SWIFT wire transfers may remit directly to our official institutional account:',
    bank_name: 'Bank of Bhutan (BoB)',
    bank_account_name: 'Drodul Phendey Ling Foundation',
    bank_account_no: '202888999123',
    bank_swift_code: 'BOBTBT22',
    bank_branch: 'Gelephu Main Branch, Sarpang Dzongkhag',
    bank_ifsc_code: 'BOB0000202',
    bank_instructions: 'Please include your Donor Full Name and Contact Mobile in the transfer narration/remarks so we can issue your official 80G tax receipt immediately.',

    // 4. Tax & Legal
    tax_80g_order_no: 'ROB/TAX-EXEMPT/2021/80G-09',
    tax_exempt_reg: 'ROB/CP-04/2021',
    tax_notice_text: '100% Tax-Deductible under Section 31 of the Income Tax Act of Bhutan & international charity bilateral guidelines.',
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
        success('Image uploaded successfully!');
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
        success('Donations & Banking studio changes saved successfully! Public page updated.');
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
    { id: 'hero', label: '1. Donate Hero Banner', icon: Sparkles },
    { id: 'presets', label: '2. Preset Amounts', icon: Coins },
    { id: 'bank', label: '3. Bank Wire & Swift', icon: Building2 },
    { id: 'tax', label: '4. 80G Tax Exemption', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
        <p className="text-xs">Loading Donations Studio configuration...</p>
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
                Donations & Banking Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#0F172A] uppercase">
                Section Controller
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Control the public donation hero, giving presets, official wire credentials, and 80G tax parameters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/donate"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-200 text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            <span>Preview Donate Page</span>
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
            Donation Settings
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
          {/* 1. HERO BANNER                                            */}
          {/* ========================================================= */}
          {activeTab === 'hero' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-emerald-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Donate Hero Banner</h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Update the top inspirational headline, Tibetan prayer pill, and hero background image.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tibetan Eyebrow Badge</label>
                <input
                  type="text"
                  value={form.donate_hero_badge || ''}
                  onChange={(e) => handleChange('donate_hero_badge', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Main Page Title</label>
                <input
                  type="text"
                  value={form.donate_hero_title || ''}
                  onChange={(e) => handleChange('donate_hero_title', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Mission Lede</label>
                <textarea
                  rows={3}
                  value={form.donate_hero_subtitle || ''}
                  onChange={(e) => handleChange('donate_hero_subtitle', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hero Background Image</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.donate_hero_image || ''}
                      onChange={(e) => handleChange('donate_hero_image', e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                    <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors">
                      <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                      <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={(e) => handleImageUpload(e, 'donate_hero_image')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {form.donate_hero_image && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200">
                      <img src={form.donate_hero_image} alt="Donate Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. PRESET AMOUNTS                                         */}
          {/* ========================================================= */}
          {activeTab === 'presets' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-amber-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Preset Donation Amounts</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Configure the quick-select amounts rendered in the donation modal and cards.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preset Amounts (Comma-separated)</label>
                <input
                  type="text"
                  value={form.donate_preset_amounts || ''}
                  onChange={(e) => handleChange('donate_preset_amounts', e.target.value)}
                  placeholder="500, 1000, 2500, 5000, 11000"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Example: 500, 1000, 2500, 5000, 11000. These appear as clickable chips for donors.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Pre-selected Amount</label>
                <input
                  type="text"
                  value={form.donate_default_amount || ''}
                  onChange={(e) => handleChange('donate_default_amount', e.target.value)}
                  placeholder="1000"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono max-w-xs"
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. BANK WIRE DETAILS                                      */}
          {/* ========================================================= */}
          {activeTab === 'bank' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/60 text-blue-900">
                <h3 className="font-bold text-sm text-[#0F172A]">Official Institutional Bank Wire Credentials</h3>
                <p className="text-xs text-blue-800 mt-0.5">
                  Displayed on the public donate page and receipts for direct RTGS, NEFT, and international SWIFT wire transfers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Card Title</label>
                  <input
                    type="text"
                    value={form.bank_title || ''}
                    onChange={(e) => handleChange('bank_title', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Bank Name</label>
                  <input
                    type="text"
                    value={form.bank_name || ''}
                    onChange={(e) => handleChange('bank_name', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#721C24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Beneficiary Account Name</label>
                  <input
                    type="text"
                    value={form.bank_account_name || ''}
                    onChange={(e) => handleChange('bank_account_name', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={form.bank_account_no || ''}
                    onChange={(e) => handleChange('bank_account_no', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SWIFT / BIC Code</label>
                  <input
                    type="text"
                    value={form.bank_swift_code || ''}
                    onChange={(e) => handleChange('bank_swift_code', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">IFSC / Routing Code</label>
                  <input
                    type="text"
                    value={form.bank_ifsc_code || ''}
                    onChange={(e) => handleChange('bank_ifsc_code', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Branch Name & Dzongkhag Location</label>
                <input
                  type="text"
                  value={form.bank_branch || ''}
                  onChange={(e) => handleChange('bank_branch', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Donor Remittance Instructions</label>
                <textarea
                  rows={2}
                  value={form.bank_instructions || ''}
                  onChange={(e) => handleChange('bank_instructions', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. TAX & LEGAL                                            */}
          {/* ========================================================= */}
          {activeTab === 'tax' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-emerald-900">
                <h3 className="font-bold text-sm text-[#0F172A]">80G Tax Exemption & Statutory Numbers</h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Appears on digital 80G tax receipts and donation confirmations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">80G Tax Exemption Order No</label>
                  <input
                    type="text"
                    value={form.tax_80g_order_no || ''}
                    onChange={(e) => handleChange('tax_80g_order_no', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ROB Registration Number</label>
                  <input
                    type="text"
                    value={form.tax_exempt_reg || ''}
                    onChange={(e) => handleChange('tax_exempt_reg', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tax Deductible Policy Notice</label>
                <textarea
                  rows={3}
                  value={form.tax_notice_text || ''}
                  onChange={(e) => handleChange('tax_notice_text', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
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
              <span>{saving ? 'Publishing Changes...' : 'Save & Publish Donations Configuration'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
