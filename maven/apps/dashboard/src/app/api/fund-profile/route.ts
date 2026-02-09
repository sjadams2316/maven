import { NextRequest, NextResponse } from 'next/server';
import { classifyByMorningstarCategory, toSimpleClass, PrimaryAssetClass } from '@/lib/asset-classification';

/**
 * FUND PROFILE API - Real-time Morningstar data from Yahoo Finance
 * 
 * Fetches comprehensive fund/ETF data including:
 * - Morningstar category, star rating, risk rating
 * - Asset allocation (stocks/bonds/cash/other)
 * - Geographic breakdown (US/International/Emerging)
 * - Sector breakdown
 * - Top holdings
 */

// Cache fund profiles (4 hour TTL - balance freshness vs API calls)
const profileCache = new Map<string, { data: FundProfile; timestamp: number }>();
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

export interface FundProfile {
  ticker: string;
  name: string;
  type: 'stock' | 'etf' | 'mutual_fund' | 'crypto' | 'cash' | 'unknown';
  
  // Morningstar data
  morningstar?: {
    category?: string;        // e.g., "World Large-Stock Growth"
    categoryGroup?: string;   // e.g., "World Stock"
    starRating?: number;      // 1-5
    riskRating?: string;      // "Low", "Below Average", "Average", "Above Average", "High"
    styleBox?: string;        // e.g., "Large Growth"
  };
  
  // Asset allocation (percentages)
  assetAllocation: {
    stocks: number;
    bonds: number;
    cash: number;
    other: number;
  };
  
  // Geographic breakdown (percentages of equity portion)
  geography: {
    us: number;
    developed: number;       // ex-US developed markets
    emerging: number;
  };
  
  // Computed primary classification for portfolio view
  primaryClass: 'usEquity' | 'intlEquity' | 'bonds' | 'cash' | 'crypto' | 'other';
  
  // Sector breakdown (if available)
  sectors?: {
    name: string;
    weight: number;
  }[];
  
  // Top holdings (if available)
  topHoldings?: {
    name: string;
    ticker?: string;
    weight: number;
  }[];
  
  // Performance (if available)
  performance?: {
    ytd?: number;
    oneYear?: number;
    threeYear?: number;
    fiveYear?: number;
  };
  
  // Fund details
  expenseRatio?: number;
  aum?: number;              // Assets under management
  inceptionDate?: string;
  
  // Data freshness
  lastUpdated: string;
  source: 'yahoo' | 'fallback';
}

// Fallback classifications for crypto, cash, and commonly misclassified securities
const SPECIAL_CLASSIFICATIONS: Record<string, Partial<FundProfile>> = {
  // ============================================
  // CASH & MONEY MARKET
  // ============================================
  'CASH': { type: 'cash', primaryClass: 'cash', name: 'Cash', assetAllocation: { stocks: 0, bonds: 0, cash: 100, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'CASH-USD': { type: 'cash', primaryClass: 'cash', name: 'Cash (USD)', assetAllocation: { stocks: 0, bonds: 0, cash: 100, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'USD': { type: 'cash', primaryClass: 'cash', name: 'US Dollar', assetAllocation: { stocks: 0, bonds: 0, cash: 100, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  
  // Money Market Funds (explicit overrides to ensure correct classification)
  'SPAXX': { type: 'mutual_fund', primaryClass: 'cash', name: 'Fidelity Government Money Market', morningstar: { category: 'Money Market-Taxable' }, assetAllocation: { stocks: 0, bonds: 0, cash: 100, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'FDRXX': { type: 'mutual_fund', primaryClass: 'cash', name: 'Fidelity Government Cash Reserves', morningstar: { category: 'Money Market-Taxable' }, assetAllocation: { stocks: 0, bonds: 0, cash: 100, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'VMFXX': { type: 'mutual_fund', primaryClass: 'cash', name: 'Vanguard Federal Money Market', morningstar: { category: 'Money Market-Taxable' }, assetAllocation: { stocks: 0, bonds: 0, cash: 100, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'VMMXX': { type: 'mutual_fund', primaryClass: 'cash', name: 'Vanguard Prime Money Market', morningstar: { category: 'Money Market-Taxable' }, assetAllocation: { stocks: 0, bonds: 0, cash: 100, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'SWVXX': { type: 'mutual_fund', primaryClass: 'cash', name: 'Schwab Value Advantage Money', morningstar: { category: 'Money Market-Taxable' }, assetAllocation: { stocks: 0, bonds: 0, cash: 100, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'SNVXX': { type: 'mutual_fund', primaryClass: 'cash', name: 'Schwab Government Money Fund', morningstar: { category: 'Money Market-Taxable' }, assetAllocation: { stocks: 0, bonds: 0, cash: 100, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'SPRXX': { type: 'mutual_fund', primaryClass: 'cash', name: 'Fidelity Money Market', morningstar: { category: 'Money Market-Taxable' }, assetAllocation: { stocks: 0, bonds: 0, cash: 100, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  
  // ============================================
  // CRYPTOCURRENCY (Native coins not on Yahoo)
  // ============================================
  'BTC': { type: 'crypto', primaryClass: 'crypto', name: 'Bitcoin', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'ETH': { type: 'crypto', primaryClass: 'crypto', name: 'Ethereum', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'SOL': { type: 'crypto', primaryClass: 'crypto', name: 'Solana', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'TAO': { type: 'crypto', primaryClass: 'crypto', name: 'Bittensor', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'AVAX': { type: 'crypto', primaryClass: 'crypto', name: 'Avalanche', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'LINK': { type: 'crypto', primaryClass: 'crypto', name: 'Chainlink', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'DOT': { type: 'crypto', primaryClass: 'crypto', name: 'Polkadot', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'ADA': { type: 'crypto', primaryClass: 'crypto', name: 'Cardano', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'XRP': { type: 'crypto', primaryClass: 'crypto', name: 'Ripple XRP', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'DOGE': { type: 'crypto', primaryClass: 'crypto', name: 'Dogecoin', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'MATIC': { type: 'crypto', primaryClass: 'crypto', name: 'Polygon', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'ATOM': { type: 'crypto', primaryClass: 'crypto', name: 'Cosmos', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'UNI': { type: 'crypto', primaryClass: 'crypto', name: 'Uniswap', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'LTC': { type: 'crypto', primaryClass: 'crypto', name: 'Litecoin', assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  
  // ============================================
  // CRYPTO ETFs (Bitcoin/Ethereum ETFs)
  // ============================================
  'IBIT': { type: 'etf', primaryClass: 'crypto', name: 'iShares Bitcoin Trust', morningstar: { category: 'Digital Assets' }, assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'FBTC': { type: 'etf', primaryClass: 'crypto', name: 'Fidelity Wise Origin Bitcoin', morningstar: { category: 'Digital Assets' }, assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'GBTC': { type: 'etf', primaryClass: 'crypto', name: 'Grayscale Bitcoin Trust', morningstar: { category: 'Digital Assets' }, assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'ARKB': { type: 'etf', primaryClass: 'crypto', name: 'ARK 21Shares Bitcoin ETF', morningstar: { category: 'Digital Assets' }, assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'BITB': { type: 'etf', primaryClass: 'crypto', name: 'Bitwise Bitcoin ETF', morningstar: { category: 'Digital Assets' }, assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'ETHE': { type: 'etf', primaryClass: 'crypto', name: 'Grayscale Ethereum Trust', morningstar: { category: 'Digital Assets' }, assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  'TAOX': { type: 'etf', primaryClass: 'crypto', name: 'Valour Bittensor ETP', morningstar: { category: 'Digital Assets' }, assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 100 }, geography: { us: 0, developed: 0, emerging: 0 } },
  
  // ============================================
  // CRYPTO-ADJACENT STOCKS (Bitcoin miners - these are US EQUITY, not crypto)
  // ============================================
  'MARA': { type: 'stock', primaryClass: 'usEquity', name: 'Marathon Digital Holdings', morningstar: { category: 'Technology' }, assetAllocation: { stocks: 100, bonds: 0, cash: 0, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'RIOT': { type: 'stock', primaryClass: 'usEquity', name: 'Riot Platforms', morningstar: { category: 'Technology' }, assetAllocation: { stocks: 100, bonds: 0, cash: 0, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'CIFR': { type: 'stock', primaryClass: 'usEquity', name: 'Cipher Mining', morningstar: { category: 'Technology' }, assetAllocation: { stocks: 100, bonds: 0, cash: 0, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'IREN': { type: 'stock', primaryClass: 'usEquity', name: 'Iris Energy', morningstar: { category: 'Technology' }, assetAllocation: { stocks: 100, bonds: 0, cash: 0, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'CLSK': { type: 'stock', primaryClass: 'usEquity', name: 'CleanSpark', morningstar: { category: 'Technology' }, assetAllocation: { stocks: 100, bonds: 0, cash: 0, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'MSTR': { type: 'stock', primaryClass: 'usEquity', name: 'MicroStrategy', morningstar: { category: 'Technology' }, assetAllocation: { stocks: 100, bonds: 0, cash: 0, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
  'COIN': { type: 'stock', primaryClass: 'usEquity', name: 'Coinbase Global', morningstar: { category: 'Financial Services' }, assetAllocation: { stocks: 100, bonds: 0, cash: 0, other: 0 }, geography: { us: 100, developed: 0, emerging: 0 } },
};

/**
 * Determine primary classification based on Morningstar category and asset allocation
 * Uses comprehensive Morningstar category mapping
 */
function determinePrimaryClass(
  category: string | undefined,
  assetAllocation: FundProfile['assetAllocation'],
  geography: FundProfile['geography']
): FundProfile['primaryClass'] {
  // First, try to classify based on Morningstar category
  if (category) {
    const classification = classifyByMorningstarCategory(category);
    // Convert to our 6-class system (the simple version for backwards compatibility)
    return toSimpleClass(classification.primary);
  }
  
  // Fallback: Use asset allocation if no category
  
  // Cash/Money Market - high cash allocation
  if (assetAllocation.cash > 80) {
    return 'cash';
  }
  
  // Bonds/Fixed Income - high bond allocation
  if (assetAllocation.bonds > 50) {
    return 'bonds';
  }
  
  // Check geographic breakdown - if less than 50% US, likely international
  if (geography.us < 50 && (geography.developed + geography.emerging) > 40) {
    return 'intlEquity';
  }
  
  // Default to US Equity for stocks
  if (assetAllocation.stocks > 50) {
    return 'usEquity';
  }
  
  return 'other';
}

/**
 * Fetch comprehensive fund profile from Yahoo Finance
 */
async function fetchYahooFundProfile(ticker: string): Promise<FundProfile | null> {
  try {
    // Fetch multiple modules for comprehensive data
    const modules = [
      'price',
      'summaryProfile',
      'fundProfile',
      'topHoldings',
      'fundPerformance',
      'defaultKeyStatistics'
    ].join(',');
    
    const response = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      console.error(`Yahoo API error for ${ticker}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data.quoteSummary?.result?.[0];
    if (!result) return null;

    const price = result.price || {};
    const fundProfile = result.fundProfile || {};
    const topHoldings = result.topHoldings || {};
    const fundPerformance = result.fundPerformance || {};
    const keyStats = result.defaultKeyStatistics || {};

    // Determine type
    let type: FundProfile['type'] = 'stock';
    const quoteType = price.quoteType?.toLowerCase();
    if (quoteType === 'etf') type = 'etf';
    else if (quoteType === 'mutualfund') type = 'mutual_fund';

    // Extract Morningstar data
    const morningstar: FundProfile['morningstar'] = {};
    if (fundProfile.categoryName) {
      morningstar.category = fundProfile.categoryName;
    }
    if (fundProfile.morningStarOverallRating?.raw) {
      morningstar.starRating = fundProfile.morningStarOverallRating.raw;
    }
    if (fundProfile.morningStarRiskRating?.raw) {
      const riskMap: Record<number, string> = {
        1: 'Low',
        2: 'Below Average', 
        3: 'Average',
        4: 'Above Average',
        5: 'High'
      };
      morningstar.riskRating = riskMap[fundProfile.morningStarRiskRating.raw] || 'Unknown';
    }
    if (fundProfile.styleBoxUrl) {
      // Parse style from URL if available
      const styleMatch = fundProfile.styleBoxUrl.match(/style=(\d)/);
      if (styleMatch) {
        const styleMap: Record<string, string> = {
          '1': 'Large Value', '2': 'Large Blend', '3': 'Large Growth',
          '4': 'Mid Value', '5': 'Mid Blend', '6': 'Mid Growth',
          '7': 'Small Value', '8': 'Small Blend', '9': 'Small Growth'
        };
        morningstar.styleBox = styleMap[styleMatch[1]];
      }
    }

    // Extract asset allocation
    const assetAllocation: FundProfile['assetAllocation'] = {
      stocks: (topHoldings.stockPosition?.raw || 0) * 100,
      bonds: (topHoldings.bondPosition?.raw || 0) * 100,
      cash: (topHoldings.cashPosition?.raw || 0) * 100,
      other: (topHoldings.otherPosition?.raw || 0) * 100,
    };
    
    // If no allocation data, estimate from type
    if (assetAllocation.stocks === 0 && assetAllocation.bonds === 0) {
      if (type === 'stock') {
        assetAllocation.stocks = 100;
      }
    }

    // Extract geographic breakdown from sector weights or estimate
    let geography: FundProfile['geography'] = { us: 70, developed: 20, emerging: 10 }; // Default
    
    // Try to get from holdings data
    if (topHoldings.holdings) {
      // Analyze holdings for geographic hints
      const holdingNames = topHoldings.holdings.map((h: any) => h.holdingName?.toLowerCase() || '');
      const hasIntlHoldings = holdingNames.some((n: string) => 
        n.includes('international') || n.includes('emerging') || n.includes('europe') || n.includes('asia')
      );
      
      // Adjust based on Morningstar category
      const cat = (morningstar.category || '').toLowerCase();
      if (cat.includes('emerging')) {
        geography = { us: 5, developed: 15, emerging: 80 };
      } else if (cat.includes('foreign') || cat.includes('international')) {
        geography = { us: 5, developed: 70, emerging: 25 };
      } else if (cat.includes('world') || cat.includes('global')) {
        geography = { us: 50, developed: 35, emerging: 15 };
      } else if (cat.includes('europe')) {
        geography = { us: 5, developed: 90, emerging: 5 };
      } else if (cat.includes('pacific') || cat.includes('asia')) {
        geography = { us: 5, developed: 60, emerging: 35 };
      } else if (hasIntlHoldings) {
        geography = { us: 60, developed: 30, emerging: 10 };
      } else {
        // US-focused
        geography = { us: 95, developed: 4, emerging: 1 };
      }
    }

    // Determine primary class
    const primaryClass = determinePrimaryClass(morningstar.category, assetAllocation, geography);

    // Extract sectors
    let sectors: FundProfile['sectors'] | undefined;
    if (topHoldings.sectorWeightings) {
      sectors = Object.entries(topHoldings.sectorWeightings)
        .filter(([_, v]: [string, any]) => v?.raw > 0)
        .map(([k, v]: [string, any]) => ({
          name: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          weight: (v?.raw || 0) * 100
        }))
        .sort((a, b) => b.weight - a.weight);
    }

    // Extract top holdings
    let holdings: FundProfile['topHoldings'] | undefined;
    if (topHoldings.holdings) {
      holdings = topHoldings.holdings.slice(0, 10).map((h: any) => ({
        name: h.holdingName || 'Unknown',
        ticker: h.symbol,
        weight: (h.holdingPercent?.raw || 0) * 100
      }));
    }

    // Extract performance
    let performance: FundProfile['performance'] | undefined;
    if (fundPerformance.trailingReturns) {
      const returns = fundPerformance.trailingReturns;
      performance = {
        ytd: returns.ytd?.raw ? returns.ytd.raw * 100 : undefined,
        oneYear: returns.oneYear?.raw ? returns.oneYear.raw * 100 : undefined,
        threeYear: returns.threeYear?.raw ? returns.threeYear.raw * 100 : undefined,
        fiveYear: returns.fiveYear?.raw ? returns.fiveYear.raw * 100 : undefined,
      };
    }

    return {
      ticker: ticker.toUpperCase(),
      name: price.shortName || price.longName || ticker,
      type,
      morningstar: Object.keys(morningstar).length > 0 ? morningstar : undefined,
      assetAllocation,
      geography,
      primaryClass,
      sectors,
      topHoldings: holdings,
      performance,
      expenseRatio: keyStats.annualReportExpenseRatio?.raw 
        ? keyStats.annualReportExpenseRatio.raw * 100 
        : fundProfile.feesExpensesInvestment?.annualReportExpenseRatio?.raw 
          ? fundProfile.feesExpensesInvestment.annualReportExpenseRatio.raw * 100 
          : undefined,
      aum: keyStats.totalAssets?.raw,
      inceptionDate: keyStats.fundInceptionDate?.fmt,
      lastUpdated: new Date().toISOString(),
      source: 'yahoo'
    };
  } catch (error) {
    console.error(`Yahoo fund profile error for ${ticker}:`, error);
    return null;
  }
}

/**
 * Get default profile for unknown tickers (stocks)
 */
function getDefaultProfile(ticker: string): FundProfile {
  return {
    ticker: ticker.toUpperCase(),
    name: ticker,
    type: 'stock',
    primaryClass: 'usEquity',
    assetAllocation: { stocks: 100, bonds: 0, cash: 0, other: 0 },
    geography: { us: 100, developed: 0, emerging: 0 },
    lastUpdated: new Date().toISOString(),
    source: 'fallback'
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();
  const tickers = searchParams.get('tickers')?.toUpperCase().split(',').filter(Boolean);
  const refresh = searchParams.get('refresh') === 'true';

  const tickersToFetch = tickers || (ticker ? [ticker] : []);

  if (tickersToFetch.length === 0) {
    return NextResponse.json({ error: 'Ticker(s) required' }, { status: 400 });
  }

  const profiles: Record<string, FundProfile> = {};
  const errors: string[] = [];
  const tickersNeedingFetch: string[] = [];

  // First pass: resolve cached and special classifications synchronously
  for (const t of tickersToFetch) {
    // Check cache first (unless refresh requested)
    if (!refresh) {
      const cached = profileCache.get(t);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        profiles[t] = cached.data;
        continue;
      }
    }

    // Check special classifications (crypto, cash)
    if (SPECIAL_CLASSIFICATIONS[t]) {
      const special = SPECIAL_CLASSIFICATIONS[t];
      const profile: FundProfile = {
        ticker: t,
        name: special.name || t,
        type: special.type || 'unknown',
        primaryClass: special.primaryClass || 'other',
        assetAllocation: special.assetAllocation || { stocks: 0, bonds: 0, cash: 0, other: 100 },
        geography: special.geography || { us: 0, developed: 0, emerging: 0 },
        lastUpdated: new Date().toISOString(),
        source: 'fallback'
      };
      profiles[t] = profile;
      profileCache.set(t, { data: profile, timestamp: Date.now() });
      continue;
    }

    // Mark this ticker for fetch
    tickersNeedingFetch.push(t);
  }

  // Second pass: fetch all uncached tickers in PARALLEL (major performance improvement)
  // Previously this was sequential - 20 tickers × ~300ms = 6 seconds
  // Now with parallel: 20 tickers = ~300ms total
  if (tickersNeedingFetch.length > 0) {
    const fetchResults = await Promise.all(
      tickersNeedingFetch.map(async (t) => {
        const yahooProfile = await fetchYahooFundProfile(t);
        return { ticker: t, profile: yahooProfile };
      })
    );

    // Process results
    for (const { ticker: t, profile: yahooProfile } of fetchResults) {
      if (yahooProfile) {
        profiles[t] = yahooProfile;
        profileCache.set(t, { data: yahooProfile, timestamp: Date.now() });
      } else {
        // Fall back to default
        const defaultProfile = getDefaultProfile(t);
        profiles[t] = defaultProfile;
        profileCache.set(t, { data: defaultProfile, timestamp: Date.now() });
        errors.push(`Could not fetch data for ${t}, using defaults`);
      }
    }
  }

  // Count how many were served from cache
  const cachedCount = tickersToFetch.length - tickersNeedingFetch.length;

  // Build response with caching headers
  // - s-maxage: Vercel edge cache for 5 minutes (fund data doesn't change frequently)
  // - stale-while-revalidate: serve stale for up to 1 hour while refreshing
  const response = NextResponse.json({
    profiles,
    count: Object.keys(profiles).length,
    cached: cachedCount,
    fetched: tickersNeedingFetch.length,
    errors: errors.length > 0 ? errors : undefined
  });

  // Add caching headers (only if not refresh request)
  if (!refresh) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
    );
  }

  return response;
}
