'use client';

import Link from 'next/link';
import { useUserProfile } from '@/providers/UserProvider';

/**
 * ProfileCompletionBanner
 * Shows a prompt to complete the detailed financial profile
 * Only shown when user has incomplete profile data
 */

export default function ProfileCompletionBanner() {
  const { profile, financials, isDemoMode } = useUserProfile();
  
  // Don't show in demo mode
  if (isDemoMode) return null;
  
  // Check if profile is "incomplete" - no accounts added
  const hasNoAccounts = 
    (!profile?.cashAccounts || profile.cashAccounts.length === 0) &&
    (!profile?.retirementAccounts || profile.retirementAccounts.length === 0) &&
    (!profile?.investmentAccounts || profile.investmentAccounts.length === 0);
  
  // Check if net worth is basically zero (just signed up)
  const hasNoNetWorth = !financials || financials.netWorth <= 0;
  
  // Only show if profile is incomplete
  if (!hasNoAccounts || !hasNoNetWorth) return null;
  
  return (
    <div className="mb-6 p-6 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
          ✨
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">Complete your financial profile</h3>
          <p className="text-gray-300 text-sm mt-1">
            Add your accounts, investments, and goals to unlock personalized insights and recommendations.
          </p>
        </div>
        <Link
          href="/profile/setup"
          className="flex-shrink-0 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium rounded-xl transition"
        >
          Set Up Profile →
        </Link>
      </div>
      
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-emerald-400">✓</span>
          <span>Track net worth</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-emerald-400">✓</span>
          <span>Retirement projections</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-emerald-400">✓</span>
          <span>Tax optimization</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-emerald-400">✓</span>
          <span>AI-powered insights</span>
        </div>
      </div>
    </div>
  );
}
