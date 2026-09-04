import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Award, BookOpen, GraduationCap, 
  X, UserPlus, Filter, Calendar, Phone, MapPin
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function StudentsMonks() {
  const { success, error } = useToast();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Add Monk Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [rollNumber, setRollNumber] = useState(`MNK-2026-${String(Math.floor(Math.random() * 900 + 100))}`);
  const [secularName, setSecularName] = useState('');
  const [monasticName, setMonasticName] = useState('');
  const [sanghaId, setSanghaId] = useState(`SANGHA-GLP-${Math.floor(Math.random() * 900 + 100)}`);
  const [monkStatus, setMonkStatus] = useState('novice');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('2006-05-15');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('Gelephu, Sarpang Dzongkhag, Bhutan');

  // Quick Enroll Modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrollCourseId, setEnrollCourseId] = useState('');

  const fetchDependencies = async () => {
    try {
      const cRes = await api.get('/lms/courses');
      if (cRes.data.success && cRes.data.data?.length > 0) {
        setCourses(cRes.data.data);
        setEnrollCourseId(String(cRes.data.data[0].id));
      }
    } catch (err) {
      console.error('Failed to load courses for enrollment:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let url = '/lms/students?limit=100';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') url += `&monkStatus=${encodeURIComponent(statusFilter)}`;
      const res = await api.get(url);
      if (res.data.success) setStudents(res.data.data || []);
    } catch (err) {
      console.error('Failed to load monks:', err);
      error('Failed to load student monks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchStudents();
  }, [statusFilter]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/lms/students', {
        rollNumber,
        secularName,
        monasticName,
        sanghaId,
        monkStatus,
        gender,
        dob,
        guardianName,
        guardianPhone,
        address
      });
      if (res.data.success) {
        success('Monk scholar registered successfully in Shedra database!');
        setShowAddModal(false);
        setSecularName('');
        setMonasticName('');
        setRollNumber(`MNK-2026-${String(Math.floor(Math.random() * 900 + 100))}`);
        fetchStudents();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to register monk');
    }
  };

  const handleQuickEnroll = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !enrollCourseId) return;

    try {
      const res = await api.post('/lms/enrollments', {
        studentId: selectedStudent.id,
        courseId: parseInt(enrollCourseId, 10)
      });
      if (res.data.success) {
        success(`Enrolled ${selectedStudent.monastic_name || selectedStudent.secularName} into Shedra course!`);
        setShowEnrollModal(false);
        fetchStudents();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = !search ||
      s.monastic_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.secular_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.sangha_id?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#090D16] border border-[#2A1E17] p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              <Users className="w-5 h-5 text-[#D4AF37]" />
            </span>
            <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-white">
              Students & Monastic Sangha Scholars
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Official registry of resident monks, novice scholars, khenpos, and Buddhist philosophy students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Monk</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Total Sangha Roll</span>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{students.length}</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">Ordained monastic resident scholars</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Novice Monks (Getshul)</span>
          <p className="text-2xl font-bold text-[#D4AF37] mt-2 font-mono">
            {students.filter(s => s.monk_status === 'novice').length}
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-1">Junior Buddhist curriculum scholars</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Fully Ordained (Gelong)</span>
          <p className="text-2xl font-bold text-[#E11D48] mt-2 font-mono">
            {students.filter(s => s.monk_status === 'gelong').length}
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-1">Senior Vinaya practitioners</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Khenpos & Masters</span>
          <p className="text-2xl font-bold text-purple-400 mt-2 font-mono">
            {students.filter(s => s.monk_status === 'khenpo').length}
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-1">Shedra faculty and instructors</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl overflow-hidden shadow-xl">
        {/* Controls */}
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'novice', 'gelong', 'khenpo', 'lay_student'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  statusFilter === st
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] shadow'
                    : 'bg-white/5 text-[#94A3B8] hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search monk name, roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#090D16] text-[#94A3B8] font-bold uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3.5 px-5">Roll / Sangha No</th>
                <th className="py-3.5 px-4">Ordination Name</th>
                <th className="py-3.5 px-4">Secular Name</th>
                <th className="py-3.5 px-4">Monastic Rank</th>
                <th className="py-3.5 px-4">Active Courses</th>
                <th className="py-3.5 px-4">Guardian / Contact</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#94A3B8]">
                    No monk scholars found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#D4AF37]">
                      {s.roll_number}
                      {s.sangha_id && <div className="text-[10px] text-[#94A3B8]">{s.sangha_id}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{s.monastic_name}</td>
                    <td className="py-3.5 px-4 text-[#CBD5E1]">{s.secular_name || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        s.monk_status === 'khenpo' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
                        s.monk_status === 'gelong' ? 'bg-[#E11D48]/15 text-[#E11D48] border border-[#E11D48]/30' :
                        'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                      }`}>
                        {s.monk_status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {s.active_courses_count || 1} Courses
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">
                      <div>{s.guardian_name || 'Monastery Care'}</div>
                      <div className="text-[10px] font-mono">{s.guardian_phone || s.emergency_contact || '—'}</div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowEnrollModal(true);
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:opacity-90 text-[#090D16] font-bold text-xs rounded-lg transition-all"
                      >
                        Enroll Course
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Monk Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Users className="w-5 h-5" />
                </span>
                <h3 className="font-serif-brand font-bold text-base text-white">Register Monk Scholar</h3>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-mono font-bold focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Sangha ID *</label>
                  <input
                    type="text"
                    required
                    value={sanghaId}
                    onChange={(e) => setSanghaId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Monastic Ordination Name *</label>
                  <input
                    type="text"
                    required
                    value={monasticName}
                    onChange={(e) => setMonasticName(e.target.value)}
                    placeholder="e.g. Tenzin Norbu"
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Secular / Civil Name</label>
                  <input
                    type="text"
                    value={secularName}
                    onChange={(e) => setSecularName(e.target.value)}
                    placeholder="e.g. Norbu Wangchuk"
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Monastic Status</label>
                  <select
                    value={monkStatus}
                    onChange={(e) => setMonkStatus(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="novice">Novice (Getshul)</option>
                    <option value="gelong">Fully Ordained (Gelong)</option>
                    <option value="khenpo">Khenpo (Professor)</option>
                    <option value="lay_student">Lay Student</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Father/Mother/Uncle"
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Guardian Phone</label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+975 17..."
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Origin Dzongkhag / Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
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
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] font-bold rounded-xl shadow-lg transition-all"
                >
                  Register Scholar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Enroll Modal */}
      {showEnrollModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif-brand font-bold text-base text-white">Enroll in Course</h3>
              <button type="button" onClick={() => setShowEnrollModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Enroll <strong className="text-white">{selectedStudent.monastic_name || selectedStudent.secular_name}</strong> ({selectedStudent.roll_number}) into:
            </p>

            <form onSubmit={handleQuickEnroll} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Select Shedra Course *</label>
                <select
                  value={enrollCourseId}
                  onChange={(e) => setEnrollCourseId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] font-bold rounded-xl shadow-lg"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
