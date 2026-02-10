'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Holding {
  id?: string;
  ticker?: string;
  name: string;
  value: number;
  costBasis?: number;
  category?: string;   // Asset class (e.g., "US Equity")
  subCategory?: string; // Sector (e.g., "US Large Cap")
}

export interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
  gainLoss?: number;
  gainLossPercent?: number;
  color: string;
  children?: ChartDataItem[];
  holdings?: Holding[];
}

interface InteractivePortfolioChartProps {
  holdings: Holding[];
  totalValue?: number;
  title?: string;
  showLegend?: boolean;
  height?: number;
  onHoldingClick?: (holding: Holding) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Color Scheme - Consistent colors per asset class, dark theme compatible
// ─────────────────────────────────────────────────────────────────────────────

const ASSET_CLASS_COLORS: Record<string, string> = {
  'US Equity': '#3B82F6',       // Blue
  'US Stocks': '#3B82F6',       // Blue
  'International': '#10B981',   // Emerald
  'Intl Equity': '#10B981',     // Emerald
  'Bonds': '#F59E0B',           // Amber
  'Fixed Income': '#F59E0B',    // Amber
  'Real Estate': '#8B5CF6',     // Purple
  'Cash': '#6B7280',            // Gray
  'Alternatives': '#EC4899',    // Pink
  'Commodities': '#F97316',     // Orange
  'Individual Stocks': '#A855F7', // Violet
};

// Fallback colors for segments without a category
const FALLBACK_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#84CC16', // Lime
  '#A855F7', // Violet
];

// Selected segment highlight color (amber/gold)
const HIGHLIGHT_COLOR = '#D97706';

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
  return `$${value.toLocaleString()}`;
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function getColorForCategory(category: string | undefined, index: number): string {
  if (category && ASSET_CLASS_COLORS[category]) {
    return ASSET_CLASS_COLORS[category];
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

// Group holdings by category for drill-down
function groupHoldingsByCategory(holdings: Holding[]): ChartDataItem[] {
  const groups: Record<string, { holdings: Holding[]; total: number; costBasis: number }> = {};
  
  holdings.forEach((holding) => {
    const category = holding.category || 'Other';
    if (!groups[category]) {
      groups[category] = { holdings: [], total: 0, costBasis: 0 };
    }
    groups[category].holdings.push(holding);
    groups[category].total += holding.value;
    groups[category].costBasis += holding.costBasis || holding.value;
  });
  
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  
  return Object.entries(groups).map(([name, data], index) => {
    const gainLoss = data.total - data.costBasis;
    const gainLossPercent = data.costBasis > 0 ? ((data.total - data.costBasis) / data.costBasis) * 100 : 0;
    
    // Group holdings within category by subCategory
    const subGroups: Record<string, Holding[]> = {};
    data.holdings.forEach(h => {
      const sub = h.subCategory || h.name;
      if (!subGroups[sub]) subGroups[sub] = [];
      subGroups[sub].push(h);
    });
    
    const children: ChartDataItem[] = Object.entries(subGroups).map(([subName, subHoldings], subIndex) => {
      const subTotal = subHoldings.reduce((s, h) => s + h.value, 0);
      const subCostBasis = subHoldings.reduce((s, h) => s + (h.costBasis || h.value), 0);
      const subGainLoss = subTotal - subCostBasis;
      const subGainLossPercent = subCostBasis > 0 ? ((subTotal - subCostBasis) / subCostBasis) * 100 : 0;
      
      return {
        name: subName,
        value: subTotal,
        percentage: totalValue > 0 ? (subTotal / totalValue) * 100 : 0,
        gainLoss: subGainLoss,
        gainLossPercent: subGainLossPercent,
        color: getColorForCategory(name, index),
        holdings: subHoldings,
      };
    });
    
    return {
      name,
      value: data.total,
      percentage: totalValue > 0 ? (data.total / totalValue) * 100 : 0,
      gainLoss,
      gainLossPercent,
      color: getColorForCategory(name, index),
      children,
      holdings: data.holdings,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Active Shape (expanded segment on click)
// ─────────────────────────────────────────────────────────────────────────────

interface ActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: ChartDataItem;
  percent: number;
  value: number;
}

const renderActiveShape = (props: ActiveShapeProps) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;

  return (
    <g>
      {/* Expanded outer sector */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={HIGHLIGHT_COLOR}
        style={{ filter: 'drop-shadow(0 0 8px rgba(217, 119, 6, 0.5))' }}
      />
      {/* Inner sector */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={innerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {/* Label line and text */}
      <text
        x={mx}
        y={my}
        textAnchor={cos >= 0 ? 'start' : 'end'}
        fill="#fff"
        fontSize={12}
        fontWeight={600}
      >
        {payload.name}
      </text>
      <text
        x={mx}
        y={my + 16}
        textAnchor={cos >= 0 ? 'start' : 'end'}
        fill="#9CA3AF"
        fontSize={11}
      >
        {formatCurrency(payload.value)} ({payload.percentage.toFixed(1)}%)
      </text>
    </g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipPayload {
  payload: ChartDataItem;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
  if (!active || !payload || !payload[0]) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-[#1a1a24] border border-white/20 rounded-xl p-4 shadow-xl min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: data.color }}
        />
        <span className="text-white font-semibold">{data.name}</span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Value:</span>
          <span className="text-white">{formatCurrency(data.value)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Allocation:</span>
          <span className="text-white">{data.percentage.toFixed(1)}%</span>
        </div>
        {data.gainLoss !== undefined && (
          <div className="flex justify-between pt-1 border-t border-white/10 mt-1">
            <span className="text-gray-400">Gain/Loss:</span>
            <span className={data.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {formatCurrency(data.gainLoss)} ({formatPercent(data.gainLossPercent || 0)})
            </span>
          </div>
        )}
      </div>
      {data.children && data.children.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10 text-xs text-amber-400">
          Click to drill down →
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb Component
// ─────────────────────────────────────────────────────────────────────────────

interface BreadcrumbItem {
  name: string;
  data: ChartDataItem[];
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (index: number) => void;
}

const Breadcrumb = ({ items, onNavigate }: BreadcrumbProps) => {
  return (
    <div className="flex items-center gap-2 text-sm mb-4 flex-wrap">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <span className="text-gray-600">→</span>}
          <button
            onClick={() => onNavigate(index)}
            className={`px-3 py-2 rounded-lg transition-colors min-h-[48px] flex items-center ${
              index === items.length - 1
                ? 'bg-amber-500/20 text-amber-400 font-medium'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Center Label Component
// ─────────────────────────────────────────────────────────────────────────────

interface CenterLabelProps {
  total: number;
  selected?: ChartDataItem | null;
}

const CenterLabel = ({ total, selected }: CenterLabelProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        {selected ? (
          <>
            <div className="text-lg font-bold text-white truncate max-w-[120px]">
              {selected.name}
            </div>
            <div className="text-2xl font-bold text-amber-400">
              {selected.percentage.toFixed(1)}%
            </div>
            <div className="text-gray-400 text-sm">
              {formatCurrency(selected.value)}
            </div>
          </>
        ) : (
          <>
            <div className="text-gray-400 text-sm">Total</div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(total)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Legend Component (Touch-friendly with 48px targets)
// ─────────────────────────────────────────────────────────────────────────────

interface LegendProps {
  data: ChartDataItem[];
  activeIndex: number | null;
  onHover: (index: number | null) => void;
  onClick: (index: number) => void;
}

const Legend = ({ data, activeIndex, onHover, onClick }: LegendProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
      {data.map((item, index) => (
        <button
          key={item.name}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all min-h-[48px] text-left ${
            activeIndex === index
              ? 'bg-amber-500/20 border border-amber-500/30'
              : 'bg-white/5 border border-white/10 hover:border-white/20'
          }`}
          onMouseEnter={() => onHover(index)}
          onMouseLeave={() => onHover(null)}
          onClick={() => onClick(index)}
        >
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: activeIndex === index ? HIGHLIGHT_COLOR : item.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium text-sm truncate">{item.name}</div>
            <div className="text-gray-400 text-xs">
              {formatCurrency(item.value)} • {item.percentage.toFixed(1)}%
            </div>
          </div>
          {item.children && item.children.length > 0 && (
            <div className="text-gray-500 text-xs">→</div>
          )}
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Holdings Detail View
// ─────────────────────────────────────────────────────────────────────────────

interface HoldingsDetailProps {
  holdings: Holding[];
  onHoldingClick?: (holding: Holding) => void;
}

const HoldingsDetail = ({ holdings, onHoldingClick }: HoldingsDetailProps) => {
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  
  return (
    <div className="space-y-2 mt-4">
      <div className="text-gray-400 text-sm mb-3">Individual Holdings:</div>
      {holdings.map((holding, index) => {
        const gainLoss = holding.costBasis ? holding.value - holding.costBasis : 0;
        const gainLossPercent = holding.costBasis && holding.costBasis > 0 
          ? ((holding.value - holding.costBasis) / holding.costBasis) * 100 
          : 0;
        const allocation = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
        
        return (
          <button
            key={holding.id || holding.ticker || index}
            onClick={() => onHoldingClick?.(holding)}
            className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:border-amber-500/30 transition-colors min-h-[56px] text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {holding.ticker || holding.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-white font-medium">{holding.ticker || holding.name}</div>
                <div className="text-gray-500 text-xs truncate max-w-[150px]">{holding.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">{formatCurrency(holding.value)}</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">{allocation.toFixed(1)}%</span>
                {holding.costBasis && (
                  <span className={gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {formatPercent(gainLossPercent)}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function InteractivePortfolioChart({
  holdings,
  totalValue,
  title = 'Portfolio Allocation',
  showLegend = true,
  height = 350,
  onHoldingClick,
}: InteractivePortfolioChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [drillPath, setDrillPath] = useState<BreadcrumbItem[]>([]);
  
  // Calculate total if not provided
  const calculatedTotal = totalValue || holdings.reduce((sum, h) => sum + h.value, 0);
  
  // Initial grouped data
  const initialData = useMemo(() => groupHoldingsByCategory(holdings), [holdings]);
  
  // Current level data based on drill path
  const currentData = useMemo(() => {
    if (drillPath.length === 0) return initialData;
    return drillPath[drillPath.length - 1].data;
  }, [initialData, drillPath]);
  
  // Breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const items: BreadcrumbItem[] = [{ name: 'All Holdings', data: initialData }];
    return [...items, ...drillPath];
  }, [initialData, drillPath]);
  
  // Get selected item for center label
  const selectedItem = activeIndex !== null ? currentData[activeIndex] : null;
  
  // Handle segment click - drill down if children exist
  const handleSegmentClick = useCallback((index: number) => {
    const item = currentData[index];
    
    if (item.children && item.children.length > 0) {
      // Drill into children
      setDrillPath(prev => [...prev, { name: item.name, data: item.children! }]);
      setActiveIndex(null);
    } else if (item.holdings && item.holdings.length > 0) {
      // Show holdings detail (already at deepest level)
      setActiveIndex(index);
    }
  }, [currentData]);
  
  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = useCallback((index: number) => {
    if (index === 0) {
      setDrillPath([]);
    } else {
      setDrillPath(prev => prev.slice(0, index));
    }
    setActiveIndex(null);
  }, []);
  
  // Check if we're at the holdings level
  const showHoldingsDetail = selectedItem && selectedItem.holdings && selectedItem.holdings.length > 0 && !selectedItem.children;
  
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      
      {/* Breadcrumb navigation */}
      {breadcrumbItems.length > 1 && (
        <Breadcrumb items={breadcrumbItems} onNavigate={handleBreadcrumbNavigate} />
      )}
      
      {/* Chart */}
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={currentData}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              {...{ activeIndex: activeIndex !== null ? activeIndex : undefined }}
              activeShape={renderActiveShape as unknown as (props: unknown) => React.ReactElement}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={(_, index) => handleSegmentClick(index)}
              animationBegin={0}
              animationDuration={500}
              animationEasing="ease-out"
              style={{ cursor: 'pointer' }}
            >
              {currentData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={activeIndex === index ? HIGHLIGHT_COLOR : entry.color}
                  stroke="transparent"
                  style={{
                    transition: 'all 0.3s ease',
                    filter: activeIndex === index ? 'brightness(1.2)' : 'none',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <CenterLabel total={calculatedTotal} selected={selectedItem} />
      </div>
      
      {/* Holdings detail when selected at deepest level */}
      {showHoldingsDetail && selectedItem.holdings && (
        <HoldingsDetail 
          holdings={selectedItem.holdings} 
          onHoldingClick={onHoldingClick}
        />
      )}
      
      {/* Legend */}
      {showLegend && !showHoldingsDetail && (
        <Legend
          data={currentData}
          activeIndex={activeIndex}
          onHover={setActiveIndex}
          onClick={handleSegmentClick}
        />
      )}
    </div>
  );
}
