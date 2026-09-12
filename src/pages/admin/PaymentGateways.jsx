import React, { useState, useEffect } from 'react';
import {
  CreditCard, QrCode, Building2, Shield, CheckCircle2,
  Lock, Save, RefreshCw, ExternalLink, AlertCircle, Copy, Check, Eye, EyeOff, Sparkles,
  Upload, Trash2, Image as ImageIcon
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function PaymentGateways() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [previewAmount, setPreviewAmount] = useState(1000);
  const [copiedField, setCopiedField] = useState(null);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);

  // Gateway Configurations
  const [gateways, setGateways] = useState({
    // UPI & QR
    payment_upi_enabled: '1',
    upi_merchant_vpa: 'drodulphendeyling@bob',
    upi_merchant_name: 'Drodul Phendey Ling Monastery Foundation',
    upi_bank_name: 'Bank of Bhutan',
    upi_qr_image_url: '',

    // Bank of Bhutan Wire
    payment_bank_wire_enabled: '1',
    bank_name: 'Bank of Bhutan Ltd',
    bank_account_name: 'Drodul Phendey Ling Foundation',
    bank_account_no: '20188944110023',
    bank_swift_code: 'BOBNBTBT',
    bank_branch: 'Gelephu Main Branch, Sarpang, Bhutan',
    bank_instructions: 'Please transfer via SWIFT / NEFT / IMPS and submit your 12-digit transaction UTR for Abbot verification and Section 80G tax receipt.',

    // Razorpay
    payment_razorpay_enabled: '1',
    razorpay_mode: 'sandbox', // 'sandbox' | 'live'
    razorpay_key_id: 'rzp_test_drodulphendeyling_sandbox',
    razorpay_key_secret: '',
    razorpay_webhook_secret: '',

    // Stripe
    payment_stripe_enabled: '1',
    stripe_mode: 'test', // 'test' | 'live'
    stripe_publishable_key: 'pk_test_drodulphendeyling_sandbox',
    stripe_secret_key: '',
    stripe_webhook_secret: '',

    // Card 3DS
    payment_cards_enabled: '1',

    // Base Currency
    default_currency: 'INR'
  });

  useEffect(() => {
    loadGatewaySettings();
  }, []);

  async function loadGatewaySettings() {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success && res.data.data) {
        setGateways(prev => ({
          ...prev,
          ...res.data.data
        }));
      }
    } catch (err) {
      error('Failed to load payment gateway settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (key, value) => {
    setGateways(prev => ({ ...prev, [key]: value }));
  };

  const handleCopy = (fieldKey, text) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploadingQr(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data.fileUrl) {
        handleChange('upi_qr_image_url', res.data.fileUrl);
        success('Custom Bank QR image uploaded successfully! Click Save to apply.');
      }
    } catch (err) {
      error('Failed to upload QR image: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/settings', { settings: gateways });
      if (res.data.success) {
        success('Payment gateway and banking configurations saved successfully!');
      } else {
        throw new Error(res.data.message || 'Failed to save settings');
      }
    } catch (err) {
      error('Failed to update payment gateways: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-serif">Loading monastic payment gateways...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold mb-2">
            <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Monastic Treasury · Payment Channels</span>
          </div>
          <h1 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#0F172A]">
            Payment Gateways & Banking Control Center
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Configure live UPI QR endpoints, Bank of Bhutan SWIFT wire coordinates, Razorpay, and Stripe global payment channels. Changes reflect immediately on public donation and prayer request forms.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadGatewaySettings}
            className="p-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs flex items-center gap-1.5 transition-colors"
            title="Reload settings"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="monastic-maroon-btn px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 shadow-md border border-[#D4AF37]/50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Save All Configurations</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Channel Quick Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* UPI Status Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          gateways.payment_upi_enabled === '1'
            ? 'bg-amber-50/60 border-amber-300 shadow-sm'
            : 'bg-gray-50 border-gray-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <QrCode className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              gateways.payment_upi_enabled === '1'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {gateways.payment_upi_enabled === '1' ? 'Active' : 'Disabled'}
            </span>
          </div>
          <h4 className="font-bold text-xs text-gray-900">UPI / Dynamic QR</h4>
          <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate" title={gateways.upi_merchant_vpa}>
            {gateways.upi_merchant_vpa || 'Not Configured'}
          </p>
        </div>

        {/* Bank Wire Status Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          gateways.payment_bank_wire_enabled === '1'
            ? 'bg-amber-50/60 border-amber-300 shadow-sm'
            : 'bg-gray-50 border-gray-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Building2 className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              gateways.payment_bank_wire_enabled === '1'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {gateways.payment_bank_wire_enabled === '1' ? 'Active' : 'Disabled'}
            </span>
          </div>
          <h4 className="font-bold text-xs text-gray-900">BoB SWIFT Wire</h4>
          <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
            A/C: {gateways.bank_account_no || 'Not Configured'}
          </p>
        </div>

        {/* Razorpay Status Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          gateways.payment_razorpay_enabled === '1'
            ? 'bg-amber-50/60 border-amber-300 shadow-sm'
            : 'bg-gray-50 border-gray-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              gateways.payment_razorpay_enabled === '1'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {gateways.payment_razorpay_enabled === '1' ? `${gateways.razorpay_mode?.toUpperCase()}` : 'Disabled'}
            </span>
          </div>
          <h4 className="font-bold text-xs text-gray-900">Razorpay Gateway</h4>
          <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
            {gateways.razorpay_key_id ? `${gateways.razorpay_key_id.slice(0, 12)}...` : 'Key Missing'}
          </p>
        </div>

        {/* Stripe Status Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          gateways.payment_stripe_enabled === '1'
            ? 'bg-amber-50/60 border-amber-300 shadow-sm'
            : 'bg-gray-50 border-gray-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Shield className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              gateways.payment_stripe_enabled === '1'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {gateways.payment_stripe_enabled === '1' ? `${gateways.stripe_mode?.toUpperCase()}` : 'Disabled'}
            </span>
          </div>
          <h4 className="font-bold text-xs text-gray-900">Stripe Global</h4>
          <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
            {gateways.stripe_publishable_key ? `${gateways.stripe_publishable_key.slice(0, 12)}...` : 'Key Missing'}
          </p>
        </div>
      </div>

      {/* 3. Detailed Gateway Forms */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* GATEWAY 1: UPI & DYNAMIC QR */}
        <div className="monastery-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
                  1. Unified Payments Interface (UPI) & QR Code Gateway
                </h3>
                <p className="text-[11px] text-gray-500">
                  Direct scan-to-pay via Google Pay, PhonePe, Paytm, and BHIM UPI directly into Bank of Bhutan.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gateways.payment_upi_enabled === '1'}
                onChange={(e) => handleChange('payment_upi_enabled', e.target.checked ? '1' : '0')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-2 text-xs font-bold text-gray-700">
                {gateways.payment_upi_enabled === '1' ? 'Channel Enabled' : 'Disabled'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
            <div className="md:col-span-6 space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Merchant UPI ID / VPA <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={gateways.upi_merchant_vpa}
                    onChange={(e) => handleChange('upi_merchant_vpa', e.target.value)}
                    placeholder="e.g. drodulphendeyling@bob"
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy('vpa', gateways.upi_merchant_vpa)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    title="Copy UPI ID"
                  >
                    {copiedField === 'vpa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  This VPA is encoded into the public QR code generated on the donation checkout modal.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Merchant Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={gateways.upi_merchant_name}
                  onChange={(e) => handleChange('upi_merchant_name', e.target.value)}
                  placeholder="Drodul Phendey Ling Monastery Foundation"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Monastic Bank Name
                </label>
                <input
                  type="text"
                  value={gateways.upi_bank_name}
                  onChange={(e) => handleChange('upi_bank_name', e.target.value)}
                  placeholder="Bank of Bhutan"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Custom Bank Standee QR (Optional) */}
              <div className="pt-2 border-t border-gray-200">
                <label className="block font-semibold text-gray-700 mb-1">
                  Custom Bank Standee QR Image (Optional)
                </label>
                <p className="text-[10px] text-gray-500 mb-2">
                  Leave blank to use the <strong>Dynamic Smart Amount QR</strong> (recommended: automatically embeds the devotee's exact donation amount into GPay/PhonePe). Or upload your bank's physical printed standee QR.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={gateways.upi_qr_image_url || ''}
                    onChange={(e) => handleChange('upi_qr_image_url', e.target.value)}
                    placeholder="Image URL or upload via button..."
                    className="flex-1 p-2 rounded-xl border border-gray-300 font-mono text-xs focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{uploadingQr ? 'Uploading...' : 'Upload QR'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      disabled={uploadingQr}
                      className="hidden"
                    />
                  </label>
                  {gateways.upi_qr_image_url && (
                    <button
                      type="button"
                      onClick={() => handleChange('upi_qr_image_url', '')}
                      className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                      title="Remove Custom QR"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Live QR Preview & Dynamic Amount Tester */}
            <div className="md:col-span-6 bg-amber-50/50 rounded-2xl p-4 border border-amber-200/60 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-amber-800">
                  Live Public QR Preview
                </span>
                {gateways.upi_qr_image_url ? (
                  <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                    Custom Standee Active
                  </span>
                ) : (
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    Dynamic Auto-Amount Active
                  </span>
                )}
              </div>

              {/* Dynamic Amount Test Controls */}
              {!gateways.upi_qr_image_url && (
                <div className="w-full max-w-xs mb-3 space-y-1.5 bg-white p-2 rounded-xl border border-amber-200 shadow-xs">
                  <span className="block text-[9.5px] font-bold text-gray-500 uppercase tracking-wider text-left">
                    Test Dynamic Amount Encoding:
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {[500, 1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setPreviewAmount(amt)}
                        className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                          previewAmount === amt
                            ? 'bg-[#4A0E17] text-[#D4AF37] shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    <span className="text-[10px] text-gray-400 font-bold">Custom:</span>
                    <input
                      type="number"
                      value={previewAmount}
                      onChange={(e) => setPreviewAmount(Number(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-bold p-1 rounded-lg border border-gray-300 text-center"
                      placeholder="Enter amount..."
                    />
                  </div>
                </div>
              )}

              {/* Standee QR Card */}
              <div className="w-44 bg-white p-3 rounded-2xl border-2 border-amber-300 shadow-md inline-block mb-2">
                <div className="w-full bg-[#4A0E17] text-[#D4AF37] py-0.5 px-2 rounded-lg text-[8.5px] font-bold tracking-wider uppercase mb-1.5">
                  ☸ SCAN TO PAY
                </div>

                {gateways.upi_qr_image_url ? (
                  <img
                    src={gateways.upi_qr_image_url}
                    alt="Custom Bank Standee QR"
                    className="w-32 h-32 mx-auto object-contain rounded-lg"
                  />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                      `upi://pay?pa=${gateways.upi_merchant_vpa || 'drodulphendeyling@bob'}&pn=${encodeURIComponent(
                        gateways.upi_merchant_name || 'Drodul Phendey Ling Monastery'
                      )}&am=${previewAmount}&cu=INR`
                    )}`}
                    alt="Live UPI QR Preview"
                    className="w-32 h-32 mx-auto object-contain rounded-lg"
                  />
                )}

                {/* Dynamic Amount Pill */}
                {!gateways.upi_qr_image_url && (
                  <div className="w-full mt-1.5 bg-amber-50 border border-amber-300 py-1 px-1 rounded-xl">
                    <span className="block text-[8px] text-gray-500 uppercase tracking-wider font-semibold">Dynamic Amount:</span>
                    <strong className="block text-xs font-extrabold text-[#721C24] font-mono">
                      ₹ {previewAmount.toLocaleString()}
                    </strong>
                    <span className="block text-[7.5px] text-emerald-700 font-bold">
                      ✓ Auto-Filled in GPay / PhonePe
                    </span>
                  </div>
                )}
              </div>

              <p className="font-mono text-xs font-bold text-gray-800">
                {gateways.upi_merchant_vpa || 'drodulphendeyling@bob'}
              </p>

              {/* Real-time UPI URL String Box */}
              {!gateways.upi_qr_image_url && (
                <div className="mt-2 w-full max-w-xs bg-white p-2 rounded-xl border border-gray-200 text-left">
                  <span className="block text-[8.5px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Live Encoded UPI URI:
                  </span>
                  <div className="font-mono text-[9px] text-gray-600 break-all bg-gray-50 p-1.5 rounded border select-all">
                    upi://pay?pa={gateways.upi_merchant_vpa || 'drodulphendeyling@bob'}&pn={encodeURIComponent(gateways.upi_merchant_name || 'Drodul Phendey Ling Monastery')}&am={previewAmount}&cu=INR
                  </div>
                </div>
              )}

              <p className="text-[10px] text-gray-500 mt-2 max-w-xs leading-relaxed">
                {gateways.upi_qr_image_url
                  ? 'Devotees will scan your uploaded bank standee image and enter their offering amount manually.'
                  : 'Devotees scan this QR code and their payment app (GPay/PhonePe/Paytm) automatically locks the exact offering amount chosen on the website.'}
              </p>
            </div>
          </div>
        </div>

        {/* GATEWAY 2: BANK OF BHUTAN WIRE & NEFT */}
        <div className="monastery-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
                  2. Bank of Bhutan (BoB) Wire & SWIFT Transfer
                </h3>
                <p className="text-[11px] text-gray-500">
                  International wire, SWIFT, and domestic NEFT/IMPS bank coordinates displayed to donors.
                </p>
              </div>
            </div>

            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gateways.payment_bank_wire_enabled === '1'}
                onChange={(e) => handleChange('payment_bank_wire_enabled', e.target.checked ? '1' : '0')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-2 text-xs font-bold text-gray-700">
                {gateways.payment_bank_wire_enabled === '1' ? 'Channel Enabled' : 'Disabled'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Beneficiary Account Name
              </label>
              <input
                type="text"
                value={gateways.bank_account_name}
                onChange={(e) => handleChange('bank_account_name', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={gateways.bank_account_no}
                onChange={(e) => handleChange('bank_account_no', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={gateways.bank_name}
                onChange={(e) => handleChange('bank_name', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                SWIFT / BIC Code (for International Wires)
              </label>
              <input
                type="text"
                value={gateways.bank_swift_code}
                onChange={(e) => handleChange('bank_swift_code', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs uppercase focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Branch / Location
              </label>
              <input
                type="text"
                value={gateways.bank_branch}
                onChange={(e) => handleChange('bank_branch', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Default Currency
              </label>
              <select
                value={gateways.default_currency}
                onChange={(e) => handleChange('default_currency', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              >
                <option value="INR">INR (₹ Indian Rupee / BTN Nu. Parity)</option>
                <option value="BTN">Nu. BTN (Bhutanese Ngultrum)</option>
                <option value="USD">USD ($ United States Dollar)</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-semibold text-gray-700 mb-1">
                Devotee Deposit Instructions
              </label>
              <textarea
                value={gateways.bank_instructions}
                onChange={(e) => handleChange('bank_instructions', e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* GATEWAY 3: RAZORPAY GATEWAY */}
        <div className="monastery-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
                  3. Razorpay Payment Gateway (India & SAARC Cards / NetBanking)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Powers Credit/Debit cards and automatic payment order generation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={gateways.razorpay_mode}
                onChange={(e) => handleChange('razorpay_mode', e.target.value)}
                className="text-xs font-bold border border-gray-300 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:outline-none"
              >
                <option value="sandbox">Sandbox (Test)</option>
                <option value="live">Live (Production)</option>
              </select>

              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={gateways.payment_razorpay_enabled === '1'}
                  onChange={(e) => handleChange('payment_razorpay_enabled', e.target.checked ? '1' : '0')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-bold text-gray-700">
                  {gateways.payment_razorpay_enabled === '1' ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Razorpay Key ID
              </label>
              <input
                type="text"
                value={gateways.razorpay_key_id}
                onChange={(e) => handleChange('razorpay_key_id', e.target.value)}
                placeholder="rzp_live_..."
                className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Razorpay Key Secret <span className="text-gray-400 font-normal">(Encrypted)</span>
              </label>
              <div className="relative">
                <input
                  type={showRazorpaySecret ? 'text' : 'password'}
                  value={gateways.razorpay_key_secret}
                  onChange={(e) => handleChange('razorpay_key_secret', e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showRazorpaySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Webhook Secret (Cryptographic Signature)
              </label>
              <input
                type="text"
                value={gateways.razorpay_webhook_secret}
                onChange={(e) => handleChange('razorpay_webhook_secret', e.target.value)}
                placeholder="whsec_..."
                className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* GATEWAY 4: STRIPE GLOBAL GATEWAY */}
        <div className="monastery-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
                  4. Stripe Global Gateway (International Cards & USD / EUR)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Direct processing for North American, European, and East Asian Buddhist patrons.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={gateways.stripe_mode}
                onChange={(e) => handleChange('stripe_mode', e.target.value)}
                className="text-xs font-bold border border-gray-300 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:outline-none"
              >
                <option value="test">Test Mode</option>
                <option value="live">Live (Production)</option>
              </select>

              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={gateways.payment_stripe_enabled === '1'}
                  onChange={(e) => handleChange('payment_stripe_enabled', e.target.checked ? '1' : '0')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-bold text-gray-700">
                  {gateways.payment_stripe_enabled === '1' ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Stripe Publishable Key
              </label>
              <input
                type="text"
                value={gateways.stripe_publishable_key}
                onChange={(e) => handleChange('stripe_publishable_key', e.target.value)}
                placeholder="pk_live_..."
                className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Stripe Secret Key <span className="text-gray-400 font-normal">(Encrypted)</span>
              </label>
              <div className="relative">
                <input
                  type={showStripeSecret ? 'text' : 'password'}
                  value={gateways.stripe_secret_key}
                  onChange={(e) => handleChange('stripe_secret_key', e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowStripeSecret(!showStripeSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showStripeSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Stripe Webhook Signing Secret
              </label>
              <input
                type="text"
                value={gateways.stripe_webhook_secret}
                onChange={(e) => handleChange('stripe_webhook_secret', e.target.value)}
                placeholder="whsec_..."
                className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-2 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Configuring gateways immediately updates the public donation modal and QR scanner.</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="monastic-maroon-btn px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 shadow-lg border border-[#D4AF37]/50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Configurations...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Save All Configurations</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
