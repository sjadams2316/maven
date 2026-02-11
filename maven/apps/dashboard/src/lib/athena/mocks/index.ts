/**
 * Athena Mock Module
 * 
 * Exports all mock utilities for testing the router and synthesis
 * without hitting real APIs.
 */

// Signal generation
export {
  type SignalSource,
  type TradingSignal,
  type SignalScenario,
  generateMockSignal,
  generateSignalSet,
  generateDegradedSignalSet,
  generateMarketCondition,
  analyzeConsensus,
} from './mock-signals';

// LLM provider mocks
export {
  mockGroq,
  mockChutes,
  mockPerplexity,
  type MockProviderConfig,
  configureMockProviders,
  resetMockProviders,
  withFailureSimulation,
  mockScenarios,
} from './mock-providers';
