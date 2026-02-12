'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface DivergenceResult {
  symbol: string;
  name?: string;
  socialSentiment: {
    direction: 'bullish' | 'bearish' | 'neutral';
    score: number;
    confidence: number;
    twitterMentions?: number;
    redditMentions?: number;
    trending?: boolean;
  };
  analystConsensus: {
    direction: 'bullish' | 'bearish' | 'neutral';
    score: number;
    rating: string;
    targetUpside: number;
    numberOfAnalysts: number;
  };
  divergence: {
    exists: boolean;
    type: 'social_bullish_analyst_bearish' | 'social_bearish_analyst_bullish' | 'aligned' | 'neutral';
    magnitude: number;
    severity: 'major' | 'moderate' | 'minor' | 'none';
    description: string;
    hypothesis: string;
    confidence: number;
  };
  portfolioWeight?: number;
  portfolioImpact?: number;
  timestamp: string;
}

interface ScanResult {
  timestamp: string;
  symbolsScanned: number;
  divergencesFound: number;
  results: DivergenceResult[];
  majorDivergences: DivergenceResult[];
  socialLeading: DivergenceResult[];
  analystsLeading: DivergenceResult[];
  portfolioSummary?: {
    avgDivergence: number;
    riskLevel: 'high' | 'moderate' | 'low';
    topConcerns: string[];
  };
}

interface DivergenceScannerProps {
  symbols?: string[];
  holdings?: Array<{ symbol: string; value: number }>;
  onDivergenceFound?: (divergences: DivergenceResult[]) => void;
  compact?: boolean;
  showOnlyDivergent?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function DirectionBadge({ direction, score }: { direction: 'bullish' | 'bearish' | 'neutral'; score: number }) {
  const colors = {
    bullish: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    bearish: 'bg-red-500/10 text-red-400 border-red-500/20',
    neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  
  const emoji = {
    bullish: '🟢',
    bearish: '🔴',
    neutral: '⚪',
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[direction]}`}>
      <span>{emoji[direction]}</span>
      <span className="capitalize">{direction}</span>
      <span className="opacity-60">({score > 0 ? '+' : ''}{score.toFixed(2)})</span>
    </span>
  );
}

function SeverityBadge({ severity }: { severity: 'major' | 'moderate' | 'minor' | 'none' }) {
  const styles = {
    major: 'bg-red-500/20 text-red-400 border-red-500/30',
    moderate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    minor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    none: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  };
  
  const icons = {
    major: '⚠️',
    moderate: '🔔',
    minor: '💡',
    none: '✓',
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[severity]}`}>
      <span>{icons[severity]}</span>
      <span className="capitalize">{severity === 'none' ? 'Aligned' : severity}</span>
    </span>
  );
}

function DivergenceBar({ socialScore, analystScore }: { socialScore: number; analystScore: number }) {
  // Convert -1 to 1 scores to 0-100 positions
  const socialPos = ((socialScore + 1) / 2) * 100;
  const analystPos = ((analystScore + 1) / 2) * 100;
  
  return (
    <div className="relative h-6 bg-slate-800 rounded-lg overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-gradient-to-r from-red-900/30 to-transparent" />
        <div className="w-1/2 bg-gradient-to-l from-emerald-900/30 to-transparent" />
      </div>
      
      {/* Center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600" />
      
      {/* Labels */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-red-400/60">Bearish</div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400/60">Bullish</div>
      
      {/* Social marker */}
      <div 
        className="absolute top-1 h-4 w-4 -ml-2 rounded-full bg-purple-500 border-2 border-white shadow-lg flex items-center justify-center"
        style={{ left: `${socialPos}%` }}
        title={`Social: ${socialScore.toFixed(2)}`}
      >
        <span className="text-[8px]">S</span>
      </div>
      
      {/* Analyst marker */}
      <div 
        className="absolute top-1 h-4 w-4 -ml-2 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center"
        style={{ left: `${analystPos}%` }}
        title={`Analyst: ${analystScore.toFixed(2)}`}
      >
        <span className="text-[8px]">A</span>
      </div>
    </div>
  );
}

function DivergenceCard({ result, compact }: { result: DivergenceResult; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  
  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${
        result.divergence.severity === 'major' ? 'bg-red-500/5 border-red-500/20' :
        result.divergence.severity === 'moderate' ? 'bg-amber-500/5 border-amber-500/20' :
        'bg-slate-800/50 border-slate-700/50'
      }`}>
        <div className="flex items-center gap-3">
          <div className="font-mono font-bold text-sm">{result.symbol}</div>
          <SeverityBadge severity={result.divergence.severity} />
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-purple-400">S:</span>
            <span className={result.socialSentiment.direction === 'bullish' ? 'text-emerald-400' : result.socialSentiment.direction === 'bearish' ? 'text-red-400' : 'text-slate-400'}>
              {result.socialSentiment.score > 0 ? '+' : ''}{result.socialSentiment.score.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-400">A:</span>
            <span className={result.analystConsensus.direction === 'bullish' ? 'text-emerald-400' : result.analystConsensus.direction === 'bearish' ? 'text-red-400' : 'text-slate-400'}>
              {result.analystConsensus.score > 0 ? '+' : ''}{result.analystConsensus.score.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      result.divergence.severity === 'major' ? 'bg-red-500/5 border-red-500/20' :
      result.divergence.severity === 'moderate' ? 'bg-amber-500/5 border-amber-500/20' :
      'bg-slate-800/50 border-slate-700/50'
    }`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="font-mono font-bold text-lg">{result.symbol}</div>
            {result.name && result.name !== result.symbol && (
              <div className="text-xs text-slate-400 truncate max-w-[200px]">{result.name}</div>
            )}
          </div>
          <SeverityBadge severity={result.divergence.severity} />
        </div>
        
        <div className="flex items-center gap-4">
          {result.portfolioWeight !== undefined && (
            <div className="text-xs text-slate-400">
              {(result.portfolioWeight * 100).toFixed(1)}% of portfolio
            </div>
          )}
          <svg 
            className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Divergence Bar */}
      <div className="px-4 pb-4">
        <DivergenceBar 
          socialScore={result.socialSentiment.score} 
          analystScore={result.analystConsensus.score} 
        />
        <div className="flex justify-between mt-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-slate-400">Social</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-400">Analysts</span>
          </div>
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-700/50 p-4 space-y-4">
          {/* Social vs Analyst */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-xs text-purple-400 mb-2 font-medium">📱 Social Sentiment</div>
              <DirectionBadge direction={result.socialSentiment.direction} score={result.socialSentiment.score} />
              <div className="mt-2 text-xs text-slate-400 space-y-1">
                {result.socialSentiment.twitterMentions !== undefined && (
                  <div>🐦 {result.socialSentiment.twitterMentions.toLocaleString()} mentions</div>
                )}
                {result.socialSentiment.redditMentions !== undefined && (
                  <div>🤖 {result.socialSentiment.redditMentions.toLocaleString()} mentions</div>
                )}
                {result.socialSentiment.trending && (
                  <div className="text-amber-400">🔥 Trending</div>
                )}
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-xs text-blue-400 mb-2 font-medium">📊 Analyst Consensus</div>
              <DirectionBadge direction={result.analystConsensus.direction} score={result.analystConsensus.score} />
              <div className="mt-2 text-xs text-slate-400 space-y-1">
                <div>Rating: <span className="text-white capitalize">{result.analystConsensus.rating}</span></div>
                <div>Target: <span className={result.analystConsensus.targetUpside > 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {result.analystConsensus.targetUpside > 0 ? '+' : ''}{result.analystConsensus.targetUpside.toFixed(1)}%
                </span></div>
                <div>Analysts: {result.analystConsensus.numberOfAnalysts}</div>
              </div>
            </div>
          </div>
          
          {/* Analysis */}
          <div className="p-3 rounded-lg bg-slate-700/30">
            <div className="text-xs font-medium text-slate-300 mb-2">🔍 Analysis</div>
            <p className="text-sm text-slate-300">{result.divergence.description}</p>
            <p className="text-xs text-slate-400 mt-2 italic">{result.divergence.hypothesis}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ result }: { result: ScanResult }) {
  if (!result.portfolioSummary) return null;
  
  const riskColors = {
    high: 'from-red-500/20 to-red-500/5 border-red-500/30',
    moderate: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    low: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  };
  
  const riskEmoji = {
    high: '🔴',
    moderate: '🟡',
    low: '🟢',
  };
  
  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br border ${riskColors[result.portfolioSummary.riskLevel]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-white">Portfolio Divergence Risk</div>
        <div className="flex items-center gap-1">
          <span>{riskEmoji[result.portfolioSummary.riskLevel]}</span>
          <span className="text-sm font-medium capitalize">{result.portfolioSummary.riskLevel}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold">{result.symbolsScanned}</div>
          <div className="text-xs text-slate-400">Scanned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">{result.divergencesFound}</div>
          <div className="text-xs text-slate-400">Divergent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{result.majorDivergences.length}</div>
          <div className="text-xs text-slate-400">Major</div>
        </div>
      </div>
      
      {result.portfolioSummary.topConcerns.length > 0 && (
        <div className="border-t border-slate-700/50 pt-3 mt-3">
          <div className="text-xs text-slate-400 mb-2">Key Findings:</div>
          <ul className="space-y-1">
            {result.portfolioSummary.topConcerns.map((concern, i) => (
              <li key={i} className="text-xs text-slate-300">• {concern}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DivergenceScanner({
  symbols,
  holdings,
  onDivergenceFound,
  compact = false,
  showOnlyDivergent = false,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
  className = '',
}: DivergenceScannerProps) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const fetchDivergence = useCallback(async () => {
    if (!symbols?.length && !holdings?.length) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (holdings && holdings.length > 0) {
        // POST with holdings for portfolio weighting
        response = await fetch('/api/athena/divergence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ holdings }),
        });
      } else if (symbols && symbols.length > 0) {
        // GET with symbols
        response = await fetch(`/api/athena/divergence?symbols=${symbols.join(',')}`);
      } else {
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch divergence data');
      }
      
      const data: ScanResult = await response.json();
      setResult(data);
      setLastUpdated(new Date());
      
      // Callback for divergences
      if (onDivergenceFound && data.divergencesFound > 0) {
        onDivergenceFound(data.results.filter(r => r.divergence.exists));
      }
      
    } catch (err) {
      console.error('Divergence fetch error:', err);
      setError('Unable to scan for divergences');
    } finally {
      setLoading(false);
    }
  }, [symbols, holdings, onDivergenceFound]);
  
  // Initial fetch
  useEffect(() => {
    fetchDivergence();
  }, [fetchDivergence]);
  
  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchDivergence, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDivergence]);
  
  // Filter results if needed
  const displayResults = result?.results.filter(
    r => !showOnlyDivergent || r.divergence.exists
  ) ?? [];
  
  if (!symbols?.length && !holdings?.length) {
    return (
      <div className={`p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 ${className}`}>
        <div className="text-sm text-slate-400 text-center">
          No symbols to scan. Provide symbols or holdings.
        </div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🔀 Divergence Scanner
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Where social sentiment disagrees with analysts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-slate-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchDivergence}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-colors"
            title="Refresh"
          >
            <svg 
              className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Loading */}
      {loading && !result && (
        <div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm text-slate-400">Scanning for divergences...</div>
          </div>
        </div>
      )}
      
      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {/* Results */}
      {result && (
        <>
          {/* Portfolio Summary */}
          {result.portfolioSummary && <SummaryCard result={result} />}
          
          {/* No divergences */}
          {displayResults.length === 0 && (
            <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-emerald-400 font-medium">No Significant Divergences</div>
              <div className="text-xs text-slate-400 mt-1">
                Social sentiment and analyst consensus are aligned
              </div>
            </div>
          )}
          
          {/* Divergence Cards */}
          {displayResults.length > 0 && (
            <div className={compact ? 'space-y-2' : 'space-y-3'}>
              {displayResults.map(r => (
                <DivergenceCard key={r.symbol} result={r} compact={compact} />
              ))}
            </div>
          )}
          
          {/* Legend */}
          {!compact && displayResults.length > 0 && (
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-700/50">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <span>Social (Twitter + Reddit)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Wall Street Analysts</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span>⚠️ Major</span>
                <span>🔔 Moderate</span>
                <span>💡 Minor</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
