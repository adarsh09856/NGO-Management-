import React, { useState, useEffect } from 'react';
import { UserCog, Shield, Check, X, Plus } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function UsersRoles() {
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [uRes, rRes] = await api.get('/settings/users');
        if (uRes.data.success) {
          setUsers(uRes.data.data.users);
          setRoles(uRes.data.data.roles);
        }
      } catch (err) {
        console.error('Failed to load users & roles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
          Users & RBAC Roles Matrix
        </h1>
        <p className="text-xs text-gray-500">
          Enforce role-based access control across administration, finance, academy, and devotee portals.
        </p>
      </div>

      {/* Users Table */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#EBE5D8] flex justify-between items-center">
          <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">
            Active User Accounts
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Portal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{u.full_name}</td>
                  <td className="py-3 px-4 text-gray-600">{u.email}</td>
                  <td className="py-3 px-4 font-semibold text-[#4A0E17]">{u.role_name}</td>
                  <td className="py-3 px-4 capitalize">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF5F0] border border-[#D4AF37] text-[#4A0E17]">
                      {u.role_slug?.includes('donor') ? 'Donor Portal' : u.role_slug?.includes('student') ? 'Student Portal' : 'Admin Portal'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      ACTIVE
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleString('en-GB') : 'Just now'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Permission Matrix */}
      <div className="monastery-card p-6 space-y-4">
        <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">
          RBAC Security Matrix & Module Enforcements
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border">
            <thead className="bg-[#4A0E17] text-white">
              <tr>
                <th className="py-2.5 px-3">System Module</th>
                <th className="py-2.5 px-3 text-center">Super Admin</th>
                <th className="py-2.5 px-3 text-center">Accountant</th>
                <th className="py-2.5 px-3 text-center">HR Manager</th>
                <th className="py-2.5 px-3 text-center">Staff</th>
                <th className="py-2.5 px-3 text-center">Donor</th>
                <th className="py-2.5 px-3 text-center">Student Monk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { module: 'Donations & Receipts CRUD', sa: true, acc: true, hr: false, st: false, dn: false, sm: false },
                { module: 'Void Receipt Audit Override', sa: true, acc: false, hr: false, st: false, dn: false, sm: false },
                { module: 'Accounts & General Ledger', sa: true, acc: true, hr: false, st: false, dn: false, sm: false },
                { module: 'Inventory & Store Item Movement', sa: true, acc: true, hr: false, st: true, dn: false, sm: false },
                { module: 'HRM Attendance & Payroll Run', sa: true, acc: false, hr: true, st: false, dn: false, sm: false },
                { module: 'Training & LMS Certificate Trigger', sa: true, acc: false, hr: false, st: true, dn: false, sm: false },
                { module: 'CRM Campaign Broadcasting', sa: true, acc: false, hr: false, st: true, dn: false, sm: false },
                { module: 'Donor Self-Service Portal & PDF Receipts', sa: true, acc: false, hr: false, st: false, dn: true, sm: false },
                { module: 'Monk LMS Portal & Certificates', sa: true, acc: false, hr: false, st: false, dn: false, sm: true }
              ].map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-3 font-semibold text-gray-800">{row.module}</td>
                  <td className="py-2 px-3 text-center">{row.sa ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                  <td className="py-2 px-3 text-center">{row.acc ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                  <td className="py-2 px-3 text-center">{row.hr ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                  <td className="py-2 px-3 text-center">{row.st ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                  <td className="py-2 px-3 text-center">{row.dn ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                  <td className="py-2 px-3 text-center">{row.sm ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
