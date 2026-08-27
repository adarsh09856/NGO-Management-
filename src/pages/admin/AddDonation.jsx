import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartHandshake, Plus, Printer, User, List, Save, CreditCard,
  Building2, Banknote, FileCheck, CheckSquare, Square, X, CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// Helper to convert number to Indian words
function convertNumberToWords(amount) {
  if (!amount || isNaN(amount) || amount <= 0) return 'Zero Rupees Only';
  const num = Math.floor(amount);
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if ((n = n.toString()).length > 9) return 'overflow';
    let nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArray) return '';
    let str = '';
    str += (nArray[1] != 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
    str += (nArray[2] != 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
    str += (nArray[3] != 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
    str += (nArray[4] != 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
    str += (nArray[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) : '';
    return str.trim();
  }

  const words = inWords(num);
  return words ? `${words} Only` : 'Zero Rupees Only';
}

export default function AddDonation() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  // Form State (Default initialized to match reference image 1)
  const [donorType, setDonorType] = useState('individual'); // individual, organization, anonymous
  const [donorsList, setDonorsList] = useState([]);
  const [selectedDonorId, setSelectedDonorId] = useState('1'); // Default Tashi Phuntsho

  const [donorName, setDonorName] = useState('Tashi Phuntsho');
  const [email, setEmail] = useState('tashi.phuntsho@email.com');
  const [phone, setPhone] = useState('+975 17 55 8899');
  const [address, setAddress] = useState('Gelephu, Sarpang, Bhutan');

  const [donationFor, setDonationFor] = useState('Peace Stupa Construction');
  const [campaignId, setCampaignId] = useState('1');
  const [campaignsList, setCampaignsList] = useState([]);
  const [donationType, setDonationType] = useState('one_time'); // one_time, recurring
  const [amount, setAmount] = useState('25000');
  const [currency, setCurrency] = useState('INR');

  const [paymentMethod, setPaymentMethod] = useState('online_gateway'); // online_gateway, bank_transfer, cash, cheque_dd, other
  const [transactionRef, setTransactionRef] = useState('TXN1234567890');
  const [paymentDate, setPaymentDate] = useState('2026-08-25');
  const [paymentGateway, setPaymentGateway] = useState('Razorpay');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [remarks, setRemarks] = useState('Donation towards the construction of Great Druk Wangyel Stupa.');
  const [sendReceipt, setSendReceipt] = useState(true);

  const [loading, setLoading] = useState(false);
  const [createdReceiptId, setCreatedReceiptId] = useState(null);

  // Fetch Donors & Campaigns for dropdowns
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [dRes, cRes] = await Promise.all([
          api.get('/donors?limit=50'),
          api.get('/donations/campaigns')
        ]);
        if (dRes.data.success) setDonorsList(dRes.data.data);
        if (cRes.data.success) setCampaignsList(cRes.data.data);
      } catch (err) {
        console.error('Failed to load donor dropdowns:', err);
      }
    }
    loadDropdowns();
  }, []);

  // When donor is selected from dropdown
  const handleDonorSelect = (id) => {
    setSelectedDonorId(id);
    const found = donorsList.find((d) => String(d.id) === String(id));
    if (found) {
      setDonorName(found.full_name);
      setEmail(found.email || '');
      setPhone(found.phone || '');
      setAddress(found.address || '');
      setDonorType(found.donor_type || 'individual');
    }
  };

  const amountInWords = convertNumberToWords(parseFloat(amount) || 0);

  // Save Donation Handler
  const handleSave = async (printReceiptAfter = false) => {
    if (!amount || parseFloat(amount) <= 0) {
      error('Please enter a valid donation amount.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        donorType,
        donorId: selectedDonorId ? parseInt(selectedDonorId, 10) : null,
        newDonor: !selectedDonorId ? { fullName: donorName, email, phone, address } : null,
        donationFor,
        campaignId: campaignId ? parseInt(campaignId, 10) : null,
        donationType,
        amount: parseFloat(amount),
        currency,
        paymentMethod,
        transactionRef,
        paymentDate,
        paymentGateway,
        bankName,
        remarks,
        sendReceipt,
        is80gEligible: true
      };

      const res = await api.post('/donations', payload);
      if (res.data.success) {
        success(`Donation saved! Receipt No: ${res.data.data.receiptNumber}`);
        setCreatedReceiptId(res.data.data.receiptId);

        if (printReceiptAfter && res.data.data.receiptId) {
          window.open(`/api/receipts/${res.data.data.receiptId}/pdf`, '_blank');
        } else {
          setTimeout(() => navigate('/admin/donations'), 1200);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save donation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions (Matching image 1) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Add New Donation
          </h1>
          <p className="text-xs text-gray-500">
            Record a new donation received from a donor.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/donations')}
            className="px-4 py-2 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={loading}
            className="px-5 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Saving...' : 'Save Donation'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Sections + Right Summary Panel (Matching image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 1. Donor Info, 2. Donation Details, 3. Payment Info */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Donor Information */}
          <div className="monastery-card p-6 space-y-4">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] border-b border-gray-100 pb-2">
              1. Donor Information
            </h3>

            {/* Donor Type Radio */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Donor Type *</label>
              <div className="flex items-center space-x-6 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="donorType"
                    value="individual"
                    checked={donorType === 'individual'}
                    onChange={(e) => setDonorType(e.target.value)}
                    className="text-[#7E1929] focus:ring-[#D4AF37]"
                  />
                  <span>Individual</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="donorType"
                    value="organization"
                    checked={donorType === 'organization'}
                    onChange={(e) => setDonorType(e.target.value)}
                    className="text-[#7E1929] focus:ring-[#D4AF37]"
                  />
                  <span>Organization</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="donorType"
                    value="anonymous"
                    checked={donorType === 'anonymous'}
                    onChange={(e) => setDonorType(e.target.value)}
                    className="text-[#7E1929] focus:ring-[#D4AF37]"
                  />
                  <span>Anonymous</span>
                </label>
              </div>
            </div>

            {/* Select Donor dropdown + New Donor button */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Select Donor *</label>
              <div className="flex gap-2">
                <select
                  value={selectedDonorId}
                  onChange={(e) => handleDonorSelect(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded border border-gray-300 bg-white focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <option value="">Search or select donor...</option>
                  {donorsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({d.email || d.phone || 'No email'})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDonorId('');
                    setDonorName('');
                    setEmail('');
                    setPhone('');
                    setAddress('');
                  }}
                  className="px-3 py-2 bg-white border border-[#7E1929] text-[#7E1929] hover:bg-[#FDF6E2] rounded text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Donor</span>
                </button>
              </div>
            </div>

            {/* Donor Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Donor Name</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Tashi Phuntsho"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tashi.phuntsho@email.com"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+975 17 55 8899"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Gelephu, Sarpang, Bhutan"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Donation Details */}
          <div className="monastery-card p-6 space-y-4">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] border-b border-gray-100 pb-2">
              2. Donation Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Donation For *</label>
                <select
                  value={donationFor}
                  onChange={(e) => setDonationFor(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <option value="Peace Stupa Construction">Peace Stupa Construction</option>
                  <option value="Shedra Monastic University">Shedra Monastic University</option>
                  <option value="Sangha Daily Food Fund">Sangha Daily Food Fund</option>
                  <option value="Butter Lamp Puja Sponsorship">Butter Lamp Puja Sponsorship</option>
                  <option value="General Monastery Fund">General Monastery Fund</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Campaign (Optional)</label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <option value="">Select Campaign</option>
                  {campaignsList.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1.5">Donation Type *</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="donationType"
                      value="one_time"
                      checked={donationType === 'one_time'}
                      onChange={(e) => setDonationType(e.target.value)}
                      className="text-[#7E1929] focus:ring-[#D4AF37]"
                    />
                    <span>One Time</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="donationType"
                      value="recurring"
                      checked={donationType === 'recurring'}
                      onChange={(e) => setDonationType(e.target.value)}
                      className="text-[#7E1929] focus:ring-[#D4AF37]"
                    />
                    <span>Recurring</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Amount (INR) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="25000"
                    className="w-full pl-7 pr-3 py-2.5 rounded border border-gray-300 font-bold text-[#4A0E17] focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="BTN">BTN - Bhutanese Ngultrum</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Amount in Words</label>
                <input
                  type="text"
                  disabled
                  value={amountInWords}
                  className="w-full p-2.5 rounded border border-gray-200 bg-gray-50 text-gray-600 font-medium italic"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Information */}
          <div className="monastery-card p-6 space-y-4">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] border-b border-gray-100 pb-2">
              3. Payment Information
            </h3>

            {/* Payment Method Cards (Matching image 1) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Payment Method *</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { id: 'online_gateway', label: 'Online Payment Gateway', sub: 'Gateway', icon: CreditCard },
                  { id: 'bank_transfer', label: 'Bank Transfer', sub: 'NEFT / RTGS', icon: Building2 },
                  { id: 'cash', label: 'Cash', sub: 'Direct Vault', icon: Banknote },
                  { id: 'cheque_dd', label: 'Cheque / DD', sub: 'Bank instrument', icon: FileCheck },
                  { id: 'other', label: 'Other', sub: 'Misc Mode', icon: Plus }
                ].map((m) => {
                  const Icon = m.icon;
                  const selected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-center transition-all ${
                        selected
                          ? 'border-[#7E1929] bg-[#FDF2E9] ring-2 ring-[#7E1929] text-[#7E1929] font-bold'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1 text-[#7E1929]" />
                      <span className="text-[11px] leading-tight block">{m.label}</span>
                      <span className="text-[9px] text-gray-500 block">{m.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transaction Ref, Date, Gateway, Bank */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Transaction / Reference No.</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="TXN1234567890"
                  className="w-full p-2.5 rounded border border-gray-300 font-mono focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-medium focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Payment Gateway</label>
                <select
                  value={paymentGateway}
                  onChange={(e) => setPaymentGateway(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <option value="Razorpay">Razorpay</option>
                  <option value="Stripe">Stripe</option>
                  <option value="Direct Transfer">Direct Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Bank (If applicable)</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="Bank of Bhutan">Bank of Bhutan</option>
                  <option value="Druk PNB Bank">Druk PNB Bank</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Donation towards the construction of Great Druk Wangyel Stupa."
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="sm:col-span-2 flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="sendReceiptCheckbox"
                  checked={sendReceipt}
                  onChange={(e) => setSendReceipt(e.target.checked)}
                  className="rounded border-gray-300 text-[#7E1929] focus:ring-[#D4AF37]"
                />
                <label htmlFor="sendReceiptCheckbox" className="font-semibold text-gray-700 cursor-pointer">
                  Send Thank You Email / Receipt to Donor
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Donation Summary Panel & Quick Actions (Matching image 1) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Donation Summary Card */}
          <div className="monastery-card p-5 space-y-4">
            <h3 className="font-serif-brand font-bold text-sm text-[#7E1929] border-b border-gray-100 pb-2">
              Donation Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-gray-500">Donor Name</span>
                <span className="font-bold text-gray-900 text-right">{donorName || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-gray-500">Donation For</span>
                <span className="font-semibold text-gray-800 text-right">{donationFor}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Donation Type</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {donationType === 'one_time' ? 'One Time' : 'Recurring'}
                </span>
              </div>

              <div className="pt-2 border-t flex justify-between items-baseline">
                <span className="text-gray-600 font-semibold">Amount</span>
                <span className="font-serif-brand font-bold text-xl text-emerald-700 font-mono">
                  ₹ {parseFloat(amount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {paymentMethod === 'online_gateway' ? `Online Payment (${paymentGateway})` : paymentMethod.replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Date</span>
                <span className="font-medium text-gray-800">{new Date(paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Transaction No.</span>
                <span className="font-mono text-gray-800 font-medium">{transactionRef || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Receipt No.</span>
                <span className="font-mono text-gray-500 italic">- (Auto Generate)</span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500">Tax Receipts</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Eligible (80G)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card (Matching image 1 bottom right) */}
          <div className="monastery-card p-5 space-y-2.5 text-xs">
            <h4 className="font-serif-brand font-bold text-xs text-[#4A0E17] uppercase tracking-wider mb-2">
              Quick Actions
            </h4>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={loading}
              className="w-full p-2.5 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-md font-semibold text-gray-800 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#7E1929]" />
                <span>Save & Print Receipt</span>
              </div>
              <span className="text-gray-400">⎙</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleSave(false);
                setAmount('');
                setTransactionRef(`TXN${Date.now()}`);
              }}
              disabled={loading}
              className="w-full p-2.5 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-md font-semibold text-gray-800 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#7E1929]" />
                <span>Save & Add Another</span>
              </div>
              <span className="text-gray-400">+</span>
            </button>

            <button
              type="button"
              onClick={() => selectedDonorId && navigate(`/admin/donors`)}
              className="w-full p-2.5 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-md font-semibold text-gray-800 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#7E1929]" />
                <span>View Donor Profile</span>
              </div>
              <span className="text-gray-400">👤</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/donations')}
              className="w-full p-2.5 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-md font-semibold text-gray-800 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-[#7E1929]" />
                <span>Go to All Donations</span>
              </div>
              <span className="text-gray-400">☰</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
