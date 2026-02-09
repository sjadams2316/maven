/**
 * Price Validation Utilities
 * 
 * Validates price data from external APIs to ensure data quality.
 * Used across all data fetching to maintain data integrity.
 * 
 * @author Pantheon Infrastructure Team
 * @version 1.0.0
 */

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export interface PriceData {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  timestamp?: Date;
}

// Reasonable bounds for different asset types
const BOUNDS = {
  stock: {
    minPrice: 0.01,
    maxPrice: 100000, // Berkshire A is ~$500k, but most stocks are below this
    minChange: -100, // Can't lose more than 100%
    maxChange: 1000, // Limit to 10x in a day (rare but possible)
  },
  crypto: {
    minPrice: 0.000001, // Some cryptos are fractions of a cent
    maxPrice: 10000000, // BTC could theoretically go very high
    minChange: -100,
    maxChange: 10000, // Crypto can moon hard
  },
  index: {
    minPrice: 1,
    maxPrice: 100000, // Indices are typically in this range
    minChange: -30, // Circuit breakers usually kick in before this
    maxChange: 30,
  },
  etf: {
    minPrice: 0.01,
    maxPrice: 10000,
    minChange: -50,
    maxChange: 100,
  },
};

type AssetType = keyof typeof BOUNDS;

/**
 * Determine asset type from symbol
 */
export function getAssetType(symbol: string): AssetType {
  const upperSymbol = symbol.toUpperCase();
  
  // Common crypto symbols
  const cryptoSymbols = [
    'BTC', 'ETH', 'TAO', 'SOL', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LINK',
    'UNI', 'ATOM', 'XRP', 'DOGE', 'SHIB', 'LTC', 'BCH', 'XLM', 'ALGO',
    'FIL', 'ICP', 'NEAR', 'APT', 'ARB', 'OP'
  ];
  
  if (cryptoSymbols.includes(upperSymbol)) {
    return 'crypto';
  }
  
  // Index symbols
  if (upperSymbol.startsWith('^') || ['VIX', 'DXY'].includes(upperSymbol)) {
    return 'index';
  }
  
  // Common ETF patterns
  const etfSymbols = [
    'SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'VEA', 'VWO', 'BND', 'AGG',
    'TLT', 'GLD', 'SLV', 'USO', 'XLF', 'XLK', 'XLE', 'XLV', 'XLI'
  ];
  
  if (etfSymbols.includes(upperSymbol)) {
    return 'etf';
  }
  
  // Default to stock
  return 'stock';
}

/**
 * Validate a single price data point
 */
export function validatePrice(data: PriceData, assetType?: AssetType): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  const type = assetType || getAssetType(data.symbol);
  const bounds = BOUNDS[type];
  
  // Check for missing or invalid price
  if (data.price === undefined || data.price === null) {
    errors.push(`${data.symbol}: Missing price`);
    return { isValid: false, warnings, errors };
  }
  
  if (typeof data.price !== 'number' || isNaN(data.price)) {
    errors.push(`${data.symbol}: Invalid price type`);
    return { isValid: false, warnings, errors };
  }
  
  // Check price bounds
  if (data.price <= 0) {
    errors.push(`${data.symbol}: Price must be positive (got ${data.price})`);
  } else if (data.price < bounds.minPrice) {
    warnings.push(`${data.symbol}: Unusually low price (${data.price})`);
  } else if (data.price > bounds.maxPrice) {
    warnings.push(`${data.symbol}: Unusually high price (${data.price})`);
  }
  
  // Check change percent if provided
  if (data.changePercent !== undefined) {
    if (data.changePercent < bounds.minChange) {
      warnings.push(`${data.symbol}: Extreme negative change (${data.changePercent.toFixed(2)}%)`);
    } else if (data.changePercent > bounds.maxChange) {
      warnings.push(`${data.symbol}: Extreme positive change (${data.changePercent.toFixed(2)}%)`);
    }
  }
  
  // Check timestamp for staleness (if provided)
  if (data.timestamp) {
    const ageMs = Date.now() - data.timestamp.getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    
    // Crypto should be fresh (24/7 market)
    if (type === 'crypto' && ageHours > 1) {
      warnings.push(`${data.symbol}: Price may be stale (${ageHours.toFixed(1)}h old)`);
    }
    
    // Stocks can be older (market hours)
    if ((type === 'stock' || type === 'etf') && ageHours > 24) {
      warnings.push(`${data.symbol}: Price may be stale (${ageHours.toFixed(1)}h old)`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Validate batch of price data
 */
export function validatePrices(data: PriceData[]): ValidationResult {
  const allWarnings: string[] = [];
  const allErrors: string[] = [];
  
  for (const item of data) {
    const result = validatePrice(item);
    allWarnings.push(...result.warnings);
    allErrors.push(...result.errors);
  }
  
  return {
    isValid: allErrors.length === 0,
    warnings: allWarnings,
    errors: allErrors,
  };
}

/**
 * Validate and log issues (returns original data, logs problems)
 */
export function validateAndLog(
  data: PriceData[],
  source: string
): PriceData[] {
  const result = validatePrices(data);
  
  if (result.errors.length > 0) {
    console.error(`[${source}] Price validation errors:`, result.errors);
  }
  
  if (result.warnings.length > 0) {
    console.warn(`[${source}] Price validation warnings:`, result.warnings);
  }
  
  return data;
}

/**
 * Filter out invalid prices (returns only valid data)
 */
export function filterValidPrices(data: PriceData[]): PriceData[] {
  return data.filter(item => {
    const result = validatePrice(item);
    return result.isValid;
  });
}

/**
 * Sanitize price data with fallback values
 */
export function sanitizePrice(
  data: Partial<PriceData>,
  fallbackPrice: number = 0
): PriceData {
  return {
    symbol: data.symbol || 'UNKNOWN',
    price: (data.price && data.price > 0) ? data.price : fallbackPrice,
    change: data.change ?? 0,
    changePercent: data.changePercent ?? 0,
    volume: data.volume ?? 0,
    timestamp: data.timestamp ?? new Date(),
  };
}

/**
 * Check if a price appears stale based on market hours
 */
export function isStalePrice(
  timestamp: Date,
  symbol: string
): boolean {
  const type = getAssetType(symbol);
  const now = new Date();
  const ageMs = now.getTime() - timestamp.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  
  // Crypto: stale after 1 hour (24/7 market)
  if (type === 'crypto') {
    return ageHours > 1;
  }
  
  // For stocks/ETFs, need to consider market hours
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const hour = now.getHours();
  const isMarketHours = hour >= 9 && hour < 16; // Simplified EST
  
  // During market hours, stale after 15 minutes
  if (!isWeekend && isMarketHours) {
    return ageMs > 15 * 60 * 1000;
  }
  
  // Outside market hours, stale after 24 hours
  return ageHours > 24;
}

/**
 * Create a cached price fallback manager
 */
export function createPriceCache() {
  const cache = new Map<string, PriceData>();
  const cacheTime = new Map<string, number>();
  
  return {
    get(symbol: string): PriceData | undefined {
      return cache.get(symbol.toUpperCase());
    },
    
    set(data: PriceData): void {
      const key = data.symbol.toUpperCase();
      cache.set(key, data);
      cacheTime.set(key, Date.now());
    },
    
    setMany(dataList: PriceData[]): void {
      for (const data of dataList) {
        this.set(data);
      }
    },
    
    getAge(symbol: string): number | undefined {
      const time = cacheTime.get(symbol.toUpperCase());
      return time ? Date.now() - time : undefined;
    },
    
    isStale(symbol: string, maxAgeMs: number = 5 * 60 * 1000): boolean {
      const age = this.getAge(symbol);
      return age === undefined || age > maxAgeMs;
    },
    
    getWithFallback(symbol: string, fetchFn: () => Promise<PriceData>): Promise<PriceData> {
      const cached = this.get(symbol);
      
      return fetchFn()
        .then(fresh => {
          this.set(fresh);
          return fresh;
        })
        .catch(error => {
          console.warn(`[PriceCache] Fetch failed for ${symbol}, using cache:`, error.message);
          if (cached) {
            return { ...cached, timestamp: cached.timestamp || new Date() };
          }
          throw error;
        });
    },
    
    clear(): void {
      cache.clear();
      cacheTime.clear();
    },
  };
}

// Global price cache instance
export const priceCache = createPriceCache();
