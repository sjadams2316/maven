'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { runMonteCarloSimulation, MonteCarloParams } from '@/lib/monte-carlo-engine';
import { getSWRPercentiles, analyzeSequenceRisk } from '@/lib/safe-withdrawal';
import { STRESS_SCENARIOS, calculateScenarioImpact, getWorstCaseScenario } from '@/lib/stress-test-scenarios';
import { SP500_ANNUAL_RETURNS } from '@/lib/historical-returns';
import { estimateReturnFromCAPE } from '@/lib/valuation-indicators';
import { useUserProfile } from '@/providers/UserProvider';

export default function RetirementHubPage() {
  const { financials, profile } = useUserProfile();
  
  // User inputs
  const [currentAge, setCurrentAge] = useState(32);
  const [retirementAge, setRetirementAge] = useState(60);
  const [lifeExpectancy, setLifeExpectancy] = useState(95);
  const [portfolioValue, setPortfolioValue] = useState(financials?.netWorth || 500000);
  const [annualContribution, setAnnualContribution] = useState(50000);
  const [desiredIncome, setDesiredIncome] = useState(80000);
  const [socialSecurity, setSocialSecurity] = useState(30000);
  const [ssStartAge, setSsStartAge] = useState(67);
  const [stockAllocation, setStockAllocation] = useState(70);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  
  // Derived values
  const yearsToRetirement = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;
  const yearsUntilSS = ssStartAge - retirementAge;
  
  // Accumulation phase projection
  const accumulationResult = useMemo(() => {
    const expectedReturn = riskTolerance === 'conservative' ? 0.05 : riskTolerance === 'moderate' ? 0.07 : 0.09;
    let balance = portfolioValue;
    const yearlyBalances: number[] = [balance];
    
    for (let year = 0; year < yearsToRetirement; year++) {
      balance = balance * (1 + expectedReturn) + annualContribution;
      yearlyBalances.push(balance);
    }
    
    return {
      projectedAtRetirement: balance,
      yearlyBalances,
      totalContributions: portfolioValue + (annualContribution * yearsToRetirement),
      investmentGrowth: balance - portfolioValue - (annualContribution * yearsToRetirement),
    };
  }, [portfolioValue, annualContribution, yearsToRetirement, riskTolerance]);
  
  // Distribution phase Monte Carlo
  const distributionResult = useMemo(() => {
    const params: MonteCarloParams = {
      currentAge: retirementAge, // Starting from retirement
      retirementAge: retirementAge,
      lifeExpectancy: lifeExpectancy,
      currentPortfolioValue: accumulationResult.projectedAtRetirement,
      annualContribution: 0, // No more contributions in retirement
      contributionGrowthRate: 0,
      annualSpendingRetirement: desiredIncome - (yearsUntilSS > 0 ? 0 : socialSecurity),
      spendingFlexibility: 'guardrails',
      allocation: {
        usEquity: stockAllocation / 100,
        intlEquity: 0,
        bonds: (100 - stockAllocation - 5) / 100,
        reits: 0,
        gold: 0,
        crypto: 0,
        cash: 0.05,
      },
      rebalanceFrequency: 'annual',
      glidePathEnabled: true,
      socialSecurityAge: ssStartAge,
      socialSecurityMonthly: socialSecurity / 12,
      effectiveTaxRate: 0.22,
      capitalGainsTaxRate: 0.15,
      taxDeferredPercent: 0.6,
      numSimulations: 1000,
      simulationMethod: 'historical_bootstrap',
      includeFatTails: true,
      inflationModel: 'historical',
    };
    
    return runMonteCarloSimulation(params);
  }, [accumulationResult.projectedAtRetirement, desiredIncome, socialSecurity, yearsUntilSS, retirementYears, stockAllocation, riskTolerance, retirementAge, lifeExpectancy, ssStartAge]);
  
  // Safe withdrawal rate analysis
  const swrAnalysis = useMemo(() => {
    return getSWRPercentiles(stockAllocation / 100, retirementYears);
  }, [stockAllocation, retirementYears]);
  
  // Worst-case stress test
  const stressTest = useMemo(() => {
    return getWorstCaseScenario({
      usEquity: stockAllocation / 100,
      intlEquity: 0,
      bonds: (100 - stockAllocation - 5) / 100,
      reits: 0,
      gold: 0,
      cash: 0.05,
    });
  }, [stockAllocation]);
  
  // Calculate required savings rate
  const requiredSavingsAnalysis = useMemo(() => {
    const targetAtRetirement = desiredIncome / 0.04; // 4% rule target
    const shortfall = targetAtRetirement - accumulationResult.projectedAtRetirement;
    const additionalNeeded = Math.max(0, shortfall);
    
    // Calculate required annual contribution to reach target
    const expectedReturn = 0.07;
    let requiredContribution = 0;
    if (additionalNeeded > 0) {
      // Future value of annuity formula, solve for payment
      const r = expectedReturn;
      const n = yearsToRetirement;
      const fvAnnuity = ((Math.pow(1 + r, n) - 1) / r);
      const fvCurrent = portfolioValue * Math.pow(1 + r, n);
      requiredContribution = (targetAtRetirement - fvCurrent) / fvAnnuity;
    }
    
    return {
      targetAtRetirement,
      shortfall: additionalNeeded,
      requiredContribution: Math.max(0, requiredContribution),
      onTrack: additionalNeeded <= 0,
    };
  }, [desiredIncome, accumulationResult.projectedAtRetirement, portfolioValue, yearsToRetirement]);
  
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };
  
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  
  const getSuccessColor = (rate: number) => {
    if (rate >= 0.95) return 'text-green-400';
    if (rate >= 0.85) return 'text-emerald-400';
    if (rate >= 0.75) return 'text-yellow-400';
    if (rate >= 0.60) return 'text-orange-400';
    return 'text-red-400';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Retirement Planning Hub</h1>
          <p className="text-slate-400 mt-1">
            Comprehensive retirement analysis powered by historical data
          </p>
        </div>
        
        {/* Big Picture Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className={`rounded-xl border p-6 ${requiredSavingsAnalysis.onTrack 
            ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30' 
            : 'bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30'}`}>
            <div className="text-slate-400 text-sm">Status</div>
            <div className={`text-2xl font-bold ${requiredSavingsAnalysis.onTrack ? 'text-green-400' : 'text-orange-400'}`}>
              {requiredSavingsAnalysis.onTrack ? '✓ On Track' : '⚠️ Behind'}
            </div>
            {!requiredSavingsAnalysis.onTrack && (
              <div className="text-sm text-slate-400 mt-1">
                Need +{formatCurrency(requiredSavingsAnalysis.requiredContribution - annualContribution)}/yr
              </div>
            )}
          </div>
          
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <div className="text-slate-400 text-sm">At Retirement ({retirementAge})</div>
            <div className="text-2xl font-bold">{formatCurrency(accumulationResult.projectedAtRetirement)}</div>
            <div className="text-sm text-slate-500">in {yearsToRetirement} years</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <div className="text-slate-400 text-sm">Success Rate</div>
            <div className={`text-2xl font-bold ${getSuccessColor(distributionResult.successRate)}`}>
              {formatPercent(distributionResult.successRate)}
            </div>
            <div className="text-sm text-slate-500">{retirementYears}-year horizon</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <div className="text-slate-400 text-sm">Safe Withdrawal</div>
            <div className="text-2xl font-bold text-purple-400">{formatPercent(swrAnalysis.median)}</div>
            <div className="text-sm text-slate-500">median historical</div>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Input Panel */}
          <div className="col-span-4 space-y-6">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">👤 Your Situation</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Current Age</label>
                    <input
                      type="number"
                      value={currentAge}
                      onChange={(e) => setCurrentAge(Number(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Retire At</label>
                    <input
                      type="number"
                      value={retirementAge}
                      onChange={(e) => setRetirementAge(Number(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Life Expectancy: {lifeExpectancy}
                  </label>
                  <input
                    type="range"
                    min="75"
                    max="100"
                    value={lifeExpectancy}
                    onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Current Portfolio</label>
                  <input
                    type="number"
                    value={portfolioValue}
                    onChange={(e) => setPortfolioValue(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Annual Contributions</label>
                  <input
                    type="number"
                    value={annualContribution}
                    onChange={(e) => setAnnualContribution(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">💰 Retirement Income</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Desired Annual Income</label>
                  <input
                    type="number"
                    value={desiredIncome}
                    onChange={(e) => setDesiredIncome(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Social Security (annual)</label>
                  <input
                    type="number"
                    value={socialSecurity}
                    onChange={(e) => setSocialSecurity(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">SS Start Age: {ssStartAge}</label>
                  <input
                    type="range"
                    min="62"
                    max="70"
                    value={ssStartAge}
                    onChange={(e) => setSsStartAge(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">📊 Investment Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Stock Allocation: {stockAllocation}%
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={stockAllocation}
                    onChange={(e) => setStockAllocation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Risk Tolerance</label>
                  <div className="flex gap-2">
                    {(['conservative', 'moderate', 'aggressive'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setRiskTolerance(level)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize ${
                          riskTolerance === level
                            ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                            : 'bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Panel */}
          <div className="col-span-8 space-y-6">
            {/* Accumulation Phase */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">📈 Accumulation Phase (Now → Retirement)</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-slate-400 text-sm">Starting Portfolio</div>
                  <div className="text-xl font-bold">{formatCurrency(portfolioValue)}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-slate-400 text-sm">Total Contributions</div>
                  <div className="text-xl font-bold text-blue-400">
                    +{formatCurrency(annualContribution * yearsToRetirement)}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-slate-400 text-sm">Investment Growth</div>
                  <div className="text-xl font-bold text-green-400">
                    +{formatCurrency(accumulationResult.investmentGrowth)}
                  </div>
                </div>
              </div>
              
              {/* Growth Chart */}
              <div className="h-40 flex items-end gap-1 mb-4">
                {accumulationResult.yearlyBalances
                  .filter((_, i) => i % Math.ceil(yearsToRetirement / 20) === 0 || i === yearsToRetirement)
                  .map((balance, i, arr) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                        style={{ 
                          height: `${(balance / accumulationResult.projectedAtRetirement) * 100}%`,
                          minHeight: '4px'
                        }}
                      />
                    </div>
                  ))}
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Age {currentAge}</span>
                <span>Age {retirementAge}</span>
              </div>
            </div>
            
            {/* Distribution Phase */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">📉 Distribution Phase (Retirement → End)</h2>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-slate-400 text-sm">Starting Balance</div>
                  <div className="text-lg font-bold">{formatCurrency(accumulationResult.projectedAtRetirement)}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-slate-400 text-sm">Annual Withdrawal</div>
                  <div className="text-lg font-bold text-orange-400">
                    {formatCurrency(desiredIncome - (yearsUntilSS > 0 ? 0 : socialSecurity))}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-slate-400 text-sm">Withdrawal Rate</div>
                  <div className="text-lg font-bold">
                    {formatPercent((desiredIncome - (yearsUntilSS > 0 ? 0 : socialSecurity)) / accumulationResult.projectedAtRetirement)}
                  </div>
                </div>
                <div className={`rounded-lg p-4 ${distributionResult.successRate >= 0.9 
                  ? 'bg-green-500/20' 
                  : distributionResult.successRate >= 0.75 
                    ? 'bg-yellow-500/20' 
                    : 'bg-red-500/20'}`}>
                  <div className="text-slate-400 text-sm">Success Rate</div>
                  <div className={`text-lg font-bold ${getSuccessColor(distributionResult.successRate)}`}>
                    {formatPercent(distributionResult.successRate)}
                  </div>
                </div>
              </div>
              
              {/* Outcome Distribution */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Worst Case', value: distributionResult.percentiles.p5, color: 'text-red-400' },
                  { label: 'Poor', value: distributionResult.percentiles.p25, color: 'text-orange-400' },
                  { label: 'Median', value: distributionResult.percentiles.p50, color: 'text-yellow-400' },
                  { label: 'Good', value: distributionResult.percentiles.p75, color: 'text-emerald-400' },
                  { label: 'Best Case', value: distributionResult.percentiles.p95, color: 'text-green-400' },
                ].map((item) => (
                  <div key={item.label} className="text-center bg-slate-700/30 rounded-lg p-3">
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div className={`font-bold ${item.color}`}>
                      {item.value > 0 ? formatCurrency(item.value) : '$0'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Risk Analysis */}
            <div className="grid grid-cols-2 gap-6">
              {/* Stress Test */}
              <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-xl border border-red-500/30 p-6">
                <h3 className="text-lg font-semibold mb-2">⚠️ Worst-Case Stress Test</h3>
                <p className="text-sm text-slate-400 mb-4">{stressTest.scenario.name}</p>
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {formatPercent(stressTest.impact.portfolioReturn)}
                </div>
                <div className="text-slate-400">
                  Portfolio loss: {formatCurrency(accumulationResult.projectedAtRetirement * Math.abs(stressTest.impact.portfolioReturn))}
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  Recovery: ~{stressTest.impact.recoveryTime} months
                </div>
              </div>
              
              {/* Sequence Risk */}
              <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/30 p-6">
                <h3 className="text-lg font-semibold mb-2">⚡ Sequence of Returns Risk</h3>
                <p className="text-sm text-slate-400 mb-4">Order of returns matters early in retirement</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bad returns first</span>
                    <span className="text-red-400 font-bold">
                      {formatCurrency(analyzeSequenceRisk(SP500_ANNUAL_RETURNS, 0.04, retirementYears).worstCase.finalBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Good returns first</span>
                    <span className="text-green-400 font-bold">
                      {formatCurrency(analyzeSequenceRisk(SP500_ANNUAL_RETURNS, 0.04, retirementYears).bestCase.finalBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-6">
              <h3 className="text-lg font-semibold mb-4">🔗 Deep Dive Tools</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { href: '/monte-carlo', label: 'Monte Carlo', icon: '🎲', desc: '1000+ simulations' },
                  { href: '/safe-withdrawal', label: 'Safe Withdrawal', icon: '📊', desc: 'Historical SWR' },
                  { href: '/stress-test', label: 'Stress Test', icon: '⚠️', desc: '8 crisis scenarios' },
                  { href: '/sensitivity', label: 'Sensitivity', icon: '🌪️', desc: 'What-if analysis' },
                  { href: '/market-outlook', label: 'Market Outlook', icon: '📈', desc: 'Valuations' },
                  { href: '/social-security', label: 'Social Security', icon: '🏛️', desc: 'Optimize timing' },
                  { href: '/income', label: 'Income Planning', icon: '💵', desc: 'Distribution strategy' },
                  { href: '/asset-location', label: 'Asset Location', icon: '🗂️', desc: 'Tax optimization' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-4 transition-colors"
                  >
                    <div className="text-2xl mb-2">{link.icon}</div>
                    <div className="font-medium">{link.label}</div>
                    <div className="text-xs text-slate-500">{link.desc}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
