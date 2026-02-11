/**
 * Persistent Cache Layer
 * 
 * Provides reliable caching that survives serverless cold starts.
 * Falls back gracefully when Redis is not configured.
 * 
 * Supports:
 * - Upstash Redis (REST API): UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * - Standard Redis: REDIS_URL or STORAGE_URL
 * 
 * Setup via Vercel Marketplace: https://vercel.com/marketplace?category=storage&search=redis
 */

import { Redis as UpstashRedis } from '@upstash/redis';
import { createClient, RedisClientType } from 'redis';

type CacheClient = 
  | { type: 'upstash'; client: UpstashRedis }
  | { type: 'redis'; client: RedisClientType }
  | null;

// Initialize Redis client if credentials are available
let cacheClient: CacheClient = null;
let connectionAttempted = false;

async function getClient(): Promise<CacheClient> {
  if (cacheClient || connectionAttempted) return cacheClient;
  connectionAttempted = true;
  
  // Try Upstash first (REST API, better for serverless)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (upstashUrl && upstashToken) {
    cacheClient = {
      type: 'upstash',
      client: new UpstashRedis({ url: upstashUrl, token: upstashToken }),
    };
    console.log('[Cache] Using Upstash Redis');
    return cacheClient;
  }
  
  // Try standard Redis URL (from Vercel Redis integration)
  const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;
  
  if (redisUrl) {
    try {
      const client = createClient({ url: redisUrl });
      await client.connect();
      cacheClient = { type: 'redis', client: client as RedisClientType };
      console.log('[Cache] Using standard Redis');
      return cacheClient;
    } catch (err) {
      console.error('[Cache] Failed to connect to Redis:', err);
    }
  }
  
  console.log('[Cache] No Redis configured, using memory fallback');
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
  const cache = await getClient();
  
  if (cache) {
    try {
      if (cache.type === 'upstash') {
        return await cache.client.get<T>(key);
      } else {
        const value = await cache.client.get(key);
        if (value) {
          return JSON.parse(value) as T;
        }
        return null;
      }
    } catch (err) {
      console.error(`[Cache] Get error for ${key}:`, err);
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
  const cache = await getClient();
  
  if (cache) {
    try {
      if (cache.type === 'upstash') {
        await cache.client.set(key, value, { ex: ttl });
      } else {
        await cache.client.setEx(key, ttl, JSON.stringify(value));
      }
      return true;
    } catch (err) {
      console.error(`[Cache] Set error for ${key}:`, err);
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
  const cache = await getClient();
  
  if (cache) {
    try {
      if (cache.type === 'upstash') {
        await cache.client.del(key);
      } else {
        await cache.client.del(key);
      }
      return true;
    } catch (err) {
      console.error(`[Cache] Del error for ${key}:`, err);
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
  type: 'redis' | 'upstash' | 'memory';
  latencyMs?: number;
  error?: string;
}> {
  const cache = await getClient();
  
  if (!cache) {
    return { available: true, type: 'memory' };
  }
  
  const start = Date.now();
  try {
    if (cache.type === 'upstash') {
      await cache.client.ping();
    } else {
      await cache.client.ping();
    }
    return {
      available: true,
      type: cache.type,
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
