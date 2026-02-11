'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

// Demo data
const DEMO_PORTFOLIO = {
  totalValue: 850000,
  ytdReturn: 8.2,
  ytdChange: 64450,
  lastUpdated: '2024-02-10',
  allocations: [
    { name: 'US Stocks', value: 382500, percentage: 45, color: '#f59e0b' },
    { name: 'International Stocks', value: 170000, percentage: 20, color: '#8b5cf6' },
    { name: 'Bonds', value: 212500, percentage: 25, color: '#06b6d4' },
    { name: 'Cash', value: 85000, percentage: 10, color: '#10b981' },
  ],
  accounts: [
    { name: 'Retirement (401k)', value: 525000, ytdReturn: 9.1 },
    { name: 'Taxable Brokerage', value: 250000, ytdReturn: 6.8 },
    { name: 'Roth IRA', value: 75000, ytdReturn: 8.5 },
  ],
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// L006: Skeleton matches real layout - dark theme
function PortfolioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-36 bg-white/10 rounded animate-pulse" />
      
      {/* Value skeleton */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <div className="h-4 w-20 bg-white/10 rounded animate-pulse mb-2" />
        <div className="h-10 w-48 bg-white/10 rounded animate-pulse mb-3" />
        <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
      </div>
      
      {/* Allocation skeleton */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <div className="h-5 w-28 bg-white/10 rounded animate-pulse mb-4" />
        <div className="h-4 w-full bg-white/10 rounded-full animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Accounts skeleton */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(DEMO_PORTFOLIO);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <PortfolioSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Your Portfolio</h1>

      {/* Total value card */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <p className="text-sm text-gray-400 mb-1">Total Value</p>
        <p className="text-4xl font-bold text-white">
          {formatCurrency(portfolio.totalValue)}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <div 
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium',
              portfolio.ytdReturn >= 0 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {portfolio.ytdReturn >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {formatPercent(portfolio.ytdReturn)} YTD
          </div>
          <span className="text-sm text-gray-500">
            ({formatCurrency(portfolio.ytdChange)})
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Last updated {new Date(portfolio.lastUpdated).toLocaleDateString()}
        </p>
      </div>

      {/* Simple allocation view - no complex charts */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Allocation</h2>
        
        {/* Simple bar visualization */}
        <div className="flex rounded-full overflow-hidden h-4 mb-4 bg-white/5">
          {portfolio.allocations.map((alloc) => (
            <div
              key={alloc.name}
              className="h-full transition-all duration-500"
              style={{ 
                backgroundColor: alloc.color,
                width: `${alloc.percentage}%`
              }}
            />
          ))}
        </div>
        
        {/* Legend */}
        <div className="space-y-3">
          {portfolio.allocations.map((alloc) => (
            <div key={alloc.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: alloc.color }}
                />
                <span className="text-gray-300">{alloc.name}</span>
              </div>
              <div className="text-right">
                <span className="font-medium text-white">
                  {formatCurrency(alloc.value)}
                </span>
                <span className="text-gray-500 ml-2 text-sm">
                  {alloc.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accounts breakdown */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Your Accounts</h2>
        <div className="space-y-4">
          {portfolio.accounts.map((account) => (
            <div 
              key={account.name}
              className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
            >
              <div>
                <p className="font-medium text-white">{account.name}</p>
                <p className={clsx(
                  'text-sm',
                  account.ytdReturn >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {formatPercent(account.ytdReturn)} YTD
                </p>
              </div>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(account.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Friendly disclaimer */}
      <p className="text-sm text-gray-500 text-center px-4">
        This summary is for informational purposes. Contact your advisor for personalized advice.
      </p>
    </div>
  );
}
