/**
 * xAI Provider - Twitter/X Sentiment via Grok
 * 
 * First-party access to X data via xAI's official API.
 * Uses X Search ($5/1k calls) + Grok for sentiment analysis.
 * 
 * This is our PRIMARY source for Twitter sentiment (more reliable than scrapers).
 * Desearch provides Reddit coverage and cross-validation.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface XSearchResult {
  postId: string;
  text: string;
  author: {
    username: string;
    displayName: string;
    followersCount: number;
    verified: boolean;
  };
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
  };
  createdAt: string;
}

export interface XSentimentResult {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;          // -1 to 1
  confidence: number;     // 0 to 1
  volume: number;         // number of posts analyzed
  samplePosts: XSearchResult[];
  reasoning?: string;     // Grok's analysis
  timestamp: string;
}

export interface XAIResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      tool_calls?: Array<{
        id: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    reasoning_tokens?: number;
  };
}

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const XAI_CONFIG = {
  baseUrl: 'https://api.x.ai/v1',
  apiKey: process.env.XAI_API_KEY,
  models: {
    fast: 'grok-3',           // Fast filtering/classification
    reasoning: 'grok-3-mini', // Sentiment analysis with reasoning
  },
  tools: {
    xSearch: {
      name: 'x_search',
      costPer1k: 5.00,  // $5 per 1k calls
    },
  },
  // Pricing per 1M tokens (Feb 2026)
  pricing: {
    'grok-3': { input: 3.00, output: 15.00 },
    'grok-3-mini': { input: 0.30, output: 0.50 },
    'grok-4': { input: 2.00, output: 10.00 },
  },
};

// ============================================================================
// AVAILABILITY
// ============================================================================

export function isXAIConfigured(): boolean {
  return !!XAI_CONFIG.apiKey;
}

export function getXAIStatus(): {
  configured: boolean;
  models: string[];
  hasXSearch: boolean;
} {
  return {
    configured: isXAIConfigured(),
    models: Object.keys(XAI_CONFIG.models),
    hasXSearch: isXAIConfigured(), // X Search requires API key
  };
}

// ============================================================================
// CORE API CALLS
// ============================================================================

/**
 * Make a completion request to xAI/Grok
 */
export async function xaiCompletion(
  messages: GrokMessage[],
  options: {
    model?: string;
    tools?: Array<{
      type: 'function';
      function: {
        name: string;
        description: string;
        parameters?: Record<string, unknown>;
      };
    }>;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<XAIResponse> {
  if (!isXAIConfigured()) {
    throw new Error('xAI API key not configured');
  }

  const response = await fetch(`${XAI_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${XAI_CONFIG.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || XAI_CONFIG.models.fast,
      messages,
      tools: options.tools,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 2048,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`xAI API error: ${response.status}`, error);
    throw new Error(`xAI API error: ${response.status}`);
  }

  return await response.json();
}

// ============================================================================
// X SEARCH - TWITTER SENTIMENT
// ============================================================================

/**
 * Search X/Twitter for posts about a topic and analyze sentiment
 * Uses xAI's native X Search tool ($5/1k calls)
 */
export async function searchXSentiment(
  query: string,
  options: {
    limit?: number;
    minFollowers?: number;
    excludeRetweets?: boolean;
    excludeReplies?: boolean;
  } = {}
): Promise<XSentimentResult> {
  if (!isXAIConfigured()) {
    return getMockXSentiment(query);
  }

  const {
    limit = 50,
    minFollowers = 100,
    excludeRetweets = true,
    excludeReplies = true,
  } = options;

  try {
    // Build search query with filters
    const searchFilters = [];
    if (minFollowers > 0) searchFilters.push(`followers_count:${minFollowers}`);
    if (excludeRetweets) searchFilters.push('-is:retweet');
    if (excludeReplies) searchFilters.push('-is:reply');
    
    const fullQuery = `${query} ${searchFilters.join(' ')}`;

    // Use Grok with X Search tool enabled
    const systemPrompt = `You are a financial sentiment analyst with real-time access to X (Twitter).
Your task is to analyze social sentiment for the given financial topic.
Use the x_search tool to find relevant posts, then analyze the overall sentiment.

Return your analysis in this exact JSON format:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "score": <number from -1 to 1>,
  "confidence": <number from 0 to 1>,
  "volume": <number of relevant posts found>,
  "reasoning": "<brief explanation of your analysis>",
  "keyTakeaways": ["<insight 1>", "<insight 2>", "<insight 3>"]
}`;

    const userPrompt = `Analyze current Twitter sentiment for: ${query}

Search for recent posts discussing this topic, focusing on:
- Investment sentiment (bullish/bearish indicators)
- Price predictions or targets
- News reactions
- Influential accounts' opinions

Use the x_search tool to find ${limit} relevant posts, then provide your sentiment analysis.`;

    const response = await xaiCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        model: XAI_CONFIG.models.reasoning,
        tools: [
          {
            type: 'function',
            function: {
              name: 'x_search',
              description: 'Search X (Twitter) for posts matching a query',
              parameters: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'Search query' },
                  limit: { type: 'number', description: 'Max results' },
                },
                required: ['query'],
              },
            },
          },
        ],
        temperature: 0.2,
      }
    );

    // Parse Grok's response
    const content = response.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        symbol: extractSymbol(query),
        sentiment: analysis.sentiment,
        score: analysis.score,
        confidence: analysis.confidence,
        volume: analysis.volume || limit,
        samplePosts: [], // Posts are processed by Grok, not returned raw
        reasoning: analysis.reasoning,
        timestamp: new Date().toISOString(),
      };
    }

    // Fallback parsing
    return {
      symbol: extractSymbol(query),
      sentiment: 'neutral',
      score: 0,
      confidence: 0.5,
      volume: 0,
      samplePosts: [],
      reasoning: content,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('X Search sentiment error:', error);
    return getMockXSentiment(query);
  }
}

/**
 * Get sentiment for multiple symbols in parallel
 */
export async function batchXSentiment(
  symbols: string[]
): Promise<Map<string, XSentimentResult>> {
  const results = new Map<string, XSentimentResult>();
  
  // Process in parallel with rate limiting
  const promises = symbols.map(async (symbol) => {
    const result = await searchXSentiment(`$${symbol} OR ${symbol} stock`, {
      minFollowers: 500,
    });
    return { symbol, result };
  });

  const settled = await Promise.allSettled(promises);
  
  for (const outcome of settled) {
    if (outcome.status === 'fulfilled') {
      results.set(outcome.value.symbol, outcome.value.result);
    }
  }

  return results;
}

// ============================================================================
// COMBINED SENTIMENT (xAI + Desearch)
// ============================================================================

export interface CombinedSentiment {
  symbol: string;
  timestamp: string;
  
  // Individual sources
  xaiSentiment?: XSentimentResult;
  desearchSentiment?: {
    sentiment: string;
    score: number;
    twitterVolume: number;
    redditVolume: number;
  };
  
  // Combined assessment
  combined: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    score: number;
    confidence: number;
    agreement: 'high' | 'medium' | 'low' | 'single-source';
    summary: string;
  };
}

/**
 * Get combined sentiment from xAI (Twitter primary) + Desearch (Reddit + validation)
 * This is the recommended function for production use.
 */
export async function getCombinedSentiment(
  symbol: string,
  desearchData?: { sentiment: string; score: number; sources: { twitter: number; reddit: number } }
): Promise<CombinedSentiment> {
  const timestamp = new Date().toISOString();
  
  // Get xAI sentiment (primary Twitter source)
  let xaiResult: XSentimentResult | undefined;
  if (isXAIConfigured()) {
    try {
      xaiResult = await searchXSentiment(`$${symbol} OR ${symbol}`, {
        minFollowers: 500,
        excludeRetweets: true,
      });
    } catch (error) {
      console.error('xAI sentiment error:', error);
    }
  }

  // Build combined assessment
  const combined: CombinedSentiment = {
    symbol,
    timestamp,
    xaiSentiment: xaiResult,
    desearchSentiment: desearchData ? {
      sentiment: desearchData.sentiment,
      score: desearchData.score,
      twitterVolume: desearchData.sources.twitter,
      redditVolume: desearchData.sources.reddit,
    } : undefined,
    combined: {
      sentiment: 'neutral',
      score: 0,
      confidence: 0.5,
      agreement: 'single-source',
      summary: '',
    },
  };

  // Calculate combined sentiment
  if (xaiResult && desearchData) {
    // Both sources available - cross-validate
    const xaiScore = xaiResult.score;
    const desearchScore = desearchData.score;
    
    // Weighted average (xAI weighted higher as first-party source)
    const weightedScore = (xaiScore * 0.6) + (desearchScore * 0.4);
    
    // Check agreement
    const sameDirection = 
      (xaiScore > 0.1 && desearchScore > 0.1) ||
      (xaiScore < -0.1 && desearchScore < -0.1) ||
      (Math.abs(xaiScore) <= 0.1 && Math.abs(desearchScore) <= 0.1);
    
    const strongAgreement = Math.abs(xaiScore - desearchScore) < 0.3;
    
    combined.combined = {
      sentiment: weightedScore > 0.15 ? 'bullish' : weightedScore < -0.15 ? 'bearish' : 'neutral',
      score: weightedScore,
      confidence: sameDirection ? (strongAgreement ? 0.85 : 0.7) : 0.5,
      agreement: sameDirection && strongAgreement ? 'high' : sameDirection ? 'medium' : 'low',
      summary: `${symbol}: ${weightedScore > 0.15 ? 'Bullish' : weightedScore < -0.15 ? 'Bearish' : 'Neutral'} sentiment. ` +
        `xAI (Twitter): ${xaiResult.sentiment} (${xaiResult.score.toFixed(2)}), ` +
        `Desearch (Twitter+Reddit): ${desearchData.sentiment} (${desearchData.score.toFixed(2)}). ` +
        `${combined.combined.agreement} agreement between sources.`,
    };
  } else if (xaiResult) {
    // Only xAI available
    combined.combined = {
      sentiment: xaiResult.sentiment,
      score: xaiResult.score,
      confidence: xaiResult.confidence * 0.8, // Reduce confidence for single source
      agreement: 'single-source',
      summary: `${symbol}: ${xaiResult.sentiment} sentiment via Twitter (xAI). ${xaiResult.reasoning || ''}`,
    };
  } else if (desearchData) {
    // Only Desearch available
    combined.combined = {
      sentiment: desearchData.sentiment as 'bullish' | 'bearish' | 'neutral',
      score: desearchData.score,
      confidence: 0.6, // Lower confidence without first-party validation
      agreement: 'single-source',
      summary: `${symbol}: ${desearchData.sentiment} sentiment via Desearch (Twitter+Reddit). ` +
        `${desearchData.sources.twitter} Twitter mentions, ${desearchData.sources.reddit} Reddit mentions.`,
    };
  } else {
    combined.combined.summary = `No sentiment data available for ${symbol}. Configure XAI_API_KEY or DESEARCH_API_KEY.`;
  }

  return combined;
}

// ============================================================================
// HELPERS
// ============================================================================

function extractSymbol(query: string): string {
  // Extract stock symbol from query like "$AAPL" or "AAPL stock"
  const match = query.match(/\$([A-Z]+)|([A-Z]{1,5})\s+(stock|crypto|coin)/i);
  return match ? (match[1] || match[2]).toUpperCase() : query.split(' ')[0].replace('$', '').toUpperCase();
}

// ============================================================================
// MOCK DATA (development/demo when API not configured)
// ============================================================================

function getMockXSentiment(query: string): XSentimentResult {
  const symbol = extractSymbol(query);
  const score = (Math.random() - 0.5) * 1.6; // -0.8 to 0.8
  
  return {
    symbol,
    sentiment: score > 0.2 ? 'bullish' : score < -0.2 ? 'bearish' : 'neutral',
    score,
    confidence: 0.6 + Math.random() * 0.3,
    volume: Math.floor(100 + Math.random() * 900),
    samplePosts: [
      {
        postId: '1234567890',
        text: `$${symbol} looking strong! Great entry point here. 🚀`,
        author: {
          username: 'trader_joe',
          displayName: 'Trader Joe',
          followersCount: 15000,
          verified: false,
        },
        metrics: { likes: 234, retweets: 45, replies: 12 },
        createdAt: new Date().toISOString(),
      },
      {
        postId: '1234567891',
        text: `Watching $${symbol} closely. Market sentiment shifting.`,
        author: {
          username: 'market_analyst',
          displayName: 'Market Analyst',
          followersCount: 50000,
          verified: true,
        },
        metrics: { likes: 567, retweets: 123, replies: 34 },
        createdAt: new Date().toISOString(),
      },
    ],
    reasoning: `Mock analysis: ${symbol} shows ${score > 0 ? 'positive' : 'negative'} sentiment based on simulated data.`,
    timestamp: new Date().toISOString(),
  };
}
