'use client';

import { useState, useEffect, useCallback } from 'react';
import { FundProfile } from '@/app/api/fund-profile/route';

interface UseFundProfilesResult {
  profiles: Record<string, FundProfile>;
  loading: boolean;
  error: string | null;
  fetchProfiles: (tickers: string[]) => Promise<void>;
  getProfile: (ticker: string) => FundProfile | undefined;
  getPrimaryClass: (ticker: string) => FundProfile['primaryClass'];
}

// Local storage cache key
const CACHE_KEY = 'maven_fund_profiles';
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

interface CachedProfiles {
  profiles: Record<string, FundProfile>;
  timestamp: number;
}

/**
 * Hook for fetching and caching fund profiles with Morningstar data
 */
export function useFundProfiles(): UseFundProfilesResult {
  const [profiles, setProfiles] = useState<Record<string, FundProfile>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached profiles on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedProfiles = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          setProfiles(parsed.profiles);
        }
      }
    } catch (e) {
      console.error('Error loading cached profiles:', e);
    }
  }, []);

  // Save profiles to cache when updated
  useEffect(() => {
    if (Object.keys(profiles).length > 0) {
      try {
        const cached: CachedProfiles = {
          profiles,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
      } catch (e) {
        console.error('Error caching profiles:', e);
      }
    }
  }, [profiles]);

  const fetchProfiles = useCallback(async (tickers: string[]) => {
    if (tickers.length === 0) return;

    // Filter out already cached tickers
    const needsFetch = tickers.filter(t => !profiles[t.toUpperCase()]);
    if (needsFetch.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fund-profile?tickers=${needsFetch.join(',')}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setProfiles(prev => ({
        ...prev,
        ...data.profiles
      }));
    } catch (e) {
      console.error('Error fetching fund profiles:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [profiles]);

  const getProfile = useCallback((ticker: string): FundProfile | undefined => {
    return profiles[ticker.toUpperCase()];
  }, [profiles]);

  const getPrimaryClass = useCallback((ticker: string): FundProfile['primaryClass'] => {
    const profile = profiles[ticker.toUpperCase()];
    return profile?.primaryClass || 'usEquity'; // Default to US equity
  }, [profiles]);

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    getProfile,
    getPrimaryClass
  };
}

/**
 * Categorize holdings using fund profiles
 */
export function categorizeWithProfiles(
  holdings: { ticker: string; currentValue?: number }[],
  profiles: Record<string, FundProfile>
): {
  usEquity: number;
  intlEquity: number;
  bonds: number;
  cash: number;
  crypto: number;
  other: number;
} {
  const categories = {
    usEquity: 0,
    intlEquity: 0,
    bonds: 0,
    cash: 0,
    crypto: 0,
    other: 0
  };

  holdings.forEach(h => {
    const ticker = h.ticker.toUpperCase();
    const value = h.currentValue || 0;
    const profile = profiles[ticker];

    if (profile) {
      // Use profile's primary class
      const primaryClass = profile.primaryClass;
      if (primaryClass === 'usEquity') categories.usEquity += value;
      else if (primaryClass === 'intlEquity') categories.intlEquity += value;
      else if (primaryClass === 'bonds') categories.bonds += value;
      else if (primaryClass === 'cash') categories.cash += value;
      else if (primaryClass === 'crypto') categories.crypto += value;
      else categories.other += value;
    } else {
      // Fallback classification for unknown tickers
      categories.usEquity += value;
    }
  });

  return categories;
}
