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
    <div className="w-full overflow-hidden bg-[#2C060D] border-b border-[#5A121E] select-none pointer-events-none py-0.5">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 opacity-90">
        {Array.from({ length: 6 }).map((_, repeatIndex) => (
          <div key={repeatIndex} className="hidden sm:flex items-center space-x-1.5 flex-1 justify-around">
            {flags.map((f, i) => (
              <div
                key={i}
                className={`h-2.5 w-6 sm:w-8 ${f.bg} rounded-[2px] shadow-sm flex items-center justify-center transform transition-transform duration-700 hover:scale-110`}
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)'
                }}
              >
                <span className={`text-[7px] font-tibetan font-bold ${f.dark ? 'text-gray-900' : 'text-white'}`}>
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
