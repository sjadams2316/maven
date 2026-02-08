#!/usr/bin/env node
/**
 * Financial Modeling Prep Data Import
 * 
 * Fetches ETF and Mutual Fund data from FMP API
 * Free tier: 250 calls/day - enough to build a solid database
 * 
 * Usage: FMP_API_KEY=your_key node scripts/fmp-import.js
 * Or set FMP_API_KEY in .env file
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const DB_PATH = path.join(__dirname, '..', 'data', 'fmp-funds.json');

if (!API_KEY) {
  console.error('❌ FMP_API_KEY not set!');
  console.error('');
  console.error('Get a free API key at: https://financialmodelingprep.com/developer');
  console.error('Then run: FMP_API_KEY=your_key node scripts/fmp-import.js');
  console.error('Or add FMP_API_KEY=your_key to .env file');
  process.exit(1);
}

async function fetchJSON(endpoint) {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${API_KEY}`;
  console.log(`  Fetching: ${endpoint.split('?')[0]}...`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getETFList() {
  // Get all ETFs
  const etfs = await fetchJSON('/etf/list');
  return etfs.filter(e => e.exchange && ['NYSE', 'NASDAQ', 'AMEX', 'NYSEArca', 'BATS'].includes(e.exchange));
}

async function getMutualFundList() {
  // Get mutual fund list
  const funds = await fetchJSON('/mutual-fund/list');
  return funds;
}

async function getETFData(symbol) {
  try {
    const [profile, holdings] = await Promise.all([
      fetchJSON(`/etf/info?symbol=${symbol}`).catch(() => []),
      fetchJSON(`/etf-holder/${symbol}`).catch(() => [])
    ]);
    return { profile: profile[0] || null, holdings };
  } catch (e) {
    return { profile: null, holdings: [] };
  }
}

async function getQuoteData(symbols) {
  // Batch quote fetch (up to 50 at a time)
  const batches = [];
  for (let i = 0; i < symbols.length; i += 50) {
    batches.push(symbols.slice(i, i + 50));
  }
  
  const allQuotes = [];
  for (const batch of batches) {
    const quotes = await fetchJSON(`/quote/${batch.join(',')}`);
    allQuotes.push(...(Array.isArray(quotes) ? quotes : [quotes]));
    await sleep(200); // Rate limiting
  }
  return allQuotes;
}

async function getKeyMetrics(symbol) {
  try {
    const metrics = await fetchJSON(`/key-metrics/${symbol}?limit=1`);
    return metrics[0] || null;
  } catch {
    return null;
  }
}

async function main() {
  console.log('🚀 Financial Modeling Prep Data Import');
  console.log('=====================================\n');
  
  const data = {
    etfs: [],
    mutualFunds: [],
    lastUpdated: new Date().toISOString(),
    source: 'Financial Modeling Prep'
  };

  try {
    // 1. Get ETF list
    console.log('📊 Fetching ETF list...');
    const etfList = await getETFList();
    console.log(`   Found ${etfList.length} ETFs\n`);
    
    // 2. Get quotes for all ETFs (batched)
    console.log('📈 Fetching ETF quotes...');
    const etfSymbols = etfList.map(e => e.symbol);
    const etfQuotes = await getQuoteData(etfSymbols.slice(0, 500)); // Limit for free tier
    const quoteMap = new Map(etfQuotes.map(q => [q.symbol, q]));
    
    // 3. Merge ETF data
    for (const etf of etfList.slice(0, 500)) {
      const quote = quoteMap.get(etf.symbol);
      if (quote) {
        data.etfs.push({
          ticker: etf.symbol,
          name: etf.name || quote.name,
          type: 'ETF',
          exchange: etf.exchange,
          price: quote.price,
          marketCap: quote.marketCap,
          avgVolume: quote.avgVolume,
          change: quote.change,
          changePercent: quote.changesPercentage,
          yearHigh: quote.yearHigh,
          yearLow: quote.yearLow,
          // FMP doesn't have expense ratio in free tier, will need to supplement
        });
      }
    }
    console.log(`   Processed ${data.etfs.length} ETFs with quotes\n`);

    // 4. Get Mutual Fund list
    console.log('📊 Fetching Mutual Fund list...');
    const mfList = await getMutualFundList();
    console.log(`   Found ${mfList.length} Mutual Funds\n`);
    
    // 5. Get quotes for mutual funds
    console.log('📈 Fetching Mutual Fund quotes...');
    const mfSymbols = mfList.slice(0, 300).map(f => f.symbol); // Limit for free tier
    const mfQuotes = await getQuoteData(mfSymbols);
    const mfQuoteMap = new Map(mfQuotes.map(q => [q.symbol, q]));
    
    for (const fund of mfList.slice(0, 300)) {
      const quote = mfQuoteMap.get(fund.symbol);
      if (quote) {
        data.mutualFunds.push({
          ticker: fund.symbol,
          name: fund.name || quote.name,
          type: 'MF',
          price: quote.price,
          change: quote.change,
          changePercent: quote.changesPercentage,
          yearHigh: quote.yearHigh,
          yearLow: quote.yearLow,
        });
      }
    }
    console.log(`   Processed ${data.mutualFunds.length} Mutual Funds with quotes\n`);

    // 6. Save to file
    console.log('💾 Saving data...');
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    console.log(`   Saved to ${DB_PATH}\n`);
    
    // 7. Summary
    console.log('✅ Import Complete!');
    console.log('==================');
    console.log(`   ETFs: ${data.etfs.length}`);
    console.log(`   Mutual Funds: ${data.mutualFunds.length}`);
    console.log(`   Total: ${data.etfs.length + data.mutualFunds.length}`);
    console.log('');
    console.log('Note: Free tier has limited data. For full expense ratios,');
    console.log('returns, and risk metrics, supplement with Morningstar export.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
