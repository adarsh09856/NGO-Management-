import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Award, CheckCircle2, Clock, 
  Calendar, Flame, Sparkles, ArrowRight, Download, 
  CheckSquare, BarChart2, ShieldCheck, User
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function StudentDashboard() {
  const { error } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await api.get('/student/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
        error(err.response?.data?.message || 'Failed to load monastic dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#94A3B8]">Loading your sacred Shedra scholar records...</p>
        </div>
      </div>
    );
  }

  const { student, enrolledCourses = [], certificates = [], attendancePercent = 96 } = data || {};

  return (
    <div className="space-y-6">
      {/* 1. Scholar Identity & Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B0F19] via-[#0F172A] to-[#16060B] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border border-[#2A1E17] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase tracking-wider">
              {student?.monk_status?.toUpperCase() || 'NOVICE SCHOLAR'}
            </span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-white/5 text-[#CBD5E1] border border-white/10">
              ROLL: {student?.roll_number || 'MNK-2026-001'}
            </span>
            {student?.sangha_id && (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#E11D48]/15 text-[#E11D48] border border-[#E11D48]/30">
                SANGHA: {student.sangha_id}
              </span>
            )}
          </div>

          <h1 className="font-serif-brand font-bold text-2xl sm:text-3xl text-white leading-tight">
            Tashi Delek, Venerable {student?.monastic_name || 'Scholar'}
          </h1>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Welcome to your digital Shedra academic console. Cultivate wisdom, study sacred Buddhist treatises, track attendance marks, and download official credentials.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/student/courses"
            className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Shedra Curriculum</span>
          </Link>
        </div>
      </div>

      {/* 2. Academic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Enrolled Courses</span>
            <span className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{enrolledCourses.length}</p>
          <p className="text-[11px] text-emerald-400 mt-1">
            {enrolledCourses.filter(c => c.status === 'in_progress').length} Currently in study
          </p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Academic Attendance</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{attendancePercent}%</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">Classroom & morning puja roll</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Conferred Certificates</span>
            <span className="p-2 rounded-lg bg-[#E11D48]/10 text-[#E11D48]">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{certificates.length}</p>
          <p className="text-[11px] text-[#D4AF37] mt-1">Official verified credentials</p>
        </div>

        <div className="bg-[#0D121F] border border-white/5 rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Monastic Academic Standing</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-bold text-white mt-2">Distinction Honor</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">Shedra Examination Council</p>
        </div>
      </div>

      {/* 3. In-Progress Courses & Schedule Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: In Progress Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif-brand font-bold text-base text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
              <span>Active Shedra Courses & Syllabus Progress</span>
            </h2>
            <Link to="/student/courses" className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl p-8 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
              <p className="text-xs text-[#94A3B8]">You have not yet enrolled in any Shedra courses.</p>
              <Link
                to="/student/courses"
                className="inline-block px-4 py-2 rounded-xl bg-[#D4AF37] text-[#090D16] font-bold text-xs uppercase"
              >
                Browse Shedra Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {enrolledCourses.map((c) => (
                <div 
                  key={c.id} 
                  className="bg-[#0D121F] border border-[#2A1E17] hover:border-[#D4AF37]/40 rounded-2xl p-5 space-y-3.5 shadow-xl transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2 py-0.5 rounded">
                          {c.course_code}
                        </span>
                        <span className="text-[10px] font-bold text-[#94A3B8] uppercase">{c.level}</span>
                      </div>
                      <h3 className="font-serif-brand font-bold text-base text-white mt-1">{c.course_title}</h3>
                      <p className="text-xs text-[#94A3B8]">{c.instructor_name}</p>
                    </div>

                    <Link
                      to={`/student/courses/${c.course_id}`}
                      className="px-4 py-2 bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#F43F5E] hover:to-[#E11D48] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all"
                    >
                      <span>Continue Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#94A3B8]">Curriculum Completion</span>
                      <span className="text-[#D4AF37] font-mono">{c.progress_percent || 0}%</span>
                    </div>
                    <div className="w-full bg-[#1E293B] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#D4AF37] to-[#E11D48] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, c.progress_percent || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Monastic Daily Routine & Certificates */}
        <div className="space-y-5">
          {/* Daily Schedule */}
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-serif-brand font-bold text-sm text-white">
                Daily Monastic Study Routine
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-white font-semibold">Morning Chanting & Meditation</span>
                </div>
                <span className="text-[#94A3B8] font-mono text-[11px]">05:30 AM</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                  <span className="text-white font-semibold">Buddhist Philosophy Lecture</span>
                </div>
                <span className="text-[#94A3B8] font-mono text-[11px]">08:30 AM</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span className="text-white font-semibold">Tibetan Grammar & Script</span>
                </div>
                <span className="text-[#94A3B8] font-mono text-[11px]">11:00 AM</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E11D48]"></span>
                  <span className="text-white font-semibold">Monastic Debate (Tsod-pa)</span>
                </div>
                <span className="text-[#94A3B8] font-mono text-[11px]">02:00 PM</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span className="text-white font-semibold">Evening Mahakala & Tara Puja</span>
                </div>
                <span className="text-[#94A3B8] font-mono text-[11px]">06:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Certificates Widget */}
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#E11D48]" />
                <h3 className="font-serif-brand font-bold text-sm text-white">
                  Earned Credentials
                </h3>
              </div>
              <Link to="/student/certificates" className="text-xs text-[#D4AF37] font-bold hover:underline">
                View All
              </Link>
            </div>

            {certificates.length === 0 ? (
              <p className="text-xs text-[#94A3B8] text-center py-4">
                Complete your courses to earn official Shedra ordination & graduation credentials.
              </p>
            ) : (
              <div className="space-y-2.5">
                {certificates.slice(0, 2).map((cert) => (
                  <div key={cert.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold text-[#D4AF37]">{cert.certificate_number}</span>
                      <span className="text-[9px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {cert.grade || 'Distinction'}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white">{cert.course_title}</div>
                    <a
                      href={`/api/certificates/${cert.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] hover:underline pt-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download PDF Certificate</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
