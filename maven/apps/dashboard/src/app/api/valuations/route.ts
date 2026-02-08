import { NextRequest, NextResponse } from 'next/server';

const FRED_API_KEY = process.env.FRED_API_KEY;

// Cache
let cache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

interface FREDObservation {
  date: string;
  value: string;
}

async function fetchFREDSeries(seriesId: string, limit: number = 1): Promise<number | null> {
  if (!FRED_API_KEY) return null;
  
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=${limit}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    const observations: FREDObservation[] = data.observations || [];
    
    // Find first non-null value
    for (const obs of observations) {
      const value = parseFloat(obs.value);
      if (!isNaN(value)) {
        return value;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`FRED fetch error for ${seriesId}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }
  
  try {
    // Fetch multiple indicators in parallel
    const [
      sp500PE,
      treasury10Y,
      treasury2Y,
      fedFunds,
      cpi,
      unemployment,
      gdp,
      vix,
      wilshireGDP,
    ] = await Promise.all([
      fetchFREDSeries('MULTPL/SP500_PE_RATIO_MONTH', 1), // Shiller PE (approximation)
      fetchFREDSeries('DGS10', 10), // 10-Year Treasury
      fetchFREDSeries('DGS2', 10), // 2-Year Treasury  
      fetchFREDSeries('FEDFUNDS', 1), // Fed Funds Rate
      fetchFREDSeries('CPIAUCSL', 13), // CPI (need 12 months for YoY)
      fetchFREDSeries('UNRATE', 1), // Unemployment Rate
      fetchFREDSeries('GDP', 1), // GDP (quarterly)
      fetchFREDSeries('VIXCLS', 5), // VIX
      fetchFREDSeries('WILL5000INDFC', 1), // Wilshire 5000 (for Buffett indicator)
    ]);
    
    // Calculate derived metrics
    const yieldCurveSpread = treasury10Y && treasury2Y ? treasury10Y - treasury2Y : null;
    
    // Estimate CAPE (use P/E as proxy, actual CAPE requires 10-year earnings)
    // Multiply by ~1.5 to approximate CAPE from trailing P/E
    const estimatedCAPE = sp500PE ? sp500PE * 1.3 : 35; // Default to current ~35
    
    // Calculate Buffett Indicator (market cap / GDP)
    // Wilshire 5000 is roughly total market cap in billions
    // GDP is in billions
    const buffettIndicator = wilshireGDP && gdp ? wilshireGDP / gdp : 1.7;
    
    // Earnings yield (inverse of P/E)
    const earningsYield = sp500PE ? 1 / sp500PE : 0.04;
    
    // Fed Model spread
    const fedModelSpread = treasury10Y ? earningsYield - (treasury10Y / 100) : null;
    
    const responseData = {
      timestamp: new Date().toISOString(),
      source: 'FRED',
      fredApiAvailable: !!FRED_API_KEY,
      
      // Raw indicators
      indicators: {
        cape: estimatedCAPE,
        trailingPE: sp500PE,
        treasury10Y: treasury10Y ? treasury10Y / 100 : null,
        treasury2Y: treasury2Y ? treasury2Y / 100 : null,
        fedFundsRate: fedFunds ? fedFunds / 100 : null,
        unemployment: unemployment,
        vix: vix,
      },
      
      // Derived metrics
      derived: {
        yieldCurveSpread: yieldCurveSpread,
        isYieldCurveInverted: yieldCurveSpread !== null && yieldCurveSpread < 0,
        buffettIndicator: buffettIndicator,
        earningsYield: earningsYield,
        fedModelSpread: fedModelSpread,
        fedModelFavorsStocks: fedModelSpread !== null && fedModelSpread > 0,
      },
      
      // Assessment
      assessment: {
        valuation: getValuationLevel(estimatedCAPE),
        expectedRealReturn: estimateReturn(estimatedCAPE),
        riskLevel: assessRiskLevel(vix, yieldCurveSpread, estimatedCAPE),
      },
    };
    
    // Update cache
    cache = {
      data: responseData,
      timestamp: Date.now(),
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Valuations API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch valuation data', 
        fredApiAvailable: !!FRED_API_KEY,
        // Return defaults
        indicators: {
          cape: 35,
          treasury10Y: 0.045,
          vix: 15,
        },
        assessment: {
          valuation: 'expensive',
          expectedRealReturn: 0.04,
          riskLevel: 'moderate',
        }
      },
      { status: 200 } // Return 200 with defaults rather than error
    );
  }
}

function getValuationLevel(cape: number): string {
  if (cape < 15) return 'cheap';
  if (cape < 20) return 'fair';
  if (cape < 30) return 'expensive';
  return 'very_expensive';
}

function estimateReturn(cape: number): number {
  // Earnings yield approach
  return Math.max(0.02, Math.min(0.12, 1 / cape + 0.01));
}

function assessRiskLevel(
  vix: number | null, 
  yieldCurveSpread: number | null, 
  cape: number
): string {
  let riskScore = 0;
  
  if (vix && vix > 25) riskScore += 1;
  if (vix && vix > 35) riskScore += 1;
  if (yieldCurveSpread !== null && yieldCurveSpread < 0) riskScore += 2;
  if (cape > 30) riskScore += 1;
  if (cape > 40) riskScore += 1;
  
  if (riskScore >= 4) return 'high';
  if (riskScore >= 2) return 'elevated';
  if (riskScore >= 1) return 'moderate';
  return 'low';
}
