'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface InsurancePolicy {
  id: string;
  type: 'life' | 'disability' | 'umbrella' | 'auto' | 'home';
  provider: string;
  coverage: number;
  premium: number;
  frequency: 'monthly' | 'annually';
  expirationDate?: Date;
  beneficiary?: string;
}

const MOCK_POLICIES: InsurancePolicy[] = [
  {
    id: '1',
    type: 'life',
    provider: 'Northwestern Mutual',
    coverage: 1000000,
    premium: 85,
    frequency: 'monthly',
    beneficiary: 'Sammie Adams',
  },
  {
    id: '2',
    type: 'disability',
    provider: 'Capital Group (Employer)',
    coverage: 180000,
    premium: 0,
    frequency: 'monthly',
  },
  {
    id: '3',
    type: 'umbrella',
    provider: 'USAA',
    coverage: 1000000,
    premium: 350,
    frequency: 'annually',
  },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  life: { icon: '❤️', color: 'from-red-500 to-rose-500', label: 'Life Insurance' },
  disability: { icon: '🛡️', color: 'from-blue-500 to-cyan-500', label: 'Disability Insurance' },
  umbrella: { icon: '☂️', color: 'from-purple-500 to-pink-500', label: 'Umbrella Policy' },
  auto: { icon: '🚗', color: 'from-emerald-500 to-teal-500', label: 'Auto Insurance' },
  home: { icon: '🏠', color: 'from-amber-500 to-orange-500', label: 'Home Insurance' },
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export default function InsurancePage() {
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Life insurance calculator inputs
  const [income, setIncome] = useState(720000);
  const [yearsToReplace, setYearsToReplace] = useState(10);
  const [existingCoverage, setExistingCoverage] = useState(1000000);
  const [debts, setDebts] = useState(517000);
  const [collegeNeeds, setCollegeNeeds] = useState(400000);
  
  const recommendedCoverage = useMemo(() => {
    const incomeReplacement = income * yearsToReplace;
    const totalNeeds = incomeReplacement + debts + collegeNeeds;
    const gap = totalNeeds - existingCoverage;
    return { totalNeeds, gap, incomeReplacement };
  }, [income, yearsToReplace, existingCoverage, debts, collegeNeeds]);
  
  const totalCoverage = MOCK_POLICIES.reduce((sum, p) => sum + p.coverage, 0);
  const annualPremiums = MOCK_POLICIES.reduce((sum, p) => {
    return sum + (p.frequency === 'monthly' ? p.premium * 12 : p.premium);
  }, 0);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Insurance</h1>
            <p className="text-gray-400 mt-1">Protect what matters most</p>
          </div>
          
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
          >
            {showCalculator ? 'Hide Calculator' : '🧮 Coverage Calculator'}
          </button>
        </div>
        
        {/* Summary Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-5">
            <p className="text-emerald-300 text-sm mb-1">Total Coverage</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(totalCoverage)}</p>
            <p className="text-sm text-emerald-400 mt-1">{MOCK_POLICIES.length} policies</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Annual Premiums</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(annualPremiums)}</p>
            <p className="text-sm text-gray-500 mt-1">{formatCurrency(annualPremiums / 12)}/month</p>
          </div>
          
          <div className={`rounded-2xl p-5 ${
            recommendedCoverage.gap > 0 
              ? 'bg-amber-500/10 border border-amber-500/30'
              : 'bg-emerald-500/10 border border-emerald-500/30'
          }`}>
            <p className={`text-sm mb-1 ${recommendedCoverage.gap > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
              Coverage Status
            </p>
            <p className="text-3xl font-bold text-white">
              {recommendedCoverage.gap > 0 ? 'Gap' : 'Adequate'}
            </p>
            <p className={`text-sm mt-1 ${recommendedCoverage.gap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {recommendedCoverage.gap > 0 
                ? `${formatCurrency(recommendedCoverage.gap)} underinsured`
                : 'Well protected'
              }
            </p>
          </div>
        </div>
        
        {/* Calculator */}
        {showCalculator && (
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 mb-8 animate-in slide-in-from-top-2 duration-300">
            <h3 className="text-lg font-semibold text-white mb-6">Life Insurance Calculator</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Annual Income</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Years of Income to Replace: {yearsToReplace}</label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    value={yearsToReplace}
                    onChange={(e) => setYearsToReplace(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Total Debts (Mortgage, etc.)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={debts}
                      onChange={(e) => setDebts(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">College Fund Needs</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={collegeNeeds}
                      onChange={(e) => setCollegeNeeds(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-5">
                <h4 className="font-medium text-white mb-4">Recommendation</h4>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Income replacement</span>
                    <span className="text-white">{formatCurrency(recommendedCoverage.incomeReplacement)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Debt payoff</span>
                    <span className="text-white">{formatCurrency(debts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">College funds</span>
                    <span className="text-white">{formatCurrency(collegeNeeds)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="text-white font-medium">Total Needed</span>
                    <span className="text-white font-bold">{formatCurrency(recommendedCoverage.totalNeeds)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current coverage</span>
                    <span className="text-emerald-400">-{formatCurrency(existingCoverage)}</span>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl ${
                  recommendedCoverage.gap > 0 
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'bg-emerald-500/10 border border-emerald-500/30'
                }`}>
                  <p className={`text-sm ${recommendedCoverage.gap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {recommendedCoverage.gap > 0 
                      ? `💡 Consider adding ${formatCurrency(recommendedCoverage.gap)} in coverage`
                      : '✓ You have adequate coverage'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Policies List */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden mb-8">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Your Policies</h3>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition">
              + Add Policy
            </button>
          </div>
          
          <div className="divide-y divide-white/5">
            {MOCK_POLICIES.map((policy) => {
              const config = TYPE_CONFIG[policy.type];
              
              return (
                <div key={policy.id} className="p-5 hover:bg-white/5 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl`}>
                      {config.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{config.label}</h3>
                        {policy.premium === 0 && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                            Employer-paid
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{policy.provider}</p>
                      {policy.beneficiary && (
                        <p className="text-xs text-gray-600 mt-1">
                          Beneficiary: {policy.beneficiary}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">{formatCurrency(policy.coverage)}</p>
                      <p className="text-sm text-gray-500">
                        {policy.premium > 0 
                          ? `${formatCurrency(policy.premium)}/${policy.frequency === 'monthly' ? 'mo' : 'yr'}`
                          : 'No cost'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Tips */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-medium text-white">Review Annually</p>
                <p className="text-sm text-gray-400 mt-1">
                  Life changes (new baby, home purchase) may require coverage adjustments.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-medium text-white">Bundle & Save</p>
                <p className="text-sm text-gray-400 mt-1">
                  Many insurers offer 10-25% discounts when you bundle policies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
