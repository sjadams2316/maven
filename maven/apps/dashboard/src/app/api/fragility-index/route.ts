import { NextRequest, NextResponse } from 'next/server';
import { calculateFragilityIndex } from '@/lib/fragility-index';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Fetch VIX, VIX3M, VVIX from Yahoo Finance
 */
async function getVolatilityData(): Promise<{
  vix: number | null;
  vix3m: number | null;
  vvix: number | null;
  skew: number | null;
}> {
  try {
    const symbols = ['^VIX', '^VIX3M', '^VVIX', '^SKEW'];
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) return null;
          const data = await res.json();
          return data.chart?.result?.[0]?.meta?.regularMarketPrice || null;
        } catch {
          return null;
        }
      })
    );
    
    return {
      vix: results[0],
      vix3m: results[1],
      vvix: results[2],
      skew: results[3],
    };
  } catch (error) {
    console.error('Volatility fetch error:', error);
    return { vix: null, vix3m: null, vvix: null, skew: null };
  }
}

/**
 * Fetch Fear & Greed Index from CNN
 */
async function getFearGreedIndex(): Promise<number | null> {
  try {
    const url = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' },
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data.fear_and_greed?.score || null;
  } catch (error) {
    console.error('Fear & Greed fetch error:', error);
    return null;
  }
}

/**
 * Fetch Shiller CAPE from Multpl.com (REAL DATA)
 */
async function getShillerCape(): Promise<number | null> {
  try {
    const url = 'https://www.multpl.com/shiller-pe';
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    
    if (!res.ok) return null;
    
    const html = await res.text();
    // Parse "Current Shiller PE Ratio is X.XX"
    const match = html.match(/Current Shiller PE Ratio is (\d+\.?\d*)/);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    return null;
  } catch (error) {
    console.error('CAPE fetch error:', error);
    return null;
  }
}

/**
 * Calculate REAL Buffett Indicator from FRED
 * Formula: (Total Market Cap / GDP) * 100
 * Uses NCBEILQ027S (Market Value of Equities) and GDP
 */
async function getBuffettIndicator(): Promise<{ value: number; marketCap: number; gdp: number } | null> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return null;
  
  try {
    // Fetch both in parallel
    const [marketCapRes, gdpRes] = await Promise.all([
      fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=NCBEILQ027S&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`, { cache: 'no-store' }),
      fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`, { cache: 'no-store' }),
    ]);
    
    if (!marketCapRes.ok || !gdpRes.ok) return null;
    
    const marketCapData = await marketCapRes.json();
    const gdpData = await gdpRes.json();
    
    const marketCapValue = marketCapData.observations?.[0]?.value;
    const gdpValue = gdpData.observations?.[0]?.value;
    
    if (!marketCapValue || !gdpValue || marketCapValue === '.' || gdpValue === '.') return null;
    
    // NCBEILQ027S is in millions, GDP is in billions
    // Convert market cap to billions: divide by 1000
    const marketCapBillions = parseFloat(marketCapValue) / 1000;
    const gdpBillions = parseFloat(gdpValue);
    
    const buffettIndicator = (marketCapBillions / gdpBillions) * 100;
    
    return {
      value: Math.round(buffettIndicator),
      marketCap: marketCapBillions,
      gdp: gdpBillions,
    };
  } catch (error) {
    console.error('Buffett indicator error:', error);
    return null;
  }
}

/**
 * Fetch AAII Sentiment
 */
async function getAAIISentiment(): Promise<{ bullish: number; bearish: number; neutral: number } | null> {
  try {
    // AAII provides weekly data - would need their API or scraping
    // For now, return reasonable estimates
    return null; // Will use estimate
  } catch {
    return null;
  }
}

/**
 * Fetch market breadth from Yahoo (S&P 500 component analysis)
 * This is an approximation
 */
async function getMarketBreadth(): Promise<{
  percentAbove200dma: number;
  percentAbove50dma: number;
} | null> {
  // Would need to analyze all S&P 500 components
  // For now, use approximation based on major indices
  return null;
}

/**
 * Get Bitcoin drawdown for crypto contagion indicator
 */
async function getBtcDrawdown(): Promise<number | null> {
  try {
    // Get BTC price and calculate drawdown from ATH
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?interval=1d&range=1y';
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    
    const data = await res.json();
    const prices = data.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
    if (!prices || prices.length === 0) return null;
    
    const currentPrice = prices[prices.length - 1];
    const maxPrice = Math.max(...prices.filter((p: number | null) => p !== null));
    
    const drawdown = ((maxPrice - currentPrice) / maxPrice) * 100;
    return Math.round(drawdown);
  } catch {
    return null;
  }
}

/**
 * Get S&P 500 top 10 concentration
 * This is updated periodically based on index data
 */
function getTop10Concentration(): number {
  // As of early 2024, top 10 stocks = ~33% of S&P 500
  // This should be updated monthly or fetched from an API
  return 33;
}

/**
 * Estimate market breadth based on recent market conditions
 */
function estimateMarketBreadth(): { above200: number; above50: number } {
  // Would need to calculate from individual stock data
  // Using typical values for current market
  return { above200: 58, above50: 52 };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Direct FRED fetch function (bypasses client for reliability)
    async function directFred(seriesId: string): Promise<number | null> {
      const apiKey = process.env.FRED_API_KEY;
      if (!apiKey) return null;
      try {
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        const value = data.observations?.[0]?.value;
        if (!value || value === '.') return null;
        return parseFloat(value);
      } catch {
        return null;
      }
    }
    
    // Fetch all data sources in parallel - use direct FRED fetches
    const [
      volData,
      fearGreed,
      cape,
      buffett,
      btcDrawdown,
      // FRED data (direct fetches for reliability)
      hySpread,
      igSpread,
      cccSpread,
      emSpread,
      yieldCurve10y2y,
      yieldCurve10y3m,
      nfci,
      stlfsi,
      tedSpread,
      initialClaims,
      consumerSentiment,
      dollarIndex,
    ] = await Promise.all([
      getVolatilityData(),
      getFearGreedIndex(),
      getShillerCape(),
      getBuffettIndicator(),
      getBtcDrawdown(),
      // Credit spreads
      directFred('BAMLH0A0HYM2'), // HY Spread
      directFred('BAMLC0A0CM'), // IG Spread  
      directFred('BAMLH0A3HYC'), // CCC Spread
      directFred('BAMLEMCBPIOAS'), // EM Spread
      // Yield curve
      directFred('T10Y2Y'),
      directFred('T10Y3M'),
      // Financial conditions
      directFred('NFCI'),
      directFred('STLFSI4'),
      directFred('TEDRATE'),
      // Economic
      directFred('ICSA'),
      directFred('UMCSENT'),
      directFred('DTWEXBGS'),
    ]);
    
    // Estimate breadth
    const breadth = estimateMarketBreadth();
    
    // Build comprehensive data object
    const rawData = {
      // === VALUATION ===
      buffettIndicator: buffett?.value || null,
      shillerCape: cape,
      
      // === CREDIT SPREADS (CDS Proxies) ===
      hySpread: hySpread,
      igSpread: igSpread,
      cccSpread: cccSpread,
      emSpread: emSpread,
      
      // === BANKING STRESS ===
      tedSpread: tedSpread,
      nfci: nfci,
      stlfsi: stlfsi,
      
      // === VOLATILITY ===
      vix: volData.vix,
      vix3m: volData.vix3m,
      vvix: volData.vvix,
      skewIndex: volData.skew,
      
      // === SENTIMENT ===
      fearGreedIndex: fearGreed,
      putCallRatio: 0.75, // Would need CBOE data
      
      // === STRUCTURE ===
      top10Concentration: getTop10Concentration(),
      percentAbove200dma: breadth.above200,
      percentAbove50dma: breadth.above50,
      
      // === MACRO ===
      yieldCurve10y2y: yieldCurve10y2y,
      yieldCurve10y3m: yieldCurve10y3m,
      consumerSentiment: consumerSentiment,
      initialClaims: initialClaims,
      
      // === GLOBAL/CONTAGION ===
      dollarIndex: dollarIndex,
      btcDrawdown: btcDrawdown,
    };
    
    // Calculate fragility index
    const fragilityIndex = calculateFragilityIndex(rawData);
    
    // Track data sources
    const dataSources: Record<string, string> = {
      buffettIndicator: buffett ? 'fred (equity value/gdp)' : 'estimate',
      shillerCape: cape ? 'multpl.com (live)' : 'estimate',
      hySpread: hySpread ? 'fred' : 'estimate',
      igSpread: igSpread ? 'fred' : 'estimate',
      cccSpread: cccSpread ? 'fred' : 'estimate',
      emSpread: emSpread ? 'fred' : 'estimate',
      vix: volData.vix ? 'yahoo' : 'estimate',
      vvix: volData.vvix ? 'yahoo' : 'estimate',
      skew: volData.skew ? 'yahoo' : 'estimate',
      fearGreed: fearGreed ? 'cnn' : 'estimate',
      yieldCurve: yieldCurve10y2y ? 'fred' : 'estimate',
      nfci: nfci ? 'fred' : 'estimate',
      stlfsi: stlfsi ? 'fred' : 'estimate',
      tedSpread: tedSpread ? 'fred' : 'estimate',
      consumerSentiment: consumerSentiment ? 'fred' : 'estimate',
      initialClaims: initialClaims ? 'fred' : 'estimate',
      dollarIndex: dollarIndex ? 'fred' : 'estimate',
      btcDrawdown: btcDrawdown ? 'yahoo' : 'estimate',
    };
    
    // Count real vs estimated data
    const realCount = Object.values(dataSources).filter(s => !s.includes('estimate')).length;
    const totalCount = Object.keys(dataSources).length;
    
    const response = {
      ...fragilityIndex,
      dataSources,
      dataQuality: {
        realDataSources: realCount,
        totalSources: totalCount,
        percentReal: Math.round((realCount / totalCount) * 100),
      },
      rawData,
      timing: {
        fetchTimeMs: Date.now() - startTime,
      },
      debug: {
        fredKeyAvailable: !!process.env.FRED_API_KEY,
        fredKeyPrefix: process.env.FRED_API_KEY?.slice(0, 8),
        buffettDetails: buffett ? {
          indicator: buffett.value,
          marketCapBillions: Math.round(buffett.marketCap),
          gdpBillions: Math.round(buffett.gdp),
        } : null,
        capeFromMultpl: cape,
        fredResults: {
          hySpread,
          igSpread,
          cccSpread,
          emSpread,
          yieldCurve10y2y,
          yieldCurve10y3m,
          nfci,
          stlfsi,
          tedSpread,
          consumerSentiment,
          initialClaims,
          dollarIndex,
        },
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Fragility index error:', error);
    
    // Return fallback with conservative estimates
    const fallbackData = {
      buffettIndicator: 180,
      shillerCape: 35,
      hySpread: 320,
      igSpread: 95,
      cccSpread: 900,
      emSpread: 380,
      nfci: -0.3,
      stlfsi: -0.5,
      vix: 15,
      vix3m: 17,
      vvix: 90,
      fearGreedIndex: 55,
      putCallRatio: 0.8,
      top10Concentration: 33,
      percentAbove200dma: 55,
      percentAbove50dma: 50,
      yieldCurve10y2y: 0.3,
      consumerSentiment: 75,
      initialClaims: 220000,
      dollarIndex: 103,
      btcDrawdown: 20,
    };
    
    const fragilityIndex = calculateFragilityIndex(fallbackData);
    
    return NextResponse.json({
      ...fragilityIndex,
      dataSources: { all: 'estimates (api error)' },
      dataQuality: { realDataSources: 0, totalSources: 15, percentReal: 0 },
      rawData: fallbackData,
      error: String(error),
      timing: { fetchTimeMs: Date.now() - startTime },
    });
  }
}
