'use client';

import { useState, useEffect } from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  animated?: boolean;
  glowing?: boolean;
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 12,
  color = '#6366f1',
  bgColor = 'rgba(255,255,255,0.1)',
  showLabel = true,
  label,
  sublabel,
  animated = true,
  glowing = true,
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(animated ? 0 : progress);
  
  useEffect(() => {
    if (!animated) {
      setAnimatedProgress(progress);
      return;
    }
    
    const startTime = performance.now();
    const duration = 1200;
    const startProgress = animatedProgress;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);
      
      // Ease out expo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const currentProgress = startProgress + (progress - startProgress) * eased;
      
      setAnimatedProgress(currentProgress);
      
      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [progress, animated]);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;
  
  const getColor = () => {
    if (typeof color === 'string' && color.startsWith('gradient')) {
      return undefined;
    }
    return color;
  };
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
          
          {glowing && (
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color === 'gradient' ? 'url(#progressGradient)' : color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter={glowing ? 'url(#glow)' : undefined}
          className="transition-all duration-300"
        />
      </svg>
      
      {/* Center label */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {Math.round(animatedProgress)}%
          </span>
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {sublabel && <span className="text-xs text-gray-500">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
