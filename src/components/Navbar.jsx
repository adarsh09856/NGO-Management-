import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart, MapPin, Phone, Mail, Globe, ChevronDown, ChevronRight, Menu, X,
  User, LogOut, ShieldCheck, GraduationCap, Flame, Calendar, Image as ImageIcon,
  BookOpen, Sparkles, Building, Landmark, Compass, Award, HandHeart, Newspaper, Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PrayerFlagsRibbon from './PrayerFlagsRibbon';

export default function Navbar({ onOpenDonate }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll Progress Ribbon State
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Mobile Menu & Dropdowns
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Mobile Accordion States
  const [mobileActivitiesOpen, setMobileActivitiesOpen] = useState(false);

  const [lang, setLang] = useState('English');

  const isActive = (path) => location.pathname === path;

  // Track scroll position for dynamic ribbon
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;

      setScrollProgress(scrolled);
      setIsScrolled(winScroll > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="w-full z-40 sticky top-0 bg-white shadow-sm border-b border-[#E2E8F0] transition-shadow duration-300">
      {/* 0. BHUTANESE PRAYER FLAGS RIBBON */}
      <PrayerFlagsRibbon />

      {/* 1. TOP UTILITY BAR */}
      <div className="bg-[#0F172A] text-[#F3F4F6] text-[11px] sm:text-xs py-1.5 px-3 sm:px-8 border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-y-1 gap-x-3">
          {/* Left contact info */}
          <div className="flex items-center space-x-3 sm:space-x-6 text-[11px] sm:text-xs">
            <div className="flex items-center space-x-1.5 hover:text-[#D4AF37] transition-colors cursor-default">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-none">Gelephu, Sarpang, Bhutan</span>
            </div>
            <div className="flex items-center space-x-1.5 hover:text-[#D4AF37] transition-colors cursor-default">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span>+975 17556559</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1.5 hover:text-[#D4AF37] transition-colors cursor-default">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span>contact@drodulphendeyling.org</span>
            </div>
          </div>

          {/* Right quick links & language switcher */}
          <div className="flex items-center space-x-3 sm:space-x-5 text-[11px] sm:text-xs">
            <Link
              to="/prayer-request"
              className="hover:text-[#D4AF37] flex items-center gap-1 transition-colors group"
            >
              <span className="text-[#D4AF37] group-hover:rotate-45 transition-transform">☸</span>
              <span className="hidden xs:inline font-medium">Prayer Request</span>
              <span className="xs:hidden">Prayer</span>
            </Link>
            <Link to="/news-events" className="hover:text-[#D4AF37] transition-colors hidden sm:inline">
              News & Events
            </Link>
            <Link to="/gallery" className="hover:text-[#D4AF37] transition-colors hidden md:inline">
              Gallery
            </Link>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 text-[#D4AF37] border-l border-[#1E293B] pl-2.5">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-white text-[11px] sm:text-xs focus:outline-none cursor-pointer pr-1 font-medium"
              >
                <option value="English" className="text-gray-900">English</option>
                <option value="Dzongkha" className="text-gray-900">རྫོང་ཁ (Dzongkha)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & BRAND */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand Crest & Logo */}
        <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0F172A] border-2 border-[#D4AF37] flex items-center justify-center shadow-md group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all flex-shrink-0">
            <span className="text-[#D4AF37] text-xl sm:text-2xl font-serif font-bold group-hover:rotate-180 transition-transform duration-700">
              ☸
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="font-serif-brand font-bold text-xs sm:text-base md:text-lg text-[#0F172A] tracking-wider leading-tight truncate">
              DRODUL PHENDEY LING
            </h1>
            <p className="text-[9px] sm:text-xs text-[#BE123C] font-medium tracking-widest uppercase truncate">
              Building Peace. Empowering Lives.
            </p>
          </div>
        </Link>

        {/* Desktop Magnetic Silk Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-5 2xl:space-x-6 text-xs font-bold text-[#374151] tracking-wider">
          {/* HOME */}
          <Link
            to="/"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#0F172A] hover:scale-105 group ${
              isActive('/') ? 'text-[#BE123C]' : 'text-gray-700'
            }`}
          >
            <span>HOME</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#BE123C] transition-all duration-300 ${
                isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>

          {/* ABOUT US */}
          <Link
            to="/about"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#0F172A] hover:scale-105 group ${
              isActive('/about') ? 'text-[#BE123C]' : 'text-gray-700'
            }`}
          >
            <span>ABOUT US</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#BE123C] transition-all duration-300 ${
                isActive('/about') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>

          {/* OUR ACTIVITIES DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('activities')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className={`flex items-center gap-1 py-1.5 transition-all duration-200 hover:text-[#0F172A] hover:scale-105 group ${
                activeDropdown === 'activities' || location.pathname.startsWith('/activities')
                  ? 'text-[#BE123C]'
                  : 'text-gray-700'
              }`}
            >
              <span>ACTIVITIES</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#D4AF37] transition-transform duration-200 ${
                  activeDropdown === 'activities' ? 'rotate-180' : ''
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#BE123C] transition-all duration-300 ${
                  activeDropdown === 'activities' || location.pathname.startsWith('/activities')
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`}
              />
            </button>

            {/* Silk Dropdown Card */}
            {activeDropdown === 'activities' && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_15px_40px_rgba(74,14,23,0.18)] border border-[#D4AF37]/40 p-3 z-50 animate-fadeIn">
                <div className="space-y-1">
                  <Link
                    to="/activities#stupa"
                    className="p-2.5 rounded-xl hover:bg-[#FEF3C7] transition-colors flex items-start space-x-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#0F172A] text-[#0F172A] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-sm">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0F172A]">Peace Stupa Construction</p>
                      <p className="text-[10px] text-gray-500 line-clamp-1">108ft Great Druk Wangyel monument</p>
                    </div>
                  </Link>

                  <Link
                    to="/activities#shedra"
                    className="p-2.5 rounded-xl hover:bg-[#FEF3C7] transition-colors flex items-start space-x-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#0F172A] text-[#0F172A] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-sm">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0F172A]">Shedra Monastic University</p>
                      <p className="text-[10px] text-gray-500 line-clamp-1">Higher Buddhist philosophy degrees</p>
                    </div>
                  </Link>

                  <Link
                    to="/activities#culture"
                    className="p-2.5 rounded-xl hover:bg-[#FEF3C7] transition-colors flex items-start space-x-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#0F172A] text-[#0F172A] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0F172A]">Cultural Preservation</p>
                      <p className="text-[10px] text-gray-500 line-clamp-1">Sacred scriptures, thangka & arts</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* LEARNING & DHARMA VIDEOS */}
          <Link
            to="/learning"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#0F172A] hover:scale-105 group ${
              isActive('/learning') ? 'text-[#BE123C]' : 'text-gray-700'
            }`}
          >
            <span>LEARNING</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#BE123C] transition-all duration-300 ${
                isActive('/learning') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>

          {/* BLOG */}
          <Link
            to="/blog"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#0F172A] hover:scale-105 group ${
              isActive('/blog') ? 'text-[#BE123C]' : 'text-gray-700'
            }`}
          >
            <span>BLOG</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#BE123C] transition-all duration-300 ${
                isActive('/blog') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>

          {/* GALLERY */}
          <Link
            to="/gallery"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#0F172A] hover:scale-105 group ${
              isActive('/gallery') ? 'text-[#BE123C]' : 'text-gray-700'
            }`}
          >
            <span>GALLERY</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#BE123C] transition-all duration-300 ${
                isActive('/gallery') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>

          {/* CONTACT */}
          <Link
            to="/contact"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#0F172A] hover:scale-105 group ${
              isActive('/contact') ? 'text-[#BE123C]' : 'text-gray-700'
            }`}
          >
            <span>CONTACT</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#BE123C] transition-all duration-300 ${
                isActive('/contact') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 flex-shrink-0">
          {/* User Portal Link or Login Button */}
          {user ? (
            <Link
              to={isAdmin ? '/admin' : '/user'}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-[#F8FAFC] border border-[#D4AF37] text-[#0F172A] hover:bg-[#FEF3C7] transition-all shadow-sm"
            >
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-[#0F172A]" /> : <User className="w-3.5 h-3.5 text-[#0F172A]" />}
              <span className="max-w-[80px] sm:max-w-[110px] truncate">{isAdmin ? 'Admin Portal' : 'User Panel'}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0F172A] hover:text-[#E11D48] hover:bg-[#FEF3C7] transition-all border border-[#E2E8F0]"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Shimmering Golden & Burgundy DONATE CTA Button */}
          <button
            onClick={onOpenDonate || (() => navigate('/donate'))}
            className="relative group overflow-hidden flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-[#E11D48] via-[#BE123C] to-[#1E293B] hover:from-[#BE123C] hover:to-[#0F172A] text-white px-4 sm:px-5 py-2 rounded-full font-bold text-[11px] sm:text-xs tracking-wider uppercase shadow-[0_4px_15px_rgba(126,25,41,0.35)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.45)] hover:scale-105 transition-all duration-300 flex-shrink-0 border border-[#D4AF37]/50"
          >
            {/* Shimmering Light-Sweep Effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
            <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37] group-hover:scale-125 transition-transform animate-pulse" />
            <span className="whitespace-nowrap relative z-10">DONATE NOW</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors shadow-sm"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#0F172A]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. DYNAMIC GOLDEN SILK SCROLL PROGRESS RIBBON */}
      <div className="w-full bg-[#F3EAD8] h-[2.5px] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#D4AF37] via-[#FEF3C7] to-[#B89020] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(212,175,55,0.8)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 4. MOBILE EXPANDABLE MENU */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/98 backdrop-blur-xl border-t border-[#E2E8F0] px-4 sm:px-8 py-4 space-y-3 max-h-[85vh] overflow-y-auto animate-fadeIn shadow-2xl">
          <div className="space-y-1 text-sm font-semibold text-gray-800">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 px-3.5 rounded-xl ${isActive('/') ? 'bg-[#FEF3C7] text-[#0F172A] font-bold' : 'hover:bg-gray-50'}`}
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 px-3.5 rounded-xl ${isActive('/about') ? 'bg-[#FEF3C7] text-[#0F172A] font-bold' : 'hover:bg-gray-50'}`}
            >
              About Us
            </Link>
            <Link
              to="/activities"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 px-3.5 rounded-xl ${isActive('/activities') ? 'bg-[#FEF3C7] text-[#0F172A] font-bold' : 'hover:bg-gray-50'}`}
            >
              Activities & Stupa
            </Link>
            <Link
              to="/learning"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 px-3.5 rounded-xl ${isActive('/learning') ? 'bg-[#FEF3C7] text-[#0F172A] font-bold' : 'hover:bg-gray-50'}`}
            >
              Learning & Videos
            </Link>
            <Link
              to="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 px-3.5 rounded-xl ${isActive('/blog') ? 'bg-[#FEF3C7] text-[#0F172A] font-bold' : 'hover:bg-gray-50'}`}
            >
              Blog & Articles
            </Link>
            <Link
              to="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 px-3.5 rounded-xl ${isActive('/gallery') ? 'bg-[#FEF3C7] text-[#0F172A] font-bold' : 'hover:bg-gray-50'}`}
            >
              Photo & Video Gallery
            </Link>
            <Link
              to="/prayer-request"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3.5 rounded-xl text-[#0F172A] font-bold bg-[#FEF3C7] border border-[#D4AF37]/50 flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-[#D4AF37]" />
              <span>Sacred Prayer Request</span>
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3.5 rounded-xl hover:bg-gray-50"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Portals Quick Access */}
          <div className="pt-3 border-t border-gray-200">
            {user ? (
              <div className="p-3 bg-[#FAF5F0] rounded-2xl border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-bold text-[#0F172A]">{user.fullName}</p>
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
                  to={isAdmin ? '/admin' : '/user'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow"
                >
                  Enter {isAdmin ? 'Admin Portal' : 'User Panel'}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#0F172A] text-white font-bold"
                >
                  User Login
                </Link>
                <Link
                  to="/login?portal=admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-gray-100 hover:bg-[#FEF3C7] font-bold text-gray-800"
                >
                  Admin / Staff
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
