import React, { useState, useEffect } from 'react';
import { UserCog, Shield, Check, X, Plus, Save, User, Mail, Lock, Phone, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function UsersRoles() {
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State for creating staff/admin
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('2'); // Default Accountant
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [uRes, rRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles-permissions')
      ]);
      if (uRes.data.success) setUsers(uRes.data.data);
      if (rRes.data.success) setRoles(rRes.data.data.roles);
    } catch (err) {
      console.error('Failed to load users & roles:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !roleId) {
      error('Please complete all required fields');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post('/users', {
        fullName,
        email,
        password,
        phone,
        roleId: parseInt(roleId, 10)
      });

      if (res.data.success) {
        success(`Staff user account created successfully for ${fullName}`);
        setModalOpen(false);
        setFullName('');
        setEmail('');
        setPassword('');
        setPhone('');
        loadData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Users & Roles Management (RBAC)
          </h1>
          <p className="text-xs text-gray-500">
            Super Admin creates and assigns logins for Accountants, Staff Coordinators, and Administrators.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Create Staff / Admin Login</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#EBE5D8] flex justify-between items-center bg-[#FAF9F5]">
          <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">
            Registered System Accounts ({users.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF5F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Access Shell</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Loading users directory...
                  </td>
                </tr>
              ) : users.map((u) => {
                const isAdminRole = ['super_admin', 'accountant', 'hr_manager', 'staff'].includes(u.role_slug);
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-[#4A0E17] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#4A0E17] text-[#D4AF37] flex items-center justify-center font-bold text-xs shadow-sm">
                        {u.full_name?.charAt(0)}
                      </div>
                      <span>{u.full_name}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.role_slug === 'super_admin'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : u.role_slug === 'accountant'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : u.role_slug === 'staff'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {u.role_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {isAdminRole ? 'Admin Panel (/admin)' : 'User Panel (/user)'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-[11px]">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#D4AF37]/40 animate-fadeIn overflow-hidden">
            <div className="p-5 bg-[#FAF5F0] border-b border-[#EBE5D8] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#4A0E17]" />
                <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
                  Create Staff / Admin Account
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sonam Tobgay"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="accountant@drodulphendeyling.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assign System Role *</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none font-medium"
                >
                  {roles.filter(r => ['super_admin', 'accountant', 'hr_manager', 'staff'].includes(r.slug)).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.slug === 'super_admin' ? 'Full Control' : r.slug === 'accountant' ? 'Finance & Receipts' : 'Operations'})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  The user will log into the Admin Panel and only see features allowed by this role.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Initial Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="+975 17 11 2233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#7E1929] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Creating Account...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
