import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Award, BookOpen, GraduationCap } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function StudentsMonks() {
  const { success, error } = useToast();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Monk Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [rollNumber, setRollNumber] = useState(`MNK-2026-${String(Math.floor(Math.random() * 900 + 100))}`);
  const [secularName, setSecularName] = useState('');
  const [monasticName, setMonasticName] = useState('');
  const [monkStatus, setMonkStatus] = useState('novice');
  const [dzongkhag, setDzongkhag] = useState('Sarpang');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let url = '/lms/students?limit=50';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) setStudents(res.data.data);
    } catch (err) {
      console.error('Failed to load monks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/lms/students', {
        rollNumber,
        secularName,
        monasticName,
        monkStatus,
        dzongkhag,
        guardianName,
        guardianPhone
      });
      if (res.data.success) {
        success('Monk scholar registered successfully in Shedra database!');
        setShowAddModal(false);
        setSecularName('');
        setMonasticName('');
        fetchStudents();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to register monk');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#4A0E17]">
            Students & Monastic Sangha
          </h1>
          <p className="text-xs text-gray-500">
            Registered resident monks, novice scholars, and Buddhist philosophy students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#7E1929] hover:bg-[#5A121E] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Monk</span>
        </button>
      </div>

      {/* Search */}
      <div className="monastery-card p-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchStudents(); }} className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Search monk name, roll number, dzongkhag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs p-2 rounded border border-gray-300 w-full"
          />
          <button type="submit" className="px-3 py-2 bg-[#4A0E17] text-white text-xs font-bold rounded">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="monastery-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-gray-700 font-bold uppercase tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="py-3 px-4">Sangha / Roll No</th>
                <th className="py-3 px-4">Monastic Ordination Name</th>
                <th className="py-3 px-4">Secular Name</th>
                <th className="py-3 px-4">Monastic Rank</th>
                <th className="py-3 px-4">Origin Dzongkhag</th>
                <th className="py-3 px-4">Guardian & Contact</th>
                <th className="py-3 px-4">Admission Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#4A0E17]">{s.roll_number}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{s.monastic_name || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">{s.secular_name}</td>
                  <td className="py-3 px-4 capitalize">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FDF6E2] text-[#4A0E17] border border-[#D4AF37]">
                      {s.monk_status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{s.dzongkhag}, Bhutan</td>
                  <td className="py-3 px-4 text-gray-600">
                    <div>{s.guardian_name || 'Monastery Care'}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{s.guardian_phone}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{new Date(s.admission_date).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Monk Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
              Register New Monk Scholar
            </h3>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Roll / Sangha No *</label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Monastic Rank *</label>
                  <select
                    value={monkStatus}
                    onChange={(e) => setMonkStatus(e.target.value)}
                    className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold"
                  >
                    <option value="novice">Novice Monk (Getsul)</option>
                    <option value="gelong">Fully Ordained (Gelong)</option>
                    <option value="lay_student">Lay Dharma Student</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Monastic / Dharma Name</label>
                <input
                  type="text"
                  value={monasticName}
                  onChange={(e) => setMonasticName(e.target.value)}
                  placeholder="e.g. Tenzin Norbu"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Secular Legal Name *</label>
                <input
                  type="text"
                  required
                  value={secularName}
                  onChange={(e) => setSecularName(e.target.value)}
                  placeholder="e.g. Dorji Wangchuk"
                  className="w-full p-2.5 rounded border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Dzongkhag (District)</label>
                  <input
                    type="text"
                    value={dzongkhag}
                    onChange={(e) => setDzongkhag(e.target.value)}
                    placeholder="Sarpang"
                    className="w-full p-2 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Guardian Phone</label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
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
                  Register Monk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
