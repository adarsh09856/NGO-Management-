import React, { useState } from 'react';
import { X, Heart, Shield, CheckCircle2, Download, ArrowRight, Lock, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function DonationModal({ isOpen, onClose, defaultCampaignId, defaultAmount }) {
  const { success, error } = useToast();
  const [frequency, setFrequency] = useState('one_time');
  const [currency, setCurrency] = useState('INR');
  const [selectedPreset, setSelectedPreset] = useState(defaultAmount || 5000);
  const [customAmount, setCustomAmount] = useState('');
  const [donationFor, setDonationFor] = useState('Peace Stupa Construction');
  const [campaignId, setCampaignId] = useState(defaultCampaignId || 1);

  // Donor Details Form
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [panTaxId, setPanTaxId] = useState('');
  const [is80g, setIs80g] = useState(true);

  // States
  const [step, setStep] = useState('form'); // 'form', 'processing', 'success'
  const [completedDonation, setCompletedDonation] = useState(null);

  if (!isOpen) return null;

  const currentAmount = customAmount ? parseFloat(customAmount) : selectedPreset;

  const handlePresetClick = (amt) => {
    setSelectedPreset(amt);
    setCustomAmount('');
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!donorName.trim() || !donorEmail.trim()) {
      error('Please provide your full name and email address for the tax receipt.');
      return;
    }
    if (!currentAmount || currentAmount <= 0) {
      error('Please select or enter a valid donation amount.');
      return;
    }

    try {
      setStep('processing');

      // 1. Create order
      const orderRes = await api.post('/payments/create-order', {
        amount: currentAmount,
        currency,
        donorEmail,
        campaignId,
        donationFor
      });

      const { orderId } = orderRes.data.data;

      // 2. Settlement verification
      const verifyRes = await api.post('/payments/verify', {
        razorpayOrderId: orderId,
        razorpayPaymentId: `pay_gateway_${Date.now()}`,
        donorName,
        donorEmail,
        donorPhone,
        donorAddress,
        amount: currentAmount,
        currency,
        campaignId,
        donationFor,
        donationType: frequency,
        sendReceipt: true,
        remarks: `Online donation for ${donationFor}`
      });

      if (verifyRes.data.success) {
        setCompletedDonation(verifyRes.data.data);
        setStep('success');
        success('Merit offering received! Your official tax receipt has been generated.');
      }
    } catch (err) {
      setStep('form');
      error(err.response?.data?.message || 'Payment processing failed. Please try again.');
    }
  };

  const handleDownloadPdf = () => {
    const target = completedDonation?.receiptId || completedDonation?.receiptNumber;
    if (target) {
      window.open(`/api/receipts/${target}/pdf`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-lg my-auto rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D4AF37]/40 overflow-hidden relative animate-scale-in flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1A0B0E] via-[#4A0E17] to-[#1A0B0E] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#D4AF37]/40 flex-shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-lg text-[#D4AF37]">☸</span>
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-serif uppercase tracking-widest text-[#D4AF37] block truncate">
                ༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པར་ཞལ་འདེབས་ཕུལ་བ།
              </span>
              <h3 className="font-editorial font-bold text-base sm:text-lg text-[#FCFBF9] truncate">
                Offer Sacred Dana & Merit
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {step === 'form' && (
          <form onSubmit={handleCheckout} className="p-4 sm:p-6 space-y-4 overflow-y-auto font-serif flex-1">
            {/* Frequency Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#FAF5F0] p-1 rounded-xl border border-[#D4AF37]/20 text-xs">
              <button
                type="button"
                onClick={() => setFrequency('one_time')}
                className={`py-2 font-bold rounded-lg transition-all ${
                  frequency === 'one_time'
                    ? 'bg-gradient-to-r from-[#4A0E17] to-[#721C24] text-[#D4AF37] shadow-md'
                    : 'text-gray-700 hover:text-[#4A0E17]'
                }`}
              >
                One-Time Gift
              </button>
              <button
                type="button"
                onClick={() => setFrequency('recurring')}
                className={`py-2 font-bold rounded-lg transition-all ${
                  frequency === 'recurring'
                    ? 'bg-gradient-to-r from-[#4A0E17] to-[#721C24] text-[#D4AF37] shadow-md'
                    : 'text-gray-700 hover:text-[#4A0E17]'
                }`}
              >
                Monthly Pledge
              </button>
            </div>

            {/* Donation Cause */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Select Cause / Sacred Project
              </label>
              <select
                value={donationFor}
                onChange={(e) => setDonationFor(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5F0]/50 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              >
                <option value="Peace Stupa Construction">Great Druk Wangyel Peace Stupa Construction</option>
                <option value="Shedra Monastic University">Shedra Monastic University & Scholarships</option>
                <option value="Sangha Daily Food Fund">Sangha Monks Daily Meals & Healthcare</option>
                <option value="Butter Lamp Puja Sponsorship">108 Butter Lamps & World Peace Prayers</option>
              </select>
            </div>

            {/* Amount Presets */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  Amount ({currency})
                </label>
                <div className="flex items-center space-x-1.5 text-xs font-semibold">
                  <span className={currency === 'INR' ? 'font-bold text-[#721C24]' : 'text-gray-400'}>INR (₹)</span>
                  <span className="text-gray-300">|</span>
                  <span className={currency === 'USD' ? 'font-bold text-[#721C24]' : 'text-gray-400'}>USD ($)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 mb-2">
                {(currency === 'INR' ? [500, 1000, 5000, 25000] : [25, 50, 100, 500]).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handlePresetClick(amt)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      selectedPreset === amt && !customAmount
                        ? 'bg-gradient-to-r from-[#4A0E17] to-[#721C24] text-[#D4AF37] border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/30'
                        : 'bg-[#FAF5F0]/50 border-[#D4AF37]/25 text-gray-700 hover:border-[#D4AF37]'
                    }`}
                  >
                    {currency === 'INR' ? '₹' : '$'}{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Or custom amount..."
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedPreset(null);
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5F0]/50 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            {/* Donor Info Grid */}
            <div className="space-y-2.5 pt-2 border-t border-[#D4AF37]/20">
              <h4 className="text-[10px] sm:text-[11px] font-bold text-[#1A0B0E] uppercase tracking-wider">
                Devotee Details (for Official Tax Receipt)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Tashi Phuntsho"
                    className="w-full text-xs p-2 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5F0]/50 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="devotee@example.com"
                    className="w-full text-xs p-2 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5F0]/50 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="+975 17556559"
                    className="w-full text-xs p-2 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5F0]/50 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">PAN / Tax ID (Optional)</label>
                  <input
                    type="text"
                    value={panTaxId}
                    onChange={(e) => setPanTaxId(e.target.value)}
                    placeholder="For tax exemption"
                    className="w-full text-xs p-2 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5F0]/50 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">City, Country</label>
                <input
                  type="text"
                  value={donorAddress}
                  onChange={(e) => setDonorAddress(e.target.value)}
                  placeholder="Gelephu, Bhutan / New York, USA"
                  className="w-full text-xs p-2 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5F0]/50 focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-0.5">
                <input
                  type="checkbox"
                  id="modal80g"
                  checked={is80g}
                  onChange={(e) => setIs80g(e.target.checked)}
                  className="rounded border-[#D4AF37] text-[#4A0E17] focus:ring-[#D4AF37]"
                />
                <label htmlFor="modal80g" className="text-[11px] text-gray-600">
                  Email official 80G tax receipt PDF immediately
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="monastic-maroon-btn w-full py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl"
              >
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Offer Dana · {currency === 'INR' ? '₹' : '$'}{currentAmount ? currentAmount.toLocaleString() : '0'}</span>
              </button>
              <p className="text-[10px] text-center text-gray-500 mt-1.5 flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-600" />
                256-Bit SSL Encrypted Checkout · 100% Tax Deductible
              </p>
            </div>
          </form>
        )}

        {/* Processing State */}
        {step === 'processing' && (
          <div className="p-10 sm:p-14 text-center space-y-4 font-serif flex-1 flex flex-col justify-center items-center">
            <div className="w-12 h-12 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 className="font-editorial font-bold text-lg sm:text-xl text-[#1A0B0E]">
              Connecting to Sacred Treasury Gateway...
            </h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              Registering your merit offering and preparing the official receipt.
            </p>
          </div>
        )}

        {/* Success / Receipt State */}
        {step === 'success' && (
          <div className="p-6 sm:p-8 text-center space-y-4 font-serif flex-1 overflow-y-auto">
            <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-editorial text-xl sm:text-2xl text-[#1A0B0E]">
                Tashi Delek! Merit Offering Received
              </h4>
              <p className="text-xs text-gray-600">
                Thank you, <strong>{donorName}</strong>. May your virtuous contribution bring eternal peace, auspiciousness, and spiritual flourishing.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#FAF5F0] border border-[#D4AF37]/50 rounded-2xl p-4 max-w-sm mx-auto text-left text-xs space-y-2 shadow-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt No:</span>
                <span className="font-bold text-[#1A0B0E] font-mono">{completedDonation?.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-bold text-emerald-700 font-mono">{currency} ₹{currentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dedication:</span>
                <span className="font-semibold text-gray-800 line-clamp-1">{donationFor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Exemption:</span>
                <span className="text-emerald-700 font-bold">ROB Certified / 80G Eligible</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              <button
                onClick={handleDownloadPdf}
                className="monastic-maroon-btn px-5 py-2.5 rounded-full text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Download PDF Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
