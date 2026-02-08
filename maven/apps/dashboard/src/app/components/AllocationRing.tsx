'use client';

import { useState, useEffect } from 'react';

interface AllocationSegment {
  label: string;
  value: number;
  color: string;
  amount?: number;
}

interface AllocationRingProps {
  segments: AllocationSegment[];
  size?: number;
  strokeWidth?: number;
  showLabels?: boolean;
  animated?: boolean;
  centerContent?: React.ReactNode;
}

export default function AllocationRing({
  segments,
  size = 200,
  strokeWidth = 24,
  showLabels = true,
  animated = true,
  centerContent,
}: AllocationRingProps) {
  const [animationProgress, setAnimationProgress] = useState(animated ? 0 : 1);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  
  useEffect(() => {
    if (!animated) return;
    
    const startTime = performance.now();
    const duration = 1500;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(eased);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [animated]);
  
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercent = 0;
  const arcs = segments.map((segment, idx) => {
    const percent = segment.value / total;
    const offset = cumulativePercent * circumference;
    const length = percent * circumference * animationProgress;
    cumulativePercent += percent;
    
    return {
      ...segment,
      percent,
      offset,
      length,
      idx,
    };
  });
  
  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Segments */}
        {arcs.map((arc) => (
          <circle
            key={arc.idx}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={hoveredSegment === arc.idx ? strokeWidth + 4 : strokeWidth}
            strokeDasharray={`${arc.length} ${circumference - arc.length}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="round"
            className="transition-all duration-300 cursor-pointer"
            style={{
              filter: hoveredSegment === arc.idx ? `drop-shadow(0 0 8px ${arc.color})` : 'none',
            }}
            onMouseEnter={() => setHoveredSegment(arc.idx)}
            onMouseLeave={() => setHoveredSegment(null)}
          />
        ))}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {centerContent || (
          <div className="text-center">
            {hoveredSegment !== null ? (
              <>
                <p className="text-2xl font-bold text-white">
                  {(arcs[hoveredSegment].percent * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-gray-400">{arcs[hoveredSegment].label}</p>
                {arcs[hoveredSegment].amount && (
                  <p className="text-xs text-gray-500">
                    ${arcs[hoveredSegment].amount.toLocaleString()}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-lg text-gray-400">Total</p>
                <p className="text-2xl font-bold text-white">100%</p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Legend */}
      {showLabels && (
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {segments.map((segment, idx) => (
            <div 
              key={idx}
              className={`flex items-center gap-2 cursor-pointer transition-opacity ${
                hoveredSegment !== null && hoveredSegment !== idx ? 'opacity-50' : 'opacity-100'
              }`}
              onMouseEnter={() => setHoveredSegment(idx)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-300">{segment.label}</span>
              <span className="text-sm text-gray-500">
                {((segment.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
