// Backtesting Module
// Test strategies against historical data

import fs from 'fs/promises';

const HISTORY_FILE = './data/price-history.json';

/**
 * Simple backtester
 * Tests a strategy against historical price data
 */
export async function runBacktest(options = {}) {
  const {
    startCapital = 10000,
    strategy = defaultStrategy,
    symbol = 'BTC',
    startDate = null,
    endDate = null
  } = options;
  
  // Load price history
  const history = await loadPriceHistory(symbol);
  if (!history || history.length === 0) {
    return { error: 'No price history available. Run collectHistory first.' };
  }
  
  // Filter by date range
  let data = history;
  if (startDate) {
    data = data.filter(d => new Date(d.timestamp) >= new Date(startDate));
  }
  if (endDate) {
    data = data.filter(d => new Date(d.timestamp) <= new Date(endDate));
  }
  
  if (data.length < 10) {
    return { error: 'Insufficient data points for backtest' };
  }
  
  // Run backtest
  const results = {
    startCapital,
    symbol,
    dataPoints: data.length,
    startDate: data[0].timestamp,
    endDate: data[data.length - 1].timestamp,
    trades: [],
    equity: [{ timestamp: data[0].timestamp, value: startCapital }]
  };
  
  let cash = startCapital;
  let position = null;
  
  for (let i = 10; i < data.length; i++) {
    const candle = data[i];
    const lookback = data.slice(i - 10, i);
    
    // Generate signal from strategy
    const signal = strategy(lookback, candle, position);
    
    // Execute signal
    if (signal === 'BUY' && !position) {
      const size = cash * 0.5; // 50% of capital
      const qty = size / candle.price;
      position = {
        type: 'LONG',
        entry: candle.price,
        qty,
        size,
        entryTime: candle.timestamp
      };
      cash -= size;
      
      results.trades.push({
        action: 'BUY',
        price: candle.price,
        size,
        timestamp: candle.timestamp
      });
    } else if (signal === 'SELL' && position) {
      const exitValue = position.qty * candle.price;
      const pnl = exitValue - position.size;
      cash += exitValue;
      
      results.trades.push({
        action: 'SELL',
        price: candle.price,
        size: exitValue,
        pnl,
        pnlPct: (pnl / position.size) * 100,
        timestamp: candle.timestamp,
        holdTime: (new Date(candle.timestamp) - new Date(position.entryTime)) / (1000 * 60 * 60)
      });
      
      position = null;
    }
    
    // Track equity
    const equity = cash + (position ? position.qty * candle.price : 0);
    results.equity.push({ timestamp: candle.timestamp, value: equity });
  }
  
  // Close any remaining position at last price
  if (position) {
    const lastPrice = data[data.length - 1].price;
    const exitValue = position.qty * lastPrice;
    cash += exitValue;
    results.trades.push({
      action: 'SELL',
      price: lastPrice,
      size: exitValue,
      pnl: exitValue - position.size,
      timestamp: data[data.length - 1].timestamp,
      note: 'End of backtest'
    });
  }
  
  // Calculate metrics
  const closedTrades = results.trades.filter(t => t.pnl !== undefined);
  const wins = closedTrades.filter(t => t.pnl > 0);
  const losses = closedTrades.filter(t => t.pnl < 0);
  
  results.finalCapital = cash;
  results.totalReturn = ((cash - startCapital) / startCapital) * 100;
  results.metrics = {
    totalTrades: closedTrades.length,
    winRate: closedTrades.length ? (wins.length / closedTrades.length) * 100 : 0,
    avgWin: wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0,
    avgLoss: losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0,
    maxDrawdown: calculateMaxDrawdown(results.equity),
    sharpeRatio: calculateSharpeRatio(results.equity)
  };
  
  results.metrics.profitFactor = results.metrics.avgLoss !== 0 
    ? Math.abs(results.metrics.avgWin / results.metrics.avgLoss) 
    : 0;
  
  return results;
}

/**
 * Default strategy: Simple moving average crossover
 */
function defaultStrategy(lookback, current, position) {
  // Calculate 5-period and 10-period SMAs
  const prices = lookback.map(d => d.price);
  const sma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const sma10 = prices.reduce((a, b) => a + b, 0) / 10;
  
  // Buy when short MA crosses above long MA
  if (sma5 > sma10 && !position) {
    return 'BUY';
  }
  
  // Sell when short MA crosses below long MA
  if (sma5 < sma10 && position) {
    return 'SELL';
  }
  
  return 'HOLD';
}

/**
 * Calculate max drawdown
 */
function calculateMaxDrawdown(equity) {
  let maxDrawdown = 0;
  let peak = equity[0].value;
  
  for (const point of equity) {
    if (point.value > peak) {
      peak = point.value;
    }
    const drawdown = (peak - point.value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown * 100;
}

/**
 * Calculate Sharpe ratio (simplified)
 */
function calculateSharpeRatio(equity) {
  if (equity.length < 2) return 0;
  
  // Calculate daily returns
  const returns = [];
  for (let i = 1; i < equity.length; i++) {
    const ret = (equity[i].value - equity[i-1].value) / equity[i-1].value;
    returns.push(ret);
  }
  
  // Calculate mean and std dev
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return 0;
  
  // Annualize (assuming daily data, 365 days)
  return (mean / stdDev) * Math.sqrt(365);
}

/**
 * Collect price history from CoinGecko
 */
export async function collectHistory(symbol = 'bitcoin', days = 30) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${days}`
    );
    const data = await response.json();
    
    if (data.status?.error_code) {
      return { error: 'API rate limited' };
    }
    
    const history = data.prices.map(([timestamp, price]) => ({
      timestamp: new Date(timestamp).toISOString(),
      price
    }));
    
    // Save to file
    await fs.writeFile(HISTORY_FILE, JSON.stringify({ 
      symbol, 
      collected: new Date().toISOString(),
      data: history 
    }, null, 2));
    
    return { success: true, points: history.length };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Load price history
 */
async function loadPriceHistory(symbol) {
  try {
    const file = await fs.readFile(HISTORY_FILE, 'utf-8');
    const parsed = JSON.parse(file);
    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Format backtest results for display
 */
export function formatBacktestResults(results) {
  if (results.error) {
    return `❌ Backtest Error: ${results.error}`;
  }
  
  let output = '# Backtest Results\n\n';
  output += `**Symbol:** ${results.symbol}\n`;
  output += `**Period:** ${results.startDate.split('T')[0]} to ${results.endDate.split('T')[0]}\n`;
  output += `**Data Points:** ${results.dataPoints}\n\n`;
  
  output += '## Performance\n\n';
  output += `- **Starting Capital:** $${results.startCapital.toLocaleString()}\n`;
  output += `- **Final Capital:** $${results.finalCapital.toLocaleString()}\n`;
  output += `- **Total Return:** ${results.totalReturn.toFixed(2)}%\n\n`;
  
  output += '## Metrics\n\n';
  output += `- **Total Trades:** ${results.metrics.totalTrades}\n`;
  output += `- **Win Rate:** ${results.metrics.winRate.toFixed(1)}%\n`;
  output += `- **Profit Factor:** ${results.metrics.profitFactor.toFixed(2)}\n`;
  output += `- **Max Drawdown:** ${results.metrics.maxDrawdown.toFixed(2)}%\n`;
  output += `- **Sharpe Ratio:** ${results.metrics.sharpeRatio.toFixed(2)}\n\n`;
  
  if (results.metrics.avgWin !== 0) {
    output += `- **Avg Win:** $${results.metrics.avgWin.toFixed(2)}\n`;
    output += `- **Avg Loss:** $${results.metrics.avgLoss.toFixed(2)}\n`;
  }
  
  return output;
}

export default {
  runBacktest,
  collectHistory,
  formatBacktestResults
};
