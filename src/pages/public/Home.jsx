import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, ArrowRight, Play, CheckCircle2, Shield, Globe, FileText,
  Smartphone, Sparkles, HeartHandshake, GraduationCap, Landmark,
  BookOpen, Video, Calendar, Flame
} from 'lucide-react';
import DonationModal from '../../components/DonationModal';
import api from '../../services/api';

export default function Home() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState(50);
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
      <section className="relative min-h-[620px] bg-gradient-to-r from-[#2C060D] via-[#4A0E17] to-[#1F0408] text-white overflow-hidden py-16 px-4 sm:px-8">
        {/* Background Monastery Stupa Image with Warm Overlay */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-luminosity bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C060D] via-transparent to-transparent opacity-90"></div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tibetan Calligraphy Header */}
            <div className="text-[#D4AF37] font-tibetan text-xl sm:text-2xl tracking-wider font-semibold">
              དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།
            </div>

            <h1 className="font-serif-brand font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-wide leading-tight drop-shadow-md">
              BUILDING A LEGACY <br />
              <span className="text-[#D4AF37]">OF PEACE & COMPASSION</span>
            </h1>

            <p className="text-sm sm:text-base text-[#F3F4F6] max-w-xl font-light leading-relaxed">
              Constructing the Great Druk Wangyel Stupa, Shedra University & nurturing Buddha Dharma for world peace in Gelephu, Sarpang, Bhutan.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setDonateModalOpen(true)}
                className="bg-[#7E1929] hover:bg-[#8B1E2F] text-white px-6 py-3 rounded-md font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all border border-[#D4AF37]/40"
              >
                <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span>SUPPORT OUR MISSION</span>
              </button>

              <Link
                to="/about"
                className="bg-transparent hover:bg-white/10 text-white px-6 py-3 rounded-md font-bold text-xs uppercase tracking-wider flex items-center space-x-2 border border-white/40 transition-all"
              >
                <span>EXPLORE OUR WORK</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </Link>
            </div>
          </div>

          {/* Right Floating Widget: MAKE A DIFFERENCE */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="bg-white/95 backdrop-blur text-gray-900 rounded-xl p-6 sm:p-7 shadow-2xl border-2 border-[#D4AF37]/50 max-w-md w-full animate-fadeIn">
              <h3 className="font-serif-brand font-bold text-lg text-[#4A0E17] uppercase tracking-wide">
                MAKE A DIFFERENCE
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                Your support creates eternal impact and spiritual merit.
              </p>

              {/* Frequency Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-[#F8F6F0] p-1 rounded-md border border-[#EBE5D8] mb-4">
                <button
                  type="button"
                  onClick={() => setDonateFrequency('one_time')}
                  className={`py-1.5 text-xs font-bold rounded transition-all ${
                    donateFrequency === 'one_time' ? 'bg-[#4A0E17] text-white shadow' : 'text-gray-700'
                  }`}
                >
                  One Time
                </button>
                <button
                  type="button"
                  onClick={() => setDonateFrequency('recurring')}
                  className={`py-1.5 text-xs font-bold rounded transition-all ${
                    donateFrequency === 'recurring' ? 'bg-[#4A0E17] text-white shadow' : 'text-gray-700'
                  }`}
                >
                  Monthly
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
                    className={`py-2 text-xs font-bold rounded border transition-all ${
                      donateAmount === amt
                        ? 'bg-[#7E1929] text-white border-[#7E1929] shadow'
                        : 'bg-white text-gray-800 border-gray-300 hover:border-[#D4AF37]'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="relative mb-5">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="Other Amount"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-xs font-medium border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7E1929]"
                />
              </div>

              {/* Primary CTA */}
              <button
                type="button"
                onClick={() => setDonateModalOpen(true)}
                className="w-full bg-[#7E1929] hover:bg-[#5A121E] text-white py-3 rounded-md font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition-all"
              >
                <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span>DONATE NOW</span>
              </button>

              <div className="mt-3 flex items-center justify-center space-x-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  100% Tax Deductible
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Instant 80G Receipt
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT DPL FOUNDATION, VIDEO & MISSION */}
      <section className="py-14 px-4 sm:px-8 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Col 1: About Text */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-serif-brand font-bold text-sm text-[#8B1E2F] uppercase tracking-widest">
              ABOUT DPL FOUNDATION
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              Drodul Phendey Ling Foundation is a Buddhist charitable organization dedicated to the construction of the Great Druk Wangyel Stupa, establishment of Shedra (Monastic University), preservation of Buddha Dharma and promoting world peace through compassion and wisdom.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center space-x-1.5 bg-[#4A0E17] hover:bg-[#5A121E] text-white px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider shadow transition-all"
            >
              <span>LEARN MORE ABOUT US</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </Link>
          </div>

          {/* Col 2: Embedded Video Block */}
          <div className="lg:col-span-4">
            <div
              className="relative rounded-lg overflow-hidden border-2 border-[#D4AF37] shadow-md group cursor-pointer"
              onClick={() => setVideoModalOpen(true)}
            >
              <img
                src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop"
                alt="Great Druk Wangyel Stupa Story"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 text-[#4A0E17] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-[#4A0E17] ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-[#4A0E17]/90 text-[#D4AF37] text-[11px] font-semibold text-center py-1 rounded backdrop-blur-sm">
                ▶ WATCH OUR STORY
              </div>
            </div>
          </div>

          {/* Col 3: Our Mission Bullets */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-serif-brand font-bold text-sm text-[#8B1E2F] uppercase tracking-widest">
              OUR MISSION & VALUES
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold text-sm">☸</span>
                <span>Construct the 108ft Great Druk Wangyel Stupa as a world peace monument</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold text-sm">☸</span>
                <span>Nurture monk scholars with 9-year Buddhist philosophy Shedra curriculum</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold text-sm">☸</span>
                <span>Offer daily 108 butter lamp prayers for universal harmony & health</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold text-sm">☸</span>
                <span>Serve community welfare through education, medicine, and food relief</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DHARMA LECTURES & TRAINING VIDEOS (Leading to /learning) */}
      <section className="py-12 px-4 sm:px-8 bg-white border-t border-[#EBE5D8]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#8B1E2F] uppercase tracking-widest">Open Dharma Learning</span>
              <h2 className="font-serif-brand font-bold text-2xl text-[#4A0E17]">
                Featured Teachings & Video Discourses
              </h2>
              <p className="text-xs text-gray-600">
                Explore sacred Buddhist philosophy lectures, meditation guides, and chanting traditions.
              </p>
            </div>
            <Link
              to="/learning"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#7E1929] hover:text-[#4A0E17] uppercase tracking-wider group"
            >
              <span>View All Teachings</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(recentVideos.length > 0 ? recentVideos : [
              { id: 1, title: 'Introduction to Four Noble Truths', instructor: 'Khenpo Tashi Dorji', duration: '42 mins', thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', category: 'Philosophy' },
              { id: 2, title: 'Shamatha Meditation Guidance', instructor: 'Lopen Karma Samten', duration: '35 mins', thumbnail_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', category: 'Meditation' },
              { id: 3, title: 'Bodhicitta & Compassion in Action', instructor: 'Khenpo Tashi Dorji', duration: '55 mins', thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800', category: 'Teachings' }
            ]).map((v) => (
              <div key={v.id} className="monastery-card overflow-hidden group monastery-card-hover">
                <div className="relative h-44 bg-gray-900">
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-[#4A0E17] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-[#4A0E17] ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#4A0E17]/90 text-[#D4AF37]">
                    {v.duration || 'Video'}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E2F]">{v.category || 'Dharma Lecture'}</span>
                  <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] line-clamp-2 leading-snug">
                    {v.title}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
                    <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{v.instructor}</span>
                  </p>
                  <Link to="/learning" className="inline-block text-xs font-bold text-[#7E1929] hover:underline pt-2">
                    Watch Lecture →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. RECENT BLOG & MONASTERY ARTICLES (Leading to /blog) */}
      <section className="py-12 px-4 sm:px-8 bg-[#FDFBF7] border-t border-[#EBE5D8]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#8B1E2F] uppercase tracking-widest">Articles & Insights</span>
              <h2 className="font-serif-brand font-bold text-2xl text-[#4A0E17]">
                Monastery Journal & News
              </h2>
              <p className="text-xs text-gray-600">
                Reflections on Vajrayana wisdom, stupa construction progress, and monastic life.
              </p>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#7E1929] hover:text-[#4A0E17] uppercase tracking-wider group"
            >
              <span>Read All Articles</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(recentBlogs.length > 0 ? recentBlogs : [
              { id: 1, slug: 'spiritual-significance-peace-stupa', title: 'The Spiritual Significance of Great Druk Wangyel Stupa', summary: 'Explore why stupas are regarded as the living mind of the Buddha and radiate blessings.', cover_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', published_at: '2026-08-20', author_name: 'Khenpo Tashi Dorji' },
              { id: 2, slug: 'daily-life-shedra-monastic-university', title: 'Daily Life in the Shedra: Nurturing Compassion & Wisdom', summary: 'A glimpse into the daily schedule, philosophical debates, and meditation practices.', cover_image: 'https://images.unsplash.com/photo-1609137144822-446757b4f535?w=800', published_at: '2026-08-22', author_name: 'Lopen Karma Samten' },
              { id: 3, slug: 'merit-butter-lamp-offerings', title: 'The Merit of 108 Butter Lamp Offerings for World Peace', summary: 'How the light of butter lamps dispels ignorance and creates universal merit.', cover_image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800', published_at: '2026-08-25', author_name: 'Dechen Wangmo' }
            ]).map((b) => (
              <div key={b.id} className="monastery-card overflow-hidden group monastery-card-hover">
                <div className="relative h-44 overflow-hidden">
                  <img src={b.cover_image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[10px] text-gray-500">{new Date(b.published_at).toLocaleDateString()}</p>
                  <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] line-clamp-2 leading-snug">
                    <Link to={`/blog/${b.slug}`} className="hover:underline">
                      {b.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {b.summary}
                  </p>
                  <Link to={`/blog/${b.slug}`} className="inline-block text-xs font-bold text-[#7E1929] hover:underline pt-2">
                    Read Article →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BUDDHA QUOTE CARD */}
      <section className="py-12 px-4 sm:px-8 bg-[#4A0E17] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-[#D4AF37] text-3xl font-serif">❝</span>
          <p className="font-serif text-lg sm:text-xl font-light italic leading-relaxed text-[#FDF6E2]">
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
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-black rounded-xl overflow-hidden max-w-3xl w-full aspect-video relative">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-3 right-3 text-white bg-black/60 rounded-full p-1.5 hover:bg-black z-10"
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
