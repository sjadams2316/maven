import { NextRequest, NextResponse } from 'next/server';
import { getFMPClient, FMPResearchData } from '@/lib/fmp-client';
import { getQuickSentiment } from '@/lib/athena/intelligence';

interface ResearchData extends FMPResearchData {
  // Additional computed fields
  mavenScore: number;
  scoreBreakdown: {
    analystConviction: number;
    valuation: number;
    momentum: number;
    quality: number;
  };
  bullCase: string[];
  bearCase: string[];
  catalysts: string[];
  risks: string[];
  recentNews: { title: string; link: string; publisher: string; date: string }[];
  dataSource: 'fmp' | 'yahoo' | 'simulated';
  // Technical levels
  technicalLevels: {
    support1: number;
    support2: number;
    resistance1: number;
    resistance2: number;
    pivotPoint: number;
  };
  // Quality grade
  qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  valuationGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  growthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  momentumGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

/**
 * Fetch stock data from Yahoo Finance chart API (fallback)
 */
async function fetchYahooData(symbol: string): Promise<any> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo&includePrePost=false`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    next: { revalidate: 300 }
  });
  
  if (!response.ok) return null;
  
  const data = await response.json();
  return data.chart?.result?.[0];
}

/**
 * Fetch news for symbol
 */
async function fetchNews(symbol: string): Promise<{ title: string; link: string; publisher: string; date: string }[]> {
  try {
    const searchUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=5`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const news = searchData.news || [];
      return news.slice(0, 5).map((item: any) => ({
        title: item.title || '',
        link: item.link || '',
        publisher: item.publisher || '',
        date: item.providerPublishTime 
          ? new Date(item.providerPublishTime * 1000).toLocaleDateString()
          : ''
      }));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Calculate letter grade from score
 */
function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

/**
 * Calculate Maven Score and breakdown
 */
function calculateMavenScore(data: {
  buyPercent: number;
  currentToTarget: number;
  momentum: number;
  peRatio?: number | null;
  roe?: number | null;
  netMargin?: number | null;
  revenueGrowth?: number | null;
  earningsGrowth?: number | null;
  currentRatio?: number | null;
  debtToEquity?: number | null;
  hasRealData: boolean;
}): { 
  analystConviction: number; 
  valuation: number; 
  momentum: number; 
  quality: number;
  qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  valuationGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  growthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  momentumGrade: 'A' | 'B' | 'C' | 'D' | 'F';
} {
  // Analyst Conviction (0-100)
  const analystConviction = Math.min(100, Math.round(data.buyPercent * 120));
  
  // Valuation (0-100) based on upside to target
  let valuation = 50;
  if (data.currentToTarget > 30) valuation = 90;
  else if (data.currentToTarget > 20) valuation = 80;
  else if (data.currentToTarget > 10) valuation = 70;
  else if (data.currentToTarget > 0) valuation = 60;
  else if (data.currentToTarget > -10) valuation = 40;
  else if (data.currentToTarget > -20) valuation = 30;
  else valuation = 20;
  
  // Adjust valuation for P/E
  if (data.peRatio && data.peRatio > 0) {
    if (data.peRatio < 12) valuation = Math.min(100, valuation + 15);
    else if (data.peRatio < 18) valuation = Math.min(100, valuation + 10);
    else if (data.peRatio > 40) valuation = Math.max(20, valuation - 15);
    else if (data.peRatio > 30) valuation = Math.max(20, valuation - 10);
  }
  
  // Quality score - based on profitability and financial health
  let quality = 50;
  
  // ROE component
  if (data.roe !== null && data.roe !== undefined) {
    if (data.roe > 25) quality += 15;
    else if (data.roe > 15) quality += 10;
    else if (data.roe > 10) quality += 5;
    else if (data.roe < 0) quality -= 15;
    else if (data.roe < 5) quality -= 5;
  }
  
  // Net margin component
  if (data.netMargin !== null && data.netMargin !== undefined) {
    if (data.netMargin > 20) quality += 15;
    else if (data.netMargin > 10) quality += 10;
    else if (data.netMargin > 5) quality += 5;
    else if (data.netMargin < 0) quality -= 15;
    else if (data.netMargin < 2) quality -= 5;
  }
  
  // Current ratio component
  if (data.currentRatio !== null && data.currentRatio !== undefined) {
    if (data.currentRatio > 2) quality += 5;
    else if (data.currentRatio > 1.5) quality += 3;
    else if (data.currentRatio < 1) quality -= 10;
    else if (data.currentRatio < 0.8) quality -= 15;
  }
  
  // Debt to equity component
  if (data.debtToEquity !== null && data.debtToEquity !== undefined) {
    if (data.debtToEquity < 0.3) quality += 5;
    else if (data.debtToEquity < 0.5) quality += 3;
    else if (data.debtToEquity > 2) quality -= 10;
    else if (data.debtToEquity > 1.5) quality -= 5;
  }
  
  // Boost quality if we have real data
  if (data.hasRealData) quality = Math.min(100, quality + 5);
  
  quality = Math.max(20, Math.min(100, quality));
  
  // Growth score
  let growthScore = 50;
  if (data.revenueGrowth !== null && data.revenueGrowth !== undefined) {
    if (data.revenueGrowth > 25) growthScore += 20;
    else if (data.revenueGrowth > 15) growthScore += 15;
    else if (data.revenueGrowth > 10) growthScore += 10;
    else if (data.revenueGrowth > 5) growthScore += 5;
    else if (data.revenueGrowth < 0) growthScore -= 15;
  }
  
  if (data.earningsGrowth !== null && data.earningsGrowth !== undefined) {
    if (data.earningsGrowth > 30) growthScore += 15;
    else if (data.earningsGrowth > 20) growthScore += 10;
    else if (data.earningsGrowth > 10) growthScore += 5;
    else if (data.earningsGrowth < 0) growthScore -= 10;
  }
  
  growthScore = Math.max(20, Math.min(100, growthScore));
  
  return { 
    analystConviction, 
    valuation, 
    momentum: data.momentum, 
    quality,
    qualityGrade: scoreToGrade(quality),
    valuationGrade: scoreToGrade(valuation),
    growthGrade: scoreToGrade(growthScore),
    momentumGrade: scoreToGrade(data.momentum)
  };
}

/**
 * Calculate technical levels
 */
function calculateTechnicalLevels(data: {
  currentPrice: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fiftyDayAvg: number;
  twoHundredDayAvg: number;
}): {
  support1: number;
  support2: number;
  resistance1: number;
  resistance2: number;
  pivotPoint: number;
} {
  const { currentPrice, fiftyTwoWeekHigh, fiftyTwoWeekLow, fiftyDayAvg, twoHundredDayAvg } = data;
  
  // Classic pivot point calculation
  const pivotPoint = (fiftyTwoWeekHigh + fiftyTwoWeekLow + currentPrice) / 3;
  
  // Support and resistance
  const support1 = Math.min(fiftyDayAvg, twoHundredDayAvg, pivotPoint * 0.95);
  const support2 = fiftyTwoWeekLow;
  const resistance1 = Math.max(fiftyDayAvg, twoHundredDayAvg, pivotPoint * 1.05);
  const resistance2 = fiftyTwoWeekHigh;
  
  return {
    support1: Math.round(support1 * 100) / 100,
    support2: Math.round(support2 * 100) / 100,
    resistance1: Math.round(resistance1 * 100) / 100,
    resistance2: Math.round(resistance2 * 100) / 100,
    pivotPoint: Math.round(pivotPoint * 100) / 100
  };
}

/**
 * Generate analysis
 */
function generateAnalysis(data: {
  symbol: string;
  name: string;
  analystRating: string;
  currentToTarget: number;
  currentPrice: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  peRatio?: number | null;
  earningsDate?: string | null;
  revenueGrowth?: number | null;
  earningsGrowth?: number | null;
  roe?: number | null;
  netMargin?: number | null;
  debtToEquity?: number | null;
  fcfYield?: number | null;
  sector?: string | null;
}): { bullCase: string[]; bearCase: string[]; catalysts: string[]; risks: string[] } {
  const bullCase: string[] = [];
  const bearCase: string[] = [];
  
  // Bull case
  if (data.currentToTarget > 15) {
    bullCase.push(`Significant upside potential: ${data.currentToTarget.toFixed(1)}% to analyst consensus target`);
  } else if (data.currentToTarget > 5) {
    bullCase.push(`Upside to consensus target: ${data.currentToTarget.toFixed(1)}%`);
  }
  
  if (data.analystRating.includes('buy')) {
    bullCase.push('Strong analyst consensus with majority buy ratings');
  }
  
  if (data.currentPrice < data.fiftyTwoWeekHigh * 0.85) {
    bullCase.push(`Trading ${((1 - data.currentPrice / data.fiftyTwoWeekHigh) * 100).toFixed(0)}% below 52-week high — potential recovery`);
  }
  
  if (data.revenueGrowth && data.revenueGrowth > 15) {
    bullCase.push(`Strong revenue growth of ${data.revenueGrowth.toFixed(1)}% YoY`);
  }
  
  if (data.earningsGrowth && data.earningsGrowth > 20) {
    bullCase.push(`Impressive earnings growth of ${data.earningsGrowth.toFixed(1)}% YoY`);
  }
  
  if (data.roe && data.roe > 20) {
    bullCase.push(`High return on equity of ${data.roe.toFixed(1)}%`);
  }
  
  if (data.netMargin && data.netMargin > 15) {
    bullCase.push(`Strong profit margins at ${data.netMargin.toFixed(1)}%`);
  }
  
  if (data.fcfYield && data.fcfYield > 5) {
    bullCase.push(`Attractive free cash flow yield of ${data.fcfYield.toFixed(1)}%`);
  }
  
  if (data.peRatio && data.peRatio > 0 && data.peRatio < 15) {
    bullCase.push(`Reasonable valuation with P/E of ${data.peRatio.toFixed(1)}x`);
  }
  
  // Ensure minimum bull points
  if (bullCase.length < 2) {
    bullCase.push('Established market position and brand recognition');
    if (bullCase.length < 2) bullCase.push('Potential for continued growth');
  }
  
  // Bear case
  if (data.currentToTarget < 0) {
    bearCase.push(`Trading above analyst consensus — ${Math.abs(data.currentToTarget).toFixed(1)}% potential downside`);
  }
  
  if (data.currentPrice > data.fiftyTwoWeekHigh * 0.95) {
    bearCase.push('Trading near 52-week highs — limited near-term upside');
  }
  
  if (data.analystRating === 'hold') {
    bearCase.push('Mixed analyst sentiment suggests caution');
  } else if (data.analystRating.includes('sell')) {
    bearCase.push('Negative analyst consensus — consider reducing exposure');
  }
  
  if (data.revenueGrowth !== null && data.revenueGrowth !== undefined && data.revenueGrowth < 0) {
    bearCase.push(`Revenue declining ${Math.abs(data.revenueGrowth).toFixed(1)}% YoY`);
  }
  
  if (data.debtToEquity && data.debtToEquity > 1.5) {
    bearCase.push(`High debt levels with D/E ratio of ${data.debtToEquity.toFixed(2)}x`);
  }
  
  if (data.peRatio && data.peRatio > 35) {
    bearCase.push(`Elevated valuation at ${data.peRatio.toFixed(1)}x P/E`);
  }
  
  if (data.netMargin !== null && data.netMargin !== undefined && data.netMargin < 5 && data.netMargin >= 0) {
    bearCase.push(`Thin profit margins of only ${data.netMargin.toFixed(1)}%`);
  }
  
  // Ensure minimum bear points
  if (bearCase.length < 2) {
    bearCase.push('Market volatility could impact share price');
    if (bearCase.length < 2) bearCase.push('Competitive pressures in sector');
  }
  
  const catalysts: string[] = [];
  if (data.earningsDate) {
    catalysts.push(`Upcoming earnings: ${data.earningsDate}`);
  }
  catalysts.push('Potential analyst upgrades or price target increases');
  if (data.sector) {
    catalysts.push(`${data.sector} sector tailwinds and growth opportunities`);
  } else {
    catalysts.push('Sector tailwinds and market rotation');
  }
  
  const risks = [
    'Broader market correction could impact valuation',
    'Execution risk on growth initiatives',
    'Macroeconomic uncertainty and rate environment'
  ];
  
  if (data.sector === 'Technology') {
    risks.push('Technology sector regulatory scrutiny');
  }
  
  return {
    bullCase: bullCase.slice(0, 5),
    bearCase: bearCase.slice(0, 5),
    catalysts: catalysts.slice(0, 3),
    risks: risks.slice(0, 4)
  };
}

/**
 * Build research from FMP data
 */
async function buildFromFMP(fmpData: FMPResearchData, news: any[]): Promise<ResearchData> {
  const totalAnalysts = fmpData.numberOfAnalysts;
  const buyCount = fmpData.strongBuyCount + fmpData.buyCount;
  const buyPercent = totalAnalysts > 0 ? buyCount / totalAnalysts : 0.5;
  
  // Calculate momentum from moving averages
  let momentum = 50;
  if (fmpData.currentPrice > fmpData.fiftyDayAvg && fmpData.currentPrice > fmpData.twoHundredDayAvg) {
    momentum = fmpData.fiftyDayAvg > fmpData.twoHundredDayAvg ? 85 : 70;
  } else if (fmpData.currentPrice > fmpData.twoHundredDayAvg) {
    momentum = 55;
  } else if (fmpData.currentPrice < fmpData.fiftyDayAvg && fmpData.currentPrice < fmpData.twoHundredDayAvg) {
    momentum = 25;
  } else {
    momentum = 40;
  }
  
  const scores = calculateMavenScore({
    buyPercent,
    currentToTarget: fmpData.currentToTarget,
    momentum,
    peRatio: fmpData.peRatio,
    roe: fmpData.roe,
    netMargin: fmpData.netMargin,
    revenueGrowth: fmpData.revenueGrowth,
    earningsGrowth: fmpData.earningsGrowth,
    currentRatio: fmpData.currentRatio,
    debtToEquity: fmpData.debtToEquity,
    hasRealData: true
  });
  
  const mavenScore = Math.round(
    scores.analystConviction * 0.30 +
    scores.valuation * 0.25 +
    scores.momentum * 0.20 +
    scores.quality * 0.25
  );
  
  const analysis = generateAnalysis({
    symbol: fmpData.symbol,
    name: fmpData.name,
    analystRating: fmpData.analystRating,
    currentToTarget: fmpData.currentToTarget,
    currentPrice: fmpData.currentPrice,
    fiftyTwoWeekHigh: fmpData.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: fmpData.fiftyTwoWeekLow,
    peRatio: fmpData.peRatio,
    earningsDate: fmpData.earningsDate,
    revenueGrowth: fmpData.revenueGrowth,
    earningsGrowth: fmpData.earningsGrowth,
    roe: fmpData.roe,
    netMargin: fmpData.netMargin,
    debtToEquity: fmpData.debtToEquity,
    fcfYield: fmpData.fcfYield,
    sector: fmpData.sector
  });
  
  const technicalLevels = calculateTechnicalLevels({
    currentPrice: fmpData.currentPrice,
    fiftyTwoWeekHigh: fmpData.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: fmpData.fiftyTwoWeekLow,
    fiftyDayAvg: fmpData.fiftyDayAvg,
    twoHundredDayAvg: fmpData.twoHundredDayAvg
  });
  
  return {
    ...fmpData,
    mavenScore,
    scoreBreakdown: {
      analystConviction: scores.analystConviction,
      valuation: scores.valuation,
      momentum: scores.momentum,
      quality: scores.quality
    },
    qualityGrade: scores.qualityGrade,
    valuationGrade: scores.valuationGrade,
    growthGrade: scores.growthGrade,
    momentumGrade: scores.momentumGrade,
    technicalLevels,
    recentNews: news,
    dataSource: 'fmp',
    ...analysis
  };
}

/**
 * Build research from Yahoo data (fallback)
 */
async function buildFromYahoo(yahooData: any, news: any[]): Promise<ResearchData> {
  const meta = yahooData.meta;
  const quotes = yahooData.indicators?.quote?.[0];
  const closes = quotes?.close?.filter((c: number | null) => c !== null) || [];
  
  const currentPrice = meta.regularMarketPrice;
  const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  
  // Calculate moving averages
  const recentPrices = closes.slice(-50);
  const fiftyDayAvg = recentPrices.reduce((a: number, b: number) => a + b, 0) / recentPrices.length;
  const twoHundredDayAvg = closes.length >= 60 
    ? closes.slice(-60).reduce((a: number, b: number) => a + b, 0) / Math.min(60, closes.length)
    : fiftyDayAvg * 0.95;
  
  // Generate simulated analyst data
  const range = meta.fiftyTwoWeekHigh - meta.fiftyTwoWeekLow;
  const pricePosition = (currentPrice - meta.fiftyTwoWeekLow) / range;
  
  let buyCount, holdCount, sellCount;
  if (pricePosition < 0.3) {
    buyCount = 12; holdCount = 6; sellCount = 2;
  } else if (pricePosition > 0.7) {
    buyCount = 6; holdCount = 10; sellCount = 4;
  } else {
    buyCount = 9; holdCount = 8; sellCount = 3;
  }
  
  const totalAnalysts = buyCount + holdCount + sellCount;
  const buyPercent = buyCount / totalAnalysts;
  
  let analystRating = 'hold';
  if (buyPercent > 0.6) analystRating = 'buy';
  else if (buyPercent > 0.45) analystRating = 'moderate buy';
  
  // Simulated targets
  const midpoint = (meta.fiftyTwoWeekHigh + meta.fiftyTwoWeekLow) / 2;
  const targetMean = (midpoint + meta.fiftyTwoWeekHigh) / 2;
  const targetHigh = meta.fiftyTwoWeekHigh * 1.15;
  const targetLow = midpoint * 0.9;
  const currentToTarget = ((targetMean - currentPrice) / currentPrice) * 100;
  
  // Calculate momentum
  let momentum = 50;
  if (currentPrice > fiftyDayAvg && currentPrice > twoHundredDayAvg) {
    momentum = fiftyDayAvg > twoHundredDayAvg ? 85 : 70;
  } else if (currentPrice > twoHundredDayAvg) {
    momentum = 55;
  } else if (currentPrice < fiftyDayAvg && currentPrice < twoHundredDayAvg) {
    momentum = 25;
  } else {
    momentum = 40;
  }
  
  const scores = calculateMavenScore({
    buyPercent,
    currentToTarget,
    momentum,
    peRatio: null,
    hasRealData: false
  });
  
  const mavenScore = Math.round(
    scores.analystConviction * 0.30 +
    scores.valuation * 0.25 +
    scores.momentum * 0.20 +
    scores.quality * 0.25
  );
  
  const analysis = generateAnalysis({
    symbol: meta.symbol,
    name: meta.longName || meta.shortName || meta.symbol,
    analystRating,
    currentToTarget,
    currentPrice,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow
  });
  
  const technicalLevels = calculateTechnicalLevels({
    currentPrice,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    fiftyDayAvg,
    twoHundredDayAvg
  });
  
  return {
    // Basic info
    symbol: meta.symbol,
    name: meta.longName || meta.shortName || meta.symbol,
    sector: null,
    industry: null,
    description: null,
    employees: null,
    
    // Price data
    currentPrice,
    previousClose,
    change,
    changePercent,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    fiftyDayAvg,
    twoHundredDayAvg,
    volume: meta.regularMarketVolume || 0,
    avgVolume: meta.averageDailyVolume10Day || 0,
    marketCap: 0,
    
    // Analyst data
    analystRating,
    numberOfAnalysts: totalAnalysts,
    strongBuyCount: Math.floor(buyCount * 0.4),
    buyCount,
    holdCount,
    sellCount,
    strongSellCount: Math.floor(sellCount * 0.3),
    targetHigh,
    targetLow,
    targetMean,
    targetMedian: targetMean,
    currentToTarget,
    
    // Valuation (not available)
    peRatio: null,
    pbRatio: null,
    psRatio: null,
    evToEbitda: null,
    evToSales: null,
    enterpriseValue: null,
    
    // Profitability (not available)
    grossMargin: null,
    operatingMargin: null,
    netMargin: null,
    roe: null,
    roa: null,
    roic: null,
    
    // Growth (not available)
    revenueGrowth: null,
    earningsGrowth: null,
    fcfGrowth: null,
    
    // Financial Health (not available)
    currentRatio: null,
    quickRatio: null,
    debtToEquity: null,
    interestCoverage: null,
    
    // Cash Flow (not available)
    freeCashFlow: null,
    operatingCashFlow: null,
    fcfYield: null,
    
    // Per Share (not available)
    eps: null,
    bookValuePerShare: null,
    
    // Income (not available)
    revenue: null,
    netIncome: null,
    ebitda: null,
    
    // Balance Sheet (not available)
    totalAssets: null,
    totalDebt: null,
    cashAndEquivalents: null,
    
    // Earnings
    earningsDate: null,
    
    // Dividends
    dividendYield: null,
    payoutRatio: null,
    
    // Legacy
    recentUpgradesDowngrades: [],
    individualPriceTargets: [],
    nextEarningsEstimate: null,
    
    // Computed
    mavenScore,
    scoreBreakdown: {
      analystConviction: scores.analystConviction,
      valuation: scores.valuation,
      momentum: scores.momentum,
      quality: scores.quality
    },
    qualityGrade: scores.qualityGrade,
    valuationGrade: scores.valuationGrade,
    growthGrade: scores.growthGrade,
    momentumGrade: scores.momentumGrade,
    technicalLevels,
    recentNews: news,
    dataSource: 'simulated',
    ...analysis
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase();
  const includeSentiment = searchParams.get('sentiment') !== 'false'; // Default true
  
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }
  
  try {
    // Fetch news and sentiment in parallel
    const [news, sentiment] = await Promise.all([
      fetchNews(symbol),
      includeSentiment ? getQuickSentiment(symbol).catch(() => null) : Promise.resolve(null),
    ]);
    
    // Try FMP first (real data)
    const fmpClient = getFMPClient();
    if (fmpClient) {
      const fmpData = await fmpClient.getResearchData(symbol);
      if (fmpData) {
        const research = await buildFromFMP(fmpData, news);
        return NextResponse.json({
          ...research,
          // Add social sentiment data
          socialSentiment: sentiment ? {
            sentiment: sentiment.sentiment,
            score: sentiment.score,
            confidence: sentiment.confidence,
            twitterMentions: sentiment.twitterMentions,
            redditMentions: sentiment.redditMentions,
            trending: sentiment.trending,
            lastUpdated: sentiment.lastUpdated,
          } : null,
        });
      }
    }
    
    // Fallback to Yahoo Finance
    const yahooData = await fetchYahooData(symbol);
    if (yahooData) {
      const research = await buildFromYahoo(yahooData, news);
      return NextResponse.json({
        ...research,
        socialSentiment: sentiment ? {
          sentiment: sentiment.sentiment,
          score: sentiment.score,
          confidence: sentiment.confidence,
          twitterMentions: sentiment.twitterMentions,
          redditMentions: sentiment.redditMentions,
          trending: sentiment.trending,
          lastUpdated: sentiment.lastUpdated,
        } : null,
      });
    }
    
    return NextResponse.json({ error: 'Unable to fetch research data' }, { status: 404 });
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json({ error: 'Unable to fetch research data' }, { status: 500 });
  }
}
