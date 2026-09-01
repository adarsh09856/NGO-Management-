import React, { useState, useEffect } from 'react';
import { UserCheck, DollarSign, Download, Plus, Play, CheckCircle2, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function PayrollRuns() {
  const { success, error } = useToast();
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [salarySlips, setSalarySlips] = useState([]);
  const [casualWorkers, setCasualWorkers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Casual Worker Pay Modal
  const [casualModalOpen, setCasualModalOpen] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workDate, setWorkDate] = useState('2026-08-25');
  const [hoursWorked, setHoursWorked] = useState(8);
  const [dailyWage, setDailyWage] = useState(800);
  const [workDescription, setWorkDescription] = useState('Stupa stone carving and masonry work');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [runsRes, casualRes] = await Promise.all([
        api.get('/payroll/runs'),
        api.get('/payroll/casual-labor')
      ]);
      if (runsRes.data.success) {
        setPayrollRuns(runsRes.data.data);
        if (runsRes.data.data.length > 0) {
          const slipsRes = await api.get(`/payroll/runs/${runsRes.data.data[0].id}`);
          if (slipsRes.data.success) setSalarySlips(slipsRes.data.data.slips || []);
        }
      }
      if (casualRes.data.success) setCasualWorkers(casualRes.data.data);
    } catch (err) {
      console.error('Failed to load payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGeneratePayroll = async () => {
    try {
      setGenerating(true);
      const res = await api.post('/payroll/generate', { monthYear: selectedMonth });
      if (res.data.success) {
        success(res.data.message);
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Payroll generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleCasualPaySubmit = async (e) => {
    e.preventDefault();
    try {
      const total = hoursWorked * (dailyWage / 8);
      const res = await api.post('/payroll/casual-labor', {
        workerName,
        workDate,
        hoursWorked,
        dailyWage,
        totalPay: total,
        workDescription
      });
      if (res.data.success) {
        success('Casual worker wage recorded and settled!');
        setCasualModalOpen(false);
        setWorkerName('');
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to record casual pay');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A]">
            HRM & Monthly Payroll Operations
          </h1>
          <p className="text-xs text-gray-500">
            Generate monthly staff salary batches, print official pay slips, and record daily wage labor.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs p-2 rounded border border-gray-300 bg-white font-bold"
          />
          <button
            type="button"
            onClick={handleGeneratePayroll}
            disabled={generating}
            className="px-4 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{generating ? 'Processing...' : 'Run Monthly Payroll'}</span>
          </button>
        </div>
      </div>

      {/* Salary Slips Table */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center">
          <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
            Employee Salary Slips ({selectedMonth})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F5F9] text-gray-700 font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Slip No</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Basic Pay</th>
                <th className="py-3 px-4">Allowances</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Download Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {salarySlips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No salary slips generated for this batch yet. Click "Run Monthly Payroll" above.
                  </td>
                </tr>
              ) : (
                salarySlips.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">{s.slip_number}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{s.full_name}</td>
                    <td className="py-3 px-4 font-mono">₹{parseFloat(s.basic_salary).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">+₹{parseFloat(s.allowances || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono text-red-700">-₹{parseFloat(s.deductions || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">₹{parseFloat(s.net_salary).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {s.payment_status?.toUpperCase() || 'PAID'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`/api/payroll/salary-slips/${s.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F172A] bg-[#FAF5F0] hover:bg-[#FEF3C7] border border-[#D4AF37] px-2.5 py-1 rounded shadow-sm"
                      >
                        <Download className="w-3 h-3 text-[#0F172A]" />
                        <span>PDF</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Casual Labor & Daily Wages Section */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center">
          <div>
            <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
              Casual Labor & Daily Wage Disbursements
            </h3>
            <p className="text-[11px] text-gray-500">Stupa construction masons, carpenters, and helpers</p>
          </div>

          <button
            type="button"
            onClick={() => setCasualModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Daily Wage</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F5F9] text-gray-700 font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Worker Name</th>
                <th className="py-3 px-4">Work Description</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Daily Rate</th>
                <th className="py-3 px-4">Total Paid (₹)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {casualWorkers.map((w) => (
                <tr key={w.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 text-gray-600">{new Date(w.work_date).toLocaleDateString('en-GB')}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{w.worker_name}</td>
                  <td className="py-3 px-4 text-gray-600">{w.work_description}</td>
                  <td className="py-3 px-4 font-mono">{w.hours_worked} hrs</td>
                  <td className="py-3 px-4 font-mono">₹{parseFloat(w.daily_wage).toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">₹{parseFloat(w.total_pay).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      SETTLED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Casual Labor Modal */}
      {casualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
              Record Casual Labor Wage Payment
            </h3>

            <form onSubmit={handleCasualPaySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Worker Name *</label>
                <input
                  type="text"
                  required
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="e.g. Tshering Gyeltshen"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Work Date</label>
                  <input
                    type="date"
                    required
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Daily Wage (₹)</label>
                  <input
                    type="number"
                    required
                    value={dailyWage}
                    onChange={(e) => setDailyWage(parseFloat(e.target.value))}
                    className="w-full p-2 rounded border border-gray-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Work Task Description</label>
                <input
                  type="text"
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="e.g. Stupa stone carving"
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCasualModalOpen(false)}
                  className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#0F172A] text-white rounded font-bold hover:bg-[#1E293B]"
                >
                  Confirm Wage & Settle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
