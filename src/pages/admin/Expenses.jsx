import React, { useState, useEffect } from 'react';
import { 
  Wallet, Plus, CheckCircle2, Clock, IndianRupee, Filter, 
  Search, XCircle, AlertCircle, Check, X, Building2, Calendar, FileText
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function Expenses() {
  const { success, error } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, paid, rejected
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('1');
  const [payeeName, setPayeeName] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [bankAccountId, setBankAccountId] = useState('');
  const [description, setDescription] = useState('');

  // Rejection Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchDependencies = async () => {
    try {
      const [catRes, bankRes] = await Promise.all([
        api.get('/accounts/categories'),
        api.get('/accounts/banks')
      ]);
      if (catRes.data.success) {
        setCategories(catRes.data.data || []);
        if (catRes.data.data?.length > 0) {
          setCategoryId(String(catRes.data.data[0].id));
        }
      }
      if (bankRes.data.success) {
        setBankAccounts(bankRes.data.data || []);
        if (bankRes.data.data?.length > 0) {
          setBankAccountId(String(bankRes.data.data[0].id));
        }
      }
    } catch (err) {
      console.error('Failed to load expense categories/banks:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts/expenses?limit=100');
      if (res.data.success) setExpenses(res.data.data || []);
    } catch (err) {
      console.error('Failed to load expenses:', err);
      error(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/accounts/expenses', {
        expenseDate,
        categoryId: parseInt(categoryId, 10),
        payeeName,
        title: title || description || `Payment to ${payeeName}`,
        amount: parseFloat(amount),
        paymentMethod: paymentMode,
        bankAccountId: bankAccountId ? parseInt(bankAccountId, 10) : null,
        description
      });
      if (res.data.success) {
        success('Expense claim submitted for administrative approval!');
        setShowAddModal(false);
        setTitle('');
        setPayeeName('');
        setAmount('');
        setDescription('');
        fetchExpenses();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to record expense');
    }
  };

  const handleApprove = async (id, action, reason = null) => {
    try {
      const payload = { action };
      if (action === 'rejected') {
        payload.rejectionReason = reason;
      }
      const res = await api.post(`/accounts/expenses/${id}/approve`, payload);
      if (res.data.success) {
        success(`Expense voucher ${action} successfully!`);
        if (showRejectModal) setShowRejectModal(false);
        fetchExpenses();
      }
    } catch (err) {
      error(err.response?.data?.message || `Failed to ${action} expense`);
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesTab = activeTab === 'all' || exp.status === activeTab;
    const matchesCat = categoryFilter === 'all' || String(exp.category_id) === String(categoryFilter);
    const matchesSearch = !searchQuery ||
      exp.voucher_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.payee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesCat && matchesSearch;
  });

  const totalDisbursed = expenses
    .filter(e => e.status === 'paid' || e.status === 'approved')
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  const pendingAmount = expenses
    .filter(e => e.status === 'pending')
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  const pendingCount = expenses.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#090D16] border border-[#2A1E17] p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20">
              <Wallet className="w-5 h-5 text-[#E11D48]" />
            </span>
            <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-white">
              Expenses & Disbursement Vouchers
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Review, verify, and approve operational vouchers, supplier payables, and stupa disbursements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#F43F5E] hover:to-[#E11D48] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-[#E11D48]/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense Claim</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Total Disbursed</span>
          <p className="text-2xl font-bold text-white mt-2 font-mono">₹{totalDisbursed.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-emerald-400 mt-1">Approved & settled payment vouchers</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Pending Claims</span>
          <p className="text-2xl font-bold text-amber-400 mt-2 font-mono">{pendingCount}</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">₹{pendingAmount.toLocaleString('en-IN')} awaiting authorization</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Total Claims Logged</span>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{expenses.length}</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">Fiscal year voucher register</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Settled / Paid Rate</span>
          <p className="text-2xl font-bold text-[#D4AF37] mt-2 font-mono">
            {expenses.length > 0 ? Math.round(((expenses.filter(e => e.status === 'paid' || e.status === 'approved').length) / expenses.length) * 100) : 0}%
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-1">Processed vouchers ratio</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl overflow-hidden shadow-xl">
        {/* Controls */}
        <div className="p-5 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 bg-[#090D16] p-1 rounded-xl border border-white/10">
            {['all', 'pending', 'approved', 'paid', 'rejected'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? tab === 'pending'
                      ? 'bg-amber-500 text-black shadow'
                      : tab === 'approved' || tab === 'paid'
                      ? 'bg-emerald-500 text-white shadow'
                      : tab === 'rejected'
                      ? 'bg-red-500 text-white shadow'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] shadow'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 lg:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search voucher, payee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-semibold focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#090D16] text-[#94A3B8] font-bold uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3.5 px-5">Voucher #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payee & Purpose</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Channel</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-[#94A3B8]">
                    No expense claims match active criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#D4AF37]">
                      {exp.voucher_no || `PV-${exp.id}`}
                    </td>
                    <td className="py-3.5 px-4 text-[#CBD5E1]">
                      {exp.expense_date ? new Date(exp.expense_date).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{exp.payee_name}</div>
                      <div className="text-[10px] text-[#94A3B8] line-clamp-1">{exp.title || exp.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[#CBD5E1] font-medium">{exp.category_name || 'General Expense'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-red-400">
                      ₹{parseFloat(exp.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">
                      <div>{exp.payment_method || exp.payment_mode || 'Bank Transfer'}</div>
                      {exp.bank_account_name && (
                        <div className="text-[10px] text-[#D4AF37]">{exp.bank_account_name}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        exp.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        exp.status === 'approved' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        exp.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {exp.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {exp.status === 'pending' && (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(exp.id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                            title="Approve Claim"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectId(exp.id);
                              setShowRejectModal(true);
                            }}
                            className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                            title="Reject Claim"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {exp.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(exp.id, 'paid')}
                          className="px-2.5 py-1 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:opacity-90 text-[#090D16] rounded-lg text-xs font-bold transition-all"
                        >
                          Disburse (Paid)
                        </button>
                      )}
                      {(exp.status === 'paid' || exp.status === 'rejected') && (
                        <span className="text-[11px] text-[#94A3B8]">Settled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#E11D48]/10 text-[#E11D48]">
                  <Wallet className="w-5 h-5" />
                </span>
                <h3 className="font-serif-brand font-bold text-base text-white">
                  Record Expense Claim
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Expense Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Payee / Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="e.g. Phuntsho Hardware & Traders"
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Purpose / Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cement Bags purchase for Great Stupa foundation"
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-mono font-bold focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Payment Method</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer (BOB/BNB)</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Petty Cash">Petty Cash</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>
              </div>

              {bankAccounts.length > 0 && paymentMode === 'Bank Transfer' && (
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Source Bank Account</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bank_name} - {b.account_number} (₹{parseFloat(b.current_balance || 0).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Bill Narration / Invoice Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of the voucher, invoice number, delivery note..."
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif-brand font-bold text-base text-red-400">
                Reject Expense Claim
              </h3>
              <button 
                type="button" 
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Please state the justification for rejecting this payment voucher:
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Missing supporting tax invoice or duplicate claim..."
              className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
            ></textarea>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApprove(rejectId, 'rejected', rejectionReason)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
