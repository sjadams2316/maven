/**
 * MiniMax Provider
 * 
 * MiniMax-M2.1 - Fast, efficient inference for speed path queries
 * 
 * Integration with OpenClaw's MiniMax model for Oracle queries.
 * Used for simple lookups, classification, and fast responses.
 */

// Configuration
const MINIMAX_API_URL = process.env.MINIMAX_API_URL || 'https://api.minimax.chat/v1/text/chatcompletion_v2';
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || 'MiniMax-M2.1';
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;

// ============================================================================
// Types (defined locally)
// ============================================================================

export interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MiniMaxCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface MiniMaxResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface MiniMaxStatus {
  configured: boolean;
  latencyMs: number;
  error?: string;
}

// ============================================================================
// Types
// ============================================================================

export interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MiniMaxCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface MiniMaxResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface MiniMaxStatus {
  configured: boolean;
  latencyMs: number;
  error?: string;
}

// ============================================================================
// Provider Status
// ============================================================================

/**
 * Check if MiniMax is properly configured
 */
export function isMiniMaxConfigured(): boolean {
  return !!MINIMAX_API_KEY;
}

/**
 * Get MiniMax provider status
 */
export async function getMiniMaxStatus(): Promise<MiniMaxStatus> {
  if (!isMiniMaxConfigured()) {
    return {
      configured: false,
      latencyMs: 0,
      error: 'MINIMAX_API_KEY not configured',
    };
  }

  const startTime = Date.now();

  try {
    // Quick health check
    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 5,
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
 * Simple completion with MiniMax
 */
export async function minimaxCompletion(
  messages: MiniMaxMessage[],
  options?: MiniMaxCompletionOptions
): Promise<MiniMaxResponse> {
  if (!isMiniMaxConfigured()) {
    throw new Error('MiniMax is not configured. Set MINIMAX_API_KEY environment variable.');
  }

  const model = options?.model || MINIMAX_MODEL;
  const maxTokens = options?.maxTokens || 4096;
  const temperature = options?.temperature || 0.7;

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: options?.stream || false,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiniMax API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Quick query - simplified interface for simple queries
 */
export async function minimaxQuery(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const messages: MiniMaxMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await minimaxCompletion(messages, {
    maxTokens: 2048,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * MiniMax for Oracle - fast responses for simple queries
 * 
 * This is the SPEED path - used when:
 * - Query is classified as simple_lookup
 * - User wants quick answer
 * - Claude overhead isn't justified
 */
export async function minimaxOracleQuery(
  query: string,
  context?: {
    holdings?: string[];
    recentPrices?: Record<string, number>;
  }
): Promise<{
  response: string;
  thinking?: string;
}> {
  // Build context-aware prompt
  let prompt = query;

  if (context?.holdings && context.holdings.length > 0) {
    prompt = `[CONTEXT: User holds ${context.holdings.join(', ')}]\n\n${query}`;
  }

  if (context?.recentPrices) {
    const priceContext = Object.entries(context.recentPrices)
      .map(([symbol, price]) => `${symbol}: $${price}`)
      .join(', ');
    prompt = `[PRICES: ${priceContext}]\n\n${prompt}`;
  }

  const response = await minimaxQuery(
    prompt,
    `You are Maven's AI assistant. Give concise, helpful answers. You're talking to a wealth management client. Be direct, not overly formal. Keep responses focused on the question asked.`
  );

  return {
    response,
    thinking: 'Processed via MiniMax (speed path)',
  };
}

// ============================================================================
// Streaming (for future use)
// ============================================================================

/**
 * Stream completion from MiniMax
 */
export async function* minimaxStream(
  messages: MiniMaxMessage[],
  options?: MiniMaxCompletionOptions
): AsyncGenerator<string> {
  if (!isMiniMaxConfigured()) {
    throw new Error('MiniMax is not configured');
  }

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: options?.model || MINIMAX_MODEL,
      messages,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`MiniMax API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

// ============================================================================
// Export default
// ============================================================================

export default {
  completion: minimaxCompletion,
  query: minimaxQuery,
  oracleQuery: minimaxOracleQuery,
  stream: minimaxStream,
  isConfigured: isMiniMaxConfigured,
  getStatus: getMiniMaxStatus,
};
