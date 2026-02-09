'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useUserProfile } from '@/providers/UserProvider';

// ============================================
// TYPES
// ============================================

interface ProfileData {
  // Personal
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  state: string;
  filingStatus: string;
  spouseFirstName: string;
  spouseDateOfBirth: string;
  dependents: number;
  
  // Income
  annualIncome: number;
  spouseIncome: number;
  selfEmploymentIncome: number;
  investmentIncome: number;
  otherIncome: number;
  
  // Cash Accounts
  checkingBalance: number;
  savingsBalance: number;
  mmBalance: number;
  
  // Retirement Accounts
  has401k: boolean;
  account401kBalance: number;
  account401kEmployer: string;
  account401kContribution: number;
  account401kMatch: number;
  hasTraditionalIRA: boolean;
  traditionalIRABalance: number;
  hasRothIRA: boolean;
  rothIRABalance: number;
  hasRoth401k: boolean;
  roth401kBalance: number;
  hasHSA: boolean;
  hsaBalance: number;
  hasPension: boolean;
  pensionValue: number;
  
  // Investment Accounts
  hasBrokerage: boolean;
  brokerageBalance: number;
  has529: boolean;
  balance529: number;
  
  // Holdings (simplified - top holdings)
  topHoldings: Array<{
    ticker: string;
    shares: number;
    costBasis: number;
  }>;
  
  // Other Assets
  realEstateEquity: number;
  cryptoValue: number;
  businessEquity: number;
  otherAssets: number;
  
  // Liabilities
  mortgageBalance: number;
  mortgageRate: number;
  mortgagePayment: number;
  studentLoanBalance: number;
  studentLoanRate: number;
  autoLoanBalance: number;
  creditCardBalance: number;
  otherDebtBalance: number;
  
  // Goals
  retirementAge: number;
  monthlyRetirementSpending: number;
}

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

const FILING_STATUSES = [
  { value: 'Single', label: 'Single' },
  { value: 'Married Filing Jointly', label: 'Married Filing Jointly' },
  { value: 'Married Filing Separately', label: 'Married Filing Separately' },
  { value: 'Head of Household', label: 'Head of Household' },
  { value: 'Qualifying Widow(er)', label: 'Qualifying Widow(er)' },
];

// ============================================
// COMPONENTS
// ============================================

function CurrencyInput({ 
  value, 
  onChange, 
  placeholder = '0',
  className = ''
}: { 
  value: number; 
  onChange: (v: number) => void; 
  placeholder?: string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value ? value.toLocaleString() : '');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw) || 0;
    setDisplayValue(num ? num.toLocaleString() : '');
    onChange(num);
  };
  
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-7 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}

function PercentInput({ 
  value, 
  onChange, 
  placeholder = '0',
  className = ''
}: { 
  value: number; 
  onChange: (v: number) => void; 
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="number"
        step="0.1"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        className="w-full pl-4 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
    </div>
  );
}

function ToggleCard({
  checked,
  onChange,
  icon,
  title,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`p-4 rounded-xl border text-left transition w-full ${
        checked
          ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className={`font-medium ${checked ? 'text-white' : 'text-gray-300'}`}>
            {title}
          </p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          checked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'
        }`}>
          {checked && <span className="text-white text-xs">✓</span>}
        </div>
      </div>
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const { updateProfile, profile } = useUserProfile();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  const [data, setData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    state: '',
    filingStatus: '',
    spouseFirstName: '',
    spouseDateOfBirth: '',
    dependents: 0,
    annualIncome: 0,
    spouseIncome: 0,
    selfEmploymentIncome: 0,
    investmentIncome: 0,
    otherIncome: 0,
    checkingBalance: 0,
    savingsBalance: 0,
    mmBalance: 0,
    has401k: false,
    account401kBalance: 0,
    account401kEmployer: '',
    account401kContribution: 0,
    account401kMatch: 0,
    hasTraditionalIRA: false,
    traditionalIRABalance: 0,
    hasRothIRA: false,
    rothIRABalance: 0,
    hasRoth401k: false,
    roth401kBalance: 0,
    hasHSA: false,
    hsaBalance: 0,
    hasPension: false,
    pensionValue: 0,
    hasBrokerage: false,
    brokerageBalance: 0,
    has529: false,
    balance529: 0,
    topHoldings: [],
    realEstateEquity: 0,
    cryptoValue: 0,
    businessEquity: 0,
    otherAssets: 0,
    mortgageBalance: 0,
    mortgageRate: 0,
    mortgagePayment: 0,
    studentLoanBalance: 0,
    studentLoanRate: 0,
    autoLoanBalance: 0,
    creditCardBalance: 0,
    otherDebtBalance: 0,
    retirementAge: 65,
    monthlyRetirementSpending: 0,
  });
  
  // Pre-fill from Clerk user data
  useEffect(() => {
    if (user) {
      setData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      }));
    }
  }, [user]);
  
  const totalSteps = 7;
  
  const update = (updates: Partial<ProfileData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };
  
  const isMarried = data.filingStatus === 'Married Filing Jointly' || data.filingStatus === 'Married Filing Separately';
  
  const handleComplete = async () => {
    setSaving(true);
    
    try {
      // Build the profile object for UserProvider
      const cashAccounts = [];
      if (data.checkingBalance > 0) {
        cashAccounts.push({
          id: 'checking-1',
          name: 'Checking Account',
          institution: 'Bank',
          balance: data.checkingBalance,
          type: 'Checking' as const,
        });
      }
      if (data.savingsBalance > 0) {
        cashAccounts.push({
          id: 'savings-1',
          name: 'Savings Account',
          institution: 'Bank',
          balance: data.savingsBalance,
          type: 'Savings' as const,
        });
      }
      if (data.mmBalance > 0) {
        cashAccounts.push({
          id: 'mm-1',
          name: 'Money Market',
          institution: 'Bank',
          balance: data.mmBalance,
          type: 'Money Market' as const,
        });
      }
      
      const retirementAccounts = [];
      if (data.has401k && data.account401kBalance > 0) {
        retirementAccounts.push({
          id: '401k-1',
          name: '401(k)',
          institution: data.account401kEmployer || 'Employer',
          balance: data.account401kBalance,
          type: '401(k)' as const,
          employer: data.account401kEmployer,
          contributionPercent: data.account401kContribution,
          employerMatchPercent: data.account401kMatch,
          holdings: [],
        });
      }
      if (data.hasRoth401k && data.roth401kBalance > 0) {
        retirementAccounts.push({
          id: 'roth401k-1',
          name: 'Roth 401(k)',
          institution: data.account401kEmployer || 'Employer',
          balance: data.roth401kBalance,
          type: 'Roth 401(k)' as const,
          holdings: [],
        });
      }
      if (data.hasTraditionalIRA && data.traditionalIRABalance > 0) {
        retirementAccounts.push({
          id: 'trad-ira-1',
          name: 'Traditional IRA',
          institution: 'Brokerage',
          balance: data.traditionalIRABalance,
          type: 'Traditional IRA' as const,
          holdings: [],
        });
      }
      if (data.hasRothIRA && data.rothIRABalance > 0) {
        retirementAccounts.push({
          id: 'roth-ira-1',
          name: 'Roth IRA',
          institution: 'Brokerage',
          balance: data.rothIRABalance,
          type: 'Roth IRA' as const,
          holdings: [],
        });
      }
      if (data.hasHSA && data.hsaBalance > 0) {
        retirementAccounts.push({
          id: 'hsa-1',
          name: 'HSA',
          institution: 'HSA Provider',
          balance: data.hsaBalance,
          type: 'HSA' as const,
          holdings: [],
        });
      }
      if (data.hasPension && data.pensionValue > 0) {
        retirementAccounts.push({
          id: 'pension-1',
          name: 'Pension',
          institution: data.account401kEmployer || 'Employer',
          balance: data.pensionValue,
          type: 'Pension' as const,
          holdings: [],
        });
      }
      
      const investmentAccounts = [];
      if (data.hasBrokerage && data.brokerageBalance > 0) {
        investmentAccounts.push({
          id: 'brokerage-1',
          name: 'Brokerage Account',
          institution: 'Brokerage',
          balance: data.brokerageBalance,
          type: 'Individual' as const,
          holdings: data.topHoldings.map((h, i) => ({
            id: `holding-${i}`,
            ticker: h.ticker,
            shares: h.shares,
            costBasis: h.costBasis,
          })),
        });
      }
      if (data.has529 && data.balance529 > 0) {
        investmentAccounts.push({
          id: '529-1',
          name: '529 Plan',
          institution: '529 Provider',
          balance: data.balance529,
          type: '529' as const,
          holdings: [],
        });
      }
      
      const liabilities = [];
      if (data.mortgageBalance > 0) {
        liabilities.push({
          id: 'mortgage-1',
          name: 'Mortgage',
          type: 'Mortgage' as const,
          balance: data.mortgageBalance,
          interestRate: data.mortgageRate,
          monthlyPayment: data.mortgagePayment,
        });
      }
      if (data.studentLoanBalance > 0) {
        liabilities.push({
          id: 'student-1',
          name: 'Student Loans',
          type: 'Student Loan' as const,
          balance: data.studentLoanBalance,
          interestRate: data.studentLoanRate,
          monthlyPayment: 0,
        });
      }
      if (data.autoLoanBalance > 0) {
        liabilities.push({
          id: 'auto-1',
          name: 'Auto Loan',
          type: 'Auto Loan' as const,
          balance: data.autoLoanBalance,
          interestRate: 5,
          monthlyPayment: 0,
        });
      }
      if (data.creditCardBalance > 0) {
        liabilities.push({
          id: 'cc-1',
          name: 'Credit Cards',
          type: 'Credit Card' as const,
          balance: data.creditCardBalance,
          interestRate: 20,
          monthlyPayment: 0,
        });
      }
      if (data.otherDebtBalance > 0) {
        liabilities.push({
          id: 'other-debt-1',
          name: 'Other Debt',
          type: 'Other' as const,
          balance: data.otherDebtBalance,
          interestRate: 6,
          monthlyPayment: 0,
        });
      }
      
      // Calculate total household income
      const totalIncome = data.annualIncome + data.spouseIncome + data.selfEmploymentIncome + data.investmentIncome + data.otherIncome;
      
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        state: data.state,
        filingStatus: data.filingStatus as any,
        householdIncome: totalIncome > 0 ? `$${totalIncome.toLocaleString()}` : '',
        cashAccounts,
        retirementAccounts,
        investmentAccounts,
        realEstateEquity: data.realEstateEquity,
        cryptoValue: data.cryptoValue,
        businessEquity: data.businessEquity,
        otherAssets: data.otherAssets,
        liabilities,
        onboardingComplete: true,
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
              M
            </div>
            <span className="text-xl font-bold text-white">Maven</span>
          </Link>
          
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition text-sm"
          >
            Skip for now
          </button>
        </div>
      </header>
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">👤</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Let's start with the basics
              </h1>
              <p className="text-gray-400">This helps us personalize your experience</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={data.firstName}
                    onChange={(e) => update({ firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={data.lastName}
                    onChange={(e) => update({ lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(e) => update({ dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">State</label>
                  <select
                    value={data.state}
                    onChange={(e) => update({ state: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select state...</option>
                    {STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Filing Status</label>
                  <select
                    value={data.filingStatus}
                    onChange={(e) => update({ filingStatus: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select status...</option>
                    {FILING_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {isMarried && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mt-4">
                  <p className="text-purple-300 text-sm font-medium mb-3">Spouse Information</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Spouse's First Name</label>
                      <input
                        type="text"
                        value={data.spouseFirstName}
                        onChange={(e) => update({ spouseFirstName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Spouse's Date of Birth</label>
                      <input
                        type="date"
                        value={data.spouseDateOfBirth}
                        onChange={(e) => update({ spouseDateOfBirth: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Step 2: Income */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">💼</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Your household income
              </h1>
              <p className="text-gray-400">Enter annual amounts (approximate is fine)</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Your Annual Salary/Wages</label>
                <CurrencyInput value={data.annualIncome} onChange={(v) => update({ annualIncome: v })} />
              </div>
              
              {isMarried && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Spouse's Annual Income</label>
                  <CurrencyInput value={data.spouseIncome} onChange={(v) => update({ spouseIncome: v })} />
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Self-Employment Income</label>
                <CurrencyInput value={data.selfEmploymentIncome} onChange={(v) => update({ selfEmploymentIncome: v })} placeholder="0" />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Investment/Dividend Income</label>
                <CurrencyInput value={data.investmentIncome} onChange={(v) => update({ investmentIncome: v })} placeholder="0" />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Other Income (rental, etc.)</label>
                <CurrencyInput value={data.otherIncome} onChange={(v) => update({ otherIncome: v })} placeholder="0" />
              </div>
              
              <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-300 font-medium">Total Household Income</span>
                  <span className="text-2xl font-bold text-white">
                    ${(data.annualIncome + data.spouseIncome + data.selfEmploymentIncome + data.investmentIncome + data.otherIncome).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Cash & Savings */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">🏦</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Your cash & savings
              </h1>
              <p className="text-gray-400">Bank accounts, CDs, and liquid savings</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Checking Account(s) Total</label>
                <CurrencyInput value={data.checkingBalance} onChange={(v) => update({ checkingBalance: v })} />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Savings Account(s) Total</label>
                <CurrencyInput value={data.savingsBalance} onChange={(v) => update({ savingsBalance: v })} />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Money Market / CDs</label>
                <CurrencyInput value={data.mmBalance} onChange={(v) => update({ mmBalance: v })} placeholder="0" />
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 font-medium">Total Cash</span>
                  <span className="text-2xl font-bold text-white">
                    ${(data.checkingBalance + data.savingsBalance + data.mmBalance).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 4: Retirement Accounts */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">🏖️</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Retirement accounts
              </h1>
              <p className="text-gray-400">Select all that apply and enter balances</p>
            </div>
            
            <div className="space-y-4">
              <ToggleCard
                checked={data.has401k}
                onChange={(v) => update({ has401k: v })}
                icon="📦"
                title="401(k)"
                description="Employer-sponsored retirement plan"
              />
              
              {data.has401k && (
                <div className="ml-8 space-y-3 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                    <CurrencyInput value={data.account401kBalance} onChange={(v) => update({ account401kBalance: v })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Employer Name</label>
                    <input
                      type="text"
                      value={data.account401kEmployer}
                      onChange={(e) => update({ account401kEmployer: e.target.value })}
                      placeholder="e.g., Fidelity, Vanguard"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Your Contribution %</label>
                      <PercentInput value={data.account401kContribution} onChange={(v) => update({ account401kContribution: v })} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Employer Match %</label>
                      <PercentInput value={data.account401kMatch} onChange={(v) => update({ account401kMatch: v })} />
                    </div>
                  </div>
                </div>
              )}
              
              <ToggleCard
                checked={data.hasRoth401k}
                onChange={(v) => update({ hasRoth401k: v })}
                icon="📦"
                title="Roth 401(k)"
                description="After-tax employer retirement plan"
              />
              
              {data.hasRoth401k && (
                <div className="ml-8 animate-in fade-in duration-200">
                  <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                  <CurrencyInput value={data.roth401kBalance} onChange={(v) => update({ roth401kBalance: v })} />
                </div>
              )}
              
              <ToggleCard
                checked={data.hasTraditionalIRA}
                onChange={(v) => update({ hasTraditionalIRA: v })}
                icon="📜"
                title="Traditional IRA"
                description="Individual retirement account (pre-tax)"
              />
              
              {data.hasTraditionalIRA && (
                <div className="ml-8 animate-in fade-in duration-200">
                  <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                  <CurrencyInput value={data.traditionalIRABalance} onChange={(v) => update({ traditionalIRABalance: v })} />
                </div>
              )}
              
              <ToggleCard
                checked={data.hasRothIRA}
                onChange={(v) => update({ hasRothIRA: v })}
                icon="💎"
                title="Roth IRA"
                description="Individual retirement account (after-tax)"
              />
              
              {data.hasRothIRA && (
                <div className="ml-8 animate-in fade-in duration-200">
                  <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                  <CurrencyInput value={data.rothIRABalance} onChange={(v) => update({ rothIRABalance: v })} />
                </div>
              )}
              
              <ToggleCard
                checked={data.hasHSA}
                onChange={(v) => update({ hasHSA: v })}
                icon="🏥"
                title="HSA"
                description="Health Savings Account"
              />
              
              {data.hasHSA && (
                <div className="ml-8 animate-in fade-in duration-200">
                  <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                  <CurrencyInput value={data.hsaBalance} onChange={(v) => update({ hsaBalance: v })} />
                </div>
              )}
              
              <ToggleCard
                checked={data.hasPension}
                onChange={(v) => update({ hasPension: v })}
                icon="🎖️"
                title="Pension"
                description="Defined benefit pension plan"
              />
              
              {data.hasPension && (
                <div className="ml-8 animate-in fade-in duration-200">
                  <label className="block text-sm text-gray-400 mb-1">Estimated Lump Sum Value</label>
                  <CurrencyInput value={data.pensionValue} onChange={(v) => update({ pensionValue: v })} />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Step 5: Investment Accounts */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">📈</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Investment accounts & other assets
              </h1>
              <p className="text-gray-400">Taxable brokerage, crypto, real estate, etc.</p>
            </div>
            
            <div className="space-y-4">
              <ToggleCard
                checked={data.hasBrokerage}
                onChange={(v) => update({ hasBrokerage: v })}
                icon="📊"
                title="Brokerage Account"
                description="Taxable investment account"
              />
              
              {data.hasBrokerage && (
                <div className="ml-8 animate-in fade-in duration-200">
                  <label className="block text-sm text-gray-400 mb-1">Total Value</label>
                  <CurrencyInput value={data.brokerageBalance} onChange={(v) => update({ brokerageBalance: v })} />
                </div>
              )}
              
              <ToggleCard
                checked={data.has529}
                onChange={(v) => update({ has529: v })}
                icon="🎓"
                title="529 Plan"
                description="Education savings plan"
              />
              
              {data.has529 && (
                <div className="ml-8 animate-in fade-in duration-200">
                  <label className="block text-sm text-gray-400 mb-1">Total Value</label>
                  <CurrencyInput value={data.balance529} onChange={(v) => update({ balance529: v })} />
                </div>
              )}
              
              <div className="border-t border-white/10 pt-4 mt-6">
                <p className="text-gray-400 text-sm mb-4">Other Assets</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">🏠 Real Estate Equity</label>
                    <CurrencyInput value={data.realEstateEquity} onChange={(v) => update({ realEstateEquity: v })} placeholder="Home value minus mortgage" />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">₿ Cryptocurrency</label>
                    <CurrencyInput value={data.cryptoValue} onChange={(v) => update({ cryptoValue: v })} placeholder="0" />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">🏢 Business Equity</label>
                    <CurrencyInput value={data.businessEquity} onChange={(v) => update({ businessEquity: v })} placeholder="0" />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">📦 Other Assets</label>
                    <CurrencyInput value={data.otherAssets} onChange={(v) => update({ otherAssets: v })} placeholder="Vehicles, collectibles, etc." />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 6: Debt */}
        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">💳</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Your liabilities
              </h1>
              <p className="text-gray-400">Mortgage, loans, and other debt</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="font-medium text-white mb-3">🏠 Mortgage</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Remaining Balance</label>
                    <CurrencyInput value={data.mortgageBalance} onChange={(v) => update({ mortgageBalance: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Interest Rate</label>
                      <PercentInput value={data.mortgageRate} onChange={(v) => update({ mortgageRate: v })} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Monthly Payment</label>
                      <CurrencyInput value={data.mortgagePayment} onChange={(v) => update({ mortgagePayment: v })} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="font-medium text-white mb-3">🎓 Student Loans</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Total Balance</label>
                    <CurrencyInput value={data.studentLoanBalance} onChange={(v) => update({ studentLoanBalance: v })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Avg Interest Rate</label>
                    <PercentInput value={data.studentLoanRate} onChange={(v) => update({ studentLoanRate: v })} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">🚗 Auto Loan Balance</label>
                <CurrencyInput value={data.autoLoanBalance} onChange={(v) => update({ autoLoanBalance: v })} />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">💳 Credit Card Balance</label>
                <CurrencyInput value={data.creditCardBalance} onChange={(v) => update({ creditCardBalance: v })} />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">📋 Other Debt</label>
                <CurrencyInput value={data.otherDebtBalance} onChange={(v) => update({ otherDebtBalance: v })} />
              </div>
              
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-red-300 font-medium">Total Liabilities</span>
                  <span className="text-2xl font-bold text-white">
                    ${(data.mortgageBalance + data.studentLoanBalance + data.autoLoanBalance + data.creditCardBalance + data.otherDebtBalance).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 7: Goals */}
        {step === 7 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">🎯</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Your retirement goals
              </h1>
              <p className="text-gray-400">When and how you want to retire</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Retirement Age</label>
                <input
                  type="number"
                  min="50"
                  max="80"
                  value={data.retirementAge}
                  onChange={(e) => update({ retirementAge: parseInt(e.target.value) || 65 })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Desired Monthly Spending in Retirement</label>
                <CurrencyInput value={data.monthlyRetirementSpending} onChange={(v) => update({ monthlyRetirementSpending: v })} placeholder="In today's dollars" />
              </div>
              
              {/* Net Worth Summary */}
              <div className="mt-8 p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl">
                <h3 className="text-white font-semibold mb-4 text-lg">Your Financial Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Assets</span>
                    <span className="text-emerald-400 font-medium">
                      ${(
                        data.checkingBalance + data.savingsBalance + data.mmBalance +
                        data.account401kBalance + data.roth401kBalance + data.traditionalIRABalance +
                        data.rothIRABalance + data.hsaBalance + data.pensionValue +
                        data.brokerageBalance + data.balance529 +
                        data.realEstateEquity + data.cryptoValue + data.businessEquity + data.otherAssets
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Liabilities</span>
                    <span className="text-red-400 font-medium">
                      -${(data.mortgageBalance + data.studentLoanBalance + data.autoLoanBalance + data.creditCardBalance + data.otherDebtBalance).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-white/20 pt-3 flex justify-between">
                    <span className="text-white font-semibold">Net Worth</span>
                    <span className="text-2xl font-bold text-white">
                      ${(
                        data.checkingBalance + data.savingsBalance + data.mmBalance +
                        data.account401kBalance + data.roth401kBalance + data.traditionalIRABalance +
                        data.rothIRABalance + data.hsaBalance + data.pensionValue +
                        data.brokerageBalance + data.balance529 +
                        data.realEstateEquity + data.cryptoValue + data.businessEquity + data.otherAssets -
                        data.mortgageBalance - data.studentLoanBalance - data.autoLoanBalance - data.creditCardBalance - data.otherDebtBalance
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            className={`px-4 py-2 text-gray-400 hover:text-white transition ${step === 1 ? 'invisible' : ''}`}
          >
            ← Back
          </button>
          
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium rounded-xl transition flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>Complete Setup 🚀</>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
