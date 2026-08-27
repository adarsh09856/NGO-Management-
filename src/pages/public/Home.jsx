import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, ArrowRight, Play, CheckCircle2, Shield, Globe, FileText,
  Smartphone, Sparkles, HeartHandshake, GraduationCap, Landmark,
  Warehouse, UserCheck, FolderKanban, MessageSquareShare
} from 'lucide-react';
import DonationModal from '../../components/DonationModal';

export default function Home() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState(50);
  const [donateFrequency, setDonateFrequency] = useState('one_time');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleHeroDonate = (amt) => {
    setDonateAmount(amt);
    setDonateModalOpen(true);
  };

  return (
    <div className="w-full">
      {/* 1. HERO BANNER & FLOATING DONATE WIDGET (Matching image 4) */}
      <section className="relative min-h-[620px] bg-gradient-to-r from-[#2C060D] via-[#4A0E17] to-[#1F0408] text-white overflow-hidden py-16 px-4 sm:px-8">
        {/* Background Monastery Stupa Image with Warm Overlay */}
        <div className="absolute inset-0 opacity-30 mix-blend-luminosity bg-cover bg-center pointer-events-none"
             style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop')` }}>
        </div>
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

          {/* Right Floating Widget: MAKE A DIFFERENCE (Matching image 4) */}
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
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonateAmount(amt)}
                    className={`py-2 text-xs font-bold rounded border transition-all ${
                      donateAmount === amt
                        ? 'bg-[#FDF6E2] border-[#D4AF37] text-[#4A0E17] ring-2 ring-[#D4AF37]'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setDonateModalOpen(true)}
                  className="py-2 text-xs font-bold rounded border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                >
                  Other
                </button>
              </div>

              {/* Donate Button */}
              <button
                onClick={() => setDonateModalOpen(true)}
                className="w-full bg-[#7E1929] hover:bg-[#5A121E] text-white py-3 rounded-md font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all mb-3"
              >
                <span>DONATE NOW</span>
                <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
              </button>

              {/* Trust Subtext */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>100% Tax Exempt (80G)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MODULE OVERVIEW 7-CARD STRIP (Matching image 4) */}
      <section className="bg-white border-b border-[#EBE5D8] py-8 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* Card 1: Donation Management */}
            <div className="monastery-card p-3.5 text-center flex flex-col justify-between items-center monastery-card-hover group">
              <div className="w-10 h-10 rounded-full bg-[#FDF6E2] text-[#4A0E17] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-5 h-5 text-[#4A0E17]" />
              </div>
              <div>
                <h4 className="font-bold text-[11px] text-[#4A0E17] uppercase tracking-wider mb-1">
                  Donation Management
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-2">
                  Manage donations, donors & receipts seamlessly
                </p>
              </div>
              <Link to="/admin/donations" className="text-[10px] font-bold text-[#8B1E2F] hover:text-[#4A0E17] mt-2 pt-1 border-t border-gray-100 w-full block">
                View Module
              </Link>
            </div>

            {/* Card 2: Training & LMS */}
            <div className="monastery-card p-3.5 text-center flex flex-col justify-between items-center monastery-card-hover group">
              <div className="w-10 h-10 rounded-full bg-[#FDF6E2] text-[#4A0E17] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-5 h-5 text-[#4A0E17]" />
              </div>
              <div>
                <h4 className="font-bold text-[11px] text-[#4A0E17] uppercase tracking-wider mb-1">
                  Training & LMS
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-2">
                  Monk & student learning, courses & certifications
                </p>
              </div>
              <Link to="/admin/lms" className="text-[10px] font-bold text-[#8B1E2F] hover:text-[#4A0E17] mt-2 pt-1 border-t border-gray-100 w-full block">
                View Module
              </Link>
            </div>

            {/* Card 3: Accounts & Finance */}
            <div className="monastery-card p-3.5 text-center flex flex-col justify-between items-center monastery-card-hover group">
              <div className="w-10 h-10 rounded-full bg-[#FDF6E2] text-[#4A0E17] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Landmark className="w-5 h-5 text-[#4A0E17]" />
              </div>
              <div>
                <h4 className="font-bold text-[11px] text-[#4A0E17] uppercase tracking-wider mb-1">
                  Accounts & Finance
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-2">
                  Income, expenses, budgeting & financial reports
                </p>
              </div>
              <Link to="/admin/accounts" className="text-[10px] font-bold text-[#8B1E2F] hover:text-[#4A0E17] mt-2 pt-1 border-t border-gray-100 w-full block">
                View Module
              </Link>
            </div>

            {/* Card 4: Inventory & Store */}
            <div className="monastery-card p-3.5 text-center flex flex-col justify-between items-center monastery-card-hover group">
              <div className="w-10 h-10 rounded-full bg-[#FDF6E2] text-[#4A0E17] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Warehouse className="w-5 h-5 text-[#4A0E17]" />
              </div>
              <div>
                <h4 className="font-bold text-[11px] text-[#4A0E17] uppercase tracking-wider mb-1">
                  Inventory & Store
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-2">
                  Track items, stock, usage & purchase
                </p>
              </div>
              <Link to="/admin/inventory" className="text-[10px] font-bold text-[#8B1E2F] hover:text-[#4A0E17] mt-2 pt-1 border-t border-gray-100 w-full block">
                View Module
              </Link>
            </div>

            {/* Card 5: HRM & Payroll */}
            <div className="monastery-card p-3.5 text-center flex flex-col justify-between items-center monastery-card-hover group">
              <div className="w-10 h-10 rounded-full bg-[#FDF6E2] text-[#4A0E17] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <UserCheck className="w-5 h-5 text-[#4A0E17]" />
              </div>
              <div>
                <h4 className="font-bold text-[11px] text-[#4A0E17] uppercase tracking-wider mb-1">
                  HRM & Payroll
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-2">
                  Staff management, attendance, payroll & wages
                </p>
              </div>
              <Link to="/admin/hrm/employees" className="text-[10px] font-bold text-[#8B1E2F] hover:text-[#4A0E17] mt-2 pt-1 border-t border-gray-100 w-full block">
                View Module
              </Link>
            </div>

            {/* Card 6: Projects & Events */}
            <div className="monastery-card p-3.5 text-center flex flex-col justify-between items-center monastery-card-hover group">
              <div className="w-10 h-10 rounded-full bg-[#FDF6E2] text-[#4A0E17] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FolderKanban className="w-5 h-5 text-[#4A0E17]" />
              </div>
              <div>
                <h4 className="font-bold text-[11px] text-[#4A0E17] uppercase tracking-wider mb-1">
                  Projects & Events
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-2">
                  Stupa construction, events & project tracking
                </p>
              </div>
              <Link to="/admin/projects" className="text-[10px] font-bold text-[#8B1E2F] hover:text-[#4A0E17] mt-2 pt-1 border-t border-gray-100 w-full block">
                View Module
              </Link>
            </div>

            {/* Card 7: CRM & Communication */}
            <div className="monastery-card p-3.5 text-center flex flex-col justify-between items-center monastery-card-hover group col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded-full bg-[#FDF6E2] text-[#4A0E17] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <MessageSquareShare className="w-5 h-5 text-[#4A0E17]" />
              </div>
              <div>
                <h4 className="font-bold text-[11px] text-[#4A0E17] uppercase tracking-wider mb-1">
                  CRM & Communication
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-2">
                  Donor relations, follow-ups & communication
                </p>
              </div>
              <Link to="/admin/crm" className="text-[10px] font-bold text-[#8B1E2F] hover:text-[#4A0E17] mt-2 pt-1 border-t border-gray-100 w-full block">
                View Module
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT DPL FOUNDATION, VIDEO & MISSION (Matching image 4) */}
      <section className="py-14 px-4 sm:px-8 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Col 1: About Text */}
          <div className="lg:col-span-3 space-y-4">
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
          <div className="lg:col-span-3">
            <div className="relative rounded-lg overflow-hidden border-2 border-[#D4AF37] shadow-md group cursor-pointer" onClick={() => setVideoModalOpen(true)}>
              <img
                src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop"
                alt="Great Druk Wangyel Stupa Story"
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
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
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-serif-brand font-bold text-sm text-[#8B1E2F] uppercase tracking-widest">
              OUR MISSION
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">☸</span>
                <span>Build spiritual & educational institutions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">☸</span>
                <span>Nurture monks & students in Buddha Dharma</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">☸</span>
                <span>Serve communities & preserve culture</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">☸</span>
                <span>Promote peace, compassion & harmony</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-serif-brand font-bold text-sm text-[#8B1E2F] uppercase tracking-widest">
              QUICK LINKS
            </h3>
            <ul className="space-y-2 text-xs text-gray-700 font-medium">
              <li>
                <Link to="/prayer-request" className="hover:text-[#8B1E2F] flex justify-between items-center py-0.5 border-b border-gray-200">
                  <span>Prayer Request</span>
                  <span className="text-[#D4AF37]">→</span>
                </Link>
              </li>
              <li>
                <Link to="/get-involved" className="hover:text-[#8B1E2F] flex justify-between items-center py-0.5 border-b border-gray-200">
                  <span>Volunteer With Us</span>
                  <span className="text-[#D4AF37]">→</span>
                </Link>
              </li>
              <li>
                <Link to="/news-events" className="hover:text-[#8B1E2F] flex justify-between items-center py-0.5 border-b border-gray-200">
                  <span>Upcoming Events</span>
                  <span className="text-[#D4AF37]">→</span>
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-[#8B1E2F] flex justify-between items-center py-0.5 border-b border-gray-200">
                  <span>Download Brochure</span>
                  <span className="text-[#D4AF37]">→</span>
                </Link>
              </li>
              <li>
                <Link to="/news-events" className="hover:text-[#8B1E2F] flex justify-between items-center py-0.5">
                  <span>News & Announcements</span>
                  <span className="text-[#D4AF37]">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Quote Panel (Matching image 4) */}
          <div className="lg:col-span-2">
            <div className="bg-[#4A0E17] text-white p-5 rounded-lg border-2 border-[#D4AF37] relative shadow-md overflow-hidden">
              <span className="text-3xl text-[#D4AF37] font-serif block leading-none mb-1">“</span>
              <p className="text-xs text-gray-100 italic leading-relaxed relative z-10">
                Peace comes from within. Do not seek it without.
              </p>
              <p className="text-[11px] text-[#D4AF37] font-bold mt-2 text-right">
                — Buddha
              </p>
              <div className="absolute right-2 bottom-1 text-4xl text-white/5 font-serif pointer-events-none">
                ☸
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRUST BADGES STRIP (Matching image 4) */}
      <section className="bg-[#F8F6F0] border-y border-[#EBE5D8] py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Shield className="w-6 h-6 text-[#4A0E17] mb-1.5" />
            <h5 className="font-bold text-xs text-gray-800">Secure & Transparent</h5>
            <p className="text-[10px] text-gray-500">100% transparency in all activities</p>
          </div>
          <div className="flex flex-col items-center">
            <Globe className="w-6 h-6 text-[#4A0E17] mb-1.5" />
            <h5 className="font-bold text-xs text-gray-800">Global Support</h5>
            <p className="text-[10px] text-gray-500">Supporters from around the world</p>
          </div>
          <div className="flex flex-col items-center">
            <FileText className="w-6 h-6 text-[#4A0E17] mb-1.5" />
            <h5 className="font-bold text-xs text-gray-800">Online Receipts</h5>
            <p className="text-[10px] text-gray-500">Instant receipts for all donations</p>
          </div>
          <div className="flex flex-col items-center">
            <Smartphone className="w-6 h-6 text-[#4A0E17] mb-1.5" />
            <h5 className="font-bold text-xs text-gray-800">Accessible Anywhere</h5>
            <p className="text-[10px] text-gray-500">Access from Bhutan & worldwide</p>
          </div>
          <div className="flex flex-col items-center col-span-2 md:col-span-1">
            <Sparkles className="w-6 h-6 text-[#D4AF37] mb-1.5" />
            <h5 className="font-bold text-xs text-gray-800">AI Enabled CRM</h5>
            <p className="text-[10px] text-gray-500">Smarter management & insights</p>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-black rounded-lg overflow-hidden max-w-2xl w-full border border-gray-700">
            <div className="flex justify-between items-center p-3 bg-gray-900 text-white">
              <span className="text-xs font-bold">Great Druk Wangyel Peace Stupa Story</span>
              <button onClick={() => setVideoModalOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center text-white">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Monastery Story"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      <DonationModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        defaultAmount={donateAmount}
      />
    </div>
  );
}
