/**
 * Chutes Provider
 * Decentralized LLM inference via Bittensor
 * 
 * Uses OpenAI-compatible API at https://llm.chutes.ai
 * 85-95% cheaper than GPT-4 for bulk analysis
 */

export interface ChutesMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChutesCompletionOptions {
  model?: string;
  messages: ChutesMessage[];
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface ChutesResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  cost: {
    input: number;
    output: number;
    total: number;
  };
}

// Model pricing per 1M tokens (USD)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'deepseek-ai/DeepSeek-V3': { input: 0.30, output: 1.20 },
  'deepseek-ai/DeepSeek-V3.2-TEE': { input: 0.25, output: 0.38 },
  'deepseek-ai/DeepSeek-R1-Distill-Llama-70B': { input: 0.03, output: 0.11 },
  'Qwen/Qwen3-32B': { input: 0.08, output: 0.24 },
  'Qwen/Qwen3-235B-A22B-Instruct-2507-TEE': { input: 0.08, output: 0.55 },
  'NousResearch/Hermes-4-70B': { input: 0.11, output: 0.38 },
  'unsloth/Mistral-Nemo-Instruct-2407': { input: 0.02, output: 0.04 },
};

// Default model for cost-effective analysis
export const CHUTES_DEFAULT_MODEL = 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B';

// Recommended models by use case
export const CHUTES_MODELS = {
  // Ultra cheap - simple tasks, classification
  cheap: 'unsloth/Mistral-Nemo-Instruct-2407',
  // Best value - good reasoning at low cost
  balanced: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
  // High quality - complex analysis
  quality: 'deepseek-ai/DeepSeek-V3.2-TEE',
  // Reasoning - when you need thinking
  reasoning: 'Qwen/Qwen3-235B-A22B-Instruct-2507-TEE',
} as const;

/**
 * Check if Chutes is configured and available
 */
export function isChutesConfigured(): boolean {
  return !!process.env.CHUTES_API_KEY;
}

/**
 * Get Chutes API key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.CHUTES_API_KEY;
  if (!apiKey) {
    throw new Error('CHUTES_API_KEY environment variable not set');
  }
  return apiKey;
}

/**
 * Calculate cost for a completion
 */
function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): { input: number; output: number; total: number } {
  const pricing = MODEL_PRICING[model] || { input: 0.10, output: 0.30 };
  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  return {
    input: inputCost,
    output: outputCost,
    total: inputCost + outputCost,
  };
}

/**
 * Call Chutes API for chat completion
 */
export async function chutesCompletion(
  options: ChutesCompletionOptions
): Promise<ChutesResponse> {
  const apiKey = getApiKey();
  const model = options.model || CHUTES_DEFAULT_MODEL;
  const startTime = Date.now();

  // Build messages array
  const messages: ChutesMessage[] = [];
  
  if (options.systemPrompt) {
    messages.push({
      role: 'system',
      content: options.systemPrompt,
    });
  }
  
  messages.push(...options.messages);

  const response = await fetch('https://llm.chutes.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature ?? 0.7,
    }),
  });

  const latencyMs = Date.now() - startTime;

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `Chutes API error: ${response.status}`;
    
    try {
      const errorJson = JSON.parse(errorBody);
      if (errorJson.detail?.message) {
        errorMessage = errorJson.detail.message;
      }
    } catch {
      // Use status code message
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;
  const content = data.choices?.[0]?.message?.content || '';

  return {
    content,
    model,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
    latencyMs,
    cost: calculateCost(model, promptTokens, completionTokens),
  };
}

/**
 * Simple completion helper for quick queries
 */
export async function chutesQuery(
  query: string,
  options?: {
    model?: string;
    systemPrompt?: string;
    maxTokens?: number;
  }
): Promise<string> {
  const response = await chutesCompletion({
    model: options?.model,
    messages: [{ role: 'user', content: query }],
    systemPrompt: options?.systemPrompt,
    maxTokens: options?.maxTokens,
  });
  
  return response.content;
}

/**
 * Batch multiple queries for efficiency
 */
export async function chutesBatch(
  queries: Array<{
    id: string;
    query: string;
    systemPrompt?: string;
  }>,
  options?: {
    model?: string;
    maxTokens?: number;
    concurrency?: number;
  }
): Promise<Array<{ id: string; response: ChutesResponse | null; error?: string }>> {
  const concurrency = options?.concurrency || 3;
  const results: Array<{ id: string; response: ChutesResponse | null; error?: string }> = [];
  
  // Process in batches
  for (let i = 0; i < queries.length; i += concurrency) {
    const batch = queries.slice(i, i + concurrency);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (q) => {
        const response = await chutesCompletion({
          model: options?.model,
          messages: [{ role: 'user', content: q.query }],
          systemPrompt: q.systemPrompt,
          maxTokens: options?.maxTokens,
        });
        return { id: q.id, response };
      })
    );
    
    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      const queryId = batch[j].id;
      
      if (result.status === 'fulfilled') {
        results.push({ id: queryId, response: result.value.response });
      } else {
        results.push({ 
          id: queryId, 
          response: null, 
          error: result.reason?.message || 'Unknown error' 
        });
      }
    }
  }
  
  return results;
}

/**
 * Portfolio analysis using Chutes (cost-effective bulk analysis)
 */
export async function analyzePortfolioWithChutes(
  holdings: Array<{ ticker: string; shares: number; value: number }>,
  question: string
): Promise<{
  analysis: string;
  cost: number;
  latencyMs: number;
}> {
  const holdingsText = holdings
    .map((h) => `${h.ticker}: ${h.shares} shares ($${h.value.toLocaleString()})`)
    .join('\n');

  const systemPrompt = `You are a financial analyst assistant. Analyze the portfolio and answer questions clearly and concisely. Provide actionable insights when relevant.`;

  const prompt = `Portfolio Holdings:
${holdingsText}

Question: ${question}

Provide a clear, professional analysis.`;

  const response = await chutesCompletion({
    model: CHUTES_MODELS.balanced,
    messages: [{ role: 'user', content: prompt }],
    systemPrompt,
    maxTokens: 1500,
    temperature: 0.3, // Lower for more factual responses
  });

  return {
    analysis: response.content,
    cost: response.cost.total,
    latencyMs: response.latencyMs,
  };
}
