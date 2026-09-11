import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, CheckCircle2, Award, Users, BookOpen, Landmark, Sparkles, MapPin, ArrowRight, Compass } from 'lucide-react';

export default function About() {
  return (
    <div className="py-12 px-4 sm:px-8 space-y-20 relative z-10 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glow-pill-gold text-xs font-bold animate-float">
          <span className="font-tibetan text-base">༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པའི་ལོ་རྒྱུས།</span>
          <span>• Sacred Monastic Heritage</span>
        </div>

        <h1 className="font-serif-brand font-extrabold text-3xl sm:text-5xl text-[#0F172A] leading-tight">
          About Drodul Phendey Ling Foundation
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto font-light">
          Established in the tranquil Himalayan foothills of Gelephu, Sarpang Dzongkhag, Bhutan, to nurture authentic Buddha Dharma, train monk scholars, and build the historic 108ft Great Druk Wangyel Peace Stupa.
        </p>
      </div>

      {/* 2. Core Pillars (Luxury Glass Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-luxury-card p-8 rounded-3xl space-y-4 border-t-4 border-t-rose-500">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 flex items-center justify-center p-3 shadow-sm">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="font-serif-brand font-bold text-xl text-[#0F172A]">Sacred Lineage & Vision</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
            Rooted in authentic Vajrayana and Mahayana traditions, our mission is to cultivate universal compassion, wisdom, and an enlightened sanctuary where monastic and lay practitioners realize inner peace.
          </p>
        </div>

        <div className="glass-luxury-card p-8 rounded-3xl space-y-4 border-t-4 border-t-blue-500">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-700 flex items-center justify-center p-3 shadow-sm">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-serif-brand font-bold text-xl text-[#0F172A]">Shedra Monastic University</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
            Providing 350+ enrolled monks with full residential scholarships, classical Tibetan linguistics, Abhidharma, Madhyamaka philosophy, debate epistemics, and contemplative solitary retreats.
          </p>
        </div>

        <div className="glass-luxury-card p-8 rounded-3xl space-y-4 border-t-4 border-t-amber-500">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 flex items-center justify-center p-3 shadow-sm">
            <Landmark className="w-7 h-7" />
          </div>
          <h3 className="font-serif-brand font-bold text-xl text-[#0F172A]">Great Peace Stupa</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
            The monumental 108-foot Great Druk Wangyel Peace Stupa serves as a beacon of harmony, housing sacred relic chambers, 108 stone-carved prayer wheels, and pacifying discord for all beings.
          </p>
        </div>
      </div>

      {/* 3. Leadership & Spiritual Lineage (Frosted Glass Panel) */}
      <div className="glass-luxury-card rounded-3xl p-8 sm:p-14 border border-gray-200/80 shadow-2xl space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-1.5">
          <span className="glow-pill-gold px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Monastic Leadership
          </span>
          <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#0F172A]">
            Venerable Spiritual Guidance
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-center">
          <div className="sm:col-span-5 rounded-2xl overflow-hidden border-2 border-[#D4AF37] max-h-80 shadow-xl group">
            <img
              src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80"
              alt="Monastery Abbot Khenpo Tashi Dorji"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          <div className="sm:col-span-7 space-y-4">
            <div>
              <h3 className="font-serif-brand font-bold text-2xl text-[#0F172A]">Khenpo Tashi Dorji</h3>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mt-1">Abbot & Principal of Shedra Academy</p>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
              Having completed nine years of rigorous Shedra curriculum and traditional solitary mountain retreat, Khenpo Rinpoche oversees the monastic training, sacred stupa construction, and philanthropic welfare programs in Gelephu, Bhutan.
            </p>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-light space-y-1">
              <p className="font-semibold text-amber-950">Lineage Blessing:</p>
              <p className="italic font-serif">"May every stone carved for this Stupa, every mantra chanted in this Shedra, bring peace to a troubled world."</p>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/contact"
                className="monastic-gold-btn px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md"
              >
                <span>Contact Abbot Office</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#070A12]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Statutory Recognition & Bhutan Government Registration */}
      <div className="bg-[#070A12] text-white rounded-3xl p-8 sm:p-12 border border-[#D4AF37]/30 shadow-2xl">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Official Accreditation</span>
          </div>

          <h2 className="font-serif-brand font-extrabold text-2xl sm:text-3xl">
            Statutory Trust & Accountability
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Drodul Phendey Ling Foundation operates in strict accordance with the Religious Organizations Act of the Kingdom of Bhutan. Our accounts are audited annually by certified independent chartered accountants and submitted to statutory regulatory authorities.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[#D4AF37] font-bold">ROB Registered</p>
              <p className="text-gray-400 text-[11px] mt-1">Accredited by the Commission for Religious Organizations of Bhutan</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[#D4AF37] font-bold">80G Tax-Deductible</p>
              <p className="text-gray-400 text-[11px] mt-1">100% tax exemption eligible for devotees and corporate sponsors</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[#D4AF37] font-bold">Independent Audit</p>
              <p className="text-gray-400 text-[11px] mt-1">Statutory audited accounts published annually for donor transparency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
