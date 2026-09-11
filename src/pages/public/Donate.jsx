import React, { useState, useEffect } from 'react';
import DonationModal from '../../components/DonationModal';
import {
  Heart, Shield, CheckCircle2, Award, Landmark, BookOpen, Flame,
  Sparkles, ArrowRight, Gift, Building2, HelpCircle, FileText, QrCode
} from 'lucide-react';
import api from '../../services/api';

export default function Donate() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState('Great Druk Wangyel Peace Stupa');
  const [donateAmount, setDonateAmount] = useState(1000);
  const [frequency, setFrequency] = useState('one_time');
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  const fallbackCauses = [
    {
      id: 1,
      title: 'Great Druk Wangyel Peace Stupa',
      description: 'Constructing the monumental 108ft World Peace Stupa in Gelephu, Bhutan, featuring sacred relic shrines and 108 prayer wheels.',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      tag: 'World Peace Monument',
      borderClass: 'border-t-amber-500',
      pillClass: 'glow-pill-gold',
      target: 5000000,
      raised: 3485230,
      percent: 70,
      icon: Landmark
    },
    {
      id: 2,
      title: 'Shedra Monastic University Expansion',
      description: 'Building modern residential quarters, Dharma debate courtyards, and library archives for 350+ enrolled monk scholars.',
      image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
      tag: 'Higher Buddhist Education',
      borderClass: 'border-t-blue-500',
      pillClass: 'glow-pill-sapphire',
      target: 3000000,
      raised: 1850000,
      percent: 62,
      icon: BookOpen
    },
    {
      id: 3,
      title: 'Sangha Daily Food & Medical Fund',
      description: 'Providing nutritious vegetarian meals, warm winter robes, and specialized medical care for novice and elder monks.',
      image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
      tag: 'Sangha Care & Welfare',
      borderClass: 'border-t-emerald-500',
      pillClass: 'glow-pill-emerald',
      target: 1200000,
      raised: 890000,
      percent: 74,
      icon: Heart
    },
    {
      id: 4,
      title: '108 Butter Lamp Puja Sponsorship',
      description: 'Consecrated evening prayers and 108 butter lamp lightings dedicated for global peace, obstacle clearance, and family health.',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
      tag: 'Sacred Prayers & Pujas',
      borderClass: 'border-t-rose-500',
      pillClass: 'glow-pill-ruby',
      target: 500000,
      raised: 425000,
      percent: 85,
      icon: Flame
    }
  ];

  useEffect(() => {
    async function loadCampaigns() {
      try {
        setLoadingCampaigns(true);
        const res = await api.get('/campaigns/public');
        if (res.data?.success && res.data.data?.length > 0) {
          setCampaigns(res.data.data);
        }
      } catch (err) {
        console.warn('Using fallback causes on Donate page:', err?.message);
      } finally {
        setLoadingCampaigns(false);
      }
    }
    loadCampaigns();
  }, []);

  const displayCauses = campaigns.length > 0
    ? campaigns.map((c, i) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        image: c.banner_image || fallbackCauses[i % fallbackCauses.length].image,
        tag: c.category || 'Monastic Fund',
        borderClass: 'border-t-amber-500',
        pillClass: 'glow-pill-gold',
        target: Number(c.target_amount) || 1000000,
        raised: Number(c.total_raised_computed) || 0,
        percent: Math.min(Math.round(((Number(c.total_raised_computed) || 0) / (Number(c.target_amount) || 1000000)) * 100), 100),
        icon: Landmark
      }))
    : fallbackCauses;

  const handleOpenDonate = (causeTitle = 'Great Druk Wangyel Peace Stupa', defaultAmt = 1000) => {
    setSelectedCause(causeTitle);
    setDonateAmount(defaultAmt);
    setModalOpen(true);
  };

  return (
    <div className="py-10 sm:py-16 px-3 xs:px-4 sm:px-8 min-h-[85vh] space-y-12 sm:space-y-16 relative z-10 max-w-7xl mx-auto">
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-r from-[#070A12] via-[#120508] to-[#070A12] rounded-3xl p-6 xs:p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-[#D4AF37]/40 animate-fade-in-up">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none mix-blend-luminosity"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1400&q=80')` }}
        />
        <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-5">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-semibold">
            <span className="font-tibetan text-sm">☸ མཆོད་འབུལ།</span>
            <span>• Sacred Monastic Philanthropy</span>
          </div>

          <h1 className="font-serif-brand font-extrabold text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-white tracking-wide leading-tight break-words">
            Make A Meritorious Offering for <br />
            <span className="gold-foil-text font-serif">Peace & Buddha Dharma</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
            Every offering directly finances the 108ft Great Druk Wangyel Peace Stupa, sustains resident monks with nutrition and education, and radiates blessings of merit across the world.
          </p>

          <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#D4AF37]">
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-[#D4AF37]/30">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Tax-Deductible (80G Certified)</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-[#D4AF37]/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Signed 80G Receipt</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Active Campaigns Grid */}
      <div className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="glow-pill-gold px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Active Monastic Causes
          </span>
          <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#0F172A]">
            Choose a Meritorious Project to Sponsor
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-light">
            Select a dedicated fund or project to sponsor with a one-time offering or ongoing monthly pledge.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayCauses.map((c) => {
            const Icon = c.icon || Landmark;
            return (
              <div
                key={c.id}
                className="glass-luxury-card overflow-hidden rounded-2xl flex flex-col justify-between group border border-gray-200/80"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-gray-900">
                    <img
                      src={c.image}
                      alt={c.title}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold glow-pill-gold">
                      {c.tag}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-[#0F172A]">
                      <Icon className="w-4 h-4 text-[#D4AF37]" />
                      <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] leading-snug group-hover:text-[#721C24] transition-colors">
                        {c.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 font-light">
                      {c.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-gray-700">Raised: ₹{c.raised.toLocaleString()}</span>
                        <span className="text-[#721C24]">{c.percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#721C24] rounded-full transition-all duration-1000"
                          style={{ width: `${Math.max(c.percent, 5)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-gray-400 text-right">Target: ₹{c.target.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleOpenDonate(c.title)}
                    className="w-full monastic-maroon-btn py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                    <span>OFFER DANA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Transparency & Bank Wire Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Transparency Breakdown */}
        <div className="lg:col-span-6 glass-luxury-card p-7 sm:p-8 rounded-2xl border border-gray-200/80 space-y-4">
          <h3 className="font-serif-brand font-bold text-base text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span>Financial Governance & Allocation</span>
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed font-light">
            Drodul Phendey Ling Foundation is governed by an independent Board of Trustees and audited annually under the strict statutory oversight of the Religious Organizations of Bhutan (ROB).
          </p>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-800">
                <span>85% · Peace Stupa Construction & Monastic Care</span>
                <span className="text-amber-700">85%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-800">
                <span>10% · Shedra Buddhist Study Texts & Library</span>
                <span className="text-blue-700">10%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-800">
                <span>5% · Foundation Administration & Statutory Auditing</span>
                <span className="text-emerald-700">5%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Wire Details */}
        <div className="lg:col-span-6 glass-luxury-card p-7 sm:p-8 rounded-2xl border border-gray-200/80 space-y-4">
          <h3 className="font-serif-brand font-bold text-base text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#D4AF37]" />
            <span>Direct Bank Transfer / Wire Details</span>
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed font-light">
            Devotees preferring direct RTGS, NEFT, or international SWIFT wire transfers may remit directly to our official institutional account:
          </p>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs font-mono text-gray-800">
            <p><strong className="text-gray-600 font-sans">Account Name:</strong> Drodul Phendey Ling Foundation</p>
            <p><strong className="text-gray-600 font-sans">Bank:</strong> Bank of Bhutan Ltd. (BoB)</p>
            <p><strong className="text-gray-600 font-sans">Account Number:</strong> 20188944110023</p>
            <p><strong className="text-gray-600 font-sans">Branch:</strong> Gelephu Main Branch, Bhutan</p>
            <p><strong className="text-gray-600 font-sans">SWIFT Code:</strong> BOBNBTBT</p>
          </div>
          <p className="text-[11px] text-gray-500 italic">
            * After wire transfer, please email payment confirmation to <span className="font-semibold text-gray-700">contact@drodulphendeyling.org</span> for instant 80G tax receipt issuance.
          </p>
        </div>
      </div>

      {modalOpen && (
        <DonationModal
          initialAmount={donateAmount}
          initialType={frequency}
          causeTitle={selectedCause}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
