/**
 * Polygon.io API Client
 * Real-time and historical market data for stocks, crypto, forex, and options
 * 
 * Free tier: 5 API calls/minute
 * Docs: https://polygon.io/docs
 */

const POLYGON_BASE_URL = 'https://api.polygon.io';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface PolygonTickerDetails {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
  market_cap?: number;
  phone_number?: string;
  address?: {
    address1: string;
    city: string;
    state: string;
    postal_code: string;
  };
  description?: string;
  sic_code?: string;
  sic_description?: string;
  ticker_root?: string;
  homepage_url?: string;
  total_employees?: number;
  list_date?: string;
  branding?: {
    logo_url: string;
    icon_url: string;
  };
  share_class_shares_outstanding?: number;
  weighted_shares_outstanding?: number;
}

interface PolygonAggregateBar {
  v: number;   // Volume
  vw: number;  // Volume weighted average price
  o: number;   // Open
  c: number;   // Close
  h: number;   // High
  l: number;   // Low
  t: number;   // Timestamp (Unix ms)
  n: number;   // Number of transactions
}

interface PolygonPreviousClose {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: PolygonAggregateBar[];
}

interface PolygonSnapshot {
  ticker: string;
  todaysChange: number;
  todaysChangePerc: number;
  updated: number;
  day: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  min: {
    av: number;
    t: number;
    n: number;
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  prevDay: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
}

interface PolygonCryptoSnapshot {
  ticker: string;
  todaysChange: number;
  todaysChangePerc: number;
  updated: number;
  day: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  lastTrade: {
    p: number;  // Price
    s: number;  // Size
    t: number;  // Timestamp
    x: number;  // Exchange
  };
  min: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  prevDay: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export interface PolygonQuote {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  previousClose: number;
  volume: number;
  vwap: number;
  timestamp: number;
  market: 'stocks' | 'crypto' | 'forex';
}

export interface PolygonCryptoQuote extends PolygonQuote {
  market: 'crypto';
  baseCurrency: string;
  quoteCurrency: string;
}

export interface PolygonHistoricalBar {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap: number;
  transactions: number;
}

// =============================================================================
// POLYGON CLIENT CLASS
// =============================================================================

class PolygonClient {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  private async fetch<T>(endpoint: string): Promise<T | null> {
    try {
      const separator = endpoint.includes('?') ? '&' : '?';
      const url = `${POLYGON_BASE_URL}${endpoint}${separator}apiKey=${this.apiKey}`;
      
      const response = await fetch(url, {
        next: { revalidate: 60 } // Cache for 1 minute
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`Polygon API error: ${response.status} - ${error}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Polygon fetch error:', error);
      return null;
    }
  }
  
  // ==========================================================================
  // STOCK ENDPOINTS
  // ==========================================================================
  
  /**
   * Get ticker details (company info)
   */
  async getTickerDetails(ticker: string): Promise<PolygonTickerDetails | null> {
    const data = await this.fetch<{ results: PolygonTickerDetails }>(`/v3/reference/tickers/${ticker.toUpperCase()}`);
    return data?.results || null;
  }
  
  /**
   * Get previous day's OHLC for a stock
   */
  async getPreviousClose(ticker: string): Promise<PolygonQuote | null> {
    const data = await this.fetch<PolygonPreviousClose>(`/v2/aggs/ticker/${ticker.toUpperCase()}/prev`);
    
    if (!data?.results?.[0]) return null;
    
    const bar = data.results[0];
    return {
      symbol: ticker.toUpperCase(),
      price: bar.c,
      change: bar.c - bar.o,
      changePercent: ((bar.c - bar.o) / bar.o) * 100,
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      previousClose: bar.o, // Previous day's open as approximation
      volume: bar.v,
      vwap: bar.vw,
      timestamp: bar.t,
      market: 'stocks'
    };
  }
  
  /**
   * Get real-time snapshot for a stock
   */
  async getStockSnapshot(ticker: string): Promise<PolygonQuote | null> {
    const data = await this.fetch<{ ticker: PolygonSnapshot }>(`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker.toUpperCase()}`);
    
    if (!data?.ticker) return null;
    
    const snap = data.ticker;
    return {
      symbol: ticker.toUpperCase(),
      price: snap.day?.c || snap.prevDay?.c || 0,
      change: snap.todaysChange,
      changePercent: snap.todaysChangePerc,
      open: snap.day?.o || 0,
      high: snap.day?.h || 0,
      low: snap.day?.l || 0,
      close: snap.day?.c || 0,
      previousClose: snap.prevDay?.c || 0,
      volume: snap.day?.v || 0,
      vwap: snap.day?.vw || 0,
      timestamp: snap.updated,
      market: 'stocks'
    };
  }
  
  /**
   * Get historical daily bars
   */
  async getHistoricalBars(
    ticker: string, 
    from: string, 
    to: string, 
    timespan: 'day' | 'week' | 'month' = 'day'
  ): Promise<PolygonHistoricalBar[]> {
    const data = await this.fetch<{ results: PolygonAggregateBar[] }>(
      `/v2/aggs/ticker/${ticker.toUpperCase()}/range/1/${timespan}/${from}/${to}?adjusted=true&sort=asc`
    );
    
    if (!data?.results) return [];
    
    return data.results.map(bar => ({
      timestamp: bar.t,
      date: new Date(bar.t).toISOString().split('T')[0],
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
      vwap: bar.vw,
      transactions: bar.n
    }));
  }
  
  // ==========================================================================
  // CRYPTO ENDPOINTS
  // ==========================================================================
  
  /**
   * Get crypto quote (e.g., BTC, ETH, TAO)
   * Polygon uses format: X:BTCUSD
   */
  async getCryptoQuote(baseCurrency: string, quoteCurrency: string = 'USD'): Promise<PolygonCryptoQuote | null> {
    const ticker = `X:${baseCurrency.toUpperCase()}${quoteCurrency.toUpperCase()}`;
    
    const data = await this.fetch<{ ticker: PolygonCryptoSnapshot }>(`/v2/snapshot/locale/global/markets/crypto/tickers/${ticker}`);
    
    if (!data?.ticker) {
      // Fallback to previous close
      const prevData = await this.fetch<PolygonPreviousClose>(`/v2/aggs/ticker/${ticker}/prev`);
      if (!prevData?.results?.[0]) return null;
      
      const bar = prevData.results[0];
      return {
        symbol: ticker,
        baseCurrency: baseCurrency.toUpperCase(),
        quoteCurrency: quoteCurrency.toUpperCase(),
        price: bar.c,
        change: bar.c - bar.o,
        changePercent: ((bar.c - bar.o) / bar.o) * 100,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        previousClose: bar.o,
        volume: bar.v,
        vwap: bar.vw,
        timestamp: bar.t,
        market: 'crypto'
      };
    }
    
    const snap = data.ticker;
    return {
      symbol: ticker,
      baseCurrency: baseCurrency.toUpperCase(),
      quoteCurrency: quoteCurrency.toUpperCase(),
      price: snap.lastTrade?.p || snap.day?.c || 0,
      change: snap.todaysChange,
      changePercent: snap.todaysChangePerc,
      open: snap.day?.o || 0,
      high: snap.day?.h || 0,
      low: snap.day?.l || 0,
      close: snap.day?.c || 0,
      previousClose: snap.prevDay?.c || 0,
      volume: snap.day?.v || 0,
      vwap: snap.day?.vw || 0,
      timestamp: snap.updated,
      market: 'crypto'
    };
  }
  
  /**
   * Get multiple crypto quotes
   */
  async getCryptoQuotes(symbols: string[]): Promise<Map<string, PolygonCryptoQuote>> {
    const results = new Map<string, PolygonCryptoQuote>();
    
    // Process in parallel (careful with rate limits)
    const quotes = await Promise.all(
      symbols.map(symbol => this.getCryptoQuote(symbol))
    );
    
    quotes.forEach((quote, idx) => {
      if (quote) {
        results.set(symbols[idx].toUpperCase(), quote);
      }
    });
    
    return results;
  }
  
  /**
   * Get crypto historical bars
   */
  async getCryptoHistoricalBars(
    baseCurrency: string,
    quoteCurrency: string = 'USD',
    from: string,
    to: string
  ): Promise<PolygonHistoricalBar[]> {
    const ticker = `X:${baseCurrency.toUpperCase()}${quoteCurrency.toUpperCase()}`;
    return this.getHistoricalBars(ticker, from, to);
  }
  
  // ==========================================================================
  // BATCH / UTILITY ENDPOINTS
  // ==========================================================================
  
  /**
   * Get multiple stock snapshots
   */
  async getStockSnapshots(tickers: string[]): Promise<Map<string, PolygonQuote>> {
    const data = await this.fetch<{ tickers: PolygonSnapshot[] }>(
      `/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickers.join(',')}`
    );
    
    const results = new Map<string, PolygonQuote>();
    
    if (data?.tickers) {
      for (const snap of data.tickers) {
        results.set(snap.ticker, {
          symbol: snap.ticker,
          price: snap.day?.c || snap.prevDay?.c || 0,
          change: snap.todaysChange,
          changePercent: snap.todaysChangePerc,
          open: snap.day?.o || 0,
          high: snap.day?.h || 0,
          low: snap.day?.l || 0,
          close: snap.day?.c || 0,
          previousClose: snap.prevDay?.c || 0,
          volume: snap.day?.v || 0,
          vwap: snap.day?.vw || 0,
          timestamp: snap.updated,
          market: 'stocks'
        });
      }
    }
    
    return results;
  }
  
  /**
   * Check if market is open
   */
  async getMarketStatus(): Promise<{ market: string; serverTime: string; exchanges: Record<string, string> } | null> {
    return this.fetch('/v1/marketstatus/now');
  }
  
  /**
   * Search tickers
   */
  async searchTickers(query: string, limit: number = 10): Promise<{ ticker: string; name: string; market: string; type: string }[]> {
    const data = await this.fetch<{ results: any[] }>(
      `/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=${limit}`
    );
    
    return (data?.results || []).map(r => ({
      ticker: r.ticker,
      name: r.name,
      market: r.market,
      type: r.type
    }));
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let polygonClient: PolygonClient | null = null;

export function getPolygonClient(): PolygonClient | null {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    return null;
  }
  
  if (!polygonClient) {
    polygonClient = new PolygonClient(apiKey);
  }
  
  return polygonClient;
}

export { PolygonClient };
