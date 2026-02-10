'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ToolExplainer } from '@/app/components/ToolExplainer';
import { useUserProfile } from '@/providers/UserProvider';
import { useLiveFinancials } from '@/hooks/useLivePrices';
import { calculateAge, classifyTicker } from '@/lib/portfolio-utils';

interface IncomeSource {
  id: string;
  name: string;
  type: 'dividend' | 'interest' | 'social_security' | 'pension' | 'rental' | 'other';
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  taxTreatment: 'ordinary' | 'qualified' | 'tax_free' | 'partially_taxed';
  startAge?: number;
  endAge?: number;
}

// Estimated dividend yields for common holdings
const DIVIDEND_YIELDS: Record<string, { yield: number; treatment: 'qualified' | 'ordinary' }> = {
  'VTI': { yield: 0.015, treatment: 'qualified' },
  'VOO': { yield: 0.015, treatment: 'qualified' },
  'SCHD': { yield: 0.035, treatment: 'qualified' },
  'VYM': { yield: 0.03, treatment: 'qualified' },
  'VNQ': { yield: 0.04, treatment: 'ordinary' }, // REITs are ordinary income
  'BND': { yield: 0.04, treatment: 'ordinary' },
  'AGG': { yield: 0.035, treatment: 'ordinary' },
  'VXUS': { yield: 0.03, treatment: 'qualified' },
  'VEA': { yield: 0.03, treatment: 'qualified' },
  'AAPL': { yield: 0.005, treatment: 'qualified' },
  'MSFT': { yield: 0.008, treatment: 'qualified' },
  'CAIBX': { yield: 0.025, treatment: 'qualified' }, // Capital Income Builder
};

export default function IncomePage() {
  const { profile, isDemoMode } = useUserProfile();
  // Use live financials to ensure current prices are reflected
  const { financials } = useLiveFinancials(profile, isDemoMode);
  const [showRetirement, setShowRetirement] = useState(false);
  const [targetMonthlyIncome, setTargetMonthlyIncome] = useState(8000);

  // Calculate age from profile
  const currentAge = useMemo(() => {
    return calculateAge(profile?.dateOfBirth);
  }, [profile]);
  
  const retirementAge = profile?.socialSecurity?.retirementAge || 55;
  
  // Derive income sources from actual holdings and profile data
  const incomeSources = useMemo((): IncomeSource[] => {
    const sources: IncomeSource[] = [];
    
    // Add dividend and interest income from holdings
    if (financials?.allHoldings) {
      // Group holdings by similar type
      const dividendHoldings: { ticker: string; value: number; yield: number; treatment: 'qualified' | 'ordinary' }[] = [];
      const bondHoldings: { ticker: string; value: number; yield: number }[] = [];
      
      financials.allHoldings.forEach(holding => {
        const value = holding.currentValue || (holding.shares * (holding.currentPrice || 0));
        if (value <= 0) return;
        
        const yieldInfo = DIVIDEND_YIELDS[holding.ticker];
        const assetClass = classifyTicker(holding.ticker);
        
        if (assetClass === 'bonds') {
          bondHoldings.push({
            ticker: holding.ticker,
            value,
            yield: yieldInfo?.yield || 0.03,
          });
        } else if (yieldInfo && yieldInfo.yield > 0) {
          dividendHoldings.push({
            ticker: holding.ticker,
            value,
            yield: yieldInfo.yield,
            treatment: yieldInfo.treatment,
          });
        }
      });
      
      // Add aggregated dividend income
      const qualifiedDividends = dividendHoldings
        .filter(h => h.treatment === 'qualified')
        .reduce((sum, h) => sum + (h.value * h.yield), 0);
      
      if (qualifiedDividends > 0) {
        sources.push({
          id: 'dividends-qualified',
          name: 'Stock Dividends (Qualified)',
          type: 'dividend',
          amount: Math.round(qualifiedDividends),
          frequency: 'annual',
          taxTreatment: 'qualified',
        });
      }
      
      // Add bond interest
      const bondInterest = bondHoldings.reduce((sum, h) => sum + (h.value * h.yield), 0);
      if (bondInterest > 0) {
        sources.push({
          id: 'bond-interest',
          name: 'Bond Interest',
          type: 'interest',
          amount: Math.round(bondInterest),
          frequency: 'annual',
          taxTreatment: 'ordinary',
        });
      }
    }
    
    // Add Social Security from profile
    if (profile?.socialSecurity?.benefitAtFRA) {
      const ssAge = profile.socialSecurity.fullRetirementAge || 67;
      sources.push({
        id: 'social-security',
        name: 'Social Security',
        type: 'social_security',
        amount: profile.socialSecurity.benefitAtFRA,
        frequency: 'monthly',
        taxTreatment: 'partially_taxed',
        startAge: ssAge,
      });
    }
    
    // Add spouse Social Security if available
    if (profile?.socialSecurity?.spouseBenefitAtFRA) {
      sources.push({
        id: 'spouse-ss',
        name: 'Spouse Social Security',
        type: 'social_security',
        amount: profile.socialSecurity.spouseBenefitAtFRA,
        frequency: 'monthly',
        taxTreatment: 'partially_taxed',
        startAge: 67,
      });
    }
    
    return sources;
  }, [financials, profile]);

  const calculateAnnualIncome = (sources: IncomeSource[], retired: boolean) => {
    return sources.reduce((total, source) => {
      if (source.startAge && currentAge < source.startAge && !retired) return total;
      if (source.startAge && retirementAge < source.startAge) return total;
      
      let annual = source.amount;
      if (source.frequency === 'monthly') annual *= 12;
      if (source.frequency === 'quarterly') annual *= 4;
      
      return total + annual;
    }, 0);
  };

  const currentAnnualIncome = calculateAnnualIncome(incomeSources, false);
  const retirementAnnualIncome = calculateAnnualIncome(incomeSources, true);
  const incomeGap = (targetMonthlyIncome * 12) - retirementAnnualIncome;

  const typeColors: Record<string, string> = {
    dividend: 'bg-green-500/20 text-green-400',
    interest: 'bg-blue-500/20 text-blue-400',
    social_security: 'bg-purple-500/20 text-purple-400',
    pension: 'bg-yellow-500/20 text-yellow-400',
    rental: 'bg-orange-500/20 text-orange-400',
    other: 'bg-slate-500/20 text-slate-400',
  };

  const typeLabels: Record<string, string> = {
    dividend: 'Dividends',
    interest: 'Interest',
    social_security: 'Social Security',
    pension: 'Pension',
    rental: 'Rental Income',
    other: 'Other',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                ← Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Income Planner</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-slate-400">Plan your investment income and retirement cash flow</p>
              <ToolExplainer toolName="income" />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRetirement(!showRetirement)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showRetirement ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {showRetirement ? '📅 Retirement View' : '📊 Current View'}
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg">
              + Add Income Source
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">
              {showRetirement ? 'Projected Annual Income' : 'Current Annual Income'}
            </div>
            <div className="text-3xl font-bold text-green-400">
              ${(showRetirement ? retirementAnnualIncome : currentAnnualIncome).toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">
              ${((showRetirement ? retirementAnnualIncome : currentAnnualIncome) / 12).toLocaleString()}/month
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Target Monthly Income</div>
            <div className="text-3xl font-bold">${targetMonthlyIncome.toLocaleString()}</div>
            <div className="text-sm text-slate-500">${(targetMonthlyIncome * 12).toLocaleString()}/year</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Income Gap</div>
            <div className={`text-3xl font-bold ${incomeGap > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {incomeGap > 0 ? '-' : '+'}${Math.abs(incomeGap).toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">
              {incomeGap > 0 ? 'Need to close' : 'Surplus'}/year
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Income Sources</div>
            <div className="text-3xl font-bold">{incomeSources.length}</div>
            <div className="text-sm text-slate-500">Active streams</div>
          </div>
        </div>

        {/* Target Income Slider */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Target Monthly Income</h2>
            <span className="text-2xl font-bold">${targetMonthlyIncome.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="3000"
            max="20000"
            step="500"
            value={targetMonthlyIncome}
            onChange={(e) => setTargetMonthlyIncome(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-slate-500 mt-2">
            <span>$3,000</span>
            <span>$20,000</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Income Sources */}
          <div className="col-span-2">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-4 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold">Income Sources</h2>
              </div>
              <div className="divide-y divide-slate-700/30">
                {incomeSources.map((source) => {
                  const isActive = !source.startAge || (showRetirement ? retirementAge >= source.startAge : currentAge >= source.startAge);
                  const annualAmount = source.frequency === 'monthly' ? source.amount * 12 :
                                      source.frequency === 'quarterly' ? source.amount * 4 : source.amount;
                  
                  return (
                    <div 
                      key={source.id} 
                      className={`p-4 ${!isActive ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full text-sm ${typeColors[source.type]}`}>
                            {typeLabels[source.type]}
                          </div>
                          <div>
                            <div className="font-medium">{source.name}</div>
                            <div className="text-sm text-slate-400">
                              ${source.amount.toLocaleString()} / {source.frequency}
                              {source.startAge && ` • Starts at age ${source.startAge}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400">
                            ${annualAmount.toLocaleString()}/yr
                          </div>
                          <div className="text-sm text-slate-500">
                            {source.taxTreatment === 'qualified' ? 'Qualified dividends' :
                             source.taxTreatment === 'tax_free' ? 'Tax-free' :
                             source.taxTreatment === 'partially_taxed' ? 'Up to 85% taxable' :
                             'Ordinary income'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Income Timeline */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Income Timeline</h2>
              <div className="relative h-24">
                {/* Timeline bar */}
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-700 rounded-full" />
                
                {/* Age markers */}
                {[32, 55, 62, 67, 70].map((age) => (
                  <div
                    key={age}
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: `${((age - 30) / 50) * 100}%` }}
                  >
                    <div className={`w-4 h-4 rounded-full ${
                      age === currentAge ? 'bg-purple-500' :
                      age === retirementAge ? 'bg-green-500' :
                      'bg-slate-500'
                    }`} />
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">
                      {age === currentAge ? 'Now' :
                       age === retirementAge ? 'Retire' :
                       age === 67 ? 'SS' : `Age ${age}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Income Breakdown */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Income Breakdown</h2>
              <div className="space-y-3">
                {Object.entries(
                  incomeSources.reduce((acc, source) => {
                    const type = typeLabels[source.type];
                    const annual = source.frequency === 'monthly' ? source.amount * 12 :
                                  source.frequency === 'quarterly' ? source.amount * 4 : source.amount;
                    acc[type] = (acc[type] || 0) + annual;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, amount]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-slate-400">{type}</span>
                    <span className="font-medium">${amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-green-400">
                      ${(showRetirement ? retirementAnnualIncome : currentAnnualIncome).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Tax Efficiency</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-400">Qualified/Tax-Free</span>
                  <span>$3,100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400">Partially Taxed</span>
                  <span>$38,400</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-400">Ordinary Income</span>
                  <span>$23,680</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-sm text-slate-300">
                  💡 Consider shifting more income to qualified dividends for better tax treatment.
                </div>
              </div>
            </div>

            {incomeGap > 0 && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold mb-4">Close the Gap</h2>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="font-medium">4% Withdrawal</div>
                    <div className="text-sm text-slate-400">
                      Need ${(incomeGap / 0.04).toLocaleString()} in assets
                    </div>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="font-medium">Dividend Portfolio</div>
                    <div className="text-sm text-slate-400">
                      Need ${(incomeGap / 0.03).toLocaleString()} at 3% yield
                    </div>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="font-medium">Delay Social Security</div>
                    <div className="text-sm text-slate-400">
                      +8%/year from 67 to 70
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
