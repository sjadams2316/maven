/**
 * Athena Router Tests
 * 20 sample queries covering all classification types
 */

import { describe, it, expect } from 'vitest';
import {
  classifyQuery,
  routeQuery,
  classifyAndRoute,
  quickClassify,
  extractTickers,
} from './router';
import type { QueryType, ClientContext } from './types';

describe('Athena Router', () => {
  describe('classifyQuery', () => {
    // ==========================================================================
    // Trading Decision Queries (5 tests)
    // ==========================================================================
    describe('trading_decision classification', () => {
      it('should classify "Should I sell my AAPL position?" as trading_decision', async () => {
        const result = await classifyQuery('Should I sell my AAPL position?');
        expect(result.type).toBe('trading_decision');
        expect(result.urgency).toBe('normal');
        expect(result.complexity).toBe('high');
        expect(result.dataSources).toContain('vanta');
        expect(result.dataSources).toContain('precog');
        expect(result.dataSources).toContain('desearch');
      });

      it('should classify "Is now a good time to buy Bitcoin?" as trading_decision', async () => {
        const result = await classifyQuery('Is now a good time to buy Bitcoin?');
        expect(result.type).toBe('trading_decision');
        expect(result.complexity).toBe('high');
      });

      it('should classify "Should we reduce our CIFR exposure?" as trading_decision', async () => {
        const result = await classifyQuery('Should we reduce our CIFR exposure?');
        expect(result.type).toBe('trading_decision');
      });

      it('should classify "Buy or hold NVDA?" as trading_decision', async () => {
        const result = await classifyQuery('Buy or hold NVDA?');
        expect(result.type).toBe('trading_decision');
      });

      it('should classify "What\'s the target price for TSLA?" as trading_decision', async () => {
        const result = await classifyQuery("What's the target price for TSLA?");
        expect(result.type).toBe('trading_decision');
      });
    });

    // ==========================================================================
    // Portfolio Analysis Queries (4 tests)
    // ==========================================================================
    describe('portfolio_analysis classification', () => {
      it('should classify "What\'s my portfolio performance?" as portfolio_analysis', async () => {
        const result = await classifyQuery("What's my portfolio performance?");
        expect(result.type).toBe('portfolio_analysis');
        expect(result.urgency).toBe('normal');
        expect(result.complexity).toBe('medium');
        expect(result.dataSources).toContain('chutes');
      });

      it('should classify "Show me my asset allocation" as portfolio_analysis', async () => {
        const result = await classifyQuery('Show me my asset allocation');
        expect(result.type).toBe('portfolio_analysis');
      });

      it('should classify "Do I need to rebalance?" as portfolio_analysis', async () => {
        const result = await classifyQuery('Do I need to rebalance?');
        expect(result.type).toBe('portfolio_analysis');
      });

      it('should classify "What\'s my sector exposure?" as portfolio_analysis', async () => {
        const result = await classifyQuery("What's my sector exposure?");
        expect(result.type).toBe('portfolio_analysis');
      });
    });

    // ==========================================================================
    // Research Queries (4 tests)
    // ==========================================================================
    describe('research classification', () => {
      it('should classify "Research on emerging markets ETFs" as research', async () => {
        const result = await classifyQuery('Research on emerging markets ETFs');
        expect(result.type).toBe('research');
        expect(result.urgency).toBe('background');
        expect(result.complexity).toBe('high');
        expect(result.dataSources).toContain('perplexity');
        expect(result.dataSources).toContain('desearch');
      });

      it('should classify "Compare VOO vs VTI" as research', async () => {
        const result = await classifyQuery('Compare VOO vs VTI');
        expect(result.type).toBe('research');
      });

      it('should classify "What are the risks of investing in China?" as research', async () => {
        const result = await classifyQuery('What are the risks of investing in China?');
        expect(result.type).toBe('research');
      });

      it('should classify "Deep dive into Apple\'s fundamentals" as research', async () => {
        const result = await classifyQuery("Deep dive into Apple's fundamentals");
        expect(result.type).toBe('research');
      });
    });

    // ==========================================================================
    // Simple Lookup Queries (4 tests)
    // ==========================================================================
    describe('simple_lookup classification', () => {
      it('should classify "What is the price of AAPL?" as simple_lookup', async () => {
        const result = await classifyQuery('What is the price of AAPL?');
        expect(result.type).toBe('simple_lookup');
        expect(result.urgency).toBe('realtime');
        expect(result.complexity).toBe('low');
        expect(result.dataSources).toContain('groq');
      });

      it('should classify "What is Bitcoin?" as simple_lookup', async () => {
        const result = await classifyQuery('What is Bitcoin?');
        expect(result.type).toBe('simple_lookup');
      });

      it('should classify "Current price of gold" as simple_lookup', async () => {
        const result = await classifyQuery('Current price of gold');
        expect(result.type).toBe('simple_lookup');
      });

      it('should classify "What\'s the P/E ratio of Microsoft?" as simple_lookup', async () => {
        const result = await classifyQuery("What's the P/E ratio of Microsoft?");
        expect(result.type).toBe('simple_lookup');
      });
    });

    // ==========================================================================
    // Chat/General Queries (3 tests)
    // ==========================================================================
    describe('chat classification', () => {
      it('should classify "Hello, how are you?" as chat', async () => {
        const result = await classifyQuery('Hello, how are you?');
        expect(result.type).toBe('chat');
        expect(result.urgency).toBe('realtime');
        expect(result.complexity).toBe('low');
        expect(result.dataSources).toContain('groq');
      });

      it('should classify "Thanks for your help!" as chat', async () => {
        const result = await classifyQuery('Thanks for your help!');
        expect(result.type).toBe('chat');
      });

      it('should classify random gibberish as chat (fallback)', async () => {
        const result = await classifyQuery('asdfqwer random text here');
        expect(result.type).toBe('chat');
        expect(result.confidence).toBeLessThan(0.7);
      });
    });
  });

  // ==========================================================================
  // Context-Aware Classification
  // ==========================================================================
  describe('context-aware classification', () => {
    it('should boost confidence when query mentions held asset', async () => {
      const context: ClientContext = {
        holdings: ['AAPL', 'GOOGL', 'MSFT'],
      };

      const result = await classifyQuery('Should I sell AAPL?', context);
      expect(result.type).toBe('trading_decision');
      expect(result.confidence).toBeGreaterThanOrEqual(0.95);
    });

    it('should boost confidence for portfolio queries with holdings', async () => {
      const context: ClientContext = {
        holdings: ['VTI', 'BND', 'VXUS'],
      };

      const result = await classifyQuery("How's my portfolio doing?", context);
      expect(result.type).toBe('portfolio_analysis');
      expect(result.confidence).toBeGreaterThanOrEqual(0.95);
    });
  });

  // ==========================================================================
  // Routing
  // ==========================================================================
  describe('routeQuery', () => {
    it('should route trading_decision to cost path with Bittensor sources', async () => {
      const classification = await classifyQuery('Should I buy NVDA?');
      const routing = await routeQuery(classification);

      expect(routing.primaryPath).toBe('cost');
      expect(routing.dataSources.length).toBeGreaterThan(0);
      expect(routing.parallelizable).toBe(true);
      expect(routing.fallbacks.length).toBeGreaterThan(0);
    });

    it('should route simple_lookup to speed path', async () => {
      const classification = await classifyQuery('What is AAPL?');
      const routing = await routeQuery(classification);

      expect(routing.primaryPath).toBe('speed');
      expect(routing.estimatedLatencyMs).toBeLessThan(500);
    });

    it('should route research to deep path', async () => {
      const classification = await classifyQuery('Research on market cycles');
      const routing = await routeQuery(classification);

      expect(routing.primaryPath).toBe('deep');
    });

    it('should provide cost estimates', async () => {
      const classification = await classifyQuery('Should I sell BTC?');
      const routing = await routeQuery(classification);

      expect(routing.estimatedCostUsd).toBeGreaterThan(0);
      expect(routing.estimatedCostUsd).toBeLessThan(0.01); // Should be very cheap
    });
  });

  // ==========================================================================
  // Helper Functions
  // ==========================================================================
  describe('helper functions', () => {
    describe('extractTickers', () => {
      it('should extract tickers from query', () => {
        expect(extractTickers('Should I buy AAPL?')).toContain('AAPL');
        expect(extractTickers('Compare $GOOGL and $MSFT')).toEqual(
          expect.arrayContaining(['GOOGL', 'MSFT'])
        );
        expect(extractTickers('What about BTC-USD?')).toContain('BTC');
      });

      it('should handle queries without tickers', () => {
        expect(extractTickers('How is the market doing?')).toEqual([]);
      });
    });

    describe('quickClassify', () => {
      it('should quickly classify without async', () => {
        expect(quickClassify('Should I sell AAPL?')).toBe('trading_decision');
        expect(quickClassify("What's my portfolio?")).toBe('portfolio_analysis');
        expect(quickClassify('Research on bonds')).toBe('research');
        expect(quickClassify('What is gold?')).toBe('simple_lookup');
        expect(quickClassify('Hello there')).toBe('chat');
      });
    });
  });

  // ==========================================================================
  // Full Pipeline
  // ==========================================================================
  describe('classifyAndRoute', () => {
    it('should classify and route in one call', async () => {
      const result = await classifyAndRoute('Should I buy more TSLA?');

      expect(result.classification.type).toBe('trading_decision');
      expect(result.routing.primaryPath).toBe('cost');
      expect(result.routing.dataSources.length).toBeGreaterThan(0);
    });

    it('should handle context in pipeline', async () => {
      const context: ClientContext = {
        clientId: 'client-123',
        holdings: ['TSLA', 'AAPL'],
      };

      const result = await classifyAndRoute('Should I sell TSLA?', context);

      expect(result.classification.type).toBe('trading_decision');
      expect(result.classification.confidence).toBeGreaterThanOrEqual(0.95);
    });
  });
});

// ==========================================================================
// Sample Queries Summary
// ==========================================================================
// 
// Trading Decision (5):
// 1. "Should I sell my AAPL position?"
// 2. "Is now a good time to buy Bitcoin?"
// 3. "Should we reduce our CIFR exposure?"
// 4. "Buy or hold NVDA?"
// 5. "What's the target price for TSLA?"
//
// Portfolio Analysis (4):
// 6. "What's my portfolio performance?"
// 7. "Show me my asset allocation"
// 8. "Do I need to rebalance?"
// 9. "What's my sector exposure?"
//
// Research (4):
// 10. "Research on emerging markets ETFs"
// 11. "Compare VOO vs VTI"
// 12. "What are the risks of investing in China?"
// 13. "Deep dive into Apple's fundamentals"
//
// Simple Lookup (4):
// 14. "What is the price of AAPL?"
// 15. "What is Bitcoin?"
// 16. "Current price of gold"
// 17. "What's the P/E ratio of Microsoft?"
//
// Chat (3):
// 18. "Hello, how are you?"
// 19. "Thanks for your help!"
// 20. "asdfqwer random text here" (fallback test)
//
