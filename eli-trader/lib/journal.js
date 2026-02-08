// Trade Journal System
// Creates human-readable trade analysis and self-reflection

import fs from 'fs/promises';
import path from 'path';
import { getTradeHistory, getPerformanceStats, getPortfolio } from './paper-trader.js';
import { getMarketContext } from './market-context.js';

const JOURNAL_DIR = './journals';

/**
 * Write a trade journal entry
 * This is my reflection on trades - why I made them, what I learned
 */
export async function writeTradeJournal(trade, decision, outcome = null) {
  await ensureJournalDir();
  
  const date = new Date().toISOString().split('T')[0];
  const journalFile = path.join(JOURNAL_DIR, `${date}.md`);
  
  // Build the journal entry
  const entry = buildJournalEntry(trade, decision, outcome);
  
  // Append to today's journal
  try {
    const existing = await fs.readFile(journalFile, 'utf-8');
    await fs.writeFile(journalFile, existing + '\n' + entry);
  } catch {
    // New journal for the day
    const header = `# Trading Journal - ${date}\n\n`;
    await fs.writeFile(journalFile, header + entry);
  }
  
  return { file: journalFile, entry };
}

/**
 * Build a human-readable journal entry
 */
function buildJournalEntry(trade, decision, outcome) {
  const time = new Date().toLocaleTimeString();
  
  let entry = `## ${time} - ${trade.symbol} ${trade.direction}\n\n`;
  
  // The decision
  entry += `### Decision\n`;
  entry += `- **Action:** ${decision.recommendation}\n`;
  entry += `- **Confidence:** ${(decision.signalConfidence * 100).toFixed(0)}%\n`;
  entry += `- **Position Size:** $${decision.positionSize.toFixed(2)}\n`;
  entry += `- **Signal Source:** ${decision.signalSource}\n\n`;
  
  // Market context at decision time
  entry += `### Market Context\n`;
  entry += `- **Regime:** ${decision.marketContext.regime || 'unknown'}\n`;
  entry += `- **Fear/Greed:** ${decision.marketContext.fearGreed || 'unknown'}/100\n`;
  entry += `- **BTC 24h:** ${decision.marketContext.btcChange24h?.toFixed(2) || 'unknown'}%\n\n`;
  
  // My reasoning
  entry += `### Reasoning\n`;
  decision.reasons.forEach(r => {
    entry += `- ${r}\n`;
  });
  entry += '\n';
  
  // If we have outcome (for closed trades)
  if (outcome) {
    entry += `### Outcome\n`;
    entry += `- **P&L:** $${outcome.pnl.toFixed(2)} (${outcome.pnlPercent.toFixed(2)}%)\n`;
    entry += `- **Result:** ${outcome.pnl >= 0 ? '✅ WIN' : '❌ LOSS'}\n`;
    entry += `- **Hold Time:** ${outcome.holdTime}\n\n`;
    
    // Self-reflection
    entry += `### Reflection\n`;
    entry += generateReflection(trade, decision, outcome);
    entry += '\n';
  }
  
  entry += '---\n';
  return entry;
}

/**
 * Generate self-reflection on a trade
 */
function generateReflection(trade, decision, outcome) {
  const reflections = [];
  
  if (outcome.pnl >= 0) {
    // Winning trade analysis
    if (decision.analysis?.regime?.alignment === 'ALIGNED') {
      reflections.push('- Regime alignment helped - trading with the trend works');
    }
    if (decision.signalConfidence >= 0.8) {
      reflections.push('- High confidence signal paid off - trust strong signals');
    }
    if (decision.marketContext.fearGreed <= 25 && trade.direction === 'LONG') {
      reflections.push('- Bought during extreme fear - contrarian approach worked');
    }
  } else {
    // Losing trade analysis
    if (decision.analysis?.regime?.alignment === 'OPPOSING') {
      reflections.push('- ⚠️ Traded against regime - should have been more cautious');
    }
    if (decision.signalConfidence < 0.7) {
      reflections.push('- ⚠️ Lower confidence signal - consider raising min threshold');
    }
    if (Math.abs(outcome.pnlPercent) > 10) {
      reflections.push('- ⚠️ Large loss - review stop-loss levels');
    }
  }
  
  if (reflections.length === 0) {
    reflections.push('- Trade executed as planned, awaiting more data for pattern analysis');
  }
  
  return reflections.join('\n');
}

/**
 * Write daily summary
 */
export async function writeDailySummary() {
  await ensureJournalDir();
  
  const date = new Date().toISOString().split('T')[0];
  const stats = await getPerformanceStats();
  const portfolio = await getPortfolio();
  const context = await getMarketContext();
  const trades = await getTradeHistory(100);
  
  // Get today's trades
  const todaysTrades = trades.filter(t => t.timestamp.startsWith(date));
  
  const summary = buildDailySummary(date, stats, portfolio, context, todaysTrades);
  
  const summaryFile = path.join(JOURNAL_DIR, `${date}-summary.md`);
  await fs.writeFile(summaryFile, summary);
  
  return { file: summaryFile, stats };
}

/**
 * Build daily summary report
 */
function buildDailySummary(date, stats, portfolio, context, todaysTrades) {
  let summary = `# Daily Trading Summary - ${date}\n\n`;
  
  // Portfolio Status
  summary += `## Portfolio Status\n`;
  summary += `- **Starting Capital:** $${stats.portfolio.startingCapital.toLocaleString()}\n`;
  summary += `- **Current Value:** $${stats.portfolio.currentValue.toLocaleString()}\n`;
  summary += `- **Total P&L:** $${stats.performance.totalPnL.toFixed(2)} (${stats.performance.totalPnLPercent.toFixed(2)}%)\n`;
  summary += `- **Cash Available:** $${stats.portfolio.cash.toLocaleString()}\n`;
  summary += `- **Open Positions:** ${stats.portfolio.positionsCount}\n\n`;
  
  // Open Positions Detail
  if (Object.keys(portfolio.positions).length > 0) {
    summary += `### Open Positions\n`;
    for (const [symbol, pos] of Object.entries(portfolio.positions)) {
      summary += `- **${symbol}:** ${pos.quantity.toFixed(6)} @ $${pos.avgPrice.toFixed(2)} (Cost: $${pos.costBasis.toFixed(2)})\n`;
    }
    summary += '\n';
  }
  
  // Today's Activity
  summary += `## Today's Activity\n`;
  summary += `- **Trades Executed:** ${todaysTrades.length}\n`;
  
  if (todaysTrades.length > 0) {
    const todaysPnL = todaysTrades
      .filter(t => t.pnl !== undefined)
      .reduce((sum, t) => sum + t.pnl, 0);
    const wins = todaysTrades.filter(t => t.pnl > 0).length;
    const losses = todaysTrades.filter(t => t.pnl < 0).length;
    
    summary += `- **Realized P&L:** $${todaysPnL.toFixed(2)}\n`;
    summary += `- **Win/Loss:** ${wins}W / ${losses}L\n\n`;
    
    summary += `### Trade Log\n`;
    todaysTrades.forEach(t => {
      const pnlStr = t.pnl !== undefined ? ` → $${t.pnl.toFixed(2)}` : '';
      summary += `- ${t.timestamp.split('T')[1].split('.')[0]} | ${t.symbol} ${t.direction} $${t.size}${pnlStr}\n`;
    });
    summary += '\n';
  } else {
    summary += `- No trades today\n\n`;
  }
  
  // Market Context
  summary += `## Market Context (EOD)\n`;
  summary += `- **Regime:** ${context?.regime || 'unknown'}\n`;
  summary += `- **Fear/Greed:** ${context?.components?.fearGreed?.value || 'unknown'}/100\n`;
  summary += `- **BTC Price:** $${context?.components?.prices?.btc?.price?.toLocaleString() || 'unknown'}\n`;
  summary += `- **ETH Price:** $${context?.components?.prices?.eth?.price?.toLocaleString() || 'unknown'}\n\n`;
  
  // Performance Metrics
  summary += `## Overall Performance\n`;
  summary += `- **Total Trades:** ${stats.performance.totalTrades}\n`;
  summary += `- **Win Rate:** ${stats.performance.winRate.toFixed(1)}%\n`;
  summary += `- **Avg Win:** $${stats.performance.avgWin.toFixed(2)}\n`;
  summary += `- **Avg Loss:** $${stats.performance.avgLoss.toFixed(2)}\n`;
  summary += `- **Profit Factor:** ${stats.performance.profitFactor.toFixed(2)}\n`;
  summary += `- **Largest Win:** $${stats.performance.largestWin.toFixed(2)}\n`;
  summary += `- **Largest Loss:** $${stats.performance.largestLoss.toFixed(2)}\n\n`;
  
  // Self-Assessment
  summary += `## Self-Assessment\n`;
  summary += generateSelfAssessment(stats, todaysTrades);
  
  return summary;
}

/**
 * Generate self-assessment for the day
 */
function generateSelfAssessment(stats, todaysTrades) {
  const assessments = [];
  
  // Portfolio health
  const pnlPct = stats.performance.totalPnLPercent;
  if (pnlPct > 5) {
    assessments.push('- 📈 **Portfolio performing well** - up over 5%, maintain discipline');
  } else if (pnlPct < -5) {
    assessments.push('- 📉 **Portfolio underwater** - consider reducing position sizes until strategy stabilizes');
  } else {
    assessments.push('- 📊 **Portfolio stable** - within normal variance, continue testing');
  }
  
  // Win rate
  if (stats.performance.winRate >= 60) {
    assessments.push('- ✅ **Win rate strong** at ' + stats.performance.winRate.toFixed(0) + '% - signal selection working');
  } else if (stats.performance.winRate < 40 && stats.performance.closedTrades >= 5) {
    assessments.push('- ⚠️ **Win rate low** at ' + stats.performance.winRate.toFixed(0) + '% - review signal filtering criteria');
  }
  
  // Profit factor
  if (stats.performance.profitFactor >= 1.5) {
    assessments.push('- 💰 **Profit factor healthy** at ' + stats.performance.profitFactor.toFixed(2) + ' - winners bigger than losers');
  } else if (stats.performance.profitFactor < 1 && stats.performance.closedTrades >= 5) {
    assessments.push('- ⚠️ **Profit factor below 1** - losses exceeding gains, tighten stops or improve entries');
  }
  
  // Activity level
  if (todaysTrades.length === 0) {
    assessments.push('- 🔍 **No trades today** - either no signals met criteria (good discipline) or system wasn\'t running');
  } else if (todaysTrades.length > 10) {
    assessments.push('- ⚠️ **High trade count** - possible overtrading, consider raising confidence threshold');
  }
  
  if (assessments.length === 0) {
    assessments.push('- Insufficient data for meaningful assessment. Continue paper trading.');
  }
  
  return assessments.join('\n');
}

/**
 * Ensure journal directory exists
 */
async function ensureJournalDir() {
  try {
    await fs.mkdir(JOURNAL_DIR, { recursive: true });
  } catch {
    // exists
  }
}

export default {
  writeTradeJournal,
  writeDailySummary
};
