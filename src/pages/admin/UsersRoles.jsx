import React, { useState, useEffect } from 'react';
import {
  UserCog, Shield, Check, X, Plus, Save, User, Mail, Lock, Phone,
  ShieldCheck, Edit2, Trash2, AlertTriangle, Key, CheckSquare, Square,
  RefreshCw, CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function UsersRoles() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'matrix'
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('2');
  const [savingUser, setSavingUser] = useState(false);

  // Edit User Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editPassword, setEditPassword] = useState('');
  const [updatingUser, setUpdatingUser] = useState(false);

  // Delete User Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Permission Matrix State
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [assignedPermissionIds, setAssignedPermissionIds] = useState(new Set());
  const [savingMatrix, setSavingMatrix] = useState(false);

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

      if (uRes.data.success) {
        setUsers(uRes.data.data);
      }

      if (rRes.data.success) {
        const fetchedRoles = rRes.data.data.roles || [];
        const fetchedPerms = rRes.data.data.permissions || [];
        const fetchedRP = rRes.data.data.rolePermissions || [];

        setRoles(fetchedRoles);
        setPermissions(fetchedPerms);
        setRolePermissions(fetchedRP);

        if (fetchedRoles.length > 0 && !selectedRoleId) {
          const initialRoleId = fetchedRoles[0].id;
          setSelectedRoleId(initialRoleId);
          const initialPerms = new Set(
            fetchedRP.filter(rp => rp.role_id === initialRoleId).map(rp => rp.permission_id)
          );
          setAssignedPermissionIds(initialPerms);
        }
      }
    } catch (err) {
      console.error('Failed to load users & roles:', err);
      error('Failed to load users and permissions data');
    } finally {
      setLoading(false);
    }
  }

  // Handle role selection in matrix
  const handleSelectRole = (rId) => {
    setSelectedRoleId(rId);
    const assigned = new Set(
      rolePermissions.filter(rp => rp.role_id === rId).map(rp => rp.permission_id)
    );
    setAssignedPermissionIds(assigned);
  };

  // Toggle single permission for selected role
  const handleTogglePermission = (permId) => {
    setAssignedPermissionIds(prev => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  // Toggle all permissions for a module
  const handleToggleModule = (moduleName, enableAll) => {
    const modulePermIds = permissions
      .filter(p => p.module === moduleName)
      .map(p => p.id);

    setAssignedPermissionIds(prev => {
      const next = new Set(prev);
      modulePermIds.forEach(id => {
        if (enableAll) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  // Save permission matrix for selected role
  const handleSaveMatrix = async () => {
    if (!selectedRoleId) return;
    try {
      setSavingMatrix(true);
      const permArray = Array.from(assignedPermissionIds);
      const res = await api.put(`/roles/${selectedRoleId}/permissions`, {
        permissionIds: permArray
      });

      if (res.data.success) {
        success(res.data.message || 'Permissions updated successfully');
        // Update local rolePermissions state
        setRolePermissions(prev => {
          const filtered = prev.filter(rp => rp.role_id !== selectedRoleId);
          const newEntries = permArray.map(pid => ({ role_id: selectedRoleId, permission_id: pid }));
          return [...filtered, ...newEntries];
        });
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update role permissions');
    } finally {
      setSavingMatrix(false);
    }
  };

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !roleId) {
      error('Please complete all required fields');
      return;
    }

    try {
      setSavingUser(true);
      const res = await api.post('/users', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        roleId: parseInt(roleId, 10)
      });

      if (res.data.success) {
        success(`Staff user account created for ${fullName}`);
        setCreateModalOpen(false);
        setFullName('');
        setEmail('');
        setPassword('');
        setPhone('');
        loadData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setSavingUser(false);
    }
  };

  // Open Edit User Modal
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFullName(user.full_name || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditRoleId(String(user.role_id));
    setEditStatus(user.status || 'active');
    setEditPassword('');
    setEditModalOpen(true);
  };

  // Update User Handler
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setUpdatingUser(true);
      const payload = {
        fullName: editFullName.trim(),
        email: editEmail.trim().toLowerCase(),
        phone: editPhone.trim(),
        roleId: parseInt(editRoleId, 10),
        status: editStatus
      };
      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      const res = await api.put(`/users/${editingUser.id}`, payload);
      if (res.data.success) {
        success(`User ${editFullName} updated successfully`);
        setEditModalOpen(false);
        setEditingUser(null);
        loadData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update user account');
    } finally {
      setUpdatingUser(false);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeletingUser(true);
      const res = await api.delete(`/users/${userToDelete.id}`);
      if (res.data.success) {
        success(`User account for ${userToDelete.full_name} removed`);
        setDeleteModalOpen(false);
        setUserToDelete(null);
        loadData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete user account');
    } finally {
      setDeletingUser(false);
    }
  };

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const currentRole = roles.find(r => r.id === selectedRoleId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A] flex items-center gap-2">
            <UserCog className="w-6 h-6 text-[#E11D48]" />
            <span>Users & Access Control (RBAC)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Cryptographically secure user management, role privileges, and fine-grained permissions matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'users' && (
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Staff / Admin</span>
            </button>
          )}
          {activeTab === 'matrix' && (
            <button
              type="button"
              onClick={handleSaveMatrix}
              disabled={savingMatrix}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#b89528] text-[#0F172A] rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{savingMatrix ? 'Saving Matrix...' : 'Save Matrix'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`py-2.5 px-5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'users'
              ? 'border-[#E11D48] text-[#E11D48] bg-rose-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Users & Staff Accounts ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`py-2.5 px-5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'matrix'
              ? 'border-[#E11D48] text-[#E11D48] bg-rose-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Role Permissions Matrix</span>
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="monastery-card overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#FAF9F5]">
            <div>
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
                System Directory
              </h3>
              <p className="text-[11px] text-gray-500">
                Staff coordinators, financial accountants, administrators, and sangha members with portal accounts.
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Refresh users"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FAF5F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Access Shell</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      Loading users directory...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      No accounts registered.
                    </td>
                  </tr>
                ) : users.map((u) => {
                  const isAdminRole = ['super_admin', 'accountant', 'hr_manager', 'staff'].includes(u.role_slug);
                  const isRootAdmin = u.id === 1;

                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-[#0F172A] flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#0F172A] text-[#D4AF37] flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{u.full_name}</span>
                            {isRootAdmin && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">
                                Root
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">ID #{u.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">{u.phone || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          u.role_slug === 'super_admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : u.role_slug === 'accountant'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : u.role_slug === 'staff'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : u.role_slug === 'hr_manager'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {u.role_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {isAdminRole ? (
                          <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px] font-bold">
                            Admin (/admin)
                          </span>
                        ) : (
                          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">
                            User (/user)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : u.status === 'suspended'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px]">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Account"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isRootAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserToDelete(u);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE PERMISSIONS MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Role Selector Header */}
          <div className="monastery-card p-5 bg-[#FAF9F5] border border-[#E2E8F0]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Step 1: Select Role</span>
                <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                  Configure Role Privileges
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a role to inspect and modify permissions. Changes take effect on next token generation or request.
                </p>
              </div>

              {/* Role Select Buttons */}
              <div className="flex flex-wrap gap-2">
                {roles.map(r => {
                  const isSelected = selectedRoleId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectRole(r.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-[#0F172A] text-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/50'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>{r.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {currentRole && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-700">Selected:</span>
                  <span className="font-bold text-[#E11D48]">{currentRole.name}</span>
                  <span className="text-gray-400">({currentRole.slug})</span>
                  <span className="text-gray-500 italic">— {currentRole.description || 'System access tier'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600 font-mono text-[11px]">
                    Assigned: <strong className="text-[#0F172A]">{assignedPermissionIds.size}</strong> / {permissions.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveMatrix}
                    disabled={savingMatrix}
                    className="px-3.5 py-1.5 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1 shadow transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    <span>{savingMatrix ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Permissions Grouped by Module */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(permissionsByModule).map(([moduleName, perms]) => {
              const allChecked = perms.every(p => assignedPermissionIds.has(p.id));
              const someChecked = perms.some(p => assignedPermissionIds.has(p.id)) && !allChecked;

              return (
                <div key={moduleName} className="monastery-card overflow-hidden border border-[#E2E8F0] shadow-sm">
                  <div className="p-3.5 bg-[#FAF5F0] border-b border-[#E2E8F0] flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="font-serif-brand font-bold text-xs uppercase tracking-wider text-[#0F172A]">
                        {moduleName.replace('_', ' ')}
                      </h4>
                      <span className="text-[10px] font-mono text-gray-500">({perms.length})</span>
                    </div>

                    <div className="flex items-center space-x-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleToggleModule(moduleName, true)}
                        className="px-2 py-0.5 text-blue-700 hover:bg-blue-100 rounded font-semibold transition-colors"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => handleToggleModule(moduleName, false)}
                        className="px-2 py-0.5 text-gray-500 hover:bg-gray-200 rounded font-semibold transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 divide-y divide-gray-100">
                    {perms.map(p => {
                      const isAssigned = assignedPermissionIds.has(p.id);
                      return (
                        <label
                          key={p.id}
                          className="py-2 px-1 flex items-start space-x-2.5 cursor-pointer hover:bg-gray-50 rounded transition-colors select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleTogglePermission(p.id)}
                            className="mt-0.5 h-4 w-4 text-[#E11D48] rounded border-gray-300 focus:ring-[#E11D48]"
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-800">
                                {p.action}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">
                                {p.module}:{p.action}
                              </span>
                            </div>
                            {p.description && (
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                                {p.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#D4AF37]/40 animate-fadeIn overflow-hidden">
            <div className="p-5 bg-[#FAF5F0] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#0F172A]" />
                <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                  Create Staff / Admin Account
                </h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#E11D48] focus:outline-none"
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
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#E11D48] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assign System Role *</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#E11D48] focus:outline-none font-medium"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.slug})
                    </option>
                  ))}
                </select>
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
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#E11D48] focus:outline-none"
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
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#E11D48] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingUser ? 'Creating Account...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#D4AF37]/40 animate-fadeIn overflow-hidden">
            <div className="p-5 bg-[#FAF5F0] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-[#0F172A]" />
                <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                  Edit User Account
                </h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#E11D48] focus:outline-none"
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
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#E11D48] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Role *</label>
                  <select
                    value={editRoleId}
                    onChange={(e) => setEditRoleId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#E11D48] focus:outline-none font-medium"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Account Status *</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#E11D48] focus:outline-none font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#E11D48] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Change Password <span className="text-gray-400 font-normal">(Leave blank to keep existing)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="New password..."
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#E11D48] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="px-5 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{updatingUser ? 'Updating...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-red-200 animate-fadeIn overflow-hidden">
            <div className="p-5 bg-red-50 border-b border-red-100 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
                  Delete User Account
                </h3>
                <p className="text-[11px] text-red-600 font-medium">Permanent Action</p>
              </div>
            </div>

            <div className="p-5 text-xs text-gray-600 space-y-3">
              <p>
                Are you sure you want to delete the account for{' '}
                <strong className="text-gray-900 font-bold">{userToDelete.full_name}</strong> ({userToDelete.email})?
              </p>
              <p className="text-[11px] text-gray-500">
                This account will lose all access to the monastery portal immediately.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deletingUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-wider text-xs flex items-center space-x-1.5 shadow"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deletingUser ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
