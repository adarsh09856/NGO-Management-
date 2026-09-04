import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet, TrendingUp, TrendingDown, Landmark, Receipt, FileText,
  PlusCircle, ArrowUpRight, ArrowDownRight, DollarSign, CreditCard,
  Building2, BookOpen, BarChart3, RefreshCw, X, CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart
} from 'recharts';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AccountsDashboard() {
  const { success, error } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Voucher Modal
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherNo, setVoucherNo] = useState(`PV-2026-${String(Math.floor(Math.random() * 900 + 100))}`);
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().slice(0, 10));
  const [voucherType, setVoucherType] = useState('payment');
  const [particulars, setParticulars] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [bankAccountId, setBankAccountId] = useState('');
  const [submittingVoucher, setSubmittingVoucher] = useState(false);

  async function fetchDashboard() {
    try {
      setLoading(true);
      const res = await api.get('/accounts/dashboard');
      if (res.data.success) {
        setData(res.data.data);
        if (res.data.data.bankAccounts?.length > 0 && !bankAccountId) {
          setBankAccountId(res.data.data.bankAccounts[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load accounts dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    try {
      setSubmittingVoucher(true);
      const res = await api.post('/accounts/vouchers', {
        voucherNo,
        voucherDate,
        voucherType,
        particulars,
        totalAmount: parseFloat(totalAmount),
        paymentMode,
        bankAccountId: bankAccountId ? parseInt(bankAccountId, 10) : null
      });
      if (res.data.success) {
        success('Payment voucher created and ledger updated!');
        setShowVoucherModal(false);
        setParticulars('');
        setTotalAmount('');
        setVoucherNo(`PV-2026-${String(Math.floor(Math.random() * 900 + 100))}`);
        fetchDashboard();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create voucher');
    } finally {
      setSubmittingVoucher(false);
    }
  };

  const stats = data?.stats || {
    totalIncome: 0,
    incomeGrowth: 0,
    totalExpenses: 0,
    expenseGrowth: 0,
    netSurplus: 0,
    surplusGrowth: 0,
    totalReceivables: 0,
    overdueInvoicesCount: 0,
    totalPayables: 0,
    overdueBillsCount: 0,
    cashInHand: 0
  };

  const monthlySeries = data?.monthlySeries || [];
  const recentTransactions = data?.recentTransactions || [];
  const bankAccounts = data?.bankAccounts || [];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A]">
            Accounts & Financial Ledger
          </h1>
          <p className="text-xs text-gray-500">
            Real-time income receipts, expense vouchers, and bank ledger balances.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboard}
            className="p-2 bg-white border border-[#E2E8F0] rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#E11D48]' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowVoucherModal(true)}
            className="bg-[#E11D48] hover:bg-[#1E293B] text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Voucher</span>
          </button>
        </div>
      </div>

      {/* 1. Stat Cards Strip (100% Real Live Computed from MySQL) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Income (This Month)</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">
            ₹ {Number(stats.totalIncome || 0).toLocaleString('en-IN')}
          </h3>
          <p className={`text-[10px] font-semibold flex items-center mt-0.5 ${stats.incomeGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {stats.incomeGrowth >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {Math.abs(stats.incomeGrowth)}% vs last month
          </p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Expenses (This Month)</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">
            ₹ {Number(stats.totalExpenses || 0).toLocaleString('en-IN')}
          </h3>
          <p className={`text-[10px] font-semibold flex items-center mt-0.5 ${stats.expenseGrowth <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {stats.expenseGrowth >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {Math.abs(stats.expenseGrowth)}% vs last month
          </p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Net Surplus (Month)</p>
          <h3 className={`font-serif-brand font-bold text-lg mt-1 ${stats.netSurplus >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            ₹ {Number(stats.netSurplus || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
            Operational Margin
          </p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Receivables</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">
            ₹ {Number(stats.totalReceivables || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">Pending Invoices</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Pending Payables</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">
            ₹ {Number(stats.totalPayables || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">
            {stats.overdueBillsCount} Pending Claims
          </p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Cash & Bank</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">
            ₹ {Number(stats.cashInHand || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            Active Vault & Bank
          </p>
        </div>
      </div>

      {/* 2. Main Analytics & Bank Accounts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Trend Composed Chart (7 Cols) */}
        <div className="lg:col-span-8 monastery-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
                Income vs Expenses (Monthly Performance)
              </h3>
              <p className="text-xs text-gray-500">Live dual-entry transactions ledger</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> Income
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span> Expense
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val) => [`₹ ${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#D4AF37', borderRadius: '8px', color: '#FFF' }}
                />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
                <Line type="monotone" dataKey="net" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} name="Net Surplus" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Bank Accounts Overview (4 Cols) */}
        <div className="lg:col-span-4 monastery-card p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
            <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#D4AF37]" />
              <span>Bank & Cash Balances</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              Active
            </span>
          </div>

          <div className="space-y-3">
            {bankAccounts.map((acc) => (
              <div key={acc.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex justify-between items-center">
                <div>
                  <p className="font-bold text-xs text-[#0F172A]">{acc.account_name}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{acc.account_number}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-xs text-[#0F172A]">
                    ₹ {Number(acc.current_balance || 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[9px] text-gray-400 uppercase font-semibold">{acc.currency || 'INR'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Recent Vouchers & Transactions */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center">
          <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
            Recent Ledger Transactions & Vouchers
          </h3>
          <Link to="/admin/accounts/expenses" className="text-xs text-[#E11D48] hover:underline font-bold">
            View All Expenses →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F5F9] text-gray-700 font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Particulars</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.map((t, idx) => (
                <tr key={t.id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 text-gray-600">
                    {t.voucher_date ? new Date(t.voucher_date).toLocaleDateString('en-GB') : '-'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                    {t.voucher_no || `TXN-${idx + 1}`}
                  </td>
                  <td className="py-3 px-4 capitalize">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.voucher_type === 'receipt' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t.voucher_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    {t.particulars}
                  </td>
                  <td className={`py-3 px-4 font-mono font-bold ${t.voucher_type === 'receipt' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {t.voucher_type === 'receipt' ? '+' : '-'}₹ {Number(t.total_amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 uppercase">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                      {t.status || 'posted'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Issue Payment / Receipt Voucher
              </h3>
              <button onClick={() => setShowVoucherModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Voucher No *</label>
                  <input
                    type="text"
                    required
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Voucher Type *</label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold"
                  >
                    <option value="payment">Payment Voucher</option>
                    <option value="receipt">Receipt Voucher</option>
                    <option value="journal">Journal Voucher</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={voucherDate}
                    onChange={(e) => setVoucherDate(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full p-2.5 rounded border border-gray-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Particulars / Description *</label>
                <input
                  type="text"
                  required
                  value={particulars}
                  onChange={(e) => setParticulars(e.target.value)}
                  placeholder="e.g. Stupa stone cutting contractor payment"
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bank Account</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 bg-white"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.account_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVoucher}
                  className="px-4 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded font-bold flex items-center gap-1.5 shadow"
                >
                  {submittingVoucher ? 'Posting...' : 'Post Voucher to Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
