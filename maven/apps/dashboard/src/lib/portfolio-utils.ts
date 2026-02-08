/**
 * Portfolio Utilities
 * Centralized functions to derive portfolio metrics from UserProvider data
 * 
 * Use these instead of hardcoding allocations!
 */

import { UserFinancials, Holding, RetirementAccount, InvestmentAccount } from '@/providers/UserProvider';

// Asset class categories
export type AssetClass = 'usEquity' | 'intlEquity' | 'bonds' | 'reits' | 'gold' | 'crypto' | 'cash' | 'alternatives';

// Allocation percentages (0-1)
export interface PortfolioAllocation {
  usEquity: number;
  intlEquity: number;
  bonds: number;
  reits: number;
  gold: number;
  crypto: number;
  cash: number;
  alternatives: number;
}

// Ticker to asset class mapping
// This is a best-effort mapping - add more as needed
const TICKER_ASSET_CLASS: Record<string, AssetClass> = {
  // US Equity - Broad Market
  'VTI': 'usEquity',
  'VOO': 'usEquity',
  'SPY': 'usEquity',
  'IVV': 'usEquity',
  'ITOT': 'usEquity',
  'SCHB': 'usEquity',
  'SWTSX': 'usEquity',
  'FZROX': 'usEquity',
  'FXAIX': 'usEquity',
  'VFIAX': 'usEquity',
  'VTHRX': 'usEquity', // Target date (counts as US for simplicity)
  
  // US Equity - Growth
  'VUG': 'usEquity',
  'QQQ': 'usEquity',
  'VGT': 'usEquity',
  'ARKK': 'usEquity',
  'SMH': 'usEquity',
  'SOXX': 'usEquity',
  
  // US Equity - Value/Dividend
  'VTV': 'usEquity',
  'SCHD': 'usEquity',
  'VYM': 'usEquity',
  
  // US Equity - Individual Stocks
  'AAPL': 'usEquity',
  'MSFT': 'usEquity',
  'GOOGL': 'usEquity',
  'GOOG': 'usEquity',
  'AMZN': 'usEquity',
  'NVDA': 'usEquity',
  'TSLA': 'usEquity',
  'META': 'usEquity',
  'NFLX': 'usEquity',
  'AMD': 'usEquity',
  'INTC': 'usEquity',
  'CRM': 'usEquity',
  'ORCL': 'usEquity',
  'ADBE': 'usEquity',
  'PYPL': 'usEquity',
  'SQ': 'usEquity',
  'COIN': 'usEquity',
  'HOOD': 'usEquity',
  'PLTR': 'usEquity',
  'SNOW': 'usEquity',
  
  // Crypto Miners (US Equity category for stress test purposes)
  'CIFR': 'usEquity',
  'IREN': 'usEquity',
  'MARA': 'usEquity',
  'RIOT': 'usEquity',
  'CLSK': 'usEquity',
  'HUT': 'usEquity',
  'BITF': 'usEquity',
  
  // American Funds (typically US-focused)
  'AGTHX': 'usEquity',
  'AIVSX': 'usEquity',
  'ANWFX': 'usEquity', // New Perspective has intl, but treat as US
  'AMRMX': 'usEquity',
  'ANCFX': 'usEquity',
  'ABALX': 'usEquity', // Balanced fund, simplify to US
  'CAIBX': 'usEquity', // Capital Income Builder
  
  // International Equity
  'VXUS': 'intlEquity',
  'VEA': 'intlEquity',
  'VWO': 'intlEquity',
  'IXUS': 'intlEquity',
  'IEFA': 'intlEquity',
  'IEMG': 'intlEquity',
  'EFA': 'intlEquity',
  'EEM': 'intlEquity',
  'SCHF': 'intlEquity',
  
  // Bonds
  'BND': 'bonds',
  'AGG': 'bonds',
  'TLT': 'bonds',
  'IEF': 'bonds',
  'SHY': 'bonds',
  'TIP': 'bonds',
  'VCIT': 'bonds',
  'LQD': 'bonds',
  'HYG': 'bonds',
  'MUB': 'bonds',
  'VBTLX': 'bonds',
  'FXNAX': 'bonds',
  
  // REITs
  'VNQ': 'reits',
  'SCHH': 'reits',
  'IYR': 'reits',
  'XLRE': 'reits',
  'O': 'reits',
  'SPG': 'reits',
  
  // Gold
  'GLD': 'gold',
  'IAU': 'gold',
  'SGOL': 'gold',
  'GDX': 'gold',
  
  // Crypto (actual cryptocurrencies)
  'BTC': 'crypto',
  'ETH': 'crypto',
  'SOL': 'crypto',
  'TAO': 'crypto',
  'AVAX': 'crypto',
  'LINK': 'crypto',
  'DOT': 'crypto',
  'ADA': 'crypto',
  'XRP': 'crypto',
  'DOGE': 'crypto',
  
  // Crypto ETFs
  'BITO': 'crypto',
  'GBTC': 'crypto',
  'ETHE': 'crypto',
  'IBIT': 'crypto',
  'FBTC': 'crypto',
  
  // Alternatives
  'DBMF': 'alternatives',
  'TAIL': 'alternatives',
  'KMLM': 'alternatives',
};

/**
 * Classify a ticker into an asset class
 * Returns 'usEquity' as default for unknown tickers (conservative assumption)
 */
export function classifyTicker(ticker: string): AssetClass {
  const upper = ticker.toUpperCase();
  
  // Check explicit mapping first
  if (TICKER_ASSET_CLASS[upper]) {
    return TICKER_ASSET_CLASS[upper];
  }
  
  // Heuristics for unmapped tickers
  // If it looks like crypto (short all-caps letters)
  if (/^[A-Z]{2,6}$/.test(upper) && !upper.includes('X')) {
    // Could be crypto or stock - default to stock
  }
  
  // Default to US equity (most conservative for unknown stocks)
  return 'usEquity';
}

/**
 * Calculate portfolio allocation percentages from holdings
 */
export function calculateAllocationFromHoldings(
  holdings: (Holding & { accountName?: string; accountType?: string })[],
  totalPortfolioValue?: number
): PortfolioAllocation {
  const allocation: PortfolioAllocation = {
    usEquity: 0,
    intlEquity: 0,
    bonds: 0,
    reits: 0,
    gold: 0,
    crypto: 0,
    cash: 0,
    alternatives: 0,
  };
  
  // Calculate total value from holdings
  const total = totalPortfolioValue || holdings.reduce((sum, h) => {
    const value = h.currentValue || (h.shares * (h.currentPrice || 0));
    return sum + value;
  }, 0);
  
  if (total <= 0) {
    // Return default allocation if no holdings
    return {
      usEquity: 0.50,
      intlEquity: 0.15,
      bonds: 0.25,
      reits: 0.05,
      gold: 0,
      crypto: 0,
      cash: 0.05,
      alternatives: 0,
    };
  }
  
  // Classify each holding and sum by class
  holdings.forEach(holding => {
    const value = holding.currentValue || (holding.shares * (holding.currentPrice || 0));
    const assetClass = classifyTicker(holding.ticker);
    allocation[assetClass] += value / total;
  });
  
  return allocation;
}

/**
 * Calculate allocation from UserFinancials (includes cash)
 */
export function calculateAllocationFromFinancials(financials: UserFinancials | null): PortfolioAllocation {
  if (!financials || financials.netWorth <= 0) {
    // Return default allocation
    return {
      usEquity: 0.50,
      intlEquity: 0.15,
      bonds: 0.25,
      reits: 0.05,
      gold: 0,
      crypto: 0,
      cash: 0.05,
      alternatives: 0,
    };
  }
  
  // Start with holdings-based allocation
  const allocation = calculateAllocationFromHoldings(financials.allHoldings);
  
  // Add cash as a percentage of total
  const investedValue = financials.allHoldings.reduce((sum, h) => {
    return sum + (h.currentValue || (h.shares * (h.currentPrice || 0)));
  }, 0);
  
  const cashRatio = financials.totalCash / (financials.totalCash + investedValue);
  
  // Scale down other allocations and add cash
  const scaleFactor = 1 - cashRatio;
  Object.keys(allocation).forEach(key => {
    allocation[key as AssetClass] *= scaleFactor;
  });
  allocation.cash = cashRatio;
  
  return allocation;
}

/**
 * Calculate total invested value (excluding cash)
 */
export function calculateInvestedValue(
  retirementAccounts: RetirementAccount[],
  investmentAccounts: InvestmentAccount[]
): number {
  let total = 0;
  
  retirementAccounts.forEach(acc => {
    acc.holdings?.forEach(h => {
      total += h.currentValue || (h.shares * (h.currentPrice || 0));
    });
  });
  
  investmentAccounts.forEach(acc => {
    acc.holdings?.forEach(h => {
      total += h.currentValue || (h.shares * (h.currentPrice || 0));
    });
  });
  
  return total;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth?: string): number {
  if (!dateOfBirth) return 35; // Default age
  
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Get a simple allocation summary for display
 */
export function getAllocationSummary(allocation: PortfolioAllocation): {
  stocks: number;
  bonds: number;
  alternatives: number;
  cash: number;
} {
  return {
    stocks: allocation.usEquity + allocation.intlEquity,
    bonds: allocation.bonds,
    alternatives: allocation.reits + allocation.gold + allocation.crypto + allocation.alternatives,
    cash: allocation.cash,
  };
}

/**
 * Format allocation as percentage string
 */
export function formatAllocationPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Default allocation if user has no data
 */
export const DEFAULT_ALLOCATION: PortfolioAllocation = {
  usEquity: 0.50,
  intlEquity: 0.15,
  bonds: 0.25,
  reits: 0.05,
  gold: 0,
  crypto: 0,
  cash: 0.05,
  alternatives: 0,
};

/**
 * Aggregate holdings by ticker across all accounts
 */
export function aggregateHoldingsByTicker(
  holdings: (Holding & { accountName?: string; accountType?: string })[]
): Map<string, { ticker: string; name: string; totalValue: number; totalShares: number; accounts: string[] }> {
  const aggregated = new Map<string, { ticker: string; name: string; totalValue: number; totalShares: number; accounts: string[] }>();
  
  holdings.forEach(h => {
    const value = h.currentValue || (h.shares * (h.currentPrice || 0));
    const existing = aggregated.get(h.ticker);
    
    if (existing) {
      existing.totalValue += value;
      existing.totalShares += h.shares;
      if (h.accountName && !existing.accounts.includes(h.accountName)) {
        existing.accounts.push(h.accountName);
      }
    } else {
      aggregated.set(h.ticker, {
        ticker: h.ticker,
        name: h.name || h.ticker,
        totalValue: value,
        totalShares: h.shares,
        accounts: h.accountName ? [h.accountName] : [],
      });
    }
  });
  
  return aggregated;
}
