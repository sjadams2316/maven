'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  blur?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

export default function GlassPanel({
  children,
  className = '',
  glowColor = '#6366f1',
  blur = 'md',
  interactive = false,
  onClick,
}: GlassPanelProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const blurSize = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  }[blur];
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !panelRef.current) return;
    
    const rect = panelRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };
  
  return (
    <div
      ref={panelRef}
      className={`
        relative overflow-hidden rounded-2xl
        ${blurSize}
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: `
          linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 100%
          )
        `,
        boxShadow: isHovered
          ? `0 0 40px ${glowColor}20, 0 8px 32px rgba(0, 0, 0, 0.4)`
          : '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Glass shine effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              105deg,
              transparent 30%,
              rgba(255, 255, 255, 0.05) 50%,
              transparent 70%
            )
          `,
        }}
      />
      
      {/* Interactive hover glow */}
      {interactive && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none opacity-50 transition-opacity"
          style={{
            background: `radial-gradient(
              200px circle at ${mousePos.x}% ${mousePos.y}%,
              ${glowColor}20,
              transparent 50%
            )`,
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Preset variations
export function GlassPanelGreen({ children, ...props }: Omit<GlassPanelProps, 'glowColor'>) {
  return <GlassPanel glowColor="#10b981" {...props}>{children}</GlassPanel>;
}

export function GlassPanelPurple({ children, ...props }: Omit<GlassPanelProps, 'glowColor'>) {
  return <GlassPanel glowColor="#8b5cf6" {...props}>{children}</GlassPanel>;
}

export function GlassPanelAmber({ children, ...props }: Omit<GlassPanelProps, 'glowColor'>) {
  return <GlassPanel glowColor="#f59e0b" {...props}>{children}</GlassPanel>;
}
