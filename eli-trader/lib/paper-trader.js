// Paper Trading Engine
// Simulates trades without real money to validate strategy

import { getMarketContext } from './market-context.js';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = './data';
const TRADES_FILE = path.join(DATA_DIR, 'paper-trades.json');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'paper-portfolio.json');

/**
 * Initialize paper trading portfolio
 */
export async function initPortfolio(startingCapital = 10000) {
  await ensureDataDir();
  
  const portfolio = {
    startingCapital,
    cash: startingCapital,
    positions: {},
    totalValue: startingCapital,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await savePortfolio(portfolio);
  return portfolio;
}

/**
 * Get current portfolio state
 */
export async function getPortfolio() {
  try {
    const data = await fs.readFile(PORTFOLIO_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return await initPortfolio();
  }
}

/**
 * Save portfolio state
 */
async function savePortfolio(portfolio) {
  await ensureDataDir();
  portfolio.updatedAt = new Date().toISOString();
  await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(portfolio, null, 2));
}

/**
 * Execute a paper trade
 */
export async function executeTrade(trade) {
  const portfolio = await getPortfolio();
  const marketContext = await getMarketContext();
  
  const {
    symbol,        // e.g., 'BTC', 'ETH', 'SOL'
    direction,     // 'LONG' or 'SHORT' or 'CLOSE'
    size,          // Position size in USD
    price,         // Current price (we'll fetch if not provided)
    reason,        // Why we're making this trade
    signal         // Signal source (e.g., 'vanta', 'manual', 'meta-strategy')
  } = trade;

  // Fetch current price if not provided
  const currentPrice = price || await getCurrentPrice(symbol);
  if (!currentPrice) {
    return { success: false, error: `Could not get price for ${symbol}` };
  }

  const tradeRecord = {
    id: generateTradeId(),
    timestamp: new Date().toISOString(),
    symbol,
    direction,
    size,
    price: currentPrice,
    reason,
    signal,
    marketContext: {
      regime: marketContext?.regime,
      fearGreed: marketContext?.components?.fearGreed?.value,
      btcChange24h: marketContext?.components?.prices?.btc?.change24h
    }
  };

  // Handle trade execution
  if (direction === 'CLOSE') {
    // Close existing position
    if (!portfolio.positions[symbol]) {
      return { success: false, error: `No position in ${symbol} to close` };
    }
    
    const position = portfolio.positions[symbol];
    const pnl = calculatePnL(position, currentPrice);
    
    tradeRecord.pnl = pnl;
    tradeRecord.pnlPercent = (pnl / position.costBasis) * 100;
    tradeRecord.closedPosition = { ...position };
    
    portfolio.cash += position.costBasis + pnl;
    delete portfolio.positions[symbol];
    
  } else if (direction === 'LONG') {
    // Open or add to long position
    if (size > portfolio.cash) {
      return { success: false, error: `Insufficient cash. Have $${portfolio.cash.toFixed(2)}, need $${size}` };
    }
    
    const quantity = size / currentPrice;
    
    if (portfolio.positions[symbol]) {
      // Add to existing position
      const existing = portfolio.positions[symbol];
      const newQuantity = existing.quantity + quantity;
      const newCostBasis = existing.costBasis + size;
      portfolio.positions[symbol] = {
        ...existing,
        quantity: newQuantity,
        costBasis: newCostBasis,
        avgPrice: newCostBasis / newQuantity,
        updatedAt: new Date().toISOString()
      };
    } else {
      // New position
      portfolio.positions[symbol] = {
        symbol,
        direction: 'LONG',
        quantity,
        costBasis: size,
        avgPrice: currentPrice,
        openedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    portfolio.cash -= size;
    tradeRecord.newPosition = { ...portfolio.positions[symbol] };
    
  } else if (direction === 'SHORT') {
    // For paper trading, we'll simulate shorts as negative positions
    // In reality, this would require margin
    const quantity = size / currentPrice;
    
    if (portfolio.positions[symbol]) {
      // Reduce long or increase short
      const existing = portfolio.positions[symbol];
      if (existing.direction === 'LONG') {
        // Reducing long position
        const reduceQty = Math.min(quantity, existing.quantity);
        const pnl = (currentPrice - existing.avgPrice) * reduceQty;
        
        tradeRecord.pnl = pnl;
        tradeRecord.pnlPercent = (pnl / (reduceQty * existing.avgPrice)) * 100;
        
        existing.quantity -= reduceQty;
        existing.costBasis = existing.quantity * existing.avgPrice;
        portfolio.cash += (reduceQty * currentPrice);
        
        if (existing.quantity <= 0) {
          delete portfolio.positions[symbol];
        }
      }
    } else {
      // Open short position (simplified)
      portfolio.positions[symbol] = {
        symbol,
        direction: 'SHORT',
        quantity,
        costBasis: size,
        avgPrice: currentPrice,
        openedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  // Update portfolio total value
  portfolio.totalValue = await calculatePortfolioValue(portfolio);
  
  // Save trade and portfolio
  await logTrade(tradeRecord);
  await savePortfolio(portfolio);
  
  return {
    success: true,
    trade: tradeRecord,
    portfolio: {
      cash: portfolio.cash,
      positions: Object.keys(portfolio.positions).length,
      totalValue: portfolio.totalValue,
      pnlTotal: portfolio.totalValue - portfolio.startingCapital,
      pnlPercent: ((portfolio.totalValue - portfolio.startingCapital) / portfolio.startingCapital) * 100
    }
  };
}

/**
 * Calculate PnL for a position
 */
function calculatePnL(position, currentPrice) {
  if (position.direction === 'LONG') {
    return (currentPrice - position.avgPrice) * position.quantity;
  } else {
    return (position.avgPrice - currentPrice) * position.quantity;
  }
}

/**
 * Calculate total portfolio value
 */
async function calculatePortfolioValue(portfolio) {
  let totalValue = portfolio.cash;
  
  for (const [symbol, position] of Object.entries(portfolio.positions)) {
    const currentPrice = await getCurrentPrice(symbol);
    if (currentPrice) {
      if (position.direction === 'LONG') {
        totalValue += position.quantity * currentPrice;
      } else {
        // Short: profit when price goes down
        const pnl = (position.avgPrice - currentPrice) * position.quantity;
        totalValue += position.costBasis + pnl;
      }
    }
  }
  
  return totalValue;
}

/**
 * Get current price for a symbol
 * Uses market context (which has caching) as primary source
 */
async function getCurrentPrice(symbol) {
  const symbolKey = symbol.toLowerCase();
  
  // Try to get from market context (has caching)
  try {
    const context = await getMarketContext();
    const price = context?.components?.prices?.[symbolKey]?.price;
    if (price) return price;
  } catch {
    // Fall through to direct fetch
  }
  
  // Direct fetch as fallback
  const symbolMap = {
    'btc': 'bitcoin',
    'eth': 'ethereum',
    'sol': 'solana'
  };
  
  const coinId = symbolMap[symbolKey];
  if (!coinId) return null;
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );
    const data = await response.json();
    if (data.status?.error_code) return null;
    return data[coinId]?.usd || null;
  } catch {
    return null;
  }
}

/**
 * Log trade to history
 */
async function logTrade(trade) {
  await ensureDataDir();
  
  let trades = [];
  try {
    const data = await fs.readFile(TRADES_FILE, 'utf-8');
    trades = JSON.parse(data);
  } catch {
    trades = [];
  }
  
  trades.push(trade);
  await fs.writeFile(TRADES_FILE, JSON.stringify(trades, null, 2));
}

/**
 * Get trade history
 */
export async function getTradeHistory(limit = 50) {
  try {
    const data = await fs.readFile(TRADES_FILE, 'utf-8');
    const trades = JSON.parse(data);
    return trades.slice(-limit);
  } catch {
    return [];
  }
}

/**
 * Get performance stats
 */
export async function getPerformanceStats() {
  const portfolio = await getPortfolio();
  const trades = await getTradeHistory(1000);
  
  const closedTrades = trades.filter(t => t.pnl !== undefined);
  const winningTrades = closedTrades.filter(t => t.pnl > 0);
  const losingTrades = closedTrades.filter(t => t.pnl < 0);
  
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length 
    : 0;
  const avgLoss = losingTrades.length > 0 
    ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length 
    : 0;
  
  return {
    portfolio: {
      startingCapital: portfolio.startingCapital,
      currentValue: portfolio.totalValue,
      cash: portfolio.cash,
      positionsCount: Object.keys(portfolio.positions).length,
      positions: portfolio.positions
    },
    performance: {
      totalPnL,
      totalPnLPercent: ((portfolio.totalValue - portfolio.startingCapital) / portfolio.startingCapital) * 100,
      totalTrades: trades.length,
      closedTrades: closedTrades.length,
      winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      avgWin,
      avgLoss,
      profitFactor: avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0,
      largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0,
      largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0
    },
    recentTrades: trades.slice(-10)
  };
}

/**
 * Generate unique trade ID
 */
function generateTradeId() {
  return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory exists
  }
}

export default {
  initPortfolio,
  getPortfolio,
  executeTrade,
  getTradeHistory,
  getPerformanceStats
};
