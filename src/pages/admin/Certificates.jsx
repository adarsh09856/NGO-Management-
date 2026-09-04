import React, { useState, useEffect } from 'react';
import { 
  Award, Download, Search, Ban, CheckCircle2, 
  Plus, X, ShieldCheck, User, Calendar, ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function Certificates() {
  const { success, error } = useToast();
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Issue Certificate Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [grade, setGrade] = useState('Distinction');
  const [signedBy, setSignedBy] = useState('Khenpo Tashi Dorji, Abbot & Principal');

  // Revoke Modal
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeId, setRevokeId] = useState(null);
  const [revocationReason, setRevocationReason] = useState('');

  const fetchDependencies = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        api.get('/lms/students'),
        api.get('/lms/courses')
      ]);
      if (sRes.data.success && sRes.data.data?.length > 0) {
        setStudents(sRes.data.data);
        setSelectedStudentId(String(sRes.data.data[0].id));
      }
      if (cRes.data.success && cRes.data.data?.length > 0) {
        setCourses(cRes.data.data);
        setSelectedCourseId(String(cRes.data.data[0].id));
      }
    } catch (err) {
      console.error('Failed to load dependencies:', err);
    }
  };

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      let url = '/certificates?limit=100';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) setCertificates(res.data.data || []);
    } catch (err) {
      console.error('Failed to load certificates:', err);
      error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchCertificates();
  }, []);

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/certificates/issue', {
        studentId: parseInt(selectedStudentId, 10),
        courseId: parseInt(selectedCourseId, 10),
        grade,
        signedBy
      });
      if (res.data.success) {
        success('Monastic certificate issued successfully with verified PDF!');
        setShowIssueModal(false);
        fetchCertificates();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to issue certificate');
    }
  };

  const handleRevoke = async () => {
    if (!revokeId || !revocationReason) {
      error('Please provide a revocation reason');
      return;
    }

    try {
      const res = await api.post(`/certificates/${revokeId}/revoke`, {
        reason: revocationReason
      });
      if (res.data.success) {
        success('Certificate has been revoked.');
        setShowRevokeModal(false);
        setRevocationReason('');
        fetchCertificates();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Revocation failed');
    }
  };

  const filteredCertificates = certificates.filter(c => {
    const matchesSearch = !search ||
      c.certificate_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.monastic_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.course_title?.toLowerCase().includes(search.toLowerCase()) ||
      c.roll_number?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#090D16] border border-[#2A1E17] p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20">
              <Award className="w-5 h-5 text-[#E11D48]" />
            </span>
            <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-white">
              Monastic Certificates & Ecclesiastical Registry
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Official graduation, Buddhist philosophy distinction, and ordination credentials issued by Drodul Phendey Ling Shedra.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowIssueModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Certificate</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-serif-brand font-bold text-base text-white">
              Cryptographically Verified Shedra Registry
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cert no, scholar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#090D16] text-[#94A3B8] font-bold uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3.5 px-5">Certificate No</th>
                <th className="py-3.5 px-4">Scholar Monk</th>
                <th className="py-3.5 px-4">Course Program</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Academic Grade</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#94A3B8]">
                    No certificates found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#D4AF37]">
                      {c.certificate_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{c.monastic_name || c.secular_name}</div>
                      <div className="text-[10px] text-[#94A3B8] font-mono">{c.roll_number}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#CBD5E1] font-semibold">{c.course_title}</td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">
                      {c.issue_date ? new Date(c.issue_date).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      {c.grade || 'Distinction'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'REVOKED'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {c.status || 'VALID'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`/api/certificates/${c.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:opacity-90 text-[#090D16] font-bold text-xs rounded-lg flex items-center gap-1 shadow transition-all"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </a>

                        {c.status !== 'REVOKED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setRevokeId(c.id);
                              setShowRevokeModal(true);
                            }}
                            className="px-2 py-1 bg-white/5 hover:bg-red-500/20 text-[#94A3B8] hover:text-red-400 border border-white/10 rounded-lg text-xs font-bold transition-all"
                            title="Revoke Certificate"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Certificate Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Award className="w-5 h-5" />
                </span>
                <h3 className="font-serif-brand font-bold text-base text-white">Issue Monastic Certificate</h3>
              </div>
              <button type="button" onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Select Monk Scholar *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.monastic_name || s.secular_name} ({s.roll_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Select Course Program *</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Academic Grade *</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="Distinction">Distinction (Honors)</option>
                  <option value="First Division">First Division</option>
                  <option value="Second Division">Second Division</option>
                  <option value="Pass">Pass</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Ecclesiastical Signatory</label>
                <input
                  type="text"
                  value={signedBy}
                  onChange={(e) => setSignedBy(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] font-bold rounded-xl shadow-lg"
                >
                  Issue & Generate PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif-brand font-bold text-base text-red-400">
                Revoke Certificate
              </h3>
              <button type="button" onClick={() => setShowRevokeModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8]">
              State ecclesiastical grounds for revoking this monastic certificate:
            </p>

            <textarea
              rows={3}
              value={revocationReason}
              onChange={(e) => setRevocationReason(e.target.value)}
              placeholder="e.g. Incomplete course requirements, disciplinary action..."
              className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
            ></textarea>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRevokeModal(false)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevoke}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
