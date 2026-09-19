import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Search, Filter,
  RefreshCw, Copy, Check, Eye, Download, Send, ArrowUpDown,
  ShieldCheck, CreditCard, QrCode, Building2, User, Calendar,
  ExternalLink, Edit3, X, Sparkles, ChevronLeft, ChevronRight,
  Info, DollarSign, HeartHandshake, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useCurrency, SUPPORTED_CURRENCIES } from '../../context/CurrencyContext';

export default function PaymentApprovals() {
  const { success, error, info } = useToast();
  const { currencySymbol, currency } = useCurrency();

  // Data & Pagination State
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [summary, setSummary] = useState({
    pendingCount: 0,
    pendingAmount: 0,
    verifiedCount: 0,
    verifiedAmount: 0,
    rejectedCount: 0,
    todayCount: 0,
    todayAmount: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  // Filters State
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all' | 'completed' | 'rejected'
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Modals State
  const [reviewModalPayment, setReviewModalPayment] = useState(null);
  const [rejectModalPayment, setRejectModalPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editUtrPayment, setEditUtrPayment] = useState(null);
  const [editUtrValue, setEditUtrValue] = useState('');
  const [editUtrRemarks, setEditUtrRemarks] = useState('');

  // Fetch Payments from Backend API
  const fetchPayments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        status: activeTab,
        method: selectedMethod !== 'all' ? selectedMethod : undefined,
        search: searchQuery.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      };

      const res = await api.get('/payments/approvals', { params });
      if (res.data?.success && res.data?.data) {
        setPayments(res.data.data.payments || []);
        setPagination(res.data.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
        setSummary(res.data.data.summary || {
          pendingCount: 0,
          pendingAmount: 0,
          verifiedCount: 0,
          verifiedAmount: 0,
          rejectedCount: 0,
          todayCount: 0,
          todayAmount: 0
        });
      }
    } catch (err) {
      console.error('Failed to load payment approvals:', err);
      error(err.response?.data?.message || 'Failed to load payments feed');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedMethod, searchQuery, dateFrom, dateTo, pagination.limit, error]);

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  // Handle Copy to Clipboard
  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success(`Copied "${text}" to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. One-Click Verify & Approve Payment
  const handleApprove = async (payment) => {
    if (!window.confirm(`Are you sure you want to verify and approve payment ${payment.receipt_number || `#${payment.id}`} for ${currencySymbol}${parseFloat(payment.amount).toLocaleString('en-IN')}? This will certify the 80G tax receipt and email the donor.`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/donations/${payment.id}/verify`);
      if (res.data?.success) {
        success(res.data.message || 'Payment verified and official receipt generated!');
        if (reviewModalPayment?.id === payment.id) {
          setReviewModalPayment(null);
        }
        fetchPayments(pagination.page);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to verify payment');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Reject Payment with Stated Justification
  const handleOpenReject = (payment) => {
    setRejectModalPayment(payment);
    setRejectionReason('UTR transaction reference not found on official bank account statement.');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModalPayment) return;
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      error('Please enter a valid rejection reason of at least 5 characters.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/donations/${rejectModalPayment.id}/reject`, {
        rejectionReason: rejectionReason.trim()
      });
      if (res.data?.success) {
        success(res.data.message || 'Payment marked as rejected. Devotee has been notified.');
        setRejectModalPayment(null);
        if (reviewModalPayment?.id === rejectModalPayment.id) {
          setReviewModalPayment(null);
        }
        fetchPayments(pagination.page);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reject payment');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Edit UTR Reference
  const handleOpenEditUtr = (payment) => {
    setEditUtrPayment(payment);
    setEditUtrValue(payment.transaction_ref || '');
    setEditUtrRemarks('');
  };

  const handleConfirmEditUtr = async (e) => {
    e.preventDefault();
    if (!editUtrPayment) return;
    if (!editUtrValue.trim()) {
      error('Please enter a valid UTR / transaction reference.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/donations/${editUtrPayment.id}/utr`, {
        transactionRef: editUtrValue.trim(),
        remarks: editUtrRemarks.trim()
      });
      if (res.data?.success) {
        success(res.data.message || 'Transaction reference updated successfully!');
        setEditUtrPayment(null);
        fetchPayments(pagination.page);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update transaction reference');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Resend Receipt Email
  const handleResendReceipt = async (paymentId) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/donations/${paymentId}/resend-receipt`);
      if (res.data?.success) {
        success(res.data.message || 'Receipt re-sent to devotee!');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to re-send receipt email');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper for Payment Method Badge
  const renderMethodBadge = (method) => {
    switch (method) {
      case 'upi_qr':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <QrCode className="w-3 h-3" /> UPI QR (UTR)
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Building2 className="w-3 h-3" /> Bank Wire
          </span>
        );
      case 'online_gateway':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CreditCard className="w-3 h-3" /> Gateway Online
          </span>
        );
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-500/10 text-gray-300 border border-gray-500/20">
            Cash Offering
          </span>
        );
      case 'cheque_dd':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Cheque / DD
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-500/10 text-gray-300 border border-gray-500/20 capitalize">
            {method ? method.replace('_', ' ') : 'Other'}
          </span>
        );
    }
  };

  // Helper for Status Badge
  const renderStatusBadge = (status, rejectionReason) => {
    if (status === 'pending_verification' || status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
          <Clock className="w-3 h-3" /> Pending Verification
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" /> Verified & Issued
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 cursor-help"
          title={rejectionReason ? `Reason: ${rejectionReason}` : 'Payment Rejected'}
        >
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
          <AlertCircle className="w-3 h-3" /> Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-500/15 text-gray-300 border border-gray-500/30 uppercase">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#F8FAFC]">
      {/* 1. Header Bar */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#BE123C] to-[#4A0E17] border border-[#D4AF37]/40 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif-brand text-white flex items-center gap-2">
                <span>Payment Approvals & Treasury Hub</span>
                {summary.pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-black shadow-md animate-bounce">
                    {summary.pendingCount} Pending Action
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Reconcile submitted UPI UTRs, bank wires, and online offerings against Bank of Bhutan statements.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={() => fetchPayments(pagination.page)}
            disabled={loading}
            className="bg-[#1E293B] hover:bg-[#334155] text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 flex items-center space-x-1.5 transition-all shadow-sm"
            title="Refresh payments list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Queue */}
        <div
          onClick={() => setActiveTab('pending')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden shadow-lg ${
            activeTab === 'pending'
              ? 'bg-gradient-to-br from-[#2A1D0B] to-[#17110A] border-amber-500/50 ring-2 ring-amber-500/30'
              : 'bg-[#0F172A] border-white/10 hover:border-amber-500/30'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Pending Approvals Queue
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold font-mono text-white">
              {summary.pendingCount}
            </h3>
            <span className="text-xs font-bold text-amber-400 font-mono">
              ({currencySymbol}{summary.pendingAmount.toLocaleString('en-IN')})
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Submitted UTRs awaiting bank verification
          </p>
        </div>

        {/* Total Verified Inflow */}
        <div
          onClick={() => setActiveTab('completed')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden shadow-lg ${
            activeTab === 'completed'
              ? 'bg-gradient-to-br from-[#0B251A] to-[#081711] border-emerald-500/50 ring-2 ring-emerald-500/30'
              : 'bg-[#0F172A] border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Total Verified Inflow
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold font-mono text-white">
              {currencySymbol}{summary.verifiedAmount.toLocaleString('en-IN')}
            </h3>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {summary.verifiedCount} gifts verified and certified with 80G receipts
          </p>
        </div>

        {/* Rejected Payments */}
        <div
          onClick={() => setActiveTab('rejected')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden shadow-lg ${
            activeTab === 'rejected'
              ? 'bg-gradient-to-br from-[#2B0E14] to-[#17090C] border-red-500/50 ring-2 ring-red-500/30'
              : 'bg-[#0F172A] border-white/10 hover:border-red-500/30'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
              Rejections & Exceptions
            </span>
            <span className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold font-mono text-white">
              {summary.rejectedCount}
            </h3>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Unverified, duplicate, or mismatch UTR records
          </p>
        </div>

        {/* Today's Collections */}
        <div
          onClick={() => {
            const today = new Date().toISOString().slice(0, 10);
            setDateFrom(today);
            setDateTo(today);
          }}
          className="rounded-2xl p-5 border bg-[#0F172A] border-white/10 shadow-lg"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              Today's Collections
            </span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold font-mono text-white">
              {currencySymbol}{summary.todayAmount.toLocaleString('en-IN')}
            </h3>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {summary.todayCount} confirmed offerings received today
          </p>
        </div>
      </div>

      {/* 3. Filters & Controls */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Approvals</span>
              {summary.pendingCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'pending' ? 'bg-black text-amber-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {summary.pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-[#1E293B] text-white border border-white/20 shadow-md'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>All Payments</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified / Issued</span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'rejected'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected</span>
              {summary.rejectedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-white/20 text-white">
                  {summary.rejectedCount}
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-gray-400">
            Showing <strong className="text-white">{payments.length}</strong> of{' '}
            <strong className="text-white">{pagination.total}</strong> records
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search UTR, donor, email, receipt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#090D16] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full p-2 bg-[#090D16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">All Payment Channels</option>
              <option value="upi_qr">UPI QR (UTR Proof)</option>
              <option value="bank_transfer">Bank Wire (BoB IMPS/NEFT)</option>
              <option value="online_gateway">Online Gateway (Razorpay/Stripe)</option>
              <option value="cash">Cash Offering</option>
              <option value="cheque_dd">Cheque / Demand Draft</option>
            </select>
          </div>

          {/* Date From */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 whitespace-nowrap">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-2 bg-[#090D16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Date To & Clear */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 whitespace-nowrap">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-2 bg-[#090D16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
            {(searchQuery || selectedMethod !== 'all' || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMethod('all');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="p-2 text-xs bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl whitespace-nowrap"
                title="Clear all filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Payments Data Table */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090D16] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Receipt / ID</th>
                <th className="py-3 px-4">Devotee & Contact</th>
                <th className="py-3 px-4">Sacred Cause</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">UTR / Transaction Ref</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Treasury Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    <RefreshCw className="w-7 h-7 mx-auto text-[#D4AF37] animate-spin mb-2" />
                    <p className="font-semibold text-white">Loading payment verification records...</p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    <ShieldCheck className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                    <p className="font-bold text-white text-sm">No payment records found</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      {activeTab === 'pending'
                        ? 'All pending UTRs have been reconciled! The treasury verification queue is clean.'
                        : 'Try adjusting your search query or filters to find specific payments.'}
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isPending = p.payment_status === 'pending_verification' || p.payment_status === 'pending';
                  const symbol = (p.currency && SUPPORTED_CURRENCIES[p.currency]?.symbol) || currencySymbol;
                  const formattedAmt = parseFloat(p.amount || 0).toLocaleString('en-IN');

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isPending ? 'bg-amber-500/[0.02]' : ''
                      }`}
                    >
                      {/* Receipt / ID */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-white">
                          {p.receipt_number || `RC-${p.id}`}
                        </div>
                        {p.tracking_id && (
                          <div className="text-[10px] text-gray-400 truncate max-w-[110px]">
                            {p.tracking_id}
                          </div>
                        )}
                      </td>

                      {/* Devotee */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{p.donor_name || 'Anonymous Devotee'}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[160px]">
                          {p.donor_email || 'No email registered'}
                        </div>
                        {p.donor_phone && (
                          <div className="text-[10px] text-gray-500 font-mono">
                            {p.donor_phone}
                          </div>
                        )}
                      </td>

                      {/* Cause */}
                      <td className="py-3.5 px-4 font-medium text-gray-300 max-w-[160px] truncate">
                        {p.donation_for || p.campaign_title || 'General Monastery Fund'}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-base text-emerald-400 whitespace-nowrap">
                        {symbol} {formattedAmt}
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderMethodBadge(p.payment_method)}
                      </td>

                      {/* UTR / Transaction Ref with 1-Click Copy */}
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`p-1 px-2 rounded font-bold text-[11px] select-all ${
                              p.transaction_ref
                                ? 'bg-[#090D16] border border-white/10 text-[#D4AF37]'
                                : 'text-gray-500'
                            }`}
                          >
                            {p.transaction_ref || 'N/A'}
                          </span>
                          {p.transaction_ref && (
                            <button
                              type="button"
                              onClick={() => handleCopy(p.transaction_ref, p.id)}
                              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                              title="Copy UTR to clipboard"
                            >
                              {copiedId === p.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEditUtr(p)}
                            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-[#D4AF37] transition-colors"
                            title="Edit / Correct UTR"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(p.payment_status, p.rejection_reason)}
                        {p.verified_by_name && (
                          <div className="text-[9.5px] text-gray-500 mt-0.5">
                            by {p.verified_by_name}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap">
                        <div>{new Date(p.payment_date).toLocaleDateString('en-GB')}</div>
                        <div className="text-[10px] text-gray-500">
                          {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Pending actions */}
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(p)}
                                disabled={actionLoading}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                                title="Verify against Bank Statement & Issue Certified 80G Receipt"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenReject(p)}
                                disabled={actionLoading}
                                className="px-2.5 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                                title="Reject Payment (UTR not received or mismatch)"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : p.payment_status === 'completed' ? (
                            <>
                              {p.receipt_id && (
                                <a
                                  href={`/api/receipts/${p.receipt_id}/pdf`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-[#1E293B] hover:bg-[#334155] text-white rounded-lg border border-white/10 flex items-center gap-1 text-[11px]"
                                  title="Download Official 80G PDF Receipt"
                                >
                                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                                  <span>PDF</span>
                                </a>
                              )}

                              {p.donor_email && (
                                <button
                                  type="button"
                                  onClick={() => handleResendReceipt(p.id)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-[#1E293B] hover:bg-[#334155] text-gray-300 hover:text-white rounded-lg border border-white/10 text-[11px]"
                                  title="Re-send receipt email to devotee"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApprove(p)}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-[10px] font-bold"
                              title="Re-verify payment if bank statement confirms"
                            >
                              Re-verify
                            </button>
                          )}

                          {/* Details Button */}
                          <button
                            type="button"
                            onClick={() => setReviewModalPayment(p)}
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors"
                            title="View complete payment & devotee breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-white/10 bg-[#090D16] flex items-center justify-between text-xs text-gray-400">
            <div>
              Page <strong className="text-white">{pagination.page}</strong> of{' '}
              <strong className="text-white">{pagination.totalPages}</strong>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchPayments(pagination.page - 1)}
                className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchPayments(pagination.page + 1)}
                className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: COMPLETE BREAKDOWN & VERIFICATION MODAL                */}
      {/* ============================================================== */}
      {reviewModalPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp text-white">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0B0F19]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-brand font-bold text-base">
                    Payment Verification & Devotee Audit
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Receipt: {reviewModalPayment.receipt_number || `RC-${reviewModalPayment.id}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalPayment(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Financial Highlight Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A0E17] to-[#1E293B] border border-[#D4AF37]/30 flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                    Sacred Offering Amount
                  </span>
                  <h2 className="text-3xl font-bold font-mono text-white mt-0.5">
                    {reviewModalPayment.currency || 'BTN'} {parseFloat(reviewModalPayment.amount).toLocaleString('en-IN')}
                  </h2>
                  <p className="text-xs text-gray-300 italic mt-0.5">
                    {reviewModalPayment.amount_in_words || 'Offering received for monastery and stupa'}
                  </p>
                </div>
                <div className="text-right">
                  {renderStatusBadge(reviewModalPayment.payment_status, reviewModalPayment.rejection_reason)}
                </div>
              </div>

              {/* Devotee Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Devotee Information
                </h4>
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#090D16] border border-white/5 rounded-xl text-xs">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Full Legal Name:</span>
                    <strong className="text-white">{reviewModalPayment.donor_name || 'Anonymous'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Email Address:</span>
                    <strong className="text-white">{reviewModalPayment.donor_email || 'Not Provided'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Contact Phone:</span>
                    <span className="text-white font-mono">{reviewModalPayment.donor_phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Country:</span>
                    <span className="text-white">{reviewModalPayment.donor_country || 'Bhutan'}</span>
                  </div>
                  {reviewModalPayment.donor_address && (
                    <div className="col-span-2">
                      <span className="text-gray-500 block text-[11px]">Address:</span>
                      <span className="text-gray-300">{reviewModalPayment.donor_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction & Proof Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Transaction & Settlement Proof
                </h4>
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#090D16] border border-white/5 rounded-xl text-xs">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Payment Channel:</span>
                    <div className="mt-1">{renderMethodBadge(reviewModalPayment.payment_method)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Payment Date:</span>
                    <span className="text-white font-mono">
                      {new Date(reviewModalPayment.payment_date).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-[11px]">Submitted UTR / Transaction Reference:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="p-1.5 px-3 rounded bg-black/60 border border-amber-500/30 text-[#D4AF37] font-mono text-sm font-bold flex-1 select-all">
                        {reviewModalPayment.transaction_ref || 'N/A'}
                      </code>
                      {reviewModalPayment.transaction_ref && (
                        <button
                          type="button"
                          onClick={() => handleCopy(reviewModalPayment.transaction_ref, 'modal')}
                          className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white rounded-lg font-semibold flex items-center gap-1.5 text-xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy UTR</span>
                        </button>
                      )}
                    </div>
                  </div>
                  {reviewModalPayment.remarks && (
                    <div className="col-span-2">
                      <span className="text-gray-500 block text-[11px]">Devotee Intention / Remarks:</span>
                      <span className="text-gray-300 italic">{reviewModalPayment.remarks}</span>
                    </div>
                  )}
                  {reviewModalPayment.rejection_reason && (
                    <div className="col-span-2 p-2.5 rounded bg-red-950/40 border border-red-500/30">
                      <span className="text-red-400 font-bold block text-[11px]">Rejection Reason:</span>
                      <span className="text-red-200">{reviewModalPayment.rejection_reason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-[#0B0F19] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setReviewModalPayment(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
              >
                Close
              </button>

              <div className="flex items-center space-x-2">
                {(reviewModalPayment.payment_status === 'pending_verification' || reviewModalPayment.payment_status === 'pending') && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenReject(reviewModalPayment)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Payment</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(reviewModalPayment)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Certify Receipt</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: REJECTION JUSTIFICATION MODAL                         */}
      {/* ============================================================== */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-red-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp text-white">
            <div className="p-5 border-b border-white/10 bg-red-950/40 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-brand font-bold text-base text-red-200">
                    Reject Payment Submission
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Receipt Ref: {rejectModalPayment.receipt_number || `#${rejectModalPayment.id}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalPayment(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-4">
              <p className="text-xs text-gray-300 leading-relaxed">
                Rejecting this offering will void the pending receipt and send a notification email to{' '}
                <strong className="text-white">{rejectModalPayment.donor_email || rejectModalPayment.donor_name}</strong>{' '}
                explaining why the UTR could not be reconciled.
              </p>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Quick Rejection Presets:
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    'UTR transaction reference not found on official bank account statement.',
                    'Amount received in bank differs from the submitted offering amount.',
                    'Duplicate transaction reference submitted for a previous offering.',
                    'Bank wire transfer failed or was reversed by the originating bank.'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className={`text-left p-2 rounded-lg text-xs transition-all border ${
                        rejectionReason === preset
                          ? 'bg-red-950/60 border-red-500 text-red-200 font-semibold'
                          : 'bg-[#090D16] border-white/5 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      • {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Reason Field */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Rejection Reason / Guidance for Devotee *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 bg-[#090D16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  placeholder="Explain why this UTR could not be verified..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectModalPayment(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirm Rejection & Send Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: EDIT UTR REFERENCE MODAL                              */}
      {/* ============================================================== */}
      {editUtrPayment && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp text-white">
            <div className="p-5 border-b border-white/10 bg-[#0B0F19] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif-brand font-bold text-base">
                  Correct UTR / Transaction Reference
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditUtrPayment(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmEditUtr} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Transaction Reference / UTR Number *
                </label>
                <input
                  type="text"
                  required
                  value={editUtrValue}
                  onChange={(e) => setEditUtrValue(e.target.value)}
                  className="w-full p-2.5 bg-[#090D16] border border-white/10 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  Treasury Notes / Reason for Correction
                </label>
                <input
                  type="text"
                  value={editUtrRemarks}
                  onChange={(e) => setEditUtrRemarks(e.target.value)}
                  placeholder="e.g. Corrected mistyped digit confirmed by donor"
                  className="w-full p-2.5 bg-[#090D16] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditUtrPayment(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl gold-gradient-btn text-white font-bold shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Update UTR Reference</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
