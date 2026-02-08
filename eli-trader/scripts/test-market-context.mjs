#!/usr/bin/env node
// Test market context data collection

async function getFearGreedIndex() {
  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1');
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (e) {
    return { error: e.message };
  }
}

async function getBTCDominance() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/global');
    const data = await response.json();
    return {
      btcDominance: data.data?.market_cap_percentage?.btc?.toFixed(2) + '%',
      totalMarketCap: '$' + (data.data?.total_market_cap?.usd / 1e12).toFixed(2) + 'T'
    };
  } catch (e) {
    return { error: e.message };
  }
}

async function getPrices() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
    );
    const data = await response.json();
    return {
      BTC: `$${data.bitcoin.usd.toLocaleString()} (${data.bitcoin.usd_24h_change?.toFixed(2)}%)`,
      ETH: `$${data.ethereum.usd.toLocaleString()} (${data.ethereum.usd_24h_change?.toFixed(2)}%)`,
      SOL: `$${data.solana.usd.toLocaleString()} (${data.solana.usd_24h_change?.toFixed(2)}%)`
    };
  } catch (e) {
    return { error: e.message };
  }
}

async function getFundingRate() {
  try {
    const response = await fetch('https://fapi.binance.com/fapi/v1/fundingRate?symbol=BTCUSDT&limit=1');
    const data = await response.json();
    if (data && data[0]) {
      const rate = parseFloat(data[0].fundingRate);
      return {
        rate: (rate * 100).toFixed(4) + '%',
        annualized: (rate * 3 * 365 * 100).toFixed(2) + '%'
      };
    }
    return null;
  } catch (e) {
    return { error: e.message };
  }
}

async function main() {
  console.log('🔍 MARKET CONTEXT CHECK');
  console.log('═'.repeat(50));
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Fear & Greed
  console.log('📊 FEAR & GREED INDEX');
  console.log('-'.repeat(30));
  const fg = await getFearGreedIndex();
  if (fg.error) {
    console.log(`  ❌ Error: ${fg.error}`);
  } else {
    console.log(`  Value: ${fg.value}/100`);
    console.log(`  Classification: ${fg.value_classification}`);
    const signal = fg.value < 30 ? '🟢 Contrarian BUY signal' : 
                   fg.value > 70 ? '🔴 Contrarian SELL signal' : '🟡 Neutral';
    console.log(`  Signal: ${signal}`);
  }

  // Prices
  console.log('\n💰 PRICES (24h change)');
  console.log('-'.repeat(30));
  const prices = await getPrices();
  if (prices.error) {
    console.log(`  ❌ Error: ${prices.error}`);
  } else {
    console.log(`  BTC: ${prices.BTC}`);
    console.log(`  ETH: ${prices.ETH}`);
    console.log(`  SOL: ${prices.SOL}`);
  }

  // BTC Dominance
  console.log('\n📈 MARKET STRUCTURE');
  console.log('-'.repeat(30));
  const dom = await getBTCDominance();
  if (dom.error) {
    console.log(`  ❌ Error: ${dom.error}`);
  } else {
    console.log(`  BTC Dominance: ${dom.btcDominance}`);
    console.log(`  Total Market Cap: ${dom.totalMarketCap}`);
    const regime = parseFloat(dom.btcDominance) > 55 ? 'BTC Season' : 
                   parseFloat(dom.btcDominance) < 45 ? 'Alt Season' : 'Neutral';
    console.log(`  Regime: ${regime}`);
  }

  // Funding Rate
  console.log('\n📉 FUNDING RATE (BTC Perps)');
  console.log('-'.repeat(30));
  const funding = await getFundingRate();
  if (!funding || funding.error) {
    console.log(`  ❌ Error: ${funding?.error || 'No data'}`);
  } else {
    console.log(`  8h Rate: ${funding.rate}`);
    console.log(`  Annualized: ${funding.annualized}`);
    const ann = parseFloat(funding.annualized);
    const signal = ann > 50 ? '🔴 Longs overcrowded' :
                   ann > 20 ? '🟡 Elevated but ok' :
                   ann < -20 ? '🟢 Shorts elevated' : '⚪ Neutral';
    console.log(`  Signal: ${signal}`);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('✅ Market context collection working!');
}

main().catch(console.error);
