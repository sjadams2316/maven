'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AlertSetting {
  id: string;
  category: string;
  name: string;
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  threshold?: number;
  thresholdLabel?: string;
}

const defaultSettings: AlertSetting[] = [
  {
    id: 'drift',
    category: 'Portfolio',
    name: 'Portfolio Drift',
    description: 'Alert when any position drifts beyond threshold from target',
    enabled: true,
    channels: { email: true, push: true, sms: false },
    threshold: 5,
    thresholdLabel: 'Drift %',
  },
  {
    id: 'concentration',
    category: 'Portfolio',
    name: 'Concentration Risk',
    description: 'Alert when single position exceeds threshold of portfolio',
    enabled: true,
    channels: { email: true, push: true, sms: false },
    threshold: 15,
    thresholdLabel: 'Max %',
  },
  {
    id: 'large_movement',
    category: 'Portfolio',
    name: 'Large Daily Movement',
    description: 'Alert when portfolio moves more than threshold in a day',
    enabled: true,
    channels: { email: true, push: true, sms: true },
    threshold: 3,
    thresholdLabel: 'Change %',
  },
  {
    id: 'fragility_high',
    category: 'Market',
    name: 'High Fragility Alert',
    description: 'Alert when Market Fragility Index exceeds threshold',
    enabled: true,
    channels: { email: true, push: true, sms: false },
    threshold: 70,
    thresholdLabel: 'Index Level',
  },
  {
    id: 'fragility_change',
    category: 'Market',
    name: 'Fragility Spike',
    description: 'Alert when Fragility Index increases rapidly',
    enabled: true,
    channels: { email: true, push: false, sms: false },
    threshold: 10,
    thresholdLabel: 'Point Change',
  },
  {
    id: 'price_alert',
    category: 'Price',
    name: 'Price Targets',
    description: 'Alert when holdings hit your price targets',
    enabled: true,
    channels: { email: true, push: true, sms: false },
  },
  {
    id: 'earnings',
    category: 'Events',
    name: 'Earnings Announcements',
    description: 'Notify before holdings report earnings',
    enabled: true,
    channels: { email: true, push: true, sms: false },
  },
  {
    id: 'dividend',
    category: 'Events',
    name: 'Dividend Events',
    description: 'Notify of ex-dividend dates and payments',
    enabled: true,
    channels: { email: true, push: false, sms: false },
  },
  {
    id: 'tax_loss',
    category: 'Tax',
    name: 'Tax-Loss Opportunities',
    description: 'Alert when holdings have harvesting opportunities',
    enabled: true,
    channels: { email: true, push: true, sms: false },
    threshold: 1000,
    thresholdLabel: 'Min Loss $',
  },
  {
    id: 'wash_sale',
    category: 'Tax',
    name: 'Wash Sale Warnings',
    description: 'Warn before making trades that trigger wash sales',
    enabled: true,
    channels: { email: true, push: true, sms: false },
  },
  {
    id: 'compliance_deadline',
    category: 'Compliance',
    name: 'Compliance Deadlines',
    description: 'Remind of upcoming compliance requirements',
    enabled: true,
    channels: { email: true, push: true, sms: false },
  },
  {
    id: 'client_activity',
    category: 'Compliance',
    name: 'Client Activity',
    description: 'Alert when clients log in or view reports',
    enabled: false,
    channels: { email: false, push: true, sms: false },
  },
];

export default function AlertSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);

  const toggleEnabled = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const toggleChannel = (id: string, channel: 'email' | 'push' | 'sms') => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, channels: { ...s.channels, [channel]: !s.channels[channel] } } : s
    ));
  };

  const updateThreshold = (id: string, value: number) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, threshold: value } : s
    ));
  };

  const categories = [...new Set(settings.map(s => s.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/alerts" className="text-slate-400 hover:text-white transition-colors">
                ← Alerts
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Alert Settings</h1>
            <p className="text-slate-400 mt-1">Configure what notifications you receive</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">
            Save Changes
          </button>
        </div>

        {/* Global Settings */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Notification Channels</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <div className="font-medium">📧 Email</div>
                <div className="text-sm text-slate-400">sam@maven.finance</div>
              </div>
              <button className="text-green-400">✓ Verified</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <div className="font-medium">📱 Push</div>
                <div className="text-sm text-slate-400">Browser notifications</div>
              </div>
              <button className="px-3 py-1 bg-purple-600 rounded text-sm">Enable</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <div className="font-medium">💬 SMS</div>
                <div className="text-sm text-slate-400">+1 (772) ***-6665</div>
              </div>
              <button className="text-green-400">✓ Verified</button>
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quiet Hours</h2>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
              <span>Enable quiet hours</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">From</span>
              <input
                type="time"
                defaultValue="22:00"
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1"
              />
              <span className="text-slate-400">to</span>
              <input
                type="time"
                defaultValue="08:00"
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1"
              />
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            During quiet hours, only critical alerts (SMS enabled) will be sent
          </p>
        </div>

        {/* Alert Categories */}
        {categories.map(category => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{category} Alerts</h2>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              {settings
                .filter(s => s.category === category)
                .map((setting, i, arr) => (
                  <div
                    key={setting.id}
                    className={`p-4 ${i < arr.length - 1 ? 'border-b border-slate-700/50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleEnabled(setting.id)}
                          className={`mt-1 w-12 h-6 rounded-full transition-colors ${
                            setting.enabled ? 'bg-purple-600' : 'bg-slate-600'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              setting.enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                        <div>
                          <div className="font-medium">{setting.name}</div>
                          <div className="text-sm text-slate-400">{setting.description}</div>
                        </div>
                      </div>

                      {setting.enabled && (
                        <div className="flex items-center gap-4">
                          {setting.threshold !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-400">{setting.thresholdLabel}:</span>
                              <input
                                type="number"
                                value={setting.threshold}
                                onChange={(e) => updateThreshold(setting.id, Number(e.target.value))}
                                className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
                              />
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleChannel(setting.id, 'email')}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                setting.channels.email
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              📧
                            </button>
                            <button
                              onClick={() => toggleChannel(setting.id, 'push')}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                setting.channels.push
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              📱
                            </button>
                            <button
                              onClick={() => toggleChannel(setting.id, 'sms')}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                setting.channels.sms
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              💬
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {/* Price Alerts */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Custom Price Alerts</h2>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">
              + Add Alert
            </button>
          </div>
          <div className="space-y-3">
            {[
              { symbol: 'TAO', condition: 'above', price: 600, current: 512 },
              { symbol: 'NVDA', condition: 'below', price: 800, current: 892 },
              { symbol: 'BTC', condition: 'above', price: 75000, current: 69289 },
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{alert.symbol}</span>
                  <span className="text-slate-400">
                    {alert.condition === 'above' ? '↑ Above' : '↓ Below'} ${alert.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500">
                    (Current: ${alert.current.toLocaleString()})
                  </span>
                </div>
                <button className="text-red-400 hover:text-red-300">Remove</button>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
}
