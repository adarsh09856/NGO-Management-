import React, { useState } from 'react';
import { 
  BarChart3, Download, FileSpreadsheet, Heart, 
  Landmark, Warehouse, Users, UserCheck, ShieldCheck, 
  CheckCircle2, Clock, Loader2, Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ReportsHub() {
  const { success, error } = useToast();
  const [exportingModule, setExportingModule] = useState(null);

  const handleExport = async (reportType, label) => {
    try {
      setExportingModule(reportType);
      const res = await api.get(`/reports/${reportType}/export?format=csv`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Drodul_Phendey_Ling_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success(`Successfully exported ${label} CSV!`);
    } catch (err) {
      console.error('Export error:', err);
      error(err.response?.data?.message || `Failed to export ${label}`);
    } finally {
      setExportingModule(null);
    }
  };

  const reports = [
    {
      id: 'donations',
      title: 'Donations & Tax Receipts Register',
      description: 'Comprehensive itemized registry of devotees, tax receipt references, allocated sacred pujas, payment modes, and financial dates.',
      icon: Heart,
      color: '#E11D48',
      bgLight: 'bg-[#E11D48]/10',
      borderColor: 'border-[#E11D48]/20',
      compliance: 'Audited for Income Tax Exemption & Monastic Trust Returns'
    },
    {
      id: 'accounts',
      title: 'Accounts & Double-Entry Ledger',
      description: 'Debit and credit ledger entries, expense disbursements, bank account reconciliations, and quarterly cash surplus analysis.',
      icon: Landmark,
      color: '#D4AF37',
      bgLight: 'bg-[#D4AF37]/10',
      borderColor: 'border-[#D4AF37]/20',
      compliance: 'Compliant with Bhutanese Non-Profit Accounting Standards'
    },
    {
      id: 'inventory',
      title: 'Store Inventory & Stock Valuation',
      description: 'Granular log of temple brassware, consecrated flour, ceremonial robes, stupa granite, minimum stock indicators, and unit costs.',
      icon: Warehouse,
      color: '#38BDF8',
      bgLight: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
      compliance: 'Real-time perpetual inventory valuation method'
    },
    {
      id: 'students',
      title: 'Shedra Monastic Academy Roster',
      description: 'Directory of ordained novice monks, Tibetan Buddhist curriculum enrollments, semester grade distinction rates, and attendance compliance.',
      icon: Users,
      color: '#A855F7',
      bgLight: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      compliance: 'Endorsed by Shedra Education & Curriculum Council'
    },
    {
      id: 'payroll',
      title: 'HRM Staff Payroll & Casual Wages',
      description: 'Monthly compensation registry for Shedra lecturers, administrative officers, stupa stone carvers, masons, and tax deductions.',
      icon: UserCheck,
      color: '#10B981',
      bgLight: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      compliance: 'Verified with Ministry of Labour & Human Resources Bhutan'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#090D16] border border-[#2A1E17] p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
            </span>
            <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-white">
              Reports & Financial Compliance Hub
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Generate and export official compliance spreadsheets for regulatory authorities, independent auditors, and monastic trustees.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Real-time DB Synchronization Active</span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((r) => {
          const Icon = r.icon;
          const isExporting = exportingModule === r.id;

          return (
            <div 
              key={r.id} 
              className="bg-[#0D121F] border border-[#2A1E17] hover:border-[#D4AF37]/40 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-xl transition-all group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl ${r.bgLight} border ${r.borderColor}`}>
                    <Icon className="w-6 h-6" style={{ color: r.color }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#94A3B8] bg-white/5 px-2 py-1 rounded">
                    .CSV FORMAT
                  </span>
                </div>

                <div>
                  <h3 className="font-serif-brand font-bold text-base text-white group-hover:text-[#D4AF37] transition-colors">
                    {r.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                    {r.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] text-[#CBD5E1] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{r.compliance}</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExport(r.id, r.title)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isExporting
                    ? 'bg-white/10 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] hover:shadow-[#D4AF37]/20'
                }`}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Exporting Records...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official CSV</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
