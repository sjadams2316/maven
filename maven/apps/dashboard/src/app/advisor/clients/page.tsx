'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

// Same mock data - in production this would be shared/fetched
const MOCK_CLIENTS = [
  {
    id: '1',
    firstName: 'Sam',
    lastName: 'Adams',
    email: 'sam@example.com',
    aum: 847000,
    ytdReturn: 8.2,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    nextMeeting: new Date('2026-02-12T14:00:00'),
    alerts: 2,
    tone: 'engaged' as const,
    status: 'active' as const,
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    aum: 1200000,
    ytdReturn: 6.8,
    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    nextMeeting: new Date('2026-02-14T10:00:00'),
    alerts: 1,
    tone: 'moderate' as const,
    status: 'active' as const,
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Jones',
    email: 'bob@example.com',
    aum: 520000,
    ytdReturn: 5.4,
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    nextMeeting: new Date('2026-02-20T15:00:00'),
    alerts: 0,
    tone: 'conservative' as const,
    status: 'active' as const,
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah@example.com',
    aum: 2100000,
    ytdReturn: 9.1,
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    nextMeeting: new Date('2026-02-18T11:00:00'),
    alerts: 3,
    tone: 'engaged' as const,
    status: 'active' as const,
  },
  {
    id: '5',
    firstName: 'Michael',
    lastName: 'Torres',
    email: 'michael@example.com',
    aum: 680000,
    ytdReturn: 7.3,
    lastLogin: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    nextMeeting: null,
    alerts: 1,
    tone: 'moderate' as const,
    status: 'active' as const,
  },
  {
    id: '6',
    firstName: 'Emily',
    lastName: 'Watson',
    email: 'emily@example.com',
    aum: 340000,
    ytdReturn: 4.2,
    lastLogin: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    nextMeeting: null,
    alerts: 0,
    tone: 'conservative' as const,
    status: 'inactive' as const,
  },
  {
    id: '7',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david@example.com',
    aum: 1500000,
    ytdReturn: 7.8,
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    nextMeeting: new Date('2026-02-25T09:00:00'),
    alerts: 0,
    tone: 'moderate' as const,
    status: 'active' as const,
  },
  {
    id: '8',
    firstName: 'Lisa',
    lastName: 'Park',
    email: 'lisa@example.com',
    aum: 920000,
    ytdReturn: 6.5,
    lastLogin: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    nextMeeting: null,
    alerts: 2,
    tone: 'engaged' as const,
    status: 'active' as const,
  },
];

type SortField = 'name' | 'aum' | 'lastLogin' | 'alerts';
type FilterType = 'all' | 'needs_attention' | 'inactive';

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  return `$${(amount / 1000).toFixed(0)}K`;
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
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default function ClientsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('aum');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter clients
  let filteredClients = MOCK_CLIENTS.filter(client => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      client.firstName.toLowerCase().includes(searchLower) ||
      client.lastName.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower);
    
    // Status filter
    let matchesFilter = true;
    if (filter === 'needs_attention') {
      matchesFilter = client.alerts > 0;
    } else if (filter === 'inactive') {
      const daysSinceLogin = (Date.now() - client.lastLogin.getTime()) / (1000 * 60 * 60 * 24);
      matchesFilter = daysSinceLogin > 30;
    }
    
    return matchesSearch && matchesFilter;
  });
  
  // Sort clients
  filteredClients = filteredClients.sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        break;
      case 'aum':
        comparison = a.aum - b.aum;
        break;
      case 'lastLogin':
        comparison = a.lastLogin.getTime() - b.lastLogin.getTime();
        break;
      case 'alerts':
        comparison = a.alerts - b.alerts;
        break;
    }
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });
  
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const totalAUM = MOCK_CLIENTS.reduce((sum, c) => sum + c.aum, 0);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Link href="/advisor" className="hover:text-white transition">Advisor</Link>
              <span>/</span>
              <span className="text-white">Clients</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Client Book</h1>
            <p className="text-gray-400 text-sm mt-1">
              {MOCK_CLIENTS.length} clients · {formatCurrency(totalAUM)} total AUM
            </p>
          </div>
          
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center gap-2">
            <span>+</span>
            <span>Add Client</span>
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>
          
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition appearance-none cursor-pointer"
          >
            <option value="all">All Clients</option>
            <option value="needs_attention">Needs Attention</option>
            <option value="inactive">Inactive (30+ days)</option>
          </select>
          
          {/* Sort */}
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split('-');
              setSortField(field as SortField);
              setSortDirection(dir as 'asc' | 'desc');
            }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition appearance-none cursor-pointer"
          >
            <option value="aum-desc">AUM (High to Low)</option>
            <option value="aum-asc">AUM (Low to High)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="lastLogin-desc">Last Login (Recent)</option>
            <option value="lastLogin-asc">Last Login (Oldest)</option>
            <option value="alerts-desc">Alerts (Most)</option>
          </select>
        </div>
        
        {/* Client Table */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 border-b border-white/10 text-sm text-gray-400">
            <div className="col-span-4">Client</div>
            <div className="col-span-2 text-right">AUM</div>
            <div className="col-span-2">Last Login</div>
            <div className="col-span-1 text-center">Alerts</div>
            <div className="col-span-2">Tone</div>
            <div className="col-span-1"></div>
          </div>
          
          {/* Client Rows */}
          <div className="divide-y divide-white/5">
            {filteredClients.map(client => (
              <Link
                key={client.id}
                href={`/advisor/clients/${client.id}`}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-white/5 transition group"
              >
                {/* Client Info */}
                <div className="sm:col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {client.firstName[0]}{client.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white group-hover:text-indigo-300 transition truncate">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{client.email}</p>
                  </div>
                </div>
                
                {/* AUM */}
                <div className="sm:col-span-2 flex items-center sm:justify-end">
                  <span className="sm:hidden text-gray-500 text-sm mr-2">AUM:</span>
                  <span className="font-semibold text-white">{formatCurrency(client.aum)}</span>
                </div>
                
                {/* Last Login */}
                <div className="sm:col-span-2 flex items-center">
                  <span className="sm:hidden text-gray-500 text-sm mr-2">Last login:</span>
                  <span className={`text-sm ${
                    (Date.now() - client.lastLogin.getTime()) > 30 * 24 * 60 * 60 * 1000 
                      ? 'text-amber-400' 
                      : 'text-gray-400'
                  }`}>
                    {getRelativeTime(client.lastLogin)}
                  </span>
                </div>
                
                {/* Alerts */}
                <div className="sm:col-span-1 flex items-center sm:justify-center">
                  <span className="sm:hidden text-gray-500 text-sm mr-2">Alerts:</span>
                  {client.alerts > 0 ? (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                      {client.alerts}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </div>
                
                {/* Tone */}
                <div className="sm:col-span-2 flex items-center">
                  <span className="sm:hidden text-gray-500 text-sm mr-2">Tone:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    client.tone === 'conservative' 
                      ? 'bg-blue-500/20 text-blue-400'
                      : client.tone === 'moderate'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {client.tone.charAt(0).toUpperCase() + client.tone.slice(1)}
                  </span>
                </div>
                
                {/* Action */}
                <div className="sm:col-span-1 flex items-center justify-end">
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
          
          {filteredClients.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No clients match your search criteria
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
