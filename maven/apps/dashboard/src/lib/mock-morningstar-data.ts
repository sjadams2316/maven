// Mock Morningstar Data - Demonstrates what we'd have with full data access
// This showcases the depth of analysis possible with institutional data

export interface MorningstarFundData {
  ticker: string;
  name: string;
  category: string;
  morningstarRating: 1 | 2 | 3 | 4 | 5;
  expenseRatio: number;
  aum: number; // in millions
  
  // Style Box (1-9, left-to-right, top-to-bottom)
  // 1=Large Value, 2=Large Blend, 3=Large Growth
  // 4=Mid Value, 5=Mid Blend, 6=Mid Growth
  // 7=Small Value, 8=Small Blend, 9=Small Growth
  styleBox: number;
  
  // Sector Weights (%)
  sectorWeights: {
    basicMaterials: number;
    consumerCyclical: number;
    financialServices: number;
    realEstate: number;
    consumerDefensive: number;
    healthcare: number;
    utilities: number;
    communicationServices: number;
    energy: number;
    industrials: number;
    technology: number;
  };
  
  // Geographic Weights (%)
  geographicWeights: {
    northAmerica: number;
    europe: number;
    asia: number;
    emergingMarkets: number;
    other: number;
  };
  
  // Top Holdings
  topHoldings: Array<{
    name: string;
    ticker: string;
    weight: number;
    sector: string;
  }>;
  
  // Risk Metrics
  riskMetrics: {
    standardDeviation: number;
    sharpeRatio: number;
    beta: number;
    alpha: number;
    rSquared: number;
    maxDrawdown: number;
    upCaptureRatio: number;
    downCaptureRatio: number;
  };
  
  // Performance
  performance: {
    ytd: number;
    oneYear: number;
    threeYear: number;
    fiveYear: number;
    tenYear: number;
    sinceInception: number;
  };
  
  // Factor Exposures (-1 to 1 scale)
  factorExposures: {
    value: number;
    growth: number;
    momentum: number;
    quality: number;
    size: number;      // positive = small cap tilt
    volatility: number; // positive = low vol tilt
    yield: number;
  };
  
  // ESG
  esgRating?: 'Leader' | 'Above Average' | 'Average' | 'Below Average' | 'Laggard';
  carbonRiskScore?: number;
  
  // Tax Efficiency
  taxCostRatio: number;
  turnoverRatio: number;
}

export interface MorningstarStockData {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  
  // Morningstar Proprietary
  fairValue: number;
  starRating: 1 | 2 | 3 | 4 | 5;
  economicMoat: 'None' | 'Narrow' | 'Wide';
  moatTrend: 'Negative' | 'Stable' | 'Positive';
  uncertainty: 'Low' | 'Medium' | 'High' | 'Very High' | 'Extreme';
  capitalAllocation: 'Poor' | 'Standard' | 'Exemplary';
  
  // Stewardship
  stewardshipRating: 'Poor' | 'Standard' | 'Exemplary';
  
  // Financials
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  dividendYield: number;
  
  // Growth
  revenueGrowth5Y: number;
  epsGrowth5Y: number;
  
  // Profitability
  roic: number;
  roe: number;
  netMargin: number;
  
  // Health
  debtToEquity: number;
  currentRatio: number;
  freeCashFlowYield: number;
}

// Sample fund data matching common holdings
export const MOCK_FUND_DATA: Record<string, MorningstarFundData> = {
  'VOO': {
    ticker: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    category: 'Large Blend',
    morningstarRating: 5,
    expenseRatio: 0.03,
    aum: 432000,
    styleBox: 2,
    sectorWeights: {
      technology: 29.5,
      healthcare: 12.8,
      financialServices: 13.1,
      consumerCyclical: 10.2,
      communicationServices: 8.9,
      industrials: 8.5,
      consumerDefensive: 6.2,
      energy: 4.1,
      utilities: 2.4,
      realEstate: 2.3,
      basicMaterials: 2.0,
    },
    geographicWeights: {
      northAmerica: 99.2,
      europe: 0.4,
      asia: 0.3,
      emergingMarkets: 0.1,
      other: 0,
    },
    topHoldings: [
      { name: 'Apple Inc', ticker: 'AAPL', weight: 7.2, sector: 'Technology' },
      { name: 'Microsoft Corp', ticker: 'MSFT', weight: 6.8, sector: 'Technology' },
      { name: 'NVIDIA Corp', ticker: 'NVDA', weight: 5.1, sector: 'Technology' },
      { name: 'Amazon.com Inc', ticker: 'AMZN', weight: 3.8, sector: 'Consumer Cyclical' },
      { name: 'Alphabet Inc A', ticker: 'GOOGL', weight: 2.1, sector: 'Communication Services' },
      { name: 'Meta Platforms Inc', ticker: 'META', weight: 2.0, sector: 'Communication Services' },
      { name: 'Berkshire Hathaway B', ticker: 'BRK.B', weight: 1.8, sector: 'Financial Services' },
      { name: 'Tesla Inc', ticker: 'TSLA', weight: 1.5, sector: 'Consumer Cyclical' },
      { name: 'UnitedHealth Group', ticker: 'UNH', weight: 1.3, sector: 'Healthcare' },
      { name: 'JPMorgan Chase', ticker: 'JPM', weight: 1.2, sector: 'Financial Services' },
    ],
    riskMetrics: {
      standardDeviation: 15.2,
      sharpeRatio: 1.12,
      beta: 1.0,
      alpha: 0.02,
      rSquared: 100,
      maxDrawdown: -23.9,
      upCaptureRatio: 100,
      downCaptureRatio: 100,
    },
    performance: {
      ytd: 4.2,
      oneYear: 28.5,
      threeYear: 11.2,
      fiveYear: 15.8,
      tenYear: 13.1,
      sinceInception: 14.2,
    },
    factorExposures: {
      value: -0.15,
      growth: 0.22,
      momentum: 0.18,
      quality: 0.35,
      size: -0.45,
      volatility: 0.12,
      yield: 0.05,
    },
    esgRating: 'Above Average',
    carbonRiskScore: 7.2,
    taxCostRatio: 0.42,
    turnoverRatio: 2,
  },
  
  'VTI': {
    ticker: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    category: 'Large Blend',
    morningstarRating: 5,
    expenseRatio: 0.03,
    aum: 389000,
    styleBox: 2,
    sectorWeights: {
      technology: 28.1,
      healthcare: 12.5,
      financialServices: 13.4,
      consumerCyclical: 10.5,
      communicationServices: 8.2,
      industrials: 9.1,
      consumerDefensive: 5.9,
      energy: 4.3,
      utilities: 2.6,
      realEstate: 3.1,
      basicMaterials: 2.3,
    },
    geographicWeights: {
      northAmerica: 99.5,
      europe: 0.3,
      asia: 0.2,
      emergingMarkets: 0,
      other: 0,
    },
    topHoldings: [
      { name: 'Apple Inc', ticker: 'AAPL', weight: 6.5, sector: 'Technology' },
      { name: 'Microsoft Corp', ticker: 'MSFT', weight: 6.1, sector: 'Technology' },
      { name: 'NVIDIA Corp', ticker: 'NVDA', weight: 4.6, sector: 'Technology' },
      { name: 'Amazon.com Inc', ticker: 'AMZN', weight: 3.4, sector: 'Consumer Cyclical' },
      { name: 'Alphabet Inc A', ticker: 'GOOGL', weight: 1.9, sector: 'Communication Services' },
      { name: 'Meta Platforms Inc', ticker: 'META', weight: 1.8, sector: 'Communication Services' },
      { name: 'Berkshire Hathaway B', ticker: 'BRK.B', weight: 1.6, sector: 'Financial Services' },
      { name: 'Tesla Inc', ticker: 'TSLA', weight: 1.4, sector: 'Consumer Cyclical' },
      { name: 'UnitedHealth Group', ticker: 'UNH', weight: 1.2, sector: 'Healthcare' },
      { name: 'Eli Lilly', ticker: 'LLY', weight: 1.1, sector: 'Healthcare' },
    ],
    riskMetrics: {
      standardDeviation: 15.8,
      sharpeRatio: 1.08,
      beta: 1.02,
      alpha: -0.01,
      rSquared: 99.2,
      maxDrawdown: -24.5,
      upCaptureRatio: 101,
      downCaptureRatio: 102,
    },
    performance: {
      ytd: 3.9,
      oneYear: 27.2,
      threeYear: 10.8,
      fiveYear: 15.2,
      tenYear: 12.8,
      sinceInception: 9.1,
    },
    factorExposures: {
      value: -0.08,
      growth: 0.15,
      momentum: 0.14,
      quality: 0.28,
      size: -0.32,
      volatility: 0.08,
      yield: 0.04,
    },
    esgRating: 'Above Average',
    carbonRiskScore: 7.5,
    taxCostRatio: 0.38,
    turnoverRatio: 3,
  },
  
  'QQQ': {
    ticker: 'QQQ',
    name: 'Invesco QQQ Trust',
    category: 'Large Growth',
    morningstarRating: 5,
    expenseRatio: 0.20,
    aum: 245000,
    styleBox: 3,
    sectorWeights: {
      technology: 51.2,
      communicationServices: 15.8,
      consumerCyclical: 13.5,
      healthcare: 6.2,
      consumerDefensive: 4.8,
      industrials: 4.5,
      financialServices: 2.1,
      utilities: 1.2,
      energy: 0.4,
      basicMaterials: 0.2,
      realEstate: 0.1,
    },
    geographicWeights: {
      northAmerica: 97.8,
      europe: 1.2,
      asia: 0.8,
      emergingMarkets: 0.2,
      other: 0,
    },
    topHoldings: [
      { name: 'Apple Inc', ticker: 'AAPL', weight: 8.9, sector: 'Technology' },
      { name: 'Microsoft Corp', ticker: 'MSFT', weight: 8.2, sector: 'Technology' },
      { name: 'NVIDIA Corp', ticker: 'NVDA', weight: 7.8, sector: 'Technology' },
      { name: 'Amazon.com Inc', ticker: 'AMZN', weight: 5.2, sector: 'Consumer Cyclical' },
      { name: 'Broadcom Inc', ticker: 'AVGO', weight: 4.8, sector: 'Technology' },
      { name: 'Meta Platforms Inc', ticker: 'META', weight: 4.5, sector: 'Communication Services' },
      { name: 'Tesla Inc', ticker: 'TSLA', weight: 3.2, sector: 'Consumer Cyclical' },
      { name: 'Costco Wholesale', ticker: 'COST', weight: 2.8, sector: 'Consumer Defensive' },
      { name: 'Alphabet Inc A', ticker: 'GOOGL', weight: 2.6, sector: 'Communication Services' },
      { name: 'Alphabet Inc C', ticker: 'GOOG', weight: 2.5, sector: 'Communication Services' },
    ],
    riskMetrics: {
      standardDeviation: 19.8,
      sharpeRatio: 1.21,
      beta: 1.18,
      alpha: 2.45,
      rSquared: 89.5,
      maxDrawdown: -32.6,
      upCaptureRatio: 118,
      downCaptureRatio: 112,
    },
    performance: {
      ytd: 5.8,
      oneYear: 32.4,
      threeYear: 12.8,
      fiveYear: 19.2,
      tenYear: 18.5,
      sinceInception: 11.2,
    },
    factorExposures: {
      value: -0.65,
      growth: 0.78,
      momentum: 0.42,
      quality: 0.52,
      size: -0.58,
      volatility: -0.25,
      yield: -0.45,
    },
    esgRating: 'Average',
    carbonRiskScore: 5.8,
    taxCostRatio: 0.65,
    turnoverRatio: 8,
  },
  
  'VXUS': {
    ticker: 'VXUS',
    name: 'Vanguard Total International Stock ETF',
    category: 'Foreign Large Blend',
    morningstarRating: 4,
    expenseRatio: 0.07,
    aum: 72000,
    styleBox: 2,
    sectorWeights: {
      financialServices: 19.5,
      technology: 13.2,
      industrials: 14.8,
      healthcare: 9.5,
      consumerCyclical: 11.2,
      consumerDefensive: 8.5,
      basicMaterials: 7.2,
      energy: 5.8,
      communicationServices: 5.2,
      utilities: 3.2,
      realEstate: 1.9,
    },
    geographicWeights: {
      northAmerica: 5.2,
      europe: 38.5,
      asia: 28.2,
      emergingMarkets: 25.8,
      other: 2.3,
    },
    topHoldings: [
      { name: 'Taiwan Semiconductor', ticker: 'TSM', weight: 2.1, sector: 'Technology' },
      { name: 'Novo Nordisk', ticker: 'NVO', weight: 1.5, sector: 'Healthcare' },
      { name: 'ASML Holding', ticker: 'ASML', weight: 1.4, sector: 'Technology' },
      { name: 'Samsung Electronics', ticker: '005930.KS', weight: 1.2, sector: 'Technology' },
      { name: 'Nestle SA', ticker: 'NSRGY', weight: 1.1, sector: 'Consumer Defensive' },
      { name: 'Toyota Motor', ticker: 'TM', weight: 0.9, sector: 'Consumer Cyclical' },
      { name: 'Shell PLC', ticker: 'SHEL', weight: 0.8, sector: 'Energy' },
      { name: 'AstraZeneca', ticker: 'AZN', weight: 0.8, sector: 'Healthcare' },
      { name: 'LVMH', ticker: 'MC.PA', weight: 0.7, sector: 'Consumer Cyclical' },
      { name: 'SAP SE', ticker: 'SAP', weight: 0.7, sector: 'Technology' },
    ],
    riskMetrics: {
      standardDeviation: 16.5,
      sharpeRatio: 0.62,
      beta: 0.85,
      alpha: -1.25,
      rSquared: 78.5,
      maxDrawdown: -26.8,
      upCaptureRatio: 82,
      downCaptureRatio: 88,
    },
    performance: {
      ytd: 2.1,
      oneYear: 8.5,
      threeYear: 2.8,
      fiveYear: 5.2,
      tenYear: 4.8,
      sinceInception: 5.1,
    },
    factorExposures: {
      value: 0.25,
      growth: -0.12,
      momentum: -0.08,
      quality: 0.15,
      size: -0.18,
      volatility: 0.22,
      yield: 0.35,
    },
    esgRating: 'Average',
    carbonRiskScore: 9.2,
    taxCostRatio: 0.52,
    turnoverRatio: 4,
  },
  
  'BND': {
    ticker: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    category: 'Intermediate Core Bond',
    morningstarRating: 4,
    expenseRatio: 0.03,
    aum: 112000,
    styleBox: 5, // Not really applicable for bonds
    sectorWeights: {
      financialServices: 0,
      technology: 0,
      industrials: 0,
      healthcare: 0,
      consumerCyclical: 0,
      consumerDefensive: 0,
      basicMaterials: 0,
      energy: 0,
      communicationServices: 0,
      utilities: 0,
      realEstate: 0,
    },
    geographicWeights: {
      northAmerica: 95.5,
      europe: 2.2,
      asia: 1.5,
      emergingMarkets: 0.5,
      other: 0.3,
    },
    topHoldings: [
      { name: 'US Treasury 4.25% 2034', ticker: 'GOVT', weight: 4.2, sector: 'Government' },
      { name: 'US Treasury 4.5% 2029', ticker: 'GOVT', weight: 3.8, sector: 'Government' },
      { name: 'US Treasury 4.125% 2032', ticker: 'GOVT', weight: 3.5, sector: 'Government' },
      { name: 'FNMA 5.0% 2054', ticker: 'MBS', weight: 2.8, sector: 'Mortgage-Backed' },
      { name: 'FNMA 4.5% 2053', ticker: 'MBS', weight: 2.5, sector: 'Mortgage-Backed' },
      { name: 'US Treasury 3.875% 2043', ticker: 'GOVT', weight: 2.2, sector: 'Government' },
      { name: 'FHLMC 5.5% 2054', ticker: 'MBS', weight: 1.9, sector: 'Mortgage-Backed' },
      { name: 'US Treasury 4.75% 2028', ticker: 'GOVT', weight: 1.8, sector: 'Government' },
      { name: 'Apple Inc 3.85% 2043', ticker: 'CORP', weight: 0.3, sector: 'Corporate' },
      { name: 'Microsoft 3.5% 2042', ticker: 'CORP', weight: 0.2, sector: 'Corporate' },
    ],
    riskMetrics: {
      standardDeviation: 5.8,
      sharpeRatio: 0.15,
      beta: 0.02,
      alpha: 0.12,
      rSquared: 2.5,
      maxDrawdown: -17.2,
      upCaptureRatio: 8,
      downCaptureRatio: -5,
    },
    performance: {
      ytd: 0.8,
      oneYear: 4.2,
      threeYear: -2.5,
      fiveYear: 0.2,
      tenYear: 1.5,
      sinceInception: 3.8,
    },
    factorExposures: {
      value: 0,
      growth: 0,
      momentum: -0.05,
      quality: 0.85,
      size: 0,
      volatility: 0.92,
      yield: 0.45,
    },
    esgRating: 'Above Average',
    carbonRiskScore: 2.1,
    taxCostRatio: 1.85,
    turnoverRatio: 45,
  },
  
  'FXAIX': {
    ticker: 'FXAIX',
    name: 'Fidelity 500 Index Fund',
    category: 'Large Blend',
    morningstarRating: 5,
    expenseRatio: 0.015,
    aum: 512000,
    styleBox: 2,
    sectorWeights: {
      technology: 29.5,
      healthcare: 12.8,
      financialServices: 13.1,
      consumerCyclical: 10.2,
      communicationServices: 8.9,
      industrials: 8.5,
      consumerDefensive: 6.2,
      energy: 4.1,
      utilities: 2.4,
      realEstate: 2.3,
      basicMaterials: 2.0,
    },
    geographicWeights: {
      northAmerica: 99.2,
      europe: 0.4,
      asia: 0.3,
      emergingMarkets: 0.1,
      other: 0,
    },
    topHoldings: [
      { name: 'Apple Inc', ticker: 'AAPL', weight: 7.2, sector: 'Technology' },
      { name: 'Microsoft Corp', ticker: 'MSFT', weight: 6.8, sector: 'Technology' },
      { name: 'NVIDIA Corp', ticker: 'NVDA', weight: 5.1, sector: 'Technology' },
      { name: 'Amazon.com Inc', ticker: 'AMZN', weight: 3.8, sector: 'Consumer Cyclical' },
      { name: 'Alphabet Inc A', ticker: 'GOOGL', weight: 2.1, sector: 'Communication Services' },
      { name: 'Meta Platforms Inc', ticker: 'META', weight: 2.0, sector: 'Communication Services' },
      { name: 'Berkshire Hathaway B', ticker: 'BRK.B', weight: 1.8, sector: 'Financial Services' },
      { name: 'Tesla Inc', ticker: 'TSLA', weight: 1.5, sector: 'Consumer Cyclical' },
      { name: 'UnitedHealth Group', ticker: 'UNH', weight: 1.3, sector: 'Healthcare' },
      { name: 'JPMorgan Chase', ticker: 'JPM', weight: 1.2, sector: 'Financial Services' },
    ],
    riskMetrics: {
      standardDeviation: 15.2,
      sharpeRatio: 1.13,
      beta: 1.0,
      alpha: 0.03,
      rSquared: 100,
      maxDrawdown: -23.9,
      upCaptureRatio: 100,
      downCaptureRatio: 100,
    },
    performance: {
      ytd: 4.2,
      oneYear: 28.6,
      threeYear: 11.3,
      fiveYear: 15.9,
      tenYear: 13.2,
      sinceInception: 10.8,
    },
    factorExposures: {
      value: -0.15,
      growth: 0.22,
      momentum: 0.18,
      quality: 0.35,
      size: -0.45,
      volatility: 0.12,
      yield: 0.05,
    },
    esgRating: 'Above Average',
    carbonRiskScore: 7.2,
    taxCostRatio: 0.35,
    turnoverRatio: 2,
  },
  
  'SCHD': {
    ticker: 'SCHD',
    name: 'Schwab US Dividend Equity ETF',
    category: 'Large Value',
    morningstarRating: 5,
    expenseRatio: 0.06,
    aum: 58000,
    styleBox: 1,
    sectorWeights: {
      financialServices: 18.5,
      healthcare: 15.8,
      industrials: 15.2,
      consumerDefensive: 14.5,
      technology: 10.2,
      energy: 8.5,
      consumerCyclical: 6.8,
      communicationServices: 5.2,
      utilities: 3.2,
      basicMaterials: 1.8,
      realEstate: 0.3,
    },
    geographicWeights: {
      northAmerica: 99.8,
      europe: 0.1,
      asia: 0.1,
      emergingMarkets: 0,
      other: 0,
    },
    topHoldings: [
      { name: 'AbbVie Inc', ticker: 'ABBV', weight: 4.5, sector: 'Healthcare' },
      { name: 'Coca-Cola Co', ticker: 'KO', weight: 4.2, sector: 'Consumer Defensive' },
      { name: 'Cisco Systems', ticker: 'CSCO', weight: 4.1, sector: 'Technology' },
      { name: 'Home Depot', ticker: 'HD', weight: 4.0, sector: 'Consumer Cyclical' },
      { name: 'Chevron Corp', ticker: 'CVX', weight: 3.9, sector: 'Energy' },
      { name: 'Verizon Communications', ticker: 'VZ', weight: 3.8, sector: 'Communication Services' },
      { name: 'Pfizer Inc', ticker: 'PFE', weight: 3.6, sector: 'Healthcare' },
      { name: 'PepsiCo Inc', ticker: 'PEP', weight: 3.5, sector: 'Consumer Defensive' },
      { name: 'Merck & Co', ticker: 'MRK', weight: 3.4, sector: 'Healthcare' },
      { name: 'Lockheed Martin', ticker: 'LMT', weight: 3.2, sector: 'Industrials' },
    ],
    riskMetrics: {
      standardDeviation: 13.5,
      sharpeRatio: 0.95,
      beta: 0.82,
      alpha: 1.25,
      rSquared: 85.2,
      maxDrawdown: -19.8,
      upCaptureRatio: 85,
      downCaptureRatio: 78,
    },
    performance: {
      ytd: 2.8,
      oneYear: 18.5,
      threeYear: 9.2,
      fiveYear: 12.8,
      tenYear: 11.5,
      sinceInception: 13.2,
    },
    factorExposures: {
      value: 0.65,
      growth: -0.35,
      momentum: 0.08,
      quality: 0.72,
      size: -0.22,
      volatility: 0.58,
      yield: 0.85,
    },
    esgRating: 'Average',
    carbonRiskScore: 8.5,
    taxCostRatio: 0.82,
    turnoverRatio: 15,
  },
  
  'ARKK': {
    ticker: 'ARKK',
    name: 'ARK Innovation ETF',
    category: 'Mid-Cap Growth',
    morningstarRating: 1,
    expenseRatio: 0.75,
    aum: 6500,
    styleBox: 6,
    sectorWeights: {
      technology: 35.5,
      healthcare: 28.2,
      communicationServices: 15.8,
      consumerCyclical: 12.5,
      financialServices: 5.2,
      industrials: 2.8,
      consumerDefensive: 0,
      energy: 0,
      utilities: 0,
      basicMaterials: 0,
      realEstate: 0,
    },
    geographicWeights: {
      northAmerica: 85.2,
      europe: 8.5,
      asia: 5.2,
      emergingMarkets: 1.1,
      other: 0,
    },
    topHoldings: [
      { name: 'Tesla Inc', ticker: 'TSLA', weight: 11.5, sector: 'Consumer Cyclical' },
      { name: 'Coinbase Global', ticker: 'COIN', weight: 8.2, sector: 'Financial Services' },
      { name: 'Roku Inc', ticker: 'ROKU', weight: 7.8, sector: 'Communication Services' },
      { name: 'Block Inc', ticker: 'SQ', weight: 5.5, sector: 'Technology' },
      { name: 'UiPath Inc', ticker: 'PATH', weight: 5.2, sector: 'Technology' },
      { name: 'Zoom Video', ticker: 'ZM', weight: 4.8, sector: 'Technology' },
      { name: 'CRISPR Therapeutics', ticker: 'CRSP', weight: 4.5, sector: 'Healthcare' },
      { name: 'Exact Sciences', ticker: 'EXAS', weight: 4.2, sector: 'Healthcare' },
      { name: 'Shopify Inc', ticker: 'SHOP', weight: 3.8, sector: 'Technology' },
      { name: 'Roblox Corp', ticker: 'RBLX', weight: 3.5, sector: 'Communication Services' },
    ],
    riskMetrics: {
      standardDeviation: 42.5,
      sharpeRatio: -0.25,
      beta: 1.85,
      alpha: -12.5,
      rSquared: 62.5,
      maxDrawdown: -78.2,
      upCaptureRatio: 145,
      downCaptureRatio: 185,
    },
    performance: {
      ytd: -8.5,
      oneYear: 15.2,
      threeYear: -22.5,
      fiveYear: -5.2,
      tenYear: 0, // Not 10 years old
      sinceInception: 12.8,
    },
    factorExposures: {
      value: -0.92,
      growth: 0.95,
      momentum: -0.35,
      quality: -0.45,
      size: 0.65,
      volatility: -0.88,
      yield: -0.85,
    },
    esgRating: 'Below Average',
    carbonRiskScore: 4.2,
    taxCostRatio: 2.85,
    turnoverRatio: 85,
  },
};

// Sample stock data for individual holdings
export const MOCK_STOCK_DATA: Record<string, MorningstarStockData> = {
  'AAPL': {
    ticker: 'AAPL',
    name: 'Apple Inc',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    fairValue: 185,
    starRating: 3,
    economicMoat: 'Wide',
    moatTrend: 'Stable',
    uncertainty: 'Medium',
    capitalAllocation: 'Exemplary',
    stewardshipRating: 'Exemplary',
    marketCap: 2850000,
    peRatio: 28.5,
    pbRatio: 45.2,
    dividendYield: 0.52,
    revenueGrowth5Y: 8.2,
    epsGrowth5Y: 12.5,
    roic: 52.8,
    roe: 145.2,
    netMargin: 25.8,
    debtToEquity: 1.52,
    currentRatio: 0.98,
    freeCashFlowYield: 3.85,
  },
  
  'NVDA': {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    industry: 'Semiconductors',
    fairValue: 145,
    starRating: 2,
    economicMoat: 'Wide',
    moatTrend: 'Positive',
    uncertainty: 'High',
    capitalAllocation: 'Exemplary',
    stewardshipRating: 'Exemplary',
    marketCap: 3200000,
    peRatio: 62.5,
    pbRatio: 52.8,
    dividendYield: 0.02,
    revenueGrowth5Y: 45.2,
    epsGrowth5Y: 68.5,
    roic: 85.2,
    roe: 125.8,
    netMargin: 55.8,
    debtToEquity: 0.41,
    currentRatio: 4.25,
    freeCashFlowYield: 2.15,
  },
  
  'MSFT': {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    industry: 'Software - Infrastructure',
    fairValue: 420,
    starRating: 3,
    economicMoat: 'Wide',
    moatTrend: 'Stable',
    uncertainty: 'Medium',
    capitalAllocation: 'Exemplary',
    stewardshipRating: 'Exemplary',
    marketCap: 3050000,
    peRatio: 35.2,
    pbRatio: 12.5,
    dividendYield: 0.72,
    revenueGrowth5Y: 14.5,
    epsGrowth5Y: 18.2,
    roic: 28.5,
    roe: 38.2,
    netMargin: 35.5,
    debtToEquity: 0.35,
    currentRatio: 1.85,
    freeCashFlowYield: 2.85,
  },
  
  'CIFR': {
    ticker: 'CIFR',
    name: 'Cipher Mining Inc',
    sector: 'Technology',
    industry: 'Software - Infrastructure',
    fairValue: 8.50,
    starRating: 4,
    economicMoat: 'None',
    moatTrend: 'Stable',
    uncertainty: 'Very High',
    capitalAllocation: 'Standard',
    stewardshipRating: 'Standard',
    marketCap: 2800,
    peRatio: -15.2, // Negative (losses)
    pbRatio: 2.85,
    dividendYield: 0,
    revenueGrowth5Y: 125.5,
    epsGrowth5Y: 0, // Not profitable yet
    roic: -8.5,
    roe: -12.5,
    netMargin: -25.2,
    debtToEquity: 0.15,
    currentRatio: 3.52,
    freeCashFlowYield: -5.2,
  },
  
  'IREN': {
    ticker: 'IREN',
    name: 'Iris Energy Limited',
    sector: 'Technology',
    industry: 'Software - Infrastructure',
    fairValue: 15.50,
    starRating: 4,
    economicMoat: 'None',
    moatTrend: 'Stable',
    uncertainty: 'Very High',
    capitalAllocation: 'Standard',
    stewardshipRating: 'Standard',
    marketCap: 3200,
    peRatio: 45.2,
    pbRatio: 3.85,
    dividendYield: 0,
    revenueGrowth5Y: 185.2,
    epsGrowth5Y: 250.5,
    roic: 12.5,
    roe: 18.2,
    netMargin: 15.5,
    debtToEquity: 0.08,
    currentRatio: 5.85,
    freeCashFlowYield: 2.85,
  },
};

// Helper function to get all unique holdings across funds
export function getAggregatedHoldings(
  portfolioFunds: Array<{ ticker: string; shares: number; value: number }>
): Map<string, { totalWeight: number; funds: string[]; name: string; sector: string }> {
  const holdingsMap = new Map<string, { totalWeight: number; funds: string[]; name: string; sector: string }>();
  
  const totalPortfolioValue = portfolioFunds.reduce((sum, f) => sum + f.value, 0);
  
  for (const fund of portfolioFunds) {
    const fundData = MOCK_FUND_DATA[fund.ticker];
    if (!fundData) continue;
    
    const fundWeight = fund.value / totalPortfolioValue;
    
    for (const holding of fundData.topHoldings) {
      const effectiveWeight = (holding.weight / 100) * fundWeight * 100;
      
      const existing = holdingsMap.get(holding.ticker);
      if (existing) {
        existing.totalWeight += effectiveWeight;
        if (!existing.funds.includes(fund.ticker)) {
          existing.funds.push(fund.ticker);
        }
      } else {
        holdingsMap.set(holding.ticker, {
          totalWeight: effectiveWeight,
          funds: [fund.ticker],
          name: holding.name,
          sector: holding.sector,
        });
      }
    }
  }
  
  return holdingsMap;
}

// Helper to calculate aggregate sector exposure
export function getAggregateSectorExposure(
  portfolioFunds: Array<{ ticker: string; value: number }>
): Record<string, number> {
  const totalValue = portfolioFunds.reduce((sum, f) => sum + f.value, 0);
  const sectors: Record<string, number> = {};
  
  for (const fund of portfolioFunds) {
    const fundData = MOCK_FUND_DATA[fund.ticker];
    if (!fundData) continue;
    
    const fundWeight = fund.value / totalValue;
    
    for (const [sector, weight] of Object.entries(fundData.sectorWeights)) {
      sectors[sector] = (sectors[sector] || 0) + weight * fundWeight;
    }
  }
  
  return sectors;
}

// Helper to calculate aggregate geographic exposure
export function getAggregateGeographicExposure(
  portfolioFunds: Array<{ ticker: string; value: number }>
): Record<string, number> {
  const totalValue = portfolioFunds.reduce((sum, f) => sum + f.value, 0);
  const regions: Record<string, number> = {};
  
  for (const fund of portfolioFunds) {
    const fundData = MOCK_FUND_DATA[fund.ticker];
    if (!fundData) continue;
    
    const fundWeight = fund.value / totalValue;
    
    for (const [region, weight] of Object.entries(fundData.geographicWeights)) {
      regions[region] = (regions[region] || 0) + weight * fundWeight;
    }
  }
  
  return regions;
}

// Helper to calculate aggregate factor exposures
export function getAggregateFactorExposures(
  portfolioFunds: Array<{ ticker: string; value: number }>
): Record<string, number> {
  const totalValue = portfolioFunds.reduce((sum, f) => sum + f.value, 0);
  const factors: Record<string, number> = {
    value: 0,
    growth: 0,
    momentum: 0,
    quality: 0,
    size: 0,
    volatility: 0,
    yield: 0,
  };
  
  for (const fund of portfolioFunds) {
    const fundData = MOCK_FUND_DATA[fund.ticker];
    if (!fundData) continue;
    
    const fundWeight = fund.value / totalValue;
    
    for (const [factor, exposure] of Object.entries(fundData.factorExposures)) {
      factors[factor] += exposure * fundWeight;
    }
  }
  
  return factors;
}

// Tax-loss harvesting pairs (similar funds)
export const TAX_LOSS_HARVESTING_PAIRS: Record<string, string[]> = {
  'VOO': ['IVV', 'SPY', 'SPLG'],
  'VTI': ['ITOT', 'SCHB', 'SPTM'],
  'QQQ': ['QQQM', 'ONEQ', 'VGT'],
  'VXUS': ['IXUS', 'SCHF', 'IEFA'],
  'BND': ['AGG', 'SCHZ', 'IUSB'],
  'SCHD': ['VYM', 'DVY', 'HDV'],
};

// Model portfolios for comparison
export const MODEL_PORTFOLIOS = {
  conservative: {
    name: 'Conservative',
    description: 'Lower risk, focus on capital preservation',
    allocation: {
      usEquity: 25,
      intlEquity: 10,
      bonds: 50,
      cash: 10,
      alternatives: 5,
    },
    expectedReturn: 5.5,
    standardDeviation: 7.2,
  },
  moderate: {
    name: 'Moderate',
    description: 'Balanced growth and income',
    allocation: {
      usEquity: 40,
      intlEquity: 15,
      bonds: 35,
      cash: 5,
      alternatives: 5,
    },
    expectedReturn: 7.2,
    standardDeviation: 11.5,
  },
  growth: {
    name: 'Growth',
    description: 'Higher growth potential, more volatility',
    allocation: {
      usEquity: 55,
      intlEquity: 20,
      bonds: 15,
      cash: 5,
      alternatives: 5,
    },
    expectedReturn: 8.8,
    standardDeviation: 15.2,
  },
  aggressive: {
    name: 'Aggressive Growth',
    description: 'Maximum growth, highest volatility',
    allocation: {
      usEquity: 65,
      intlEquity: 25,
      bonds: 5,
      cash: 0,
      alternatives: 5,
    },
    expectedReturn: 10.2,
    standardDeviation: 18.5,
  },
};
