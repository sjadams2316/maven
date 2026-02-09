'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserProfile } from '@/providers/UserProvider';
import { openOracle } from '@/lib/open-oracle';

/**
 * ProfileUpdatePrompt
 * Shows a prompt when financial data is stale (>7 days since last update)
 * Encourages users to update their accounts or use Oracle for quick changes
 */

export default function ProfileUpdatePrompt() {
  const { profile, isDemoMode } = useUserProfile();
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Check if dismissed recently (within 24 hours)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissedAt = localStorage.getItem('maven_update_prompt_dismissed');
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (Date.now() - dismissedTime < twentyFourHours) {
          setDismissed(true);
        }
      }
    }
  }, []);
  
  // Don't show in demo mode or if dismissed
  if (isDemoMode || dismissed) return null;
  
  // Check staleness
  const lastUpdated = profile?.lastUpdated ? new Date(profile.lastUpdated) : null;
  const now = new Date();
  const daysSinceUpdate = lastUpdated 
    ? Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  // Only show if > 7 days since update (or never updated)
  const isStale = daysSinceUpdate === null || daysSinceUpdate >= 7;
  
  if (!isStale) return null;
  
  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('maven_update_prompt_dismissed', Date.now().toString());
    }
  };
  
  const handleOracleUpdate = () => {
    openOracle("I'd like to update my financial accounts. Can you help me make some changes?");
    handleDismiss();
  };
  
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">
          🔄
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium">Time for a quick update?</h3>
          <p className="text-gray-400 text-sm mt-1">
            {daysSinceUpdate === null 
              ? "Your financial profile hasn't been set up yet."
              : `It's been ${daysSinceUpdate} days since you updated your accounts.`}
            {' '}Keeping your data current helps Maven give you better insights.
          </p>
          
          {showDetails && (
            <div className="mt-3 p-3 bg-white/5 rounded-lg text-sm space-y-2 animate-in fade-in duration-200">
              <p className="text-gray-300">💡 Quick update tips:</p>
              <ul className="text-gray-400 space-y-1 ml-4">
                <li>• Check your checking/savings balances</li>
                <li>• Update any recent investment purchases</li>
                <li>• Add any new accounts you've opened</li>
                <li>• Update debt balances if changed</li>
              </ul>
              <p className="text-indigo-400 mt-2">
                Or just tell Oracle: "I moved $5,000 from savings to my brokerage and bought AAPL"
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <Link
              href="/profile/setup"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition text-sm"
            >
              Update Profile
            </Link>
            <button
              onClick={handleOracleUpdate}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition text-sm flex items-center gap-2"
            >
              🔮 Tell Oracle
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-500 hover:text-gray-400 transition"
            >
              {showDetails ? 'Hide tips' : 'Show tips'}
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-400 transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
