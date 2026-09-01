import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, ArrowRight, Play, CheckCircle2, Shield, Globe, FileText,
  Smartphone, Sparkles, HeartHandshake, GraduationCap, Landmark,
  BookOpen, Video, Calendar, Flame, Award, Sun, Users, Compass, ExternalLink, X
} from 'lucide-react';
import DonationModal from '../../components/DonationModal';
import api from '../../services/api';

export default function Home() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState(100);
  const [donateFrequency, setDonateFrequency] = useState('one_time');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const navigate = useNavigate();

  const handleHeroDonate = (amt) => {
    setDonateAmount(amt);
    setDonateModalOpen(true);
  };

  useEffect(() => {
    async function loadHomePreviews() {
      try {
        const [blogRes, videoRes] = await Promise.all([
          api.get('/blog?limit=3'),
          api.get('/learning')
        ]);
        if (blogRes.data.success) setRecentBlogs(blogRes.data.data.slice(0, 3));
        if (videoRes.data.success) setRecentVideos(videoRes.data.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load home previews:', err);
      }
    }
    loadHomePreviews();
  }, []);

  // Fallbacks for blogs and videos if database returns empty
  const displayBlogs = recentBlogs.length > 0 ? recentBlogs : [
    { id: 1, slug: 'spiritual-significance-peace-stupa', title: 'The Spiritual Significance of Great Druk Wangyel Peace Stupa', summary: 'Explore why stupas are regarded as the living mind of the Buddha and how this monument radiates blessings for global peace.', cover_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', published_at: '2026-08-20', author_name: 'Khenpo Tashi Dorji', tags: 'Peace Stupa' },
    { id: 2, slug: 'daily-life-shedra-monastic-university', title: 'Daily Life in the Shedra: Nurturing Compassion & Wisdom', summary: 'A glimpse into the daily schedule, philosophical debates, and meditation practices of our resident monk scholars.', cover_image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80', published_at: '2026-08-22', author_name: 'Lopen Karma Samten', tags: 'Shedra' },
    { id: 3, slug: 'merit-butter-lamp-offerings', title: 'The Merit of 108 Butter Lamp Offerings for World Peace', summary: 'How the light of butter lamps dispels the darkness of ignorance and generates merit for all sentient beings.', cover_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80', published_at: '2026-08-25', author_name: 'Dechen Wangmo', tags: 'Butter Lamps' }
  ];

  const displayVideos = recentVideos.length > 0 ? recentVideos.slice(0, 3) : [
    { id: 1, title: 'Introduction to the Four Noble Truths & Eightfold Path', category: 'Philosophy', duration_minutes: 45, level: 'Beginner', instructor: 'Khenpo Tashi Dorji', thumbnail_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80' },
    { id: 2, title: 'Shamatha Meditation & Calm Abiding Mind Practice', category: 'Meditation', duration_minutes: 60, level: 'Intermediate', instructor: 'Lopen Karma Samten', thumbnail_url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&w=1200&q=80' },
    { id: 3, title: 'The Way of the Bodhisattva: Cultivating Compassion', category: 'Philosophy', duration_minutes: 50, level: 'All Levels', instructor: 'Khenpo Tashi Dorji', thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80' }
  ];

  return (
    <div className="w-full relative space-y-16 pb-16">
      {/* ========================================================= */}
      {/* 1. HERO SECTION & FLOATING GLASS DONATION WIDGET         */}
      {/* ========================================================= */}
      <section className="relative min-h-[680px] bg-gradient-to-r from-[#20040A] via-[#3D0A13] to-[#1A0307] text-white overflow-hidden py-16 px-4 sm:px-8 flex items-center">
        {/* Background Dochula Peace Stupas */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-luminosity bg-cover bg-center pointer-events-none scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#20040A] via-transparent to-[#1A0307]/80 opacity-90 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tibetan Calligraphy Floating Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-[#D4AF37]/50 text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-wider animate-float shadow-xl">
              <span className="font-tibetan text-base">༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-[11px] uppercase tracking-widest text-amber-200">Gelephu, Bhutan</span>
            </div>

            <h1 className="font-serif-brand font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-wide leading-tight drop-shadow-lg">
              BUILDING A SACRED LEGACY <br />
              <span className="gold-foil-text">OF PEACE & WISDOM</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-200 max-w-xl font-light leading-relaxed">
              Constructing the monumental 108ft Great Druk Wangyel Peace Stupa, expanding the Shedra Monastic University, and preserving authentic Buddha Dharma for global harmony in Gelephu, Bhutan.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setDonateModalOpen(true)}
                className="gold-gradient-btn text-white px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2.5 shadow-2xl transition-all border border-[#D4AF37]/60 group"
              >
                <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37] group-hover:scale-125 transition-transform" />
                <span>OFFER A DONATION</span>
              </button>

              <Link
                to="/about"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 border border-white/30 transition-all hover:border-[#D4AF37] shadow-lg"
              >
                <span>EXPLORE OUR WORK</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </Link>
            </div>
          </div>

          {/* Right Floating Glass Widget: DEDICATE YOUR MERIT */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="glass-panel text-gray-900 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.4)] border border-white/80 max-w-md w-full animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-3 mb-4">
                <div>
                  <h3 className="font-serif-brand font-bold text-base text-[#4A0E17] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>DEDICATE YOUR MERIT</span>
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    Directly supports stupa stone carving and resident monks.
                  </p>
                </div>
                <span className="glow-pill-emerald px-2.5 py-1 rounded-full text-[10px] font-bold">
                  80G 100% Tax-Exempt
                </span>
              </div>

              {/* Frequency Selector */}
              <div className="grid grid-cols-2 gap-2 bg-gray-100/80 p-1 rounded-xl mb-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDonateFrequency('one_time')}
                  className={`py-1.5 rounded-lg transition-all ${
                    donateFrequency === 'one_time'
                      ? 'bg-[#4A0E17] text-white shadow-md'
                      : 'text-gray-700 hover:text-[#4A0E17]'
                  }`}
                >
                  One-Time Offering
                </button>
                <button
                  type="button"
                  onClick={() => setDonateFrequency('monthly')}
                  className={`py-1.5 rounded-lg transition-all ${
                    donateFrequency === 'monthly'
                      ? 'bg-[#4A0E17] text-white shadow-md'
                      : 'text-gray-700 hover:text-[#4A0E17]'
                  }`}
                >
                  Monthly Pledge
                </button>
              </div>

              {/* Preset Amount Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[100, 500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonateAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      donateAmount === amt
                        ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37] shadow-md scale-105'
                        : 'bg-white/80 text-gray-800 border-gray-200 hover:border-[#D4AF37]'
                    }`}
                  >
                    ₹ {amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Custom Offering Amount (₹ INR / BTN Nu.)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    min="10"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(Number(e.target.value))}
                    className="glass-input w-full pl-8 pr-3 py-2 text-xs font-bold rounded-xl text-gray-900"
                  />
                </div>
              </div>

              {/* Merit Impact Description */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-5 text-[11px] text-amber-900 flex items-start space-x-2">
                <Flame className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  {donateAmount >= 5000
                    ? 'Sponsors 108 consecrated butter lamps, puja prayers, and stone carving work.'
                    : donateAmount >= 1000
                    ? 'Provides sacred study texts and nutritious meals for 5 young monk scholars.'
                    : 'Dedicated to world peace prayers and the construction of the Great Peace Stupa.'}
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setDonateModalOpen(true)}
                className="w-full gold-gradient-btn text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl border border-[#D4AF37]/50"
              >
                <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span>PROCEED TO OFFERING</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. COLORFUL FROSTED GLASS IMPACT STATS RIBBON            */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 -mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Stat 1: Imperial Gold (Peace Stupa) */}
          <div className="glass-card-interactive p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-amber-500">
            <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-sm p-3">
              <Landmark className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-[#4A0E17]">
                108 <span className="text-amber-600 text-lg">FT</span>
              </div>
              <p className="text-xs font-bold text-gray-700">Great Peace Stupa</p>
              <p className="text-[11px] text-gray-500">World peace monument in Gelephu</p>
            </div>
          </div>

          {/* Stat 2: Celestial Sapphire (Shedra Monks) */}
          <div className="glass-card-interactive p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-blue-500">
            <div className="w-13 h-13 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 shadow-sm p-3">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-[#4A0E17]">
                350<span className="text-blue-600">+</span>
              </div>
              <p className="text-xs font-bold text-gray-700">Monk Scholars</p>
              <p className="text-[11px] text-gray-500">Full residential Shedra education</p>
            </div>
          </div>

          {/* Stat 3: Vibrant Ruby (Butter Lamps) */}
          <div className="glass-card-interactive p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-rose-500">
            <div className="w-13 h-13 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 shadow-sm p-3">
              <Flame className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <div className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-[#4A0E17]">
                108 <span className="text-rose-600 text-lg">DAILY</span>
              </div>
              <p className="text-xs font-bold text-gray-700">Butter Lamp Offerings</p>
              <p className="text-[11px] text-gray-500">Consecrated prayers for donors</p>
            </div>
          </div>

          {/* Stat 4: Sacred Emerald (Tax Exemption) */}
          <div className="glass-card-interactive p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-emerald-500">
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm p-3">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-emerald-700">
                100<span className="text-emerald-600">%</span>
              </div>
              <p className="text-xs font-bold text-gray-700">Tax Deductible</p>
              <p className="text-[11px] text-gray-500">Instant signed 80G tax receipt</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. "WATCH OUR SACRED STORY" DOCUMENTARY BANNER           */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="glass-card-interactive overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/80 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Video Preview with Punakha Dzong */}
            <div className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer aspect-video bg-gray-900 border-2 border-amber-400/40"
                 onClick={() => setVideoModalOpen(true)}>
              <img
                src="https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80"
                alt="Punakha Dzong & Monastery Bhutan"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Glowing Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#4A0E17]/90 text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center shadow-2xl animate-gold-pulse group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-[#D4AF37] ml-1" />
                </div>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                <span className="font-semibold drop-shadow flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Sacred Monastery Documentary
                </span>
                <span className="glow-pill-gold px-2 py-0.5 rounded text-[10px] font-bold">
                  8:24 mins
                </span>
              </div>
            </div>

            {/* Right: Documentary Description */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center space-x-2 glow-pill-gold px-3 py-1 rounded-full text-xs font-bold">
                <Award className="w-4 h-4" />
                <span>Monastery Documentary & Vision</span>
              </div>

              <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#4A0E17] leading-snug">
                From Sacred Lineage to Global World Peace
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Nestled in the tranquil Himalayan foothills of Gelephu, Bhutan, Drodul Phendey Ling Foundation brings together revered Buddhist masters, dedicated monk scholars, and international patrons to preserve centuries-old Tibetan Buddhist heritage and complete the historic Great Druk Wangyel Peace Stupa.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="gold-gradient-btn text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  <span>WATCH FULL FILM</span>
                </button>
                <Link
                  to="/gallery"
                  className="bg-white/80 hover:bg-white text-gray-800 border border-gray-300 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:border-[#D4AF37]"
                >
                  <span>EXPLORE PHOTO GALLERY</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FOUR SACRED PILLARS (COLORFUL GLASS CARDS)             */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="glow-pill-gold px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Our Noble Mission
          </span>
          <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#4A0E17]">
            Four Pillars of Sacred Merit
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Dedicated programs empowering Buddhist scholarship, architectural preservation, and spiritual welfare.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Gold (Stupa) */}
          <div className="glass-card-interactive p-6 rounded-2xl flex flex-col justify-between space-y-4 border-t-4 border-t-amber-500">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
                World Peace Stupa
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                The 108-foot Great Druk Wangyel Peace Stupa houses sacred Buddhist relics, 108 prayer wheels, and serves as a spiritual sanctuary for global harmony.
              </p>
            </div>
            <Link
              to="/donate"
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 group/link pt-2"
            >
              <span>Sponsor Construction</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Pillar 2: Sapphire (Shedra) */}
          <div className="glass-card-interactive p-6 rounded-2xl flex flex-col justify-between space-y-4 border-t-4 border-t-blue-500">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-700">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
                Shedra Monastic University
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Providing full scholarships, classical Buddhist philosophy, Tibetan language, and debate training for over 350 enrolled monks.
              </p>
            </div>
            <Link
              to="/donate"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group/link pt-2"
            >
              <span>Support Education</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Pillar 3: Ruby (Butter Lamps) */}
          <div className="glass-card-interactive p-6 rounded-2xl flex flex-col justify-between space-y-4 border-t-4 border-t-rose-500">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-700">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
                108 Butter Lamp Offerings
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Daily consecrated butter lamps dedicated to world peace, health, longevity, and obstacle clearance for devotees and sponsors worldwide.
              </p>
            </div>
            <Link
              to="/prayer-request"
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 group/link pt-2"
            >
              <span>Request Dedication</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Pillar 4: Emerald (Sangha Care) */}
          <div className="glass-card-interactive p-6 rounded-2xl flex flex-col justify-between space-y-4 border-t-4 border-t-emerald-500">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif-brand font-bold text-base text-[#4A0E17]">
                Sangha Care & Welfare
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Nutritious vegetarian meals, monk robes, health checkups, and community relief initiatives for the surrounding Himalayan communities.
              </p>
            </div>
            <Link
              to="/donate"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 group/link pt-2"
            >
              <span>Support Sangha</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. OPEN DHARMA VIDEO DISCOURSES                           */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200/80 pb-4">
          <div>
            <span className="glow-pill-sapphire px-3 py-1 rounded-full text-xs font-bold">
              Digital Dharma Library
            </span>
            <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#4A0E17] mt-1">
              Open Video Discourses & Teachings
            </h2>
          </div>
          <Link
            to="/learning"
            className="text-xs font-bold text-[#8B1E2F] hover:text-[#4A0E17] flex items-center gap-1 group"
          >
            <span>View All Lectures</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayVideos.map((video) => (
            <div
              key={video.id}
              className="glass-card-interactive overflow-hidden rounded-2xl flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-gray-900">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute top-3 left-3 glow-pill-sapphire px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {video.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {video.duration_minutes} mins
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">
                    {video.instructor}
                  </p>
                  <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] leading-snug group-hover:text-[#8B1E2F] transition-colors">
                    {video.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to="/learning"
                  className="w-full bg-white/80 hover:bg-white text-gray-800 border border-gray-200 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:border-[#D4AF37]"
                >
                  <Play className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                  <span>WATCH LECTURE</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. SACRED BUTTER LAMP INVOCATION BANNER (WARM GOLD GLASS) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-[#2A0810] via-[#4A0E17] to-[#20040A] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-[#D4AF37]/50">
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none mix-blend-luminosity"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80')` }}
          />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Consecrated Daily Prayers</span>
            </div>

            <h2 className="font-serif-brand font-extrabold text-2xl sm:text-4xl text-white leading-tight">
              Offer 108 Sacred Butter Lamps <br />
              <span className="gold-foil-text">For World Peace & Family Health</span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-light">
              Submit personal prayer intentions and names of loved ones. Our resident Shedra monks will chant consecrated prayers and illuminate 108 brass butter lamps in the holy shrine altar.
            </p>

            <div className="pt-3 flex flex-wrap gap-4">
              <Link
                to="/prayer-request"
                className="gold-gradient-btn text-white px-7 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-xl border border-[#D4AF37]/60"
              >
                <Flame className="w-4 h-4 text-[#D4AF37]" />
                <span>OFFER BUTTER LAMPS NOW</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. MONASTERY JOURNAL & WISDOM ARTICLES                     */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200/80 pb-4">
          <div>
            <span className="glow-pill-ruby px-3 py-1 rounded-full text-xs font-bold">
              Monastery Publications
            </span>
            <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#4A0E17] mt-1">
              Wisdom Articles & Spiritual Insights
            </h2>
          </div>
          <Link
            to="/blog"
            className="text-xs font-bold text-[#8B1E2F] hover:text-[#4A0E17] flex items-center gap-1 group"
          >
            <span>Read All Articles</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayBlogs.map((blog) => (
            <article
              key={blog.id}
              className="glass-card-interactive overflow-hidden rounded-2xl flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-gray-900">
                  <img
                    src={blog.cover_image}
                    alt={blog.title}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute top-3 left-3 glow-pill-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {blog.tags?.split(',')[0] || 'Dharma'}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center space-x-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {new Date(blog.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] leading-snug group-hover:text-[#8B1E2F] transition-colors line-clamp-2">
                    <Link to={`/blog/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {blog.summary}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to={`/blog/${blog.slug}`}
                  className="text-xs font-bold text-[#8B1E2F] hover:text-[#4A0E17] flex items-center gap-1 group/link"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Video Lightbox Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-gray-950 rounded-2xl overflow-hidden border border-[#D4AF37]/50 shadow-2xl">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#8B1E2F] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Monastery Documentary"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {donateModalOpen && (
        <DonationModal
          initialAmount={donateAmount}
          initialType={donateFrequency}
          onClose={() => setDonateModalOpen(false)}
        />
      )}
    </div>
  );
}
