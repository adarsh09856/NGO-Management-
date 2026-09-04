import React, { useState, useEffect } from 'react';
import { MessageSquareShare, Mail, Send, Plus, Users, UserPlus, Sparkles, CheckCircle2, Phone, X, Search, Clock } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CRMContacts() {
  const { success, error } = useToast();
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Contact Modal
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [contactType, setContactType] = useState('donor');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Gelephu');
  const [country, setCountry] = useState('Bhutan');
  const [tags, setTags] = useState('Devotee, Stupa Patron');
  const [submittingContact, setSubmittingContact] = useState(false);

  // Log Communication Modal
  const [showCommModal, setShowCommModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [commType, setCommType] = useState('phone');
  const [commSubject, setCommSubject] = useState('');
  const [commNotes, setCommNotes] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [submittingComm, setSubmittingComm] = useState(false);

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
        api.get(`/crm/contacts${search ? `?search=${encodeURIComponent(search)}` : ''}`),
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

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      setSubmittingContact(true);
      const res = await api.post('/crm/contacts', {
        fullName,
        contactType,
        organizationName,
        email,
        phone,
        city,
        country,
        tags
      });
      if (res.data.success) {
        success('New devotee contact added to CRM!');
        setShowAddContactModal(false);
        setFullName('');
        setEmail('');
        setPhone('');
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add contact');
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleLogCommunication = async (e) => {
    e.preventDefault();
    if (!selectedContact) return;
    try {
      setSubmittingComm(true);
      const res = await api.post(`/crm/contacts/${selectedContact.id}/communications`, {
        commType,
        subject: commSubject,
        notes: commNotes,
        scheduledFollowupDate: followupDate || null,
        followupStatus: 'done'
      });
      if (res.data.success) {
        success('Interaction recorded in relationship timeline!');
        setShowCommModal(false);
        setCommSubject('');
        setCommNotes('');
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to log interaction');
    } finally {
      setSubmittingComm(false);
    }
  };

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
        success(res.data.message || 'Broadcast sent successfully');
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
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A]">
            CRM & Devotee Communications
          </h1>
          <p className="text-xs text-gray-500">
            Manage relationship history, donor contacts, and broadcast email announcements.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setShowAddContactModal(true)}
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#E11D48]" />
            <span>Add Contact</span>
          </button>
          <button
            type="button"
            onClick={() => setShowBroadcastModal(true)}
            className="px-4 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Broadcast</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="monastery-card p-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Search contact name, organization, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs p-2 rounded border border-gray-300 w-full"
          />
          <button type="submit" className="px-3 py-2 bg-[#0F172A] text-white text-xs font-bold rounded flex items-center gap-1">
            <Search className="w-3 h-3" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Campaigns History */}
      {campaigns.length > 0 && (
        <div className="monastery-card p-5 space-y-4">
          <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
            Recent Broadcasts & Email Newsletters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((c) => (
              <div key={c.id} className="p-4 bg-gray-50 border rounded-lg space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-[#0F172A]">{c.title}</h4>
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
      )}

      {/* Contacts Table */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center">
          <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
            Devotee Contacts Directory ({contacts.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F5F9] text-gray-700 font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">City / Country</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-gray-900">{c.full_name}</p>
                    {c.organization_name && (
                      <p className="text-[10px] text-gray-500">{c.organization_name}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 capitalize">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                      {c.contact_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{c.email || '-'}</td>
                  <td className="py-3 px-4 font-mono text-gray-600">{c.phone || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">{c.city ? `${c.city}, ${c.country}` : c.country}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                      {c.tags || 'Devotee'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => { setSelectedContact(c); setCommSubject(`Follow-up with ${c.full_name}`); setShowCommModal(true); }}
                      className="px-2.5 py-1 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded text-[11px] font-bold flex items-center gap-1 ml-auto"
                    >
                      <Phone className="w-3 h-3 text-[#D4AF37]" />
                      <span>Log Note</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Add Devotee / Partner Contact
              </h3>
              <button onClick={() => setShowAddContactModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tenzin Wangmo"
                    className="w-full p-2.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Type</label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 bg-white"
                  >
                    <option value="donor">Devotee Donor</option>
                    <option value="partner">Institutional Partner</option>
                    <option value="vendor">Construction Vendor</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="devotee@example.bt"
                    className="w-full p-2.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+975 17..."
                    className="w-full p-2.5 rounded border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tags / Classification</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. Major Donor, Butter Lamp Patron"
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingContact}
                  className="px-4 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded font-bold shadow"
                >
                  {submittingContact ? 'Saving...' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Interaction Modal */}
      {showCommModal && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Log Interaction: {selectedContact.full_name}
              </h3>
              <button onClick={() => setShowCommModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogCommunication} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Communication Type</label>
                  <select
                    value={commType}
                    onChange={(e) => setCommType(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold"
                  >
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="in_person">In-Person Meeting / Blessing</option>
                    <option value="whatsapp">WhatsApp / Telegram</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={commSubject}
                  onChange={(e) => setCommSubject(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes / Blessings Given</label>
                <textarea
                  rows={3}
                  value={commNotes}
                  onChange={(e) => setCommNotes(e.target.value)}
                  placeholder="Record summary of conversation, prayer intentions discussed..."
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCommModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingComm}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded font-bold shadow"
                >
                  {submittingComm ? 'Saving...' : 'Save Interaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border p-6 max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Compose Devotee Email Broadcast
              </h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Campaign / Internal Title *</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. September Tara Puja Invitation"
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Subject Line *</label>
                <input
                  type="text"
                  required
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="e.g. Auspicious Blessings from Gelephu Peace Stupa"
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold"
                >
                  <option value="all_donors">All Registered Donors & Patrons</option>
                  <option value="stupa_patrons">Stupa Construction Patrons Only</option>
                  <option value="international">International Sangha Members</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Body Content *</label>
                <textarea
                  required
                  rows={5}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="Enter email body message to devotees..."
                  className="w-full p-2.5 rounded border border-gray-300 font-sans"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="px-4 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded font-bold shadow flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{broadcasting ? 'Broadcasting...' : 'Send Broadcast Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
