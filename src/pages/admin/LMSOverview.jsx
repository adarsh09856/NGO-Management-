import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Users, Award, Plus, CheckCircle2, Download, Edit2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function LMSOverview() {
  const { success, error } = useToast();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Update Progress Modal
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [progressVal, setProgressVal] = useState(50);
  const [statusVal, setStatusVal] = useState('in_progress');
  const [gradeVal, setGradeVal] = useState('Distinction');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, eRes] = await Promise.all([
        api.get('/lms/courses'),
        api.get('/lms/enrollments')
      ]);
      if (cRes.data.success) setCourses(cRes.data.data);
      if (eRes.data.success) setEnrollments(eRes.data.data);
    } catch (err) {
      console.error('LMS load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    try {
      const res = await api.put(`/lms/enrollments/${selectedEnrollment.id}/progress`, {
        progressPercent: progressVal,
        status: statusVal,
        grade: gradeVal
      });

      if (res.data.success) {
        success(res.data.message);
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update progress');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-[#0F172A]">
            Training & LMS (Monastic Academy)
          </h1>
          <p className="text-xs text-gray-500">
            Manage Shedra curriculum, monk scholar enrollments, and certificate auto-issuance.
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {courses.map((c) => (
          <div key={c.id} className="monastery-card p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold bg-[#FEF3C7] text-[#0F172A] border border-[#D4AF37] px-2 py-0.5 rounded font-mono">
                  {c.course_code}
                </span>
                <span className="text-[10px] font-bold text-gray-500">{c.level}</span>
              </div>
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] mt-1.5">{c.title}</h3>
              <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{c.description}</p>
            </div>

            <div className="pt-2 border-t flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-700">{c.enrolled_count || 0} Monks Enrolled</span>
              <span className="font-bold text-emerald-700">{c.instructor_name?.split(',')[0]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Monastic Scholars Enrollment Table */}
      <div className="monastery-card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center">
          <h3 className="font-serif-brand font-bold text-sm text-[#0F172A]">
            Student Monk Enrollments & Progress Tracking
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F5F9] text-gray-700 font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Scholar Name</th>
                <th className="py-3 px-4">Roll / Sangha No</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Certificate</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{e.monastic_name || e.secular_name}</td>
                  <td className="py-3 px-4 font-mono text-gray-600">{e.roll_number}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{e.course_title}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0F172A] h-2 rounded-full" style={{ width: `${e.progress_percent || 0}%` }}></div>
                      </div>
                      <span className="font-mono text-[11px] font-bold">{e.progress_percent || 0}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      e.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {e.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {e.certificate_id ? (
                      <a
                        href={`/api/certificates/${e.certificate_id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 text-[10px]">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedEnrollment(e);
                        setProgressVal(e.progress_percent || 0);
                        setStatusVal(e.status);
                        setGradeVal(e.grade || 'Distinction');
                        setModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-[#FAF5F0] hover:bg-[#FEF3C7] text-[#0F172A] border border-[#D4AF37] rounded text-[11px] font-bold"
                    >
                      Update Progress
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress & Certificate Trigger Modal */}
      {modalOpen && selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl border p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
              Update Enrollment Progress
            </h3>
            <p className="text-xs text-gray-500">
              Scholar: <strong>{selectedEnrollment.monastic_name}</strong> · Course: <strong>{selectedEnrollment.course_title}</strong>
            </p>

            <form onSubmit={handleUpdateProgress} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Progress Percentage ({progressVal}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressVal}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setProgressVal(val);
                    if (val >= 100) setStatusVal('completed');
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Completion Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed (Auto-Issues Certificate)</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Grade Awarded</label>
                <select
                  value={gradeVal}
                  onChange={(e) => setGradeVal(e.target.value)}
                  className="w-full p-2.5 rounded border border-gray-300 bg-white font-semibold"
                >
                  <option value="Distinction with High Honors">Distinction with High Honors</option>
                  <option value="Distinction">Distinction</option>
                  <option value="First Class">First Class</option>
                  <option value="Pass">Pass</option>
                </select>
              </div>

              {statusVal === 'completed' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Marking completed will automatically generate a formal PDF Certificate of Completion!</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 bg-gray-100 rounded text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded font-bold shadow"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
