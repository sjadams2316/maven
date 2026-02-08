'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

// Mock data
const MOCK_METRICS = {
  totalAUM: 5340000,
  aumGrowth: 12.4,
  clientCount: 8,
  avgClientAUM: 667500,
  meetingsThisMonth: 12,
  meetingsLastMonth: 10,
  insightsGenerated: 47,
  insightsActedOn: 31,
  taxSavingsIdentified: 18400,
  taxSavingsRealized: 12200,
  avgClientEngagement: 78, // percentage
  clientSatisfaction: 92, // NPS-ish score
};

const MOCK_MONTHLY_AUM = [
  { month: 'Sep', value: 4200000 },
  { month: 'Oct', value: 4450000 },
  { month: 'Nov', value: 4680000 },
  { month: 'Dec', value: 4920000 },
  { month: 'Jan', value: 5150000 },
  { month: 'Feb', value: 5340000 },
];

const MOCK_CLIENT_ENGAGEMENT = [
  { name: 'Sam Adams', engagement: 95, lastLogin: '2h ago', logins: 24 },
  { name: 'Sarah Chen', engagement: 88, lastLogin: '1d ago', logins: 18 },
  { name: 'Jane Smith', engagement: 72, lastLogin: '3d ago', logins: 12 },
  { name: 'David Kim', engagement: 65, lastLogin: '5d ago', logins: 8 },
  { name: 'Lisa Park', engagement: 58, lastLogin: '10d ago', logins: 6 },
  { name: 'Bob Jones', engagement: 45, lastLogin: '7d ago', logins: 4 },
  { name: 'Michael Torres', engagement: 32, lastLogin: '14d ago', logins: 2 },
  { name: 'Emily Watson', engagement: 15, lastLogin: '45d ago', logins: 1 },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  return `$${(amount / 1000).toFixed(0)}K`;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6m');
  
  const maxAUM = Math.max(...MOCK_MONTHLY_AUM.map(m => m.value));
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Link href="/advisor" className="hover:text-white transition">Advisor</Link>
              <span>/</span>
              <span className="text-white">Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Practice Analytics</h1>
            <p className="text-gray-400 mt-1">Track your practice performance and client engagement</p>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/20 border border-emerald-500/30 rounded-2xl p-5">
            <p className="text-emerald-400 text-sm mb-1">Total AUM</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(MOCK_METRICS.totalAUM)}</p>
            <p className="text-emerald-400 text-sm mt-1">+{MOCK_METRICS.aumGrowth}% YTD</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Active Clients</p>
            <p className="text-3xl font-bold text-white">{MOCK_METRICS.clientCount}</p>
            <p className="text-gray-500 text-sm mt-1">Avg: {formatCurrency(MOCK_METRICS.avgClientAUM)}</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Client Engagement</p>
            <p className="text-3xl font-bold text-white">{MOCK_METRICS.avgClientEngagement}%</p>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${MOCK_METRICS.avgClientEngagement}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-900/40 to-amber-900/20 border border-amber-500/30 rounded-2xl p-5">
            <p className="text-amber-400 text-sm mb-1">Tax Savings Identified</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(MOCK_METRICS.taxSavingsIdentified)}</p>
            <p className="text-amber-400 text-sm mt-1">{formatCurrency(MOCK_METRICS.taxSavingsRealized)} realized</p>
          </div>
        </div>
        
        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* AUM Growth Chart */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AUM Growth</h3>
            
            <div className="h-48 flex items-end gap-2">
              {MOCK_MONTHLY_AUM.map((month, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all hover:from-indigo-500 hover:to-indigo-300"
                    style={{ height: `${(month.value / maxAUM) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500">{month.month}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <span className="text-sm text-gray-400">Growth this period:</span>
              <span className="text-emerald-400 font-semibold">+{MOCK_METRICS.aumGrowth}%</span>
            </div>
          </div>
          
          {/* Meetings & Insights */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Activity Overview</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Meetings This Month</span>
                  <span className="text-white font-semibold">{MOCK_METRICS.meetingsThisMonth}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(MOCK_METRICS.meetingsThisMonth / 20) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">vs {MOCK_METRICS.meetingsLastMonth} last month</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Insights Generated</span>
                  <span className="text-white font-semibold">{MOCK_METRICS.insightsGenerated}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(MOCK_METRICS.insightsGenerated / 60) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Insights Acted On</span>
                  <span className="text-white font-semibold">{MOCK_METRICS.insightsActedOn}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(MOCK_METRICS.insightsActedOn / MOCK_METRICS.insightsGenerated) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round((MOCK_METRICS.insightsActedOn / MOCK_METRICS.insightsGenerated) * 100)}% action rate
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Client Engagement Leaderboard */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Client Engagement</h3>
            <span className="text-sm text-gray-500">Based on login frequency and feature usage</span>
          </div>
          
          <div className="space-y-3">
            {MOCK_CLIENT_ENGAGEMENT.map((client, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition"
              >
                <div className="w-8 text-center">
                  {idx === 0 && <span className="text-xl">🥇</span>}
                  {idx === 1 && <span className="text-xl">🥈</span>}
                  {idx === 2 && <span className="text-xl">🥉</span>}
                  {idx > 2 && <span className="text-gray-500 font-medium">{idx + 1}</span>}
                </div>
                
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-white">{client.name}</p>
                  <p className="text-xs text-gray-500">Last login: {client.lastLogin} • {client.logins} logins</p>
                </div>
                
                <div className="w-32">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Engagement</span>
                    <span className={`text-sm font-medium ${
                      client.engagement >= 70 ? 'text-emerald-400' :
                      client.engagement >= 40 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {client.engagement}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        client.engagement >= 70 ? 'bg-emerald-500' :
                        client.engagement >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${client.engagement}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-gray-500">
              💡 <strong>Tip:</strong> Clients with low engagement may need a check-in. Consider scheduling a review.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
