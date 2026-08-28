import React, { useState, useEffect } from 'react';
import {
  Heart, FileText, Download, Flame, ShieldCheck, User, CheckCircle2,
  Calendar, CreditCard, Clock, Plus, ExternalLink, Save
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import DonationModal from '../../components/DonationModal';

export default function UserDashboard() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'donations', 'pledges', 'prayers', 'profile'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);

  // Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [panOrTaxId, setPanOrTaxId] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadUserDashboard();
  }, []);

  async function loadUserDashboard() {
    try {
      setLoading(true);
      const res = await api.get('/user/my-dashboard');
      if (res.data.success) {
        setData(res.data.data);
        setProfileName(res.data.data.user.fullName || '');
        setProfilePhone(res.data.data.user.phone || '');
        setPanOrTaxId(res.data.data.user.panOrTaxId || '');
      }
    } catch (err) {
      console.error('Failed to load user dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await api.put('/user/my-profile', {
        fullName: profileName,
        phone: profilePhone,
        address: profileAddress,
        panOrTaxId
      });
      if (res.data.success) {
        success('Profile and 80G tax settings updated successfully');
        loadUserDashboard();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const downloadReceipt = (receiptId) => {
    window.open(`/api/receipts/${receiptId}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#7E1929] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-500">Loading your member dashboard...</p>
        </div>
      </div>
    );
  }

  const { user, givingStats, donations = [], receipts = [], pledges = [], prayerRequests = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* 1. WELCOME BANNER & DONATION CTA */}
      <div className="bg-gradient-to-r from-[#2C060D] via-[#4A0E17] to-[#1F0408] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-[#D4AF37]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-[#D4AF37] font-semibold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <span>☸</span> Tashi Delek & Welcome
          </span>
          <h1 className="font-serif-brand font-bold text-2xl sm:text-3xl text-white leading-tight">
            {user?.fullName || 'Devotee Member'}
          </h1>
          <p className="text-xs text-gray-300">
            Thank you for supporting the Great Druk Wangyel Peace Stupa and Shedra Monastic University. Your giving brings lasting merit and universal peace.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setDonateOpen(true)}
            className="px-5 py-2.5 bg-[#7E1929] hover:bg-[#8B1E2F] text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-[#D4AF37]/50"
          >
            <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
            <span>Make an Offering</span>
          </button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="monastery-card p-5 space-y-1">
          <span className="text-xs text-gray-500 font-medium">Total Offerings Given</span>
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif-brand font-extrabold text-2xl text-[#4A0E17]">
              ₹{(givingStats?.totalDonated || 0).toLocaleString()}
            </h3>
            <Heart className="w-5 h-5 text-[#8B1E2F]" />
          </div>
          <p className="text-[11px] text-gray-400">Lifetime contributions</p>
        </div>

        <div className="monastery-card p-5 space-y-1">
          <span className="text-xs text-gray-500 font-medium">Total Offerings Made</span>
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif-brand font-extrabold text-2xl text-[#4A0E17]">
              {givingStats?.totalDonationsCount || 0}
            </h3>
            <CreditCard className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <p className="text-[11px] text-gray-400">Completed transactions</p>
        </div>

        <div className="monastery-card p-5 space-y-1">
          <span className="text-xs text-gray-500 font-medium">80G Tax Receipts</span>
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif-brand font-extrabold text-2xl text-[#4A0E17]">
              {givingStats?.taxExemptReceiptsCount || receipts.length}
            </h3>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-[11px] text-gray-400">Downloadable official receipts</p>
        </div>

        <div className="monastery-card p-5 space-y-1">
          <span className="text-xs text-gray-500 font-medium">Prayer Dedications</span>
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif-brand font-extrabold text-2xl text-[#4A0E17]">
              {prayerRequests.length}
            </h3>
            <Flame className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <p className="text-[11px] text-gray-400">108 butter lamp prayers</p>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex items-center space-x-2 border-b border-[#EBE5D8] overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview', icon: CheckCircle2 },
          { id: 'donations', label: 'My Donations & 80G Receipts', icon: FileText },
          { id: 'pledges', label: 'Monthly Pledges', icon: Calendar },
          { id: 'prayers', label: 'Prayer Dedications', icon: Flame },
          { id: 'profile', label: 'Profile & Tax PAN', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-[#7E1929] text-[#4A0E17] bg-white rounded-t-lg'
                  : 'border-transparent text-gray-600 hover:text-[#4A0E17]'
              }`}
            >
              <Icon className="w-4 h-4 text-[#D4AF37]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Recent Donations & Receipts */}
          <div className="lg:col-span-7 space-y-6">
            <div className="monastery-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">
                  Recent Offerings & Official Receipts
                </h3>
                <button
                  onClick={() => setActiveTab('donations')}
                  className="text-xs font-bold text-[#7E1929] hover:underline"
                >
                  View All ({donations.length})
                </button>
              </div>

              {donations.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No offerings recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {donations.slice(0, 4).map((d) => (
                    <div key={d.id} className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#EBE5D8] flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-[#4A0E17]">{d.donation_for || d.campaign_title || 'General Monastery Fund'}</p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(d.payment_date).toLocaleDateString()} • {d.payment_method || 'Online'}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-sm text-[#4A0E17]">₹{parseFloat(d.amount).toLocaleString()}</p>
                        {d.receipt_id && (
                          <button
                            onClick={() => downloadReceipt(d.receipt_id)}
                            className="text-[10px] font-bold text-[#7E1929] hover:underline flex items-center gap-1 justify-end"
                          >
                            <Download className="w-3 h-3" />
                            <span>80G Receipt</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Links & Prayer Status */}
          <div className="lg:col-span-5 space-y-6">
            {/* Dedicated Prayers */}
            <div className="monastery-card p-6 space-y-4">
              <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">
                Your Prayer Requests
              </h3>
              {prayerRequests.length === 0 ? (
                <div className="text-center py-4 space-y-2">
                  <p className="text-xs text-gray-500">You have no active prayer dedication requests.</p>
                  <a
                    href="/prayer-request"
                    className="inline-block px-3 py-1.5 bg-[#FAF5F0] text-[#7E1929] rounded-md text-xs font-bold hover:bg-[#FDF6E2]"
                  >
                    + Request Butter Lamps
                  </a>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {prayerRequests.slice(0, 3).map((pr) => (
                    <div key={pr.id} className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EBE5D8] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#4A0E17]">{pr.prayer_type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          pr.status === 'dedicated' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {pr.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-1">{pr.intention_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tax Exemption Status Banner */}
            <div className="monastery-card p-5 bg-[#FAF5F0] border border-[#D4AF37]/40 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-serif-brand font-bold text-xs text-[#4A0E17]">80G Tax Exemption Info</h4>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                All donations to Drodul Phendey Ling Foundation qualify for tax deductions under 80G. Ensure your Tax PAN is updated in your profile for automated digital filing.
              </p>
              <button
                onClick={() => setActiveTab('profile')}
                className="text-xs font-bold text-[#7E1929] hover:underline"
              >
                Update Tax PAN / CID →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DONATIONS & 80G RECEIPTS */}
      {activeTab === 'donations' && (
        <div className="monastery-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
                Complete Donation History & Tax Receipts
              </h3>
              <p className="text-xs text-gray-500">
                Download your official signed 80G tax exemption receipts in PDF format.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF5F0] border-b border-[#EBE5D8] text-[#4A0E17] font-bold">
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Purpose / Campaign</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {receipts.length === 0 && donations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No donations found.
                    </td>
                  </tr>
                ) : receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-[#7E1929]">{r.receipt_number}</td>
                    <td className="p-3 text-gray-600">{new Date(r.receipt_date).toLocaleDateString()}</td>
                    <td className="p-3 text-gray-800 font-medium">{r.notes || 'Donation towards Monastery & Stupa'}</td>
                    <td className="p-3 text-gray-600">{r.payment_mode}</td>
                    <td className="p-3 text-right font-bold text-[#4A0E17]">₹{parseFloat(r.amount).toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => downloadReceipt(r.id)}
                        className="px-3 py-1 bg-[#4A0E17] hover:bg-[#5A121E] text-white rounded text-[11px] font-bold flex items-center gap-1 mx-auto shadow-sm"
                      >
                        <Download className="w-3 h-3 text-[#D4AF37]" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: MONTHLY PLEDGES */}
      {activeTab === 'pledges' && (
        <div className="monastery-card p-6 space-y-4">
          <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
            Active Recurring Giving Pledges
          </h3>
          <p className="text-xs text-gray-500">
            Monthly recurring offerings supporting monk scholars and daily monastery meals.
          </p>

          {pledges.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">You currently have no active monthly recurring pledges.</p>
              <button
                onClick={() => setDonateOpen(true)}
                className="px-4 py-2 bg-[#7E1929] text-white rounded-full text-xs font-bold shadow hover:bg-[#8B1E2F]"
              >
                + Setup Monthly Giving
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pledges.map((p) => (
                <div key={p.id} className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EBE5D8] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#4A0E17]">{p.campaign_title || 'Monthly Sangha Support'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-[#4A0E17]">₹{parseFloat(p.amount).toLocaleString()} / month</p>
                  <p className="text-[11px] text-gray-500">Started on {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: PRAYER DEDICATIONS */}
      {activeTab === 'prayers' && (
        <div className="monastery-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
                Your Sacred Prayer Dedications
              </h3>
              <p className="text-xs text-gray-500">
                Track butter lamp illumination and prayer intentions performed by the Sangha.
              </p>
            </div>
            <a
              href="/prayer-request"
              className="px-4 py-1.5 bg-[#4A0E17] text-white rounded-md text-xs font-bold hover:bg-[#5A121E]"
            >
              + New Prayer Request
            </a>
          </div>

          <div className="space-y-3">
            {prayerRequests.length === 0 ? (
              <p className="text-xs text-gray-500 py-8 text-center">No prayer requests on record.</p>
            ) : prayerRequests.map((pr) => (
              <div key={pr.id} className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EBE5D8] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-bold text-xs text-[#4A0E17]">{pr.prayer_type}</span>
                    <span className="text-[11px] text-gray-500">({pr.butter_lamps_count} Butter Lamps)</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    pr.status === 'dedicated' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {pr.status}
                  </span>
                </div>
                <p className="text-xs text-gray-700 italic">"{pr.intention_text}"</p>
                {pr.dedication_names && (
                  <p className="text-[11px] text-gray-500">
                    <strong>Dedicated for:</strong> {pr.dedication_names}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: PROFILE & TAX PAN */}
      {activeTab === 'profile' && (
        <div className="monastery-card p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
              Member Profile & 80G Tax Settings
            </h3>
            <p className="text-xs text-gray-500">
              Ensure your legal name and PAN/CID number match your tax records for 80G exemptions.
            </p>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs border border-gray-200 bg-gray-100 text-gray-500 rounded cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tax PAN / National ID (for 80G Receipts)</label>
              <input
                type="text"
                placeholder="e.g. ABCDE1234F or Bhutan CID"
                value={panOrTaxId}
                onChange={(e) => setPanOrTaxId(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none font-mono"
              />
              <p className="text-[10px] text-gray-400 mt-1">This will be printed on all future 80G tax exemption receipts.</p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-[#4A0E17] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Donation Modal */}
      {donateOpen && <DonationModal onClose={() => { setDonateOpen(false); loadUserDashboard(); }} />}
    </div>
  );
}
