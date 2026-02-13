/**
 * Athena Oracle Bridge
 * Connects Athena's hybrid intelligence layer to Maven Oracle
 * 
 * Routing Architecture:
 * - Simple queries → MiniMax/Groq (fast, cheap)
 * - Complex queries → Claude (deep reasoning)
 * - Signals → Vanta/Desearch (market intelligence)
 * - Research → Perplexity (web search)
 */

import { classifyAndRoute, quickClassify } from './router';
import { chutesQuery, isChutesConfigured, CHUTES_MODELS } from './providers/chutes';
import { groqQuery, isGroqConfigured, GROQ_MODELS } from './providers/groq';
import { claudeQuery, isClaudeConfigured, CLAUDE_MODELS } from './providers/claude';
import { vantaQuery, desearchQuery, formatBittensorContext, isBittensorConfigured, getConfiguredBittensorProviders } from './providers/bittensor';
import type { QueryClassification, RoutingDecision, RoutingPath } from './types';

// Feature flags
const ATHENA_FLAGS = {
  // Master switch for Athena
  enabled: process.env.ATHENA_ENABLED === 'true',
  
  // A/B test percentage (0-100). 0 = all Claude, 100 = all Athena
  abTestPercent: parseInt(process.env.ATHENA_AB_PERCENT || '50', 10),
  
  // Query types to route through fast path (others use Claude)
  fastQueryTypes: ['simple_lookup', 'chat', 'simple_lookup'],
  
  // Complexity threshold for Claude fallback
  complexityThreshold: 'high' as const,
};

interface OracleQueryResult {
  response: string;
  provider: 'athena' | 'claude' | 'minimax';
  model: string;
  classification?: QueryClassification;
  routing?: RoutingDecision;
  latencyMs: number;
  estimatedCost: number;
  signals?: {
    vanta?: any;
    desearch?: any;
  };
}

/**
 * Should this query use fast path (Groq/Chutes)?
 */
export function shouldUseFastPath(
  query: string,
  classification?: QueryClassification
): { useFast: boolean; reason: string } {
  // Check if any fast provider is configured
  if (!isGroqConfigured() && !isChutesConfigured()) {
    return { useFast: false, reason: 'no_fast_provider' };
  }
  
  // Check query classification
  if (classification) {
    // High complexity always goes to Claude
    if (classification.complexity === 'high') {
      return { useFast: false, reason: 'high_complexity' };
    }
    
    // Trading decisions need Claude for quality
    if (classification.type === 'trading_decision') {
      return { useFast: false, reason: 'trading_decision_needs_claude' };
    }
  }
  
  // Check query type
  const queryType = quickClassify(query);
  if (ATHENA_FLAGS.fastQueryTypes.includes(queryType)) {
    return { useFast: true, reason: `query_type_${queryType}` };
  }
  
  return { useFast: false, reason: 'default_to_claude' };
}

// Alias for backward compatibility
export { shouldUseFastPath as shouldUseAthena };

/**
 * Should this query include Bittensor signals?
 */
export function shouldUseSignals(
  query: string,
  classification?: QueryClassification
): { useSignals: boolean; providers: ('vanta' | 'desearch')[] } {
  if (!isBittensorConfigured()) {
    return { useSignals: false, providers: [] };
  }
  
  // Check classification
  if (classification) {
    // Always include signals for trading decisions
    if (classification.type === 'trading_decision') {
      const providers = getConfiguredBittensorProviders() as ('vanta' | 'desearch')[];
      return { useSignals: true, providers };
    }
    
    // Include for portfolio analysis
    if (classification.type === 'portfolio_analysis') {
      const providers = getConfiguredBittensorProviders() as ('vanta' | 'desearch')[];
      return { useSignals: true, providers };
    }
  }
  
  // Default: include signals for any market-related query
  const providers = getConfiguredBittensorProviders() as ('vanta' | 'desearch')[];
  return { useSignals: providers.length > 0, providers };
}

/**
 * Query Oracle through Athena's hybrid layer
 */
export async function athenaOracleQuery(
  query: string,
  systemPrompt: string,
  options?: {
    history?: { role: 'user' | 'assistant'; content: string }[];
    context?: Record<string, any>;
    holdings?: string[]; // For signal enrichment
  }
): Promise<OracleQueryResult> {
  const startTime = Date.now();
  const signals: { vanta?: any; desearch?: any } = {};
  
  // Step 1: Classify the query
  const { classification, routing } = await classifyAndRoute(query);
  
  // Step 2: Determine routing
  const { useFast, reason: fastReason } = shouldUseFastPath(query, classification);
  const { useSignals, providers: signalProviders } = shouldUseSignals(query, classification);
  
  // Step 3: Fetch signals if needed (in parallel with main query)
  if (useSignals && options?.holdings) {
    const signalPromises: Promise<void>[] = [];
    
    // Fetch Vanta signals for holdings
    if (signalProviders.includes('vanta')) {
      signalPromises.push(
        (async () => {
          const ticker = options.holdings?.[0] || 'SPY';
          const vanta = await vantaQuery(ticker);
          if (vanta) signals.vanta = vanta;
        })()
      );
    }
    
    // Fetch Desearch sentiment for holdings
    if (signalProviders.includes('desearch')) {
      signalPromises.push(
        (async () => {
          const ticker = options.holdings?.[0] || 'SPY';
          const desearch = await desearchQuery(ticker);
          if (desearch) signals.desearch = desearch;
        })()
      );
    }
    
    // Fire and forget signals (don't block main response)
    Promise.allSettled(signalPromises);
  }
  
  // Step 4: Route to appropriate provider
  let response: string;
  let provider: 'groq' | 'chutes' | 'claude' = 'claude';
  let model: string;
  
  if (useFast) {
    // Fast path: Groq or Chutes
    if (isGroqConfigured()) {
      provider = 'groq';
      model = GROQ_MODELS.llama3_70b;
      
      // Build enriched prompt with signals if available
      const enrichedPrompt = signals && Object.keys(signals).length > 0
        ? `${systemPrompt}\n\n${formatBittensorContext(
            Object.entries(signals).map(([key, val]) => ({
              source: key as 'vanta' | 'desearch',
              data: val,
              latencyMs: 0
            }))
          )}`
        : systemPrompt;
      
      response = await groqQuery(query, {
        model,
        systemPrompt: enrichedPrompt,
        maxTokens: 2048,
      });
    } else {
      provider = 'chutes';
      model = CHUTES_MODELS.balanced;
      
      const enrichedPrompt = signals && Object.keys(signals).length > 0
        ? `${systemPrompt}\n\n${formatBittensorContext(
            Object.entries(signals).map(([key, val]) => ({
              source: key as 'vanta' | 'desearch',
              data: val,
              latencyMs: 0
            }))
          )}`
        : systemPrompt;
      
      response = await chutesQuery(query, {
        model,
        systemPrompt: enrichedPrompt,
        maxTokens: 2048,
      });
    }
  } else {
    // Deep path: Claude for complex queries
    if (!isClaudeConfigured()) {
      throw new Error('Claude not configured and query requires deep reasoning');
    }
    
    provider = 'claude';
    model = CLAUDE_MODELS.sonnet;
    
    // Claude gets full context including signals
    const enrichedPrompt = signals && Object.keys(signals).length > 0
      ? `${systemPrompt}\n\n${formatBittensorContext(
          Object.entries(signals).map(([key, val]) => ({
            source: key as 'vanta' | 'desearch',
            data: val,
            latencyMs: 0
          }))
        )}`
      : systemPrompt;
    
    response = await claudeQuery(query, {
      model,
      systemPrompt: enrichedPrompt,
      maxTokens: 4096,
    });
  }
  
  const latencyMs = Date.now() - startTime;
  
  // Estimate cost
  let estimatedCost = 0;
  if (provider === 'chutes') estimatedCost = routing?.estimatedCostUsd || 0.0001;
  if (provider === 'claude') estimatedCost = 0.003; // ~$0.003 per query
  
  return {
    response,
    provider: provider === 'groq' || provider === 'chutes' ? 'athena' : 'claude',
    model: `${provider}/${model}`,
    classification,
    routing,
    latencyMs,
    estimatedCost,
    signals: Object.keys(signals).length > 0 ? signals : undefined,
  };
}

/**
 * Get routing decision info for logging/debugging
 */
export function getRoutingInfo(query: string): {
  queryType: string;
  recommendedPath: RoutingPath;
  shouldUseFast: boolean;
  shouldUseSignals: boolean;
} {
  const queryType = quickClassify(query);
  const { useFast } = shouldUseFastPath(query);
  const { useSignals } = shouldUseSignals(query);
  
  // Determine recommended path
  let recommendedPath: RoutingPath = 'cost';
  if (queryType === 'chat' || queryType === 'simple_lookup') {
    recommendedPath = 'speed';
  } else if (queryType === 'research') {
    recommendedPath = 'deep';
  }
  
  return {
    queryType,
    recommendedPath,
    shouldUseFast: useFast,
    shouldUseSignals: useSignals,
  };
}

/**
 * Format Athena response metrics for logging
 */
export function formatMetrics(result: OracleQueryResult): string {
  const signalInfo = result.signals 
    ? ` signals=${Object.keys(result.signals).join(',')}` 
    : '';
  
  return `[Athena] provider=${result.provider} model=${result.model} ` +
    `latency=${result.latencyMs}ms cost=$${result.estimatedCost.toFixed(6)} ` +
    `type=${result.classification?.type || 'unknown'}${signalInfo}`;
}
