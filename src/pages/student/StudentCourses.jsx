import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Clock, Award, Users, CheckCircle2, 
  ArrowRight, Search, Filter, PlusCircle, Check
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function StudentCourses() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' | 'catalog'
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [enrollingId, setEnrollingId] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/courses');
      if (res.data.success) {
        setEnrolledCourses(res.data.data.enrolledCourses || []);
        setAvailableCourses(res.data.data.availableCourses || []);
      }
    } catch (err) {
      console.error('Failed to load student courses:', err);
      error(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      const res = await api.post('/student/enroll', { courseId });
      if (res.data.success) {
        success('Successfully enrolled in Shedra course!');
        fetchCourses();
        setActiveTab('enrolled');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrollingId(null);
    }
  };

  const isAlreadyEnrolled = (courseId) => {
    return enrolledCourses.some(e => e.course_id === courseId);
  };

  const filteredCatalog = availableCourses.filter(c => {
    const matchesLevel = levelFilter === 'all' || c.level === levelFilter;
    const matchesSearch = !searchQuery || 
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.course_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#090D16] border border-[#2A1E17] p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            </span>
            <h1 className="font-serif-brand font-bold text-xl sm:text-2xl text-white">
              Shedra Monastic Curriculum & Courses
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Access sacred root texts, commentary treatises, debate guidelines, and lecture syllabi.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#0D121F] p-1 rounded-xl border border-white/10 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('enrolled')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'enrolled'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] shadow'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            My Enrolled ({enrolledCourses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'catalog'
                ? 'bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white shadow'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Shedra Catalog ({availableCourses.length})
          </button>
        </div>
      </div>

      {activeTab === 'enrolled' ? (
        /* ENROLLED VIEW */
        <div className="space-y-4">
          {enrolledCourses.length === 0 ? (
            <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl p-12 text-center space-y-4 shadow-xl">
              <BookOpen className="w-12 h-12 text-[#94A3B8] mx-auto opacity-40" />
              <div className="space-y-1">
                <h3 className="font-serif-brand font-bold text-lg text-white">No Active Course Enrollments</h3>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                  You are not currently enrolled in any Shedra academic courses. Browse the curriculum catalog and begin your study.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#090D16] font-bold text-xs uppercase tracking-wider shadow-lg"
              >
                Browse Shedra Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((c) => (
                <div 
                  key={c.id} 
                  className="bg-[#0D121F] border border-[#2A1E17] hover:border-[#D4AF37]/40 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                        {c.course_code}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {c.status?.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif-brand font-bold text-base text-white">{c.course_title}</h3>
                      <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{c.description || 'Sacred monastic study.'}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#94A3B8] pt-2 border-t border-white/5">
                      <div className="flex justify-between">
                        <span>Instructor:</span>
                        <span className="font-semibold text-white">{c.instructor_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="text-white font-mono">{c.duration_months} Months ({c.total_credits} Credits)</span>
                      </div>
                      {c.batch_name && (
                        <div className="flex justify-between">
                          <span>Batch:</span>
                          <span className="text-[#D4AF37]">{c.batch_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-white/5">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-[#94A3B8]">Curriculum Mastery</span>
                        <span className="text-[#D4AF37] font-mono">{c.progress_percent || 0}%</span>
                      </div>
                      <div className="w-full bg-[#1E293B] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#D4AF37] to-[#E11D48] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, c.progress_percent || 0)}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      to={`/student/courses/${c.course_id}`}
                      className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Study Course Syllabus</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* CATALOG VIEW */
        <div className="space-y-5">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#0D121F] border border-[#2A1E17] p-4 rounded-xl shadow-lg">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search course title, instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-semibold focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="all">All Academic Levels</option>
                <option value="Basic">Basic</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Shedra Master">Shedra Master</option>
              </select>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map((c) => {
              const enrolled = isAlreadyEnrolled(c.id);
              const isEnrolling = enrollingId === c.id;

              return (
                <div 
                  key={c.id} 
                  className="bg-[#0D121F] border border-[#2A1E17] hover:border-[#D4AF37]/40 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                        {c.course_code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-[#CBD5E1] border border-white/10">
                        {c.level}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif-brand font-bold text-base text-white">{c.title}</h3>
                      <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed line-clamp-3">
                        {c.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#94A3B8] pt-2 border-t border-white/5">
                      <div className="flex justify-between">
                        <span>Instructor:</span>
                        <span className="font-semibold text-white">{c.instructor_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="text-white font-mono">{c.duration_months} Months ({c.total_credits} Credits)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scholars Enrolled:</span>
                        <span className="text-emerald-400 font-mono font-bold">{c.total_enrolled || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5">
                    {enrolled ? (
                      <Link
                        to={`/student/courses/${c.id}`}
                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 border border-white/10 transition-all"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Enrolled • Continue Study</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={isEnrolling}
                        onClick={() => handleEnroll(c.id)}
                        className="w-full py-2.5 bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#F43F5E] hover:to-[#E11D48] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>{isEnrolling ? 'Enrolling...' : 'Enroll in Course'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
