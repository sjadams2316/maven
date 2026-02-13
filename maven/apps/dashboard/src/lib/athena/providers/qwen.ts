/**
 * Qwen3 Provider
 * 
 * Qwen3 - Open-source reasoning model from Alibaba
 * Supports agentic workflows and complex reasoning at 1/10th Claude's cost
 * 
 * Integration for agentic workflows and cost-effective reasoning in Athena.
 */

// Configuration
const QWEN_API_URL = process.env.QWEN_API_URL || 'https://api-inference.huggingface.co/models/Qwen/Qwen3-32B';
const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_MODEL = process.env.QWEN_MODEL || 'Qwen/Qwen3-32B';

// ============================================================================
// Types
// ============================================================================

export interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface QwenCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  reasoningEnabled?: boolean;
}

export interface QwenResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
      reasoning_content?: string; // For reasoning variants
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface QwenStatus {
  configured: boolean;
  latencyMs: number;
  error?: string;
}

// ============================================================================
// Provider Status
// ============================================================================

/**
 * Check if Qwen3 is properly configured
 */
export function isQwenConfigured(): boolean {
  return !!QWEN_API_KEY;
}

/**
 * Get Qwen3 provider status
 */
export async function getQwenStatus(): Promise<QwenStatus> {
  if (!isQwenConfigured()) {
    return {
      configured: false,
      latencyMs: 0,
      error: 'QWEN_API_KEY not configured',
    };
  }

  const startTime = Date.now();

  try {
    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: 'What is 2+2?',
        parameters: {
          max_new_tokens: 10,
          return_full_text: false,
        },
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
 * Completion with Qwen3
 * 
 * Qwen3 provides strong reasoning capabilities and agentic workflow support.
 */
export async function qwenCompletion(
  messages: QwenMessage[],
  options?: QwenCompletionOptions
): Promise<QwenResponse> {
  if (!isQwenConfigured()) {
    throw new Error('Qwen3 is not configured. Set QWEN_API_KEY environment variable.');
  }

  const maxTokens = options?.maxTokens || 8192;
  const temperature = options?.temperature || 0.6;
  const topP = options?.topP || 0.9;

  // Convert messages to Qwen format (single input string)
  const inputText = messages
    .map((m) => {
      if (m.role === 'system') {
        return `<|system|>\n${m.content}`;
      } else if (m.role === 'user') {
        return `<|user|>\n${m.content}`;
      } else {
        return `<|assistant|>\n${m.content}`;
      }
    })
    .join('\n');

  const response = await fetch(QWEN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${QWEN_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: inputText,
      parameters: {
        max_new_tokens: maxTokens,
        temperature,
        top_p: topP,
        return_full_text: false,
      },
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Qwen3 API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Transform HuggingFace response to our format
  const generatedText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;

  return {
    id: `qwen-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: QWEN_MODEL,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: generatedText || '',
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: Math.floor(inputText.length / 4),
      completion_tokens: Math.floor((generatedText?.length || 0) / 4),
      total_tokens: Math.floor((inputText.length + (generatedText?.length || 0)) / 4),
    },
  };
}

/**
 * Reasoning query - optimized for agentic workflows
 * 
 * Uses Qwen3's agentic capabilities for multi-step task execution.
 */
export async function qwenReasoning(
  prompt: string,
  systemPrompt?: string
): Promise<{
  reasoning: string;
  response: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}> {
  const messages: QwenMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await qwenCompletion(messages, {
    maxTokens: 16384,
    temperature: 0.5,
  });

  const choice = response.choices[0];
  const message = choice.message;

  return {
    reasoning: '', // Qwen3 doesn't have explicit reasoning traces like R1
    response: message.content,
    usage: {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
    },
  };
}

/**
 * Qwen3 for Oracle - agentic workflows and complex queries
 * 
 * Used when query requires multi-step task execution.
 */
export async function qwenOracleQuery(
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

  const systemPrompt = `You are Maven's agentic reasoning engine. You excel at multi-step task execution and complex financial analysis. For each query:
1. Break down the problem into steps
2. Execute each step systematically
3. Provide clear reasoning for each conclusion
4. Suggest actionable next steps

Your response should be structured, thorough, and actionable.`;

  const result = await qwenReasoning(fullQuery, systemPrompt);

  return {
    response: result.response,
    reasoning: result.reasoning,
  };
}

// ============================================================================
// Export default
// ============================================================================

export default {
  completion: qwenCompletion,
  reasoning: qwenReasoning,
  oracleQuery: qwenOracleQuery,
  isConfigured: isQwenConfigured,
  getStatus: getQwenStatus,
};
