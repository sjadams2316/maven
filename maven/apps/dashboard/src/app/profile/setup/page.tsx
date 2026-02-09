'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useUserProfile } from '@/providers/UserProvider';

// ============================================
// TYPES
// ============================================

interface Holding {
  ticker: string;
  name: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  currentValue: number;
  allocationPercent?: number;
}

interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
}

interface ProfileData {
  // Personal
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  state: string;
  filingStatus: string;
  spouseFirstName: string;
  spouseDateOfBirth: string;
  
  // Children (for 529s and family planning)
  children: Child[];
  
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
  account401kContributionMode: 'percent' | 'dollar';
  account401kContribution: number;
  account401kMatch: number;
  account401kHoldingsMode: 'value' | 'percentage';
  account401kHoldings: Holding[];
  
  hasTraditionalIRA: boolean;
  traditionalIRABalance: number;
  traditionalIRAHoldings: Holding[];
  
  hasRothIRA: boolean;
  rothIRABalance: number;
  rothIRAHoldings: Holding[];
  
  hasRoth401k: boolean;
  roth401kBalance: number;
  roth401kHoldings: Holding[];
  
  hasHSA: boolean;
  hsaBalance: number;
  hsaHoldings: Holding[];
  
  hasPension: boolean;
  pensionValue: number;
  
  // Investment Accounts
  hasBrokerage: boolean;
  brokerageBalance: number;
  brokerageHoldingsMode: 'value' | 'percentage';
  brokerageHoldings: Holding[];
  
  has529: boolean;
  accounts529: Array<{
    id: string;
    childId: string;
    childName: string;
    balance: number;
    holdings: Holding[];
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
// TICKER LOOKUP HOOK
// ============================================

function useTickerLookup() {
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, { name: string; price: number }>>({});
  
  const lookup = useCallback(async (ticker: string): Promise<{ name: string; price: number } | null> => {
    const upperTicker = ticker.toUpperCase().trim();
    if (!upperTicker) return null;
    
    // Check cache first
    if (cache[upperTicker]) {
      return cache[upperTicker];
    }
    
    setLoading(true);
    try {
      // Use Yahoo Finance API via our proxy
      const res = await fetch(`/api/stock-quote?symbol=${upperTicker}`);
      if (res.ok) {
        const data = await res.json();
        if (data.price) {
          const result = { name: data.name || upperTicker, price: data.price };
          setCache(prev => ({ ...prev, [upperTicker]: result }));
          return result;
        }
      }
      return null;
    } catch (error) {
      console.error('Ticker lookup failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cache]);
  
  return { lookup, loading };
}

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
  
  useEffect(() => {
    setDisplayValue(value ? value.toLocaleString() : '');
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    const num = parseFloat(raw) || 0;
    setDisplayValue(raw);
    onChange(num);
  };
  
  const handleBlur = () => {
    setDisplayValue(value ? value.toLocaleString() : '');
  };
  
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
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
        min="0"
        max="100"
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

function ModeToggle({
  mode,
  onChange,
  options,
}: {
  mode: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex bg-white/5 rounded-lg p-1">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-1.5 text-sm rounded-md transition ${
            mode === opt.value
              ? 'bg-indigo-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Holdings Entry Component
function HoldingsEntry({
  holdings,
  onChange,
  mode,
  onModeChange,
  accountBalance,
  showModeToggle = true,
}: {
  holdings: Holding[];
  onChange: (holdings: Holding[]) => void;
  mode: 'value' | 'percentage';
  onModeChange?: (mode: 'value' | 'percentage') => void;
  accountBalance: number;
  showModeToggle?: boolean;
}) {
  const { lookup, loading } = useTickerLookup();
  const [newTicker, setNewTicker] = useState('');
  const [lookupError, setLookupError] = useState('');
  
  const addHolding = async () => {
    if (!newTicker.trim()) return;
    
    setLookupError('');
    const result = await lookup(newTicker);
    
    if (result) {
      const newHolding: Holding = {
        ticker: newTicker.toUpperCase().trim(),
        name: result.name,
        shares: 0,
        costBasis: 0,
        currentPrice: result.price,
        currentValue: 0,
        allocationPercent: 0,
      };
      onChange([...holdings, newHolding]);
      setNewTicker('');
    } else {
      setLookupError('Could not find ticker. Please check the symbol.');
    }
  };
  
  const updateHolding = (index: number, updates: Partial<Holding>) => {
    const updated = [...holdings];
    updated[index] = { ...updated[index], ...updates };
    
    // Recalculate value based on mode
    if (mode === 'value' && updates.shares !== undefined) {
      updated[index].currentValue = updated[index].shares * updated[index].currentPrice;
    } else if (mode === 'percentage' && updates.allocationPercent !== undefined) {
      updated[index].currentValue = (updates.allocationPercent / 100) * accountBalance;
      updated[index].shares = updated[index].currentValue / updated[index].currentPrice;
    }
    
    onChange(updated);
  };
  
  const removeHolding = (index: number) => {
    onChange(holdings.filter((_, i) => i !== index));
  };
  
  const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const totalPercent = holdings.reduce((sum, h) => sum + (h.allocationPercent || 0), 0);
  
  return (
    <div className="space-y-3">
      {showModeToggle && onModeChange && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Enter holdings by:</span>
          <ModeToggle
            mode={mode}
            onChange={(v) => onModeChange(v as 'value' | 'percentage')}
            options={[
              { value: 'value', label: '$ Value' },
              { value: 'percentage', label: '% Allocation' },
            ]}
          />
        </div>
      )}
      
      {/* Existing Holdings */}
      {holdings.length > 0 && (
        <div className="space-y-2">
          {holdings.map((holding, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-indigo-400 font-medium">{holding.ticker}</span>
                  <span className="text-gray-500 text-sm truncate">{holding.name}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  ${holding.currentPrice?.toFixed(2)} per share
                </div>
              </div>
              
              {mode === 'value' ? (
                <div className="w-28">
                  <input
                    type="number"
                    value={holding.shares || ''}
                    onChange={(e) => updateHolding(i, { shares: parseFloat(e.target.value) || 0 })}
                    placeholder="Shares"
                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm focus:border-indigo-500 outline-none"
                  />
                </div>
              ) : (
                <div className="w-24">
                  <div className="relative">
                    <input
                      type="number"
                      value={holding.allocationPercent || ''}
                      onChange={(e) => updateHolding(i, { allocationPercent: parseFloat(e.target.value) || 0 })}
                      placeholder="%"
                      className="w-full px-2 py-1.5 pr-6 bg-white/5 border border-white/10 rounded text-white text-sm focus:border-indigo-500 outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
                  </div>
                </div>
              )}
              
              <div className="w-24 text-right">
                <span className="text-emerald-400 font-medium">
                  ${(holding.currentValue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => removeHolding(i)}
                className="p-1 text-gray-500 hover:text-red-400 transition"
              >
                ✕
              </button>
            </div>
          ))}
          
          {/* Total Row */}
          <div className="flex items-center justify-between px-3 py-2 bg-indigo-500/10 rounded-lg">
            <span className="text-sm text-indigo-300">Total</span>
            <div className="flex items-center gap-4">
              {mode === 'percentage' && (
                <span className={`text-sm ${totalPercent > 100 ? 'text-red-400' : 'text-gray-400'}`}>
                  {totalPercent.toFixed(1)}%
                </span>
              )}
              <span className="text-indigo-300 font-medium">
                ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Add New Holding */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && addHolding()}
          placeholder="Enter ticker (e.g., VOO, AAPL)"
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 outline-none font-mono"
        />
        <button
          type="button"
          onClick={addHolding}
          disabled={loading || !newTicker.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition flex items-center gap-2"
        >
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <>+ Add</>
          )}
        </button>
      </div>
      
      {lookupError && (
        <p className="text-red-400 text-sm">{lookupError}</p>
      )}
    </div>
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
    children: [],
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
    account401kContributionMode: 'percent',
    account401kContribution: 0,
    account401kMatch: 0,
    account401kHoldingsMode: 'value',
    account401kHoldings: [],
    hasTraditionalIRA: false,
    traditionalIRABalance: 0,
    traditionalIRAHoldings: [],
    hasRothIRA: false,
    rothIRABalance: 0,
    rothIRAHoldings: [],
    hasRoth401k: false,
    roth401kBalance: 0,
    roth401kHoldings: [],
    hasHSA: false,
    hsaBalance: 0,
    hsaHoldings: [],
    hasPension: false,
    pensionValue: 0,
    hasBrokerage: false,
    brokerageBalance: 0,
    brokerageHoldingsMode: 'value',
    brokerageHoldings: [],
    has529: false,
    accounts529: [],
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
  
  const totalSteps = 8; // Added a step for children/529
  
  const update = (updates: Partial<ProfileData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };
  
  const isMarried = data.filingStatus === 'Married Filing Jointly' || data.filingStatus === 'Married Filing Separately';
  
  // Child management
  const addChild = () => {
    const newChild: Child = {
      id: crypto.randomUUID(),
      name: '',
      dateOfBirth: '',
    };
    update({ children: [...data.children, newChild] });
  };
  
  const updateChild = (id: string, updates: Partial<Child>) => {
    update({
      children: data.children.map(c => c.id === id ? { ...c, ...updates } : c),
    });
  };
  
  const removeChild = (id: string) => {
    update({
      children: data.children.filter(c => c.id !== id),
      accounts529: data.accounts529.filter(a => a.childId !== id),
    });
  };
  
  // 529 account management
  const add529ForChild = (child: Child) => {
    const new529 = {
      id: crypto.randomUUID(),
      childId: child.id,
      childName: child.name,
      balance: 0,
      holdings: [],
    };
    update({ accounts529: [...data.accounts529, new529] });
  };
  
  const update529 = (id: string, updates: Partial<typeof data.accounts529[0]>) => {
    update({
      accounts529: data.accounts529.map(a => a.id === id ? { ...a, ...updates } : a),
    });
  };
  
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
          contributionPercent: data.account401kContributionMode === 'percent' ? data.account401kContribution : undefined,
          contributionAmount: data.account401kContributionMode === 'dollar' ? data.account401kContribution : undefined,
          employerMatchPercent: data.account401kMatch,
          holdingsMode: data.account401kHoldingsMode,
          holdings: data.account401kHoldings.map(h => ({
            ticker: h.ticker,
            name: h.name,
            shares: h.shares,
            costBasis: h.costBasis,
            currentPrice: h.currentPrice,
            currentValue: h.currentValue,
          })),
        });
      }
      if (data.hasRoth401k && data.roth401kBalance > 0) {
        retirementAccounts.push({
          id: 'roth401k-1',
          name: 'Roth 401(k)',
          institution: data.account401kEmployer || 'Employer',
          balance: data.roth401kBalance,
          type: 'Roth 401(k)' as const,
          holdings: data.roth401kHoldings.map(h => ({
            ticker: h.ticker,
            name: h.name,
            shares: h.shares,
            costBasis: h.costBasis,
            currentPrice: h.currentPrice,
            currentValue: h.currentValue,
          })),
        });
      }
      if (data.hasTraditionalIRA && data.traditionalIRABalance > 0) {
        retirementAccounts.push({
          id: 'trad-ira-1',
          name: 'Traditional IRA',
          institution: 'Brokerage',
          balance: data.traditionalIRABalance,
          type: 'Traditional IRA' as const,
          holdings: data.traditionalIRAHoldings.map(h => ({
            ticker: h.ticker,
            name: h.name,
            shares: h.shares,
            costBasis: h.costBasis,
            currentPrice: h.currentPrice,
            currentValue: h.currentValue,
          })),
        });
      }
      if (data.hasRothIRA && data.rothIRABalance > 0) {
        retirementAccounts.push({
          id: 'roth-ira-1',
          name: 'Roth IRA',
          institution: 'Brokerage',
          balance: data.rothIRABalance,
          type: 'Roth IRA' as const,
          holdings: data.rothIRAHoldings.map(h => ({
            ticker: h.ticker,
            name: h.name,
            shares: h.shares,
            costBasis: h.costBasis,
            currentPrice: h.currentPrice,
            currentValue: h.currentValue,
          })),
        });
      }
      if (data.hasHSA && data.hsaBalance > 0) {
        retirementAccounts.push({
          id: 'hsa-1',
          name: 'HSA',
          institution: 'HSA Provider',
          balance: data.hsaBalance,
          type: 'HSA' as const,
          holdings: data.hsaHoldings.map(h => ({
            ticker: h.ticker,
            name: h.name,
            shares: h.shares,
            costBasis: h.costBasis,
            currentPrice: h.currentPrice,
            currentValue: h.currentValue,
          })),
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
          holdingsMode: data.brokerageHoldingsMode,
          holdings: data.brokerageHoldings.map(h => ({
            ticker: h.ticker,
            name: h.name,
            shares: h.shares,
            costBasis: h.costBasis,
            currentPrice: h.currentPrice,
            currentValue: h.currentValue,
          })),
        });
      }
      // 529 accounts
      for (const acc529 of data.accounts529) {
        if (acc529.balance > 0) {
          investmentAccounts.push({
            id: acc529.id,
            name: `529 Plan - ${acc529.childName}`,
            institution: '529 Provider',
            balance: acc529.balance,
            type: '529' as const,
            beneficiary: acc529.childName,
            holdings: acc529.holdings.map(h => ({
              ticker: h.ticker,
              name: h.name,
              shares: h.shares,
              costBasis: h.costBasis,
              currentPrice: h.currentPrice,
              currentValue: h.currentValue,
            })),
          });
        }
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
        // Store children for Family tab
        socialSecurity: {
          ...profile?.socialSecurity,
          // @ts-ignore - extending for children data
          children: data.children,
        },
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
        
        {/* Step 2: Children / Family */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">👨‍👩‍👧‍👦</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Your family
              </h1>
              <p className="text-gray-400">Add children for 529 planning and family insights</p>
            </div>
            
            <div className="space-y-4">
              {data.children.map((child, i) => (
                <div key={child.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">Child {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeChild(child.id)}
                      className="text-gray-500 hover:text-red-400 transition text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e) => updateChild(child.id, { name: e.target.value })}
                        placeholder="Child's name"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={child.dateOfBirth}
                        onChange={(e) => updateChild(child.id, { dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addChild}
                className="w-full p-4 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition flex items-center justify-center gap-2"
              >
                <span className="text-xl">+</span>
                <span>Add Child</span>
              </button>
              
              {data.children.length === 0 && (
                <p className="text-center text-gray-500 text-sm">
                  No children added yet. You can skip this step if not applicable.
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Step 3: Income */}
        {step === 3 && (
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
        
        {/* Step 4: Cash & Savings */}
        {step === 4 && (
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
        
        {/* Step 5: Retirement Accounts */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">🏖️</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Retirement accounts
              </h1>
              <p className="text-gray-400">Select accounts and add your holdings</p>
            </div>
            
            <div className="space-y-4">
              {/* 401(k) */}
              <ToggleCard
                checked={data.has401k}
                onChange={(v) => update({ has401k: v })}
                icon="📦"
                title="401(k)"
                description="Employer-sponsored retirement plan"
              />
              
              {data.has401k && (
                <div className="ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                      <CurrencyInput value={data.account401kBalance} onChange={(v) => update({ account401kBalance: v })} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Plan Provider</label>
                      <input
                        type="text"
                        value={data.account401kEmployer}
                        onChange={(e) => update({ account401kEmployer: e.target.value })}
                        placeholder="e.g., Fidelity, Vanguard"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Contribution with mode toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-400">Your Contribution</label>
                      <ModeToggle
                        mode={data.account401kContributionMode}
                        onChange={(v) => update({ account401kContributionMode: v as 'percent' | 'dollar' })}
                        options={[
                          { value: 'percent', label: '%' },
                          { value: 'dollar', label: '$' },
                        ]}
                      />
                    </div>
                    {data.account401kContributionMode === 'percent' ? (
                      <PercentInput value={data.account401kContribution} onChange={(v) => update({ account401kContribution: v })} />
                    ) : (
                      <CurrencyInput value={data.account401kContribution} onChange={(v) => update({ account401kContribution: v })} placeholder="Annual amount" />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Employer Match %</label>
                    <PercentInput value={data.account401kMatch} onChange={(v) => update({ account401kMatch: v })} />
                  </div>
                  
                  {/* Holdings */}
                  <div className="pt-3 border-t border-white/10">
                    <label className="block text-sm text-gray-400 mb-3">Holdings</label>
                    <HoldingsEntry
                      holdings={data.account401kHoldings}
                      onChange={(h) => update({ account401kHoldings: h })}
                      mode={data.account401kHoldingsMode}
                      onModeChange={(m) => update({ account401kHoldingsMode: m })}
                      accountBalance={data.account401kBalance}
                    />
                  </div>
                </div>
              )}
              
              {/* Traditional IRA */}
              <ToggleCard
                checked={data.hasTraditionalIRA}
                onChange={(v) => update({ hasTraditionalIRA: v })}
                icon="📜"
                title="Traditional IRA"
                description="Individual retirement account (pre-tax)"
              />
              
              {data.hasTraditionalIRA && (
                <div className="ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                    <CurrencyInput value={data.traditionalIRABalance} onChange={(v) => update({ traditionalIRABalance: v })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Holdings</label>
                    <HoldingsEntry
                      holdings={data.traditionalIRAHoldings}
                      onChange={(h) => update({ traditionalIRAHoldings: h })}
                      mode="value"
                      accountBalance={data.traditionalIRABalance}
                      showModeToggle={false}
                    />
                  </div>
                </div>
              )}
              
              {/* Roth IRA */}
              <ToggleCard
                checked={data.hasRothIRA}
                onChange={(v) => update({ hasRothIRA: v })}
                icon="💎"
                title="Roth IRA"
                description="Individual retirement account (after-tax)"
              />
              
              {data.hasRothIRA && (
                <div className="ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                    <CurrencyInput value={data.rothIRABalance} onChange={(v) => update({ rothIRABalance: v })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Holdings</label>
                    <HoldingsEntry
                      holdings={data.rothIRAHoldings}
                      onChange={(h) => update({ rothIRAHoldings: h })}
                      mode="value"
                      accountBalance={data.rothIRABalance}
                      showModeToggle={false}
                    />
                  </div>
                </div>
              )}
              
              {/* HSA */}
              <ToggleCard
                checked={data.hasHSA}
                onChange={(v) => update({ hasHSA: v })}
                icon="🏥"
                title="HSA"
                description="Health Savings Account"
              />
              
              {data.hasHSA && (
                <div className="ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                    <CurrencyInput value={data.hsaBalance} onChange={(v) => update({ hsaBalance: v })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Holdings</label>
                    <HoldingsEntry
                      holdings={data.hsaHoldings}
                      onChange={(h) => update({ hsaHoldings: h })}
                      mode="value"
                      accountBalance={data.hsaBalance}
                      showModeToggle={false}
                    />
                  </div>
                </div>
              )}
              
              {/* Pension */}
              <ToggleCard
                checked={data.hasPension}
                onChange={(v) => update({ hasPension: v })}
                icon="🎖️"
                title="Pension"
                description="Defined benefit pension plan"
              />
              
              {data.hasPension && (
                <div className="ml-4 pl-4 border-l-2 border-indigo-500/30 animate-in fade-in duration-200">
                  <label className="block text-sm text-gray-400 mb-1">Estimated Lump Sum Value</label>
                  <CurrencyInput value={data.pensionValue} onChange={(v) => update({ pensionValue: v })} />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Step 6: Investment Accounts */}
        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">📈</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Investment accounts
              </h1>
              <p className="text-gray-400">Taxable brokerage and 529 plans</p>
            </div>
            
            <div className="space-y-4">
              {/* Brokerage */}
              <ToggleCard
                checked={data.hasBrokerage}
                onChange={(v) => update({ hasBrokerage: v })}
                icon="📊"
                title="Brokerage Account"
                description="Taxable investment account"
              />
              
              {data.hasBrokerage && (
                <div className="ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Total Value</label>
                    <CurrencyInput value={data.brokerageBalance} onChange={(v) => update({ brokerageBalance: v })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Holdings</label>
                    <HoldingsEntry
                      holdings={data.brokerageHoldings}
                      onChange={(h) => update({ brokerageHoldings: h })}
                      mode={data.brokerageHoldingsMode}
                      onModeChange={(m) => update({ brokerageHoldingsMode: m })}
                      accountBalance={data.brokerageBalance}
                    />
                  </div>
                </div>
              )}
              
              {/* 529 Plans */}
              <ToggleCard
                checked={data.has529}
                onChange={(v) => update({ has529: v })}
                icon="🎓"
                title="529 Plans"
                description="Education savings for your children"
              />
              
              {data.has529 && (
                <div className="ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                  {data.children.length === 0 ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <p className="text-amber-300 text-sm">
                        Add children in the Family step to create 529 accounts for them.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                      >
                        ← Go to Family step
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Show existing 529s */}
                      {data.accounts529.map((acc, i) => (
                        <div key={acc.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-medium">529 for {acc.childName}</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">Balance</label>
                              <CurrencyInput 
                                value={acc.balance} 
                                onChange={(v) => update529(acc.id, { balance: v })} 
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-400 mb-3">Holdings</label>
                              <HoldingsEntry
                                holdings={acc.holdings}
                                onChange={(h) => update529(acc.id, { holdings: h })}
                                mode="value"
                                accountBalance={acc.balance}
                                showModeToggle={false}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add 529 for children without one */}
                      {data.children.filter(c => !data.accounts529.some(a => a.childId === c.id)).map(child => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => add529ForChild(child)}
                          className="w-full p-4 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition flex items-center justify-center gap-2"
                        >
                          <span>+</span>
                          <span>Add 529 for {child.name || 'Unnamed Child'}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
              
              {/* Other Assets */}
              <div className="border-t border-white/10 pt-6 mt-6">
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
        
        {/* Step 7: Debt */}
        {step === 7 && (
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
        
        {/* Step 8: Goals */}
        {step === 8 && (
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
                        data.brokerageBalance + data.accounts529.reduce((sum, a) => sum + a.balance, 0) +
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
                        data.brokerageBalance + data.accounts529.reduce((sum, a) => sum + a.balance, 0) +
                        data.realEstateEquity + data.cryptoValue + data.businessEquity + data.otherAssets -
                        data.mortgageBalance - data.studentLoanBalance - data.autoLoanBalance - data.creditCardBalance - data.otherDebtBalance
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {data.children.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Family</p>
                    <div className="flex flex-wrap gap-2">
                      {data.children.map(child => (
                        <span key={child.id} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                          👶 {child.name || 'Unnamed'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
