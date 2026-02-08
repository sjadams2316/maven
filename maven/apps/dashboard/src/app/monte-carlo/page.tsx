'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUserProfile } from '@/providers/UserProvider';
import { ToolExplainer } from '@/app/components/ToolExplainer';

interface PortfolioAllocation {
  usEquity: number;
  intlEquity: number;
  bonds: number;
  reits: number;
  gold: number;
  crypto: number;
  cash: number;
}

interface SimulationParams {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentPortfolioValue: number;
  annualContribution: number;
  contributionGrowthRate: number;
  annualSpendingRetirement: number;
  spendingFlexibility: 'fixed' | 'flexible' | 'guardrails';
  allocation: PortfolioAllocation;
  glidePathEnabled: boolean;
  socialSecurityAge: number;
  socialSecurityMonthly: number;
  effectiveTaxRate: number;
  taxDeferredPercent: number;
  numSimulations: number;
  simulationMethod: 'historical_bootstrap' | 'parametric' | 'block_bootstrap';
  includeFatTails: boolean;
  inflationModel: 'historical' | 'fixed' | 'stochastic';
  fixedInflationRate?: number;
}

interface SimulationResult {
  successRate: number;
  medianFinalBalance: number;
  meanFinalBalance: number;
  percentiles: {
    p5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
  yearlyPercentiles: {
    year: number;
    age: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  }[];
  samplePaths: number[][];
  maxDrawdownMedian: number;
  probabilityOfRuin: number;
  ruinYear: number | null;
  insights: {
    type: 'success' | 'warning' | 'danger';
    message: string;
  }[];
  simulationTime: number;
}

const ALLOCATION_PRESETS: { name: string; allocation: PortfolioAllocation }[] = [
  { name: 'Aggressive Growth', allocation: { usEquity: 0.60, intlEquity: 0.25, bonds: 0.05, reits: 0.05, gold: 0.00, crypto: 0.05, cash: 0.00 } },
  { name: 'Growth', allocation: { usEquity: 0.50, intlEquity: 0.20, bonds: 0.20, reits: 0.05, gold: 0.00, crypto: 0.00, cash: 0.05 } },
  { name: 'Balanced', allocation: { usEquity: 0.40, intlEquity: 0.15, bonds: 0.35, reits: 0.05, gold: 0.00, crypto: 0.00, cash: 0.05 } },
  { name: 'Conservative', allocation: { usEquity: 0.25, intlEquity: 0.10, bonds: 0.50, reits: 0.05, gold: 0.00, crypto: 0.00, cash: 0.10 } },
  { name: 'All Weather', allocation: { usEquity: 0.30, intlEquity: 0.00, bonds: 0.40, reits: 0.00, gold: 0.15, crypto: 0.00, cash: 0.15 } },
  { name: 'Crypto Tilt', allocation: { usEquity: 0.45, intlEquity: 0.15, bonds: 0.20, reits: 0.00, gold: 0.00, crypto: 0.15, cash: 0.05 } },
];

export default function MonteCarloPage() {
  const { profile, financials } = useUserProfile();
  
  // Initialize params from user profile
  const [params, setParams] = useState<SimulationParams>({
    currentAge: 35,
    retirementAge: 65,
    lifeExpectancy: 95,
    currentPortfolioValue: 500000,
    annualContribution: 30000,
    contributionGrowthRate: 0.02,
    annualSpendingRetirement: 60000,
    spendingFlexibility: 'guardrails',
    allocation: {
      usEquity: 0.50,
      intlEquity: 0.15,
      bonds: 0.25,
      reits: 0.05,
      gold: 0.00,
      crypto: 0.00,
      cash: 0.05,
    },
    glidePathEnabled: true,
    socialSecurityAge: 67,
    socialSecurityMonthly: 2500,
    effectiveTaxRate: 0.22,
    taxDeferredPercent: 0.60,
    numSimulations: 1000,
    simulationMethod: 'historical_bootstrap',
    includeFatTails: true,
    inflationModel: 'historical',
  });
  
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  // Update params when user profile loads
  useEffect(() => {
    if (financials && financials.netWorth > 0) {
      setParams(prev => ({
        ...prev,
        currentPortfolioValue: financials.netWorth,
        annualSpendingRetirement: Math.round(financials.netWorth * 0.04),
      }));
    }
  }, [financials]);
  
  const totalAllocation = useMemo(() => {
    return Object.values(params.allocation).reduce((sum, val) => sum + val, 0);
  }, [params.allocation]);
  
  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/monte-carlo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateAllocation = (key: keyof PortfolioAllocation, value: number) => {
    setParams(prev => ({
      ...prev,
      allocation: {
        ...prev.allocation,
        [key]: value,
      },
    }));
    setSelectedPreset(null);
  };
  
  const applyPreset = (preset: typeof ALLOCATION_PRESETS[0]) => {
    setParams(prev => ({
      ...prev,
      allocation: preset.allocation,
    }));
    setSelectedPreset(preset.name);
  };
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };
  
  const totalYears = params.lifeExpectancy - params.currentAge;
  const retirementYears = params.lifeExpectancy - params.retirementAge;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
              ← Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Monte Carlo Retirement Simulator</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-slate-400">
                {params.numSimulations.toLocaleString()} scenarios using historical market data (1928-2024)
              </p>
              <ToolExplainer toolName="monte-carlo" />
            </div>
          </div>
          <button
            onClick={runSimulation}
            disabled={loading || Math.abs(totalAllocation - 1) > 0.01}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              loading 
                ? 'bg-slate-700 cursor-wait' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
            } disabled:opacity-50`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Simulating...
              </span>
            ) : (
              '🎲 Run Simulation'
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Parameters Panel */}
          <div className="col-span-4 space-y-6">
            {/* Basic Info */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">📊 Your Situation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Current Age</label>
                  <input
                    type="number"
                    value={params.currentAge}
                    onChange={(e) => setParams(p => ({ ...p, currentAge: Number(e.target.value) }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Retirement Age</label>
                  <input
                    type="number"
                    value={params.retirementAge}
                    onChange={(e) => setParams(p => ({ ...p, retirementAge: Number(e.target.value) }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Life Expectancy</label>
                  <input
                    type="number"
                    value={params.lifeExpectancy}
                    onChange={(e) => setParams(p => ({ ...p, lifeExpectancy: Number(e.target.value) }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Current Portfolio Value</label>
                  <input
                    type="number"
                    value={params.currentPortfolioValue}
                    onChange={(e) => setParams(p => ({ ...p, currentPortfolioValue: Number(e.target.value) }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Annual Contribution</label>
                  <input
                    type="number"
                    value={params.annualContribution}
                    onChange={(e) => setParams(p => ({ ...p, annualContribution: Number(e.target.value) }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Annual Spending in Retirement (Today's $)</label>
                  <input
                    type="number"
                    value={params.annualSpendingRetirement}
                    onChange={(e) => setParams(p => ({ ...p, annualSpendingRetirement: Number(e.target.value) }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
            </div>
            
            {/* Allocation */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">📈 Portfolio Allocation</h2>
                <span className={`text-sm ${Math.abs(totalAllocation - 1) > 0.01 ? 'text-red-400' : 'text-green-400'}`}>
                  {(totalAllocation * 100).toFixed(0)}%
                </span>
              </div>
              
              {/* Presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {ALLOCATION_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedPreset === preset.name
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              
              {/* Allocation Sliders */}
              <div className="space-y-3">
                {[
                  { key: 'usEquity', label: 'US Stocks', color: 'bg-blue-500' },
                  { key: 'intlEquity', label: 'Int\'l Stocks', color: 'bg-purple-500' },
                  { key: 'bonds', label: 'Bonds', color: 'bg-emerald-500' },
                  { key: 'reits', label: 'REITs', color: 'bg-amber-500' },
                  { key: 'gold', label: 'Gold', color: 'bg-yellow-500' },
                  { key: 'crypto', label: 'Crypto', color: 'bg-orange-500' },
                  { key: 'cash', label: 'Cash', color: 'bg-slate-400' },
                ].map(({ key, label, color }) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{label}</span>
                      <span>{((params.allocation[key as keyof PortfolioAllocation] || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(params.allocation[key as keyof PortfolioAllocation] || 0) * 100}
                      onChange={(e) => updateAllocation(key as keyof PortfolioAllocation, Number(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
              
              {/* Allocation Bar */}
              <div className="h-4 rounded-full overflow-hidden flex mt-4">
                {params.allocation.usEquity > 0 && <div className="bg-blue-500" style={{ width: `${params.allocation.usEquity * 100}%` }} />}
                {params.allocation.intlEquity > 0 && <div className="bg-purple-500" style={{ width: `${params.allocation.intlEquity * 100}%` }} />}
                {params.allocation.bonds > 0 && <div className="bg-emerald-500" style={{ width: `${params.allocation.bonds * 100}%` }} />}
                {params.allocation.reits > 0 && <div className="bg-amber-500" style={{ width: `${params.allocation.reits * 100}%` }} />}
                {params.allocation.gold > 0 && <div className="bg-yellow-500" style={{ width: `${params.allocation.gold * 100}%` }} />}
                {params.allocation.crypto > 0 && <div className="bg-orange-500" style={{ width: `${params.allocation.crypto * 100}%` }} />}
                {params.allocation.cash > 0 && <div className="bg-slate-400" style={{ width: `${params.allocation.cash * 100}%` }} />}
              </div>
              
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.glidePathEnabled}
                  onChange={(e) => setParams(p => ({ ...p, glidePathEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-400">Enable glide path (shift to bonds over time)</span>
              </label>
            </div>
            
            {/* Advanced Settings */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-4 flex items-center justify-between"
              >
                <span className="font-semibold">⚙️ Advanced Settings</span>
                <span>{showAdvanced ? '▼' : '▶'}</span>
              </button>
              
              {showAdvanced && (
                <div className="p-6 pt-0 space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Simulation Method</label>
                    <select
                      value={params.simulationMethod}
                      onChange={(e) => setParams(p => ({ ...p, simulationMethod: e.target.value as any }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    >
                      <option value="historical_bootstrap">Historical Bootstrap (Recommended)</option>
                      <option value="block_bootstrap">Block Bootstrap (Preserves Autocorrelation)</option>
                      <option value="parametric">Parametric (Normal Distribution)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Withdrawal Strategy</label>
                    <select
                      value={params.spendingFlexibility}
                      onChange={(e) => setParams(p => ({ ...p, spendingFlexibility: e.target.value as any }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    >
                      <option value="fixed">Fixed (Inflation-Adjusted)</option>
                      <option value="flexible">Flexible (Reduce in Bad Years)</option>
                      <option value="guardrails">Guardrails (Adjust at Thresholds)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Inflation Model</label>
                    <select
                      value={params.inflationModel}
                      onChange={(e) => setParams(p => ({ ...p, inflationModel: e.target.value as any }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    >
                      <option value="historical">Historical Bootstrap</option>
                      <option value="stochastic">Stochastic (Mean-Reverting)</option>
                      <option value="fixed">Fixed Rate</option>
                    </select>
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={params.includeFatTails}
                      onChange={(e) => setParams(p => ({ ...p, includeFatTails: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-slate-400">Include fat tails (crash scenarios)</span>
                  </label>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Social Security Start Age</label>
                    <input
                      type="number"
                      value={params.socialSecurityAge}
                      onChange={(e) => setParams(p => ({ ...p, socialSecurityAge: Number(e.target.value) }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Social Security Monthly</label>
                    <input
                      type="number"
                      value={params.socialSecurityMonthly}
                      onChange={(e) => setParams(p => ({ ...p, socialSecurityMonthly: Number(e.target.value) }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Number of Simulations: {params.numSimulations.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="100"
                      value={params.numSimulations}
                      onChange={(e) => setParams(p => ({ ...p, numSimulations: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Results Panel */}
          <div className="col-span-8 space-y-6">
            {results ? (
              <>
                {/* Success Rate & Key Metrics */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <div className="text-slate-400 text-sm mb-1">Success Rate</div>
                    <div className={`text-4xl font-bold ${
                      results.successRate >= 90 ? 'text-green-400' :
                      results.successRate >= 75 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {results.successRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {results.successRate >= 90 ? 'Excellent' :
                       results.successRate >= 75 ? 'Good' : 'Needs Work'}
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <div className="text-slate-400 text-sm mb-1">Median Final Balance</div>
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(results.medianFinalBalance)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">At age {params.lifeExpectancy}</div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <div className="text-slate-400 text-sm mb-1">Worst Case (5%)</div>
                    <div className={`text-3xl font-bold ${results.percentiles.p5 > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {results.percentiles.p5 > 0 ? formatCurrency(results.percentiles.p5) : 'Depleted'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">5th percentile</div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <div className="text-slate-400 text-sm mb-1">Best Case (95%)</div>
                    <div className="text-3xl font-bold text-emerald-400">
                      {formatCurrency(results.percentiles.p95)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">95th percentile</div>
                  </div>
                </div>
                
                {/* Retirement Milestone Card */}
                <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/30 p-6">
                  <h3 className="text-lg font-semibold mb-4">🎯 At Retirement (Age {params.retirementAge})</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {/* Balance at Retirement */}
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Portfolio Balance</div>
                      <div className="text-2xl font-bold text-purple-300">
                        {(() => {
                          const retirementYear = params.retirementAge - params.currentAge;
                          const retirementData = results.yearlyPercentiles.find(y => y.age === params.retirementAge);
                          return retirementData ? formatCurrency(retirementData.p50) : '—';
                        })()}
                      </div>
                      <div className="text-xs text-slate-500">Median projection</div>
                    </div>
                    
                    {/* Social Security */}
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Social Security</div>
                      <div className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(params.socialSecurityMonthly * 12)}/yr
                      </div>
                      <div className="text-xs text-slate-500">Starting age {params.socialSecurityAge}</div>
                    </div>
                    
                    {/* Retirement Income */}
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Target Spending</div>
                      <div className="text-2xl font-bold text-white">
                        {formatCurrency(params.annualSpendingRetirement)}/yr
                      </div>
                      <div className="text-xs text-slate-500">{formatCurrency(params.annualSpendingRetirement / 12)}/month</div>
                    </div>
                    
                    {/* Initial Withdrawal Rate */}
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Initial Withdrawal Rate</div>
                      {(() => {
                        const retirementData = results.yearlyPercentiles.find(y => y.age === params.retirementAge);
                        const withdrawalRate = retirementData ? (params.annualSpendingRetirement / retirementData.p50) * 100 : 0;
                        return (
                          <>
                            <div className={`text-2xl font-bold ${
                              withdrawalRate <= 3.5 ? 'text-green-400' :
                              withdrawalRate <= 4 ? 'text-yellow-400' : 'text-orange-400'
                            }`}>
                              {withdrawalRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-slate-500">
                              {withdrawalRate <= 3.5 ? 'Conservative' :
                               withdrawalRate <= 4 ? 'Traditional' : 'Aggressive'}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-purple-500/20">
                    <Link 
                      href="/social-security"
                      className="text-sm text-purple-300 hover:text-purple-200 flex items-center gap-2"
                    >
                      <span>🏛️</span>
                      <span>Optimize your Social Security claiming strategy →</span>
                    </Link>
                  </div>
                </div>
                
                {/* Fan Chart */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold mb-4">Portfolio Projection (Fan Chart)</h3>
                  <div className="h-80 relative">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${totalYears} 100`}>
                      {/* Retirement line */}
                      <line
                        x1={params.retirementAge - params.currentAge}
                        y1="0"
                        x2={params.retirementAge - params.currentAge}
                        y2="100"
                        stroke="#6366f1"
                        strokeDasharray="2"
                        strokeWidth="0.5"
                      />
                      
                      {/* Fan areas */}
                      {(() => {
                        const maxValue = Math.max(...results.yearlyPercentiles.map(y => y.p90)) * 1.1;
                        const scale = (v: number) => 100 - (v / maxValue) * 90;
                        
                        return (
                          <>
                            {/* P10-P90 band */}
                            <polygon
                              points={results.yearlyPercentiles.map((y, i) => 
                                `${i},${scale(y.p90)}`
                              ).join(' ') + ' ' + 
                              results.yearlyPercentiles.slice().reverse().map((y, i) => 
                                `${totalYears - 1 - i},${scale(y.p10)}`
                              ).join(' ')}
                              fill="rgba(99, 102, 241, 0.2)"
                            />
                            
                            {/* P25-P75 band */}
                            <polygon
                              points={results.yearlyPercentiles.map((y, i) => 
                                `${i},${scale(y.p75)}`
                              ).join(' ') + ' ' + 
                              results.yearlyPercentiles.slice().reverse().map((y, i) => 
                                `${totalYears - 1 - i},${scale(y.p25)}`
                              ).join(' ')}
                              fill="rgba(99, 102, 241, 0.3)"
                            />
                            
                            {/* Median line */}
                            <polyline
                              points={results.yearlyPercentiles.map((y, i) => 
                                `${i},${scale(y.p50)}`
                              ).join(' ')}
                              fill="none"
                              stroke="#8b5cf6"
                              strokeWidth="1"
                            />
                            
                            {/* Sample paths */}
                            {results.samplePaths.slice(0, 20).map((path, pathIdx) => (
                              <polyline
                                key={pathIdx}
                                points={path.map((v, i) => 
                                  `${i},${scale(v)}`
                                ).join(' ')}
                                fill="none"
                                stroke={path[path.length - 1] > 0 ? '#22c55e' : '#ef4444'}
                                strokeWidth="0.3"
                                opacity="0.3"
                              />
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                    
                    {/* Axes labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500 px-2">
                      <span>Age {params.currentAge}</span>
                      <span className="text-purple-400">Retire ({params.retirementAge})</span>
                      <span>Age {params.lifeExpectancy}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-purple-500/30" />
                      <span className="text-slate-400">10th-90th percentile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-purple-500/50" />
                      <span className="text-slate-400">25th-75th percentile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-purple-500" />
                      <span className="text-slate-400">Median</span>
                    </div>
                  </div>
                </div>
                
                {/* Distribution */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold mb-4">Final Balance Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { label: '95th Percentile (Best)', value: results.percentiles.p95, color: 'bg-emerald-500' },
                      { label: '90th Percentile', value: results.percentiles.p90, color: 'bg-emerald-400' },
                      { label: '75th Percentile', value: results.percentiles.p75, color: 'bg-blue-400' },
                      { label: '50th Percentile (Median)', value: results.percentiles.p50, color: 'bg-purple-500' },
                      { label: '25th Percentile', value: results.percentiles.p25, color: 'bg-yellow-500' },
                      { label: '10th Percentile', value: results.percentiles.p10, color: 'bg-orange-500' },
                      { label: '5th Percentile (Worst)', value: results.percentiles.p5, color: 'bg-red-500' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-4">
                        <div className="w-44 text-sm text-slate-400">{item.label}</div>
                        <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all`}
                            style={{ width: `${Math.min(100, (item.value / results.percentiles.p95) * 100)}%` }}
                          />
                        </div>
                        <div className="w-28 text-right text-sm font-medium">
                          {item.value > 0 ? formatCurrency(item.value) : '$0'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Insights */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold mb-4">🔍 Analysis & Insights</h3>
                  <div className="space-y-3">
                    {results.insights.map((insight, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border ${
                          insight.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                          insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                          'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">
                            {insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : '🚨'}
                          </span>
                          <span className="text-sm">{insight.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Max Drawdown (Median)</span>
                        <div className="font-medium text-red-400">-{(results.maxDrawdownMedian * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Probability of Ruin</span>
                        <div className={`font-medium ${results.probabilityOfRuin > 10 ? 'text-red-400' : 'text-green-400'}`}>
                          {results.probabilityOfRuin.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Simulation Time</span>
                        <div className="font-medium">{results.simulationTime.toFixed(0)}ms</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Methodology */}
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                  <details>
                    <summary className="text-sm text-slate-400 cursor-pointer">📚 Methodology & Data Sources</summary>
                    <div className="mt-4 text-xs text-slate-500 space-y-2">
                      <p><strong>Data:</strong> S&P 500 total returns (1928-2024), 10-Year Treasury (1928-2024), EAFE (1970-2024), Gold (1972-2024), REITs (1972-2024), Bitcoin (2011-2024), CPI Inflation (1928-2024)</p>
                      <p><strong>Method:</strong> {params.simulationMethod === 'historical_bootstrap' ? 'Historical bootstrap sampling from actual market years' : params.simulationMethod === 'block_bootstrap' ? 'Block bootstrap preserving autocorrelation' : 'Parametric simulation with optional Student-t fat tails'}</p>
                      <p><strong>Correlation:</strong> Historical correlation matrix applied across asset classes</p>
                      <p><strong>Inflation:</strong> {params.inflationModel === 'historical' ? 'Sampled from historical CPI data' : params.inflationModel === 'stochastic' ? 'Mean-reverting stochastic process around 2.5%' : `Fixed at ${((params.fixedInflationRate || 0.025) * 100).toFixed(1)}%`}</p>
                      <p><strong>Withdrawal:</strong> {params.spendingFlexibility === 'guardrails' ? 'Guardrails strategy (adjust ±10% at 3%/5% thresholds)' : params.spendingFlexibility === 'flexible' ? 'Flexible spending reduced in down years' : 'Fixed inflation-adjusted withdrawals'}</p>
                    </div>
                  </details>
                </div>
              </>
            ) : (
              // Empty state
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-12 text-center">
                <div className="text-6xl mb-4">🎲</div>
                <h2 className="text-2xl font-semibold mb-2">Ready to Simulate</h2>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Adjust your parameters on the left, then run a simulation to see 
                  {' '}{params.numSimulations.toLocaleString()} possible futures based on 97 years of real market data.
                </p>
                <button
                  onClick={runSimulation}
                  disabled={Math.abs(totalAllocation - 1) > 0.01}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl font-semibold text-lg disabled:opacity-50"
                >
                  Run Simulation
                </button>
                {Math.abs(totalAllocation - 1) > 0.01 && (
                  <p className="text-red-400 text-sm mt-4">
                    Allocation must equal 100% (currently {(totalAllocation * 100).toFixed(0)}%)
                  </p>
                )}
                
                {/* Historical context */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-left">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-2xl mb-2">📈</div>
                    <div className="font-semibold">S&P 500</div>
                    <div className="text-sm text-slate-400">11.8% avg return</div>
                    <div className="text-sm text-slate-400">19.7% volatility</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-semibold">10Y Treasury</div>
                    <div className="text-sm text-slate-400">5.2% avg return</div>
                    <div className="text-sm text-slate-400">7.8% volatility</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-2xl mb-2">💰</div>
                    <div className="font-semibold">Inflation</div>
                    <div className="text-sm text-slate-400">3.0% average</div>
                    <div className="text-sm text-slate-400">Since 1928</div>
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
