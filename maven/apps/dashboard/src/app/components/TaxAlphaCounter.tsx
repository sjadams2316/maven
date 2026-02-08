'use client';

/**
 * Tax Alpha Counter
 * 
 * The hero metric - shows users exactly how much Maven has saved them.
 * 
 * ITERATION NOTES:
 * v1: Just show a number
 * v1.1: Show realized vs potential breakdown
 * v1.2: Expandable history with calculation transparency
 * v1.3: Action buttons for potential opportunities
 * v1.4: Animated counter for satisfying UX
 * v1.5: Year-to-date vs lifetime toggle
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaxAlphaEvent {
  id: string;
  type: string;
  status: string;
  ticker?: string;
  description: string;
  amount: number;
  taxSaved: number;
  federalRate: number;
  stateRate: number;
  rateType: string;
  calculation?: {
    calculation: string;
    federalBracket: string;
    stateNote: string;
    niitApplies: boolean;
  };
  identifiedAt: string;
  expiresAt?: string;
  realizedAt?: string;
}

interface TaxAlphaSummary {
  realizedTotal: number;
  realizedCount: number;
  potentialTotal: number;
  potentialCount: number;
  totalIdentified: number;
  byType: Record<string, number>;
}

interface TaxAlphaCounterProps {
  compact?: boolean;
  className?: string;
}

// Type labels and icons
const TYPE_INFO: Record<string, { label: string; icon: string; color: string }> = {
  LOSS_HARVEST: { label: 'Tax-Loss Harvest', icon: '📉', color: 'text-red-400' },
  ROTH_CONVERSION: { label: 'Roth Conversion', icon: '🔄', color: 'text-purple-400' },
  ASSET_LOCATION: { label: 'Asset Location', icon: '📍', color: 'text-blue-400' },
  GAIN_DEFERRAL: { label: 'Gain Deferral', icon: '⏳', color: 'text-yellow-400' },
  WASH_SALE_AVOIDED: { label: 'Wash Sale Avoided', icon: '🛡️', color: 'text-green-400' },
};

// Animated number component
function AnimatedNumber({ value, prefix = '$' }: { value: number; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500; // ms
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString(undefined, { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })}
    </span>
  );
}

export default function TaxAlphaCounter({ compact = false, className = '' }: TaxAlphaCounterProps) {
  const [summary, setSummary] = useState<TaxAlphaSummary | null>(null);
  const [events, setEvents] = useState<TaxAlphaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TaxAlphaEvent | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<{ newEvents: number; warnings: string[] } | null>(null);

  useEffect(() => {
    fetchTaxAlpha();
    // Auto-scan on mount (but don't block UI)
    runScan(false);
  }, []);

  async function fetchTaxAlpha() {
    try {
      const res = await fetch('/api/tax-alpha');
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch tax alpha:', error);
    } finally {
      setLoading(false);
    }
  }

  async function runScan(showLoading = true) {
    if (showLoading) setScanning(true);
    try {
      const res = await fetch('/api/tax-alpha/scan', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLastScanResult({
          newEvents: data.newEventsCreated,
          warnings: data.warnings || [],
        });
        // Refresh the events list
        await fetchTaxAlpha();
      }
    } catch (error) {
      console.error('Failed to run tax scan:', error);
    } finally {
      setScanning(false);
    }
  }

  async function markAsRealized(eventId: string) {
    try {
      const res = await fetch('/api/tax-alpha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, status: 'realized' }),
      });
      if (res.ok) {
        fetchTaxAlpha();
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  }

  async function dismissEvent(eventId: string) {
    try {
      const res = await fetch('/api/tax-alpha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, status: 'dismissed' }),
      });
      if (res.ok) {
        fetchTaxAlpha();
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Failed to dismiss event:', error);
    }
  }

  // Compact mode - just the counter
  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 rounded-lg p-4 border border-emerald-700/30 ${className}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-emerald-400 text-xl">💰</span>
          <span className="text-emerald-400 text-sm font-medium">Tax Alpha</span>
        </div>
        {loading ? (
          <div className="h-8 bg-emerald-900/50 rounded animate-pulse" />
        ) : (
          <div className="text-2xl font-bold text-white">
            <AnimatedNumber value={summary?.realizedTotal || 0} />
            {summary && summary.potentialTotal > 0 && (
              <span className="text-sm font-normal text-emerald-400 ml-2">
                +${summary.potentialTotal.toLocaleString()} potential
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full mode
  return (
    <div className={`bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 p-6 border-b border-emerald-700/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <h2 className="text-xl font-bold text-white">Tax Alpha Counter™</h2>
              <p className="text-emerald-400 text-sm">Money Maven saved you</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => runScan(true)}
              disabled={scanning}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                scanning 
                  ? 'bg-emerald-900/50 text-emerald-400/50 cursor-wait'
                  : 'bg-emerald-800/50 hover:bg-emerald-700/50 text-emerald-300'
              }`}
            >
              {scanning ? '🔍 Scanning...' : '🔍 Scan Portfolio'}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {expanded ? '▲ Collapse' : '▼ Details'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-16 bg-emerald-900/50 rounded animate-pulse" />
        ) : (
          <div className="flex items-end gap-6">
            {/* Realized (main number) */}
            <div>
              <div className="text-5xl font-bold text-white tracking-tight">
                <AnimatedNumber value={summary?.realizedTotal || 0} />
              </div>
              <div className="text-emerald-400 text-sm mt-1">
                {summary?.realizedCount || 0} optimizations executed
              </div>
            </div>

            {/* Potential */}
            {summary && summary.potentialTotal > 0 && (
              <div className="border-l border-emerald-700/50 pl-6">
                <div className="text-2xl font-semibold text-yellow-400">
                  +${summary.potentialTotal.toLocaleString()}
                </div>
                <div className="text-yellow-400/70 text-sm">
                  {summary.potentialCount} opportunities waiting
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Scan Results Banner */}
            {lastScanResult && lastScanResult.newEvents > 0 && (
              <div className="p-4 border-b border-zinc-800 bg-emerald-900/20">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span>✨</span>
                  <span className="font-medium">Found {lastScanResult.newEvents} new harvesting opportunity{lastScanResult.newEvents > 1 ? 'ies' : 'y'}!</span>
                </div>
              </div>
            )}

            {/* Warnings */}
            {lastScanResult && lastScanResult.warnings.length > 0 && (
              <div className="p-4 border-b border-zinc-800 bg-yellow-900/10">
                {lastScanResult.warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-yellow-400 text-sm">
                    <span>⚠️</span>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Breakdown by type */}
            {summary && (
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Savings by Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(TYPE_INFO).map(([type, info]) => (
                    <div key={type} className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{info.icon}</span>
                        <span className={`text-xs ${info.color}`}>{info.label}</span>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        ${(summary.byType[type] || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event history */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Recent Activity</h3>
              {events.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <p>No tax optimization events yet.</p>
                  <p className="text-sm mt-1">Maven will identify opportunities as you add holdings.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {events.slice(0, 10).map((event) => {
                    const typeInfo = TYPE_INFO[event.type] || { label: event.type, icon: '📊', color: 'text-zinc-400' };
                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                        className={`
                          p-3 rounded-lg cursor-pointer transition-all
                          ${event.status === 'realized' 
                            ? 'bg-emerald-900/20 border border-emerald-700/30' 
                            : 'bg-yellow-900/20 border border-yellow-700/30'}
                          ${selectedEvent?.id === event.id ? 'ring-2 ring-white/20' : ''}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{typeInfo.icon}</span>
                            <div>
                              <div className="font-medium text-white">
                                {event.description}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {typeInfo.label} • {new Date(event.identifiedAt).toLocaleDateString()}
                                {event.status === 'realized' && event.realizedAt && (
                                  <span className="text-emerald-400"> • Executed {new Date(event.realizedAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${event.status === 'realized' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                              ${event.taxSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {event.status === 'realized' ? 'saved' : 'potential'}
                            </div>
                          </div>
                        </div>

                        {/* Expanded event details */}
                        <AnimatePresence>
                          {selectedEvent?.id === event.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-3 pt-3 border-t border-zinc-700"
                            >
                              {/* Calculation breakdown */}
                              {event.calculation && (
                                <div className="bg-zinc-800/50 rounded p-3 mb-3 text-sm">
                                  <div className="text-zinc-400 mb-1">Calculation:</div>
                                  <code className="text-emerald-400 text-xs">
                                    {event.calculation.calculation}
                                  </code>
                                  <div className="mt-2 text-xs text-zinc-500">
                                    {event.calculation.federalBracket} • {event.calculation.stateNote}
                                    {event.calculation.niitApplies && ' • NIIT applies'}
                                  </div>
                                </div>
                              )}

                              {/* Actions for potential events */}
                              {event.status === 'potential' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); markAsRealized(event.id); }}
                                    className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                                  >
                                    ✓ Mark as Executed
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); dismissEvent(event.id); }}
                                    className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg text-sm transition-colors"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
