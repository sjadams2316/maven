/**
 * Athena Router
 * Query classification and routing to optimal data sources
 */

import type {
  QueryClassification,
  RoutingDecision,
  ClientContext,
  DataSourceId,
  QueryType,
  Urgency,
  Complexity,
  RoutingPath,
} from './types';

import {
  CLASSIFICATION_PATTERNS,
  DEFAULT_CLASSIFICATION,
  QUERY_TYPE_SOURCES,
  ROUTING_PATHS,
  DATA_SOURCES,
  ATHENA_CONFIG,
} from './config';

// =============================================================================
// Query Classification
// =============================================================================

/**
 * Classify a query to determine type, urgency, complexity, and data sources.
 * Uses regex-based classification per Founder Architecture:
 * - Core thinking engine always runs
 * - Signal augmentation modifies confidence
 * - Conditional modules activate when needed
 */
export async function classifyQuery(
  query: string,
  context?: ClientContext
): Promise<QueryClassification> {
  // Use regex classification (fast, deterministic)
  return classifyWithRegex(query, context);
}

/**
 * Regex-based query classification (fast, deterministic fallback)
 */
function classifyWithRegex(
  query: string,
  context?: ClientContext
): QueryClassification {
  const normalizedQuery = query.trim().toLowerCase();

  // Check each pattern group in order of priority
  for (const rule of CLASSIFICATION_PATTERNS) {
    for (const pattern of rule.patterns) {
      if (pattern.test(normalizedQuery)) {
        const dataSources = QUERY_TYPE_SOURCES[rule.type];

        // Boost confidence if we have supporting context
        let confidence = 0.85;
        if (context?.holdings && rule.type === 'portfolio_analysis') {
          confidence = 0.95;
        }
        if (context?.holdings && rule.type === 'trading_decision') {
          // Check if query mentions a held asset
          const mentionsHolding = context.holdings.some((ticker) =>
            normalizedQuery.includes(ticker.toLowerCase())
          );
          if (mentionsHolding) confidence = 0.95;
        }

        return {
          type: rule.type,
          urgency: rule.urgency,
          complexity: rule.complexity,
          dataSources,
          confidence,
          reasoning: `Matched pattern: ${pattern.source}`,
        };
      }
    }
  }

  // Default: treat as general chat
  return {
    type: DEFAULT_CLASSIFICATION.type,
    urgency: DEFAULT_CLASSIFICATION.urgency,
    complexity: DEFAULT_CLASSIFICATION.complexity,
    dataSources: QUERY_TYPE_SOURCES[DEFAULT_CLASSIFICATION.type],
    confidence: 0.6,
    reasoning: 'No specific pattern matched, defaulting to chat',
  };
}

/**
 * Groq-based query classification (fast LLM, ~10ms)
 * TODO: Implement when Groq integration is ready
 */
async function classifyWithGroq(
  _query: string,
  _context?: ClientContext
): Promise<QueryClassification> {
  // Placeholder for Groq classification
  // Will use a fast 8B model with structured output
  throw new Error('Groq classification not yet implemented');
}

// =============================================================================
// Routing
// =============================================================================

/**
 * Route a classified query to the optimal processing path and data sources.
 */
export async function routeQuery(
  classification: QueryClassification
): Promise<RoutingDecision> {
  const { type, urgency, complexity, dataSources } = classification;

  // Determine primary routing path based on query characteristics
  const primaryPath = selectRoutingPath(type, urgency, complexity);

  // Get enabled sources only
  const enabledSources = dataSources.filter(
    (id) => DATA_SOURCES[id]?.enabled ?? false
  );

  // Calculate estimates
  const latencyEstimate = estimateLatency(enabledSources, primaryPath);
  const costEstimate = estimateCost(enabledSources);

  // Determine if we can parallelize
  const parallelizable =
    ATHENA_CONFIG.parallelFetching &&
    enabledSources.length > 1 &&
    urgency !== 'realtime';

  // Select fallback sources
  const fallbacks = selectFallbacks(enabledSources, type);

  // Get the routing path config for signal augmentation
  const pathConfig = ROUTING_PATHS[primaryPath];

  return {
    primaryPath,
    coreSources: pathConfig?.coreSources || enabledSources,
    signalAugmentation: pathConfig?.signalAugmentation || [],
    conditionalSources: pathConfig?.conditionalSources,
    forecastingModifiers: ['precog'], // Always include as confidence modifier
    estimatedLatencyMs: latencyEstimate,
    estimatedCostUsd: costEstimate,
    parallelizable,
    fallbacks,
  };
}

/**
 * Select the optimal routing path based on query characteristics
 */
function selectRoutingPath(
  type: QueryType,
  urgency: Urgency,
  complexity: Complexity
): RoutingPath {
  // Real-time queries always go speed path
  if (urgency === 'realtime') {
    return 'speed';
  }

  // Complex trading decisions may need reasoning
  if (type === 'trading_decision' && complexity === 'high') {
    return 'cost'; // Use Bittensor signals primarily, cheaper
  }

  // Research goes deep
  if (type === 'research') {
    return 'deep';
  }

  // Portfolio analysis uses cost path (Chutes)
  if (type === 'portfolio_analysis') {
    return 'cost';
  }

  // Chat and simple lookups go speed
  if (type === 'chat' || type === 'simple_lookup') {
    return 'speed';
  }

  // Default to cost path
  return 'cost';
}

/**
 * Estimate total latency for a set of sources
 */
function estimateLatency(sources: DataSourceId[], path: RoutingPath): number {
  if (sources.length === 0) {
    return ROUTING_PATHS[path].maxLatencyMs;
  }

  // If parallelizing, latency is the max of all sources
  // If sequential, it's the sum
  const latencies = sources.map(
    (id) => DATA_SOURCES[id]?.latencyMs.typical ?? 1000
  );

  if (ATHENA_CONFIG.parallelFetching) {
    return Math.max(...latencies);
  }

  return latencies.reduce((sum, lat) => sum + lat, 0);
}

/**
 * Estimate cost for a set of sources (assuming ~1000 tokens per query)
 */
function estimateCost(sources: DataSourceId[]): number {
  const tokensPerQuery = 1000;
  const tokensInMillions = tokensPerQuery / 1_000_000;

  return sources.reduce((total, id) => {
    const config = DATA_SOURCES[id];
    if (!config) return total;
    // Use average of min/max cost
    const avgCost =
      (config.costPer1MTokens.min + config.costPer1MTokens.max) / 2;
    return total + avgCost * tokensInMillions;
  }, 0);
}

/**
 * Select fallback sources for reliability
 */
function selectFallbacks(
  primarySources: DataSourceId[],
  type: QueryType
): DataSourceId[] {
  if (!ATHENA_CONFIG.enableFallbacks) {
    return [];
  }

  const fallbacks: DataSourceId[] = [];

  // Always have Groq as a fallback for speed
  if (!primarySources.includes('groq')) {
    fallbacks.push('groq');
  }

  // For trading decisions, add Chutes as cost-effective fallback
  if (type === 'trading_decision' && !primarySources.includes('chutes')) {
    fallbacks.push('chutes');
  }

  // For research, add Claude for deeper analysis
  if (type === 'research' && !primarySources.includes('claude')) {
    fallbacks.push('claude');
  }

  return fallbacks.slice(0, 2); // Max 2 fallbacks
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a query mentions specific tickers
 */
export function extractTickers(query: string): string[] {
  // Match common ticker patterns: $AAPL, AAPL, BTC-USD
  const tickerPattern = /\$?([A-Z]{1,5})(?:-[A-Z]{2,4})?/g;
  const matches = query.match(tickerPattern) || [];

  return matches
    .map((m) => m.replace('$', '').split('-')[0])
    .filter((ticker) => ticker.length >= 2 && ticker.length <= 5);
}

/**
 * Enrich query with context for better classification
 */
export function enrichQuery(
  query: string,
  context?: ClientContext
): string {
  if (!context) return query;

  // Add context hints that might help classification
  let enriched = query;

  if (context.holdings?.length) {
    // Check if query is about a specific holding
    const mentionedTickers = extractTickers(query);
    const matchedHoldings = mentionedTickers.filter((t) =>
      context.holdings?.includes(t)
    );
    if (matchedHoldings.length > 0) {
      enriched += ` [CONTEXT: User holds ${matchedHoldings.join(', ')}]`;
    }
  }

  return enriched;
}

/**
 * Quick classification for simple routing decisions
 * Returns just the query type without full classification
 */
export function quickClassify(query: string): QueryType {
  const normalizedQuery = query.trim().toLowerCase();

  for (const rule of CLASSIFICATION_PATTERNS) {
    for (const pattern of rule.patterns) {
      if (pattern.test(normalizedQuery)) {
        return rule.type;
      }
    }
  }

  return 'chat';
}

// =============================================================================
// Full Pipeline (Convenience)
// =============================================================================

/**
 * Classify and route in one call
 */
export async function classifyAndRoute(
  query: string,
  context?: ClientContext
): Promise<{
  classification: QueryClassification;
  routing: RoutingDecision;
}> {
  const classification = await classifyQuery(query, context);
  const routing = await routeQuery(classification);

  return { classification, routing };
}
