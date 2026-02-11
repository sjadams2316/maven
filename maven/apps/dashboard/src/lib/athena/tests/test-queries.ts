/**
 * Athena Test Queries
 * 50 labeled queries for testing the intent router
 * 
 * Distribution:
 * - 10 trading decisions
 * - 10 portfolio analysis
 * - 10 simple lookups
 * - 10 research
 * - 10 general chat
 * 
 * Includes edge cases: ambiguous, multi-intent, typos, very short, very long
 */

export interface TestQuery {
  id: string;
  query: string;
  expectedType: 'chat' | 'trading_decision' | 'portfolio_analysis' | 'research' | 'simple_lookup';
  expectedUrgency: 'realtime' | 'normal' | 'background';
  expectedComplexity: 'low' | 'medium' | 'high';
  expectedSources: string[];
  context?: { 
    clientRiskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    hasPosition?: boolean;
  };
  tags?: string[]; // For filtering tests by category
}

export const TEST_QUERIES: TestQuery[] = [
  // ============================================
  // TRADING DECISIONS (10)
  // ============================================
  {
    id: 'td-001',
    query: 'Should I sell CIFR?',
    expectedType: 'trading_decision',
    expectedUrgency: 'realtime',
    expectedComplexity: 'high',
    expectedSources: ['market_data', 'portfolio', 'news'],
    context: { hasPosition: true },
    tags: ['trading', 'sell'],
  },
  {
    id: 'td-002',
    query: 'Is now a good time to buy NVDA?',
    expectedType: 'trading_decision',
    expectedUrgency: 'realtime',
    expectedComplexity: 'high',
    expectedSources: ['market_data', 'news', 'analysis'],
    tags: ['trading', 'buy'],
  },
  {
    id: 'td-003',
    query: 'Buy 100 shares of AAPL',
    expectedType: 'trading_decision',
    expectedUrgency: 'realtime',
    expectedComplexity: 'medium',
    expectedSources: ['market_data', 'portfolio'],
    tags: ['trading', 'buy', 'explicit_action'],
  },
  {
    id: 'td-004',
    query: 'shud i sel tesla stock?', // typo edge case
    expectedType: 'trading_decision',
    expectedUrgency: 'realtime',
    expectedComplexity: 'high',
    expectedSources: ['market_data', 'portfolio', 'news'],
    context: { hasPosition: true },
    tags: ['trading', 'sell', 'typo'],
  },
  {
    id: 'td-005',
    query: 'Given the current market volatility, the recent Fed announcements about interest rates, and my existing position in tech stocks, do you think I should reduce my exposure to GOOGL or hold through this period?',
    expectedType: 'trading_decision',
    expectedUrgency: 'realtime',
    expectedComplexity: 'high',
    expectedSources: ['market_data', 'portfolio', 'news', 'analysis'],
    context: { hasPosition: true },
    tags: ['trading', 'long_query', 'complex'],
  },
  {
    id: 'td-006',
    query: 'Sell everything',
    expectedType: 'trading_decision',
    expectedUrgency: 'realtime',
    expectedComplexity: 'high',
    expectedSources: ['portfolio', 'market_data'],
    tags: ['trading', 'sell', 'short_query'],
  },
  {
    id: 'td-007',
    query: 'Should I take profits on my winners?',
    expectedType: 'trading_decision',
    expectedUrgency: 'normal',
    expectedComplexity: 'high',
    expectedSources: ['portfolio', 'market_data'],
    tags: ['trading', 'sell'],
  },
  {
    id: 'td-008',
    query: 'MSFT looks cheap, worth adding?',
    expectedType: 'trading_decision',
    expectedUrgency: 'realtime',
    expectedComplexity: 'high',
    expectedSources: ['market_data', 'analysis', 'portfolio'],
    tags: ['trading', 'buy'],
  },
  {
    id: 'td-009',
    query: 'Time to rotate out of growth into value?',
    expectedType: 'trading_decision',
    expectedUrgency: 'normal',
    expectedComplexity: 'high',
    expectedSources: ['portfolio', 'market_data', 'analysis'],
    tags: ['trading', 'rebalance'],
  },
  {
    id: 'td-010',
    query: 'AMD or INTC - which is the better buy right now?',
    expectedType: 'trading_decision',
    expectedUrgency: 'realtime',
    expectedComplexity: 'high',
    expectedSources: ['market_data', 'analysis', 'news'],
    tags: ['trading', 'buy', 'comparison'],
  },

  // ============================================
  // PORTFOLIO ANALYSIS (10)
  // ============================================
  {
    id: 'pa-001',
    query: "What's my allocation?",
    expectedType: 'portfolio_analysis',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: ['portfolio'],
    tags: ['portfolio', 'allocation'],
  },
  {
    id: 'pa-002',
    query: 'Am I too concentrated?',
    expectedType: 'portfolio_analysis',
    expectedUrgency: 'normal',
    expectedComplexity: 'medium',
    expectedSources: ['portfolio'],
    tags: ['portfolio', 'concentration'],
  },
  {
    id: 'pa-003',
    query: 'How diversified is my portfolio across sectors and what percentage of my holdings are in technology compared to my target allocation of 30%?',
    expectedType: 'portfolio_analysis',
    expectedUrgency: 'normal',
    expectedComplexity: 'high',
    expectedSources: ['portfolio'],
    tags: ['portfolio', 'diversification', 'long_query'],
  },
  {
    id: 'pa-004',
    query: 'risk exposure',
    expectedType: 'portfolio_analysis',
    expectedUrgency: 'normal',
    expectedComplexity: 'medium',
    expectedSources: ['portfolio', 'market_data'],
    tags: ['portfolio', 'risk', 'short_query'],
  },
  {
    id: 'pa-005',
    query: "What's my YTD performance?",
    expectedType: 'portfolio_analysis',
    expectedUrgency: 'normal',
    expectedComplexity: 'medium',
    expectedSources: ['portfolio'],
    tags: ['portfolio', 'performance'],
  },
  {
    id: 'pa-006',
    query: 'Show me my best and worst performers',
    expectedType: 'portfolio_analysis',
    expectedUrgency: 'normal',
    expectedComplexity: 'medium',
    expectedSources: ['portfolio'],
    tags: ['portfolio', 'performance'],
  },
  {
    id: 'pa-007',
    query: 'wats my portfolo look like', // typo edge case
    expectedType: 'portfolio_analysis',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: ['portfolio'],
    tags: ['portfolio', 'typo'],
  },
  {
    id: 'pa-008',
    query: 'How much am I up today?',
    expectedType: 'portfolio_analysis',
    expectedUrgency: 'realtime',
    expectedComplexity: 'low',
    expectedSources: ['portfolio', 'market_data'],
    tags: ['portfolio', 'performance'],
  },
  {
    id: 'pa-009',
    query: 'Compare my returns to the S&P 500',
    expectedType: 'portfolio_analysis',
    expectedUrgency: 'normal',
    expectedComplexity: 'medium',
    expectedSources: ['portfolio', 'market_data'],
    tags: ['portfolio', 'benchmark'],
  },
  {
    id: 'pa-010',
    query: 'Do I have any overlapping holdings in my ETFs?',
    expectedType: 'portfolio_analysis',
    expectedUrgency: 'normal',
    expectedComplexity: 'high',
    expectedSources: ['portfolio'],
    tags: ['portfolio', 'overlap'],
  },

  // ============================================
  // SIMPLE LOOKUPS (10)
  // ============================================
  {
    id: 'sl-001',
    query: "What's the price of SPY?",
    expectedType: 'simple_lookup',
    expectedUrgency: 'realtime',
    expectedComplexity: 'low',
    expectedSources: ['market_data'],
    tags: ['lookup', 'price'],
  },
  {
    id: 'sl-002',
    query: "What's my net worth?",
    expectedType: 'simple_lookup',
    expectedUrgency: 'realtime',
    expectedComplexity: 'low',
    expectedSources: ['portfolio'],
    tags: ['lookup', 'net_worth'],
  },
  {
    id: 'sl-003',
    query: 'AAPL',
    expectedType: 'simple_lookup',
    expectedUrgency: 'realtime',
    expectedComplexity: 'low',
    expectedSources: ['market_data'],
    tags: ['lookup', 'price', 'short_query'],
  },
  {
    id: 'sl-004',
    query: 'How many shares of TSLA do I own?',
    expectedType: 'simple_lookup',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: ['portfolio'],
    tags: ['lookup', 'holdings'],
  },
  {
    id: 'sl-005',
    query: 'whats nvda at', // typo/casual edge case
    expectedType: 'simple_lookup',
    expectedUrgency: 'realtime',
    expectedComplexity: 'low',
    expectedSources: ['market_data'],
    tags: ['lookup', 'price', 'casual'],
  },
  {
    id: 'sl-006',
    query: 'Market open or closed?',
    expectedType: 'simple_lookup',
    expectedUrgency: 'realtime',
    expectedComplexity: 'low',
    expectedSources: ['market_data'],
    tags: ['lookup', 'market_hours'],
  },
  {
    id: 'sl-007',
    query: "What's the VIX?",
    expectedType: 'simple_lookup',
    expectedUrgency: 'realtime',
    expectedComplexity: 'low',
    expectedSources: ['market_data'],
    tags: ['lookup', 'volatility'],
  },
  {
    id: 'sl-008',
    query: 'Cash balance',
    expectedType: 'simple_lookup',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: ['portfolio'],
    tags: ['lookup', 'cash', 'short_query'],
  },
  {
    id: 'sl-009',
    query: "What's Bitcoin trading at?",
    expectedType: 'simple_lookup',
    expectedUrgency: 'realtime',
    expectedComplexity: 'low',
    expectedSources: ['market_data'],
    tags: ['lookup', 'crypto'],
  },
  {
    id: 'sl-010',
    query: 'QQQ price and volume',
    expectedType: 'simple_lookup',
    expectedUrgency: 'realtime',
    expectedComplexity: 'low',
    expectedSources: ['market_data'],
    tags: ['lookup', 'price'],
  },

  // ============================================
  // RESEARCH (10)
  // ============================================
  {
    id: 'rs-001',
    query: "What's the outlook for AI stocks?",
    expectedType: 'research',
    expectedUrgency: 'background',
    expectedComplexity: 'high',
    expectedSources: ['news', 'analysis'],
    tags: ['research', 'sector'],
  },
  {
    id: 'rs-002',
    query: 'Explain tax-loss harvesting',
    expectedType: 'research',
    expectedUrgency: 'background',
    expectedComplexity: 'medium',
    expectedSources: ['knowledge_base'],
    tags: ['research', 'education'],
  },
  {
    id: 'rs-003',
    query: 'What are the pros and cons of dividend investing versus growth investing, and how do taxes affect each strategy differently in taxable versus retirement accounts?',
    expectedType: 'research',
    expectedUrgency: 'background',
    expectedComplexity: 'high',
    expectedSources: ['knowledge_base', 'analysis'],
    tags: ['research', 'education', 'long_query'],
  },
  {
    id: 'rs-004',
    query: 'Why is NVDA up today?',
    expectedType: 'research',
    expectedUrgency: 'realtime',
    expectedComplexity: 'medium',
    expectedSources: ['news', 'market_data'],
    tags: ['research', 'news'],
  },
  {
    id: 'rs-005',
    query: 'Tell me about the semiconductor industry',
    expectedType: 'research',
    expectedUrgency: 'background',
    expectedComplexity: 'high',
    expectedSources: ['news', 'analysis', 'knowledge_base'],
    tags: ['research', 'sector'],
  },
  {
    id: 'rs-006',
    query: 'What is a P/E ratio',
    expectedType: 'research',
    expectedUrgency: 'background',
    expectedComplexity: 'low',
    expectedSources: ['knowledge_base'],
    tags: ['research', 'education'],
  },
  {
    id: 'rs-007',
    query: 'Whats happening with interest rates', // casual/no question mark
    expectedType: 'research',
    expectedUrgency: 'normal',
    expectedComplexity: 'medium',
    expectedSources: ['news', 'analysis'],
    tags: ['research', 'macro'],
  },
  {
    id: 'rs-008',
    query: 'How does the Fed impact stock prices?',
    expectedType: 'research',
    expectedUrgency: 'background',
    expectedComplexity: 'medium',
    expectedSources: ['knowledge_base', 'news'],
    tags: ['research', 'education', 'macro'],
  },
  {
    id: 'rs-009',
    query: "What's the difference between ETFs and mutual funds?",
    expectedType: 'research',
    expectedUrgency: 'background',
    expectedComplexity: 'medium',
    expectedSources: ['knowledge_base'],
    tags: ['research', 'education'],
  },
  {
    id: 'rs-010',
    query: 'Analyze Tesla earnings report',
    expectedType: 'research',
    expectedUrgency: 'normal',
    expectedComplexity: 'high',
    expectedSources: ['news', 'analysis'],
    tags: ['research', 'earnings'],
  },

  // ============================================
  // GENERAL CHAT (10)
  // ============================================
  {
    id: 'ch-001',
    query: 'Hello',
    expectedType: 'chat',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: [],
    tags: ['chat', 'greeting', 'short_query'],
  },
  {
    id: 'ch-002',
    query: 'Thanks',
    expectedType: 'chat',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: [],
    tags: ['chat', 'gratitude', 'short_query'],
  },
  {
    id: 'ch-003',
    query: 'What can you do?',
    expectedType: 'chat',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: [],
    tags: ['chat', 'capabilities'],
  },
  {
    id: 'ch-004',
    query: 'Hi there! How are you doing today?',
    expectedType: 'chat',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: [],
    tags: ['chat', 'greeting'],
  },
  {
    id: 'ch-005',
    query: '👋',
    expectedType: 'chat',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: [],
    tags: ['chat', 'emoji', 'short_query'],
  },
  {
    id: 'ch-006',
    query: 'Good morning!',
    expectedType: 'chat',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: [],
    tags: ['chat', 'greeting'],
  },
  {
    id: 'ch-007',
    query: 'Can you help me?',
    expectedType: 'chat',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: [],
    tags: ['chat', 'help'],
  },
  {
    id: 'ch-008',
    query: 'That was really helpful, thank you so much for explaining everything so clearly!',
    expectedType: 'chat',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: [],
    tags: ['chat', 'gratitude', 'long_query'],
  },
  {
    id: 'ch-009',
    query: 'nevermind',
    expectedType: 'chat',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: [],
    tags: ['chat', 'cancel'],
  },
  {
    id: 'ch-010',
    query: 'Who are you?',
    expectedType: 'chat',
    expectedUrgency: 'normal',
    expectedComplexity: 'low',
    expectedSources: [],
    tags: ['chat', 'identity'],
  },
];

// Helper functions for filtering
export const getQueriesByType = (type: TestQuery['expectedType']): TestQuery[] => 
  TEST_QUERIES.filter(q => q.expectedType === type);

export const getQueriesByTag = (tag: string): TestQuery[] => 
  TEST_QUERIES.filter(q => q.tags?.includes(tag));

export const getEdgeCases = (): TestQuery[] => 
  TEST_QUERIES.filter(q => q.tags?.includes('edge_case'));

// Query counts for validation
export const QUERY_COUNTS = {
  trading_decision: TEST_QUERIES.filter(q => q.expectedType === 'trading_decision').length,
  portfolio_analysis: TEST_QUERIES.filter(q => q.expectedType === 'portfolio_analysis').length,
  simple_lookup: TEST_QUERIES.filter(q => q.expectedType === 'simple_lookup').length,
  research: TEST_QUERIES.filter(q => q.expectedType === 'research').length,
  chat: TEST_QUERIES.filter(q => q.expectedType === 'chat').length,
  total: TEST_QUERIES.length,
};
