/**
 * Athena Orchestrator
 * 
 * THE BRAIN - Coordinates multiple AI providers into unified intelligence.
 * 
 * Flow:
 * 1. Query arrives
 * 2. Groq classifies instantly (~10ms)
 * 3. Router determines which providers to call
 * 4. Parallel fetch from: LLM (Groq/Chutes/Claude) + Signals (Vanta) + Sentiment (xAI)
 * 5. Synthesis engine combines all sources
 * 6. Return unified, intelligent response
 * 
 * This is what makes Athena a hybrid intelligence layer, not just an LLM wrapper.
 */

import { classifyQuery, routeQuery, extractTickers } from './router';
import { chutesQuery, isChutesConfigured, CHUTES_MODELS } from './providers/chutes';
import { groqQuery, groqClassify, isGroqConfigured, GROQ_MODELS } from './providers/groq';
import { getCombinedSentiment, isXAIConfigured } from './providers/xai';
import { getVantaConsensus, isVantaConfigured } from './providers/bittensor';
import { synthesize, NormalizedSignal, normalizeSentiment, normalizeTradingSignal } from './synthesis';
import type { QueryClassification, RoutingDecision, RoutingPath, DataSourceId } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface OrchestratorConfig {
  // Use Groq for classification (faster) vs regex (cheaper)
  useGroqClassification: boolean;
  
  // Include sentiment enrichment for relevant queries
  includeSentiment: boolean;
  
  // Include trading signals from Vanta
  includeTradingSignals: boolean;
  
  // Maximum parallel fetches
  maxParallelFetches: number;
  
  // Timeout for each provider (ms)
  providerTimeoutMs: number;
  
  // Fall back to Claude for complex queries
  claudeFallbackEnabled: boolean;
}

export interface OrchestratorInput {
  query: string;
  systemPrompt?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: {
    holdings?: string[];
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    clientId?: string;
  };
  config?: Partial<OrchestratorConfig>;
}

export interface ProviderResult {
  providerId: DataSourceId | 'claude';
  success: boolean;
  data?: any;
  error?: string;
  latencyMs: number;
}

export interface OrchestratorResult {
  // The final response
  response: string;
  
  // What providers contributed
  providers: {
    llm: { provider: string; model: string; latencyMs: number };
    sentiment?: { symbols: string[]; latencyMs: number };
    signals?: { symbols: string[]; latencyMs: number };
  };
  
  // Classification & routing info
  classification: QueryClassification;
  routing: RoutingDecision;
  
  // Synthesis results (if signals were involved)
  synthesis?: {
    symbols: string[];
    consensus: Record<string, { direction: string; score: number; confidence: number }>;
  };
  
  // Metrics
  totalLatencyMs: number;
  estimatedCostUsd: number;
  
  // Debug info
  debug?: {
    providerResults: ProviderResult[];
    classificationMethod: 'groq' | 'regex';
  };
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: OrchestratorConfig = {
  useGroqClassification: true,  // Use Groq for fast classification
  includeSentiment: true,        // Enrich with sentiment when relevant
  includeTradingSignals: true,   // Include Vanta trading signals
  maxParallelFetches: 5,
  providerTimeoutMs: 10000,
  claudeFallbackEnabled: true,
};

// ============================================================================
// ORCHESTRATOR
// ============================================================================

/**
 * Main orchestration function - the brain of Athena
 */
export async function orchestrate(input: OrchestratorInput): Promise<OrchestratorResult> {
  const startTime = Date.now();
  const config = { ...DEFAULT_CONFIG, ...input.config };
  const providerResults: ProviderResult[] = [];
  
  // -------------------------------------------------------------------------
  // STEP 1: CLASSIFY (Groq or regex)
  // -------------------------------------------------------------------------
  let classification: QueryClassification;
  let classificationMethod: 'groq' | 'regex' = 'regex';
  
  if (config.useGroqClassification && isGroqConfigured()) {
    try {
      const classStart = Date.now();
      classification = await groqClassify(input.query, input.context?.holdings);
      classificationMethod = 'groq';
      providerResults.push({
        providerId: 'groq',
        success: true,
        data: { type: 'classification', result: classification },
        latencyMs: Date.now() - classStart,
      });
    } catch (e) {
      console.warn('Groq classification failed, falling back to regex:', e);
      classification = await classifyQuery(input.query, { holdings: input.context?.holdings });
    }
  } else {
    classification = await classifyQuery(input.query, { holdings: input.context?.holdings });
  }
  
  // -------------------------------------------------------------------------
  // STEP 2: ROUTE
  // -------------------------------------------------------------------------
  const routing = await routeQuery(classification);
  
  // -------------------------------------------------------------------------
  // STEP 3: EXTRACT SYMBOLS (for sentiment/signals)
  // -------------------------------------------------------------------------
  const mentionedSymbols = extractTickers(input.query);
  const relevantSymbols = [
    ...mentionedSymbols,
    ...(input.context?.holdings?.filter(h => 
      input.query.toLowerCase().includes(h.toLowerCase())
    ) || []),
  ].slice(0, 5); // Limit to 5 symbols
  
  // -------------------------------------------------------------------------
  // STEP 4: PARALLEL FETCH (LLM + Sentiment + Signals)
  // -------------------------------------------------------------------------
  const fetchPromises: Promise<void>[] = [];
  
  // 4a. LLM Response
  let llmResponse: string = '';
  let llmProvider: string = '';
  let llmModel: string = '';
  let llmLatency: number = 0;
  
  const llmPromise = (async () => {
    const llmStart = Date.now();
    try {
      const { response, provider, model } = await fetchLLMResponse(
        input.query,
        input.systemPrompt || getDefaultSystemPrompt(),
        routing.primaryPath,
        input.history,
        config
      );
      llmResponse = response;
      llmProvider = provider;
      llmModel = model;
      llmLatency = Date.now() - llmStart;
      
      providerResults.push({
        providerId: provider as DataSourceId,
        success: true,
        data: { responseLength: response.length },
        latencyMs: llmLatency,
      });
    } catch (e: any) {
      providerResults.push({
        providerId: 'chutes',
        success: false,
        error: e.message,
        latencyMs: Date.now() - llmStart,
      });
      throw e;
    }
  })();
  fetchPromises.push(llmPromise);
  
  // 4b. Sentiment (if relevant and symbols found)
  let sentimentData: Map<string, any> = new Map();
  let sentimentLatency = 0;
  
  const shouldFetchSentiment = config.includeSentiment && 
    isXAIConfigured() && 
    relevantSymbols.length > 0 &&
    ['trading_decision', 'portfolio_analysis', 'research'].includes(classification.type);
  
  if (shouldFetchSentiment) {
    const sentimentPromise = (async () => {
      const sentStart = Date.now();
      try {
        const results = await Promise.allSettled(
          relevantSymbols.map(s => getCombinedSentiment(s))
        );
        
        results.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            sentimentData.set(relevantSymbols[i], result.value);
          }
        });
        
        sentimentLatency = Date.now() - sentStart;
        providerResults.push({
          providerId: 'xai',
          success: true,
          data: { symbols: relevantSymbols, count: sentimentData.size },
          latencyMs: sentimentLatency,
        });
      } catch (e: any) {
        providerResults.push({
          providerId: 'xai',
          success: false,
          error: e.message,
          latencyMs: Date.now() - sentStart,
        });
      }
    })();
    fetchPromises.push(sentimentPromise);
  }
  
  // 4c. Trading Signals from Vanta (if relevant)
  let tradingSignals: Map<string, any> = new Map();
  let signalsLatency = 0;
  
  const shouldFetchSignals = config.includeTradingSignals &&
    isVantaConfigured() &&
    relevantSymbols.length > 0 &&
    ['trading_decision', 'portfolio_analysis'].includes(classification.type);
  
  if (shouldFetchSignals) {
    const signalsPromise = (async () => {
      const sigStart = Date.now();
      try {
        const results = await Promise.allSettled(
          relevantSymbols.map(s => getVantaConsensus(s))
        );
        
        results.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            tradingSignals.set(relevantSymbols[i], result.value);
          }
        });
        
        signalsLatency = Date.now() - sigStart;
        providerResults.push({
          providerId: 'vanta',
          success: true,
          data: { symbols: relevantSymbols, count: tradingSignals.size },
          latencyMs: signalsLatency,
        });
      } catch (e: any) {
        providerResults.push({
          providerId: 'vanta',
          success: false,
          error: e.message,
          latencyMs: Date.now() - sigStart,
        });
      }
    })();
    fetchPromises.push(signalsPromise);
  }
  
  // Wait for all fetches
  await Promise.allSettled(fetchPromises);
  
  // -------------------------------------------------------------------------
  // STEP 5: SYNTHESIZE (if we have signals)
  // -------------------------------------------------------------------------
  let synthesisResults: OrchestratorResult['synthesis'];
  
  if (sentimentData.size > 0 || tradingSignals.size > 0) {
    const consensus: Record<string, { direction: string; score: number; confidence: number }> = {};
    
    for (const symbol of relevantSymbols) {
      const signals: NormalizedSignal[] = [];
      const timestamp = new Date().toISOString();
      
      // Add sentiment signal
      const sentiment = sentimentData.get(symbol);
      if (sentiment?.combined) {
        signals.push({
          sourceId: 'xai',
          sourceName: 'Twitter (xAI)',
          sourceCategory: 'sentiment',
          value: normalizeSentiment(
            sentiment.combined.sentiment,
            sentiment.combined.score,
            sentiment.combined.confidence
          ),
          confidence: sentiment.combined.confidence,
          timestamp,
        });
      }
      
      // Add trading signal
      const trading = tradingSignals.get(symbol);
      if (trading) {
        signals.push({
          sourceId: 'vanta',
          sourceName: 'Vanta Trading',
          sourceCategory: 'trading',
          value: normalizeTradingSignal(trading.direction, trading.confidence),
          confidence: trading.confidence,
          timestamp,
        });
      }
      
      // Synthesize if we have signals
      if (signals.length > 0) {
        const result = synthesize({ symbol, signals });
        consensus[symbol] = {
          direction: result.direction,
          score: result.score,
          confidence: result.confidence,
        };
      }
    }
    
    if (Object.keys(consensus).length > 0) {
      synthesisResults = {
        symbols: Object.keys(consensus),
        consensus,
      };
    }
  }
  
  // -------------------------------------------------------------------------
  // STEP 6: ENRICH RESPONSE (inject synthesis into response if relevant)
  // -------------------------------------------------------------------------
  let finalResponse = llmResponse;
  
  if (synthesisResults && Object.keys(synthesisResults.consensus).length > 0) {
    // Add synthesis summary to response
    const signalSummary = formatSignalSummary(synthesisResults);
    
    // Append to response if it doesn't already contain signal info
    if (!finalResponse.toLowerCase().includes('sentiment') && 
        !finalResponse.toLowerCase().includes('signal')) {
      finalResponse = `${llmResponse}\n\n---\n\n**📊 Real-Time Signals:**\n${signalSummary}`;
    }
  }
  
  // -------------------------------------------------------------------------
  // RETURN RESULT
  // -------------------------------------------------------------------------
  const totalLatencyMs = Date.now() - startTime;
  
  return {
    response: finalResponse,
    providers: {
      llm: { provider: llmProvider, model: llmModel, latencyMs: llmLatency },
      ...(sentimentData.size > 0 && { sentiment: { symbols: [...sentimentData.keys()], latencyMs: sentimentLatency } }),
      ...(tradingSignals.size > 0 && { signals: { symbols: [...tradingSignals.keys()], latencyMs: signalsLatency } }),
    },
    classification,
    routing,
    synthesis: synthesisResults,
    totalLatencyMs,
    estimatedCostUsd: routing.estimatedCostUsd,
    debug: {
      providerResults,
      classificationMethod,
    },
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Fetch LLM response from appropriate provider based on routing path
 */
async function fetchLLMResponse(
  query: string,
  systemPrompt: string,
  path: RoutingPath,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>,
  config?: OrchestratorConfig
): Promise<{ response: string; provider: string; model: string }> {
  
  // Speed path: Use Groq (sub-second)
  if (path === 'speed' && isGroqConfigured()) {
    const response = await groqQuery(query, {
      model: GROQ_MODELS.llama3_70b,
      systemPrompt,
      maxTokens: 2048,
    });
    return { response, provider: 'groq', model: GROQ_MODELS.llama3_70b };
  }
  
  // Cost path: Use Chutes (95% cheaper)
  if ((path === 'cost' || path === 'speed') && isChutesConfigured()) {
    const model = path === 'speed' ? CHUTES_MODELS.cheap : CHUTES_MODELS.balanced;
    const response = await chutesQuery(query, {
      model,
      systemPrompt,
      maxTokens: 2048,
    });
    return { response, provider: 'chutes', model };
  }
  
  // Deep path: Use Chutes reasoning model (or Claude as fallback)
  if (path === 'deep' && isChutesConfigured()) {
    const response = await chutesQuery(query, {
      model: CHUTES_MODELS.reasoning,
      systemPrompt,
      maxTokens: 4096,
    });
    return { response, provider: 'chutes', model: CHUTES_MODELS.reasoning };
  }
  
  // Groq fallback
  if (isGroqConfigured()) {
    const response = await groqQuery(query, {
      model: GROQ_MODELS.llama3_70b,
      systemPrompt,
      maxTokens: 2048,
    });
    return { response, provider: 'groq', model: GROQ_MODELS.llama3_70b };
  }
  
  // Chutes fallback
  if (isChutesConfigured()) {
    const response = await chutesQuery(query, {
      model: CHUTES_MODELS.balanced,
      systemPrompt,
      maxTokens: 2048,
    });
    return { response, provider: 'chutes', model: CHUTES_MODELS.balanced };
  }
  
  throw new Error('No LLM providers available');
}

/**
 * Format signal summary for response enrichment
 */
function formatSignalSummary(synthesis: OrchestratorResult['synthesis']): string {
  if (!synthesis) return '';
  
  const lines: string[] = [];
  
  for (const [symbol, data] of Object.entries(synthesis.consensus)) {
    const emoji = data.direction === 'bullish' ? '🟢' : data.direction === 'bearish' ? '🔴' : '⚪';
    const confidence = Math.round(data.confidence * 100);
    lines.push(`${emoji} **${symbol}**: ${data.direction} (${confidence}% confidence)`);
  }
  
  return lines.join('\n');
}

/**
 * Default system prompt for Athena
 */
function getDefaultSystemPrompt(): string {
  return `You are Maven Oracle, an AI wealth advisor powered by Athena's hybrid intelligence layer.
  
You have access to real-time market signals and sentiment data. When relevant signals are available, they will be synthesized into your response.

Guidelines:
- Be direct and actionable
- Reference specific data when available
- Acknowledge uncertainty when signals conflict
- Always consider tax implications
- Think holistically about the client's portfolio

Remember: You're here to help people make better financial decisions.`;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick orchestration for simple queries (no signals)
 */
export async function quickOrchestrate(
  query: string,
  systemPrompt?: string
): Promise<{ response: string; provider: string; latencyMs: number }> {
  const result = await orchestrate({
    query,
    systemPrompt,
    config: {
      includeSentiment: false,
      includeTradingSignals: false,
    },
  });
  
  return {
    response: result.response,
    provider: result.providers.llm.provider,
    latencyMs: result.totalLatencyMs,
  };
}

/**
 * Check if orchestrator is ready (has at least one LLM provider)
 */
export function isOrchestratorReady(): boolean {
  return isGroqConfigured() || isChutesConfigured();
}

/**
 * Get orchestrator status
 */
export function getOrchestratorStatus(): {
  ready: boolean;
  providers: {
    groq: boolean;
    chutes: boolean;
    xai: boolean;
    vanta: boolean;
  };
} {
  return {
    ready: isOrchestratorReady(),
    providers: {
      groq: isGroqConfigured(),
      chutes: isChutesConfigured(),
      xai: isXAIConfigured(),
      vanta: isVantaConfigured(),
    },
  };
}
