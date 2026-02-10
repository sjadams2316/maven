'use client';

import { useState } from 'react';
import Link from 'next/link';

// Extended demo data
const DEMO_CLIENTS = [
  { id: '1', name: 'Robert & Linda Chen', email: 'robert.chen@email.com', aum: 1250000, change: 3.2, alerts: 2, lastContact: '2 days ago', status: 'active' },
  { id: '2', name: 'The Morrison Family Trust', email: 'morrison.trust@email.com', aum: 890000, change: -1.1, alerts: 0, lastContact: '1 week ago', status: 'active' },
  { id: '3', name: 'Jennifer Walsh', email: 'j.walsh@email.com', aum: 675000, change: 2.8, alerts: 1, lastContact: '3 days ago', status: 'active' },
  { id: '4', name: 'Michael Thompson', email: 'm.thompson@email.com', aum: 520000, change: 4.1, alerts: 0, lastContact: '5 days ago', status: 'active' },
  { id: '5', name: 'Sarah & David Park', email: 'parks@email.com', aum: 445000, change: 1.9, alerts: 3, lastContact: '1 day ago', status: 'active' },
  { id: '6', name: 'William Hartley', email: 'w.hartley@email.com', aum: 380000, change: 0.5, alerts: 0, lastContact: '2 weeks ago', status: 'active' },
  { id: '7', name: 'Emily Richardson', email: 'emily.r@email.com', aum: 290000, change: 2.1, alerts: 1, lastContact: '4 days ago', status: 'pending' },
  { id: '8', name: 'James & Maria Santos', email: 'santos.family@email.com', aum: 0, change: 0, alerts: 0, lastContact: 'Never', status: 'invited' },
];

function formatCurrency(value: number): string {
  if (value === 0) return '—';
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
}

export default function PartnersClients() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'invited'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'aum' | 'alerts'>('aum');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Filter and sort clients
  const filteredClients = DEMO_CLIENTS
    .filter(c => {
      if (filter !== 'all' && c.status !== filter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'aum') return b.aum - a.aum;
      if (sortBy === 'alerts') return b.alerts - a.alerts;
      return 0;
    });

  const totalAUM = DEMO_CLIENTS.reduce((sum, c) => sum + c.aum, 0);
  const activeCount = DEMO_CLIENTS.filter(c => c.status === 'active').length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
          <p className="text-gray-400">
            {activeCount} active clients • {formatCurrency(totalAUM)} total AUM
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Invite Client</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
          {(['all', 'active', 'pending', 'invited'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="aum">Sort by AUM</option>
          <option value="name">Sort by Name</option>
          <option value="alerts">Sort by Alerts</option>
        </select>
      </div>

      {/* Client List */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm border-b border-white/10 bg-white/5">
              <th className="p-4 font-medium">Client</th>
              <th className="p-4 font-medium text-right">AUM</th>
              <th className="p-4 font-medium text-right">MTD</th>
              <th className="p-4 font-medium text-center">Status</th>
              <th className="p-4 font-medium text-right">Last Contact</th>
              <th className="p-4 font-medium text-right">Alerts</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-4">
                  <Link href={`/partners/clients/${client.id}`} className="block">
                    <div className="text-white font-medium hover:text-amber-400 transition-colors">
                      {client.name}
                    </div>
                    <div className="text-gray-500 text-sm">{client.email}</div>
                  </Link>
                </td>
                <td className="p-4 text-right text-white font-medium">
                  {formatCurrency(client.aum)}
                </td>
                <td className={`p-4 text-right ${
                  client.change > 0 ? 'text-emerald-500' : client.change < 0 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {client.aum > 0 ? `${client.change > 0 ? '+' : ''}${client.change}%` : '—'}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    client.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    client.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="p-4 text-right text-gray-400">
                  {client.lastContact}
                </td>
                <td className="p-4 text-right">
                  {client.alerts > 0 ? (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-sm font-medium">
                      {client.alerts}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <Link
                    href={`/partners/clients/${client.id}`}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                  >
                    →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClients.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No clients match your search
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-2">Invite a Client</h2>
            <p className="text-gray-400 mb-6">Send an invite link to give your client access to their Maven Partners portal.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Client Name</label>
                <input
                  type="text"
                  placeholder="John & Jane Doe"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="client@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Send invite
                  setShowInviteModal(false);
                }}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
