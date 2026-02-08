// Market Context Analysis
// Collects and analyzes broader market conditions to inform trading decisions

import fs from 'fs/promises';

const PRICE_CACHE_FILE = './data/price-cache.json';
let priceCache = null;

/**
 * Load or initialize price cache
 */
async function loadPriceCache() {
  if (priceCache) return priceCache;
  try {
    const data = await fs.readFile(PRICE_CACHE_FILE, 'utf-8');
    priceCache = JSON.parse(data);
  } catch {
    priceCache = { prices: null, timestamp: null };
  }
  return priceCache;
}

/**
 * Save price cache
 */
async function savePriceCache(prices) {
  priceCache = { prices, timestamp: Date.now() };
  try {
    await fs.writeFile(PRICE_CACHE_FILE, JSON.stringify(priceCache, null, 2));
  } catch (err) {
    console.warn('Failed to save price cache:', err.message);
  }
}

/**
 * Fear & Greed Index
 * Source: alternative.me (free API)
 */
export async function getFearGreedIndex() {
  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1');
    const data = await response.json();
    
    if (data.data && data.data[0]) {
      const fg = data.data[0];
      return {
        value: parseInt(fg.value),
        classification: fg.value_classification, // "Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"
        timestamp: new Date(fg.timestamp * 1000).toISOString(),
        interpretation: interpretFearGreed(parseInt(fg.value))
      };
    }
    return null;
  } catch (error) {
    console.error('Fear & Greed fetch error:', error);
    return null;
  }
}

function interpretFearGreed(value) {
  if (value <= 20) return { signal: 'strong_buy', note: 'Extreme fear often marks bottoms' };
  if (value <= 40) return { signal: 'buy', note: 'Fear can present opportunities' };
  if (value <= 60) return { signal: 'neutral', note: 'Market sentiment balanced' };
  if (value <= 80) return { signal: 'sell', note: 'Greed suggests caution' };
  return { signal: 'strong_sell', note: 'Extreme greed often marks tops' };
}

/**
 * BTC Dominance
 * Indicates whether money is flowing to BTC or alts
 */
export async function getBTCDominance() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/global');
    const data = await response.json();
    
    if (data.data) {
      const btcDom = data.data.market_cap_percentage.btc;
      return {
        btcDominance: btcDom,
        ethDominance: data.data.market_cap_percentage.eth,
        totalMarketCap: data.data.total_market_cap.usd,
        interpretation: interpretBTCDominance(btcDom)
      };
    }
    return null;
  } catch (error) {
    console.error('BTC Dominance fetch error:', error);
    return null;
  }
}

function interpretBTCDominance(dominance) {
  if (dominance >= 55) return { regime: 'btc_season', note: 'Money flowing to BTC, alts underperforming' };
  if (dominance >= 45) return { regime: 'neutral', note: 'Balanced market' };
  return { regime: 'alt_season', note: 'Money flowing to alts, higher risk/reward' };
}

/**
 * Funding Rates
 * Indicates positioning in futures markets
 */
export async function getFundingRates() {
  try {
    // Using CoinGlass public data or Binance
    const response = await fetch('https://fapi.binance.com/fapi/v1/fundingRate?symbol=BTCUSDT&limit=1');
    const data = await response.json();
    
    if (data && data[0]) {
      const rate = parseFloat(data[0].fundingRate);
      return {
        btcFundingRate: rate,
        annualized: rate * 3 * 365 * 100, // 8-hour rate to annual %
        interpretation: interpretFundingRate(rate)
      };
    }
    return null;
  } catch (error) {
    console.error('Funding rate fetch error:', error);
    return null;
  }
}

function interpretFundingRate(rate) {
  const annualized = rate * 3 * 365 * 100;
  if (annualized > 50) return { signal: 'bearish', note: 'Longs overcrowded, squeeze risk' };
  if (annualized > 20) return { signal: 'cautious', note: 'Positive but elevated' };
  if (annualized > -20) return { signal: 'neutral', note: 'Balanced positioning' };
  if (annualized > -50) return { signal: 'bullish', note: 'Shorts elevated, squeeze potential' };
  return { signal: 'very_bullish', note: 'Shorts extremely overcrowded' };
}

/**
 * Simple Price Data
 * Quick price check for major assets
 * Falls back to cache when API is unavailable
 */
export async function getPrices() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
    );
    const data = await response.json();
    
    // Handle rate limit or error response
    if (data.status?.error_code || !data.bitcoin) {
      console.warn('CoinGecko rate limited, falling back to cache');
      return getCachedPrices();
    }
    
    const prices = {
      btc: { price: data.bitcoin?.usd, change24h: data.bitcoin?.usd_24h_change },
      eth: { price: data.ethereum?.usd, change24h: data.ethereum?.usd_24h_change },
      sol: { price: data.solana?.usd, change24h: data.solana?.usd_24h_change },
      timestamp: new Date().toISOString()
    };
    
    // Cache successful fetch
    await savePriceCache(prices);
    return prices;
  } catch (error) {
    console.warn('Price fetch error, falling back to cache:', error.message);
    return getCachedPrices();
  }
}

/**
 * Get cached prices (used when API fails)
 */
async function getCachedPrices() {
  const cache = await loadPriceCache();
  if (cache.prices) {
    // Mark as cached
    const cacheAge = Date.now() - cache.timestamp;
    const cacheAgeMin = Math.round(cacheAge / 60000);
    console.log(`Using cached prices (${cacheAgeMin} min old)`);
    return { ...cache.prices, cached: true, cacheAge };
  }
  return null;
}

/**
 * Aggregate Market Context
 * Combines all signals into overall market assessment
 */
export async function getMarketContext() {
  const [fearGreed, btcDom, funding, prices] = await Promise.all([
    getFearGreedIndex(),
    getBTCDominance(),
    getFundingRates(),
    getPrices()
  ]);

  // Calculate overall regime
  let bullishSignals = 0;
  let bearishSignals = 0;

  if (fearGreed) {
    if (fearGreed.value < 30) bullishSignals++; // Contrarian: fear = bullish
    if (fearGreed.value > 70) bearishSignals++; // Contrarian: greed = bearish
  }

  if (funding && funding.interpretation) {
    if (funding.interpretation.signal === 'bullish' || funding.interpretation.signal === 'very_bullish') bullishSignals++;
    if (funding.interpretation.signal === 'bearish') bearishSignals++;
  }

  if (prices && prices.btc) {
    if (prices.btc.change24h > 3) bullishSignals++; // Momentum
    if (prices.btc.change24h < -3) bearishSignals++;
  }

  // Determine regime
  let regime = 'neutral';
  let confidence = 0.5;
  
  if (bullishSignals >= 2 && bearishSignals === 0) {
    regime = 'risk_on';
    confidence = 0.7 + (bullishSignals * 0.1);
  } else if (bearishSignals >= 2 && bullishSignals === 0) {
    regime = 'risk_off';
    confidence = 0.7 + (bearishSignals * 0.1);
  } else if (bullishSignals > bearishSignals) {
    regime = 'slight_risk_on';
    confidence = 0.55;
  } else if (bearishSignals > bullishSignals) {
    regime = 'slight_risk_off';
    confidence = 0.55;
  }

  return {
    timestamp: new Date().toISOString(),
    regime,
    confidence: Math.min(confidence, 1),
    components: {
      fearGreed,
      btcDominance: btcDom,
      funding,
      prices
    },
    signals: {
      bullish: bullishSignals,
      bearish: bearishSignals
    },
    recommendation: getRegimeRecommendation(regime)
  };
}

function getRegimeRecommendation(regime) {
  switch (regime) {
    case 'risk_on':
      return { 
        positionSize: 1.0, // Full size
        bias: 'long',
        note: 'Favorable conditions for long positions'
      };
    case 'slight_risk_on':
      return {
        positionSize: 0.75,
        bias: 'long',
        note: 'Cautiously bullish, reduce size slightly'
      };
    case 'neutral':
      return {
        positionSize: 0.5,
        bias: 'none',
        note: 'Mixed signals, reduce exposure'
      };
    case 'slight_risk_off':
      return {
        positionSize: 0.25,
        bias: 'short',
        note: 'Cautiously bearish, minimal exposure'
      };
    case 'risk_off':
      return {
        positionSize: 0,
        bias: 'short',
        note: 'Unfavorable conditions, stay flat or short only'
      };
    default:
      return {
        positionSize: 0.5,
        bias: 'none',
        note: 'Unknown regime'
      };
  }
}

export default { getMarketContext, getFearGreedIndex, getBTCDominance, getFundingRates, getPrices };
