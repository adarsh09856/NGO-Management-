import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, CheckCircle2, Award, Users, BookOpen } from 'lucide-react';

export default function About() {
  return (
    <div className="py-12 px-4 sm:px-8 bg-[#FDFBF7] space-y-16">
      {/* 1. Header Banner */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="text-[#D4AF37] font-tibetan text-xl font-bold">
          ༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པའི་ལོ་རྒྱུས།
        </div>
        <h1 className="font-serif-brand font-extrabold text-3xl sm:text-5xl text-[#4A0E17]">
          About Drodul Phendey Ling Foundation
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
          Founded under the spiritual guidance of venerable Buddhist masters in Gelephu, Sarpang, Bhutan, to cultivate universal compassion, monastic education, and construct the Great Druk Wangyel Peace Stupa.
        </p>
      </div>

      {/* 2. Core Pillars */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="monastery-card p-6 space-y-3 border-t-4 border-t-[#4A0E17]">
          <div className="w-12 h-12 rounded-full bg-[#FDF6E2] text-[#4A0E17] flex items-center justify-center">
            <Award className="w-6 h-6 text-[#4A0E17]" />
          </div>
          <h3 className="font-serif-brand font-bold text-lg text-[#4A0E17]">Sacred Lineage & Vision</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Rooted in authentic Vajrayana and Mahayana traditions, our mission is to create a living sanctuary where monks and lay devotees can study the profound Dharma and realize genuine inner peace.
          </p>
        </div>

        <div className="monastery-card p-6 space-y-3 border-t-4 border-t-[#D4AF37]">
          <div className="w-12 h-12 rounded-full bg-[#FDF6E2] text-[#D4AF37] flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#4A0E17]" />
          </div>
          <h3 className="font-serif-brand font-bold text-lg text-[#4A0E17]">Shedra Monastic University</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Providing full residential scholarships, classical Tibetan linguistics, Abhidharma, Madhyamaka, and epistemology curricula for 350+ resident monks and international scholars.
          </p>
        </div>

        <div className="monastery-card p-6 space-y-3 border-t-4 border-t-[#7E1929]">
          <div className="w-12 h-12 rounded-full bg-[#FDF6E2] text-[#7E1929] flex items-center justify-center">
            <Heart className="w-6 h-6 text-[#7E1929]" />
          </div>
          <h3 className="font-serif-brand font-bold text-lg text-[#4A0E17]">World Peace Stupa</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            The monumental 108-foot Great Druk Wangyel Peace Stupa serves as a beacon of harmony, pacifying conflicts, environmental distress, and inspiring peace across the globe.
          </p>
        </div>
      </div>

      {/* 3. Leadership & Lineage */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl p-8 border border-[#EBE5D8] shadow-sm space-y-6">
        <h2 className="font-serif-brand font-bold text-2xl text-[#4A0E17] text-center">
          Spiritual Leadership
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <div className="rounded-lg overflow-hidden border-2 border-[#D4AF37] max-h-72">
            <img
              src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600"
              alt="Monastery Abbot Khenpo Tashi Dorji"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600'; }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-3">
            <h3 className="font-serif-brand font-bold text-xl text-[#4A0E17]">Khenpo Tashi Dorji</h3>
            <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Abbot & Executive Principal</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Having completed nine years of rigorous Shedra curriculum and three years of traditional solitary retreat, Khenpo Rinpoche oversees the monastic training, stupa sacred consecration ceremonies, and philanthropic welfare programs in Bhutan.
            </p>
            <div className="pt-2">
              <Link to="/contact" className="text-xs font-bold text-[#8B1E2F] hover:underline">
                Contact Spiritual Office →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
