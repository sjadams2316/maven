import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for quotes (1 minute TTL)
const quoteCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000;

// CoinGecko ID mapping for crypto
const CRYPTO_IDS: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'TAO': 'bittensor',
  // Note: TAOX is an ETP traded on exchanges - fetch from Yahoo, not CoinGecko
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'DOT': 'polkadot',
  'ADA': 'cardano',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'MATIC': 'matic-network',
};

// Fallback names for common tickers
const TICKER_NAMES: Record<string, string> = {
  // Indices
  '^GSPC': 'S&P 500',
  '^IXIC': 'Nasdaq Composite',
  '^DJI': 'Dow Jones Industrial',
  'SPY': 'SPDR S&P 500 ETF',
  'QQQ': 'Invesco QQQ Trust',
  'DIA': 'SPDR Dow Jones ETF',
  
  // Big Tech
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'NVDA': 'NVIDIA Corporation',
  'META': 'Meta Platforms Inc.',
  'TSLA': 'Tesla Inc.',
  
  // ETFs
  'VTI': 'Vanguard Total Stock Market ETF',
  'VOO': 'Vanguard S&P 500 ETF',
  'VT': 'Vanguard Total World Stock ETF',
  'VEA': 'Vanguard FTSE Developed Markets ETF',
  'VWO': 'Vanguard FTSE Emerging Markets ETF',
  'BND': 'Vanguard Total Bond Market ETF',
  'VXUS': 'Vanguard Total International Stock ETF',
  'IVV': 'iShares Core S&P 500 ETF',
  'AGG': 'iShares Core U.S. Aggregate Bond ETF',
  'SCHD': 'Schwab U.S. Dividend Equity ETF',
  
  // Capital Group / American Funds
  'GFFFX': 'Growth Fund of America F-2',
  'ANWFX': 'New Perspective Fund F-2',
  'ANEFX': 'New Economy Fund F-2',
  'AIVSX': 'Washington Mutual Investors F-2',
  'AFIFX': 'Fundamental Investors F-2',
  'AEPFX': 'EuroPacific Growth F-2',
  'ANCFX': 'Capital Income Builder F-2',
  'SMCFX': 'SMALLCAP World Fund F-2',
  'AGTHX': 'Growth Fund of America A',
  
  // Fidelity
  'FXAIX': 'Fidelity 500 Index Fund',
  'FCNTX': 'Fidelity Contrafund',
  'FSKAX': 'Fidelity Total Market Index Fund',
  
  // Crypto-related stocks
  'CIFR': 'Cipher Mining Inc.',
  'IREN': 'Iris Energy Limited',
  'COIN': 'Coinbase Global Inc.',
  'MARA': 'Marathon Digital Holdings',
  'RIOT': 'Riot Platforms Inc.',
  'MSTR': 'MicroStrategy Inc.',
  'IBIT': 'iShares Bitcoin Trust ETF',
  'FBTC': 'Fidelity Wise Origin Bitcoin',
  'GBTC': 'Grayscale Bitcoin Trust',
  
  // Crypto
  'BTC': 'Bitcoin',
  'ETH': 'Ethereum',
  'SOL': 'Solana',
  'TAO': 'Bittensor TAO',
  'TAOX': 'Valour Tao SEK (Bittensor ETP)',
  'AVAX': 'Avalanche',
  'LINK': 'Chainlink',
  'DOT': 'Polkadot',
  'ADA': 'Cardano',
  'XRP': 'Ripple XRP',
  'DOGE': 'Dogecoin',
};

async function fetchYahooQuote(ticker: string): Promise<{ name: string; price: number } | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;
    
    const price = result.meta?.regularMarketPrice;
    const name = result.meta?.shortName || result.meta?.longName || TICKER_NAMES[ticker] || ticker;
    
    return { name, price };
  } catch (error) {
    console.error(`Yahoo fetch error for ${ticker}:`, error);
    return null;
  }
}

async function fetchCryptoPrice(ticker: string): Promise<{ name: string; price: number } | null> {
  const geckoId = CRYPTO_IDS[ticker.toUpperCase()];
  if (!geckoId) return null;
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const price = data[geckoId]?.usd;
    
    if (!price) return null;
    
    return {
      name: TICKER_NAMES[ticker.toUpperCase()] || ticker,
      price,
    };
  } catch (error) {
    console.error(`CoinGecko fetch error for ${ticker}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
  }

  // Check cache first
  const cached = quoteCache.get(ticker);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // Try crypto first if it's a known crypto ticker
  if (CRYPTO_IDS[ticker]) {
    const cryptoData = await fetchCryptoPrice(ticker);
    if (cryptoData) {
      const response = {
        ticker,
        name: cryptoData.name,
        price: cryptoData.price,
        source: 'coingecko',
      };
      quoteCache.set(ticker, { data: response, timestamp: Date.now() });
      return NextResponse.json(response);
    }
  }

  // Try Yahoo Finance for stocks/ETFs/mutual funds
  const yahooData = await fetchYahooQuote(ticker);
  if (yahooData) {
    const response = {
      ticker,
      name: yahooData.name,
      price: yahooData.price,
      source: 'yahoo',
    };
    quoteCache.set(ticker, { data: response, timestamp: Date.now() });
    return NextResponse.json(response);
  }

  // Fallback - return ticker with no price
  return NextResponse.json({
    ticker,
    name: TICKER_NAMES[ticker] || ticker,
    price: null,
    source: 'none',
  });
}
