/**
 * Athena - Maven's Hybrid Intelligence Layer
 * 
 * The brain that powers Maven. Routes queries to optimal AI sources,
 * synthesizes responses with weighted consensus, and learns over time.
 * 
 * Architecture:
 * Query → Classify → Route → Fetch (parallel) → Synthesize → Response
 * 
 * @see /maven/docs/ATHENA.md for full documentation
 */

// Types
export * from './types';

// Synthesis Engine
export { 
  synthesize, 
  synthesizeWithDegradation,
  type Signal,
  type SynthesisInput,
  type SynthesisOutput,
} from './synthesis';

// Router (will be added by spawned agent)
// export { classifyQuery, routeQuery } from './router';

// Mocks (will be added by spawned agent)
// export { generateMockSignal, generateSignalSet } from './mocks/mock-signals';

/**
 * Main Athena query function.
 * This is the primary entry point for processing queries through Athena.
 * 
 * @example
 * ```typescript
 * const result = await athenaQuery({
 *   query: "Should I sell my CIFR position?",
 *   clientContext: { riskTolerance: 'moderate', hasPosition: true }
 * });
 * 
 * console.log(result.recommendation); // "Hold with trailing stop"
 * console.log(result.confidence);     // 0.72
 * console.log(result.flags);          // ["MODERATE_DISAGREEMENT"]
 * ```
 */
export async function athenaQuery(params: {
  query: string;
  clientContext?: import('./types').ClientContext;
}): Promise<import('./synthesis').SynthesisOutput> {
  // TODO: Implement full pipeline once router and providers are ready
  // For now, return a placeholder that shows the structure
  
  const { query, clientContext } = params;
  
  // This will be replaced with actual implementation:
  // 1. const classification = await classifyQuery(query, clientContext);
  // 2. const routing = await routeQuery(classification);
  // 3. const [llmResponse, signals] = await Promise.all([
  //      fetchLLM(routing.primaryProvider, query),
  //      fetchSignals(routing.enrichmentSources, extractSymbol(query))
  //    ]);
  // 4. return synthesize({ query, queryType: classification.type, signals, llmResponse, clientContext });
  
  throw new Error('Athena not yet fully implemented. Use individual components for testing.');
}

/**
 * Athena health check.
 * Returns status of all data sources and overall system health.
 */
export async function athenaHealth(): Promise<import('./types').AthenaHealth> {
  // TODO: Implement health checks for all sources
  return {
    status: 'degraded',
    sources: [],
    cache: {
      type: 'memory',
      hitRate: 0,
      size: 0,
    },
    performance: {
      avgLatencyMs: 0,
      p95LatencyMs: 0,
      queriesPerMinute: 0,
      errorRate: 0,
    },
    alerts: ['Athena not yet fully implemented'],
  };
}

/**
 * Version info for debugging.
 */
export const ATHENA_VERSION = {
  version: '0.1.0',
  phase: 'Phase 1 - Foundation',
  features: [
    'Synthesis engine with weighted consensus',
    'Graceful degradation',
    'Audit trail generation',
    'Type definitions',
  ],
  pending: [
    'Router prototype',
    'Mock signal generator',
    'Live provider integration',
    'Bittensor subnet integration',
  ],
};
