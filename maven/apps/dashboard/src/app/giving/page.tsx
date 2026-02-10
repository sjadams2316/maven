'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import ProgressRing from '../components/ProgressRing';
import InfoTooltip, { Term } from '../components/InfoTooltip';
import { DEMO_PROFILE, GROWTH_HOLDINGS, getDemoProfile } from '@/lib/demo-profile';

// ============================================================================
// CHARITABLE GIVING DEMO DATA
// Aligned with demo-profile.ts for consistency
// ============================================================================

const GIVING_PROFILE = {
  // Annual giving goals
  annualGoal: 15000,
  ytdDonated: 8200,
  
  // Donor Advised Fund
  dafBalance: 45000,
  dafProvider: 'Fidelity Charitable',
  dafAccountNumber: '****4521',
  
  // Tax info (from demo profile)
  filingStatus: 'Married Filing Jointly' as const,
  estimatedIncome: 350000, // Upper end of demo range
  marginalTaxRate: 0.32, // 32% federal bracket for MFJ at $350K
  stateRate: 0.0575, // Virginia state rate
  standardDeduction: 29200, // 2024 MFJ standard deduction
};

// Historical giving data
const GIVING_HISTORY = [
  { year: 2023, amount: 12500, organizations: 5 },
  { year: 2024, amount: 14200, organizations: 6 },
  { year: 2025, amount: 8200, organizations: 4 }, // YTD
];

// DAF contribution history
const DAF_CONTRIBUTIONS = [
  { date: '2024-12-15', type: 'Cash', amount: 10000, taxBenefit: 3775 },
  { date: '2024-06-20', type: 'Appreciated Stock', ticker: 'AAPL', shares: 50, amount: 9500, costBasis: 3200, taxBenefit: 5152 },
  { date: '2023-11-10', type: 'Cash', amount: 15000, taxBenefit: 5663 },
  { date: '2023-04-05', type: 'Appreciated Stock', ticker: 'MSFT', shares: 30, amount: 12000, costBasis: 4500, taxBenefit: 5840 },
];

// Grants made from DAF
const DAF_GRANTS = [
  { date: '2025-01-15', organization: 'Red Cross', amount: 2500, cause: 'Disaster Relief' },
  { date: '2024-11-20', organization: 'Local Food Bank', amount: 1500, cause: 'Hunger' },
  { date: '2024-09-10', organization: 'Habitat for Humanity', amount: 2000, cause: 'Housing' },
  { date: '2024-06-05', organization: 'STEM Education Fund', amount: 3000, cause: 'Education' },
  { date: '2024-03-22', organization: 'Environmental Defense Fund', amount: 1500, cause: 'Environment' },
];

// YTD donations (direct giving, not through DAF)
const YTD_DONATIONS = [
  { date: '2025-02-01', organization: 'Local Animal Shelter', amount: 500, cause: 'Animal Welfare' },
  { date: '2025-01-20', organization: 'Public Radio Station', amount: 200, cause: 'Media/Arts' },
  { date: '2025-01-10', organization: 'Alma Mater Annual Fund', amount: 1000, cause: 'Education' },
  { date: '2024-12-28', organization: 'Children\'s Hospital', amount: 2500, cause: 'Healthcare' },
  { date: '2024-12-20', organization: 'Community Foundation', amount: 4000, cause: 'Community' },
];

// Cause categories for impact display
const CAUSE_COLORS: Record<string, string> = {
  'Education': '#6366f1',
  'Healthcare': '#ec4899',
  'Environment': '#10b981',
  'Hunger': '#f59e0b',
  'Housing': '#8b5cf6',
  'Disaster Relief': '#ef4444',
  'Animal Welfare': '#14b8a6',
  'Community': '#3b82f6',
  'Media/Arts': '#a855f7',
};

// ============================================================================
// SMART GIVING CALCULATIONS
// ============================================================================

interface AppreciatedHolding {
  symbol: string;
  name: string;
  shares: number;
  currentValue: number;
  costBasis: number;
  unrealizedGain: number;
  gainPercent: number;
  taxSaved: number; // If donated instead of sold
  accountType: string;
}

function findAppreciatedHoldings(): AppreciatedHolding[] {
  const holdings: AppreciatedHolding[] = [];
  const profile = DEMO_PROFILE;
  const taxRate = GIVING_PROFILE.marginalTaxRate + GIVING_PROFILE.stateRate;
  const ltcgRate = 0.15 + GIVING_PROFILE.stateRate; // 15% LTCG + state
  
  // Check investment accounts (taxable only - where donation makes sense)
  profile.investmentAccounts.forEach(account => {
    if (account.holdings) {
      account.holdings.forEach(h => {
        const currentValue = h.currentValue ?? 0;
        const costBasis = h.costBasis ?? 0;
        const gain = currentValue - costBasis;
        if (gain >= 5000) { // Only show >$5K gains per task spec
          holdings.push({
            symbol: h.ticker,
            name: h.name ?? h.ticker,
            shares: h.shares,
            currentValue: currentValue,
            costBasis: costBasis,
            unrealizedGain: gain,
            gainPercent: costBasis > 0 ? (gain / costBasis) * 100 : 0,
            taxSaved: gain * ltcgRate, // Capital gains tax avoided
            accountType: account.name,
          });
        }
      });
    }
  });
  
  // Sort by unrealized gain (highest first)
  return holdings.sort((a, b) => b.unrealizedGain - a.unrealizedGain);
}

// QCD (Qualified Charitable Distribution) calculations
function calculateQCDOptimization(age: number, iraBalance: number, annualGivingTarget: number) {
  // QCD available for those 70½+
  const isEligible = age >= 70.5;
  const maxQCD = 105000; // 2024 limit
  const optimalQCD = Math.min(annualGivingTarget, maxQCD, iraBalance * 0.05);
  
  // Tax savings from QCD vs regular distribution + donation
  const taxRate = GIVING_PROFILE.marginalTaxRate + GIVING_PROFILE.stateRate;
  const taxSavings = optimalQCD * taxRate;
  
  return {
    isEligible,
    age,
    maxQCD,
    optimalQCD,
    taxSavings,
    iraBalance,
  };
}

// Bunching strategy calculations
function calculateBunchingStrategy(annualDeductions: number, annualGiving: number) {
  const standardDeduction = GIVING_PROFILE.standardDeduction;
  const yearsToProject = 2;
  
  // Current approach: give same amount each year
  const currentAnnualItemized = annualDeductions;
  const currentBenefit = currentAnnualItemized > standardDeduction 
    ? (currentAnnualItemized - standardDeduction) * yearsToProject
    : 0;
  
  // Bunching approach: double up one year, skip next
  const bunchedYearDeductions = annualDeductions + annualGiving; // Extra year's giving
  const bunchedBenefit = bunchedYearDeductions > standardDeduction
    ? (bunchedYearDeductions - standardDeduction)
    : 0;
  // In skip year, take standard deduction (no itemizing benefit)
  const bunchingTotalBenefit = bunchedBenefit;
  
  const shouldBunch = bunchingTotalBenefit > currentBenefit;
  const extraDeduction = bunchingTotalBenefit - currentBenefit;
  const taxSavings = extraDeduction * GIVING_PROFILE.marginalTaxRate;
  
  return {
    standardDeduction,
    currentAnnualDeductions: annualDeductions,
    currentStrategy: {
      year1Benefit: currentAnnualItemized > standardDeduction ? currentAnnualItemized - standardDeduction : 0,
      year2Benefit: currentAnnualItemized > standardDeduction ? currentAnnualItemized - standardDeduction : 0,
      totalBenefit: currentBenefit,
    },
    bunchingStrategy: {
      year1Benefit: bunchedBenefit,
      year2Benefit: 0, // Take standard deduction
      totalBenefit: bunchingTotalBenefit + standardDeduction, // Standard in year 2
    },
    shouldBunch,
    extraDeduction,
    taxSavings,
  };
}

// ============================================================================
// TAB COMPONENTS
// ============================================================================

function GivingOverviewTab() {
  const progress = (GIVING_PROFILE.ytdDonated / GIVING_PROFILE.annualGoal) * 100;
  const remaining = GIVING_PROFILE.annualGoal - GIVING_PROFILE.ytdDonated;
  const taxRate = GIVING_PROFILE.marginalTaxRate + GIVING_PROFILE.stateRate;
  const estimatedTaxSavings = GIVING_PROFILE.ytdDonated * taxRate;
  
  // Aggregate donations by cause
  const causeBreakdown = useMemo(() => {
    const allDonations = [...YTD_DONATIONS, ...DAF_GRANTS];
    const byCause: Record<string, number> = {};
    allDonations.forEach(d => {
      byCause[d.cause] = (byCause[d.cause] || 0) + d.amount;
    });
    return Object.entries(byCause)
      .map(([cause, amount]) => ({ cause, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, []);
  
  // Organizations supported
  const organizationsSupported = new Set([
    ...YTD_DONATIONS.map(d => d.organization),
    ...DAF_GRANTS.map(g => g.organization),
  ]).size;

  return (
    <div className="space-y-6">
      {/* Annual Giving Tracker */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🎯</span> Annual Giving Goal
          </h3>
          
          <div className="flex items-center gap-6">
            <ProgressRing
              progress={Math.min(progress, 100)}
              size={140}
              strokeWidth={14}
              color="gradient"
              glowing
              label="of goal"
            />
            
            <div className="flex-1">
              <div className="mb-4">
                <p className="text-3xl font-bold text-white">
                  ${GIVING_PROFILE.ytdDonated.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">
                  of ${GIVING_PROFILE.annualGoal.toLocaleString()} goal
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Remaining</span>
                  <span className="text-white font-medium">${remaining.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly pace needed</span>
                  <span className="text-amber-400 font-medium">
                    ${Math.round(remaining / 10).toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tax Benefit Summary */}
        <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>💰</span> Tax Benefits (YTD)
            <InfoTooltip term="tax-loss-harvesting">
              <span className="text-xs text-gray-500">(how it works)</span>
            </InfoTooltip>
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Estimated Tax Savings</p>
              <p className="text-3xl font-bold text-emerald-400">
                ${Math.round(estimatedTaxSavings).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Based on {(taxRate * 100).toFixed(0)}% combined federal + state rate
              </p>
            </div>
            
            <div className="pt-4 border-t border-emerald-500/20 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Charitable Deductions</p>
                <p className="text-lg font-semibold text-white">
                  ${GIVING_PROFILE.ytdDonated.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Filing Status</p>
                <p className="text-lg font-semibold text-white">
                  MFJ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Giving History Chart */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Giving History</h3>
        
        <div className="flex items-end gap-4 h-40 mb-4">
          {GIVING_HISTORY.map((year, idx) => {
            const maxAmount = Math.max(...GIVING_HISTORY.map(y => y.amount));
            const height = (year.amount / maxAmount) * 100;
            const isCurrentYear = year.year === 2025;
            
            return (
              <div key={year.year} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t-lg transition-all ${
                    isCurrentYear 
                      ? 'bg-gradient-to-t from-indigo-600 to-purple-500 opacity-70' 
                      : 'bg-gradient-to-t from-indigo-600 to-purple-500'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <div className="mt-2 text-center">
                  <p className="text-white font-medium">${(year.amount / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-gray-500">
                    {year.year} {isCurrentYear && '(YTD)'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-white/10">
          <span>3-Year Total: ${GIVING_HISTORY.reduce((s, y) => s + y.amount, 0).toLocaleString()}</span>
          <span>Avg: ${Math.round(GIVING_HISTORY.reduce((s, y) => s + y.amount, 0) / 3).toLocaleString()}/year</span>
        </div>
      </div>
      
      {/* Impact Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Causes Supported */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">❤️ Causes You Support</h3>
          
          <div className="space-y-3">
            {causeBreakdown.slice(0, 5).map(({ cause, amount }) => {
              const percent = (amount / causeBreakdown.reduce((s, c) => s + c.amount, 0)) * 100;
              const color = CAUSE_COLORS[cause] || '#6366f1';
              
              return (
                <div key={cause}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{cause}</span>
                    <span className="text-white font-medium">${amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Organizations */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🏛️ Organizations Supported</h3>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white">
              {organizationsSupported}
            </div>
            <div>
              <p className="text-sm text-gray-400">Total organizations</p>
              <p className="text-lg text-white">supported this year</p>
            </div>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {[...YTD_DONATIONS, ...DAF_GRANTS].slice(0, 6).map((donation, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <span className="text-sm text-gray-300">{donation.organization}</span>
                <span className="text-sm text-white font-medium">${donation.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Donations */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">📝 Recent Donations</h3>
          <button className="text-sm text-indigo-400 hover:text-indigo-300 transition">
            Export for Taxes →
          </button>
        </div>
        
        <div className="space-y-3">
          {YTD_DONATIONS.map((donation, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${CAUSE_COLORS[donation.cause] || '#6366f1'}30` }}
                >
                  {donation.cause === 'Education' ? '📚' : 
                   donation.cause === 'Healthcare' ? '🏥' :
                   donation.cause === 'Animal Welfare' ? '🐾' :
                   donation.cause === 'Media/Arts' ? '🎨' :
                   donation.cause === 'Community' ? '🤝' : '💝'}
                </div>
                <div>
                  <p className="text-white font-medium">{donation.organization}</p>
                  <p className="text-xs text-gray-500">{donation.date} • {donation.cause}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">${donation.amount.toLocaleString()}</p>
                <p className="text-xs text-emerald-400">
                  ~${Math.round(donation.amount * (GIVING_PROFILE.marginalTaxRate + GIVING_PROFILE.stateRate)).toLocaleString()} tax savings
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DAFTab() {
  const [showContributeModal, setShowContributeModal] = useState(false);
  const appreciatedHoldings = findAppreciatedHoldings();
  const totalGranted = DAF_GRANTS.reduce((s, g) => s + g.amount, 0);
  const totalContributed = DAF_CONTRIBUTIONS.reduce((s, c) => s + c.amount, 0);
  
  return (
    <div className="space-y-6">
      {/* DAF Balance Card */}
      <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏦</span>
              <div>
                <h3 className="text-lg font-semibold text-white">{GIVING_PROFILE.dafProvider}</h3>
                <p className="text-sm text-gray-400">Account {GIVING_PROFILE.dafAccountNumber}</p>
              </div>
            </div>
            
            <p className="text-4xl font-bold text-white mt-4">
              ${GIVING_PROFILE.dafBalance.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Available for grants
              <InfoTooltip term="tax-deferred">
                <span className="ml-1 text-indigo-400 cursor-help">ⓘ</span>
              </InfoTooltip>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setShowContributeModal(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition min-h-[48px] font-medium"
            >
              + Fund DAF
            </button>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition min-h-[48px] font-medium">
              Make Grant
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-sm text-gray-400">Total Contributed</p>
            <p className="text-xl font-semibold text-white">${totalContributed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Granted</p>
            <p className="text-xl font-semibold text-emerald-400">${totalGranted.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Tax Savings</p>
            <p className="text-xl font-semibold text-amber-400">
              ${DAF_CONTRIBUTIONS.reduce((s, c) => s + c.taxBenefit, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      
      {/* Contribution History */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📈 Contribution History</h3>
        
        <div className="space-y-3">
          {DAF_CONTRIBUTIONS.map((contribution, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                  contribution.type === 'Cash' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {contribution.type === 'Cash' ? '💵' : '📈'}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {contribution.type === 'Cash' ? 'Cash Contribution' : `${contribution.ticker} Stock Donation`}
                  </p>
                  <p className="text-sm text-gray-400">
                    {contribution.date}
                    {contribution.shares && ` • ${contribution.shares} shares`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">${contribution.amount.toLocaleString()}</p>
                {contribution.type !== 'Cash' && contribution.costBasis && (
                  <p className="text-xs text-purple-400">
                    Avoided ${Math.round((contribution.amount - contribution.costBasis) * 0.238).toLocaleString()} in cap gains
                  </p>
                )}
                <p className="text-xs text-emerald-400">
                  ${contribution.taxBenefit.toLocaleString()} tax benefit
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Grant Recommendations Made */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">🎁 Grants Made</h3>
          <span className="text-sm text-gray-400">
            {DAF_GRANTS.length} grants totaling ${totalGranted.toLocaleString()}
          </span>
        </div>
        
        <div className="space-y-3">
          {DAF_GRANTS.map((grant, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${CAUSE_COLORS[grant.cause] || '#6366f1'}30` }}
                >
                  {grant.cause === 'Disaster Relief' ? '🚨' :
                   grant.cause === 'Hunger' ? '🍽️' :
                   grant.cause === 'Housing' ? '🏠' :
                   grant.cause === 'Education' ? '📚' :
                   grant.cause === 'Environment' ? '🌱' : '💝'}
                </div>
                <div>
                  <p className="text-white font-medium">{grant.organization}</p>
                  <p className="text-xs text-gray-500">{grant.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">${grant.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{grant.cause}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Fund Your DAF Suggestions */}
      <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-white">💡 Smart DAF Funding</h3>
          <InfoTooltip term="unrealized-gains">
            <span className="text-gray-400 text-xs cursor-help">Why donate stock?</span>
          </InfoTooltip>
        </div>
        
        <p className="text-sm text-gray-400 mb-4">
          Donating appreciated securities directly to your DAF lets you avoid capital gains tax AND get a deduction for the full market value.
        </p>
        
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <p className="text-sm text-purple-300 mb-2">
            <strong>Why this works:</strong> If you sold these stocks, you&apos;d owe ~23.8% on the gains. 
            By donating directly, you skip the tax AND deduct the full value.
          </p>
        </div>
        
        {appreciatedHoldings.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-white font-medium">Ideal holdings to contribute:</p>
            {appreciatedHoldings.slice(0, 3).map((holding, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-purple-500/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{holding.symbol}</span>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                        Best Option
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{holding.name}</p>
                  <p className="text-xs text-gray-500">{holding.accountType}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">${holding.currentValue.toLocaleString()}</p>
                  <p className="text-sm text-emerald-400">
                    +${holding.unrealizedGain.toLocaleString()} gain ({holding.gainPercent.toFixed(0)}%)
                  </p>
                  <p className="text-xs text-amber-400">
                    Avoid ${Math.round(holding.taxSaved).toLocaleString()} cap gains tax
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No holdings with significant unrealized gains found.</p>
        )}
      </div>
    </div>
  );
}

function SmartToolsTab() {
  const [qcdAge, setQcdAge] = useState(72);
  const [selectedHolding, setSelectedHolding] = useState<string | null>(null);
  
  const appreciatedHoldings = findAppreciatedHoldings();
  const iraBalance = DEMO_PROFILE.retirementAccounts
    .filter(a => a.type.includes('IRA'))
    .reduce((s, a) => s + a.balance, 0);
  
  const qcdCalc = calculateQCDOptimization(qcdAge, iraBalance, GIVING_PROFILE.annualGoal);
  
  // For bunching calculation, assume typical deductions
  const otherDeductions = 18000; // Mortgage interest, SALT, etc.
  const bunchingCalc = calculateBunchingStrategy(
    otherDeductions + GIVING_PROFILE.annualGoal,
    GIVING_PROFILE.annualGoal
  );

  return (
    <div className="space-y-6">
      {/* Appreciated Stock Finder */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <h3 className="text-lg font-semibold text-white">Appreciated Stock Finder</h3>
          </div>
          <InfoTooltip term="capital-gains">
            <span className="text-xs text-indigo-400 cursor-help">How it saves taxes</span>
          </InfoTooltip>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-emerald-300">
            <strong>💡 Pro tip:</strong> Donating appreciated stock (held 1+ year) lets you deduct the full market value AND avoid capital gains tax on the appreciation.
          </p>
        </div>
        
        <p className="text-sm text-gray-400 mb-4">
          Holdings with &gt;$5,000 unrealized gains — ideal for charitable donation:
        </p>
        
        {appreciatedHoldings.length > 0 ? (
          <div className="space-y-3">
            {appreciatedHoldings.map((holding, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedHolding === holding.symbol
                    ? 'bg-indigo-500/20 border-indigo-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
                onClick={() => setSelectedHolding(selectedHolding === holding.symbol ? null : holding.symbol)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                      holding.symbol === 'TAO' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                      holding.symbol === 'VTI' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                      'bg-gradient-to-br from-indigo-500 to-purple-500'
                    }`}>
                      {holding.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{holding.symbol}</p>
                        {holding.symbol === 'TAO' && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                            🏆 Best for Donation
                          </span>
                        )}
                        {holding.symbol === 'VTI' && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                            ✓ Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{holding.name}</p>
                      <p className="text-xs text-gray-500">{holding.shares} shares • {holding.accountType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">${holding.currentValue.toLocaleString()}</p>
                    <p className="text-emerald-400">
                      +${holding.unrealizedGain.toLocaleString()} ({holding.gainPercent.toFixed(0)}%)
                    </p>
                  </div>
                </div>
                
                {selectedHolding === holding.symbol && (
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400">If you sold</p>
                      <p className="text-sm text-red-400">-${Math.round(holding.taxSaved).toLocaleString()} cap gains tax</p>
                      <p className="text-xs text-gray-500">at 23.8% LTCG rate</p>
                    </div>
                    <div className="bg-emerald-500/10 rounded-lg p-3">
                      <p className="text-xs text-gray-400">If you donate</p>
                      <p className="text-sm text-emerald-400">+${Math.round(holding.currentValue * 0.378).toLocaleString()} tax savings</p>
                      <p className="text-xs text-gray-500">full FMV deduction</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No holdings with &gt;$5K unrealized gains found.</p>
            <p className="text-sm">Check back as your investments grow!</p>
          </div>
        )}
      </div>
      
      {/* QCD Calculator */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏛️</span>
          <div>
            <h3 className="text-lg font-semibold text-white">QCD Calculator</h3>
            <p className="text-sm text-gray-400">Qualified Charitable Distribution from IRA</p>
          </div>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-300">
            <strong>What&apos;s a QCD?</strong> For those 70½ or older, you can donate up to $105K directly from your IRA to charity. 
            It counts toward your RMD but isn&apos;t taxable income — double win!
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Your Age</label>
            <input
              type="range"
              min={65}
              max={85}
              value={qcdAge}
              onChange={(e) => setQcdAge(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>65</span>
              <span className="text-white font-medium">{qcdAge} years old</span>
              <span>85</span>
            </div>
            
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p className="text-sm text-gray-400">Your IRA Balance</p>
              <p className="text-xl font-semibold text-white">${iraBalance.toLocaleString()}</p>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${qcdCalc.isEligible ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-gray-500/10 border border-gray-500/30'}`}>
            {qcdCalc.isEligible ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">✅</span>
                  <p className="text-emerald-400 font-medium">QCD Eligible!</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Annual QCD Limit</span>
                    <span className="text-white">${qcdCalc.maxQCD.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Suggested QCD Amount</span>
                    <span className="text-emerald-400 font-medium">${Math.round(qcdCalc.optimalQCD).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                    <span className="text-gray-400">Estimated Tax Savings</span>
                    <span className="text-amber-400 font-bold">${Math.round(qcdCalc.taxSavings).toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Based on your ${GIVING_PROFILE.annualGoal.toLocaleString()} giving goal and {((GIVING_PROFILE.marginalTaxRate + GIVING_PROFILE.stateRate) * 100).toFixed(0)}% tax rate
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">⏳</span>
                  <p className="text-gray-400 font-medium">Not Yet Eligible</p>
                </div>
                <p className="text-sm text-gray-400">
                  QCDs are available starting at age 70½. You&apos;ll be eligible in {Math.ceil(70.5 - qcdAge)} years.
                </p>
                <p className="text-xs text-indigo-400 mt-2">
                  Set a reminder and we&apos;ll alert you when you become eligible!
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Bunching Strategy */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-lg font-semibold text-white">Bunching Strategy Calculator</h3>
            <p className="text-sm text-gray-400">Maximize deductions over standard deduction</p>
          </div>
        </div>
        
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-amber-300">
            <strong>The idea:</strong> If your itemized deductions are close to the standard deduction, 
            &quot;bunch&quot; 2 years of charitable giving into 1 year to push above the threshold, 
            then take standard deduction the next year.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Strategy */}
          <div className="p-4 bg-white/5 rounded-xl">
            <h4 className="text-white font-medium mb-3">📅 Give Evenly Each Year</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Standard Deduction (MFJ)</span>
                <span className="text-white">${bunchingCalc.standardDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Itemized Deductions</span>
                <span className="text-white">${bunchingCalc.currentAnnualDeductions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-gray-400">Year 1 Benefit</span>
                <span className="text-white">${bunchingCalc.currentStrategy.year1Benefit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Year 2 Benefit</span>
                <span className="text-white">${bunchingCalc.currentStrategy.year2Benefit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-white/10">
                <span className="text-gray-400">2-Year Total Benefit</span>
                <span className="text-white">${bunchingCalc.currentStrategy.totalBenefit.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* Bunching Strategy */}
          <div className={`p-4 rounded-xl ${bunchingCalc.shouldBunch ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-white/5'}`}>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              📦 Bunch Donations
              {bunchingCalc.shouldBunch && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  Recommended
                </span>
              )}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Year 1: Double giving</span>
                <span className="text-white">${(bunchingCalc.currentAnnualDeductions + GIVING_PROFILE.annualGoal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Year 2: Standard deduction</span>
                <span className="text-white">${bunchingCalc.standardDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-gray-400">Year 1 Benefit</span>
                <span className="text-emerald-400">${bunchingCalc.bunchingStrategy.year1Benefit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Year 2 Benefit</span>
                <span className="text-white">${bunchingCalc.standardDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-white/10">
                <span className="text-gray-400">2-Year Total Benefit</span>
                <span className="text-emerald-400">${bunchingCalc.bunchingStrategy.totalBenefit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {bunchingCalc.shouldBunch && (
          <div className="mt-4 p-4 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 font-medium">Bunching saves you more!</p>
                <p className="text-sm text-gray-400">
                  Extra deduction above standard: ${bunchingCalc.extraDeduction.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-400">
                  ${Math.round(bunchingCalc.taxSavings).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">additional tax savings</p>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-4">
          * Assumes $18,000 in other itemized deductions (mortgage interest, SALT cap). 
          Calculations based on 2024 standard deduction for Married Filing Jointly.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

type TabId = 'overview' | 'daf' | 'tools';

export default function GivingPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  
  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'daf', label: 'Donor Advised Fund', icon: '🏦' },
    { id: 'tools', label: 'Smart Tools', icon: '🧠' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header showFinancialSummary={false} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/demo" className="hover:text-white transition">Dashboard</Link>
          <span>→</span>
          <span className="text-white">Philanthropy & Giving</span>
        </div>
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-rose-900/50 border border-purple-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">💝</span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Philanthropy & Giving</h1>
                </div>
                <p className="text-gray-300 max-w-xl">
                  Maximize your charitable impact while optimizing tax benefits. 
                  Track donations, manage your DAF, and find smart giving opportunities.
                </p>
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-2">
                <div className="text-right">
                  <p className="text-sm text-gray-400">YTD Giving</p>
                  <p className="text-3xl font-bold text-white">${GIVING_PROFILE.ytdDonated.toLocaleString()}</p>
                </div>
                <p className="text-sm text-emerald-400">
                  ~${Math.round(GIVING_PROFILE.ytdDonated * (GIVING_PROFILE.marginalTaxRate + GIVING_PROFILE.stateRate)).toLocaleString()} tax benefit
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition whitespace-nowrap min-h-[48px] ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.id === 'overview' ? 'Overview' : tab.id === 'daf' ? 'DAF' : 'Tools'}
              </span>
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && <GivingOverviewTab />}
        {activeTab === 'daf' && <DAFTab />}
        {activeTab === 'tools' && <SmartToolsTab />}
        
        {/* CTA Footer */}
        <div className="mt-8 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Need personalized advice?</h3>
          <p className="text-gray-400 mb-4">
            Our AI can analyze your specific situation and recommend optimal giving strategies.
          </p>
          <Link
            href="/oracle"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition min-h-[48px]"
          >
            <span>🔮</span>
            Ask Maven Oracle
          </Link>
        </div>
      </main>
    </div>
  );
}
