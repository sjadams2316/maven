'use client';

import { useState } from 'react';
import Link from 'next/link';

// Demo data for advisor dashboard
const DEMO_STATS = {
  totalAUM: 12500000,
  clientCount: 23,
  avgClientAUM: 543478,
  monthlyGrowth: 2.3,
};

const DEMO_CLIENTS = [
  { id: '1', name: 'Robert & Linda Chen', aum: 1250000, change: 3.2, alerts: 2 },
  { id: '2', name: 'The Morrison Family Trust', aum: 890000, change: -1.1, alerts: 0 },
  { id: '3', name: 'Jennifer Walsh', aum: 675000, change: 2.8, alerts: 1 },
  { id: '4', name: 'Michael Thompson', aum: 520000, change: 4.1, alerts: 0 },
  { id: '5', name: 'Sarah & David Park', aum: 445000, change: 1.9, alerts: 3 },
];

const DEMO_ALERTS = [
  { id: '1', client: 'Robert Chen', type: 'rebalance', message: 'Portfolio drift exceeds 5% threshold', severity: 'warning' },
  { id: '2', client: 'Sarah Park', type: 'tax', message: 'Tax-loss harvesting opportunity: $12,400', severity: 'info' },
  { id: '3', client: 'Jennifer Walsh', type: 'risk', message: 'Concentrated position: NVDA at 18%', severity: 'warning' },
];

const DEMO_MEETINGS = [
  { id: '1', client: 'Robert Chen', time: '2:00 PM', type: 'Quarterly Review' },
  { id: '2', client: 'Michael Thompson', time: '4:30 PM', type: 'Portfolio Update' },
];

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
}

export default function PartnersDashboard() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Good afternoon</h1>
        <p className="text-gray-400">Here's what's happening with your practice today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Total AUM</div>
          <div className="text-3xl font-bold text-white">{formatCurrency(DEMO_STATS.totalAUM)}</div>
          <div className="text-emerald-500 text-sm mt-1">+{DEMO_STATS.monthlyGrowth}% this month</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Clients</div>
          <div className="text-3xl font-bold text-white">{DEMO_STATS.clientCount}</div>
          <div className="text-gray-500 text-sm mt-1">Avg {formatCurrency(DEMO_STATS.avgClientAUM)}</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Alerts</div>
          <div className="text-3xl font-bold text-amber-500">{DEMO_ALERTS.length}</div>
          <div className="text-gray-500 text-sm mt-1">Require attention</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Today's Meetings</div>
          <div className="text-3xl font-bold text-white">{DEMO_MEETINGS.length}</div>
          <div className="text-gray-500 text-sm mt-1">Next: {DEMO_MEETINGS[0]?.time || 'None'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts */}
        <div className="lg:col-span-2 bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Action Required</h2>
            <Link href="/partners/insights" className="text-amber-500 text-sm hover:text-amber-400">
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {DEMO_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{alert.client}</span>
                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-400">{alert.type}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{alert.message}</p>
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                  →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Today's Schedule</h2>
          <div className="space-y-4">
            {DEMO_MEETINGS.map((meeting) => (
              <div
                key={meeting.id}
                className="p-4 bg-white/5 rounded-xl border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-500 font-medium">{meeting.time}</span>
                  <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                    {meeting.type}
                  </span>
                </div>
                <div className="text-white">{meeting.client}</div>
                <button className="mt-3 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors">
                  Prep Meeting
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

      {/* Top Clients */}
      <div className="mt-8 bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Top Clients by AUM</h2>
          <Link href="/partners/clients" className="text-amber-500 text-sm hover:text-amber-400">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b border-white/10">
                <th className="pb-4 font-medium">Client</th>
                <th className="pb-4 font-medium text-right">AUM</th>
                <th className="pb-4 font-medium text-right">MTD Change</th>
                <th className="pb-4 font-medium text-right">Alerts</th>
                <th className="pb-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {DEMO_CLIENTS.map((client) => (
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
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
