import React, { useState, useEffect } from 'react';
import {
  Coins, CheckCircle2, Save, RefreshCw, Globe, ArrowRight,
  Sparkles, Landmark, Flame, Heart, AlertCircle, Check
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useCurrency, SUPPORTED_CURRENCIES } from '../../context/CurrencyContext';

export default function CurrencyManager() {
  const { success, error } = useToast();
  const {
    currency: activeCurrency,
    currencySymbol: activeSymbol,
    currencyName: activeName,
    refreshCurrency
  } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable Form State
  const [selectedCurrency, setSelectedCurrency] = useState(activeCurrency || 'BTN');
  const [customSymbol, setCustomSymbol] = useState(activeSymbol || 'Nu.');
  const [customName, setCustomName] = useState(activeName || 'Bhutanese Ngultrum');
  const [defaultDonationAmt, setDefaultDonationAmt] = useState('1000');
  const [presetAmounts, setPresetAmounts] = useState('500, 1100, 2100, 5100, 11000');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data?.success && res.data.data) {
        const s = res.data.data;
        const code = s.default_currency || s.currency || 'BTN';
        const preset = SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.BTN;

        setSelectedCurrency(code);
        setCustomSymbol(s.currency_symbol || preset.symbol || 'Nu.');
        setCustomName(s.currency_name || preset.name || 'Bhutanese Ngultrum');
        setDefaultDonationAmt(s.donation_default_amount || '1000');
        setPresetAmounts(s.donation_preset_amounts || '500, 1100, 2100, 5100, 11000');
      }
    } catch (err) {
      console.warn('Failed to load currency settings:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectPreset = (code) => {
    const preset = SUPPORTED_CURRENCIES[code];
    if (!preset) return;
    setSelectedCurrency(code);
    setCustomSymbol(preset.symbol);
    setCustomName(preset.name);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        default_currency: selectedCurrency,
        currency: selectedCurrency,
        currency_symbol: customSymbol,
        currency_name: customName,
        donation_default_amount: defaultDonationAmt,
        donation_preset_amounts: presetAmounts
      };

      const res = await api.post('/settings', { settings: payload });
      if (res.data.success) {
        success(`Global platform currency successfully set to ${selectedCurrency} (${customSymbol})!`);
        if (refreshCurrency) await refreshCurrency();
        await loadSettings();
      } else {
        throw new Error(res.data.message || 'Failed to save currency');
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to update currency');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading Currency Controller...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-2">
            <Coins className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Global Monastic Treasury Control</span>
          </div>
          <h1 className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
            Platform Currency Controller
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Configure the primary operating currency, symbols, and donation denomination defaults applied across all public giving cards, butter lamp offerings, campaigns, and receipts.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-6 py-2.5 bg-[#721C24] hover:bg-[#58151c] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#D4AF37]" />}
          <span>{saving ? 'Saving...' : 'Apply Globally'}</span>
        </button>
      </div>

      {/* 2. Active Currency Status & Live Preview Banner */}
      <div className="bg-gradient-to-r from-[#070A12] via-[#120508] to-[#070A12] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-[#D4AF37]/50">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE SYSTEM CURRENCY</span>
            </span>

            <div className="flex items-baseline gap-3">
              <span className="font-serif-brand text-4xl sm:text-5xl font-extrabold text-[#D4AF37]">
                {customSymbol}
              </span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {selectedCurrency}
                </h2>
                <p className="text-xs text-amber-200/80 font-medium">
                  {customName}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-light">
              Every public offering form, hero donation widget, 108 butter lamp ceremony counter, and financial ledger automatically renders using this currency.
            </p>
          </div>

          {/* Live Preview Pill Box */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/15 space-y-3 text-xs">
            <p className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">
              Live Formatting Preview
            </p>

            <div className="space-y-2">
              <div className="flex justify-between items-center bg-black/30 px-3 py-2 rounded-lg">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>108 Butter Lamps:</span>
                </span>
                <span className="font-bold text-[#D4AF37]">
                  {customSymbol} 1,100
                </span>
              </div>

              <div className="flex justify-between items-center bg-black/30 px-3 py-2 rounded-lg">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-blue-400" />
                  <span>Stupa Goal Target:</span>
                </span>
                <span className="font-bold text-emerald-300">
                  {customSymbol} 50,00,000 {selectedCurrency}
                </span>
              </div>

              <div className="flex justify-between items-center bg-black/30 px-3 py-2 rounded-lg">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Novice Monk Care:</span>
                </span>
                <span className="font-bold text-white">
                  {customSymbol} 2,500
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. One-Click Supported Currencies Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="font-serif-brand font-bold text-lg text-[#0F172A]">
            1. Select Primary Monastic Currency (One-Click)
          </h3>
          <p className="text-xs text-gray-500">
            Click any currency below to immediately populate its official symbol and country standards.
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(SUPPORTED_CURRENCIES).map(([code, cur]) => {
            const isSelected = selectedCurrency === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelectPreset(code)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-amber-50/80 border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-md scale-[1.02]'
                    : 'bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#D4AF37] text-gray-900 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-2xl font-extrabold text-[#721C24]">
                      {cur.symbol}
                    </span>
                    <span className="font-mono text-sm font-bold text-gray-900">
                      {cur.code}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mt-2">
                    {cur.name}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">
                    {code === 'BTN' ? 'Official Bhutan' : code === 'INR' ? 'India / BoB Parity' : 'International'}
                  </span>
                  <span className={`font-bold ${isSelected ? 'text-[#721C24]' : 'text-gray-400 group-hover:text-gray-700'}`}>
                    {isSelected ? 'Selected' : 'Choose'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Fine-Tuning & Customizer Form */}
      <form onSubmit={handleSave} className="monastery-card p-6 sm:p-8 space-y-6">
        <div className="border-b border-gray-200 pb-3">
          <h3 className="font-serif-brand font-bold text-lg text-[#0F172A]">
            2. Currency Customizer & Giving Presets
          </h3>
          <p className="text-xs text-gray-500">
            Customize the exact symbol text, full name, and suggested quick-donation buttons.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              ISO Currency Code *
            </label>
            <input
              type="text"
              required
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value.toUpperCase())}
              placeholder="e.g. BTN, INR, USD"
              className="w-full p-2.5 rounded-lg border border-gray-300 font-mono font-bold uppercase focus:ring-2 focus:ring-[#D4AF37]"
            />
            <p className="text-[10px] text-gray-500 mt-1">3-letter standard code.</p>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Display Symbol *
            </label>
            <input
              type="text"
              required
              value={customSymbol}
              onChange={(e) => setCustomSymbol(e.target.value)}
              placeholder="e.g. Nu., ₹, $"
              className="w-full p-2.5 rounded-lg border border-gray-300 font-serif font-bold text-base focus:ring-2 focus:ring-[#D4AF37]"
            />
            <p className="text-[10px] text-gray-500 mt-1">Prefix shown before numbers (e.g. Nu. or ₹).</p>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Full Currency Name *
            </label>
            <input
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Bhutanese Ngultrum"
              className="w-full p-2.5 rounded-lg border border-gray-300 font-semibold focus:ring-2 focus:ring-[#D4AF37]"
            />
            <p className="text-[10px] text-gray-500 mt-1">Displayed in tax receipts and legal forms.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs pt-2">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Default Donation Amount ({customSymbol})
            </label>
            <input
              type="number"
              min="1"
              value={defaultDonationAmt}
              onChange={(e) => setDefaultDonationAmt(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-300 font-bold text-emerald-800 focus:ring-2 focus:ring-[#D4AF37]"
            />
            <p className="text-[10px] text-gray-500 mt-1">Pre-selected giving amount in the popup modal.</p>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Quick Preset Offerings Pill List
            </label>
            <input
              type="text"
              value={presetAmounts}
              onChange={(e) => setPresetAmounts(e.target.value)}
              placeholder="500, 1100, 2100, 5100, 11000"
              className="w-full p-2.5 rounded-lg border border-gray-300 font-mono focus:ring-2 focus:ring-[#D4AF37]"
            />
            <p className="text-[10px] text-gray-500 mt-1">Comma-separated suggested amounts.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Changes will immediately update the database and synchronize across the public site.</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#D4AF37]" />}
            <span>{saving ? 'Saving...' : 'Save & Synchronize Currency'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
