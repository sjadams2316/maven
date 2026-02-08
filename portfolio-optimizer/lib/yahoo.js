// Yahoo Finance live data integration (direct API)
// Uses Yahoo's chart endpoint which still works

/**
 * Fetch data from Yahoo Finance chart API
 */
async function fetchYahooChart(ticker, range = '1y', interval = '1d') {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=${range}&interval=${interval}&includePrePost=false`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Yahoo API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.chart.error) {
    throw new Error(data.chart.error.description);
  }
  
  return data.chart.result[0];
}

/**
 * Get live quote for a ticker (ETF or mutual fund)
 */
export async function getQuote(ticker) {
  try {
    const data = await fetchYahooChart(ticker, '1d', '1d');
    const meta = data.meta;
    
    return {
      ticker: meta.symbol,
      price: meta.regularMarketPrice,
      previousClose: meta.chartPreviousClose || meta.previousClose,
      change: meta.regularMarketPrice - (meta.chartPreviousClose || meta.previousClose),
      changePercent: ((meta.regularMarketPrice - (meta.chartPreviousClose || meta.previousClose)) / (meta.chartPreviousClose || meta.previousClose)) * 100,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      currency: meta.currency,
      exchange: meta.exchangeName,
      type: meta.instrumentType, // 'ETF', 'MUTUALFUND', 'EQUITY'
      asOf: new Date(meta.regularMarketTime * 1000).toISOString()
    };
  } catch (error) {
    console.error(`Error fetching quote for ${ticker}:`, error.message);
    return null;
  }
}

/**
 * Get historical data and calculate returns
 */
export async function getReturns(ticker) {
  try {
    // Get 5 years of monthly data
    const data = await fetchYahooChart(ticker, '5y', '1mo');
    const timestamps = data.timestamp;
    const closes = data.indicators.adjclose?.[0]?.adjclose || data.indicators.quote[0].close;
    
    if (!timestamps || !closes || closes.length < 2) {
      return null;
    }

    const now = new Date();
    const currentPrice = closes[closes.length - 1];
    
    // Helper to find price at approximate date
    const findPriceAtDate = (targetDate) => {
      const targetTs = targetDate.getTime() / 1000;
      for (let i = 0; i < timestamps.length; i++) {
        if (timestamps[i] >= targetTs) {
          return closes[i];
        }
      }
      return null;
    };

    // Calculate returns
    const returns = {
      ticker,
      currentPrice,
      asOf: new Date(timestamps[timestamps.length - 1] * 1000).toISOString(),
      return_1yr: null,
      return_3yr: null,
      return_5yr: null,
      return_ytd: null
    };

    // 1-year return
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const price1y = findPriceAtDate(oneYearAgo);
    if (price1y) {
      returns.return_1yr = ((currentPrice - price1y) / price1y) * 100;
    }

    // 3-year return (annualized)
    const threeYearsAgo = new Date(now);
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    const price3y = findPriceAtDate(threeYearsAgo);
    if (price3y) {
      const totalReturn = (currentPrice - price3y) / price3y;
      returns.return_3yr = (Math.pow(1 + totalReturn, 1/3) - 1) * 100;
    }

    // 5-year return (annualized)
    const price5y = closes[0]; // First data point (5 years ago)
    if (price5y) {
      const totalReturn = (currentPrice - price5y) / price5y;
      returns.return_5yr = (Math.pow(1 + totalReturn, 1/5) - 1) * 100;
    }

    // YTD return
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const priceYtd = findPriceAtDate(yearStart);
    if (priceYtd) {
      returns.return_ytd = ((currentPrice - priceYtd) / priceYtd) * 100;
    }

    return returns;
  } catch (error) {
    console.error(`Error fetching returns for ${ticker}:`, error.message);
    return null;
  }
}

/**
 * Get multiple quotes at once
 */
export async function getBatchQuotes(tickers) {
  const results = await Promise.allSettled(
    tickers.map(ticker => getQuote(ticker))
  );
  
  return results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);
}

/**
 * Get fund summary - more detailed info
 */
export async function getFundSummary(ticker) {
  try {
    // Get quote data
    const [dayData, yearData] = await Promise.all([
      fetchYahooChart(ticker, '1d', '1d'),
      fetchYahooChart(ticker, '1y', '1mo')
    ]);
    
    const meta = dayData.meta;
    const returns = await getReturns(ticker);

    return {
      ticker: meta.symbol,
      name: meta.longName || meta.shortName || ticker,
      type: meta.instrumentType,
      price: meta.regularMarketPrice,
      previousClose: meta.chartPreviousClose,
      currency: meta.currency,
      exchange: meta.exchangeName,
      return_1yr: returns?.return_1yr,
      return_3yr: returns?.return_3yr,
      return_5yr: returns?.return_5yr,
      return_ytd: returns?.return_ytd,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      asOf: new Date(meta.regularMarketTime * 1000).toISOString()
    };
  } catch (error) {
    console.error(`Error fetching summary for ${ticker}:`, error.message);
    return null;
  }
}

/**
 * Validate data against what we have stored
 */
export async function validateStoredReturns(ticker, storedReturn1yr) {
  const liveReturns = await getReturns(ticker);
  if (!liveReturns || liveReturns.return_1yr === null) {
    return { ticker, status: 'no_data' };
  }

  const diff = Math.abs(liveReturns.return_1yr - storedReturn1yr);
  const status = diff < 2 ? 'ok' : diff < 5 ? 'stale' : 'outdated';

  return {
    ticker,
    stored: storedReturn1yr,
    live: liveReturns.return_1yr,
    diff,
    status
  };
}
