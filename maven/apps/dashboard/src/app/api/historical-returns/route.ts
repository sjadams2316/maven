import { NextRequest, NextResponse } from 'next/server';

const FRED_API_KEY = process.env.FRED_API_KEY;

// Cache for historical data
let cache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch S&P 500 returns from FRED
 * Series: SP500 (S&P 500 Index)
 */
async function fetchSP500FromFRED(): Promise<number[] | null> {
  if (!FRED_API_KEY) return null;
  
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = '1927-01-01';
    
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=SP500&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}&observation_end=${endDate}&frequency=a`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    const observations = data.observations || [];
    
    // Convert to annual returns
    const returns: number[] = [];
    for (let i = 1; i < observations.length; i++) {
      const prevValue = parseFloat(observations[i - 1].value);
      const currValue = parseFloat(observations[i].value);
      if (!isNaN(prevValue) && !isNaN(currValue) && prevValue > 0) {
        returns.push((currValue - prevValue) / prevValue);
      }
    }
    
    return returns;
  } catch (error) {
    console.error('FRED SP500 fetch error:', error);
    return null;
  }
}

/**
 * Fetch 10-Year Treasury yield from FRED
 * Series: DGS10 (10-Year Treasury Constant Maturity Rate)
 */
async function fetchTreasuryFromFRED(): Promise<number[] | null> {
  if (!FRED_API_KEY) return null;
  
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = '1962-01-01'; // DGS10 starts in 1962
    
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}&observation_end=${endDate}&frequency=a`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    const observations = data.observations || [];
    
    // Convert yield to approximate return (simplified)
    // Bond return ≈ yield - duration × yield_change
    const returns: number[] = [];
    const duration = 8; // Approximate duration for 10Y
    
    for (let i = 1; i < observations.length; i++) {
      const prevYield = parseFloat(observations[i - 1].value) / 100;
      const currYield = parseFloat(observations[i].value) / 100;
      if (!isNaN(prevYield) && !isNaN(currYield)) {
        const yieldReturn = prevYield;
        const priceReturn = -duration * (currYield - prevYield);
        returns.push(yieldReturn + priceReturn);
      }
    }
    
    return returns;
  } catch (error) {
    console.error('FRED Treasury fetch error:', error);
    return null;
  }
}

/**
 * Fetch CPI Inflation from FRED
 * Series: CPIAUCSL (Consumer Price Index for All Urban Consumers)
 */
async function fetchInflationFromFRED(): Promise<number[] | null> {
  if (!FRED_API_KEY) return null;
  
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = '1913-01-01';
    
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}&observation_end=${endDate}&frequency=a`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    const observations = data.observations || [];
    
    // Convert to annual inflation rate
    const returns: number[] = [];
    for (let i = 1; i < observations.length; i++) {
      const prevValue = parseFloat(observations[i - 1].value);
      const currValue = parseFloat(observations[i].value);
      if (!isNaN(prevValue) && !isNaN(currValue) && prevValue > 0) {
        returns.push((currValue - prevValue) / prevValue);
      }
    }
    
    return returns;
  } catch (error) {
    console.error('FRED CPI fetch error:', error);
    return null;
  }
}

/**
 * Fetch VIX (Volatility Index) from FRED
 * Series: VIXCLS
 */
async function fetchVIXFromFRED(): Promise<{ current: number; average: number } | null> {
  if (!FRED_API_KEY) return null;
  
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = '1990-01-01';
    
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=VIXCLS&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}&observation_end=${endDate}&sort_order=desc&limit=252`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    const observations = data.observations || [];
    
    if (observations.length === 0) return null;
    
    const current = parseFloat(observations[0].value);
    const values = observations
      .map((o: any) => parseFloat(o.value))
      .filter((v: number) => !isNaN(v));
    const average = values.reduce((a: number, b: number) => a + b, 0) / values.length;
    
    return { current, average };
  } catch (error) {
    console.error('FRED VIX fetch error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }
  
  try {
    // Fetch all data in parallel
    const [sp500, treasury, inflation, vix] = await Promise.all([
      fetchSP500FromFRED(),
      fetchTreasuryFromFRED(),
      fetchInflationFromFRED(),
      fetchVIXFromFRED(),
    ]);
    
    // Calculate statistics
    const calcStats = (arr: number[] | null) => {
      if (!arr || arr.length === 0) return null;
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const variance = arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / arr.length;
      return {
        mean,
        stdDev: Math.sqrt(variance),
        min: Math.min(...arr),
        max: Math.max(...arr),
        count: arr.length,
      };
    };
    
    const responseData = {
      timestamp: new Date().toISOString(),
      source: 'FRED',
      fredApiAvailable: !!FRED_API_KEY,
      sp500: {
        returns: sp500,
        stats: calcStats(sp500),
        lastUpdated: sp500 ? new Date().toISOString() : null,
      },
      treasury: {
        returns: treasury,
        stats: calcStats(treasury),
        lastUpdated: treasury ? new Date().toISOString() : null,
      },
      inflation: {
        returns: inflation,
        stats: calcStats(inflation),
        lastUpdated: inflation ? new Date().toISOString() : null,
      },
      vix: vix,
      methodology: {
        sp500: 'Annual total returns calculated from FRED SP500 series',
        treasury: 'Approximate returns from 10Y yield changes with duration adjustment',
        inflation: 'Annual CPI change from CPIAUCSL series',
      },
    };
    
    // Update cache
    cache = {
      data: responseData,
      timestamp: Date.now(),
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Historical returns API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data', fredApiAvailable: !!FRED_API_KEY },
      { status: 500 }
    );
  }
}
