import React, { useState, useEffect } from 'react';
import { Heart, Plus, Target, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function Campaigns() {
  const { success, error } = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Campaign Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState(5000000);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2027-12-31');
  const [description, setDescription] = useState('');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donations/campaigns');
      if (res.data.success) setCampaigns(res.data.data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleAddCampaign = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/donations/campaigns', {
        title,
        targetAmount: parseFloat(targetAmount),
        startDate,
        endDate,
        description
      });
      if (res.data.success) {
        success('New fundraising campaign created!');
        setShowAddModal(false);
        setTitle('');
        fetchCampaigns();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create campaign');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Fundraising Campaigns
          </h1>
          <p className="text-xs text-gray-500">
            Track goals, targets, and public offering campaigns for stupa construction and monastic projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => {
          const raised = parseFloat(c.raised_amount || 0);
          const target = parseFloat(c.target_amount || 1);
          const percent = Math.min(100, Math.round((raised / target) * 100));

          return (
            <div key={c.id} className="monastery-card p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    {c.status || 'ACTIVE'}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ends: {new Date(c.end_date).toLocaleDateString('en-GB')}</span>
                  </span>
                </div>

                <h3 className="font-serif-brand font-bold text-base text-[#4A0E17] mt-3">{c.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">{c.description}</p>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Raised: <strong className="text-emerald-700 font-mono">₹{raised.toLocaleString('en-IN')}</strong></span>
                  <span className="text-gray-500 font-medium">Goal: <strong className="text-gray-800 font-mono">₹{target.toLocaleString('en-IN')}</strong></span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#D4AF37] to-[#4A0E17] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-500">
                  <span>{percent}% Funded</span>
                  <span>{c.donations_count || 0} Devotee Offerings</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
              Create New Fundraising Campaign
            </h3>

            <form onSubmit={handleAddCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Great Druk Wangyel Peace Stupa - Spire Phase"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Fundraising Goal (INR ₹) *</label>
                <input
                  type="number"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(parseFloat(e.target.value))}
                  className="w-full p-2.5 rounded border border-gray-300 font-bold text-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details and objectives of this sacred campaign..."
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
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
