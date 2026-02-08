#!/usr/bin/env node
// Paper Trading CLI
// Usage: 
//   node paper-trade.mjs init [capital]     - Initialize with starting capital
//   node paper-trade.mjs buy BTC 1000       - Buy $1000 of BTC
//   node paper-trade.mjs sell BTC 500       - Sell $500 of BTC
//   node paper-trade.mjs close BTC          - Close BTC position
//   node paper-trade.mjs status             - Show portfolio status
//   node paper-trade.mjs history            - Show trade history
//   node paper-trade.mjs context            - Show market context

import fs from 'fs/promises';
import path from 'path';
import { getMarketContext, getPrices } from '../lib/market-context.js';

const DATA_DIR = './data';
const TRADES_FILE = path.join(DATA_DIR, 'paper-trades.json');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'paper-portfolio.json');

// Price fetcher - uses cached prices when API rate limited
async function getPrice(symbol) {
  const symbolKey = symbol.toLowerCase();
  
  try {
    // Get from market context (has caching)
    const context = await getMarketContext();
    const priceData = context?.components?.prices?.[symbolKey];
    if (priceData?.price) {
      return { price: priceData.price, change24h: priceData.change24h };
    }
  } catch (err) {
    console.warn('Market context fetch failed:', err.message);
  }
  
  // Fallback to direct fetch
  const map = { btc: 'bitcoin', eth: 'ethereum', sol: 'solana' };
  const coinId = map[symbolKey];
  if (!coinId) return null;
  
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
    const data = await res.json();
    if (data.status?.error_code) return null;
    return { price: data[coinId]?.usd, change24h: data[coinId]?.usd_24h_change };
  } catch {
    return null;
  }
}

// Ensure data dir
async function ensureDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch {}
}

// Load portfolio
async function loadPortfolio() {
  try {
    const data = await fs.readFile(PORTFOLIO_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Save portfolio
async function savePortfolio(p) {
  await ensureDir();
  p.updatedAt = new Date().toISOString();
  await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(p, null, 2));
}

// Load trades
async function loadTrades() {
  try {
    const data = await fs.readFile(TRADES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save trade
async function saveTrade(trade) {
  await ensureDir();
  const trades = await loadTrades();
  trades.push(trade);
  await fs.writeFile(TRADES_FILE, JSON.stringify(trades, null, 2));
}

// Commands
async function init(capital = 10000) {
  const portfolio = {
    startingCapital: capital,
    cash: capital,
    positions: {},
    totalValue: capital,
    createdAt: new Date().toISOString()
  };
  await savePortfolio(portfolio);
  console.log(`\n✅ Paper trading initialized with $${capital.toLocaleString()}`);
  console.log('   Ready to trade BTC, ETH, SOL\n');
}

async function buy(symbol, amount) {
  const portfolio = await loadPortfolio();
  if (!portfolio) {
    console.log('❌ No portfolio. Run: node paper-trade.mjs init');
    return;
  }

  symbol = symbol.toUpperCase();
  amount = parseFloat(amount);

  if (amount > portfolio.cash) {
    console.log(`❌ Insufficient cash. Have $${portfolio.cash.toFixed(2)}, need $${amount}`);
    return;
  }

  const priceData = await getPrice(symbol);
  if (!priceData?.price) {
    console.log(`❌ Could not get price for ${symbol}`);
    return;
  }

  const price = priceData.price;
  const quantity = amount / price;

  // Update position
  if (portfolio.positions[symbol]) {
    const pos = portfolio.positions[symbol];
    const newQty = pos.quantity + quantity;
    const newCost = pos.costBasis + amount;
    portfolio.positions[symbol] = {
      ...pos,
      quantity: newQty,
      costBasis: newCost,
      avgPrice: newCost / newQty
    };
  } else {
    portfolio.positions[symbol] = {
      symbol,
      direction: 'LONG',
      quantity,
      costBasis: amount,
      avgPrice: price,
      openedAt: new Date().toISOString()
    };
  }

  portfolio.cash -= amount;
  await savePortfolio(portfolio);

  // Log trade
  await saveTrade({
    id: `trade_${Date.now()}`,
    timestamp: new Date().toISOString(),
    symbol,
    direction: 'BUY',
    amount,
    price,
    quantity
  });

  console.log(`\n✅ BOUGHT ${quantity.toFixed(6)} ${symbol} @ $${price.toLocaleString()}`);
  console.log(`   Cost: $${amount.toLocaleString()}`);
  console.log(`   Cash remaining: $${portfolio.cash.toFixed(2)}\n`);
}

async function sell(symbol, amount) {
  const portfolio = await loadPortfolio();
  if (!portfolio) {
    console.log('❌ No portfolio. Run: node paper-trade.mjs init');
    return;
  }

  symbol = symbol.toUpperCase();
  amount = parseFloat(amount);

  const pos = portfolio.positions[symbol];
  if (!pos) {
    console.log(`❌ No position in ${symbol}`);
    return;
  }

  const priceData = await getPrice(symbol);
  if (!priceData?.price) {
    console.log(`❌ Could not get price for ${symbol}`);
    return;
  }

  const price = priceData.price;
  const currentValue = pos.quantity * price;
  const sellQuantity = Math.min(amount / price, pos.quantity);
  const sellValue = sellQuantity * price;
  const pnl = (price - pos.avgPrice) * sellQuantity;

  // Update position
  pos.quantity -= sellQuantity;
  pos.costBasis = pos.quantity * pos.avgPrice;
  
  if (pos.quantity <= 0.000001) {
    delete portfolio.positions[symbol];
  }

  portfolio.cash += sellValue;
  await savePortfolio(portfolio);

  // Log trade
  await saveTrade({
    id: `trade_${Date.now()}`,
    timestamp: new Date().toISOString(),
    symbol,
    direction: 'SELL',
    amount: sellValue,
    price,
    quantity: sellQuantity,
    pnl,
    pnlPercent: (pnl / (sellQuantity * pos.avgPrice)) * 100
  });

  const pnlEmoji = pnl >= 0 ? '🟢' : '🔴';
  console.log(`\n✅ SOLD ${sellQuantity.toFixed(6)} ${symbol} @ $${price.toLocaleString()}`);
  console.log(`   Proceeds: $${sellValue.toFixed(2)}`);
  console.log(`   ${pnlEmoji} P&L: $${pnl.toFixed(2)} (${((pnl / (sellQuantity * pos.avgPrice)) * 100).toFixed(2)}%)`);
  console.log(`   Cash: $${portfolio.cash.toFixed(2)}\n`);
}

async function close(symbol) {
  const portfolio = await loadPortfolio();
  if (!portfolio) return;
  
  symbol = symbol.toUpperCase();
  const pos = portfolio.positions[symbol];
  if (!pos) {
    console.log(`❌ No position in ${symbol}`);
    return;
  }

  const priceData = await getPrice(symbol);
  const sellValue = pos.quantity * priceData.price;
  await sell(symbol, sellValue);
}

async function status() {
  const portfolio = await loadPortfolio();
  if (!portfolio) {
    console.log('❌ No portfolio. Run: node paper-trade.mjs init');
    return;
  }

  // Calculate current values
  let totalValue = portfolio.cash;
  const positionDetails = [];
  let pricesFailed = false;

  const positions = Object.entries(portfolio.positions || {});
  
  for (const [symbol, pos] of positions) {
    const priceData = await getPrice(symbol);
    if (priceData?.price) {
      const currentValue = pos.quantity * priceData.price;
      const pnl = currentValue - pos.costBasis;
      const pnlPercent = (pnl / pos.costBasis) * 100;
      totalValue += currentValue;
      positionDetails.push({
        symbol,
        quantity: pos.quantity,
        avgPrice: pos.avgPrice,
        currentPrice: priceData.price,
        costBasis: pos.costBasis,
        currentValue,
        pnl,
        pnlPercent,
        change24h: priceData.change24h
      });
    } else {
      // Price fetch failed - show position at cost basis
      pricesFailed = true;
      totalValue += pos.costBasis;
      positionDetails.push({
        symbol,
        quantity: pos.quantity,
        avgPrice: pos.avgPrice,
        currentPrice: null,
        costBasis: pos.costBasis,
        currentValue: pos.costBasis,
        pnl: 0,
        pnlPercent: 0,
        change24h: null
      });
    }
  }

  const totalPnL = totalValue - portfolio.startingCapital;
  const totalPnLPercent = (totalPnL / portfolio.startingCapital) * 100;

  console.log('\n📊 PAPER TRADING PORTFOLIO');
  console.log('═'.repeat(50));
  if (pricesFailed) {
    console.log('⚠️  Live prices unavailable (rate limited) - showing cost basis');
  }
  console.log(`Started: ${portfolio.createdAt.split('T')[0]}`);
  console.log(`Starting Capital: $${portfolio.startingCapital.toLocaleString()}`);
  console.log(`Current Value:    $${totalValue.toFixed(2)}`);
  console.log(`Cash:             $${portfolio.cash.toFixed(2)}`);
  
  const pnlEmoji = totalPnL >= 0 ? '🟢' : '🔴';
  console.log(`${pnlEmoji} Total P&L:       $${totalPnL.toFixed(2)} (${totalPnLPercent.toFixed(2)}%)`);

  if (positionDetails.length > 0) {
    console.log('\n📈 POSITIONS');
    console.log('-'.repeat(50));
    for (const p of positionDetails) {
      const emoji = p.pnl >= 0 ? '🟢' : '🔴';
      console.log(`\n  ${p.symbol}:`);
      console.log(`    Quantity: ${p.quantity.toFixed(6)}`);
      console.log(`    Avg Price: $${p.avgPrice.toLocaleString()}`);
      if (p.currentPrice) {
        console.log(`    Current:   $${p.currentPrice.toLocaleString()} (${p.change24h?.toFixed(2)}% 24h)`);
        console.log(`    Value:     $${p.currentValue.toFixed(2)}`);
        console.log(`    ${emoji} P&L:      $${p.pnl.toFixed(2)} (${p.pnlPercent.toFixed(2)}%)`);
      } else {
        console.log(`    Current:   (price unavailable)`);
        console.log(`    Cost Basis: $${p.costBasis.toFixed(2)}`);
      }
    }
  } else if (positions.length === 0) {
    console.log('\n  No open positions');
  }
  console.log('\n' + '═'.repeat(50) + '\n');
}

async function history() {
  const trades = await loadTrades();
  if (trades.length === 0) {
    console.log('\n📜 No trades yet\n');
    return;
  }

  console.log('\n📜 TRADE HISTORY (last 20)');
  console.log('═'.repeat(60));
  
  for (const t of trades.slice(-20)) {
    const time = t.timestamp.split('T')[1].split('.')[0];
    const date = t.timestamp.split('T')[0];
    const pnlStr = t.pnl !== undefined 
      ? ` | P&L: $${t.pnl.toFixed(2)} (${t.pnlPercent?.toFixed(1)}%)`
      : '';
    console.log(`  ${date} ${time} | ${t.direction.padEnd(4)} ${t.symbol} | $${t.amount?.toFixed(2) || (t.quantity * t.price).toFixed(2)} @ $${t.price.toLocaleString()}${pnlStr}`);
  }
  console.log('\n');
}

async function context() {
  console.log('\n🔍 FETCHING MARKET CONTEXT...\n');
  
  // Fear & Greed
  const fgRes = await fetch('https://api.alternative.me/fng/?limit=1');
  const fgData = await fgRes.json();
  const fg = fgData.data?.[0];
  
  // Prices
  const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
  const prices = await priceRes.json();
  
  // Dominance
  const domRes = await fetch('https://api.coingecko.com/api/v3/global');
  const domData = await domRes.json();
  
  console.log('📊 MARKET CONTEXT');
  console.log('═'.repeat(40));
  console.log(`\nFear & Greed: ${fg?.value}/100 (${fg?.value_classification})`);
  console.log(`  Signal: ${fg?.value < 30 ? '🟢 Contrarian BUY' : fg?.value > 70 ? '🔴 Contrarian SELL' : '🟡 Neutral'}`);
  
  console.log(`\nPrices (24h):`);
  console.log(`  BTC: $${prices.bitcoin.usd.toLocaleString()} (${prices.bitcoin.usd_24h_change?.toFixed(2)}%)`);
  console.log(`  ETH: $${prices.ethereum.usd.toLocaleString()} (${prices.ethereum.usd_24h_change?.toFixed(2)}%)`);
  console.log(`  SOL: $${prices.solana.usd.toLocaleString()} (${prices.solana.usd_24h_change?.toFixed(2)}%)`);
  
  console.log(`\nMarket Structure:`);
  console.log(`  BTC Dominance: ${domData.data?.market_cap_percentage?.btc?.toFixed(2)}%`);
  console.log(`  Total MCap: $${(domData.data?.total_market_cap?.usd / 1e12).toFixed(2)}T`);
  console.log('\n');
}

// Main
const [,, command, ...args] = process.argv;

switch (command) {
  case 'init':
    await init(parseFloat(args[0]) || 10000);
    break;
  case 'buy':
    await buy(args[0], args[1]);
    break;
  case 'sell':
    await sell(args[0], args[1]);
    break;
  case 'close':
    await close(args[0]);
    break;
  case 'status':
    await status();
    break;
  case 'history':
    await history();
    break;
  case 'context':
    await context();
    break;
  default:
    console.log(`
📈 PAPER TRADING CLI

Commands:
  init [capital]     Initialize portfolio (default: $10,000)
  buy SYMBOL AMOUNT  Buy crypto (e.g., buy BTC 1000)
  sell SYMBOL AMOUNT Sell crypto (e.g., sell BTC 500)
  close SYMBOL       Close entire position
  status             Show portfolio status
  history            Show trade history
  context            Show market context

Examples:
  node paper-trade.mjs init 5000
  node paper-trade.mjs buy BTC 1000
  node paper-trade.mjs status
`);
}
