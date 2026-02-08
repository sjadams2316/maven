'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FloatingOrbProps {
  href?: string;
  onClick?: () => void;
  icon?: string;
  label?: string;
  pulseColor?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export default function FloatingOrb({
  href = '/oracle',
  onClick,
  icon = '🔮',
  label = 'Ask Maven',
  pulseColor = 'purple',
  size = 'md',
  position = 'bottom-right',
}: FloatingOrbProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };
  
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-24 right-6',
    'top-left': 'top-24 left-6',
  };
  
  const colorMap = {
    purple: {
      gradient: 'from-purple-600 via-violet-600 to-indigo-600',
      glow: 'rgba(139, 92, 246, 0.5)',
      pulse: 'rgba(139, 92, 246, 0.3)',
    },
    blue: {
      gradient: 'from-blue-600 via-cyan-600 to-teal-600',
      glow: 'rgba(59, 130, 246, 0.5)',
      pulse: 'rgba(59, 130, 246, 0.3)',
    },
    green: {
      gradient: 'from-emerald-600 via-green-600 to-teal-600',
      glow: 'rgba(16, 185, 129, 0.5)',
      pulse: 'rgba(16, 185, 129, 0.3)',
    },
  };
  
  const colors = colorMap[pulseColor as keyof typeof colorMap] || colorMap.purple;
  
  const OrbContent = (
    <div
      className={`fixed ${positionClasses[position]} z-50 flex items-center gap-3`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Expanded label */}
      {isHovered && label && (
        <div 
          className="px-4 py-2 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl text-white text-sm whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200"
        >
          {label}
        </div>
      )}
      
      {/* Orb */}
      <div className="relative">
        {/* Outer pulse rings */}
        <div 
          className="absolute inset-0 rounded-full animate-ping"
          style={{ 
            backgroundColor: colors.pulse,
            animationDuration: '3s',
          }}
        />
        <div 
          className="absolute -inset-2 rounded-full animate-pulse opacity-50"
          style={{ 
            backgroundColor: colors.pulse,
            animationDuration: '2s',
          }}
        />
        
        {/* Main orb */}
        <div 
          className={`
            relative ${sizeClasses[size]} rounded-full 
            bg-gradient-to-br ${colors.gradient}
            flex items-center justify-center
            shadow-2xl cursor-pointer
            transition-all duration-300
            ${isHovered ? 'scale-110' : 'scale-100'}
          `}
          style={{
            boxShadow: isHovered 
              ? `0 0 40px ${colors.glow}, 0 0 80px ${colors.pulse}`
              : `0 0 20px ${colors.glow}`,
          }}
        >
          <span className={`transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
            {icon}
          </span>
          
          {/* Inner shine */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
        </div>
      </div>
    </div>
  );
  
  if (onClick) {
    return <button onClick={onClick}>{OrbContent}</button>;
  }
  
  if (href) {
    return <Link href={href}>{OrbContent}</Link>;
  }
  
  return OrbContent;
}
