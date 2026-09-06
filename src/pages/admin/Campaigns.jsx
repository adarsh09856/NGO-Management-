import React, { useState, useEffect } from 'react';
import { Heart, Plus, Target, Calendar, CheckCircle2, TrendingUp, Edit2, Trash2, X, AlertCircle, Power } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function Campaigns() {
  const { success, error } = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Campaign Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState(1000000);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [description, setDescription] = useState('');

  // Edit Campaign Modal
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsActive, setEditIsActive] = useState(1);
  const [editIsFeatured, setEditIsFeatured] = useState(0);

  // Delete Campaign State
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        setDescription('');
        fetchCampaigns();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create campaign');
    }
  };

  const openEditModal = (campaign) => {
    setEditingCampaign(campaign);
    setEditTitle(campaign.title || '');
    setEditTargetAmount(campaign.target_amount || '');
    setEditDescription(campaign.description || '');
    setEditIsActive(campaign.is_active ? 1 : 0);
    setEditIsFeatured(campaign.is_featured ? 1 : 0);
  };

  const handleUpdateCampaign = async (e) => {
    e.preventDefault();
    if (!editingCampaign) return;
    try {
      const res = await api.put(`/donations/campaigns/${editingCampaign.id}`, {
        title: editTitle,
        targetAmount: parseFloat(editTargetAmount),
        description: editDescription,
        isActive: editIsActive,
        isFeatured: editIsFeatured
      });
      if (res.data.success) {
        success('Campaign updated successfully!');
        setEditingCampaign(null);
        fetchCampaigns();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update campaign');
    }
  };

  const handleToggleStatus = async (campaign) => {
    try {
      const newStatus = campaign.is_active ? 0 : 1;
      const res = await api.put(`/donations/campaigns/${campaign.id}/status`, {
        isActive: newStatus
      });
      if (res.data.success) {
        success(res.data.message || 'Campaign status updated');
        fetchCampaigns();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteCampaign = async () => {
    if (!deletingCampaign) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/donations/campaigns/${deletingCampaign.id}`);
      if (res.data.success) {
        success('Campaign deleted successfully!');
        setDeletingCampaign(null);
        fetchCampaigns();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Cannot delete campaign');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A]">
            Fundraising Campaigns
          </h1>
          <p className="text-xs text-gray-500">
            Track goals, targets, and public offering campaigns for stupa construction and monastic projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <div className="monastery-card p-12 text-center space-y-3">
          <Target className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-serif-brand font-bold text-base text-gray-700">No Active Fundraising Campaigns</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">Create a campaign to track offerings, set fundraising goals, and rally devotee patrons for sacred Stupa or Shedra initiatives.</p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E11D48] text-white rounded text-xs font-bold uppercase tracking-wider shadow hover:bg-[#BE123C]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Campaign</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => {
            const raised = parseFloat(c.raised_amount || 0);
            const target = parseFloat(c.target_amount || 1);
            const percent = Math.min(100, Math.round((raised / target) * 100));

            return (
              <div key={c.id} className="monastery-card p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {c.is_active ? 'ACTIVE' : 'ARCHIVED'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c)}
                        title={c.is_active ? 'Archive Campaign' : 'Activate Campaign'}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                          c.is_active ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {c.is_active ? 'Archive' : 'Activate'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        title="Edit Campaign"
                        className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCampaign(c)}
                        title="Delete Campaign"
                        className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif-brand font-bold text-base text-[#0F172A] mt-3">{c.title}</h3>
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
                      className="bg-gradient-to-r from-[#D4AF37] to-[#0F172A] h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-gray-500">
                    <span>{percent}% Funded</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>Ends {new Date(c.end_date).toLocaleDateString('en-GB')}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
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
                  className="flex-1 py-2 bg-[#0F172A] text-white rounded font-bold hover:bg-[#1E293B]"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Edit Campaign Details
              </h3>
              <button onClick={() => setEditingCampaign(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Goal (INR ₹) *</label>
                <input
                  type="number"
                  required
                  value={editTargetAmount}
                  onChange={(e) => setEditTargetAmount(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2 rounded border border-gray-300"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsActive === 1}
                    onChange={(e) => setEditIsActive(e.target.checked ? 1 : 0)}
                    className="rounded border-gray-300 text-[#E11D48]"
                  />
                  <span className="font-bold text-gray-700">Active Campaign</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsFeatured === 1}
                    onChange={(e) => setEditIsFeatured(e.target.checked ? 1 : 0)}
                    className="rounded border-gray-300 text-[#D4AF37]"
                  />
                  <span className="font-bold text-gray-700">Feature on Home</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#E11D48] text-white rounded font-bold hover:bg-[#BE123C]"
                >
                  Update Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Campaign Confirmation Modal */}
      {deletingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Delete Campaign?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-gray-900">{deletingCampaign.title}</span>?
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded mt-2 border border-amber-200 text-left">
                <strong>Audit Rule:</strong> Campaigns with recorded devotee donations cannot be deleted; use the <strong>Archive</strong> button to close them instead.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCampaign(null)}
                className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteCampaign}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
