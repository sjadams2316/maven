'use client';

import { User } from 'lucide-react';

interface ClientHeaderProps {
  firmName?: string;
  firmLogo?: string;
  clientName: string;
}

export function ClientHeader({ 
  firmName = 'Maven Partners', 
  firmLogo, 
  clientName,
}: ClientHeaderProps) {
  const firstName = clientName.split(' ')[0];
  
  return (
    <header 
      className="sticky top-0 z-50 bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Firm branding - Maven Partners with teal gradient */}
        <div className="flex items-center gap-3">
          {firmLogo ? (
            <img 
              src={firmLogo} 
              alt={firmName}
              className="h-10 w-10 rounded-xl object-contain"
            />
          ) : (
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-lg bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/20"
            >
              MP
            </div>
          )}
          <div>
            <p className="text-sm text-gray-400">Your advisor</p>
            <p className="font-semibold text-white bg-gradient-to-r from-teal-200 to-teal-400 bg-clip-text text-transparent">
              {firmName}
            </p>
          </div>
        </div>

        {/* Client greeting with account badge */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 hidden sm:block">
            Welcome back, <span className="text-white font-medium">{firstName}</span>
          </span>
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center bg-teal-500/10 border border-teal-500/20 transition-all hover:bg-teal-500/20"
          >
            <User 
              className="h-5 w-5 text-teal-400" 
            />
          </div>
        </div>
      </div>
    </header>
  );
}

// Skeleton for loading state - dark theme
export function ClientHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 animate-pulse" />
          <div>
            <div className="h-3 w-16 bg-white/10 rounded animate-pulse mb-1" />
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 bg-white/10 rounded animate-pulse hidden sm:block" />
          <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>
    </header>
  );
}
