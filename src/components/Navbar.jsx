import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Phone, Mail, Globe, ChevronDown, Menu, X, User, LogOut, ShieldCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenDonate }) {
  const { user, logout, isAdmin, isDonor, isStudent } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [involvedOpen, setInvolvedOpen] = useState(false);
  const [lang, setLang] = useState('English');
  const navigate = useNavigate();

  return (
    <header className="w-full z-40 sticky top-0 bg-white shadow-sm border-b border-[#EBE5D8]">
      {/* 1. TOP UTILITY BAR (Matching reference image 4) */}
      <div className="bg-[#4A0E17] text-[#F3F4F6] text-xs py-1.5 px-4 sm:px-8 border-b border-[#5A121E]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Left contact info */}
          <div className="flex items-center space-x-4 md:space-x-6 text-[11px] md:text-xs">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Gelephu, Sarpang, Bhutan</span>
            </div>
            <div className="flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>+975 17556559</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>contact@drodulphendeyling.org</span>
            </div>
          </div>

          {/* Right quick links & language switcher */}
          <div className="flex items-center space-x-4 md:space-x-6 text-[11px] md:text-xs">
            <Link to="/prayer-request" className="hover:text-[#D4AF37] flex items-center gap-1 transition-colors">
              <span className="text-[#D4AF37]">☸</span> Prayer Request
            </Link>
            <Link to="/news-events" className="hover:text-[#D4AF37] transition-colors">
              News & Events
            </Link>
            <Link to="/gallery" className="hover:text-[#D4AF37] transition-colors">
              Gallery
            </Link>
            
            {/* Language Switcher UI */}
            <div className="flex items-center space-x-1 text-[#D4AF37] border-l border-[#5A121E] pl-3">
              <Globe className="w-3.5 h-3.5" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="English" className="text-gray-900">English</option>
                <option value="Dzongkha" className="text-gray-900">རྫོང་ཁ (Dzongkha)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & BRAND (Matching reference image 4) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Brand Crest & Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-full bg-[#4A0E17] border-2 border-[#D4AF37] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
            <span className="text-[#D4AF37] text-2xl font-serif font-bold">☸</span>
          </div>
          <div>
            <h1 className="font-serif-brand font-bold text-base sm:text-lg md:text-xl text-[#4A0E17] tracking-wider leading-tight">
              DRODUL PHENDEY LING FOUNDATION
            </h1>
            <p className="text-[10px] sm:text-xs text-[#8B1E2F] font-medium tracking-widest uppercase">
              Building Peace. Empowering Lives.
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center space-x-6 text-xs font-semibold text-[#374151] tracking-wide">
          <Link to="/" className="text-[#8B1E2F] border-b-2 border-[#8B1E2F] pb-1 hover:text-[#4A0E17]">
            HOME
          </Link>
          <Link to="/about" className="hover:text-[#8B1E2F] transition-colors pb-1">
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

          <Link to="/resources" className="hover:text-[#8B1E2F] transition-colors pb-1">
            RESOURCES
          </Link>
          <Link to="/contact" className="hover:text-[#8B1E2F] transition-colors pb-1">
            CONTACT
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* User Portal Link or Login Button */}
          {user ? (
            <div className="relative group">
              <Link
                to={isAdmin ? '/admin' : isStudent ? '/student' : '/donor'}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#FDFBF7] border border-[#D4AF37] text-[#4A0E17] hover:bg-[#FDF6E2] transition-all"
              >
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-[#4A0E17]" /> : isStudent ? <GraduationCap className="w-3.5 h-3.5 text-[#4A0E17]" /> : <User className="w-3.5 h-3.5 text-[#4A0E17]" />}
                <span className="max-w-[100px] truncate">{user.fullName || 'My Portal'}</span>
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-semibold text-[#4A0E17] hover:text-[#7E1929] hover:bg-[#F8F6F0] transition-colors border border-transparent hover:border-[#EBE5D8]"
            >
              <User className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </Link>
          )}

          {/* DONATE NOW Button (Maroon, matching image 4) */}
          <button
            onClick={onOpenDonate || (() => navigate('/donate'))}
            className="flex items-center space-x-2 bg-[#7E1929] hover:bg-[#5A121E] text-white px-4 sm:px-5 py-2 rounded-md font-semibold text-xs tracking-wider uppercase shadow hover:shadow-md transition-all group"
          >
            <Heart className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform fill-[#D4AF37]" />
            <span>DONATE NOW</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-[#EBE5D8] px-6 py-4 space-y-3 animate-fadeIn">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-[#4A0E17]">
            Home
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-gray-800">
            About Us
          </Link>
          <Link to="/activities" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-gray-800">
            Our Activities
          </Link>
          <Link to="/programs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-gray-800">
            Programs & LMS
          </Link>
          <Link to="/prayer-request" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-[#D4AF37]">
            ☸ Prayer Request
          </Link>
          <Link to="/news-events" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-gray-800">
            News & Events
          </Link>
          <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-gray-800">
            Photo Gallery
          </Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-gray-800">
            Contact
          </Link>
          <div className="pt-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-2">
                <Link
                  to={isAdmin ? '/admin' : isStudent ? '/student' : '/donor'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-[#4A0E17]"
                >
                  Go to {isAdmin ? 'Admin Portal' : isStudent ? 'Student Portal' : 'Donor Portal'}
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 text-sm font-medium text-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-[#4A0E17]">
                Log In to Portals
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
