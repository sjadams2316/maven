'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
  Cell,
  TooltipProps,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FundDataPoint {
  year: number;
  irr: number;
  cashFlow: number;
  events?: FundEvent[];
}

export interface FundEvent {
  type: 'capital_call' | 'distribution' | 'valuation' | 'exit' | 'other';
  amount: number;
  description?: string;
  date?: string;
}

export interface JCurveChartProps {
  /** Fund performance data */
  fundData: FundDataPoint[];
  /** Industry benchmark data (optional) */
  benchmarkData?: { year: number; irr: number }[];
  /** Projected/expected performance (optional) */
  projectionData?: { year: number; irr: number }[];
  /** Current year position (highlighted) */
  currentYear?: number;
  /** Callback when a data point is clicked */
  onPointClick?: (point: FundDataPoint, event: FundEvent | null) => void;
  /** Chart height */
  height?: number;
  /** Show legend */
  showLegend?: boolean;
  /** Chart title */
  title?: string;
  /** Y-axis mode */
  yAxisMode?: 'irr' | 'cashFlow';
}

// ─────────────────────────────────────────────────────────────────────────────
// Colors - Dark theme compatible
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  // IRR gradient
  negative: '#EF4444',      // Red for negative IRR
  positive: '#10B981',      // Emerald for positive IRR
  // Series colors
  actual: '#3B82F6',        // Blue for actual performance
  projected: '#6B7280',     // Gray for projections
  benchmark: '#8B5CF6',     // Purple for benchmark
  // Marker colors
  capitalCall: '#F87171',   // Light red for capital calls
  distribution: '#34D399',  // Light emerald for distributions
  currentPosition: '#F59E0B', // Amber for current position
  // Grid & axis
  grid: '#374151',          // Gray-700
  axis: '#9CA3AF',          // Gray-400
  background: '#1F2937',    // Gray-800
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (absValue >= 1000000) {
    return `${sign}$${(absValue / 1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `${sign}$${(absValue / 1000).toFixed(0)}K`;
  }
  return `${sign}$${absValue.toLocaleString()}`;
}

function getEventTypeLabel(type: FundEvent['type']): string {
  switch (type) {
    case 'capital_call':
      return 'Capital Call';
    case 'distribution':
      return 'Distribution';
    case 'valuation':
      return 'Valuation';
    case 'exit':
      return 'Exit';
    default:
      return 'Event';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: FundDataPoint & { benchmarkIrr?: number; projectedIrr?: number } }>;
  label?: string;
  yAxisMode: 'irr' | 'cashFlow';
}

function CustomTooltip({ active, payload, label, yAxisMode }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload as FundDataPoint & {
    benchmarkIrr?: number;
    projectedIrr?: number;
  };

  if (!data) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px]">
      <div className="text-sm font-medium text-gray-300 mb-2">
        Year {label}
      </div>
      
      {/* IRR */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-400 text-sm">IRR</span>
        <span className={`font-semibold ${data.irr >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatPercent(data.irr)}
        </span>
      </div>
      
      {/* Cash Flow */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-400 text-sm">Net Cash Flow</span>
        <span className={`font-semibold ${data.cashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(data.cashFlow)}
        </span>
      </div>

      {/* Benchmark */}
      {data.benchmarkIrr !== undefined && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400 text-sm">Benchmark</span>
          <span className="text-purple-400 font-semibold">
            {formatPercent(data.benchmarkIrr)}
          </span>
        </div>
      )}

      {/* Projection */}
      {data.projectedIrr !== undefined && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400 text-sm">Projected</span>
          <span className="text-gray-400 font-semibold">
            {formatPercent(data.projectedIrr)}
          </span>
        </div>
      )}

      {/* Events */}
      {data.events && data.events.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-500 uppercase mb-1">Events</div>
          {data.events.map((event, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className={event.type === 'capital_call' ? 'text-red-400' : 'text-emerald-400'}>
                {getEventTypeLabel(event.type)}
              </span>
              <span className="text-gray-300">{formatCurrency(event.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Dot Component for Events
// ─────────────────────────────────────────────────────────────────────────────

interface EventDotProps {
  cx?: number;
  cy?: number;
  payload?: FundDataPoint & { isCurrent?: boolean };
  onClick?: (point: FundDataPoint, event: FundEvent | null) => void;
}

function EventDot({ cx, cy, payload, onClick }: EventDotProps) {
  if (!cx || !cy || !payload) return null;

  const hasCapitalCall = payload.events?.some(e => e.type === 'capital_call');
  const hasDistribution = payload.events?.some(e => e.type === 'distribution');
  const isCurrent = payload.isCurrent;

  // Determine dot style
  let fill = COLORS.actual;
  let stroke = 'transparent';
  let r = 4;

  if (isCurrent) {
    fill = COLORS.currentPosition;
    stroke = COLORS.currentPosition;
    r = 8;
  } else if (hasCapitalCall) {
    fill = COLORS.capitalCall;
    r = 6;
  } else if (hasDistribution) {
    fill = COLORS.distribution;
    r = 6;
  }

  return (
    <g>
      {/* Outer glow for current position */}
      {isCurrent && (
        <circle
          cx={cx}
          cy={cy}
          r={12}
          fill={COLORS.currentPosition}
          opacity={0.3}
          className="animate-pulse"
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
        onClick={() => onClick?.(payload, payload.events?.[0] || null)}
      />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scatter Dots for Capital Calls and Distributions
// ─────────────────────────────────────────────────────────────────────────────

interface MarkerData {
  year: number;
  value: number;
  type: 'capital_call' | 'distribution';
  event: FundEvent;
  originalPoint: FundDataPoint;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function JCurveChart({
  fundData,
  benchmarkData,
  projectionData,
  currentYear,
  onPointClick,
  height = 400,
  showLegend = true,
  title,
  yAxisMode = 'irr',
}: JCurveChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Merge all data for the chart
  const chartData = useMemo(() => {
    return fundData.map((point) => {
      const benchmark = benchmarkData?.find(b => b.year === point.year);
      const projection = projectionData?.find(p => p.year === point.year);
      
      return {
        ...point,
        benchmarkIrr: benchmark?.irr,
        projectedIrr: projection?.irr,
        isCurrent: currentYear !== undefined && point.year === currentYear,
        // For the gradient fill
        fillColor: point.irr >= 0 ? COLORS.positive : COLORS.negative,
      };
    });
  }, [fundData, benchmarkData, projectionData, currentYear]);

  // Extract markers for capital calls and distributions
  const markers = useMemo((): MarkerData[] => {
    const result: MarkerData[] = [];
    
    fundData.forEach((point) => {
      if (point.events) {
        point.events.forEach((event) => {
          if (event.type === 'capital_call' || event.type === 'distribution') {
            result.push({
              year: point.year,
              // Position capital calls below zero, distributions above
              value: event.type === 'capital_call' 
                ? Math.min(point.irr, 0) - 5 
                : Math.max(point.irr, 0) + 5,
              type: event.type,
              event,
              originalPoint: point,
            });
          }
        });
      }
    });
    
    return result;
  }, [fundData]);

  // Handle point click
  const handlePointClick = useCallback((point: FundDataPoint, event: FundEvent | null) => {
    onPointClick?.(point, event);
  }, [onPointClick]);

  // Calculate Y-axis domain
  const yDomain = useMemo(() => {
    const allValues = [
      ...fundData.map(d => d.irr),
      ...(benchmarkData?.map(d => d.irr) || []),
      ...(projectionData?.map(d => d.irr) || []),
    ];
    const min = Math.min(...allValues, 0);
    const max = Math.max(...allValues, 0);
    const padding = Math.max(Math.abs(max - min) * 0.1, 10);
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [fundData, benchmarkData, projectionData]);

  // Custom gradient ID
  const gradientId = 'jcurve-gradient';

  return (
    <div className="w-full">
      {/* Header */}
      {(title || showLegend) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
          )}
          
          {showLegend && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-400">Actual</span>
              </div>
              {projectionData && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-gray-500 border-dashed" style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0' }} />
                  <span className="text-gray-400">Projected</span>
                </div>
              )}
              {benchmarkData && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-gray-400">Benchmark</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-400">Current</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.positive} stopOpacity={0.3} />
              <stop offset="50%" stopColor={COLORS.positive} stopOpacity={0.1} />
              <stop offset="50%" stopColor={COLORS.negative} stopOpacity={0.1} />
              <stop offset="100%" stopColor={COLORS.negative} stopOpacity={0.3} />
            </linearGradient>
            {/* Positive area gradient */}
            <linearGradient id="positive-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.positive} stopOpacity={0.4} />
              <stop offset="100%" stopColor={COLORS.positive} stopOpacity={0.05} />
            </linearGradient>
            {/* Negative area gradient */}
            <linearGradient id="negative-gradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={COLORS.negative} stopOpacity={0.4} />
              <stop offset="100%" stopColor={COLORS.negative} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {/* Grid */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={COLORS.grid} 
            vertical={false}
          />

          {/* Axes */}
          <XAxis
            dataKey="year"
            stroke={COLORS.axis}
            tick={{ fill: COLORS.axis, fontSize: 12 }}
            tickLine={{ stroke: COLORS.axis }}
            axisLine={{ stroke: COLORS.grid }}
            label={{ 
              value: 'Years Since Inception', 
              position: 'bottom', 
              fill: COLORS.axis,
              fontSize: 12,
              offset: 0
            }}
          />
          <YAxis
            stroke={COLORS.axis}
            tick={{ fill: COLORS.axis, fontSize: 12 }}
            tickLine={{ stroke: COLORS.axis }}
            axisLine={{ stroke: COLORS.grid }}
            tickFormatter={(value) => `${value}%`}
            domain={yDomain}
            label={{ 
              value: yAxisMode === 'irr' ? 'IRR (%)' : 'Cash Flow', 
              angle: -90, 
              position: 'insideLeft', 
              fill: COLORS.axis,
              fontSize: 12,
            }}
          />

          {/* Zero line */}
          <ReferenceLine 
            y={0} 
            stroke={COLORS.axis} 
            strokeWidth={2}
            strokeDasharray="4 4"
          />

          {/* Positive IRR area (above zero) */}
          <Area
            type="monotone"
            dataKey={(data) => data.irr >= 0 ? data.irr : 0}
            stroke="none"
            fill="url(#positive-gradient)"
            fillOpacity={1}
            isAnimationActive={true}
            animationDuration={1000}
          />

          {/* Negative IRR area (below zero) */}
          <Area
            type="monotone"
            dataKey={(data) => data.irr < 0 ? data.irr : 0}
            stroke="none"
            fill="url(#negative-gradient)"
            fillOpacity={1}
            isAnimationActive={true}
            animationDuration={1000}
          />

          {/* Benchmark line (dashed) */}
          {benchmarkData && (
            <Line
              type="monotone"
              dataKey="benchmarkIrr"
              stroke={COLORS.benchmark}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={true}
              animationDuration={1000}
            />
          )}

          {/* Projection line (dashed) */}
          {projectionData && (
            <Line
              type="monotone"
              dataKey="projectedIrr"
              stroke={COLORS.projected}
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={false}
              isAnimationActive={true}
              animationDuration={1000}
            />
          )}

          {/* Main IRR line */}
          <Line
            type="monotone"
            dataKey="irr"
            stroke={COLORS.actual}
            strokeWidth={3}
            dot={(props) => (
              <EventDot 
                {...props} 
                onClick={onPointClick ? handlePointClick : undefined}
              />
            )}
            activeDot={{
              r: 8,
              fill: COLORS.actual,
              stroke: '#fff',
              strokeWidth: 2,
            }}
            isAnimationActive={true}
            animationDuration={1000}
          />

          {/* Capital Call markers */}
          <Scatter
            data={markers.filter(m => m.type === 'capital_call')}
            dataKey="value"
            fill={COLORS.capitalCall}
            shape="triangle"
          >
            {markers.filter(m => m.type === 'capital_call').map((entry, index) => (
              <Cell
                key={`capital-call-${index}`}
                fill={COLORS.capitalCall}
                onClick={() => onPointClick?.(entry.originalPoint, entry.event)}
                style={{ cursor: onPointClick ? 'pointer' : 'default' }}
              />
            ))}
          </Scatter>

          {/* Distribution markers */}
          <Scatter
            data={markers.filter(m => m.type === 'distribution')}
            dataKey="value"
            fill={COLORS.distribution}
            shape="diamond"
          >
            {markers.filter(m => m.type === 'distribution').map((entry, index) => (
              <Cell
                key={`distribution-${index}`}
                fill={COLORS.distribution}
                onClick={() => onPointClick?.(entry.originalPoint, entry.event)}
                style={{ cursor: onPointClick ? 'pointer' : 'default' }}
              />
            ))}
          </Scatter>

          {/* Tooltip */}
          <Tooltip 
            content={<CustomTooltip yAxisMode={yAxisMode} />}
            cursor={{ stroke: COLORS.axis, strokeDasharray: '3 3' }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Event Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <polygon points="6,0 12,12 0,12" fill={COLORS.capitalCall} />
          </svg>
          <span className="text-gray-400">Capital Calls</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <polygon points="6,0 12,6 6,12 0,6" fill={COLORS.distribution} />
          </svg>
          <span className="text-gray-400">Distributions</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Example Usage / Demo Data
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_FUND_DATA: FundDataPoint[] = [
  { year: 0, irr: 0, cashFlow: 0, events: [{ type: 'capital_call', amount: -5000000, description: 'Initial commitment' }] },
  { year: 1, irr: -15, cashFlow: -2500000, events: [{ type: 'capital_call', amount: -2500000, description: 'Q4 capital call' }] },
  { year: 2, irr: -25, cashFlow: -1500000, events: [{ type: 'capital_call', amount: -1500000 }] },
  { year: 3, irr: -18, cashFlow: -500000, events: [{ type: 'capital_call', amount: -500000 }] },
  { year: 4, irr: -8, cashFlow: 200000, events: [{ type: 'distribution', amount: 200000, description: 'Partial exit - Company A' }] },
  { year: 5, irr: 5, cashFlow: 1500000, events: [{ type: 'distribution', amount: 1500000, description: 'Exit - Company B' }] },
  { year: 6, irr: 12, cashFlow: 2000000, events: [{ type: 'distribution', amount: 2000000 }] },
  { year: 7, irr: 18, cashFlow: 3500000, events: [{ type: 'distribution', amount: 3500000, description: 'IPO - Company C' }] },
  { year: 8, irr: 22, cashFlow: 2500000, events: [{ type: 'distribution', amount: 2500000 }] },
  { year: 9, irr: 25, cashFlow: 1500000, events: [{ type: 'distribution', amount: 1500000 }] },
  { year: 10, irr: 28, cashFlow: 1000000, events: [{ type: 'distribution', amount: 1000000, description: 'Final distribution' }] },
];

export const DEMO_BENCHMARK_DATA = [
  { year: 0, irr: 0 },
  { year: 1, irr: -12 },
  { year: 2, irr: -20 },
  { year: 3, irr: -15 },
  { year: 4, irr: -5 },
  { year: 5, irr: 3 },
  { year: 6, irr: 8 },
  { year: 7, irr: 12 },
  { year: 8, irr: 15 },
  { year: 9, irr: 17 },
  { year: 10, irr: 18 },
];

export const DEMO_PROJECTION_DATA = [
  { year: 5, irr: 5 },
  { year: 6, irr: 10 },
  { year: 7, irr: 15 },
  { year: 8, irr: 20 },
  { year: 9, irr: 24 },
  { year: 10, irr: 27 },
  { year: 11, irr: 29 },
  { year: 12, irr: 30 },
];
