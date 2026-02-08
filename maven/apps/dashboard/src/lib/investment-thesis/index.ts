/**
 * Investment Thesis Index
 * 
 * Export thesis data and helper functions for use across the app.
 */

export * from './current-views';

import { CURRENT_VIEWS, AssetClassView } from './current-views';

/**
 * Get thesis-backed explanation for a recommended allocation change
 */
export function explainAllocationChange(
  assetClass: string,
  currentAllocation: number,
  recommendedAllocation: number
): string {
  const view = CURRENT_VIEWS.find(v => 
    v.name.toLowerCase().includes(assetClass.toLowerCase()) ||
    v.id.includes(assetClass.toLowerCase())
  );
  
  if (!view) {
    return `Adjusting ${assetClass} allocation from ${currentAllocation.toFixed(1)}% to ${recommendedAllocation.toFixed(1)}%.`;
  }
  
  const change = recommendedAllocation - currentAllocation;
  const direction = change > 0 ? 'increasing' : 'decreasing';
  const stance = view.recommendation.stance;
  
  let explanation = `**${view.name}**: ${direction} from ${currentAllocation.toFixed(1)}% to ${recommendedAllocation.toFixed(1)}%.\n\n`;
  
  // Add valuation context
  explanation += `**Valuation**: ${view.valuation.vsHistory} — ${view.valuation.current}\n\n`;
  
  // Add key reasoning
  explanation += `**Our thesis**: ${view.recommendation.reasoning}\n\n`;
  
  // Add uncertainty
  explanation += `**Important caveat**: ${view.uncertainty.timingRisk}`;
  
  return explanation;
}

/**
 * Get portfolio-level thesis summary
 */
export function getPortfolioThesisSummary(allocation: Record<string, number>): string {
  const summaries: string[] = [];
  
  for (const [asset, pct] of Object.entries(allocation)) {
    const view = CURRENT_VIEWS.find(v => 
      v.name.toLowerCase().includes(asset.toLowerCase()) ||
      v.id.toLowerCase().includes(asset.toLowerCase())
    );
    
    if (view && pct > 0) {
      const inRange = pct >= view.recommendation.targetRange.min && 
                      pct <= view.recommendation.targetRange.max;
      
      if (!inRange) {
        if (pct < view.recommendation.targetRange.min) {
          summaries.push(`${view.name} (${pct.toFixed(0)}%) is below our recommended ${view.recommendation.targetRange.min}-${view.recommendation.targetRange.max}% range.`);
        } else {
          summaries.push(`${view.name} (${pct.toFixed(0)}%) is above our recommended ${view.recommendation.targetRange.min}-${view.recommendation.targetRange.max}% range.`);
        }
      }
    }
  }
  
  return summaries.length > 0 
    ? summaries.join('\n') 
    : 'Your allocation is within our recommended ranges for all major asset classes.';
}

/**
 * Map common tickers/asset classes to thesis views
 */
export const TICKER_TO_VIEW: Record<string, string> = {
  // US Large Cap
  'VTI': 'us-large-cap',
  'VOO': 'us-large-cap',
  'SPY': 'us-large-cap',
  'IVV': 'us-large-cap',
  'QQQ': 'us-large-cap',
  
  // International Developed
  'VXUS': 'intl-developed',
  'VEA': 'intl-developed',
  'IEFA': 'intl-developed',
  'EFA': 'intl-developed',
  
  // Emerging Markets
  'VWO': 'emerging-markets',
  'IEMG': 'emerging-markets',
  'EEM': 'emerging-markets',
  
  // Bonds
  'BND': 'us-bonds',
  'AGG': 'us-bonds',
  'VBTLX': 'us-bonds',
  
  // Crypto
  'BTC': 'crypto',
  'TAO': 'crypto',
  'ETH': 'crypto',
};

/**
 * Get the thesis view for a specific ticker
 */
export function getThesisForTicker(ticker: string): AssetClassView | undefined {
  const viewId = TICKER_TO_VIEW[ticker.toUpperCase()];
  if (viewId) {
    return CURRENT_VIEWS.find(v => v.id === viewId);
  }
  return undefined;
}

/**
 * Generate a full optimization explanation with thesis backing
 */
export function generateOptimizationExplanation(
  changes: { asset: string; from: number; to: number }[],
  optimizationType: 'mean-variance' | 'risk-parity' | 'min-volatility' | 'thesis-aligned'
): string {
  let explanation = '';
  
  // Explain the optimization method
  const methodExplanations = {
    'mean-variance': 'This optimization uses **Modern Portfolio Theory** (Markowitz) to find the portfolio with the best risk-adjusted return based on expected returns and correlations.',
    'risk-parity': 'This optimization uses **Risk Parity** to balance risk contribution across asset classes, rather than optimizing for return.',
    'min-volatility': 'This optimization finds the **Minimum Volatility** portfolio — the combination of assets with the lowest expected volatility.',
    'thesis-aligned': 'This optimization aligns your portfolio with **Maven\'s investment thesis**, considering valuations, CMAs, and regime context.'
  };
  
  explanation += `### Optimization Method\n${methodExplanations[optimizationType]}\n\n`;
  
  // Explain each change
  explanation += `### Recommended Changes\n`;
  
  for (const change of changes) {
    if (Math.abs(change.to - change.from) < 1) continue; // Skip tiny changes
    
    const view = getThesisForTicker(change.asset) || 
                 CURRENT_VIEWS.find(v => v.name.toLowerCase().includes(change.asset.toLowerCase()));
    
    if (view) {
      const direction = change.to > change.from ? '↑' : '↓';
      explanation += `\n**${change.asset}** ${change.from.toFixed(1)}% → ${change.to.toFixed(1)}% ${direction}\n`;
      explanation += `- Valuation: ${view.valuation.vsHistory}\n`;
      explanation += `- Our stance: ${view.recommendation.stance}\n`;
      explanation += `- Reasoning: ${view.recommendation.reasoning.split('.')[0]}.\n`;
    } else {
      explanation += `\n**${change.asset}** ${change.from.toFixed(1)}% → ${change.to.toFixed(1)}%\n`;
    }
  }
  
  // Add uncertainty disclaimer
  explanation += `\n### Important Caveats\n`;
  explanation += `- These recommendations are based on current market conditions and historical data\n`;
  explanation += `- Timing is uncertain — "cheap" assets can stay cheap for years\n`;
  explanation += `- Your personal situation (taxes, timeline, risk tolerance) may warrant different allocations\n`;
  explanation += `- Rebalancing has costs (taxes, fees) that should be considered\n`;
  
  return explanation;
}
