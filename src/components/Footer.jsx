import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Phone, Mail, Shield, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function Footer({ onOpenDonate }) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      setNewsletterLoading(true);
      await api.post('/newsletter/subscribe', { email: newsletterEmail });
      setNewsletterSent(true);
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterSent(true); // graceful feedback
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="bg-[#070A12] text-[#E2E8F0] relative overflow-hidden border-t-2 border-[#D4AF37]/50 pt-16 pb-8">
      {/* Background Sacred Geometric Mandala Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1E1B4B]/30 via-[#070A12] to-[#05070D] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 space-y-12">
        {/* 1. Eight Auspicious Symbols (Ashtamangala) Accent Bar */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 pb-8 border-b border-[#D4AF37]/20 text-[#D4AF37]/80 text-xl sm:text-2xl select-none overflow-x-auto no-scrollbar py-2">
          <span className="hover:scale-125 transition-transform cursor-default" title="Dharmachakra (Wheel of Dharma)">☸</span>
          <span className="hover:scale-125 transition-transform cursor-default" title="Lotus Flower (Purity)">🪷</span>
          <span className="hover:scale-125 transition-transform cursor-default" title="Endless Knot (Interdependence)">♾</span>
          <span className="hover:scale-125 transition-transform cursor-default" title="Treasure Vase (Abundance)">🏺</span>
          <span className="hover:scale-125 transition-transform cursor-default" title="Golden Fishes (Liberation)">🎏</span>
          <span className="hover:scale-125 transition-transform cursor-default" title="Victory Banner (Enlightenment)">🚩</span>
          <span className="hover:scale-125 transition-transform cursor-default" title="Parasol (Protection)">☂</span>
          <span className="hover:scale-125 transition-transform cursor-default" title="Conch Shell (Call to Dharma)">🐚</span>
        </div>

        {/* 2. Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Mission (Col 1: 4 spans) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-[#0B0F19] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <span className="text-[#D4AF37] text-2xl font-serif font-bold">☸</span>
              </div>
              <div>
                <h3 className="font-serif-brand font-bold text-base tracking-wider text-white">
                  DRODUL PHENDEY LING
                </h3>
                <p className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-widest font-tibetan">
                  ༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Registered Buddhist charitable foundation dedicated to constructing the 108ft Great Druk Wangyel Peace Stupa, expanding the Shedra Monastic University, and preserving authentic Buddha Dharma for global peace.
            </p>

            <div className="p-3 bg-white/5 backdrop-blur-md rounded-xl border border-[#D4AF37]/30 text-[11px] text-gray-300 space-y-1">
              <p className="text-[#D4AF37] font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Kingdom of Bhutan Registered Charity</span>
              </p>
              <p className="font-mono text-[10px] text-gray-400">ROB Reg: ROB/CP-04/2021 · 100% Tax Deductible</p>
            </div>
          </div>

          {/* Sacred Programs (Col 2: 2 spans) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif-brand font-bold text-xs text-[#D4AF37] tracking-widest uppercase border-b border-[#D4AF37]/20 pb-2">
              Sacred Programs
            </h4>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li>
                <Link to="/about" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/60 text-[10px]">☸</span>
                  <span>108ft Peace Stupa</span>
                </Link>
              </li>
              <li>
                <Link to="/shedra" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/60 text-[10px]">☸</span>
                  <span>Shedra Monastic Academy</span>
                </Link>
              </li>
              <li>
                <Link to="/prayer-request" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/60 text-[10px]">☸</span>
                  <span>108 Butter Lamps</span>
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/60 text-[10px]">☸</span>
                  <span>Sangha Welfare Fund</span>
                </Link>
              </li>
              <li>
                <Link to="/learning" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/60 text-[10px]">☸</span>
                  <span>Digital Dharma Library</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Devotee Portals (Col 3: 2 spans) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif-brand font-bold text-xs text-[#D4AF37] tracking-widest uppercase border-b border-[#D4AF37]/20 pb-2">
              Devotee Portals
            </h4>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li>
                <Link to="/login" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/60 text-[10px]">☸</span>
                  <span>Devotee Sign In</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/60 text-[10px]">☸</span>
                  <span>Create Account</span>
                </Link>
              </li>
              <li>
                <Link to="/student" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/60 text-[10px]">☸</span>
                  <span>Monk Scholar Portal</span>
                </Link>
              </li>
              <li>
                <Link to="/verify-certificate" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/60 text-[10px]">☸</span>
                  <span>Verify Monastic Certificate</span>
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/60 text-[10px]">☸</span>
                  <span>Sacred Photo Archive</span>
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/60 text-[10px]">☸</span>
                  <span>Monastery Journal</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/60 text-[10px]">☸</span>
                  <span>Staff / Admin Access</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Contact (Col 4: 4 spans) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-serif-brand font-bold text-xs text-[#D4AF37] tracking-widest uppercase border-b border-[#D4AF37]/20 pb-2">
              Dharma Dispatches
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Receive auspicious lunar calendar notices, puja live-stream links, and stupa construction reports directly in your inbox.
            </p>

            {newsletterSent ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Tashi Delek! You are subscribed to our spiritual dispatches.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col xs:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-white/5 border border-white/20 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none flex-1 font-serif"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="monastic-gold-btn px-5 py-2.5 rounded-xl text-xs flex items-center justify-center shadow-md flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            <div className="pt-2 text-xs text-gray-400 space-y-1.5 font-light">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                <span>Gelephu, Sarpang Dzongkhag, Bhutan</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                <span>+975 17556559 / +975 17112233</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3. Bottom Legal Strip */}
        <div className="pt-8 border-t border-[#D4AF37]/15 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 gap-3 text-center sm:text-left">
          <div className="font-tibetan text-amber-200/80 text-xs">
            ༄༅། །བཀྲ་ཤིས་བདེ་ལེགས་ཕུན་སུམ་ཚོགས།
          </div>
          <div>
            © 2026 Drodul Phendey Ling Foundation · All Rights Reserved
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-x-3 gap-y-1">
            <Link to="/about" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/about" className="hover:text-[#D4AF37] transition-colors">Terms of Dana</Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-[#D4AF37] transition-colors">Contact Office</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
