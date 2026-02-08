/**
 * FRED (Federal Reserve Economic Data) API Client
 * Free API for economic indicators
 */

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

// Get API key at runtime (not build time)
function getFredApiKey(): string | undefined {
  return process.env.FRED_API_KEY;
}

interface FredObservation {
  date: string;
  value: string;
}

interface FredSeriesResponse {
  observations: FredObservation[];
}

/**
 * Fetch a FRED series
 */
export async function getFredSeries(
  seriesId: string,
  options: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<{ date: string; value: number }[]> {
  const apiKey = getFredApiKey();
  if (!apiKey) {
    console.log('FRED API key not configured, skipping fetch');
    return [];
  }
  
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
    sort_order: options.sortOrder || 'desc',
    limit: String(options.limit || 100),
  });

  if (options.startDate) params.set('observation_start', options.startDate);
  if (options.endDate) params.set('observation_end', options.endDate);

  const url = `${FRED_BASE_URL}/series/observations?${params}`;
  
  try {
    const response = await fetch(url, { cache: 'no-store' }); // Always fetch fresh
    
    if (!response.ok) {
      console.error(`FRED API error for ${seriesId}:`, response.status);
      return [];
    }

    const data: FredSeriesResponse = await response.json();
    
    return data.observations
      .filter(obs => obs.value !== '.')
      .map(obs => ({
        date: obs.date,
        value: parseFloat(obs.value),
      }));
  } catch (error) {
    console.error(`FRED fetch error for ${seriesId}:`, error);
    return [];
  }
}

/**
 * Get latest value for a FRED series
 */
export async function getLatestFredValue(seriesId: string): Promise<number | null> {
  const data = await getFredSeries(seriesId, { limit: 1 });
  return data.length > 0 ? data[0].value : null;
}

/**
 * Key FRED Series IDs for Fragility Index
 */
export const FRED_SERIES = {
  // === VALUATION ===
  WILSHIRE_5000: 'WILL5000PRFC', // Wilshire 5000 Full Cap Price Index
  WILSHIRE_5000_TOTAL: 'WILL5000INDFC', // Wilshire 5000 Total Market Index
  GDP: 'GDP', // Nominal GDP (quarterly, billions)
  
  // === CREDIT SPREADS (CDS Proxies) ===
  HY_SPREAD: 'BAMLH0A0HYM2', // ICE BofA US High Yield OAS
  IG_SPREAD: 'BAMLC0A0CM', // ICE BofA US Corporate Index OAS
  BB_SPREAD: 'BAMLH0A1HYBB', // ICE BofA BB US High Yield OAS
  CCC_SPREAD: 'BAMLH0A3HYC', // ICE BofA CCC & Lower US High Yield OAS (stress indicator)
  AAA_SPREAD: 'BAMLC0A1CAAA', // ICE BofA AAA US Corporate OAS
  BBB_SPREAD: 'BAMLC0A4CBBB', // ICE BofA BBB US Corporate OAS
  EM_SPREAD: 'BAMLEMCBPIOAS', // ICE BofA Emerging Markets Corporate Plus OAS
  
  // === BANKING STRESS ===
  TED_SPREAD: 'TEDRATE', // TED Spread (LIBOR - T-Bill) - banking stress
  COMMERCIAL_PAPER_SPREAD: 'DCPF3M', // 3-Month Commercial Paper Rate
  TREASURY_3M: 'DTB3', // 3-Month Treasury Bill
  REPO_RATE: 'SOFR', // Secured Overnight Financing Rate
  FED_FUNDS: 'FEDFUNDS', // Federal Funds Rate
  
  // === VOLATILITY ===
  VIX: 'VIXCLS', // CBOE VIX
  
  // === YIELD CURVE ===
  YIELD_CURVE_10Y2Y: 'T10Y2Y', // 10-Year minus 2-Year Treasury
  YIELD_CURVE_10Y3M: 'T10Y3M', // 10-Year minus 3-Month Treasury
  TREASURY_10Y: 'DGS10', // 10-Year Treasury
  TREASURY_2Y: 'DGS2', // 2-Year Treasury
  TREASURY_30Y: 'DGS30', // 30-Year Treasury
  
  // === FINANCIAL CONDITIONS ===
  NFCI: 'NFCI', // Chicago Fed National Financial Conditions Index
  NFCI_CREDIT: 'NFCICREDIT', // NFCI Credit Subindex
  NFCI_LEVERAGE: 'NFCILEVERAGE', // NFCI Leverage Subindex
  NFCI_RISK: 'NFCIRISK', // NFCI Risk Subindex
  STLFSI: 'STLFSI4', // St. Louis Fed Financial Stress Index
  
  // === MONEY & LIQUIDITY ===
  M2: 'M2SL', // M2 Money Stock
  M2_VELOCITY: 'M2V', // Velocity of M2
  FED_BALANCE_SHEET: 'WALCL', // Fed Total Assets
  RESERVES: 'TOTRESNS', // Total Reserves (banking system)
  
  // === EMPLOYMENT & ECONOMIC ===
  UNEMPLOYMENT: 'UNRATE', // Unemployment Rate
  INITIAL_CLAIMS: 'ICSA', // Initial Jobless Claims
  CONTINUED_CLAIMS: 'CCSA', // Continued Jobless Claims
  LEI: 'USALOLITONOSTSAM', // Leading Economic Index (OECD)
  
  // === CONSUMER ===
  CONSUMER_SENTIMENT: 'UMCSENT', // U Michigan Consumer Sentiment
  CONSUMER_CONFIDENCE: 'CSCICP03USM665S', // Consumer Confidence Index
  
  // === MANUFACTURING & BUSINESS ===
  ISM_PMI: 'MANEMP', // Manufacturing Employment (proxy)
  CAPACITY_UTILIZATION: 'TCU', // Total Capacity Utilization
  INDUSTRIAL_PRODUCTION: 'INDPRO', // Industrial Production Index
  
  // === HOUSING (leading indicator) ===
  HOUSING_STARTS: 'HOUST', // Housing Starts
  BUILDING_PERMITS: 'PERMIT', // Building Permits
  
  // === INFLATION ===
  BREAKEVEN_5Y: 'T5YIE', // 5-Year Breakeven Inflation Rate
  BREAKEVEN_10Y: 'T10YIE', // 10-Year Breakeven Inflation Rate
  
  // === GLOBAL ===
  DOLLAR_INDEX: 'DTWEXBGS', // Trade Weighted Dollar Index (Broad)
};

/**
 * Fetch multiple FRED series at once
 */
export async function getMultipleFredSeries(
  seriesIds: string[]
): Promise<Record<string, number | null>> {
  const results: Record<string, number | null> = {};
  
  await Promise.all(
    seriesIds.map(async (id) => {
      results[id] = await getLatestFredValue(id);
    })
  );
  
  return results;
}

/**
 * Calculate Buffett Indicator (Market Cap / GDP)
 */
export async function getBuffettIndicator(): Promise<{
  value: number;
  marketCap: number;
  gdp: number;
  date: string;
} | null> {
  try {
    // Get Wilshire 5000 Total Market Index
    const wilshire = await getFredSeries(FRED_SERIES.WILSHIRE_5000_TOTAL, { limit: 5 });
    
    // Get GDP (quarterly, in billions)
    const gdp = await getFredSeries(FRED_SERIES.GDP, { limit: 2 });
    
    if (wilshire.length === 0 || gdp.length === 0) return null;
    
    // WILL5000INDFC is in billions (total market cap)
    // GDP is in billions
    const marketCapBillions = wilshire[0].value;
    const gdpBillions = gdp[0].value;
    
    const buffettIndicator = (marketCapBillions / gdpBillions) * 100;
    
    return {
      value: Math.round(buffettIndicator),
      marketCap: marketCapBillions,
      gdp: gdpBillions,
      date: wilshire[0].date,
    };
  } catch (error) {
    console.error('Buffett indicator error:', error);
    return null;
  }
}

/**
 * Get Credit Spread Dashboard (CDS Proxies)
 */
export async function getCreditSpreads(): Promise<{
  hySpread: number | null;
  igSpread: number | null;
  bbSpread: number | null;
  cccSpread: number | null;
  emSpread: number | null;
  spreadDelta: number | null; // HY - IG spread compression/expansion
}> {
  const [hy, ig, bb, ccc, em] = await Promise.all([
    getLatestFredValue(FRED_SERIES.HY_SPREAD),
    getLatestFredValue(FRED_SERIES.IG_SPREAD),
    getLatestFredValue(FRED_SERIES.BB_SPREAD),
    getLatestFredValue(FRED_SERIES.CCC_SPREAD),
    getLatestFredValue(FRED_SERIES.EM_SPREAD),
  ]);
  
  return {
    hySpread: hy,
    igSpread: ig,
    bbSpread: bb,
    cccSpread: ccc,
    emSpread: em,
    spreadDelta: hy && ig ? hy - ig : null,
  };
}

/**
 * Get Banking Stress Indicators
 */
export async function getBankingStress(): Promise<{
  tedSpread: number | null;
  cpSpread: number | null; // Commercial Paper - T-Bill
  repoRate: number | null;
}> {
  const [ted, cp, tbill, sofr] = await Promise.all([
    getLatestFredValue(FRED_SERIES.TED_SPREAD),
    getLatestFredValue(FRED_SERIES.COMMERCIAL_PAPER_SPREAD),
    getLatestFredValue(FRED_SERIES.TREASURY_3M),
    getLatestFredValue(FRED_SERIES.REPO_RATE),
  ]);
  
  return {
    tedSpread: ted,
    cpSpread: cp && tbill ? cp - tbill : null,
    repoRate: sofr,
  };
}

/**
 * Get Financial Stress Indices
 */
export async function getFinancialStress(): Promise<{
  nfci: number | null;
  nfciCredit: number | null;
  nfciLeverage: number | null;
  nfciRisk: number | null;
  stlfsi: number | null;
}> {
  const [nfci, credit, leverage, risk, stlfsi] = await Promise.all([
    getLatestFredValue(FRED_SERIES.NFCI),
    getLatestFredValue(FRED_SERIES.NFCI_CREDIT),
    getLatestFredValue(FRED_SERIES.NFCI_LEVERAGE),
    getLatestFredValue(FRED_SERIES.NFCI_RISK),
    getLatestFredValue(FRED_SERIES.STLFSI),
  ]);
  
  return { nfci, nfciCredit: credit, nfciLeverage: leverage, nfciRisk: risk, stlfsi };
}

/**
 * Get Economic Leading Indicators
 */
export async function getLeadingIndicators(): Promise<{
  lei: number | null;
  initialClaims: number | null;
  continuedClaims: number | null;
  consumerSentiment: number | null;
  housingStarts: number | null;
  buildingPermits: number | null;
}> {
  const [lei, initial, continued, sentiment, housing, permits] = await Promise.all([
    getLatestFredValue(FRED_SERIES.LEI),
    getLatestFredValue(FRED_SERIES.INITIAL_CLAIMS),
    getLatestFredValue(FRED_SERIES.CONTINUED_CLAIMS),
    getLatestFredValue(FRED_SERIES.CONSUMER_SENTIMENT),
    getLatestFredValue(FRED_SERIES.HOUSING_STARTS),
    getLatestFredValue(FRED_SERIES.BUILDING_PERMITS),
  ]);
  
  return {
    lei,
    initialClaims: initial,
    continuedClaims: continued,
    consumerSentiment: sentiment,
    housingStarts: housing,
    buildingPermits: permits,
  };
}

/**
 * Get Liquidity Indicators
 */
export async function getLiquidityIndicators(): Promise<{
  m2: number | null;
  m2Velocity: number | null;
  fedBalanceSheet: number | null;
  bankReserves: number | null;
}> {
  const [m2, velocity, fed, reserves] = await Promise.all([
    getLatestFredValue(FRED_SERIES.M2),
    getLatestFredValue(FRED_SERIES.M2_VELOCITY),
    getLatestFredValue(FRED_SERIES.FED_BALANCE_SHEET),
    getLatestFredValue(FRED_SERIES.RESERVES),
  ]);
  
  return {
    m2,
    m2Velocity: velocity,
    fedBalanceSheet: fed,
    bankReserves: reserves,
  };
}

/**
 * Get Dollar Strength (global stress indicator)
 */
export async function getDollarIndex(): Promise<number | null> {
  return getLatestFredValue(FRED_SERIES.DOLLAR_INDEX);
}

/**
 * Get Inflation Expectations
 */
export async function getInflationExpectations(): Promise<{
  breakeven5y: number | null;
  breakeven10y: number | null;
}> {
  const [be5, be10] = await Promise.all([
    getLatestFredValue(FRED_SERIES.BREAKEVEN_5Y),
    getLatestFredValue(FRED_SERIES.BREAKEVEN_10Y),
  ]);
  
  return { breakeven5y: be5, breakeven10y: be10 };
}

/**
 * Get ALL fragility-related FRED data in one call
 */
export async function getAllFragilityData(): Promise<{
  buffett: Awaited<ReturnType<typeof getBuffettIndicator>>;
  creditSpreads: Awaited<ReturnType<typeof getCreditSpreads>>;
  bankingStress: Awaited<ReturnType<typeof getBankingStress>>;
  financialStress: Awaited<ReturnType<typeof getFinancialStress>>;
  leadingIndicators: Awaited<ReturnType<typeof getLeadingIndicators>>;
  liquidity: Awaited<ReturnType<typeof getLiquidityIndicators>>;
  dollarIndex: number | null;
  inflation: Awaited<ReturnType<typeof getInflationExpectations>>;
  yieldCurve10y2y: number | null;
  yieldCurve10y3m: number | null;
}> {
  const [
    buffett,
    creditSpreads,
    bankingStress,
    financialStress,
    leadingIndicators,
    liquidity,
    dollarIndex,
    inflation,
    yieldCurve10y2y,
    yieldCurve10y3m,
  ] = await Promise.all([
    getBuffettIndicator(),
    getCreditSpreads(),
    getBankingStress(),
    getFinancialStress(),
    getLeadingIndicators(),
    getLiquidityIndicators(),
    getDollarIndex(),
    getInflationExpectations(),
    getLatestFredValue(FRED_SERIES.YIELD_CURVE_10Y2Y),
    getLatestFredValue(FRED_SERIES.YIELD_CURVE_10Y3M),
  ]);
  
  return {
    buffett,
    creditSpreads,
    bankingStress,
    financialStress,
    leadingIndicators,
    liquidity,
    dollarIndex,
    inflation,
    yieldCurve10y2y,
    yieldCurve10y3m,
  };
}
