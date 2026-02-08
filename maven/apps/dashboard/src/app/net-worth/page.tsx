'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

// Mock historical net worth data
const MOCK_HISTORY = [
  { date: '2025-03-01', value: 680000 },
  { date: '2025-04-01', value: 720000 },
  { date: '2025-05-01', value: 710000 },
  { date: '2025-06-01', value: 780000 },
  { date: '2025-07-01', value: 820000 },
  { date: '2025-08-01', value: 790000 },
  { date: '2025-09-01', value: 850000 },
  { date: '2025-10-01', value: 920000 },
  { date: '2025-11-01', value: 980000 },
  { date: '2025-12-01', value: 1050000 },
  { date: '2026-01-01', value: 1100000 },
  { date: '2026-02-01', value: 1150000 },
];

const MOCK_ACCOUNTS = [
  { name: '401(k)', value: 83000, type: 'retirement', institution: 'Capital Group', change: 2.1 },
  { name: 'Traditional IRA', value: 150000, type: 'retirement', institution: 'Schwab', change: 1.8 },
  { name: 'Brokerage', value: 103000, type: 'taxable', institution: 'Schwab', change: 3.2 },
  { name: 'CIFR + IREN', value: 130000, type: 'taxable', institution: 'Schwab', change: -1.5 },
  { name: 'TAO Holdings', value: 684000, type: 'crypto', institution: 'Various', change: 4.8 },
];

const MOCK_MILESTONES = [
  { date: '2024-06-15', title: 'Hit $500K', icon: '🎯' },
  { date: '2025-02-01', title: 'Hit $750K', icon: '🚀' },
  { date: '2025-10-15', title: 'Hit $1M', icon: '💎' },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export default function NetWorthPage() {
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1Y');
  
  const currentNetWorth = MOCK_HISTORY[MOCK_HISTORY.length - 1].value;
  const previousNetWorth = MOCK_HISTORY[MOCK_HISTORY.length - 2].value;
  const change = currentNetWorth - previousNetWorth;
  const changePercent = (change / previousNetWorth) * 100;
  
  const yearStart = MOCK_HISTORY.find(h => h.date.startsWith('2026-01'))?.value || currentNetWorth;
  const ytdChange = currentNetWorth - yearStart;
  const ytdChangePercent = (ytdChange / yearStart) * 100;
  
  const maxValue = Math.max(...MOCK_HISTORY.map(h => h.value));
  const minValue = Math.min(...MOCK_HISTORY.map(h => h.value));
  
  // Filter history based on time range
  const getFilteredHistory = () => {
    const now = new Date();
    const ranges: Record<string, number> = {
      '1M': 1,
      '3M': 3,
      '6M': 6,
      '1Y': 12,
      'ALL': 999,
    };
    const months = ranges[timeRange];
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, 1);
    return MOCK_HISTORY.filter(h => new Date(h.date) >= cutoff);
  };
  
  const filteredHistory = getFilteredHistory();
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Net Worth</h1>
          <p className="text-gray-400 mt-1">Track your wealth over time</p>
        </div>
        
        {/* Current Net Worth */}
        <div className="bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/20 border border-indigo-500/30 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-indigo-300 text-sm mb-1">Total Net Worth</p>
              <p className="text-4xl sm:text-5xl font-bold text-white">
                {formatCurrency(currentNetWorth)}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {change >= 0 ? '+' : ''}{formatCurrency(change)} ({changePercent.toFixed(1)}%) this month
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    timeRange === range
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart */}
          <div className="h-48 flex items-end gap-1">
            {filteredHistory.map((point, idx) => {
              const height = ((point.value - minValue) / (maxValue - minValue)) * 100;
              const isLast = idx === filteredHistory.length - 1;
              
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center group relative"
                >
                  <div
                    className={`w-full rounded-t transition-all ${
                      isLast 
                        ? 'bg-indigo-400' 
                        : 'bg-indigo-600/50 hover:bg-indigo-500/50'
                    }`}
                    style={{ height: `${Math.max(5, height)}%` }}
                  />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}: {formatCurrency(point.value)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">YTD Change</p>
            <p className={`text-xl font-bold ${ytdChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {ytdChange >= 0 ? '+' : ''}{formatCurrency(ytdChange)}
            </p>
            <p className={`text-sm ${ytdChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {ytdChangePercent >= 0 ? '+' : ''}{ytdChangePercent.toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">All-Time High</p>
            <p className="text-xl font-bold text-white">{formatCurrency(maxValue)}</p>
            <p className="text-sm text-gray-500">Feb 2026</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Accounts</p>
            <p className="text-xl font-bold text-white">{MOCK_ACCOUNTS.length}</p>
            <p className="text-sm text-gray-500">Linked</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Milestones</p>
            <p className="text-xl font-bold text-amber-400">{MOCK_MILESTONES.length}</p>
            <p className="text-sm text-gray-500">Achieved</p>
          </div>
        </div>
        
        {/* Accounts Breakdown */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Account Breakdown</h2>
          
          <div className="space-y-3">
            {MOCK_ACCOUNTS.sort((a, b) => b.value - a.value).map((account, idx) => {
              const percentage = (account.value / currentNetWorth) * 100;
              
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                    account.type === 'retirement' 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                      : account.type === 'crypto'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                  }`}>
                    {account.name.slice(0, 2)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-white font-medium">{account.name}</span>
                        <span className="text-gray-500 text-sm ml-2">{account.institution}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-medium">{formatCurrency(account.value)}</span>
                        <span className={`text-sm ml-2 ${account.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {account.change >= 0 ? '+' : ''}{account.change}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          account.type === 'retirement' 
                            ? 'bg-blue-500'
                            : account.type === 'crypto'
                            ? 'bg-purple-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <span className="text-gray-500 text-sm w-12 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Milestones */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Milestones Achieved 🏆</h2>
          
          <div className="flex gap-4 overflow-x-auto pb-2">
            {MOCK_MILESTONES.map((milestone, idx) => (
              <div 
                key={idx}
                className="flex-shrink-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 min-w-[160px]"
              >
                <span className="text-3xl block mb-2">{milestone.icon}</span>
                <p className="text-white font-medium">{milestone.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))}
            
            {/* Next milestone */}
            <div className="flex-shrink-0 bg-white/5 border border-dashed border-white/20 rounded-xl p-4 min-w-[160px] flex flex-col items-center justify-center text-center">
              <span className="text-2xl text-gray-600 mb-2">🎯</span>
              <p className="text-gray-500 text-sm">Next: $1.5M</p>
              <p className="text-xs text-gray-600">$350K to go</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
