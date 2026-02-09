'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/providers/UserProvider';

/**
 * /profile redirects to:
 * - /profile/setup if profile incomplete
 * - /settings if profile complete (for editing)
 */

export default function ProfilePage() {
  const router = useRouter();
  const { profile, financials, isLoading, isDemoMode } = useUserProfile();
  
  useEffect(() => {
    if (isLoading) return;
    
    // Check if profile is "complete" enough
    const hasAccounts = 
      (profile?.cashAccounts && profile.cashAccounts.length > 0) ||
      (profile?.retirementAccounts && profile.retirementAccounts.length > 0) ||
      (profile?.investmentAccounts && profile.investmentAccounts.length > 0);
    
    const hasNetWorth = financials && financials.netWorth > 0;
    
    // In demo mode, go to settings
    if (isDemoMode) {
      router.replace('/settings');
      return;
    }
    
    // If profile is incomplete, go to setup
    if (!hasAccounts && !hasNetWorth) {
      router.replace('/profile/setup');
    } else {
      // Otherwise go to settings to edit
      router.replace('/settings');
    }
  }, [isLoading, profile, financials, isDemoMode, router]);
  
  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading your profile...</p>
      </div>
    </div>
  );
}
