import React from 'react';

export default function AmbientAuroraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Imperial Amber-Gold Glowing Orb (Top Left) */}
      <div
        className="absolute -top-32 -left-32 w-96 sm:w-[550px] h-96 sm:h-[550px] rounded-full bg-gradient-to-br from-amber-400/18 via-yellow-500/12 to-transparent blur-3xl animate-float-orb-1"
        style={{ willChange: 'transform' }}
      />

      {/* 2. Vibrant Sacred Ruby Orb (Top Right) */}
      <div
        className="absolute -top-20 -right-20 w-80 sm:w-[500px] h-80 sm:h-[500px] rounded-full bg-gradient-to-bl from-rose-500/16 via-red-600/10 to-transparent blur-3xl animate-float-orb-2"
        style={{ willChange: 'transform' }}
      />

      {/* 3. Celestial Sapphire Orb (Mid Left / Center) */}
      <div
        className="absolute top-1/3 -left-28 w-80 sm:w-[480px] h-80 sm:h-[480px] rounded-full bg-gradient-to-tr from-blue-500/14 via-indigo-500/8 to-transparent blur-3xl animate-float-orb-3"
        style={{ willChange: 'transform' }}
      />

      {/* 4. Sacred Emerald Light Orb (Bottom Right) */}
      <div
        className="absolute -bottom-36 -right-28 w-96 sm:w-[520px] h-96 sm:h-[520px] rounded-full bg-gradient-to-tl from-emerald-400/15 via-teal-500/10 to-transparent blur-3xl animate-float-orb-1"
        style={{ willChange: 'transform' }}
      />

      {/* 5. Subtle Spiritual Amethyst Center Haze */}
      <div
        className="absolute top-2/3 left-1/4 w-72 sm:w-[400px] h-72 sm:h-[400px] rounded-full bg-gradient-to-r from-purple-500/8 via-pink-500/6 to-transparent blur-3xl animate-float-orb-2"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}
