'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import InteractivePortfolioChart, { Holding } from '@/components/InteractivePortfolioChart';
import RiskGauge from '@/components/RiskGauge';
import Sparkline from '@/components/Sparkline';

// Demo client data - in production, fetch based on ID
const DEMO_CLIENT = {
  id: '1',
  name: 'Robert & Linda Chen',
  aum: 1250000,
};

// Client performance data (L025: Show both historical AND expected returns)
const CLIENT_PERFORMANCE = {
  ytdReturn: 8.2,
  oneYearReturn: 12.4,
  threeYearReturn: 9.8,
  fiveYearReturn: 11.2,
  expectedReturn: 7.5,
  beta: 0.92,
  sharpeRatio: 1.24,
  sortinoRatio: 1.68,
  maxDrawdown: -12.3,
  riskScore: 6,
  benchmarkDiff: 1.2,
  volatility: 14.2,
  trackingError: 3.8,
  informationRatio: 0.32,
  upCapture: 94,
  downCapture: 82,
};

// 12-month trailing data for sparklines
const PERFORMANCE_SPARKLINES = {
  ytd: [0, 1.2, 0.8, 2.4, 3.1, 4.5, 5.2, 6.1, 5.8, 7.2, 7.8, 8.2],
  oneYear: [0, 2.1, 1.8, 4.2, 5.8, 7.2, 8.4, 9.1, 8.6, 10.2, 11.4, 12.4],
  threeYear: [0, 2.4, 4.1, 5.8, 7.2, 8.5, 9.1, 8.8, 9.2, 9.5, 9.6, 9.8],
  fiveYear: [0, 3.2, 5.8, 7.4, 8.9, 9.8, 10.4, 10.8, 11.0, 11.1, 11.2, 11.2],
  volatility: [16.2, 15.8, 15.2, 14.8, 14.5, 14.2, 14.0, 13.8, 14.0, 14.2, 14.1, 14.2],
};

// Reuse the Portfolio Lab tabs structure
const TABS = [
  { id: 'analysis', label: 'Analysis', icon: '📊' },
  { id: 'optimize', label: 'Optimize', icon: '⚡' },
  { id: 'stress-test', label: 'Stress Test', icon: '🔥' },
  { id: 'projections', label: 'Projections', icon: '📈' },
  { id: 'tax', label: 'Tax', icon: '📋' },
  { id: 'research', label: 'Research', icon: '🔍' },
];

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${value.toLocaleString()}`;
}

export default function ClientAnalyze() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('analysis');

  return (
    <div className="p-4 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/partners/clients" className="text-gray-400 hover:text-white min-h-[48px] flex items-center">
          Clients
        </Link>
        <span className="text-gray-600">/</span>
        <Link href={`/partners/clients/${params.id}`} className="text-gray-400 hover:text-white min-h-[48px] flex items-center">
          {DEMO_CLIENT.name}
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-amber-500 min-h-[48px] flex items-center">Portfolio Lab</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Portfolio Lab</h1>
          <p className="text-gray-400">
            Analyzing portfolio for <span className="text-amber-400">{DEMO_CLIENT.name}</span> • 
            ${(DEMO_CLIENT.aum / 1000000).toFixed(2)}M AUM
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button className="flex-1 sm:flex-none px-4 py-3 md:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px] text-sm md:text-base">
            📄 Generate Report
          </button>
          <button className="flex-1 sm:flex-none px-4 py-3 md:py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium min-h-[48px] text-sm md:text-base">
            Share with Client
          </button>
        </div>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="overflow-x-auto mb-6 md:mb-8">
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px] whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
        {activeTab === 'analysis' && <AnalysisTab />}
        {activeTab === 'optimize' && <OptimizeTab />}
        {activeTab === 'stress-test' && <StressTestTab />}
        {activeTab === 'projections' && <ProjectionsTab />}
        {activeTab === 'tax' && <TaxTab />}
        {activeTab === 'research' && <ResearchTab />}
      </div>
    </div>
  );
}

// Portfolio data for the analysis charts
const ANALYSIS_HOLDINGS: Holding[] = [
  { ticker: 'VTI', name: 'Vanguard Total Stock Market', value: 425000, costBasis: 380000, category: 'US Equity', subCategory: 'US Total Market' },
  { ticker: 'VXUS', name: 'Vanguard Total International', value: 187500, costBasis: 195000, category: 'International', subCategory: 'Intl Developed' },
  { ticker: 'BND', name: 'Vanguard Total Bond', value: 250000, costBasis: 245000, category: 'Bonds', subCategory: 'US Aggregate' },
  { ticker: 'AAPL', name: 'Apple Inc', value: 156250, costBasis: 120000, category: 'Individual Stocks', subCategory: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft Corp', value: 125000, costBasis: 100000, category: 'Individual Stocks', subCategory: 'Technology' },
  { ticker: 'Cash', name: 'Cash & Equivalents', value: 106250, costBasis: 106250, category: 'Cash', subCategory: 'Money Market' },
];

function AnalysisTab() {
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Portfolio Analysis</h2>
      
      {/* Risk/Return Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Risk Score</div>
          <div className="text-2xl font-bold text-amber-400">{CLIENT_PERFORMANCE.riskScore}/10</div>
          <div className="text-gray-500 text-xs">Moderate-High</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">YTD Return</div>
              <div className="text-2xl font-bold text-emerald-400">+{CLIENT_PERFORMANCE.ytdReturn}%</div>
            </div>
            <Sparkline data={PERFORMANCE_SPARKLINES.ytd} width={50} height={28} />
          </div>
          <div className="text-gray-500 text-xs">Historical</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Sharpe Ratio</div>
          <div className="text-2xl font-bold text-emerald-400">{CLIENT_PERFORMANCE.sharpeRatio}</div>
          <div className="text-gray-500 text-xs">Risk-adj return</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Expected Return</div>
              <div className="text-2xl font-bold text-amber-400">+{CLIENT_PERFORMANCE.expectedReturn}%</div>
            </div>
          </div>
          <div className="text-amber-400 text-xs">Based on allocation</div>
        </div>
      </div>

      {/* Risk Gauge + Performance Returns Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Metrics */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Risk Analysis</h3>
          <div className="mb-6">
            <RiskGauge score={CLIENT_PERFORMANCE.riskScore} size="lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-500 text-xs">Beta (vs S&P)</div>
              <div className="text-lg font-bold text-white">{CLIENT_PERFORMANCE.beta}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-500 text-xs">Volatility</div>
              <div className="text-lg font-bold text-white">{CLIENT_PERFORMANCE.volatility}%</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-500 text-xs">Max Drawdown</div>
              <div className="text-lg font-bold text-red-400">{CLIENT_PERFORMANCE.maxDrawdown}%</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-500 text-xs">Sortino Ratio</div>
              <div className="text-lg font-bold text-emerald-400">{CLIENT_PERFORMANCE.sortinoRatio}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-500 text-xs">Up Capture</div>
              <div className="text-lg font-bold text-emerald-400">{CLIENT_PERFORMANCE.upCapture}%</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-500 text-xs">Down Capture</div>
              <div className="text-lg font-bold text-emerald-400">{CLIENT_PERFORMANCE.downCapture}%</div>
            </div>
          </div>
        </div>

        {/* Performance Returns with Sparklines */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Performance (Historical + Expected)</h3>
          <div className="space-y-3">
            {/* YTD */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Sparkline data={PERFORMANCE_SPARKLINES.ytd} width={60} height={28} />
                <div>
                  <div className="text-white text-sm font-medium">YTD</div>
                  <div className="text-gray-500 text-xs">Historical</div>
                </div>
              </div>
              <div className="text-lg font-bold text-emerald-400">+{CLIENT_PERFORMANCE.ytdReturn}%</div>
            </div>
            {/* 1Y */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Sparkline data={PERFORMANCE_SPARKLINES.oneYear} width={60} height={28} />
                <div>
                  <div className="text-white text-sm font-medium">1 Year</div>
                  <div className="text-gray-500 text-xs">Historical</div>
                </div>
              </div>
              <div className="text-lg font-bold text-emerald-400">+{CLIENT_PERFORMANCE.oneYearReturn}%</div>
            </div>
            {/* 3Y */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Sparkline data={PERFORMANCE_SPARKLINES.threeYear} width={60} height={28} />
                <div>
                  <div className="text-white text-sm font-medium">3 Year (Ann.)</div>
                  <div className="text-gray-500 text-xs">Historical</div>
                </div>
              </div>
              <div className="text-lg font-bold text-emerald-400">+{CLIENT_PERFORMANCE.threeYearReturn}%</div>
            </div>
            {/* 5Y */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Sparkline data={PERFORMANCE_SPARKLINES.fiveYear} width={60} height={28} />
                <div>
                  <div className="text-white text-sm font-medium">5 Year (Ann.)</div>
                  <div className="text-gray-500 text-xs">Historical</div>
                </div>
              </div>
              <div className="text-lg font-bold text-emerald-400">+{CLIENT_PERFORMANCE.fiveYearReturn}%</div>
            </div>
            {/* Expected */}
            <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-[60px] flex justify-center text-amber-400 text-lg">📈</div>
                <div>
                  <div className="text-white text-sm font-medium">Expected (Ann.)</div>
                  <div className="text-amber-400 text-xs">Based on allocation</div>
                </div>
              </div>
              <div className="text-lg font-bold text-amber-400">+{CLIENT_PERFORMANCE.expectedReturn}%</div>
            </div>
            {/* Benchmark */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-gray-400">vs S&P 500 (YTD)</span>
              <span className="text-emerald-400 font-medium">+{CLIENT_PERFORMANCE.benchmarkDiff}% alpha</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Allocation Chart + Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6">
          <InteractivePortfolioChart
            holdings={ANALYSIS_HOLDINGS}
            totalValue={DEMO_CLIENT.aum}
            title="Asset Allocation (Click to Drill Down)"
            height={320}
            onHoldingClick={(holding) => setSelectedHolding(holding)}
          />
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Key Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg min-h-[56px]">
              <span className="text-amber-500">⚠️</span>
              <div>
                <div className="text-white text-sm font-medium">Concentration Risk</div>
                <div className="text-gray-400 text-xs">AAPL + MSFT = 22.5% of portfolio</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg min-h-[56px]">
              <span className="text-emerald-500">✓</span>
              <div>
                <div className="text-white text-sm font-medium">Low Fees</div>
                <div className="text-gray-400 text-xs">Expense ratio below benchmark (0.12%)</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg min-h-[56px]">
              <span className="text-blue-500">💡</span>
              <div>
                <div className="text-white text-sm font-medium">Tax-Loss Opportunity</div>
                <div className="text-gray-400 text-xs">VXUS has $8,200 harvestable loss</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg min-h-[56px]">
              <span className="text-purple-500">📊</span>
              <div>
                <div className="text-white text-sm font-medium">Strong Performance</div>
                <div className="text-gray-400 text-xs">Individual stocks up 36% avg on cost</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg min-h-[56px]">
              <span className="text-emerald-500">📈</span>
              <div>
                <div className="text-white text-sm font-medium">Good Risk-Adjusted Returns</div>
                <div className="text-gray-400 text-xs">Sharpe {CLIENT_PERFORMANCE.sharpeRatio} beats 80% of peers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Holding Modal */}
      {selectedHolding && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{selectedHolding.ticker || selectedHolding.name}</h3>
              <button
                onClick={() => setSelectedHolding(null)}
                className="text-gray-400 hover:text-white min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div className="text-gray-400 text-sm">{selectedHolding.name}</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-500 text-xs">Value</div>
                  <div className="text-white font-bold">{formatCurrency(selectedHolding.value)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-500 text-xs">Cost Basis</div>
                  <div className="text-white font-bold">{formatCurrency(selectedHolding.costBasis || selectedHolding.value)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-500 text-xs">Category</div>
                  <div className="text-white font-medium text-sm">{selectedHolding.category}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-500 text-xs">Gain/Loss</div>
                  {selectedHolding.costBasis && (
                    <div className={`font-bold ${selectedHolding.value >= selectedHolding.costBasis ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedHolding.value >= selectedHolding.costBasis ? '+' : ''}
                      {formatCurrency(selectedHolding.value - selectedHolding.costBasis)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => setSelectedHolding(null)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
                >
                  Research
                </button>
                <button className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors min-h-[48px]">
                  Trade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OptimizeTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Portfolio Optimization</h2>
      <div className="bg-white/5 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⚡</div>
        <p className="text-gray-400">
          AI-powered optimization suggestions based on {DEMO_CLIENT.name}'s risk profile and goals.
        </p>
        <button className="mt-4 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium min-h-[48px]">
          Run Optimization
        </button>
      </div>
    </div>
  );
}

function StressTestTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Stress Test Scenarios</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: '2008 Financial Crisis', impact: '-38%', color: 'text-red-500' },
          { name: 'COVID Crash (2020)', impact: '-24%', color: 'text-red-400' },
          { name: 'Rate Hike Cycle', impact: '-12%', color: 'text-amber-500' },
          { name: 'Tech Correction', impact: '-18%', color: 'text-red-400' },
          { name: 'Stagflation', impact: '-22%', color: 'text-red-400' },
          { name: 'Bull Market', impact: '+28%', color: 'text-emerald-500' },
        ].map((scenario) => (
          <div key={scenario.name} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer min-h-[100px]">
            <div className="text-white font-medium mb-2">{scenario.name}</div>
            <div className={`text-2xl font-bold ${scenario.color}`}>{scenario.impact}</div>
            <div className="text-gray-500 text-xs mt-1">Estimated portfolio impact</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectionsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Growth Projections</h2>
      <div className="bg-white/5 rounded-xl p-6">
        <div className="text-gray-400 mb-4">Projected portfolio value over time</div>
        <div className="h-64 flex items-end justify-around gap-4">
          {[
            { year: 'Now', value: 1.25, height: 30 },
            { year: '2028', value: 1.58, height: 45 },
            { year: '2030', value: 1.89, height: 55 },
            { year: '2032', value: 2.26, height: 65 },
            { year: '2034', value: 2.70, height: 78 },
            { year: '2036', value: 3.22, height: 90 },
          ].map((point) => (
            <div key={point.year} className="flex flex-col items-center gap-2">
              <div className="text-white text-sm font-medium">${point.value}M</div>
              <div 
                className="w-12 md:w-16 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all"
                style={{ height: `${point.height}%` }}
              />
              <div className="text-gray-500 text-xs">{point.year}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-gray-500 text-sm">
          Assuming 7% annual return, current contribution rate
        </div>
      </div>
    </div>
  );
}

function TaxTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Tax Optimization</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Tax-Loss Harvesting Opportunities</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg min-h-[56px]">
              <div>
                <div className="text-white font-medium">VXUS</div>
                <div className="text-gray-400 text-xs">Unrealized loss</div>
              </div>
              <div className="text-emerald-400 font-bold">-$8,200</div>
            </div>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Estimated Tax Savings</h3>
          <div className="text-4xl font-bold text-emerald-400 mb-2">$3,100</div>
          <div className="text-gray-400 text-sm">If harvested at 37.75% combined rate</div>
        </div>
      </div>
    </div>
  );
}

function ResearchTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Holdings Research</h2>
      <div className="bg-white/5 rounded-xl p-6">
        <p className="text-gray-400">Deep dive into individual holdings with analyst ratings, fundamentals, and news.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['AAPL', 'MSFT', 'VTI'].map((ticker) => (
            <button key={ticker} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left min-h-[72px]">
              <div className="text-white font-medium">{ticker}</div>
              <div className="text-gray-500 text-sm">View Research →</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
