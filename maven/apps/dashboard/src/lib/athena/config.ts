/**
 * Athena Configuration
 * Provider settings, weights, and routing rules
 */

import type { DataSourceConfig, DataSourceId, QueryType, RoutingPath } from './types';

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
    description: 'BTC price forecasting at 5-minute intervals',
    capabilities: ['btc-forecast', 'short-term-prediction', 'crypto-signals'],
    latencyMs: { min: 100, max: 1000, typical: 400 },
    costPer1MTokens: { min: 0.3, max: 1 },
    reliability: 0.88,
    enabled: false, // Disabled per Sam - not needed for Oracle
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

export const QUERY_TYPE_SOURCES: Record<QueryType, DataSourceId[]> = {
  chat: ['groq', 'minimax'], // Speed path - use either
  simple_lookup: ['minimax', 'groq'], // MiniMax preferred for speed
  trading_decision: ['deepseek', 'vanta', 'desearch'], // DeepSeek reasoning + signals
  portfolio_analysis: ['chutes', 'deepseek'],
  research: ['perplexity', 'deepseek', 'desearch'],
};

// =============================================================================
// Routing Path Configurations
// =============================================================================

export const ROUTING_PATHS: Record<
  RoutingPath,
  {
    name: string;
    description: string;
    primarySources: DataSourceId[];
    maxLatencyMs: number;
    costWeight: number; // 0-1, higher = prioritize cost
  }
> = {
  speed: {
    name: 'Speed Path',
    description: 'Real-time UX, sub-second responses',
    primarySources: ['minimax', 'groq'], // MiniMax preferred, Groq fallback
    maxLatencyMs: 500,
    costWeight: 0.2,
  },
  cost: {
    name: 'Cost Path',
    description: 'Analysis and reasoning at minimal cost',
    primarySources: ['chutes', 'vanta'],
    maxLatencyMs: 3000,
    costWeight: 0.8,
  },
  deep: {
    name: 'Deep Path',
    description: 'Research with citations and thorough analysis',
    primarySources: ['perplexity', 'desearch'],
    maxLatencyMs: 10000,
    costWeight: 0.4,
  },
  reasoning: {
    name: 'Reasoning Path',
    description: 'Complex multi-step decisions with visible reasoning',
    primarySources: ['deepseek', 'claude'],
    maxLatencyMs: 10000,
    costWeight: 0.3,
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

export const SOURCE_WEIGHTS: Record<DataSourceId, number> = {
  groq: 0.7, // Fast but generic
  minimax: 0.72, // Fast, efficient, integrated with OpenClaw
  deepseek: 0.88, // Strong reasoning, open-source
  claude: 0.95, // High quality reasoning
  perplexity: 0.9, // Good research
  xai: 0.9, // First-party Twitter sentiment
  chutes: 0.75, // Cost-effective
  vanta: 0.85, // Strong trading signals
  precog: 0.8, // BTC specific
  desearch: 0.75, // Social sentiment (validation)
  mantis: 0.78, // Multi-asset
  bitquant: 0.72, // DeFi focus
  numinous: 0.7, // Event forecasting
  gopher: 0.7, // Web scraping
};

// =============================================================================
// Feature Flags
// =============================================================================

export const ATHENA_CONFIG = {
  // Use Groq for classification when available, fall back to regex
  useGroqClassification: false, // TODO: Enable when Groq integration ready
  
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
