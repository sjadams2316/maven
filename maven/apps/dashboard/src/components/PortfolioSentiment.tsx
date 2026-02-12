'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Twitter, MessageCircle, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

interface HoldingSentiment {
  symbol: string;
  value: number;
  sentiment: {
    direction: 'bullish' | 'bearish' | 'neutral';
    score: number;
    confidence: number;
    twitterMentions?: number;
    redditMentions?: number;
    trending?: boolean;
  } | null;
}

interface PortfolioSentimentData {
  success: boolean;
  providers: { xai: boolean; desearch: boolean };
  latencyMs: number;
  portfolio: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    score: number;
    holdingsAnalyzed: number;
  };
  breakdown: {
    bullish: string[];
    bearish: string[];
    neutral: string[];
  };
  holdings: HoldingSentiment[];
  alerts: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
    symbol?: string;
  }>;
  lastUpdated: string;
}

interface Props {
  holdings: Array<{ symbol: string; value: number }>;
  compact?: boolean;
  showAlerts?: boolean;
  showHoldings?: boolean;
  onRefresh?: () => void;
}

export default function PortfolioSentiment({ 
  holdings, 
  compact = false, 
  showAlerts = true,
  showHoldings = true,
  onRefresh 
}: Props) {
  const [data, setData] = useState<PortfolioSentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSentiment = async () => {
    if (!holdings || holdings.length === 0) {
      setError('No holdings provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/athena/portfolio-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sentiment');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentiment();
    // Refresh every 5 minutes
    const interval = setInterval(fetchSentiment, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [JSON.stringify(holdings)]);

  const handleRefresh = () => {
    fetchSentiment();
    onRefresh?.();
  };

  // Sentiment icon helper
  const SentimentIcon = ({ direction }: { direction: 'bullish' | 'bearish' | 'neutral' }) => {
    switch (direction) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSentimentColor = (direction: 'bullish' | 'bearish' | 'neutral') => {
    switch (direction) {
      case 'bullish': return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (loading && !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertTriangle className="w-5 h-5" />
          <span>Unable to load sentiment data</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Compact view for dashboard cards
  if (compact) {
    return (
      <div className={`rounded-lg p-4 border ${getSentimentColor(data.portfolio.sentiment)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SentimentIcon direction={data.portfolio.sentiment} />
            <span className="font-semibold capitalize">{data.portfolio.sentiment}</span>
          </div>
          <div className="text-sm opacity-75">
            {data.portfolio.holdingsAnalyzed} holdings
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold">
          {data.portfolio.score > 0 ? '+' : ''}{(data.portfolio.score * 100).toFixed(0)}
        </div>
        <div className="text-xs mt-1 opacity-75">Sentiment Score</div>
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900">Portfolio Pulse</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            Powered by Athena
          </span>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Overall Sentiment */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Overall Sentiment</div>
            <div className="flex items-center gap-3">
              <SentimentIcon direction={data.portfolio.sentiment} />
              <span className={`text-2xl font-bold capitalize ${
                data.portfolio.sentiment === 'bullish' ? 'text-green-600' :
                data.portfolio.sentiment === 'bearish' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {data.portfolio.sentiment}
              </span>
              <span className="text-lg text-gray-400">
                ({data.portfolio.score > 0 ? '+' : ''}{(data.portfolio.score * 100).toFixed(0)})
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{data.portfolio.holdingsAnalyzed} holdings analyzed</div>
            <div className="flex gap-2 mt-1">
              {data.breakdown.bullish.length > 0 && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  {data.breakdown.bullish.length} bullish
                </span>
              )}
              {data.breakdown.bearish.length > 0 && (
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                  {data.breakdown.bearish.length} bearish
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {showAlerts && data.alerts.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100 space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Proactive Alerts</div>
          {data.alerts.slice(0, 3).map((alert, i) => (
            <div 
              key={i}
              className={`text-sm px-3 py-2 rounded-lg border ${getAlertColor(alert.priority)}`}
            >
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Holdings Grid */}
      {showHoldings && data.holdings.length > 0 && (
        <div className="px-6 py-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Holdings Sentiment</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.holdings.map((holding) => (
              <div 
                key={holding.symbol}
                className={`p-3 rounded-lg border ${
                  holding.sentiment 
                    ? getSentimentColor(holding.sentiment.direction)
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{holding.symbol}</span>
                  {holding.sentiment && (
                    <SentimentIcon direction={holding.sentiment.direction} />
                  )}
                </div>
                {holding.sentiment ? (
                  <>
                    <div className="text-sm capitalize opacity-75">
                      {holding.sentiment.direction}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs opacity-60">
                      {holding.sentiment.twitterMentions && (
                        <span className="flex items-center gap-1">
                          <Twitter className="w-3 h-3" />
                          {holding.sentiment.twitterMentions.toLocaleString()}
                        </span>
                      )}
                      {holding.sentiment.redditMentions && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {holding.sentiment.redditMentions.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {holding.sentiment.trending && (
                      <span className="inline-block mt-1 text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                        🔥 Trending
                      </span>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-400">No data</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>
          Sources: {data.providers.xai ? 'Twitter (xAI)' : ''}{data.providers.xai && data.providers.desearch ? ', ' : ''}{data.providers.desearch ? 'Reddit (Desearch)' : ''}
          {!data.providers.xai && !data.providers.desearch && 'Mock data'}
        </span>
        <span>Updated {new Date(data.lastUpdated).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
