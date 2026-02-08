/**
 * useDataProvider - React hook for accessing data providers
 * 
 * Bridges the data provider layer with React components.
 * Handles loading states, error handling, and caching.
 * 
 * Usage:
 *   const { data: funds, loading, error } = useFundData(['VTI', 'QQQ']);
 *   const { data: taxLots, refetch } = useTaxLots();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getPortfolioProvider,
  getFundProvider,
  getTaxProvider,
  dataConfig,
} from '@/lib/data-providers';
import type { Account, Holding, FundData, TaxLot } from '@/lib/data-providers/types';

// =============================================================================
// GENERIC HOOK
// =============================================================================

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  source: 'mock' | 'live';
}

function useData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  source: 'mock' | 'live'
): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, deps);

  return { data, loading, error, refetch: fetchData, source };
}

// =============================================================================
// PORTFOLIO DATA
// =============================================================================

export function useAccounts(userId: string = 'demo'): UseDataResult<Account[]> {
  const provider = getPortfolioProvider();
  return useData(
    () => provider.getAccounts(userId),
    [userId],
    dataConfig.portfolio
  );
}

export function useHoldings(userId: string = 'demo'): UseDataResult<Holding[]> {
  const provider = getPortfolioProvider();
  return useData(
    () => provider.getHoldings(userId),
    [userId],
    dataConfig.portfolio
  );
}

export function useTotalValue(userId: string = 'demo'): UseDataResult<number> {
  const provider = getPortfolioProvider();
  return useData(
    () => provider.getTotalValue(userId),
    [userId],
    dataConfig.portfolio
  );
}

export function useAssetAllocation(userId: string = 'demo'): UseDataResult<Record<string, number>> {
  const provider = getPortfolioProvider();
  return useData(
    () => provider.getAssetAllocation(userId),
    [userId],
    dataConfig.portfolio
  );
}

// =============================================================================
// FUND DATA
// =============================================================================

export function useFundData(symbol: string): UseDataResult<FundData | null> {
  const provider = getFundProvider();
  return useData(
    () => provider.getFund(symbol),
    [symbol],
    dataConfig.fund
  );
}

export function useFundSearch(query: string): UseDataResult<FundData[]> {
  const provider = getFundProvider();
  return useData(
    () => query.length >= 2 ? provider.searchFunds(query) : Promise.resolve([]),
    [query],
    dataConfig.fund
  );
}

export function useFundComparison(symbols: string[]): UseDataResult<FundData[]> {
  const provider = getFundProvider();
  return useData(
    () => provider.compareFunds(symbols),
    [symbols.join(',')],
    dataConfig.fund
  );
}

export function useFundOverlap(fund1: string, fund2: string): UseDataResult<{ overlap: number; sharedHoldings: { symbol: string; name: string; weight: number }[] }> {
  const provider = getFundProvider();
  return useData(
    () => provider.getOverlap(fund1, fund2),
    [fund1, fund2],
    dataConfig.fund
  );
}

// =============================================================================
// TAX DATA
// =============================================================================

export function useTaxLots(userId: string = 'demo', symbol?: string): UseDataResult<TaxLot[]> {
  const provider = getTaxProvider();
  return useData(
    () => provider.getTaxLots(userId, symbol),
    [userId, symbol],
    dataConfig.tax
  );
}

export function useHarvestingOpportunities(userId: string = 'demo'): UseDataResult<{ symbol: string; loss: number; washSaleRisk: boolean }[]> {
  const provider = getTaxProvider();
  return useData(
    () => provider.getHarvestingOpportunities(userId),
    [userId],
    dataConfig.tax
  );
}

export function useCapitalGainsSummary(userId: string = 'demo', year: number = new Date().getFullYear()): UseDataResult<{ shortTerm: number; longTerm: number; carryforward: number }> {
  const provider = getTaxProvider();
  return useData(
    () => provider.getCapitalGainsSummary(userId, year),
    [userId, year],
    dataConfig.tax
  );
}

// =============================================================================
// DATA SOURCE INFO
// =============================================================================

export function useDataSources() {
  return {
    portfolio: dataConfig.portfolio,
    fund: dataConfig.fund,
    tax: dataConfig.tax,
    market: dataConfig.market,
    economic: dataConfig.economic,
    analyst: dataConfig.analyst,
    hasLiveData: dataConfig.hasLiveData,
  };
}
