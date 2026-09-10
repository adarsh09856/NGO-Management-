import React from 'react';

/**
 * Responsive Inline SVG Sparkline for Time-Series Metrics
 * @param {Array<number>} data - series of numeric values
 * @param {string} color - stroke color hex
 * @param {number} width - svg viewport width
 * @param {number} height - svg viewport height
 */
export function Sparkline({ data = [], color = '#D4AF37', width = 120, height = 36, showArea = true }) {
  if (!data || data.length < 2) {
    return (
      <div className="h-9 flex items-center justify-center text-[10px] text-gray-400 italic">
        No trend data
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 3;
  const drawHeight = height - padding * 2;
  const drawWidth = width - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * drawWidth;
    const y = height - padding - ((val - min) / range) * drawHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;
  const gradientId = `sparkline-grad-${color.replace('#', '')}-${Math.random().toString(36).substr(2, 6)}`;

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {showArea && (
        <path d={areaD} fill={`url(#${gradientId})`} />
      )}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Calm Obsidian Frosted Glass Card
 */
export function GlassCard({ children, className = '', hover = true, borderAccent = '' }) {
  return (
    <div
      className={`rounded-2xl bg-white border border-[#E2E8F0] shadow-sm transition-all duration-300 ${
        hover ? 'hover:shadow-md hover:border-[#D4AF37]/50 hover:-translate-y-0.5' : ''
      } ${borderAccent ? `border-t-4 ${borderAccent}` : ''} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * High-Contrast Stat Widget with Sparkline
 */
export function GlassStatWidget({
  title,
  value,
  subtext,
  icon: Icon,
  sparklineData = [],
  color = '#D4AF37',
  badgeText = '',
  badgeType = 'positive', // 'positive' | 'negative' | 'neutral'
  className = ''
}) {
  return (
    <GlassCard className={`p-5 flex flex-col justify-between relative overflow-hidden ${className}`}>
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            {title}
          </span>
          <div className="font-serif-brand font-bold text-2xl text-[#0F172A] mt-1">
            {value}
          </div>
        </div>
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: `${color}18`, color: color }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Sparkline & Subtext Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-end justify-between gap-2">
        <div className="text-xs">
          {badgeText && (
            <span
              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-1.5 ${
                badgeType === 'positive'
                  ? 'bg-emerald-50 text-emerald-700'
                  : badgeType === 'negative'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {badgeText}
            </span>
          )}
          <span className="text-[11px] text-gray-500">{subtext}</span>
        </div>

        {sparklineData && sparklineData.length > 1 && (
          <div className="flex-shrink-0">
            <Sparkline data={sparklineData} color={color} width={100} height={32} />
          </div>
        )}
      </div>
    </GlassCard>
  );
}

/**
 * Glass UI Badge
 */
export function GlassBadge({ children, variant = 'gold', className = '' }) {
  const variants = {
    gold: 'bg-amber-50 text-amber-800 border-amber-200',
    ruby: 'bg-rose-50 text-rose-800 border-rose-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    sapphire: 'bg-blue-50 text-blue-800 border-blue-200',
    obsidian: 'bg-[#0F172A] text-[#D4AF37] border-slate-700',
    slate: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
        variants[variant] || variants.gold
      } ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Shimmering Loading Skeleton
 */
export function GlassSkeleton({ height = 'h-24', className = '' }) {
  return (
    <div
      className={`w-full rounded-2xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse ${height} ${className}`}
    />
  );
}
