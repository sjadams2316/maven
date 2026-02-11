'use client';

import { useState } from 'react';

// Demo portfolio - simplified for clients, no fees or trading recommendations
const DEMO_PORTFOLIO = {
  totalValue: 850000,
  todayChange: 2380,
  todayChangePercent: 0.28,
  ytdReturn: 8.2,
  ytdDollars: 64450,
  accounts: [
    { 
      id: '1', 
      name: 'Joint Investment Account', 
      value: 425000, 
      type: 'Taxable',
      change: 1.2,
    },
    { 
      id: '2', 
      name: "John's IRA", 
      value: 225000, 
      type: 'Retirement',
      change: 0.8,
    },
    { 
      id: '3', 
      name: "Sarah's IRA", 
      value: 175000, 
      type: 'Retirement',
      change: 0.9,
    },
    { 
      id: '4', 
      name: 'Emergency Fund', 
      value: 25000, 
      type: 'Savings',
      change: 0.1,
    },
  ],
  allocation: [
    { category: 'US Stocks', percent: 48, color: '#3B82F6' },
    { category: 'International Stocks', percent: 18, color: '#8B5CF6' },
    { category: 'Bonds', percent: 22, color: '#10B981' },
    { category: 'Real Estate', percent: 7, color: '#F59E0B' },
    { category: 'Cash', percent: 5, color: '#6B7280' },
  ],
  performance: {
    oneMonth: 1.2,
    threeMonth: 3.8,
    oneYear: 12.4,
    threeYear: 9.2,
    sinceInception: 11.8,
    inceptionDate: '2022-03-15',
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Simple pie chart using CSS
function AllocationChart({ allocation }: { allocation: typeof DEMO_PORTFOLIO.allocation }) {
  let cumulativePercent = 0;
  const segments = allocation.map((item) => {
    const segment = {
      ...item,
      startPercent: cumulativePercent,
    };
    cumulativePercent += item.percent;
    return segment;
  });

  // Create conic gradient
  const gradientStops = segments.map((seg) => 
    `${seg.color} ${seg.startPercent}% ${seg.startPercent + seg.percent}%`
  ).join(', ');

  return (
    <div className="relative w-48 h-48 mx-auto">
      <div 
        className="w-full h-full rounded-full"
        style={{ background: `conic-gradient(${gradientStops})` }}
      />
      <div className="absolute inset-4 bg-[#0a0a0f] rounded-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">100%</p>
          <p className="text-gray-500 text-xs">Invested</p>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'performance'>('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Your Portfolio</h1>
        <p className="text-gray-400">A snapshot of your investments</p>
      </div>

      {/* Total Value Hero */}
      <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border border-emerald-500/20 rounded-2xl p-6">
        <p className="text-emerald-400/80 text-sm mb-2">Total Portfolio Value</p>
        <p className="text-4xl font-bold text-white mb-2">
          {formatCurrency(DEMO_PORTFOLIO.totalValue)}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className={`font-medium ${DEMO_PORTFOLIO.todayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {DEMO_PORTFOLIO.todayChange >= 0 ? '+' : ''}{formatCurrency(DEMO_PORTFOLIO.todayChange)} today
          </span>
          <span className="text-gray-500">•</span>
          <span className={`font-medium ${DEMO_PORTFOLIO.ytdReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {DEMO_PORTFOLIO.ytdReturn >= 0 ? '+' : ''}{DEMO_PORTFOLIO.ytdReturn}% YTD
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'accounts', label: 'Accounts' },
          { id: 'performance', label: 'Performance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Allocation */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6">Asset Allocation</h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <AllocationChart allocation={DEMO_PORTFOLIO.allocation} />
              <div className="flex-1 space-y-3 w-full">
                {DEMO_PORTFOLIO.allocation.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-300 text-sm">{item.category}</span>
                    </div>
                    <span className="text-white font-medium">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Simple Message */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="text-2xl">📊</div>
              <div>
                <p className="text-white font-medium mb-1">Diversified & Balanced</p>
                <p className="text-gray-400 text-sm">
                  Your portfolio is spread across different asset types to manage risk 
                  while pursuing growth. Your advisor regularly reviews and adjusts 
                  your allocation to keep you on track.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          {DEMO_PORTFOLIO.accounts.map((account) => (
            <div 
              key={account.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{account.name}</p>
                  <p className="text-gray-500 text-sm">{account.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{formatCurrency(account.value)}</p>
                  <p className={`text-sm ${account.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {account.change >= 0 ? '+' : ''}{account.change}% today
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Total */}
          <div className="bg-white/5 border border-white/20 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Total</p>
              <p className="text-white font-bold text-xl">{formatCurrency(DEMO_PORTFOLIO.totalValue)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Performance Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: '1 Month', value: DEMO_PORTFOLIO.performance.oneMonth },
              { label: '3 Months', value: DEMO_PORTFOLIO.performance.threeMonth },
              { label: '1 Year', value: DEMO_PORTFOLIO.performance.oneYear },
              { label: '3 Years', value: DEMO_PORTFOLIO.performance.threeYear },
              { label: 'Since Inception', value: DEMO_PORTFOLIO.performance.sinceInception },
            ].map((period) => (
              <div key={period.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">{period.label}</p>
                <p className={`text-xl font-bold ${period.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {period.value >= 0 ? '+' : ''}{period.value}%
                </p>
              </div>
            ))}
          </div>

          {/* Context */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="text-2xl">📈</div>
              <div>
                <p className="text-white font-medium mb-1">Long-Term Focus</p>
                <p className="text-gray-400 text-sm">
                  Markets go up and down in the short term, but your portfolio is designed 
                  for long-term growth. We're focused on your goals, not daily fluctuations.
                </p>
              </div>
            </div>
          </div>

          {/* Inception Note */}
          <p className="text-gray-500 text-xs text-center">
            Performance since inception ({new Date(DEMO_PORTFOLIO.performance.inceptionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})
          </p>
        </div>
      )}

      {/* Questions CTA */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
        <p className="text-gray-400 text-sm mb-3">Have questions about your portfolio?</p>
        <a
          href="/c/DEMO-JS123/contact"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
        >
          💬 Ask your advisor
        </a>
      </div>
    </div>
  );
}
