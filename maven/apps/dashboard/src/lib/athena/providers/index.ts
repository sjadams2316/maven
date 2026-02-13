/**
 * Athena Providers Index
 * All AI providers available to Athena
 */

// Chutes - Decentralized LLM inference via Bittensor
export {
  chutesCompletion,
  chutesQuery,
  chutesBatch,
  analyzePortfolioWithChutes,
  isChutesConfigured,
  CHUTES_DEFAULT_MODEL,
  CHUTES_MODELS,
  type ChutesMessage,
  type ChutesCompletionOptions,
  type ChutesResponse,
} from './chutes';

// Groq - Ultra-fast inference for real-time queries
export {
  groqCompletion,
  groqQuery,
  groqClassify,
  isGroqConfigured,
  GROQ_DEFAULT_MODEL,
  GROQ_MODELS,
  type GroqMessage,
  type GroqCompletionOptions,
  type GroqResponse,
} from './groq';

// MiniMax - Fast inference via OpenClaw for speed path queries
export {
  minimaxCompletion,
  minimaxQuery,
  minimaxOracleQuery,
  minimaxStream,
  isMiniMaxConfigured,
  getMiniMaxStatus,
  type MiniMaxMessage,
  type MiniMaxCompletionOptions,
  type MiniMaxResponse,
} from './minimax';

// xAI - First-party Twitter/X sentiment via Grok
export {
  xaiCompletion,
  searchXSentiment,
  batchXSentiment,
  getCombinedSentiment,
  isXAIConfigured,
  getXAIStatus,
  type XSearchResult,
  type XSentimentResult,
  type CombinedSentiment,
  type GrokMessage,
  type XAIResponse,
} from './xai';

// Perplexity - Real-time research with citations
export {
  perplexityCompletion,
  perplexityResearch,
  researchStock,
  researchMarket,
  isPerplexityConfigured,
  getPerplexityStatus,
  formatCitations,
  formatResearchForOracle,
  PERPLEXITY_MODELS,
  PERPLEXITY_DEFAULT_MODEL,
  type PerplexityMessage,
  type PerplexityCitation,
  type PerplexityResponse,
  type PerplexityCompletionOptions,
} from './perplexity';

// Claude - The synthesis brain (THE MULTIPLIER)
export {
  claudeCompletion,
  claudeSynthesize,
  claudeQuery,
  isClaudeConfigured,
  getClaudeStatus,
  CLAUDE_MODELS,
  CLAUDE_DEFAULT_MODEL,
  type ClaudeMessage,
  type ClaudeSynthesisInput,
  type ClaudeResponse,
} from './claude';

// Bittensor - Decentralized intelligence signals
export {
  // Availability
  isVantaConfigured,
  isDesearchConfigured,
  isPrecogConfigured,
  getBittensorStatus,
  // Vanta (SN8) - Trading signals
  fetchVantaSignals,
  getVantaConsensus,
  // Desearch (SN22) - Social sentiment
  fetchDesearchSentiment,
  getSentimentSummary,
  // Precog (SN55) - BTC forecasting
  fetchPrecogForecast,
  // Aggregated intelligence
  getMarketIntelligence,
  // Types
  type TradingSignal,
  type VantaResponse,
  type SentimentData,
  type DesearchResponse,
  type PrecogForecast,
  type MarketIntelligence,
  type SignalDirection,
} from './bittensor';

// Provider availability check
export function getAvailableProviders(): string[] {
  const providers: string[] = [];
  
  // Check MiniMax (speed - OpenClaw integration)
  if (process.env.MINIMAX_API_KEY) {
    providers.push('minimax');
  }
  
  // Check Groq (speed)
  if (process.env.GROQ_API_KEY) {
    providers.push('groq');
  }
  
  // Check Chutes (cost)
  if (process.env.CHUTES_API_KEY) {
    providers.push('chutes');
  }
  
  // Check Perplexity (research)
  if (process.env.PERPLEXITY_API_KEY) {
    providers.push('perplexity');
  }
  
  // Check Claude (synthesis brain)
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push('claude');
  }
  
  // Check xAI (Twitter sentiment)
  if (process.env.XAI_API_KEY) {
    providers.push('xai');
  }
  
  // Check Vanta (trading signals)
  if (process.env.VANTA_API_KEY) {
    providers.push('vanta');
  }
  
  return providers;
}
