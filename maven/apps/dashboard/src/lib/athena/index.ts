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
} from './providers';

// Oracle Bridge (A/B testing between Claude and Athena)
export {
  shouldUseAthena,
  athenaOracleQuery,
  getRoutingInfo,
  formatMetrics,
} from './oracle-bridge';
