import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart, MapPin, Phone, Mail, Globe, ChevronDown, ChevronRight, Menu, X,
  User, LogOut, ShieldCheck, GraduationCap, Flame, Calendar, Image as ImageIcon,
  BookOpen, Sparkles, Building, Landmark, Compass, Award, HandHeart, Newspaper, Video, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PrayerFlagsRibbon from './PrayerFlagsRibbon';
import SectionEditBadge from './SectionEditBadge';
import api from '../services/api';

export default function Navbar({ onOpenDonate }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Live Settings
  const [liveSettings, setLiveSettings] = useState({
    header_phone: '+975 17556559',
    header_email: 'contact@drodulphendeyling.org',
    header_location: 'Gelephu, Bhutan',
    header_announcement: '☸ Welcoming Devotees to the Historic 108ft Great Druk Wangyel Peace Stupa • 80G Tax Exemption Available',
    header_announcement_on: 'true'
  });

  const openLiveEditor = (sec = 'navbar') => {
    window.dispatchEvent(new CustomEvent('ngo:open-live-editor', { detail: { section: sec } }));
  };

  useEffect(() => {
    api.get('/settings').then((res) => {
      if (res.data?.success && res.data.data) {
        setLiveSettings((prev) => ({ ...prev, ...res.data.data }));
      }
    }).catch(() => {});

    const handleUpdate = (e) => {
      if (e.detail?.settings) {
        setLiveSettings((prev) => ({ ...prev, ...e.detail.settings }));
      }
    };
    window.addEventListener('ngo:settings-updated', handleUpdate);
    return () => window.removeEventListener('ngo:settings-updated', handleUpdate);
  }, []);

  // Dynamic Navigation Items
  const [navItems, setNavItems] = useState([]);

  useEffect(() => {
    const loadNav = () => {
      api.get('/navigation').then((res) => {
        const headerList = res.data?.data?.header || res.data?.header;
        if (Array.isArray(headerList) && headerList.length > 0) {
          setNavItems(headerList.filter(item => (item.isActive ?? item.is_active ?? true)));
        }
      }).catch(() => {});
    };
    loadNav();
    window.addEventListener('ngo:navigation-updated', loadNav);
    return () => window.removeEventListener('ngo:navigation-updated', loadNav);
  }, []);

  // Scroll Progress Ribbon State
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Mobile Drawer & Dropdowns
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [navMoreOpen, setNavMoreOpen] = useState(false);

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
    <header data-ngo-section="navbar" className="w-full z-40 sticky top-0 bg-white/95 backdrop-blur-xl shadow-[0_4px_25px_rgba(15,23,42,0.06)] border-b border-[#D4AF37]/30 transition-all duration-300 relative">
      {/* 0. BHUTANESE PRAYER FLAGS RIBBON */}
      <PrayerFlagsRibbon />

      {/* 1. TOP UTILITY BAR (Deep Monastic Obsidian) */}
      <div className="bg-[#070A12] text-[#E2E8F0] text-[10px] sm:text-xs py-1.5 px-3 sm:px-8 border-b border-[#D4AF37]/20 relative overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2 min-w-max sm:min-w-0">
          {/* Left contact info */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="flex items-center space-x-1.5 text-gray-300 hover:text-[#D4AF37] transition-colors cursor-default">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span className="hidden xs:inline truncate max-w-[130px] sm:max-w-none">{liveSettings.header_location || 'Gelephu, Bhutan'}</span>
              <span className="xs:hidden">Bhutan</span>
            </div>
            <div className="flex items-center space-x-1.5 text-gray-300 hover:text-[#D4AF37] transition-colors cursor-default">
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span className="font-mono">{liveSettings.header_phone || '+975 17556559'}</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1.5 text-gray-300 hover:text-[#D4AF37] transition-colors cursor-default">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
              <span className="font-mono">{liveSettings.header_email || 'contact@drodulphendeyling.org'}</span>
            </div>
          </div>

          {/* Right quick links & language switcher */}
          <div className="flex items-center space-x-2.5 sm:space-x-5 text-[10px] sm:text-[11px] flex-shrink-0">
            <SectionEditBadge
              sectionKey="navbar"
              sectionLabel="Edit Header"
              onQuickEdit={openLiveEditor}
              position="relative top-0 right-0"
            />

            <Link
              to="/prayer-request"
              className="text-[#F6E05E] hover:text-[#D4AF37] flex items-center gap-1 transition-colors font-medium"
            >
              <Flame className="w-3 h-3 text-[#D4AF37]" />
              <span className="hidden sm:inline">108 Butter Lamps</span>
              <span className="sm:hidden">Prayers</span>
            </Link>

            <Link to="/tracking" className="text-[#D4AF37] hover:text-white transition-colors font-medium hidden xs:flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Track Offering</span>
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

      {/* 1.1 LIVE ANNOUNCEMENT TICKER BANNER */}
      {liveSettings.header_announcement_on === 'true' && liveSettings.header_announcement && (
        <div className="bg-gradient-to-r from-[#721C24] via-[#8B1E29] to-[#721C24] text-white py-1 px-3 sm:px-8 text-[11px] sm:text-xs font-serif tracking-wide border-b border-[#D4AF37]/30 shadow-inner flex items-center justify-center gap-2 animate-fadeIn text-center">
          <span className="text-[#D4AF37] font-bold text-xs">☸</span>
          <span className="truncate">{liveSettings.header_announcement}</span>
        </div>
      )}

      {/* 2. MAIN HEADER & BRAND */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2 sm:py-3.5 flex items-center justify-between gap-3 lg:gap-4">
        {/* Brand Crest & Logo */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-3.5 group flex-shrink-0 whitespace-nowrap">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#1A0B0E] via-[#4A0E17] to-[#1A0B0E] border-2 border-[#D4AF37] flex items-center justify-center shadow-lg ring-2 ring-[#D4AF37]/20 group-hover:scale-105 group-hover:border-amber-300 transition-all flex-shrink-0">
            <span className="text-[#D4AF37] text-lg sm:text-2xl font-serif font-bold group-hover:rotate-180 transition-transform duration-700">
              ☸
            </span>
          </div>
          <div className="flex-shrink-0 whitespace-nowrap">
            <h1 className="font-serif-brand font-bold text-xs xs:text-sm sm:text-base xl:text-base 2xl:text-lg text-[#0F172A] tracking-wider leading-tight whitespace-nowrap group-hover:text-[#721C24] transition-colors">
              DRODUL PHENDEY LING
            </h1>
            <p className="text-[8px] xs:text-[9px] sm:text-[10px] text-amber-700 font-semibold tracking-wider font-tibetan whitespace-nowrap">
              ༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ། · Bhutan
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links (Device-friendly auto-adjusting responsive flex layout) */}
        <nav className="hidden lg:flex items-center space-x-2 xl:space-x-5 2xl:space-x-7 text-[11px] xl:text-xs font-bold text-[#1E293B] tracking-wide uppercase flex-1 justify-center min-w-0">
          {/* HOME */}
          <Link
            to="/"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#721C24] group whitespace-nowrap flex-shrink-0 ${
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
            className={`relative py-1.5 transition-all duration-200 hover:text-[#721C24] group whitespace-nowrap flex-shrink-0 ${
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
            className="relative flex-shrink-0"
            onMouseEnter={() => setActiveDropdown('activities')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className={`flex items-center gap-1 py-1.5 transition-all duration-200 hover:text-[#721C24] group whitespace-nowrap ${
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
              <div className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.22)] border-2 border-[#D4AF37] p-2.5 animate-scale-in z-50 ring-1 ring-black/5">
                <div className="space-y-1.5 text-xs font-serif">
                  <Link
                    to="/about"
                    className="p-2.5 rounded-xl hover:bg-[#FAF5F0] transition-colors flex items-start space-x-3 group border border-transparent hover:border-[#D4AF37]/30"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#1A0B0E] text-[#721C24] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-xs">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#0F172A] group-hover:text-[#721C24] leading-tight">Great Druk Wangyel Peace Stupa</p>
                      <p className="text-[10.5px] text-gray-600 font-sans line-clamp-1 mt-0.5">108ft sacred monument for world peace</p>
                    </div>
                  </Link>

                  <Link
                    to="/shedra"
                    className="p-2.5 rounded-xl hover:bg-[#FAF5F0] transition-colors flex items-start space-x-3 group border border-transparent hover:border-[#D4AF37]/30"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#1A0B0E] text-[#721C24] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#0F172A] group-hover:text-[#721C24] leading-tight">Shedra Monastic University</p>
                      <p className="text-[10.5px] text-gray-600 font-sans line-clamp-1 mt-0.5">9-year higher Buddhist philosophy degrees</p>
                    </div>
                  </Link>

                  <Link
                    to="/prayer-request"
                    className="p-2.5 rounded-xl hover:bg-[#FAF5F0] transition-colors flex items-start space-x-3 group border border-transparent hover:border-[#D4AF37]/30"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#1A0B0E] text-[#721C24] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-xs">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#0F172A] group-hover:text-[#721C24] leading-tight">Butter Lamp Offerings</p>
                      <p className="text-[10.5px] text-gray-600 font-sans line-clamp-1 mt-0.5">Dedicate prayers & merit</p>
                    </div>
                  </Link>

                  <Link
                    to="/tracking"
                    className="p-2.5 rounded-xl hover:bg-[#FAF5F0] transition-colors flex items-start space-x-3 group border border-transparent hover:border-[#D4AF37]/30"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#1A0B0E] text-[#721C24] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#0F172A] group-hover:text-[#721C24] leading-tight">Track Offering Status</p>
                      <p className="text-[10.5px] text-gray-600 font-sans line-clamp-1 mt-0.5">Live bank & prayer progress</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* SHEDRA MONASTIC ACADEMY */}
          <Link
            to="/shedra"
            className={`relative py-1.5 transition-all duration-200 hover:text-[#721C24] group whitespace-nowrap flex-shrink-0 ${
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
            className={`relative py-1.5 transition-all duration-200 hover:text-[#721C24] group whitespace-nowrap flex-shrink-0 ${
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

          {/* MORE DROPDOWN (Blog, Gallery, Contact, Custom Pages) */}
          <div
            className="relative flex-shrink-0"
            onMouseEnter={() => setNavMoreOpen(true)}
            onMouseLeave={() => setNavMoreOpen(false)}
          >
            <button
              type="button"
              onClick={() => setNavMoreOpen(!navMoreOpen)}
              className={`flex items-center gap-1 py-1.5 transition-all duration-200 hover:text-[#721C24] group whitespace-nowrap ${
                ['/blog', '/gallery', '/contact', '/news-events'].includes(location.pathname) || location.pathname.startsWith('/pages/')
                  ? 'text-[#721C24]'
                  : 'text-gray-700'
              }`}
            >
              <span>More</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#D4AF37] transition-transform duration-200 ${
                  navMoreOpen ? 'rotate-180' : ''
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#721C24] transition-all duration-300 ${
                  ['/blog', '/gallery', '/contact', '/news-events'].includes(location.pathname) || location.pathname.startsWith('/pages/')
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`}
              />
            </button>

            {navMoreOpen && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.22)] border-2 border-[#D4AF37] p-2.5 z-50 animate-fadeIn space-y-1.5 text-xs font-serif ring-1 ring-black/5">
                <Link
                  to="/blog"
                  onClick={() => setNavMoreOpen(false)}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-between group border ${
                    isActive('/blog')
                      ? 'bg-[#FAF5F0] text-[#721C24] border-[#D4AF37]'
                      : 'text-gray-800 hover:bg-[#FAF5F0] border-transparent hover:border-[#D4AF37]/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#1A0B0E] text-[#721C24] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-xs">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#0F172A] group-hover:text-[#721C24] leading-tight">{t.blog}</p>
                      <p className="text-[10.5px] text-gray-600 font-sans line-clamp-1 mt-0.5">Sacred articles & teachings</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#721C24] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>

                <Link
                  to="/gallery"
                  onClick={() => setNavMoreOpen(false)}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-between group border ${
                    isActive('/gallery')
                      ? 'bg-[#FAF5F0] text-[#721C24] border-[#D4AF37]'
                      : 'text-gray-800 hover:bg-[#FAF5F0] border-transparent hover:border-[#D4AF37]/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#1A0B0E] text-[#721C24] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-xs">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#0F172A] group-hover:text-[#721C24] leading-tight">{t.gallery}</p>
                      <p className="text-[10.5px] text-gray-600 font-sans line-clamp-1 mt-0.5">Monastery photo archives</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#721C24] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>

                <Link
                  to="/news-events"
                  onClick={() => setNavMoreOpen(false)}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-between group border ${
                    isActive('/news-events')
                      ? 'bg-[#FAF5F0] text-[#721C24] border-[#D4AF37]'
                      : 'text-gray-800 hover:bg-[#FAF5F0] border-transparent hover:border-[#D4AF37]/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#1A0B0E] text-[#721C24] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#0F172A] group-hover:text-[#721C24] leading-tight">News & Events</p>
                      <p className="text-[10.5px] text-gray-600 font-sans line-clamp-1 mt-0.5">Upcoming pujas & ceremonies</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#721C24] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setNavMoreOpen(false)}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-between group border ${
                    isActive('/contact')
                      ? 'bg-[#FAF5F0] text-[#721C24] border-[#D4AF37]'
                      : 'text-gray-800 hover:bg-[#FAF5F0] border-transparent hover:border-[#D4AF37]/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#1A0B0E] text-[#721C24] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#0F172A] group-hover:text-[#721C24] leading-tight">{t.contact}</p>
                      <p className="text-[10.5px] text-gray-600 font-sans line-clamp-1 mt-0.5">Secretariat desk & inquiry</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#721C24] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>

                {/* Any dynamic custom pages created in Admin */}
                {navItems
                  .filter((item) => item.url?.startsWith('/pages/') || (item.url && !['/', '/about', '/shedra', '/learning', '/prayer-request', '/blog', '/gallery', '/contact', '/news-events', '/tracking'].includes(item.url)))
                  .map((item) => (
                    <Link
                      key={item.id || item.url}
                      to={item.url}
                      onClick={() => setNavMoreOpen(false)}
                      className={`p-2.5 rounded-xl transition-all flex items-center justify-between group border ${
                        isActive(item.url)
                          ? 'bg-[#FAF5F0] text-[#721C24] border-[#D4AF37]'
                          : 'text-gray-800 hover:bg-[#FAF5F0] border-transparent hover:border-[#D4AF37]/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#FAF5F0] group-hover:bg-[#1A0B0E] text-[#721C24] group-hover:text-[#D4AF37] flex items-center justify-center flex-shrink-0 transition-colors shadow-xs">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-[#0F172A] group-hover:text-[#721C24] leading-tight truncate">{item.label || item.title}</p>
                          <p className="text-[10.5px] text-gray-600 font-sans line-clamp-1 mt-0.5">Dedicated sacred page</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#721C24] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3 flex-shrink-0 whitespace-nowrap">
          {/* User Portal Link or Login (Hidden on mobile header, cleanly available in drawer) */}
          {user ? (
            <Link
              to={isAdmin ? '/admin' : (user?.role?.slug === 'student_monk' ? '/student' : '/user')}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-[#FAF5F0] border border-[#D4AF37] text-[#1A0B0E] hover:bg-[#FEF3C7] transition-all shadow-sm"
            >
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-[#721C24]" /> : <User className="w-3.5 h-3.5 text-[#721C24]" />}
              <span className="max-w-[100px] truncate">
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
            className="monastic-maroon-btn relative group overflow-hidden flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 px-2.5 xs:px-3.5 sm:px-5 py-1.5 xs:py-2 rounded-full font-bold text-[10px] xs:text-[11px] sm:text-xs tracking-wider uppercase flex-shrink-0 shadow-md"
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
            className="lg:hidden p-1.5 xs:p-2 rounded-full text-[#1A0B0E] hover:bg-amber-50/80 border border-gray-200 transition-colors shadow-sm active:scale-95 flex-shrink-0"
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
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] lg:hidden flex justify-end">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn"
          />

          {/* Drawer Container */}
          <div className="relative w-[85%] max-w-xs sm:max-w-sm h-full bg-[#120508]/98 backdrop-blur-2xl border-l border-[#D4AF37]/40 shadow-2xl z-10 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto animate-fade-in-up text-[#FCFBF9]">
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
                {navItems.length > 0 ? (
                  navItems.map((item) => {
                    const isExt = item.url?.startsWith('http');
                    const active = isActive(item.url);
                    return isExt ? (
                      <a
                        key={item.id || item.url}
                        href={item.url}
                        target={item.target || '_blank'}
                        rel="noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl transition-all text-gray-300 hover:text-white hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <Compass className="w-4 h-4 text-gray-400" />
                          <span>{item.label || item.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </a>
                    ) : (
                      <Link
                        key={item.id || item.url}
                        to={item.url}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                          active
                            ? 'bg-gradient-to-r from-[#4A0E17] to-[#721C24] text-[#D4AF37] border border-[#D4AF37]/50 shadow-md font-bold'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Compass className={`w-4 h-4 ${active ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                          <span>{item.label || item.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </Link>
                    );
                  })
                ) : (
                  [
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
                  })
                )}
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
        </div>,
        document.body
      )}
    </header>
  );
}
