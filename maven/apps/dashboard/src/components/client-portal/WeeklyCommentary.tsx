'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

interface WeeklyCommentaryProps {
  code: string;
  portfolioValue?: number;
}

interface CommentaryData {
  commentary: string;
  generatedAt: string;
  marketHighlights?: string[];
}

// Loading skeleton for commentary
function CommentarySkeleton() {
  return (
    <div className="bg-gradient-to-br from-[#111827] to-[#0d1117] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-full bg-white/10 rounded animate-pulse mt-4" />
        <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function WeeklyCommentary({ code, portfolioValue }: WeeklyCommentaryProps) {
  const [loading, setLoading] = useState(true);
  const [commentary, setCommentary] = useState<CommentaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommentary = async (forceRefresh = false) => {
    try {
      setError(null);
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({ code });
      if (portfolioValue) {
        params.append('portfolioValue', portfolioValue.toString());
      }
      if (forceRefresh) {
        params.append('refresh', 'true');
      }

      const response = await fetch(`/api/client-portal/commentary?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load commentary');
      }

      const data = await response.json();
      setCommentary(data);
    } catch {
      setError('Unable to load commentary. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommentary();
  }, [code]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <CommentarySkeleton />;
  }

  if (error) {
    return (
      <div className="bg-[#111827] border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-red-400">
          <Sparkles className="h-5 w-5" />
          <p>{error}</p>
        </div>
        <button
          onClick={() => fetchCommentary()}
          className="mt-4 text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!commentary) {
    return null;
  }

  // Split commentary into paragraphs
  const paragraphs = commentary.commentary.split('\n\n').filter(p => p.trim());

  return (
    <div className="bg-gradient-to-br from-[#111827] to-[#0d1117] border border-teal-500/20 rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">This Week from Maven Partners</h3>
            <p className="text-sm text-gray-500">Market insights for you</p>
          </div>
        </div>
        <button
          onClick={() => fetchCommentary(true)}
          disabled={refreshing}
          className={clsx(
            'p-2 text-gray-400 hover:text-teal-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center',
            refreshing && 'animate-spin'
          )}
          aria-label="Refresh commentary"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Commentary Content */}
      <div className="space-y-4 mb-6">
        {paragraphs.map((paragraph, index) => (
          <p 
            key={index} 
            className="text-gray-300 leading-relaxed text-[15px]"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Market Highlights (if present) */}
      {commentary.marketHighlights && commentary.marketHighlights.length > 0 && (
        <div className="border-t border-white/10 pt-4 mb-4">
          <p className="text-sm font-medium text-white mb-2">Key Highlights</p>
          <ul className="space-y-2">
            {commentary.marketHighlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-teal-400 mt-1">•</span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-white/10 pt-4">
        <Calendar className="h-4 w-4" />
        <span>Generated {formatDate(commentary.generatedAt)}</span>
      </div>
    </div>
  );
}
