import React, { useState, useEffect } from 'react';
import { 
  Award, Download, ShieldCheck, CheckCircle2, 
  Calendar, User, FileText, Sparkles, ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function StudentCertificates() {
  const { error } = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCerts() {
      try {
        setLoading(true);
        const res = await api.get('/student/certificates');
        if (res.data.success) {
          setCertificates(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load certificates:', err);
        error(err.response?.data?.message || 'Failed to load certificates');
      } finally {
        setLoading(false);
      }
    }
    fetchCerts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#94A3B8]">Retrieving your official Shedra credentials...</p>
        </div>
      </div>
    );
  }

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
              Official Shedra Monastic Credentials
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Verified academic graduation and Buddhist philosophy achievement certificates issued under ecclesiastical authority.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Ecclesiastically Certified</span>
        </div>
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl p-12 text-center space-y-4 shadow-xl">
          <Award className="w-12 h-12 text-[#94A3B8] mx-auto opacity-40" />
          <div className="space-y-1">
            <h3 className="font-serif-brand font-bold text-lg text-white">No Certificates Conferred Yet</h3>
            <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
              Once you complete 100% of your Shedra course modules and pass the dialectical assessment, your official credential will be automatically generated here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-[#0D121F] border border-[#2A1E17] hover:border-[#D4AF37]/50 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl transition-all relative overflow-hidden group"
            >
              {/* Sacred Corner Ornament */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent pointer-events-none"></div>

              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2 py-0.5 rounded">
                    {cert.certificate_number}
                  </span>
                  <div className="text-[10px] text-[#94A3B8]">Drodul Phendey Ling Monastic Council</div>
                </div>

                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {cert.grade || 'Distinction'}
                </span>
              </div>

              <div>
                <h3 className="font-serif-brand font-bold text-lg sm:text-xl text-white group-hover:text-[#D4AF37] transition-colors">
                  {cert.course_title}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                  Has successfully fulfilled all curriculum requirements, text recitation, and doctrinal debate in Buddhist philosophy.
                </p>
              </div>

              <div className="space-y-2 text-xs text-[#94A3B8] pt-3 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span>Conferred Date:</span>
                  <span className="text-white font-mono font-semibold">
                    {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-GB') : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Authorized Signature:</span>
                  <span className="text-[#D4AF37] font-semibold">{cert.signed_by || 'Khenpo Tashi Dorji, Abbot'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Verification Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cryptographically Valid
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex gap-3">
                <a
                  href={`/api/certificates/${cert.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official PDF</span>
                </a>

                <a
                  href={`/api/certificates/verify/${cert.certificate_number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                  title="Verify on Public Blockchain / Registry"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Verify</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
