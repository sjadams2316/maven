'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Alert {
  id: string;
  type: 'price' | 'drift' | 'fragility' | 'tax' | 'dividend' | 'news' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'fragility',
    severity: 'high',
    title: 'Market Fragility Index Elevated',
    message: 'The Market Fragility Index has risen to 72/100, indicating heightened systemic risk. Consider reviewing your portfolio\'s defensive positioning.',
    timestamp: '2026-02-08T10:30:00',
    read: false,
    actionable: true,
    actionLabel: 'View Fragility Index',
    actionUrl: '/fragility',
  },
  {
    id: '2',
    type: 'drift',
    severity: 'medium',
    title: 'Portfolio Drift Alert: NVDA',
    message: 'NVIDIA has grown to 14.5% of your portfolio (target: 8%). Consider rebalancing to reduce concentration risk.',
    timestamp: '2026-02-08T09:15:00',
    read: false,
    actionable: true,
    actionLabel: 'Rebalance Now',
    actionUrl: '/rebalance',
  },
  {
    id: '3',
    type: 'tax',
    severity: 'medium',
    title: 'Tax-Loss Harvesting Opportunity',
    message: 'AMZN has a $3,200 unrealized loss. Harvesting before year-end could offset $896 in taxes.',
    timestamp: '2026-02-08T08:00:00',
    read: false,
    actionable: true,
    actionLabel: 'Review Opportunity',
    actionUrl: '/tax-loss',
  },
  {
    id: '4',
    type: 'dividend',
    severity: 'low',
    title: 'Upcoming Dividend: VTI',
    message: 'Vanguard Total Stock Market ETF ex-dividend date is Feb 15. Expected dividend: $0.89/share (~$445 total).',
    timestamp: '2026-02-07T16:00:00',
    read: true,
    actionable: false,
  },
  {
    id: '5',
    type: 'price',
    severity: 'low',
    title: 'Price Alert: TAO Above $500',
    message: 'Bittensor (TAO) has crossed your $500 price alert, currently trading at $512.',
    timestamp: '2026-02-07T14:22:00',
    read: true,
    actionable: true,
    actionLabel: 'View Position',
    actionUrl: '/crypto',
  },
  {
    id: '6',
    type: 'news',
    severity: 'medium',
    title: 'Earnings Alert: NVDA',
    message: 'NVIDIA reports earnings on Feb 21 after market close. Your position represents 14.5% of portfolio.',
    timestamp: '2026-02-06T09:00:00',
    read: true,
    actionable: true,
    actionLabel: 'Earnings Preview',
    actionUrl: '/research?symbol=NVDA',
  },
  {
    id: '7',
    type: 'compliance',
    severity: 'high',
    title: 'Annual Review Due',
    message: 'Client David Park\'s annual suitability review is overdue. Required for compliance.',
    timestamp: '2026-02-05T08:00:00',
    read: true,
    actionable: true,
    actionLabel: 'Start Review',
    actionUrl: '/compliance',
  },
];

const alertTypeConfig: Record<string, { icon: string; color: string; label: string }> = {
  price: { icon: '💰', color: 'blue', label: 'Price Alert' },
  drift: { icon: '⚖️', color: 'yellow', label: 'Portfolio Drift' },
  fragility: { icon: '📊', color: 'red', label: 'Market Risk' },
  tax: { icon: '📋', color: 'green', label: 'Tax Opportunity' },
  dividend: { icon: '💵', color: 'cyan', label: 'Dividend' },
  news: { icon: '📰', color: 'purple', label: 'News/Earnings' },
  compliance: { icon: '⚠️', color: 'orange', label: 'Compliance' },
};

const severityColors: Record<string, string> = {
  low: 'border-l-slate-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'all' && alert.type !== filter) return false;
    if (showUnreadOnly && alert.read) return false;
    return true;
  });

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                ← Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Alert Center</h1>
            <p className="text-slate-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Mark All Read
            </button>
            <Link href="/alerts/settings" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">
              ⚙️ Alert Settings
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {Object.entries(alertTypeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filter === type ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-400">Show unread only</span>
          </label>
        </div>

        {/* Alert List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-4">🎉</div>
              <p>No alerts to show</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const config = alertTypeConfig[alert.type];
              return (
                <div
                  key={alert.id}
                  className={`bg-slate-800/50 rounded-xl border border-slate-700/50 border-l-4 ${severityColors[alert.severity]} p-6 ${
                    !alert.read ? 'ring-1 ring-purple-500/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">{config.icon}</div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold">{alert.title}</h3>
                          {!alert.read && (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{alert.message}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-${config.color}-500/20 text-${config.color}-400`}>
                            {config.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.actionable && alert.actionUrl && (
                        <Link
                          href={alert.actionUrl}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition-colors"
                        >
                          {alert.actionLabel || 'View'}
                        </Link>
                      )}
                      {!alert.read && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
