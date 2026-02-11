/**
 * Athena Synthesis Engine
 * 
 * Combines signals from multiple sources into a unified recommendation.
 * This is where the IP lives — the weighting, disagreement handling,
 * and confidence scoring.
 * 
 * Design principles:
 * 1. Transparent — every decision is explainable
 * 2. Calibrated — confidence means something
 * 3. Graceful — works with partial data
 * 4. Auditable — full decision chain logged
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Signal {
  source: string;
  signal: number; // -1 (bearish) to +1 (bullish)
  confidence: number; // 0 to 1
  timestamp: number;
  raw?: unknown; // Original response for audit
}

export interface LLMResponse {
  provider: string;
  content: string;
  latencyMs: number;
  tokensUsed?: number;
  raw?: unknown;
}

export interface SynthesisInput {
  query: string;
  queryType: string;
  signals: Signal[];
  llmResponse: LLMResponse;
  clientContext?: {
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    hasPosition?: boolean;
    positionSize?: number;
    taxSituation?: 'short_term' | 'long_term';
  };
}

export interface SynthesisOutput {
  recommendation: string;
  confidence: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  explanation: string;
  actionItems: string[];
  flags: string[];
  
  // For transparency
  signalSummary: {
    weightedScore: number;
    agreementLevel: 'high' | 'medium' | 'low';
    sourcesUsed: string[];
    sourcesMissing: string[];
  };
  
  // For audit trail
  audit: {
    queryId: string;
    timestamp: string;
    inputs: SynthesisInput;
    weights: Record<string, number>;
    calculations: {
      normalizedSignals: Record<string, number>;
      weightedSignals: Record<string, number>;
      rawScore: number;
      disagreementPenalty: number;
      finalScore: number;
    };
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Source weights by query type.
 * These will be tuned over time based on outcome tracking.
 * 
 * Initial weights based on source characteristics:
 * - Vanta: Best for momentum/trading signals
 * - Precog: Best for short-term BTC direction
 * - Desearch: Best for sentiment, but lags price
 * - MANTIS: Good for multi-asset, more volatile
 */
const SOURCE_WEIGHTS: Record<string, Record<string, number>> = {
  trading_decision: {
    vanta: 0.35,
    precog: 0.25,
    desearch: 0.20,
    mantis: 0.20,
  },
  portfolio_analysis: {
    vanta: 0.20,
    precog: 0.15,
    desearch: 0.30,
    mantis: 0.35,
  },
  research: {
    vanta: 0.15,
    precog: 0.10,
    desearch: 0.40,
    mantis: 0.35,
  },
  default: {
    vanta: 0.25,
    precog: 0.25,
    desearch: 0.25,
    mantis: 0.25,
  },
};

/**
 * Disagreement thresholds.
 * Spread = max(signals) - min(signals)
 */
const DISAGREEMENT_THRESHOLDS = {
  low: 0.4,    // Signals within 0.4 of each other
  medium: 0.8, // Signals within 0.8 of each other
  high: 1.2,   // Signals more than 0.8 apart
};

/**
 * Confidence penalties for disagreement.
 */
const DISAGREEMENT_PENALTIES = {
  low: 0,
  medium: 0.15,
  high: 0.30,
};

/**
 * Base confidence by agreement level (before calibration).
 * Day 1: These are "agreement scores" not "calibrated probabilities".
 */
const BASE_CONFIDENCE = {
  all_agree: 0.85,      // All sources same direction
  majority_agree: 0.70, // 3 of 4 agree
  split: 0.50,          // 2 vs 2
  minority: 0.35,       // 1 vs 3
};

// ============================================================================
// SYNTHESIS ENGINE
// ============================================================================

/**
 * Main synthesis function.
 * Takes signals + LLM response, produces unified recommendation.
 */
export async function synthesize(input: SynthesisInput): Promise<SynthesisOutput> {
  const queryId = generateQueryId();
  const timestamp = new Date().toISOString();
  
  // Get weights for this query type
  const weights = SOURCE_WEIGHTS[input.queryType] || SOURCE_WEIGHTS.default;
  
  // Step 1: Normalize signals to consistent scale
  const normalizedSignals = normalizeSignals(input.signals);
  
  // Step 2: Apply weights
  const weightedSignals = applyWeights(normalizedSignals, weights);
  
  // Step 3: Calculate raw weighted score
  const rawScore = calculateWeightedScore(weightedSignals, weights);
  
  // Step 4: Detect disagreement
  const disagreement = detectDisagreement(normalizedSignals);
  
  // Step 5: Calculate confidence with penalties
  const { confidence, confidenceLevel } = calculateConfidence(
    normalizedSignals,
    disagreement
  );
  
  // Step 6: Determine recommendation
  const recommendation = determineRecommendation(
    rawScore,
    confidence,
    input.clientContext
  );
  
  // Step 7: Generate explanation
  const explanation = generateExplanation(
    normalizedSignals,
    weights,
    rawScore,
    disagreement,
    input.llmResponse
  );
  
  // Step 8: Determine action items
  const actionItems = generateActionItems(
    recommendation,
    confidence,
    input.clientContext
  );
  
  // Step 9: Generate flags
  const flags = generateFlags(disagreement, confidence, input.signals);
  
  // Identify missing sources
  const expectedSources = Object.keys(weights);
  const receivedSources = input.signals.map(s => s.source);
  const missingSources = expectedSources.filter(s => !receivedSources.includes(s));
  
  return {
    recommendation,
    confidence,
    confidenceLevel,
    explanation,
    actionItems,
    flags,
    
    signalSummary: {
      weightedScore: rawScore,
      agreementLevel: disagreement.level,
      sourcesUsed: receivedSources,
      sourcesMissing: missingSources,
    },
    
    audit: {
      queryId,
      timestamp,
      inputs: input,
      weights,
      calculations: {
        normalizedSignals,
        weightedSignals,
        rawScore,
        disagreementPenalty: DISAGREEMENT_PENALTIES[disagreement.level],
        finalScore: rawScore,
      },
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateQueryId(): string {
  return `athena-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function normalizeSignals(signals: Signal[]): Record<string, number> {
  const normalized: Record<string, number> = {};
  
  for (const signal of signals) {
    // Clamp to -1 to +1
    normalized[signal.source] = Math.max(-1, Math.min(1, signal.signal));
  }
  
  return normalized;
}

function applyWeights(
  signals: Record<string, number>,
  weights: Record<string, number>
): Record<string, number> {
  const weighted: Record<string, number> = {};
  
  for (const [source, signal] of Object.entries(signals)) {
    const weight = weights[source] || 0.25; // Default weight if unknown source
    weighted[source] = signal * weight;
  }
  
  return weighted;
}

function calculateWeightedScore(
  weightedSignals: Record<string, number>,
  weights: Record<string, number>
): number {
  const signals = Object.entries(weightedSignals);
  if (signals.length === 0) return 0;
  
  // Sum of weighted signals
  const sum = signals.reduce((acc, [_, val]) => acc + val, 0);
  
  // Normalize by actual weights used (handles missing sources)
  const usedSources = signals.map(([source]) => source);
  const totalWeight = usedSources.reduce((acc, source) => acc + (weights[source] || 0.25), 0);
  
  return totalWeight > 0 ? sum / totalWeight : 0;
}

interface DisagreementResult {
  level: 'low' | 'medium' | 'high';
  spread: number;
  details: string;
}

function detectDisagreement(signals: Record<string, number>): DisagreementResult {
  const values = Object.values(signals);
  
  if (values.length < 2) {
    return { level: 'low', spread: 0, details: 'Single source, no disagreement possible' };
  }
  
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min;
  
  let level: 'low' | 'medium' | 'high';
  let details: string;
  
  if (spread <= DISAGREEMENT_THRESHOLDS.low) {
    level = 'low';
    details = `Sources agree (spread: ${spread.toFixed(2)})`;
  } else if (spread <= DISAGREEMENT_THRESHOLDS.medium) {
    level = 'medium';
    details = `Moderate disagreement (spread: ${spread.toFixed(2)})`;
  } else {
    level = 'high';
    details = `High disagreement (spread: ${spread.toFixed(2)}) — recommend advisor review`;
  }
  
  return { level, spread, details };
}

function calculateConfidence(
  signals: Record<string, number>,
  disagreement: DisagreementResult
): { confidence: number; confidenceLevel: 'high' | 'medium' | 'low' } {
  const values = Object.values(signals);
  
  // Count directional agreement
  const bullish = values.filter(v => v > 0.1).length;
  const bearish = values.filter(v => v < -0.1).length;
  const neutral = values.length - bullish - bearish;
  
  // Determine base confidence from agreement
  let baseConfidence: number;
  
  if (bullish === values.length || bearish === values.length) {
    baseConfidence = BASE_CONFIDENCE.all_agree;
  } else if (bullish >= values.length * 0.75 || bearish >= values.length * 0.75) {
    baseConfidence = BASE_CONFIDENCE.majority_agree;
  } else if (Math.abs(bullish - bearish) <= 1) {
    baseConfidence = BASE_CONFIDENCE.split;
  } else {
    baseConfidence = BASE_CONFIDENCE.minority;
  }
  
  // Apply disagreement penalty
  const penalty = DISAGREEMENT_PENALTIES[disagreement.level];
  const confidence = Math.max(0.2, baseConfidence - penalty);
  
  // Determine level
  let confidenceLevel: 'high' | 'medium' | 'low';
  if (confidence >= 0.70) {
    confidenceLevel = 'high';
  } else if (confidence >= 0.50) {
    confidenceLevel = 'medium';
  } else {
    confidenceLevel = 'low';
  }
  
  return { confidence, confidenceLevel };
}

function determineRecommendation(
  score: number,
  confidence: number,
  context?: SynthesisInput['clientContext']
): string {
  // Adjust thresholds based on client risk tolerance
  let buyThreshold = 0.3;
  let sellThreshold = -0.3;
  
  if (context?.riskTolerance === 'conservative') {
    buyThreshold = 0.5;
    sellThreshold = -0.5;
  } else if (context?.riskTolerance === 'aggressive') {
    buyThreshold = 0.2;
    sellThreshold = -0.2;
  }
  
  // Low confidence = hold/review regardless of signal
  if (confidence < 0.4) {
    return 'Hold - recommend advisor review due to mixed signals';
  }
  
  if (score >= buyThreshold) {
    return confidence >= 0.7 ? 'Buy' : 'Consider buying';
  } else if (score <= sellThreshold) {
    return confidence >= 0.7 ? 'Sell' : 'Consider selling';
  } else {
    return 'Hold';
  }
}

function generateExplanation(
  signals: Record<string, number>,
  weights: Record<string, number>,
  score: number,
  disagreement: DisagreementResult,
  llmResponse: LLMResponse
): string {
  const parts: string[] = [];
  
  // Signal summary
  const signalDescriptions = Object.entries(signals).map(([source, value]) => {
    const direction = value > 0.1 ? 'bullish' : value < -0.1 ? 'bearish' : 'neutral';
    const strength = Math.abs(value) > 0.5 ? 'strongly' : '';
    return `${source}: ${strength} ${direction} (${value.toFixed(2)})`;
  });
  
  parts.push(`Trading signals: ${signalDescriptions.join(', ')}`);
  parts.push(`Weighted score: ${score.toFixed(2)} (${score > 0 ? 'bullish' : score < 0 ? 'bearish' : 'neutral'})`);
  parts.push(disagreement.details);
  
  // Include LLM reasoning summary (first 200 chars)
  if (llmResponse.content) {
    const summary = llmResponse.content.slice(0, 200);
    parts.push(`Analysis: ${summary}${llmResponse.content.length > 200 ? '...' : ''}`);
  }
  
  return parts.join('\n');
}

function generateActionItems(
  recommendation: string,
  confidence: number,
  context?: SynthesisInput['clientContext']
): string[] {
  const items: string[] = [];
  
  if (recommendation.includes('Buy')) {
    items.push('Review position sizing before purchase');
    if (context?.taxSituation === 'short_term') {
      items.push('Note: This would be a short-term holding for tax purposes');
    }
  } else if (recommendation.includes('Sell')) {
    items.push('Consider tax implications before selling');
    if (context?.taxSituation === 'short_term') {
      items.push('Warning: Short-term capital gains tax would apply');
    }
  } else if (recommendation.includes('Hold')) {
    items.push('Set price alert for significant moves');
    items.push('Review again in 30 days');
  }
  
  if (confidence < 0.5) {
    items.push('Discuss with advisor before taking action');
  }
  
  return items;
}

function generateFlags(
  disagreement: DisagreementResult,
  confidence: number,
  signals: Signal[]
): string[] {
  const flags: string[] = [];
  
  if (disagreement.level === 'high') {
    flags.push('HIGH_DISAGREEMENT: Sources have conflicting signals');
  }
  
  if (confidence < 0.4) {
    flags.push('LOW_CONFIDENCE: Recommend advisor review before action');
  }
  
  // Check for stale signals
  const now = Date.now();
  const staleSignals = signals.filter(s => now - s.timestamp > 60 * 60 * 1000);
  if (staleSignals.length > 0) {
    flags.push(`STALE_DATA: ${staleSignals.map(s => s.source).join(', ')} data is >1 hour old`);
  }
  
  // Check for missing sources
  if (signals.length < 3) {
    flags.push(`LIMITED_SOURCES: Only ${signals.length} sources available`);
  }
  
  return flags;
}

// ============================================================================
// GRACEFUL DEGRADATION
// ============================================================================

/**
 * Synthesize with graceful degradation when sources are missing.
 * Athena should ALWAYS produce something useful, just with appropriate
 * confidence adjustments.
 */
export async function synthesizeWithDegradation(
  input: SynthesisInput
): Promise<SynthesisOutput> {
  // If no signals at all, use LLM-only mode
  if (input.signals.length === 0) {
    return synthesizeLLMOnly(input);
  }
  
  // If only 1 signal, note reduced confidence
  if (input.signals.length === 1) {
    const result = await synthesize(input);
    result.confidence *= 0.7; // 30% penalty for single source
    result.flags.push('DEGRADED_MODE: Only one signal source available');
    return result;
  }
  
  // Normal synthesis
  return synthesize(input);
}

/**
 * Fallback when no trading signals are available.
 * Uses LLM response only with appropriate caveats.
 */
function synthesizeLLMOnly(input: SynthesisInput): SynthesisOutput {
  const queryId = generateQueryId();
  
  return {
    recommendation: 'Unable to provide trading recommendation - consult advisor',
    confidence: 0.3,
    confidenceLevel: 'low',
    explanation: `Trading signals temporarily unavailable. Based on general analysis only: ${input.llmResponse.content.slice(0, 300)}`,
    actionItems: [
      'Trading signals are temporarily unavailable',
      'Consult with your advisor for trading decisions',
      'This response is based on general analysis only',
    ],
    flags: [
      'NO_SIGNALS: Trading signal sources unavailable',
      'LLM_ONLY: Response based on language model only',
      'ADVISOR_REVIEW: Strongly recommend advisor consultation',
    ],
    signalSummary: {
      weightedScore: 0,
      agreementLevel: 'low',
      sourcesUsed: [],
      sourcesMissing: ['vanta', 'precog', 'desearch', 'mantis'],
    },
    audit: {
      queryId,
      timestamp: new Date().toISOString(),
      inputs: input,
      weights: {},
      calculations: {
        normalizedSignals: {},
        weightedSignals: {},
        rawScore: 0,
        disagreementPenalty: 0,
        finalScore: 0,
      },
    },
  };
}
