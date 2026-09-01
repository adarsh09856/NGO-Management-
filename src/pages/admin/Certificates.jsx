import React, { useState, useEffect } from 'react';
import { Award, Download, Search, Ban, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function Certificates() {
  const { success, error } = useToast();
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      let url = '/certificates?limit=50';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) setCertificates(res.data.data);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleRevoke = async (id) => {
    const reason = window.prompt('Please enter revocation reason (e.g. Incomplete course requirements):');
    if (!reason) return;

    try {
      const res = await api.post(`/certificates/${id}/revoke`, { reason });
      if (res.data.success) {
        success('Certificate has been revoked.');
        fetchCertificates();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Revocation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A]">
            Monastic Certificates Directory
          </h1>
          <p className="text-xs text-gray-500">
            Official graduation and Buddhist philosophy achievement certificates issued by Drodul Phendey Ling.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="monastery-card p-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchCertificates(); }} className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Search scholar name, certificate number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs p-2 rounded border border-gray-300 w-full"
          />
          <button type="submit" className="px-3 py-2 bg-[#0F172A] text-white text-xs font-bold rounded">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="monastery-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F5F9] text-gray-700 font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Certificate No</th>
                <th className="py-3 px-4">Scholar Name</th>
                <th className="py-3 px-4">Course / Program</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {certificates.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">{c.certificate_number}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{c.monastic_name || c.secular_name}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{c.course_title}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(c.issue_date).toLocaleDateString('en-GB')}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">{c.grade}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <a
                        href={`/api/certificates/${c.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F172A] bg-[#FAF5F0] hover:bg-[#FEF3C7] border border-[#D4AF37] px-2.5 py-1 rounded shadow-sm"
                      >
                        <Download className="w-3 h-3 text-[#0F172A]" />
                        <span>PDF</span>
                      </a>

                      {c.status === 'ISSUED' && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(c.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Revoke Certificate"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
