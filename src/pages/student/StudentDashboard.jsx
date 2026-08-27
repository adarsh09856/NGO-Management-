import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, CalendarCheck, CheckCircle2, Clock, Download, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await api.get('/student/my-dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-500">Loading Shedra enrollment records...</div>;

  const student = data?.student || {};
  const enrolledCourses = data?.enrolledCourses || [];
  const certificates = data?.certificates || [];

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#EBE5D8] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif-brand font-bold text-xl text-[#4A0E17]">
            Tashi Delek, {student.monastic_name || student.secular_name}!
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Roll / Sangha No: <strong className="font-mono text-[#4A0E17]">{student.roll_number || 'MNK-2026-001'}</strong> &nbsp;·&nbsp;
            Status: <span className="font-semibold text-emerald-700 capitalize">{student.monk_status || 'Novice Monk'}</span>
          </p>
        </div>
        <div className="bg-[#FDF6E2] text-[#4A0E17] px-4 py-2 rounded-lg border border-[#D4AF37] text-xs font-bold font-tibetan">
          ༄༅། །ཤེས་རབ་ཀྱི་ཕ་རོལ་ཏུ་ཕྱིན་པ།
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="monastery-card p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enrolled Courses</p>
          <h3 className="font-serif-brand font-bold text-2xl text-[#4A0E17] mt-1">
            {enrolledCourses.length}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">Active Shedra Curriculum</p>
        </div>

        <div className="monastery-card p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance Rate</p>
          <h3 className="font-serif-brand font-bold text-2xl text-emerald-700 mt-1">
            {data?.attendancePercent || 96}%
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Compliance
          </p>
        </div>

        <div className="monastery-card p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Certificates Earned</p>
          <h3 className="font-serif-brand font-bold text-2xl text-[#D4AF37] mt-1">
            {certificates.length}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">Official Monastic Awards</p>
        </div>

        <div className="monastery-card p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Outstanding Dues</p>
          <h3 className="font-serif-brand font-bold text-2xl text-gray-900 mt-1">
            ₹ 0.00
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Fully Sponsored / Paid</p>
        </div>
      </div>

      {/* Enrolled Courses Progress */}
      <div className="monastery-card p-6 space-y-4">
        <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
          Current Academic Courses & Learning Progress
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrolledCourses.map((e) => (
            <div key={e.id} className="p-4 rounded-lg border border-[#EBE5D8] bg-[#FDFBF7] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold bg-[#FDF6E2] text-[#4A0E17] border border-[#D4AF37] px-2 py-0.5 rounded">
                    {e.course_code}
                  </span>
                  <h4 className="font-serif-brand font-bold text-sm text-[#4A0E17] mt-1">{e.course_title}</h4>
                  <p className="text-[11px] text-gray-500">Instructor: {e.instructor_name || 'Khenpo Tashi Dorji'}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  e.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {e.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                  <span>Course Progress</span>
                  <span>{e.progress_percent || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#4A0E17] rounded-full transition-all duration-500"
                    style={{ width: `${e.progress_percent || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates Earned */}
      <div className="monastery-card p-6 space-y-4">
        <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
          Monastic Certificates of Completion
        </h3>

        {certificates.length === 0 ? (
          <p className="text-xs text-gray-500">No certificates issued yet. Complete courses to earn official certificates.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificates.map((c) => (
              <div key={c.id} className="p-4 rounded-lg border-2 border-[#D4AF37] bg-white shadow-sm flex justify-between items-center">
                <div>
                  <h4 className="font-serif-brand font-bold text-xs text-[#4A0E17]">{c.course_title}</h4>
                  <p className="text-[11px] font-mono text-gray-500">{c.certificate_number}</p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">Grade: {c.grade || 'Distinction'}</p>
                </div>
                <a
                  href={`/api/certificates/${c.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 bg-[#4A0E17] hover:bg-[#5A121E] text-white px-3 py-1.5 rounded text-xs font-bold shadow transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>PDF</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
