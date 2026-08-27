import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Download, Search, Filter, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AllDonations() {
  const { success, error } = useToast();
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      let url = '/donations?limit=50';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) setDonations(res.data.data);
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation record?')) return;
    try {
      const res = await api.delete(`/donations/${id}`);
      if (res.data.success) {
        success('Donation record deleted');
        fetchDonations();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            All Donations Record
          </h1>
          <p className="text-xs text-gray-500">
            Comprehensive ledger of all individual, organization, and online donations received.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/donations/add"
            className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Donation</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="monastery-card p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchDonations(); }} className="flex gap-2 w-full sm:w-80">
          <input
            type="text"
            placeholder="Search donor name, receipt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs p-2 rounded border border-gray-300 w-full"
          />
          <button type="submit" className="px-3 py-2 bg-[#4A0E17] text-white text-xs font-bold rounded">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="monastery-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-3 px-4">Receipt</th>
                <th className="py-3 px-4">Donor Name</th>
                <th className="py-3 px-4">Cause / Project</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#4A0E17]">{d.receipt_number || `RC-${d.id}`}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{d.donor_name || 'Anonymous'}</td>
                  <td className="py-3 px-4 font-semibold text-gray-700">{d.donation_for}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(d.payment_date).toLocaleDateString('en-GB')}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">₹{parseFloat(d.amount).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 capitalize">{d.payment_method?.replace('_', ' ')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {d.payment_status || 'COMPLETED'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {d.receipt_id && (
                        <a
                          href={`/api/receipts/${d.receipt_id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-[#4A0E17] hover:bg-[#FDF6E2] rounded"
                          title="Download Receipt PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(d.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
