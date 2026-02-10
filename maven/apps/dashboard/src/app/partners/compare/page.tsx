'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Holding {
  ticker: string;
  name: string;
  value: number;
  allocation: number;
  category: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  aum: number;
  riskScore: number;
  riskTolerance: string;
  holdings: Holding[];
  allocations: { category: string; percentage: number }[];
  performance: { date: string; value: number }[];
  sectorExposures: { sector: string; percentage: number }[];
}

type TabId = 'allocation' | 'holdings' | 'performance' | 'risk';

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Robert & Linda Chen',
    email: 'robert.chen@email.com',
    aum: 1250000,
    riskScore: 65,
    riskTolerance: 'Moderate',
    holdings: [
      { ticker: 'VTI', name: 'Vanguard Total Stock Market', value: 425000, allocation: 34, category: 'US Equity' },
      { ticker: 'VXUS', name: 'Vanguard Total International', value: 187500, allocation: 15, category: 'International' },
      { ticker: 'BND', name: 'Vanguard Total Bond', value: 250000, allocation: 20, category: 'Bonds' },
      { ticker: 'AAPL', name: 'Apple Inc', value: 156250, allocation: 12.5, category: 'Individual Stocks' },
      { ticker: 'MSFT', name: 'Microsoft Corp', value: 125000, allocation: 10, category: 'Individual Stocks' },
      { ticker: 'Cash', name: 'Cash & Equivalents', value: 106250, allocation: 8.5, category: 'Cash' },
    ],
    allocations: [
      { category: 'US Equity', percentage: 56.5 },
      { category: 'International', percentage: 15 },
      { category: 'Bonds', percentage: 20 },
      { category: 'Cash', percentage: 8.5 },
    ],
    performance: generatePerformanceData(100, 1.12),
    sectorExposures: [
      { sector: 'Technology', percentage: 32 },
      { sector: 'Healthcare', percentage: 14 },
      { sector: 'Financial', percentage: 12 },
      { sector: 'Consumer', percentage: 15 },
      { sector: 'Industrial', percentage: 10 },
      { sector: 'Other', percentage: 17 },
    ],
  },
  {
    id: '2',
    name: 'The Morrison Family Trust',
    email: 'morrison.trust@email.com',
    aum: 890000,
    riskScore: 45,
    riskTolerance: 'Conservative',
    holdings: [
      { ticker: 'BND', name: 'Vanguard Total Bond', value: 267000, allocation: 30, category: 'Bonds' },
      { ticker: 'VTIP', name: 'Vanguard TIPS', value: 133500, allocation: 15, category: 'Bonds' },
      { ticker: 'VTI', name: 'Vanguard Total Stock Market', value: 222500, allocation: 25, category: 'US Equity' },
      { ticker: 'VIG', name: 'Vanguard Dividend Appreciation', value: 133500, allocation: 15, category: 'US Equity' },
      { ticker: 'VXUS', name: 'Vanguard Total International', value: 89000, allocation: 10, category: 'International' },
      { ticker: 'Cash', name: 'Cash & Equivalents', value: 44500, allocation: 5, category: 'Cash' },
    ],
    allocations: [
      { category: 'US Equity', percentage: 40 },
      { category: 'International', percentage: 10 },
      { category: 'Bonds', percentage: 45 },
      { category: 'Cash', percentage: 5 },
    ],
    performance: generatePerformanceData(100, 1.06),
    sectorExposures: [
      { sector: 'Technology', percentage: 18 },
      { sector: 'Healthcare', percentage: 12 },
      { sector: 'Financial', percentage: 15 },
      { sector: 'Consumer', percentage: 12 },
      { sector: 'Industrial', percentage: 8 },
      { sector: 'Other', percentage: 35 },
    ],
  },
  {
    id: '3',
    name: 'Jennifer Walsh',
    email: 'j.walsh@email.com',
    aum: 675000,
    riskScore: 82,
    riskTolerance: 'Aggressive',
    holdings: [
      { ticker: 'VTI', name: 'Vanguard Total Stock Market', value: 270000, allocation: 40, category: 'US Equity' },
      { ticker: 'QQQ', name: 'Invesco QQQ Trust', value: 135000, allocation: 20, category: 'US Equity' },
      { ticker: 'VXUS', name: 'Vanguard Total International', value: 101250, allocation: 15, category: 'International' },
      { ticker: 'VWO', name: 'Vanguard Emerging Markets', value: 67500, allocation: 10, category: 'International' },
      { ticker: 'NVDA', name: 'NVIDIA Corp', value: 67500, allocation: 10, category: 'Individual Stocks' },
      { ticker: 'Cash', name: 'Cash & Equivalents', value: 33750, allocation: 5, category: 'Cash' },
    ],
    allocations: [
      { category: 'US Equity', percentage: 70 },
      { category: 'International', percentage: 25 },
      { category: 'Bonds', percentage: 0 },
      { category: 'Cash', percentage: 5 },
    ],
    performance: generatePerformanceData(100, 1.18),
    sectorExposures: [
      { sector: 'Technology', percentage: 45 },
      { sector: 'Healthcare', percentage: 10 },
      { sector: 'Financial', percentage: 8 },
      { sector: 'Consumer', percentage: 18 },
      { sector: 'Industrial', percentage: 7 },
      { sector: 'Other', percentage: 12 },
    ],
  },
  {
    id: '4',
    name: 'Michael Thompson',
    email: 'm.thompson@email.com',
    aum: 520000,
    riskScore: 58,
    riskTolerance: 'Moderate',
    holdings: [
      { ticker: 'VOO', name: 'Vanguard S&P 500', value: 182000, allocation: 35, category: 'US Equity' },
      { ticker: 'VEA', name: 'Vanguard FTSE Developed', value: 78000, allocation: 15, category: 'International' },
      { ticker: 'BND', name: 'Vanguard Total Bond', value: 130000, allocation: 25, category: 'Bonds' },
      { ticker: 'VNQ', name: 'Vanguard Real Estate', value: 52000, allocation: 10, category: 'Real Estate' },
      { ticker: 'GLD', name: 'SPDR Gold Shares', value: 52000, allocation: 10, category: 'Commodities' },
      { ticker: 'Cash', name: 'Cash & Equivalents', value: 26000, allocation: 5, category: 'Cash' },
    ],
    allocations: [
      { category: 'US Equity', percentage: 35 },
      { category: 'International', percentage: 15 },
      { category: 'Bonds', percentage: 25 },
      { category: 'Real Estate', percentage: 10 },
      { category: 'Commodities', percentage: 10 },
      { category: 'Cash', percentage: 5 },
    ],
    performance: generatePerformanceData(100, 1.09),
    sectorExposures: [
      { sector: 'Technology', percentage: 22 },
      { sector: 'Healthcare', percentage: 13 },
      { sector: 'Financial', percentage: 14 },
      { sector: 'Consumer', percentage: 11 },
      { sector: 'Industrial', percentage: 12 },
      { sector: 'Other', percentage: 28 },
    ],
  },
  {
    id: '5',
    name: 'Sarah & David Park',
    email: 'parks@email.com',
    aum: 445000,
    riskScore: 72,
    riskTolerance: 'Moderately Aggressive',
    holdings: [
      { ticker: 'VTI', name: 'Vanguard Total Stock Market', value: 178000, allocation: 40, category: 'US Equity' },
      { ticker: 'VXUS', name: 'Vanguard Total International', value: 89000, allocation: 20, category: 'International' },
      { ticker: 'BND', name: 'Vanguard Total Bond', value: 66750, allocation: 15, category: 'Bonds' },
      { ticker: 'ARKK', name: 'ARK Innovation ETF', value: 44500, allocation: 10, category: 'US Equity' },
      { ticker: 'TSLA', name: 'Tesla Inc', value: 44500, allocation: 10, category: 'Individual Stocks' },
      { ticker: 'Cash', name: 'Cash & Equivalents', value: 22250, allocation: 5, category: 'Cash' },
    ],
    allocations: [
      { category: 'US Equity', percentage: 60 },
      { category: 'International', percentage: 20 },
      { category: 'Bonds', percentage: 15 },
      { category: 'Cash', percentage: 5 },
    ],
    performance: generatePerformanceData(100, 1.15),
    sectorExposures: [
      { sector: 'Technology', percentage: 38 },
      { sector: 'Healthcare', percentage: 11 },
      { sector: 'Financial', percentage: 9 },
      { sector: 'Consumer', percentage: 20 },
      { sector: 'Industrial', percentage: 8 },
      { sector: 'Other', percentage: 14 },
    ],
  },
];

// Generate performance data rebased to 100
function generatePerformanceData(startValue: number, endMultiplier: number): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  const months = 12;
  const monthlyReturn = Math.pow(endMultiplier, 1 / months) - 1;
  
  let value = startValue;
  const now = new Date();
  
  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    data.push({
      date: date.toISOString().split('T')[0].slice(0, 7), // YYYY-MM format
      value: Math.round(value * 100) / 100,
    });
    
    // Add some volatility
    const volatility = (Math.random() - 0.5) * 0.02;
    value *= (1 + monthlyReturn + volatility);
  }
  
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Colors
// ─────────────────────────────────────────────────────────────────────────────

const CLIENT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
const CATEGORY_COLORS: Record<string, string> = {
  'US Equity': '#3B82F6',
  'International': '#10B981',
  'Bonds': '#F59E0B',
  'Cash': '#6B7280',
  'Real Estate': '#8B5CF6',
  'Commodities': '#F97316',
  'Individual Stocks': '#EC4899',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Client Selector Component
// ─────────────────────────────────────────────────────────────────────────────

interface ClientSelectorProps {
  clients: Client[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  maxSelections: number;
}

function ClientSelector({ clients, selectedIds, onSelectionChange, maxSelections }: ClientSelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );
  
  const selectedClients = clients.filter(c => selectedIds.includes(c.id));
  
  const toggleClient = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < maxSelections) {
      onSelectionChange([...selectedIds, id]);
    }
  };
  
  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl min-h-[56px]">
        {selectedClients.map((client, idx) => (
          <div
            key={client.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{ backgroundColor: `${CLIENT_COLORS[idx]}20`, borderColor: CLIENT_COLORS[idx], borderWidth: 1 }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CLIENT_COLORS[idx] }}
            />
            <span className="text-white">{client.name.split(' ')[0]}</span>
            <button
              onClick={() => toggleClient(client.id)}
              className="text-gray-400 hover:text-white ml-1"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white transition-colors min-h-[40px]"
          disabled={selectedIds.length >= maxSelections}
        >
          {selectedIds.length < maxSelections ? (
            <>
              <span>+</span>
              <span>Add client ({maxSelections - selectedIds.length} more)</span>
            </>
          ) : (
            <span className="text-amber-500">Max {maxSelections} clients selected</span>
          )}
        </button>
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#12121a] border border-white/10 rounded-xl shadow-xl z-50 max-h-[300px] overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-[220px]">
              {filteredClients.map((client) => {
                const isSelected = selectedIds.includes(client.id);
                const isDisabled = !isSelected && selectedIds.length >= maxSelections;
                
                return (
                  <button
                    key={client.id}
                    onClick={() => {
                      toggleClient(client.id);
                      if (!isSelected) setIsOpen(false);
                    }}
                    disabled={isDisabled}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors min-h-[56px] ${
                      isSelected
                        ? 'bg-amber-500/10'
                        : isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="text-white font-medium">{client.name}</div>
                      <div className="text-gray-500 text-sm">{formatCurrency(client.aum)} • {client.riskTolerance}</div>
                    </div>
                    {isSelected && (
                      <span className="text-amber-500">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Allocation Comparison Tab
// ─────────────────────────────────────────────────────────────────────────────

interface AllocationComparisonProps {
  clients: Client[];
}

function AllocationComparison({ clients }: AllocationComparisonProps) {
  // Get all unique categories
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    clients.forEach(c => c.allocations.forEach(a => cats.add(a.category)));
    return Array.from(cats);
  }, [clients]);
  
  // Prepare bar chart data
  const barData = useMemo(() => {
    return allCategories.map(category => {
      const row: Record<string, string | number> = { category };
      clients.forEach((client, idx) => {
        const alloc = client.allocations.find(a => a.category === category);
        row[`client${idx}`] = alloc?.percentage || 0;
        row[`client${idx}Name`] = client.name.split(' ')[0];
      });
      return row;
    });
  }, [clients, allCategories]);
  
  // Calculate divergence
  const divergenceData = useMemo(() => {
    if (clients.length < 2) return [];
    
    return allCategories.map(category => {
      const values = clients.map(c => {
        const alloc = c.allocations.find(a => a.category === category);
        return alloc?.percentage || 0;
      });
      const max = Math.max(...values);
      const min = Math.min(...values);
      const divergence = max - min;
      
      return { category, divergence, max, min };
    }).filter(d => d.divergence > 5).sort((a, b) => b.divergence - a.divergence);
  }, [clients, allCategories]);
  
  return (
    <div className="space-y-6">
      {/* Side-by-side Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client, idx) => (
          <div key={client.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: CLIENT_COLORS[idx] }}
              />
              <h3 className="text-white font-medium truncate">{client.name}</h3>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={client.allocations}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="80%"
                    dataKey="percentage"
                    nameKey="category"
                  >
                    {client.allocations.map((entry) => (
                      <Cell
                        key={entry.category}
                        fill={CATEGORY_COLORS[entry.category] || '#6B7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.[0]) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1a1a24] border border-white/20 rounded-lg p-3">
                          <div className="text-white font-medium">{data.category}</div>
                          <div className="text-gray-400">{data.percentage}%</div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-gray-400 text-sm mt-2">
              {formatCurrency(client.aum)} AUM
            </div>
          </div>
        ))}
      </div>
      
      {/* Bar Chart Overlay */}
      <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Allocation Comparison</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="category" tick={{ fill: '#9CA3AF', fontSize: 12 }} width={100} />
              <Tooltip
                content={({ payload, label }) => {
                  if (!payload?.length) return null;
                  return (
                    <div className="bg-[#1a1a24] border border-white/20 rounded-lg p-3">
                      <div className="text-white font-medium mb-2">{label}</div>
                      {payload.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.fill as string }} />
                          <span className="text-gray-400">{clients[i]?.name.split(' ')[0]}:</span>
                          <span className="text-white">{p.value}%</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {clients.map((_, idx) => (
                <Bar
                  key={idx}
                  dataKey={`client${idx}`}
                  fill={CLIENT_COLORS[idx]}
                  radius={[0, 4, 4, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Divergence Highlights */}
      {divergenceData.length > 0 && (
        <div className="bg-amber-500/10 rounded-xl p-4 md:p-6 border border-amber-500/20">
          <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
            <span>⚠️</span>
            <span>Significant Allocation Differences</span>
          </h3>
          <div className="space-y-3">
            {divergenceData.map((d) => (
              <div key={d.category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: CATEGORY_COLORS[d.category] || '#6B7280' }}
                  />
                  <span className="text-white">{d.category}</span>
                </div>
                <div className="text-amber-400 font-medium">
                  {d.min}% - {d.max}% ({d.divergence}% spread)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 justify-center">
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
          <div key={category} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span className="text-gray-400 text-sm">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Holdings Comparison Tab
// ─────────────────────────────────────────────────────────────────────────────

interface HoldingsComparisonProps {
  clients: Client[];
}

function HoldingsComparison({ clients }: HoldingsComparisonProps) {
  // Get all unique tickers
  const allHoldings = useMemo(() => {
    const holdingsMap = new Map<string, { ticker: string; name: string; clients: Record<string, { value: number; allocation: number } | null> }>();
    
    clients.forEach((client, idx) => {
      client.holdings.forEach(h => {
        if (!holdingsMap.has(h.ticker)) {
          holdingsMap.set(h.ticker, {
            ticker: h.ticker,
            name: h.name,
            clients: {},
          });
        }
        const entry = holdingsMap.get(h.ticker)!;
        entry.clients[`client${idx}`] = { value: h.value, allocation: h.allocation };
      });
    });
    
    // Fill in nulls for missing holdings
    holdingsMap.forEach((entry) => {
      clients.forEach((_, idx) => {
        if (!entry.clients[`client${idx}`]) {
          entry.clients[`client${idx}`] = null;
        }
      });
    });
    
    return Array.from(holdingsMap.values()).sort((a, b) => {
      // Sort by total value across all clients
      const aTotal = Object.values(a.clients).reduce((sum, c) => sum + (c?.value || 0), 0);
      const bTotal = Object.values(b.clients).reduce((sum, c) => sum + (c?.value || 0), 0);
      return bTotal - aTotal;
    });
  }, [clients]);
  
  // Holdings that some clients have but others don't
  const uniqueHoldings = useMemo(() => {
    return allHoldings.filter(h => {
      const hasCount = Object.values(h.clients).filter(c => c !== null).length;
      return hasCount > 0 && hasCount < clients.length;
    });
  }, [allHoldings, clients.length]);
  
  return (
    <div className="space-y-6">
      {/* Unified Holdings Table */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-left text-gray-400 font-medium">Ticker</th>
                {clients.map((client, idx) => (
                  <th key={client.id} className="p-4 text-right" colSpan={2}>
                    <div className="flex items-center justify-end gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CLIENT_COLORS[idx] }}
                      />
                      <span className="text-gray-300">{client.name.split(' ')[0]}</span>
                    </div>
                  </th>
                ))}
              </tr>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-2 text-left text-gray-500 text-xs font-normal">Name</th>
                {clients.map((client) => (
                  <th key={`${client.id}-headers`} className="p-2 text-right text-gray-500 text-xs font-normal" colSpan={2}>
                    $ Value | %
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allHoldings.map((holding) => {
                const isUnique = uniqueHoldings.includes(holding);
                return (
                  <tr
                    key={holding.ticker}
                    className={`border-b border-white/5 ${isUnique ? 'bg-amber-500/5' : 'hover:bg-white/5'}`}
                  >
                    <td className="p-4">
                      <div className="text-white font-medium">{holding.ticker}</div>
                      <div className="text-gray-500 text-sm truncate max-w-[150px]">{holding.name}</div>
                    </td>
                    {clients.map((client, idx) => {
                      const data = holding.clients[`client${idx}`];
                      return (
                        <td key={client.id} className="p-4 text-right" colSpan={2}>
                          {data ? (
                            <div>
                              <div className="text-white">{formatCurrency(data.value)}</div>
                              <div className="text-gray-400 text-sm">{data.allocation}%</div>
                            </div>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-white/10">
          {allHoldings.map((holding) => {
            const isUnique = uniqueHoldings.includes(holding);
            return (
              <div key={holding.ticker} className={`p-4 ${isUnique ? 'bg-amber-500/5' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-medium">{holding.ticker}</div>
                    <div className="text-gray-500 text-sm">{holding.name}</div>
                  </div>
                  {isUnique && (
                    <span className="text-amber-400 text-xs px-2 py-1 bg-amber-500/20 rounded">Unique</span>
                  )}
                </div>
                <div className="space-y-2">
                  {clients.map((client, idx) => {
                    const data = holding.clients[`client${idx}`];
                    return (
                      <div key={client.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CLIENT_COLORS[idx] }}
                          />
                          <span className="text-gray-400">{client.name.split(' ')[0]}</span>
                        </div>
                        {data ? (
                          <span className="text-white">{formatCurrency(data.value)} ({data.allocation}%)</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Unique Holdings Alert */}
      {uniqueHoldings.length > 0 && (
        <div className="bg-amber-500/10 rounded-xl p-4 md:p-6 border border-amber-500/20">
          <h3 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>Holdings Held by Some But Not All</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {uniqueHoldings.map((h) => (
              <span key={h.ticker} className="px-3 py-1.5 bg-white/10 rounded-lg text-white text-sm">
                {h.ticker}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance Comparison Tab
// ─────────────────────────────────────────────────────────────────────────────

interface PerformanceComparisonProps {
  clients: Client[];
}

function PerformanceComparison({ clients }: PerformanceComparisonProps) {
  // Combine performance data
  const chartData = useMemo(() => {
    if (clients.length === 0) return [];
    
    const dataMap = new Map<string, Record<string, number | string>>();
    
    clients.forEach((client, idx) => {
      client.performance.forEach(p => {
        if (!dataMap.has(p.date)) {
          dataMap.set(p.date, { date: p.date });
        }
        const entry = dataMap.get(p.date)!;
        entry[`client${idx}`] = p.value;
      });
    });
    
    return Array.from(dataMap.values()).sort((a, b) => 
      (a.date as string).localeCompare(b.date as string)
    );
  }, [clients]);
  
  // Calculate returns
  const returns = useMemo(() => {
    return clients.map((client, idx) => {
      const perf = client.performance;
      if (perf.length < 2) return { client, return: 0, idx };
      const startValue = perf[0].value;
      const endValue = perf[perf.length - 1].value;
      return {
        client,
        return: ((endValue - startValue) / startValue) * 100,
        idx,
      };
    }).sort((a, b) => b.return - a.return);
  }, [clients]);
  
  return (
    <div className="space-y-6">
      {/* Performance Chart */}
      <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Performance (Rebased to 100)</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6B7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip
                content={({ payload, label }) => {
                  if (!payload?.length) return null;
                  return (
                    <div className="bg-[#1a1a24] border border-white/20 rounded-lg p-3 min-w-[160px]">
                      <div className="text-gray-400 text-sm mb-2">{label}</div>
                      {payload.map((p, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.stroke as string }} />
                            <span className="text-gray-300">{clients[i]?.name.split(' ')[0]}</span>
                          </div>
                          <span className="text-white font-medium">{(p.value as number).toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {clients.map((_, idx) => (
                <Line
                  key={idx}
                  type="monotone"
                  dataKey={`client${idx}`}
                  stroke={CLIENT_COLORS[idx]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: CLIENT_COLORS[idx], strokeWidth: 2, fill: '#1a1a24' }}
                />
              ))}
              <Legend
                content={() => (
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                    {clients.map((client, idx) => (
                      <div key={client.id} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CLIENT_COLORS[idx] }} />
                        <span className="text-gray-400 text-sm">{client.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Performance Ranking */}
      <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">12-Month Return Ranking</h3>
        <div className="space-y-3">
          {returns.map((r, rank) => (
            <div
              key={r.client.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  rank === 0 ? 'bg-amber-500 text-black' :
                  rank === 1 ? 'bg-gray-400 text-black' :
                  'bg-amber-700 text-white'
                }`}>
                  {rank + 1}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CLIENT_COLORS[r.idx] }}
                  />
                  <span className="text-white font-medium">{r.client.name}</span>
                </div>
              </div>
              <div className={`text-lg font-bold ${r.return >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {r.return >= 0 ? '+' : ''}{r.return.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Risk Comparison Tab
// ─────────────────────────────────────────────────────────────────────────────

interface RiskComparisonProps {
  clients: Client[];
}

function RiskComparison({ clients }: RiskComparisonProps) {
  // Prepare radar chart data for sector exposures
  const radarData = useMemo(() => {
    const sectors = ['Technology', 'Healthcare', 'Financial', 'Consumer', 'Industrial', 'Other'];
    return sectors.map(sector => {
      const row: Record<string, string | number> = { sector };
      clients.forEach((client, idx) => {
        const exposure = client.sectorExposures.find(s => s.sector === sector);
        row[`client${idx}`] = exposure?.percentage || 0;
      });
      return row;
    });
  }, [clients]);
  
  // Calculate concentration metrics (top 3 holdings %)
  const concentrationData = useMemo(() => {
    return clients.map((client, idx) => {
      const sortedHoldings = [...client.holdings].sort((a, b) => b.allocation - a.allocation);
      const top3 = sortedHoldings.slice(0, 3);
      const top3Concentration = top3.reduce((sum, h) => sum + h.allocation, 0);
      const largestHolding = sortedHoldings[0]?.allocation || 0;
      const numHoldings = client.holdings.length;
      
      return {
        client,
        idx,
        top3Concentration,
        largestHolding,
        numHoldings,
      };
    });
  }, [clients]);
  
  return (
    <div className="space-y-6">
      {/* Risk Scores Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client, idx) => (
          <div key={client.id} className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: CLIENT_COLORS[idx] }}
              />
              <h3 className="text-white font-medium truncate">{client.name}</h3>
            </div>
            
            {/* Risk Score Gauge */}
            <div className="relative h-4 bg-white/10 rounded-full mb-3 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{
                  width: `${client.riskScore}%`,
                  background: client.riskScore < 40 ? '#10B981' :
                             client.riskScore < 70 ? '#F59E0B' : '#EF4444',
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Risk Score</span>
              <span className={`text-xl font-bold ${
                client.riskScore < 40 ? 'text-emerald-400' :
                client.riskScore < 70 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {client.riskScore}
              </span>
            </div>
            <div className="text-gray-500 text-sm mt-1">{client.riskTolerance}</div>
          </div>
        ))}
      </div>
      
      {/* Sector Exposure Radar */}
      <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Sector Exposure Comparison</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="sector" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 50]} tick={{ fill: '#6B7280', fontSize: 10 }} />
              {clients.map((_, idx) => (
                <Radar
                  key={idx}
                  name={`client${idx}`}
                  dataKey={`client${idx}`}
                  stroke={CLIENT_COLORS[idx]}
                  fill={CLIENT_COLORS[idx]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ))}
              <Tooltip
                content={({ payload, label }) => {
                  if (!payload?.length) return null;
                  return (
                    <div className="bg-[#1a1a24] border border-white/20 rounded-lg p-3">
                      <div className="text-white font-medium mb-2">{label}</div>
                      {payload.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.stroke as string }} />
                          <span className="text-gray-400">{clients[i]?.name.split(' ')[0]}:</span>
                          <span className="text-white">{p.value}%</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
          {clients.map((client, idx) => (
            <div key={client.id} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CLIENT_COLORS[idx] }} />
              <span className="text-gray-400 text-sm">{client.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Concentration Metrics */}
      <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Concentration Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-left text-gray-400 font-medium">Client</th>
                <th className="p-3 text-right text-gray-400 font-medium">Top 3 Holdings</th>
                <th className="p-3 text-right text-gray-400 font-medium">Largest Position</th>
                <th className="p-3 text-right text-gray-400 font-medium"># Holdings</th>
              </tr>
            </thead>
            <tbody>
              {concentrationData.map((c) => (
                <tr key={c.client.id} className="border-b border-white/5">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CLIENT_COLORS[c.idx] }}
                      />
                      <span className="text-white">{c.client.name.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td className={`p-3 text-right font-medium ${
                    c.top3Concentration > 60 ? 'text-amber-400' : 'text-white'
                  }`}>
                    {c.top3Concentration.toFixed(1)}%
                  </td>
                  <td className={`p-3 text-right font-medium ${
                    c.largestHolding > 30 ? 'text-amber-400' : 'text-white'
                  }`}>
                    {c.largestHolding.toFixed(1)}%
                  </td>
                  <td className="p-3 text-right text-white">
                    {c.numHoldings}
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

// ─────────────────────────────────────────────────────────────────────────────
// Export Functions
// ─────────────────────────────────────────────────────────────────────────────

function generateCSV(clients: Client[]): string {
  const lines: string[] = [];
  
  // Header
  lines.push('Comparison Report');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  
  // Client Summary
  lines.push('CLIENT SUMMARY');
  lines.push(['Client', 'AUM', 'Risk Score', 'Risk Tolerance'].join(','));
  clients.forEach(c => {
    lines.push([c.name, c.aum, c.riskScore, c.riskTolerance].join(','));
  });
  lines.push('');
  
  // Allocations
  lines.push('ALLOCATIONS');
  const allCategories = new Set<string>();
  clients.forEach(c => c.allocations.forEach(a => allCategories.add(a.category)));
  lines.push(['Category', ...clients.map(c => c.name.split(' ')[0])].join(','));
  allCategories.forEach(cat => {
    const row = [cat];
    clients.forEach(c => {
      const alloc = c.allocations.find(a => a.category === cat);
      row.push((alloc?.percentage || 0).toString());
    });
    lines.push(row.join(','));
  });
  lines.push('');
  
  // Holdings
  lines.push('HOLDINGS');
  const holdingsHeader = ['Ticker', 'Name'];
  clients.forEach(c => {
    holdingsHeader.push(`${c.name.split(' ')[0]} Value`);
    holdingsHeader.push(`${c.name.split(' ')[0]} %`);
  });
  lines.push(holdingsHeader.join(','));
  
  const allTickers = new Map<string, { name: string }>();
  clients.forEach(c => c.holdings.forEach(h => {
    if (!allTickers.has(h.ticker)) {
      allTickers.set(h.ticker, { name: h.name });
    }
  }));
  
  allTickers.forEach((info, ticker) => {
    const row = [ticker, info.name];
    clients.forEach(c => {
      const holding = c.holdings.find(h => h.ticker === ticker);
      row.push(holding?.value.toString() || '0');
      row.push(holding?.allocation.toString() || '0');
    });
    lines.push(row.join(','));
  });
  
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(['1', '2']);
  const [activeTab, setActiveTab] = useState<TabId>('allocation');
  const [showExportModal, setShowExportModal] = useState(false);
  
  const selectedClients = useMemo(() => {
    return selectedClientIds
      .map(id => DEMO_CLIENTS.find(c => c.id === id))
      .filter((c): c is Client => c !== undefined);
  }, [selectedClientIds]);
  
  const handleExportCSV = useCallback(() => {
    const csv = generateCSV(selectedClients);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  }, [selectedClients]);
  
  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'allocation', label: 'Allocation', icon: '🥧' },
    { id: 'holdings', label: 'Holdings', icon: '📊' },
    { id: 'performance', label: 'Performance', icon: '📈' },
    { id: 'risk', label: 'Risk', icon: '⚠️' },
  ];
  
  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Compare Clients</h1>
          <p className="text-gray-400 text-sm md:text-base">Side-by-side portfolio comparison</p>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          disabled={selectedClients.length < 2}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px] w-full sm:w-auto"
        >
          <span>📥</span>
          <span>Export Report</span>
        </button>
      </div>
      
      {/* Client Selector */}
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-2">Select Clients to Compare (2-3)</label>
        <ClientSelector
          clients={DEMO_CLIENTS}
          selectedIds={selectedClientIds}
          onSelectionChange={setSelectedClientIds}
          maxSelections={3}
        />
      </div>
      
      {/* Content */}
      {selectedClients.length >= 2 ? (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-1 md:gap-2 mb-6 border-b border-white/10 overflow-x-auto pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap min-h-[48px] ${
                  activeTab === tab.id
                    ? 'text-amber-500 border-b-2 border-amber-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          {activeTab === 'allocation' && <AllocationComparison clients={selectedClients} />}
          {activeTab === 'holdings' && <HoldingsComparison clients={selectedClients} />}
          {activeTab === 'performance' && <PerformanceComparison clients={selectedClients} />}
          {activeTab === 'risk' && <RiskComparison clients={selectedClients} />}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔀</div>
          <div className="text-xl text-white font-medium mb-2">Select at Least 2 Clients</div>
          <p className="text-gray-400">Choose clients above to start comparing their portfolios.</p>
        </div>
      )}
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#12121a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl p-6 md:p-8 w-full md:max-w-md">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Export Comparison</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-400 mb-6">
              Export a detailed comparison report for {selectedClients.map(c => c.name.split(' ')[0]).join(' & ')}.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div className="text-left">
                    <div className="text-white font-medium">CSV Spreadsheet</div>
                    <div className="text-gray-500 text-sm">Excel-compatible format</div>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              
              <button
                onClick={() => {
                  // PDF export would require a library like jsPDF
                  alert('PDF export coming soon!');
                }}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📑</span>
                  <div className="text-left">
                    <div className="text-white font-medium">PDF Report</div>
                    <div className="text-gray-500 text-sm">Printable format</div>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full py-3 mt-6 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
