'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

interface CashAccount {
  id: string;
  type: 'checking' | 'savings' | 'money_market' | 'cash';
  name: string;
  institution: string;
  balance: number;
}

// Retirement account types that support multiple accounts
interface TraditionalIRAAccount {
  id: string;
  name: string;
  institution: string;
  balance: number;
  holdings: Holding[];
}

interface RothIRAAccount {
  id: string;
  name: string;
  institution: string;
  balance: number;
  holdings: Holding[];
}

interface Account401k {
  id: string;
  name: string;
  employer: string;
  planProvider: string;
  balance: number;
  contributionMode: 'percent' | 'dollar';
  contribution: number;
  matchMode: 'percent' | 'dollar';
  match: number;
  holdingsMode: 'value' | 'percentage';
  holdings: Holding[];
  isActive: boolean; // Current employer vs old 401k
}

interface Roth401kAccount {
  id: string;
  name: string;
  employer: string;
  balance: number;
  holdings: Holding[];
}

interface HSAAccount {
  id: string;
  name: string;
  institution: string;
  balance: number;
  holdings: Holding[];
}

interface BrokerageAccount {
  id: string;
  name: string;
  institution: string;
  balance: number;
  holdingsMode: 'value' | 'percentage';
  holdings: Holding[];
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
  
  // Cash Accounts (array - supports multiple)
  cashAccounts: CashAccount[];
  
  // Retirement Accounts (arrays - support multiple of each type)
  traditionalIRAs: TraditionalIRAAccount[];
  rothIRAs: RothIRAAccount[];
  accounts401k: Account401k[];
  roth401ks: Roth401kAccount[];
  hsaAccounts: HSAAccount[];
  
  // Investment Accounts (arrays - support multiple)
  brokerageAccounts: BrokerageAccount[];
  
  // Legacy fields for backwards compatibility
  checkingAccountName: string;
  checkingInstitution: string;
  checkingBalance: number;
  savingsAccountName: string;
  savingsInstitution: string;
  savingsBalance: number;
  mmAccountName: string;
  mmInstitution: string;
  mmBalance: number;
  
  // Retirement Accounts
  has401k: boolean;
  account401kName: string;
  account401kBalance: number;
  account401kEmployer: string;
  account401kPlanProvider: string; // NEW: Fidelity, Vanguard, etc.
  account401kContributionMode: 'percent' | 'dollar';
  account401kContribution: number;
  account401kMatchMode: 'percent' | 'dollar';
  account401kMatch: number;
  account401kHoldingsMode: 'value' | 'percentage';
  account401kHoldings: Holding[];
  
  hasTraditionalIRA: boolean;
  traditionalIRAName: string;
  traditionalIRAInstitution: string;
  traditionalIRABalance: number;
  traditionalIRAHoldings: Holding[];
  
  hasRothIRA: boolean;
  rothIRAName: string;
  rothIRAInstitution: string;
  rothIRABalance: number;
  rothIRAHoldings: Holding[];
  
  hasRoth401k: boolean;
  roth401kName: string;
  roth401kBalance: number;
  roth401kHoldings: Holding[];
  
  hasHSA: boolean;
  hsaName: string;
  hsaInstitution: string;
  hsaBalance: number;
  hsaHoldings: Holding[];
  
  hasPension: boolean;
  pensionName: string;
  pensionValue: number;
  
  // Investment Accounts
  hasBrokerage: boolean;
  brokerageName: string;
  brokerageInstitution: string;
  brokerageBalance: number;
  brokerageHoldingsMode: 'value' | 'percentage';
  brokerageHoldings: Holding[];
  
  has529: boolean;
  accounts529: Array<{
    id: string;
    childId: string;
    childName: string;
    accountName: string;
    institution: string;
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
  
  // Meta
  lastStepCompleted: number;
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

// Search result type
interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange?: string;
}

// Holdings Entry Component with Search
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
  const { lookup, loading: priceLoading } = useTickerLookup();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Search as user types
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setLookupError('');
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (value.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    // Debounce search
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/stock-search?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setShowDropdown(true);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setSearching(false);
      }
    }, 300);
  };
  
  // Select a result from dropdown
  const selectResult = async (result: SearchResult) => {
    setShowDropdown(false);
    setSearchQuery('');
    setLookupError('');
    
    // Get the current price
    const priceData = await lookup(result.symbol);
    
    const newHolding: Holding = {
      ticker: result.symbol,
      name: result.name,
      shares: 0,
      costBasis: 0,
      currentPrice: priceData?.price || 0,
      currentValue: 0,
      allocationPercent: 0,
    };
    onChange([...holdings, newHolding]);
  };
  
  // Direct ticker entry (when pressing enter)
  const addDirectTicker = async () => {
    if (!searchQuery.trim()) return;
    
    setLookupError('');
    const result = await lookup(searchQuery);
    
    if (result) {
      const newHolding: Holding = {
        ticker: searchQuery.toUpperCase().trim(),
        name: result.name,
        shares: 0,
        costBasis: 0,
        currentPrice: result.price,
        currentValue: 0,
        allocationPercent: 0,
      };
      onChange([...holdings, newHolding]);
      setSearchQuery('');
      setShowDropdown(false);
    } else {
      setLookupError('Could not find that symbol. Try searching by name.');
    }
  };
  
  const updateHolding = (index: number, updates: Partial<Holding>) => {
    const updated = [...holdings];
    updated[index] = { ...updated[index], ...updates };
    
    // Recalculate based on what was changed
    if (mode === 'value') {
      // If currentValue was explicitly passed (user entered dollar amount), don't recalculate it
      if (updates.currentValue !== undefined) {
        // User entered dollar value - shares already calculated in onChange handler
      } else if (updates.shares !== undefined) {
        // User entered shares - calculate value
        updated[index].currentValue = updated[index].shares * updated[index].currentPrice;
      }
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
                {holding.ticker !== 'CASH' && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    ${holding.currentPrice?.toFixed(2)} per share
                  </div>
                )}
              </div>
              
              {mode === 'value' ? (
                holding.ticker === 'CASH' ? (
                  // Cash holdings - just enter dollar amount
                  <div className="w-32">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        value={holding.currentValue ? Math.round(holding.currentValue) : ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          updateHolding(i, { shares: value, currentValue: value });
                        }}
                        placeholder="Amount"
                        className="w-full pl-5 pr-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm focus:border-indigo-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  // Regular holdings - shares or value
                  <div className="flex items-center gap-1">
                    <div className="w-24">
                      <input
                        type="number"
                        value={holding.shares || ''}
                        onChange={(e) => updateHolding(i, { shares: parseFloat(e.target.value) || 0 })}
                        placeholder="Shares"
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm focus:border-indigo-500 outline-none font-mono"
                      />
                    </div>
                    <span className="text-gray-500 text-xs">or</span>
                    <div className="w-28">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          value={holding.currentValue ? Math.round(holding.currentValue) : ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            const shares = holding.currentPrice ? value / holding.currentPrice : 0;
                            updateHolding(i, { shares, currentValue: value });
                          }}
                          placeholder="Value"
                          className="w-full pl-5 pr-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm focus:border-indigo-500 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )
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
      
      {/* Add New Holding - Search by name or ticker */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (searchResults.length > 0) {
                    selectResult(searchResults[0]);
                  } else {
                    addDirectTicker();
                  }
                }
              }}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder="Search by name or ticker (e.g., 'Vanguard Total Stock' or 'VTI')"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="animate-spin text-gray-400">⏳</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={addDirectTicker}
            disabled={priceLoading || !searchQuery.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition flex items-center gap-2"
          >
            {priceLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>+ Add</>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              const cashHolding: Holding = {
                ticker: 'CASH',
                name: 'Cash',
                shares: 1,
                costBasis: 0,
                currentPrice: 1,
                currentValue: 0,
                allocationPercent: 0,
              };
              onChange([...holdings, cashHolding]);
            }}
            className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl transition flex items-center gap-2"
          >
            💵 Cash
          </button>
        </div>
        
        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {searchResults.map((result, i) => (
              <button
                key={`${result.symbol}-${i}`}
                type="button"
                onClick={() => selectResult(result)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition text-left border-b border-white/5 last:border-0"
              >
                <div className="w-12 text-center">
                  <span className="text-indigo-400 font-semibold">{result.symbol}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{result.name}</p>
                  <p className="text-xs text-gray-500">{result.type}{result.exchange ? ` • ${result.exchange}` : ''}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {lookupError && (
        <p className="text-red-400 text-sm">{lookupError}</p>
      )}
      
      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <p className="text-gray-500 text-xs">Type at least 2 characters to search...</p>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

const PROFILE_DRAFT_KEY = 'maven_profile_draft';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const { updateProfile, profile } = useUserProfile();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const defaultData: ProfileData = {
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
    // Cash accounts (array for multiple)
    cashAccounts: [],
    // Retirement accounts (arrays for multiple of each type)
    traditionalIRAs: [],
    rothIRAs: [],
    accounts401k: [],
    roth401ks: [],
    hsaAccounts: [],
    // Investment accounts (arrays for multiple)
    brokerageAccounts: [],
    // Legacy fields (for backwards compat)
    checkingAccountName: 'Checking Account',
    checkingInstitution: '',
    checkingBalance: 0,
    savingsAccountName: 'Savings Account',
    savingsInstitution: '',
    savingsBalance: 0,
    mmAccountName: 'Money Market',
    mmInstitution: '',
    mmBalance: 0,
    // Retirement
    has401k: false,
    account401kName: '401(k)',
    account401kBalance: 0,
    account401kEmployer: '',
    account401kPlanProvider: '',
    account401kContributionMode: 'percent',
    account401kContribution: 0,
    account401kMatchMode: 'percent',
    account401kMatch: 0,
    account401kHoldingsMode: 'value',
    account401kHoldings: [],
    hasTraditionalIRA: false,
    traditionalIRAName: 'Traditional IRA',
    traditionalIRAInstitution: '',
    traditionalIRABalance: 0,
    traditionalIRAHoldings: [],
    hasRothIRA: false,
    rothIRAName: 'Roth IRA',
    rothIRAInstitution: '',
    rothIRABalance: 0,
    rothIRAHoldings: [],
    hasRoth401k: false,
    roth401kName: 'Roth 401(k)',
    roth401kBalance: 0,
    roth401kHoldings: [],
    hasHSA: false,
    hsaName: 'HSA',
    hsaInstitution: '',
    hsaBalance: 0,
    hsaHoldings: [],
    hasPension: false,
    pensionName: 'Pension',
    pensionValue: 0,
    // Investment
    hasBrokerage: false,
    brokerageName: 'Brokerage Account',
    brokerageInstitution: '',
    brokerageBalance: 0,
    brokerageHoldingsMode: 'value',
    brokerageHoldings: [],
    has529: false,
    accounts529: [],
    // Other
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
    lastStepCompleted: 0,
  };
  
  const [data, setData] = useState<ProfileData>(defaultData);
  
  // Load saved draft from localStorage on mount, OR from existing profile
  useEffect(() => {
    if (typeof window !== 'undefined' && !loaded) {
      // First, check for a saved draft (in-progress form)
      const savedDraft = localStorage.getItem(PROFILE_DRAFT_KEY);
      let loadedStep = 0;
      let loadedData: Partial<ProfileData> = {};
      
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          loadedData = parsed;
          loadedStep = parsed.lastStepCompleted || 0;
          console.log('[Profile Setup] Loaded draft, last step:', loadedStep);
        } catch (e) {
          console.error('Failed to parse saved draft:', e);
        }
      }
      
      // If we have an existing profile from UserProvider, use that data too
      // This handles the case where user already completed profile but wants to edit
      if (profile && profile.firstName) {
        console.log('[Profile Setup] Found existing profile');
        // Map profile data to form data
        loadedData = {
          ...loadedData,
          firstName: loadedData.firstName || profile.firstName || '',
          lastName: loadedData.lastName || profile.lastName || '',
          dateOfBirth: loadedData.dateOfBirth || profile.dateOfBirth || '',
          state: loadedData.state || profile.state || '',
          filingStatus: loadedData.filingStatus || profile.filingStatus || '',
          // If they have accounts, they've completed profile before
          ...(profile.cashAccounts?.length > 0 || profile.retirementAccounts?.length > 0 
            ? { lastStepCompleted: Math.max(loadedStep, 7) } 
            : {}),
        };
        loadedStep = loadedData.lastStepCompleted || loadedStep;
      }
      
      // Apply loaded data
      if (Object.keys(loadedData).length > 0) {
        setData(prev => ({ ...prev, ...loadedData }));
      }
      
      // Set step AFTER a short delay to ensure state is updated
      if (loadedStep > 0) {
        setTimeout(() => {
          const targetStep = Math.min(loadedStep + 1, 8);
          console.log('[Profile Setup] Resuming at step:', targetStep);
          setStep(targetStep);
        }, 50);
      }
      
      setLoaded(true);
    }
  }, [loaded, profile]);
  
  // Pre-fill from Clerk user data (only if not already filled)
  useEffect(() => {
    if (user && loaded) {
      setData(prev => ({
        ...prev,
        firstName: prev.firstName || user.firstName || '',
        lastName: prev.lastName || user.lastName || '',
      }));
    }
  }, [user, loaded]);
  
  // Auto-save draft to localStorage when data changes (debounced)
  useEffect(() => {
    if (loaded && typeof window !== 'undefined') {
      // Use a small timeout to debounce rapid changes
      const timer = setTimeout(() => {
        localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(data));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data, loaded]);
  
  // Save step completion
  const completeStep = (stepNum: number) => {
    setData(prev => ({
      ...prev,
      lastStepCompleted: Math.max(prev.lastStepCompleted, stepNum),
    }));
  };
  
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
      accountName: `529 Plan - ${child.name}`,
      institution: '',
      balance: 0,
      holdings: [] as Holding[],
    };
    update({ accounts529: [...data.accounts529, new529] });
  };
  
  const update529 = (id: string, updates: Partial<typeof data.accounts529[0]>) => {
    update({
      accounts529: data.accounts529.map(a => a.id === id ? { ...a, ...updates } : a),
    });
  };
  
  // Traditional IRA management
  const addTraditionalIRA = () => {
    const newIRA: TraditionalIRAAccount = {
      id: crypto.randomUUID(),
      name: `Traditional IRA ${data.traditionalIRAs.length + 1}`,
      institution: '',
      balance: 0,
      holdings: [],
    };
    update({ traditionalIRAs: [...data.traditionalIRAs, newIRA] });
  };
  
  const updateTraditionalIRA = (id: string, updates: Partial<TraditionalIRAAccount>) => {
    update({
      traditionalIRAs: data.traditionalIRAs.map(a => a.id === id ? { ...a, ...updates } : a),
    });
  };
  
  const removeTraditionalIRA = (id: string) => {
    update({ traditionalIRAs: data.traditionalIRAs.filter(a => a.id !== id) });
  };
  
  // Roth IRA management
  const addRothIRA = () => {
    const newIRA: RothIRAAccount = {
      id: crypto.randomUUID(),
      name: `Roth IRA ${data.rothIRAs.length + 1}`,
      institution: '',
      balance: 0,
      holdings: [],
    };
    update({ rothIRAs: [...data.rothIRAs, newIRA] });
  };
  
  const updateRothIRA = (id: string, updates: Partial<RothIRAAccount>) => {
    update({
      rothIRAs: data.rothIRAs.map(a => a.id === id ? { ...a, ...updates } : a),
    });
  };
  
  const removeRothIRA = (id: string) => {
    update({ rothIRAs: data.rothIRAs.filter(a => a.id !== id) });
  };
  
  // 401(k) management
  const add401k = () => {
    const new401k: Account401k = {
      id: crypto.randomUUID(),
      name: `401(k) ${data.accounts401k.length + 1}`,
      employer: '',
      planProvider: '',
      balance: 0,
      contributionMode: 'percent',
      contribution: 0,
      matchMode: 'percent',
      match: 0,
      holdingsMode: 'value',
      holdings: [],
      isActive: data.accounts401k.length === 0, // First one is active by default
    };
    update({ accounts401k: [...data.accounts401k, new401k] });
  };
  
  const update401k = (id: string, updates: Partial<Account401k>) => {
    update({
      accounts401k: data.accounts401k.map(a => a.id === id ? { ...a, ...updates } : a),
    });
  };
  
  const remove401k = (id: string) => {
    update({ accounts401k: data.accounts401k.filter(a => a.id !== id) });
  };
  
  // HSA management
  const addHSA = () => {
    const newHSA: HSAAccount = {
      id: crypto.randomUUID(),
      name: `HSA ${data.hsaAccounts.length + 1}`,
      institution: '',
      balance: 0,
      holdings: [],
    };
    update({ hsaAccounts: [...data.hsaAccounts, newHSA] });
  };
  
  const updateHSA = (id: string, updates: Partial<HSAAccount>) => {
    update({
      hsaAccounts: data.hsaAccounts.map(a => a.id === id ? { ...a, ...updates } : a),
    });
  };
  
  const removeHSA = (id: string) => {
    update({ hsaAccounts: data.hsaAccounts.filter(a => a.id !== id) });
  };
  
  // Brokerage management
  const addBrokerage = () => {
    const newBrokerage: BrokerageAccount = {
      id: crypto.randomUUID(),
      name: `Brokerage ${data.brokerageAccounts.length + 1}`,
      institution: '',
      balance: 0,
      holdingsMode: 'value',
      holdings: [],
    };
    update({ brokerageAccounts: [...data.brokerageAccounts, newBrokerage] });
  };
  
  const updateBrokerage = (id: string, updates: Partial<BrokerageAccount>) => {
    update({
      brokerageAccounts: data.brokerageAccounts.map(a => a.id === id ? { ...a, ...updates } : a),
    });
  };
  
  const removeBrokerage = (id: string) => {
    update({ brokerageAccounts: data.brokerageAccounts.filter(a => a.id !== id) });
  };
  
  const handleComplete = async () => {
    setSaving(true);
    
    try {
      // Build the profile object for UserProvider
      // Use the new cashAccounts array if it has items, otherwise fall back to legacy fields
      const cashAccountsOutput = data.cashAccounts.length > 0
        ? data.cashAccounts.map(acc => ({
            id: acc.id,
            name: acc.name || (acc.type === 'checking' ? 'Checking' : acc.type === 'savings' ? 'Savings' : 'Money Market'),
            institution: acc.institution || 'Bank',
            balance: acc.balance,
            type: (acc.type === 'checking' ? 'Checking' : acc.type === 'savings' ? 'Savings' : 'Money Market') as 'Checking' | 'Savings' | 'Money Market',
          }))
        : [
            // Legacy fields support
            ...(data.checkingBalance > 0 ? [{
              id: 'checking-1',
              name: data.checkingAccountName || 'Checking Account',
              institution: data.checkingInstitution || 'Bank',
              balance: data.checkingBalance,
              type: 'Checking' as const,
            }] : []),
            ...(data.savingsBalance > 0 ? [{
              id: 'savings-1',
              name: data.savingsAccountName || 'Savings Account',
              institution: data.savingsInstitution || 'Bank',
              balance: data.savingsBalance,
              type: 'Savings' as const,
            }] : []),
            ...(data.mmBalance > 0 ? [{
              id: 'mm-1',
              name: data.mmAccountName || 'Money Market',
              institution: data.mmInstitution || 'Bank',
              balance: data.mmBalance,
              type: 'Money Market' as const,
            }] : []),
          ];
      
      const retirementAccounts = [];
      if (data.has401k && data.account401kBalance > 0) {
        retirementAccounts.push({
          id: '401k-1',
          name: data.account401kName || '401(k)',
          institution: data.account401kPlanProvider || data.account401kEmployer || 'Employer',
          balance: data.account401kBalance,
          type: '401(k)' as const,
          employer: data.account401kEmployer,
          planProvider: data.account401kPlanProvider,
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
          name: data.roth401kName || 'Roth 401(k)',
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
      // Traditional IRAs (new array format takes priority)
      if (data.traditionalIRAs.length > 0) {
        for (const ira of data.traditionalIRAs) {
          if (ira.balance > 0) {
            retirementAccounts.push({
              id: ira.id,
              name: ira.name || 'Traditional IRA',
              institution: ira.institution || 'Brokerage',
              balance: ira.balance,
              type: 'Traditional IRA' as const,
              holdings: ira.holdings.map(h => ({
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
      } else if (data.hasTraditionalIRA && data.traditionalIRABalance > 0) {
        // Legacy fallback
        retirementAccounts.push({
          id: 'trad-ira-1',
          name: data.traditionalIRAName || 'Traditional IRA',
          institution: data.traditionalIRAInstitution || 'Brokerage',
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
      
      // Roth IRAs (new array format takes priority)
      if (data.rothIRAs.length > 0) {
        for (const ira of data.rothIRAs) {
          if (ira.balance > 0) {
            retirementAccounts.push({
              id: ira.id,
              name: ira.name || 'Roth IRA',
              institution: ira.institution || 'Brokerage',
              balance: ira.balance,
              type: 'Roth IRA' as const,
              holdings: ira.holdings.map(h => ({
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
      } else if (data.hasRothIRA && data.rothIRABalance > 0) {
        // Legacy fallback
        retirementAccounts.push({
          id: 'roth-ira-1',
          name: data.rothIRAName || 'Roth IRA',
          institution: data.rothIRAInstitution || 'Brokerage',
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
      
      // HSA accounts (new array format takes priority)
      if (data.hsaAccounts.length > 0) {
        for (const hsa of data.hsaAccounts) {
          if (hsa.balance > 0) {
            retirementAccounts.push({
              id: hsa.id,
              name: hsa.name || 'HSA',
              institution: hsa.institution || 'HSA Provider',
              balance: hsa.balance,
              type: 'HSA' as const,
              holdings: hsa.holdings.map(h => ({
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
      } else if (data.hasHSA && data.hsaBalance > 0) {
        // Legacy fallback
        retirementAccounts.push({
          id: 'hsa-1',
          name: data.hsaName || 'HSA',
          institution: data.hsaInstitution || 'HSA Provider',
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
          name: data.pensionName || 'Pension',
          institution: data.account401kEmployer || 'Employer',
          balance: data.pensionValue,
          type: 'Pension' as const,
          holdings: [],
        });
      }
      
      const investmentAccounts = [];
      // Brokerage accounts (new array format takes priority)
      if (data.brokerageAccounts.length > 0) {
        for (const account of data.brokerageAccounts) {
          if (account.balance > 0) {
            investmentAccounts.push({
              id: account.id,
              name: account.name || 'Brokerage Account',
              institution: account.institution || 'Brokerage',
              balance: account.balance,
              type: 'Individual' as const,
              holdingsMode: account.holdingsMode,
              holdings: account.holdings.map(h => ({
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
      } else if (data.hasBrokerage && data.brokerageBalance > 0) {
        // Legacy fallback
        investmentAccounts.push({
          id: 'brokerage-1',
          name: data.brokerageName || 'Brokerage Account',
          institution: data.brokerageInstitution || 'Brokerage',
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
            name: acc529.accountName || `529 Plan - ${acc529.childName}`,
            institution: acc529.institution || '529 Provider',
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
        cashAccounts: cashAccountsOutput,
        retirementAccounts,
        investmentAccounts,
        realEstateEquity: data.realEstateEquity,
        cryptoValue: data.cryptoValue,
        businessEquity: data.businessEquity,
        otherAssets: data.otherAssets,
        liabilities,
        onboardingComplete: true,
        lastUpdated: new Date().toISOString(),
        // Store children for Family tab
        socialSecurity: {
          ...profile?.socialSecurity,
          // @ts-ignore - extending for children data
          children: data.children,
        },
      });
      
      // Clear the draft since we've saved successfully
      if (typeof window !== 'undefined') {
        localStorage.removeItem(PROFILE_DRAFT_KEY);
      }
      
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
              <p className="text-gray-400">Add all your bank accounts for a complete picture</p>
            </div>
            
            <div className="space-y-4">
              {/* Dynamic Cash Accounts */}
              {data.cashAccounts.map((account, index) => (
                <div key={account.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-white flex items-center gap-2">
                      {account.type === 'checking' && '💳'}
                      {account.type === 'savings' && '🏦'}
                      {account.type === 'money_market' && '💵'}
                      {account.type === 'cash' && '💰'}
                      {account.type === 'checking' ? 'Checking' : account.type === 'savings' ? 'Savings' : account.type === 'money_market' ? 'Money Market' : 'Cash'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        update({ cashAccounts: data.cashAccounts.filter(a => a.id !== account.id) });
                      }}
                      className="text-gray-500 hover:text-red-400 transition text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Account Name</label>
                        <input
                          type="text"
                          value={account.name}
                          onChange={(e) => {
                            const updated = [...data.cashAccounts];
                            updated[index] = { ...updated[index], name: e.target.value };
                            update({ cashAccounts: updated });
                          }}
                          placeholder="e.g., Chase Checking"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Bank / Institution</label>
                        <input
                          type="text"
                          value={account.institution}
                          onChange={(e) => {
                            const updated = [...data.cashAccounts];
                            updated[index] = { ...updated[index], institution: e.target.value };
                            update({ cashAccounts: updated });
                          }}
                          placeholder="e.g., Chase, Wells Fargo"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Current Balance</label>
                      <CurrencyInput 
                        value={account.balance} 
                        onChange={(v) => {
                          const updated = [...data.cashAccounts];
                          updated[index] = { ...updated[index], balance: v };
                          update({ cashAccounts: updated });
                        }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add Account Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    update({ 
                      cashAccounts: [...data.cashAccounts, {
                        id: crypto.randomUUID(),
                        type: 'checking',
                        name: '',
                        institution: '',
                        balance: 0,
                      }]
                    });
                  }}
                  className="p-3 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition flex flex-col items-center gap-1"
                >
                  <span className="text-lg">💳</span>
                  <span className="text-xs">+ Checking</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    update({ 
                      cashAccounts: [...data.cashAccounts, {
                        id: crypto.randomUUID(),
                        type: 'savings',
                        name: '',
                        institution: '',
                        balance: 0,
                      }]
                    });
                  }}
                  className="p-3 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition flex flex-col items-center gap-1"
                >
                  <span className="text-lg">🏦</span>
                  <span className="text-xs">+ Savings</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    update({ 
                      cashAccounts: [...data.cashAccounts, {
                        id: crypto.randomUUID(),
                        type: 'money_market',
                        name: '',
                        institution: '',
                        balance: 0,
                      }]
                    });
                  }}
                  className="p-3 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition flex flex-col items-center gap-1"
                >
                  <span className="text-lg">💵</span>
                  <span className="text-xs">+ Money Market</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    update({ 
                      cashAccounts: [...data.cashAccounts, {
                        id: crypto.randomUUID(),
                        type: 'cash',
                        name: '',
                        institution: '',
                        balance: 0,
                      }]
                    });
                  }}
                  className="p-3 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition flex flex-col items-center gap-1"
                >
                  <span className="text-lg">💰</span>
                  <span className="text-xs">+ Cash</span>
                </button>
              </div>
              
              {data.cashAccounts.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">
                  Click above to add your first account
                </p>
              )}
              
              {/* Total */}
              {data.cashAccounts.length > 0 && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300 font-medium">Total Cash</span>
                    <span className="text-2xl font-bold text-white">
                      ${data.cashAccounts.reduce((sum, a) => sum + (a.balance || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
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
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                    <CurrencyInput value={data.account401kBalance} onChange={(v) => update({ account401kBalance: v })} />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Employer Name</label>
                      <input
                        type="text"
                        value={data.account401kEmployer}
                        onChange={(e) => update({ account401kEmployer: e.target.value })}
                        placeholder="e.g., Capital Group, Google"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Plan Provider</label>
                      <input
                        type="text"
                        value={data.account401kPlanProvider}
                        onChange={(e) => update({ account401kPlanProvider: e.target.value })}
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
                          { value: 'percent', label: '% of Salary' },
                          { value: 'dollar', label: '$ per Year' },
                        ]}
                      />
                    </div>
                    {data.account401kContributionMode === 'percent' ? (
                      <PercentInput 
                        value={data.account401kContribution} 
                        onChange={(v) => update({ account401kContribution: v })} 
                        placeholder="e.g., 10"
                      />
                    ) : (
                      <CurrencyInput 
                        value={data.account401kContribution} 
                        onChange={(v) => update({ account401kContribution: v })} 
                        placeholder="e.g., 23,000"
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {data.account401kContributionMode === 'dollar' 
                        ? '2024 max: $23,000 ($30,500 if 50+)' 
                        : 'Enter the percentage of your salary you contribute'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-400">Employer Match</label>
                      <ModeToggle 
                        mode={data.account401kMatchMode}
                        onChange={(v) => update({ account401kMatchMode: v as 'percent' | 'dollar' })}
                        options={[
                          { value: 'percent', label: '% Match' },
                          { value: 'dollar', label: '$ per Year' },
                        ]}
                      />
                    </div>
                    {data.account401kMatchMode === 'percent' ? (
                      <PercentInput 
                        value={data.account401kMatch} 
                        onChange={(v) => update({ account401kMatch: v })} 
                        placeholder="e.g., 4"
                      />
                    ) : (
                      <CurrencyInput 
                        value={data.account401kMatch} 
                        onChange={(v) => update({ account401kMatch: v })} 
                        placeholder="e.g., 6,000"
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {data.account401kMatchMode === 'dollar' 
                        ? 'Total employer contribution per year' 
                        : 'What percentage of your salary does your employer match?'}
                    </p>
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
              
              {/* Traditional IRAs - Multiple Accounts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📜</span>
                    <div>
                      <h4 className="text-white font-medium">Traditional IRA</h4>
                      <p className="text-sm text-gray-500">Individual retirement account (pre-tax)</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addTraditionalIRA}
                    className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                  >
                    + Add Account
                  </button>
                </div>
                
                {data.traditionalIRAs.map((ira, index) => (
                  <div key={ira.id} className="ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-indigo-400 font-medium">Account {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeTraditionalIRA(ira.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Account Name</label>
                        <input
                          type="text"
                          value={ira.name}
                          onChange={(e) => updateTraditionalIRA(ira.id, { name: e.target.value })}
                          placeholder="e.g., Traditional IRA - Merrill"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Institution</label>
                        <input
                          type="text"
                          value={ira.institution}
                          onChange={(e) => updateTraditionalIRA(ira.id, { institution: e.target.value })}
                          placeholder="e.g., Merrill Lynch, Alto IRA"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                      <CurrencyInput value={ira.balance} onChange={(v) => updateTraditionalIRA(ira.id, { balance: v })} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Holdings</label>
                      <HoldingsEntry
                        holdings={ira.holdings}
                        onChange={(h) => updateTraditionalIRA(ira.id, { holdings: h })}
                        mode="value"
                        accountBalance={ira.balance}
                        showModeToggle={false}
                      />
                    </div>
                  </div>
                ))}
                
                {data.traditionalIRAs.length === 0 && (
                  <p className="text-sm text-gray-500 italic ml-4">No Traditional IRA accounts added yet</p>
                )}
              </div>
              
              {/* Roth IRAs - Multiple Accounts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💎</span>
                    <div>
                      <h4 className="text-white font-medium">Roth IRA</h4>
                      <p className="text-sm text-gray-500">Individual retirement account (after-tax)</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addRothIRA}
                    className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                  >
                    + Add Account
                  </button>
                </div>
                
                {data.rothIRAs.map((ira, index) => (
                  <div key={ira.id} className="ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-indigo-400 font-medium">Account {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeRothIRA(ira.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Account Name</label>
                        <input
                          type="text"
                          value={ira.name}
                          onChange={(e) => updateRothIRA(ira.id, { name: e.target.value })}
                          placeholder="e.g., Roth IRA - Fidelity"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Institution</label>
                        <input
                          type="text"
                          value={ira.institution}
                          onChange={(e) => updateRothIRA(ira.id, { institution: e.target.value })}
                          placeholder="e.g., Fidelity, Alto IRA"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                      <CurrencyInput value={ira.balance} onChange={(v) => updateRothIRA(ira.id, { balance: v })} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Holdings</label>
                      <HoldingsEntry
                        holdings={ira.holdings}
                        onChange={(h) => updateRothIRA(ira.id, { holdings: h })}
                        mode="value"
                        accountBalance={ira.balance}
                        showModeToggle={false}
                      />
                    </div>
                  </div>
                ))}
                
                {data.rothIRAs.length === 0 && (
                  <p className="text-sm text-gray-500 italic ml-4">No Roth IRA accounts added yet</p>
                )}
              </div>
              
              {/* HSA Accounts - Multiple */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏥</span>
                    <div>
                      <h4 className="text-white font-medium">HSA</h4>
                      <p className="text-sm text-gray-500">Health Savings Account</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addHSA}
                    className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                  >
                    + Add Account
                  </button>
                </div>
                
                {data.hsaAccounts.map((hsa, index) => (
                  <div key={hsa.id} className="ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-indigo-400 font-medium">Account {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeHSA(hsa.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Account Name</label>
                        <input
                          type="text"
                          value={hsa.name}
                          onChange={(e) => updateHSA(hsa.id, { name: e.target.value })}
                          placeholder="e.g., HSA - Fidelity"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Institution</label>
                        <input
                          type="text"
                          value={hsa.institution}
                          onChange={(e) => updateHSA(hsa.id, { institution: e.target.value })}
                          placeholder="e.g., Fidelity, HealthEquity"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
                      <CurrencyInput value={hsa.balance} onChange={(v) => updateHSA(hsa.id, { balance: v })} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Holdings</label>
                      <HoldingsEntry
                        holdings={hsa.holdings}
                        onChange={(h) => updateHSA(hsa.id, { holdings: h })}
                        mode="value"
                        accountBalance={hsa.balance}
                        showModeToggle={false}
                      />
                    </div>
                  </div>
                ))}
                
                {data.hsaAccounts.length === 0 && (
                  <p className="text-sm text-gray-500 italic ml-4">No HSA accounts added yet</p>
                )}
              </div>
              
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
              {/* Brokerage Accounts - Multiple */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h4 className="text-white font-medium">Brokerage Account</h4>
                      <p className="text-sm text-gray-500">Taxable investment account</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addBrokerage}
                    className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                  >
                    + Add Account
                  </button>
                </div>
                
                {data.brokerageAccounts.map((account, index) => (
                  <div key={account.id} className="ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-indigo-400 font-medium">Account {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeBrokerage(account.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Account Name</label>
                        <input
                          type="text"
                          value={account.name}
                          onChange={(e) => updateBrokerage(account.id, { name: e.target.value })}
                          placeholder="e.g., Joint Brokerage"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Institution</label>
                        <input
                          type="text"
                          value={account.institution}
                          onChange={(e) => updateBrokerage(account.id, { institution: e.target.value })}
                          placeholder="e.g., Schwab, Fidelity"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Total Value</label>
                      <CurrencyInput value={account.balance} onChange={(v) => updateBrokerage(account.id, { balance: v })} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Holdings</label>
                      <HoldingsEntry
                        holdings={account.holdings}
                        onChange={(h) => updateBrokerage(account.id, { holdings: h })}
                        mode={account.holdingsMode}
                        onModeChange={(m) => updateBrokerage(account.id, { holdingsMode: m })}
                        accountBalance={account.balance}
                      />
                    </div>
                  </div>
                ))}
                
                {data.brokerageAccounts.length === 0 && (
                  <p className="text-sm text-gray-500 italic ml-4">No brokerage accounts added yet</p>
                )}
              </div>
              
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
              onClick={() => {
                completeStep(step);
                setStep(step + 1);
              }}
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
