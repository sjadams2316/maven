'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  STRESS_SCENARIOS, 
  calculateScenarioImpact,
  getWorstCaseScenario,
  StressScenario 
} from '@/lib/stress-test-scenarios';
import { useUserProfile } from '@/providers/UserProvider';
import { useLiveFinancials } from '@/hooks/useLivePrices';
import { ToolExplainer } from '@/app/components/ToolExplainer';
import { 
  calculateAllocationFromFinancials, 
  DEFAULT_ALLOCATION as FALLBACK_ALLOCATION,
  PortfolioAllocation 
} from '@/lib/portfolio-utils';

interface Allocation {
  usEquity: number;
  intlEquity: number;
  bonds: number;
  reits: number;
  gold: number;
  cash: number;
  crypto: number;
}

export default function StressTestPage() {
  const { profile, isDemoMode } = useUserProfile();
  // Use live financials to ensure current prices are reflected
  const { financials } = useLiveFinancials(profile, isDemoMode);
  const [selectedScenario, setSelectedScenario] = useState<StressScenario | null>(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [manualAllocation, setManualAllocation] = useState<Allocation | null>(null);
  const [portfolioValue, setPortfolioValue] = useState(500000);
  
  // Derive allocation from actual portfolio holdings (with live prices)
  const derivedAllocation = useMemo((): Allocation => {
    if (!financials || financials.netWorth <= 0) {
      return FALLBACK_ALLOCATION as Allocation;
    }
    
    const calc = calculateAllocationFromFinancials(financials);
    return {
      usEquity: calc.usEquity,
      intlEquity: calc.intlEquity,
      bonds: calc.bonds,
      reits: calc.reits,
      gold: calc.gold,
      cash: calc.cash,
      crypto: calc.crypto,
    };
  }, [financials]);
  
  // Use derived allocation unless user manually overrides
  const allocation = manualOverride && manualAllocation ? manualAllocation : derivedAllocation;
  
  // Update portfolio value when financials load (with live prices)
  useEffect(() => {
    if (financials && financials.netWorth > 0) {
      setPortfolioValue(financials.netWorth);
    }
  }, [financials]);
  
  // Calculate impacts for all scenarios
  const scenarioImpacts = useMemo(() => {
    return STRESS_SCENARIOS.map(scenario => ({
      scenario,
      impact: calculateScenarioImpact(scenario, allocation),
    })).sort((a, b) => a.impact.portfolioReturn - b.impact.portfolioReturn);
  }, [allocation]);
  
  const worstCase = useMemo(() => {
    return getWorstCaseScenario(allocation);
  }, [allocation]);
  
  const totalAllocation = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${value >= 0 ? '' : '-'}$${(Math.abs(value) / 1000000).toFixed(2)}M`;
    }
    return `${value >= 0 ? '' : '-'}$${Math.abs(value).toLocaleString()}`;
  };
  
  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
              ← Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Historical Stress Test</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-slate-400">
                See how your portfolio would have performed during major market crises
              </p>
              <ToolExplainer toolName="stress-test" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Allocation Panel */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">📊 Your Allocation</h2>
                {manualOverride && (
                  <button
                    onClick={() => {
                      setManualOverride(false);
                      setManualAllocation(null);
                    }}
                    className="text-xs px-2 py-1 bg-purple-600/30 text-purple-300 rounded hover:bg-purple-600/50"
                  >
                    Reset to Portfolio
                  </button>
                )}
              </div>
              
              {/* Source indicator */}
              <div className="mb-4 p-2 bg-slate-700/30 rounded-lg text-xs text-slate-400">
                {manualOverride ? (
                  <span>⚙️ Custom allocation (adjust sliders below)</span>
                ) : isDemoMode ? (
                  <span>📊 Derived from Demo Portfolio (~$800k across accounts)</span>
                ) : financials && financials.netWorth > 0 ? (
                  <span>📊 Derived from your actual portfolio</span>
                ) : (
                  <span>📊 Using default allocation (add accounts to personalize)</span>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-1">Portfolio Value</label>
                <input
                  type="number"
                  value={portfolioValue}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    // Only accept positive values
                    if (val >= 0) setPortfolioValue(val);
                  }}
                  min={0}
                  step={1000}
                  className={`w-full bg-slate-700 border rounded-lg px-4 py-2 ${
                    portfolioValue <= 0 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : 'border-slate-600 focus:border-purple-500'
                  }`}
                />
                {portfolioValue <= 0 && (
                  <p className="text-xs text-red-400 mt-1">⚠️ Enter a positive portfolio value</p>
                )}
              </div>
              
              <div className="space-y-3">
                {[
                  { key: 'usEquity', label: 'US Stocks', color: 'bg-blue-500' },
                  { key: 'intlEquity', label: 'Int\'l Stocks', color: 'bg-purple-500' },
                  { key: 'bonds', label: 'Bonds', color: 'bg-emerald-500' },
                  { key: 'reits', label: 'REITs', color: 'bg-amber-500' },
                  { key: 'gold', label: 'Gold', color: 'bg-yellow-500' },
                  { key: 'crypto', label: 'Crypto', color: 'bg-orange-500' },
                  { key: 'cash', label: 'Cash', color: 'bg-slate-400' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{label}</span>
                      <span>{((allocation[key as keyof Allocation] || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(allocation[key as keyof Allocation] || 0) * 100}
                      onChange={(e) => {
                        const newAlloc = manualOverride && manualAllocation 
                          ? { ...manualAllocation }
                          : { ...allocation };
                        newAlloc[key as keyof Allocation] = Number(e.target.value) / 100;
                        setManualAllocation(newAlloc);
                        setManualOverride(true);
                      }}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
              
              <div className={`mt-4 text-sm ${Math.abs(totalAllocation - 1) > 0.01 ? 'text-red-400' : 'text-green-400'}`}>
                Total: {(totalAllocation * 100).toFixed(0)}%
              </div>
            </div>
            
            {/* Worst Case Summary */}
            <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl border border-red-500/30 p-6">
              <h3 className="text-lg font-semibold mb-2">⚠️ Worst Case Scenario</h3>
              <div className="text-2xl font-bold text-red-400 mb-1">
                {formatPercent(worstCase.impact.portfolioReturn)}
              </div>
              <div className="text-slate-400 text-sm mb-2">{worstCase.scenario.name}</div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(portfolioValue * worstCase.impact.portfolioReturn)}
              </div>
              <div className="text-sm text-slate-400 mt-2">
                Recovery time: ~{worstCase.impact.recoveryTime} months
              </div>
            </div>
          </div>
          
          {/* Scenarios */}
          <div className="col-span-1 lg:col-span-8 space-y-6">
            {/* Overview Chart */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Impact Comparison</h2>
              <div className="space-y-4">
                {scenarioImpacts.map(({ scenario, impact }) => (
                  <div 
                    key={scenario.name}
                    className="cursor-pointer hover:bg-slate-700/30 rounded-lg p-3 -mx-3 transition-colors"
                    onClick={() => setSelectedScenario(scenario)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium">{scenario.name}</span>
                        <span className="text-slate-500 text-sm ml-2">
                          ({scenario.startDate.slice(0, 4)})
                        </span>
                      </div>
                      <div className={`font-bold ${impact.portfolioReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(impact.portfolioReturn)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${impact.portfolioReturn >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ 
                            width: `${Math.min(100, Math.abs(impact.portfolioReturn) * 100 * 2)}%`,
                            marginLeft: impact.portfolioReturn >= 0 ? '50%' : `${50 - Math.abs(impact.portfolioReturn) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="w-24 text-right text-sm text-slate-400">
                        {formatCurrency(portfolioValue * impact.portfolioReturn)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scenario Detail */}
            {selectedScenario && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">{selectedScenario.name}</h2>
                    <p className="text-slate-400">{selectedScenario.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedScenario(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-slate-400 text-sm">Duration</div>
                    <div className="text-xl font-bold">{selectedScenario.durationMonths} months</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-slate-400 text-sm">S&P 500 Drawdown</div>
                    <div className="text-xl font-bold text-red-400">
                      {(selectedScenario.metrics.maxDrawdown * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-slate-400 text-sm">VIX Peak</div>
                    <div className="text-xl font-bold">{selectedScenario.metrics.vixPeak.toFixed(1)}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-slate-400 text-sm">Recovery Time</div>
                    <div className="text-xl font-bold">{selectedScenario.recovery.monthsToRecover} months</div>
                  </div>
                </div>
                
                {/* Asset Class Performance */}
                <h3 className="font-semibold mb-4">Asset Class Performance</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.entries(selectedScenario.returns).map(([asset, ret]) => (
                    <div key={asset} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                      <span className="capitalize">{asset.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={`font-bold ${ret >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(ret)}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Your Portfolio Impact */}
                <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="font-semibold mb-4">Your Portfolio Impact</h3>
                  {(() => {
                    const impact = calculateScenarioImpact(selectedScenario, allocation);
                    return (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="text-slate-400 text-sm">Return</div>
                            <div className={`text-2xl font-bold ${impact.portfolioReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatPercent(impact.portfolioReturn)}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm">Dollar Impact</div>
                            <div className={`text-2xl font-bold ${impact.portfolioReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(portfolioValue * impact.portfolioReturn)}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm">Est. Recovery</div>
                            <div className="text-2xl font-bold">{impact.recoveryTime} months</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm text-slate-400 mb-2">Contribution by Asset</div>
                          {impact.comparison.map((item) => (
                            <div key={item.asset} className="flex items-center justify-between text-sm">
                              <span>{item.asset}</span>
                              <span className={item.contribution >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {formatPercent(item.contribution)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
                
                {/* Triggers */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">What Triggered This Crisis</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedScenario.triggers.map((trigger, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-700/50 rounded-full text-sm">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Methodology */}
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
              <details>
                <summary className="text-sm text-slate-400 cursor-pointer">📚 About This Analysis</summary>
                <div className="mt-4 text-xs text-slate-500 space-y-2">
                  <p><strong>Data Sources:</strong> Historical returns from S&P 500, MSCI EAFE, Bloomberg Aggregate Bond, FTSE NAREIT, Gold spot prices, Bitcoin.</p>
                  <p><strong>Scenarios:</strong> Based on actual peak-to-trough market performance during each crisis period.</p>
                  <p><strong>Recovery Time:</strong> Estimated based on historical recovery duration scaled by your portfolio's drawdown.</p>
                  <p><strong>Limitations:</strong> Past performance doesn't guarantee future results. Your actual portfolio may behave differently based on specific holdings, rebalancing, and contributions.</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
