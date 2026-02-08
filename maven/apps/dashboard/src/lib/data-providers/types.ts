/**
 * Maven Data Provider Types
 * 
 * Architecture: Every data source has an interface. Mock implementations now,
 * live implementations when we pay for data (Morningstar, Bloomberg, etc.)
 * 
 * Switch via environment variables or feature flags.
 */

// =============================================================================
// PORTFOLIO DATA
// =============================================================================

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  accountId: string;
  accountType: 'brokerage' | '401k' | 'ira' | 'roth' | 'hsa' | '529';
  assetClass: 'stock' | 'bond' | 'cash' | 'crypto' | 'real-estate' | 'alternative';
  sector?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'brokerage' | '401k' | 'ira' | 'roth' | 'hsa' | '529';
  institution: string;
  balance: number;
  holdings: Holding[];
}

export interface PortfolioDataProvider {
  getAccounts(userId: string): Promise<Account[]>;
  getHoldings(userId: string): Promise<Holding[]>;
  getTotalValue(userId: string): Promise<number>;
  getAssetAllocation(userId: string): Promise<Record<string, number>>;
  refreshAccounts(userId: string): Promise<void>;
}

// =============================================================================
// MARKET DATA
// =============================================================================

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  timestamp: number;
}

export interface HistoricalBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<Quote>;
  getQuotes(symbols: string[]): Promise<Quote[]>;
  getHistorical(symbol: string, period: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | 'MAX'): Promise<HistoricalBar[]>;
  getCryptoPrice(symbol: string): Promise<Quote>;
}

// =============================================================================
// FUND DATA (Morningstar territory)
// =============================================================================

export interface FundHolding {
  symbol: string;
  name: string;
  weight: number;
  sector?: string;
  country?: string;
}

export interface FundData {
  symbol: string;
  name: string;
  category: string;
  expenseRatio: number;
  morningstarRating?: 1 | 2 | 3 | 4 | 5;
  holdings: FundHolding[];
  sectorWeights: Record<string, number>;
  styleBox?: {
    size: 'large' | 'mid' | 'small';
    style: 'value' | 'blend' | 'growth';
  };
  performance: {
    ytd: number;
    oneYear: number;
    threeYear: number;
    fiveYear: number;
    tenYear: number;
  };
  risk: {
    standardDeviation: number;
    sharpeRatio: number;
    beta: number;
    alpha?: number;
  };
}

export interface FundDataProvider {
  getFund(symbol: string): Promise<FundData | null>;
  searchFunds(query: string): Promise<FundData[]>;
  getHoldings(symbol: string): Promise<FundHolding[]>;
  compareFunds(symbols: string[]): Promise<FundData[]>;
  getOverlap(fund1: string, fund2: string): Promise<{ overlap: number; sharedHoldings: FundHolding[] }>;
}

// =============================================================================
// ECONOMIC DATA (FRED, etc.)
// =============================================================================

export interface EconomicIndicator {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  date: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
}

export interface EconomicDataProvider {
  getIndicator(id: string): Promise<EconomicIndicator>;
  getIndicators(ids: string[]): Promise<EconomicIndicator[]>;
  getHistorical(id: string, startDate: string, endDate: string): Promise<{ date: string; value: number }[]>;
}

// =============================================================================
// ANALYST DATA (FMP, Refinitiv, etc.)
// =============================================================================

export interface AnalystRating {
  symbol: string;
  firm: string;
  analyst: string;
  rating: 'strong-buy' | 'buy' | 'hold' | 'sell' | 'strong-sell';
  priceTarget: number;
  date: string;
}

export interface AnalystConsensus {
  symbol: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  averageTarget: number;
  highTarget: number;
  lowTarget: number;
}

export interface AnalystDataProvider {
  getRatings(symbol: string): Promise<AnalystRating[]>;
  getConsensus(symbol: string): Promise<AnalystConsensus>;
}

// =============================================================================
// RISK DATA
// =============================================================================

export interface RiskMetrics {
  portfolioVolatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  beta: number;
  alpha: number;
  correlationToMarket: number;
  valueAtRisk95: number;
  valueAtRisk99: number;
}

export interface RiskDataProvider {
  getPortfolioRisk(holdings: Holding[]): Promise<RiskMetrics>;
  getCorrelationMatrix(symbols: string[]): Promise<number[][]>;
  getStressTest(holdings: Holding[], scenario: string): Promise<{ loss: number; holdings: { symbol: string; loss: number }[] }>;
}

// =============================================================================
// TAX DATA
// =============================================================================

export interface TaxLot {
  symbol: string;
  shares: number;
  costBasis: number;
  purchaseDate: string;
  holdingPeriod: 'short-term' | 'long-term';
  gainLoss: number;
}

export interface TaxDataProvider {
  getTaxLots(userId: string, symbol?: string): Promise<TaxLot[]>;
  getHarvestingOpportunities(userId: string): Promise<{ symbol: string; loss: number; washSaleRisk: boolean }[]>;
  getCapitalGainsSummary(userId: string, year: number): Promise<{ shortTerm: number; longTerm: number; carryforward: number }>;
}

// =============================================================================
// RETIREMENT DATA
// =============================================================================

export interface SocialSecurityEstimate {
  age: number;
  monthlyBenefit: number;
  annualBenefit: number;
  lifetimeTotal: number;
}

export interface RetirementDataProvider {
  getSocialSecurityEstimates(userId: string): Promise<SocialSecurityEstimate[]>;
  getPensionEstimate(userId: string): Promise<{ monthlyBenefit: number; startAge: number } | null>;
  get401kDetails(userId: string): Promise<{ balance: number; employerMatch: number; vestingSchedule: number[] }>;
}

// =============================================================================
// PROVIDER CONFIG
// =============================================================================

export type DataSource = 'mock' | 'live';

export interface DataProviderConfig {
  portfolio: DataSource;  // mock now, Plaid later
  market: DataSource;     // live (Yahoo/CoinGecko/Polygon)
  fund: DataSource;       // mock now, Morningstar later
  economic: DataSource;   // live (FRED)
  analyst: DataSource;    // live (FMP) with fallback
  risk: DataSource;       // mock now, institutional later
  tax: DataSource;        // mock now, integration later
  retirement: DataSource; // mock now, SSA API later
}

export const DEFAULT_CONFIG: DataProviderConfig = {
  portfolio: 'mock',
  market: 'live',
  fund: 'mock',
  economic: 'live',
  analyst: 'live',
  risk: 'mock',
  tax: 'mock',
  retirement: 'mock',
};
