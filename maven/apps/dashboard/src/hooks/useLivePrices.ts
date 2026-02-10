/**
 * useLivePrices - Reusable hook for fetching and applying live stock prices
 * 
 * This hook is the CANONICAL way to get live prices across Maven.
 * Use this in any page that needs to display current portfolio values.
 * 
 * The pattern:
 * 1. Extract all tickers from profile holdings
 * 2. Fetch live prices from /api/stock-quote
 * 3. Return prices + helper to calculate live values
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { UserProfile, Holding, UserFinancials } from '@/providers/UserProvider';
import { GROWTH_HOLDINGS, RETIREE_HOLDINGS, getDemoVariant, DemoHolding } from '@/lib/demo-profile';

interface LivePriceData {
  price: number;
  change?: number;
  changePercent?: number;
}

interface UseLivePricesResult {
  // Raw price data by ticker
  livePrices: Record<string, number>;
  // Loading state
  isLoading: boolean;
  // Last update timestamp
  lastUpdated: Date | null;
  // Error state
  error: string | null;
  // Force refresh
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch live prices for all tickers in a profile
 */
export function useLivePrices(
  profile: UserProfile | null,
  isDemoMode: boolean,
  refreshIntervalMs: number = 60000
): UseLivePricesResult {
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get all unique tickers from profile
  const allTickers = useMemo(() => {
    const tickers = new Set<string>();
    
    if (isDemoMode) {
      // In demo mode, include tickers from both demo portfolios
      const growthTickers = GROWTH_HOLDINGS.map(h => h.symbol.toUpperCase());
      const retireeTickers = RETIREE_HOLDINGS.map(h => h.symbol.toUpperCase());
      [...growthTickers, ...retireeTickers].forEach(t => tickers.add(t));
    }
    
    if (profile) {
      // Get tickers from all account types
      profile.retirementAccounts?.forEach(acc => {
        acc.holdings?.forEach(h => tickers.add(h.ticker.toUpperCase()));
      });
      profile.investmentAccounts?.forEach(acc => {
        acc.holdings?.forEach(h => tickers.add(h.ticker.toUpperCase()));
      });
    }
    
    return Array.from(tickers);
  }, [profile, isDemoMode]);

  const fetchPrices = useCallback(async () => {
    if (allTickers.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/stock-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: allTickers }),
      });
      
      if (response.ok) {
        const { quotes, timestamp } = await response.json();
        const newPrices: Record<string, number> = {};
        
        for (const [symbol, quoteData] of Object.entries(quotes)) {
          const q = quoteData as { price: number };
          if (q.price > 0) {
            newPrices[symbol.toUpperCase()] = q.price;
          }
        }
        
        setLivePrices(newPrices);
        setLastUpdated(timestamp ? new Date(timestamp) : new Date());
      } else {
        setError('Failed to fetch prices');
      }
    } catch (err) {
      console.error('Error fetching live prices:', err);
      setError('Error fetching prices');
    } finally {
      setIsLoading(false);
    }
  }, [allTickers]);

  // Initial fetch and interval
  useEffect(() => {
    if (allTickers.length === 0) return;
    
    fetchPrices();
    const interval = setInterval(fetchPrices, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [fetchPrices, refreshIntervalMs, allTickers.length]);

  return {
    livePrices,
    isLoading,
    lastUpdated,
    error,
    refresh: fetchPrices,
  };
}

/**
 * Apply live prices to holdings and calculate updated values
 */
export function applyLivePricesToHoldings<T extends { ticker?: string; symbol?: string; shares?: number; sharesNum?: number; currentValue?: number; value?: number }>(
  holdings: T[],
  livePrices: Record<string, number>
): T[] {
  return holdings.map(h => {
    const ticker = (h.ticker || h.symbol || '').toUpperCase();
    const shares = h.shares || h.sharesNum || 0;
    const livePrice = livePrices[ticker];
    
    if (livePrice && shares > 0) {
      const liveValue = shares * livePrice;
      return {
        ...h,
        currentPrice: livePrice,
        currentValue: liveValue,
        value: liveValue, // For DemoHolding compatibility
      };
    }
    return h;
  });
}

/**
 * Calculate net worth with live prices applied
 */
export function calculateLiveNetWorth(
  profile: UserProfile | null,
  livePrices: Record<string, number>,
  isDemoMode: boolean
): number {
  if (!profile) return 0;
  
  // Calculate holdings total with live prices
  let holdingsTotal = 0;
  
  profile.retirementAccounts?.forEach(acc => {
    acc.holdings?.forEach(h => {
      const ticker = h.ticker.toUpperCase();
      const livePrice = livePrices[ticker];
      if (livePrice && h.shares > 0) {
        holdingsTotal += h.shares * livePrice;
      } else {
        holdingsTotal += h.currentValue || 0;
      }
    });
  });
  
  profile.investmentAccounts?.forEach(acc => {
    acc.holdings?.forEach(h => {
      const ticker = h.ticker.toUpperCase();
      const livePrice = livePrices[ticker];
      if (livePrice && h.shares > 0) {
        holdingsTotal += h.shares * livePrice;
      } else {
        holdingsTotal += h.currentValue || 0;
      }
    });
  });
  
  // Add other assets
  const cashTotal = profile.cashAccounts?.reduce((sum, a) => sum + (a.balance || 0), 0) || 0;
  const otherAssets = (profile.realEstateEquity || 0) + (profile.businessEquity || 0) + (profile.otherAssets || 0);
  const liabilities = profile.liabilities?.reduce((sum, l) => sum + (l.balance || 0), 0) || 0;
  
  return holdingsTotal + cashTotal + otherAssets - liabilities;
}

/**
 * Get live financials - enhanced version of UserFinancials with live prices
 */
export function calculateLiveFinancials(
  profile: UserProfile | null,
  livePrices: Record<string, number>
): UserFinancials | null {
  if (!profile) return null;
  
  const totalCash = profile.cashAccounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
  
  // Calculate retirement total with live prices
  let totalRetirement = 0;
  const retirementHoldings: (Holding & { accountName: string; accountType: string })[] = [];
  
  profile.retirementAccounts?.forEach(acc => {
    let accountTotal = 0;
    (acc.holdings || []).forEach(h => {
      const ticker = h.ticker.toUpperCase();
      const livePrice = livePrices[ticker];
      let currentValue = h.currentValue || 0;
      
      if (livePrice && h.shares > 0) {
        currentValue = h.shares * livePrice;
      }
      
      accountTotal += currentValue;
      retirementHoldings.push({
        ...h,
        currentValue,
        currentPrice: livePrice || h.currentPrice,
        accountName: acc.name,
        accountType: acc.type,
      });
    });
    totalRetirement += accountTotal > 0 ? accountTotal : (acc.balance || 0);
  });
  
  // Calculate investment total with live prices
  let totalInvestments = 0;
  const investmentHoldings: (Holding & { accountName: string; accountType: string })[] = [];
  
  profile.investmentAccounts?.forEach(acc => {
    let accountTotal = 0;
    (acc.holdings || []).forEach(h => {
      const ticker = h.ticker.toUpperCase();
      const livePrice = livePrices[ticker];
      let currentValue = h.currentValue || 0;
      
      if (livePrice && h.shares > 0) {
        currentValue = h.shares * livePrice;
      }
      
      accountTotal += currentValue;
      investmentHoldings.push({
        ...h,
        currentValue,
        currentPrice: livePrice || h.currentPrice,
        accountName: acc.name,
        accountType: 'Taxable',
      });
    });
    totalInvestments += accountTotal > 0 ? accountTotal : (acc.balance || 0);
  });
  
  const totalOtherAssets = (profile.realEstateEquity || 0) + (profile.cryptoValue || 0) + 
                          (profile.businessEquity || 0) + (profile.otherAssets || 0);
  const totalLiabilities = profile.liabilities?.reduce((sum, l) => sum + (l.balance || 0), 0) || 0;
  
  return {
    netWorth: totalCash + totalRetirement + totalInvestments + totalOtherAssets - totalLiabilities,
    totalCash,
    totalRetirement,
    totalInvestments,
    totalOtherAssets,
    totalLiabilities,
    allHoldings: [...retirementHoldings, ...investmentHoldings],
  };
}

/**
 * Convenience hook that combines useLivePrices with financials calculation
 */
export function useLiveFinancials(
  profile: UserProfile | null,
  isDemoMode: boolean
): {
  financials: UserFinancials | null;
  livePrices: Record<string, number>;
  isLoading: boolean;
  lastUpdated: Date | null;
} {
  const { livePrices, isLoading, lastUpdated } = useLivePrices(profile, isDemoMode);
  
  const financials = useMemo(() => {
    if (!profile) return null;
    
    // If we have live prices, calculate live financials
    if (Object.keys(livePrices).length > 0) {
      return calculateLiveFinancials(profile, livePrices);
    }
    
    // Otherwise, return static financials (same calculation without live prices)
    return calculateLiveFinancials(profile, {});
  }, [profile, livePrices]);
  
  return {
    financials,
    livePrices,
    isLoading,
    lastUpdated,
  };
}
