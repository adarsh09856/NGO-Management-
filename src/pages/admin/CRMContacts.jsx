import React, { useState, useEffect } from 'react';
import { MessageSquareShare, Mail, Send, Plus, Users, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CRMContacts() {
  const { success, error } = useToast();
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Broadcast Campaign Modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [targetAudience, setTargetAudience] = useState('all_donors');
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, campRes] = await Promise.all([
        api.get('/crm/contacts'),
        api.get('/crm/campaigns')
      ]);
      if (cRes.data.success) setContacts(cRes.data.data);
      if (campRes.data.success) setCampaigns(campRes.data.data);
    } catch (err) {
      console.error('CRM load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      setBroadcasting(true);
      const res = await api.post('/crm/campaigns/broadcast', {
        title: broadcastTitle,
        subject: broadcastSubject,
        bodyHtml: broadcastBody,
        targetAudience
      });
      if (res.data.success) {
        success(res.data.message);
        setShowBroadcastModal(false);
        setBroadcastTitle('');
        setBroadcastSubject('');
        setBroadcastBody('');
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Broadcast failed');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            CRM & Devotee Communications
          </h1>
          <p className="text-xs text-gray-500">
            Manage relationship history, donor contacts, and broadcast email announcements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowBroadcastModal(true)}
            className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Broadcast</span>
          </button>
        </div>
      </div>

      {/* Campaigns History */}
      <div className="monastery-card p-5 space-y-4">
        <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">
          Recent Broadcasts & Email Newsletters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <div key={c.id} className="p-4 bg-gray-50 border rounded-lg space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-[#4A0E17]">{c.title}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  {c.status}
                </span>
              </div>
              <p className="text-gray-600 italic">"{c.subject}"</p>
              <div className="pt-2 border-t flex justify-between items-center text-[11px] text-gray-500">
                <span>Audience: <strong className="capitalize">{c.target_audience}</strong></span>
                <span>Sent: <strong>{c.sent_count || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#EBE5D8] flex justify-between items-center">
          <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">
            Devotee Contacts Directory
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">City / Country</th>
                <th className="py-3 px-4">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{c.full_name}</td>
                  <td className="py-3 px-4 capitalize">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                      {c.contact_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{c.email || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">{c.phone || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">{c.city ? `${c.city}, ${c.country}` : c.country}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {c.tags || 'General Devotee'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-lg w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
              Compose Devotee Email Broadcast
            </h3>

            <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Grand Autumn Peace Stupa Puja Invitation"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Subject Line *</label>
                <input
                  type="text"
                  required
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="e.g. Auspicious Blessing Ceremony Announcement"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold"
                >
                  <option value="all_donors">All Registered Donors</option>
                  <option value="monthly_pledgers">Active Monthly Pledgers</option>
                  <option value="stupa_patrons">Stupa Construction Patrons</option>
                  <option value="monks_students">All Monks & Scholars</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Message Content (HTML / Text) *</label>
                <textarea
                  rows={5}
                  required
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="Write your email broadcast message to devotees..."
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="flex-1 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded font-bold shadow flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{broadcasting ? 'Broadcasting...' : 'Send Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
