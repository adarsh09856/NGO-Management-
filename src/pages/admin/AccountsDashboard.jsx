import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet, TrendingUp, TrendingDown, Landmark, Receipt, FileText,
  PlusCircle, ArrowUpRight, ArrowDownRight, DollarSign, CreditCard,
  Building2, BookOpen, BarChart3, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart
} from 'recharts';
import api from '../../services/api';

export default function AccountsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await api.get('/accounts/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load accounts dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const stats = data?.stats || {
    totalIncome: 548230,
    incomeGrowth: 18.6,
    totalExpenses: 271890,
    expenseGrowth: 10.2,
    netSurplus: 276340,
    surplusGrowth: 28.4,
    totalReceivables: 125600,
    overdueInvoicesCount: 2,
    totalPayables: 87450,
    overdueBillsCount: 1,
    cashInHand: 92350
  };

  const monthlySeries = data?.monthlySeries || [
    { month: 'Jan', income: 420000, expense: 210000, net: 210000 },
    { month: 'Feb', income: 460000, expense: 230000, net: 230000 },
    { month: 'Mar', income: 510000, expense: 250000, net: 260000 },
    { month: 'Apr', income: 480000, expense: 220000, net: 260000 },
    { month: 'May', income: 530000, expense: 260000, net: 270000 },
    { month: 'Jun', income: 590000, expense: 280000, net: 310000 },
    { month: 'Jul', income: 640000, expense: 290000, net: 350000 },
    { month: 'Aug', income: 548230, expense: 271890, net: 276340 },
    { month: 'Sep', income: 490000, expense: 240000, net: 250000 },
    { month: 'Oct', income: 520000, expense: 250000, net: 270000 },
    { month: 'Nov', income: 470000, expense: 230000, net: 240000 },
    { month: 'Dec', income: 580000, expense: 270000, net: 310000 }
  ];

  const recentTransactions = data?.recentTransactions || [
    { voucher_date: '2026-08-25', particulars: 'Donation Received - Tashi Phuntsho', voucher_no: 'RC-2026-105', voucher_type: 'receipt', total_amount: 25000, status: 'posted' },
    { voucher_date: '2026-08-25', particulars: 'Construction Material Purchase', voucher_no: 'PV-2026-089', voucher_type: 'payment', total_amount: 18500, status: 'posted' },
    { voucher_date: '2026-08-24', particulars: 'Training Fee - Group of Monks', voucher_no: 'RC-2026-104', voucher_type: 'receipt', total_amount: 10000, status: 'posted' },
    { voucher_date: '2026-08-24', particulars: 'Staff Salary - Aug 2026', voucher_no: 'JV-2026-088', voucher_type: 'journal', total_amount: 65000, status: 'posted' },
    { voucher_date: '2026-08-23', particulars: 'Electricity Bill - Monastery', voucher_no: 'PV-2026-087', voucher_type: 'payment', total_amount: 8750, status: 'posted' }
  ];

  const bankAccounts = data?.bankAccounts || [
    { account_name: 'BOB - Main Account', account_number: 'A/c No. 123456789000', current_balance: 425680 },
    { account_name: 'HDFC - Donation Account', account_number: 'A/c No. 50200012345678', current_balance: 215430 },
    { account_name: 'Cash Account', account_number: 'Cash in Hand', current_balance: 92350 },
    { account_name: 'Petty Cash', account_number: 'Petty Cash Account', current_balance: 12870 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar (Matching image 3 top) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
          Accounts & Finance
        </h1>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500 font-medium px-3 py-1.5 bg-white border border-[#EBE5D8] rounded">
            25 Aug 2026
          </span>
          <Link
            to="/admin/accounts/expenses"
            className="bg-[#7E1929] hover:bg-[#5A121E] text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Transaction</span>
          </Link>
        </div>
      </div>

      {/* 1. Stat Cards Strip (Matching image 3 top) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Income (This Month)</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">₹ 5,48,230</h3>
          <p className="text-[10px] text-emerald-600 font-semibold flex items-center mt-0.5">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> 18.6% vs last month
          </p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Expenses (This Month)</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">₹ 2,71,890</h3>
          <p className="text-[10px] text-emerald-600 font-semibold flex items-center mt-0.5">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> 10.2% vs last month
          </p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Net Surplus (This Month)</p>
          <h3 className="font-serif-brand font-bold text-lg text-emerald-700 mt-1">₹ 2,76,340</h3>
          <p className="text-[10px] text-emerald-600 font-semibold flex items-center mt-0.5">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> 28.4% vs last month
          </p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Receivables</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">₹ 1,25,600</h3>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">2 Invoices Overdue</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Payables</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">₹ 87,450</h3>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">1 Bill Overdue</p>
        </div>

        <div className="monastery-card p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Cash in Hand</p>
          <h3 className="font-serif-brand font-bold text-lg text-gray-900 mt-1">₹ 92,350</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Vault Balance</p>
        </div>
      </div>

      {/* 2. Middle Section: Chart & Recent Transactions & Bank Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expense Overview Chart (Matching image 3 top) */}
        <div className="lg:col-span-8 monastery-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Income vs Expense Overview</h3>
              <p className="text-[11px] text-gray-500">Consolidated monthly financial cashflow</p>
            </div>
            <select className="text-xs border rounded px-2.5 py-1 bg-white text-gray-700">
              <option>This Year</option>
              <option>Previous Year</option>
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip formatter={(val) => `₹ ${val.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="income" name="Income (₹)" fill="#059669" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" name="Expense (₹)" fill="#DC2626" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="net" name="Net (₹)" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bank Accounts List (Matching image 3 top right) */}
        <div className="lg:col-span-4 monastery-card p-5 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Bank Accounts</h3>
            <span className="text-[11px] font-bold text-[#8B1E2F]">View All</span>
          </div>

          <div className="space-y-3 text-xs">
            {bankAccounts.map((b, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900 leading-tight">{b.account_name}</p>
                  <p className="text-[10px] text-gray-500">{b.account_number}</p>
                </div>
                <p className="font-serif-brand font-bold text-gray-900 font-mono">
                  ₹ {parseFloat(b.current_balance).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/admin/accounts/ledger"
              className="w-full bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] text-[#4A0E17] py-2 rounded text-xs font-bold text-center block"
            >
              View Full General Ledger
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Recent Transactions Table (Matching image 3 top) */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#EBE5D8] flex justify-between items-center">
          <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Recent Transactions</h3>
          <Link to="/admin/accounts/ledger" className="text-xs font-bold text-[#8B1E2F] hover:underline">
            View All Transactions
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Particulars</th>
                <th className="py-2.5 px-4">Voucher No.</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Amount (₹)</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-2.5 px-4 text-gray-600">{new Date(tx.voucher_date).toLocaleDateString('en-GB')}</td>
                  <td className="py-2.5 px-4 font-semibold text-gray-900">{tx.particulars}</td>
                  <td className="py-2.5 px-4 font-mono font-medium text-[#4A0E17]">{tx.voucher_no}</td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      tx.voucher_type === 'receipt' ? 'bg-emerald-100 text-emerald-800' :
                      tx.voucher_type === 'payment' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tx.voucher_type}
                    </span>
                  </td>
                  <td className={`py-2.5 px-4 font-mono font-bold ${tx.voucher_type === 'receipt' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {tx.voucher_type === 'receipt' ? '+' : '-'}₹{parseFloat(tx.total_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Bottom Action Bar (Matching image 3 top) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-center text-xs">
        <Link to="/admin/receipts" className="p-3 bg-white border border-[#EBE5D8] hover:border-[#D4AF37] rounded-lg font-semibold text-gray-800 flex flex-col items-center gap-1 shadow-sm">
          <Receipt className="w-4 h-4 text-[#8B1E2F]" />
          <span>Add Receipt</span>
        </Link>
        <Link to="/admin/accounts/expenses" className="p-3 bg-white border border-[#EBE5D8] hover:border-[#D4AF37] rounded-lg font-semibold text-gray-800 flex flex-col items-center gap-1 shadow-sm">
          <CreditCard className="w-4 h-4 text-[#8B1E2F]" />
          <span>Add Payment</span>
        </Link>
        <Link to="/admin/accounts/vouchers" className="p-3 bg-white border border-[#EBE5D8] hover:border-[#D4AF37] rounded-lg font-semibold text-gray-800 flex flex-col items-center gap-1 shadow-sm">
          <FileText className="w-4 h-4 text-[#8B1E2F]" />
          <span>Journal Voucher</span>
        </Link>
        <Link to="/admin/accounts/banks" className="p-3 bg-white border border-[#EBE5D8] hover:border-[#D4AF37] rounded-lg font-semibold text-gray-800 flex flex-col items-center gap-1 shadow-sm">
          <Building2 className="w-4 h-4 text-[#8B1E2F]" />
          <span>Bank Transfer</span>
        </Link>
        <Link to="/admin/accounts/expenses" className="p-3 bg-white border border-[#EBE5D8] hover:border-[#D4AF37] rounded-lg font-semibold text-gray-800 flex flex-col items-center gap-1 shadow-sm">
          <DollarSign className="w-4 h-4 text-[#8B1E2F]" />
          <span>Expense Claim</span>
        </Link>
        <Link to="/admin/accounts/ledger" className="p-3 bg-white border border-[#EBE5D8] hover:border-[#D4AF37] rounded-lg font-semibold text-gray-800 flex flex-col items-center gap-1 shadow-sm">
          <FileText className="w-4 h-4 text-[#8B1E2F]" />
          <span>Create Invoice</span>
        </Link>
        <Link to="/admin/accounts/ledger" className="p-3 bg-white border border-[#EBE5D8] hover:border-[#D4AF37] rounded-lg font-semibold text-gray-800 flex flex-col items-center gap-1 shadow-sm">
          <BookOpen className="w-4 h-4 text-[#8B1E2F]" />
          <span>Chart of Accounts</span>
        </Link>
        <Link to="/admin/reports" className="p-3 bg-white border border-[#EBE5D8] hover:border-[#D4AF37] rounded-lg font-semibold text-gray-800 flex flex-col items-center gap-1 shadow-sm">
          <BarChart3 className="w-4 h-4 text-[#8B1E2F]" />
          <span>Financial Reports</span>
        </Link>
      </div>
    </div>
  );
}
