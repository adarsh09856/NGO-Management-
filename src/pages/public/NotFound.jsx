import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#0F172A] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-xl">
          <Compass className="w-10 h-10 text-[#D4AF37] animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#BE123C] font-semibold">
            404 · Page Not Found
          </p>
          <h1 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#0F172A]">
            Sacred Path Not Found
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            The path or resource you are looking for does not exist, has been moved, or is private.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F172A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1E293B] transition-colors shadow"
          >
            <Home className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Return Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
