'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Twitter, 
  MessageCircle, 
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Info,
  Zap,
  Brain,
  Activity,
} from 'lucide-react';

interface SourceData {
  sourceId: string;
  sourceName: string;
  category: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  value: number;
  weight: number;
  contribution: number;
}

interface Disagreement {
  source1: string;
  source2: string;
  description: string;
  severity: 'minor' | 'significant' | 'major';
}

interface Alert {
  type: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

interface SynthesisResult {
  symbol: string;
  timestamp: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  score: number;
  confidence: number;
  agreement: {
    level: 'strong' | 'moderate' | 'weak' | 'conflicting';
    score: number;
    description: string;
  };
  sources: SourceData[];
  disagreements: Disagreement[];
  summary: string;
  reasoning: string[];
  alerts: Alert[];
}

interface Props {
  symbol: string;
  onClose?: () => void;
  showHeader?: boolean;
}

export default function SignalConsensus({ symbol, onClose, showHeader = true }: Props) {
  const [data, setData] = useState<SynthesisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/athena/synthesize?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const json = await response.json();
      setData(json.result);
      setProviders(json.providers || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol]);

  // Helpers
  const getDirectionIcon = (direction: 'bullish' | 'bearish' | 'neutral', size = 'w-5 h-5') => {
    switch (direction) {
      case 'bullish':
        return <TrendingUp className={`${size} text-green-500`} />;
      case 'bearish':
        return <TrendingDown className={`${size} text-red-500`} />;
      default:
        return <Minus className={`${size} text-gray-400`} />;
    }
  };

  const getDirectionColor = (direction: 'bullish' | 'bearish' | 'neutral') => {
    switch (direction) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getAgreementColor = (level: string) => {
    switch (level) {
      case 'strong': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'moderate': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'weak': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'conflicting': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSourceIcon = (category: string) => {
    switch (category) {
      case 'sentiment': return <Twitter className="w-4 h-4" />;
      case 'trading': return <BarChart3 className="w-4 h-4" />;
      case 'forecast': return <Target className="w-4 h-4" />;
      case 'analyst': return <Activity className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'major': return 'bg-red-500/20 border-red-500/30 text-red-300';
      case 'significant': return 'bg-orange-500/20 border-orange-500/30 text-orange-300';
      default: return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
    }
  };

  const getAlertIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-400" />;
      default: return <Zap className="w-4 h-4 text-blue-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#12121a] rounded-2xl border border-white/10 p-8">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
          <span className="text-gray-400">Synthesizing intelligence for {symbol}...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#12121a] rounded-2xl border border-white/10 p-8">
        <div className="flex items-center justify-center gap-3 text-red-400">
          <XCircle className="w-5 h-5" />
          <span>Failed to load signal data</span>
        </div>
      </div>
    );
  }

  const scorePercent = ((data.score + 1) / 2) * 100; // Convert -1..1 to 0..100

  return (
    <div className="bg-[#12121a] rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      {showHeader && (
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {symbol}
                <span className="text-sm font-normal text-gray-400">Signal Consensus</span>
              </h2>
              <p className="text-xs text-gray-500">Powered by Athena • All intelligence sources</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Consensus Display */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Direction & Score */}
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-2xl ${
              data.direction === 'bullish' ? 'bg-green-500/20' :
              data.direction === 'bearish' ? 'bg-red-500/20' : 'bg-gray-500/20'
            }`}>
              {getDirectionIcon(data.direction, 'w-10 h-10')}
            </div>
            <div>
              <div className={`text-3xl font-bold ${getDirectionColor(data.direction)}`}>
                {data.direction.toUpperCase()}
              </div>
              <div className="text-gray-400 text-sm">
                Score: {data.score > 0 ? '+' : ''}{data.score.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Confidence & Agreement */}
          <div className="flex gap-6">
            {/* Confidence */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Math.round(data.confidence * 100)}%
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Confidence</div>
              <div className="mt-2 w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${data.confidence * 100}%` }}
                />
              </div>
            </div>

            {/* Agreement */}
            <div className="text-center">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getAgreementColor(data.agreement.level)}`}>
                {data.agreement.level}
              </div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Agreement</div>
              <div className="text-xs text-gray-400 mt-1">
                {Math.round(data.agreement.score * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Score Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Bearish</span>
            <span>Neutral</span>
            <span>Bullish</span>
          </div>
          <div className="h-3 bg-gradient-to-r from-red-500/30 via-gray-500/30 to-green-500/30 rounded-full relative">
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-purple-500 transition-all"
              style={{ left: `calc(${scorePercent}% - 8px)` }}
            />
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="p-6 border-b border-white/10">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Contributing Sources ({data.sources.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.sources.map((source) => (
            <div 
              key={source.sourceId}
              className={`p-4 rounded-xl border ${
                source.signal === 'bullish' ? 'bg-green-500/10 border-green-500/20' :
                source.signal === 'bearish' ? 'bg-red-500/10 border-red-500/20' :
                'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{getSourceIcon(source.category)}</span>
                  <span className="font-medium text-white text-sm">{source.sourceName}</span>
                </div>
                {getDirectionIcon(source.signal, 'w-4 h-4')}
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Signal</span>
                <span className={getDirectionColor(source.signal)}>
                  {source.value > 0 ? '+' : ''}{source.value.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Weight</span>
                <span className="text-gray-400">{Math.round(source.weight * 100)}%</span>
              </div>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    source.signal === 'bullish' ? 'bg-green-500' :
                    source.signal === 'bearish' ? 'bg-red-500' : 'bg-gray-500'
                  }`}
                  style={{ width: `${((source.value + 1) / 2) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {data.sources.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No active sources for this symbol</p>
          </div>
        )}
      </div>

      {/* Disagreements */}
      {data.disagreements.length > 0 && (
        <div className="p-6 border-b border-white/10">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Source Disagreements ({data.disagreements.length})
          </h3>
          <div className="space-y-2">
            {data.disagreements.map((d, i) => (
              <div 
                key={i}
                className={`p-3 rounded-lg border ${getSeverityColor(d.severity)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    d.severity === 'major' ? 'bg-red-500/30' :
                    d.severity === 'significant' ? 'bg-orange-500/30' : 'bg-yellow-500/30'
                  }`}>
                    {d.severity}
                  </span>
                  <span className="text-xs text-gray-400">
                    {d.source1} vs {d.source2}
                  </span>
                </div>
                <p className="text-sm">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="p-6 border-b border-white/10">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            Proactive Alerts ({data.alerts.length})
          </h3>
          <div className="space-y-2">
            {data.alerts.map((alert, i) => (
              <div 
                key={i}
                className={`p-3 rounded-lg flex items-start gap-3 ${
                  alert.priority === 'high' ? 'bg-red-500/10 border border-red-500/20' :
                  alert.priority === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                  'bg-blue-500/10 border border-blue-500/20'
                }`}
              >
                {getAlertIcon(alert.priority)}
                <span className="text-sm text-gray-200">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning */}
      <div className="p-6 border-b border-white/10">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          Analysis Reasoning
        </h3>
        <ul className="space-y-2">
          {data.reasoning.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer - Provider Status */}
      <div className="px-6 py-4 bg-white/5 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Sources:</span>
          {Object.entries(providers).map(([name, active]) => (
            <span key={name} className={`flex items-center gap-1 ${active ? 'text-green-400' : 'text-gray-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-gray-600'}`} />
              {name}
            </span>
          ))}
        </div>
        <span>Updated {new Date(data.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
