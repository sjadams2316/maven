'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Demo client data - in production, fetch based on ID
const DEMO_CLIENT = {
  id: '1',
  name: 'Robert & Linda Chen',
  aum: 1250000,
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

export default function ClientAnalyze() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('analysis');

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/partners/clients" className="text-gray-400 hover:text-white">
          Clients
        </Link>
        <span className="text-gray-600">/</span>
        <Link href={`/partners/clients/${params.id}`} className="text-gray-400 hover:text-white">
          {DEMO_CLIENT.name}
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-amber-500">Portfolio Lab</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio Lab</h1>
          <p className="text-gray-400">
            Analyzing portfolio for <span className="text-amber-400">{DEMO_CLIENT.name}</span> • 
            ${(DEMO_CLIENT.aum / 1000000).toFixed(2)}M AUM
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
            📄 Generate Report
          </button>
          <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium">
            Share with Client
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px] ${
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

      {/* Tab Content */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
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

function AnalysisTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Portfolio Analysis</h2>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Risk Score</div>
          <div className="text-2xl font-bold text-amber-400">72</div>
          <div className="text-gray-500 text-xs">Moderate-High</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Diversification</div>
          <div className="text-2xl font-bold text-emerald-400">B+</div>
          <div className="text-gray-500 text-xs">Above Average</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Expense Ratio</div>
          <div className="text-2xl font-bold text-white">0.12%</div>
          <div className="text-gray-500 text-xs">$1,500/year</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Tax Efficiency</div>
          <div className="text-2xl font-bold text-emerald-400">A-</div>
          <div className="text-gray-500 text-xs">Well Optimized</div>
        </div>
      </div>

      {/* Allocation */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Asset Allocation</h3>
          <div className="space-y-3">
            {[
              { label: 'US Stocks', pct: 48, color: 'bg-blue-500' },
              { label: 'International', pct: 18, color: 'bg-emerald-500' },
              { label: 'Bonds', pct: 20, color: 'bg-amber-500' },
              { label: 'Individual Stocks', pct: 14, color: 'bg-purple-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{item.label}</span>
                  <span className="text-white">{item.pct}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Key Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <span className="text-amber-500">⚠️</span>
              <div>
                <div className="text-white text-sm font-medium">Concentration Risk</div>
                <div className="text-gray-400 text-xs">AAPL + MSFT = 22.5% of portfolio</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <span className="text-emerald-500">✓</span>
              <div>
                <div className="text-white text-sm font-medium">Low Fees</div>
                <div className="text-gray-400 text-xs">Expense ratio below benchmark</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <span className="text-blue-500">💡</span>
              <div>
                <div className="text-white text-sm font-medium">Tax-Loss Opportunity</div>
                <div className="text-gray-400 text-xs">VXUS has $8,200 harvestable loss</div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        <button className="mt-4 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium">
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
      <div className="grid grid-cols-3 gap-4">
        {[
          { name: '2008 Financial Crisis', impact: '-38%', color: 'text-red-500' },
          { name: 'COVID Crash (2020)', impact: '-24%', color: 'text-red-400' },
          { name: 'Rate Hike Cycle', impact: '-12%', color: 'text-amber-500' },
          { name: 'Tech Correction', impact: '-18%', color: 'text-red-400' },
          { name: 'Stagflation', impact: '-22%', color: 'text-red-400' },
          { name: 'Bull Market', impact: '+28%', color: 'text-emerald-500' },
        ].map((scenario) => (
          <div key={scenario.name} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer">
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
                className="w-16 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all"
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
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Tax-Loss Harvesting Opportunities</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
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
        <div className="mt-4 grid grid-cols-3 gap-4">
          {['AAPL', 'MSFT', 'VTI'].map((ticker) => (
            <button key={ticker} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left">
              <div className="text-white font-medium">{ticker}</div>
              <div className="text-gray-500 text-sm">View Research →</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
