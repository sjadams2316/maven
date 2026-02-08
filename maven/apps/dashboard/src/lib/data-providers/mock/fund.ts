/**
 * Mock Fund Data Provider
 * 
 * Realistic Morningstar-style fund data. Replace with Morningstar API when ready.
 * This is where the $25-50K/year API would plug in.
 */

import { FundDataProvider, FundData, FundHolding } from '../types';

// Realistic fund data for common funds
const FUND_DATABASE: Record<string, FundData> = {
  'AGTHX': {
    symbol: 'AGTHX',
    name: 'American Funds Growth Fund of America',
    category: 'Large Growth',
    expenseRatio: 0.62,
    morningstarRating: 4,
    holdings: [
      { symbol: 'META', name: 'Meta Platforms Inc', weight: 6.2, sector: 'Technology' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 5.8, sector: 'Technology' },
      { symbol: 'AMZN', name: 'Amazon.com Inc', weight: 4.9, sector: 'Consumer Cyclical' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 4.5, sector: 'Technology' },
      { symbol: 'AAPL', name: 'Apple Inc', weight: 4.2, sector: 'Technology' },
      { symbol: 'GOOGL', name: 'Alphabet Inc', weight: 3.8, sector: 'Technology' },
      { symbol: 'TSLA', name: 'Tesla Inc', weight: 2.9, sector: 'Consumer Cyclical' },
      { symbol: 'UNH', name: 'UnitedHealth Group', weight: 2.5, sector: 'Healthcare' },
      { symbol: 'V', name: 'Visa Inc', weight: 2.3, sector: 'Financial Services' },
      { symbol: 'LLY', name: 'Eli Lilly and Company', weight: 2.1, sector: 'Healthcare' },
    ],
    sectorWeights: {
      'Technology': 35.2,
      'Healthcare': 15.8,
      'Consumer Cyclical': 14.3,
      'Financial Services': 12.1,
      'Communication Services': 8.7,
      'Industrials': 6.9,
      'Consumer Defensive': 4.2,
      'Other': 2.8,
    },
    styleBox: { size: 'large', style: 'growth' },
    performance: {
      ytd: 4.2,
      oneYear: 28.5,
      threeYear: 8.2,
      fiveYear: 14.6,
      tenYear: 13.8,
    },
    risk: {
      standardDeviation: 18.2,
      sharpeRatio: 0.92,
      beta: 1.08,
      alpha: 1.2,
    },
  },
  'VTI': {
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    category: 'Large Blend',
    expenseRatio: 0.03,
    morningstarRating: 5,
    holdings: [
      { symbol: 'AAPL', name: 'Apple Inc', weight: 6.8, sector: 'Technology' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 6.2, sector: 'Technology' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 4.1, sector: 'Technology' },
      { symbol: 'AMZN', name: 'Amazon.com Inc', weight: 3.5, sector: 'Consumer Cyclical' },
      { symbol: 'GOOGL', name: 'Alphabet Inc', weight: 2.1, sector: 'Technology' },
      { symbol: 'META', name: 'Meta Platforms Inc', weight: 2.0, sector: 'Technology' },
      { symbol: 'BRK.B', name: 'Berkshire Hathaway', weight: 1.8, sector: 'Financial Services' },
      { symbol: 'TSLA', name: 'Tesla Inc', weight: 1.5, sector: 'Consumer Cyclical' },
      { symbol: 'UNH', name: 'UnitedHealth Group', weight: 1.3, sector: 'Healthcare' },
      { symbol: 'JPM', name: 'JPMorgan Chase', weight: 1.2, sector: 'Financial Services' },
    ],
    sectorWeights: {
      'Technology': 29.8,
      'Healthcare': 13.2,
      'Financial Services': 12.9,
      'Consumer Cyclical': 10.8,
      'Communication Services': 8.5,
      'Industrials': 8.2,
      'Consumer Defensive': 6.1,
      'Energy': 4.2,
      'Utilities': 2.5,
      'Real Estate': 2.4,
      'Basic Materials': 1.4,
    },
    styleBox: { size: 'large', style: 'blend' },
    performance: {
      ytd: 3.1,
      oneYear: 24.8,
      threeYear: 9.4,
      fiveYear: 13.2,
      tenYear: 11.9,
    },
    risk: {
      standardDeviation: 15.8,
      sharpeRatio: 0.85,
      beta: 1.00,
    },
  },
  'QQQ': {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    category: 'Large Growth',
    expenseRatio: 0.20,
    morningstarRating: 5,
    holdings: [
      { symbol: 'AAPL', name: 'Apple Inc', weight: 8.9, sector: 'Technology' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 8.1, sector: 'Technology' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 7.2, sector: 'Technology' },
      { symbol: 'AMZN', name: 'Amazon.com Inc', weight: 5.4, sector: 'Consumer Cyclical' },
      { symbol: 'META', name: 'Meta Platforms Inc', weight: 4.8, sector: 'Technology' },
      { symbol: 'AVGO', name: 'Broadcom Inc', weight: 4.5, sector: 'Technology' },
      { symbol: 'GOOGL', name: 'Alphabet Inc', weight: 2.8, sector: 'Technology' },
      { symbol: 'GOOG', name: 'Alphabet Inc Class C', weight: 2.7, sector: 'Technology' },
      { symbol: 'TSLA', name: 'Tesla Inc', weight: 2.6, sector: 'Consumer Cyclical' },
      { symbol: 'COST', name: 'Costco Wholesale', weight: 2.5, sector: 'Consumer Defensive' },
    ],
    sectorWeights: {
      'Technology': 58.2,
      'Communication Services': 15.1,
      'Consumer Cyclical': 12.8,
      'Healthcare': 6.2,
      'Consumer Defensive': 5.8,
      'Industrials': 1.9,
    },
    styleBox: { size: 'large', style: 'growth' },
    performance: {
      ytd: 3.8,
      oneYear: 29.2,
      threeYear: 10.1,
      fiveYear: 18.5,
      tenYear: 17.8,
    },
    risk: {
      standardDeviation: 21.5,
      sharpeRatio: 0.95,
      beta: 1.18,
      alpha: 2.1,
    },
  },
  'BND': {
    symbol: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    category: 'Intermediate Core Bond',
    expenseRatio: 0.03,
    morningstarRating: 4,
    holdings: [
      { symbol: 'UST', name: 'U.S. Treasury Bonds', weight: 46.2 },
      { symbol: 'MBS', name: 'Mortgage-Backed Securities', weight: 26.8 },
      { symbol: 'CORP', name: 'Corporate Bonds', weight: 18.5 },
      { symbol: 'GOVT', name: 'Government Related', weight: 5.2 },
      { symbol: 'MUNI', name: 'Municipal Bonds', weight: 0.8 },
      { symbol: 'OTHER', name: 'Other', weight: 2.5 },
    ],
    sectorWeights: {
      'Government': 46.2,
      'Securitized': 26.8,
      'Corporate': 18.5,
      'Government Related': 5.2,
      'Municipal': 0.8,
      'Other': 2.5,
    },
    performance: {
      ytd: -0.8,
      oneYear: 1.2,
      threeYear: -3.5,
      fiveYear: 0.2,
      tenYear: 1.5,
    },
    risk: {
      standardDeviation: 5.8,
      sharpeRatio: 0.12,
      beta: 0.05,
    },
  },
  'VXUS': {
    symbol: 'VXUS',
    name: 'Vanguard Total International Stock ETF',
    category: 'Foreign Large Blend',
    expenseRatio: 0.07,
    morningstarRating: 4,
    holdings: [
      { symbol: 'TSM', name: 'Taiwan Semiconductor', weight: 2.1, country: 'Taiwan' },
      { symbol: 'NESN', name: 'Nestle SA', weight: 1.4, country: 'Switzerland' },
      { symbol: 'ASML', name: 'ASML Holding NV', weight: 1.3, country: 'Netherlands' },
      { symbol: 'NOVO-B', name: 'Novo Nordisk', weight: 1.2, country: 'Denmark' },
      { symbol: 'SHEL', name: 'Shell PLC', weight: 1.1, country: 'United Kingdom' },
      { symbol: 'TM', name: 'Toyota Motor Corp', weight: 1.0, country: 'Japan' },
      { symbol: 'SAP', name: 'SAP SE', weight: 0.9, country: 'Germany' },
      { symbol: 'AZN', name: 'AstraZeneca PLC', weight: 0.9, country: 'United Kingdom' },
      { symbol: 'LVMH', name: 'LVMH Moet Hennessy', weight: 0.8, country: 'France' },
      { symbol: 'ROG', name: 'Roche Holding AG', weight: 0.8, country: 'Switzerland' },
    ],
    sectorWeights: {
      'Financial Services': 19.8,
      'Industrials': 14.2,
      'Technology': 12.5,
      'Healthcare': 10.8,
      'Consumer Cyclical': 10.2,
      'Consumer Defensive': 8.5,
      'Basic Materials': 7.1,
      'Energy': 5.8,
      'Communication Services': 5.2,
      'Utilities': 3.5,
      'Real Estate': 2.4,
    },
    styleBox: { size: 'large', style: 'blend' },
    performance: {
      ytd: 2.1,
      oneYear: 8.5,
      threeYear: 2.8,
      fiveYear: 5.2,
      tenYear: 4.8,
    },
    risk: {
      standardDeviation: 16.2,
      sharpeRatio: 0.42,
      beta: 0.85,
    },
  },
};

// Add more common funds
FUND_DATABASE['SPY'] = {
  ...FUND_DATABASE['VTI'],
  symbol: 'SPY',
  name: 'SPDR S&P 500 ETF Trust',
  expenseRatio: 0.09,
};

FUND_DATABASE['IVV'] = {
  ...FUND_DATABASE['VTI'],
  symbol: 'IVV',
  name: 'iShares Core S&P 500 ETF',
  expenseRatio: 0.03,
};

FUND_DATABASE['VOO'] = {
  ...FUND_DATABASE['VTI'],
  symbol: 'VOO',
  name: 'Vanguard S&P 500 ETF',
  expenseRatio: 0.03,
};

export class MockFundProvider implements FundDataProvider {
  async getFund(symbol: string): Promise<FundData | null> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return FUND_DATABASE[symbol.toUpperCase()] || null;
  }

  async searchFunds(query: string): Promise<FundData[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const q = query.toLowerCase();
    return Object.values(FUND_DATABASE).filter(
      fund => 
        fund.symbol.toLowerCase().includes(q) ||
        fund.name.toLowerCase().includes(q) ||
        fund.category.toLowerCase().includes(q)
    );
  }

  async getHoldings(symbol: string): Promise<FundHolding[]> {
    const fund = await this.getFund(symbol);
    return fund?.holdings || [];
  }

  async compareFunds(symbols: string[]): Promise<FundData[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return symbols
      .map(s => FUND_DATABASE[s.toUpperCase()])
      .filter((f): f is FundData => f !== undefined);
  }

  async getOverlap(fund1: string, fund2: string): Promise<{ overlap: number; sharedHoldings: FundHolding[] }> {
    const [f1, f2] = await Promise.all([this.getFund(fund1), this.getFund(fund2)]);
    
    if (!f1 || !f2) {
      return { overlap: 0, sharedHoldings: [] };
    }

    const symbols1 = new Set(f1.holdings.map(h => h.symbol));
    const shared = f2.holdings.filter(h => symbols1.has(h.symbol));
    
    // Calculate overlap as sum of minimum weights
    let overlapWeight = 0;
    for (const holding of shared) {
      const f1Holding = f1.holdings.find(h => h.symbol === holding.symbol);
      if (f1Holding) {
        overlapWeight += Math.min(holding.weight, f1Holding.weight);
      }
    }

    return {
      overlap: overlapWeight,
      sharedHoldings: shared,
    };
  }
}

export const mockFundProvider = new MockFundProvider();
