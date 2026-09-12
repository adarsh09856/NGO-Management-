import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Award, BookOpen, Search, CheckCircle2, XCircle,
  ShieldCheck, ArrowRight, UserCheck, Calendar, Clock, Sparkles,
  ExternalLink, Send, ChevronDown, ChevronUp, FileText, Landmark
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function Shedra() {
  const { success, error } = useToast();

  // State
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);

  // Certificate Verification Tool
  const [certQuery, setCertQuery] = useState('');
  const [certResult, setCertResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [certError, setCertError] = useState(null);

  // Academic Inquiry Form
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  // Load public Shedra courses created in Admin LMS
  useEffect(() => {
    async function fetchPublicCourses() {
      try {
        setLoadingCourses(true);
        const res = await api.get('/courses/public');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setCourses(res.data.data);
        }
      } catch (err) {
        console.warn('Unable to load courses from API, using fallback:', err.message);
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchPublicCourses();
  }, []);

  // Handle Certificate Verification
  const handleVerifyCertificate = async (e) => {
    e?.preventDefault();
    if (!certQuery.trim()) {
      error('Please enter a certificate number to verify.');
      return;
    }

    try {
      setVerifying(true);
      setCertError(null);
      setCertResult(null);

      const cleanQuery = certQuery.trim().toUpperCase();
      const res = await api.get(`/certificates/verify/${encodeURIComponent(cleanQuery)}`);

      if (res.data?.success && res.data.data) {
        setCertResult(res.data.data);
        success('Certificate verified with monastic seal.');
      } else {
        setCertError('Certificate not found in official monastic registry.');
      }
    } catch (err) {
      setCertError(err.response?.data?.message || 'Certificate not found or verification error.');
    } finally {
      setVerifying(false);
    }
  };

  // Handle Study / Admission Inquiry
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) {
      error('Please complete all required fields.');
      return;
    }

    try {
      setInquirySubmitting(true);
      await api.post('/contacts', {
        fullName: inquiryName.trim(),
        email: inquiryEmail.trim().toLowerCase(),
        phone: inquiryPhone.trim() || null,
        subject: 'Shedra Monastic Academy Academic Inquiry',
        message: inquiryMessage.trim(),
        source: 'shedra_portal'
      });

      success('Tashi Delek! Your inquiry has been transmitted to the Monastic Academic Board.');
      setInquiryName('');
      setInquiryEmail('');
      setInquiryPhone('');
      setInquiryMessage('');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setInquirySubmitting(false);
    }
  };

  // Fallback courses if DB empty
  const displayCourses = courses.length > 0 ? courses : [
    {
      id: 1,
      title: 'Madhyamaka: The Philosophy of the Middle Way',
      code: 'SHED-101',
      level: 'Advanced',
      credits: 24,
      duration_months: 12,
      description: 'Comprehensive study of Chandrakirti’s Madhyamakavatara and Nagarjuna’s fundamental wisdom on emptiness, non-duality, and dependent origination.'
    },
    {
      id: 2,
      title: 'Prajnaparamita: Perfection of Sublime Wisdom',
      code: 'SHED-102',
      level: 'Masters',
      credits: 30,
      duration_months: 24,
      description: 'In-depth analysis of the Abhisamayalankara (Ornament of Realization), detailing the 5 paths, 10 Bodhisattva grounds, and omniscience.'
    },
    {
      id: 3,
      title: 'Pramana: Buddhist Epistemology & Formal Logic',
      code: 'SHED-103',
      level: 'Intermediate',
      credits: 18,
      duration_months: 12,
      description: 'Rigorous debate and formal logic based on Dharmakirti’s Pramanavartika, mastering valid cognition, syllogisms, and perception.'
    },
    {
      id: 4,
      title: 'Vinaya: Monastic Discipline & Ethics',
      code: 'SHED-104',
      level: 'Foundational',
      credits: 16,
      duration_months: 12,
      description: 'Systematic instruction on the Pratimoksha vows, community concord, and ethical conduct preserved from ancient Nalanda masters.'
    }
  ];

  return (
    <div className="py-8 sm:py-14 px-3 sm:px-8 space-y-16 max-w-7xl mx-auto font-serif">
      {/* 1. HERO BANNER */}
      <section className="bg-gradient-to-r from-[#0B0F19] via-[#1A0B0E] to-[#0B0F19] rounded-3xl p-6 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-[#D4AF37]/40 animate-fadeIn">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none mix-blend-luminosity"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1400&q=80')` }}
        />
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Center for Advanced Buddhist Epistemology & Scholastic Studies</span>
          </div>

          <h1 className="font-editorial text-2xl sm:text-4xl md:text-5xl font-bold text-[#FCFBF9] leading-tight">
            Drodul Phendey Ling <br className="hidden sm:inline" />
            <span className="text-[#D4AF37]">Shedra Monastic Academy</span>
          </h1>

          <p className="text-gray-300 text-xs sm:text-base leading-relaxed font-sans max-w-2xl">
            Rooted in the ancient Nalanda scholastic lineage of Bhutan, our Shedra trains monk scholars in the Five Great Treatises of Buddhist Philosophy over a rigorous 9-year Master of Buddhist Studies (Acharya) curriculum.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 font-sans">
            <a
              href="#curriculum"
              className="monastic-maroon-btn px-6 py-3 rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg"
            >
              <span>Explore Curriculum</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </a>

            <a
              href="#verify"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#D4AF37] border border-[#D4AF37]/40 text-xs uppercase tracking-widest font-bold transition-colors flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Verify Certificate</span>
            </a>

            <Link
              to="/student/login"
              className="px-6 py-3 rounded-xl bg-[#0F172A] hover:bg-black text-gray-200 border border-gray-700 text-xs uppercase tracking-widest font-bold transition-colors flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Student Monk Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. THE 5 GREAT PILLARS OF BUDDHIST SCHOLARSHIP */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-amber-800 font-bold uppercase text-xs tracking-widest">Scholastic Heritage</span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A0B0E]">
            The Five Great Shastras
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm font-sans">
            Every monk scholar must master debate, textual translation, and meditation upon the five comprehensive pillars of classical Indian and Tibetan Buddhism.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
          {[
            {
              title: 'Madhyamaka (Middle Way)',
              desc: 'Emptiness beyond extremes, demonstrating that all phenomena lack inherent existence yet appear dependently.',
              sanskrit: 'Prajña / Sunyata',
              years: 'Years 4 - 6'
            },
            {
              title: 'Prajnaparamita (Wisdom)',
              desc: 'The stages of realization of the Bodhisattva path, spanning all 8 categories and 70 points of insight.',
              sanskrit: 'Abhisamayālankāra',
              years: 'Years 1 - 3'
            },
            {
              title: 'Pramana (Valid Cognition)',
              desc: 'Formal epistemology and rigorous Buddhist debate, establishing valid perception, inference, and direct insight.',
              sanskrit: 'Dharmakirti Logic',
              years: 'Years 1 - 2'
            },
            {
              title: 'Vinaya (Monastic Discipline)',
              desc: 'The code of vows, mindful conduct, and ethical harmony essential for preserving the sacred Sangha.',
              sanskrit: 'Pratimoksha',
              years: 'Years 7 - 8'
            },
            {
              title: 'Abhidharma (Psychology)',
              desc: 'Metaphysical breakdown of mind, consciousness, mental factors, cosmology, and the mechanisms of karma.',
              sanskrit: 'Vasubandhu Treasury',
              years: 'Years 2 - 3'
            },
            {
              title: 'Tantra & Mahamudra',
              desc: 'Advanced post-graduate meditation research in pure awareness, luminosity, and Dzogchen/Chagchen pith instructions.',
              sanskrit: 'Vajrayana Acharya',
              years: 'Year 9 (Khenpo Degree)'
            }
          ].map((pillar, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-sm hover:shadow-md transition-all hover:border-[#D4AF37] space-y-2 group"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[#721C24] font-bold text-[11px]">{pillar.years}</span>
                <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                  {pillar.sanskrit}
                </span>
              </div>
              <h3 className="font-editorial text-lg font-bold text-[#1A0B0E] group-hover:text-[#721C24] transition-colors">
                {pillar.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ACTIVE CURRICULUM & COURSES (LIVE FROM DATABASE) */}
      <section id="curriculum" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#D4AF37]/30 pb-4">
          <div>
            <span className="text-amber-800 font-bold uppercase text-xs tracking-widest">Live Academic Catalog</span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A0B0E]">
              Current Shedra Courses & Curriculum
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-sans">
            {displayCourses.length} accredited monastic subjects active
          </span>
        </div>

        {loadingCourses ? (
          <div className="p-12 text-center space-y-3 font-sans">
            <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-500">Loading live Shedra curriculum from registry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
            {displayCourses.map((course) => {
              const isExpanded = expandedCourse === course.id;
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-[#D4AF37]/30 p-5 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        {course.code || `SHED-${course.id}`}
                      </span>
                      <span className="font-bold text-[#721C24] text-[11px]">
                        {course.credits || 24} Monastic Credits
                      </span>
                    </div>

                    <h3 className="font-editorial text-lg font-bold text-[#1A0B0E]">
                      {course.title}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {course.description || 'Comprehensive textual analysis, philosophical dialectics, and meditative integration.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 text-gray-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {course.duration_months || 12} Months
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {course.level || 'Degree Level'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                      className="text-[#721C24] hover:text-[#D4AF37] font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Syllabus' : 'View Syllabus'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 p-3.5 bg-[#FAF5F0] rounded-xl border border-[#D4AF37]/20 text-xs space-y-2 animate-fadeIn">
                      <p className="font-bold text-[#1A0B0E]">Curriculum Modules & Reading List:</p>
                      <ul className="list-disc pl-4 space-y-1 text-gray-700 text-[11.5px]">
                        <li>Part I: Foundational Verses & Root Text Memorization</li>
                        <li>Part II: Classical Indian Commentarial Analysis</li>
                        <li>Part III: Daily Dialectical Debate & Proposition Examination</li>
                        <li>Part IV: Oral Defense & Final Written Sanskrit/Tibetan Thesis</li>
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. PUBLIC CERTIFICATE VERIFICATION ENGINE */}
      <section id="verify" className="bg-[#FAF5F0] rounded-3xl p-6 sm:p-10 border border-[#D4AF37]/40 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#721C24] text-[#D4AF37] flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A0B0E]">
            Public Monastic Certificate Verification
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-sans">
            Verify official degrees, completion certificates, and scholastic credentials issued by Drodul Phendey Ling Shedra Monastic Council.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleVerifyCertificate} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 font-sans">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Certificate No. (e.g. CERT-DPL-2026-308)"
              value={certQuery}
              onChange={(e) => setCertQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-[#D4AF37]/50 bg-white font-mono uppercase focus:ring-2 focus:ring-[#D4AF37] focus:outline-none shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="monastic-maroon-btn px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {verifying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>Verify Registry</span>
              </>
            )}
          </button>
        </form>

        {/* Verification Result Card */}
        {certResult && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 border-2 border-emerald-500/50 shadow-lg space-y-4 font-sans animate-fadeIn">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
              {certResult.status === 'revoked' || certResult.isRevoked ? (
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}

              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  certResult.status === 'revoked' || certResult.isRevoked
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {certResult.status === 'revoked' || certResult.isRevoked ? 'REVOKED CERTIFICATE' : 'VERIFIED OFFICIAL CREDENTIAL'}
                </span>
                <h4 className="font-editorial text-lg font-bold text-[#1A0B0E]">
                  {certResult.student_name || certResult.studentName || 'Monk Scholar'}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <span className="text-gray-500 block text-[10.5px]">Certificate Number:</span>
                <strong className="font-mono text-[#1A0B0E]">{certResult.certificate_number || certResult.certificateNumber}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[10.5px]">Curriculum / Degree:</span>
                <strong className="text-[#721C24] line-clamp-1">{certResult.course_title || certResult.courseTitle || 'Buddhist Philosophy'}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[10.5px]">Conferral Grade:</span>
                <strong className="text-emerald-700 font-bold">{certResult.grade || 'Distinction'}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[10.5px]">Issued Date:</span>
                <strong className="text-gray-800">{new Date(certResult.issued_date || certResult.issuedDate || Date.now()).toLocaleDateString()}</strong>
              </div>
            </div>

            {certResult.verification_hash && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">
                  Cryptographic SHA-256 Verification Hash:
                </span>
                <p className="text-[9.5px] font-mono text-gray-600 break-all bg-gray-50 p-2 rounded-lg border border-gray-200 mt-0.5">
                  {certResult.verification_hash}
                </p>
              </div>
            )}
          </div>
        )}

        {certError && (
          <div className="max-w-xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center font-sans">
            {certError}
          </div>
        )}
      </section>

      {/* 5. ACADEMIC & ADMISSION INQUIRY FORM */}
      <section className="bg-white rounded-3xl p-6 sm:p-12 border border-[#D4AF37]/30 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center font-sans">
          <div className="space-y-4 font-serif">
            <span className="text-amber-800 font-bold uppercase text-xs tracking-widest">Join the Academy</span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#1A0B0E] leading-tight">
              Study Buddhist Dialectics & Epistemology
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-sans">
              Drodul Phendey Ling Shedra welcomes applications from ordained novice monks, transferred monastic scholars, and lay devotees seeking deep immersion in Buddhist classical philosophy.
            </p>

            <div className="space-y-2 pt-2 text-xs font-sans">
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Full monastic scholarship, boarding, and meals provided for all enrolled monks</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Degrees recognized under Bhutanese Monastic Educational Council</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Daily debate practice in traditional stone courtyards</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleInquirySubmit} className="bg-[#FAF5F0] p-6 rounded-2xl border border-[#D4AF37]/40 space-y-3.5 shadow-sm">
            <h3 className="font-editorial text-lg font-bold text-[#1A0B0E] font-serif">
              Submit Shedra Academic Inquiry
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={inquiryName}
                onChange={(e) => setInquiryName(e.target.value)}
                placeholder="e.g. Karma Dorji"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  placeholder="applicant@example.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  placeholder="+975 17000000"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Background & Study Goals *
              </label>
              <textarea
                rows={3}
                required
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                placeholder="Describe your Buddhist study background, ordination status, or questions..."
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-1 focus:ring-[#D4AF37] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={inquirySubmitting}
              className="monastic-maroon-btn w-full py-3 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {inquirySubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#D4AF37]" />
                  <span>Transmit Inquiry to Academic Board</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
