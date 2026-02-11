'use client';

import { User } from 'lucide-react';

interface ClientHeaderProps {
  firmName: string;
  firmLogo?: string;
  clientName: string;
  primaryColor?: string;
}

export function ClientHeader({ 
  firmName, 
  firmLogo, 
  clientName,
  primaryColor = '#4f46e5' // indigo-600 default
}: ClientHeaderProps) {
  return (
    <header 
      className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm"
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Firm branding */}
        <div className="flex items-center gap-3">
          {firmLogo ? (
            <img 
              src={firmLogo} 
              alt={firmName}
              className="h-10 w-10 rounded-lg object-contain"
            />
          ) : (
            <div 
              className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {firmName.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm text-slate-500">Your advisor</p>
            <p className="font-semibold text-slate-900">{firmName}</p>
          </div>
        </div>

        {/* Client greeting */}
        <div className="flex items-center gap-2">
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <User 
              className="h-5 w-5" 
              style={{ color: primaryColor }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

// Skeleton for loading state
export function ClientHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-200 animate-pulse" />
          <div>
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mb-1" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
      </div>
    </header>
  );
}
