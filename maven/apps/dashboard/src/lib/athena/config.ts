/**
 * Athena Configuration
 * Provider settings, weights, and routing rules
 * 
 * ARCHITECTURE (Founder Feedback Feb 2026):
 * - CORE THINKING ENGINE (always active): MiniMax, DeepSeek R1, Claude
 * - SIGNAL AUGMENTATION BUS (never routes): Vanta, MANTIS, BitQuant, xAI, Desearch
 * - CONDITIONAL MODULES (on-demand): Perplexity, Numinous, Gopher
 * - FORECASTING: Precog = confidence modifier only, NOT a route
 * 
 * Flow: hypothesis → evidence gathering → adjudication
 */

import type { DataSourceConfig, DataSourceId, QueryType, RoutingPath } from './types';

// =============================================================================
// ARCHITECTURE: CORE vs CONDITIONAL
// =============================================================================

/**
 * CORE THINKING ENGINE - Always active for every query
 * These providers form the base intelligence layer
 */
export const CORE_PROVIDERS: DataSourceId[] = [
  'minimax',   // Speed - fast responses for simple queries
  'deepseek',  // Reasoning - complex analysis with visible trace
  'claude',    // Synthesis - fallback and final response generation
];

/**
 * SIGNAL AUGMENTATION BUS - Augments confidence, never routes
 * These providers modify confidence scores, not routing decisions
 */
export const SIGNAL_AUGMENTATION: DataSourceId[] = [
  'vanta',     // Trading signals (Sharpe, Omega, momentum)
  'mantis',    // Multi-asset forecasting
  'bitquant',  // DeFi analysis
  'xai',       // Twitter/X sentiment (Grok)
  'desearch',  // Reddit/Google sentiment
];

/**
 * CONDITIONAL MODULES - Activated only when needed
 */
export const CONDITIONAL_MODULES: DataSourceId[] = [
  'perplexity', // Research - deep web search with citations
  'numinous',  // Event forecasting - macro events
  'gopher',    // Real-time data - news, filings
];

/**
 * FORECASTING MODIFIERS - Confidence modifiers only
 * These adjust confidence scores but don't drive routing
 */
export const FORECASTING_MODIFIERS: DataSourceId[] = [
  'precog',    // BTC forecasting - modifies confidence only
];

// =============================================================================
// Data Source Configurations
// =============================================================================

export const DATA_SOURCES: Record<DataSourceId, DataSourceConfig> = {
  // Centralized Providers (Speed + Reasoning)
  groq: {
    id: 'groq',
    name: 'Groq',
    category: 'centralized',
    description: 'Ultra-fast inference for real-time chat and classification',
    capabilities: ['chat', 'classification', 'summarization', 'fast-reasoning'],
    latencyMs: { min: 10, max: 100, typical: 30 },
    costPer1MTokens: { min: 0.05, max: 0.3 },
    reliability: 0.99,
    enabled: true,
  },
  minimax: {
    id: 'minimax',
    name: 'MiniMax',
    category: 'centralized',
    description: 'Fast efficient inference via OpenClaw - speed path for simple queries',
    capabilities: ['chat', 'classification', 'simple-responses', 'fast-reasoning'],
    latencyMs: { min: 15, max: 150, typical: 50 },
    costPer1MTokens: { min: 0.02, max: 0.15 },
    reliability: 0.98,
    enabled: true,
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek R1',
    category: 'centralized',
    description: 'Open-source reasoning model matching OpenAI o1 at 2% of cost',
    capabilities: ['complex-reasoning', 'trading-decisions', 'multi-step-analysis', 'reasoning-trace'],
    latencyMs: { min: 2000, max: 8000, typical: 4000 },
    costPer1MTokens: { min: 0.5, max: 2 },
    reliability: 0.95,
    enabled: true,
  },
  qwen: {
    id: 'qwen',
    name: 'Qwen3',
    category: 'centralized',
    description: 'Open-source reasoning + agentic workflows from Alibaba at 1/10th Claude cost',
    capabilities: ['complex-reasoning', 'agentic-workflows', 'multi-step-tasks', 'cost-effective'],
    latencyMs: { min: 1000, max: 5000, typical: 2500 },
    costPer1MTokens: { min: 0.1, max: 0.5 },
    reliability: 0.92,
    enabled: true,
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    category: 'centralized',
    description: 'Complex reasoning and multi-step analysis',
    capabilities: ['complex-reasoning', 'nuanced-decisions', 'long-context', 'synthesis'],
    latencyMs: { min: 500, max: 5000, typical: 2000 },
    costPer1MTokens: { min: 3, max: 15 },
    reliability: 0.99,
    enabled: true,
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    category: 'centralized',
    description: 'Research with citations and deep web search',
    capabilities: ['research', 'citations', 'web-search', 'fact-checking'],
    latencyMs: { min: 2000, max: 10000, typical: 5000 },
    costPer1MTokens: { min: 3, max: 15 },
    reliability: 0.97,
    enabled: true,
  },
  xai: {
    id: 'xai',
    name: 'xAI (Grok)',
    category: 'centralized',
    description: 'First-party Twitter/X sentiment analysis via Grok',
    capabilities: ['twitter-sentiment', 'social-analysis', 'influencer-tracking', 'real-time'],
    latencyMs: { min: 500, max: 3000, typical: 1500 },
    costPer1MTokens: { min: 0.3, max: 3 },
    reliability: 0.95,
    enabled: true,
  },

  // Decentralized Bittensor Providers (Signals + Cost)
  chutes: {
    id: 'chutes',
    name: 'Chutes',
    category: 'decentralized',
    subnet: 64,
    description: 'Cheap bulk inference via Bittensor',
    capabilities: ['bulk-inference', 'portfolio-analysis', 'cost-effective'],
    latencyMs: { min: 500, max: 3000, typical: 1500 },
    costPer1MTokens: { min: 0.15, max: 1 },
    reliability: 0.95,
    enabled: true,
  },
  vanta: {
    id: 'vanta',
    name: 'Vanta (Taoshi)',
    category: 'decentralized',
    subnet: 8,
    description: 'Proprietary trading signals - Sharpe, Omega, momentum',
    capabilities: ['trading-signals', 'momentum', 'sharpe-ratio', 'omega-ratio'],
    latencyMs: { min: 200, max: 2000, typical: 800 },
    costPer1MTokens: { min: 0.5, max: 2 },
    reliability: 0.92,
    enabled: true,
  },
  precog: {
    id: 'precog',
    name: 'Precog',
    category: 'decentralized',
    subnet: 55,
    description: 'BTC price forecasting - confidence modifier only, NOT a route',
    capabilities: ['btc-forecast', 'short-term-prediction', 'crypto-signals'],
    latencyMs: { min: 100, max: 1000, typical: 400 },
    costPer1MTokens: { min: 0.3, max: 1 },
    reliability: 0.88,
    enabled: true, // Enabled as FORECASTING MODIFIER only
  },
  desearch: {
    id: 'desearch',
    name: 'Desearch',
    category: 'decentralized',
    subnet: 22,
    description: 'Social sentiment from Twitter, Reddit, Google',
    capabilities: ['sentiment-analysis', 'social-monitoring', 'trend-detection'],
    latencyMs: { min: 500, max: 3000, typical: 1500 },
    costPer1MTokens: { min: 0.2, max: 1 },
    reliability: 0.9,
    enabled: true,
  },
  mantis: {
    id: 'mantis',
    name: 'MANTIS',
    category: 'decentralized',
    subnet: 123,
    description: 'Multi-asset forecasting with XGBoost + ML',
    capabilities: ['multi-asset-forecast', 'ml-predictions', 'cross-asset'],
    latencyMs: { min: 300, max: 2000, typical: 1000 },
    costPer1MTokens: { min: 0.3, max: 1.5 },
    reliability: 0.85,
    enabled: true,
  },
  bitquant: {
    id: 'bitquant',
    name: 'BitQuant',
    category: 'decentralized',
    subnet: 15,
    description: 'DeFi analysis with natural language queries',
    capabilities: ['defi-analysis', 'protocol-metrics', 'yield-analysis'],
    latencyMs: { min: 500, max: 3000, typical: 1500 },
    costPer1MTokens: { min: 0.2, max: 1 },
    reliability: 0.87,
    enabled: true,
  },
  numinous: {
    id: 'numinous',
    name: 'Numinous',
    category: 'decentralized',
    subnet: 6,
    description: 'Event forecasting and superforecasting network',
    capabilities: ['event-forecast', 'probability-estimation', 'macro-events'],
    latencyMs: { min: 1000, max: 5000, typical: 2500 },
    costPer1MTokens: { min: 0.5, max: 2 },
    reliability: 0.82,
    enabled: false, // Not yet integrated
  },
  gopher: {
    id: 'gopher',
    name: 'Gopher',
    category: 'decentralized',
    subnet: 42,
    description: 'Real-time web scraping for news and filings',
    capabilities: ['web-scraping', 'news-aggregation', 'filing-extraction'],
    latencyMs: { min: 1000, max: 5000, typical: 2000 },
    costPer1MTokens: { min: 0.3, max: 1.5 },
    reliability: 0.85,
    enabled: false, // Not yet integrated
  },
};

// =============================================================================
// Query Type -> Data Source Mapping
// =============================================================================
// 
// ARCHITECTURE: hypothesis → evidence gathering → adjudication
// - CORE THINKING ENGINE runs for EVERY query
// - SIGNAL AUGMENTATION runs in parallel to modify confidence
// - CONDITIONAL activates only when query type requires it
// - Forecasting (Precog) modifies confidence ONLY, never routes

export const QUERY_TYPE_SOURCES: Record<QueryType, DataSourceId[]> = {
  // Simple queries: Core only (MiniMax for speed)
  chat: ['minimax'],
  simple_lookup: ['minimax'],
  
  // Complex queries: Core thinking engine (DeepSeek R1 → Claude)
  // Signals always augment these queries
  trading_decision: ['deepseek', 'claude'],
  portfolio_analysis: ['deepseek', 'claude'],
  
  // Research: Core + Perplexity for citations
  research: ['deepseek', 'perplexity', 'claude'],
};

// =============================================================================
// Routing Path Configurations
// =============================================================================
// 
// Simplified to match Founder Architecture Feedback:
// - CORE: The thinking engine (always active)
// - AUGMENTED: Core + Signal Bus (confidence modification)
// - CONDITIONAL: Core + conditional module (research, events, etc.)

export const ROUTING_PATHS: Record<
  RoutingPath,
  {
    name: string;
    description: string;
    coreSources: DataSourceId[];      // Always runs
    signalAugmentation: DataSourceId[]; // Parallel confidence modifiers
    conditionalSources?: DataSourceId[]; // Only when needed
    maxLatencyMs: number;
  }
> = {
  // Simple chat/lookup - MiniMax only, no signals needed
  speed: {
    name: 'Speed Path',
    description: 'Simple queries - MiniMax only for sub-second response',
    coreSources: ['minimax'],
    signalAugmentation: [], // No signals for simple lookups
    maxLatencyMs: 500,
  },
  
  // Complex decisions - Core engine + signal augmentation
  reasoning: {
    name: 'Reasoning Path',
    description: 'Complex decisions - Core thinking + signal augmentation',
    coreSources: ['deepseek', 'claude'],
    signalAugmentation: ['vanta', 'xai', 'desearch', 'mantis'],
    maxLatencyMs: 10000,
  },
  
  // Research - Core + Perplexity for citations
  deep: {
    name: 'Deep Research Path',
    description: 'Research queries - Core + Perplexity for web search',
    coreSources: ['deepseek', 'claude'],
    signalAugmentation: ['vanta', 'xai', 'desearch'],
    conditionalSources: ['perplexity'],
    maxLatencyMs: 15000,
  },
  
  // Cost-optimized - Chutes for bulk analysis
  cost: {
    name: 'Cost Path',
    description: 'Cost-optimized analysis using Chutes',
    coreSources: ['deepseek', 'claude'],
    signalAugmentation: ['vanta', 'mantis'],
    maxLatencyMs: 5000,
  },
};

// =============================================================================
// Classification Rules (used by regex classifier)
// =============================================================================

export const CLASSIFICATION_PATTERNS: Array<{
  patterns: RegExp[];
  type: QueryType;
  urgency: 'realtime' | 'normal' | 'background';
  complexity: 'low' | 'medium' | 'high';
}> = [
  // Trading decisions - highest priority matching
  {
    patterns: [
      /should\s+i\s+(buy|sell|hold|trade|exit|enter)/i,
      /is\s+(it|now)\s+(a\s+)?good\s+time\s+to\s+(buy|sell)/i,
      /what\s+(should|would)\s+(i|we)\s+do\s+with/i,
      /(buy|sell)\s+or\s+(hold|sell|buy)/i,
      /should\s+(i|we)\s+(reduce|increase|trim|add)/i,
      /is\s+\w+\s+(overvalued|undervalued|fairly\s+valued)/i,
      /what('s|\s+is)\s+(the\s+)?(target|entry|exit)\s+price/i,
      /position\s+size/i,
      /stop\s+loss/i,
    ],
    type: 'trading_decision',
    urgency: 'normal',
    complexity: 'high',
  },
  // Portfolio analysis
  {
    patterns: [
      /my\s+portfolio/i,
      /portfolio\s+(analysis|breakdown|allocation|performance|risk)/i,
      /how\s+(is|are)\s+(my|our|the)\s+(portfolio|investments?|holdings?)/i,
      /asset\s+allocation/i,
      /rebalance/i,
      /diversification/i,
      /concentration\s+risk/i,
      /sector\s+(exposure|allocation|breakdown)/i,
      /what('s|\s+is)\s+(my|our)\s+(exposure|allocation)/i,
    ],
    type: 'portfolio_analysis',
    urgency: 'normal',
    complexity: 'medium',
  },
  // Research questions
  {
    patterns: [
      /research\s+(on|about|into)/i,
      /explain\s+(how|why|what)/i,
      /what\s+are\s+the\s+(pros|cons|risks|benefits)/i,
      /compare\s+(and\s+contrast\s+)?\w+\s+(to|with|versus|vs)/i,
      /analysis\s+of/i,
      /deep\s+dive/i,
      /tell\s+me\s+(about|everything)/i,
      /how\s+does\s+\w+\s+work/i,
      /what\s+(is|are)\s+the\s+(difference|similarities)/i,
      /investment\s+thesis/i,
      /fundamental\s+analysis/i,
      /technical\s+analysis/i,
    ],
    type: 'research',
    urgency: 'background',
    complexity: 'high',
  },
  // Simple lookups
  {
    patterns: [
      /what\s+is\s+(the\s+)?(price|value)\s+of/i,
      /^what\s+is\s+[\w\s]+\??$/i, // Simple "what is X" questions
      /how\s+much\s+is/i,
      /current\s+(price|value|rate)/i,
      /what('s|\s+is)\s+\w+\s+trading\s+at/i,
      /^price\s+(of|for)/i,
      /market\s+cap\s+(of|for)/i,
      /\b(P\/E|PE|EPS|dividend|yield)\s+(ratio|of|for)/i,
      /when\s+(is|was|did)/i,
      /who\s+(is|was|runs|founded)/i,
    ],
    type: 'simple_lookup',
    urgency: 'realtime',
    complexity: 'low',
  },
];

// Default classification for unmatched queries
export const DEFAULT_CLASSIFICATION = {
  type: 'chat' as QueryType,
  urgency: 'realtime' as const,
  complexity: 'low' as const,
};

// =============================================================================
// Weights for source reputation (used in synthesis)
// =============================================================================
// 
// ARCHITECTURE NOTE:
// - Core providers have higher weights (they drive the response)
// - Signal augmentation providers modify confidence (lower base weight)
// - Forecasting modifiers only adjust confidence, not primary response

export const SOURCE_WEIGHTS: Record<DataSourceId, number> = {
  // CORE THINKING ENGINE (primary drivers)
  minimax: 0.72,   // Speed - fast responses
  deepseek: 0.88,  // Reasoning - complex analysis with trace
  claude: 0.95,    // Synthesis - fallback and final generation
  groq: 0.70,      // Speed fallback
  
  // CONDITIONAL MODULES
  perplexity: 0.90, // Research with citations
  
  // SIGNAL AUGMENTATION BUS (confidence modifiers)
  vanta: 0.85,     // Trading signals - strong weight
  xai: 0.90,       // First-party Twitter sentiment
  desearch: 0.75,  // Social sentiment validation
  mantis: 0.78,    // Multi-asset forecasts
  bitquant: 0.72,  // DeFi analysis
  
  // FORECASTING MODIFIERS (confidence only, not primary)
  precog: 0.80,    // BTC forecasting - modifies confidence
  
  // CONDITIONAL MODULES (not yet integrated)
  numinous: 0.70,  // Event forecasting
  gopher: 0.70,    // Real-time data
  
  // LEGACY / DEPRECATED
  qwen: 0.80,      // Pending - marked as pending per Sam
  chutes: 0.75,    // Cost path (being phased out)
};

// =============================================================================
// Feature Flags
// =============================================================================

export const ATHENA_CONFIG = {
  // ARCHITECTURE: hypothesis → evidence → adjudication
  // Core thinking engine always runs; signals augment confidence
  architectureMode: 'core-plus-augmentation',
  
  // Enable signal augmentation bus (parallel confidence modification)
  signalAugmentationEnabled: true,
  
  // Forecasting modifiers adjust confidence but don't route
  forecastingAsConfidenceModifier: true,
  
  // Enable parallel source fetching
  parallelFetching: true,
  
  // Maximum sources to query in parallel
  maxParallelSources: 4,
  
  // Timeout for individual source queries
  sourceTimeoutMs: 10000,
  
  // Enable learning layer (outcome tracking)
  learningEnabled: false, // TODO: Enable when learning layer built
  
  // Minimum confidence threshold for classification
  minClassificationConfidence: 0.6,
  
  // Enable fallback sources on primary failure
  enableFallbacks: true,
};
