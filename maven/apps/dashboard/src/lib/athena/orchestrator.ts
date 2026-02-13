/**
 * Athena Orchestrator
 * 
 * THE BRAIN - Coordinates multiple AI providers into unified intelligence.
 * 
 * ARCHITECTURE (Founder Feedback Feb 2026):
 * 
 * Flow: hypothesis → evidence gathering → adjudication
 * 
 * 1. CORE THINKING ENGINE (always runs):
 *    - MiniMax: Speed for simple queries
 *    - DeepSeek R1: Reasoning with visible trace
 *    - Claude: Synthesis and fallback
 * 
 * 2. SIGNAL AUGMENTATION BUS (parallel, never routes):
 *    - Vanta: Trading signals (Sharpe, Omega, momentum)
 *    - xAI: Twitter/X sentiment
 *    - Desearch: Reddit/Google sentiment
 *    - MANTIS: Multi-asset forecasts
 *    - These MODIFY CONFIDENCE, not routing
 * 
 * 3. CONDITIONAL MODULES (when needed):
 *    - Perplexity: Research with citations
 *    - Numinous: Event forecasting
 *    - Gopher: Real-time data
 * 
 * 4. FORECASTING MODIFIERS:
 *    - Precog: BTC forecasting - adjusts confidence only
 */

import { classifyQuery, routeQuery, extractTickers } from './router';
import { chutesQuery, isChutesConfigured, CHUTES_MODELS } from './providers/chutes';
import { groqQuery, groqClassify, isGroqConfigured, GROQ_MODELS } from './providers/groq';
import { minimaxQuery, isMiniMaxConfigured } from './providers/minimax';
import { deepseekCompletion, deepseekReasoning, deepseekOracleQuery, isDeepSeekConfigured } from './providers/deepseek';
import { getCombinedSentiment, isXAIConfigured } from './providers/xai';
import { getVantaConsensus, isVantaConfigured } from './providers/bittensor';
import { 
  perplexityResearch, 
  researchStock,
  isPerplexityConfigured,
  formatResearchForOracle,
  type PerplexityCitation 
} from './providers/perplexity';
import {
  claudeSynthesize,
  isClaudeConfigured,
  type ClaudeSynthesisInput,
} from './providers/claude';
import { synthesize, NormalizedSignal, normalizeSentiment, normalizeTradingSignal } from './synthesis';
import type { QueryClassification, RoutingDecision, RoutingPath, DataSourceId } from './types';
import { 
  quickOracleExchange,
  completeOracleExchange,
  getConversationContext,
  extractTopics,
  type OracleMessage,
} from './oracle-memory';

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
  
  // Include Perplexity research for research queries
  includeResearch: boolean;
  
  // Use Claude for final synthesis (THE MULTIPLIER)
  useClaudeSynthesis: boolean;
  
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
  
  // Claude's reasoning chain (from extended thinking)
  thinking?: string;
  
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
  // Architecture: Core + Signal Augmentation
  useGroqClassification: false,  // Disabled - using regex per new architecture
  
  // Signal augmentation bus (parallel, modifies confidence)
  includeSentiment: true,         // xAI + Desearch - signal augmentation
  includeTradingSignals: true,    // Vanta - signal augmentation
  
  // Conditional modules (only when needed)
  includeResearch: true,          // Perplexity - conditional
  
  // Core thinking engine (always runs)
  useClaudeSynthesis: true,       // Claude synthesizes all sources
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
  // STEP 4: PARALLEL FETCH
  // 
  // ARCHITECTURE: Core + Signal Augmentation
  // - CORE SOURCES: Run first (MiniMax, DeepSeek R1, Claude)
  // - SIGNAL AUGMENTATION: Run in parallel (Vanta, xAI, Desearch, MANTIS)
  //   These MODIFY CONFIDENCE, not routing
  // - CONDITIONAL SOURCES: Only when path requires it (Perplexity for research)
  // -------------------------------------------------------------------------
  const fetchPromises: Promise<void>[] = [];
  
  // Log routing decision for debugging
  console.log(`[Athena] Routing: ${routing.primaryPath}`);
  console.log(`[Athena] Core: ${routing.coreSources?.join(', ') || 'none'}`);
  console.log(`[Athena] Signal Augmentation: ${routing.signalAugmentation?.join(', ') || 'none'}`);
  console.log(`[Athena] Conditional: ${routing.conditionalSources?.join(', ') || 'none'}`);
  
  // 4a. CORE THINKING ENGINE (always runs)
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
  
  // -------------------------------------------------------------------------
  // 4b. SIGNAL AUGMENTATION BUS (parallel, modifies confidence)
  // These providers run in parallel with core, but MODIFY CONFIDENCE not routing
  // -------------------------------------------------------------------------
  
  // 4b(i). Social Sentiment (xAI + Desearch)
  let sentimentData: Map<string, any> = new Map();
  let sentimentLatency = 0;

  const shouldFetchSentiment = 
    config.includeSentiment && 
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
  
  // 4b(ii). Trading Signals (Vanta)
  // These are part of SIGNAL AUGMENTATION BUS - they modify confidence, not routing
  let tradingSignals: Map<string, any> = new Map();
  let signalsLatency = 0;
  
  const shouldFetchSignals = 
    config.includeTradingSignals &&
    relevantSymbols.length > 0 &&
    ['trading_decision', 'portfolio_analysis'].includes(classification.type);
  
  if (shouldFetchSignals) {
    const signalsPromise = (async () => {
      const sigStart = Date.now();
      try {
        const results = await getVantaConsensus(relevantSymbols);
        
        Object.entries(results).forEach(([symbol, signal]) => {
          if (symbol && signal) {
            tradingSignals.set(symbol, signal);
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
  
  // 4d. Perplexity Research (for any non-trivial financial query)
  let researchData: { content: string; citations: PerplexityCitation[] } | null = null;
  let researchLatency = 0;
  
  const shouldFetchResearch = config.includeResearch &&
    isPerplexityConfigured() &&
    ['research', 'trading_decision', 'portfolio_analysis'].includes(classification.type) &&
    classification.complexity !== 'low';
  
  if (shouldFetchResearch) {
    const researchPromise = (async () => {
      const researchStart = Date.now();
      try {
        // If we have symbols, use the specialized researchStock function
        // which builds better queries like "comprehensive update on CIFR stock..."
        if (relevantSymbols.length > 0) {
          // Research the primary symbol with stock-specific context
          const primarySymbol = relevantSymbols[0];
          const stockResearch = await researchStock(primarySymbol, {
            focus: 'general',
            recency: 'week',
          });
          researchData = {
            content: stockResearch.summary,
            citations: stockResearch.citations,
          };
          console.log(`[Athena] Perplexity researched ${primarySymbol}: ${stockResearch.sentiment}, ${stockResearch.keyPoints.length} key points`);
        } else {
          // Generic research for non-symbol queries
          const result = await perplexityResearch(input.query, {
            recency: 'week',
          });
          researchData = {
            content: result.content,
            citations: result.citations,
          };
        }
        researchLatency = Date.now() - researchStart;
        providerResults.push({
          providerId: 'perplexity' as DataSourceId,
          success: true,
          data: { citationCount: researchData.citations.length },
          latencyMs: researchLatency,
        });
      } catch (e: any) {
        providerResults.push({
          providerId: 'perplexity' as DataSourceId,
          success: false,
          error: e.message,
          latencyMs: Date.now() - researchStart,
        });
      }
    })();
    fetchPromises.push(researchPromise);
  }
  
  // 4e. FMP Analyst Data (ratings, price targets, earnings)
  // CRITICAL: ALWAYS fetch real market data when symbols are detected
  // LLMs hallucinate stale prices - we must ground them with real data
  let analystData: Map<string, any> = new Map();
  let analystLatency = 0;
  
  // ALWAYS fetch FMP data for any query with symbols - no exceptions
  const shouldFetchAnalyst = relevantSymbols.length > 0;
  
  if (shouldFetchAnalyst) {
    const analystPromise = (async () => {
      const analystStart = Date.now();
      try {
        // Fetch from our stock-research API which has FMP data
        const results = await Promise.allSettled(
          relevantSymbols.slice(0, 3).map(async (symbol) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://mavenwealth.ai'}/api/stock-research?symbol=${symbol}&sentiment=false`);
            if (res.ok) return res.json();
            return null;
          })
        );
        
        results.forEach((result, i) => {
          if (result.status === 'fulfilled' && result.value) {
            analystData.set(relevantSymbols[i], {
              // Company profile (so Claude knows what the ticker actually is)
              name: result.value.name,
              description: result.value.description,
              sector: result.value.sector,
              industry: result.value.industry,
              // Current price data
              currentPrice: result.value.currentPrice,
              previousClose: result.value.previousClose,
              changePercent: result.value.changePercent,
              fiftyTwoWeekHigh: result.value.fiftyTwoWeekHigh,
              fiftyTwoWeekLow: result.value.fiftyTwoWeekLow,
              marketCap: result.value.marketCap,
              // Analyst data
              analystRating: result.value.analystRating,
              targetMean: result.value.targetMean,
              targetHigh: result.value.targetHigh,
              targetLow: result.value.targetLow,
              currentToTarget: result.value.currentToTarget,
              numberOfAnalysts: result.value.numberOfAnalysts,
              earningsDate: result.value.earningsDate,
              peRatio: result.value.peRatio,
              // Maven score
              mavenScore: result.value.mavenScore,
              scoreBreakdown: result.value.scoreBreakdown,
            });
          }
        });
        
        analystLatency = Date.now() - analystStart;
        if (analystData.size > 0) {
          providerResults.push({
            providerId: 'claude' as DataSourceId, // Using claude as placeholder for FMP
            success: true,
            data: { symbols: [...analystData.keys()], source: 'fmp' },
            latencyMs: analystLatency,
          });
        }
      } catch (e: any) {
        console.error('Analyst data fetch error:', e);
      }
    })();
    fetchPromises.push(analystPromise);
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
  // STEP 6: CLAUDE SYNTHESIS (the multiplier)
  // -------------------------------------------------------------------------
  let finalResponse = llmResponse;
  let finalThinking: string | undefined;
  let claudeLatency = 0;
  
  // Determine if we should use Claude to synthesize
  // CRITICAL: If we have ANY real market data, we MUST use Claude to ensure
  // the response uses real prices, not hallucinated LLM training data
  const hasRealMarketData = analystData.size > 0;
  const hasMultipleSources = (
    (sentimentData.size > 0 ? 1 : 0) +
    (tradingSignals.size > 0 ? 1 : 0) +
    (researchData ? 1 : 0) +
    (analystData.size > 0 ? 1 : 0)
  ) >= 1;
  
  // Always use Claude when we have market data - prevents price hallucinations
  const shouldUseClaude = config.useClaudeSynthesis &&
    isClaudeConfigured() &&
    (hasMultipleSources || hasRealMarketData);
  
  if (shouldUseClaude) {
    try {
      const claudeStart = Date.now();
      
      // Build synthesis input
      const synthesisInput: ClaudeSynthesisInput = {
        query: input.query,
        initialResponse: llmResponse,
        sources: [],
        context: input.context,
      };
      
      // Add research if available
      if (researchData) {
        synthesisInput.research = researchData;
      }
      
      // Add sentiment if available
      if (sentimentData.size > 0) {
        synthesisInput.sentiment = Array.from(sentimentData.entries()).map(([symbol, data]) => ({
          symbol,
          direction: data.combined?.sentiment || 'neutral',
          score: data.combined?.score || 0,
          confidence: data.combined?.confidence || 0.5,
          summary: data.combined?.summary || '',
        }));
      }
      
      // Add trading signals if available
      if (tradingSignals.size > 0) {
        synthesisInput.tradingSignals = Array.from(tradingSignals.entries()).map(([symbol, data]) => ({
          symbol,
          direction: data.direction || 'FLAT',
          confidence: data.confidence || 0.5,
        }));
      }
      
      // Add analyst data if available - CRITICAL: include current prices
      if (analystData.size > 0) {
        synthesisInput.analystData = Array.from(analystData.entries()).map(([symbol, data]) => ({
          symbol,
          name: data.name,
          // CRITICAL: Real-time price data to prevent hallucinations
          currentPrice: data.currentPrice || 0,
          previousClose: data.previousClose,
          changePercent: data.changePercent,
          fiftyTwoWeekHigh: data.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: data.fiftyTwoWeekLow,
          marketCap: data.marketCap,
          // Analyst data
          analystRating: data.analystRating || 'hold',
          targetMean: data.targetMean || 0,
          targetHigh: data.targetHigh || 0,
          targetLow: data.targetLow || 0,
          currentToTarget: data.currentToTarget || 0,
          numberOfAnalysts: data.numberOfAnalysts || 0,
          earningsDate: data.earningsDate,
          peRatio: data.peRatio,
        }));
      }
      
      // Determine thinking budget based on complexity
      let thinkingBudget = 0;
      if (classification.complexity === 'medium') {
        thinkingBudget = 4000;
      } else if (classification.complexity === 'high') {
        thinkingBudget = 8000;
      }
      // Complex financial queries get max thinking
      const complexPatterns = /\b(roth\s+conversion|tax\s+strateg|estate\s+plan|backdoor|mega\s+backdoor|asset\s+location|withdrawal\s+strateg|social\s+security\s+claim|required\s+minimum|charitable\s+giving\s+strateg)\b/i;
      if (complexPatterns.test(input.query)) {
        thinkingBudget = 10000;
      }
      
      // Claude synthesizes everything
      const claudeResult = await claudeSynthesize(synthesisInput, { thinkingBudget });
      finalResponse = claudeResult.synthesis || claudeResult.content || '';
      finalThinking = claudeResult.thinking;
      claudeLatency = claudeResult.latencyMs || 0;
      
      providerResults.push({
        providerId: 'claude',
        success: true,
        data: { 
          usage: claudeResult.usage,
          synthesizedSources: [
            llmProvider,
            ...(researchData ? ['perplexity'] : []),
            ...(analystData.size > 0 ? ['fmp'] : []),
            ...(sentimentData.size > 0 ? ['xai'] : []),
            ...(tradingSignals.size > 0 ? ['vanta'] : []),
          ],
        },
        latencyMs: claudeLatency,
      });
      
      // Update provider info to show Claude as final synthesizer
      llmProvider = 'claude (synthesis)';
      llmModel = 'claude-sonnet-4';
      
    } catch (e: any) {
      console.error('Claude synthesis error, using original response:', e);
      providerResults.push({
        providerId: 'claude',
        success: false,
        error: e.message,
        latencyMs: Date.now(),
      });
      
      // Fall back to original response with signal summary
      if (synthesisResults && Object.keys(synthesisResults.consensus).length > 0) {
        const signalSummary = formatSignalSummary(synthesisResults);
        finalResponse = `${llmResponse}\n\n---\n\n**📊 Real-Time Signals:**\n${signalSummary}`;
      }
    }
  } else if (synthesisResults && Object.keys(synthesisResults.consensus).length > 0) {
    // No Claude synthesis, but we have signals - append summary
    const signalSummary = formatSignalSummary(synthesisResults);
    
    if (!finalResponse.toLowerCase().includes('sentiment') && 
        !finalResponse.toLowerCase().includes('signal')) {
      finalResponse = `${llmResponse}\n\n---\n\n**📊 Real-Time Signals:**\n${signalSummary}`;
    }
  }
  
  // -------------------------------------------------------------------------
  // RETURN RESULT
  // -------------------------------------------------------------------------
  const totalLatencyMs = Date.now() - startTime;
  
  const result: OrchestratorResult = {
    response: finalResponse,
    thinking: finalThinking,
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

  // -------------------------------------------------------------------------
  // SAVE TO MEMORY (async, non-blocking)
  // -------------------------------------------------------------------------
  // Only save if we have a userId and they're authenticated
  if (input.context?.clientId) {
    // Extract topics from the query
    const topics = extractTopics(input.query);

    // Save user message
    await completeOracleExchange(
      input.context.clientId,
      finalResponse,
      topics
    ).catch(() => {});
  }

  return result;
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
): Promise<{ response: string; provider: string; model: string; citations?: PerplexityCitation[] }> {
  
  // Speed path: Use MiniMax first (OpenClaw integration), then Groq
  if (path === 'speed' && isMiniMaxConfigured()) {
    const response = await minimaxQuery(query, systemPrompt);
    return { response, provider: 'minimax', model: 'MiniMax-M2.1' };
  }
  
  // Speed path fallback: Groq (sub-second)
  if (path === 'speed' && isGroqConfigured()) {
    const response = await groqQuery(query, {
      model: GROQ_MODELS.llama3_70b,
      systemPrompt,
      maxTokens: 2048,
    });
    return { response, provider: 'groq', model: GROQ_MODELS.llama3_70b };
  }
  
  // Reasoning path: Use DeepSeek R1 first (open-source reasoning at 2% of o1's cost)
  if (path === 'reasoning' && isDeepSeekConfigured()) {
    const result = await deepseekReasoning(query, systemPrompt);
    return { response: result.response, provider: 'deepseek', model: 'deepseek-reasoner' };
  }
  
  // Deep/Research path: Use Perplexity (real-time research with citations)
  if (path === 'deep' && isPerplexityConfigured()) {
    const result = await perplexityResearch(query, {
      systemPrompt,
      recency: 'week',
    });
    const response = formatResearchForOracle(result.content, result.citations);
    return { 
      response, 
      provider: 'perplexity', 
      model: 'sonar-pro',
      citations: result.citations,
    };
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
  
  // Deep fallback: Use Chutes reasoning model
  if (path === 'deep' && isChutesConfigured()) {
    const response = await chutesQuery(query, {
      model: CHUTES_MODELS.reasoning,
      systemPrompt,
      maxTokens: 4096,
    });
    return { response, provider: 'chutes', model: CHUTES_MODELS.reasoning };
  }
  
  // Reasoning fallback: Use Claude if DeepSeek not available
  if (path === 'reasoning' && isClaudeConfigured()) {
    const result = await claudeSynthesize({
      query,
      sources: [],
      context: {},
    }, {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
    });
    return { response: result.synthesis, provider: 'claude', model: 'claude-sonnet-4-20250514' };
  }
  
  // MiniMax fallback
  if (isMiniMaxConfigured()) {
    const response = await minimaxQuery(query, systemPrompt);
    return { response, provider: 'minimax', model: 'MiniMax-M2.1' };
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
  
  // Claude final fallback
  if (isClaudeConfigured()) {
    const result = await claudeSynthesize({
      query,
      sources: [],
      context: {},
    }, {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
    });
    return { response: result.synthesis, provider: 'claude', model: 'claude-sonnet-4-20250514' };
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
 * Default system prompt for Maven Oracle
 */
function getDefaultSystemPrompt(): string {
  return `You are Maven Oracle, a smart, friendly wealth assistant that feels like talking to a knowledgeable friend who's great with money.

🎯 YOUR PERSONALITY:
- Warm, approachable, and genuinely helpful
- Curious and interested in what the user wants to explore
- Direct when it matters, casual when it doesn't
- Confident but humble — it's okay to say "I don't know, but here's what I can find out"
- You have opinions when it makes sense, but you're here to help them think, not dictate

🔄 HOW YOU HANDLE CONVERSATIONS:
- You're conversational and adapt to whatever they're curious about
- If they want to research a random stock or ask a off-topic question — roll with it
- You reference your conversation history when relevant ("As we discussed earlier...")
- You learn from what they've shown interest in (e.g., "I remember you like crypto...")

💡 WHEN TALKING ABOUT MONEY:
- Be direct and actionable when they're asking for advice
- Consider tax implications without being preachy
- Acknowledge uncertainty when signals conflict
- Think holistically but don't lecture them about asset allocation unless asked
- If they're curious about something outside their portfolio — explore it with them

🌟 REMEMBER:
- You're not a compliance robot. You're a thinking partner.
- It's okay to be fun. Money doesn't have to be boring.
- Your job is to help them make better decisions AND feel good about the conversation.
- Every interaction makes you smarter about what they care about.

You're powered by Athena — a hybrid intelligence system that combines multiple AI models and real-time signals. Use whatever tools help you give the best answer.`;
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
    perplexity: boolean;
    claude: boolean;
    xai: boolean;
    vanta: boolean;
  };
} {
  return {
    ready: isOrchestratorReady(),
    providers: {
      groq: isGroqConfigured(),
      chutes: isChutesConfigured(),
      perplexity: isPerplexityConfigured(),
      claude: isClaudeConfigured(),
      xai: isXAIConfigured(),
      vanta: isVantaConfigured(),
    },
  };
}
