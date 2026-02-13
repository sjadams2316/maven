'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import IntegratedOracle from './components/IntegratedOracle';

// Mock data for MVP - will be replaced with real data
const MOCK_CLIENTS = [
  {
    id: '1',
    firstName: 'Sam',
    lastName: 'Adams',
    email: 'sam@example.com',
    aum: 847000,
    ytdReturn: 8.2,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    nextMeeting: new Date('2026-02-12T14:00:00'),
    alerts: 2,
    tone: 'engaged' as const,
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith', 
    email: 'jane@example.com',
    aum: 1200000,
    ytdReturn: 6.8,
    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    nextMeeting: new Date('2026-02-14T10:00:00'),
    alerts: 1,
    tone: 'moderate' as const,
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Jones',
    email: 'bob@example.com',
    aum: 520000,
    ytdReturn: 5.4,
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    nextMeeting: new Date('2026-02-20T15:00:00'),
    alerts: 0,
    tone: 'conservative' as const,
  }
];

const MOCK_INSIGHTS = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Sam Adams',
    type: 'tax_harvest',
    severity: 'high',
    title: 'Tax-loss harvest opportunity',
    description: 'VWO showing $4,200 loss. Harvest before year-end.',
    amount: 4200,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: '2', 
    clientId: '2',
    clientName: 'Jane Smith',
    type: 'concentration',
    severity: 'medium', 
    title: 'Concentration risk detected',
    description: 'AAPL now 42% of portfolio. Consider rebalancing.',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  }
];

export default function AdvisorDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('week');

  const totalAUM = MOCK_CLIENTS.reduce((sum, client) => sum + client.aum, 0);
  const avgReturn = MOCK_CLIENTS.reduce((sum, client) => sum + client.ytdReturn, 0) / MOCK_CLIENTS.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatReturn = (returnPct: number) => {
    return `${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(1)}%`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <Header />
      
      <div className="p-6 space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total AUM</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalAUM)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">💰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Clients</p>
                <p className="text-2xl font-bold text-white">{MOCK_CLIENTS.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Return</p>
                <p className="text-2xl font-bold text-white">{formatReturn(avgReturn)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📈</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Alerts</p>
                <p className="text-2xl font-bold text-white">{MOCK_INSIGHTS.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🔔</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Oracle Research */}
          <div className="xl:col-span-2">
            <IntegratedOracle />
          </div>

          {/* Right Column - Client Insights & Actions */}
          <div className="space-y-6">
            {/* Client Insights */}
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Client Insights</h3>
                <Link href="/advisor/insights" className="text-amber-500 text-sm hover:text-amber-400">
                  View all →
                </Link>
              </div>
              
              <div className="space-y-3">
                {MOCK_INSIGHTS.map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-3 rounded-lg border ${getSeverityColor(insight.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-white">{insight.title}</h4>
                      <span className="text-xs opacity-70">
                        {insight.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs opacity-80 mb-1">{insight.description}</p>
                    <p className="text-xs text-gray-400">{insight.clientName}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Clients */}
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Top Clients</h3>
                <Link href="/advisor/clients" className="text-amber-500 text-sm hover:text-amber-400">
                  View all →
                </Link>
              </div>
              
              <div className="space-y-3">
                {MOCK_CLIENTS.slice(0, 3).map((client) => (
                  <Link
                    key={client.id}
                    href={`/advisor/clients/${client.id}`}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {client.firstName} {client.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        AUM: {formatCurrency(client.aum)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white">{formatReturn(client.ytdReturn)}</p>
                      <p className="text-xs text-gray-400">YTD</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/advisor/rebalance"
                  className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-center hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  <div className="text-lg mb-1">⚖️</div>
                  <div className="text-sm font-medium text-white">Rebalance</div>
                </Link>
                
                <Link
                  href="/advisor/tax-harvesting" 
                  className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-center hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  <div className="text-lg mb-1">💰</div>
                  <div className="text-sm font-medium text-white">Tax Harvest</div>
                </Link>
                
                <Link
                  href="/advisor/reports"
                  className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-center hover:from-blue-700 hover:to-cyan-700 transition-all"
                >
                  <div className="text-lg mb-1">📊</div>
                  <div className="text-sm font-medium text-white">Reports</div>
                </Link>
                
                <Link
                  href="/advisor/meetings"
                  className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg text-center hover:from-amber-700 hover:to-orange-700 transition-all"
                >
                  <div className="text-lg mb-1">📅</div>
                  <div className="text-sm font-medium text-white">Meetings</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}