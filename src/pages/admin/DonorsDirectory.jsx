import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, MapPin, Heart, Search } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function DonorsDirectory() {
  const { success, error } = useToast();
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Donor Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [panTaxId, setPanTaxId] = useState('');

  const fetchDonors = async () => {
    try {
      setLoading(true);
      let url = '/donors?limit=50';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) setDonors(res.data.data);
    } catch (err) {
      console.error('Failed to load donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleAddDonor = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/donors', {
        fullName,
        email,
        phone,
        address,
        panTaxId
      });
      if (res.data.success) {
        success('New donor added to directory!');
        setShowAddModal(false);
        setFullName('');
        setEmail('');
        setPhone('');
        fetchDonors();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create donor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Donors Directory
          </h1>
          <p className="text-xs text-gray-500">
            Registered devotees and international patrons supporting Drodul Phendey Ling.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Donor</span>
        </button>
      </div>

      {/* Search */}
      <div className="monastery-card p-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchDonors(); }} className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Search by name, email, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs p-2 rounded border border-gray-300 w-full"
          />
          <button type="submit" className="px-3 py-2 bg-[#4A0E17] text-white text-xs font-bold rounded">
            Search
          </button>
        </form>
      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {donors.map((d) => (
          <div key={d.id} className="monastery-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#FDF6E2] text-[#4A0E17] border border-[#D4AF37] flex items-center justify-center font-bold text-xs">
                    {d.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{d.full_name}</h3>
                    <p className="text-[10px] text-gray-500 capitalize">{d.donor_type} Donor</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {d.total_donations_count || 0} Gifts
                </span>
              </div>

              <div className="space-y-1 text-xs text-gray-600 pt-2 border-t">
                {d.email && (
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{d.email}</span>
                  </p>
                )}
                {d.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{d.phone}</span>
                  </p>
                )}
                {d.address && (
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{d.address}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Lifetime Donated:</span>
              <span className="font-serif-brand font-bold text-emerald-700 font-mono text-sm">
                ₹ {parseFloat(d.total_donated || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Donor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
              Add New Donor Record
            </h3>

            <form onSubmit={handleAddDonor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tshering Yangzom"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+975 17556559"
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">PAN / Tax ID</label>
                  <input
                    type="text"
                    value={panTaxId}
                    onChange={(e) => setPanTaxId(e.target.value)}
                    placeholder="For 80G"
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Gelephu, Sarpang, Bhutan"
                  className="w-full p-2.5 rounded border border-gray-300"
                />
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
                  Save Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
