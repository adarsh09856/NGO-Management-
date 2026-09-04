import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, BookOpen, Users, Award, Plus, 
  CheckCircle2, Download, Edit2, Layers, Search, 
  Filter, Calendar, Clock, X, UserPlus, FilePlus
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function LMSOverview() {
  const { success, error } = useToast();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    courseCode: `CRS-10${Math.floor(Math.random() * 90 + 10)}`,
    title: '',
    level: 'Basic',
    durationMonths: 6,
    totalCredits: 12,
    instructorName: 'Khenpo Tashi Dorji',
    feeAmount: 0,
    syllabus: '',
    description: ''
  });

  // New Batch Form State
  const [newBatch, setNewBatch] = useState({
    courseId: '',
    batchName: '',
    batchCode: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    capacity: 35
  });

  // New Enrollment Form State
  const [newEnrollment, setNewEnrollment] = useState({
    studentId: '',
    courseId: '',
    batchId: ''
  });

  // Update Progress Form State
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [progressVal, setProgressVal] = useState(50);
  const [attendanceVal, setAttendanceVal] = useState(95);
  const [statusVal, setStatusVal] = useState('in_progress');
  const [gradeVal, setGradeVal] = useState('Distinction');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, bRes, eRes, sRes] = await Promise.all([
        api.get('/lms/courses'),
        api.get('/lms/batches'),
        api.get('/lms/enrollments'),
        api.get('/lms/students')
      ]);
      if (cRes.data.success) {
        setCourses(cRes.data.data || []);
        if (cRes.data.data?.length > 0) {
          setNewBatch(prev => ({ ...prev, courseId: String(cRes.data.data[0].id) }));
          setNewEnrollment(prev => ({ ...prev, courseId: String(cRes.data.data[0].id) }));
        }
      }
      if (bRes.data.success) setBatches(bRes.data.data || []);
      if (eRes.data.success) setEnrollments(eRes.data.data || []);
      if (sRes.data.success) {
        setStudents(sRes.data.data || []);
        if (sRes.data.data?.length > 0) {
          setNewEnrollment(prev => ({ ...prev, studentId: String(sRes.data.data[0].id) }));
        }
      }
    } catch (err) {
      console.error('LMS load error:', err);
      error('Failed to load LMS data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/lms/courses', newCourse);
      if (res.data.success) {
        success('New Shedra course created successfully!');
        setShowCourseModal(false);
        setNewCourse({
          courseCode: `CRS-10${Math.floor(Math.random() * 90 + 10)}`,
          title: '',
          level: 'Basic',
          durationMonths: 6,
          totalCredits: 12,
          instructorName: 'Khenpo Tashi Dorji',
          feeAmount: 0,
          syllabus: '',
          description: ''
        });
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/lms/batches', {
        ...newBatch,
        courseId: parseInt(newBatch.courseId, 10),
        capacity: parseInt(newBatch.capacity, 10)
      });
      if (res.data.success) {
        success('New Shedra batch established!');
        setShowBatchModal(false);
        setNewBatch({
          courseId: courses[0]?.id ? String(courses[0].id) : '',
          batchName: '',
          batchCode: '',
          startDate: new Date().toISOString().slice(0, 10),
          endDate: '',
          capacity: 35
        });
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create batch');
    }
  };

  const handleEnrollScholar = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/lms/enrollments', {
        studentId: parseInt(newEnrollment.studentId, 10),
        courseId: parseInt(newEnrollment.courseId, 10),
        batchId: newEnrollment.batchId ? parseInt(newEnrollment.batchId, 10) : null
      });
      if (res.data.success) {
        success('Monk scholar enrolled into Shedra course!');
        setShowEnrollModal(false);
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleOpenProgressModal = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setProgressVal(enrollment.progress_percent || 0);
    setAttendanceVal(enrollment.attendance_percent || 95);
    setStatusVal(enrollment.status || 'in_progress');
    setGradeVal(enrollment.grade || 'Distinction');
    setShowProgressModal(true);
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    try {
      const res = await api.put(`/lms/enrollments/${selectedEnrollment.id}/progress`, {
        progressPercent: parseInt(progressVal, 10),
        attendancePercent: parseInt(attendanceVal, 10),
        status: statusVal,
        grade: gradeVal
      });

      if (res.data.success) {
        success(res.data.message);
        setShowProgressModal(false);
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update progress');
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesLevel = levelFilter === 'all' || c.level === levelFilter;
    const matchesSearch = !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.course_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const totalEnrolledScholars = enrollments.length;
  const completedScholars = enrollments.filter(e => e.status === 'completed').length;
  const certificatesIssued = enrollments.filter(e => e.certificate_id).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#090D16] border border-[#2A1E17] p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
            </span>
            <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-white">
              Shedra Monastic Academy & LMS Administration
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Manage Buddhist philosophy curriculum, scholar batch enrollments, academic grades, and automated ordination certificates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCourseModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBatchModal(true)}
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-white/10 transition-all"
          >
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <span>Create Batch</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEnrollModal(true)}
            className="px-4 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Scholar</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Active Shedra Courses</span>
            <span className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{courses.length}</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">{batches.length} Ongoing Study Batches</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Total Enrolled Scholars</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{totalEnrolledScholars}</p>
          <p className="text-[11px] text-blue-400 mt-1">Across all monastic years</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Completed Graduations</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{completedScholars}</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            {totalEnrolledScholars > 0 ? Math.round((completedScholars / totalEnrolledScholars) * 100) : 0}% completion rate
          </p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Certificates Conferred</span>
            <span className="p-2 rounded-lg bg-[#E11D48]/10 text-[#E11D48]">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-[#E11D48] mt-2 font-mono">{certificatesIssued}</p>
          <p className="text-[11px] text-[#D4AF37] mt-1">Ecclesiastical seal & signed PDF</p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="font-serif-brand font-bold text-base text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            <span>Monastic Curriculum Catalog</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-semibold focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="Basic">Basic</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Shedra Master">Shedra Master</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCourses.map((c) => (
            <div key={c.id} className="bg-[#0D121F] border border-[#2A1E17] hover:border-[#D4AF37]/40 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-xl transition-all">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded">
                    {c.course_code}
                  </span>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">{c.level}</span>
                </div>
                <h3 className="font-serif-brand font-bold text-sm text-white mt-2 leading-snug">{c.title}</h3>
                <p className="text-[11px] text-[#94A3B8] line-clamp-2 mt-1.5 leading-relaxed">{c.description}</p>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-1.5 text-xs text-[#94A3B8]">
                <div className="flex justify-between items-center">
                  <span>Enrolled:</span>
                  <span className="text-emerald-400 font-mono font-bold">{c.enrolled_count || 0} Scholars</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Instructor:</span>
                  <span className="text-white font-semibold truncate max-w-[130px]">{c.instructor_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monastic Scholars Enrollment Register */}
      <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-serif-brand font-bold text-base text-white">
              Scholar Course Enrollments & Progress Register
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Live monitoring of monk scholars, syllabus progress, and auto-issued credentials.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search scholar or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#090D16] text-[#94A3B8] font-bold uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3.5 px-5">Scholar Monk</th>
                <th className="py-3.5 px-4">Roll / Sangha ID</th>
                <th className="py-3.5 px-4">Course Program</th>
                <th className="py-3.5 px-4">Progress</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Certificate</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#94A3B8]">
                    No scholar enrollments found. Click "Enroll Scholar" to register a monk.
                  </td>
                </tr>
              ) : (
                enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-white">{e.monastic_name || e.secular_name}</div>
                      <div className="text-[10px] text-[#94A3B8]">{e.secular_name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#D4AF37]">{e.roll_number}</td>
                    <td className="py-3.5 px-4 text-[#CBD5E1] font-semibold">{e.course_title}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-[#1E293B] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#D4AF37] to-[#E11D48] h-2 rounded-full"
                            style={{ width: `${e.progress_percent || 0}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-white">{e.progress_percent || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        e.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {e.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {e.certificate_id ? (
                        <a
                          href={`/api/certificates/${e.certificate_id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-1 rounded hover:bg-[#D4AF37]/20 transition-all"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="text-[#94A3B8] text-[10px]">Pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenProgressModal(e)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 flex items-center gap-1 ml-auto transition-all"
                      >
                        <Edit2 className="w-3 h-3 text-[#D4AF37]" />
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <BookOpen className="w-5 h-5" />
                </span>
                <h3 className="font-serif-brand font-bold text-base text-white">Create Shedra Course</h3>
              </div>
              <button type="button" onClick={() => setShowCourseModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={newCourse.courseCode}
                    onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-mono font-bold focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Academic Level</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Shedra Master">Shedra Master</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="e.g. Madhyamaka Philosophy & Valid Cognition"
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    value={newCourse.durationMonths}
                    onChange={(e) => setNewCourse({ ...newCourse, durationMonths: parseInt(e.target.value, 10) || 6 })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Total Credits</label>
                  <input
                    type="number"
                    value={newCourse.totalCredits}
                    onChange={(e) => setNewCourse({ ...newCourse, totalCredits: parseInt(e.target.value, 10) || 12 })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Principal Instructor</label>
                <input
                  type="text"
                  value={newCourse.instructorName}
                  onChange={(e) => setNewCourse({ ...newCourse, instructorName: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Course Description</label>
                <textarea
                  rows="2"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Detailed overview of Shedra philosophical treatises covered..."
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Syllabus Modules (One line per module)</label>
                <textarea
                  rows="3"
                  value={newCourse.syllabus}
                  onChange={(e) => setNewCourse({ ...newCourse, syllabus: e.target.value })}
                  placeholder="1. Introduction to Abhidharma&#10;2. Dependent Origination Stanzas&#10;3. Madhyamaka Debate Essentials"
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] font-bold rounded-xl shadow-lg transition-all"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Layers className="w-5 h-5" />
                </span>
                <h3 className="font-serif-brand font-bold text-base text-white">Create Shedra Batch</h3>
              </div>
              <button type="button" onClick={() => setShowBatchModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Course Program *</label>
                <select
                  value={newBatch.courseId}
                  onChange={(e) => setNewBatch({ ...newBatch, courseId: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Batch Name *</label>
                <input
                  type="text"
                  required
                  value={newBatch.batchName}
                  onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
                  placeholder="e.g. Philosophy Monastic Batch Autumn 2026"
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Capacity (Monks)</label>
                  <input
                    type="number"
                    value={newBatch.capacity}
                    onChange={(e) => setNewBatch({ ...newBatch, capacity: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] font-bold rounded-xl shadow-lg transition-all"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Scholar Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#E11D48]/10 text-[#E11D48]">
                  <UserPlus className="w-5 h-5" />
                </span>
                <h3 className="font-serif-brand font-bold text-base text-white">Enroll Monk Scholar</h3>
              </div>
              <button type="button" onClick={() => setShowEnrollModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollScholar} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Select Monk Scholar *</label>
                <select
                  value={newEnrollment.studentId}
                  onChange={(e) => setNewEnrollment({ ...newEnrollment, studentId: e.target.value })}
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
                  value={newEnrollment.courseId}
                  onChange={(e) => setNewEnrollment({ ...newEnrollment, courseId: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#CBD5E1] mb-1">Select Batch (Optional)</label>
                <select
                  value={newEnrollment.batchId}
                  onChange={(e) => setNewEnrollment({ ...newEnrollment, batchId: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="">No Batch Assignment</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.batch_name} ({b.batch_code})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  Enroll Scholar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Progress & Grade Modal */}
      {showProgressModal && selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif-brand font-bold text-base text-white">
                Update Scholar Progress & Assessment
              </h3>
              <button type="button" onClick={() => setShowProgressModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-1">
              <div className="font-bold text-white">{selectedEnrollment.monastic_name || selectedEnrollment.secular_name}</div>
              <div className="text-[11px] text-[#94A3B8]">{selectedEnrollment.course_title}</div>
            </div>

            <form onSubmit={handleUpdateProgress} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="font-bold text-[#CBD5E1]">Curriculum Completion: {progressVal}%</label>
                  <span className="font-mono text-[#D4AF37]">{progressVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressVal}
                  onChange={(e) => setProgressVal(e.target.value)}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="font-bold text-[#CBD5E1]">Class Attendance: {attendanceVal}%</label>
                  <span className="font-mono text-emerald-400">{attendanceVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={attendanceVal}
                  onChange={(e) => setAttendanceVal(e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Academic Grade</label>
                  <select
                    value={gradeVal}
                    onChange={(e) => setGradeVal(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Distinction">Distinction</option>
                    <option value="First Division">First Division</option>
                    <option value="Second Division">Second Division</option>
                    <option value="Pass">Pass</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#CBD5E1] mb-1">Enrollment Status</label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#090D16] border border-white/10 text-white font-semibold focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed (Auto-Issue Cert)</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>
              </div>

              {statusVal === 'completed' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-400 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span>Marking as Completed will immediately generate an official certificate PDF.</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] font-bold rounded-xl shadow-lg transition-all"
                >
                  Save & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
