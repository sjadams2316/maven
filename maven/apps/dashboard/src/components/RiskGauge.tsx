'use client';

interface RiskGaugeProps {
  score: number; // 1-10 scale
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const RISK_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Very Conservative', color: '#10B981' },
  2: { label: 'Conservative', color: '#34D399' },
  3: { label: 'Moderately Conservative', color: '#6EE7B7' },
  4: { label: 'Moderate-Low', color: '#A7F3D0' },
  5: { label: 'Moderate', color: '#FCD34D' },
  6: { label: 'Moderate-High', color: '#FBBF24' },
  7: { label: 'Growth', color: '#F59E0B' },
  8: { label: 'Aggressive Growth', color: '#F97316' },
  9: { label: 'Aggressive', color: '#EF4444' },
  10: { label: 'Very Aggressive', color: '#DC2626' },
};

export default function RiskGauge({ score, size = 'md', showLabel = true }: RiskGaugeProps) {
  const clampedScore = Math.max(1, Math.min(10, Math.round(score)));
  const { label, color } = RISK_LABELS[clampedScore];
  
  const sizes = {
    sm: { gauge: 'h-2', width: 'w-32', text: 'text-xs' },
    md: { gauge: 'h-3', width: 'w-48', text: 'text-sm' },
    lg: { gauge: 'h-4', width: 'w-64', text: 'text-base' },
  };
  
  const { gauge, width, text } = sizes[size];
  const percentage = (clampedScore / 10) * 100;

  return (
    <div className="space-y-2">
      {/* Score and label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span 
            className="text-2xl font-bold" 
            style={{ color }}
          >
            {clampedScore}
          </span>
          <span className="text-gray-400 text-sm">/10</span>
        </div>
        {showLabel && (
          <span className={`${text} text-gray-400`}>{label}</span>
        )}
      </div>
      
      {/* Gauge bar */}
      <div className={`${width} ${gauge} bg-white/10 rounded-full overflow-hidden`}>
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${percentage}%`,
            background: `linear-gradient(90deg, #10B981 0%, #FBBF24 50%, #EF4444 100%)`,
          }}
        />
      </div>
      
      {/* Scale markers */}
      <div className={`${width} flex justify-between text-xs text-gray-600`}>
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}

// Compact inline version
export function RiskBadge({ score }: { score: number }) {
  const clampedScore = Math.max(1, Math.min(10, Math.round(score)));
  const { label, color } = RISK_LABELS[clampedScore];
  
  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-medium"
      style={{ 
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      <span className="font-bold">{clampedScore}</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  );
}
