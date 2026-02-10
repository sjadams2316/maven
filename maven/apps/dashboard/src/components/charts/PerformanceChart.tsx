'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
  Legend,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PerformanceDataPoint {
  date: string; // ISO date string YYYY-MM-DD
  portfolio: number;
  benchmark?: number;
  [key: string]: number | string | undefined; // Additional benchmarks
}

export interface BenchmarkConfig {
  key: string;
  name: string;
  color: string;
  enabled: boolean;
}

export interface PerformanceChartProps {
  /** Array of performance data points */
  data: PerformanceDataPoint[];
  /** Starting value for percentage calculations (defaults to first portfolio value) */
  initialValue?: number;
  /** Chart title */
  title?: string;
  /** Height of the chart in pixels */
  height?: number;
  /** Show the brush (draggable range selector) */
  showBrush?: boolean;
  /** Show time range buttons */
  showRangeSelector?: boolean;
  /** Available benchmarks to toggle */
  benchmarks?: BenchmarkConfig[];
  /** Callback when date range changes */
  onRangeChange?: (startDate: string, endDate: string) => void;
  /** Portfolio line color */
  portfolioColor?: string;
}

type TimeRange = '1M' | '3M' | '6M' | 'YTD' | '1Y' | '3Y' | 'ALL';

// ─────────────────────────────────────────────────────────────────────────────
// Constants - Dark Theme Colors
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  background: '#0d0d14',
  cardBg: '#1a1a24',
  gridLine: 'rgba(255, 255, 255, 0.05)',
  axisText: '#6B7280',
  portfolio: '#3B82F6', // Blue for portfolio
  benchmark: '#9CA3AF', // Gray for S&P 500
  gain: '#10B981', // Emerald for gains
  loss: '#EF4444', // Red for losses
  amber: '#F59E0B', // Amber for highlights
  tooltipBg: '#1a1a24',
  tooltipBorder: 'rgba(255, 255, 255, 0.2)',
};

// Additional benchmark colors
const BENCHMARK_COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
];

const TIME_RANGES: { key: TimeRange; label: string; days: number | null }[] = [
  { key: '1M', label: '1M', days: 30 },
  { key: '3M', label: '3M', days: 90 },
  { key: '6M', label: '6M', days: 180 },
  { key: 'YTD', label: 'YTD', days: null }, // Calculated dynamically
  { key: '1Y', label: '1Y', days: 365 },
  { key: '3Y', label: '3Y', days: 1095 },
  { key: 'ALL', label: 'ALL', days: null },
];

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data Generator - 3 years of realistic daily data
// ─────────────────────────────────────────────────────────────────────────────

export function generateDemoPerformanceData(
  startValue: number = 100000,
  years: number = 3
): PerformanceDataPoint[] {
  const data: PerformanceDataPoint[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - years);

  let portfolioValue = startValue;
  let benchmarkValue = startValue;
  let nasdaqValue = startValue;
  let bondValue = startValue;

  // Realistic daily volatility and drift
  const portfolioDrift = 0.00035; // ~9% annual
  const portfolioVol = 0.012; // ~19% annual vol
  const benchmarkDrift = 0.00032; // ~8% annual (S&P 500)
  const benchmarkVol = 0.01; // ~16% annual vol
  const nasdaqDrift = 0.00045; // ~12% annual
  const nasdaqVol = 0.015; // ~24% annual vol
  const bondDrift = 0.00015; // ~4% annual
  const bondVol = 0.003; // ~5% annual vol

  // Add some correlation between assets
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Skip weekends
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Generate correlated random returns
      const marketReturn = (Math.random() - 0.5) * 2;
      const idiosyncratic = (Math.random() - 0.5) * 2;

      const portfolioReturn =
        portfolioDrift + portfolioVol * (0.8 * marketReturn + 0.2 * idiosyncratic);
      const benchmarkReturn =
        benchmarkDrift + benchmarkVol * marketReturn;
      const nasdaqReturn =
        nasdaqDrift + nasdaqVol * (0.9 * marketReturn + 0.1 * idiosyncratic);
      const bondReturn =
        bondDrift + bondVol * (-0.2 * marketReturn + 0.8 * idiosyncratic);

      portfolioValue *= 1 + portfolioReturn;
      benchmarkValue *= 1 + benchmarkReturn;
      nasdaqValue *= 1 + nasdaqReturn;
      bondValue *= 1 + bondReturn;

      // Add some drawdown events
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Simulate 2023 banking crisis (March 2023)
      if (dateStr >= '2023-03-08' && dateStr <= '2023-03-15') {
        portfolioValue *= 0.985;
        benchmarkValue *= 0.99;
        nasdaqValue *= 0.98;
      }

      data.push({
        date: dateStr,
        portfolio: Math.round(portfolioValue * 100) / 100,
        benchmark: Math.round(benchmarkValue * 100) / 100,
        nasdaq: Math.round(nasdaqValue * 100) / 100,
        bonds: Math.round(bondValue * 100) / 100,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number, showSign: boolean = true): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function formatDate(dateStr: string, format: 'short' | 'long' = 'short'): string {
  const date = new Date(dateStr);
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDateRangeIndices(
  data: PerformanceDataPoint[],
  range: TimeRange
): { startIndex: number; endIndex: number } {
  const endIndex = data.length - 1;
  const endDate = new Date(data[endIndex].date);

  if (range === 'ALL') {
    return { startIndex: 0, endIndex };
  }

  let startDate: Date;

  if (range === 'YTD') {
    startDate = new Date(endDate.getFullYear(), 0, 1);
  } else {
    const rangeConfig = TIME_RANGES.find((r) => r.key === range);
    if (!rangeConfig || !rangeConfig.days) {
      return { startIndex: 0, endIndex };
    }
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - rangeConfig.days);
  }

  // Find the closest date in data
  let startIndex = 0;
  for (let i = 0; i < data.length; i++) {
    if (new Date(data[i].date) >= startDate) {
      startIndex = i;
      break;
    }
  }

  return { startIndex, endIndex };
}

function calculatePerformance(
  startValue: number,
  endValue: number
): { change: number; percentChange: number } {
  const change = endValue - startValue;
  const percentChange = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0;
  return { change, percentChange };
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip Component
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  startValue: number;
  benchmarks: BenchmarkConfig[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
  startValue,
  benchmarks,
}: CustomTooltipProps) => {
  if (!active || !payload || !payload.length || !label) return null;

  const portfolioData = payload.find((p) => p.dataKey === 'portfolio');
  const benchmarkData = payload.find((p) => p.dataKey === 'benchmark');

  const portfolioValue = portfolioData?.value ?? 0;
  const benchmarkValue = benchmarkData?.value ?? 0;
  const difference = portfolioValue - benchmarkValue;

  const portfolioPerf = calculatePerformance(startValue, portfolioValue);
  const benchmarkPerf = benchmarkValue
    ? calculatePerformance(startValue, benchmarkValue)
    : null;

  return (
    <div
      className="rounded-xl p-4 shadow-xl border min-w-[240px]"
      style={{
        backgroundColor: COLORS.tooltipBg,
        borderColor: COLORS.tooltipBorder,
      }}
    >
      <div className="text-gray-400 text-sm mb-3 font-medium">
        {formatDate(label, 'long')}
      </div>

      {/* Portfolio */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: COLORS.portfolio }}
          />
          <span className="text-white font-medium">Portfolio</span>
        </div>
        <div className="text-right">
          <div className="text-white font-semibold">
            {formatCurrency(portfolioValue)}
          </div>
          <div
            className={`text-xs ${
              portfolioPerf.percentChange >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {formatPercent(portfolioPerf.percentChange)}
          </div>
        </div>
      </div>

      {/* S&P 500 Benchmark */}
      {benchmarkData && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS.benchmark }}
            />
            <span className="text-gray-300">S&P 500</span>
          </div>
          <div className="text-right">
            <div className="text-gray-300">{formatCurrency(benchmarkValue)}</div>
            {benchmarkPerf && (
              <div
                className={`text-xs ${
                  benchmarkPerf.percentChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {formatPercent(benchmarkPerf.percentChange)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Benchmarks */}
      {benchmarks
        .filter((b) => b.enabled && b.key !== 'benchmark')
        .map((benchmark) => {
          const data = payload.find((p) => p.dataKey === benchmark.key);
          if (!data) return null;
          const perf = calculatePerformance(startValue, data.value);
          return (
            <div key={benchmark.key} className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: benchmark.color }}
                />
                <span className="text-gray-300">{benchmark.name}</span>
              </div>
              <div className="text-right">
                <div className="text-gray-300">{formatCurrency(data.value)}</div>
                <div
                  className={`text-xs ${
                    perf.percentChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {formatPercent(perf.percentChange)}
                </div>
              </div>
            </div>
          );
        })}

      {/* Difference vs benchmark */}
      {benchmarkData && (
        <div className="pt-2 mt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">vs S&P 500</span>
            <span
              className={`font-semibold ${
                difference >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {difference >= 0 ? '+' : ''}
              {formatCurrency(difference)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Time Range Selector
// ─────────────────────────────────────────────────────────────────────────────

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

const TimeRangeSelector = ({ selected, onChange }: TimeRangeSelectorProps) => {
  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
      {TIME_RANGES.map((range) => (
        <button
          key={range.key}
          onClick={() => onChange(range.key)}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-all
            min-h-[40px] min-w-[48px]
            ${
              selected === range.key
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }
          `}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Benchmark Toggle
// ─────────────────────────────────────────────────────────────────────────────

interface BenchmarkToggleProps {
  benchmarks: BenchmarkConfig[];
  onToggle: (key: string) => void;
}

const BenchmarkToggle = ({ benchmarks, onToggle }: BenchmarkToggleProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {benchmarks.map((benchmark) => (
        <button
          key={benchmark.key}
          onClick={() => onToggle(benchmark.key)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
            min-h-[40px]
            ${
              benchmark.enabled
                ? 'bg-white/10 border border-white/20'
                : 'bg-white/5 border border-transparent text-gray-500'
            }
          `}
        >
          <div
            className={`w-3 h-3 rounded-full ${
              benchmark.enabled ? '' : 'opacity-30'
            }`}
            style={{ backgroundColor: benchmark.color }}
          />
          <span className={benchmark.enabled ? 'text-white' : 'text-gray-500'}>
            {benchmark.name}
          </span>
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Performance Summary Card
// ─────────────────────────────────────────────────────────────────────────────

interface PerformanceSummaryProps {
  portfolioStart: number;
  portfolioEnd: number;
  benchmarkStart?: number;
  benchmarkEnd?: number;
  dateRange: string;
}

const PerformanceSummary = ({
  portfolioStart,
  portfolioEnd,
  benchmarkStart,
  benchmarkEnd,
  dateRange,
}: PerformanceSummaryProps) => {
  const portfolioPerf = calculatePerformance(portfolioStart, portfolioEnd);
  const benchmarkPerf =
    benchmarkStart && benchmarkEnd
      ? calculatePerformance(benchmarkStart, benchmarkEnd)
      : null;
  const alpha = benchmarkPerf
    ? portfolioPerf.percentChange - benchmarkPerf.percentChange
    : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {/* Portfolio Value */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="text-gray-400 text-xs mb-1">Portfolio Value</div>
        <div className="text-white text-xl font-bold">
          {formatCurrency(portfolioEnd)}
        </div>
        <div
          className={`text-sm ${
            portfolioPerf.percentChange >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {formatPercent(portfolioPerf.percentChange)} ({dateRange})
        </div>
      </div>

      {/* Absolute Change */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="text-gray-400 text-xs mb-1">Change</div>
        <div
          className={`text-xl font-bold ${
            portfolioPerf.change >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {portfolioPerf.change >= 0 ? '+' : ''}
          {formatCurrency(portfolioPerf.change)}
        </div>
        <div className="text-gray-500 text-sm">
          from {formatCurrency(portfolioStart)}
        </div>
      </div>

      {/* vs Benchmark */}
      {benchmarkPerf && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-gray-400 text-xs mb-1">S&P 500</div>
          <div className="text-gray-300 text-xl font-bold">
            {formatPercent(benchmarkPerf.percentChange)}
          </div>
          <div className="text-gray-500 text-sm">benchmark return</div>
        </div>
      )}

      {/* Alpha */}
      {alpha !== null && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-gray-400 text-xs mb-1">Alpha</div>
          <div
            className={`text-xl font-bold ${
              alpha >= 0 ? 'text-amber-400' : 'text-red-400'
            }`}
          >
            {formatPercent(alpha)}
          </div>
          <div className="text-gray-500 text-sm">vs benchmark</div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main PerformanceChart Component
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_BENCHMARKS: BenchmarkConfig[] = [
  { key: 'benchmark', name: 'S&P 500', color: COLORS.benchmark, enabled: true },
  { key: 'nasdaq', name: 'NASDAQ', color: BENCHMARK_COLORS[0], enabled: false },
  { key: 'bonds', name: 'Bonds', color: BENCHMARK_COLORS[1], enabled: false },
];

export default function PerformanceChart({
  data,
  initialValue,
  title = 'Portfolio Performance',
  height = 400,
  showBrush = true,
  showRangeSelector = true,
  benchmarks: initialBenchmarks = DEFAULT_BENCHMARKS,
  onRangeChange,
  portfolioColor = COLORS.portfolio,
  // benchmarkColor is reserved for future use with custom benchmark styling
}: PerformanceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1Y');
  const [brushRange, setBrushRange] = useState<{ start: number; end: number } | null>(
    null
  );
  const [benchmarks, setBenchmarks] = useState<BenchmarkConfig[]>(initialBenchmarks);

  // Calculate filtered data based on selected range
  const filteredData = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    const { startIndex: si, endIndex: ei } = getDateRangeIndices(data, selectedRange);

    // If brush is active, use brush range instead
    const effectiveStart = brushRange ? brushRange.start : si;
    const effectiveEnd = brushRange ? brushRange.end : ei;

    return data.slice(effectiveStart, effectiveEnd + 1);
  }, [data, selectedRange, brushRange]);

  // Calculate starting value for percentage calculations
  const startValue = useMemo(() => {
    if (initialValue) return initialValue;
    if (filteredData.length === 0) return 100000;
    return filteredData[0].portfolio;
  }, [initialValue, filteredData]);

  // Get performance summary values
  const summaryData = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        portfolioStart: startValue,
        portfolioEnd: startValue,
        benchmarkStart: startValue,
        benchmarkEnd: startValue,
      };
    }

    const first = filteredData[0];
    const last = filteredData[filteredData.length - 1];

    return {
      portfolioStart: first.portfolio,
      portfolioEnd: last.portfolio,
      benchmarkStart: first.benchmark,
      benchmarkEnd: last.benchmark,
    };
  }, [filteredData, startValue]);

  // Date range label
  const dateRangeLabel = useMemo(() => {
    if (filteredData.length === 0) return selectedRange;
    const first = filteredData[0];
    const last = filteredData[filteredData.length - 1];
    return `${formatDate(first.date)} - ${formatDate(last.date)}`;
  }, [filteredData, selectedRange]);

  // Handle range change
  const handleRangeChange = useCallback(
    (range: TimeRange) => {
      setSelectedRange(range);
      setBrushRange(null); // Reset brush when changing time range

      if (onRangeChange && data.length > 0) {
        const { startIndex: si, endIndex: ei } = getDateRangeIndices(data, range);
        onRangeChange(data[si].date, data[ei].date);
      }
    },
    [data, onRangeChange]
  );

  // Handle brush change
  const handleBrushChange = useCallback(
    (brushData: { startIndex?: number; endIndex?: number }) => {
      if (
        brushData.startIndex !== undefined &&
        brushData.endIndex !== undefined
      ) {
        setBrushRange({
          start: brushData.startIndex,
          end: brushData.endIndex,
        });

        if (onRangeChange && data.length > 0) {
          onRangeChange(
            data[brushData.startIndex].date,
            data[brushData.endIndex].date
          );
        }
      }
    },
    [data, onRangeChange]
  );

  // Toggle benchmark visibility
  const handleBenchmarkToggle = useCallback((key: string) => {
    setBenchmarks((prev) =>
      prev.map((b) => (b.key === key ? { ...b, enabled: !b.enabled } : b))
    );
  }, []);

  // X-axis tick formatter
  const formatXAxisTick = useCallback(
    (dateStr: string) => {
      const date = new Date(dateStr);
      // Show year for ranges > 1 year
      if (selectedRange === '3Y' || selectedRange === 'ALL') {
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },
    [selectedRange]
  );

  // Y-axis tick formatter
  const formatYAxisTick = useCallback((value: number) => {
    return formatCurrency(value);
  }, []);

  // Calculate Y-axis domain with padding
  const yDomain = useMemo(() => {
    if (filteredData.length === 0) return [0, 100000];

    let min = Infinity;
    let max = -Infinity;

    filteredData.forEach((d) => {
      min = Math.min(min, d.portfolio);
      max = Math.max(max, d.portfolio);
      if (d.benchmark) {
        min = Math.min(min, d.benchmark);
        max = Math.max(max, d.benchmark);
      }
      // Check additional benchmarks
      benchmarks.forEach((b) => {
        if (b.enabled && d[b.key] !== undefined) {
          const val = d[b.key] as number;
          min = Math.min(min, val);
          max = Math.max(max, val);
        }
      });
    });

    const padding = (max - min) * 0.1;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [filteredData, benchmarks]);

  if (data.length === 0) {
    return (
      <div className="w-full bg-white/5 rounded-xl p-8 border border-white/10">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">📈</div>
          <div className="text-lg font-medium">No performance data available</div>
          <div className="text-sm mt-2">
            Connect your accounts to see your portfolio performance over time.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with title and range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
        {showRangeSelector && (
          <TimeRangeSelector selected={selectedRange} onChange={handleRangeChange} />
        )}
      </div>

      {/* Performance Summary */}
      <PerformanceSummary
        portfolioStart={summaryData.portfolioStart}
        portfolioEnd={summaryData.portfolioEnd}
        benchmarkStart={summaryData.benchmarkStart}
        benchmarkEnd={summaryData.benchmarkEnd}
        dateRange={selectedRange}
      />

      {/* Benchmark toggles */}
      {benchmarks.length > 1 && (
        <div className="mb-4">
          <div className="text-gray-400 text-xs mb-2">Compare with:</div>
          <BenchmarkToggle benchmarks={benchmarks} onToggle={handleBenchmarkToggle} />
        </div>
      )}

      {/* Chart */}
      <div
        className="bg-white/5 rounded-xl p-4 border border-white/10"
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 10, bottom: showBrush ? 40 : 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={COLORS.gridLine}
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisTick}
              stroke={COLORS.axisText}
              tick={{ fill: COLORS.axisText, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={50}
            />

            <YAxis
              tickFormatter={formatYAxisTick}
              stroke={COLORS.axisText}
              tick={{ fill: COLORS.axisText, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={yDomain}
              width={70}
            />

            <Tooltip
              content={
                <CustomTooltip
                  startValue={startValue}
                  benchmarks={benchmarks}
                />
              }
              cursor={{
                stroke: 'rgba(255, 255, 255, 0.2)',
                strokeDasharray: '4 4',
              }}
            />

            {/* Reference line at starting value */}
            <ReferenceLine
              y={startValue}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeDasharray="3 3"
            />

            {/* Portfolio line */}
            <Line
              type="monotone"
              dataKey="portfolio"
              name="Portfolio"
              stroke={portfolioColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 6,
                stroke: portfolioColor,
                strokeWidth: 2,
                fill: COLORS.cardBg,
              }}
            />

            {/* Benchmark lines (only if enabled) */}
            {benchmarks.map((benchmark) =>
              benchmark.enabled ? (
                <Line
                  key={benchmark.key}
                  type="monotone"
                  dataKey={benchmark.key}
                  name={benchmark.name}
                  stroke={benchmark.color}
                  strokeWidth={benchmark.key === 'benchmark' ? 2 : 1.5}
                  strokeDasharray={benchmark.key === 'benchmark' ? undefined : '4 4'}
                  dot={false}
                  activeDot={{
                    r: 5,
                    stroke: benchmark.color,
                    strokeWidth: 2,
                    fill: COLORS.cardBg,
                  }}
                />
              ) : null
            )}

            {/* Brush for custom date range */}
            {showBrush && (
              <Brush
                dataKey="date"
                height={30}
                stroke={COLORS.amber}
                fill={COLORS.cardBg}
                travellerWidth={10}
                onChange={handleBrushChange}
                tickFormatter={(dateStr) => {
                  const date = new Date(dateStr);
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    year: '2-digit',
                  });
                }}
              />
            )}

            <Legend
              verticalAlign="top"
              height={36}
              iconType="line"
              formatter={(value) => (
                <span style={{ color: COLORS.axisText, fontSize: 12 }}>{value}</span>
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Date range indicator */}
      <div className="mt-3 text-center text-gray-500 text-sm">{dateRangeLabel}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Named Exports for Easy Import
// ─────────────────────────────────────────────────────────────────────────────

export { COLORS as PerformanceChartColors };
export type { TimeRange };
