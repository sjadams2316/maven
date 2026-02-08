'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Integration {
  id: string;
  name: string;
  category: 'brokerage' | 'bank' | 'crypto' | 'other';
  icon: string;
  color: string;
  connected: boolean;
  lastSync?: Date;
  accounts?: number;
  status?: 'active' | 'needs_attention' | 'error';
}

const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: 'schwab',
    name: 'Charles Schwab',
    category: 'brokerage',
    icon: '💼',
    color: 'from-blue-600 to-blue-700',
    connected: true,
    lastSync: new Date(Date.now() - 30 * 60 * 1000),
    accounts: 3,
    status: 'active',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    category: 'crypto',
    icon: '₿',
    color: 'from-blue-500 to-blue-600',
    connected: true,
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    accounts: 1,
    status: 'active',
  },
  {
    id: 'fidelity',
    name: 'Fidelity',
    category: 'brokerage',
    icon: '🏛️',
    color: 'from-green-600 to-green-700',
    connected: false,
  },
  {
    id: 'vanguard',
    name: 'Vanguard',
    category: 'brokerage',
    icon: '⛵',
    color: 'from-red-600 to-red-700',
    connected: false,
  },
  {
    id: 'chase',
    name: 'Chase Bank',
    category: 'bank',
    icon: '🏧',
    color: 'from-blue-700 to-blue-800',
    connected: true,
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
    accounts: 2,
    status: 'needs_attention',
  },
  {
    id: 'robinhood',
    name: 'Robinhood',
    category: 'brokerage',
    icon: '🪶',
    color: 'from-green-500 to-green-600',
    connected: false,
  },
];

const AVAILABLE_INTEGRATIONS = [
  { id: 'plaid', name: 'Plaid', desc: 'Connect 12,000+ institutions', icon: '🔗', connected: true },
  { id: 'yodlee', name: 'Yodlee', desc: 'Enterprise data aggregation', icon: '📊', connected: false },
  { id: 'schwab-api', name: 'Schwab Direct', desc: 'Native Schwab API', icon: '💼', connected: true },
  { id: 'google-cal', name: 'Google Calendar', desc: 'Sync meeting reminders', icon: '📅', connected: false },
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Business accounting', icon: '📒', connected: false },
];

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'connected' | 'available'>('connected');
  
  const connectedIntegrations = MOCK_INTEGRATIONS.filter(i => i.connected);
  const availableIntegrations = MOCK_INTEGRATIONS.filter(i => !i.connected);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Integrations</h1>
            <p className="text-gray-400 mt-1">Manage your connected accounts and services</p>
          </div>
          
          <Link
            href="/accounts/link"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center gap-2"
          >
            <span>+</span>
            <span>Connect Account</span>
          </Link>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{connectedIntegrations.length}</p>
            <p className="text-sm text-gray-500">Connected</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">
              {connectedIntegrations.reduce((sum, i) => sum + (i.accounts || 0), 0)}
            </p>
            <p className="text-sm text-gray-500">Accounts</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {connectedIntegrations.filter(i => i.status === 'active').length}
            </p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('connected')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'connected'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Connected ({connectedIntegrations.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'available'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Available ({availableIntegrations.length})
          </button>
        </div>
        
        {/* Connected Integrations */}
        {activeTab === 'connected' && (
          <div className="space-y-4">
            {connectedIntegrations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mx-auto mb-4">
                  🔗
                </div>
                <p className="text-gray-400 mb-4">No accounts connected yet</p>
                <Link
                  href="/accounts/link"
                  className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
                >
                  Connect Your First Account
                </Link>
              </div>
            ) : (
              connectedIntegrations.map(integration => (
                <div
                  key={integration.id}
                  className="bg-[#12121a] border border-white/10 rounded-xl p-4 hover:border-white/20 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center text-2xl`}>
                      {integration.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{integration.name}</h3>
                        {integration.status === 'active' && (
                          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                        )}
                        {integration.status === 'needs_attention' && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                            Needs attention
                          </span>
                        )}
                        {integration.status === 'error' && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                            Error
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {integration.accounts} account{integration.accounts !== 1 ? 's' : ''} • 
                        Last synced {integration.lastSync ? getRelativeTime(integration.lastSync) : 'never'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white">
                        🔄
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white">
                        ⚙️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Available Integrations */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            {availableIntegrations.map(integration => (
              <div
                key={integration.id}
                className="bg-[#12121a] border border-white/10 rounded-xl p-4 hover:border-white/20 transition"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center text-2xl opacity-50`}>
                    {integration.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{integration.name}</h3>
                    <p className="text-sm text-gray-500">{integration.category}</p>
                  </div>
                  
                  <Link
                    href="/accounts/link"
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition text-sm"
                  >
                    Connect
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Platform Integrations */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-white mb-4">Platform Integrations</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {AVAILABLE_INTEGRATIONS.map(integration => (
              <div
                key={integration.id}
                className="bg-[#12121a] border border-white/10 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                  {integration.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{integration.name}</h3>
                    {integration.connected && (
                      <span className="text-xs text-emerald-400">✓ Connected</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{integration.desc}</p>
                </div>
                {!integration.connected && (
                  <button className="text-sm text-indigo-400 hover:text-indigo-300">
                    Enable
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* API Access */}
        <div className="mt-12 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl">
              🔐
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">API Access</h3>
              <p className="text-gray-400 text-sm mb-4">
                Build custom integrations with Maven's API. Available on Pro and Partners plans.
              </p>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition text-sm">
                View API Docs
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
