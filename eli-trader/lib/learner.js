// Learning Module
// Analyzes trading performance and suggests/applies strategy adjustments

import fs from 'fs/promises';
import path from 'path';
import { getTradeHistory, getPerformanceStats } from './paper-trader.js';

const CONFIG_FILE = './data/strategy-config.json';
const LEARNING_LOG = './data/learning-log.json';

/**
 * Default strategy configuration
 * These are the parameters I can adjust based on performance
 */
const DEFAULT_CONFIG = {
  // Minimum confidence to take a trade (0-1)
  minConfidence: 0.6,
  
  // Base position size as % of portfolio
  basePositionPct: 0.10,
  
  // Maximum total exposure
  maxExposurePct: 0.50,
  
  // Stop loss percentage
  stopLossPct: 0.05,
  
  // Take profit percentage
  takeProfitPct: 0.15,
  
  // Regime alignment importance (multiplier adjustment)
  regimeWeight: 1.0,
  
  // Sentiment importance
  sentimentWeight: 1.0,
  
  // Cooldown after loss (minutes)
  lossCooldownMinutes: 60,
  
  // Version tracking
  version: 1,
  updatedAt: new Date().toISOString(),
  updatedReason: 'Initial configuration'
};

/**
 * Get current strategy configuration
 */
export async function getConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    await saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
}

/**
 * Save strategy configuration
 */
async function saveConfig(config) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * Analyze recent performance and suggest adjustments
 */
export async function analyzePerformance(lookbackDays = 7) {
  const trades = await getTradeHistory(1000);
  const stats = await getPerformanceStats();
  const config = await getConfig();
  
  const cutoff = Date.now() - (lookbackDays * 24 * 60 * 60 * 1000);
  const recentTrades = trades.filter(t => new Date(t.timestamp).getTime() > cutoff);
  
  const analysis = {
    timestamp: new Date().toISOString(),
    lookbackDays,
    tradeCount: recentTrades.length,
    suggestions: [],
    insights: []
  };
  
  if (recentTrades.length < 5) {
    analysis.insights.push('Insufficient trades for meaningful analysis (need 5+)');
    return analysis;
  }
  
  // Analyze closed trades
  const closedTrades = recentTrades.filter(t => t.pnl !== undefined);
  
  if (closedTrades.length >= 3) {
    // Win rate analysis
    const wins = closedTrades.filter(t => t.pnl > 0);
    const losses = closedTrades.filter(t => t.pnl < 0);
    const winRate = wins.length / closedTrades.length;
    
    analysis.metrics = {
      winRate: (winRate * 100).toFixed(1) + '%',
      avgWin: wins.length ? (wins.reduce((s, t) => s + t.pnl, 0) / wins.length).toFixed(2) : 0,
      avgLoss: losses.length ? (losses.reduce((s, t) => s + t.pnl, 0) / losses.length).toFixed(2) : 0,
      totalPnL: closedTrades.reduce((s, t) => s + t.pnl, 0).toFixed(2)
    };
    
    // Suggestion: Low win rate → raise confidence threshold
    if (winRate < 0.4) {
      analysis.suggestions.push({
        type: 'RAISE_MIN_CONFIDENCE',
        reason: `Win rate ${(winRate * 100).toFixed(0)}% below 40%`,
        current: config.minConfidence,
        suggested: Math.min(0.8, config.minConfidence + 0.05),
        impact: 'Fewer trades but higher quality signals'
      });
    }
    
    // Suggestion: High win rate → could lower threshold to capture more
    if (winRate > 0.7 && config.minConfidence > 0.5) {
      analysis.suggestions.push({
        type: 'LOWER_MIN_CONFIDENCE',
        reason: `Win rate ${(winRate * 100).toFixed(0)}% above 70%`,
        current: config.minConfidence,
        suggested: Math.max(0.5, config.minConfidence - 0.05),
        impact: 'More trades while maintaining edge'
      });
    }
    
    // Analyze losses
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    
    // Suggestion: Large losses → tighten stops
    if (avgLoss > avgWin * 1.5) {
      analysis.suggestions.push({
        type: 'TIGHTEN_STOP_LOSS',
        reason: `Avg loss ($${avgLoss.toFixed(2)}) > 1.5x avg win ($${avgWin.toFixed(2)})`,
        current: config.stopLossPct,
        suggested: Math.max(0.03, config.stopLossPct - 0.01),
        impact: 'Smaller individual losses'
      });
    }
    
    // Analyze by confidence level
    const highConfTrades = closedTrades.filter(t => t.signalConfidence >= 0.8);
    const lowConfTrades = closedTrades.filter(t => t.signalConfidence < 0.7);
    
    if (highConfTrades.length >= 2 && lowConfTrades.length >= 2) {
      const highConfWinRate = highConfTrades.filter(t => t.pnl > 0).length / highConfTrades.length;
      const lowConfWinRate = lowConfTrades.filter(t => t.pnl > 0).length / lowConfTrades.length;
      
      analysis.insights.push(
        `High confidence (≥80%) trades: ${(highConfWinRate * 100).toFixed(0)}% win rate`,
        `Lower confidence (<70%) trades: ${(lowConfWinRate * 100).toFixed(0)}% win rate`
      );
      
      if (highConfWinRate > lowConfWinRate + 0.2) {
        analysis.insights.push('⭐ High confidence signals significantly outperform - consider raising threshold');
      }
    }
    
    // Analyze by regime alignment
    const alignedTrades = closedTrades.filter(t => 
      t.marketContext?.regime?.includes('on') && t.direction === 'LONG' ||
      t.marketContext?.regime?.includes('off') && t.direction === 'SHORT'
    );
    const opposingTrades = closedTrades.filter(t =>
      t.marketContext?.regime?.includes('off') && t.direction === 'LONG' ||
      t.marketContext?.regime?.includes('on') && t.direction === 'SHORT'
    );
    
    if (alignedTrades.length >= 2 && opposingTrades.length >= 2) {
      const alignedWinRate = alignedTrades.filter(t => t.pnl > 0).length / alignedTrades.length;
      const opposingWinRate = opposingTrades.filter(t => t.pnl > 0).length / opposingTrades.length;
      
      analysis.insights.push(
        `Regime-aligned trades: ${(alignedWinRate * 100).toFixed(0)}% win rate`,
        `Regime-opposing trades: ${(opposingWinRate * 100).toFixed(0)}% win rate`
      );
      
      if (alignedWinRate > opposingWinRate + 0.25) {
        analysis.suggestions.push({
          type: 'INCREASE_REGIME_WEIGHT',
          reason: 'Regime-aligned trades significantly outperform',
          current: config.regimeWeight,
          suggested: config.regimeWeight + 0.25,
          impact: 'More weight on regime alignment in position sizing'
        });
      }
    }
  }
  
  // Log the analysis
  await logLearning(analysis);
  
  return analysis;
}

/**
 * Apply a suggested adjustment
 */
export async function applySuggestion(suggestionType, newValue, reason) {
  const config = await getConfig();
  
  const typeToField = {
    'RAISE_MIN_CONFIDENCE': 'minConfidence',
    'LOWER_MIN_CONFIDENCE': 'minConfidence',
    'TIGHTEN_STOP_LOSS': 'stopLossPct',
    'WIDEN_STOP_LOSS': 'stopLossPct',
    'INCREASE_REGIME_WEIGHT': 'regimeWeight',
    'DECREASE_REGIME_WEIGHT': 'regimeWeight',
    'INCREASE_POSITION_SIZE': 'basePositionPct',
    'DECREASE_POSITION_SIZE': 'basePositionPct'
  };
  
  const field = typeToField[suggestionType];
  if (!field) {
    return { success: false, error: `Unknown suggestion type: ${suggestionType}` };
  }
  
  const oldValue = config[field];
  config[field] = newValue;
  config.version = (config.version || 1) + 1;
  config.updatedAt = new Date().toISOString();
  config.updatedReason = reason;
  
  await saveConfig(config);
  
  // Log the change
  await logLearning({
    timestamp: new Date().toISOString(),
    type: 'CONFIG_CHANGE',
    field,
    oldValue,
    newValue,
    reason,
    configVersion: config.version
  });
  
  return {
    success: true,
    field,
    oldValue,
    newValue,
    configVersion: config.version
  };
}

/**
 * Get learning history
 */
export async function getLearningLog(limit = 50) {
  try {
    const data = await fs.readFile(LEARNING_LOG, 'utf-8');
    const log = JSON.parse(data);
    return log.slice(-limit);
  } catch {
    return [];
  }
}

/**
 * Log learning event
 */
async function logLearning(event) {
  let log = [];
  try {
    const data = await fs.readFile(LEARNING_LOG, 'utf-8');
    log = JSON.parse(data);
  } catch {
    log = [];
  }
  
  log.push(event);
  
  // Keep last 500 entries
  if (log.length > 500) {
    log = log.slice(-500);
  }
  
  await fs.writeFile(LEARNING_LOG, JSON.stringify(log, null, 2));
}

/**
 * Generate learning summary for human review
 */
export async function generateLearningSummary() {
  const config = await getConfig();
  const analysis = await analyzePerformance(7);
  const log = await getLearningLog(20);
  
  let summary = '# Eli Trader - Learning Summary\n\n';
  summary += `Generated: ${new Date().toISOString()}\n\n`;
  
  summary += '## Current Strategy Configuration\n\n';
  summary += '| Parameter | Value |\n|-----------|-------|\n';
  summary += `| Min Confidence | ${(config.minConfidence * 100).toFixed(0)}% |\n`;
  summary += `| Base Position | ${(config.basePositionPct * 100).toFixed(0)}% |\n`;
  summary += `| Max Exposure | ${(config.maxExposurePct * 100).toFixed(0)}% |\n`;
  summary += `| Stop Loss | ${(config.stopLossPct * 100).toFixed(1)}% |\n`;
  summary += `| Take Profit | ${(config.takeProfitPct * 100).toFixed(1)}% |\n`;
  summary += `| Config Version | ${config.version} |\n`;
  summary += `| Last Updated | ${config.updatedAt} |\n\n`;
  
  summary += '## Recent Performance Analysis\n\n';
  if (analysis.metrics) {
    summary += `- **Win Rate:** ${analysis.metrics.winRate}\n`;
    summary += `- **Avg Win:** $${analysis.metrics.avgWin}\n`;
    summary += `- **Avg Loss:** $${analysis.metrics.avgLoss}\n`;
    summary += `- **Total P&L:** $${analysis.metrics.totalPnL}\n\n`;
  }
  
  summary += '### Insights\n\n';
  analysis.insights.forEach(i => summary += `- ${i}\n`);
  summary += '\n';
  
  summary += '### Suggestions for Improvement\n\n';
  if (analysis.suggestions.length === 0) {
    summary += 'No suggestions at this time - continue gathering data.\n\n';
  } else {
    analysis.suggestions.forEach(s => {
      summary += `**${s.type}**\n`;
      summary += `- Reason: ${s.reason}\n`;
      summary += `- Current: ${s.current} → Suggested: ${s.suggested}\n`;
      summary += `- Impact: ${s.impact}\n\n`;
    });
  }
  
  summary += '## Recent Learning Events\n\n';
  const configChanges = log.filter(e => e.type === 'CONFIG_CHANGE');
  if (configChanges.length > 0) {
    configChanges.slice(-5).forEach(c => {
      summary += `- **${c.timestamp.split('T')[0]}:** Changed ${c.field} from ${c.oldValue} to ${c.newValue}\n`;
      summary += `  - Reason: ${c.reason}\n`;
    });
  } else {
    summary += 'No configuration changes yet.\n';
  }
  
  return summary;
}

export default {
  getConfig,
  analyzePerformance,
  applySuggestion,
  getLearningLog,
  generateLearningSummary
};
