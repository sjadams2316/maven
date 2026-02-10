'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AssetAllocation {
  assetClass: string;
  current: number;
  target: number;
  drift: number;
}

interface SuggestedTrade {
  ticker: string;
  assetClass: string;
  action: 'BUY' | 'SELL';
  shares: number;
  dollarAmount: number;
  reason: string;
}

interface DriftHistoryPoint {
  date: string;
  drift: number;
  rebalanced?: boolean;
}

interface Client {
  id: string;
  name: string;
  email: string;
  model: string;
  modelId: string;
  aum: number;
  maxDrift: number;
  lastRebalanced: string;
  allocations: AssetAllocation[];
  suggestedTrades: SuggestedTrade[];
  driftHistory: DriftHistoryPoint[];
}

interface Model {
  id: string;
  name: string;
  thresholdWarning: number;
  thresholdAction: number;
  alertEmail: boolean;
  alertThreshold: number;
  rebalanceRule: 'threshold' | 'calendar' | 'cash-flow' | 'hybrid';
  rebalanceFrequency?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Robert & Linda Chen',
    email: 'robert.chen@email.com',
    model: 'Moderate',
    modelId: 'm2',
    aum: 1250000,
    maxDrift: 6.2,
    lastRebalanced: '2025-11-15',
    allocations: [
      { assetClass: 'US Large Cap', current: 35, target: 30, drift: 5 },
      { assetClass: 'US Small Cap', current: 8, target: 10, drift: -2 },
      { assetClass: 'International', current: 12, target: 15, drift: -3 },
      { assetClass: 'Emerging Markets', current: 3, target: 5, drift: -2 },
      { assetClass: 'US Bonds', current: 32, target: 30, drift: 2 },
      { assetClass: 'Municipal Bonds', current: 10, target: 10, drift: 0 },
    ],
    suggestedTrades: [
      { ticker: 'VTI', assetClass: 'US Large Cap', action: 'SELL', shares: 180, dollarAmount: 62500, reason: 'Overweight by 5%' },
      { ticker: 'VB', assetClass: 'US Small Cap', action: 'BUY', shares: 120, dollarAmount: 25000, reason: 'Underweight by 2%' },
      { ticker: 'VXUS', assetClass: 'International', action: 'BUY', shares: 350, dollarAmount: 37500, reason: 'Underweight by 3%' },
    ],
    driftHistory: [
      { date: '2025-08', drift: 1.2 },
      { date: '2025-09', drift: 2.1 },
      { date: '2025-10', drift: 3.5 },
      { date: '2025-11', drift: 0.8, rebalanced: true },
      { date: '2025-12', drift: 2.4 },
      { date: '2026-01', drift: 4.8 },
      { date: '2026-02', drift: 6.2 },
    ],
  },
  {
    id: '2',
    name: 'The Morrison Family Trust',
    email: 'morrison.trust@email.com',
    model: 'Conservative',
    modelId: 'm1',
    aum: 890000,
    maxDrift: 4.1,
    lastRebalanced: '2025-12-01',
    allocations: [
      { assetClass: 'US Large Cap', current: 22, target: 20, drift: 2 },
      { assetClass: 'International', current: 8, target: 10, drift: -2 },
      { assetClass: 'Emerging Markets', current: 9, target: 10, drift: -1 },
      { assetClass: 'US Bonds', current: 42, target: 40, drift: 2 },
      { assetClass: 'Municipal Bonds', current: 19, target: 20, drift: -1 },
    ],
    suggestedTrades: [
      { ticker: 'VOO', assetClass: 'US Large Cap', action: 'SELL', shares: 45, dollarAmount: 17800, reason: 'Overweight by 2%' },
      { ticker: 'VXUS', assetClass: 'International', action: 'BUY', shares: 180, dollarAmount: 17800, reason: 'Underweight by 2%' },
    ],
    driftHistory: [
      { date: '2025-08', drift: 0.8 },
      { date: '2025-09', drift: 1.5 },
      { date: '2025-10', drift: 2.2 },
      { date: '2025-11', drift: 2.8 },
      { date: '2025-12', drift: 0.5, rebalanced: true },
      { date: '2026-01', drift: 2.1 },
      { date: '2026-02', drift: 4.1 },
    ],
  },
  {
    id: '3',
    name: 'Jennifer Walsh',
    email: 'j.walsh@email.com',
    model: 'Aggressive',
    modelId: 'm3',
    aum: 675000,
    maxDrift: 2.1,
    lastRebalanced: '2026-01-20',
    allocations: [
      { assetClass: 'US Large Cap', current: 41, target: 40, drift: 1 },
      { assetClass: 'US Small Cap', current: 19, target: 20, drift: -1 },
      { assetClass: 'International', current: 21, target: 20, drift: 1 },
      { assetClass: 'Emerging Markets', current: 9, target: 10, drift: -1 },
      { assetClass: 'US Bonds', current: 10, target: 10, drift: 0 },
    ],
    suggestedTrades: [],
    driftHistory: [
      { date: '2025-08', drift: 1.8 },
      { date: '2025-09', drift: 2.5 },
      { date: '2025-10', drift: 3.2 },
      { date: '2025-11', drift: 4.1 },
      { date: '2025-12', drift: 4.8 },
      { date: '2026-01', drift: 0.6, rebalanced: true },
      { date: '2026-02', drift: 2.1 },
    ],
  },
  {
    id: '4',
    name: 'Michael Thompson',
    email: 'm.thompson@email.com',
    model: 'Moderate',
    modelId: 'm2',
    aum: 520000,
    maxDrift: 1.8,
    lastRebalanced: '2026-02-01',
    allocations: [
      { assetClass: 'US Large Cap', current: 31, target: 30, drift: 1 },
      { assetClass: 'US Small Cap', current: 10, target: 10, drift: 0 },
      { assetClass: 'International', current: 14, target: 15, drift: -1 },
      { assetClass: 'Emerging Markets', current: 5, target: 5, drift: 0 },
      { assetClass: 'US Bonds', current: 30, target: 30, drift: 0 },
      { assetClass: 'Municipal Bonds', current: 10, target: 10, drift: 0 },
    ],
    suggestedTrades: [],
    driftHistory: [
      { date: '2025-08', drift: 2.2 },
      { date: '2025-09', drift: 2.8 },
      { date: '2025-10', drift: 3.5 },
      { date: '2025-11', drift: 4.2 },
      { date: '2025-12', drift: 5.1 },
      { date: '2026-01', drift: 5.8 },
      { date: '2026-02', drift: 0.4, rebalanced: true },
    ],
  },
  {
    id: '5',
    name: 'Sarah & David Park',
    email: 'parks@email.com',
    model: 'Conservative',
    modelId: 'm1',
    aum: 445000,
    maxDrift: 5.4,
    lastRebalanced: '2025-10-15',
    allocations: [
      { assetClass: 'US Large Cap', current: 24, target: 20, drift: 4 },
      { assetClass: 'International', current: 7, target: 10, drift: -3 },
      { assetClass: 'Emerging Markets', current: 8, target: 10, drift: -2 },
      { assetClass: 'US Bonds', current: 43, target: 40, drift: 3 },
      { assetClass: 'Municipal Bonds', current: 18, target: 20, drift: -2 },
    ],
    suggestedTrades: [
      { ticker: 'VOO', assetClass: 'US Large Cap', action: 'SELL', shares: 42, dollarAmount: 17800, reason: 'Overweight by 4%' },
      { ticker: 'VXUS', assetClass: 'International', action: 'BUY', shares: 135, dollarAmount: 13350, reason: 'Underweight by 3%' },
      { ticker: 'BND', assetClass: 'US Bonds', action: 'SELL', shares: 150, dollarAmount: 13350, reason: 'Overweight by 3%' },
    ],
    driftHistory: [
      { date: '2025-08', drift: 1.5 },
      { date: '2025-09', drift: 2.3 },
      { date: '2025-10', drift: 0.8, rebalanced: true },
      { date: '2025-11', drift: 2.1 },
      { date: '2025-12', drift: 3.5 },
      { date: '2026-01', drift: 4.2 },
      { date: '2026-02', drift: 5.4 },
    ],
  },
  {
    id: '6',
    name: 'William Hartley',
    email: 'w.hartley@email.com',
    model: 'Aggressive',
    modelId: 'm3',
    aum: 380000,
    maxDrift: 3.2,
    lastRebalanced: '2025-12-20',
    allocations: [
      { assetClass: 'US Large Cap', current: 42, target: 40, drift: 2 },
      { assetClass: 'US Small Cap', current: 18, target: 20, drift: -2 },
      { assetClass: 'International', current: 21, target: 20, drift: 1 },
      { assetClass: 'Emerging Markets', current: 9, target: 10, drift: -1 },
      { assetClass: 'US Bonds', current: 10, target: 10, drift: 0 },
    ],
    suggestedTrades: [
      { ticker: 'VTI', assetClass: 'US Large Cap', action: 'SELL', shares: 22, dollarAmount: 7600, reason: 'Overweight by 2%' },
      { ticker: 'VB', assetClass: 'US Small Cap', action: 'BUY', shares: 38, dollarAmount: 7600, reason: 'Underweight by 2%' },
    ],
    driftHistory: [
      { date: '2025-08', drift: 2.5 },
      { date: '2025-09', drift: 3.2 },
      { date: '2025-10', drift: 3.8 },
      { date: '2025-11', drift: 4.5 },
      { date: '2025-12', drift: 0.9, rebalanced: true },
      { date: '2026-01', drift: 2.1 },
      { date: '2026-02', drift: 3.2 },
    ],
  },
];

const DEMO_MODELS: Model[] = [
  {
    id: 'm1',
    name: 'Conservative',
    thresholdWarning: 3,
    thresholdAction: 5,
    alertEmail: true,
    alertThreshold: 5,
    rebalanceRule: 'threshold',
  },
  {
    id: 'm2',
    name: 'Moderate',
    thresholdWarning: 3,
    thresholdAction: 5,
    alertEmail: true,
    alertThreshold: 5,
    rebalanceRule: 'hybrid',
    rebalanceFrequency: 'quarterly',
  },
  {
    id: 'm3',
    name: 'Aggressive',
    thresholdWarning: 4,
    thresholdAction: 6,
    alertEmail: false,
    alertThreshold: 6,
    rebalanceRule: 'calendar',
    rebalanceFrequency: 'quarterly',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDriftStatus(drift: number): { label: string; color: string; bgColor: string; icon: string } {
  if (drift < 3) {
    return { label: 'On Target', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', icon: '✓' };
  } else if (drift < 5) {
    return { label: 'Drifting', color: 'text-amber-400', bgColor: 'bg-amber-500/20', icon: '⚠️' };
  }
  return { label: 'Action Needed', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: '🔴' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Bar Chart Colors
// ─────────────────────────────────────────────────────────────────────────────

const BAR_COLORS = {
  current: '#f59e0b',
  target: '#6b7280',
  positive: '#10b981',
  negative: '#ef4444',
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip for Drift History
// ─────────────────────────────────────────────────────────────────────────────

function DriftHistoryTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      <div className="text-sm font-medium text-gray-300 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Max Drift:</span>
        <span className={`font-semibold ${data.drift < 3 ? 'text-emerald-400' : data.drift < 5 ? 'text-amber-400' : 'text-red-400'}`}>
          {data.drift.toFixed(1)}%
        </span>
      </div>
      {data.rebalanced && (
        <div className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
          <span>↻</span>
          <span>Rebalanced</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DriftMonitoringPage() {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [models, setModels] = useState<Model[]>(DEMO_MODELS);
  const [sortBy, setSortBy] = useState<'drift' | 'name' | 'aum'>('drift');
  const [filterModel, setFilterModel] = useState<string>('all');

  // Sort and filter clients
  const sortedClients = useMemo(() => {
    let filtered = [...DEMO_CLIENTS];
    
    // Filter by model
    if (filterModel !== 'all') {
      filtered = filtered.filter(c => c.modelId === filterModel);
    }
    
    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'drift') return b.maxDrift - a.maxDrift;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'aum') return b.aum - a.aum;
      return 0;
    });
  }, [sortBy, filterModel]);

  // Stats
  const stats = useMemo(() => {
    const total = DEMO_CLIENTS.length;
    const onTarget = DEMO_CLIENTS.filter(c => c.maxDrift < 3).length;
    const drifting = DEMO_CLIENTS.filter(c => c.maxDrift >= 3 && c.maxDrift < 5).length;
    const actionNeeded = DEMO_CLIENTS.filter(c => c.maxDrift >= 5).length;
    return { total, onTarget, drifting, actionNeeded };
  }, []);

  // Toggle selection
  const toggleSelect = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  // Select all
  const selectAll = () => {
    if (selectedClients.length === sortedClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(sortedClients.map(c => c.id));
    }
  };

  // Handle bulk actions
  const handleGenerateTrades = () => {
    const clientNames = DEMO_CLIENTS
      .filter(c => selectedClients.includes(c.id))
      .map(c => c.name)
      .join(', ');
    alert(`Generating rebalance trades for: ${clientNames}`);
  };

  const handleMarkReviewed = () => {
    const clientNames = DEMO_CLIENTS
      .filter(c => selectedClients.includes(c.id))
      .map(c => c.name)
      .join(', ');
    alert(`Marked as reviewed: ${clientNames}`);
    setSelectedClients([]);
  };

  // Save model settings
  const handleSaveSettings = () => {
    if (editingModel) {
      setModels(prev =>
        prev.map(m => (m.id === editingModel.id ? editingModel : m))
      );
    }
    setShowSettingsModal(false);
    setEditingModel(null);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1 md:mb-2">
            <Link href="/partners/models" className="text-gray-400 hover:text-white transition-colors">
              Model Portfolios
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Drift Monitoring</h1>
          </div>
          <p className="text-gray-400 text-sm md:text-base">
            Monitor portfolio drift across all clients and take action when needed
          </p>
        </div>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px] w-full sm:w-auto"
        >
          <span>⚙️</span>
          <span>Drift Settings</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">Total Clients</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="text-emerald-400 text-sm mb-1">✓ On Target</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.onTarget}</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="text-amber-400 text-sm mb-1">⚠️ Drifting</div>
          <div className="text-2xl font-bold text-amber-400">{stats.drifting}</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="text-red-400 text-sm mb-1">🔴 Action Needed</div>
          <div className="text-2xl font-bold text-red-400">{stats.actionNeeded}</div>
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Model filter */}
          <select
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
          >
            <option value="all">All Models</option>
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
          >
            <option value="drift">Sort by Drift (High → Low)</option>
            <option value="name">Sort by Name</option>
            <option value="aum">Sort by AUM</option>
          </select>
        </div>

        {/* Bulk actions */}
        {selectedClients.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-400 text-sm">{selectedClients.length} selected</span>
            <button
              onClick={handleGenerateTrades}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
            >
              Generate Rebalance Trades
            </button>
            <button
              onClick={handleMarkReviewed}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
            >
              Mark as Reviewed
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className={`${selectedClient ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 p-4 border-b border-white/10 bg-white/5 text-gray-400 text-sm font-medium">
              <div className="flex items-center">
                <button
                  onClick={selectAll}
                  className="w-5 h-5 rounded border border-white/20 flex items-center justify-center hover:border-amber-500 transition-colors"
                >
                  {selectedClients.length === sortedClients.length && sortedClients.length > 0 && (
                    <span className="text-amber-500 text-xs">✓</span>
                  )}
                </button>
              </div>
              <div>Client</div>
              <div>Model</div>
              <div className="text-right">Max Drift</div>
              <div className="text-center">Status</div>
              <div className="text-right">Last Rebalanced</div>
            </div>

            {/* Client Rows */}
            <div className="divide-y divide-white/5">
              {sortedClients.map((client) => {
                const status = getDriftStatus(client.maxDrift);
                const isSelected = selectedClients.includes(client.id);
                const isActive = selectedClient?.id === client.id;

                return (
                  <div
                    key={client.id}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${isActive ? 'bg-amber-500/10 border-l-2 border-amber-500' : ''}`}
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="flex items-start gap-3 mb-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(client.id);
                          }}
                          className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-amber-600 border-amber-600' : 'border-white/20 hover:border-amber-500'
                          }`}
                        >
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </button>
                        <div className="flex-1 min-w-0" onClick={() => setSelectedClient(isActive ? null : client)}>
                          <div className="text-white font-medium truncate">{client.name}</div>
                          <div className="text-gray-500 text-sm">{client.model} • {formatCurrency(client.aum)}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          {status.icon} {client.maxDrift.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm pl-8">
                        <span className="text-gray-500">Last: {formatDate(client.lastRebalanced)}</span>
                        <span className={status.color}>{status.label}</span>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div
                      className="hidden md:grid md:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4"
                      onClick={() => setSelectedClient(isActive ? null : client)}
                    >
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(client.id);
                          }}
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-amber-600 border-amber-600' : 'border-white/20 hover:border-amber-500'
                          }`}
                        >
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </button>
                      </div>
                      <div>
                        <div className="text-white font-medium">{client.name}</div>
                        <div className="text-gray-500 text-sm">{formatCurrency(client.aum)}</div>
                      </div>
                      <div className="text-gray-400">{client.model}</div>
                      <div className={`text-right font-semibold ${status.color}`}>
                        {client.maxDrift.toFixed(1)}%
                      </div>
                      <div className="text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <div className="text-right text-gray-400 text-sm">
                        {formatDate(client.lastRebalanced)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedClient && (
          <div className="lg:col-span-2 space-y-6">
            {/* Client Header */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedClient.name}</h2>
                  <p className="text-gray-400">
                    {selectedClient.model} Model • {formatCurrency(selectedClient.aum)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-white transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Current vs Target Allocation */}
              <h3 className="text-white font-semibold mb-4">Current vs Target Allocation</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={selectedClient.allocations}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 100, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                    <XAxis type="number" domain={[0, 50]} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#374151' }} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="assetClass" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#374151' }} width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value) => [`${value}%`, '']}
                      labelFormatter={() => ''}
                    />
                    <Bar dataKey="target" fill={BAR_COLORS.target} name="Target" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="current" fill={BAR_COLORS.current} name="Current" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Drift by Asset Class */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Drift by Asset Class</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={selectedClient.allocations}
                    margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="assetClass" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: '#374151' }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#374151' }} tickFormatter={(v) => `${v}%`} domain={[-5, 5]} />
                    <ReferenceLine y={0} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value) => [`${Number(value) > 0 ? '+' : ''}${value}%`, 'Drift']}
                    />
                    <Bar dataKey="drift" radius={[4, 4, 0, 0]}>
                      {selectedClient.allocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.drift >= 0 ? BAR_COLORS.positive : BAR_COLORS.negative} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Over/Underweight indicators */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-emerald-400 text-sm font-medium mb-2">Overweight</h4>
                  <div className="space-y-1">
                    {selectedClient.allocations
                      .filter(a => a.drift > 0)
                      .sort((a, b) => b.drift - a.drift)
                      .map(a => (
                        <div key={a.assetClass} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{a.assetClass}</span>
                          <span className="text-emerald-400">+{a.drift}%</span>
                        </div>
                      ))}
                    {selectedClient.allocations.filter(a => a.drift > 0).length === 0 && (
                      <span className="text-gray-500 text-sm">None</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-red-400 text-sm font-medium mb-2">Underweight</h4>
                  <div className="space-y-1">
                    {selectedClient.allocations
                      .filter(a => a.drift < 0)
                      .sort((a, b) => a.drift - b.drift)
                      .map(a => (
                        <div key={a.assetClass} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{a.assetClass}</span>
                          <span className="text-red-400">{a.drift}%</span>
                        </div>
                      ))}
                    {selectedClient.allocations.filter(a => a.drift < 0).length === 0 && (
                      <span className="text-gray-500 text-sm">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Trades */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Suggested Trades to Fix</h3>
                {selectedClient.suggestedTrades.length > 0 && (
                  <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]">
                    Generate Orders
                  </button>
                )}
              </div>
              
              {selectedClient.suggestedTrades.length > 0 ? (
                <div className="space-y-3">
                  {selectedClient.suggestedTrades.map((trade, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          trade.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.action}
                        </span>
                        <div>
                          <div className="text-white font-mono">{trade.ticker}</div>
                          <div className="text-gray-500 text-sm">{trade.assetClass}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{trade.shares} shares</div>
                        <div className="text-gray-400 text-sm">{formatCurrency(trade.dollarAmount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Portfolio is within acceptable drift thresholds. No trades suggested.
                </div>
              )}
            </div>

            {/* Historical Drift Chart */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Historical Drift</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedClient.driftHistory} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#374151' }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#374151' }} tickFormatter={(v) => `${v}%`} domain={[0, 8]} />
                    {/* Warning threshold */}
                    <ReferenceLine y={3} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Warning', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
                    {/* Action threshold */}
                    <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Action', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                    <Tooltip content={<DriftHistoryTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="drift"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        if (payload.rebalanced) {
                          return (
                            <g key={`dot-${payload.date}`}>
                              <circle cx={cx} cy={cy} r={8} fill="#10b981" opacity={0.3} />
                              <circle cx={cx} cy={cy} r={5} fill="#10b981" />
                            </g>
                          );
                        }
                        return <circle key={`dot-${payload.date}`} cx={cx} cy={cy} r={4} fill="#3b82f6" />;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-400">Drift %</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-gray-400">Rebalanced</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drift Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#12121a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl p-6 md:p-8 w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Drift Settings</h2>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setEditingModel(null);
                }}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {!editingModel ? (
              // Model List
              <div className="space-y-4">
                <p className="text-gray-400 mb-4">Configure drift thresholds and alert settings for each model</p>
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setEditingModel({ ...model })}
                    className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{model.name}</h3>
                        <p className="text-gray-500 text-sm">
                          Warning: {model.thresholdWarning}% • Action: {model.thresholdAction}% • {model.rebalanceRule}
                        </p>
                      </div>
                      <span className="text-gray-500">→</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              // Edit Model Settings
              <div className="space-y-6">
                <button
                  onClick={() => setEditingModel(null)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors min-h-[44px]"
                >
                  <span>←</span>
                  <span>Back to Models</span>
                </button>

                <h3 className="text-xl font-semibold text-white">{editingModel.name} Model</h3>

                {/* Drift Thresholds */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-3">Drift Thresholds</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-500 text-sm mb-2">Warning Level (%)</label>
                      <input
                        type="number"
                        value={editingModel.thresholdWarning}
                        onChange={(e) => setEditingModel({ ...editingModel, thresholdWarning: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-sm mb-2">Action Level (%)</label>
                      <input
                        type="number"
                        value={editingModel.thresholdAction}
                        onChange={(e) => setEditingModel({ ...editingModel, thresholdAction: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Alert Preferences */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-3">Alert Preferences</h4>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingModel.alertEmail}
                        onChange={(e) => setEditingModel({ ...editingModel, alertEmail: e.target.checked })}
                        className="w-5 h-5 rounded bg-white/10 border-white/20 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-white">Send email alerts</span>
                    </label>
                    {editingModel.alertEmail && (
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Alert when drift exceeds (%)</label>
                        <input
                          type="number"
                          value={editingModel.alertThreshold}
                          onChange={(e) => setEditingModel({ ...editingModel, alertThreshold: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Rebalancing Rules */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-3">Rebalancing Rules</h4>
                  <div className="space-y-3">
                    {[
                      { value: 'threshold', label: 'Threshold-based', desc: 'Rebalance when drift exceeds action level' },
                      { value: 'calendar', label: 'Calendar-based', desc: 'Rebalance on a fixed schedule' },
                      { value: 'cash-flow', label: 'Cash flow-based', desc: 'Rebalance with deposits/withdrawals' },
                      { value: 'hybrid', label: 'Hybrid', desc: 'Combine threshold with scheduled reviews' },
                    ].map((rule) => (
                      <label key={rule.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/5">
                        <input
                          type="radio"
                          name="rebalanceRule"
                          value={rule.value}
                          checked={editingModel.rebalanceRule === rule.value}
                          onChange={(e) => setEditingModel({ ...editingModel, rebalanceRule: e.target.value as any })}
                          className="mt-1 w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <span className="text-white font-medium">{rule.label}</span>
                          <p className="text-gray-500 text-sm">{rule.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {(editingModel.rebalanceRule === 'calendar' || editingModel.rebalanceRule === 'hybrid') && (
                    <div className="mt-4">
                      <label className="block text-gray-500 text-sm mb-2">Frequency</label>
                      <select
                        value={editingModel.rebalanceFrequency || 'quarterly'}
                        onChange={(e) => setEditingModel({ ...editingModel, rebalanceFrequency: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="semi-annual">Semi-Annual</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
                  <button
                    onClick={() => setEditingModel(null)}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium min-h-[48px]"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
