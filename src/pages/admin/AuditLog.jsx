import React, { useState, useEffect } from 'react';
import { ClipboardList, Shield, Filter, Search } from 'lucide-react';
import api from '../../services/api';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = '/settings/audit-logs?limit=50';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (actionFilter) url += `&action=${encodeURIComponent(actionFilter)}`;
      const res = await api.get(url);
      if (res.data.success) setLogs(res.data.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
          System Audit Logs
        </h1>
        <p className="text-xs text-gray-500">
          Immutable forensic log of all administrative actions, financial transactions, and void operations.
        </p>
      </div>

      {/* Filter */}
      <div className="monastery-card p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchLogs(); }} className="flex gap-2 w-full sm:w-80">
          <input
            type="text"
            placeholder="Search entity, action, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs p-2 rounded border border-gray-300 w-full"
          />
          <button type="submit" className="px-3 py-2 bg-[#4A0E17] text-white text-xs font-bold rounded">
            Search
          </button>
        </form>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-xs p-2 rounded border border-gray-300 bg-white"
        >
          <option value="">All Actions</option>
          <option value="VOID_RECEIPT">VOID_RECEIPT</option>
          <option value="CREATE_DONATION">CREATE_DONATION</option>
          <option value="GENERATE_PAYROLL">GENERATE_PAYROLL</option>
          <option value="UPDATE_PROGRESS">UPDATE_PROGRESS</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="monastery-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4 text-gray-600 font-sans">{new Date(l.created_at).toLocaleString('en-GB')}</td>
                  <td className="py-3 px-4 font-bold font-sans text-gray-900">{l.user_name || 'System / Guest'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.action.includes('VOID') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-sans">{l.entity_type}</td>
                  <td className="py-3 px-4 text-gray-500">{l.entity_id}</td>
                  <td className="py-3 px-4 text-gray-500">{l.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
