#!/usr/bin/env node
/**
 * Automated Trading Script
 * Run this periodically via cron or heartbeat
 * 
 * Usage:
 *   node scripts/auto-trade.mjs                    # Single iteration
 *   node scripts/auto-trade.mjs --dry-run          # Test without executing
 *   node scripts/auto-trade.mjs --manage           # Check positions only
 *   node scripts/auto-trade.mjs --daily            # Run daily maintenance
 *   node scripts/auto-trade.mjs --full             # Full cycle: trade + manage + daily
 *   node scripts/auto-trade.mjs --status           # Show current status
 */

import { runIteration, managePositions, runDailyMaintenance, getLoopState } from '../lib/trading-loop.js';
import { getPortfolio, getPerformanceStats } from '../lib/paper-trader.js';
import { getMarketContext } from '../lib/market-context.js';
import { getConfig, generateLearningSummary } from '../lib/learner.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || '--iteration';
  
  console.log('═══════════════════════════════════════════════');
  console.log('         🤖 ELI TRADER - Automated Trading');
  console.log('═══════════════════════════════════════════════');
  console.log(`Time: ${new Date().toISOString()}`);
  
  try {
    switch (command) {
      case '--iteration':
      case '-i':
        await runIteration({ verbose: true });
        break;
        
      case '--dry-run':
      case '-d':
        await runIteration({ verbose: true, dryRun: true });
        break;
        
      case '--manage':
      case '-m':
        await managePositions({ verbose: true });
        break;
        
      case '--daily':
        await runDailyMaintenance({ verbose: true });
        break;
        
      case '--full':
      case '-f':
        console.log('\n📡 Phase 1: Check for signals and trade');
        await runIteration({ verbose: true });
        console.log('\n📍 Phase 2: Manage existing positions');
        await managePositions({ verbose: true });
        console.log('\n📋 Phase 3: Daily maintenance');
        await runDailyMaintenance({ verbose: true });
        break;
        
      case '--status':
      case '-s':
        await showStatus();
        break;
        
      case '--summary':
        const summary = await generateLearningSummary();
        console.log('\n' + summary);
        break;
        
      case '--help':
      case '-h':
        showHelp();
        break;
        
      default:
        console.log(`Unknown command: ${command}`);
        showHelp();
    }
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
  
  console.log('\n═══════════════════════════════════════════════\n');
}

async function showStatus() {
  const portfolio = await getPortfolio();
  const stats = await getPerformanceStats();
  const context = await getMarketContext();
  const config = await getConfig();
  const state = await getLoopState();
  
  console.log('\n📊 PORTFOLIO STATUS');
  console.log('─'.repeat(40));
  console.log(`Starting Capital: $${portfolio.startingCapital.toLocaleString()}`);
  console.log(`Current Value:    $${(stats.portfolio.currentValue || portfolio.totalValue).toLocaleString()}`);
  console.log(`Cash Available:   $${portfolio.cash.toLocaleString()}`);
  console.log(`Total P&L:        $${stats.performance.totalPnL.toFixed(2)} (${stats.performance.totalPnLPercent.toFixed(2)}%)`);
  
  console.log('\n📈 POSITIONS');
  console.log('─'.repeat(40));
  if (Object.keys(portfolio.positions).length === 0) {
    console.log('No open positions');
  } else {
    for (const [symbol, pos] of Object.entries(portfolio.positions)) {
      const currentPrice = context?.components?.prices?.[symbol.toLowerCase()]?.price;
      const pnl = currentPrice ? ((currentPrice - pos.avgPrice) / pos.avgPrice * 100).toFixed(2) : 'N/A';
      console.log(`${symbol}: ${pos.quantity.toFixed(6)} @ $${pos.avgPrice.toFixed(2)} | Cost: $${pos.costBasis.toFixed(2)} | P&L: ${pnl}%`);
    }
  }
  
  console.log('\n📊 PERFORMANCE METRICS');
  console.log('─'.repeat(40));
  console.log(`Total Trades:  ${stats.performance.totalTrades}`);
  console.log(`Closed Trades: ${stats.performance.closedTrades}`);
  console.log(`Win Rate:      ${stats.performance.winRate.toFixed(1)}%`);
  console.log(`Avg Win:       $${stats.performance.avgWin.toFixed(2)}`);
  console.log(`Avg Loss:      $${stats.performance.avgLoss.toFixed(2)}`);
  console.log(`Profit Factor: ${stats.performance.profitFactor.toFixed(2)}`);
  
  console.log('\n🌍 MARKET CONTEXT');
  console.log('─'.repeat(40));
  console.log(`Regime:       ${context?.regime || 'unknown'}`);
  console.log(`Fear/Greed:   ${context?.components?.fearGreed?.value || 'N/A'}/100`);
  console.log(`BTC:          $${context?.components?.prices?.btc?.price?.toLocaleString() || 'N/A'}`);
  console.log(`ETH:          $${context?.components?.prices?.eth?.price?.toLocaleString() || 'N/A'}`);
  
  console.log('\n⚙️  STRATEGY CONFIG');
  console.log('─'.repeat(40));
  console.log(`Min Confidence: ${(config.minConfidence * 100).toFixed(0)}%`);
  console.log(`Base Position:  ${(config.basePositionPct * 100).toFixed(0)}%`);
  console.log(`Stop Loss:      ${(config.stopLossPct * 100).toFixed(1)}%`);
  console.log(`Take Profit:    ${(config.takeProfitPct * 100).toFixed(1)}%`);
  console.log(`Config Version: ${config.version}`);
  
  if (state?.lastIteration) {
    console.log('\n🔄 LAST ITERATION');
    console.log('─'.repeat(40));
    console.log(`Time:    ${state.lastIteration.timestamp}`);
    console.log(`Signals: ${state.lastIteration.signals?.length || 0}`);
    console.log(`Trades:  ${state.lastIteration.trades?.length || 0}`);
    console.log(`Errors:  ${state.lastIteration.errors?.length || 0}`);
  }
}

function showHelp() {
  console.log(`
Usage: node scripts/auto-trade.mjs [command]

Commands:
  --iteration, -i   Run one trading iteration (default)
  --dry-run, -d     Test iteration without executing trades
  --manage, -m      Check and manage existing positions
  --daily           Run daily maintenance (summary, analysis)
  --full, -f        Full cycle: trade + manage + daily
  --status, -s      Show current status
  --summary         Generate learning summary
  --help, -h        Show this help

Environment:
  DEMO_MODE=true    Use demo signals (default when no Vanta key)
  VANTA_API_KEY     Enable real Vanta signals

Examples:
  node scripts/auto-trade.mjs --status    # Quick status check
  node scripts/auto-trade.mjs --dry-run   # Test without trading
  node scripts/auto-trade.mjs --full      # Complete trading cycle
  `);
}

main().catch(console.error);
