import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, ArrowRight, Play, CheckCircle2, Shield, Globe, FileText,
  Smartphone, Sparkles, HeartHandshake, GraduationCap, Landmark,
  BookOpen, Video, Calendar, Flame, Award, Sun, Users, Compass
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

  return (
    <div className="w-full">
      {/* 1. HERO BANNER & FLOATING DONATE WIDGET */}
      <section className="relative min-h-[660px] bg-gradient-to-r from-[#2C060D] via-[#4A0E17] to-[#1F0408] text-white overflow-hidden py-16 px-4 sm:px-8 flex items-center">
        {/* Background Monastery Stupa Image with Warm Overlay */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-luminosity bg-cover bg-center pointer-events-none scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C060D] via-transparent to-transparent opacity-95"></div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tibetan Calligraphy Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#D4AF37]/50 text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-wider animate-float shadow-lg">
              <span className="font-tibetan text-base">༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              <span className="text-[11px] uppercase tracking-widest text-amber-200">Gelephu, Bhutan</span>
            </div>

            <h1 className="font-serif-brand font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-wide leading-tight drop-shadow-md">
              BUILDING A SACRED LEGACY <br />
              <span className="gold-foil-text">OF PEACE & WISDOM</span>
            </h1>

            <p className="text-sm sm:text-base text-[#F3F4F6] max-w-xl font-light leading-relaxed">
              Constructing the monumental 108ft Great Druk Wangyel Peace Stupa, expanding the Shedra Monastic University, and preserving authentic Buddha Dharma for global harmony in Gelephu, Bhutan.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setDonateModalOpen(true)}
                className="gold-gradient-btn text-white px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2.5 shadow-xl transition-all border border-[#D4AF37]/60 group"
              >
                <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37] group-hover:scale-125 transition-transform" />
                <span>OFFER A DONATION</span>
              </button>

              <Link
                to="/about"
                className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 border border-white/30 transition-all hover:border-[#D4AF37]"
              >
                <span>EXPLORE OUR WORK</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </Link>
            </div>
          </div>

          {/* Right Floating Widget: MAKE A DIFFERENCE */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="bg-white/95 backdrop-blur-xl text-gray-900 rounded-2xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.35)] border-2 border-[#D4AF37]/60 max-w-md w-full animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div>
                  <h3 className="font-serif-brand font-bold text-base text-[#4A0E17] uppercase tracking-wider">
                    DEDICATE YOUR MERIT
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Your contribution directly supports stupa construction and resident monks.
                  </p>
                </div>
                <span className="text-2xl text-[#D4AF37]">☸</span>
              </div>

              {/* Frequency Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-[#F8F6F0] p-1.5 rounded-lg border border-[#EBE5D8] mb-4">
                <button
                  type="button"
                  onClick={() => setDonateFrequency('one_time')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                    donateFrequency === 'one_time' ? 'bg-[#4A0E17] text-white shadow-md' : 'text-gray-700 hover:text-black'
                  }`}
                >
                  One Time Offering
                </button>
                <button
                  type="button"
                  onClick={() => setDonateFrequency('recurring')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                    donateFrequency === 'recurring' ? 'bg-[#4A0E17] text-white shadow-md' : 'text-gray-700 hover:text-black'
                  }`}
                >
                  Monthly Pledge
                </button>
              </div>

              {/* Presets */}
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Select Amount (INR / BTN)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonateAmount(amt)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      donateAmount === amt
                        ? 'bg-[#7E1929] text-white border-[#7E1929] shadow-md scale-105'
                        : 'bg-white text-gray-800 border-gray-300 hover:border-[#D4AF37]'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="relative mb-5">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="Other Custom Amount"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-xs font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7E1929]"
                />
              </div>

              {/* Primary CTA */}
              <button
                type="button"
                onClick={() => setDonateModalOpen(true)}
                className="w-full gold-gradient-btn text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition-all border border-[#D4AF37]/50"
              >
                <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span>DONATE ₹{donateAmount} NOW</span>
              </button>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center space-x-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1 font-medium">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  100% Tax Deductible
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Instant 80G PDF Receipt
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK STATS & IMPACT RIBBON */}
      <section className="bg-[#4A0E17] text-white py-6 px-4 sm:px-8 border-y-2 border-[#D4AF37]/60 shadow-md">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-[#D4AF37]">108 FT</span>
            <p className="text-xs text-[#FDF6E2] uppercase tracking-wider font-semibold">Great Peace Stupa</p>
          </div>
          <div className="space-y-1">
            <span className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-[#D4AF37]">350+</span>
            <p className="text-xs text-[#FDF6E2] uppercase tracking-wider font-semibold">Monks & Scholars</p>
          </div>
          <div className="space-y-1">
            <span className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-[#D4AF37]">108 DAILY</span>
            <p className="text-xs text-[#FDF6E2] uppercase tracking-wider font-semibold">Butter Lamp Prayers</p>
          </div>
          <div className="space-y-1">
            <span className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-[#D4AF37]">100%</span>
            <p className="text-xs text-[#FDF6E2] uppercase tracking-wider font-semibold">Tax-Deductible 80G</p>
          </div>
        </div>
      </section>

      {/* 3. ABOUT DPL FOUNDATION, VIDEO & MISSION */}
      <section className="py-16 px-4 sm:px-8 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Col 1: About Text */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-bold text-[#8B1E2F] uppercase tracking-widest block">
              Sacred Mission & Vision
            </span>
            <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#4A0E17] leading-snug">
              Preserving Bhutan’s Spiritual Heritage for World Peace
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
              Drodul Phendey Ling Foundation is a Buddhist charitable trust registered in Bhutan. Under the guidance of venerable masters, we foster spiritual enlightenment, community relief, monastic education, and the historic construction of the Great Druk Wangyel Peace Stupa.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center space-x-2 bg-[#4A0E17] hover:bg-[#5A121E] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md transition-all border border-[#D4AF37]/40"
            >
              <span>LEARN MORE ABOUT US</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </Link>
          </div>

          {/* Col 2: Embedded Video Block with Glowing Play Button */}
          <div className="lg:col-span-4">
            <div
              className="relative rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-xl group cursor-pointer"
              onClick={() => setVideoModalOpen(true)}
            >
              <img
                src="https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800"
                alt="Great Druk Wangyel Stupa Story"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'; }}
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/25 transition-colors">
                <div className="w-14 h-14 rounded-full bg-white/95 text-[#4A0E17] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform animate-gold-pulse">
                  <Play className="w-6 h-6 fill-[#4A0E17] ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 bg-[#4A0E17]/90 backdrop-blur-md text-[#D4AF37] text-xs font-bold text-center py-1.5 rounded-lg border border-[#D4AF37]/30">
                ▶ WATCH OUR DOCUMENTARY STORY
              </div>
            </div>
          </div>

          {/* Col 3: Our Mission Bullets */}
          <div className="lg:col-span-4 space-y-3 bg-white p-6 rounded-2xl border border-[#EBE5D8] shadow-sm">
            <h3 className="font-serif-brand font-bold text-sm text-[#8B1E2F] uppercase tracking-widest">
              FOUR PILLARS OF ACTION
            </h3>
            <ul className="space-y-3 text-xs text-gray-700">
              <li className="flex items-start gap-2.5">
                <span className="text-[#D4AF37] font-bold text-base leading-none">☸</span>
                <span>Construct the 108ft Great Druk Wangyel Stupa as a beacon for global harmony</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#D4AF37] font-bold text-base leading-none">☸</span>
                <span>Nurture monk scholars with 9-year Buddhist philosophy Shedra university degrees</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#D4AF37] font-bold text-base leading-none">☸</span>
                <span>Offer daily 108 butter lamp prayers for universal health, longevity and peace</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#D4AF37] font-bold text-base leading-none">☸</span>
                <span>Provide compassionate community welfare, food relief, and healthcare aids</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. FEATURED DHARMA LECTURES & TRAINING VIDEOS (Leading to /learning) */}
      <section className="py-14 px-4 sm:px-8 bg-white border-t border-[#EBE5D8]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#8B1E2F] uppercase tracking-widest">Open Dharma Learning</span>
              <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#4A0E17]">
                Featured Teachings & Video Discourses
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Explore sacred Buddhist philosophy lectures, meditation guides, and chanting traditions.
              </p>
            </div>
            <Link
              to="/learning"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#7E1929] hover:text-[#4A0E17] uppercase tracking-wider group bg-[#FAF5F0] px-4 py-2 rounded-lg border border-[#D4AF37]/30 transition-all"
            >
              <span>View All Teachings</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(recentVideos.length > 0 ? recentVideos : [
              { id: 1, title: 'Introduction to Four Noble Truths & Eightfold Path', instructor: 'Khenpo Tashi Dorji', duration: '42 mins', thumbnail_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', category: 'Philosophy' },
              { id: 2, title: 'Shamatha Meditation: Cultivating Calm Abiding', instructor: 'Lopen Karma Samten', duration: '35 mins', thumbnail_url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800', category: 'Meditation' },
              { id: 3, title: 'Bodhicitta & Compassion in Action', instructor: 'Khenpo Tashi Dorji', duration: '55 mins', thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800', category: 'Teachings' }
            ]).map((v) => (
              <div key={v.id} className="monastery-card overflow-hidden group monastery-card-hover flex flex-col justify-between">
                <div className="relative h-48 bg-gray-900 overflow-hidden">
                  <img
                    src={v.thumbnail_url}
                    alt={v.title}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="w-11 h-11 rounded-full bg-white/95 text-[#4A0E17] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-[#4A0E17] ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4A0E17]/90 text-[#D4AF37] border border-[#D4AF37]/30">
                    {v.category || 'Dharma Lecture'}
                  </span>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                    {v.duration || 'Video'}
                  </span>
                </div>
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] group-hover:text-[#7E1929] line-clamp-2 leading-snug">
                      {v.title}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
                      <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{v.instructor}</span>
                    </p>
                  </div>
                  <Link to="/learning" className="inline-block text-xs font-bold text-[#7E1929] hover:underline pt-2">
                    Watch Lecture →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SACRED PRAYER DEDICATION CALLOUT */}
      <section className="py-12 px-4 sm:px-8 bg-gradient-to-r from-[#3B0710] via-[#4A0E17] to-[#2C060D] text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#D4AF37]">
              <Flame className="w-5 h-5 fill-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-widest">108 Daily Butter Lamps</span>
            </div>
            <h2 className="font-serif-brand font-bold text-xl sm:text-2xl text-white">
              Request Prayers & Butter Lamp Dedications
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              Dedicate sacred prayers for the health, prosperity, longevity, or peaceful transition of your loved ones in daily monastery pujas.
            </p>
          </div>
          <Link
            to="/prayer-request"
            className="gold-gradient-btn text-white px-7 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 border border-[#D4AF37]/60 shadow-xl flex-shrink-0"
          >
            <Flame className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
            <span>SUBMIT PRAYER REQUEST</span>
          </Link>
        </div>
      </section>

      {/* 6. RECENT BLOG & MONASTERY ARTICLES (Leading to /blog) */}
      <section className="py-14 px-4 sm:px-8 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#8B1E2F] uppercase tracking-widest">Articles & Insights</span>
              <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#4A0E17]">
                Monastery Journal & News
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Reflections on Vajrayana wisdom, stupa construction progress, and monastic life.
              </p>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#7E1929] hover:text-[#4A0E17] uppercase tracking-wider group bg-white px-4 py-2 rounded-lg border border-[#D4AF37]/30 transition-all shadow-sm"
            >
              <span>Read All Articles</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(recentBlogs.length > 0 ? recentBlogs : [
              { id: 1, slug: 'spiritual-significance-peace-stupa', title: 'The Spiritual Significance of Great Druk Wangyel Stupa', summary: 'Explore why stupas are regarded as the living mind of the Buddha and radiate blessings.', cover_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', published_at: '2026-08-20', author_name: 'Khenpo Tashi Dorji' },
              { id: 2, slug: 'daily-life-shedra-monastic-university', title: 'Daily Life in the Shedra: Nurturing Compassion & Wisdom', summary: 'A glimpse into the daily schedule, philosophical debates, and meditation practices.', cover_image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800', published_at: '2026-08-22', author_name: 'Lopen Karma Samten' },
              { id: 3, slug: 'merit-butter-lamp-offerings', title: 'The Merit of 108 Butter Lamp Offerings for World Peace', summary: 'How the light of butter lamps dispels ignorance and creates universal merit.', cover_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800', published_at: '2026-08-25', author_name: 'Dechen Wangmo' }
            ]).map((b) => (
              <div key={b.id} className="monastery-card overflow-hidden group monastery-card-hover flex flex-col justify-between">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={b.cover_image}
                    alt={b.title}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-500 font-medium">{new Date(b.published_at).toLocaleDateString()}</p>
                    <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] line-clamp-2 leading-snug">
                      <Link to={`/blog/${b.slug}`} className="hover:underline">
                        {b.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {b.summary}
                    </p>
                  </div>
                  <Link to={`/blog/${b.slug}`} className="inline-block text-xs font-bold text-[#7E1929] hover:underline pt-2">
                    Read Article →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BUDDHA QUOTE CARD */}
      <section className="py-14 px-4 sm:px-8 bg-[#4A0E17] text-white text-center border-t-2 border-[#D4AF37]/50">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-[#D4AF37] text-4xl font-serif">❝</span>
          <p className="font-serif text-lg sm:text-xl md:text-2xl font-light italic leading-relaxed text-[#FDF6E2]">
            "Thousands of candles can be lighted from a single candle, and the life of the candle will not be shortened. Happiness never decreases by being shared."
          </p>
          <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">
            — Shakyamuni Buddha
          </p>
        </div>
      </section>

      {/* Donation Modal */}
      {donateModalOpen && (
        <DonationModal
          initialAmount={donateAmount}
          initialType={donateFrequency}
          onClose={() => setDonateModalOpen(false)}
        />
      )}

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-black rounded-2xl overflow-hidden max-w-3xl w-full aspect-video relative border border-[#D4AF37]/50 shadow-2xl animate-fadeIn">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-3 right-3 text-white bg-black/70 hover:bg-[#4A0E17] rounded-full p-2 z-10 transition-colors"
            >
              ✕
            </button>
            <iframe
              className="w-full h-full"
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Drodul Phendey Ling Foundation Story"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
