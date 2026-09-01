import React from 'react';
import { BarChart3, Download, FileSpreadsheet, Heart, Landmark, Warehouse, Users, UserCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ReportsHub() {
  const { success } = useToast();

  const handleExport = (reportType) => {
    window.open(`/api/reports/${reportType}/export?format=csv`, '_blank');
    success(`Downloading ${reportType} CSV export...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A]">
          Reports & Financial Auditing Hub
        </h1>
        <p className="text-xs text-gray-500">
          Generate and export official compliance spreadsheets for regulatory authorities, auditors, and monastic trustees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Report 1: Donations */}
        <div className="monastery-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#0F172A] flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">Donation & Tax Receipt Register</h3>
            <p className="text-xs text-gray-600">Complete itemized list of all donors, 80G tax receipt numbers, campaign allocations, and payment references.</p>
          </div>
          <button
            onClick={() => handleExport('donations')}
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export Donations (CSV)</span>
          </button>
        </div>

        {/* Report 2: Accounts */}
        <div className="monastery-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#0F172A] flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">Accounts & General Ledger</h3>
            <p className="text-xs text-gray-600">Debit and credit voucher postings, bank accounts reconciliations, expense claims, and monthly net cash balances.</p>
          </div>
          <button
            onClick={() => handleExport('accounts')}
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export Accounts Ledger (CSV)</span>
          </button>
        </div>

        {/* Report 3: Inventory */}
        <div className="monastery-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#0F172A] flex items-center justify-center">
              <Warehouse className="w-5 h-5" />
            </div>
            <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">Store Inventory Valuation</h3>
            <p className="text-xs text-gray-600">Current warehouse balances, unit costs, minimum stock alert triggers, and supplier transaction logs.</p>
          </div>
          <button
            onClick={() => handleExport('inventory')}
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export Inventory Report (CSV)</span>
          </button>
        </div>

        {/* Report 4: Shedra Scholars */}
        <div className="monastery-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#0F172A] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">Shedra Academic & Monk Roster</h3>
            <p className="text-xs text-gray-600">Student monk enrollments, academic grades, attendance compliance percentages, and graduation records.</p>
          </div>
          <button
            onClick={() => handleExport('students')}
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export Monks Roster (CSV)</span>
          </button>
        </div>

        {/* Report 5: HRM & Payroll */}
        <div className="monastery-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#0F172A] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">HRM & Monthly Payroll Slips</h3>
            <p className="text-xs text-gray-600">Staff salary disbursements, casual worker daily wages, deductions, and tax withholdings.</p>
          </div>
          <button
            onClick={() => handleExport('payroll')}
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export Payroll Summary (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
