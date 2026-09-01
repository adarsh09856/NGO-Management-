import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Phone, Mail, Globe, Shield, Sparkles } from 'lucide-react';

export default function Footer({ onOpenDonate }) {
  return (
    <footer className="bg-[#3B0A13] text-[#F3F4F6] border-t-4 border-[#D4AF37] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#5A121E]">
          {/* Col 1: About & Crest */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#4A0E17] border-2 border-[#D4AF37] flex items-center justify-center">
                <span className="text-[#D4AF37] text-xl font-serif font-bold">☸</span>
              </div>
              <div>
                <h3 className="font-serif-brand font-bold text-sm tracking-wider text-white">
                  DRODUL PHENDEY LING
                </h3>
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest">
                  Foundation · Bhutan
                </p>
              </div>
            </div>
            <p className="text-xs text-[#D1D5DB] leading-relaxed">
              A registered Buddhist charitable institution dedicated to constructing the Great Druk Wangyel Peace Stupa, establishing the Shedra Monastic University, and nurturing Dharma for global peace and harmony.
            </p>
            <div className="pt-2">
              <span className="inline-block bg-[#4A0E17] text-[#D4AF37] text-[11px] px-3 py-1 rounded border border-[#D4AF37]/40 font-mono">
                Tax Reg: DPL/TAX-EXEMPT/BTN/2026/80G-092
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-serif-brand font-bold text-sm text-[#D4AF37] tracking-wider mb-4 border-b border-[#5A121E] pb-2">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D1D5DB]">
              <li>
                <Link to="/prayer-request" className="hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors">
                  <span className="text-[#D4AF37]">→</span> Prayer Request & Butter Lamps
                </Link>
              </li>
              <li>
                <Link to="/get-involved" className="hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors">
                  <span className="text-[#D4AF37]">→</span> Volunteer With Us
                </Link>
              </li>
              <li>
                <Link to="/news-events" className="hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors">
                  <span className="text-[#D4AF37]">→</span> Upcoming Events & Pujas
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors">
                  <span className="text-[#D4AF37]">→</span> Download Brochure & Reports
                </Link>
              </li>
              <li>
                <Link to="/news-events" className="hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors">
                  <span className="text-[#D4AF37]">→</span> News & Announcements
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Monastic Portals */}
          <div>
            <h4 className="font-serif-brand font-bold text-sm text-[#D4AF37] tracking-wider mb-4 border-b border-[#5A121E] pb-2">
              PORTAL ACCESS
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D1D5DB]">
              <li>
                <Link to="/login" className="hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors">
                  <span className="text-[#D4AF37]">☸</span> Devotee & Member Portal
                </Link>
              </li>
              <li>
                <Link to="/learning" className="hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors">
                  <span className="text-[#D4AF37]">☸</span> Open Dharma Video Library
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors">
                  <span className="text-[#D4AF37]">☸</span> Staff & Administration Shell
                </Link>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenDonate}
                  className="w-full bg-[#7E1929] hover:bg-[#8B1E2F] text-white py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#D4AF37]/50 shadow transition-all"
                >
                  <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                  <span>Support Our Mission</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Location */}
          <div>
            <h4 className="font-serif-brand font-bold text-sm text-[#D4AF37] tracking-wider mb-4 border-b border-[#5A121E] pb-2">
              CONTACT HEADQUARTERS
            </h4>
            <div className="space-y-3 text-xs text-[#D1D5DB]">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>Great Druk Wangyel Peace Stupa Complex, Gelephu, Sarpang Dzongkhag, Bhutan</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>+975 17556559</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>contact@drodulphendeyling.org</span>
              </div>
              <div className="pt-2 flex items-center gap-2 text-[11px] text-[#9CA3AF]">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Secure & Tax-Deductible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#9CA3AF] gap-3">
          <div>
            © 2026 Drodul Phendey Ling Foundation. All Rights Reserved. &nbsp;|&nbsp;
            <Link to="/about" className="hover:text-[#D4AF37] ml-1">Privacy Policy</Link> &nbsp;|&nbsp;
            <Link to="/about" className="hover:text-[#D4AF37]">Terms & Conditions</Link>
          </div>
          <div className="text-right text-[#9CA3AF]">
            Gelephu, Sarpang, Bhutan &nbsp;·&nbsp; v1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
}
