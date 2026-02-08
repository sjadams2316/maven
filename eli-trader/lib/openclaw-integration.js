// OpenClaw Integration
// Enables autonomous operation via heartbeat/cron

/**
 * Generate a status report suitable for messaging
 * Called from heartbeat or on-demand
 */
export function formatStatusMessage(status) {
  const { portfolio, performance, positions, context } = status;
  
  let msg = '📊 **Eli Trader Status**\n\n';
  
  // Portfolio summary
  const pnl = performance.totalPnL;
  const pnlPct = performance.totalPnLPercent;
  const pnlEmoji = pnl >= 0 ? '📈' : '📉';
  
  msg += `💼 **Portfolio**: $${portfolio.currentValue?.toLocaleString() || portfolio.totalValue?.toLocaleString()}\n`;
  msg += `${pnlEmoji} **P&L**: $${pnl.toFixed(2)} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)\n`;
  msg += `💵 **Cash**: $${portfolio.cash?.toLocaleString()}\n\n`;
  
  // Positions
  if (Object.keys(positions).length > 0) {
    msg += '📍 **Positions**:\n';
    for (const [symbol, pos] of Object.entries(positions)) {
      msg += `• ${symbol}: ${pos.quantity.toFixed(4)} @ $${pos.avgPrice.toFixed(2)}\n`;
    }
    msg += '\n';
  }
  
  // Market context
  if (context) {
    const fgEmoji = context.components?.fearGreed?.value <= 25 ? '😰' : 
                    context.components?.fearGreed?.value >= 75 ? '🤑' : '😐';
    msg += `🌍 **Market**: ${context.regime} | ${fgEmoji} F&G: ${context.components?.fearGreed?.value || 'N/A'}/100\n`;
  }
  
  // Performance (if we have closed trades)
  if (performance.closedTrades > 0) {
    msg += `\n📈 **Stats**: ${performance.closedTrades} closed | ${performance.winRate.toFixed(0)}% win rate`;
  }
  
  return msg;
}

/**
 * Generate a trade alert message
 */
export function formatTradeAlert(trade, decision, isEntry = true) {
  let msg = isEntry ? '🔔 **New Trade**\n\n' : '🔔 **Trade Closed**\n\n';
  
  const dirEmoji = trade.direction === 'LONG' ? '🟢' : trade.direction === 'SHORT' ? '🔴' : '⚪';
  
  msg += `${dirEmoji} **${trade.symbol} ${trade.direction}**\n`;
  msg += `💰 Size: $${trade.size?.toFixed(2) || decision.positionSize?.toFixed(2)}\n`;
  msg += `📊 Confidence: ${(decision.signalConfidence * 100).toFixed(0)}%\n`;
  
  if (trade.pnl !== undefined) {
    const pnlEmoji = trade.pnl >= 0 ? '✅' : '❌';
    msg += `\n${pnlEmoji} **P&L**: $${trade.pnl.toFixed(2)} (${trade.pnlPercent?.toFixed(2) || 'N/A'}%)\n`;
  }
  
  msg += `\n📝 *${decision.reasons?.[0] || trade.reason || 'Signal-based trade'}*`;
  
  return msg;
}

/**
 * Generate daily summary message
 */
export function formatDailySummary(stats, todaysTrades) {
  let msg = '📅 **Daily Trading Summary**\n\n';
  
  // Portfolio
  const pnl = stats.performance.totalPnL;
  const pnlPct = stats.performance.totalPnLPercent;
  
  msg += `💼 Portfolio: $${stats.portfolio.currentValue?.toLocaleString()}\n`;
  msg += `${pnl >= 0 ? '📈' : '📉'} Total P&L: $${pnl.toFixed(2)} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)\n\n`;
  
  // Today's activity
  msg += `📊 **Today**: ${todaysTrades.length} trades\n`;
  
  if (todaysTrades.length > 0) {
    const todaysPnL = todaysTrades
      .filter(t => t.pnl !== undefined)
      .reduce((sum, t) => sum + t.pnl, 0);
    
    if (todaysPnL !== 0) {
      msg += `${todaysPnL >= 0 ? '✅' : '❌'} Realized: $${todaysPnL.toFixed(2)}\n`;
    }
    
    // List trades
    todaysTrades.slice(-5).forEach(t => {
      const emoji = t.direction === 'LONG' ? '🟢' : t.direction === 'SHORT' ? '🔴' : '⚪';
      msg += `• ${emoji} ${t.symbol} ${t.direction} $${t.size}\n`;
    });
  } else {
    msg += `_No trades today_\n`;
  }
  
  // Win rate if meaningful
  if (stats.performance.closedTrades >= 5) {
    msg += `\n📈 Win rate: ${stats.performance.winRate.toFixed(0)}%`;
  }
  
  return msg;
}

/**
 * Determine if we should alert Sam
 * Returns { shouldAlert, reason, priority }
 */
export function shouldSendAlert(event, options = {}) {
  const { 
    minPnLAlert = 100,      // Alert on P&L swing > $100
    alertOnTrades = true,   // Alert on new trades
    alertOnStop = true,     // Alert on stop-loss
    alertOnProfit = true,   // Alert on take-profit
    quietHours = { start: 23, end: 7 } // Don't alert at night
  } = options;
  
  // Check quiet hours
  const hour = new Date().getHours();
  if (hour >= quietHours.start || hour < quietHours.end) {
    // Only alert on high-priority events during quiet hours
    if (event.type !== 'STOP_LOSS' && event.type !== 'LARGE_LOSS') {
      return { shouldAlert: false, reason: 'Quiet hours' };
    }
  }
  
  switch (event.type) {
    case 'TRADE_EXECUTED':
      if (alertOnTrades) {
        return { shouldAlert: true, reason: 'New trade', priority: 'normal' };
      }
      break;
      
    case 'STOP_LOSS':
      if (alertOnStop) {
        return { shouldAlert: true, reason: 'Stop loss triggered', priority: 'high' };
      }
      break;
      
    case 'TAKE_PROFIT':
      if (alertOnProfit) {
        return { shouldAlert: true, reason: 'Take profit hit', priority: 'normal' };
      }
      break;
      
    case 'LARGE_PNL_SWING':
      if (Math.abs(event.pnl) >= minPnLAlert) {
        return { 
          shouldAlert: true, 
          reason: `Large P&L: $${event.pnl.toFixed(2)}`,
          priority: event.pnl < 0 ? 'high' : 'normal'
        };
      }
      break;
      
    case 'DAILY_SUMMARY':
      return { shouldAlert: true, reason: 'Daily summary', priority: 'low' };
  }
  
  return { shouldAlert: false };
}

export default {
  formatStatusMessage,
  formatTradeAlert,
  formatDailySummary,
  shouldSendAlert
};
