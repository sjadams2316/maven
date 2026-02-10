'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Demo client data - in production, fetch based on ID
const DEMO_CLIENT = {
  id: '1',
  name: 'Robert & Linda Chen',
  aum: 1250000,
  holdings: [
    { ticker: 'VTI', name: 'Vanguard Total Stock Market', value: 425000, allocation: 34 },
    { ticker: 'VXUS', name: 'Vanguard Total International', value: 187500, allocation: 15 },
    { ticker: 'BND', name: 'Vanguard Total Bond', value: 250000, allocation: 20 },
    { ticker: 'AAPL', name: 'Apple Inc', value: 156250, allocation: 12.5 },
    { ticker: 'MSFT', name: 'Microsoft Corp', value: 125000, allocation: 10 },
    { ticker: 'Cash', name: 'Cash & Equivalents', value: 106250, allocation: 8.5 },
  ],
};

// Predefined stress test scenarios
const SCENARIOS = [
  {
    id: '2008-crisis',
    name: '2008 Financial Crisis',
    description: 'Global financial meltdown, housing crisis',
    impact: -38,
    icon: '📉',
    sectors: { stocks: -55, bonds: -5, cash: 0, international: -58 },
  },
  {
    id: 'covid-2020',
    name: 'COVID Crash 2020',
    description: 'Pandemic-driven market crash',
    impact: -24,
    icon: '🦠',
    sectors: { stocks: -34, bonds: 3, cash: 0, international: -32 },
  },
  {
    id: 'rate-hike',
    name: 'Rate Hike Cycle',
    description: 'Fed aggressive rate increases',
    impact: -12,
    icon: '📊',
    sectors: { stocks: -15, bonds: -18, cash: 0, international: -12 },
  },
  {
    id: 'tech-correction',
    name: 'Tech Correction',
    description: 'Technology sector selloff',
    impact: -18,
    icon: '💻',
    sectors: { stocks: -25, bonds: 2, cash: 0, international: -15 },
  },
  {
    id: 'stagflation',
    name: 'Stagflation',
    description: 'High inflation with slow growth',
    impact: -22,
    icon: '📈',
    sectors: { stocks: -28, bonds: -15, cash: 0, international: -25 },
  },
  {
    id: 'bull-market',
    name: 'Bull Market',
    description: 'Strong economic expansion',
    impact: 28,
    icon: '🚀',
    sectors: { stocks: 35, bonds: 5, cash: 0, international: 32 },
  },
];

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

interface StressResult {
  scenarioName: string;
  impact: number;
  dollarImpact: number;
  holdingBreakdown: Array<{
    ticker: string;
    name: string;
    originalValue: number;
    stressedValue: number;
    change: number;
  }>;
}

export default function StressTestPage() {
  const params = useParams();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [stressResult, setStressResult] = useState<StressResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Custom scenario builder state
  const [customMarketDrop, setCustomMarketDrop] = useState<number>(-20);
  const [customSector, setCustomSector] = useState<string>('all');
  const [customDuration, setCustomDuration] = useState<string>('6');

  const runScenarioAnalysis = (scenarioId: string) => {
    setIsRunning(true);
    setSelectedScenario(scenarioId);
    
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    // Simulate analysis delay
    setTimeout(() => {
      const holdingBreakdown = DEMO_CLIENT.holdings.map(holding => {
        let impactMultiplier = scenario.impact / 100;
        
        // Apply sector-specific impacts
        if (holding.ticker === 'BND') {
          impactMultiplier = scenario.sectors.bonds / 100;
        } else if (holding.ticker === 'Cash') {
          impactMultiplier = scenario.sectors.cash / 100;
        } else if (holding.ticker === 'VXUS') {
          impactMultiplier = scenario.sectors.international / 100;
        } else {
          impactMultiplier = scenario.sectors.stocks / 100;
        }

        const stressedValue = holding.value * (1 + impactMultiplier);
        return {
          ticker: holding.ticker,
          name: holding.name,
          originalValue: holding.value,
          stressedValue: stressedValue,
          change: impactMultiplier * 100,
        };
      });

      const totalStressedValue = holdingBreakdown.reduce((sum, h) => sum + h.stressedValue, 0);
      const dollarImpact = totalStressedValue - DEMO_CLIENT.aum;

      setStressResult({
        scenarioName: scenario.name,
        impact: scenario.impact,
        dollarImpact,
        holdingBreakdown,
      });
      setIsRunning(false);
    }, 800);
  };

  const runCustomScenario = () => {
    setIsRunning(true);
    setSelectedScenario('custom');

    setTimeout(() => {
      const holdingBreakdown = DEMO_CLIENT.holdings.map(holding => {
        let impactMultiplier = customMarketDrop / 100;
        
        // Apply sector-specific impacts for custom scenario
        if (customSector === 'tech' && (holding.ticker === 'AAPL' || holding.ticker === 'MSFT')) {
          impactMultiplier = customMarketDrop * 1.5 / 100;
        } else if (customSector === 'bonds' && holding.ticker === 'BND') {
          impactMultiplier = customMarketDrop / 100;
        } else if (customSector === 'bonds' && holding.ticker !== 'BND' && holding.ticker !== 'Cash') {
          impactMultiplier = customMarketDrop * 0.3 / 100;
        } else if (holding.ticker === 'Cash') {
          impactMultiplier = 0;
        } else if (holding.ticker === 'BND' && customSector !== 'bonds') {
          impactMultiplier = customMarketDrop * 0.2 / 100;
        }

        const stressedValue = holding.value * (1 + impactMultiplier);
        return {
          ticker: holding.ticker,
          name: holding.name,
          originalValue: holding.value,
          stressedValue: stressedValue,
          change: impactMultiplier * 100,
        };
      });

      const totalStressedValue = holdingBreakdown.reduce((sum, h) => sum + h.stressedValue, 0);
      const dollarImpact = totalStressedValue - DEMO_CLIENT.aum;
      const actualImpact = (dollarImpact / DEMO_CLIENT.aum) * 100;

      setStressResult({
        scenarioName: `Custom Scenario (${customMarketDrop}% ${customSector === 'all' ? 'Market' : customSector.charAt(0).toUpperCase() + customSector.slice(1)})`,
        impact: actualImpact,
        dollarImpact,
        holdingBreakdown,
      });
      setIsRunning(false);
    }, 800);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4 md:mb-6 flex-wrap">
        <Link 
          href="/partners/clients" 
          className="text-gray-400 hover:text-white min-h-[48px] md:min-h-0 flex items-center"
        >
          Clients
        </Link>
        <span className="text-gray-600">/</span>
        <Link 
          href={`/partners/clients/${params.id}`} 
          className="text-gray-400 hover:text-white min-h-[48px] md:min-h-0 flex items-center"
        >
          {DEMO_CLIENT.name}
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-amber-500">Stress Test</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Portfolio Stress Test</h1>
          <p className="text-gray-400">
            Test <span className="text-amber-400">{DEMO_CLIENT.name}</span>&apos;s portfolio against 
            market scenarios • {formatCurrency(DEMO_CLIENT.aum)} AUM
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button className="flex-1 sm:flex-none px-4 py-3 md:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2 text-sm md:text-base">
            <span>📤</span>
            <span>Share with Client</span>
          </button>
          <button className="flex-1 sm:flex-none px-4 py-3 md:py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium min-h-[48px] flex items-center justify-center gap-2 text-sm md:text-base">
            <span>📄</span>
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Historical Scenarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {SCENARIOS.map((scenario) => {
            const dollarImpact = DEMO_CLIENT.aum * (scenario.impact / 100);
            const isSelected = selectedScenario === scenario.id;
            const isPositive = scenario.impact > 0;
            
            return (
              <div
                key={scenario.id}
                className={`bg-[#12121a] border rounded-2xl p-4 md:p-5 transition-all ${
                  isSelected 
                    ? 'border-amber-500 ring-1 ring-amber-500/50' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl md:text-3xl">{scenario.icon}</div>
                  <div className={`text-xl md:text-2xl font-bold ${
                    isPositive ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {isPositive ? '+' : ''}{scenario.impact}%
                  </div>
                </div>
                
                <h3 className="text-white font-semibold text-base md:text-lg mb-1">
                  {scenario.name}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm mb-3">
                  {scenario.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-xs md:text-sm">Estimated Impact</span>
                  <span className={`font-semibold text-sm md:text-base ${
                    isPositive ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {isPositive ? '+' : ''}{formatCurrency(dollarImpact)}
                  </span>
                </div>

                <button
                  onClick={() => runScenarioAnalysis(scenario.id)}
                  disabled={isRunning}
                  className={`w-full py-3 rounded-xl text-sm font-medium transition-colors min-h-[48px] ${
                    isSelected
                      ? 'bg-amber-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRunning && isSelected ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Running...
                    </span>
                  ) : (
                    'Run Detailed Analysis'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Scenario Builder */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Custom Scenario Builder</h2>
        <p className="text-gray-400 text-sm mb-6">
          Create a custom stress test with your own parameters
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Market Drop % */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Market Change %</label>
            <div className="relative">
              <input
                type="number"
                value={customMarketDrop}
                onChange={(e) => setCustomMarketDrop(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px] text-base"
                min="-100"
                max="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="text-gray-500 text-xs mt-1">Negative for drops, positive for gains</p>
          </div>

          {/* Sector Focus */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Sector Focus</label>
            <select
              value={customSector}
              onChange={(e) => setCustomSector(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px] text-base appearance-none cursor-pointer"
            >
              <option value="all">All Sectors</option>
              <option value="tech">Technology</option>
              <option value="bonds">Bonds</option>
              <option value="international">International</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Duration (months)</label>
            <select
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px] text-base appearance-none cursor-pointer"
            >
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
            </select>
          </div>
        </div>

        <button
          onClick={runCustomScenario}
          disabled={isRunning}
          className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning && selectedScenario === 'custom' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Running Custom Analysis...
            </span>
          ) : (
            'Run Custom Scenario'
          )}
        </button>
      </div>

      {/* Results Section */}
      {stressResult && (
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-white">
                Stress Test Results
              </h2>
              <p className="text-gray-400 text-sm">{stressResult.scenarioName}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-gray-400 text-xs mb-1">Portfolio Impact</div>
                <div className={`text-xl md:text-2xl font-bold ${
                  stressResult.impact >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {stressResult.impact >= 0 ? '+' : ''}{stressResult.impact.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-xs mb-1">Dollar Impact</div>
                <div className={`text-xl md:text-2xl font-bold ${
                  stressResult.dollarImpact >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {stressResult.dollarImpact >= 0 ? '+' : ''}{formatCurrency(stressResult.dollarImpact)}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-3 md:p-4">
              <div className="text-gray-400 text-xs md:text-sm">Current Value</div>
              <div className="text-lg md:text-xl font-bold text-white">
                {formatCurrency(DEMO_CLIENT.aum)}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 md:p-4">
              <div className="text-gray-400 text-xs md:text-sm">Stressed Value</div>
              <div className={`text-lg md:text-xl font-bold ${
                stressResult.dollarImpact >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {formatCurrency(DEMO_CLIENT.aum + stressResult.dollarImpact)}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 md:p-4">
              <div className="text-gray-400 text-xs md:text-sm">Best Performer</div>
              <div className="text-lg md:text-xl font-bold text-emerald-400">
                {stressResult.holdingBreakdown.reduce((best, h) => 
                  h.change > best.change ? h : best
                ).ticker}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 md:p-4">
              <div className="text-gray-400 text-xs md:text-sm">Worst Performer</div>
              <div className="text-lg md:text-xl font-bold text-red-400">
                {stressResult.holdingBreakdown.reduce((worst, h) => 
                  h.change < worst.change ? h : worst
                ).ticker}
              </div>
            </div>
          </div>

          {/* Holdings Breakdown */}
          <h3 className="text-white font-semibold mb-4">Portfolio Breakdown Under Stress</h3>
          
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-3">
            {stressResult.holdingBreakdown.map((holding) => (
              <div key={holding.ticker} className="p-3 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-white font-medium">{holding.ticker}</div>
                    <div className="text-gray-500 text-xs">{holding.name}</div>
                  </div>
                  <div className={`text-sm font-semibold ${
                    holding.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(1)}%
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {formatCurrency(holding.originalValue)} → 
                  </span>
                  <span className={holding.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {formatCurrency(holding.stressedValue)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b border-white/10">
                  <th className="pb-4 font-medium">Holding</th>
                  <th className="pb-4 font-medium text-right">Current Value</th>
                  <th className="pb-4 font-medium text-right">Stressed Value</th>
                  <th className="pb-4 font-medium text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {stressResult.holdingBreakdown.map((holding) => (
                  <tr key={holding.ticker} className="border-b border-white/5">
                    <td className="py-4">
                      <div className="text-white font-medium">{holding.ticker}</div>
                      <div className="text-gray-500 text-sm">{holding.name}</div>
                    </td>
                    <td className="py-4 text-right text-white">
                      {formatCurrency(holding.originalValue)}
                    </td>
                    <td className={`py-4 text-right ${
                      holding.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(holding.stressedValue)}
                    </td>
                    <td className={`py-4 text-right font-semibold ${
                      holding.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <td className="pt-4 text-white font-semibold">Total</td>
                  <td className="pt-4 text-right text-white font-semibold">
                    {formatCurrency(DEMO_CLIENT.aum)}
                  </td>
                  <td className={`pt-4 text-right font-semibold ${
                    stressResult.dollarImpact >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(DEMO_CLIENT.aum + stressResult.dollarImpact)}
                  </td>
                  <td className={`pt-4 text-right font-bold ${
                    stressResult.impact >= 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {stressResult.impact >= 0 ? '+' : ''}{stressResult.impact.toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-white/10">
            <button className="flex-1 sm:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2">
              <span>📤</span>
              <span>Share with Client</span>
            </button>
            <button className="flex-1 sm:flex-none px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium min-h-[48px] flex items-center justify-center gap-2">
              <span>📄</span>
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State when no results */}
      {!stressResult && (
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8 md:p-12 text-center">
          <div className="text-4xl mb-4">🔥</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Run a Stress Test
          </h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Select a historical scenario above or create a custom scenario to see how 
            {DEMO_CLIENT.name}&apos;s portfolio would perform under market stress.
          </p>
        </div>
      )}
    </div>
  );
}
