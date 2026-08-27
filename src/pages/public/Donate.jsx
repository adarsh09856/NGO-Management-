import React, { useState } from 'react';
import DonationModal from '../../components/DonationModal';
import { Heart, Shield, CheckCircle2, Award, Landmark, BookOpen, Flame } from 'lucide-react';

export default function Donate() {
  const [modalOpen, setModalOpen] = useState(true);
  const [selectedCause, setSelectedCause] = useState('Peace Stupa Construction');

  return (
    <div className="py-12 px-4 sm:px-8 bg-[#FDFBF7] min-h-[80vh]">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-[#FDF6E2] text-[#4A0E17] px-4 py-1.5 rounded-full border border-[#D4AF37] text-xs font-semibold">
            <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
            <span>Meritorious Buddhist Philanthropy</span>
          </div>
          <h1 className="font-serif-brand font-extrabold text-3xl sm:text-4xl text-[#4A0E17]">
            Make A Sacred Offering
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Your generous contribution empowers monastic education for young monks, sustains sacred Dharma rituals, and completes the Great Druk Wangyel Peace Stupa in Bhutan.
          </p>
        </div>

        {/* Causes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="monastery-card p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FDF6E2] flex items-center justify-center text-[#4A0E17]">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Peace Stupa Construction</h3>
              <p className="text-xs text-gray-600">Sponsor stone carvings, gilded spire, and relic chambers for the 108ft stupa.</p>
            </div>
            <button
              onClick={() => { setSelectedCause('Peace Stupa Construction'); setModalOpen(true); }}
              className="w-full bg-[#4A0E17] hover:bg-[#5A121E] text-white py-2 rounded text-xs font-bold uppercase tracking-wider"
            >
              Donate to Stupa
            </button>
          </div>

          <div className="monastery-card p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FDF6E2] flex items-center justify-center text-[#4A0E17]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Shedra University</h3>
              <p className="text-xs text-gray-600">Provide textbooks, library archives, and study halls for 350+ monastic scholars.</p>
            </div>
            <button
              onClick={() => { setSelectedCause('Shedra Monastic University'); setModalOpen(true); }}
              className="w-full bg-[#4A0E17] hover:bg-[#5A121E] text-white py-2 rounded text-xs font-bold uppercase tracking-wider"
            >
              Support Shedra
            </button>
          </div>

          <div className="monastery-card p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FDF6E2] flex items-center justify-center text-[#4A0E17]">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Sangha Food & Care</h3>
              <p className="text-xs text-gray-600">Support daily nutritious meals, robes, and healthcare for novice monks.</p>
            </div>
            <button
              onClick={() => { setSelectedCause('Sangha Daily Food Fund'); setModalOpen(true); }}
              className="w-full bg-[#4A0E17] hover:bg-[#5A121E] text-white py-2 rounded text-xs font-bold uppercase tracking-wider"
            >
              Sponsor Food
            </button>
          </div>

          <div className="monastery-card p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FDF6E2] flex items-center justify-center text-[#4A0E17]">
                <Flame className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">108 Butter Lamps</h3>
              <p className="text-xs text-gray-600">Light consecrated brass butter lamps dedicated to world peace and family blessings.</p>
            </div>
            <button
              onClick={() => { setSelectedCause('Butter Lamp Puja Sponsorship'); setModalOpen(true); }}
              className="w-full bg-[#4A0E17] hover:bg-[#5A121E] text-white py-2 rounded text-xs font-bold uppercase tracking-wider"
            >
              Light Lamps
            </button>
          </div>
        </div>

        <DonationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          defaultAmount={5000}
        />
      </div>
    </div>
  );
}
