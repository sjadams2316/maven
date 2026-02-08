'use client';

import { useRef, useState, useEffect } from 'react';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export default function GlowCard({ 
  children, 
  className = '', 
  glowColor = 'rgba(99, 102, 241, 0.4)',
  intensity = 'medium'
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const intensityMap = {
    low: 150,
    medium: 250,
    high: 400,
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };
  
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: isHovered 
          ? `radial-gradient(${intensityMap[intensity]}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 60%)`
          : 'transparent',
      }}
    >
      <div className="relative z-10 bg-[#12121a] border border-white/10 rounded-2xl m-[1px] transition-all duration-300 hover:border-white/20">
        {children}
      </div>
    </div>
  );
}
