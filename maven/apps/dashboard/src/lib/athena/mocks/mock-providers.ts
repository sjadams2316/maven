/**
 * Mock LLM Providers for Athena Testing
 * 
 * Simulates responses from Groq, Chutes/DeepSeek, and Perplexity
 * without making actual API calls.
 */

/**
 * Simulate network latency
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Random latency within a range
 */
function randomLatency(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Extract key terms from prompt for context-aware responses
 */
function extractContext(prompt: string): {
  symbols: string[];
  isQuestion: boolean;
  wantsSummary: boolean;
  wantsAnalysis: boolean;
} {
  const symbolPattern = /\b(BTC|ETH|SOL|DOGE|XRP|ADA|AVAX|MATIC|DOT|LINK)\b/gi;
  const matches = prompt.match(symbolPattern) || [];
  const symbols = Array.from(new Set(matches)).map(s => s.toUpperCase());
  
  return {
    symbols,
    isQuestion: prompt.includes('?'),
    wantsSummary: /summar|overview|brief/i.test(prompt),
    wantsAnalysis: /analy|assess|evaluat|synthesiz/i.test(prompt),
  };
}

/**
 * Mock Groq response
 * Characteristics: Fast, simple, direct responses
 * 
 * @param prompt - Input prompt
 * @returns Simple text response
 */
export async function mockGroq(prompt: string): Promise<string> {
  // Groq is fast - 50-150ms
  await delay(randomLatency(50, 150));
  
  const ctx = extractContext(prompt);
  
  // Simple, direct responses characteristic of fast models
  if (ctx.wantsAnalysis && ctx.symbols.length > 0) {
    const symbol = ctx.symbols[0];
    const sentiment = Math.random() > 0.5 ? 'bullish' : 'bearish';
    const confidence = Math.floor(Math.random() * 30 + 60);
    
    return `Quick analysis for ${symbol}: The current market structure appears ${sentiment}. ` +
      `Key levels to watch are recent support/resistance zones. ` +
      `Confidence: ${confidence}%. ` +
      `Recommendation: Monitor for confirmation before taking positions.`;
  }
  
  if (ctx.wantsSummary) {
    return `Summary: Market conditions are mixed with ${ctx.symbols.join(', ') || 'major assets'} ` +
      `showing varied momentum. Risk management is advised.`;
  }
  
  if (ctx.isQuestion) {
    return `Based on available data, the most likely scenario involves continued volatility ` +
      `with key levels acting as magnets for price action.`;
  }
  
  // Default response
  return `Analysis complete. The signals suggest a cautious approach with ` +
    `position sizing appropriate for current volatility levels.`;
}

/**
 * Mock Chutes/DeepSeek response
 * Characteristics: Slower, more detailed, analytical
 * 
 * @param prompt - Input prompt
 * @returns Detailed analytical response
 */
export async function mockChutes(prompt: string): Promise<string> {
  // Chutes/DeepSeek is slower - 800-2000ms
  await delay(randomLatency(800, 2000));
  
  const ctx = extractContext(prompt);
  
  if (ctx.wantsAnalysis && ctx.symbols.length > 0) {
    const symbol = ctx.symbols[0];
    const trend = Math.random() > 0.5 ? 'upward' : 'downward';
    const strength = ['weak', 'moderate', 'strong'][Math.floor(Math.random() * 3)];
    
    return `## Detailed Analysis: ${symbol}

### Market Structure
The current market structure for ${symbol} shows a ${strength} ${trend} bias based on multiple timeframe analysis.

### Technical Indicators
- **Moving Averages**: Price is ${trend === 'upward' ? 'above' : 'below'} the 20 and 50 period MAs
- **RSI**: Currently in ${Math.random() > 0.5 ? 'neutral' : trend === 'upward' ? 'overbought' : 'oversold'} territory
- **Volume Profile**: ${Math.random() > 0.5 ? 'Increasing' : 'Decreasing'} volume on recent moves

### Key Levels
- Support: Multiple levels identified through historical price action
- Resistance: Confluence zones align with previous reaction points

### Risk Assessment
Given the current volatility regime, position sizing should account for potential ${Math.floor(Math.random() * 5 + 3)}% adverse moves.

### Synthesis
The weight of evidence suggests a ${strength} ${trend === 'upward' ? 'bullish' : 'bearish'} outlook in the near term. However, macro factors and cross-asset correlations warrant continued monitoring.

**Confidence Level**: ${Math.floor(Math.random() * 25 + 65)}%`;
  }
  
  if (ctx.wantsSummary) {
    return `## Market Summary

### Overview
Current market conditions reflect a complex interplay of technical, fundamental, and sentiment factors.

### Key Observations
1. Volatility remains elevated compared to historical averages
2. Correlation between risk assets shows signs of ${Math.random() > 0.5 ? 'strengthening' : 'weakening'}
3. Market breadth indicators suggest ${Math.random() > 0.5 ? 'healthy participation' : 'narrowing leadership'}

### Actionable Insights
- Maintain balanced exposure across timeframes
- Consider scaling strategies for entries and exits
- Monitor for regime changes in volatility

This analysis synthesizes data from multiple sources to provide a comprehensive view.`;
  }
  
  // Default detailed response
  return `## Analysis Response

The query has been processed through our analytical framework. Based on the available data and current market conditions:

### Primary Assessment
Market dynamics suggest a period of consolidation with potential for directional resolution in the near term.

### Supporting Factors
- Order flow analysis indicates balanced buying and selling pressure
- Options market positioning shows mixed sentiment
- On-chain metrics remain within normal ranges

### Conclusion
A measured approach is recommended, with clear risk parameters defined before position entry. Continue monitoring for confirmation of directional bias.

**Note**: This analysis is based on current conditions and should be updated as new information becomes available.`;
}

/**
 * Mock Perplexity response
 * Characteristics: Research-focused, includes citations
 * 
 * @param prompt - Input prompt
 * @returns Response with answer and citation sources
 */
export async function mockPerplexity(prompt: string): Promise<{
  answer: string;
  citations: string[];
}> {
  // Perplexity has medium latency - 400-1200ms (parallel searches)
  await delay(randomLatency(400, 1200));
  
  const ctx = extractContext(prompt);
  
  const baseCitations = [
    'https://www.tradingview.com/analysis/',
    'https://www.coinglass.com/markets',
    'https://alternative.me/crypto/fear-and-greed-index/',
    'https://www.coindesk.com/markets/',
    'https://decrypt.co/news',
    'https://www.theblock.co/data',
  ];
  
  // Select 3-5 random citations
  const numCitations = Math.floor(Math.random() * 3) + 3;
  const shuffled = [...baseCitations].sort(() => Math.random() - 0.5);
  const citations = shuffled.slice(0, numCitations);
  
  if (ctx.symbols.length > 0) {
    const symbol = ctx.symbols[0];
    const priceChange = (Math.random() * 10 - 5).toFixed(2);
    const sentiment = Math.random() > 0.5 ? 'positive' : 'cautious';
    
    return {
      answer: `Based on recent market data and analysis, ${symbol} has shown a ${priceChange}% move in the last 24 hours. ` +
        `Market sentiment appears ${sentiment}, with trading volumes ${Math.random() > 0.5 ? 'above' : 'below'} average. ` +
        `Social media metrics indicate ${Math.random() > 0.5 ? 'increasing' : 'stable'} interest. ` +
        `Analysts from multiple sources suggest watching key technical levels for confirmation of the next major move. ` +
        `The fear and greed index currently sits at ${Math.floor(Math.random() * 40 + 30)}, indicating ${Math.random() > 0.5 ? 'neutral' : 'mixed'} market psychology.`,
      citations,
    };
  }
  
  if (ctx.wantsAnalysis) {
    return {
      answer: `Current market analysis reveals several key trends. ` +
        `Major cryptocurrencies are showing ${Math.random() > 0.5 ? 'correlation with' : 'divergence from'} traditional risk assets. ` +
        `On-chain data suggests ${Math.random() > 0.5 ? 'accumulation' : 'distribution'} patterns among long-term holders. ` +
        `Market structure indicators point to ${Math.random() > 0.5 ? 'strengthening' : 'weakening'} momentum. ` +
        `Multiple analysts recommend maintaining diversified positions with appropriate risk management.`,
      citations,
    };
  }
  
  // Default response
  return {
    answer: `Research indicates current market conditions warrant careful analysis before making trading decisions. ` +
      `Recent data shows mixed signals across various indicators. ` +
      `Expert commentary suggests focusing on risk management and position sizing. ` +
      `Market participants should monitor both technical and fundamental factors for a complete picture.`,
    citations,
  };
}

/**
 * Configuration for mock provider behavior
 */
export interface MockProviderConfig {
  failureRate: number;      // 0-1, probability of simulated failure
  latencyMultiplier: number; // Multiply base latency
  degradedMode: boolean;     // Return partial/lower quality responses
}

const defaultConfig: MockProviderConfig = {
  failureRate: 0,
  latencyMultiplier: 1,
  degradedMode: false,
};

let currentConfig: MockProviderConfig = { ...defaultConfig };

/**
 * Configure mock provider behavior for testing
 */
export function configureMockProviders(config: Partial<MockProviderConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Reset mock provider configuration to defaults
 */
export function resetMockProviders(): void {
  currentConfig = { ...defaultConfig };
}

/**
 * Wrapper that applies failure simulation
 */
export async function withFailureSimulation<T>(
  provider: () => Promise<T>,
  providerName: string
): Promise<T> {
  // Check for simulated failure
  if (Math.random() < currentConfig.failureRate) {
    await delay(randomLatency(100, 500)); // Brief delay before failure
    throw new Error(`[Mock] ${providerName} simulated failure: Service unavailable`);
  }
  
  return provider();
}

/**
 * Test scenario helpers
 */
export const mockScenarios = {
  /**
   * All providers working normally
   */
  allHealthy: () => configureMockProviders({ 
    failureRate: 0, 
    latencyMultiplier: 1 
  }),
  
  /**
   * One provider fails intermittently
   */
  partialDegradation: () => configureMockProviders({ 
    failureRate: 0.3, 
    latencyMultiplier: 1.5 
  }),
  
  /**
   * High latency, simulating network issues
   */
  slowNetwork: () => configureMockProviders({ 
    failureRate: 0.1, 
    latencyMultiplier: 3 
  }),
  
  /**
   * Total outage simulation
   */
  totalOutage: () => configureMockProviders({ 
    failureRate: 1, 
    latencyMultiplier: 1 
  }),
  
  /**
   * Reset to normal
   */
  reset: resetMockProviders,
};
