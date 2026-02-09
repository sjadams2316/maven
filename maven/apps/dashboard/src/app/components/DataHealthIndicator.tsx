'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * DataHealthIndicator Component
 * 
 * Shows green/yellow/red status indicator for data source health.
 * Only visible when there's an issue (doesn't clutter when healthy).
 * Shows tooltip with details on hover.
 * 
 * @author Pantheon Infrastructure Team
 * @version 1.0.0
 */

type OverallStatus = 'healthy' | 'degraded' | 'down' | 'loading' | 'error';

interface SourceHealth {
  status: 'up' | 'degraded' | 'down';
  latencyMs: number;
  lastCheck: string;
  errorCount: number;
  lastError?: string;
  responseValid: boolean;
}

interface HealthData {
  status: OverallStatus;
  sources: {
    yahoo: SourceHealth;
    coingecko: SourceHealth;
    fred: SourceHealth;
    fmp: SourceHealth;
  };
  staleData: string[];
  errors: string[];
  timestamp: string;
  checkDurationMs: number;
}

// Status colors
const STATUS_COLORS: Record<OverallStatus, string> = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  down: 'bg-red-500',
  loading: 'bg-gray-500',
  error: 'bg-red-500',
};

const STATUS_RING_COLORS: Record<OverallStatus, string> = {
  healthy: 'ring-emerald-500/30',
  degraded: 'ring-amber-500/30',
  down: 'ring-red-500/30',
  loading: 'ring-gray-500/30',
  error: 'ring-red-500/30',
};

const STATUS_TEXT: Record<OverallStatus, string> = {
  healthy: 'All data sources operational',
  degraded: 'Using backup data sources',
  down: 'Data services unavailable',
  loading: 'Checking data sources...',
  error: 'Unable to check data sources',
};

// Source display names
const SOURCE_NAMES: Record<string, string> = {
  yahoo: 'Yahoo Finance',
  coingecko: 'CoinGecko',
  fred: 'FRED (Economic)',
  fmp: 'FMP (Fundamentals)',
};

interface DataHealthIndicatorProps {
  /** Show even when healthy (default: false - hide when healthy) */
  showWhenHealthy?: boolean;
  /** Refresh interval in milliseconds (default: 5 minutes) */
  refreshInterval?: number;
  /** Compact mode - just the dot, no text */
  compact?: boolean;
}

export default function DataHealthIndicator({
  showWhenHealthy = false,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  compact = false,
}: DataHealthIndicatorProps) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [status, setStatus] = useState<OverallStatus>('loading');
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastFetchError, setLastFetchError] = useState<string | null>(null);
  
  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/data-health', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data: HealthData = await response.json();
      setHealth(data);
      setStatus(data.status as OverallStatus);
      setLastFetchError(null);
    } catch (error) {
      console.error('[DataHealthIndicator] Fetch error:', error);
      setStatus('error');
      setLastFetchError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);
  
  // Initial fetch and interval
  useEffect(() => {
    fetchHealth();
    
    const interval = setInterval(fetchHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchHealth, refreshInterval]);
  
  // Don't render if healthy and showWhenHealthy is false
  if (status === 'healthy' && !showWhenHealthy) {
    return null;
  }
  
  // Don't render during initial load
  if (status === 'loading' && !health) {
    return null;
  }
  
  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };
  
  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getSourceStatusIcon = (sourceStatus: 'up' | 'degraded' | 'down') => {
    switch (sourceStatus) {
      case 'up':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'down':
        return '✕';
    }
  };
  
  const getSourceStatusColor = (sourceStatus: 'up' | 'degraded' | 'down') => {
    switch (sourceStatus) {
      case 'up':
        return 'text-emerald-400';
      case 'degraded':
        return 'text-amber-400';
      case 'down':
        return 'text-red-400';
    }
  };
  
  return (
    <div className="relative inline-block">
      {/* Main indicator */}
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`
          flex items-center gap-2 px-2 py-1 rounded-lg
          ${status !== 'healthy' ? 'bg-white/5 border border-white/10' : ''}
          transition-all duration-200 hover:bg-white/10
          focus:outline-none focus:ring-2 focus:ring-white/20
        `}
        aria-label={STATUS_TEXT[status]}
      >
        {/* Status dot */}
        <span
          className={`
            w-2 h-2 rounded-full ${STATUS_COLORS[status]}
            ring-4 ${STATUS_RING_COLORS[status]}
            ${status === 'loading' ? 'animate-pulse' : ''}
          `}
        />
        
        {/* Status text (non-compact mode) - only show for down/error states */}
        {!compact && (status === 'down' || status === 'error') && (
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {status === 'down' && 'Data unavailable'}
            {status === 'error' && 'Check failed'}
          </span>
        )}
      </button>
      
      {/* Tooltip */}
      {showTooltip && (
        <div
          className="
            absolute top-full right-0 mt-2 z-50
            w-72 sm:w-80 p-3 rounded-xl
            bg-gray-900/95 backdrop-blur-xl
            border border-white/10 shadow-xl
            animate-in fade-in slide-in-from-top-2 duration-200
          "
          role="tooltip"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <span className="text-sm font-medium text-white">
              Data Source Health
            </span>
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                ${status === 'degraded' ? 'bg-gray-500/20 text-gray-400' : ''}
                ${status === 'down' || status === 'error' ? 'bg-red-500/20 text-red-400' : ''}
                ${status === 'loading' ? 'bg-gray-500/20 text-gray-400' : ''}
              `}
            >
              {status === 'degraded' ? 'Partial' : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          
          {/* Degraded state - reassuring message */}
          {status === 'degraded' && (
            <div className="text-sm text-gray-400 mb-3">
              Some sources are slow or unavailable, but your data is loading normally from backup sources.
            </div>
          )}
          
          {/* Error state */}
          {status === 'error' && (
            <div className="text-sm text-red-400 mb-3">
              Unable to check data sources
              {lastFetchError && (
                <span className="block text-xs text-gray-500 mt-1">
                  {lastFetchError}
                </span>
              )}
            </div>
          )}
          
          {/* Source list */}
          {health && (
            <div className="space-y-2">
              {Object.entries(health.sources).map(([key, source]) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`${getSourceStatusColor(source.status)}`}>
                      {getSourceStatusIcon(source.status)}
                    </span>
                    <span className="text-gray-300">
                      {SOURCE_NAMES[key] || key}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    {source.status === 'up' && (
                      <span>{formatLatency(source.latencyMs)}</span>
                    )}
                    {source.status === 'degraded' && (
                      <span className="text-amber-500">slow</span>
                    )}
                    {source.status === 'down' && (
                      <span className="text-gray-500">offline</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Stale data warning */}
          {health?.staleData && health.staleData.length > 0 && (
            <div className="mt-3 pt-2 border-t border-white/10">
              <div className="text-xs text-amber-400 flex items-center gap-1">
                <span>⚠</span>
                <span>
                  Stale data: {health.staleData.join(', ')}
                </span>
              </div>
            </div>
          )}
          
          {/* Error list */}
          {health?.errors && health.errors.length > 0 && (
            <div className="mt-3 pt-2 border-t border-white/10 space-y-1">
              {health.errors.map((error, i) => (
                <div key={i} className="text-xs text-red-400">
                  • {error}
                </div>
              ))}
            </div>
          )}
          
          {/* Footer */}
          {health && (
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Last check: {formatTimestamp(health.timestamp)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchHealth();
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
