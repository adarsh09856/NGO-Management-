import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Plus, Mail, Phone, Building2, Search, 
  Calendar, CheckCircle2, XCircle, Clock, AlertTriangle, 
  Users, Save, Filter, X, Briefcase
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function HRMEmployees() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'attendance'
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceMap, setAttendanceMap] = useState({}); // { [employeeId]: { status: 'present'|'absent'|'leave'|'late', remarks: '' } }
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [employeeCode, setEmployeeCode] = useState(`EMP-2026-${String(Math.floor(Math.random() * 900 + 100))}`);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Monastic Affairs');
  const [designation, setDesignation] = useState('Senior Lama');
  const [basicSalary, setBasicSalary] = useState(25000);
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankName, setBankName] = useState('Bank of Bhutan');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hrm/employees');
      if (res.data.success) {
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      error(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (date) => {
    try {
      const res = await api.get(`/hrm/attendance?date=${date}`);
      if (res.data.success) {
        const map = {};
        // Pre-fill existing records from DB
        (res.data.data || []).forEach(rec => {
          map[rec.employee_id] = {
            status: rec.status,
            remarks: rec.remarks || ''
          };
        });
        // For employees with no record yet on this date, default to 'present'
        employees.forEach(emp => {
          if (!map[emp.id]) {
            map[emp.id] = { status: 'present', remarks: '' };
          }
        });
        setAttendanceMap(map);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendance(attendanceDate);
    }
  }, [attendanceDate, employees]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/hrm/employees', {
        employeeCode,
        fullName,
        email,
        phone,
        department,
        designation,
        basicSalary: parseFloat(basicSalary) || 0,
        bankAccountNo,
        bankName,
        joiningDate: new Date().toISOString().split('T')[0]
      });
      if (res.data.success) {
        success('New employee added to monastery payroll register!');
        setShowAddModal(false);
        setFullName('');
        setEmail('');
        setPhone('');
        setEmployeeCode(`EMP-2026-${String(Math.floor(Math.random() * 900 + 100))}`);
        fetchEmployees();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleStatusChange = (empId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        status
      }
    }));
  };

  const handleRemarksChange = (empId, remarks) => {
    setAttendanceMap(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || { status: 'present' }),
        remarks
      }
    }));
  };

  const markAllPresent = () => {
    const updated = {};
    employees.forEach(emp => {
      updated[emp.id] = {
        ...(attendanceMap[emp.id] || {}),
        status: 'present'
      };
    });
    setAttendanceMap(updated);
    success('Marked all employees as Present for ' + attendanceDate);
  };

  const handleSaveAttendance = async () => {
    try {
      setSavingAttendance(true);
      const records = Object.entries(attendanceMap).map(([empId, data]) => ({
        employeeId: parseInt(empId, 10),
        status: data.status,
        remarks: data.remarks
      }));

      const res = await api.post('/hrm/attendance', {
        attendanceDate,
        records
      });

      if (res.data.success) {
        success(`Daily attendance registered successfully for ${attendanceDate}!`);
        fetchAttendance(attendanceDate);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to record attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesDept = deptFilter === 'all' || emp.department === deptFilter;
    const matchesSearch = !searchQuery ||
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Attendance metrics for active date
  const totalEmployees = employees.length;
  const presentCount = Object.values(attendanceMap).filter(a => a.status === 'present').length;
  const absentCount = Object.values(attendanceMap).filter(a => a.status === 'absent').length;
  const leaveCount = Object.values(attendanceMap).filter(a => a.status === 'leave').length;
  const lateCount = Object.values(attendanceMap).filter(a => a.status === 'late').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#090D16] border border-[#2A1E17] p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              <Users className="w-5 h-5 text-[#D4AF37]" />
            </span>
            <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-white">
              Human Resource & Monastic Staff Directory
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Manage monastery administrative officers, Shedra instructors, accountants, and daily duty rolls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab Switcher */}
          <div className="bg-[#0D121F] p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'directory'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] shadow'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Staff Directory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white shadow'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Daily Attendance
            </button>
          </div>

          {activeTab === 'directory' && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg hover:shadow-[#E11D48]/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'directory' ? (
        /* DIRECTORY VIEW */
        <div className="space-y-5">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Total Staff</span>
              <p className="text-2xl font-bold text-white mt-2 font-mono">{employees.length}</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">Full-time monastery officers & teachers</p>
            </div>
            <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Monastic Affairs</span>
              <p className="text-2xl font-bold text-[#D4AF37] mt-2 font-mono">
                {employees.filter(e => e.department === 'Monastic Affairs').length}
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1">Lamas, chant masters & ritual leads</p>
            </div>
            <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Administration & Finance</span>
              <p className="text-2xl font-bold text-blue-400 mt-2 font-mono">
                {employees.filter(e => e.department?.includes('Admin') || e.department?.includes('Finance') || e.department?.includes('Accounts')).length}
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1">Cashiers, accountants & managers</p>
            </div>
            <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Total Monthly Payroll</span>
              <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                ₹{employees.reduce((acc, e) => acc + (parseFloat(e.basic_salary) || 0), 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1">Base monthly compensation commitment</p>
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-serif-brand font-bold text-base text-white">Staff Roster</h3>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, code, designation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-semibold focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  <option value="Monastic Affairs">Monastic Affairs</option>
                  <option value="Accounts & Finance">Accounts & Finance</option>
                  <option value="Administration">Administration</option>
                  <option value="Stupa Construction">Stupa Construction</option>
                  <option value="Store & Kitchen">Store & Kitchen</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-[#090D16] text-[#94A3B8] font-bold uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-5">Emp Code</th>
                    <th className="py-3.5 px-4">Full Name</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Designation</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Bank & Basic Pay</th>
                    <th className="py-3.5 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-[#94A3B8]">
                        No staff members found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-[#D4AF37]">
                          {emp.employee_code}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{emp.full_name}</div>
                          <div className="text-[10px] text-[#94A3B8]">{emp.employment_type || 'Full-Time'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[#CBD5E1]">{emp.department}</td>
                        <td className="py-3.5 px-4 text-[#94A3B8]">{emp.designation}</td>
                        <td className="py-3.5 px-4">
                          <div className="text-white">{emp.email || '—'}</div>
                          <div className="text-[10px] text-[#94A3B8] font-mono">{emp.phone || '—'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-emerald-400">₹{parseFloat(emp.basic_salary).toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-[#94A3B8]">{emp.bank_name || 'Bank of Bhutan'}</div>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            emp.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {emp.status || 'ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ATTENDANCE VIEW */
        <div className="space-y-5">
          {/* Date Selector & Action Bar */}
          <div className="bg-[#0D121F] border border-[#2A1E17] p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <label className="block text-[11px] font-bold text-[#94A3B8] uppercase">Attendance Roll Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="mt-1 px-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-semibold focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={markAllPresent}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark All Present</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={savingAttendance}
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingAttendance ? 'Saving...' : 'Save Attendance Roll'}</span>
              </button>
            </div>
          </div>

          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-[#0D121F] border border-white/5 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Total Roll</span>
              <p className="text-xl font-bold text-white mt-1 font-mono">{totalEmployees}</p>
            </div>
            <div className="bg-[#0D121F] border border-emerald-500/20 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Present</span>
              <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">{presentCount}</p>
            </div>
            <div className="bg-[#0D121F] border border-red-500/20 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold text-red-400 uppercase">Absent</span>
              <p className="text-xl font-bold text-red-400 mt-1 font-mono">{absentCount}</p>
            </div>
            <div className="bg-[#0D121F] border border-blue-500/20 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold text-blue-400 uppercase">On Leave</span>
              <p className="text-xl font-bold text-blue-400 mt-1 font-mono">{leaveCount}</p>
            </div>
            <div className="bg-[#0D121F] border border-amber-500/20 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase">Late</span>
              <p className="text-xl font-bold text-amber-400 mt-1 font-mono">{lateCount}</p>
            </div>
          </div>

          {/* Attendance Register Table */}
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-[#090D16] text-[#94A3B8] font-bold uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-5">Staff Member</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Status Selection</th>
                    <th className="py-3.5 px-5">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {employees.map((emp) => {
                    const currentStatus = attendanceMap[emp.id]?.status || 'present';
                    const currentRemarks = attendanceMap[emp.id]?.remarks || '';

                    return (
                      <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-5">
                          <div className="font-bold text-white">{emp.full_name}</div>
                          <div className="text-[10px] text-[#D4AF37] font-mono">{emp.employee_code} • {emp.designation}</div>
                        </td>
                        <td className="py-3 px-4 text-[#CBD5E1]">{emp.department}</td>
                        <td className="py-3 px-4">
                          <div className="inline-flex rounded-lg border border-white/10 bg-[#090D16] p-1 gap-1">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp.id, 'present')}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-500 text-white shadow'
                                  : 'text-[#94A3B8] hover:text-white'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp.id, 'absent')}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                currentStatus === 'absent'
                                  ? 'bg-red-500 text-white shadow'
                                  : 'text-[#94A3B8] hover:text-white'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp.id, 'leave')}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                currentStatus === 'leave'
                                  ? 'bg-blue-500 text-white shadow'
                                  : 'text-[#94A3B8] hover:text-white'
                              }`}
                            >
                              Leave
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp.id, 'late')}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                currentStatus === 'late'
                                  ? 'bg-amber-500 text-white shadow'
                                  : 'text-[#94A3B8] hover:text-white'
                              }`}
                            >
                              Late
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <input
                            type="text"
                            placeholder="Optional notes / puja duty / sickness..."
                            value={currentRemarks}
                            onChange={(e) => handleRemarksChange(emp.id, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Users className="w-5 h-5" />
                </span>
                <h3 className="font-serif-brand font-bold text-base text-white">
                  Add New Staff / Instructor
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-mono font-bold focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Monastic Affairs">Monastic Affairs</option>
                    <option value="Accounts & Finance">Accounts & Finance</option>
                    <option value="Administration">Administration</option>
                    <option value="Stupa Construction">Stupa Construction</option>
                    <option value="Store & Kitchen">Store & Kitchen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Karma Samten"
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Shedra Lecturer"
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Basic Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-mono font-bold focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@drodulphendeyling.org"
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+975 17..."
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Bank of Bhutan"
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Account No</label>
                  <input
                    type="text"
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    placeholder="e.g. 1029384756"
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] font-bold rounded-xl shadow-lg transition-all hover:opacity-95"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
