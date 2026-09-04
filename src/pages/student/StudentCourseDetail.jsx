import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, CheckCircle2, Clock, Award, ArrowLeft, 
  ChevronRight, Play, Check, Volume2, Download, 
  Sparkles, ShieldCheck, Flame, BookCheck
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function StudentCourseDetail() {
  const { id } = useParams();
  const { success, error } = useToast();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [updating, setUpdating] = useState(false);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/student/courses/${id}`);
      if (res.data.success) {
        setCourseData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load course detail:', err);
      error(err.response?.data?.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleCompleteLesson = async () => {
    if (!courseData || !courseData.enrollment) {
      error('You must be enrolled in this course to save progress');
      return;
    }

    try {
      setUpdating(true);
      const totalLessons = courseData.lessons?.length || 4;
      const res = await api.post(`/student/courses/${id}/progress`, {
        lessonId: activeLessonIndex + 1,
        totalLessons
      });

      if (res.data.success) {
        success(res.data.message);
        fetchCourse();
        // Advance to next lesson if available
        if (activeLessonIndex < totalLessons - 1) {
          setActiveLessonIndex(prev => prev + 1);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update lesson progress');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#94A3B8]">Loading sacred scriptures and Shedra lesson modules...</p>
        </div>
      </div>
    );
  }

  if (!courseData || !courseData.course) {
    return (
      <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl p-12 text-center space-y-4 shadow-xl">
        <p className="text-sm text-red-400">Course not found or unavailable.</p>
        <Link to="/student/courses" className="inline-block px-4 py-2 bg-[#D4AF37] text-[#090D16] font-bold text-xs rounded-xl">
          Back to Courses
        </Link>
      </div>
    );
  }

  const { course, enrollment, lessons = [] } = courseData;
  const activeLesson = lessons[activeLessonIndex] || lessons[0];
  const progress = enrollment?.progress_percent || 0;
  const isCompleted = enrollment?.status === 'completed' || progress >= 100;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#090D16] border border-[#2A1E17] p-5 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <Link
            to="/student/courses"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white transition-all border border-white/10"
            title="Back to Course List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                {course.course_code}
              </span>
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase">{course.level}</span>
            </div>
            <h1 className="font-serif-brand font-bold text-lg sm:text-xl text-white mt-1">
              {course.title}
            </h1>
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-bold">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>Course Completed • Certificate Awarded</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Syllabus Sidebar, Right Lesson Study Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Course Modules List (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Progress Card */}
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Overall Progress</span>
                <div className="text-2xl font-bold text-white font-mono mt-1">{progress}%</div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                isCompleted 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
              }`}>
                {enrollment ? enrollment.status?.replace('_', ' ') : 'Not Enrolled'}
              </span>
            </div>

            <div className="w-full bg-[#1E293B] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#D4AF37] to-[#E11D48] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, progress)}%` }}
              ></div>
            </div>

            <div className="space-y-1 text-xs text-[#94A3B8] pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span>Principal Instructor:</span>
                <span className="text-white font-semibold">{course.instructor_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Credits:</span>
                <span className="text-white font-mono">{course.total_credits} Credits</span>
              </div>
            </div>

            {isCompleted && enrollment?.cert_id && (
              <a
                href={`/api/certificates/${enrollment.cert_id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:opacity-90 text-[#090D16] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Shedra Certificate</span>
              </a>
            )}
          </div>

          {/* Syllabus Modules Checklist */}
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-serif-brand font-bold text-sm text-white flex items-center gap-2">
                <BookCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Syllabus Modules</span>
              </h3>
              <span className="text-[11px] text-[#94A3B8] font-mono">{lessons.length} Modules</span>
            </div>

            <div className="divide-y divide-white/5">
              {lessons.map((lesson, idx) => {
                const isActive = activeLessonIndex === idx;
                const isLessonDone = progress >= ((idx + 1) / lessons.length) * 100;

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setActiveLessonIndex(idx)}
                    className={`w-full text-left p-4 flex items-start justify-between gap-3 transition-all ${
                      isActive 
                        ? 'bg-[#D4AF37]/10 border-l-4 border-l-[#D4AF37]' 
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#94A3B8]">Module 0{idx + 1}</span>
                        {isLessonDone && (
                          <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Done
                          </span>
                        )}
                      </div>
                      <div className={`text-xs font-bold truncate ${isActive ? 'text-[#D4AF37]' : 'text-white'}`}>
                        {lesson.title}
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? 'text-[#D4AF37] translate-x-1' : 'text-gray-500'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Lesson Player & Commentary (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#0D121F] border border-[#2A1E17] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Lesson Title & Header */}
            <div className="border-b border-white/5 pb-5 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">
                  Module {activeLessonIndex + 1} of {lessons.length}
                </span>
                <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{activeLesson?.estimatedMinutes || 45} mins required</span>
                </span>
              </div>

              <h2 className="font-serif-brand font-bold text-xl sm:text-2xl text-white">
                {activeLesson?.title}
              </h2>
            </div>

            {/* Sacred Tibetan Transliteration Section */}
            <div className="bg-[#090D16] border border-[#D4AF37]/20 rounded-xl p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Sacred Root Stanza (Tibetan Liturgy)</span>
              </div>

              <div className="font-serif text-sm sm:text-base text-[#FEF3C7] leading-relaxed italic">
                « ཆོས་ཉིད་རང་བཞིན་རྣམ་དག་ལ། ། གཟུང་འཛིན་འཁྲུལ་པའི་དྲི་མ་བྲལ། ། མཉམ་ཉིད་ཡེ་ཤེས་དབྱིངས་སུ་གཤེགས། ། བླ་མ་རྗེ་ལ་ཕྱག་འཚལ་ལོ། ། »
              </div>
              <p className="text-[11px] text-[#94A3B8] italic font-mono">
                "In the pure pristine nature of dharmata, free from dualistic grasping; resting in the primordial expanse of equanimity, to the sacred Guru we prostrate."
              </p>
            </div>

            {/* Audio Lecture Simulation */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E11D48]/20 border border-[#E11D48]/30 flex items-center justify-center text-[#E11D48]">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Khenpo Chanting & Lecture Audio</div>
                  <div className="text-[10px] text-[#94A3B8]">Recorded at Great Druk Wangyel Shrine Hall</div>
                </div>
              </div>

              <button
                type="button"
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all"
                onClick={() => success('Playing sacred audio transmission...')}
              >
                <Play className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                <span>Listen Audio</span>
              </button>
            </div>

            {/* In-Depth Study Commentary */}
            <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              <h4 className="font-serif-brand font-bold text-base text-white">
                Philosophical Exposition & Contemplative Notes
              </h4>

              <p>
                {activeLesson?.content || 'This chapter introduces the fundamental concepts of Buddhist epistemology and valid cognition (Pramana). Students are instructed to analyze the difference between conventional truth and ultimate truth.'}
              </p>

              <div className="bg-[#090D16] p-4 rounded-xl border border-white/5 space-y-2">
                <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                  Four Key Points for Monastic Debate (Tsod-pa):
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-[#94A3B8]">
                  <li>The definition and characteristics of self-cognizing awareness (Rang-rig).</li>
                  <li>Refutation of external inherently-existing entities under Madhyamaka logic.</li>
                  <li>How compassion and Bodhicitta arise non-dually from the realization of emptiness.</li>
                  <li>Contemplative application during Shamatha session upon completion of reading.</li>
                </ul>
              </div>
            </div>

            {/* Action Footer: Mark Completed */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-[#94A3B8]">
                {isCompleted ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> You have mastered all modules in this course!
                  </span>
                ) : (
                  <span>Click below once you have recited and analyzed this lesson module.</span>
                )}
              </div>

              <button
                type="button"
                disabled={updating || isCompleted}
                onClick={handleCompleteLesson}
                className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFB83E] hover:to-[#C29E30] text-[#090D16] hover:shadow-[#D4AF37]/20 hover:scale-105'
                }`}
              >
                {updating ? (
                  <span>Recording Mastery...</span>
                ) : isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Curriculum Completed</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Mark Lesson Completed (+{Math.round(100 / Math.max(1, lessons.length))}%)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
