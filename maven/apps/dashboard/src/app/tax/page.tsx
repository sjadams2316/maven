'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import ProgressRing from '../components/ProgressRing';
import { useUserProfile } from '@/providers/UserProvider';
import { useLiveFinancials } from '@/hooks/useLivePrices';

interface TaxScenario {
  name: string;
  savings: number;
  description: string;
  difficulty: 'easy' | 'medium' | 'complex';
}

/**
 * Parse householdIncome string to a usable number
 * Examples: "$200,000 - $500,000" → 350000, "$100,000 - $200,000" → 150000
 */
function parseIncomeRange(incomeString: string): number {
  if (!incomeString) return 250000; // Default
  
  // Extract numbers from the string
  const numbers = incomeString.match(/[\d,]+/g);
  if (!numbers || numbers.length === 0) return 250000;
  
  // Parse numbers (remove commas)
  const parsedNumbers = numbers.map(n => parseInt(n.replace(/,/g, ''), 10));
  
  // If it's a range, return the midpoint
  if (parsedNumbers.length >= 2) {
    return Math.round((parsedNumbers[0] + parsedNumbers[1]) / 2);
  }
  
  return parsedNumbers[0] || 250000;
}

const TAX_SCENARIOS: TaxScenario[] = [
  {
    name: 'Max 401(k) contributions',
    savings: 7700,
    description: 'Increase 401(k) to $23,000 max',
    difficulty: 'easy',
  },
  {
    name: 'Backdoor Roth IRA',
    savings: 2400,
    description: 'Convert after-tax IRA contributions',
    difficulty: 'medium',
  },
  {
    name: 'Tax-loss harvesting',
    savings: 3200,
    description: 'Realize $10K in losses to offset gains',
    difficulty: 'medium',
  },
  {
    name: 'Charitable giving strategy',
    savings: 5500,
    description: 'Bunch donations via Donor Advised Fund',
    difficulty: 'complex',
  },
  {
    name: 'HSA contributions',
    savings: 2100,
    description: 'Max family HSA at $8,300',
    difficulty: 'easy',
  },
];

const BRACKETS_2026 = [
  { rate: 10, min: 0, max: 23200 },
  { rate: 12, min: 23200, max: 94300 },
  { rate: 22, min: 94300, max: 201050 },
  { rate: 24, min: 201050, max: 383900 },
  { rate: 32, min: 383900, max: 487450 },
  { rate: 35, min: 487450, max: 731200 },
  { rate: 37, min: 731200, max: Infinity },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function calculateTax(taxableIncome: number): number {
  let tax = 0;
  let remaining = taxableIncome;
  
  for (const bracket of BRACKETS_2026) {
    const bracketIncome = Math.min(remaining, bracket.max - bracket.min);
    if (bracketIncome <= 0) break;
    
    tax += bracketIncome * (bracket.rate / 100);
    remaining -= bracketIncome;
  }
  
  return tax;
}

function getMarginalRate(taxableIncome: number): number {
  for (const bracket of [...BRACKETS_2026].reverse()) {
    if (taxableIncome > bracket.min) {
      return bracket.rate;
    }
  }
  return 10;
}

export default function TaxPage() {
  const { profile, isLoading, isDemoMode } = useUserProfile();
  // Use live financials to ensure current prices are reflected
  const { financials } = useLiveFinancials(profile, isDemoMode);
  
  // Initialize with defaults, will be updated from profile
  const [grossIncome, setGrossIncome] = useState(250000);
  const [deductions, setDeductions] = useState(30000);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  
  // Update from profile when available
  useEffect(() => {
    if (!profile) return;
    
    // Parse income from profile
    const parsedIncome = parseIncomeRange(profile.householdIncome);
    setGrossIncome(parsedIncome);
    
    // Estimate deductions based on filing status
    // Standard deduction 2026 (estimated): MFJ ~$32K, Single ~$16K
    const standardDeduction = profile.filingStatus === 'Married Filing Jointly' ? 32000 :
                              profile.filingStatus === 'Head of Household' ? 24000 : 16000;
    
    // If high income, likely itemizing - estimate higher deductions
    if (parsedIncome > 200000) {
      // Estimate itemized: SALT cap ($10K) + mortgage interest + charity
      // Rough estimate: 12-15% of income for high earners
      const estimatedItemized = Math.min(parsedIncome * 0.12, 80000);
      setDeductions(Math.max(standardDeduction, estimatedItemized));
    } else {
      setDeductions(standardDeduction);
    }
  }, [profile]);
  
  const taxableIncome = grossIncome - deductions;
  const estimatedTax = calculateTax(taxableIncome);
  const effectiveRate = (estimatedTax / grossIncome) * 100;
  const marginalRate = getMarginalRate(taxableIncome);
  
  const scenarioSavings = selectedScenarios.reduce((sum, name) => {
    const scenario = TAX_SCENARIOS.find(s => s.name === name);
    return sum + (scenario?.savings || 0);
  }, 0);
  
  const optimizedTax = estimatedTax - scenarioSavings;
  const optimizedEffectiveRate = (optimizedTax / grossIncome) * 100;
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Tax Planning</h1>
            {isDemoMode && (
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                Demo Data
              </span>
            )}
          </div>
          <p className="text-gray-400 mt-1">Optimize your tax strategy for 2026</p>
        </div>
        
        {/* Summary */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Gross Income</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(grossIncome)}</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Taxable Income</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(taxableIncome)}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
            <p className="text-red-300 text-sm mb-1">Estimated Tax</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(estimatedTax)}</p>
            <p className="text-xs text-red-400 mt-1">{effectiveRate.toFixed(1)}% effective</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Marginal Rate</p>
            <p className="text-2xl font-bold text-white">{marginalRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Federal bracket</p>
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tax Bracket Visualization */}
          <div className="lg:col-span-2 bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tax Brackets</h3>
            
            <div className="space-y-3">
              {BRACKETS_2026.slice(0, 6).map((bracket, idx) => {
                const bracketWidth = Math.min(bracket.max, taxableIncome) - bracket.min;
                const pctFilled = taxableIncome > bracket.min
                  ? Math.min(100, ((Math.min(taxableIncome, bracket.max) - bracket.min) / (bracket.max - bracket.min)) * 100)
                  : 0;
                const inThisBracket = taxableIncome > bracket.min && taxableIncome <= bracket.max;
                
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${inThisBracket ? 'text-indigo-400' : 'text-white'}`}>
                          {bracket.rate}%
                        </span>
                        {inThisBracket && (
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                            Your bracket
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500">
                        {formatCurrency(bracket.min)} — {bracket.max === Infinity ? '∞' : formatCurrency(bracket.max)}
                      </span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pctFilled > 0 
                            ? inThisBracket ? 'bg-indigo-500' : 'bg-indigo-600/50'
                            : ''
                        }`}
                        style={{ width: `${pctFilled}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Optimization Ring */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-white mb-4">Potential Savings</h3>
            
            <ProgressRing
              progress={scenarioSavings > 0 ? (scenarioSavings / estimatedTax) * 100 : 0}
              size={160}
              strokeWidth={16}
              color="gradient"
              label="Savings"
              sublabel={formatCurrency(scenarioSavings)}
              animated={true}
              glowing={scenarioSavings > 0}
            />
            
            {scenarioSavings > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                  Optimized effective rate: <span className="text-emerald-400">{optimizedEffectiveRate.toFixed(1)}%</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Down from {effectiveRate.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Tax Optimization Strategies */}
        <div className="mt-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Optimization Strategies</h3>
            <span className="text-sm text-gray-400">
              Select strategies to see impact
            </span>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TAX_SCENARIOS.map((scenario) => {
              const isSelected = selectedScenarios.includes(scenario.name);
              
              return (
                <button
                  key={scenario.name}
                  onClick={() => {
                    setSelectedScenarios(prev =>
                      isSelected
                        ? prev.filter(n => n !== scenario.name)
                        : [...prev, scenario.name]
                    );
                  }}
                  className={`p-4 rounded-xl text-left transition ${
                    isSelected
                      ? 'bg-emerald-500/20 border border-emerald-500/50'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className={`font-medium ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                      {scenario.name}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      scenario.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                      scenario.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {scenario.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{scenario.description}</p>
                  <p className={`text-lg font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                    Save {formatCurrency(scenario.savings)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Action Items */}
        {selectedScenarios.length > 0 && (
          <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
            <h4 className="font-medium text-white mb-3">📋 Your Tax Action Plan</h4>
            <ul className="space-y-2">
              {selectedScenarios.map((name) => {
                const scenario = TAX_SCENARIOS.find(s => s.name === name);
                return (
                  <li key={name} className="flex items-center gap-2 text-sm text-emerald-200/80">
                    <span className="text-emerald-400">✓</span>
                    {scenario?.description} — Save {formatCurrency(scenario?.savings || 0)}
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 pt-4 border-t border-emerald-500/30 flex items-center justify-between">
              <span className="text-white font-medium">Total potential savings</span>
              <span className="text-2xl font-bold text-emerald-400">{formatCurrency(scenarioSavings)}</span>
            </div>
          </div>
        )}
        
        {/* Quarterly Estimates */}
        <div className="mt-8 bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quarterly Estimated Payments</h3>
          
          <div className="grid sm:grid-cols-4 gap-4">
            {['Q1 (Apr 15)', 'Q2 (Jun 15)', 'Q3 (Sep 15)', 'Q4 (Jan 15)'].map((quarter, idx) => {
              const quarterlyAmount = (estimatedTax - scenarioSavings) / 4;
              const isPast = idx < 1;
              
              return (
                <div key={quarter} className={`p-4 rounded-xl ${
                  isPast ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-white/5'
                }`}>
                  <p className="text-sm text-gray-400 mb-1">{quarter}</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(quarterlyAmount)}</p>
                  {isPast && (
                    <span className="text-xs text-emerald-400">✓ Paid</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
