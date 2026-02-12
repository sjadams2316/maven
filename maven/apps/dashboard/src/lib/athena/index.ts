/**
 * Athena - Maven's Hybrid Intelligence Layer
 * 
 * Routes queries to optimal AI models and Bittensor subnets,
 * then synthesizes them into confident answers.
 */

// Types
export type {
  QueryClassification,
  QueryType,
  Urgency,
  Complexity,
  DataSourceId,
  DataSourceConfig,
  ProviderCategory,
  RoutingDecision,
  RoutingPath,
  ClientContext,
  AthenaResponse,
  SourceContribution,
  QueryOutcome,
  SourceReputation,
} from './types';

// Router functions
export {
  classifyQuery,
  routeQuery,
  classifyAndRoute,
  quickClassify,
  extractTickers,
  enrichQuery,
} from './router';

// Configuration
export {
  DATA_SOURCES,
  QUERY_TYPE_SOURCES,
  ROUTING_PATHS,
  CLASSIFICATION_PATTERNS,
  SOURCE_WEIGHTS,
  ATHENA_CONFIG,
} from './config';

// Providers
export {
  // Chutes
  chutesCompletion,
  chutesQuery,
  chutesBatch,
  analyzePortfolioWithChutes,
  isChutesConfigured,
  CHUTES_DEFAULT_MODEL,
  CHUTES_MODELS,
  // Groq
  groqCompletion,
  groqQuery,
  groqClassify,
  isGroqConfigured,
  GROQ_DEFAULT_MODEL,
  GROQ_MODELS,
  // Utility
  getAvailableProviders,
  type ChutesMessage,
  type ChutesCompletionOptions,
  type ChutesResponse,
  type GroqMessage,
  type GroqCompletionOptions,
  type GroqResponse,
  // Bittensor
  isVantaConfigured,
  isDesearchConfigured,
  isPrecogConfigured,
  getBittensorStatus,
  fetchVantaSignals,
  getVantaConsensus,
  fetchDesearchSentiment,
  getSentimentSummary,
  fetchPrecogForecast,
  getMarketIntelligence,
  type TradingSignal,
  type VantaResponse,
  type SentimentData,
  type DesearchResponse,
  type PrecogForecast,
  type MarketIntelligence,
  type SignalDirection,
} from './providers';

// Oracle Bridge (A/B testing between Claude and Athena)
export {
  shouldUseAthena,
  athenaOracleQuery,
  getRoutingInfo,
  formatMetrics,
} from './oracle-bridge';

// Scheduler (autonomous task execution)
export {
  executeTask,
  formatTaskSummary,
  parseActionItems,
  queueTask,
  getTaskResult,
  processNextTask,
  getQueueStatus,
  TASK_TEMPLATES,
  type ScheduledTask,
  type TaskResult,
  type TaskSummary,
  type ActionItem,
  type TaskType,
  type TaskPriority,
  type TaskStatus,
} from './scheduler';

// Intelligence Layer (unified enrichment for all surfaces)
export {
  // Symbol detection
  extractSymbols,
  isSentimentQuery,
  isTradingQuery,
  // Query enrichment
  enrichWithIntelligence,
  formatIntelligenceForPrompt,
  // Quick lookups for UI
  getQuickSentiment,
  getBatchSentiment,
  // Portfolio analysis
  analyzePortfolioSentiment,
  // Types
  type IntelligenceContext,
  type QuickSentiment,
  type PortfolioSentimentSummary,
} from './intelligence';

// xAI Provider (Twitter sentiment)
export {
  searchXSentiment,
  getCombinedSentiment,
  isXAIConfigured,
  type XSentimentResult,
  type CombinedSentiment,
} from './providers/xai';

// Synthesis Engine (signal combination)
export {
  // Core synthesis
  synthesize,
  synthesizeSymbol,
  synthesizeBatch,
  // Normalization helpers
  normalizeSentiment,
  normalizeTradingSignal,
  normalizeForecast,
  // Display formatting
  formatSynthesisForDisplay,
  // Types
  type NormalizedSignal,
  type SynthesisInput,
  type SynthesisResult,
} from './synthesis';

// Orchestrator (THE BRAIN - coordinates all providers)
export {
  orchestrate,
  quickOrchestrate,
  isOrchestratorReady,
  getOrchestratorStatus,
  // Types
  type OrchestratorConfig,
  type OrchestratorInput,
  type OrchestratorResult,
  type ProviderResult,
} from './orchestrator';
