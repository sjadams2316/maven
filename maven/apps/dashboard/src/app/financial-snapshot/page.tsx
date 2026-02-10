'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import WealthJourneyChart from '../components/WealthJourneyChart';
import { Term } from '../components/InfoTooltip';
import { useUserProfile } from '@/providers/UserProvider';
import { useLiveFinancials } from '@/hooks/useLivePrices';

interface SelectedYearData {
  year: number;
  age: number;
  portfolio: number;
  socialSecurity: number;
  totalIncome: number;
  phase: 'accumulation' | 'retirement';
  milestone?: string;
}

export default function FinancialSnapshot() {
  const router = useRouter();
  const { profile, isLoading, isDemoMode } = useUserProfile();
  // Use live financials to ensure current prices are reflected
  const { financials } = useLiveFinancials(profile, isDemoMode);
  
  // User inputs
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualContribution, setAnnualContribution] = useState(30000);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [socialSecurityMonthly, setSocialSecurityMonthly] = useState(2500);
  const [socialSecurityStartAge, setSocialSecurityStartAge] = useState(67);
  const [selectedYearData, setSelectedYearData] = useState<SelectedYearData | null>(null);
  
  // Oracle AI insight
  const [oracleInsight, setOracleInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState(false);
  
  // Calculate current age from DOB
  const currentAge = useMemo(() => {
    if (!profile?.dateOfBirth) return 35;
    const today = new Date();
    const birth = new Date(profile.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }, [profile?.dateOfBirth]);
  
  // Current financial values
  const currentNetWorth = financials?.netWorth || 0;
  const currentInvestments = (financials?.totalRetirement || 0) + (financials?.totalInvestments || 0);
  const currentCash = financials?.totalCash || 0;
  const currentLiabilities = financials?.totalLiabilities || 0;
  
  // Quick projection for key stats
  const quickProjection = useMemo(() => {
    let portfolio = currentInvestments;
    const yearsToRetirement = retirementAge - currentAge;
    
    for (let i = 0; i < yearsToRetirement; i++) {
      portfolio = portfolio * (1 + expectedReturn / 100) + annualContribution;
    }
    
    const portfolioIncome = portfolio * 0.04;
    const ssIncome = socialSecurityMonthly * 12;
    const totalIncome = portfolioIncome + ssIncome;
    
    // Find FI age (when portfolio hits 25x desired spending)
    const desiredAnnualSpending = 80000;
    const fiTarget = desiredAnnualSpending * 25;
    let fiAge = null;
    let testPortfolio = currentInvestments;
    for (let i = 0; i <= 40; i++) {
      if (testPortfolio >= fiTarget) {
        fiAge = currentAge + i;
        break;
      }
      testPortfolio = testPortfolio * (1 + expectedReturn / 100) + annualContribution;
    }
    
    return {
      portfolioAtRetirement: portfolio,
      portfolioIncome,
      ssIncome,
      totalIncome,
      fiAge,
      yearsToRetirement
    };
  }, [currentAge, currentInvestments, retirementAge, annualContribution, expectedReturn, socialSecurityMonthly]);

  // Fetch Oracle insight
  const fetchOracleInsight = async () => {
    if (!profile || insightLoading) return;
    
    setInsightLoading(true);
    setInsightError(false);
    
    try {
      // Build top holdings string
      const allHoldings = [...(profile.retirementAccounts || []), ...(profile.investmentAccounts || [])]
        .flatMap((a: any) => a.holdings || [])
        .filter((h: any) => h.currentValue && h.currentValue > 0)
        .sort((a: any, b: any) => (b.currentValue || 0) - (a.currentValue || 0))
        .slice(0, 5);
      const topHoldingsStr = allHoldings.map((h: any) => `${h.ticker} ($${h.currentValue?.toLocaleString()})`).join(', ');
      
      const response = await fetch('/api/oracle-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          age: currentAge,
          state: profile.state,
          filingStatus: profile.filingStatus,
          netWorth: currentNetWorth,
          totalInvestments: currentInvestments,
          totalCash: currentCash,
          totalRetirement: financials?.totalRetirement,
          totalLiabilities: currentLiabilities,
          householdIncome: profile.householdIncome,
          topHoldings: topHoldingsStr,
          assetAllocation: '', // Could add this
          retirementAge,
          currentAge,
          annualContribution,
          expectedReturn,
          socialSecurityEstimate: socialSecurityMonthly,
          projectedNestEgg: quickProjection.portfolioAtRetirement,
          projectedMonthlyIncome: Math.round(quickProjection.totalIncome / 12),
          fiAge: quickProjection.fiAge,
          yearsToRetirement: quickProjection.yearsToRetirement,
          primaryGoal: profile.primaryGoal,
          riskTolerance: profile.riskTolerance,
          investmentExperience: profile.investmentExperience,
          pageContext: 'financial-snapshot'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setOracleInsight(data.insight);
      } else {
        setInsightError(true);
      }
    } catch (error) {
      console.error('Failed to fetch Oracle insight:', error);
      setInsightError(true);
    } finally {
      setInsightLoading(false);
    }
  };

  // Auto-fetch insight on first load with data
  useEffect(() => {
    if (profile && currentInvestments > 0 && !oracleInsight && !insightLoading) {
      // Small delay to let the page render first
      const timer = setTimeout(() => fetchOracleInsight(), 500);
      return () => clearTimeout(timer);
    }
  }, [profile, currentInvestments]);

  useEffect(() => {
    if (!isLoading && !profile) {
      router.push('/onboarding');
    }
  }, [isLoading, profile, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading your financial snapshot...</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📸</span>
            <h1 className="text-3xl font-bold text-white">Financial Snapshot</h1>
          </div>
          <p className="text-gray-400">
            Your complete picture — from today through retirement and beyond
          </p>
        </div>

        {/* Current Snapshot Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-5">
            <p className="text-sm text-emerald-400 mb-1">Net Worth</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">${currentNetWorth.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Today</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-sm text-gray-400 mb-1">Invested</p>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-400">${currentInvestments.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Working for you</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-sm text-gray-400 mb-1">Cash</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">${currentCash.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Liquid reserves</p>
          </div>
          <div className="bg-[#12121a] border border-red-500/20 rounded-2xl p-5">
            <p className="text-sm text-gray-400 mb-1">Liabilities</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-400">-${currentLiabilities.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Debt to eliminate</p>
          </div>
        </div>

        {/* Planning Controls */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            🎛️ Adjust Your Plan
            <span className="text-xs text-gray-500 font-normal">Drag to update projections</span>
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Retirement Age */}
            <div>
              <label className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Retirement Age</span>
                <span className="text-white font-semibold text-lg">{retirementAge}</span>
              </label>
              <input
                type="range"
                min={currentAge + 1}
                max="75"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{currentAge + 1} (early)</span>
                <span>75 (late)</span>
              </div>
            </div>
            
            {/* Annual Contribution */}
            <div>
              <label className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Annual Savings</span>
                <span className="text-white font-semibold text-lg">${annualContribution.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100000"
                step="5000"
                value={annualContribution}
                onChange={(e) => setAnnualContribution(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$0</span>
                <span>$100K/yr</span>
              </div>
            </div>
            
            {/* Expected Return */}
            <div>
              <label className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Expected Return</span>
                <span className="text-white font-semibold text-lg">{expectedReturn}%</span>
              </label>
              <input
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3% (conservative)</span>
                <span>12% (aggressive)</span>
              </div>
            </div>
            
            {/* Social Security */}
            <div>
              <label className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Est. Social Security</span>
                <span className="text-white font-semibold text-lg">${socialSecurityMonthly.toLocaleString()}/mo</span>
              </label>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={socialSecurityMonthly}
                onChange={(e) => setSocialSecurityMonthly(Number(e.target.value))}
                className="w-full accent-blue-500 h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$0</span>
                <span>$5K/mo</span>
              </div>
            </div>
            
            {/* SS Start Age */}
            <div>
              <label className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">SS Start Age</span>
                <span className="text-white font-semibold text-lg">{socialSecurityStartAge}</span>
              </label>
              <input
                type="range"
                min="62"
                max="70"
                value={socialSecurityStartAge}
                onChange={(e) => setSocialSecurityStartAge(Number(e.target.value))}
                className="w-full accent-blue-500 h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>62 (reduced)</span>
                <span>70 (max benefit)</span>
              </div>
            </div>
            
            {/* Quick tip */}
            <div className="flex items-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <span className="text-2xl mr-3">💡</span>
              <p className="text-sm text-amber-200/80">
                Delaying SS to 70 increases benefits by ~8% per year after full retirement age.
              </p>
            </div>
          </div>
        </div>

        {/* Key Outcomes */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickProjection.fiAge && (
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔥</span>
                <p className="text-sm text-orange-400"><Term id="fi-countdown">Financial Independence</Term></p>
              </div>
              <p className="text-3xl font-bold text-white">Age {quickProjection.fiAge}</p>
              <p className="text-sm text-gray-400">{quickProjection.fiAge - currentAge} years away</p>
              {quickProjection.fiAge < retirementAge && (
                <p className="text-xs text-emerald-400 mt-1">✓ {retirementAge - quickProjection.fiAge} years before retirement!</p>
              )}
            </div>
          )}
          
          <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎊</span>
              <p className="text-sm text-purple-400">At Retirement</p>
            </div>
            <p className="text-3xl font-bold text-white">${(quickProjection.portfolioAtRetirement / 1000000).toFixed(2)}M</p>
            <p className="text-sm text-gray-400">Nest egg at {retirementAge}</p>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💰</span>
              <p className="text-sm text-emerald-400">Retirement Income</p>
            </div>
            <p className="text-3xl font-bold text-white">${Math.round(quickProjection.totalIncome / 12).toLocaleString()}/mo</p>
            <p className="text-sm text-gray-400">${Math.round(quickProjection.totalIncome).toLocaleString()}/yr total</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <p className="text-sm text-gray-400">Income Breakdown</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Portfolio (4%)</span>
                <span className="text-emerald-400">${Math.round(quickProjection.portfolioIncome / 12).toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Social Security</span>
                <span className="text-blue-400">${socialSecurityMonthly.toLocaleString()}/mo</span>
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="flex justify-between text-sm font-medium">
                <span className="text-white">Total</span>
                <span className="text-white">${Math.round(quickProjection.totalIncome / 12).toLocaleString()}/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Wealth Journey Chart */}
        <WealthJourneyChart
          currentAge={currentAge}
          currentInvestments={currentInvestments}
          retirementAge={retirementAge}
          annualContribution={annualContribution}
          expectedReturn={expectedReturn}
          socialSecurityMonthly={socialSecurityMonthly}
          socialSecurityStartAge={socialSecurityStartAge}
          onYearSelect={setSelectedYearData}
        />

        {/* What Could Go Wrong */}
        <div className="mt-8 bg-gradient-to-r from-red-500/5 to-orange-500/5 border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            ⚠️ What Could Go Wrong?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📉</span>
                <p className="font-medium text-white">Market Crash Early</p>
              </div>
              <p className="text-sm text-gray-400">
                A 30-40% drop in your first retirement years can devastate your portfolio. 
                This is <Term id="sequence-risk">sequence of returns risk</Term>.
              </p>
              <p className="text-xs text-amber-400 mt-2">
                💡 Keep 2-3 years expenses in cash before retiring
              </p>
            </div>
            
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📈</span>
                <p className="font-medium text-white">Inflation Spike</p>
              </div>
              <p className="text-sm text-gray-400">
                At 4% inflation, your purchasing power drops 50% in 18 years. 
                Fixed income becomes worth less over time.
              </p>
              <p className="text-xs text-amber-400 mt-2">
                💡 Keep equity exposure even in retirement
              </p>
            </div>
            
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏥</span>
                <p className="font-medium text-white">Healthcare Costs</p>
              </div>
              <p className="text-sm text-gray-400">
                Average couple needs $315K for healthcare in retirement (Fidelity). 
                Medicare doesn't cover everything.
              </p>
              <p className="text-xs text-amber-400 mt-2">
                💡 Consider HSA contributions if eligible
              </p>
            </div>
            
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⏳</span>
                <p className="font-medium text-white">Living Too Long</p>
              </div>
              <p className="text-sm text-gray-400">
                A 65-year-old has 50% chance of living past 85, 25% past 90. 
                Plan for 30+ years of retirement.
              </p>
              <p className="text-xs text-amber-400 mt-2">
                💡 Use 3.5% withdrawal for extra safety
              </p>
            </div>
            
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏛️</span>
                <p className="font-medium text-white">Social Security Cuts</p>
              </div>
              <p className="text-sm text-gray-400">
                Trust fund projected to run short by 2034. Benefits could be cut 20-25% 
                without legislative action.
              </p>
              <p className="text-xs text-amber-400 mt-2">
                💡 Plan as if SS covers only 75% of estimate
              </p>
            </div>
            
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎯</span>
                <p className="font-medium text-white">Overconfidence</p>
              </div>
              <p className="text-sm text-gray-400">
                Most investors overestimate returns and underestimate spending. 
                Reality often falls short of projections.
              </p>
              <p className="text-xs text-amber-400 mt-2">
                💡 Use conservative 5-6% return assumptions
              </p>
            </div>
          </div>
        </div>

        {/* Maven Oracle Deep Insight */}
        <div className="mt-8 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-500/30 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-violet-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl">
                🔮
              </div>
              <div>
                <h3 className="font-semibold text-white">Maven Oracle</h3>
                <p className="text-xs text-violet-400">AI-powered personal insight</p>
              </div>
            </div>
            <button
              onClick={fetchOracleInsight}
              disabled={insightLoading}
              className="px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm rounded-lg transition disabled:opacity-50"
            >
              {insightLoading ? '✨ Thinking...' : '↻ Refresh Insight'}
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {insightLoading ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-violet-400">
                  <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Maven is analyzing your complete financial picture...</span>
                </div>
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-11/12" />
                  <div className="h-4 bg-white/5 rounded w-10/12" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-9/12" />
                </div>
              </div>
            ) : insightError ? (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-3">Couldn't generate insight right now.</p>
                <button
                  onClick={fetchOracleInsight}
                  className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm rounded-lg transition"
                >
                  Try Again
                </button>
              </div>
            ) : oracleInsight ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {oracleInsight}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">
                  Get personalized insight from Maven Oracle — not generic advice, but genuine perspective 
                  based on your complete financial picture.
                </p>
                <button
                  onClick={fetchOracleInsight}
                  className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition"
                >
                  ✨ Generate My Insight
                </button>
              </div>
            )}
          </div>
          
          {/* Actions */}
          {oracleInsight && (
            <div className="px-6 pb-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  localStorage.setItem('maven_chat_prompt', `Based on your analysis of my financial snapshot, I'd like to dig deeper. ${oracleInsight?.slice(-200)}`);
                  router.push('/oracle');
                }}
                className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition"
              >
                🔮 Continue This Conversation
              </button>
              <button
                onClick={() => router.push('/social-security')}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition"
              >
                🛡️ Optimize Social Security
              </button>
              <button
                onClick={() => router.push('/portfolio-lab')}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition"
              >
                🧪 Portfolio Stress Test
              </button>
            </div>
          )}
        </div>

        {/* Gamification Progress */}
        <div className="mt-8 bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            🏆 Wealth Milestones
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { amount: 100000, label: 'Six Figures', icon: '🌟' },
              { amount: 250000, label: 'Quarter Mill', icon: '💪' },
              { amount: 500000, label: 'Half Mill', icon: '🏔️' },
              { amount: 1000000, label: 'Millionaire', icon: '🎉' },
              { amount: 2000000, label: 'Double Comma', icon: '🏆' },
              { amount: 5000000, label: 'High Net Worth', icon: '👑' },
              { amount: 10000000, label: 'Eight Figures', icon: '💎' },
            ].map((milestone) => {
              const isAchieved = currentInvestments >= milestone.amount;
              const progress = Math.min((currentInvestments / milestone.amount) * 100, 100);
              
              return (
                <div 
                  key={milestone.amount}
                  className={`relative p-4 rounded-xl border text-center transition ${
                    isAchieved 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className={`text-2xl ${isAchieved ? '' : 'grayscale opacity-50'}`}>
                    {milestone.icon}
                  </span>
                  <p className={`text-xs mt-1 ${isAchieved ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {milestone.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${(milestone.amount / 1000000).toFixed(milestone.amount < 1000000 ? 1 : 0)}{milestone.amount >= 1000000 ? 'M' : 'K'}
                  </p>
                  {!isAchieved && (
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  {isAchieved && (
                    <span className="absolute -top-1 -right-1 text-xs">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white text-sm transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
