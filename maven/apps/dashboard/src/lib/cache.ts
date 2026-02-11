/**
 * Persistent Cache Layer using Upstash Redis
 * 
 * Provides reliable caching that survives serverless cold starts.
 * Falls back gracefully when Redis is not configured.
 * 
 * Setup: Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to env
 * via Vercel Marketplace: https://vercel.com/marketplace?category=storage&search=redis
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client if credentials are available
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (url && token) {
    redis = new Redis({ url, token });
    return redis;
  }
  
  return null;
}

// In-memory fallback when Redis is not available
const memoryCache: Map<string, { value: unknown; expires: number }> = new Map();

export interface CacheOptions {
  /** Time to live in seconds */
  ttl?: number;
}

const DEFAULT_TTL = 3600; // 1 hour

/**
 * Get a value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis();
  
  if (client) {
    try {
      const value = await client.get<T>(key);
      return value;
    } catch (err) {
      console.error(`Cache get error for ${key}:`, err);
    }
  }
  
  // Fallback to memory cache
  const cached = memoryCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.value as T;
  }
  
  return null;
}

/**
 * Set a value in cache
 */
export async function cacheSet<T>(
  key: string, 
  value: T, 
  options: CacheOptions = {}
): Promise<boolean> {
  const ttl = options.ttl ?? DEFAULT_TTL;
  const client = getRedis();
  
  if (client) {
    try {
      await client.set(key, value, { ex: ttl });
      return true;
    } catch (err) {
      console.error(`Cache set error for ${key}:`, err);
    }
  }
  
  // Fallback to memory cache
  memoryCache.set(key, {
    value,
    expires: Date.now() + (ttl * 1000),
  });
  
  return true;
}

/**
 * Delete a value from cache
 */
export async function cacheDel(key: string): Promise<boolean> {
  const client = getRedis();
  
  if (client) {
    try {
      await client.del(key);
      return true;
    } catch (err) {
      console.error(`Cache del error for ${key}:`, err);
    }
  }
  
  memoryCache.delete(key);
  return true;
}

/**
 * Check if Redis is configured and healthy
 */
export async function cacheHealth(): Promise<{
  available: boolean;
  type: 'redis' | 'memory';
  latencyMs?: number;
  error?: string;
}> {
  const client = getRedis();
  
  if (!client) {
    return { available: true, type: 'memory' };
  }
  
  const start = Date.now();
  try {
    await client.ping();
    return {
      available: true,
      type: 'redis',
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      available: false,
      type: 'memory',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Market Data Specific Cache Functions
// ============================================================================

export interface MarketPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

const MARKET_CACHE_KEY = 'market:prices';
const MARKET_CACHE_TTL = 300; // 5 minutes for market data

/**
 * Get cached market prices
 */
export async function getMarketPrices(): Promise<Record<string, MarketPrice> | null> {
  return cacheGet<Record<string, MarketPrice>>(MARKET_CACHE_KEY);
}

/**
 * Cache market prices
 */
export async function setMarketPrices(
  prices: Record<string, MarketPrice>
): Promise<boolean> {
  return cacheSet(MARKET_CACHE_KEY, prices, { ttl: MARKET_CACHE_TTL });
}

/**
 * Get a single cached price
 */
export async function getCachedPrice(symbol: string): Promise<MarketPrice | null> {
  const prices = await getMarketPrices();
  if (!prices) return null;
  
  const price = prices[symbol];
  if (!price) return null;
  
  // Check if price is stale (>1 hour old)
  const ONE_HOUR = 60 * 60 * 1000;
  if (Date.now() - price.timestamp > ONE_HOUR) {
    return null;
  }
  
  return price;
}

/**
 * Update a single cached price
 */
export async function setCachedPrice(
  symbol: string,
  data: Omit<MarketPrice, 'symbol' | 'timestamp'>
): Promise<boolean> {
  const prices = await getMarketPrices() || {};
  
  prices[symbol] = {
    symbol,
    ...data,
    timestamp: Date.now(),
  };
  
  return setMarketPrices(prices);
}
