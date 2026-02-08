// Vanta Network (Bittensor Subnet 8) Signal Integration
// https://taoshi.io / https://request.taoshi.io

/**
 * VantaClient - Connects to Taoshi's Request Network for trading signals
 * 
 * To use:
 * 1. Sign up at https://request.taoshi.io
 * 2. Select a Subnet 8 validator
 * 3. Subscribe via Stripe
 * 4. Get your API key
 * 5. Set VANTA_API_KEY and VANTA_VALIDATOR_URL in .env
 */

class VantaClient {
  constructor(apiKey, validatorUrl) {
    this.apiKey = apiKey || process.env.VANTA_API_KEY;
    this.validatorUrl = validatorUrl || process.env.VANTA_VALIDATOR_URL;
    this.connected = false;
  }

  /**
   * Check if client is configured
   */
  isConfigured() {
    return !!(this.apiKey && this.validatorUrl);
  }

  /**
   * Get current trading signals from Vanta network
   * Returns array of signals with trade pair, direction, leverage, timestamp
   */
  async getSignals() {
    if (!this.isConfigured()) {
      return { error: 'Vanta API not configured. Set VANTA_API_KEY and VANTA_VALIDATOR_URL.' };
    }

    try {
      const response = await fetch(`${this.validatorUrl}/v1/signals`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Vanta API error: ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeSignals(data);
    } catch (error) {
      console.error('Vanta signal fetch error:', error);
      return { error: error.message };
    }
  }

  /**
   * Get top performing miners/strategies
   */
  async getTopMiners(assetClass = 'crypto', limit = 10) {
    if (!this.isConfigured()) {
      return { error: 'Vanta API not configured' };
    }

    try {
      const response = await fetch(`${this.validatorUrl}/v1/miners?asset_class=${assetClass}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Vanta API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Vanta miners fetch error:', error);
      return { error: error.message };
    }
  }

  /**
   * Normalize signals to common format
   */
  normalizeSignals(rawSignals) {
    if (!Array.isArray(rawSignals)) {
      return rawSignals;
    }

    return rawSignals.map(signal => ({
      tradePair: signal.trade_pair || signal.symbol,
      direction: signal.direction || signal.signal_type, // LONG, SHORT, FLAT
      leverage: signal.leverage || 1,
      confidence: signal.confidence || signal.weight || null,
      minerId: signal.miner_id || signal.hotkey,
      timestamp: signal.timestamp || new Date().toISOString(),
      assetClass: this.classifyAsset(signal.trade_pair || signal.symbol)
    }));
  }

  /**
   * Classify asset into categories
   */
  classifyAsset(symbol) {
    if (!symbol) return 'unknown';
    
    const upperSymbol = symbol.toUpperCase();
    
    // Crypto pairs
    if (upperSymbol.includes('BTC') || upperSymbol.includes('ETH') || 
        upperSymbol.includes('USDT') || upperSymbol.includes('SOL')) {
      return 'crypto';
    }
    
    // Forex pairs
    if (upperSymbol.includes('USD') && (upperSymbol.includes('EUR') || 
        upperSymbol.includes('GBP') || upperSymbol.includes('JPY') ||
        upperSymbol.includes('CHF') || upperSymbol.includes('AUD'))) {
      return 'forex';
    }
    
    // Equities (if Vanta expands to stocks)
    if (upperSymbol.includes('SPY') || upperSymbol.includes('QQQ')) {
      return 'equity';
    }
    
    return 'other';
  }
}

/**
 * Public dashboard data (no API key required)
 * Scrapes publicly available data from dashboard.taoshi.io
 */
async function getPublicDashboardData() {
  // The dashboard shows top miners publicly
  // This is a fallback when no API key is configured
  try {
    const response = await fetch('https://dashboard.taoshi.io/api/miners', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (!response.ok) {
      return { error: 'Dashboard API not available', fallback: true };
    }
    
    return await response.json();
  } catch (error) {
    return { 
      error: 'Could not fetch public dashboard data',
      note: 'For full signal access, subscribe via https://request.taoshi.io'
    };
  }
}

/**
 * Convert Vanta signals to portfolio optimizer recommendations
 * Maps trading signals to asset allocation suggestions
 */
function signalsToAllocation(signals) {
  if (!Array.isArray(signals) || signals.length === 0) {
    return null;
  }

  const allocation = {
    timestamp: new Date().toISOString(),
    source: 'vanta',
    recommendations: []
  };

  // Group signals by asset class
  const byClass = signals.reduce((acc, sig) => {
    const cls = sig.assetClass || 'other';
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(sig);
    return acc;
  }, {});

  // Generate allocation recommendations
  for (const [assetClass, classSignals] of Object.entries(byClass)) {
    const longSignals = classSignals.filter(s => s.direction === 'LONG');
    const shortSignals = classSignals.filter(s => s.direction === 'SHORT');
    const flatSignals = classSignals.filter(s => s.direction === 'FLAT');

    const netSentiment = (longSignals.length - shortSignals.length) / classSignals.length;

    allocation.recommendations.push({
      assetClass,
      sentiment: netSentiment > 0.2 ? 'bullish' : netSentiment < -0.2 ? 'bearish' : 'neutral',
      sentimentScore: netSentiment,
      longCount: longSignals.length,
      shortCount: shortSignals.length,
      flatCount: flatSignals.length,
      totalSignals: classSignals.length,
      suggestedAction: netSentiment > 0.3 ? 'overweight' : netSentiment < -0.3 ? 'underweight' : 'hold'
    });
  }

  return allocation;
}

// Export
export { VantaClient, getPublicDashboardData, signalsToAllocation };
export default VantaClient;
