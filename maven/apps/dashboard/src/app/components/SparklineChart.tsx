'use client';

import { useMemo } from 'react';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  showArea?: boolean;
  strokeWidth?: number;
  className?: string;
  animated?: boolean;
}

export default function SparklineChart({
  data,
  width = 120,
  height = 40,
  color = '#6366f1',
  fillColor,
  showArea = true,
  strokeWidth = 2,
  className = '',
  animated = true,
}: SparklineChartProps) {
  const { path, areaPath, isPositive } = useMemo(() => {
    if (data.length < 2) return { path: '', areaPath: '', isPositive: true };
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const padding = 4;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - ((value - min) / range) * chartHeight,
    }));
    
    // Create smooth curve using bezier
    let pathD = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      pathD += ` Q ${prev.x + (curr.x - prev.x) * 0.5} ${prev.y}, ${cpx} ${(prev.y + curr.y) / 2}`;
      pathD += ` T ${curr.x} ${curr.y}`;
    }
    
    // Area path
    const areaD = pathD + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    
    const isPositive = data[data.length - 1] >= data[0];
    
    return { path: pathD, areaPath: areaD, isPositive };
  }, [data, width, height]);
  
  const actualColor = color === 'auto' ? (isPositive ? '#10b981' : '#ef4444') : color;
  const actualFillColor = fillColor || (actualColor + '20');
  
  return (
    <svg 
      width={width} 
      height={height} 
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`gradient-${actualColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={actualColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={actualColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {showArea && (
        <path
          d={areaPath}
          fill={`url(#gradient-${actualColor.replace('#', '')})`}
          className={animated ? 'animate-fade-in' : ''}
        />
      )}
      
      <path
        d={path}
        fill="none"
        stroke={actualColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'animate-draw' : ''}
        style={animated ? {
          strokeDasharray: 1000,
          strokeDashoffset: 1000,
          animation: 'draw 1.5s ease-out forwards',
        } : {}}
      />
      
      {/* End dot */}
      <circle
        cx={width - 4}
        cy={data.length > 0 ? 
          4 + (height - 8) - ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * (height - 8)
          : height / 2
        }
        r={3}
        fill={actualColor}
        className={animated ? 'animate-pulse' : ''}
      />
      
      <style jsx>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </svg>
  );
}
