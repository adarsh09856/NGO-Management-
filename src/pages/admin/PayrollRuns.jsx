import React, { useState, useEffect } from 'react';
import {
  UserCheck, DollarSign, Download, Plus, Play, CheckCircle2,
  Calendar, Ban, Edit2, AlertTriangle, X, Save, RefreshCw, FileText,
  Clock, ShieldAlert
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function PayrollRuns() {
  const { success, error } = useToast();
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [salarySlips, setSalarySlips] = useState([]);
  const [casualWorkers, setCasualWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlips, setLoadingSlips] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Month & Year generation state
  const currentDate = new Date();
  const [genMonth, setGenMonth] = useState(currentDate.getMonth() + 1);
  const [genYear, setGenYear] = useState(currentDate.getFullYear());
  const [genNotes, setGenNotes] = useState('');

  // Void Run Confirmation Modal
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [voiding, setVoiding] = useState(false);

  // Edit Salary Slip Modal State
  const [editSlipModalOpen, setEditSlipModalOpen] = useState(false);
  const [editingSlip, setEditingSlip] = useState(null);
  const [editBasic, setEditBasic] = useState(0);
  const [editHousing, setEditHousing] = useState(0);
  const [editMonastic, setEditMonastic] = useState(0);
  const [editMedical, setEditMedical] = useState(0);
  const [editPf, setEditPf] = useState(0);
  const [editTax, setEditTax] = useState(0);
  const [editOtherDeductions, setEditOtherDeductions] = useState(0);
  const [editPaymentStatus, setEditPaymentStatus] = useState('paid');
  const [savingSlip, setSavingSlip] = useState(false);

  // Casual Worker Pay Modal
  const [casualModalOpen, setCasualModalOpen] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workType, setWorkType] = useState('Stupa Masonry & Construction');
  const [daysWorked, setDaysWorked] = useState(1);
  const [dailyRate, setDailyRate] = useState(800);
  const [workDateFrom, setWorkDateFrom] = useState(new Date().toISOString().slice(0, 10));
  const [casualNotes, setCasualNotes] = useState('');
  const [savingCasual, setSavingCasual] = useState(false);

  const fetchRunsAndCasual = async (preferredRunId = null) => {
    try {
      setLoading(true);
      const [runsRes, casualRes] = await Promise.all([
        api.get('/payroll/runs'),
        api.get('/payroll/casual-labor')
      ]);

      let runs = [];
      if (runsRes.data.success) {
        runs = runsRes.data.data || [];
        setPayrollRuns(runs);
      }

      if (casualRes.data.success) {
        setCasualWorkers(casualRes.data.data || []);
      }

      // Determine which run to load slips for
      const targetRunId = preferredRunId || selectedRunId || (runs.length > 0 ? runs[0].id : null);
      if (targetRunId) {
        setSelectedRunId(targetRunId);
        await fetchSlipsForRun(targetRunId);
      } else {
        setSalarySlips([]);
      }
    } catch (err) {
      console.error('Failed to load payroll data:', err);
      error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlipsForRun = async (runId) => {
    try {
      setLoadingSlips(true);
      const res = await api.get(`/payroll/runs/${runId}/slips`);
      if (res.data.success) {
        setSalarySlips(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load salary slips:', err);
      error('Failed to load salary slips for selected run');
    } finally {
      setLoadingSlips(false);
    }
  };

  useEffect(() => {
    fetchRunsAndCasual();
  }, []);

  const handleSelectRun = (runId) => {
    setSelectedRunId(runId);
    fetchSlipsForRun(runId);
  };

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await api.post('/payroll/generate', {
        month: parseInt(genMonth, 10),
        year: parseInt(genYear, 10),
        notes: genNotes.trim()
      });

      if (res.data.success) {
        success(res.data.message || 'Payroll run generated successfully');
        setGenNotes('');
        const newRunId = res.data.data?.payrollRunId;
        await fetchRunsAndCasual(newRunId);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Payroll generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleVoidRun = async () => {
    if (!selectedRunId) return;
    try {
      setVoiding(true);
      const res = await api.post(`/payroll/runs/${selectedRunId}/void`);
      if (res.data.success) {
        success(res.data.message || 'Payroll run voided successfully');
        setVoidModalOpen(false);
        await fetchRunsAndCasual(selectedRunId);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to void payroll run');
    } finally {
      setVoiding(false);
    }
  };

  const openEditSlipModal = (slip) => {
    setEditingSlip(slip);
    setEditBasic(parseFloat(slip.basic_salary) || 0);
    setEditHousing(parseFloat(slip.housing_allowance) || 0);
    setEditMonastic(parseFloat(slip.monastic_stipend) || 0);
    setEditMedical(parseFloat(slip.medical_allowance) || 0);
    setEditPf(parseFloat(slip.pf_deduction) || 0);
    setEditTax(parseFloat(slip.tax_deduction) || 0);
    setEditOtherDeductions(parseFloat(slip.other_deductions) || 0);
    setEditPaymentStatus(slip.payment_status || 'paid');
    setEditSlipModalOpen(true);
  };

  const handleUpdateSlip = async (e) => {
    e.preventDefault();
    if (!editingSlip) return;

    try {
      setSavingSlip(true);
      const payload = {
        basicSalary: editBasic,
        housingAllowance: editHousing,
        monasticStipend: editMonastic,
        medicalAllowance: editMedical,
        pfDeduction: editPf,
        taxDeduction: editTax,
        otherDeductions: editOtherDeductions,
        paymentStatus: editPaymentStatus
      };

      const res = await api.put(`/payroll/slips/${editingSlip.id}`, payload);
      if (res.data.success) {
        success(res.data.message || 'Salary slip updated');
        setEditSlipModalOpen(false);
        setEditingSlip(null);
        await fetchRunsAndCasual(selectedRunId);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update salary slip');
    } finally {
      setSavingSlip(false);
    }
  };

  const handleCasualPaySubmit = async (e) => {
    e.preventDefault();
    if (!workerName || !dailyRate) {
      error('Worker name and daily rate are required');
      return;
    }

    try {
      setSavingCasual(true);
      const res = await api.post('/payroll/casual-labor', {
        workerName: workerName.trim(),
        workType: workType.trim(),
        daysWorked: parseFloat(daysWorked) || 1,
        dailyRate: parseFloat(dailyRate) || 0,
        workDateFrom,
        workDateTo: workDateFrom,
        notes: casualNotes.trim()
      });

      if (res.data.success) {
        success('Casual worker wage recorded successfully!');
        setCasualModalOpen(false);
        setWorkerName('');
        setCasualNotes('');
        await fetchRunsAndCasual(selectedRunId);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to record casual wage');
    } finally {
      setSavingCasual(false);
    }
  };

  const selectedRun = payrollRuns.find(r => r.id === selectedRunId);
  const isVoid = selectedRun?.status === 'void';

  // Live calculation for edit modal preview
  const calcTotalEarnings = editBasic + editHousing + editMonastic + editMedical;
  const calcTotalDeductions = editPf + editTax + editOtherDeductions;
  const calcNetSalary = calcTotalEarnings - calcTotalDeductions;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A] flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[#D4AF37]" />
            <span>Monastery HRM & Payroll Operations</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Process monthly staff salary runs, adjust slips, generate payslip PDFs, and disburse daily casual labor.
          </p>
        </div>

        <button
          onClick={() => fetchRunsAndCasual(selectedRunId)}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Refresh payroll data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Generator & Overview Card */}
      <div className="monastery-card p-5 bg-[#FAF9F5] border border-[#E2E8F0]">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Payroll Engine</span>
            <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
              Generate Monthly Salary Run
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Automatically compiles active employees, computes PF (5%), monastic stipends, and housing allowances.
            </p>
          </div>

          <form onSubmit={handleGeneratePayroll} className="flex flex-wrap items-center gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Month</label>
              <select
                value={genMonth}
                onChange={(e) => setGenMonth(parseInt(e.target.value, 10))}
                className="p-2 border border-gray-300 rounded font-semibold bg-white"
              >
                {[
                  { m: 1, name: 'January' }, { m: 2, name: 'February' }, { m: 3, name: 'March' },
                  { m: 4, name: 'April' }, { m: 5, name: 'May' }, { m: 6, name: 'June' },
                  { m: 7, name: 'July' }, { m: 8, name: 'August' }, { m: 9, name: 'September' },
                  { m: 10, name: 'October' }, { m: 11, name: 'November' }, { m: 12, name: 'December' }
                ].map(item => (
                  <option key={item.m} value={item.m}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Year</label>
              <input
                type="number"
                min="2020"
                max="2035"
                value={genYear}
                onChange={(e) => setGenYear(parseInt(e.target.value, 10))}
                className="w-20 p-2 border border-gray-300 rounded font-mono font-semibold bg-white"
              >
              </input>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Regular monthly payroll"
                value={genNotes}
                onChange={(e) => setGenNotes(e.target.value)}
                className="w-48 p-2 border border-gray-300 rounded bg-white"
              />
            </div>

            <div className="pt-3.5">
              <button
                type="submit"
                disabled={generating}
                className="px-4 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded font-bold uppercase tracking-wider flex items-center gap-1.5 shadow transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{generating ? 'Processing...' : 'Run Payroll'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Payroll Runs Selector Bar */}
      {payrollRuns.length > 0 && (
        <div className="monastery-card p-4 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                Select Batch:
              </span>
              {payrollRuns.map(run => {
                const isSelected = selectedRunId === run.id;
                const isRunVoid = run.status === 'void';
                return (
                  <button
                    key={run.id}
                    type="button"
                    onClick={() => handleSelectRun(run.id)}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                      isSelected
                        ? isRunVoid
                          ? 'bg-red-800 text-white shadow'
                          : 'bg-[#0F172A] text-[#D4AF37] shadow ring-2 ring-[#D4AF37]/50'
                        : isRunVoid
                        ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <span>{run.run_code}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans uppercase font-bold ${
                      isRunVoid ? 'bg-red-200 text-red-900' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {run.status}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Run Action Summary */}
            {selectedRun && (
              <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right text-xs">
                  <span className="text-gray-500 font-mono">Disbursed: </span>
                  <strong className="font-mono text-sm text-[#0F172A]">
                    ₹{parseFloat(selectedRun.grand_total || 0).toLocaleString('en-IN')}
                  </strong>
                </div>

                {!isVoid ? (
                  <button
                    type="button"
                    onClick={() => setVoidModalOpen(true)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1 transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Void Run</span>
                  </button>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-800 font-bold uppercase tracking-wider text-[10px] rounded border border-red-300 flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Voided Record</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Salary Slips Table */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#FAF9F5]">
          <div>
            <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0F172A]" />
              <span>
                Employee Salary Slips — {selectedRun ? `${selectedRun.run_code} (${salarySlips.length} Staff)` : 'No Run Selected'}
              </span>
            </h3>
            {isVoid && (
              <p className="text-[11px] text-red-600 font-semibold mt-0.5">
                Notice: This payroll batch has been voided. All salary disbursements are revoked.
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF5F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Slip No</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4 font-mono">Basic</th>
                <th className="py-3 px-4 font-mono">Allowances</th>
                <th className="py-3 px-4 font-mono">Deductions</th>
                <th className="py-3 px-4 font-mono">Net Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingSlips ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Loading salary slips for selected run...
                  </td>
                </tr>
              ) : salarySlips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No salary slips generated for this batch.
                  </td>
                </tr>
              ) : (
                salarySlips.map((s) => {
                  const allowancesTotal =
                    (parseFloat(s.housing_allowance) || 0) +
                    (parseFloat(s.monastic_stipend) || 0) +
                    (parseFloat(s.medical_allowance) || 0);
                  const deductionsTotal = parseFloat(s.total_deductions) || 0;

                  return (
                    <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                        {s.slip_no}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{s.employee_name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{s.employee_code} • {s.designation}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-800">
                        ₹{parseFloat(s.basic_salary).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-700">
                        +₹{allowancesTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-mono text-red-700">
                        -₹{deductionsTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900 text-sm">
                        ₹{parseFloat(s.net_salary).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isVoid
                            ? 'bg-red-100 text-red-800'
                            : s.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isVoid ? 'VOID' : (s.payment_status || 'PAID')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {!isVoid && (
                            <button
                              type="button"
                              onClick={() => openEditSlipModal(s)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit Salary Breakdown"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <a
                            href={`/api/payroll/slips/${s.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F172A] bg-[#FAF5F0] hover:bg-[#FEF3C7] border border-[#D4AF37] px-2.5 py-1 rounded shadow-sm transition-colors"
                            title="Download Payslip PDF"
                          >
                            <Download className="w-3 h-3 text-[#0F172A]" />
                            <span>PDF</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Casual Labor & Daily Wages Section */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#FAF9F5]">
          <div>
            <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
              Casual Labor & Daily Wage Disbursements ({casualWorkers.length})
            </h3>
            <p className="text-[11px] text-gray-500">
              Stupa construction masons, carpenters, decorators, and monastery helpers
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCasualModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-[#D4AF37] rounded text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Daily Wage</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF5F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Work Date</th>
                <th className="py-3 px-4">Worker Name</th>
                <th className="py-3 px-4">Task / Category</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4 font-mono">Daily Rate</th>
                <th className="py-3 px-4 font-mono">Total Paid</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {casualWorkers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No casual labor recorded yet.
                  </td>
                </tr>
              ) : (
                casualWorkers.map((w) => (
                  <tr key={w.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                      {new Date(w.work_date_from).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">{w.worker_name}</td>
                    <td className="py-3 px-4 text-gray-600">{w.work_type}</td>
                    <td className="py-3 px-4 font-mono">{parseFloat(w.days_worked)} days</td>
                    <td className="py-3 px-4 font-mono">₹{parseFloat(w.daily_rate).toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      ₹{parseFloat(w.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        w.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {w.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT SALARY SLIP MODAL */}
      {editSlipModalOpen && editingSlip && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#D4AF37]/40 animate-fadeIn overflow-hidden">
            <div className="p-5 bg-[#FAF5F0] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="font-serif-brand font-bold text-base text-[#0F172A] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#E11D48]" />
                  <span>Adjust Salary Breakdown</span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                  {editingSlip.slip_no} • {editingSlip.employee_name}
                </p>
              </div>
              <button onClick={() => setEditSlipModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSlip} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Basic Salary (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editBasic}
                    onChange={(e) => setEditBasic(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Housing Allowance (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editHousing}
                    onChange={(e) => setEditHousing(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Monastic Sangha Stipend (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editMonastic}
                    onChange={(e) => setEditMonastic(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Medical Allowance (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editMedical}
                    onChange={(e) => setEditMedical(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">PF Deduction (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPf}
                    onChange={(e) => setEditPf(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tax Deduction (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editTax}
                    onChange={(e) => setEditTax(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Other Deductions (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editOtherDeductions}
                    onChange={(e) => setEditOtherDeductions(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Payment Status</label>
                <select
                  value={editPaymentStatus}
                  onChange={(e) => setEditPaymentStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded font-semibold uppercase"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Calculated Summary Box */}
              <div className="p-3 bg-[#FAF5F0] rounded-lg border border-[#D4AF37]/30 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-500">Gross Earnings:</span>{' '}
                  <strong className="text-emerald-700 font-mono">₹{calcTotalEarnings.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Total Deductions:</span>{' '}
                  <strong className="text-red-700 font-mono">₹{calcTotalDeductions.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-gray-700 font-bold">New Net Salary:</span>{' '}
                  <strong className="text-[#0F172A] font-mono font-bold text-sm">₹{calcNetSalary.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditSlipModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSlip}
                  className="px-5 py-2 bg-[#E11D48] hover:bg-[#1E293B] text-white rounded font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingSlip ? 'Saving...' : 'Save Slip'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VOID RUN CONFIRMATION MODAL */}
      {voidModalOpen && selectedRun && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-red-200 animate-fadeIn overflow-hidden">
            <div className="p-5 bg-red-50 border-b border-red-100 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
                  Void Payroll Run
                </h3>
                <p className="text-[11px] text-red-600 font-medium font-mono">{selectedRun.run_code}</p>
              </div>
            </div>

            <div className="p-5 text-xs text-gray-600 space-y-3">
              <p>
                Are you sure you want to void the payroll run for{' '}
                <strong className="text-gray-900 font-bold">{selectedRun.run_code}</strong>?
              </p>
              <p className="text-[11px] text-gray-500">
                This action will mark the entire batch as void and revert all associated employee salary slips and casual labor records to unpaid status.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setVoidModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVoidRun}
                disabled={voiding}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-wider text-xs flex items-center space-x-1.5 shadow"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{voiding ? 'Voiding...' : 'Confirm Void'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CASUAL LABOR MODAL */}
      {casualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#D4AF37]/40 p-6 max-w-md w-full space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Record Casual Labor Wage Payment
              </h3>
              <button onClick={() => setCasualModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCasualPaySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Worker Name *</label>
                <input
                  type="text"
                  required
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="e.g. Tshering Gyeltshen"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-1 focus:ring-[#E11D48]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Work Description / Trade *</label>
                <input
                  type="text"
                  required
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  placeholder="e.g. Stupa stone carving"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-1 focus:ring-[#E11D48]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Work Date</label>
                  <input
                    type="date"
                    required
                    value={workDateFrom}
                    onChange={(e) => setWorkDateFrom(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Days Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={daysWorked}
                    onChange={(e) => setDaysWorked(parseFloat(e.target.value) || 1)}
                    className="w-full p-2 rounded border border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Daily Rate (₹)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={dailyRate}
                    onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded border border-gray-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FAF5F0] rounded border border-[#D4AF37]/30 flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">Computed Total Wage:</span>
                <strong className="text-emerald-800 font-mono font-bold text-sm">
                  ₹{(daysWorked * dailyRate).toLocaleString('en-IN')}
                </strong>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={casualNotes}
                  onChange={(e) => setCasualNotes(e.target.value)}
                  placeholder="Special monastery project authorization"
                  className="w-full p-2 rounded border border-gray-300"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCasualModalOpen(false)}
                  className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCasual}
                  className="flex-1 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded font-bold uppercase tracking-wider shadow"
                >
                  {savingCasual ? 'Saving...' : 'Record & Disburse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
