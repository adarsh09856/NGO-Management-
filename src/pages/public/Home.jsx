import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, ArrowRight, Play, CheckCircle2, Shield, Globe, FileText,
  Sparkles, GraduationCap, Landmark, BookOpen, Video, Calendar,
  Flame, Award, Users, Compass, ExternalLink, X, ChevronRight,
  TrendingUp, Clock, HelpCircle, Layers
} from 'lucide-react';
import DonationModal from '../../components/DonationModal';
import api from '../../services/api';

export default function Home() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState(1000);
  const [donateFrequency, setDonateFrequency] = useState('one_time');
  const [selectedCauseTitle, setSelectedCauseTitle] = useState('Great Druk Wangyel Peace Stupa');
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Dynamic Data States
  const [campaigns, setCampaigns] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoadingData(true);
        const [campaignsRes, blogRes, videoRes] = await Promise.all([
          api.get('/campaigns/public').catch(() => ({ data: { success: false } })),
          api.get('/blog?limit=3').catch(() => ({ data: { success: false } })),
          api.get('/learning').catch(() => ({ data: { success: false } }))
        ]);

        if (campaignsRes.data?.success && campaignsRes.data.data?.length > 0) {
          setCampaigns(campaignsRes.data.data.slice(0, 4));
        }
        if (blogRes.data?.success && blogRes.data.data?.length > 0) {
          setRecentBlogs(blogRes.data.data.slice(0, 3));
        }
        if (videoRes.data?.success && videoRes.data.data?.length > 0) {
          setRecentVideos(videoRes.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load dynamic home data:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadHomeData();
  }, []);

  const handleOpenDonate = (causeTitle = 'Great Druk Wangyel Peace Stupa', defaultAmt = 1000) => {
    setSelectedCauseTitle(causeTitle);
    setDonateAmount(defaultAmt);
    setDonateModalOpen(true);
  };

  return (
    <div className="w-full relative space-y-20 pb-20 bg-[#FAF8F5] overflow-hidden">
      {/* ========================================================= */}
      {/* 1. CINEMATIC MONASTIC HERO & LUXURY GIVING CAPSULE        */}
      {/* ========================================================= */}
      <section className="relative min-h-[720px] bg-gradient-to-b from-[#070A12] via-[#0B0F19] to-[#120508] text-white overflow-hidden py-20 px-4 sm:px-8 flex items-center">
        {/* Background Dochula Peace Stupas with High-Res Monastic Atmosphere */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-luminosity bg-cover bg-center pointer-events-none scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1800&q=85')` }}
        />
        {/* Ambient Radiant Glow & Vignette */}
        <div className="absolute inset-0 bg-radial-vignette opacity-80 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#721C24]/30 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full z-10">
          {/* Left Hero Narrative */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Authentic Dzongkha Inscription Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <span className="font-tibetan text-sm sm:text-base">༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-[10px] uppercase tracking-widest text-amber-200">Gelephu, Bhutan</span>
            </div>

            <h1 className="font-serif-brand font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-wide leading-[1.15] drop-shadow-xl">
              BUILDING A SACRED LEGACY <br />
              <span className="gold-foil-text font-serif">OF PEACE & WISDOM</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-xl font-light leading-relaxed">
              Constructing the monumental 108ft Great Druk Wangyel Peace Stupa, expanding the Shedra Monastic University, and preserving authentic Buddha Dharma for global harmony in Gelephu, Bhutan.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => handleOpenDonate('Great Druk Wangyel Peace Stupa', donateAmount)}
                className="monastic-gold-btn px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center space-x-2.5 shadow-2xl transition-all group"
              >
                <Heart className="w-4 h-4 text-[#721C24] fill-[#721C24] group-hover:scale-125 transition-transform" />
                <span className="font-serif-brand tracking-widest">OFFER DANA / DONATE</span>
              </button>

              <Link
                to="/about"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center space-x-2 border border-white/30 transition-all hover:border-[#D4AF37] shadow-lg group"
              >
                <span>EXPLORE OUR WORK</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Mini Trust Highlights */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-gray-400 font-light border-t border-white/10">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>100% Tax-Exempt (80G Guaranteed)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>ROB Bhutan Certified Charitable NGO</span>
              </div>
            </div>
          </div>

          {/* Right Floating Glass Widget: DEDICATE YOUR MERIT */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="glass-panel text-gray-900 rounded-3xl p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.5)] border border-white/90 max-w-md w-full animate-fadeIn backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-gray-200/80 pb-3 mb-5">
                <div>
                  <h3 className="font-serif-brand font-bold text-base text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>DEDICATE YOUR MERIT</span>
                  </h3>
                  <p className="text-[11px] text-gray-600 font-light">
                    Directly empowers stupa construction & resident monks.
                  </p>
                </div>
                <span className="glow-pill-emerald px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  80G Certified
                </span>
              </div>

              {/* Frequency Selector */}
              <div className="grid grid-cols-2 gap-2 bg-gray-100/90 p-1.5 rounded-xl mb-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDonateFrequency('one_time')}
                  className={`py-2 rounded-lg transition-all ${
                    donateFrequency === 'one_time'
                      ? 'bg-[#070A12] text-white shadow-md font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  One-Time Offering
                </button>
                <button
                  type="button"
                  onClick={() => setDonateFrequency('monthly')}
                  className={`py-2 rounded-lg transition-all ${
                    donateFrequency === 'monthly'
                      ? 'bg-[#070A12] text-white shadow-md font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly Pledge
                </button>
              </div>

              {/* Preset Amount Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonateAmount(amt)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      donateAmount === amt
                        ? 'bg-[#070A12] text-[#D4AF37] border-[#D4AF37] shadow-md scale-105'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-[#D4AF37]'
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
                    min="100"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(Number(e.target.value))}
                    className="glass-input w-full pl-8 pr-3 py-2 text-xs font-bold rounded-xl text-gray-900 focus:ring-2 focus:ring-[#D4AF37]/40"
                  />
                </div>
              </div>

              {/* Spiritual Merit Projection */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-5 text-[11px] text-amber-900 flex items-start space-x-2.5">
                <Flame className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  {donateAmount >= 5000
                    ? 'Sponsors 108 consecrated butter lamps, sacred puja prayers, and stone carving work on the Peace Stupa.'
                    : donateAmount >= 2500
                    ? 'Provides sacred Tibetan study texts, scriptures, and robes for 3 residential monk scholars.'
                    : donateAmount >= 1000
                    ? 'Funds nutritious vegetarian meals and healthcare for young novice monks in Gelephu.'
                    : 'Dedicated to world peace prayers and the construction of the Great Peace Stupa.'}
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenDonate('Great Druk Wangyel Peace Stupa', donateAmount)}
                className="w-full monastic-maroon-btn py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl border border-[#D4AF37]/50"
              >
                <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="font-serif-brand">PROCEED TO SACRED OFFERING</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. IMPACT STATS RIBBON                                    */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 -mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Stat 1: Stupa */}
          <div className="glass-luxury-card p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-amber-500">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shadow-sm p-3">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
                108 <span className="text-amber-600 text-lg">FT</span>
              </div>
              <p className="text-xs font-bold text-gray-700">Great Peace Stupa</p>
              <p className="text-[11px] text-gray-500">Monument in Gelephu, Bhutan</p>
            </div>
          </div>

          {/* Stat 2: Shedra Monks */}
          <div className="glass-luxury-card p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-blue-500">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-700 shadow-sm p-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
                350<span className="text-blue-600">+</span>
              </div>
              <p className="text-xs font-bold text-gray-700">Resident Monk Scholars</p>
              <p className="text-[11px] text-gray-500">Full residential Shedra education</p>
            </div>
          </div>

          {/* Stat 3: Butter Lamps */}
          <div className="glass-luxury-card p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-rose-500">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-700 shadow-sm p-3">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
                108 <span className="text-rose-600 text-lg">DAILY</span>
              </div>
              <p className="text-xs font-bold text-gray-700">Consecrated Butter Lamps</p>
              <p className="text-[11px] text-gray-500">Dedicated prayers for donors</p>
            </div>
          </div>

          {/* Stat 4: Tax Exemption */}
          <div className="glass-luxury-card p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-emerald-500">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 shadow-sm p-3">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-brand font-extrabold text-2xl sm:text-3xl text-emerald-800">
                100<span className="text-emerald-600">%</span>
              </div>
              <p className="text-xs font-bold text-gray-700">Tax Deductible</p>
              <p className="text-[11px] text-gray-500">Instant signed 80G tax receipt</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. DYNAMIC FEATURED CAMPAIGNS (Real DB Data)              */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 pb-4">
          <div>
            <span className="glow-pill-gold px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Sacred Philanthropy
            </span>
            <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#0F172A] mt-2">
              Current Monastic & Stupa Campaigns
            </h2>
          </div>
          <Link
            to="/donate"
            className="text-xs font-bold text-[#721C24] hover:text-[#0F172A] flex items-center gap-1 group"
          >
            <span>View All Campaigns</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {campaigns.length > 0 ? (
            campaigns.map((camp) => {
              const target = Number(camp.target_amount) || 1000000;
              const raised = Number(camp.total_raised_computed) || 0;
              const percent = Math.min(Math.round((raised / target) * 100), 100);

              return (
                <div
                  key={camp.id}
                  className="glass-luxury-card overflow-hidden rounded-2xl flex flex-col justify-between group border border-gray-200/80"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-gray-900">
                      <img
                        src={camp.banner_image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'}
                        alt={camp.title}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute top-3 left-3 glow-pill-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {camp.currency || 'INR'} Goal
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] line-clamp-2 leading-snug group-hover:text-[#721C24] transition-colors">
                        {camp.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {camp.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-semibold text-gray-700">
                          <span>Raised: ₹{raised.toLocaleString()}</span>
                          <span className="text-[#721C24] font-bold">{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#721C24] transition-all duration-700 rounded-full"
                            style={{ width: `${Math.max(percent, 5)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 text-right">
                          Target: ₹{target.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleOpenDonate(camp.title, 1000)}
                      className="w-full monastic-maroon-btn py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                      <span>Sponsor Cause</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            [
              { title: 'Great Druk Wangyel Peace Stupa', target: 5000000, raised: 3485000, percent: 70, img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80' },
              { title: 'Shedra Monastic University Expansion', target: 3000000, raised: 1850000, percent: 62, img: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80' },
              { title: 'Sangha Daily Food & Health Care', target: 1200000, raised: 890000, percent: 74, img: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80' },
              { title: '108 Consecrated Butter Lamp Fund', target: 500000, raised: 425000, percent: 85, img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
            ].map((c, idx) => (
              <div key={idx} className="glass-luxury-card overflow-hidden rounded-2xl flex flex-col justify-between group border border-gray-200/80">
                <div>
                  <div className="relative h-44 overflow-hidden bg-gray-900">
                    <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] line-clamp-2 leading-snug group-hover:text-[#721C24] transition-colors">
                      {c.title}
                    </h3>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] font-semibold text-gray-700">
                        <span>Raised: ₹{c.raised.toLocaleString()}</span>
                        <span className="text-[#721C24] font-bold">{c.percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#721C24] rounded-full" style={{ width: `${c.percent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleOpenDonate(c.title, 1000)}
                    className="w-full monastic-maroon-btn py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                    <span>Sponsor Cause</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. MONASTERY DOCUMENTARY STORY BANNER                      */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="glass-luxury-card overflow-hidden rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Video Preview */}
            <div
              className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer aspect-video bg-gray-900 border-2 border-amber-400/40"
              onClick={() => setVideoModalOpen(true)}
            >
              <img
                src="https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80"
                alt="Sacred Monastery Documentary"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Glowing Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#070A12]/90 text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center shadow-2xl animate-gold-pulse group-hover:scale-110 transition-transform">
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
              <div className="inline-flex items-center space-x-2 glow-pill-gold px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-700" />
                <span>Monastery Documentary & Vision</span>
              </div>

              <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#0F172A] leading-snug">
                From Sacred Lineage to Global World Peace
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                Nestled in the tranquil Himalayan foothills of Gelephu, Bhutan, Drodul Phendey Ling Foundation brings together revered Buddhist masters, dedicated monk scholars, and international patrons to preserve centuries-old Tibetan Buddhist heritage and complete the historic Great Druk Wangyel Peace Stupa.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="monastic-gold-btn px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-[#070A12] text-[#070A12]" />
                  <span>WATCH FULL FILM</span>
                </button>
                <Link
                  to="/gallery"
                  className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:border-[#D4AF37]"
                >
                  <span>EXPLORE PHOTO ARCHIVES</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. FOUR SACRED PILLARS OF ACTIVITY                        */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="glow-pill-gold px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Our Noble Mission
          </span>
          <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#0F172A]">
            Four Pillars of Sacred Merit
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Dedicated programs empowering Buddhist scholarship, architectural preservation, and spiritual welfare.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Gold (Stupa) */}
          <div className="glass-luxury-card p-6 rounded-2xl flex flex-col justify-between space-y-4 border-t-4 border-t-amber-500">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                World Peace Stupa
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                The 108-foot Great Druk Wangyel Peace Stupa houses sacred relics, 108 prayer wheels, and serves as a spiritual sanctuary for global harmony.
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
          <div className="glass-luxury-card p-6 rounded-2xl flex flex-col justify-between space-y-4 border-t-4 border-t-blue-500">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-700">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Shedra Monastic University
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
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
          <div className="glass-luxury-card p-6 rounded-2xl flex flex-col justify-between space-y-4 border-t-4 border-t-rose-500">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-700">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                108 Butter Lamp Pujas
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
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
          <div className="glass-luxury-card p-6 rounded-2xl flex flex-col justify-between space-y-4 border-t-4 border-t-emerald-500">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Sangha Care & Welfare
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
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
      {/* 6. BUTTER LAMP OFFERING CALLOUT (WARM CANDLELIGHT BANNER)  */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-[#070A12] via-[#1A0A0F] to-[#070A12] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-[#D4AF37]/40">
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
              <span className="gold-foil-text font-serif">For World Peace & Family Health</span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              Submit personal prayer intentions and names of loved ones. Our resident Shedra monks chant consecrated prayers and illuminate 108 brass butter lamps in the holy shrine altar.
            </p>

            <div className="pt-3 flex flex-wrap gap-4">
              <Link
                to="/prayer-request"
                className="monastic-gold-btn px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center space-x-2 shadow-xl"
              >
                <Flame className="w-4 h-4 text-[#721C24]" />
                <span>OFFER BUTTER LAMPS NOW</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. OPEN DHARMA VIDEO LECTURES (Dynamic API)               */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 pb-4">
          <div>
            <span className="glow-pill-sapphire px-3 py-1 rounded-full text-xs font-bold">
              Digital Dharma Library
            </span>
            <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#0F172A] mt-1">
              Open Video Discourses & Teachings
            </h2>
          </div>
          <Link
            to="/learning"
            className="text-xs font-bold text-[#721C24] hover:text-[#0F172A] flex items-center gap-1 group"
          >
            <span>View All Lectures</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentVideos.length > 0 ? (
            recentVideos.map((video) => (
              <div
                key={video.id}
                className="glass-luxury-card overflow-hidden rounded-2xl flex flex-col justify-between group border border-gray-200/80"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden bg-gray-900">
                    <img
                      src={video.thumbnail_url || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'}
                      alt={video.title}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute top-3 left-3 glow-pill-sapphire px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {video.category || 'Dharma Lecture'}
                    </div>
                    {video.duration_minutes && (
                      <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {video.duration_minutes} mins
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">
                      {video.instructor || 'Venerable Khenpo'}
                    </p>
                    <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] leading-snug group-hover:text-[#721C24] transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to="/learning"
                    className="w-full bg-white hover:bg-amber-50 text-gray-800 border border-gray-200 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:border-[#D4AF37]"
                  >
                    <Play className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                    <span>WATCH LECTURE</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            [
              { title: 'The Heart Sutra & Nagarjuna Philosophy', instructor: 'Khenpo Tashi Dorji', category: 'Madhyamaka', duration: 42, thumb: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80' },
              { title: 'The 37 Practices of a Bodhisattva', instructor: 'Lopen Sonam Wangdi', category: 'Bodhicitta', duration: 35, thumb: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&w=800&q=80' },
              { title: 'Calm Abiding (Shamatha) Meditation Instructions', instructor: 'Khenpo Karma Thinley', category: 'Meditation', duration: 28, thumb: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80' }
            ].map((v, i) => (
              <div key={i} className="glass-luxury-card overflow-hidden rounded-2xl flex flex-col justify-between group border border-gray-200/80">
                <div>
                  <div className="relative aspect-video overflow-hidden bg-gray-900">
                    <img src={v.thumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div className="absolute top-3 left-3 glow-pill-sapphire px-2.5 py-0.5 rounded-full text-[10px] font-bold">{v.category}</div>
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">{v.duration} mins</div>
                  </div>
                  <div className="p-5 space-y-2">
                    <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">{v.instructor}</p>
                    <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] leading-snug group-hover:text-[#721C24] transition-colors">{v.title}</h3>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link to="/learning" className="w-full bg-white hover:bg-amber-50 text-gray-800 border border-gray-200 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:border-[#D4AF37]">
                    <Play className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                    <span>WATCH LECTURE</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. WISDOM JOURNAL & MONASTIC NEWS (Dynamic API)           */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 pb-4">
          <div>
            <span className="glow-pill-ruby px-3 py-1 rounded-full text-xs font-bold">
              Monastery Publications
            </span>
            <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#0F172A] mt-1">
              Wisdom Articles & Spiritual Insights
            </h2>
          </div>
          <Link
            to="/blog"
            className="text-xs font-bold text-[#721C24] hover:text-[#0F172A] flex items-center gap-1 group"
          >
            <span>Read All Articles</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentBlogs.length > 0 ? (
            recentBlogs.map((blog) => (
              <article
                key={blog.id}
                className="glass-luxury-card overflow-hidden rounded-2xl flex flex-col justify-between group border border-gray-200/80"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-gray-900">
                    <img
                      src={blog.cover_image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'}
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
                        {new Date(blog.published_at || blog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] leading-snug group-hover:text-[#721C24] transition-colors line-clamp-2">
                      <Link to={`/blog/${blog.slug}`}>
                        {blog.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-light">
                      {blog.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="text-xs font-bold text-[#721C24] hover:text-[#0F172A] flex items-center gap-1 group/link"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            [
              { title: 'Consecration of the Great Relic Chamber in Gelephu', summary: 'Venerable Rinpoches gathered to consecrate the sacred relic chamber housing ancient texts, stupa relics, and tsa-tsas.', date: '2026-09-01', slug: 'consecration-relic-chamber', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80' },
              { title: 'The Spiritual Significance of 108 Prayer Wheels', summary: 'Each rotation of the 108 prayer wheels around the Great Peace Stupa radiates millions of Om Mani Padme Hum mantras.', date: '2026-08-20', slug: 'significance-108-prayer-wheels', img: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80' },
              { title: 'Cultivating Bodhicitta in Contemporary Daily Life', summary: 'Essential instructions on integrating compassion, mindful awareness, and meritorious deeds into busy modern schedules.', date: '2026-08-10', slug: 'cultivating-bodhicitta', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
            ].map((b, idx) => (
              <article key={idx} className="glass-luxury-card overflow-hidden rounded-2xl flex flex-col justify-between group border border-gray-200/80">
                <div>
                  <div className="relative h-48 overflow-hidden bg-gray-900">
                    <img src={b.img} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div className="absolute top-3 left-3 glow-pill-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold">Dharma Insights</div>
                  </div>
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center space-x-3 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {b.date}
                      </span>
                    </div>
                    <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] leading-snug group-hover:text-[#721C24] transition-colors line-clamp-2">
                      <Link to={`/blog/${b.slug}`}>{b.title}</Link>
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-light">{b.summary}</p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link to={`/blog/${b.slug}`} className="text-xs font-bold text-[#721C24] hover:text-[#0F172A] flex items-center gap-1 group/link">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Video Lightbox Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-gray-950 rounded-2xl overflow-hidden border border-[#D4AF37]/50 shadow-2xl">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#721C24] transition-colors"
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
          causeTitle={selectedCauseTitle}
          onClose={() => setDonateModalOpen(false)}
        />
      )}
    </div>
  );
}
