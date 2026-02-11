'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
  Clock,
  Wallet,
  PiggyBank,
  BarChart3,
  Shield,
  Percent,
  DollarSign,
  Building,
  Filter,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts';
import Sparkline from '@/components/Sparkline';
import RiskGauge from '@/components/RiskGauge';

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data
// ─────────────────────────────────────────────────────────────────────────────

const TOTAL_VALUE = 850000;
const TODAY_CHANGE = 2380;
const TODAY_CHANGE_PERCENT = 0.28;
const YTD_CHANGE = 64450;
const YTD_CHANGE_PERCENT = 8.2;

const PERFORMANCE: Record<string, number> = {
  '1D': 0.28,
  '1W': 1.2,
  '1M': 2.8,
  '3M': 5.1,
  'YTD': 8.2,
  '1Y': 12.4,
};

const BENCHMARK_PERFORMANCE: Record<string, number> = {
  '1D': 0.15,
  '1W': 0.9,
  '1M': 2.1,
  '3M': 4.2,
  'YTD': 7.1,
  '1Y': 10.8,
};

// Performance chart data (simulated historical data)
const PERFORMANCE_DATA: Record<string, Array<{ date: string; value: number; benchmark: number }>> = {
  '1D': Array.from({ length: 24 }, (_, i) => ({
    date: `${i}:00`,
    value: 850000 + Math.sin(i / 4) * 3000 + i * 100,
    benchmark: 850000 + Math.sin(i / 4) * 2000 + i * 70,
  })),
  '1W': Array.from({ length: 7 }, (_, i) => ({
    date: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    value: 840000 + i * 1500 + Math.random() * 2000,
    benchmark: 840000 + i * 1200 + Math.random() * 1500,
  })),
  '1M': Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}`,
    value: 825000 + i * 850 + Math.random() * 3000,
    benchmark: 825000 + i * 700 + Math.random() * 2500,
  })),
  '3M': Array.from({ length: 13 }, (_, i) => ({
    date: `W${i + 1}`,
    value: 808000 + i * 3300 + Math.random() * 5000,
    benchmark: 808000 + i * 2700 + Math.random() * 4000,
  })),
  'YTD': Array.from({ length: 12 }, (_, i) => ({
    date: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i],
    value: 785000 + i * 5500 + Math.random() * 8000,
    benchmark: 785000 + i * 4800 + Math.random() * 6000,
  })).slice(0, 2),
  '1Y': Array.from({ length: 12 }, (_, i) => ({
    date: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][i],
    value: 757000 + i * 7700 + Math.random() * 10000,
    benchmark: 757000 + i * 6500 + Math.random() * 8000,
  })),
};

const ACCOUNTS = [
  { id: '1', name: 'Joint Brokerage', type: 'Taxable', value: 340000, ytdReturn: 7.8 },
  { id: '2', name: 'John IRA', type: 'Traditional IRA', value: 280000, ytdReturn: 9.2 },
  { id: '3', name: 'John Roth IRA', type: 'Roth IRA', value: 145000, ytdReturn: 8.5 },
  { id: '4', name: 'Jane 401(k)', type: '401(k)', value: 85000, ytdReturn: 6.9 },
];

const HOLDINGS = [
  { ticker: 'VTI', name: 'Vanguard Total Stock Market', shares: 892, price: 285.50, value: 254686, change: 1.2, allocation: 30, category: 'US Stocks', expenseRatio: 0.03, dividendYield: 1.4 },
  { ticker: 'BND', name: 'Vanguard Total Bond Market', shares: 2850, price: 74.56, value: 212496, change: 0.3, allocation: 25, category: 'Bonds', expenseRatio: 0.03, dividendYield: 3.2 },
  { ticker: 'VXUS', name: 'Vanguard Total International', shares: 2615, price: 65.01, value: 170001, change: -0.5, allocation: 20, category: 'Intl Stocks', expenseRatio: 0.07, dividendYield: 3.0 },
  { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', shares: 485, price: 87.63, value: 42500, change: -0.2, allocation: 5, category: 'Real Estate', expenseRatio: 0.12, dividendYield: 3.8 },
  { ticker: 'VTIP', name: 'Vanguard Short-Term TIPS', shares: 680, price: 48.50, value: 32980, change: 0.1, allocation: 4, category: 'Bonds', expenseRatio: 0.04, dividendYield: 2.1 },
  { ticker: 'VWO', name: 'Vanguard Emerging Markets', shares: 520, price: 44.25, value: 23010, change: -0.8, allocation: 3, category: 'Intl Stocks', expenseRatio: 0.08, dividendYield: 2.6 },
  { ticker: 'SCHD', name: 'Schwab US Dividend Equity', shares: 285, price: 82.35, value: 23470, change: 0.6, allocation: 3, category: 'US Stocks', expenseRatio: 0.06, dividendYield: 3.4 },
  { ticker: 'CASH', name: 'Cash & Equivalents', shares: 1, price: 85000, value: 85000, change: 0, allocation: 10, category: 'Cash', expenseRatio: 0, dividendYield: 4.8 },
];

const ALLOCATION_CATEGORIES = [
  { name: 'US Stocks', value: 278156, percentage: 33, color: '#3B82F6' },
  { name: 'Intl Stocks', value: 193011, percentage: 23, color: '#10B981' },
  { name: 'Bonds', value: 245476, percentage: 29, color: '#F59E0B' },
  { name: 'Real Estate', value: 42500, percentage: 5, color: '#8B5CF6' },
  { name: 'Cash', value: 85000, percentage: 10, color: '#6B7280' },
];

const KEY_METRICS = {
  dividendYield: 2.4,
  expenseRatio: 0.05,
  taxEfficiency: 92,
  riskScore: 5,
};

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (compact && Math.abs(value) >= 100000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function PortfolioSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-[var(--card)] rounded-2xl p-8 border border-[var(--border)]">
        <div className="h-4 w-24 bg-white/10 rounded mb-4" />
        <div className="h-12 w-64 bg-white/10 rounded mb-4" />
        <div className="flex gap-4">
          <div className="h-8 w-32 bg-white/10 rounded-full" />
          <div className="h-8 w-32 bg-white/10 rounded-full" />
        </div>
      </div>
      
      {/* Chart skeleton */}
      <div className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)]">
        <div className="h-6 w-40 bg-white/10 rounded mb-6" />
        <div className="h-64 bg-white/5 rounded-xl" />
      </div>
      
      {/* Metrics skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
            <div className="h-4 w-20 bg-white/10 rounded mb-3" />
            <div className="h-8 w-16 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Value Hero
// ─────────────────────────────────────────────────────────────────────────────

function PortfolioHero() {
  const lastUpdated = new Date();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[var(--card)] to-[#1a1a28] rounded-2xl p-6 md:p-8 border border-[var(--border)] relative overflow-hidden"
    >
      {/* Subtle gradient accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-medium">Total Portfolio Value</span>
        </div>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            {formatCurrency(TOTAL_VALUE)}
          </span>
        </motion.div>
        
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Today's change */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold min-h-[40px] ${
              TODAY_CHANGE >= 0 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {TODAY_CHANGE >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{formatPercent(TODAY_CHANGE_PERCENT)}</span>
            <span className="text-xs opacity-75">({formatCurrency(TODAY_CHANGE, true)})</span>
            <span className="text-xs opacity-50 ml-1">Today</span>
          </motion.div>
          
          {/* YTD change */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold min-h-[40px] ${
              YTD_CHANGE >= 0 
                ? 'bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400/80 border border-red-500/20'
            }`}
          >
            {YTD_CHANGE >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{formatPercent(YTD_CHANGE_PERCENT)}</span>
            <span className="text-xs opacity-75">({formatCurrency(YTD_CHANGE, true)})</span>
            <span className="text-xs opacity-50 ml-1">YTD</span>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-gray-500 text-sm"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Last updated {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Allocation Chart
// ─────────────────────────────────────────────────────────────────────────────

interface AllocationChartProps {
  onCategoryClick?: (category: string) => void;
}

function AllocationChart({ onCategoryClick }: AllocationChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const selectedCategory = activeIndex !== null ? ALLOCATION_CATEGORIES[activeIndex] : null;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill = '#F59E0B' } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill="#F59E0B"
          style={{ filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.4))' }}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={innerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)]"
    >
      <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-amber-500" />
        Asset Allocation
      </h2>
      
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-full lg:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ALLOCATION_CATEGORIES}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                {...{ activeIndex: activeIndex !== null ? activeIndex : undefined }}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(_, index) => {
                  const cat = ALLOCATION_CATEGORIES[index];
                  onCategoryClick?.(cat.name);
                }}
                style={{ cursor: 'pointer' }}
              >
                {ALLOCATION_CATEGORIES.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={activeIndex === index ? '#F59E0B' : entry.color}
                    stroke="transparent"
                    style={{ transition: 'fill 0.2s ease' }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#1a1a28] border border-white/20 rounded-xl p-3 shadow-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                        <span className="text-white font-medium">{data.name}</span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {formatCurrency(data.value)} • {data.percentage}%
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              {selectedCategory ? (
                <motion.div
                  key={selectedCategory.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-1"
                >
                  <div className="text-amber-400 text-2xl font-bold">{selectedCategory.percentage}%</div>
                  <div className="text-white text-sm font-medium truncate max-w-[100px]">
                    {selectedCategory.name}
                  </div>
                  <div className="text-gray-400 text-xs">{formatCurrency(selectedCategory.value, true)}</div>
                </motion.div>
              ) : (
                <div className="space-y-1">
                  <div className="text-gray-400 text-sm">Total</div>
                  <div className="text-white text-xl font-bold">{formatCurrency(TOTAL_VALUE, true)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex-1 space-y-2">
          {ALLOCATION_CATEGORIES.map((category, index) => (
            <motion.button
              key={category.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => onCategoryClick?.(category.name)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all min-h-[48px] ${
                activeIndex === index
                  ? 'bg-amber-500/20 border border-amber-500/30'
                  : 'bg-white/5 border border-transparent hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full transition-colors"
                  style={{ backgroundColor: activeIndex === index ? '#F59E0B' : category.color }}
                />
                <span className="text-white font-medium">{category.name}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{category.percentage}%</div>
                <div className="text-gray-500 text-xs">{formatCurrency(category.value, true)}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance Section
// ─────────────────────────────────────────────────────────────────────────────

function PerformanceSection() {
  const [period, setPeriod] = useState<string>('YTD');
  const periods = Object.keys(PERFORMANCE);
  
  const performanceValue = PERFORMANCE[period];
  const benchmarkValue = BENCHMARK_PERFORMANCE[period];
  const outperformance = performanceValue - benchmarkValue;
  const chartData = PERFORMANCE_DATA[period];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          Performance
        </h2>
        
        {/* Period Toggle */}
        <div className="flex bg-white/5 rounded-xl p-1 gap-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[40px] min-w-[44px] ${
                period === p
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      
      {/* Performance Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          key={`portfolio-${period}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 rounded-xl p-4"
        >
          <div className="text-gray-400 text-xs mb-1">Portfolio</div>
          <div className={`text-2xl font-bold ${performanceValue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPercent(performanceValue)}
          </div>
        </motion.div>
        
        <motion.div
          key={`benchmark-${period}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-white/5 rounded-xl p-4"
        >
          <div className="text-gray-400 text-xs mb-1">S&P 500</div>
          <div className="text-2xl font-bold text-gray-300">
            {formatPercent(benchmarkValue)}
          </div>
        </motion.div>
        
        <motion.div
          key={`alpha-${period}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-xl p-4"
        >
          <div className="text-gray-400 text-xs mb-1">Alpha</div>
          <div className={`text-2xl font-bold ${outperformance >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
            {formatPercent(outperformance)}
          </div>
        </motion.div>
      </div>
      
      {/* Performance Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B7280" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
              dy={10}
            />
            <YAxis hide domain={['dataMin - 10000', 'dataMax + 10000']} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                return (
                  <div className="bg-[#1a1a28] border border-white/20 rounded-xl p-3 shadow-xl">
                    <div className="flex items-center gap-3 text-sm">
                      <div>
                        <span className="text-emerald-400">●</span>
                        <span className="text-gray-300 ml-1">Portfolio:</span>
                        <span className="text-white ml-1 font-medium">
                          {formatCurrency(payload[0]?.value as number, true)}
                        </span>
                      </div>
                    </div>
                    {payload[1] && (
                      <div className="flex items-center gap-3 text-sm mt-1">
                        <div>
                          <span className="text-gray-500">●</span>
                          <span className="text-gray-400 ml-1">Benchmark:</span>
                          <span className="text-gray-300 ml-1">
                            {formatCurrency(payload[1]?.value as number, true)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="benchmark"
              stroke="#6B7280"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#benchmarkGradient)"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#portfolioGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Chart Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-emerald-400 rounded" />
          <span className="text-gray-400">Your Portfolio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-gray-500 rounded border-dashed" style={{ borderTop: '2px dashed #6B7280', height: 0 }} />
          <span className="text-gray-400">S&P 500 Benchmark</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Account Breakdown
// ─────────────────────────────────────────────────────────────────────────────

function AccountBreakdown() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const accountIcons: Record<string, React.ReactNode> = {
    'Taxable': <Wallet className="w-5 h-5" />,
    'Traditional IRA': <PiggyBank className="w-5 h-5" />,
    'Roth IRA': <PiggyBank className="w-5 h-5" />,
    '401(k)': <Building className="w-5 h-5" />,
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)]"
    >
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Building className="w-5 h-5 text-amber-500" />
        Accounts
      </h2>
      
      <div className="space-y-3">
        {ACCOUNTS.map((account, index) => {
          const isExpanded = expandedId === account.id;
          const allocationPercent = (account.value / TOTAL_VALUE) * 100;
          
          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : account.id)}
                className={`w-full text-left p-4 rounded-xl transition-all min-h-[72px] ${
                  isExpanded
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'bg-white/5 border border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isExpanded ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-400'}`}>
                      {accountIcons[account.type]}
                    </div>
                    <div>
                      <div className="font-medium text-white">{account.name}</div>
                      <div className="text-xs text-gray-500">{account.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-white">{formatCurrency(account.value, true)}</div>
                      <div className={`text-xs ${account.ytdReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatPercent(account.ytdReturn)} YTD
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Allocation bar */}
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${allocationPercent}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {allocationPercent.toFixed(1)}% of portfolio
                </div>
              </button>
              
              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-white/5 rounded-b-xl border-x border-b border-white/10 -mt-2 pt-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Contributions</div>
                          <div className="text-white font-medium">
                            {formatCurrency(account.value * 0.75, true)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Gains</div>
                          <div className="text-emerald-400 font-medium">
                            {formatCurrency(account.value * 0.25, true)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Holdings Table
// ─────────────────────────────────────────────────────────────────────────────

type SortField = 'ticker' | 'value' | 'change' | 'allocation';
type SortDirection = 'asc' | 'desc';

function HoldingsTable({ categoryFilter }: { categoryFilter: string | null }) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const filteredAndSorted = useMemo(() => {
    let filtered = HOLDINGS;
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(h => h.category === categoryFilter);
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        h => h.ticker.toLowerCase().includes(searchLower) || 
             h.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });
  }, [search, sortField, sortDirection, categoryFilter]);
  
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);
  
  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown className={`w-3.5 h-3.5 ml-1 inline transition-colors ${
      sortField === field ? 'text-amber-400' : 'text-gray-600'
    }`} />
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-500" />
          Holdings
          {categoryFilter && (
            <span className="text-amber-400 text-sm font-normal ml-2">
              • {categoryFilter}
            </span>
          )}
        </h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search holdings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors min-h-[44px]"
          />
        </div>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm border-b border-white/10">
              <th className="pb-3 font-medium">
                <button onClick={() => handleSort('ticker')} className="flex items-center hover:text-white transition-colors min-h-[44px]">
                  Symbol <SortIcon field="ticker" />
                </button>
              </th>
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium text-right">Shares</th>
              <th className="pb-3 font-medium text-right">Price</th>
              <th className="pb-3 font-medium text-right">
                <button onClick={() => handleSort('value')} className="flex items-center justify-end w-full hover:text-white transition-colors min-h-[44px]">
                  Value <SortIcon field="value" />
                </button>
              </th>
              <th className="pb-3 font-medium text-right">
                <button onClick={() => handleSort('change')} className="flex items-center justify-end w-full hover:text-white transition-colors min-h-[44px]">
                  Change <SortIcon field="change" />
                </button>
              </th>
              <th className="pb-3 font-medium text-right">
                <button onClick={() => handleSort('allocation')} className="flex items-center justify-end w-full hover:text-white transition-colors min-h-[44px]">
                  Allocation <SortIcon field="allocation" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((holding, index) => (
              <motion.tr
                key={holding.ticker}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.03 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {holding.ticker.slice(0, 3)}
                    </div>
                    <span className="font-semibold text-white">{holding.ticker}</span>
                  </div>
                </td>
                <td className="py-4 text-gray-400 max-w-[200px] truncate">{holding.name}</td>
                <td className="py-4 text-right text-gray-300">{formatNumber(holding.shares)}</td>
                <td className="py-4 text-right text-gray-300">${formatNumber(holding.price)}</td>
                <td className="py-4 text-right font-semibold text-white">{formatCurrency(holding.value, true)}</td>
                <td className="py-4 text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
                    holding.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {holding.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {formatPercent(holding.change)}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${holding.allocation}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-sm w-12 text-right">{holding.allocation}%</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredAndSorted.map((holding, index) => (
          <motion.div
            key={holding.ticker}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {holding.ticker.slice(0, 3)}
                </div>
                <div>
                  <div className="font-semibold text-white">{holding.ticker}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[150px]">{holding.name}</div>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
                holding.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {holding.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatPercent(holding.change)}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">Value</div>
                <div className="text-white font-semibold">{formatCurrency(holding.value, true)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Shares</div>
                <div className="text-gray-300">{formatNumber(holding.shares)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Allocation</div>
                <div className="text-amber-400 font-medium">{holding.allocation}%</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredAndSorted.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No holdings found matching your search.
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Key Metrics Cards
// ─────────────────────────────────────────────────────────────────────────────

function KeyMetrics() {
  const metrics = [
    {
      label: 'Dividend Yield',
      value: `${KEY_METRICS.dividendYield.toFixed(1)}%`,
      icon: Percent,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      description: 'Annual yield',
    },
    {
      label: 'Expense Ratio',
      value: `${KEY_METRICS.expenseRatio.toFixed(2)}%`,
      icon: DollarSign,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      description: 'Weighted avg',
    },
    {
      label: 'Tax Efficiency',
      value: `${KEY_METRICS.taxEfficiency}`,
      icon: Shield,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      description: 'Score /100',
    },
    {
      label: 'Risk Level',
      value: `${KEY_METRICS.riskScore}/10`,
      icon: BarChart3,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      description: 'Moderate',
    },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + index * 0.05 }}
          className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] hover:border-amber-500/30 transition-colors"
        >
          <div className={`w-10 h-10 ${metric.bg} rounded-lg flex items-center justify-center mb-3`}>
            <metric.icon className={`w-5 h-5 ${metric.color}`} />
          </div>
          <div className="text-gray-500 text-xs mb-1">{metric.label}</div>
          <div className="text-white text-2xl font-bold">{metric.value}</div>
          <div className="text-gray-600 text-xs mt-1">{metric.description}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Portfolio Page
// ─────────────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);
  
  // Clear filter handler
  const handleCategoryClick = useCallback((category: string) => {
    setCategoryFilter(prev => prev === category ? null : category);
  }, []);
  
  if (loading) {
    return <PortfolioSkeleton />;
  }
  
  return (
    <div className="space-y-6 pb-8">
      {/* Portfolio Value Hero */}
      <PortfolioHero />
      
      {/* Key Metrics */}
      <KeyMetrics />
      
      {/* Allocation Chart */}
      <AllocationChart onCategoryClick={handleCategoryClick} />
      
      {/* Performance Section */}
      <PerformanceSection />
      
      {/* Account Breakdown */}
      <AccountBreakdown />
      
      {/* Holdings Table */}
      <HoldingsTable categoryFilter={categoryFilter} />
      
      {/* Clear Filter Button */}
      <AnimatePresence>
        {categoryFilter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={() => setCategoryFilter(null)}
              className="flex items-center gap-2 px-4 py-3 bg-amber-500 text-black font-medium rounded-full shadow-lg shadow-amber-500/30 hover:bg-amber-400 transition-colors min-h-[48px]"
            >
              <Filter className="w-4 h-4" />
              Showing {categoryFilter} • Clear filter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-gray-600 text-sm px-4"
      >
        Portfolio data is for informational purposes only. Contact your advisor for personalized advice.
      </motion.p>
    </div>
  );
}
