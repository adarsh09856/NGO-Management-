import React, { useState } from 'react';
import { X, Heart, Shield, CheckCircle2, Download, ArrowRight, Lock } from 'lucide-react';
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

      // 2. Mock payment settlement against sandbox endpoint
      const verifyRes = await api.post('/payments/verify', {
        razorpayOrderId: orderId,
        razorpayPaymentId: `pay_sandbox_${Date.now()}`,
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
        success('Payment completed! Your official 80G tax receipt has been generated.');
      }
    } catch (err) {
      setStep('form');
      error(err.response?.data?.message || 'Payment processing failed. Please try again.');
    }
  };

  const handleDownloadPdf = () => {
    if (completedDonation?.receiptId) {
      window.open(`/api/receipts/${completedDonation.receiptId}/pdf`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0F172A] text-white p-5 flex items-center justify-between border-b-2 border-[#D4AF37]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#1E293B] border border-[#D4AF37] flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-serif-brand font-bold text-base md:text-lg">
                Support Drodul Phendey Ling
              </h3>
              <p className="text-xs text-[#D4AF37] font-tibetan">
                དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པར་ཞལ་འདེབས་ཕུལ་བ།
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        {step === 'form' && (
          <form onSubmit={handleCheckout} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Frequency Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] p-1.5 rounded-lg border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setFrequency('one_time')}
                className={`py-2 text-xs font-bold rounded-md transition-all ${
                  frequency === 'one_time' ? 'bg-[#0F172A] text-white shadow' : 'text-gray-700 hover:text-black'
                }`}
              >
                One-Time Gift
              </button>
              <button
                type="button"
                onClick={() => setFrequency('recurring')}
                className={`py-2 text-xs font-bold rounded-md transition-all ${
                  frequency === 'recurring' ? 'bg-[#0F172A] text-white shadow' : 'text-gray-700 hover:text-black'
                }`}
              >
                Monthly Giving (Pledge)
              </button>
            </div>

            {/* Donation Cause */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Select Cause / Sacred Project
              </label>
              <select
                value={donationFor}
                onChange={(e) => setDonationFor(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#0F172A]"
              >
                <option value="Peace Stupa Construction">Great Druk Wangyel Peace Stupa Construction</option>
                <option value="Shedra Monastic University">Shedra Monastic University & Library</option>
                <option value="Sangha Daily Food Fund">Sangha Monks Daily Food & Care</option>
                <option value="Butter Lamp Puja Sponsorship">108 Butter Lamps & World Peace Prayers</option>
              </select>
            </div>

            {/* Amount Presets */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Select Amount ({currency})
                </label>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={currency === 'INR' ? 'font-bold text-[#0F172A]' : 'text-gray-400'}>INR (₹)</span>
                  <span className="text-gray-300">|</span>
                  <span className={currency === 'USD' ? 'font-bold text-[#0F172A]' : 'text-gray-400'}>USD ($)</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-2.5">
                {(currency === 'INR' ? [500, 1000, 5000, 25000] : [25, 50, 100, 500]).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handlePresetClick(amt)}
                    className={`py-2.5 text-xs font-bold rounded-md border transition-all ${
                      selectedPreset === amt && !customAmount
                        ? 'bg-[#FEF3C7] border-[#D4AF37] text-[#0F172A] ring-2 ring-[#D4AF37]'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {currency === 'INR' ? '₹' : '$'}{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Or enter custom amount..."
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedPreset(null);
                }}
                className="w-full text-xs p-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#0F172A]"
              />
            </div>

            {/* Donor Info Grid */}
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Donor Information (for 80G Tax Receipt)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Tashi Phuntsho"
                    className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="tashi@example.com"
                    className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="+975 17556559"
                    className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">PAN / Tax ID (Optional)</label>
                  <input
                    type="text"
                    value={panTaxId}
                    onChange={(e) => setPanTaxId(e.target.value)}
                    placeholder="Optional for 80G"
                    className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Address (City, Country)</label>
                <input
                  type="text"
                  value={donorAddress}
                  onChange={(e) => setDonorAddress(e.target.value)}
                  placeholder="Gelephu, Sarpang, Bhutan"
                  className="w-full text-xs p-2 rounded border border-gray-300 focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="modal80g"
                  checked={is80g}
                  onChange={(e) => setIs80g(e.target.checked)}
                  className="rounded border-gray-300 text-[#0F172A] focus:ring-[#D4AF37]"
                />
                <label htmlFor="modal80g" className="text-xs text-gray-600">
                  Email official 80G tax receipt PDF immediately after payment
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full bg-[#E11D48] hover:bg-[#1E293B] text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 uppercase tracking-wider text-xs"
              >
                <Lock className="w-4 h-4 text-[#D4AF37]" />
                <span>Complete Offering · {currency === 'INR' ? '₹' : '$'}{currentAmount ? currentAmount.toLocaleString() : '0'}</span>
              </button>
              <p className="text-[11px] text-center text-gray-500 mt-2 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                256-Bit SSL Encrypted Sandbox Checkout · 100% Tax Deductible
              </p>
            </div>
          </form>
        )}

        {/* Processing Spinner */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 className="font-serif-brand font-bold text-lg text-[#0F172A]">
              Communicating with Payment Gateway...
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Securing transaction and registering your sacred donation with Drodul Phendey Ling Foundation.
            </p>
          </div>
        )}

        {/* Thank You & Receipt Screen */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="font-serif-brand font-bold text-xl text-[#0F172A]">
                Tashi Delek! Donation Received
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Thank you, <strong>{donorName}</strong>. May your generous contribution bring eternal peace, merit, and happiness.
              </p>
            </div>

            {/* Receipt Badge */}
            <div className="bg-[#FAF5F0] border border-[#D4AF37] rounded-lg p-4 max-w-sm mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Receipt No:</span>
                <span className="font-bold text-[#0F172A] font-mono">{completedDonation?.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Amount Received:</span>
                <span className="font-bold text-emerald-700 font-mono">{currency} ₹{currentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Purpose:</span>
                <span className="font-semibold text-gray-800">{donationFor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Tax Exemption:</span>
                <span className="text-emerald-600 font-bold">80G Eligible</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleDownloadPdf}
                className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-5 py-2.5 rounded-md font-semibold text-xs flex items-center justify-center gap-2 shadow"
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>Download Official PDF Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-md font-semibold text-xs"
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
