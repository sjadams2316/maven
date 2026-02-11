'use client';

import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean; // Force color regardless of trend
  showArea?: boolean;
  strokeWidth?: number;
}

export default function Sparkline({
  data,
  width = 80,
  height = 24,
  positive,
  showArea = true,
  strokeWidth = 1.5,
}: SparklineProps) {
  const { pathD, areaD, isPositive, min, max } = useMemo(() => {
    if (!data || data.length < 2) {
      return { pathD: '', areaD: '', isPositive: true, min: 0, max: 0 };
    }

    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;
    const padding = 2;

    const scaleX = (width - padding * 2) / (data.length - 1);
    const scaleY = (height - padding * 2) / range;

    const points = data.map((val, i) => ({
      x: padding + i * scaleX,
      y: height - padding - (val - minVal) * scaleY,
    }));

    // Create smooth curve using quadratic bezier
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      linePath += ` Q ${prev.x + (curr.x - prev.x) * 0.5} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`;
    }
    const lastPoint = points[points.length - 1];
    linePath += ` L ${lastPoint.x} ${lastPoint.y}`;

    // Area path (close to bottom)
    const areaPath = `${linePath} L ${lastPoint.x} ${height} L ${points[0].x} ${height} Z`;

    // Determine trend: compare last value to first
    const trendPositive = data[data.length - 1] >= data[0];

    return {
      pathD: linePath,
      areaD: areaPath,
      isPositive: positive !== undefined ? positive : trendPositive,
      min: minVal,
      max: maxVal,
    };
  }, [data, width, height, positive]);

  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="bg-white/5 rounded" />;
  }

  const color = isPositive ? '#10B981' : '#EF4444'; // emerald-500 / red-500
  const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2)}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showArea && (
        <path d={areaD} fill={`url(#${gradientId})`} />
      )}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={width - 2}
        cy={height - 2 - ((data[data.length - 1] - (Math.min(...data) || 0)) / ((Math.max(...data) - Math.min(...data)) || 1)) * (height - 4)}
        r="2"
        fill={color}
      />
    </svg>
  );
}
