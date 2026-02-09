'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUserProfile } from '@/providers/UserProvider';

/**
 * ProfileCompletionIndicator
 * Shows a colored dot indicating profile completion status
 * - Green: Full profile (80%+)
 * - Yellow: Partial profile (40-79%)
 * - Red: Minimal profile (<40%)
 * 
 * Click to see detailed breakdown and what's missing
 */

interface CompletionItem {
  label: string;
  filled: boolean;
  weight: number; // Importance weight for percentage calculation
}

export default function ProfileCompletionIndicator() {
  const { profile, financials, isLoading, isDemoMode } = useUserProfile();
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    }
    
    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPopover]);
  
  if (isLoading || !profile) return null;
  
  // Calculate completion items
  const completionItems: CompletionItem[] = [
    // Personal Info (25 total weight)
    { label: 'First name', filled: !!profile.firstName, weight: 5 },
    { label: 'Last name', filled: !!profile.lastName, weight: 3 },
    { label: 'Date of birth', filled: !!profile.dateOfBirth, weight: 5 },
    { label: 'State', filled: !!profile.state, weight: 4 },
    { label: 'Filing status', filled: !!profile.filingStatus, weight: 5 },
    { label: 'Household income', filled: !!profile.householdIncome, weight: 3 },
    
    // Cash Accounts (10 weight)
    { label: 'Cash accounts', filled: (profile.cashAccounts?.length || 0) > 0, weight: 10 },
    
    // Retirement Accounts (20 weight)
    { label: 'Retirement accounts', filled: (profile.retirementAccounts?.length || 0) > 0, weight: 15 },
    { label: 'Retirement holdings', filled: profile.retirementAccounts?.some(a => a.holdings?.length > 0) || false, weight: 5 },
    
    // Investment Accounts (20 weight)
    { label: 'Investment accounts', filled: (profile.investmentAccounts?.length || 0) > 0, weight: 15 },
    { label: 'Investment holdings', filled: profile.investmentAccounts?.some(a => a.holdings?.length > 0) || false, weight: 5 },
    
    // Liabilities (10 weight)
    { label: 'Liabilities', filled: (profile.liabilities?.length || 0) > 0 || (financials?.totalLiabilities || 0) === 0, weight: 10 },
    
    // Goals (10 weight)
    { label: 'Primary goal', filled: !!profile.primaryGoal, weight: 5 },
    { label: 'Risk tolerance', filled: !!profile.riskTolerance, weight: 5 },
  ];
  
  // Calculate percentage
  const totalWeight = completionItems.reduce((sum, item) => sum + item.weight, 0);
  const filledWeight = completionItems.reduce((sum, item) => item.filled ? sum + item.weight : sum, 0);
  const percentage = Math.round((filledWeight / totalWeight) * 100);
  
  // Determine status
  const getStatus = () => {
    if (percentage >= 80) return { color: 'bg-emerald-500', ring: 'ring-emerald-500/30', label: 'Complete', textColor: 'text-emerald-400' };
    if (percentage >= 40) return { color: 'bg-amber-500', ring: 'ring-amber-500/30', label: 'Partial', textColor: 'text-amber-400' };
    return { color: 'bg-red-500', ring: 'ring-red-500/30', label: 'Incomplete', textColor: 'text-red-400' };
  };
  
  const status = getStatus();
  const missingItems = completionItems.filter(item => !item.filled);
  const filledItems = completionItems.filter(item => item.filled);
  
  return (
    <div className="relative" ref={popoverRef}>
      {/* Clickable Dot with Label */}
      <button
        onClick={() => setShowPopover(!showPopover)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"
      >
        <div className={`w-2.5 h-2.5 rounded-full ${status.color} ring-2 ${status.ring}`} />
        <span className="text-sm text-gray-400 hidden sm:inline">Profile</span>
      </button>
      
      {/* Popover */}
      {showPopover && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Profile Completion</h3>
              <span className={`text-sm font-medium ${status.textColor}`}>{percentage}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  percentage >= 80 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            {/* Status Message */}
            <p className="text-sm text-gray-400 mt-2">
              {percentage >= 80 && "Great! Your profile is complete for full insights."}
              {percentage >= 40 && percentage < 80 && "Good progress! Add more details for better analysis."}
              {percentage < 40 && "Complete your profile to unlock personalized insights."}
            </p>
          </div>
          
          {/* Missing Items */}
          {missingItems.length > 0 && (
            <div className="p-4 border-b border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Missing Information</p>
              <div className="space-y-1.5">
                {missingItems.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-xs text-gray-500">○</span>
                    <span className="text-gray-400">{item.label}</span>
                  </div>
                ))}
                {missingItems.length > 5 && (
                  <p className="text-xs text-gray-500 ml-6">+{missingItems.length - 5} more</p>
                )}
              </div>
            </div>
          )}
          
          {/* Completed Items (collapsed) */}
          {filledItems.length > 0 && (
            <div className="p-4 border-b border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Completed ({filledItems.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {filledItems.map((item, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
                    ✓ {item.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* CTA */}
          <div className="p-4">
            <Link
              href="/profile/setup"
              onClick={() => setShowPopover(false)}
              className="block w-full text-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition"
            >
              {percentage >= 80 ? 'Edit Profile' : percentage >= 40 ? 'Complete Profile' : 'Set Up Profile'}
            </Link>
          </div>
          
          {/* Demo Mode Notice */}
          {isDemoMode && (
            <div className="px-4 pb-4">
              <p className="text-xs text-amber-400/70 text-center">
                Demo mode — showing sample data
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
