import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, Layout, Sparkles, Heart, Flame, GraduationCap, Video,
  Image, Newspaper, Phone, ExternalLink, Edit3, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function PagesDirectory() {
  const pages = [
    {
      id: 'home',
      name: 'Homepage Portal',
      tibetan: 'གཙོ་ངོས།',
      route: '/',
      studioUrl: '/admin/pages/home',
      icon: Layout,
      color: 'amber',
      sectionsCount: 8,
      sections: ['Hero Showcase', 'Impact Stats', 'Campaigns', 'Documentary', '4 Pillars', 'Butter Lamps', 'Dharma Videos', 'Wisdom Journal'],
      status: 'Live & Editable',
    },
    {
      id: 'about',
      name: 'About Monastery & Mandate',
      tibetan: 'ལོ་རྒྱུས།',
      route: '/about',
      studioUrl: '/admin/pages/about',
      icon: Sparkles,
      color: 'rose',
      sectionsCount: 4,
      sections: ['Header Banner', '3 Sacred Pillars', 'Abbot & Spiritual Leadership', 'Statutory Trust & 80G'],
      status: 'Live & Editable',
    },
    {
      id: 'donate',
      name: 'Donations & Banking',
      tibetan: 'མཆོད་འབུལ།',
      route: '/donate',
      studioUrl: '/admin/donate-settings',
      icon: Heart,
      color: 'emerald',
      sectionsCount: 3,
      sections: ['Hero Banner', 'Active Causes', 'Official Bank Wire & 80G'],
      status: 'Live & Editable',
    },
    {
      id: 'prayers',
      name: 'Ceremonial Prayers & Butter Lamps',
      tibetan: 'མར་མེ་སྨོན་ལམ།',
      route: '/prayer-request',
      studioUrl: '/admin/pages/prayers',
      icon: Flame,
      color: 'amber',
      sectionsCount: 4,
      sections: ['Hero Banner', '108 Butter Lamps', 'Puja Categories', 'Shrine Daily Schedule'],
      status: 'Live & Editable',
    },
    {
      id: 'shedra',
      name: 'Shedra Monastic Academy',
      tibetan: 'བཤད་གྲྭ།',
      route: '/shedra',
      studioUrl: '/admin/pages/shedra',
      icon: GraduationCap,
      color: 'indigo',
      sectionsCount: 4,
      sections: ['Monastic Hero', '5 Great Shastras', 'Monastic Facilities', 'Admissions & Scholarships'],
      status: 'Live & Editable',
    },
    {
      id: 'learning',
      name: 'Dharma LMS Video Hub',
      tibetan: 'ཆོས་སྦྱོང་།',
      route: '/learning',
      studioUrl: '/admin/learning',
      icon: Video,
      color: 'blue',
      sectionsCount: 2,
      sections: ['LMS Hero', 'Video Discourses Grid'],
      status: 'Live & Editable',
    },
    {
      id: 'gallery',
      name: 'Sacred Photo & Media Archives',
      tibetan: 'སྐུ་པར།',
      route: '/gallery',
      studioUrl: '/admin/gallery',
      icon: Image,
      color: 'purple',
      sectionsCount: 2,
      sections: ['Gallery Header', 'Photo & Media Grid'],
      status: 'Live & Editable',
    },
    {
      id: 'blog',
      name: 'Sacred Gazette & Articles',
      tibetan: 'དྲན་དེབ།',
      route: '/blog',
      studioUrl: '/admin/blog',
      icon: Newspaper,
      color: 'rose',
      sectionsCount: 2,
      sections: ['Bodhi Path Hero', 'Wisdom Articles Grid'],
      status: 'Live & Editable',
    },
    {
      id: 'news',
      name: 'News, Gazette & Events',
      tibetan: 'གསར་འགྱུར།',
      route: '/news-events',
      studioUrl: '/admin/blog',
      icon: Newspaper,
      color: 'emerald',
      sectionsCount: 2,
      sections: ['News Hero Banner', 'Chronicles & Events Calendar'],
      status: 'Live & Editable',
    },
    {
      id: 'contact',
      name: 'Secretariat & Inquiries',
      tibetan: 'འབྲེལ་གཏུགས།',
      route: '/contact',
      studioUrl: '/admin/pages/contact',
      icon: Phone,
      color: 'slate',
      sectionsCount: 4,
      sections: ['Hero & Inscription', 'Secretariat Seat Address', 'Department Directory', 'Visiting Hours & Map'],
      status: 'Live & Editable',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F172A] p-6 rounded-2xl text-white border border-[#1E293B] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1E293B] border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-md">
            ☸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-brand font-bold text-xl text-white">
                Web & Page Studios (CMS Hub)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#0F172A] uppercase">
                HAB Parity
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Full administrative control of every public page, section, headline, copy, and media asset.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/site-settings"
            className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-200 text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Global Site Settings</span>
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#B89628] text-[#0F172A] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pages.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F172A] border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <span className="font-tibetan text-xs text-amber-800">{p.tibetan}</span>
                      <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] leading-tight">
                        {p.name}
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    {p.status}
                  </span>
                </div>

                {/* Sections breakdown */}
                <div className="py-3.5 space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium">
                    <span>Configured Sections</span>
                    <span className="font-bold text-gray-900">{p.sectionsCount} Sections</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.sections.map((sec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10.5px] text-slate-700 font-medium"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={p.route}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Preview Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <Link
                  to={p.studioUrl}
                  className="px-3.5 py-1.5 rounded-lg bg-[#721C24] hover:bg-[#8B2E24] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Open Studio</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
