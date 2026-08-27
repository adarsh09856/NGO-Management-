import React, { useState, useEffect } from 'react';
import { Wallet, Plus, CheckCircle2, Clock, DollarSign, Filter, Search } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function Expenses() {
  const { success, error } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenseDate, setExpenseDate] = useState('2026-08-25');
  const [category, setCategory] = useState('Construction Materials');
  const [payeeName, setPayeeName] = useState('Phuntsho Traders');
  const [amount, setAmount] = useState('18500');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [description, setDescription] = useState('Cement bags purchase for Stupa foundation');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts/expenses?limit=50');
      if (res.data.success) setExpenses(res.data.data);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/accounts/expenses', {
        expenseDate,
        category,
        payeeName,
        amount: parseFloat(amount),
        paymentMode,
        description
      });
      if (res.data.success) {
        success('Expense recorded and posted to ledger!');
        setShowAddModal(false);
        fetchExpenses();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to record expense');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Expenses & Disbursement Claims
          </h1>
          <p className="text-xs text-gray-500">
            Record, verify, and approve operational and construction expenditures.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Table */}
      <div className="monastery-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-3 px-4">Expense No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payee / Vendor</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#4A0E17]">{exp.expense_number || `EXP-${exp.id}`}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(exp.expense_date).toLocaleDateString('en-GB')}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{exp.category}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{exp.payee_name}</td>
                  <td className="py-3 px-4 font-mono font-bold text-red-700">-₹{parseFloat(exp.amount).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-gray-600">{exp.payment_mode}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {exp.approval_status || 'APPROVED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
              Record New Expense / Disbursement
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold"
                  >
                    <option value="Construction Materials">Construction Materials</option>
                    <option value="Monastery Food & Kitchen">Monastery Food & Kitchen</option>
                    <option value="Electricity & Utilities">Electricity & Utilities</option>
                    <option value="Ritual & Puja Supplies">Ritual & Puja Supplies</option>
                    <option value="Staff Travel & Honorarium">Staff Travel & Honorarium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Payee / Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="e.g. Phuntsho Hardware & Traders"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Amount (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 font-bold text-red-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold"
                  >
                    <option value="Bank Transfer">Bank Transfer (BOB)</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Petty Cash">Petty Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Bill Memo</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Voucher details..."
                  className="w-full p-2 rounded border border-gray-300"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#4A0E17] text-white rounded font-bold hover:bg-[#5A121E]"
                >
                  Save & Post Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
