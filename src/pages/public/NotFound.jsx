import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-[#FCFBF9] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full text-center space-y-6 relative z-10 glass-luxury-card p-10 rounded-3xl border border-[#D4AF37]/30 shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1A0B0E] via-[#4A0E17] to-[#1A0B0E] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-2xl ring-4 ring-[#D4AF37]/20">
          <Compass className="w-10 h-10 text-[#D4AF37] animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#721C24] font-serif font-bold">
            ༄༅། །༤༠༤ · Page Not Found
          </p>
          <h1 className="font-editorial font-bold text-2xl sm:text-3xl text-[#1A0B0E]">
            Sacred Path Not Found
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto leading-relaxed font-serif font-light">
            The path or resource you are seeking does not exist, has been consecrated under another name, or is reserved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to="/"
            className="monastic-maroon-btn px-6 py-2.5 rounded-full text-xs inline-flex items-center gap-2 shadow-lg"
          >
            <Home className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Return to Sanctuary</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2.5 rounded-full bg-white border border-[#D4AF37]/40 text-gray-700 text-xs font-serif font-semibold hover:border-[#D4AF37] transition-all shadow-sm inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#721C24]" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
