'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserProfile } from '@/providers/UserProvider';

export default function DemoBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDemoMode, exitDemoMode } = useUserProfile();
  
  // Don't show on vision page
  const isVisionPage = pathname?.startsWith('/vision');
  
  // Add/remove body padding when demo mode is active
  useEffect(() => {
    if (isDemoMode) {
      document.body.style.paddingTop = '48px';
    } else {
      document.body.style.paddingTop = '0';
    }
    return () => {
      document.body.style.paddingTop = '0';
    };
  }, [isDemoMode]);
  
  if (!isDemoMode || isVisionPage) return null;
  
  const handleStartWithMyData = () => {
    exitDemoMode();
    router.push('/onboarding');
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white py-2.5 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl animate-bounce">🎮</span>
          <div>
            <span className="font-semibold">Demo Mode</span>
            <span className="hidden sm:inline text-white/80 ml-2">
              — Exploring with sample $800K portfolio
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartWithMyData}
            className="px-4 py-1.5 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 text-sm shadow-md"
          >
            Use My Real Data →
          </button>
          <button
            onClick={() => { exitDemoMode(); router.push('/'); }}
            className="text-white/80 hover:text-white transition-colors text-sm p-1"
            title="Exit Demo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
