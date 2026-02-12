/**
 * Perplexity Provider
 * Real-time research with citations
 * 
 * This is the "deep research" path for Athena:
 * - Web search with real-time data
 * - Cited sources (crucial for trust/compliance)
 * - Great for: Market news, company research, regulatory updates
 * 
 * API Docs: https://docs.perplexity.ai/
 * Pricing: ~$5/1000 requests (sonar-small), ~$20/1000 (sonar-large)
 */

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityCitation {
  url: string;
  title?: string;
  snippet?: string;
}

export interface PerplexityResponse {
  content: string;
  citations: PerplexityCitation[];
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}

export interface PerplexityCompletionOptions {
  model?: string;
  messages: PerplexityMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  returnCitations?: boolean;
  searchRecency?: 'hour' | 'day' | 'week' | 'month' | 'year';
}

// Perplexity models
export const PERPLEXITY_MODELS = {
  // Sonar models - optimized for search
  sonar_small: 'sonar',                    // Fast, cheap, good for quick lookups
  sonar_medium: 'sonar-pro',               // Better reasoning
  sonar_large: 'sonar-reasoning',          // Best for complex research (uses CoT)
  
  // For backward compatibility
  default: 'sonar-pro',
} as const;

export const PERPLEXITY_DEFAULT_MODEL = PERPLEXITY_MODELS.sonar_medium;

/**
 * Check if Perplexity is configured
 */
export function isPerplexityConfigured(): boolean {
  return !!process.env.PERPLEXITY_API_KEY;
}

/**
 * Get Perplexity status
 */
export function getPerplexityStatus(): {
  configured: boolean;
  model: string;
} {
  return {
    configured: isPerplexityConfigured(),
    model: PERPLEXITY_DEFAULT_MODEL,
  };
}

/**
 * Get API key
 */
function getApiKey(): string {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }
  return apiKey;
}

/**
 * Call Perplexity API
 */
export async function perplexityCompletion(
  options: PerplexityCompletionOptions
): Promise<PerplexityResponse> {
  const apiKey = getApiKey();
  const model = options.model || PERPLEXITY_DEFAULT_MODEL;
  const startTime = Date.now();

  // Build messages
  const messages: PerplexityMessage[] = [];
  
  if (options.systemPrompt) {
    messages.push({
      role: 'system',
      content: options.systemPrompt,
    });
  }
  
  messages.push(...options.messages);

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.2, // Lower temp for factual research
      return_citations: options.returnCitations ?? true,
      search_recency_filter: options.searchRecency || 'week',
    }),
  });

  const latencyMs = Date.now() - startTime;

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `Perplexity API error: ${response.status}`;
    
    try {
      const errorJson = JSON.parse(errorBody);
      if (errorJson.error?.message) {
        errorMessage = errorJson.error.message;
      }
    } catch {
      // Use status message
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Extract citations from response
  const citations: PerplexityCitation[] = (data.citations || []).map((c: any) => ({
    url: c.url || c,
    title: c.title,
    snippet: c.snippet,
  }));

  return {
    content: data.choices?.[0]?.message?.content || '',
    citations,
    model,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
    latencyMs,
  };
}

/**
 * Simple research query
 */
export async function perplexityResearch(
  query: string,
  options?: {
    model?: string;
    systemPrompt?: string;
    recency?: 'hour' | 'day' | 'week' | 'month';
  }
): Promise<{ content: string; citations: PerplexityCitation[]; latencyMs: number }> {
  const systemPrompt = options?.systemPrompt || 
    `You are a financial research assistant. Provide accurate, up-to-date information with clear citations. 
Focus on facts, data, and recent developments. Always cite your sources.`;

  const response = await perplexityCompletion({
    model: options?.model,
    messages: [{ role: 'user', content: query }],
    systemPrompt,
    searchRecency: options?.recency || 'week',
    returnCitations: true,
  });

  return {
    content: response.content,
    citations: response.citations,
    latencyMs: response.latencyMs,
  };
}

/**
 * Research a specific stock/company
 */
export async function researchStock(
  symbol: string,
  options?: {
    focus?: 'news' | 'earnings' | 'analysis' | 'general';
    recency?: 'hour' | 'day' | 'week';
  }
): Promise<{
  summary: string;
  keyPoints: string[];
  citations: PerplexityCitation[];
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
  latencyMs: number;
}> {
  const focus = options?.focus || 'general';
  
  const queries: Record<string, string> = {
    news: `What are the latest news and developments for ${symbol} stock? Focus on price-moving events from the past few days.`,
    earnings: `What are the recent earnings results and analyst expectations for ${symbol}? Include revenue, EPS, and guidance.`,
    analysis: `What is the current analyst sentiment and price targets for ${symbol}? Include recent upgrades/downgrades.`,
    general: `Provide a comprehensive update on ${symbol} stock including recent news, analyst views, and key developments.`,
  };

  const response = await perplexityCompletion({
    model: PERPLEXITY_MODELS.sonar_medium,
    messages: [{ role: 'user', content: queries[focus] }],
    systemPrompt: `You are a financial analyst providing research on stocks. Be factual, cite sources, and highlight key points. Format with clear sections.`,
    searchRecency: options?.recency || 'week',
    returnCitations: true,
  });

  // Extract key points (look for bullet points or numbered items)
  const keyPoints: string[] = [];
  const bulletMatches = response.content.match(/[-•*]\s*(.+?)(?=\n|$)/g);
  if (bulletMatches) {
    keyPoints.push(...bulletMatches.slice(0, 5).map(b => b.replace(/^[-•*]\s*/, '').trim()));
  }

  // Try to infer sentiment from content
  let sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' | undefined;
  const content = response.content.toLowerCase();
  const positiveWords = ['bullish', 'upgrade', 'beat', 'growth', 'strong', 'positive', 'outperform'];
  const negativeWords = ['bearish', 'downgrade', 'miss', 'decline', 'weak', 'negative', 'underperform'];
  
  const posCount = positiveWords.filter(w => content.includes(w)).length;
  const negCount = negativeWords.filter(w => content.includes(w)).length;
  
  if (posCount > negCount + 1) sentiment = 'positive';
  else if (negCount > posCount + 1) sentiment = 'negative';
  else if (posCount > 0 && negCount > 0) sentiment = 'mixed';
  else sentiment = 'neutral';

  return {
    summary: response.content,
    keyPoints,
    citations: response.citations,
    sentiment,
    latencyMs: response.latencyMs,
  };
}

/**
 * Research market/macro topic
 */
export async function researchMarket(
  topic: string,
  options?: {
    recency?: 'hour' | 'day' | 'week';
  }
): Promise<{
  content: string;
  citations: PerplexityCitation[];
  latencyMs: number;
}> {
  const response = await perplexityCompletion({
    model: PERPLEXITY_MODELS.sonar_medium,
    messages: [{ 
      role: 'user', 
      content: `Provide an update on: ${topic}. Focus on recent developments, market impact, and key data points.` 
    }],
    systemPrompt: `You are a macro research analyst. Provide factual, well-sourced analysis of market topics. Include relevant data and cite your sources.`,
    searchRecency: options?.recency || 'day',
    returnCitations: true,
  });

  return {
    content: response.content,
    citations: response.citations,
    latencyMs: response.latencyMs,
  };
}

/**
 * Format citations for display
 */
export function formatCitations(citations: PerplexityCitation[]): string {
  if (citations.length === 0) return '';
  
  const lines = ['', '**Sources:**'];
  citations.forEach((c, i) => {
    const title = c.title || new URL(c.url).hostname;
    lines.push(`${i + 1}. [${title}](${c.url})`);
  });
  
  return lines.join('\n');
}

/**
 * Format response with citations for Oracle
 */
export function formatResearchForOracle(
  content: string,
  citations: PerplexityCitation[]
): string {
  // Remove any existing citation markers like [1], [2]
  let cleaned = content.replace(/\[\d+\]/g, '');
  
  // Add formatted citations at the end
  if (citations.length > 0) {
    cleaned += formatCitations(citations);
  }
  
  return cleaned;
}
