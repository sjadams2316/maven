/**
 * Athena Type Definitions
 * Maven's Hybrid Intelligence Layer
 */

// =============================================================================
// Query Classification
// =============================================================================

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
  dataSources: DataSourceId[];
  confidence: number; // 0-1 how confident are we in this classification
  reasoning?: string; // optional explanation for debugging
}

// =============================================================================
// Data Sources & Providers
// =============================================================================

export type DataSourceId =
  // Centralized (Speed + Reasoning)
  | 'groq'
  | 'claude'
  | 'perplexity'
  | 'xai' // xAI/Grok - Twitter/X sentiment (first-party)
  // Decentralized Bittensor (Signals + Cost)
  | 'chutes' // SN64 - Cheap inference
  | 'vanta' // SN8 - Taoshi trading signals
  | 'precog' // SN55 - BTC price forecasting
  | 'desearch' // SN22 - Social sentiment (Reddit + Twitter validation)
  | 'mantis' // SN123 - Multi-asset forecast
  | 'bitquant' // SN15 - DeFi analysis
  | 'numinous' // SN6 - Event forecasting
  | 'gopher'; // SN42 - Real-time scraping

export type ProviderCategory = 'centralized' | 'decentralized';

export interface DataSourceConfig {
  id: DataSourceId;
  name: string;
  category: ProviderCategory;
  subnet?: number; // Bittensor subnet number
  description: string;
  capabilities: string[];
  latencyMs: { min: number; max: number; typical: number };
  costPer1MTokens: { min: number; max: number };
  reliability: number; // 0-1 historical uptime
  enabled: boolean;
}

// =============================================================================
// Routing
// =============================================================================

export type RoutingPath = 'speed' | 'cost' | 'deep' | 'reasoning';

export interface RoutingDecision {
  primaryPath: RoutingPath;
  dataSources: DataSourceId[];
  estimatedLatencyMs: number;
  estimatedCostUsd: number;
  parallelizable: boolean;
  fallbacks: DataSourceId[];
}

// =============================================================================
// Client Context
// =============================================================================

export interface ClientContext {
  clientId?: string;
  advisorId?: string;
  holdings?: string[]; // ticker symbols
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  previousQueries?: string[];
  sessionId?: string;
  preferredResponseStyle?: 'detailed' | 'concise';
}

// =============================================================================
// Responses
// =============================================================================

export interface SourceContribution {
  sourceId: DataSourceId;
  response: string;
  latencyMs: number;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface AthenaResponse {
  answer: string;
  confidence: number; // 0-1 overall confidence
  sources: SourceContribution[];
  classification: QueryClassification;
  routing: RoutingDecision;
  totalLatencyMs: number;
  totalCostUsd: number;
  metadata?: {
    synthesisMethod?: string;
    disagreements?: string[];
    actionItems?: string[];
  };
}

// =============================================================================
// Learning Layer (Future)
// =============================================================================

export interface QueryOutcome {
  queryId: string;
  query: string;
  classification: QueryClassification;
  routing: RoutingDecision;
  response: AthenaResponse;
  timestamp: Date;
  feedback?: {
    helpful: boolean;
    advisorRating?: number; // 1-5
    pnlImpact?: number; // $ impact if tracked
    notes?: string;
  };
}

export interface SourceReputation {
  sourceId: DataSourceId;
  totalQueries: number;
  successRate: number;
  averageLatencyMs: number;
  accuracyByQueryType: Partial<Record<QueryType, number>>;
  lastUpdated: Date;
}
