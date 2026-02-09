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

// ===========================================
// FACTOR EXPOSURE ANALYSIS
// ===========================================

/**
 * Factor exposure scores (-1 to +1)
 * Based on Fama-French + Carhart + Quality factors
 */
export interface FactorExposures {
  marketBeta: number;    // Market sensitivity (0.5 to 1.5 typical)
  size: number;          // SMB: Small vs Large (-1 = large cap, +1 = small cap)
  value: number;         // HML: Value vs Growth (-1 = growth, +1 = value)
  momentum: number;      // Recent performance factor (-1 to +1)
  quality: number;       // Profitability & financial health (-1 to +1)
}

/**
 * Factor characteristics for individual tickers
 * These are heuristic estimates based on asset type
 * In production, you'd use actual factor loadings from a data provider
 */
const TICKER_FACTOR_PROFILES: Record<string, Partial<FactorExposures>> = {
  // Broad Market ETFs (market beta ~1, neutral on other factors)
  'VTI': { marketBeta: 1.0, size: 0.0, value: 0.0, momentum: 0.0, quality: 0.1 },
  'VOO': { marketBeta: 1.0, size: -0.2, value: 0.0, momentum: 0.0, quality: 0.15 },
  'SPY': { marketBeta: 1.0, size: -0.2, value: 0.0, momentum: 0.0, quality: 0.15 },
  'IVV': { marketBeta: 1.0, size: -0.2, value: 0.0, momentum: 0.0, quality: 0.15 },
  'ITOT': { marketBeta: 1.0, size: 0.0, value: 0.0, momentum: 0.0, quality: 0.1 },
  
  // Growth ETFs (negative value = growth tilt)
  'QQQ': { marketBeta: 1.15, size: -0.3, value: -0.6, momentum: 0.3, quality: 0.2 },
  'VUG': { marketBeta: 1.1, size: -0.2, value: -0.5, momentum: 0.2, quality: 0.15 },
  'VGT': { marketBeta: 1.2, size: -0.3, value: -0.5, momentum: 0.25, quality: 0.2 },
  'ARKK': { marketBeta: 1.5, size: 0.1, value: -0.8, momentum: 0.1, quality: -0.3 },
  'SMH': { marketBeta: 1.3, size: -0.2, value: -0.4, momentum: 0.35, quality: 0.15 },
  'SOXX': { marketBeta: 1.3, size: -0.1, value: -0.4, momentum: 0.3, quality: 0.2 },
  
  // Value ETFs (positive value factor)
  'VTV': { marketBeta: 0.95, size: -0.2, value: 0.5, momentum: -0.1, quality: 0.2 },
  'SCHD': { marketBeta: 0.85, size: -0.15, value: 0.4, momentum: 0.0, quality: 0.5 },
  'VYM': { marketBeta: 0.9, size: -0.2, value: 0.45, momentum: -0.1, quality: 0.35 },
  
  // Small Cap ETFs (positive size factor)
  'VB': { marketBeta: 1.1, size: 0.7, value: 0.1, momentum: 0.0, quality: -0.1 },
  'IJR': { marketBeta: 1.15, size: 0.8, value: 0.15, momentum: 0.0, quality: -0.15 },
  'IWM': { marketBeta: 1.2, size: 0.85, value: 0.0, momentum: 0.0, quality: -0.2 },
  'SCHA': { marketBeta: 1.1, size: 0.75, value: 0.05, momentum: 0.0, quality: -0.1 },
  
  // International ETFs
  'VXUS': { marketBeta: 0.9, size: -0.1, value: 0.15, momentum: -0.1, quality: 0.0 },
  'VEA': { marketBeta: 0.85, size: -0.15, value: 0.2, momentum: -0.1, quality: 0.1 },
  'VWO': { marketBeta: 1.1, size: 0.1, value: 0.1, momentum: 0.0, quality: -0.2 },
  'IEFA': { marketBeta: 0.85, size: -0.1, value: 0.15, momentum: -0.1, quality: 0.1 },
  'EFA': { marketBeta: 0.85, size: -0.15, value: 0.2, momentum: -0.1, quality: 0.05 },
  'EEM': { marketBeta: 1.15, size: 0.05, value: 0.1, momentum: 0.0, quality: -0.15 },
  
  // Bond ETFs (low beta, defensive)
  'BND': { marketBeta: 0.05, size: 0.0, value: 0.0, momentum: 0.0, quality: 0.5 },
  'AGG': { marketBeta: 0.05, size: 0.0, value: 0.0, momentum: 0.0, quality: 0.5 },
  'TLT': { marketBeta: -0.1, size: 0.0, value: 0.0, momentum: 0.0, quality: 0.6 },
  'IEF': { marketBeta: 0.0, size: 0.0, value: 0.0, momentum: 0.0, quality: 0.55 },
  'LQD': { marketBeta: 0.15, size: 0.0, value: 0.1, momentum: 0.0, quality: 0.3 },
  'HYG': { marketBeta: 0.4, size: 0.0, value: 0.2, momentum: 0.0, quality: -0.2 },
  'TIP': { marketBeta: 0.05, size: 0.0, value: 0.0, momentum: 0.0, quality: 0.5 },
  
  // Crypto ETFs (high beta, speculative)
  'IBIT': { marketBeta: 1.8, size: 0.0, value: -0.3, momentum: 0.6, quality: -0.5 },
  'FBTC': { marketBeta: 1.8, size: 0.0, value: -0.3, momentum: 0.6, quality: -0.5 },
  'GBTC': { marketBeta: 1.9, size: 0.0, value: -0.3, momentum: 0.5, quality: -0.6 },
  'BITO': { marketBeta: 1.7, size: 0.0, value: -0.3, momentum: 0.5, quality: -0.5 },
  
  // REITs
  'VNQ': { marketBeta: 1.0, size: 0.1, value: 0.3, momentum: -0.1, quality: 0.1 },
  'SCHH': { marketBeta: 1.0, size: 0.15, value: 0.35, momentum: -0.1, quality: 0.1 },
  
  // Big Tech Stocks (growth, high quality)
  'AAPL': { marketBeta: 1.2, size: -0.4, value: -0.3, momentum: 0.2, quality: 0.7 },
  'MSFT': { marketBeta: 1.1, size: -0.4, value: -0.2, momentum: 0.25, quality: 0.8 },
  'GOOGL': { marketBeta: 1.15, size: -0.4, value: -0.25, momentum: 0.1, quality: 0.6 },
  'GOOG': { marketBeta: 1.15, size: -0.4, value: -0.25, momentum: 0.1, quality: 0.6 },
  'AMZN': { marketBeta: 1.25, size: -0.4, value: -0.5, momentum: 0.15, quality: 0.4 },
  'NVDA': { marketBeta: 1.6, size: -0.3, value: -0.6, momentum: 0.7, quality: 0.5 },
  'META': { marketBeta: 1.3, size: -0.35, value: -0.1, momentum: 0.3, quality: 0.5 },
  'TSLA': { marketBeta: 1.8, size: -0.25, value: -0.8, momentum: 0.2, quality: -0.2 },
  
  // Financials (value tilt)
  'JPM': { marketBeta: 1.1, size: -0.3, value: 0.4, momentum: 0.1, quality: 0.4 },
  'BAC': { marketBeta: 1.3, size: -0.25, value: 0.5, momentum: 0.0, quality: 0.2 },
  'WFC': { marketBeta: 1.2, size: -0.2, value: 0.5, momentum: -0.1, quality: 0.1 },
  'GS': { marketBeta: 1.3, size: -0.2, value: 0.3, momentum: 0.15, quality: 0.3 },
  
  // Healthcare (defensive quality)
  'JNJ': { marketBeta: 0.7, size: -0.3, value: 0.2, momentum: -0.1, quality: 0.7 },
  'UNH': { marketBeta: 0.85, size: -0.35, value: 0.1, momentum: 0.2, quality: 0.6 },
  'PFE': { marketBeta: 0.7, size: -0.25, value: 0.35, momentum: -0.2, quality: 0.4 },
  'ABBV': { marketBeta: 0.75, size: -0.2, value: 0.3, momentum: 0.1, quality: 0.5 },
  
  // Consumer Staples (defensive)
  'PG': { marketBeta: 0.5, size: -0.3, value: 0.1, momentum: 0.0, quality: 0.7 },
  'KO': { marketBeta: 0.6, size: -0.3, value: 0.2, momentum: -0.1, quality: 0.6 },
  'PEP': { marketBeta: 0.6, size: -0.3, value: 0.15, momentum: 0.0, quality: 0.65 },
  'WMT': { marketBeta: 0.5, size: -0.35, value: 0.1, momentum: 0.1, quality: 0.5 },
  'COST': { marketBeta: 0.75, size: -0.3, value: -0.1, momentum: 0.25, quality: 0.6 },
  
  // Energy (value, cyclical)
  'XOM': { marketBeta: 0.9, size: -0.25, value: 0.5, momentum: 0.1, quality: 0.3 },
  'CVX': { marketBeta: 0.95, size: -0.25, value: 0.45, momentum: 0.1, quality: 0.35 },
  
  // Crypto (direct)
  'BTC': { marketBeta: 2.0, size: 0.0, value: -0.3, momentum: 0.6, quality: -0.6 },
  'ETH': { marketBeta: 2.2, size: 0.0, value: -0.4, momentum: 0.5, quality: -0.5 },
  'SOL': { marketBeta: 2.5, size: 0.3, value: -0.5, momentum: 0.4, quality: -0.7 },
  'TAO': { marketBeta: 2.5, size: 0.4, value: -0.5, momentum: 0.3, quality: -0.7 },
  
  // Cash (zero exposure)
  'CASH': { marketBeta: 0.0, size: 0.0, value: 0.0, momentum: 0.0, quality: 1.0 },
  'SPAXX': { marketBeta: 0.0, size: 0.0, value: 0.0, momentum: 0.0, quality: 1.0 },
  'VMFXX': { marketBeta: 0.0, size: 0.0, value: 0.0, momentum: 0.0, quality: 1.0 },
  'SWVXX': { marketBeta: 0.0, size: 0.0, value: 0.0, momentum: 0.0, quality: 1.0 },
};

/**
 * Default factor profiles by asset class (fallback for unknown tickers)
 */
const DEFAULT_FACTOR_BY_CLASS: Record<AssetClass, FactorExposures> = {
  usEquity: { marketBeta: 1.1, size: 0.0, value: -0.1, momentum: 0.1, quality: 0.1 },
  intlEquity: { marketBeta: 0.9, size: 0.0, value: 0.1, momentum: 0.0, quality: 0.0 },
  bonds: { marketBeta: 0.05, size: 0.0, value: 0.0, momentum: 0.0, quality: 0.5 },
  reits: { marketBeta: 1.0, size: 0.2, value: 0.3, momentum: -0.1, quality: 0.1 },
  gold: { marketBeta: 0.1, size: 0.0, value: 0.0, momentum: 0.0, quality: 0.2 },
  crypto: { marketBeta: 2.0, size: 0.0, value: -0.3, momentum: 0.5, quality: -0.5 },
  cash: { marketBeta: 0.0, size: 0.0, value: 0.0, momentum: 0.0, quality: 1.0 },
  alternatives: { marketBeta: 0.5, size: 0.0, value: 0.0, momentum: 0.0, quality: 0.0 },
};

/**
 * Get factor exposures for a single ticker
 */
export function getTickerFactorExposures(ticker: string): FactorExposures {
  const upper = ticker.toUpperCase();
  
  // Check if we have specific factor data
  if (TICKER_FACTOR_PROFILES[upper]) {
    const profile = TICKER_FACTOR_PROFILES[upper];
    return {
      marketBeta: profile.marketBeta ?? 1.0,
      size: profile.size ?? 0.0,
      value: profile.value ?? 0.0,
      momentum: profile.momentum ?? 0.0,
      quality: profile.quality ?? 0.0,
    };
  }
  
  // Fall back to asset class defaults
  const assetClass = classifyTicker(ticker);
  return DEFAULT_FACTOR_BY_CLASS[assetClass];
}

/**
 * Calculate portfolio-weighted factor exposures
 */
export function calculatePortfolioFactorExposures(
  holdings: Holding[]
): FactorExposures {
  // Calculate total portfolio value
  const totalValue = holdings.reduce((sum, h) => {
    const value = h.currentValue || (h.shares * (h.currentPrice || 0));
    return sum + value;
  }, 0);
  
  if (totalValue <= 0) {
    return { marketBeta: 1.0, size: 0.0, value: 0.0, momentum: 0.0, quality: 0.0 };
  }
  
  // Calculate weighted factor exposures
  const weightedExposures: FactorExposures = {
    marketBeta: 0,
    size: 0,
    value: 0,
    momentum: 0,
    quality: 0,
  };
  
  holdings.forEach(h => {
    const value = h.currentValue || (h.shares * (h.currentPrice || 0));
    const weight = value / totalValue;
    const factors = getTickerFactorExposures(h.ticker);
    
    weightedExposures.marketBeta += factors.marketBeta * weight;
    weightedExposures.size += factors.size * weight;
    weightedExposures.value += factors.value * weight;
    weightedExposures.momentum += factors.momentum * weight;
    weightedExposures.quality += factors.quality * weight;
  });
  
  return weightedExposures;
}

/**
 * Get interpretation text for factor exposures
 */
export function getFactorInterpretation(factors: FactorExposures): {
  summary: string;
  details: string[];
  riskLevel: 'low' | 'moderate' | 'high';
} {
  const details: string[] = [];
  let riskLevel: 'low' | 'moderate' | 'high' = 'moderate';
  
  // Market Beta interpretation
  if (factors.marketBeta > 1.2) {
    details.push('Your portfolio is more volatile than the market — expect bigger swings in both directions.');
    riskLevel = 'high';
  } else if (factors.marketBeta < 0.8) {
    details.push('Your portfolio is more defensive than the market — expect smaller swings.');
    riskLevel = 'low';
  } else {
    details.push('Your portfolio moves roughly in line with the market.');
  }
  
  // Size interpretation
  if (factors.size > 0.3) {
    details.push('Tilted toward smaller companies, which historically offer higher returns but more risk.');
  } else if (factors.size < -0.3) {
    details.push('Concentrated in large, established companies — more stable but potentially lower growth.');
  }
  
  // Value interpretation
  if (factors.value > 0.25) {
    details.push('Value-oriented portfolio with cheaper stocks that may benefit from mean reversion.');
  } else if (factors.value < -0.25) {
    details.push('Growth-oriented portfolio betting on companies with high earnings potential.');
  }
  
  // Momentum interpretation
  if (factors.momentum > 0.3) {
    details.push('High exposure to recent winners — can perform well short-term but may reverse.');
  } else if (factors.momentum < -0.2) {
    details.push('Holding recent underperformers — contrarian approach that may require patience.');
  }
  
  // Quality interpretation
  if (factors.quality > 0.4) {
    details.push('Strong quality tilt toward profitable, financially healthy companies.');
  } else if (factors.quality < -0.2) {
    details.push('Lower quality exposure — may include speculative or unprofitable companies.');
  }
  
  // Generate summary
  let summary = '';
  if (factors.marketBeta > 1.2 && factors.value < -0.2) {
    summary = 'Aggressive growth portfolio with high market sensitivity.';
  } else if (factors.marketBeta < 0.8 && factors.quality > 0.3) {
    summary = 'Defensive quality portfolio designed for stability.';
  } else if (factors.value > 0.25 && factors.size > 0.2) {
    summary = 'Small-cap value portfolio — a classic factor combination.';
  } else if (Math.abs(factors.size) < 0.2 && Math.abs(factors.value) < 0.2) {
    summary = 'Well-diversified portfolio with balanced factor exposures.';
  } else {
    summary = 'Moderately tilted portfolio with some factor concentrations.';
  }
  
  return { summary, details, riskLevel };
}

/**
 * Get benchmark factor exposures for comparison
 */
export function getBenchmarkFactorExposures(benchmark: 'sp500' | '6040' | 'total_market'): FactorExposures {
  switch (benchmark) {
    case 'sp500':
      return { marketBeta: 1.0, size: -0.2, value: 0.0, momentum: 0.0, quality: 0.15 };
    case '6040':
      return { marketBeta: 0.6, size: -0.12, value: 0.0, momentum: 0.0, quality: 0.3 };
    case 'total_market':
    default:
      return { marketBeta: 1.0, size: 0.0, value: 0.0, momentum: 0.0, quality: 0.1 };
  }
}
