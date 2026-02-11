'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Sparkline from '@/components/Sparkline';

// Quick action definitions
const QUICK_ACTIONS = [
  { id: 'add-client', icon: '➕', label: 'Add Client', shortcut: '⌘N', href: '/partners/clients/new' },
  { id: 'run-analysis', icon: '📊', label: 'Run Analysis', shortcut: '⌘A', href: '/partners/analysis' },
  { id: 'generate-report', icon: '📄', label: 'Generate Report', shortcut: '⌘R', href: '/partners/reports/new' },
  { id: 'record-trade', icon: '💰', label: 'Record Trade', shortcut: '⌘T', href: '/partners/trades/new' },
  { id: 'log-meeting', icon: '📞', label: 'Log Meeting', shortcut: '⌘M', href: '/partners/meetings/new' },
  { id: 'rebalance', icon: '⚖️', label: 'Rebalance', shortcut: '⌘B', href: '/partners/rebalance' },
  { id: 'compliance', icon: '📋', label: 'Compliance Check', shortcut: '⌘K', href: '/partners/compliance' },
  { id: 'send-alert', icon: '🔔', label: 'Send Alert', shortcut: '⌘L', href: '/partners/alerts/new' },
];

// Demo recent actions
const DEMO_RECENT_ACTIONS = [
  { id: '1', action: 'Generated Q4 report', client: 'Robert Chen', time: '2 hours ago', icon: '📄' },
  { id: '2', action: 'Ran portfolio analysis', client: 'Morrison Trust', time: '4 hours ago', icon: '📊' },
  { id: '3', action: 'Recorded trade', client: 'Jennifer Walsh', time: 'Yesterday', icon: '💰' },
  { id: '4', action: 'Logged meeting notes', client: 'Michael Thompson', time: 'Yesterday', icon: '📞' },
  { id: '5', action: 'Sent rebalance alert', client: 'Sarah Park', time: '2 days ago', icon: '🔔' },
];

// Rich dashboard metrics
const DASHBOARD_METRICS = {
  totalAum: 12400000,
  avgClientAum: 263830,
  ytdReturn: 8.7,
  avgRiskScore: 6.2,
  clientsAboveTarget: 34,
  clientsBelowTarget: 8,
  taxAlphaSaved: 47200,
  rebalancesNeeded: 5,
};

// Demo data for advisor dashboard
const DEMO_STATS = {
  totalAUM: 12500000,
  clientCount: 47,
  avgClientAUM: 263830,
  monthlyGrowth: 2.3,
};

const DEMO_CLIENTS = [
  { id: '1', name: 'Robert & Linda Chen', aum: 1250000, change: 3.2, alerts: 2, ytdReturn: 9.4 },
  { id: '2', name: 'The Morrison Family Trust', aum: 890000, change: -1.1, alerts: 0, ytdReturn: 6.8 },
  { id: '3', name: 'Jennifer Walsh', aum: 675000, change: 2.8, alerts: 1, ytdReturn: 11.2 },
  { id: '4', name: 'Michael Thompson', aum: 520000, change: 4.1, alerts: 0, ytdReturn: 8.9 },
  { id: '5', name: 'Sarah & David Park', aum: 445000, change: 1.9, alerts: 3, ytdReturn: 7.3 },
];

const DEMO_ALERTS = [
  { id: '1', clientId: '1', client: 'Robert Chen', type: 'rebalance', message: 'Portfolio drift exceeds 5% threshold', severity: 'warning' },
  { id: '2', clientId: '5', client: 'Sarah Park', type: 'tax', message: 'Tax-loss harvesting opportunity: $12,400', severity: 'info' },
  { id: '3', clientId: '3', client: 'Jennifer Walsh', type: 'risk', message: 'Concentrated position: NVDA at 18%', severity: 'warning' },
];

const DEMO_MEETINGS = [
  { id: '1', clientId: '1', client: 'Robert Chen', time: '2:00 PM', type: 'Quarterly Review' },
  { id: '2', clientId: '4', client: 'Michael Thompson', time: '4:30 PM', type: 'Portfolio Update' },
];

// AI-generated meeting prep content (in production, this would come from Claude)
const MEETING_PREP: Record<string, { summary: string; talkingPoints: string[]; alerts: string[]; marketContext: string }> = {
  '1': {
    summary: "Robert & Linda Chen have $1.3M AUM with a moderate risk profile. Their primary goal is retirement in 2032. Portfolio is up 9.4% YTD, outperforming their benchmark by 1.2%.",
    talkingPoints: [
      "Portfolio drift exceeds 5% — recommend rebalancing international allocation",
      "Tax-loss harvesting opportunity: $3,200 in unrealized losses in VXUS",
      "Roth conversion window: Their income is lower this year due to Linda's sabbatical",
      "529 plan for grandson — they mentioned interest last quarter"
    ],
    alerts: [
      "⚠️ Concentrated position: Apple at 12% (above 10% threshold)",
      "📊 Rebalance needed: International underweight by 4%"
    ],
    marketContext: "S&P 500 down 1.2% this week on inflation concerns. Fed minutes released Wednesday showed hawkish lean. Their bond allocation provides good cushion."
  },
  '4': {
    summary: "Michael Thompson has $520K AUM, aggressive growth profile. Primary goal is early retirement at 55 (8 years). Portfolio up 8.9% YTD.",
    talkingPoints: [
      "Review concentrated tech positions — 35% in FAANG stocks",
      "Discuss increasing 401(k) contribution (currently at 12%, max is 23K)",
      "His company stock vesting next month — plan for diversification",
      "Update beneficiaries after recent marriage"
    ],
    alerts: [
      "💍 Life event: Recently married — review beneficiaries",
      "📈 RSU vesting: $45K vesting March 15"
    ],
    marketContext: "Tech sector volatile but his long time horizon supports current allocation. Consider adding some value exposure for balance."
  }
};

// 12-month trailing data for sparklines
const SPARKLINE_DATA = {
  aum: [10.2, 10.5, 10.1, 10.8, 11.2, 11.0, 11.5, 11.8, 12.0, 11.7, 12.2, 12.4],
  ytdReturn: [0, 1.2, 0.8, 2.1, 3.5, 4.2, 5.1, 6.0, 5.8, 7.2, 8.1, 8.7],
  taxAlpha: [0, 4200, 8100, 12500, 18200, 22400, 27800, 32100, 38500, 41200, 44800, 47200],
  riskScore: [6.5, 6.4, 6.3, 6.2, 6.4, 6.3, 6.1, 6.2, 6.3, 6.2, 6.1, 6.2],
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
}

export default function PartnersDashboard() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [prepModal, setPrepModal] = useState<{ open: boolean; meeting: typeof DEMO_MEETINGS[0] | null }>({ open: false, meeting: null });
  const [livePrep, setLivePrep] = useState<{ summary: string; actionItems: string[]; talkingPoints: string[]; marketContext: string } | null>(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';
  
  // Helper to preserve demo param in links
  const demoHref = (href: string) => isDemoMode ? `${href}?demo=true` : href;
  
  // Get prep content for a meeting - use live data if available, fallback to static
  const getPrepContent = (clientId: string) => {
    if (livePrep) return livePrep;
    return MEETING_PREP[clientId] || null;
  };
  
  // Fetch live AI prep when modal opens
  const openPrepModal = async (meeting: typeof DEMO_MEETINGS[0]) => {
    setPrepModal({ open: true, meeting });
    setLivePrep(null);
    setPrepLoading(true);
    
    try {
      const response = await fetch('/api/meeting-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: meeting.clientId, meetingType: meeting.type }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.prep) {
          setLivePrep({
            summary: data.prep.summary || '',
            actionItems: data.prep.actionItems || [],
            talkingPoints: data.prep.talkingPoints || [],
            marketContext: data.prep.marketContext || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch live prep:', error);
      // Fall back to static data
    } finally {
      setPrepLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Good afternoon</h1>
        <p className="text-gray-400 text-sm md:text-base">Here's what's happening with your practice today.</p>
      </div>

      {/* Primary Stats Grid - Stack on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-gray-400 text-xs md:text-sm mb-1 md:mb-2">Total AUM</div>
              <div className="text-xl md:text-3xl font-bold text-white">{formatCurrency(DASHBOARD_METRICS.totalAum)}</div>
              <div className="text-emerald-500 text-xs md:text-sm mt-1">+{DEMO_STATS.monthlyGrowth}% this month</div>
            </div>
            <Sparkline data={SPARKLINE_DATA.aum} width={60} height={32} />
          </div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-gray-400 text-xs md:text-sm mb-1 md:mb-2">YTD Return</div>
              <div className="text-xl md:text-3xl font-bold text-emerald-500">+{DASHBOARD_METRICS.ytdReturn}%</div>
              <div className="text-gray-500 text-xs md:text-sm mt-1">Avg across clients</div>
            </div>
            <Sparkline data={SPARKLINE_DATA.ytdReturn} width={60} height={32} />
          </div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="text-gray-400 text-xs md:text-sm mb-1 md:mb-2">Clients</div>
          <div className="text-xl md:text-3xl font-bold text-white">{DEMO_STATS.clientCount}</div>
          <div className="text-gray-500 text-xs md:text-sm mt-1">Avg {formatCurrency(DASHBOARD_METRICS.avgClientAum)}</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="text-gray-400 text-xs md:text-sm mb-1 md:mb-2">Today's Meetings</div>
          <div className="text-xl md:text-3xl font-bold text-white">{DEMO_MEETINGS.length}</div>
          <div className="text-gray-500 text-xs md:text-sm mt-1">Next: {DEMO_MEETINGS[0]?.time || 'None'}</div>
        </div>
      </div>

      {/* Secondary Stats Grid - Performance & Risk Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-xs">Avg Risk Score</div>
              <div className="text-lg md:text-xl font-bold text-amber-400">{DASHBOARD_METRICS.avgRiskScore.toFixed(1)}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <span className="text-sm">📊</span>
            </div>
          </div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-xs">Above Target</div>
              <div className="text-lg md:text-xl font-bold text-emerald-400">{DASHBOARD_METRICS.clientsAboveTarget}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="text-sm">✓</span>
            </div>
          </div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-xs">Below Target</div>
              <div className="text-lg md:text-xl font-bold text-red-400">{DASHBOARD_METRICS.clientsBelowTarget}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <span className="text-sm">⚠</span>
            </div>
          </div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-gray-500 text-xs">Tax Alpha Saved</div>
              <div className="text-lg md:text-xl font-bold text-emerald-400">{formatCurrency(DASHBOARD_METRICS.taxAlphaSaved)}</div>
            </div>
            <Sparkline data={SPARKLINE_DATA.taxAlpha} width={40} height={24} />
          </div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-xs">Rebalances Needed</div>
              <div className="text-lg md:text-xl font-bold text-amber-500">{DASHBOARD_METRICS.rebalancesNeeded}</div>
            </div>
            <Link 
              href={demoHref("/partners/rebalance")} 
              className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              <span className="text-sm">→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Alerts */}
        <div className="lg:col-span-2 bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-white">Action Required</h2>
            <Link href={demoHref("/partners/insights")} className="text-amber-500 text-sm hover:text-amber-400 min-h-[48px] min-w-[48px] flex items-center justify-center md:min-h-0 md:min-w-0">
              View all →
            </Link>
          </div>
          <div className="space-y-3 md:space-y-4">
            {DEMO_ALERTS.map((alert) => (
              <Link
                key={alert.id}
                href={demoHref(`/partners/clients/${alert.clientId}`)}
                className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm md:text-base">{alert.client}</span>
                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-400">{alert.type}</span>
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm">{alert.message}</p>
                </div>
                <span className="text-gray-500 group-hover:text-amber-500 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Today's Schedule</h2>
          <div className="space-y-3 md:space-y-4">
            {DEMO_MEETINGS.map((meeting) => (
              <div
                key={meeting.id}
                className="p-3 md:p-4 bg-white/5 rounded-xl border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-500 font-medium text-sm md:text-base">{meeting.time}</span>
                  <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                    {meeting.type}
                  </span>
                </div>
                <div className="text-white text-sm md:text-base">{meeting.client}</div>
                <button 
                  onClick={() => openPrepModal(meeting)}
                  className="mt-3 w-full py-3 md:py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-sm text-amber-400 hover:text-amber-300 transition-colors min-h-[48px] font-medium"
                >
                  ✨ Prep Meeting
                </button>
              </div>
            ))}
            {DEMO_MEETINGS.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No meetings scheduled
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.id}
                href={demoHref(action.href)}
                className="group relative flex flex-col items-center justify-center gap-2 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all min-h-[80px] md:min-h-[88px]"
                style={{ minWidth: '48px', minHeight: '48px' }}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-white text-xs md:text-sm text-center font-medium">{action.label}</span>
                {/* Keyboard shortcut tooltip */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {action.shortcut}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Actions */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-white">Recent Activity</h2>
            <Link href={demoHref("/partners/activity")} className="text-amber-500 text-sm hover:text-amber-400 min-h-[48px] min-w-[48px] flex items-center justify-center md:min-h-0 md:min-w-0">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {DEMO_RECENT_ACTIONS.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <span className="text-lg flex-shrink-0">{activity.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{activity.action}</div>
                  <div className="text-gray-500 text-xs">{activity.client} · {activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Clients with Performance */}
      <div className="mt-6 md:mt-8 bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-white">Top Clients by AUM</h2>
          <Link href={demoHref("/partners/clients")} className="text-amber-500 text-sm hover:text-amber-400 min-h-[48px] min-w-[48px] flex items-center justify-center md:min-h-0 md:min-w-0">
            View all →
          </Link>
        </div>
        
        {/* Mobile: Card layout */}
        <div className="md:hidden space-y-3">
          {DEMO_CLIENTS.map((client, idx) => {
            // Generate sparkline data for each client
            const sparkData = Array.from({ length: 12 }, (_, i) => 
              Math.max(0, client.ytdReturn * (i + 1) / 12 + (Math.random() - 0.5) * 2)
            );
            return (
              <Link
                key={client.id}
                href={`/partners/clients/${client.id}`}
                className="block p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{client.name}</span>
                  {client.alerts > 0 && (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs">
                      {client.alerts} alert{client.alerts > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{formatCurrency(client.aum)}</span>
                  <div className="flex items-center gap-2">
                    <Sparkline data={sparkData} width={50} height={20} positive={client.ytdReturn >= 0} />
                    <span className={client.ytdReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                      {client.ytdReturn >= 0 ? '+' : ''}{client.ytdReturn}% YTD
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b border-white/10">
                <th className="pb-4 font-medium">Client</th>
                <th className="pb-4 font-medium text-right">AUM</th>
                <th className="pb-4 font-medium text-right">MTD Change</th>
                <th className="pb-4 font-medium text-right">YTD Return</th>
                <th className="pb-4 font-medium text-right">Alerts</th>
                <th className="pb-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {DEMO_CLIENTS.map((client, idx) => {
                // Generate sparkline data for each client
                const sparkData = Array.from({ length: 12 }, (_, i) => 
                  Math.max(0, client.ytdReturn * (i + 1) / 12 + (Math.random() - 0.5) * 2)
                );
                return (
                  <tr key={client.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <Link href={`/partners/clients/${client.id}`} className="text-white hover:text-amber-400">
                        {client.name}
                      </Link>
                    </td>
                    <td className="py-4 text-right text-white">{formatCurrency(client.aum)}</td>
                    <td className={`py-4 text-right ${client.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {client.change >= 0 ? '+' : ''}{client.change}%
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Sparkline data={sparkData} width={60} height={24} positive={client.ytdReturn >= 0} />
                        <span className={client.ytdReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                          {client.ytdReturn >= 0 ? '+' : ''}{client.ytdReturn}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      {client.alerts > 0 ? (
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-sm">
                          {client.alerts}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/partners/clients/${client.id}`}
                        className="text-gray-500 hover:text-white transition-colors inline-flex items-center justify-center min-w-[48px] min-h-[48px]"
                      >
                        →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meeting Prep Modal */}
      {prepModal.open && prepModal.meeting && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setPrepModal({ open: false, meeting: null })}
          />
          
          {/* Modal */}
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] bg-[#12121a] border border-white/10 rounded-2xl z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 text-amber-500 text-sm mb-1">
                  <span>✨</span>
                  <span>AI Meeting Prep</span>
                </div>
                <h2 className="text-xl font-bold text-white">{prepModal.meeting.client}</h2>
                <p className="text-gray-400 text-sm">{prepModal.meeting.type} • {prepModal.meeting.time}</p>
              </div>
              <button 
                onClick={() => setPrepModal({ open: false, meeting: null })}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <span className="text-gray-400 text-xl">×</span>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {prepLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-4"></div>
                  <p className="text-gray-400">Claude is preparing your meeting brief...</p>
                </div>
              ) : (() => {
                const prep = getPrepContent(prepModal.meeting.clientId);
                if (!prep) return <p className="text-gray-400">No prep data available</p>;
                
                // Handle both static (alerts) and API (actionItems) formats
                const actionItems = prep.actionItems || prep.alerts || [];
                
                return (
                  <>
                    {/* Summary */}
                    <div>
                      <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span>📋</span> Client Summary
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed bg-white/5 rounded-xl p-4">
                        {prep.summary}
                      </p>
                    </div>
                    
                    {/* Action Items */}
                    {actionItems.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <span>🚨</span> Action Items
                        </h3>
                        <div className="space-y-2">
                          {actionItems.map((item: string, i: number) => (
                            <div key={i} className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Talking Points */}
                    <div>
                      <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span>💬</span> Talking Points
                      </h3>
                      <ul className="space-y-2">
                        {prep.talkingPoints.map((point: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Market Context */}
                    <div>
                      <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span>📈</span> Market Context
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed bg-white/5 rounded-xl p-4">
                        {prep.marketContext}
                      </p>
                    </div>
                    
                    {/* AI Badge */}
                    {livePrep && (
                      <div className="text-center text-gray-500 text-xs pt-2">
                        ✨ Generated by Claude • Refreshed just now
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            
            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <Link
                href={demoHref(`/partners/clients/${prepModal.meeting.clientId}`)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium text-center transition-colors min-h-[48px] flex items-center justify-center"
              >
                View Full Profile
              </Link>
              <button
                onClick={() => setPrepModal({ open: false, meeting: null })}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-white text-sm font-medium transition-colors min-h-[48px]"
              >
                Ready for Meeting ✓
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
