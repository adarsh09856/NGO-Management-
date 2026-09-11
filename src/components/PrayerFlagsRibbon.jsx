import React from 'react';

export default function PrayerFlagsRibbon() {
  const flags = [
    { bg: 'bg-[#1E40AF]', text: 'ཨོཾ', label: 'Space / Sky' },
    { bg: 'bg-[#F9FAFB]', text: 'མཱ', label: 'Air / Wind', dark: true },
    { bg: 'bg-[#DC2626]', text: 'ཎི', label: 'Fire' },
    { bg: 'bg-[#15803D]', text: 'པད', label: 'Water' },
    { bg: 'bg-[#EAB308]', text: 'མེ', label: 'Earth' },
    { bg: 'bg-[#1E40AF]', text: 'ཧཱུྃ', label: 'Space / Sky' }
  ];

  return (
    <div className="w-full overflow-hidden bg-[#070A12] border-b border-[#D4AF37]/20 select-none pointer-events-none py-1 relative">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-2 sm:px-4 opacity-95">
        {Array.from({ length: 4 }).map((_, repeatIndex) => (
          <div key={repeatIndex} className="flex items-center space-x-1 sm:space-x-2 flex-1 justify-around animate-prayer-wave">
            {flags.map((f, i) => (
              <div
                key={i}
                className={`h-2 sm:h-2.5 w-5 sm:w-8 ${f.bg} rounded-[1px] shadow-sm flex items-center justify-center`}
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 50% 100%, 0% 80%)'
                }}
              >
                <span className={`text-[6px] sm:text-[7px] font-tibetan font-bold ${f.dark ? 'text-gray-900' : 'text-white'}`}>
                  {f.text}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
