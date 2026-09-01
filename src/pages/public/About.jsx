import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, CheckCircle2, Award, Users, BookOpen, Landmark, Sparkles, MapPin, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="py-12 px-4 sm:px-8 space-y-16 relative z-10 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glow-pill-gold text-xs font-bold animate-float">
          <span className="font-tibetan text-base">༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པའི་ལོ་རྒྱུས།</span>
          <span>• Sacred History</span>
        </div>

        <h1 className="font-serif-brand font-extrabold text-3xl sm:text-5xl text-[#4A0E17]">
          About Drodul Phendey Ling Foundation
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto font-light">
          Founded under the spiritual guidance of venerable Buddhist masters in Gelephu, Sarpang Dzongkhag, Bhutan, to cultivate universal compassion, monastic education, and construct the Great Druk Wangyel Peace Stupa.
        </p>
      </div>

      {/* 2. Core Pillars (Glass Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card-interactive p-7 rounded-2xl space-y-3.5 border-t-4 border-t-rose-500">
          <div className="w-13 h-13 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 flex items-center justify-center p-3 shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif-brand font-bold text-lg text-[#4A0E17]">Sacred Lineage & Vision</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Rooted in authentic Vajrayana and Mahayana traditions, our mission is to create a living sanctuary where monks and lay devotees can study the profound Dharma and realize genuine inner peace.
          </p>
        </div>

        <div className="glass-card-interactive p-7 rounded-2xl space-y-3.5 border-t-4 border-t-blue-500">
          <div className="w-13 h-13 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-700 flex items-center justify-center p-3 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-serif-brand font-bold text-lg text-[#4A0E17]">Shedra Monastic University</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Providing full residential scholarships, classical Tibetan linguistics, Abhidharma, Madhyamaka, and epistemology curricula for 350+ resident monks and international scholars.
          </p>
        </div>

        <div className="glass-card-interactive p-7 rounded-2xl space-y-3.5 border-t-4 border-t-amber-500">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 flex items-center justify-center p-3 shadow-sm">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="font-serif-brand font-bold text-lg text-[#4A0E17]">World Peace Stupa</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            The monumental 108-foot Great Druk Wangyel Peace Stupa serves as a beacon of harmony, pacifying conflicts, environmental distress, and inspiring peace across the globe.
          </p>
        </div>
      </div>

      {/* 3. Leadership & Spiritual Lineage (Frosted Glass Panel) */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/80 shadow-2xl space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-1.5">
          <span className="glow-pill-gold px-3.5 py-1 rounded-full text-xs font-bold">
            Monastic Leadership
          </span>
          <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#4A0E17]">
            Venerable Spiritual Guidance
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <div className="rounded-2xl overflow-hidden border-2 border-[#D4AF37] max-h-80 shadow-xl group">
            <img
              src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80"
              alt="Monastery Abbot Khenpo Tashi Dorji"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-serif-brand font-bold text-2xl text-[#4A0E17]">Khenpo Tashi Dorji</h3>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mt-0.5">Abbot & Executive Principal</p>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Having completed nine years of rigorous Shedra curriculum and three years of traditional solitary mountain retreat, Khenpo Rinpoche oversees the monastic training, sacred stupa construction, and philanthropic welfare programs in Bhutan.
            </p>

            <div className="pt-3 flex items-center gap-4">
              <Link
                to="/contact"
                className="gold-gradient-btn text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md"
              >
                <span>Contact Abbot Office</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
