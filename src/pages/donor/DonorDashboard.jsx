import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, FileText, Calendar, Download, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function DonorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await api.get('/donor/my-dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load donor dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-500">Loading your giving history...</div>;

  const donor = data?.donor || {};
  const recentDonations = data?.recentDonations || [];
  const activePledges = data?.activePledges || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#EBE5D8] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif-brand font-bold text-xl text-[#4A0E17]">
            Tashi Delek, {donor.full_name || 'Noble Devotee'}!
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Thank you for being a patron of Drodul Phendey Ling Foundation. Your donations directly support monks and stupa development.
          </p>
        </div>
        <Link
          to="/donate"
          className="bg-[#7E1929] hover:bg-[#5A121E] text-white px-5 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow"
        >
          <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
          <span>Make New Donation</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="monastery-card p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Donated</p>
          <h3 className="font-serif-brand font-bold text-2xl text-[#4A0E17] mt-1">
            ₹ {parseFloat(donor.total_donated || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 80G Tax Deductible
          </p>
        </div>

        <div className="monastery-card p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Donations Made</p>
          <h3 className="font-serif-brand font-bold text-2xl text-gray-900 mt-1">
            {donor.total_donations_count || 0}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">Across all campaigns</p>
        </div>

        <div className="monastery-card p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Pledges</p>
          <h3 className="font-serif-brand font-bold text-2xl text-gray-900 mt-1">
            {activePledges.length}
          </h3>
          <p className="text-[11px] text-[#D4AF37] font-semibold mt-1">Monthly Recurring</p>
        </div>

        <div className="monastery-card p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tax Receipts</p>
          <h3 className="font-serif-brand font-bold text-2xl text-gray-900 mt-1">
            {data?.taxReceiptsCount || 0}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">Ready for Download (PDF)</p>
        </div>
      </div>

      {/* Recent Donations Table */}
      <div className="monastery-card overflow-hidden">
        <div className="p-5 border-b border-[#EBE5D8] flex justify-between items-center">
          <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
            Recent Donation History
          </h3>
          <Link to="/donor/donations" className="text-xs font-bold text-[#8B1E2F] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Donation For</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Ref</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentDonations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No donation records found yet.
                  </td>
                </tr>
              ) : (
                recentDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#4A0E17]">{d.receipt_number || `RC-${d.id}`}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{d.donation_for}</td>
                    <td className="py-3 px-4 text-gray-600">{new Date(d.payment_date).toLocaleDateString('en-GB')}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">₹ {parseFloat(d.amount).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">{d.transaction_ref || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {d.payment_status?.toUpperCase() || 'COMPLETED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {d.receipt_id ? (
                        <a
                          href={`/api/receipts/${d.receipt_id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A0E17] bg-[#FDF6E2] hover:bg-[#FDF2E9] border border-[#D4AF37] px-2.5 py-1 rounded shadow-sm"
                        >
                          <Download className="w-3 h-3 text-[#4A0E17]" />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-[11px]">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
