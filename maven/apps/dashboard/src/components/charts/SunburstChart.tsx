'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SunburstNode {
  name: string;
  value?: number;
  children?: SunburstNode[];
  color?: string;
  id?: string;
}

export interface SunburstChartProps {
  data: SunburstNode;
  width?: number;
  height?: number;
  onSelect?: (node: SunburstNode | null, path: SunburstNode[]) => void;
  colorScheme?: 'default' | 'warm' | 'cool' | 'monochrome';
  showBreadcrumb?: boolean;
  showTooltip?: boolean;
  className?: string;
}

interface ProcessedNode {
  node: SunburstNode;
  depth: number;
  startAngle: number;
  endAngle: number;
  value: number;
  percentage: number;
  color: string;
  parent: ProcessedNode | null;
  children: ProcessedNode[];
  path: SunburstNode[];
}

interface TooltipData {
  node: ProcessedNode;
  x: number;
  y: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Color Schemes - Dark theme compatible
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_SCHEMES: Record<string, string[]> = {
  default: [
    '#3B82F6', // Blue - Equities
    '#10B981', // Emerald - International
    '#F59E0B', // Amber - Fixed Income
    '#8B5CF6', // Purple - Real Estate
    '#EC4899', // Pink - Alternatives
    '#06B6D4', // Cyan - Cash
    '#F97316', // Orange - Commodities
    '#EF4444', // Red
    '#84CC16', // Lime
    '#A855F7', // Violet
  ],
  warm: [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#FBBF24', // Yellow
    '#EC4899', // Pink
    '#F472B6', // Light Pink
    '#FB923C', // Light Orange
    '#FCD34D', // Light Yellow
    '#FECACA', // Very Light Red
    '#FED7AA', // Very Light Orange
  ],
  cool: [
    '#3B82F6', // Blue
    '#06B6D4', // Cyan
    '#10B981', // Emerald
    '#8B5CF6', // Purple
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#22D3EE', // Light Cyan
    '#34D399', // Light Emerald
    '#A78BFA', // Light Purple
    '#818CF8', // Light Indigo
  ],
  monochrome: [
    '#F3F4F6', // Gray 100
    '#D1D5DB', // Gray 300
    '#9CA3AF', // Gray 400
    '#6B7280', // Gray 500
    '#4B5563', // Gray 600
    '#374151', // Gray 700
    '#1F2937', // Gray 800
    '#111827', // Gray 900
    '#E5E7EB', // Gray 200
    '#F9FAFB', // Gray 50
  ],
};

// Asset class color mapping for consistent coloring
const ASSET_CLASS_COLORS: Record<string, string> = {
  'Equities': '#3B82F6',
  'US Equity': '#3B82F6',
  'Fixed Income': '#F59E0B',
  'Bonds': '#F59E0B',
  'International': '#10B981',
  'Real Estate': '#8B5CF6',
  'Alternatives': '#EC4899',
  'Cash': '#6B7280',
  'Commodities': '#F97316',
};

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
  return `${value.toFixed(1)}%`;
}

// Calculate total value of a node (sum of children or own value)
function calculateNodeValue(node: SunburstNode): number {
  if (node.value !== undefined && (!node.children || node.children.length === 0)) {
    return node.value;
  }
  if (node.children && node.children.length > 0) {
    return node.children.reduce((sum, child) => sum + calculateNodeValue(child), 0);
  }
  return node.value || 0;
}

// Adjust color brightness for child levels
function adjustColor(color: string, depth: number, index: number): string {
  // Parse hex color
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness based on depth (lighter for deeper levels)
  const factor = 1 + (depth * 0.15) + (index * 0.05);
  const newR = Math.min(255, Math.round(r * factor));
  const newG = Math.min(255, Math.round(g * factor));
  const newB = Math.min(255, Math.round(b * factor));
  
  return `rgb(${newR}, ${newG}, ${newB})`;
}

// Get color for a node based on its ancestry
function getNodeColor(
  node: SunburstNode,
  depth: number,
  index: number,
  parentColor: string | null,
  colorScheme: string[]
): string {
  // Check if node has explicit color
  if (node.color) return node.color;
  
  // Check asset class mapping
  if (ASSET_CLASS_COLORS[node.name]) {
    return ASSET_CLASS_COLORS[node.name];
  }
  
  // Use parent color with adjustment for children
  if (parentColor && depth > 0) {
    return adjustColor(parentColor, depth, index);
  }
  
  // Use color scheme for root-level items
  return colorScheme[index % colorScheme.length];
}

// Process hierarchy into flat array with angles
function processHierarchy(
  root: SunburstNode,
  colorScheme: string[],
  zoomRoot: ProcessedNode | null = null
): ProcessedNode[] {
  const result: ProcessedNode[] = [];
  const totalValue = zoomRoot ? zoomRoot.value : calculateNodeValue(root);
  
  function process(
    node: SunburstNode,
    depth: number,
    startAngle: number,
    endAngle: number,
    parent: ProcessedNode | null,
    parentColor: string | null,
    index: number,
    path: SunburstNode[]
  ): ProcessedNode {
    const value = calculateNodeValue(node);
    const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
    const color = getNodeColor(node, depth, index, parentColor, colorScheme);
    
    const processed: ProcessedNode = {
      node,
      depth,
      startAngle,
      endAngle,
      value,
      percentage,
      color,
      parent,
      children: [],
      path: [...path, node],
    };
    
    result.push(processed);
    
    // Process children
    if (node.children && node.children.length > 0) {
      let currentAngle = startAngle;
      const angleRange = endAngle - startAngle;
      
      node.children.forEach((child, childIndex) => {
        const childValue = calculateNodeValue(child);
        const childAngleRange = value > 0 ? (childValue / value) * angleRange : 0;
        const childEndAngle = currentAngle + childAngleRange;
        
        const processedChild = process(
          child,
          depth + 1,
          currentAngle,
          childEndAngle,
          processed,
          color,
          childIndex,
          processed.path
        );
        
        processed.children.push(processedChild);
        currentAngle = childEndAngle;
      });
    }
    
    return processed;
  }
  
  // If zoomed, only process from zoom root
  const startNode = zoomRoot ? zoomRoot.node : root;
  const startPath = zoomRoot ? zoomRoot.path.slice(0, -1) : [];
  
  process(startNode, 0, 0, 360, null, null, 0, startPath);
  
  return result;
}

// Convert polar coordinates to cartesian
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Create SVG arc path
function describeArc(
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  // Handle full circle case
  const angleSpan = endAngle - startAngle;
  const isFullCircle = angleSpan >= 359.99;
  
  if (isFullCircle) {
    // Draw as two half circles to avoid SVG arc issues
    const halfAngle = startAngle + 180;
    return (
      describeArc(x, y, innerRadius, outerRadius, startAngle, halfAngle - 0.01) +
      ' ' +
      describeArc(x, y, innerRadius, outerRadius, halfAngle, endAngle - 0.01)
    );
  }
  
  const start1 = polarToCartesian(x, y, outerRadius, startAngle);
  const end1 = polarToCartesian(x, y, outerRadius, endAngle);
  const start2 = polarToCartesian(x, y, innerRadius, endAngle);
  const end2 = polarToCartesian(x, y, innerRadius, startAngle);
  
  const largeArcFlag = angleSpan > 180 ? 1 : 0;
  
  return [
    'M', start1.x, start1.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 1, end1.x, end1.y,
    'L', start2.x, start2.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 0, end2.x, end2.y,
    'Z',
  ].join(' ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip Component
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipProps {
  data: TooltipData;
}

const Tooltip = ({ data }: TooltipProps) => {
  const { node } = data;
  const parentName = node.parent?.node.name || 'Portfolio';
  
  // Use fixed position relative to viewport
  const tooltipX = data.x;
  const tooltipY = data.y;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="fixed z-50 pointer-events-none"
      style={{
        left: tooltipX + 15,
        top: tooltipY - 10,
      }}
    >
      <div className="bg-[#1a1a24] border border-white/20 rounded-xl p-4 shadow-2xl min-w-[200px]">
        {/* Parent context */}
        <div className="text-xs text-gray-500 mb-1">{parentName}</div>
        
        {/* Name with color indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: node.color }}
          />
          <span className="text-white font-semibold text-lg">{node.node.name}</span>
        </div>
        
        {/* Stats */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Value:</span>
            <span className="text-white font-medium">{formatCurrency(node.value)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Allocation:</span>
            <span className="text-amber-400 font-medium">{formatPercent(node.percentage)}</span>
          </div>
          {node.depth > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Level:</span>
              <span className="text-gray-300">
                {node.depth === 1 ? 'Asset Class' : node.depth === 2 ? 'Sector' : 'Holding'}
              </span>
            </div>
          )}
        </div>
        
        {/* Drill hint */}
        {node.children.length > 0 && (
          <div className="mt-3 pt-2 border-t border-white/10 text-xs text-amber-400 flex items-center gap-1">
            <span>Click to zoom in</span>
            <span className="text-amber-400/60">→</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb Component
// ─────────────────────────────────────────────────────────────────────────────

interface BreadcrumbProps {
  path: SunburstNode[];
  onNavigate: (index: number) => void;
}

const Breadcrumb = ({ path, onNavigate }: BreadcrumbProps) => {
  return (
    <div className="flex items-center gap-1 text-sm mb-4 flex-wrap">
      {path.map((node, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <span className="text-gray-600 px-1">›</span>}
          <button
            onClick={() => onNavigate(index)}
            className={`px-3 py-2 rounded-lg transition-all min-h-[48px] min-w-[48px] flex items-center justify-center ${
              index === path.length - 1
                ? 'bg-amber-500/20 text-amber-400 font-medium cursor-default'
                : 'text-gray-400 hover:text-white hover:bg-white/10 active:bg-white/20'
            }`}
            disabled={index === path.length - 1}
          >
            {node.name}
          </button>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Arc Segment Component
// ─────────────────────────────────────────────────────────────────────────────

interface ArcSegmentProps {
  node: ProcessedNode;
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
  isHovered: boolean;
  isZoomRoot: boolean;
  onClick: () => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
}

const ArcSegment = ({
  node,
  centerX,
  centerY,
  innerRadius,
  outerRadius,
  isHovered,
  isZoomRoot,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
}: ArcSegmentProps) => {
  const angleSpan = node.endAngle - node.startAngle;
  
  // Skip very small segments (less than 1 degree)
  if (angleSpan < 1) return null;
  
  // Calculate expanded radius for hover effect
  const expandAmount = isHovered ? 8 : 0;
  const actualOuterRadius = outerRadius + expandAmount;
  
  const path = describeArc(
    centerX,
    centerY,
    innerRadius,
    actualOuterRadius,
    node.startAngle,
    node.endAngle
  );
  
  return (
    <motion.path
      d={path}
      fill={node.color}
      stroke={isZoomRoot ? '#F59E0B' : isHovered ? '#fff' : 'rgba(0,0,0,0.3)'}
      strokeWidth={isZoomRoot ? 3 : isHovered ? 2 : 1}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ 
        duration: 0.4, 
        ease: 'easeOut',
        delay: node.depth * 0.05,
      }}
      style={{ 
        cursor: node.children.length > 0 ? 'pointer' : 'default',
        transformOrigin: `${centerX}px ${centerY}px`,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Center Display Component
// ─────────────────────────────────────────────────────────────────────────────

interface CenterDisplayProps {
  currentNode: ProcessedNode | null;
  rootValue: number;
  hoveredNode: ProcessedNode | null;
  onZoomOut: () => void;
  canZoomOut: boolean;
}

const CenterDisplay = ({ 
  currentNode, 
  rootValue, 
  hoveredNode, 
  onZoomOut,
  canZoomOut,
}: CenterDisplayProps) => {
  const displayNode = hoveredNode || currentNode;
  const name = displayNode?.node.name || 'Portfolio';
  const value = displayNode?.value || rootValue;
  const percentage = displayNode?.percentage;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div 
        className="text-center"
        key={name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-lg font-bold text-white truncate max-w-[140px] px-2">
          {name}
        </div>
        <div className="text-2xl font-bold text-amber-400 mt-1">
          {formatCurrency(value)}
        </div>
        {percentage !== undefined && percentage < 100 && (
          <div className="text-gray-400 text-sm mt-1">
            {formatPercent(percentage)} of total
          </div>
        )}
        {canZoomOut && (
          <button
            onClick={onZoomOut}
            className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg text-sm transition-colors pointer-events-auto min-h-[44px] min-w-[44px]"
          >
            ← Zoom Out
          </button>
        )}
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Sunburst Chart Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SunburstChart({
  data,
  width = 400,
  height = 400,
  onSelect,
  colorScheme = 'default',
  showBreadcrumb = true,
  showTooltip = true,
  className = '',
}: SunburstChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<ProcessedNode | null>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [zoomPath, setZoomPath] = useState<ProcessedNode[]>([]);
  
  // Get the current zoom root
  const zoomRoot = zoomPath.length > 0 ? zoomPath[zoomPath.length - 1] : null;
  
  // Get color scheme array
  const colors = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.default;
  
  // Process the hierarchy
  const allNodes = useMemo(() => {
    return processHierarchy(data, colors, zoomRoot);
  }, [data, colors, zoomRoot]);
  
  // Filter nodes by depth (show 3 levels max from zoom root)
  const visibleNodes = useMemo(() => {
    const baseDepth = zoomRoot ? 0 : 0;
    return allNodes.filter(n => n.depth >= baseDepth && n.depth <= baseDepth + 3 && n.depth > 0);
  }, [allNodes, zoomRoot]);
  
  // Calculate dimensions
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2 - 20;
  const ringWidth = maxRadius / 4; // Divide into rings
  
  // Get radius for a given depth
  const getRadii = useCallback((depth: number) => {
    const baseDepth = 0;
    const relativeDepth = depth - baseDepth;
    const innerRadius = (relativeDepth) * ringWidth + 50; // 50px center hole
    const outerRadius = innerRadius + ringWidth - 4; // 4px gap between rings
    return { innerRadius, outerRadius };
  }, [ringWidth]);
  
  // Build breadcrumb path
  const breadcrumbPath = useMemo(() => {
    const path: SunburstNode[] = [data];
    zoomPath.forEach(node => {
      path.push(node.node);
    });
    return path;
  }, [data, zoomPath]);
  
  // Handle segment click
  const handleSegmentClick = useCallback((node: ProcessedNode) => {
    if (node.children.length > 0) {
      setZoomPath(prev => [...prev, node]);
      onSelect?.(node.node, node.path);
    }
  }, [onSelect]);
  
  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = useCallback((index: number) => {
    if (index === 0) {
      setZoomPath([]);
      onSelect?.(null, [data]);
    } else {
      setZoomPath(prev => prev.slice(0, index));
      const newRoot = zoomPath[index - 1];
      onSelect?.(newRoot?.node || null, newRoot?.path || [data]);
    }
  }, [data, zoomPath, onSelect]);
  
  // Handle zoom out from center
  const handleZoomOut = useCallback(() => {
    if (zoomPath.length > 0) {
      const newPath = zoomPath.slice(0, -1);
      setZoomPath(newPath);
      const newRoot = newPath[newPath.length - 1];
      onSelect?.(newRoot?.node || null, newRoot?.path || [data]);
    }
  }, [zoomPath, data, onSelect]);
  
  // Handle mouse events
  const handleMouseEnter = useCallback((node: ProcessedNode, e: React.MouseEvent) => {
    setHoveredNode(node);
    if (showTooltip) {
      setTooltipData({ node, x: e.clientX, y: e.clientY });
    }
  }, [showTooltip]);
  
  const handleMouseMove = useCallback((node: ProcessedNode, e: React.MouseEvent) => {
    if (showTooltip && tooltipData) {
      setTooltipData({ node, x: e.clientX, y: e.clientY });
    }
  }, [showTooltip, tooltipData]);
  
  const handleMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setTooltipData(null);
  }, []);
  
  // Root value for center display
  const rootValue = useMemo(() => calculateNodeValue(data), [data]);
  
  // Current zoom node for center display
  const currentZoomNode = zoomPath.length > 0 ? zoomPath[zoomPath.length - 1] : null;
  
  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Breadcrumb */}
      {showBreadcrumb && breadcrumbPath.length > 1 && (
        <Breadcrumb path={breadcrumbPath} onNavigate={handleBreadcrumbNavigate} />
      )}
      
      {/* Chart */}
      <div className="relative" style={{ width, height }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          <AnimatePresence mode="wait">
            {visibleNodes.map((node, index) => {
              const { innerRadius, outerRadius } = getRadii(node.depth);
              const isHovered = hoveredNode === node;
              const isZoomRoot = zoomRoot === node;
              
              return (
                <ArcSegment
                  key={`${node.node.name}-${node.depth}-${node.startAngle}-${index}`}
                  node={node}
                  centerX={centerX}
                  centerY={centerY}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  isHovered={isHovered}
                  isZoomRoot={isZoomRoot}
                  onClick={() => handleSegmentClick(node)}
                  onMouseEnter={(e) => handleMouseEnter(node, e)}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={(e) => handleMouseMove(node, e)}
                />
              );
            })}
          </AnimatePresence>
        </svg>
        
        {/* Center Display */}
        <CenterDisplay
          currentNode={currentZoomNode}
          rootValue={rootValue}
          hoveredNode={hoveredNode}
          onZoomOut={handleZoomOut}
          canZoomOut={zoomPath.length > 0}
        />
      </div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && tooltipData && (
          <Tooltip data={tooltipData} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data Export (for testing)
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_PORTFOLIO_DATA: SunburstNode = {
  name: 'Portfolio',
  children: [
    {
      name: 'Equities',
      children: [
        {
          name: 'US Large Cap',
          children: [
            { name: 'VTI', value: 300000 },
            { name: 'AAPL', value: 100000 },
          ],
        },
        {
          name: 'International',
          children: [
            { name: 'VXUS', value: 475000 },
          ],
        },
      ],
    },
    {
      name: 'Fixed Income',
      children: [
        {
          name: 'Bonds',
          children: [
            { name: 'BND', value: 375000 },
          ],
        },
      ],
    },
  ],
};
