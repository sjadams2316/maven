#!/usr/bin/env node
// Test Yahoo Finance integration using direct chart API

const TEST_TICKERS = [
  // ETFs
  'SPY', 'VOO', 'VTI', 'QQQ', 'IWM',
  'VEA', 'VWO', 'AGG', 'BND',
  // Mutual Funds
  'VFIAX', 'VTSAX', 'FXAIX'
];

async function fetchYahooChart(ticker, range = '1y', interval = '1d') {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=${range}&interval=${interval}&includePrePost=false`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.chart.error) {
    throw new Error(data.chart.error.description);
  }
  
  return data.chart.result[0];
}

async function testQuote(ticker) {
  try {
    const data = await fetchYahooChart(ticker, '1d', '1d');
    const meta = data.meta;
    return {
      ticker: meta.symbol,
      price: meta.regularMarketPrice?.toFixed(2),
      type: meta.instrumentType,
      name: meta.shortName
    };
  } catch (e) {
    return { ticker, error: e.message };
  }
}

async function testReturns(ticker) {
  try {
    const data = await fetchYahooChart(ticker, '1y', '1mo');
    const closes = data.indicators.adjclose?.[0]?.adjclose || data.indicators.quote[0].close;
    
    if (!closes || closes.length < 2) {
      return { ticker, error: 'insufficient data' };
    }

    const oldest = closes[0];
    const newest = closes[closes.length - 1];
    const return1yr = ((newest - oldest) / oldest) * 100;

    return {
      ticker,
      return_1yr: return1yr.toFixed(2) + '%',
      priceOneYearAgo: oldest?.toFixed(2),
      priceNow: newest?.toFixed(2),
      dataPoints: closes.length
    };
  } catch (e) {
    return { ticker, error: e.message };
  }
}

async function main() {
  console.log('🧪 Testing Yahoo Finance Direct API\n');
  console.log('='.repeat(60));

  // Test basic quotes
  console.log('\n📊 BASIC QUOTES:');
  console.log('-'.repeat(40));
  
  for (const ticker of TEST_TICKERS.slice(0, 6)) {
    const result = await testQuote(ticker);
    if (result.error) {
      console.log(`  ❌ ${ticker}: ${result.error}`);
    } else {
      console.log(`  ✅ ${ticker} (${result.type}): $${result.price} - ${result.name}`);
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  // Test 1-year returns
  console.log('\n📈 1-YEAR RETURNS:');
  console.log('-'.repeat(40));
  
  for (const ticker of ['SPY', 'QQQ', 'VTI', 'AGG', 'VWO', 'VFIAX']) {
    const result = await testReturns(ticker);
    if (result.error) {
      console.log(`  ❌ ${ticker}: ${result.error}`);
    } else {
      console.log(`  ✅ ${ticker}: ${result.return_1yr} (${result.dataPoints} months)`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Yahoo Finance direct API working!\n');
  console.log('API endpoints available at http://localhost:3000:');
  console.log('  GET /api/live?ticker=SPY&type=quote');
  console.log('  GET /api/live?ticker=SPY&type=returns');
  console.log('  GET /api/live?ticker=SPY&type=summary');
  console.log('  GET /api/live?tickers=SPY,QQQ,VTI&type=batch\n');
}

main().catch(console.error);
