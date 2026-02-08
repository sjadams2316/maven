'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

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
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah@example.com',
    aum: 2100000,
    ytdReturn: 9.1,
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
    nextMeeting: new Date('2026-02-18T11:00:00'),
    alerts: 3,
    tone: 'engaged' as const,
  },
  {
    id: '5',
    firstName: 'Michael',
    lastName: 'Torres',
    email: 'michael@example.com',
    aum: 680000,
    ytdReturn: 7.3,
    lastLogin: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    nextMeeting: null,
    alerts: 1,
    tone: 'moderate' as const,
  },
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
  },
  {
    id: '3',
    clientId: '4',
    clientName: 'Sarah Chen',
    type: 'rmd',
    severity: 'medium',
    title: 'RMD deadline approaching',
    description: 'Required minimum distribution due by April 1.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    clientId: '1',
    clientName: 'Sam Adams',
    type: 'crypto',
    severity: 'medium',
    title: 'Crypto allocation above threshold',
    description: 'Crypto now 12% of portfolio (target: 10%).',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '5',
    clientId: '4',
    clientName: 'Sarah Chen',
    type: 'rebalance',
    severity: 'low',
    title: 'Rebalancing opportunity',
    description: 'Portfolio drift exceeds 5% threshold.',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
];

const MOCK_ACTIVITY = [
  { id: '1', clientId: '1', clientName: 'Sam Adams', action: 'Viewed Fragility Index', time: '2 hours ago' },
  { id: '2', clientId: '2', clientName: 'Jane Smith', action: 'Asked Oracle about Roth conversion', time: '5 hours ago' },
  { id: '3', clientId: '3', clientName: 'Bob Jones', action: 'First login', time: 'Yesterday' },
  { id: '4', clientId: '4', clientName: 'Sarah Chen', action: 'Viewed tax harvesting', time: 'Yesterday' },
  { id: '5', clientId: '1', clientName: 'Sam Adams', action: 'Updated profile', time: '2 days ago' },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  return `$${(amount / 1000).toFixed(0)}K`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

export default function AdvisorDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Calculate totals
  const totalAUM = MOCK_CLIENTS.reduce((sum, c) => sum + c.aum, 0);
  const totalAlerts = MOCK_CLIENTS.reduce((sum, c) => sum + c.alerts, 0);
  const activeClients = MOCK_CLIENTS.filter(c => {
    const daysSinceLogin = (Date.now() - c.lastLogin.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLogin < 30;
  }).length;
  
  // Get upcoming meetings (next 7 days)
  const upcomingMeetings = MOCK_CLIENTS
    .filter(c => c.nextMeeting && c.nextMeeting > new Date() && c.nextMeeting < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    .sort((a, b) => (a.nextMeeting?.getTime() || 0) - (b.nextMeeting?.getTime() || 0));
  
  // Get high-priority insights
  const priorityInsights = MOCK_INSIGHTS
    .filter(i => i.severity === 'high' || i.severity === 'medium')
    .slice(0, 5);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl">
              👔
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{getGreeting()}, Jon</h1>
              <p className="text-gray-400 text-sm">Advisor Dashboard</p>
            </div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/20 border border-emerald-500/30 rounded-2xl p-5">
            <p className="text-emerald-400 text-sm mb-1">Total AUM</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(totalAUM)}</p>
            <p className="text-emerald-400/60 text-xs mt-1">+2.3% this month</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Active Clients</p>
            <p className="text-3xl font-bold text-white">{activeClients}</p>
            <p className="text-gray-500 text-xs mt-1">{MOCK_CLIENTS.length} total</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Alerts</p>
            <p className="text-3xl font-bold text-white">{totalAlerts}</p>
            <p className="text-amber-400 text-xs mt-1">{MOCK_INSIGHTS.filter(i => i.severity === 'high').length} high priority</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">This Week</p>
            <p className="text-3xl font-bold text-white">{upcomingMeetings.length}</p>
            <p className="text-gray-500 text-xs mt-1">meetings scheduled</p>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Meetings & Insights */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Upcoming Meetings */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>📅</span> Upcoming Meetings
                </h2>
                <Link href="/advisor/clients" className="text-sm text-indigo-400 hover:text-indigo-300">
                  View all →
                </Link>
              </div>
              
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMeetings.map(client => (
                    <div 
                      key={client.id}
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {client.firstName[0]}{client.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white">{client.firstName} {client.lastName}</p>
                          <p className="text-sm text-gray-400">
                            {formatDate(client.nextMeeting!)} at {formatTime(client.nextMeeting!)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/advisor/clients/${client.id}/prep`}
                          className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-sm rounded-lg transition"
                        >
                          Prep
                        </Link>
                        <Link
                          href={`/advisor/clients/${client.id}`}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 text-sm rounded-lg transition"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No meetings scheduled this week</p>
              )}
            </div>
            
            {/* Insights Requiring Attention */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>⚡</span> Insights Requiring Attention
                </h2>
                <Link href="/advisor/insights" className="text-sm text-indigo-400 hover:text-indigo-300">
                  View all →
                </Link>
              </div>
              
              <div className="space-y-3">
                {priorityInsights.map(insight => (
                  <Link
                    key={insight.id}
                    href={`/advisor/clients/${insight.clientId}`}
                    className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl transition group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        insight.severity === 'high' ? 'bg-red-500' : 
                        insight.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white group-hover:text-indigo-300 transition">
                            {insight.clientName}
                          </span>
                          <span className="text-gray-500">·</span>
                          <span className="text-sm text-gray-400">{insight.title}</span>
                        </div>
                        <p className="text-sm text-gray-500">{insight.description}</p>
                      </div>
                      {insight.amount && (
                        <span className="text-emerald-400 font-medium">
                          ${insight.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Activity & Quick Actions */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🚀</span> Quick Actions
              </h2>
              
              <div className="space-y-2">
                <Link
                  href="/advisor/clients/invite"
                  className="flex items-center gap-3 p-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl transition"
                >
                  <span className="text-xl">✉️</span>
                  <span className="text-white font-medium">Invite New Client</span>
                </Link>
                <Link
                  href="/advisor/clients"
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                >
                  <span className="text-xl">👥</span>
                  <span className="text-white">View All Clients</span>
                </Link>
                <Link
                  href="/collaborate"
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                >
                  <span className="text-xl">🤝</span>
                  <span className="text-white">Start Planning Session</span>
                </Link>
                <Link
                  href="/fragility"
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                >
                  <span className="text-xl">📊</span>
                  <span className="text-white">Check Fragility Index</span>
                </Link>
                <Link
                  href="/oracle"
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                >
                  <span className="text-xl">🔮</span>
                  <span className="text-white">Ask Maven Oracle</span>
                </Link>
                <Link
                  href="/advisor/settings"
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                >
                  <span className="text-xl">⚙️</span>
                  <span className="text-white">Settings</span>
                </Link>
              </div>
            </div>
            
            {/* Recent Client Activity */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📋</span> Recent Activity
              </h2>
              
              <div className="space-y-3">
                {MOCK_ACTIVITY.map(activity => (
                  <Link
                    key={activity.id}
                    href={`/advisor/clients/${activity.clientId}`}
                    className="block group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                        {activity.clientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white group-hover:text-indigo-300 transition truncate">
                          <span className="font-medium">{activity.clientName}</span>
                        </p>
                        <p className="text-xs text-gray-500 truncate">{activity.action}</p>
                      </div>
                      <span className="text-xs text-gray-600 flex-shrink-0">{activity.time}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Client Tone Overview */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🎚️</span> Client Tones
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Conservative</span>
                  <span className="text-white font-medium">
                    {MOCK_CLIENTS.filter(c => c.tone === 'conservative').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Moderate</span>
                  <span className="text-white font-medium">
                    {MOCK_CLIENTS.filter(c => c.tone === 'moderate').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Engaged</span>
                  <span className="text-white font-medium">
                    {MOCK_CLIENTS.filter(c => c.tone === 'engaged').length}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mt-4">
                Tone controls how much Maven shares proactively with each client.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
