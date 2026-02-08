'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import HoldingsInput from '../components/HoldingsInput';
import ProgressiveSignup from '../components/ProgressiveSignup';

// Types
interface Account {
  id: string;
  name: string;
  institution: string;
  balance: number;
  type: string;
}

interface RetirementAccount extends Account {
  employer?: string;
  contributionType?: 'percentage' | 'fixed';
  contributionPercent?: number;
  contributionFixed?: number;
  employerMatchType?: 'percentage' | 'fixed';
  employerMatchPercent?: number;
  employerMatchFixed?: number;
  holdings: Holding[];
  holdingsMode?: 'value' | 'percentage';
}

interface Holding {
  ticker: string;
  name?: string;
  shares: number;
  costBasis: number;
  currentPrice?: number;
  currentValue?: number;
}

interface InvestmentAccount extends Account {
  holdings: Holding[];
}

interface Liability {
  id: string;
  name: string;
  type: string;
  balance: number;
  interestRate: number;
  monthlyPayment: number;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface UserProfile {
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  state: string;
  filingStatus: string;
  householdIncome: string;
  
  // Cash
  cashAccounts: Account[];
  
  // Retirement
  retirementAccounts: RetirementAccount[];
  
  // Investments
  investmentAccounts: InvestmentAccount[];
  
  // Other Assets
  realEstateEquity: number;
  cryptoValue: number;
  businessEquity: number;
  otherAssets: number;
  
  // Liabilities
  liabilities: Liability[];
  
  // Goals
  goals: Goal[];
  primaryGoal: string;
  riskTolerance: string;
  investmentExperience: string;
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: '👋' },
  { id: 'cash', title: 'Cash', icon: '💵' },
  { id: 'retirement', title: 'Retirement', icon: '🏦' },
  { id: 'investments', title: 'Investments', icon: '📈' },
  { id: 'other', title: 'Other Assets', icon: '🏠' },
  { id: 'liabilities', title: 'Liabilities', icon: '💳' },
  { id: 'goals', title: 'Goals', icon: '🎯' },
  { id: 'review', title: 'Review', icon: '✨' },
];

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

const INCOME_RANGES = [
  'Under $50,000',
  '$50,000 - $100,000',
  '$100,000 - $200,000',
  '$200,000 - $500,000',
  '$500,000 - $1,000,000',
  'Over $1,000,000',
];

const FILING_STATUSES = [
  'Single',
  'Married Filing Jointly',
  'Married Filing Separately',
  'Head of Household',
  'Qualifying Widow(er)',
];

const CASH_ACCOUNT_TYPES = [
  'Checking',
  'Savings',
  'Money Market',
  'CD',
  'High-Yield Savings',
];

const RETIREMENT_ACCOUNT_TYPES = [
  '401(k)',
  'Traditional IRA',
  'Roth IRA',
  'Roth 401(k)',
  '403(b)',
  '457',
  'SEP IRA',
  'SIMPLE IRA',
  'HSA',
  'Pension',
];

const INVESTMENT_ACCOUNT_TYPES = [
  'Individual Brokerage',
  'Joint Brokerage',
  'Trust',
  'UTMA/UGMA',
  '529 Plan',
  'Crypto Exchange',
];

const LIABILITY_TYPES = [
  'Mortgage',
  'Home Equity Loan',
  'Auto Loan',
  'Student Loan',
  'Personal Loan',
  'Credit Card',
  'Other',
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function OnboardingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'maven', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
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
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load existing profile data on mount
  useEffect(() => {
    async function loadExistingProfile() {
      setIsLoadingProfile(true);
      
      if (isSignedIn) {
        // Try to load from database
        try {
          const res = await fetch('/api/user/profile');
          if (res.ok) {
            const data = await res.json();
            if (data && (data.firstName || data.cashAccounts?.length || data.retirementAccounts?.length)) {
              setProfile(prev => ({ ...prev, ...data }));
              // If already onboarded, go to review step
              if (data.onboardingComplete) {
                setCurrentStep(STEPS.length - 1); // Go to review/settings
              }
            }
          }
        } catch (error) {
          console.error('Failed to load profile from API:', error);
        }
      }
      
      // Also check localStorage as fallback
      const savedProfile = localStorage.getItem('maven_user_profile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setProfile(prev => {
            // Only update fields that are empty in current state
            const merged = { ...prev };
            Object.keys(parsed).forEach(key => {
              const currentVal = (prev as any)[key];
              const savedVal = parsed[key];
              // Only use saved value if current is empty/default
              if (
                currentVal === '' || 
                currentVal === 0 || 
                (Array.isArray(currentVal) && currentVal.length === 0)
              ) {
                (merged as any)[key] = savedVal;
              }
            });
            return merged;
          });
        } catch (e) {
          console.error('Failed to parse saved profile:', e);
        }
      }
      
      setIsLoadingProfile(false);
    }
    
    if (isUserLoaded) {
      loadExistingProfile();
    }
  }, [isSignedIn, isUserLoaded]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  // Auto-save effect - saves to localStorage after 1s of no changes
  useEffect(() => {
    if (isLoadingProfile) return; // Don't auto-save while loading
    if (!profile.firstName && profile.cashAccounts.length === 0) return; // Don't save empty profile
    
    setSaveStatus('saving');
    
    const timer = setTimeout(() => {
      // Save to localStorage
      localStorage.setItem('maven_user_profile', JSON.stringify(profile));
      setSaveStatus('saved');
      setLastSaved(new Date());
      
      // Reset to idle after 2s
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [profile, isLoadingProfile]);

  const nextStep = () => {
    // After welcome step, prompt for signup if user has email but isn't signed in
    if (currentStep === 0 && profile.email && !isSignedIn && isUserLoaded) {
      setShowSignupModal(true);
      return;
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handleSignupSuccess = () => {
    setShowSignupModal(false);
    // Move to next step after successful signup
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handleSignupSkip = () => {
    setShowSignupModal(false);
    // Move to next step even if skipped
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculateNetWorth = () => {
    const cashTotal = profile.cashAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const retirementTotal = profile.retirementAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const investmentTotal = profile.investmentAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const otherTotal = profile.realEstateEquity + profile.cryptoValue + profile.businessEquity + profile.otherAssets;
    const liabilitiesTotal = profile.liabilities.reduce((sum, l) => sum + l.balance, 0);
    
    return {
      assets: cashTotal + retirementTotal + investmentTotal + otherTotal,
      liabilities: liabilitiesTotal,
      netWorth: cashTotal + retirementTotal + investmentTotal + otherTotal - liabilitiesTotal,
      breakdown: { cashTotal, retirementTotal, investmentTotal, otherTotal, liabilitiesTotal }
    };
  };

  const handleCompleteSetup = () => {
    // If not signed in, show signup modal first
    if (!isSignedIn) {
      setShowSignupModal(true);
      return;
    }
    
    // Already signed in, save directly
    saveProfile();
  };

  const saveProfile = async () => {
    // Save to localStorage
    localStorage.setItem('maven_user_profile', JSON.stringify(profile));
    localStorage.setItem('maven_onboarding_complete', 'true');
    
    // Set cookie for middleware to detect (expires in 1 year)
    document.cookie = 'maven_onboarded=true; path=/; max-age=31536000; SameSite=Lax';
    
    // Also save to database if signed in
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        console.error('Failed to save profile to database');
      }
    } catch (error) {
      console.error('Error saving to database:', error);
    }
    
    router.push('/dashboard');
  };

  // Render functions for each step
  const renderWelcome = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Let's get to know you</h2>
        <p className="text-[var(--muted)]">This helps Maven give you personalized insights and recommendations.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Name</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => updateProfile({ firstName: e.target.value })}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
            placeholder="Sam"
            autoComplete="given-name"
            name="firstName"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Last Name</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => updateProfile({ lastName: e.target.value })}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
            placeholder="Adams"
            autoComplete="family-name"
            name="lastName"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={profile.email}
          onChange={(e) => updateProfile({ email: e.target.value })}
          className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
          placeholder="sam@example.com"
          autoComplete="email"
          name="email"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date of Birth</label>
          <input
            type="date"
            value={profile.dateOfBirth}
            onChange={(e) => updateProfile({ dateOfBirth: e.target.value })}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
            autoComplete="bday"
            name="dateOfBirth"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">State of Residence</label>
          <select
            value={profile.state}
            onChange={(e) => updateProfile({ state: e.target.value })}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="">Select state...</option>
            {STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Filing Status</label>
          <select
            value={profile.filingStatus}
            onChange={(e) => updateProfile({ filingStatus: e.target.value })}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="">Select status...</option>
            {FILING_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Household Income</label>
          <select
            value={profile.householdIncome}
            onChange={(e) => updateProfile({ householdIncome: e.target.value })}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="">Select range...</option>
            {INCOME_RANGES.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderCash = () => {
    const addCashAccount = () => {
      const newAccount: Account = {
        id: generateId(),
        name: '',
        institution: '',
        balance: 0,
        type: 'Checking',
      };
      updateProfile({ cashAccounts: [...profile.cashAccounts, newAccount] });
    };

    const updateCashAccount = (id: string, updates: Partial<Account>) => {
      updateProfile({
        cashAccounts: profile.cashAccounts.map(acc =>
          acc.id === id ? { ...acc, ...updates } : acc
        ),
      });
    };

    const removeCashAccount = (id: string) => {
      updateProfile({
        cashAccounts: profile.cashAccounts.filter(acc => acc.id !== id),
      });
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Your Cash Holdings</h2>
          <p className="text-[var(--muted)]">Tell us about your checking, savings, and other cash accounts.</p>
        </div>

        {profile.cashAccounts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-2xl">
            <p className="text-[var(--muted)] mb-4">No cash accounts added yet</p>
            <button
              onClick={addCashAccount}
              className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition"
            >
              + Add Cash Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.cashAccounts.map((account, idx) => (
              <div key={account.id} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-[var(--muted)]">Account {idx + 1}</span>
                  <button
                    onClick={() => removeCashAccount(account.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Name</label>
                    <input
                      type="text"
                      value={account.name}
                      onChange={(e) => updateCashAccount(account.id, { name: e.target.value })}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                      placeholder="e.g., Primary Checking"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Institution</label>
                    <input
                      type="text"
                      value={account.institution}
                      onChange={(e) => updateCashAccount(account.id, { institution: e.target.value })}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                      placeholder="e.g., Chase, Ally, Marcus"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Type</label>
                    <select
                      value={account.type}
                      onChange={(e) => updateCashAccount(account.id, { type: e.target.value })}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                    >
                      {CASH_ACCOUNT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Balance</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span>
                      <input
                        type="number"
                        value={account.balance || ''}
                        onChange={(e) => updateCashAccount(account.id, { balance: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addCashAccount}
              className="w-full py-3 border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] rounded-xl text-[var(--muted)] hover:text-white transition"
            >
              + Add Another Account
            </button>
          </div>
        )}

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-[var(--muted)]">Total Cash</span>
            <span className="text-2xl font-bold text-emerald-400">
              ${profile.cashAccounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderRetirement = () => {
    const addRetirementAccount = () => {
      const newAccount: RetirementAccount = {
        id: generateId(),
        name: '',
        institution: '',
        balance: 0,
        type: '401(k)',
        employer: '',
        contributionType: 'percentage',
        contributionPercent: 0,
        contributionFixed: 0,
        employerMatchType: 'percentage',
        employerMatchPercent: 0,
        employerMatchFixed: 0,
        holdings: [],
        holdingsMode: 'percentage',
      };
      updateProfile({ retirementAccounts: [...profile.retirementAccounts, newAccount] });
    };

    const updateRetirementHoldings = (accountId: string, holdings: Holding[]) => {
      const account = profile.retirementAccounts.find(a => a.id === accountId);
      if (account) {
        // Calculate total from holdings (only update balance if holdings have values)
        const holdingsTotal = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
        // Only override balance if using value mode and holdings have values
        if (account.holdingsMode === 'value' && holdingsTotal > 0) {
          updateRetirementAccount(accountId, { holdings, balance: holdingsTotal });
        } else {
          updateRetirementAccount(accountId, { holdings });
        }
      }
    };

    const updateRetirementAccount = (id: string, updates: Partial<RetirementAccount>) => {
      updateProfile({
        retirementAccounts: profile.retirementAccounts.map(acc =>
          acc.id === id ? { ...acc, ...updates } : acc
        ),
      });
    };

    const removeRetirementAccount = (id: string) => {
      updateProfile({
        retirementAccounts: profile.retirementAccounts.filter(acc => acc.id !== id),
      });
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Retirement Accounts</h2>
          <p className="text-[var(--muted)]">401(k)s, IRAs, and other tax-advantaged accounts.</p>
        </div>

        {profile.retirementAccounts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-2xl">
            <p className="text-[var(--muted)] mb-4">No retirement accounts added yet</p>
            <button
              onClick={addRetirementAccount}
              className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition"
            >
              + Add Retirement Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.retirementAccounts.map((account, idx) => (
              <div key={account.id} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-[var(--muted)]">Account {idx + 1}</span>
                  <button
                    onClick={() => removeRetirementAccount(account.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Type</label>
                    <select
                      value={account.type}
                      onChange={(e) => updateRetirementAccount(account.id, { type: e.target.value })}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                    >
                      {RETIREMENT_ACCOUNT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Institution / Custodian</label>
                    <input
                      type="text"
                      value={account.institution}
                      onChange={(e) => updateRetirementAccount(account.id, { institution: e.target.value })}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                      placeholder="e.g., Fidelity, Vanguard, Schwab"
                    />
                  </div>
                  {(account.type === '401(k)' || account.type === 'Roth 401(k)' || account.type === '403(b)') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Employer</label>
                      <input
                        type="text"
                        value={account.employer || ''}
                        onChange={(e) => updateRetirementAccount(account.id, { employer: e.target.value })}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                        placeholder="e.g., Capital Group"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Account Balance</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={account.balance ? account.balance.toLocaleString() : ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value.replace(/,/g, '')) || 0;
                          updateRetirementAccount(account.id, { balance: value });
                        }}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                        placeholder="e.g., 83,000"
                      />
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">Enter total value, then allocate to funds below</p>
                  </div>
                  {(account.type === '401(k)' || account.type === 'Roth 401(k)' || account.type === '403(b)') && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Your Contribution</label>
                        <div className="flex gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => updateRetirementAccount(account.id, { contributionType: 'percentage' })}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                              account.contributionType === 'percentage' 
                                ? 'bg-[var(--primary)] text-white' 
                                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-white'
                            }`}
                          >
                            % of Salary
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRetirementAccount(account.id, { contributionType: 'fixed' })}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                              account.contributionType === 'fixed' 
                                ? 'bg-[var(--primary)] text-white' 
                                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-white'
                            }`}
                          >
                            Fixed $ Amount
                          </button>
                        </div>
                        {account.contributionType === 'percentage' ? (
                          <div className="relative">
                            <input
                              type="number"
                              value={account.contributionPercent || ''}
                              onChange={(e) => updateRetirementAccount(account.id, { contributionPercent: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 pr-8 py-3 focus:outline-none focus:border-[var(--primary)]"
                              placeholder="e.g., 6 (for 6% of salary)"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">%</span>
                          </div>
                        ) : (
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={account.contributionFixed || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                updateRetirementAccount(account.id, { contributionFixed: parseInt(value) || 0 });
                              }}
                              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                              placeholder="e.g., 23500 (annual max for 2026)"
                            />
                          </div>
                        )}
                        <p className="text-xs text-[var(--muted)] mt-1">
                          {account.contributionType === 'percentage' 
                            ? 'Percentage of salary you contribute each year' 
                            : 'Fixed annual amount you contribute (2026 max: $23,500, or $31,000 if 50+)'}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Employer Contribution</label>
                        <div className="flex gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => updateRetirementAccount(account.id, { employerMatchType: 'percentage' })}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                              account.employerMatchType === 'percentage' 
                                ? 'bg-[var(--primary)] text-white' 
                                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-white'
                            }`}
                          >
                            % Match
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRetirementAccount(account.id, { employerMatchType: 'fixed' })}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                              account.employerMatchType === 'fixed' 
                                ? 'bg-[var(--primary)] text-white' 
                                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-white'
                            }`}
                          >
                            Fixed $ Amount
                          </button>
                        </div>
                        {account.employerMatchType === 'percentage' ? (
                          <div className="relative">
                            <input
                              type="number"
                              value={account.employerMatchPercent || ''}
                              onChange={(e) => updateRetirementAccount(account.id, { employerMatchPercent: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 pr-8 py-3 focus:outline-none focus:border-[var(--primary)]"
                              placeholder="e.g., 3 (for 3% match)"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">%</span>
                          </div>
                        ) : (
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span>
                            <input
                              type="number"
                              value={account.employerMatchFixed || ''}
                              onChange={(e) => updateRetirementAccount(account.id, { employerMatchFixed: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                              placeholder="e.g., 52000 (annual contribution)"
                            />
                          </div>
                        )}
                        <p className="text-xs text-[var(--muted)] mt-1">
                          {account.employerMatchType === 'percentage' 
                            ? 'Percentage of salary employer matches' 
                            : 'Fixed annual amount employer contributes (profit sharing, etc.)'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Holdings in Retirement Account */}
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="mb-3">
                    <h4 className="font-medium">Underlying Investments</h4>
                    <p className="text-xs text-[var(--muted)]">Enter your total balance, then add funds with % allocation</p>
                  </div>
                  <HoldingsInput
                    holdings={account.holdings || []}
                    onChange={(holdings) => updateRetirementHoldings(account.id, holdings)}
                    totalBalance={account.balance}
                    mode={account.holdingsMode || 'percentage'}
                    onModeChange={(mode) => updateRetirementAccount(account.id, { holdingsMode: mode })}
                    onTotalBalanceChange={(balance) => updateRetirementAccount(account.id, { balance })}
                    showTotalInput={true}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addRetirementAccount}
              className="w-full py-3 border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] rounded-xl text-[var(--muted)] hover:text-white transition"
            >
              + Add Another Account
            </button>
          </div>
        )}

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-[var(--muted)]">Total Retirement Assets</span>
            <span className="text-2xl font-bold text-emerald-400">
              ${profile.retirementAccounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderInvestments = () => {
    const addInvestmentAccount = () => {
      const newAccount: InvestmentAccount = {
        id: generateId(),
        name: '',
        institution: '',
        balance: 0,
        type: 'Individual Brokerage',
        holdings: [],
      };
      updateProfile({ investmentAccounts: [...profile.investmentAccounts, newAccount] });
    };

    const updateInvestmentAccount = (id: string, updates: Partial<InvestmentAccount>) => {
      updateProfile({
        investmentAccounts: profile.investmentAccounts.map(acc =>
          acc.id === id ? { ...acc, ...updates } : acc
        ),
      });
    };

    const removeInvestmentAccount = (id: string) => {
      updateProfile({
        investmentAccounts: profile.investmentAccounts.filter(acc => acc.id !== id),
      });
    };

    const updateInvestmentHoldings = (accountId: string, holdings: Holding[]) => {
      const account = profile.investmentAccounts.find(a => a.id === accountId);
      if (account) {
        // Calculate total from holdings
        const holdingsTotal = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
        updateInvestmentAccount(accountId, { holdings, balance: holdingsTotal || account.balance });
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Taxable Investments</h2>
          <p className="text-[var(--muted)]">Brokerage accounts, 529s, and other non-retirement investments.</p>
        </div>

        {profile.investmentAccounts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-2xl">
            <p className="text-[var(--muted)] mb-4">No investment accounts added yet</p>
            <button
              onClick={addInvestmentAccount}
              className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition"
            >
              + Add Investment Account
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {profile.investmentAccounts.map((account, idx) => (
              <div key={account.id} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-[var(--muted)]">Account {idx + 1}</span>
                  <button
                    onClick={() => removeInvestmentAccount(account.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Name</label>
                    <input
                      type="text"
                      value={account.name}
                      onChange={(e) => updateInvestmentAccount(account.id, { name: e.target.value })}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                      placeholder="e.g., Main Brokerage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Institution</label>
                    <input
                      type="text"
                      value={account.institution}
                      onChange={(e) => updateInvestmentAccount(account.id, { institution: e.target.value })}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                      placeholder="e.g., Schwab, Fidelity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Type</label>
                    <select
                      value={account.type}
                      onChange={(e) => updateInvestmentAccount(account.id, { type: e.target.value })}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                    >
                      {INVESTMENT_ACCOUNT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Holdings */}
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="mb-3">
                    <h4 className="font-medium">Holdings</h4>
                    <p className="text-xs text-[var(--muted)]">Search tickers, enter shares or dollar amount — we'll calculate the rest</p>
                  </div>
                  <HoldingsInput
                    holdings={account.holdings || []}
                    onChange={(holdings) => updateInvestmentHoldings(account.id, holdings)}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addInvestmentAccount}
              className="w-full py-3 border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] rounded-xl text-[var(--muted)] hover:text-white transition"
            >
              + Add Another Account
            </button>
          </div>
        )}

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-[var(--muted)]">Total Investment Assets</span>
            <span className="text-2xl font-bold text-emerald-400">
              ${profile.investmentAccounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderOtherAssets = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Other Assets</h2>
        <p className="text-[var(--muted)]">Real estate, crypto, business equity, and other assets.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏠</span>
            <div>
              <h3 className="font-medium">Real Estate Equity</h3>
              <p className="text-sm text-[var(--muted)]">Home value minus mortgage balance</p>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span>
            <input
              type="number"
              value={profile.realEstateEquity || ''}
              onChange={(e) => updateProfile({ realEstateEquity: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--primary)]"
              placeholder="0"
            />
          </div>
        </div>

        <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">₿</span>
            <div>
              <h3 className="font-medium">Cryptocurrency</h3>
              <p className="text-sm text-[var(--muted)]">Bitcoin, Ethereum, etc.</p>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span>
            <input
              type="number"
              value={profile.cryptoValue || ''}
              onChange={(e) => updateProfile({ cryptoValue: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--primary)]"
              placeholder="0"
            />
          </div>
        </div>

        <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏢</span>
            <div>
              <h3 className="font-medium">Business Equity</h3>
              <p className="text-sm text-[var(--muted)]">Value of business ownership</p>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span>
            <input
              type="number"
              value={profile.businessEquity || ''}
              onChange={(e) => updateProfile({ businessEquity: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--primary)]"
              placeholder="0"
            />
          </div>
        </div>

        <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💎</span>
            <div>
              <h3 className="font-medium">Other Assets</h3>
              <p className="text-sm text-[var(--muted)]">Collectibles, vehicles, etc.</p>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span>
            <input
              type="number"
              value={profile.otherAssets || ''}
              onChange={(e) => updateProfile({ otherAssets: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--primary)]"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 mt-6">
        <div className="flex justify-between items-center">
          <span className="text-[var(--muted)]">Total Other Assets</span>
          <span className="text-2xl font-bold text-emerald-400">
            ${(profile.realEstateEquity + profile.cryptoValue + profile.businessEquity + profile.otherAssets).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );

  const renderLiabilities = () => {
    const addLiability = () => {
      const newLiability: Liability = {
        id: generateId(),
        name: '',
        type: 'Mortgage',
        balance: 0,
        interestRate: 0,
        monthlyPayment: 0,
      };
      updateProfile({ liabilities: [...profile.liabilities, newLiability] });
    };

    const updateLiability = (id: string, updates: Partial<Liability>) => {
      updateProfile({
        liabilities: profile.liabilities.map(l =>
          l.id === id ? { ...l, ...updates } : l
        ),
      });
    };

    const removeLiability = (id: string) => {
      updateProfile({
        liabilities: profile.liabilities.filter(l => l.id !== id),
      });
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Liabilities</h2>
          <p className="text-[var(--muted)]">Mortgages, loans, and other debts.</p>
        </div>

        {profile.liabilities.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-2xl">
            <p className="text-[var(--muted)] mb-2">No liabilities added</p>
            <p className="text-sm text-[var(--muted)] mb-4">Debt-free? Skip to the next step!</p>
            <button
              onClick={addLiability}
              className="px-6 py-3 bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] rounded-xl font-medium transition"
            >
              + Add Liability
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.liabilities.map((liability, idx) => (
              <div key={liability.id} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-[var(--muted)]">Liability {idx + 1}</span>
                  <button
                    onClick={() => removeLiability(liability.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name / Description</label>
                    <input
                      type="text"
                      value={liability.name}
                      onChange={(e) => updateLiability(liability.id, { name: e.target.value })}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                      placeholder="e.g., Primary Mortgage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      value={liability.type}
                      onChange={(e) => updateLiability(liability.id, { type: e.target.value })}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                    >
                      {LIABILITY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Balance Owed</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span>
                      <input
                        type="number"
                        value={liability.balance || ''}
                        onChange={(e) => updateLiability(liability.id, { balance: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Interest Rate</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={liability.interestRate || ''}
                        onChange={(e) => updateLiability(liability.id, { interestRate: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 pr-8 py-3 focus:outline-none focus:border-[var(--primary)]"
                        placeholder="4.5"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly Payment</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span>
                      <input
                        type="number"
                        value={liability.monthlyPayment || ''}
                        onChange={(e) => updateLiability(liability.id, { monthlyPayment: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addLiability}
              className="w-full py-3 border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] rounded-xl text-[var(--muted)] hover:text-white transition"
            >
              + Add Another Liability
            </button>
          </div>
        )}

        <div className="bg-[var(--card)] border border-red-500/30 rounded-xl p-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-[var(--muted)]">Total Liabilities</span>
            <span className="text-2xl font-bold text-red-400">
              ${profile.liabilities.reduce((sum, l) => sum + l.balance, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Your Goals</h2>
        <p className="text-[var(--muted)]">What are you working toward?</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Primary Financial Goal</label>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { value: 'retirement', label: 'Retire Comfortably', icon: '🏖️' },
            { value: 'wealth', label: 'Build Wealth', icon: '📈' },
            { value: 'freedom', label: 'Financial Independence', icon: '🦅' },
            { value: 'education', label: 'Fund Education', icon: '🎓' },
            { value: 'home', label: 'Buy a Home', icon: '🏠' },
            { value: 'legacy', label: 'Leave a Legacy', icon: '🌳' },
          ].map(goal => (
            <button
              key={goal.value}
              onClick={() => updateProfile({ primaryGoal: goal.value })}
              className={`p-4 rounded-xl border text-left transition ${
                profile.primaryGoal === goal.value
                  ? 'bg-[var(--primary)]/20 border-[var(--primary)]'
                  : 'bg-[var(--background)] border-[var(--border)] hover:border-[var(--primary)]/50'
              }`}
            >
              <span className="text-2xl mr-2">{goal.icon}</span>
              <span className="font-medium">{goal.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Risk Tolerance</label>
        <div className="grid md:grid-cols-4 gap-3">
          {[
            { value: 'conservative', label: 'Conservative', desc: 'Preserve capital' },
            { value: 'moderate', label: 'Moderate', desc: 'Balanced approach' },
            { value: 'growth', label: 'Growth', desc: 'Accept volatility' },
            { value: 'aggressive', label: 'Aggressive', desc: 'Max growth' },
          ].map(risk => (
            <button
              key={risk.value}
              onClick={() => updateProfile({ riskTolerance: risk.value })}
              className={`p-4 rounded-xl border text-center transition ${
                profile.riskTolerance === risk.value
                  ? 'bg-[var(--primary)]/20 border-[var(--primary)]'
                  : 'bg-[var(--background)] border-[var(--border)] hover:border-[var(--primary)]/50'
              }`}
            >
              <p className="font-medium">{risk.label}</p>
              <p className="text-xs text-[var(--muted)]">{risk.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Investment Experience</label>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { value: 'beginner', label: 'Beginner', desc: 'New to investing' },
            { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
            { value: 'advanced', label: 'Advanced', desc: 'Very experienced' },
          ].map(exp => (
            <button
              key={exp.value}
              onClick={() => updateProfile({ investmentExperience: exp.value })}
              className={`p-4 rounded-xl border text-center transition ${
                profile.investmentExperience === exp.value
                  ? 'bg-[var(--primary)]/20 border-[var(--primary)]'
                  : 'bg-[var(--background)] border-[var(--border)] hover:border-[var(--primary)]/50'
              }`}
            >
              <p className="font-medium">{exp.label}</p>
              <p className="text-xs text-[var(--muted)]">{exp.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReview = () => {
    const netWorth = calculateNetWorth();

    // Generate personalized quote based on their financial situation
    const getPersonalizedQuote = () => {
      const quotes = {
        wealth: [
          { quote: "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.", author: "Albert Einstein" },
          { quote: "The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
        ],
        freedom: [
          { quote: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
          { quote: "It's not about how much money you make, but how much money you keep, and how hard it works for you.", author: "Robert Kiyosaki" },
        ],
        retirement: [
          { quote: "Someone is sitting in the shade today because someone planted a tree a long time ago.", author: "Warren Buffett" },
          { quote: "Do not save what is left after spending; spend what is left after saving.", author: "Warren Buffett" },
        ],
        legacy: [
          { quote: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb" },
          { quote: "The greatest use of a life is to spend it on something that will outlast it.", author: "William James" },
        ],
        default: [
          { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
          { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
        ]
      };
      
      const category = profile.primaryGoal || 'default';
      const categoryQuotes = quotes[category as keyof typeof quotes] || quotes.default;
      return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
    };

    // Generate financial health score
    const getFinancialHealthScore = () => {
      let score = 50; // Base score
      
      // Positive factors
      if (netWorth.netWorth > 0) score += 10;
      if (netWorth.netWorth > 100000) score += 5;
      if (netWorth.netWorth > 500000) score += 5;
      if (netWorth.netWorth > 1000000) score += 5;
      if (profile.retirementAccounts.length > 0) score += 10;
      if (profile.cashAccounts.length > 0) score += 5;
      if (netWorth.breakdown.cashTotal > 10000) score += 5; // Emergency fund
      if (profile.primaryGoal) score += 3;
      if (profile.riskTolerance) score += 2;
      
      // Negative factors
      if (netWorth.liabilities > netWorth.assets * 0.5) score -= 10;
      if (netWorth.breakdown.cashTotal < 5000) score -= 5;
      
      return Math.min(100, Math.max(0, score));
    };

    // Generate insights based on their profile
    const getInsights = () => {
      const insights: string[] = [];
      
      if (profile.retirementAccounts.length > 0) {
        const totalRetirement = netWorth.breakdown.retirementTotal;
        if (totalRetirement > 100000) {
          insights.push("🎯 Strong retirement foundation — you're ahead of 75% of Americans your age");
        }
      }
      
      if (netWorth.breakdown.cashTotal > 20000) {
        insights.push("💰 Solid emergency fund in place — that's financial peace of mind");
      } else if (netWorth.breakdown.cashTotal < 5000) {
        insights.push("💡 Consider building a 3-6 month emergency fund as a priority");
      }
      
      if (profile.investmentAccounts.length > 0) {
        insights.push("📈 Active investment accounts show you're putting money to work");
      }
      
      if (netWorth.liabilities === 0) {
        insights.push("🎉 Debt-free! That's a powerful position for wealth building");
      } else if (netWorth.liabilities < netWorth.assets * 0.3) {
        insights.push("✅ Healthy debt-to-asset ratio — liabilities well managed");
      }
      
      if (profile.riskTolerance === 'aggressive' || profile.riskTolerance === 'growth') {
        insights.push("🚀 Growth-oriented mindset aligns well with long-term wealth building");
      }
      
      return insights.slice(0, 4);
    };

    // Handle Maven chat
    const handleChatSubmit = async () => {
      if (!chatMessage.trim()) return;
      
      const userMessage = chatMessage;
      setChatMessage('');
      setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
      setIsTyping(true);
      
      // Simulate Maven thinking and responding
      setTimeout(() => {
        let response = '';
        const lowerMsg = userMessage.toLowerCase();
        
        if (lowerMsg.includes('crypto') || lowerMsg.includes('bitcoin') || lowerMsg.includes('tao')) {
          response = "Got it! You can add crypto holdings in two places: 1) As part of your brokerage account holdings (search for BTC, ETH, TAO, etc.), or 2) In the 'Other Assets' step under Cryptocurrency. Want me to take you back to add those?";
        } else if (lowerMsg.includes('property') || lowerMsg.includes('house') || lowerMsg.includes('real estate')) {
          response = "For real estate, you can add your home equity (value minus mortgage) in the 'Other Assets' section. If you have a mortgage, add it under 'Liabilities'. Should I walk you through that?";
        } else if (lowerMsg.includes('stock') || lowerMsg.includes('share') || lowerMsg.includes('position')) {
          response = "You can add individual stock positions in any investment account! Go to 'Investments' step, and use the ticker search to add positions. I have 100+ stocks, ETFs, and funds in my database including all the major names.";
        } else if (lowerMsg.includes('401') || lowerMsg.includes('ira') || lowerMsg.includes('retirement')) {
          response = "I can help with retirement accounts! In the 'Retirement' step, you can add multiple 401(k)s, IRAs, Roth accounts, and even HSAs. You can also add the underlying fund holdings within each account.";
        } else if (lowerMsg.includes('looks good') || lowerMsg.includes('that\'s all') || lowerMsg.includes('complete')) {
          response = "Awesome! Your financial profile looks great. Hit 'Complete Setup' and I'll have your personalized dashboard ready with insights, recommendations, and tracking. This is just the beginning! 🚀";
        } else if (lowerMsg.includes('spouse') || lowerMsg.includes('wife') || lowerMsg.includes('husband') || lowerMsg.includes('partner')) {
          response = "For joint accounts, you can add them under any category with both names. If your spouse has separate accounts you want to track together, just add them as additional accounts. Maven can handle it all!";
        } else if (lowerMsg.includes('business') || lowerMsg.includes('company')) {
          response = "Business equity goes in 'Other Assets'. If you have a SEP IRA or Solo 401(k) from self-employment, add those under 'Retirement'. I'll help you track it all!";
        } else {
          response = `Thanks for sharing! Here's what I can help with:\n\n• Add more accounts (cash, retirement, brokerage)\n• Include specific holdings/tickers in any account\n• Track crypto, real estate, business equity\n• Add liabilities like mortgages or loans\n\nJust tell me what you'd like to add and I'll guide you there!`;
        }
        
        setChatHistory(prev => [...prev, { role: 'maven', text: response }]);
        setIsTyping(false);
      }, 1000 + Math.random() * 500);
    };

    const healthScore = getFinancialHealthScore();
    const insights = getInsights();
    const quote = getPersonalizedQuote();

    return (
      <div className="space-y-6">
        {/* Hero Section with Score */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-purple-200 text-sm mb-1">Welcome to Maven, {profile.firstName || 'friend'}!</p>
                <h2 className="text-3xl font-bold mb-2">Your Net Worth</h2>
                <p className="text-5xl font-bold">${netWorth.netWorth.toLocaleString()}</p>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold">{healthScore}</span>
                </div>
                <p className="text-sm text-purple-200">Financial Health</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
              <div>
                <p className="text-purple-200 text-xs">Cash</p>
                <p className="text-lg font-semibold">${netWorth.breakdown.cashTotal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-purple-200 text-xs">Retirement</p>
                <p className="text-lg font-semibold">${netWorth.breakdown.retirementTotal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-purple-200 text-xs">Investments</p>
                <p className="text-lg font-semibold">${netWorth.breakdown.investmentTotal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-purple-200 text-xs">Liabilities</p>
                <p className="text-lg font-semibold text-pink-300">-${netWorth.liabilities.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inspirational Quote */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">💎</span>
            <div>
              <p className="text-lg italic text-[var(--foreground)] mb-2">"{quote.quote}"</p>
              <p className="text-sm text-[var(--muted)]">— {quote.author}</p>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        {insights.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>🧠</span> Maven's Take on Your Finances
            </h3>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <span className="text-emerald-400">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💵</span>
              <span className="font-medium">Cash</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">${netWorth.breakdown.cashTotal.toLocaleString()}</p>
            <p className="text-xs text-[var(--muted)]">{profile.cashAccounts.length} account{profile.cashAccounts.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏦</span>
              <span className="font-medium">Retirement</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">${netWorth.breakdown.retirementTotal.toLocaleString()}</p>
            <p className="text-xs text-[var(--muted)]">{profile.retirementAccounts.length} account{profile.retirementAccounts.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📈</span>
              <span className="font-medium">Investments</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">${netWorth.breakdown.investmentTotal.toLocaleString()}</p>
            <p className="text-xs text-[var(--muted)]">{profile.investmentAccounts.length} account{profile.investmentAccounts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Portfolio Analysis */}
        {(() => {
          // Gather all holdings
          const allHoldings = [...profile.retirementAccounts, ...profile.investmentAccounts]
            .flatMap(a => a.holdings || [])
            .filter(h => h.currentValue && h.currentValue > 0);
          
          const totalInvested = allHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
          
          if (totalInvested === 0) return null;

          // Categorize holdings
          const categories: Record<string, { name: string; color: string; holdings: typeof allHoldings }> = {
            usEquity: { name: 'US Equity', color: 'bg-blue-500', holdings: [] },
            intlEquity: { name: 'International Equity', color: 'bg-purple-500', holdings: [] },
            fixedIncome: { name: 'Fixed Income', color: 'bg-emerald-500', holdings: [] },
            crypto: { name: 'Crypto / Digital Assets', color: 'bg-orange-500', holdings: [] },
            realAssets: { name: 'Real Assets', color: 'bg-amber-500', holdings: [] },
            other: { name: 'Other', color: 'bg-gray-500', holdings: [] },
          };

          // Simple categorization based on ticker patterns
          const cryptoTickers = ['BTC', 'ETH', 'SOL', 'TAO', 'TAOX', 'AVAX', 'LINK', 'DOT', 'ADA', 'XRP', 'DOGE', 'MATIC', 'IBIT', 'FBTC', 'GBTC', 'ETHE', 'CIFR', 'IREN', 'MARA', 'RIOT', 'CLSK', 'MSTR', 'COIN', 'HUT', 'BITF'];
          const intlTickers = ['VXUS', 'VEA', 'VWO', 'IEFA', 'IEMG', 'AEPFX', 'ANWFX', 'SMCFX'];
          const bondTickers = ['BND', 'AGG', 'BFAFX', 'VBTLX', 'FBNDX'];
          const reitTickers = ['VNQ', 'O', 'AMT', 'REIT'];

          allHoldings.forEach(h => {
            const ticker = h.ticker.toUpperCase();
            if (cryptoTickers.includes(ticker)) {
              categories.crypto.holdings.push(h);
            } else if (intlTickers.some(t => ticker.includes(t) || ticker === t)) {
              categories.intlEquity.holdings.push(h);
            } else if (bondTickers.some(t => ticker.includes(t) || ticker === t)) {
              categories.fixedIncome.holdings.push(h);
            } else if (reitTickers.some(t => ticker.includes(t) || ticker === t)) {
              categories.realAssets.holdings.push(h);
            } else {
              categories.usEquity.holdings.push(h);
            }
          });

          // Calculate percentages
          const assetAllocation = Object.entries(categories)
            .map(([key, cat]) => ({
              key,
              name: cat.name,
              color: cat.color,
              value: cat.holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0),
              holdings: cat.holdings,
            }))
            .filter(cat => cat.value > 0)
            .sort((a, b) => b.value - a.value);

          // Find concentration risks (>20% in single holding)
          const concentrationRisks = allHoldings
            .map(h => ({ ...h, pct: ((h.currentValue || 0) / totalInvested) * 100 }))
            .filter(h => h.pct > 15)
            .sort((a, b) => b.pct - a.pct);

          // Generate portfolio thoughts
          const getPortfolioThoughts = () => {
            const thoughts: { type: 'positive' | 'consideration' | 'opportunity'; text: string }[] = [];
            
            const usEquityPct = (categories.usEquity.holdings.reduce((s, h) => s + (h.currentValue || 0), 0) / totalInvested) * 100;
            const intlPct = (categories.intlEquity.holdings.reduce((s, h) => s + (h.currentValue || 0), 0) / totalInvested) * 100;
            const cryptoPct = (categories.crypto.holdings.reduce((s, h) => s + (h.currentValue || 0), 0) / totalInvested) * 100;
            const bondPct = (categories.fixedIncome.holdings.reduce((s, h) => s + (h.currentValue || 0), 0) / totalInvested) * 100;

            // US Equity analysis
            if (usEquityPct > 70) {
              thoughts.push({ type: 'consideration', text: `Heavy US equity concentration (${usEquityPct.toFixed(0)}%). Consider international diversification for reduced correlation.` });
            } else if (usEquityPct > 50 && usEquityPct <= 70) {
              thoughts.push({ type: 'positive', text: `Solid US equity foundation (${usEquityPct.toFixed(0)}%) with room for diversification.` });
            }

            // International analysis
            if (intlPct > 0 && intlPct < 15) {
              thoughts.push({ type: 'opportunity', text: `International exposure (${intlPct.toFixed(0)}%) is below typical recommendations (15-25%). Global diversification can reduce volatility.` });
            } else if (intlPct >= 15) {
              thoughts.push({ type: 'positive', text: `Good international diversification (${intlPct.toFixed(0)}%) provides exposure to global growth.` });
            }

            // Crypto analysis
            if (cryptoPct > 20) {
              thoughts.push({ type: 'consideration', text: `Significant crypto allocation (${cryptoPct.toFixed(0)}%). High potential but also high volatility — ensure this fits your risk tolerance.` });
            } else if (cryptoPct > 5 && cryptoPct <= 20) {
              thoughts.push({ type: 'positive', text: `Meaningful crypto position (${cryptoPct.toFixed(0)}%) adds asymmetric upside potential.` });
            } else if (cryptoPct > 0) {
              thoughts.push({ type: 'positive', text: `Small crypto allocation (${cryptoPct.toFixed(0)}%) provides exposure without excessive risk.` });
            }

            // Bond analysis
            if (bondPct === 0 && profile.riskTolerance !== 'aggressive') {
              thoughts.push({ type: 'opportunity', text: 'No fixed income allocation. Bonds can provide stability and reduce portfolio volatility.' });
            } else if (bondPct > 0 && bondPct < 10) {
              thoughts.push({ type: 'positive', text: `Light fixed income allocation (${bondPct.toFixed(0)}%) — appropriate for growth-focused investors.` });
            }

            // Concentration analysis
            if (concentrationRisks.length > 0) {
              const topConcentration = concentrationRisks[0];
              thoughts.push({ type: 'consideration', text: `${topConcentration.ticker} represents ${topConcentration.pct.toFixed(0)}% of your portfolio. Consider if this concentration aligns with your goals.` });
            }

            // Fund quality check
            const hasCapitalGroupFunds = allHoldings.some(h => 
              ['GFFFX', 'ANWFX', 'ANEFX', 'AIVSX', 'AFIFX', 'AEPFX', 'ANCFX', 'SMCFX'].includes(h.ticker.toUpperCase())
            );
            if (hasCapitalGroupFunds) {
              thoughts.push({ type: 'positive', text: 'Utilizing Capital Group institutional funds — strong track record with competitive fees for F-share class.' });
            }

            return thoughts.slice(0, 5);
          };

          const thoughts = getPortfolioThoughts();

          return (
            <>
              {/* Portfolio Model / Asset Allocation */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span>📊</span> Your Portfolio Model
                </h3>
                <p className="text-sm text-[var(--muted)] mb-4">
                  Total Invested: <span className="text-white font-semibold">${totalInvested.toLocaleString()}</span>
                </p>
                
                {/* Allocation Bar */}
                <div className="h-8 rounded-lg overflow-hidden flex mb-4">
                  {assetAllocation.map((cat, idx) => (
                    <div 
                      key={cat.key}
                      className={`${cat.color} transition-all relative group`}
                      style={{ width: `${(cat.value / totalInvested) * 100}%` }}
                      title={`${cat.name}: ${((cat.value / totalInvested) * 100).toFixed(1)}%`}
                    >
                      <div className="absolute inset-0 bg-white/0 hover:bg-white/20 transition" />
                    </div>
                  ))}
                </div>

                {/* Legend & Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {assetAllocation.map(cat => (
                    <div key={cat.key} className="bg-[var(--background)] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded ${cat.color}`} />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <p className="text-lg font-bold">{((cat.value / totalInvested) * 100).toFixed(1)}%</p>
                      <p className="text-xs text-[var(--muted)]">${cat.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Holdings Detail */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span>📋</span> Holdings Breakdown
                </h3>
                <div className="space-y-4">
                  {assetAllocation.map(cat => (
                    <div key={cat.key}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded ${cat.color}`} />
                        <span className="text-sm font-medium text-[var(--muted)]">{cat.name}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {cat.holdings.map((h, idx) => (
                          <div key={idx} className="bg-[var(--background)] rounded-lg px-3 py-2">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-sm">{h.ticker}</span>
                              <span className="text-xs text-emerald-400">{((h.currentValue || 0) / totalInvested * 100).toFixed(1)}%</span>
                            </div>
                            <p className="text-xs text-[var(--muted)] truncate">{h.name}</p>
                            <p className="text-sm font-medium">${(h.currentValue || 0).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Thoughts */}
              {thoughts.length > 0 && (
                <div className="bg-gradient-to-br from-[var(--card)] to-indigo-950/30 border border-indigo-500/30 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span>🤔</span> Maven's Portfolio Thoughts
                  </h3>
                  <div className="space-y-3">
                    {thoughts.map((thought, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className={`mt-0.5 ${
                          thought.type === 'positive' ? 'text-emerald-400' : 
                          thought.type === 'consideration' ? 'text-amber-400' : 'text-blue-400'
                        }`}>
                          {thought.type === 'positive' ? '✓' : thought.type === 'consideration' ? '⚠' : '💡'}
                        </span>
                        <p className="text-sm">{thought.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)]">
                      These observations are based on your current holdings. After setup, Maven will provide deeper analysis, tax optimization strategies, and rebalancing recommendations.
                    </p>
                  </div>
                </div>
              )}

              {/* Concentration Warning */}
              {concentrationRisks.length > 1 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <h4 className="font-medium text-amber-400 mb-2 flex items-center gap-2">
                    <span>⚠️</span> Concentration Alert
                  </h4>
                  <p className="text-sm text-[var(--muted)] mb-3">
                    The following positions represent significant portfolio concentration:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {concentrationRisks.map((h, idx) => (
                      <span key={idx} className="px-3 py-1 bg-amber-500/20 rounded-full text-sm">
                        {h.ticker}: {h.pct.toFixed(1)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {/* Maven Chat - What Did I Miss? */}
        <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] border-2 border-indigo-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              M
            </div>
            <div>
              <h3 className="font-bold text-lg">Hey, I'm Maven! 👋</h3>
              <p className="text-[var(--muted)] text-sm mt-1">
                I'm your new AI wealth partner. What you've shared looks great, but I want to make sure I have the full picture. 
                <span className="text-indigo-400"> Did I miss anything?</span> Type below and I'll help you add it.
              </p>
            </div>
          </div>

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-[var(--background)] border border-[var(--border)]'
                  }`}>
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl px-4 py-2 text-sm">
                    <span className="animate-pulse">Maven is typing...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
              placeholder="e.g., 'I also have some crypto' or 'Add my spouse's IRA'"
              className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-sm"
            />
            <button
              onClick={handleChatSubmit}
              disabled={!chatMessage.trim() || isTyping}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition"
            >
              Send
            </button>
          </div>

          <p className="text-xs text-[var(--muted)] mt-3 text-center">
            This is just the beginning. Once you complete setup, I'll help you optimize taxes, rebalance portfolios, and build wealth smarter.
          </p>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome': return renderWelcome();
      case 'cash': return renderCash();
      case 'retirement': return renderRetirement();
      case 'investments': return renderInvestments();
      case 'other': return renderOtherAssets();
      case 'liabilities': return renderLiabilities();
      case 'goals': return renderGoals();
      case 'review': return renderReview();
      default: return null;
    }
  };

  // Show loading state while profile loads
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4 animate-pulse">
            M
          </div>
          <p className="text-[var(--muted)]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Progressive Signup Modal */}
      {showSignupModal && (
        <ProgressiveSignup
          email={profile.email}
          firstName={profile.firstName}
          lastName={profile.lastName}
          onSuccess={handleSignupSuccess}
          onSkip={handleSignupSkip}
        />
      )}
      
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold">
              M
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Maven</h1>
              <p className="text-xs text-[var(--muted)]">Financial Profile Setup</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="text-sm text-[var(--muted)] hover:text-white transition"
          >
            Skip for now
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center gap-1.5 mb-2">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                idx < currentStep
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : idx === currentStep
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse'
                  : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--muted)]">
            Step {currentStep + 1} of {STEPS.length} · <span className="text-emerald-400">{Math.round((currentStep / (STEPS.length - 1)) * 100)}% complete</span>
          </span>
          <span className="font-medium flex items-center gap-2">
            <span className="text-lg">{STEPS[currentStep].icon}</span>
            {STEPS[currentStep].title}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl font-medium hover:bg-[var(--card-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          
          {/* Auto-save indicator */}
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === 'saving' && (
              <>
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-gray-400">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-400">Saved ✓</span>
              </>
            )}
            {saveStatus === 'idle' && lastSaved && (
              <span className="text-gray-500">
                Last saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          
          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={handleCompleteSetup}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-xl font-medium transition"
            >
              Complete Setup ✓
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition"
            >
              Continue →
            </button>
          )}
        </div>
      </main>

      {/* Progressive Signup Modal */}
      {showSignupModal && (
        <ProgressiveSignup
          email={profile.email}
          firstName={profile.firstName}
          lastName={profile.lastName}
          onSuccess={() => {
            setShowSignupModal(false);
            saveProfile();
          }}
          onSkip={() => {
            setShowSignupModal(false);
            saveProfile(); // Still save locally even if skipped
          }}
        />
      )}
    </div>
  );
}
