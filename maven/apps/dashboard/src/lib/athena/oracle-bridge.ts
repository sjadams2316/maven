/**
 * Athena Oracle Bridge
 * Connects Athena's hybrid intelligence layer to Maven Oracle
 * 
 * This enables A/B testing between:
 * - Claude-only (current)
 * - Athena hybrid (Chutes + signals + synthesis)
 */

import { classifyAndRoute, quickClassify } from './router';
import { chutesQuery, isChutesConfigured, CHUTES_MODELS } from './providers/chutes';
import { groqQuery, isGroqConfigured, GROQ_MODELS } from './providers/groq';
import type { QueryClassification, RoutingDecision, RoutingPath } from './types';

// Feature flags
const ATHENA_FLAGS = {
  // Master switch for Athena
  enabled: process.env.ATHENA_ENABLED === 'true',
  
  // A/B test percentage (0-100). 0 = all Claude, 100 = all Athena
  abTestPercent: parseInt(process.env.ATHENA_AB_PERCENT || '0', 10),
  
  // Query types to route through Athena (others use Claude)
  athenaQueryTypes: ['simple_lookup', 'chat', 'portfolio_analysis'],
  
  // Cost threshold - use Claude for complex queries above this
  complexityThreshold: 'high' as const,
};

interface OracleQueryResult {
  response: string;
  provider: 'athena' | 'claude';
  model: string;
  classification?: QueryClassification;
  routing?: RoutingDecision;
  latencyMs: number;
  estimatedCost: number;
}

/**
 * Should this query use Athena?
 */
export function shouldUseAthena(
  query: string,
  forceAthena?: boolean
): { useAthena: boolean; reason: string } {
  // Manual override
  if (forceAthena) {
    return { useAthena: true, reason: 'forced' };
  }
  
  // Check master switch
  if (!ATHENA_FLAGS.enabled) {
    return { useAthena: false, reason: 'athena_disabled' };
  }
  
  // Check if Chutes is configured
  if (!isChutesConfigured()) {
    return { useAthena: false, reason: 'chutes_not_configured' };
  }
  
  // A/B test
  const roll = Math.random() * 100;
  if (roll > ATHENA_FLAGS.abTestPercent) {
    return { useAthena: false, reason: 'ab_test_control' };
  }
  
  // Quick classify to check query type
  const queryType = quickClassify(query);
  if (!ATHENA_FLAGS.athenaQueryTypes.includes(queryType)) {
    return { useAthena: false, reason: `query_type_${queryType}_uses_claude` };
  }
  
  return { useAthena: true, reason: 'ab_test_treatment' };
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
  }
): Promise<OracleQueryResult> {
  const startTime = Date.now();
  
  // Classify and route the query
  const { classification, routing } = await classifyAndRoute(query);
  
  // Select provider and model based on routing path
  let provider: 'groq' | 'chutes' = 'chutes';
  let model: string;
  
  // Use Groq for speed path if available (sub-second latency)
  if (routing.primaryPath === 'speed' && isGroqConfigured()) {
    provider = 'groq';
    model = GROQ_MODELS.llama3_70b;
  } else {
    // Fall back to Chutes
    switch (routing.primaryPath) {
      case 'speed':
        model = CHUTES_MODELS.cheap; // Mistral - fastest on Chutes
        break;
      case 'cost':
        model = CHUTES_MODELS.balanced; // DeepSeek R1 - good balance
        break;
      case 'deep':
        model = CHUTES_MODELS.reasoning; // Qwen3 - best reasoning
        break;
      default:
        model = CHUTES_MODELS.balanced;
    }
  }
  
  try {
    let response: string;
    
    if (provider === 'groq') {
      // Use Groq for ultra-fast inference
      response = await groqQuery(query, {
        model,
        systemPrompt,
        maxTokens: 2048,
      });
    } else {
      // Use Chutes for cost-effective inference
      response = await chutesQuery(query, {
        model,
        systemPrompt,
        maxTokens: 2048,
      });
    }
    
    const latencyMs = Date.now() - startTime;
    
    // Estimate cost (Groq is free tier, Chutes is ~$0.0001/query)
    const estimatedCost = provider === 'groq' ? 0 : (routing.estimatedCostUsd || 0.0001);
    
    return {
      response,
      provider: 'athena',
      model: `${provider}/${model}`,
      classification,
      routing,
      latencyMs,
      estimatedCost,
    };
  } catch (error) {
    console.error('Athena query failed:', error);
    throw error;
  }
}

/**
 * Get routing decision info for logging/debugging
 */
export function getRoutingInfo(query: string): {
  queryType: string;
  recommendedPath: RoutingPath;
  shouldUseAthena: boolean;
} {
  const queryType = quickClassify(query);
  const { useAthena } = shouldUseAthena(query);
  
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
    shouldUseAthena: useAthena,
  };
}

/**
 * Format Athena response metrics for logging
 */
export function formatMetrics(result: OracleQueryResult): string {
  return `[Athena] provider=${result.provider} model=${result.model} ` +
    `latency=${result.latencyMs}ms cost=$${result.estimatedCost.toFixed(6)} ` +
    `type=${result.classification?.type || 'unknown'}`;
}
