'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { DEMO_PROFILE, DEMO_MODE_KEY, isDemoModeEnabled, enableDemoMode, disableDemoMode } from '@/lib/demo-profile';

/**
 * CENTRALIZED USER STATE
 * Single source of truth for all user data across Maven
 * 
 * Rules:
 * 1. ALL components read user data from this context
 * 2. ALL changes go through this context's update functions
 * 3. Database is the source of truth when signed in
 * 4. localStorage is fallback for guests (and syncs on sign-in)
 */

// ============================================
// TYPE DEFINITIONS (Single source of truth)
// ============================================

export interface Holding {
  id?: string;
  ticker: string;
  name?: string;
  shares: number;
  costBasis: number;
  currentPrice?: number;
  currentValue?: number;
  percentage?: number;
  acquisitionDate?: string;
}

export interface CashAccount {
  id: string;
  name: string;
  institution: string;
  balance: number;
  type: 'Checking' | 'Savings' | 'Money Market' | 'CD' | 'High-Yield Savings';
  interestRate?: number;
}

export interface RetirementAccount {
  id: string;
  name: string;
  institution: string;
  balance: number;
  type: '401(k)' | 'Traditional IRA' | 'Roth IRA' | 'Roth 401(k)' | '403(b)' | '457' | 'SEP IRA' | 'SIMPLE IRA' | 'HSA' | 'Pension';
  employer?: string;
  contributionPercent?: number;
  employerMatchPercent?: number;
  holdings: Holding[];
  holdingsMode?: 'value' | 'percentage';
}

export interface InvestmentAccount {
  id: string;
  name: string;
  institution: string;
  balance: number;
  type: 'Individual' | 'Joint' | 'Trust' | 'Custodial' | '529';
  holdings: Holding[];
}

export interface Liability {
  id: string;
  name: string;
  type: 'Mortgage' | 'Auto Loan' | 'Student Loan' | 'Credit Card' | 'Personal Loan' | 'HELOC' | 'Other';
  balance: number;
  interestRate: number;
  monthlyPayment: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SocialSecurityProfile {
  dateOfBirth?: string;
  lifeExpectancy?: number;
  benefitAt62?: number;
  benefitAtFRA?: number;
  benefitAt70?: number;
  fullRetirementAge?: number;
  currentlyWorking?: boolean;
  expectedEarnings?: number;
  retirementAge?: number;
  // Spouse
  spouseDOB?: string;
  spouseBenefitAt62?: number;
  spouseBenefitAtFRA?: number;
  spouseBenefitAt70?: number;
  marriageDate?: string;
  // Previous marriages
  previousMarriages?: Array<{
    startDate: string;
    endDate: string;
    exSpouseBenefit?: number;
  }>;
}

export interface UserProfile {
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  state: string;
  filingStatus: 'Single' | 'Married Filing Jointly' | 'Married Filing Separately' | 'Head of Household' | 'Qualifying Widow(er)' | '';
  householdIncome: string;
  
  // Accounts
  cashAccounts: CashAccount[];
  retirementAccounts: RetirementAccount[];
  investmentAccounts: InvestmentAccount[];
  
  // Other Assets
  realEstateEquity: number;
  cryptoValue: number;
  businessEquity: number;
  otherAssets: number;
  
  // Liabilities
  liabilities: Liability[];
  
  // Goals & Preferences
  goals: Goal[];
  primaryGoal: string;
  riskTolerance: 'conservative' | 'moderate' | 'growth' | 'aggressive' | '';
  investmentExperience: 'beginner' | 'intermediate' | 'advanced' | '';
  
  // Social Security (optional module)
  socialSecurity?: SocialSecurityProfile;
  
  // Status
  onboardingComplete: boolean;
  lastUpdated?: string;
}

// Computed values derived from profile
export interface UserFinancials {
  netWorth: number;
  totalCash: number;
  totalRetirement: number;
  totalInvestments: number;
  totalOtherAssets: number;
  totalLiabilities: number;
  allHoldings: (Holding & { accountName: string; accountType: string })[];
}

// ============================================
// CONTEXT DEFINITION
// ============================================

interface UserContextType {
  // State
  profile: UserProfile | null;
  financials: UserFinancials | null;
  isLoading: boolean;
  isOnboarded: boolean;
  isDemoMode: boolean;
  
  // Actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateHoldings: (accountId: string, accountType: 'retirement' | 'investment', holdings: Holding[]) => Promise<void>;
  addAccount: (accountType: 'cash' | 'retirement' | 'investment', account: any) => Promise<void>;
  removeAccount: (accountType: 'cash' | 'retirement' | 'investment', accountId: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearProfile: () => void;
  
  // Demo Mode
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const defaultProfile: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  state: '',
  filingStatus: '',
  householdIncome: '',
  cashAccounts: [],
  retirementAccounts: [],
  investmentAccounts: [],
  realEstateEquity: 0,
  cryptoValue: 0,
  businessEquity: 0,
  otherAssets: 0,
  liabilities: [],
  goals: [],
  primaryGoal: '',
  riskTolerance: '',
  investmentExperience: '',
  onboardingComplete: false,
};

const UserContext = createContext<UserContextType | null>(null);

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateFinancials(profile: UserProfile): UserFinancials {
  const totalCash = profile.cashAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalRetirement = profile.retirementAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalInvestments = profile.investmentAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalOtherAssets = (profile.realEstateEquity || 0) + (profile.cryptoValue || 0) + 
                          (profile.businessEquity || 0) + (profile.otherAssets || 0);
  const totalLiabilities = profile.liabilities.reduce((sum, l) => sum + (l.balance || 0), 0);
  
  // Aggregate all holdings across accounts
  const allHoldings: (Holding & { accountName: string; accountType: string })[] = [];
  
  profile.retirementAccounts.forEach(acc => {
    (acc.holdings || []).forEach(h => {
      allHoldings.push({
        ...h,
        accountName: acc.name,
        accountType: acc.type,
      });
    });
  });
  
  profile.investmentAccounts.forEach(acc => {
    (acc.holdings || []).forEach(h => {
      allHoldings.push({
        ...h,
        accountName: acc.name,
        accountType: 'Taxable',
      });
    });
  });
  
  return {
    netWorth: totalCash + totalRetirement + totalInvestments + totalOtherAssets - totalLiabilities,
    totalCash,
    totalRetirement,
    totalInvestments,
    totalOtherAssets,
    totalLiabilities,
    allHoldings,
  };
}

const STORAGE_KEY = 'maven_user_profile';
const ONBOARDING_KEY = 'maven_onboarding_complete';

function saveToLocalStorage(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  if (profile.onboardingComplete) {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    document.cookie = 'maven_onboarded=true; path=/; max-age=31536000; SameSite=Lax';
  }
}

function loadFromLocalStorage(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
}

// ============================================
// PROVIDER COMPONENT
// ============================================

export function UserProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Calculate financials whenever profile changes
  const financials = profile ? calculateFinancials(profile) : null;
  const isOnboarded = profile?.onboardingComplete ?? false;
  
  // NOTE: Removed early demo mode check that was causing race condition
  // Demo mode is now ONLY set in the main loadProfile effect after checking auth state
  // This prevents demo mode from overriding signed-in users

  // Load profile on mount and auth changes
  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      
      // Check if demo mode is active
      const demoEnabled = isDemoModeEnabled();
      
      // BUG FIX: If user is signed in, ALWAYS clear demo mode and use real profile
      // Demo mode should never override a real authenticated session
      if (isSignedIn) {
        if (demoEnabled) {
          console.log('[UserProvider] Signed-in user had demo mode enabled - clearing it');
          disableDemoMode();
          setIsDemoMode(false);
        }
      } else if (demoEnabled) {
        // DEMO MODE: Only use demo profile when NOT signed in
        setProfile(DEMO_PROFILE);
        setIsDemoMode(true);
        setIsLoading(false);
        return;
      }
      
      if (isSignedIn) {
        // SIGNED IN: Database is source of truth
        
        try {
          const res = await fetch('/api/user/profile');
          if (res.ok) {
            const data = await res.json();
            const loadedProfile = { ...defaultProfile, ...data };
            setProfile(loadedProfile);
            saveToLocalStorage(loadedProfile); // Sync to localStorage for offline/chat
          } else {
            // No profile in DB yet, check localStorage for guest data to migrate
            const localProfile = loadFromLocalStorage();
            if (localProfile && localProfile.onboardingComplete) {
              // Migrate guest data to database
              await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localProfile),
              });
              setProfile(localProfile);
            } else {
              setProfile(defaultProfile);
            }
          }
        } catch (error) {
          console.error('Failed to load profile from API:', error);
          // Fallback to localStorage
          setProfile(loadFromLocalStorage() || defaultProfile);
        }
      } else {
        // GUEST: localStorage is source of truth
        const localProfile = loadFromLocalStorage();
        setProfile(localProfile || defaultProfile);
      }
      
      setIsLoading(false);
    }
    
    if (isLoaded) {
      loadProfile();
    }
  }, [isSignedIn, isLoaded]);

  // Enter demo mode
  const enterDemoMode = useCallback(() => {
    enableDemoMode();
    setIsDemoMode(true);
    setProfile(DEMO_PROFILE);
  }, []);
  
  // Exit demo mode
  const exitDemoMode = useCallback(() => {
    disableDemoMode();
    setIsDemoMode(false);
    // Load real profile from localStorage or default
    const localProfile = loadFromLocalStorage();
    setProfile(localProfile || defaultProfile);
  }, []);

  // Update profile (both local state and persistence)
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    
    // In demo mode, don't persist changes (read-only)
    if (isDemoMode) {
      console.log('Demo mode: changes not persisted');
      return;
    }
    
    const updatedProfile = { ...profile, ...updates, lastUpdated: new Date().toISOString() };
    setProfile(updatedProfile);
    saveToLocalStorage(updatedProfile);
    
    // Persist to database if signed in
    if (isSignedIn) {
      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProfile),
        });
      } catch (error) {
        console.error('Failed to save profile to database:', error);
      }
    }
  }, [profile, isSignedIn, isDemoMode]);

  // Update holdings for a specific account
  const updateHoldings = useCallback(async (
    accountId: string, 
    accountType: 'retirement' | 'investment', 
    holdings: Holding[]
  ) => {
    if (!profile) return;
    
    const accountKey = accountType === 'retirement' ? 'retirementAccounts' : 'investmentAccounts';
    const accounts = [...profile[accountKey]];
    const accountIndex = accounts.findIndex(a => a.id === accountId);
    
    if (accountIndex !== -1) {
      accounts[accountIndex] = { ...accounts[accountIndex], holdings };
      await updateProfile({ [accountKey]: accounts });
    }
  }, [profile, updateProfile]);

  // Add account
  const addAccount = useCallback(async (
    accountType: 'cash' | 'retirement' | 'investment',
    account: any
  ) => {
    if (!profile) return;
    
    const keyMap = {
      cash: 'cashAccounts',
      retirement: 'retirementAccounts',
      investment: 'investmentAccounts',
    } as const;
    
    const key = keyMap[accountType];
    const accounts = [...(profile[key] as any[]), { ...account, id: account.id || crypto.randomUUID() }];
    await updateProfile({ [key]: accounts });
  }, [profile, updateProfile]);

  // Remove account
  const removeAccount = useCallback(async (
    accountType: 'cash' | 'retirement' | 'investment',
    accountId: string
  ) => {
    if (!profile) return;
    
    const keyMap = {
      cash: 'cashAccounts',
      retirement: 'retirementAccounts',
      investment: 'investmentAccounts',
    } as const;
    
    const key = keyMap[accountType];
    const accounts = (profile[key] as any[]).filter(a => a.id !== accountId);
    await updateProfile({ [key]: accounts });
  }, [profile, updateProfile]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    await updateProfile({ onboardingComplete: true });
  }, [updateProfile]);

  // Refresh profile from server
  const refreshProfile = useCallback(async () => {
    if (!isSignedIn) return;
    
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        const loadedProfile = { ...defaultProfile, ...data };
        setProfile(loadedProfile);
        saveToLocalStorage(loadedProfile);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [isSignedIn]);

  // Clear profile (for sign out)
  const clearProfile = useCallback(() => {
    setProfile(defaultProfile);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ONBOARDING_KEY);
      document.cookie = 'maven_onboarded=; path=/; max-age=0';
    }
  }, []);

  return (
    <UserContext.Provider value={{
      profile,
      financials,
      isLoading,
      isOnboarded,
      isDemoMode,
      updateProfile,
      updateHoldings,
      addAccount,
      removeAccount,
      completeOnboarding,
      refreshProfile,
      clearProfile,
      enterDemoMode,
      exitDemoMode,
    }}>
      {children}
    </UserContext.Provider>
  );
}

// ============================================
// HOOKS
// ============================================

export function useUserProfile() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProvider');
  }
  return context;
}

// Convenience hook for just checking onboarding status
export function useOnboardingStatus() {
  const { isOnboarded, isLoading } = useUserProfile();
  return { isOnboarded, isLoading };
}

// Convenience hook for financials
export function useFinancials() {
  const { financials, isLoading } = useUserProfile();
  return { financials, isLoading };
}

// Convenience hook for Social Security data
export function useSocialSecurity() {
  const { profile, updateProfile, isLoading } = useUserProfile();
  
  const updateSocialSecurity = useCallback(async (updates: Partial<SocialSecurityProfile>) => {
    if (!profile) return;
    await updateProfile({
      socialSecurity: { ...profile.socialSecurity, ...updates }
    });
  }, [profile, updateProfile]);
  
  return {
    socialSecurity: profile?.socialSecurity || null,
    updateSocialSecurity,
    isLoading,
  };
}
