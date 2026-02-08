/**
 * Financial Modeling Prep (FMP) API Client
 * Comprehensive financial data for research, analysis, and portfolio insights
 * 
 * NEW API: Uses /stable/ endpoints (v3 deprecated Aug 2025)
 * Docs: https://site.financialmodelingprep.com/developer/docs
 */

const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface FMPProfile {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercentage: number;
  marketCap: number;
  beta: number;
  lastDividend: number;
  range: string;
  volume: number;
  averageVolume: number;
  exchange: string;
  industry: string;
  sector: string;
  description: string;
  ceo: string;
  website: string;
  image: string;
  ipoDate: string;
  country: string;
  fullTimeEmployees: string;
}

interface FMPQuote {
  symbol: string;
  price: number;
  change: number;
  changesPercentage: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number | null;
  pe: number | null;
  earningsAnnouncement: string | null;
  sharesOutstanding: number;
}

interface FMPGradesConsensus {
  symbol: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  consensus: string;
}

interface FMPPriceTargetConsensus {
  symbol: string;
  targetHigh: number;
  targetLow: number;
  targetConsensus: number;
  targetMedian: number;
}

interface FMPIncomeStatement {
  date: string;
  symbol: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  grossProfitRatio: number;
  operatingIncome: number;
  operatingIncomeRatio: number;
  netIncome: number;
  netIncomeRatio: number;
  eps: number;
  epsdiluted: number;
  ebitda: number;
  interestExpense: number;
  researchAndDevelopmentExpenses: number;
}

interface FMPBalanceSheet {
  date: string;
  symbol: string;
  totalAssets: number;
  totalLiabilities: number;
  totalStockholdersEquity: number;
  cashAndCashEquivalents: number;
  shortTermInvestments: number;
  totalDebt: number;
  longTermDebt: number;
  shortTermDebt: number;
  inventory: number;
  netReceivables: number;
  propertyPlantEquipmentNet: number;
  goodwill: number;
  intangibleAssets: number;
  totalCurrentAssets: number;
  totalCurrentLiabilities: number;
}

interface FMPCashFlow {
  date: string;
  symbol: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  dividendsPaid: number | null;
  commonStockRepurchased: number | null;
  debtRepayment: number | null;
  acquisitionsNet: number | null;
  depreciationAndAmortization: number;
  stockBasedCompensation: number;
}

interface FMPFinancialGrowth {
  date: string;
  symbol: string;
  revenueGrowth: number;
  grossProfitGrowth: number;
  operatingIncomeGrowth: number;
  netIncomeGrowth: number;
  epsgrowth: number;
  freeCashFlowGrowth: number;
  assetGrowth: number;
  debtGrowth: number;
  bookValueperShareGrowth: number;
}

interface FMPKeyMetrics {
  date: string;
  symbol: string;
  enterpriseValue: number;
  evToEBITDA: number | null;
  evToSales: number | null;
  evToFreeCashFlow: number | null;
  evToOperatingCashFlow: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  cashRatio: number | null;
  earningsYield: number | null;
  freeCashFlowYield: number | null;
  dividendYield: number | null;
  payoutRatio: number | null;
  grahamNumber: number | null;
  grahamNetNet: number | null;
}

interface FMPRatios {
  date: string;
  symbol: string;
  priceEarningsRatio: number | null;
  priceToBookRatio: number | null;
  priceToSalesRatio: number | null;
  priceToFreeCashFlowsRatio: number | null;
  priceToOperatingCashFlowsRatio: number | null;
  priceFairValue: number | null;
  dividendYield: number | null;
  dividendPayoutRatio: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  returnOnCapitalEmployed: number | null;
  grossProfitMargin: number | null;
  operatingProfitMargin: number | null;
  netProfitMargin: number | null;
  debtRatio: number | null;
  debtEquityRatio: number | null;
  interestCoverage: number | null;
  cashFlowToDebtRatio: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  assetTurnover: number | null;
  inventoryTurnover: number | null;
  receivablesTurnover: number | null;
}

interface FMPHistoricalPrice {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  vwap: number;
}

// =============================================================================
// COMPOSITE TYPES FOR RESEARCH
// =============================================================================

export interface FMPResearchData {
  // Basic info
  symbol: string;
  name: string;
  sector: string | null;
  industry: string | null;
  description: string | null;
  employees: number | null;
  
  // Price data
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fiftyDayAvg: number;
  twoHundredDayAvg: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  
  // Analyst data
  analystRating: string;
  numberOfAnalysts: number;
  strongBuyCount: number;
  buyCount: number;
  holdCount: number;
  sellCount: number;
  strongSellCount: number;
  targetHigh: number;
  targetLow: number;
  targetMean: number;
  targetMedian: number;
  currentToTarget: number;
  
  // Valuation
  peRatio: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  evToEbitda: number | null;
  evToSales: number | null;
  enterpriseValue: number | null;
  
  // Profitability
  grossMargin: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
  roe: number | null;
  roa: number | null;
  roic: number | null;
  
  // Growth
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  fcfGrowth: number | null;
  
  // Financial Health
  currentRatio: number | null;
  quickRatio: number | null;
  debtToEquity: number | null;
  interestCoverage: number | null;
  
  // Cash Flow
  freeCashFlow: number | null;
  operatingCashFlow: number | null;
  fcfYield: number | null;
  
  // Per Share
  eps: number | null;
  bookValuePerShare: number | null;
  
  // Income
  revenue: number | null;
  netIncome: number | null;
  ebitda: number | null;
  
  // Balance Sheet
  totalAssets: number | null;
  totalDebt: number | null;
  cashAndEquivalents: number | null;
  
  // Earnings info
  earningsDate: string | null;
  
  // Dividends
  dividendYield: number | null;
  payoutRatio: number | null;
  
  // Legacy fields for compatibility
  recentUpgradesDowngrades: any[];
  individualPriceTargets: any[];
  nextEarningsEstimate: any | null;
}

export interface FMPCompanySnapshot {
  profile: FMPProfile | null;
  quote: FMPQuote | null;
  grades: FMPGradesConsensus | null;
  priceTargets: FMPPriceTargetConsensus | null;
  incomeStatement: FMPIncomeStatement | null;
  balanceSheet: FMPBalanceSheet | null;
  cashFlow: FMPCashFlow | null;
  growth: FMPFinancialGrowth | null;
  keyMetrics: FMPKeyMetrics | null;
  ratios: FMPRatios | null;
}

// =============================================================================
// FMP CLIENT CLASS
// =============================================================================

class FMPClient {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  private async fetch<T>(endpoint: string): Promise<T | null> {
    try {
      const separator = endpoint.includes('?') ? '&' : '?';
      const url = `${FMP_BASE_URL}${endpoint}${separator}apikey=${this.apiKey}`;
      
      const response = await fetch(url, {
        next: { revalidate: 300 } // Cache for 5 minutes
      });
      
      if (!response.ok) {
        console.error(`FMP API error: ${response.status} for ${endpoint}`);
        return null;
      }
      
      const data = await response.json();
      
      // FMP returns empty arrays for missing data
      if (Array.isArray(data) && data.length === 0) {
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('FMP fetch error:', error);
      return null;
    }
  }
  
  // ==========================================================================
  // BASIC DATA ENDPOINTS
  // ==========================================================================
  
  async getProfile(symbol: string): Promise<FMPProfile | null> {
    const data = await this.fetch<FMPProfile[]>(`/profile?symbol=${symbol}`);
    return data?.[0] || null;
  }
  
  async getQuote(symbol: string): Promise<FMPQuote | null> {
    const data = await this.fetch<FMPQuote[]>(`/quote?symbol=${symbol}`);
    return data?.[0] || null;
  }
  
  async getBatchQuotes(symbols: string[]): Promise<FMPQuote[]> {
    if (symbols.length === 0) return [];
    const data = await this.fetch<FMPQuote[]>(`/quote?symbol=${symbols.join(',')}`);
    return data || [];
  }
  
  // ==========================================================================
  // ANALYST DATA ENDPOINTS
  // ==========================================================================
  
  async getGradesConsensus(symbol: string): Promise<FMPGradesConsensus | null> {
    const data = await this.fetch<FMPGradesConsensus[]>(`/grades-consensus?symbol=${symbol}`);
    return data?.[0] || null;
  }
  
  async getPriceTargetConsensus(symbol: string): Promise<FMPPriceTargetConsensus | null> {
    const data = await this.fetch<FMPPriceTargetConsensus[]>(`/price-target-consensus?symbol=${symbol}`);
    return data?.[0] || null;
  }
  
  // ==========================================================================
  // FINANCIAL STATEMENT ENDPOINTS
  // ==========================================================================
  
  async getIncomeStatement(symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 1): Promise<FMPIncomeStatement | null> {
    const data = await this.fetch<FMPIncomeStatement[]>(`/income-statement?symbol=${symbol}&period=${period}&limit=${limit}`);
    return data?.[0] || null;
  }
  
  async getBalanceSheet(symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 1): Promise<FMPBalanceSheet | null> {
    const data = await this.fetch<FMPBalanceSheet[]>(`/balance-sheet-statement?symbol=${symbol}&period=${period}&limit=${limit}`);
    return data?.[0] || null;
  }
  
  async getCashFlow(symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 1): Promise<FMPCashFlow | null> {
    const data = await this.fetch<FMPCashFlow[]>(`/cash-flow-statement?symbol=${symbol}&period=${period}&limit=${limit}`);
    return data?.[0] || null;
  }
  
  // ==========================================================================
  // METRICS & RATIOS ENDPOINTS
  // ==========================================================================
  
  async getFinancialGrowth(symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 1): Promise<FMPFinancialGrowth | null> {
    const data = await this.fetch<FMPFinancialGrowth[]>(`/financial-growth?symbol=${symbol}&period=${period}&limit=${limit}`);
    return data?.[0] || null;
  }
  
  async getKeyMetrics(symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 1): Promise<FMPKeyMetrics | null> {
    const data = await this.fetch<FMPKeyMetrics[]>(`/key-metrics?symbol=${symbol}&period=${period}&limit=${limit}`);
    return data?.[0] || null;
  }
  
  async getRatios(symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 1): Promise<FMPRatios | null> {
    const data = await this.fetch<FMPRatios[]>(`/ratios?symbol=${symbol}&period=${period}&limit=${limit}`);
    return data?.[0] || null;
  }
  
  // ==========================================================================
  // HISTORICAL DATA ENDPOINTS
  // ==========================================================================
  
  async getHistoricalPrices(symbol: string, from?: string, to?: string): Promise<FMPHistoricalPrice[]> {
    let endpoint = `/historical-price-eod/full?symbol=${symbol}`;
    if (from) endpoint += `&from=${from}`;
    if (to) endpoint += `&to=${to}`;
    
    const data = await this.fetch<FMPHistoricalPrice[]>(endpoint);
    return data || [];
  }
  
  // ==========================================================================
  // COMPOSITE DATA METHODS
  // ==========================================================================
  
  /**
   * Get complete company snapshot with all available data
   */
  async getCompanySnapshot(symbol: string): Promise<FMPCompanySnapshot> {
    const [profile, quote, grades, priceTargets, incomeStatement, balanceSheet, cashFlow, growth, keyMetrics, ratios] = await Promise.all([
      this.getProfile(symbol),
      this.getQuote(symbol),
      this.getGradesConsensus(symbol),
      this.getPriceTargetConsensus(symbol),
      this.getIncomeStatement(symbol),
      this.getBalanceSheet(symbol),
      this.getCashFlow(symbol),
      this.getFinancialGrowth(symbol),
      this.getKeyMetrics(symbol),
      this.getRatios(symbol)
    ]);
    
    return {
      profile,
      quote,
      grades,
      priceTargets,
      incomeStatement,
      balanceSheet,
      cashFlow,
      growth,
      keyMetrics,
      ratios
    };
  }
  
  /**
   * Get comprehensive research data for a symbol
   * This is the main method for the Research tab
   */
  async getResearchData(symbol: string): Promise<FMPResearchData | null> {
    const snapshot = await this.getCompanySnapshot(symbol);
    
    // Need at least profile or quote
    if (!snapshot.profile && !snapshot.quote) {
      return null;
    }
    
    const { profile, quote, grades, priceTargets, incomeStatement, balanceSheet, cashFlow, growth, keyMetrics, ratios } = snapshot;
    
    // Merge profile and quote data
    const currentPrice = profile?.price || quote?.price || 0;
    const previousClose = quote?.previousClose || currentPrice - (profile?.change || 0);
    
    // Parse 52-week range from profile
    let fiftyTwoWeekHigh = quote?.yearHigh || 0;
    let fiftyTwoWeekLow = quote?.yearLow || 0;
    if (profile?.range) {
      const [low, high] = profile.range.split('-').map(s => parseFloat(s.trim()));
      if (!isNaN(low)) fiftyTwoWeekLow = low;
      if (!isNaN(high)) fiftyTwoWeekHigh = high;
    }
    
    // Calculate analyst rating
    const totalAnalysts = grades 
      ? grades.strongBuy + grades.buy + grades.hold + grades.sell + grades.strongSell
      : 0;
    
    let analystRating = 'hold';
    if (grades && totalAnalysts > 0) {
      const buyCount = grades.strongBuy + grades.buy;
      const sellCount = grades.strongSell + grades.sell;
      const buyPercent = buyCount / totalAnalysts;
      const sellPercent = sellCount / totalAnalysts;
      
      if (buyPercent > 0.7) analystRating = 'strong buy';
      else if (buyPercent > 0.5) analystRating = 'buy';
      else if (sellPercent > 0.5) analystRating = 'sell';
      else if (sellPercent > 0.3) analystRating = 'underperform';
      else analystRating = 'hold';
    }
    
    // Calculate upside to target
    const targetMean = priceTargets?.targetConsensus || 0;
    const currentToTarget = targetMean > 0 && currentPrice > 0
      ? ((targetMean - currentPrice) / currentPrice) * 100 
      : 0;
    
    // Calculate P/E if we have EPS
    let peRatio = ratios?.priceEarningsRatio || quote?.pe || null;
    if (!peRatio && incomeStatement?.eps && incomeStatement.eps > 0 && currentPrice > 0) {
      peRatio = currentPrice / incomeStatement.eps;
    }
    
    // Calculate book value per share
    let bookValuePerShare: number | null = null;
    if (balanceSheet?.totalStockholdersEquity && quote?.sharesOutstanding && quote.sharesOutstanding > 0) {
      bookValuePerShare = balanceSheet.totalStockholdersEquity / quote.sharesOutstanding;
    }
    
    // Calculate FCF yield
    let fcfYield: number | null = null;
    const marketCapValue = profile?.marketCap || quote?.marketCap || 0;
    if (cashFlow?.freeCashFlow && marketCapValue > 0) {
      fcfYield = (cashFlow.freeCashFlow / marketCapValue) * 100;
    }
    
    return {
      // Basic info
      symbol: profile?.symbol || quote?.symbol || symbol,
      name: profile?.companyName || symbol,
      sector: profile?.sector || null,
      industry: profile?.industry || null,
      description: profile?.description || null,
      employees: profile?.fullTimeEmployees ? parseInt(profile.fullTimeEmployees) : null,
      
      // Price data
      currentPrice,
      previousClose,
      change: profile?.change || quote?.change || 0,
      changePercent: profile?.changePercentage || quote?.changesPercentage || 0,
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
      fiftyDayAvg: quote?.priceAvg50 || currentPrice * 0.95,
      twoHundredDayAvg: quote?.priceAvg200 || currentPrice * 0.90,
      volume: profile?.volume || quote?.volume || 0,
      avgVolume: profile?.averageVolume || quote?.avgVolume || 0,
      marketCap: marketCapValue,
      
      // Analyst data
      analystRating,
      numberOfAnalysts: totalAnalysts,
      strongBuyCount: grades?.strongBuy || 0,
      buyCount: grades?.buy || 0,
      holdCount: grades?.hold || 0,
      sellCount: grades?.sell || 0,
      strongSellCount: grades?.strongSell || 0,
      targetHigh: priceTargets?.targetHigh || 0,
      targetLow: priceTargets?.targetLow || 0,
      targetMean,
      targetMedian: priceTargets?.targetMedian || 0,
      currentToTarget,
      
      // Valuation
      peRatio,
      pbRatio: ratios?.priceToBookRatio || null,
      psRatio: ratios?.priceToSalesRatio || null,
      evToEbitda: keyMetrics?.evToEBITDA || null,
      evToSales: keyMetrics?.evToSales || null,
      enterpriseValue: keyMetrics?.enterpriseValue || null,
      
      // Profitability
      grossMargin: incomeStatement?.grossProfitRatio ? incomeStatement.grossProfitRatio * 100 : (ratios?.grossProfitMargin ? ratios.grossProfitMargin * 100 : null),
      operatingMargin: incomeStatement?.operatingIncomeRatio ? incomeStatement.operatingIncomeRatio * 100 : (ratios?.operatingProfitMargin ? ratios.operatingProfitMargin * 100 : null),
      netMargin: incomeStatement?.netIncomeRatio ? incomeStatement.netIncomeRatio * 100 : (ratios?.netProfitMargin ? ratios.netProfitMargin * 100 : null),
      roe: ratios?.returnOnEquity ? ratios.returnOnEquity * 100 : null,
      roa: ratios?.returnOnAssets ? ratios.returnOnAssets * 100 : null,
      roic: ratios?.returnOnCapitalEmployed ? ratios.returnOnCapitalEmployed * 100 : null,
      
      // Growth
      revenueGrowth: growth?.revenueGrowth ? growth.revenueGrowth * 100 : null,
      earningsGrowth: growth?.epsgrowth ? growth.epsgrowth * 100 : null,
      fcfGrowth: growth?.freeCashFlowGrowth ? growth.freeCashFlowGrowth * 100 : null,
      
      // Financial Health
      currentRatio: keyMetrics?.currentRatio || ratios?.currentRatio || null,
      quickRatio: keyMetrics?.quickRatio || ratios?.quickRatio || null,
      debtToEquity: ratios?.debtEquityRatio || null,
      interestCoverage: ratios?.interestCoverage || null,
      
      // Cash Flow
      freeCashFlow: cashFlow?.freeCashFlow || null,
      operatingCashFlow: cashFlow?.operatingCashFlow || null,
      fcfYield,
      
      // Per Share
      eps: incomeStatement?.eps || quote?.eps || null,
      bookValuePerShare,
      
      // Income
      revenue: incomeStatement?.revenue || null,
      netIncome: incomeStatement?.netIncome || null,
      ebitda: incomeStatement?.ebitda || null,
      
      // Balance Sheet
      totalAssets: balanceSheet?.totalAssets || null,
      totalDebt: balanceSheet?.totalDebt || null,
      cashAndEquivalents: balanceSheet?.cashAndCashEquivalents || null,
      
      // Earnings
      earningsDate: quote?.earningsAnnouncement || null,
      
      // Dividends
      dividendYield: keyMetrics?.dividendYield ? keyMetrics.dividendYield * 100 : (ratios?.dividendYield ? ratios.dividendYield * 100 : null),
      payoutRatio: keyMetrics?.payoutRatio ? keyMetrics.payoutRatio * 100 : (ratios?.dividendPayoutRatio ? ratios.dividendPayoutRatio * 100 : null),
      
      // Legacy fields
      recentUpgradesDowngrades: [],
      individualPriceTargets: [],
      nextEarningsEstimate: null
    };
  }
  
  /**
   * Get batch research data for multiple symbols (optimized for portfolio view)
   */
  async getBatchResearchData(symbols: string[]): Promise<Map<string, FMPResearchData>> {
    const results = new Map<string, FMPResearchData>();
    
    // Process in parallel with concurrency limit
    const chunks: string[][] = [];
    for (let i = 0; i < symbols.length; i += 5) {
      chunks.push(symbols.slice(i, i + 5));
    }
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(symbol => this.getResearchData(symbol))
      );
      
      chunkResults.forEach((data, index) => {
        if (data) {
          results.set(chunk[index], data);
        }
      });
    }
    
    return results;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let fmpClient: FMPClient | null = null;

export function getFMPClient(): FMPClient | null {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return null;
  }
  
  if (!fmpClient) {
    fmpClient = new FMPClient(apiKey);
  }
  
  return fmpClient;
}

export { FMPClient };
