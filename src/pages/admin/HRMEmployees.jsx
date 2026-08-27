import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Mail, Phone, Building2, Search } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function HRMEmployees() {
  const { success, error } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [employeeCode, setEmployeeCode] = useState(`EMP-2026-${String(Math.floor(Math.random() * 900 + 100))}`);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Monastic Affairs');
  const [designation, setDesignation] = useState('Senior Lama');
  const [basicSalary, setBasicSalary] = useState(25000);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hrm/employees');
      if (res.data.success) setEmployees(res.data.data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

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
        basicSalary: parseFloat(basicSalary),
        joiningDate: new Date().toISOString().split('T')[0]
      });
      if (res.data.success) {
        success('New employee added to payroll register!');
        setShowAddModal(false);
        setFullName('');
        setEmail('');
        fetchEmployees();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add employee');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Employees & Staff Directory
          </h1>
          <p className="text-xs text-gray-500">
            Administrative officers, Shedra instructors, accountants, and support staff.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Table */}
      <div className="monastery-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Email & Phone</th>
                <th className="py-3 px-4">Basic Pay (₹)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#4A0E17]">{emp.employee_code}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{emp.full_name}</td>
                  <td className="py-3 px-4 font-semibold text-gray-700">{emp.department}</td>
                  <td className="py-3 px-4 text-gray-600">{emp.designation}</td>
                  <td className="py-3 px-4 text-gray-600">
                    <div>{emp.email}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{emp.phone}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">₹{parseFloat(emp.basic_salary).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
              Add New Staff / Instructor
            </h3>

            <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold"
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
                <label className="block font-bold text-gray-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Karma Samten"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Shedra Lecturer"
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Basic Salary (₹)</label>
                  <input
                    type="number"
                    required
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@drodulphendeyling.org"
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+975 17..."
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#4A0E17] text-white rounded font-bold hover:bg-[#5A121E]"
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
