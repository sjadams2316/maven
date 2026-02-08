// Alpaca Trading Integration
// Unified API for stocks, ETFs, and crypto
// https://alpaca.markets

/**
 * Alpaca Client
 * Handles both paper and live trading
 */
class AlpacaClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.ALPACA_API_KEY;
    this.apiSecret = options.apiSecret || process.env.ALPACA_API_SECRET;
    this.paper = options.paper !== false; // Default to paper trading
    
    // Paper vs Live endpoints
    this.baseUrl = this.paper 
      ? 'https://paper-api.alpaca.markets'
      : 'https://api.alpaca.markets';
    
    this.dataUrl = 'https://data.alpaca.markets';
  }

  /**
   * Check if configured
   */
  isConfigured() {
    return !!(this.apiKey && this.apiSecret);
  }

  /**
   * Make authenticated request
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'APCA-API-KEY-ID': this.apiKey,
        'APCA-API-SECRET-KEY': this.apiSecret,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Alpaca API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Get account information
   */
  async getAccount() {
    return this.request('/v2/account');
  }

  /**
   * Get current positions
   */
  async getPositions() {
    return this.request('/v2/positions');
  }

  /**
   * Get specific position
   */
  async getPosition(symbol) {
    try {
      return await this.request(`/v2/positions/${symbol}`);
    } catch {
      return null; // No position
    }
  }

  /**
   * Get open orders
   */
  async getOrders(status = 'open') {
    return this.request(`/v2/orders?status=${status}`);
  }

  /**
   * Submit order
   */
  async submitOrder(order) {
    const {
      symbol,
      qty,
      notional, // Dollar amount instead of qty
      side, // 'buy' or 'sell'
      type = 'market',
      timeInForce = 'day',
      limitPrice,
      stopPrice,
      trailPercent,
      extendedHours = false
    } = order;

    const payload = {
      symbol,
      side,
      type,
      time_in_force: timeInForce,
      extended_hours: extendedHours
    };

    // Use notional (dollar amount) or qty (shares)
    if (notional) {
      payload.notional = notional;
    } else {
      payload.qty = qty;
    }

    // Add price for limit/stop orders
    if (limitPrice) payload.limit_price = limitPrice;
    if (stopPrice) payload.stop_price = stopPrice;
    if (trailPercent) payload.trail_percent = trailPercent;

    return this.request('/v2/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId) {
    return this.request(`/v2/orders/${orderId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Cancel all orders
   */
  async cancelAllOrders() {
    return this.request('/v2/orders', {
      method: 'DELETE'
    });
  }

  /**
   * Close position
   */
  async closePosition(symbol) {
    return this.request(`/v2/positions/${symbol}`, {
      method: 'DELETE'
    });
  }

  /**
   * Close all positions
   */
  async closeAllPositions() {
    return this.request('/v2/positions', {
      method: 'DELETE'
    });
  }

  /**
   * Get quote for symbol (stocks)
   */
  async getStockQuote(symbol) {
    return this.request(`${this.dataUrl}/v2/stocks/${symbol}/quotes/latest`, {
      headers: {
        'APCA-API-KEY-ID': this.apiKey,
        'APCA-API-SECRET-KEY': this.apiSecret
      }
    });
  }

  /**
   * Get quote for crypto
   */
  async getCryptoQuote(symbol) {
    // Alpaca uses format like 'BTC/USD'
    const formattedSymbol = symbol.includes('/') ? symbol : `${symbol}/USD`;
    return this.request(`${this.dataUrl}/v1beta3/crypto/us/latest/quotes?symbols=${formattedSymbol}`, {
      headers: {
        'APCA-API-KEY-ID': this.apiKey,
        'APCA-API-SECRET-KEY': this.apiSecret
      }
    });
  }

  /**
   * Get bars (OHLCV) for symbol
   */
  async getBars(symbol, timeframe = '1Day', limit = 100) {
    const isCrypto = ['BTC', 'ETH', 'SOL', 'DOGE', 'AVAX', 'LINK'].some(c => 
      symbol.toUpperCase().includes(c)
    );

    if (isCrypto) {
      const formattedSymbol = symbol.includes('/') ? symbol : `${symbol}/USD`;
      return this.request(
        `${this.dataUrl}/v1beta3/crypto/us/bars?symbols=${formattedSymbol}&timeframe=${timeframe}&limit=${limit}`,
        {
          headers: {
            'APCA-API-KEY-ID': this.apiKey,
            'APCA-API-SECRET-KEY': this.apiSecret
          }
        }
      );
    } else {
      return this.request(
        `${this.dataUrl}/v2/stocks/${symbol}/bars?timeframe=${timeframe}&limit=${limit}`,
        {
          headers: {
            'APCA-API-KEY-ID': this.apiKey,
            'APCA-API-SECRET-KEY': this.apiSecret
          }
        }
      );
    }
  }

  /**
   * Check if market is open
   */
  async isMarketOpen() {
    const clock = await this.request('/v2/clock');
    return clock.is_open;
  }

  /**
   * Get market calendar
   */
  async getCalendar(start, end) {
    return this.request(`/v2/calendar?start=${start}&end=${end}`);
  }

  /**
   * Get tradable assets
   */
  async getAssets(assetClass = null, status = 'active') {
    let endpoint = `/v2/assets?status=${status}`;
    if (assetClass) endpoint += `&asset_class=${assetClass}`;
    return this.request(endpoint);
  }

  /**
   * Check if asset is tradable
   */
  async isAssetTradable(symbol) {
    try {
      const asset = await this.request(`/v2/assets/${symbol}`);
      return asset.tradable;
    } catch {
      return false;
    }
  }
}

/**
 * Asset type detection
 */
function getAssetType(symbol) {
  const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'AVAX', 'LINK', 'MATIC', 'DOT', 'ADA', 'XRP'];
  const upperSymbol = symbol.toUpperCase().replace('/USD', '');
  
  if (cryptoSymbols.includes(upperSymbol)) {
    return 'crypto';
  }
  
  // Check for common ETFs
  const etfSymbols = ['SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'VOO', 'IVV', 'AGG', 'BND', 'GLD', 'SLV', 'TLT'];
  if (etfSymbols.includes(upperSymbol)) {
    return 'etf';
  }
  
  return 'stock';
}

/**
 * Format symbol for Alpaca
 */
function formatSymbol(symbol, assetType) {
  const upper = symbol.toUpperCase();
  if (assetType === 'crypto' && !upper.includes('/')) {
    return `${upper}/USD`;
  }
  return upper;
}

/**
 * Get trading hours info
 */
function getTradingHours(assetType) {
  if (assetType === 'crypto') {
    return {
      hours: '24/7',
      isOpen: true, // Always open
      note: 'Crypto trades 24/7/365'
    };
  }
  
  // US Market hours (simplified)
  const now = new Date();
  const hour = now.getUTCHours() - 5; // EST
  const day = now.getUTCDay();
  
  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours = hour >= 9.5 && hour < 16;
  const isExtendedHours = (hour >= 4 && hour < 9.5) || (hour >= 16 && hour < 20);
  
  return {
    hours: '9:30 AM - 4:00 PM ET (extended: 4 AM - 8 PM)',
    isOpen: isWeekday && isMarketHours,
    isExtendedHours: isWeekday && isExtendedHours,
    note: isWeekday ? (isMarketHours ? 'Market open' : 'Extended hours') : 'Weekend - market closed'
  };
}

export { AlpacaClient, getAssetType, formatSymbol, getTradingHours };
export default AlpacaClient;
