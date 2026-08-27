import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, Search, Filter, Printer, Ban, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function MoneyReceipts() {
  const { success, error } = useToast();
  const [receipts, setReceipts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Void Receipt Modal State
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [voiding, setVoiding] = useState(false);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      let url = '/receipts?limit=50';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setReceipts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReceipts();
  };

  const handleVoidSubmit = async (e) => {
    e.preventDefault();
    if (!voidReason || voidReason.trim().length < 10) {
      error('Please provide a detailed void reason (minimum 10 characters) for financial audit records.');
      return;
    }

    try {
      setVoiding(true);
      const res = await api.post(`/receipts/${selectedReceipt.id}/void`, { voidReason });
      if (res.data.success) {
        success(res.data.message);
        setVoidModalOpen(false);
        setVoidReason('');
        setSelectedReceipt(null);
        fetchReceipts();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to void receipt');
    } finally {
      setVoiding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Money Receipts & 80G Certificates
          </h1>
          <p className="text-xs text-gray-500">
            Official sequential tax-deductible receipt records and audit trail.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="monastery-card p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by receipt no, recipient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs p-2.5 rounded border border-gray-300 w-full sm:w-80"
          />
          <button type="submit" className="px-4 py-2 bg-[#4A0E17] text-white text-xs font-bold rounded">
            Search
          </button>
        </form>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded border border-gray-300 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="ISSUED">ISSUED</option>
            <option value="VOID">VOID (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="monastery-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Financial Year</th>
                <th className="py-3 px-4">Recipient Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {receipts.map((r) => (
                <tr key={r.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#4A0E17]">{r.receipt_number}</td>
                  <td className="py-3 px-4 text-gray-600">{r.financial_year}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{r.recipient_name}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(r.receipt_date).toLocaleDateString('en-GB')}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">₹{parseFloat(r.amount).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-gray-600">{r.payment_mode}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 line-through'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <a
                        href={`/api/receipts/${r.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-[#FAF5F0] hover:bg-[#FDF6E2] text-[#4A0E17] border border-[#D4AF37] rounded font-bold flex items-center gap-1 shadow-sm"
                        title="Download PDF Receipt"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>

                      {r.status === 'ISSUED' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReceipt(r);
                            setVoidModalOpen(true);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Void / Cancel Receipt"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Void Modal with Audit Reason */}
      {voidModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-red-200 p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center space-x-3 text-red-700 border-b pb-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-serif-brand font-bold text-base">
                  Void Receipt: {selectedReceipt.receipt_number}
                </h3>
                <p className="text-xs text-gray-500">
                  Recipient: {selectedReceipt.recipient_name} · Amount: ₹{parseFloat(selectedReceipt.amount).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Voiding an official money receipt reverses the corresponding ledger entry and records an immutable audit trail.
            </p>

            <form onSubmit={handleVoidSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Mandatory Void Justification / Reason * (Min 10 characters)
                </label>
                <textarea
                  rows={3}
                  required
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="e.g. Duplicate receipt issued in error during bank reconciliation."
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-red-500"
                ></textarea>
                <span className="text-[10px] text-gray-400">Characters: {voidReason.length}/10 required</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVoidModalOpen(false)}
                  className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={voiding || voidReason.trim().length < 10}
                  className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold disabled:opacity-50"
                >
                  {voiding ? 'Processing Void...' : 'Confirm Void & Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
