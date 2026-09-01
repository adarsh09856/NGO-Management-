import React, { useState } from 'react';
import DonationModal from '../../components/DonationModal';
import { Heart, Shield, CheckCircle2, Award, Landmark, BookOpen, Flame, Sparkles, ArrowRight } from 'lucide-react';

export default function Donate() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState('Great Druk Wangyel Peace Stupa');
  const [donateAmount, setDonateAmount] = useState(100);
  const [frequency, setFrequency] = useState('one_time');

  const causes = [
    {
      id: 1,
      title: 'Great Druk Wangyel Peace Stupa',
      description: 'Constructing the monumental 108ft World Peace Stupa in Gelephu, Bhutan, featuring sacred relic shrines and 108 prayer wheels.',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      tag: 'World Peace Monument',
      target: '₹ 50,00,000',
      icon: Landmark
    },
    {
      id: 2,
      title: 'Shedra Monastic University Expansion',
      description: 'Building modern residential quarters, Dharma debate courtyards, and library archives for 350+ enrolled monk scholars.',
      image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
      tag: 'Higher Buddhist Education',
      target: '₹ 30,00,000',
      icon: BookOpen
    },
    {
      id: 3,
      title: 'Sangha Daily Food & Medical Fund',
      description: 'Providing nutritious vegetarian meals, warm winter robes, and specialized medical care for novice and elder monks.',
      image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
      tag: 'Sangha Care & Welfare',
      target: '₹ 12,00,000',
      icon: Heart
    },
    {
      id: 4,
      title: '108 Butter Lamp Puja Sponsorship',
      description: 'Consecrated evening prayers and 108 butter lamp lightings dedicated for global peace, obstacle clearance, and family health.',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
      tag: 'Sacred Prayers & Pujas',
      target: '₹ 5,00,000',
      icon: Flame
    }
  ];

  const handleOpenDonate = (causeTitle, defaultAmt = 100) => {
    setSelectedCause(causeTitle);
    setDonateAmount(defaultAmt);
    setModalOpen(true);
  };

  return (
    <div className="py-12 px-4 sm:px-8 bg-[#FDFBF7] min-h-[85vh] space-y-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* 1. Header Banner */}
        <div className="bg-gradient-to-r from-[#2C060D] via-[#4A0E17] to-[#1F0408] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-[#D4AF37]/40">
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none mix-blend-luminosity"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80')` }}
          />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-semibold">
              <span className="font-tibetan text-sm">☸ མཆོད་འབུལ།</span>
              <span>• Sacred Buddhist Philanthropy</span>
            </div>
            <h1 className="font-serif-brand font-extrabold text-3xl sm:text-5xl text-white tracking-wide leading-tight">
              Make A Meritorious Offering for <br />
              <span className="gold-foil-text">Peace & Dharma</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#F3F4F6] font-light leading-relaxed">
              Every offering directly finances the 108ft Great Druk Wangyel Peace Stupa, sustains 350+ resident monks with nutrition and education, and radiates blessings of merit across the world.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#D4AF37]">
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>100% Tax-Deductible (80G)</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Digitally Signed PDF Receipt</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Causes Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#4A0E17]">
              Featured Sacred Causes & Funds
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Select a dedicated campaign to support or create a general monastery offering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {causes.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  className="monastery-card overflow-hidden flex flex-col justify-between monastery-card-hover group border border-[#EBE5D8]"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-gray-900">
                      <img
                        src={c.image}
                        alt={c.title}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#4A0E17]/90 text-[#D4AF37] backdrop-blur-sm border border-[#D4AF37]/30">
                        {c.tag}
                      </span>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center space-x-2 text-[#4A0E17]">
                        <Icon className="w-4 h-4 text-[#D4AF37]" />
                        <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] leading-snug">
                          {c.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                        {c.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleOpenDonate(c.title)}
                      className="w-full gold-gradient-btn text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all border border-[#D4AF37]/40"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                      <span>OFFER MERIT</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {modalOpen && (
        <DonationModal
          initialAmount={donateAmount}
          initialType={frequency}
          initialCause={selectedCause}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
