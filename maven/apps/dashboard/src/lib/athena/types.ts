/**
 * Athena Type Definitions
 * 
 * Core types for Maven's hybrid intelligence layer.
 */

// ============================================================================
// QUERY TYPES
// ============================================================================

export type QueryType = 
  | 'chat'
  | 'trading_decision'
  | 'portfolio_analysis'
  | 'research'
  | 'simple_lookup';

export type Urgency = 'realtime' | 'normal' | 'background';

export type Complexity = 'low' | 'medium' | 'high';

export interface QueryClassification {
  type: QueryType;
  urgency: Urgency;
  complexity: Complexity;
  dataSources: DataSource[];
  reasoning?: string;
}

// ============================================================================
// DATA SOURCES
// ============================================================================

export type DataSource = 
  // Centralized
  | 'groq'       // Speed path
  | 'chutes'     // Cost path  
  | 'claude'     // Complex reasoning
  | 'perplexity' // Research with citations
  // Decentralized (Bittensor)
  | 'vanta'      // SN8 - Trading signals
  | 'precog'     // SN55 - BTC forecasting
  | 'desearch'   // SN22 - Sentiment
  | 'mantis'     // SN123 - Multi-asset forecasting
  | 'bitquant';  // SN15 - DeFi analysis

export interface DataSourceConfig {
  name: DataSource;
  type: 'centralized' | 'decentralized';
  purpose: string;
  latencyMs: number;  // Expected latency
  costPer1M: number;  // Cost per 1M tokens/requests
  available: boolean;
  fallback?: DataSource;
}

// ============================================================================
// ROUTING
// ============================================================================

export type RoutingPath = 'speed' | 'cost' | 'deep' | 'reasoning';

export interface RoutingDecision {
  path: RoutingPath;
  primaryProvider: DataSource;
  enrichmentSources: DataSource[];
  expectedLatencyMs: number;
  expectedCost: number;
  reasoning: string;
}

// ============================================================================
// SIGNALS
// ============================================================================

export interface TradingSignal {
  source: DataSource;
  symbol: string;
  signal: number;        // -1 (bearish) to +1 (bullish)
  confidence: number;    // 0 to 1
  signalType: 'momentum' | 'sentiment' | 'forecast' | 'analysis';
  metadata: {
    sharpeRatio?: number;
    timeframe?: string;
    dataPoints?: number;
    [key: string]: unknown;
  };
  timestamp: number;
  raw?: unknown;         // Original response for audit
}

export interface SignalSet {
  symbol: string;
  signals: TradingSignal[];
  fetchedAt: number;
  sources: {
    available: DataSource[];
    unavailable: DataSource[];
    degraded: DataSource[];
  };
}

// ============================================================================
// LLM RESPONSES
// ============================================================================

export interface LLMResponse {
  provider: DataSource;
  model: string;
  content: string;
  latencyMs: number;
  tokensUsed: {
    input: number;
    output: number;
  };
  cost: number;
  raw?: unknown;
}

export interface LLMResponseWithCitations extends LLMResponse {
  citations: {
    url: string;
    title: string;
    snippet: string;
  }[];
}

// ============================================================================
// SYNTHESIS
// ============================================================================

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type AgreementLevel = 'high' | 'medium' | 'low';

export interface SynthesisResult {
  // User-facing
  recommendation: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  explanation: string;
  actionItems: string[];
  flags: string[];
  
  // Transparency
  signalSummary: {
    weightedScore: number;
    agreementLevel: AgreementLevel;
    sourcesUsed: DataSource[];
    sourcesMissing: DataSource[];
  };
  
  // Audit
  audit: AuditRecord;
}

// ============================================================================
// AUDIT & COMPLIANCE
// ============================================================================

export interface AuditRecord {
  queryId: string;
  timestamp: string;
  
  // Input
  query: string;
  queryType: QueryType;
  clientId?: string;      // Hashed for privacy
  
  // Routing
  routingDecision: RoutingDecision;
  
  // Sources
  sourceResponses: {
    source: DataSource;
    latencyMs: number;
    success: boolean;
    error?: string;
    raw?: unknown;
  }[];
  
  // Synthesis
  synthesis: {
    weights: Record<DataSource, number>;
    normalizedSignals: Record<DataSource, number>;
    weightedScore: number;
    disagreementLevel: AgreementLevel;
    confidencePenalty: number;
    finalConfidence: number;
  };
  
  // Output
  recommendation: string;
  
  // Integrity
  hash: string;           // SHA256 of the entire record
}

// ============================================================================
// CLIENT CONTEXT
// ============================================================================

export interface ClientContext {
  clientId?: string;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon?: 'short' | 'medium' | 'long';
  
  // Position info
  hasPosition?: boolean;
  positionSize?: number;
  positionPct?: number;   // Percentage of portfolio
  costBasis?: number;
  holdingPeriod?: 'short_term' | 'long_term';
  
  // Tax situation
  taxBracket?: number;
  harvestablelosses?: number;
  
  // Preferences
  preferredTone?: 'detailed' | 'concise';
  showSources?: boolean;
}

// ============================================================================
// HEALTH & MONITORING
// ============================================================================

export interface AthenaHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  
  sources: {
    source: DataSource;
    status: 'online' | 'degraded' | 'offline';
    latencyMs?: number;
    lastCheck: number;
    errorRate?: number;
  }[];
  
  cache: {
    type: 'redis' | 'memory';
    hitRate: number;
    size: number;
  };
  
  performance: {
    avgLatencyMs: number;
    p95LatencyMs: number;
    queriesPerMinute: number;
    errorRate: number;
  };
  
  alerts: string[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface AthenaConfig {
  // Source weights (can be overridden per query type)
  defaultWeights: Record<DataSource, number>;
  queryTypeWeights: Record<QueryType, Record<DataSource, number>>;
  
  // Thresholds
  disagreementThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  
  // Confidence
  baseConfidence: {
    allAgree: number;
    majorityAgree: number;
    split: number;
    minority: number;
  };
  
  // Degradation
  degradation: {
    singleSourcePenalty: number;
    staleDataThresholdMs: number;
    minSourcesForTrading: number;
  };
  
  // Routing
  routing: {
    realtimeLatencyThresholdMs: number;
    costOptimizationTarget: number;
  };
}
