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

  // Mobile Drawer & Dropdowns
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [lang, setLang] = useState('English');

  const translations = {
    English: {
      home: 'HOME',
      about: 'ABOUT US',
      activities: 'ACTIVITIES',
      learning: 'LEARNING',
      blog: 'BLOG',
      gallery: 'GALLERY',
      contact: 'CONTACT',
      login: 'Sign In',
      register: 'Join Portal',
      donate: 'OFFER DANA',
      prayer: 'Light Butter Lamps',
      news: 'News & Events',
      monkPortal: 'Shedra Monk Portal',
      shedra: 'SHEDRA'
    },
    Dzongkha: {
      home: 'གདོང་ཤོག',
      about: 'ངོ་སྤྲོད།',
      activities: 'ལས་རིམ།',
      learning: 'ཆོས་སྤྱོད།',
      blog: 'གསར་འགྱུར།',
      gallery: 'པར་རིས།',
      contact: 'འབྲེལ་གཏུགས།',
      login: 'ནང་འཛུལ།',
      register: 'ཐོ་བཀོད།',
      donate: 'ཞལ་འདེབས།',
      prayer: 'མཆོད་མེ་ཕུལ་བ།',
      news: 'གནས་ཚུལ།',
      monkPortal: 'བཤད་གྲྭའི་སྒོ་འབྱེད།',
      shedra: 'བཤད་གྲྭ།'
    }
  };

  const t = translations[lang] || translations.English;
  const isActive = (path) => location.pathname === path;

  // Track scroll position
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

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="w-full z-40 sticky top-0 bg-white/95 backdrop-blur-xl shadow-[0_4px_25px_rgba(15,23,42,0.06)] border-b border-[#D4AF37]/30 transition-all duration-300">
      {/* 0. BHUTANESE PRAYER FLAGS RIBBON */}
      <PrayerFlagsRibbon />

      {/* 1. TOP UTILITY BAR (Deep Monastic Obsidian) */}
      <div className="bg-[#070A12] text-[#E2E8F0] text-[10px] sm:text-xs py-1.5 px-3 sm:px-8 border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          {/* Left contact info */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="flex items-center space-x-1.5 text-gray-300 hover:text-[#D4AF37] transition-colors cursor-default">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span className="hidden xs:inline truncate max-w-[130px] sm:max-w-none">Gelephu, Bhutan</span>
              <span className="xs:hidden">Bhutan</span>
            </div>
            <div className="flex items-center space-x-1.5 text-gray-300 hover:text-[#D4AF37] transition-colors cursor-default">
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span>+975 17556559</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1.5 text-gray-300 hover:text-[#D4AF37] transition-colors cursor-default">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span>contact@drodulphendeyling.org</span>
            </div>
          </div>

          {/* Right quick links & language switcher */}
          <div className="flex items-center space-x-2.5 sm:space-x-5 text-[10px] sm:text-[11px]">
            <Link
              to="/prayer-request"
              className="text-[#F6E05E] hover:text-[#D4AF37] flex items-center gap-1 transition-colors font-medium"
            >
              <Flame className="w-3 h-3 text-[#D4AF37]" />
              <span className="hidden sm:inline">108 Butter Lamps</span>
              <span className="sm:hidden">Prayers</span>
            </Link>

            <Link to="/news-events" className="text-gray-300 hover:text-[#D4AF37] transition-colors hidden md:inline">
              News & Events
            </Link>

            <Link to="/student" className="text-[#D4AF37] hover:text-white font-semibold transition-colors hidden lg:inline flex items-center gap-1">
              <span>☸</span>
              <span>Monk Shedra</span>
            </Link>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 text-[#D4AF37] border-l border-white/20 pl-2">
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-white text-[10px] sm:text-[11px] focus:outline-none cursor-pointer pr-1 font-medium"
              >
                <option value="English" className="text-gray-900">EN</option>
                <option value="Dzongkha" className="text-gray-900">རྫོང</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & BRAND */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Crest & Logo */}
        <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3.5 group min-w-0 flex-shrink">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#1A0B0E] via-[#4A0E17] to-[#1A0B0E] border-2 border-[#D4AF37] flex items-center justify-center shadow-lg ring-2 ring-[#D4AF37]/20 group-hover:scale-105 group-hover:border-amber-300 transition-all flex-shrink-0">
            <span className="text-[#D4AF37] text-xl sm:text-2xl font-serif font-bold group-hover:rotate-180 transition-transform duration-700">
              ☸
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="font-serif-brand font-bold text-xs xs:text-sm sm:text-base md:text-lg text-[#0F172A] tracking-wider leading-tight truncate group-hover:text-[#721C24] transition-colors">
              DRODUL PHENDEY LING
            </h1>
            <p className="text-[9px] sm:text-[10px] text-amber-700 font-semibold tracking-wider font-tibetan truncate">
              ༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ། · Gelephu, Bhutan
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-5 2xl:space-x-7 text-xs font-bold text-[#1E293B] tracking-wider uppercase">
          {/* HOME */}
          <Link
            to="/"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#721C24] group ${
              isActive('/') ? 'text-[#721C24]' : 'text-gray-700'
            }`}
          >
            <span>{t.home}</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#721C24] transition-all duration-300 ${
                isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>

          {/* ABOUT US */}
          <Link
            to="/about"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#721C24] group ${
              isActive('/about') ? 'text-[#721C24]' : 'text-gray-700'
            }`}
          >
            <span>{t.about}</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#721C24] transition-all duration-300 ${
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
              className={`flex items-center gap-1 py-1.5 transition-all duration-200 hover:text-[#721C24] group ${
                activeDropdown === 'activities' || location.pathname.startsWith('/activities')
                  ? 'text-[#721C24]'
                  : 'text-gray-700'
              }`}
            >
              <span>{t.activities}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#D4AF37] transition-transform duration-200 ${
                  activeDropdown === 'activities' ? 'rotate-180' : ''
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#721C24] transition-all duration-300 ${
                  activeDropdown === 'activities' || location.pathname.startsWith('/activities')
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`}
              />
            </button>

            {/* Silk Dropdown Card */}
            {activeDropdown === 'activities' && (
              <div className="absolute top-full left-0 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#D4AF37]/30 p-2 animate-scale-in z-50">
                <div className="space-y-1 text-xs font-serif">
                  <Link
                    to="/about"
                    className="p-2.5 rounded-xl hover:bg-[#FAF5F0] transition-colors flex items-start space-x-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#1A0B0E] text-[#721C24] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-sm">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#1A0B0E]">Great Druk Wangyel Peace Stupa</p>
                      <p className="text-[10px] text-gray-500 font-sans line-clamp-1">108ft sacred monument for world peace</p>
                    </div>
                  </Link>

                  <Link
                    to="/shedra"
                    className="p-2.5 rounded-xl hover:bg-[#FAF5F0] transition-colors flex items-start space-x-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#1A0B0E] text-[#721C24] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-sm">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#1A0B0E]">Shedra Monastic University</p>
                      <p className="text-[10px] text-gray-500 font-sans line-clamp-1">9-year higher Buddhist philosophy degrees</p>
                    </div>
                  </Link>

                  <Link
                    to="/prayer-request"
                    className="p-2.5 rounded-xl hover:bg-[#FAF5F0] transition-colors flex items-start space-x-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#1A0B0E] text-[#721C24] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-sm">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#1A0B0E]">Butter Lamp Offerings</p>
                      <p className="text-[10px] text-gray-500 font-sans line-clamp-1">Dedicate prayers & merit</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* SHEDRA MONASTIC ACADEMY */}
          <Link
            to="/shedra"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#721C24] group ${
              isActive('/shedra') ? 'text-[#721C24]' : 'text-gray-700'
            }`}
          >
            <span>{t.shedra}</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#721C24] transition-all duration-300 ${
                isActive('/shedra') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>

          {/* LEARNING */}
          <Link
            to="/learning"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#721C24] group ${
              isActive('/learning') ? 'text-[#721C24]' : 'text-gray-700'
            }`}
          >
            <span>{t.learning}</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#721C24] transition-all duration-300 ${
                isActive('/learning') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>

          {/* BLOG */}
          <Link
            to="/blog"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#721C24] group ${
              isActive('/blog') ? 'text-[#721C24]' : 'text-gray-700'
            }`}
          >
            <span>{t.blog}</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#721C24] transition-all duration-300 ${
                isActive('/blog') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>

          {/* GALLERY */}
          <Link
            to="/gallery"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#721C24] group ${
              isActive('/gallery') ? 'text-[#721C24]' : 'text-gray-700'
            }`}
          >
            <span>{t.gallery}</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#721C24] transition-all duration-300 ${
                isActive('/gallery') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>

          {/* CONTACT */}
          <Link
            to="/contact"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#721C24] group ${
              isActive('/contact') ? 'text-[#721C24]' : 'text-gray-700'
            }`}
          >
            <span>{t.contact}</span>
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#721C24] transition-all duration-300 ${
                isActive('/contact') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* User Portal Link or Login */}
          {user ? (
            <Link
              to={isAdmin ? '/admin' : (user?.role?.slug === 'student_monk' ? '/student' : '/user')}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-[#FAF5F0] border border-[#D4AF37] text-[#1A0B0E] hover:bg-[#FEF3C7] transition-all shadow-sm"
            >
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-[#721C24]" /> : <User className="w-3.5 h-3.5 text-[#721C24]" />}
              <span className="hidden sm:inline max-w-[100px] truncate">
                {isAdmin ? 'Admin' : (user?.role?.slug === 'student_monk' ? 'Monk' : 'Sanctuary')}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 hover:text-[#721C24] hover:bg-amber-50/80 transition-all border border-gray-200"
            >
              <User className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t.login}</span>
            </Link>
          )}

          {/* Shimmering Golden & Burgundy DONATE CTA Button */}
          <button
            onClick={onOpenDonate || (() => navigate('/donate'))}
            className="monastic-maroon-btn relative group overflow-hidden flex items-center space-x-1.5 sm:space-x-2 px-3 xs:px-4 sm:px-5 py-2 rounded-full font-bold text-[10px] xs:text-[11px] sm:text-xs tracking-wider uppercase flex-shrink-0"
          >
            {/* Shimmering Light-Sweep Effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
            <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] fill-[#D4AF37] group-hover:scale-125 transition-transform" />
            <span className="whitespace-nowrap relative z-10 font-serif">
              {t.donate}
            </span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="xl:hidden p-2 rounded-full text-[#1A0B0E] hover:bg-amber-50/80 border border-gray-200 transition-colors shadow-sm active:scale-95"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. DYNAMIC GOLDEN SILK SCROLL PROGRESS RIBBON */}
      <div className="w-full bg-[#FAF5F0] h-[2px] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F6E05E] to-[#B45309] transition-all duration-150 ease-out shadow-[0_0_8px_rgba(212,175,55,0.7)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 4. LUXURY SLIDE-OVER MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden animate-fadeIn">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-[#120508]/98 backdrop-blur-2xl border-l border-[#D4AF37]/40 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-fade-in-up text-[#FCFBF9]">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#1A0B0E] border border-[#D4AF37] flex items-center justify-center shadow-md">
                    <span className="text-[#D4AF37] text-lg font-serif">☸</span>
                  </div>
                  <div>
                    <span className="font-editorial font-bold text-sm text-[#FCFBF9] block">
                      Drodul Phendey Ling
                    </span>
                    <span className="text-[10px] text-[#D4AF37] font-tibetan block">
                      ༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་།
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 font-serif text-sm">
                {[
                  { path: '/', label: t.home, icon: Compass },
                  { path: '/about', label: t.about, icon: Landmark },
                  { path: '/shedra', label: t.shedra, icon: GraduationCap },
                  { path: '/learning', label: t.learning, icon: BookOpen },
                  { path: '/blog', label: t.blog, icon: Newspaper },
                  { path: '/gallery', label: t.gallery, icon: ImageIcon },
                  { path: '/contact', label: t.contact, icon: MapPin },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        active
                          ? 'bg-gradient-to-r from-[#4A0E17] to-[#721C24] text-[#D4AF37] border border-[#D4AF37]/50 shadow-md font-bold'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </Link>
                  );
                })}
              </nav>

              {/* Auspicious Quick Actions Box */}
              <div className="pt-2 space-y-2.5">
                <Link
                  to="/prayer-request"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#4A0E17] via-[#6B1422] to-[#4A0E17] border border-[#D4AF37]/50 text-[#FCFBF9] text-xs font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  <Flame className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t.prayer}</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenDonate) onOpenDonate();
                    else navigate('/donate');
                  }}
                  className="w-full py-3 px-4 rounded-xl monastic-gold-btn text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  <Heart className="w-4 h-4 fill-[#2A080C]" />
                  <span>{t.donate}</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer: User Status & Language */}
            <div className="pt-6 border-t border-[#D4AF37]/20 space-y-3 font-serif">
              {user ? (
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{user.fullName}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{user.role?.name}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Exit</span>
                    </button>
                  </div>
                  <Link
                    to={isAdmin ? '/admin' : '/user'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Enter Sanctuary Panel
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold transition-colors border border-white/15"
                  >
                    {t.login}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B45309] text-[#1A0B0E] font-bold shadow transition-colors"
                  >
                    {t.register}
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2">
                <span>Language / སྐད་ཡིག:</span>
                <button
                  onClick={() => setLang(lang === 'English' ? 'Dzongkha' : 'English')}
                  className="text-[#D4AF37] font-bold hover:underline"
                >
                  {lang === 'English' ? 'Switch to རྫོང་ཁ' : 'Switch to English'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
