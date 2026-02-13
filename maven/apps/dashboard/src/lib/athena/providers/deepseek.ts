/**
 * DeepSeek Provider
 * 
 * DeepSeek R1 - Open-source reasoning model matching OpenAI o1 at 2% of cost
 * 
 * Integration for complex reasoning queries in Athena.
 * Uses Chutes API which hosts DeepSeek V3 and can route to R1.
 */

// Configuration
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-reasoner';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// ============================================================================
// Types (defined locally)
// ============================================================================

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  reasoningEnabled?: boolean;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
      reasoning_content?: string; // R1's reasoning trace
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details?: {
      reasoning_tokens?: number;
    };
  };
}

export interface DeepSeekStatus {
  configured: boolean;
  latencyMs: number;
  error?: string;
}

// ============================================================================
// Types
// ============================================================================

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  reasoningEnabled?: boolean;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
      reasoning_content?: string; // R1's reasoning trace
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details?: {
      reasoning_tokens?: number;
    };
  };
}

export interface DeepSeekStatus {
  configured: boolean;
  latencyMs: number;
  error?: string;
}

// ============================================================================
// Provider Status
// ============================================================================

/**
 * Check if DeepSeek is properly configured
 */
export function isDeepSeekConfigured(): boolean {
  return !!DEEPSEEK_API_KEY;
}

/**
 * Get DeepSeek provider status
 */
export async function getDeepSeekStatus(): Promise<DeepSeekStatus> {
  if (!isDeepSeekConfigured()) {
    return {
      configured: false,
      latencyMs: 0,
      error: 'DEEPSEEK_API_KEY not configured',
    };
  }

  const startTime = Date.now();

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: 'user', content: 'What is 2+2?' }],
        max_tokens: 10,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        configured: true,
        latencyMs: Date.now() - startTime,
        error: `API error: ${response.status}`,
      };
    }

    return {
      configured: true,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      configured: true,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Core API
// ============================================================================

/**
 * Completion with DeepSeek R1
 * 
 * R1 provides reasoning traces that can be shown to users for transparency.
 */
export async function deepseekCompletion(
  messages: DeepSeekMessage[],
  options?: DeepSeekCompletionOptions
): Promise<DeepSeekResponse> {
  if (!isDeepSeekConfigured()) {
    throw new Error('DeepSeek is not configured. Set DEEPSEEK_API_KEY environment variable.');
  }

  const model = options?.model || DEEPSEEK_MODEL;
  const maxTokens = options?.maxTokens || 8192;
  const temperature = options?.temperature || 0.6;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Reasoning query - optimized for complex trading decisions
 * 
 * Uses R1's reasoning capabilities for multi-step analysis.
 */
export async function deepseekReasoning(
  prompt: string,
  systemPrompt?: string
): Promise<{
  reasoning: string; // The reasoning trace
  response: string; // The final answer
  usage: {
    promptTokens: number;
    completionTokens: number;
    reasoningTokens: number;
  };
}> {
  const messages: DeepSeekMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await deepseekCompletion(messages, {
    maxTokens: 16384, // R1 supports larger outputs for reasoning
    temperature: 0.5, // Lower temp for more consistent reasoning
  });

  const choice = response.choices[0];
  const message = choice.message;

  return {
    reasoning: message.reasoning_content || '',
    response: message.content,
    usage: {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      reasoningTokens: response.usage.prompt_tokens_details?.reasoning_tokens || 0,
    },
  };
}

/**
 * DeepSeek for Oracle - complex reasoning queries
 * 
 * Used when query is classified as high complexity trading decision.
 */
export async function deepseekOracleQuery(
  query: string,
  context?: {
    holdings?: string[];
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    recentPrices?: Record<string, number>;
  }
): Promise<{
  response: string;
  reasoning: string;
}> {
  // Build context-aware prompt
  let fullQuery = query;

  if (context?.holdings && context.holdings.length > 0) {
    fullQuery = `[CONTEXT: User holds ${context.holdings.join(', ')}]\n\n${query}`;
  }

  if (context?.riskTolerance) {
    fullQuery = `[RISK PROFILE: ${context.riskTolerance}]\n\n${fullQuery}`;
  }

  if (context?.recentPrices) {
    const priceContext = Object.entries(context.recentPrices)
      .map(([symbol, price]) => `${symbol}: $${price}`)
      .join(', ');
    fullQuery = `[CURRENT PRICES: ${priceContext}]\n\n${fullQuery}`;
  }

  const systemPrompt = `You are Maven's advanced reasoning engine. You analyze complex financial queries and provide step-by-step reasoning before your conclusion. Your reasoning will be visible to users, so be transparent about your thought process. Focus on:
1. Identifying key factors
2. Evaluating risks and opportunities
3. Considering multiple scenarios
4. Providing actionable insights`;

  const result = await deepseekReasoning(fullQuery, systemPrompt);

  return {
    response: result.response,
    reasoning: result.reasoning,
  };
}

// ============================================================================
// Export default
// ============================================================================

export default {
  completion: deepseekCompletion,
  reasoning: deepseekReasoning,
  oracleQuery: deepseekOracleQuery,
  isConfigured: isDeepSeekConfigured,
  getStatus: getDeepSeekStatus,
};
