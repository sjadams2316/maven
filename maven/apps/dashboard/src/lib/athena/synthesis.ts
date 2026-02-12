/**
 * Athena Synthesis Engine
 * 
 * The brain that combines multiple intelligence sources into
 * unified, confident assessments with proper weighting and
 * disagreement detection.
 * 
 * This is what makes Athena more than "fetch from multiple APIs."
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Normalized signal from any source (-1 to +1)
 * -1 = strongly bearish/negative
 *  0 = neutral
 * +1 = strongly bullish/positive
 */
export interface NormalizedSignal {
  sourceId: string;
  sourceName: string;
  sourceCategory: 'sentiment' | 'trading' | 'forecast' | 'analyst' | 'fundamental';
  
  // Core signal
  value: number;           // -1 to +1
  confidence: number;      // 0 to 1 (how confident is the source?)
  
  // Metadata
  rawData?: any;           // Original data for debugging
  timestamp: string;
  latencyMs?: number;
  
  // For weighting
  weight?: number;         // Assigned weight (0-1)
  reliability?: number;    // Historical reliability (0-1)
}

export interface SynthesisInput {
  symbol: string;
  signals: NormalizedSignal[];
  
  // Optional context for smarter synthesis
  context?: {
    hasEarningsSoon?: boolean;
    isVolatile?: boolean;
    marketCondition?: 'bull' | 'bear' | 'neutral';
  };
}

export interface SynthesisResult {
  symbol: string;
  timestamp: string;
  
  // Primary output
  direction: 'bullish' | 'bearish' | 'neutral';
  score: number;           // -1 to +1 (weighted consensus)
  confidence: number;      // 0 to 1 (how confident in this assessment)
  
  // Agreement analysis
  agreement: {
    level: 'strong' | 'moderate' | 'weak' | 'conflicting';
    score: number;         // 0 to 1 (1 = perfect agreement)
    description: string;
  };
  
  // Source breakdown
  sources: Array<{
    sourceId: string;
    sourceName: string;
    category: string;
    signal: 'bullish' | 'bearish' | 'neutral';
    value: number;
    weight: number;
    contribution: number;  // How much this source affected final score
  }>;
  
  // Disagreements (if any)
  disagreements: Array<{
    source1: string;
    source2: string;
    description: string;
    severity: 'minor' | 'significant' | 'major';
  }>;
  
  // Human-readable summary
  summary: string;
  reasoning: string[];
  
  // Alerts triggered
  alerts: Array<{
    type: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Default weights by source category
 * Can be overridden per-source or dynamically adjusted
 */
const DEFAULT_CATEGORY_WEIGHTS: Record<string, number> = {
  sentiment: 0.25,      // Social sentiment (Twitter, Reddit)
  trading: 0.30,        // Trading signals (Vanta)
  forecast: 0.20,       // Price forecasts (Precog)
  analyst: 0.15,        // Wall Street analysts
  fundamental: 0.10,    // Fundamental metrics
};

/**
 * Source-specific weight overrides
 */
const SOURCE_WEIGHT_OVERRIDES: Record<string, number> = {
  'xai': 0.30,          // First-party Twitter data - higher trust
  'desearch': 0.20,     // Validation layer
  'vanta': 0.25,        // Crowdsourced trading signals
  'precog': 0.15,       // BTC-only forecasts
  'analyst': 0.10,      // Traditional analysts
};

/**
 * Thresholds for classification
 */
const THRESHOLDS = {
  bullish: 0.15,        // Score > 0.15 = bullish
  bearish: -0.15,       // Score < -0.15 = bearish
  strongSignal: 0.4,    // |score| > 0.4 = strong signal
  highConfidence: 0.7,  // Confidence > 0.7 = high
  agreementStrong: 0.8, // Agreement > 0.8 = strong
  agreementWeak: 0.4,   // Agreement < 0.4 = weak
  disagreementThreshold: 0.5, // Sources differ by > 0.5 = disagreement
};

// ============================================================================
// NORMALIZATION HELPERS
// ============================================================================

/**
 * Normalize sentiment to -1 to +1
 */
export function normalizeSentiment(
  sentiment: 'bullish' | 'bearish' | 'neutral',
  score: number,
  confidence: number
): number {
  // Score is already -1 to +1, just validate
  const clampedScore = Math.max(-1, Math.min(1, score));
  
  // Weight by confidence
  return clampedScore * Math.max(0.5, confidence);
}

/**
 * Normalize trading signal to -1 to +1
 */
export function normalizeTradingSignal(
  direction: 'LONG' | 'SHORT' | 'FLAT' | 'NEUTRAL',
  confidence: number
): number {
  const directionMap: Record<string, number> = {
    'LONG': 1,
    'SHORT': -1,
    'FLAT': 0,
    'NEUTRAL': 0,
  };
  
  const base = directionMap[direction] ?? 0;
  return base * Math.max(0.5, confidence);
}

/**
 * Normalize price forecast to -1 to +1
 */
export function normalizeForecast(
  direction: 'up' | 'down' | 'sideways',
  percentChange: number,
  confidence: number
): number {
  // Map direction and magnitude to -1 to +1
  let base = 0;
  if (direction === 'up') {
    base = Math.min(1, percentChange / 5); // 5% = full bullish
  } else if (direction === 'down') {
    base = Math.max(-1, -percentChange / 5);
  }
  
  return base * Math.max(0.5, confidence);
}

// ============================================================================
// SYNTHESIS ENGINE
// ============================================================================

/**
 * Calculate weighted consensus from multiple signals
 */
function calculateWeightedConsensus(signals: NormalizedSignal[]): {
  score: number;
  totalWeight: number;
  contributions: Map<string, number>;
} {
  if (signals.length === 0) {
    return { score: 0, totalWeight: 0, contributions: new Map() };
  }
  
  let weightedSum = 0;
  let totalWeight = 0;
  const contributions = new Map<string, number>();
  
  for (const signal of signals) {
    // Get weight (source override > category default > 0.1)
    const weight = signal.weight 
      ?? SOURCE_WEIGHT_OVERRIDES[signal.sourceId]
      ?? DEFAULT_CATEGORY_WEIGHTS[signal.sourceCategory]
      ?? 0.1;
    
    // Adjust weight by source confidence and reliability
    const adjustedWeight = weight * signal.confidence * (signal.reliability ?? 1);
    
    // Calculate contribution
    const contribution = signal.value * adjustedWeight;
    weightedSum += contribution;
    totalWeight += adjustedWeight;
    
    contributions.set(signal.sourceId, contribution);
  }
  
  // Normalize to -1 to +1
  const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  return { score, totalWeight, contributions };
}

/**
 * Calculate agreement level between signals
 */
function calculateAgreement(signals: NormalizedSignal[]): {
  level: 'strong' | 'moderate' | 'weak' | 'conflicting';
  score: number;
  description: string;
} {
  if (signals.length < 2) {
    return {
      level: 'moderate',
      score: 0.5,
      description: 'Insufficient sources for agreement analysis',
    };
  }
  
  // Calculate variance in signals
  const values = signals.map(s => s.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Check for direction agreement
  const bullish = signals.filter(s => s.value > THRESHOLDS.bullish).length;
  const bearish = signals.filter(s => s.value < THRESHOLDS.bearish).length;
  const neutral = signals.length - bullish - bearish;
  
  // Calculate agreement score (inverse of normalized variance)
  // Lower variance = higher agreement
  const normalizedVariance = Math.min(1, stdDev / 0.5); // 0.5 stdDev = max disagreement
  const agreementScore = 1 - normalizedVariance;
  
  // Determine level
  let level: 'strong' | 'moderate' | 'weak' | 'conflicting';
  let description: string;
  
  if (bullish > 0 && bearish > 0) {
    // Mixed signals
    if (Math.abs(bullish - bearish) <= 1) {
      level = 'conflicting';
      description = `Sources are split: ${bullish} bullish, ${bearish} bearish, ${neutral} neutral`;
    } else {
      level = 'weak';
      description = `Mixed signals with ${bullish > bearish ? 'bullish' : 'bearish'} lean`;
    }
  } else if (agreementScore > THRESHOLDS.agreementStrong) {
    level = 'strong';
    const direction = mean > 0 ? 'bullish' : mean < 0 ? 'bearish' : 'neutral';
    description = `Strong consensus: ${signals.length} sources agree on ${direction} outlook`;
  } else if (agreementScore > THRESHOLDS.agreementWeak) {
    level = 'moderate';
    description = `Moderate agreement across ${signals.length} sources`;
  } else {
    level = 'weak';
    description = `Signals show significant variation`;
  }
  
  return { level, score: agreementScore, description };
}

/**
 * Detect disagreements between sources
 */
function detectDisagreements(signals: NormalizedSignal[]): Array<{
  source1: string;
  source2: string;
  description: string;
  severity: 'minor' | 'significant' | 'major';
}> {
  const disagreements: Array<{
    source1: string;
    source2: string;
    description: string;
    severity: 'minor' | 'significant' | 'major';
  }> = [];
  
  for (let i = 0; i < signals.length; i++) {
    for (let j = i + 1; j < signals.length; j++) {
      const s1 = signals[i];
      const s2 = signals[j];
      const diff = Math.abs(s1.value - s2.value);
      
      if (diff > THRESHOLDS.disagreementThreshold) {
        // Determine severity
        let severity: 'minor' | 'significant' | 'major';
        if (diff > 1.2) {
          severity = 'major';
        } else if (diff > 0.8) {
          severity = 'significant';
        } else {
          severity = 'minor';
        }
        
        // Check if directions are opposite
        const s1Dir = s1.value > THRESHOLDS.bullish ? 'bullish' : s1.value < THRESHOLDS.bearish ? 'bearish' : 'neutral';
        const s2Dir = s2.value > THRESHOLDS.bullish ? 'bullish' : s2.value < THRESHOLDS.bearish ? 'bearish' : 'neutral';
        
        if ((s1Dir === 'bullish' && s2Dir === 'bearish') || (s1Dir === 'bearish' && s2Dir === 'bullish')) {
          severity = 'major'; // Opposite directions = always major
        }
        
        disagreements.push({
          source1: s1.sourceName,
          source2: s2.sourceName,
          description: `${s1.sourceName} is ${s1Dir} (${s1.value.toFixed(2)}) while ${s2.sourceName} is ${s2Dir} (${s2.value.toFixed(2)})`,
          severity,
        });
      }
    }
  }
  
  return disagreements;
}

/**
 * Generate human-readable reasoning
 */
function generateReasoning(
  signals: NormalizedSignal[],
  consensus: { score: number },
  agreement: { level: string; description: string },
  disagreements: any[]
): string[] {
  const reasoning: string[] = [];
  
  // Primary signal
  const direction = consensus.score > THRESHOLDS.bullish ? 'bullish' : 
                    consensus.score < THRESHOLDS.bearish ? 'bearish' : 'neutral';
  const strength = Math.abs(consensus.score) > THRESHOLDS.strongSignal ? 'strong' : 'moderate';
  
  reasoning.push(`Overall assessment is ${strength}ly ${direction} (score: ${consensus.score.toFixed(2)})`);
  
  // Source summary
  const sourceCategories = new Map<string, number>();
  signals.forEach(s => {
    const current = sourceCategories.get(s.sourceCategory) || 0;
    sourceCategories.set(s.sourceCategory, current + 1);
  });
  
  const sourceList = Array.from(sourceCategories.entries())
    .map(([cat, count]) => `${count} ${cat}`)
    .join(', ');
  reasoning.push(`Based on ${signals.length} sources: ${sourceList}`);
  
  // Agreement note
  reasoning.push(agreement.description);
  
  // Disagreements
  if (disagreements.length > 0) {
    const majorDisagreements = disagreements.filter(d => d.severity === 'major');
    if (majorDisagreements.length > 0) {
      reasoning.push(`⚠️ Major disagreement detected: ${majorDisagreements[0].description}`);
    }
  }
  
  // Individual signal notes
  const strongSignals = signals.filter(s => Math.abs(s.value) > THRESHOLDS.strongSignal);
  strongSignals.forEach(s => {
    const dir = s.value > 0 ? 'bullish' : 'bearish';
    reasoning.push(`${s.sourceName} shows strong ${dir} signal (${s.value.toFixed(2)})`);
  });
  
  return reasoning;
}

/**
 * Generate alerts based on synthesis
 */
function generateAlerts(
  symbol: string,
  consensus: { score: number },
  agreement: { level: string },
  disagreements: any[],
  context?: SynthesisInput['context']
): Array<{ type: string; message: string; priority: 'high' | 'medium' | 'low' }> {
  const alerts: Array<{ type: string; message: string; priority: 'high' | 'medium' | 'low' }> = [];
  
  // Strong signal alert
  if (Math.abs(consensus.score) > THRESHOLDS.strongSignal) {
    const direction = consensus.score > 0 ? 'bullish' : 'bearish';
    alerts.push({
      type: 'strong_signal',
      priority: 'medium',
      message: `${symbol} showing strong ${direction} signal across sources`,
    });
  }
  
  // Conflicting signals alert
  if (agreement.level === 'conflicting') {
    alerts.push({
      type: 'conflicting_signals',
      priority: 'high',
      message: `${symbol} has conflicting signals - proceed with caution`,
    });
  }
  
  // Major disagreement alert
  const majorDisagreements = disagreements.filter(d => d.severity === 'major');
  if (majorDisagreements.length > 0) {
    alerts.push({
      type: 'major_disagreement',
      priority: 'high',
      message: `${symbol}: ${majorDisagreements[0].description}`,
    });
  }
  
  // Earnings context alert
  if (context?.hasEarningsSoon && Math.abs(consensus.score) > 0.2) {
    const direction = consensus.score > 0 ? 'bullish' : 'bearish';
    alerts.push({
      type: 'earnings_sentiment',
      priority: 'medium',
      message: `${symbol} sentiment is ${direction} ahead of earnings`,
    });
  }
  
  return alerts;
}

// ============================================================================
// MAIN SYNTHESIS FUNCTION
// ============================================================================

/**
 * Synthesize multiple intelligence signals into a unified assessment
 */
export function synthesize(input: SynthesisInput): SynthesisResult {
  const { symbol, signals, context } = input;
  const timestamp = new Date().toISOString();
  
  // Handle empty signals
  if (signals.length === 0) {
    return {
      symbol,
      timestamp,
      direction: 'neutral',
      score: 0,
      confidence: 0,
      agreement: {
        level: 'weak',
        score: 0,
        description: 'No signals available',
      },
      sources: [],
      disagreements: [],
      summary: `No intelligence signals available for ${symbol}`,
      reasoning: ['No data sources provided signals for this symbol'],
      alerts: [],
    };
  }
  
  // Calculate weighted consensus
  const consensus = calculateWeightedConsensus(signals);
  
  // Calculate agreement
  const agreement = calculateAgreement(signals);
  
  // Detect disagreements
  const disagreements = detectDisagreements(signals);
  
  // Determine direction
  let direction: 'bullish' | 'bearish' | 'neutral';
  if (consensus.score > THRESHOLDS.bullish) {
    direction = 'bullish';
  } else if (consensus.score < THRESHOLDS.bearish) {
    direction = 'bearish';
  } else {
    direction = 'neutral';
  }
  
  // Calculate confidence
  // Higher confidence when: more sources, higher agreement, stronger signal
  const sourceCountFactor = Math.min(1, signals.length / 4); // Max at 4 sources
  const agreementFactor = agreement.score;
  const signalStrengthFactor = Math.min(1, Math.abs(consensus.score) / 0.5);
  
  const confidence = (sourceCountFactor * 0.3 + agreementFactor * 0.5 + signalStrengthFactor * 0.2);
  
  // Build source breakdown
  const sources = signals.map(s => {
    const contribution = consensus.contributions.get(s.sourceId) || 0;
    const weight = s.weight 
      ?? SOURCE_WEIGHT_OVERRIDES[s.sourceId]
      ?? DEFAULT_CATEGORY_WEIGHTS[s.sourceCategory]
      ?? 0.1;
    
    return {
      sourceId: s.sourceId,
      sourceName: s.sourceName,
      category: s.sourceCategory,
      signal: s.value > THRESHOLDS.bullish ? 'bullish' as const : 
              s.value < THRESHOLDS.bearish ? 'bearish' as const : 'neutral' as const,
      value: s.value,
      weight,
      contribution,
    };
  });
  
  // Generate reasoning
  const reasoning = generateReasoning(signals, consensus, agreement, disagreements);
  
  // Generate alerts
  const alerts = generateAlerts(symbol, consensus, agreement, disagreements, context);
  
  // Build summary
  const emoji = direction === 'bullish' ? '🟢' : direction === 'bearish' ? '🔴' : '⚪';
  const confidenceLabel = confidence > THRESHOLDS.highConfidence ? 'high' : 
                          confidence > 0.4 ? 'moderate' : 'low';
  const summary = `${emoji} ${symbol}: ${direction.toUpperCase()} (${confidenceLabel} confidence, ${agreement.level} agreement)`;
  
  return {
    symbol,
    timestamp,
    direction,
    score: consensus.score,
    confidence,
    agreement,
    sources,
    disagreements,
    summary,
    reasoning,
    alerts,
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick synthesis from raw Athena data
 */
export async function synthesizeSymbol(
  symbol: string,
  options?: {
    includeSentiment?: boolean;
    includeTrading?: boolean;
    includeForecasts?: boolean;
    includeAnalyst?: boolean;
  }
): Promise<SynthesisResult> {
  const signals: NormalizedSignal[] = [];
  const timestamp = new Date().toISOString();
  
  const {
    includeSentiment = true,
    includeTrading = true,
    includeForecasts = true,
    includeAnalyst = true,
  } = options || {};
  
  // Import providers dynamically to avoid circular deps
  const { getCombinedSentiment, isXAIConfigured } = await import('./providers/xai');
  const { getVantaConsensus, fetchPrecogForecast, isVantaConfigured, isPrecogConfigured } = await import('./providers/bittensor');
  
  // Fetch sentiment
  if (includeSentiment) {
    try {
      const sentiment = await getCombinedSentiment(symbol);
      
      if (sentiment.xaiSentiment) {
        signals.push({
          sourceId: 'xai',
          sourceName: 'Twitter (xAI)',
          sourceCategory: 'sentiment',
          value: normalizeSentiment(
            sentiment.xaiSentiment.sentiment,
            sentiment.xaiSentiment.score,
            sentiment.xaiSentiment.confidence
          ),
          confidence: sentiment.xaiSentiment.confidence,
          timestamp,
          rawData: sentiment.xaiSentiment,
        });
      }
      
      if (sentiment.desearchSentiment) {
        signals.push({
          sourceId: 'desearch',
          sourceName: 'Reddit (Desearch)',
          sourceCategory: 'sentiment',
          value: normalizeSentiment(
            sentiment.desearchSentiment.sentiment as 'bullish' | 'bearish' | 'neutral',
            sentiment.desearchSentiment.score,
            0.7 // Default confidence for Desearch
          ),
          confidence: 0.7,
          timestamp,
          rawData: sentiment.desearchSentiment,
        });
      }
    } catch (e) {
      console.error('Sentiment fetch error:', e);
    }
  }
  
  // Fetch trading signals
  if (includeTrading && isVantaConfigured()) {
    try {
      const signal = await getVantaConsensus(symbol);
      signals.push({
        sourceId: 'vanta',
        sourceName: 'Vanta Trading',
        sourceCategory: 'trading',
        value: normalizeTradingSignal(signal.direction, signal.confidence),
        confidence: signal.confidence,
        timestamp,
        rawData: signal,
      });
    } catch (e) {
      console.error('Trading signal fetch error:', e);
    }
  }
  
  // Fetch forecasts (BTC only)
  if (includeForecasts && symbol.toUpperCase() === 'BTC' && isPrecogConfigured()) {
    try {
      const forecast = await fetchPrecogForecast();
      const percentChange = ((forecast.forecastPrice - forecast.currentPrice) / forecast.currentPrice) * 100;
      
      signals.push({
        sourceId: 'precog',
        sourceName: 'Precog Forecast',
        sourceCategory: 'forecast',
        value: normalizeForecast(forecast.direction, Math.abs(percentChange), forecast.confidence),
        confidence: forecast.confidence,
        timestamp,
        rawData: forecast,
      });
    } catch (e) {
      console.error('Forecast fetch error:', e);
    }
  }
  
  // TODO: Add analyst data from FMP if includeAnalyst
  
  return synthesize({ symbol, signals });
}

/**
 * Batch synthesis for multiple symbols
 */
export async function synthesizeBatch(
  symbols: string[],
  options?: Parameters<typeof synthesizeSymbol>[1]
): Promise<Map<string, SynthesisResult>> {
  const results = new Map<string, SynthesisResult>();
  
  const promises = symbols.map(async (symbol) => {
    try {
      const result = await synthesizeSymbol(symbol, options);
      results.set(symbol, result);
    } catch (e) {
      console.error(`Synthesis failed for ${symbol}:`, e);
    }
  });
  
  await Promise.allSettled(promises);
  return results;
}

/**
 * Format synthesis result for display
 */
export function formatSynthesisForDisplay(result: SynthesisResult): string {
  const lines: string[] = [];
  
  lines.push(result.summary);
  lines.push('');
  lines.push(`Score: ${result.score.toFixed(2)} | Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  lines.push(`Agreement: ${result.agreement.level} (${(result.agreement.score * 100).toFixed(0)}%)`);
  lines.push('');
  lines.push('Sources:');
  result.sources.forEach(s => {
    const emoji = s.signal === 'bullish' ? '🟢' : s.signal === 'bearish' ? '🔴' : '⚪';
    lines.push(`  ${emoji} ${s.sourceName}: ${s.signal} (${s.value.toFixed(2)})`);
  });
  
  if (result.disagreements.length > 0) {
    lines.push('');
    lines.push('⚠️ Disagreements:');
    result.disagreements.forEach(d => {
      lines.push(`  - ${d.description}`);
    });
  }
  
  if (result.alerts.length > 0) {
    lines.push('');
    lines.push('Alerts:');
    result.alerts.forEach(a => {
      const icon = a.priority === 'high' ? '🔴' : a.priority === 'medium' ? '🟡' : '🔵';
      lines.push(`  ${icon} ${a.message}`);
    });
  }
  
  return lines.join('\n');
}
