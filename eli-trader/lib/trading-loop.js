// Automated Trading Loop
// The heart of Eli Trader - runs periodically, makes decisions, executes trades

import { analyzeTradeSignal, logDecision } from './decision-engine.js';
import { getPortfolio, executeTrade, getPerformanceStats } from './paper-trader.js';
import { getMarketContext } from './market-context.js';
import { writeTradeJournal, writeDailySummary } from './journal.js';
import { getConfig, analyzePerformance } from './learner.js';
import fs from 'fs/promises';

const STATE_FILE = './data/loop-state.json';

/**
 * Get signals from various sources
 * For now: demo signals. Later: Vanta API, other sources
 */
async function getSignals() {
  const signals = [];
  
  // Check for Vanta API key
  const vantaKey = process.env.VANTA_API_KEY;
  
  if (vantaKey) {
    // TODO: Fetch real Vanta signals
    // const vantaSignals = await fetchVantaSignals(vantaKey);
    // signals.push(...vantaSignals);
    console.log('📡 Vanta API configured (signals would be fetched here)');
  }
  
  // Demo mode: Generate synthetic signals for testing
  // Remove this once real signals are available
  if (process.env.DEMO_MODE === 'true' || !vantaKey) {
    const demoSignals = await generateDemoSignals();
    signals.push(...demoSignals);
  }
  
  return signals;
}

/**
 * Generate demo signals for testing
 * These simulate what real signals might look like
 */
async function generateDemoSignals() {
  const context = await getMarketContext();
  const signals = [];
  
  // Only generate signals occasionally (30% chance)
  if (Math.random() > 0.3) {
    return signals;
  }
  
  const symbols = ['BTC', 'ETH', 'SOL'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  
  // Bias direction based on regime
  let direction;
  const regime = context?.regime || 'neutral';
  
  if (regime.includes('on')) {
    // Risk-on: 70% long, 20% short, 10% flat
    const roll = Math.random();
    direction = roll < 0.7 ? 'LONG' : roll < 0.9 ? 'SHORT' : 'FLAT';
  } else if (regime.includes('off')) {
    // Risk-off: 70% short, 20% long, 10% flat
    const roll = Math.random();
    direction = roll < 0.7 ? 'SHORT' : roll < 0.9 ? 'LONG' : 'FLAT';
  } else {
    // Neutral: equal distribution
    const roll = Math.random();
    direction = roll < 0.4 ? 'LONG' : roll < 0.8 ? 'SHORT' : 'FLAT';
  }
  
  // Confidence between 40-90%
  const confidence = 0.4 + (Math.random() * 0.5);
  
  signals.push({
    symbol,
    direction,
    confidence: Math.round(confidence * 100) / 100,
    source: 'demo',
    timestamp: new Date().toISOString()
  });
  
  return signals;
}

/**
 * Run one iteration of the trading loop
 */
export async function runIteration(options = {}) {
  const {
    dryRun = false,
    verbose = true
  } = options;
  
  const iteration = {
    timestamp: new Date().toISOString(),
    signals: [],
    decisions: [],
    trades: [],
    errors: []
  };
  
  try {
    if (verbose) console.log('\n🔄 Starting trading loop iteration...');
    
    // 1. Get current portfolio state
    const portfolio = await getPortfolio();
    if (verbose) {
      console.log(`💼 Portfolio: $${portfolio.totalValue?.toFixed(2) || portfolio.startingCapital} | Cash: $${portfolio.cash.toFixed(2)}`);
    }
    
    // 2. Get current market context
    const context = await getMarketContext();
    if (verbose && context) {
      console.log(`📊 Market: ${context.regime} | Fear/Greed: ${context.components?.fearGreed?.value || 'N/A'}`);
    }
    
    // 3. Get strategy configuration
    const config = await getConfig();
    
    // 4. Get signals from all sources
    const signals = await getSignals();
    iteration.signals = signals;
    
    if (signals.length === 0) {
      if (verbose) console.log('📭 No signals this iteration');
      await saveIterationState(iteration);
      return iteration;
    }
    
    if (verbose) console.log(`📡 Received ${signals.length} signal(s)`);
    
    // 5. Analyze each signal through decision engine
    for (const signal of signals) {
      try {
        if (verbose) {
          console.log(`\n🔍 Analyzing: ${signal.symbol} ${signal.direction} (${(signal.confidence * 100).toFixed(0)}% conf)`);
        }
        
        const decision = await analyzeTradeSignal(signal, portfolio);
        iteration.decisions.push(decision);
        
        if (verbose) logDecision(decision);
        
        // 6. Execute trade if recommended
        if (decision.recommendation !== 'SKIP' && decision.positionSize > 0) {
          if (dryRun) {
            if (verbose) console.log('🔸 DRY RUN - would execute trade');
          } else {
            const tradeResult = await executeTrade({
              symbol: signal.symbol,
              direction: decision.recommendation,
              size: decision.positionSize,
              reason: decision.reasons.join('; '),
              signal: signal.source
            });
            
            iteration.trades.push(tradeResult);
            
            if (tradeResult.success) {
              if (verbose) {
                console.log(`✅ Trade executed: ${signal.symbol} ${decision.recommendation} $${decision.positionSize.toFixed(2)}`);
              }
              
              // Write to journal
              await writeTradeJournal(tradeResult.trade, decision);
            } else {
              if (verbose) console.log(`❌ Trade failed: ${tradeResult.error}`);
              iteration.errors.push(tradeResult.error);
            }
          }
        }
      } catch (err) {
        console.error(`Error processing signal: ${err.message}`);
        iteration.errors.push(`Signal processing error: ${err.message}`);
      }
    }
    
    // Save iteration state
    await saveIterationState(iteration);
    
    if (verbose) {
      console.log(`\n✨ Iteration complete: ${iteration.trades.length} trades executed`);
    }
    
  } catch (err) {
    console.error('Trading loop error:', err.message);
    iteration.errors.push(err.message);
  }
  
  return iteration;
}

/**
 * Check and manage existing positions
 * Called periodically to evaluate stop-loss, take-profit, etc.
 */
export async function managePositions(options = {}) {
  const { verbose = true, dryRun = false } = options;
  
  const portfolio = await getPortfolio();
  const context = await getMarketContext();
  const config = await getConfig();
  
  const actions = [];
  
  for (const [symbol, position] of Object.entries(portfolio.positions)) {
    // Get current price
    const priceData = context?.components?.prices?.[symbol.toLowerCase()];
    const currentPrice = priceData?.price;
    
    if (!currentPrice) continue;
    
    const entryPrice = position.avgPrice;
    const pnlPct = ((currentPrice - entryPrice) / entryPrice) * 100;
    
    if (verbose) {
      console.log(`📍 ${symbol}: Entry $${entryPrice.toFixed(2)} → Now $${currentPrice.toFixed(2)} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)`);
    }
    
    // Check stop loss
    if (position.direction === 'LONG' && pnlPct <= -(config.stopLossPct * 100)) {
      actions.push({
        symbol,
        action: 'STOP_LOSS',
        reason: `Hit stop loss at ${pnlPct.toFixed(2)}%`
      });
    }
    
    // Check take profit
    if (position.direction === 'LONG' && pnlPct >= (config.takeProfitPct * 100)) {
      actions.push({
        symbol,
        action: 'TAKE_PROFIT',
        reason: `Hit take profit at ${pnlPct.toFixed(2)}%`
      });
    }
    
    // Check for regime change that opposes position
    if (position.direction === 'LONG' && context?.regime === 'risk_off') {
      actions.push({
        symbol,
        action: 'REGIME_EXIT',
        reason: 'Regime shifted to risk-off while holding long'
      });
    }
  }
  
  // Execute position management actions
  for (const action of actions) {
    if (verbose) {
      console.log(`\n⚡ ${action.action}: ${action.symbol} - ${action.reason}`);
    }
    
    if (!dryRun) {
      const result = await executeTrade({
        symbol: action.symbol,
        direction: 'CLOSE',
        reason: action.reason,
        signal: 'position_management'
      });
      
      if (result.success && result.trade) {
        // Journal the close
        await writeTradeJournal(result.trade, { 
          recommendation: 'CLOSE',
          reasons: [action.reason],
          marketContext: context
        }, {
          pnl: result.trade.pnl,
          pnlPercent: result.trade.pnlPercent,
          holdTime: 'calculated'
        });
      }
    }
  }
  
  return actions;
}

/**
 * Run daily maintenance tasks
 * - Write daily summary
 * - Analyze performance
 * - Consider strategy adjustments
 */
export async function runDailyMaintenance(options = {}) {
  const { verbose = true } = options;
  
  if (verbose) console.log('\n📋 Running daily maintenance...');
  
  // Write daily summary
  const summary = await writeDailySummary();
  if (verbose) console.log(`📝 Daily summary written: ${summary.file}`);
  
  // Analyze performance
  const analysis = await analyzePerformance(7);
  if (verbose) {
    console.log(`📊 Performance analysis complete:`);
    analysis.insights.forEach(i => console.log(`   - ${i}`));
    
    if (analysis.suggestions.length > 0) {
      console.log(`\n💡 Suggestions for improvement:`);
      analysis.suggestions.forEach(s => {
        console.log(`   - ${s.type}: ${s.reason}`);
      });
    }
  }
  
  return { summary, analysis };
}

/**
 * Save iteration state for debugging/auditing
 */
async function saveIterationState(iteration) {
  const state = {
    lastIteration: iteration,
    updatedAt: new Date().toISOString()
  };
  
  try {
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('Failed to save iteration state:', err.message);
  }
}

/**
 * Get loop state
 */
export async function getLoopState() {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export default {
  runIteration,
  managePositions,
  runDailyMaintenance,
  getLoopState
};
