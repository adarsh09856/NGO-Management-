import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart, MapPin, Phone, Mail, Globe, ChevronDown, ChevronRight, Menu, X,
  User, LogOut, ShieldCheck, GraduationCap, Flame, Calendar, Image as ImageIcon,
  BookOpen, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenDonate }) {
  const { user, logout, isAdmin, isDonor, isStudent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [involvedOpen, setInvolvedOpen] = useState(false);

  // Mobile Accordion toggles
  const [mobileActivitiesOpen, setMobileActivitiesOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const [mobileInvolvedOpen, setMobileInvolvedOpen] = useState(false);

  const [lang, setLang] = useState('English');

  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full z-40 sticky top-0 bg-white shadow-sm border-b border-[#EBE5D8]">
      {/* 1. TOP UTILITY BAR (Multi-device responsive) */}
      <div className="bg-[#4A0E17] text-[#F3F4F6] text-[11px] sm:text-xs py-1.5 px-3 sm:px-8 border-b border-[#5A121E]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-y-1 gap-x-3">
          {/* Left contact info */}
          <div className="flex items-center space-x-3 sm:space-x-6 text-[11px] sm:text-xs">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-none">Gelephu, Sarpang, Bhutan</span>
            </div>
            <div className="flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span>+975 17556559</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span>contact@drodulphendeyling.org</span>
            </div>
          </div>

          {/* Right quick links & language switcher */}
          <div className="flex items-center space-x-3 sm:space-x-5 text-[11px] sm:text-xs">
            <Link to="/prayer-request" className="hover:text-[#D4AF37] flex items-center gap-1 transition-colors">
              <span className="text-[#D4AF37]">☸</span>
              <span className="hidden xs:inline">Prayer Request</span>
              <span className="xs:hidden">Prayer</span>
            </Link>
            <Link to="/news-events" className="hover:text-[#D4AF37] transition-colors hidden sm:inline">
              News & Events
            </Link>
            <Link to="/gallery" className="hover:text-[#D4AF37] transition-colors hidden md:inline">
              Gallery
            </Link>

            {/* Language Switcher UI */}
            <div className="flex items-center space-x-1 text-[#D4AF37] border-l border-[#5A121E] pl-2.5">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-white text-[11px] sm:text-xs focus:outline-none cursor-pointer pr-1 font-medium"
              >
                <option value="English" className="text-gray-900">EN</option>
                <option value="Dzongkha" className="text-gray-900">རྫོང་ཁ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & BRAND */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand Crest & Logo */}
        <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#4A0E17] border-2 border-[#D4AF37] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
            <span className="text-[#D4AF37] text-xl sm:text-2xl font-serif font-bold">☸</span>
          </div>
          <div className="min-w-0">
            <h1 className="font-serif-brand font-bold text-xs sm:text-base md:text-lg text-[#4A0E17] tracking-wider leading-tight truncate">
              DRODUL PHENDEY LING
            </h1>
            <p className="text-[9px] sm:text-xs text-[#8B1E2F] font-medium tracking-widest uppercase truncate">
              Building Peace. Empowering Lives.
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links (Visible on lg/xl screens) */}
        <nav className="hidden xl:flex items-center space-x-5 2xl:space-x-6 text-xs font-semibold text-[#374151] tracking-wide">
          <Link
            to="/"
            className={`pb-1 transition-colors ${
              isActive('/') ? 'text-[#8B1E2F] border-b-2 border-[#8B1E2F]' : 'hover:text-[#8B1E2F]'
            }`}
          >
            HOME
          </Link>
          <Link
            to="/about"
            className={`pb-1 transition-colors ${
              isActive('/about') ? 'text-[#8B1E2F] border-b-2 border-[#8B1E2F]' : 'hover:text-[#8B1E2F]'
            }`}
          >
            ABOUT US
          </Link>

          {/* Activities Dropdown */}
          <div className="relative" onMouseEnter={() => setActivitiesOpen(true)} onMouseLeave={() => setActivitiesOpen(false)}>
            <button className="flex items-center gap-1 hover:text-[#8B1E2F] transition-colors pb-1">
              OUR ACTIVITIES <ChevronDown className="w-3 h-3" />
            </button>
            {activitiesOpen && (
              <div className="absolute top-full left-0 w-60 bg-white shadow-xl rounded-md border border-[#EBE5D8] py-2 z-50 animate-fadeIn">
                <Link to="/activities#stupa" className="block px-4 py-2 text-xs hover:bg-[#FDFBF7] hover:text-[#8B1E2F]">
                  Peace Stupa Construction
                </Link>
                <Link to="/activities#shedra" className="block px-4 py-2 text-xs hover:bg-[#FDFBF7] hover:text-[#8B1E2F]">
                  Shedra Monastic University
                </Link>
                <Link to="/activities#culture" className="block px-4 py-2 text-xs hover:bg-[#FDFBF7] hover:text-[#8B1E2F]">
                  Cultural Preservation
                </Link>
                <Link to="/activities#welfare" className="block px-4 py-2 text-xs hover:bg-[#FDFBF7] hover:text-[#8B1E2F]">
                  Community & Social Welfare
                </Link>
              </div>
            )}
          </div>

          {/* Programs Dropdown */}
          <div className="relative" onMouseEnter={() => setProgramsOpen(true)} onMouseLeave={() => setProgramsOpen(false)}>
            <button className="flex items-center gap-1 hover:text-[#8B1E2F] transition-colors pb-1">
              PROGRAMS <ChevronDown className="w-3 h-3" />
            </button>
            {programsOpen && (
              <div className="absolute top-full left-0 w-60 bg-white shadow-xl rounded-md border border-[#EBE5D8] py-2 z-50 animate-fadeIn">
                <Link to="/programs#monastic" className="block px-4 py-2 text-xs hover:bg-[#FDFBF7] hover:text-[#8B1E2F]">
                  Monastic Training (Shedra)
                </Link>
                <Link to="/programs#philosophy" className="block px-4 py-2 text-xs hover:bg-[#FDFBF7] hover:text-[#8B1E2F]">
                  Buddhist Philosophy Courses
                </Link>
                <Link to="/programs#meditation" className="block px-4 py-2 text-xs hover:bg-[#FDFBF7] hover:text-[#8B1E2F]">
                  Meditation & Retreats
                </Link>
                <Link to="/programs#tibetan" className="block px-4 py-2 text-xs hover:bg-[#FDFBF7] hover:text-[#8B1E2F]">
                  Sacred Arts & Language
                </Link>
              </div>
            )}
          </div>

          {/* Get Involved Dropdown */}
          <div className="relative" onMouseEnter={() => setInvolvedOpen(true)} onMouseLeave={() => setInvolvedOpen(false)}>
            <button className="flex items-center gap-1 hover:text-[#8B1E2F] transition-colors pb-1">
              GET INVOLVED <ChevronDown className="w-3 h-3" />
            </button>
            {involvedOpen && (
              <div className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-md border border-[#EBE5D8] py-2 z-50 animate-fadeIn">
                <Link to="/get-involved#volunteer" className="block px-4 py-2 text-xs hover:bg-[#FDFBF7] hover:text-[#8B1E2F]">
                  Volunteer With Us
                </Link>
                <Link to="/get-involved#sponsor" className="block px-4 py-2 text-xs hover:bg-[#FDFBF7] hover:text-[#8B1E2F]">
                  Sponsor a Monk Scholar
                </Link>
                <Link to="/get-involved#pledge" className="block px-4 py-2 text-xs hover:bg-[#FDFBF7] hover:text-[#8B1E2F]">
                  Monthly Giving Pledge
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/resources"
            className={`pb-1 transition-colors ${
              isActive('/resources') ? 'text-[#8B1E2F] border-b-2 border-[#8B1E2F]' : 'hover:text-[#8B1E2F]'
            }`}
          >
            RESOURCES
          </Link>
          <Link
            to="/contact"
            className={`pb-1 transition-colors ${
              isActive('/contact') ? 'text-[#8B1E2F] border-b-2 border-[#8B1E2F]' : 'hover:text-[#8B1E2F]'
            }`}
          >
            CONTACT
          </Link>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* User Portal Link or Login Button */}
          {user ? (
            <Link
              to={isAdmin ? '/admin' : isStudent ? '/student' : '/donor'}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded text-[11px] sm:text-xs font-semibold bg-[#FDFBF7] border border-[#D4AF37] text-[#4A0E17] hover:bg-[#FDF6E2] transition-all shadow-sm"
            >
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-[#4A0E17]" /> : isStudent ? <GraduationCap className="w-3.5 h-3.5 text-[#4A0E17]" /> : <User className="w-3.5 h-3.5 text-[#4A0E17]" />}
              <span className="max-w-[80px] sm:max-w-[120px] truncate">{user.fullName || 'My Portal'}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded text-xs font-semibold text-[#4A0E17] hover:text-[#7E1929] hover:bg-[#F8F6F0] transition-colors border border-[#EBE5D8]"
            >
              <User className="w-3.5 h-3.5" />
              <span>Portals</span>
            </Link>
          )}

          {/* DONATE NOW Button (Maroon CTA) */}
          <button
            onClick={onOpenDonate || (() => navigate('/donate'))}
            className="flex items-center space-x-1.5 sm:space-x-2 bg-[#7E1929] hover:bg-[#5A121E] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-md font-bold text-[11px] sm:text-xs tracking-wider uppercase shadow hover:shadow-md transition-all group flex-shrink-0"
          >
            <Heart className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform fill-[#D4AF37]" />
            <span className="whitespace-nowrap">DONATE</span>
          </button>

          {/* Mobile / Tablet Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 sm:p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A0E17]" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* 3. MOBILE & TABLET EXPANDABLE MENU (Touch-friendly & fully accessible) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-[#EBE5D8] px-4 sm:px-8 py-4 space-y-3 max-h-[85vh] overflow-y-auto animate-fadeIn shadow-2xl">
          {/* Main Links */}
          <div className="space-y-1 text-sm font-semibold text-gray-800">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 px-3 rounded-md ${isActive('/') ? 'bg-[#FDF6E2] text-[#4A0E17] font-bold' : 'hover:bg-gray-50'}`}
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 px-3 rounded-md ${isActive('/about') ? 'bg-[#FDF6E2] text-[#4A0E17] font-bold' : 'hover:bg-gray-50'}`}
            >
              About Us
            </Link>

            {/* Mobile Accordion: Activities */}
            <div>
              <button
                type="button"
                onClick={() => setMobileActivitiesOpen(!mobileActivitiesOpen)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 text-left font-semibold"
              >
                <span>Our Activities</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileActivitiesOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileActivitiesOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 text-xs bg-[#FAF5F0] rounded-md mt-1">
                  <Link to="/activities#stupa" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-700 hover:text-[#4A0E17]">
                    Peace Stupa Construction
                  </Link>
                  <Link to="/activities#shedra" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-700 hover:text-[#4A0E17]">
                    Shedra Monastic University
                  </Link>
                  <Link to="/activities#culture" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-700 hover:text-[#4A0E17]">
                    Cultural Preservation
                  </Link>
                  <Link to="/activities#welfare" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-700 hover:text-[#4A0E17]">
                    Community Welfare
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Accordion: Programs */}
            <div>
              <button
                type="button"
                onClick={() => setMobileProgramsOpen(!mobileProgramsOpen)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 text-left font-semibold"
              >
                <span>Programs & LMS</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileProgramsOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileProgramsOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 text-xs bg-[#FAF5F0] rounded-md mt-1">
                  <Link to="/programs#monastic" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-700 hover:text-[#4A0E17]">
                    Monastic Training (Shedra)
                  </Link>
                  <Link to="/programs#philosophy" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-700 hover:text-[#4A0E17]">
                    Buddhist Philosophy Courses
                  </Link>
                  <Link to="/programs#meditation" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-700 hover:text-[#4A0E17]">
                    Meditation & Retreats
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Accordion: Get Involved */}
            <div>
              <button
                type="button"
                onClick={() => setMobileInvolvedOpen(!mobileInvolvedOpen)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 text-left font-semibold"
              >
                <span>Get Involved</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileInvolvedOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileInvolvedOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 text-xs bg-[#FAF5F0] rounded-md mt-1">
                  <Link to="/get-involved#volunteer" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-700 hover:text-[#4A0E17]">
                    Volunteer With Us
                  </Link>
                  <Link to="/get-involved#sponsor" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-700 hover:text-[#4A0E17]">
                    Sponsor a Monk Scholar
                  </Link>
                  <Link to="/get-involved#pledge" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-700 hover:text-[#4A0E17]">
                    Monthly Giving Pledge
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/prayer-request"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-md text-[#4A0E17] font-bold bg-[#FDF6E2] border border-[#D4AF37]/50 flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-[#D4AF37]" />
              <span>Sacred Prayer Request</span>
            </Link>
            <Link
              to="/news-events"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-md hover:bg-gray-50"
            >
              News & Announcements
            </Link>
            <Link
              to="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-md hover:bg-gray-50"
            >
              Photo Gallery
            </Link>
            <Link
              to="/resources"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-md hover:bg-gray-50"
            >
              Resources & Downloads
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-md hover:bg-gray-50"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Portal Navigation & Auth Strip */}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            {user ? (
              <div className="p-3 bg-[#FAF5F0] rounded-lg border border-[#EBE5D8] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-bold text-[#4A0E17]">{user.fullName}</p>
                    <p className="text-[10px] text-gray-500 capitalize">{user.role?.name}</p>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
                <Link
                  to={isAdmin ? '/admin' : isStudent ? '/student' : '/donor'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 bg-[#4A0E17] text-white rounded text-xs font-bold uppercase tracking-wider shadow"
                >
                  Enter {isAdmin ? 'Admin Portal' : isStudent ? 'Student Portal' : 'Donor Portal'}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200 font-bold text-gray-800"
                >
                  Admin
                </Link>
                <Link
                  to="/donor/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200 font-bold text-gray-800"
                >
                  Donor
                </Link>
                <Link
                  to="/student/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200 font-bold text-gray-800"
                >
                  Monk/LMS
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
