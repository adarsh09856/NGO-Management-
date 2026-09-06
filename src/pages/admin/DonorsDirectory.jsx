import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, MapPin, Heart, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
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

  // Edit Donor Modal
  const [editingDonor, setEditingDonor] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editCountry, setEditCountry] = useState('Bhutan');
  const [editPostalCode, setEditPostalCode] = useState('');
  const [editPanTaxId, setEditPanTaxId] = useState('');
  const [editDonorType, setEditDonorType] = useState('individual');
  const [editNotes, setEditNotes] = useState('');

  // Delete Confirmation Modal
  const [deletingDonor, setDeletingDonor] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const openEditModal = (donor) => {
    setEditingDonor(donor);
    setEditFullName(donor.full_name || '');
    setEditEmail(donor.email || '');
    setEditPhone(donor.phone || '');
    setEditAddress(donor.address || '');
    setEditCity(donor.city || '');
    setEditState(donor.state || '');
    setEditCountry(donor.country || 'Bhutan');
    setEditPostalCode(donor.postal_code || '');
    setEditPanTaxId(donor.pan_or_tax_id || '');
    setEditDonorType(donor.donor_type || 'individual');
    setEditNotes(donor.notes || '');
  };

  const handleUpdateDonor = async (e) => {
    e.preventDefault();
    if (!editingDonor) return;
    try {
      const res = await api.put(`/donors/${editingDonor.id}`, {
        fullName: editFullName,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
        city: editCity,
        state: editState,
        country: editCountry,
        postalCode: editPostalCode,
        panOrTaxId: editPanTaxId,
        donorType: editDonorType,
        notes: editNotes
      });
      if (res.data.success) {
        success('Donor record updated successfully!');
        setEditingDonor(null);
        fetchDonors();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update donor');
    }
  };

  const handleDeleteDonor = async () => {
    if (!deletingDonor) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/donors/${deletingDonor.id}`);
      if (res.data.success) {
        success('Donor record deleted successfully!');
        setDeletingDonor(null);
        fetchDonors();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Cannot delete donor');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A]">
            Donors Directory
          </h1>
          <p className="text-xs text-gray-500">
            Registered devotees and international patrons supporting Drodul Phendey Ling.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
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
          <button type="submit" className="px-3 py-2 bg-[#0F172A] text-white text-xs font-bold rounded">
            Search
          </button>
        </form>
      </div>

      {/* Donors Grid */}
      {donors.length === 0 ? (
        <div className="monastery-card p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-serif-brand font-bold text-base text-gray-700">No Donors Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">No devotees match your search or directory filter. Add a new donor record to start tracking contributions.</p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E11D48] text-white rounded text-xs font-bold uppercase tracking-wider shadow hover:bg-[#BE123C]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Donor</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {donors.map((d) => (
            <div key={d.id} className="monastery-card p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#FEF3C7] text-[#0F172A] border border-[#D4AF37] flex items-center justify-center font-bold text-xs">
                      {d.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{d.full_name}</h3>
                      <p className="text-[10px] text-gray-500 capitalize">{d.donor_type} Donor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {d.total_donations_count || 0} Gifts
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditModal(d)}
                      title="Edit Donor"
                      className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingDonor(d)}
                      title="Delete Donor"
                      className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
      )}

      {/* Add Donor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
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
                  className="flex-1 py-2 bg-[#0F172A] text-white rounded font-bold hover:bg-[#1E293B]"
                >
                  Save Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Donor Modal */}
      {editingDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Edit Donor Profile
              </h3>
              <button onClick={() => setEditingDonor(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDonor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Donor Type</label>
                  <select
                    value={editDonorType}
                    onChange={(e) => setEditDonorType(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 bg-white"
                  >
                    <option value="individual">Individual</option>
                    <option value="organization">Organization</option>
                    <option value="anonymous">Anonymous</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full p-2 rounded border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">PAN / Tax ID</label>
                  <input
                    type="text"
                    value={editPanTaxId}
                    onChange={(e) => setEditPanTaxId(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Monastic Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2 rounded border border-gray-300"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDonor(null)}
                  className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#E11D48] text-white rounded font-bold hover:bg-[#BE123C]"
                >
                  Update Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Donor Confirmation Modal */}
      {deletingDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Delete Donor Record?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove <span className="font-bold text-gray-900">{deletingDonor.full_name}</span>? Donors with recorded donation history cannot be deleted.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingDonor(null)}
                className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteDonor}
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
