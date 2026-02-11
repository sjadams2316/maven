/**
 * Groq Provider
 * Ultra-fast inference for real-time queries
 * 
 * Groq's LPU (Language Processing Unit) provides:
 * - Sub-second latency for most queries
 * - Free tier: 14,400 requests/day, 18K tokens/minute
 * - Great for: Chat, classification, simple lookups
 * 
 * Get free API key: https://console.groq.com
 */

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqCompletionOptions {
  model?: string;
  messages: GroqMessage[];
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface GroqResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  tokensPerSecond: number;
}

// Available Groq models (as of Feb 2026)
export const GROQ_MODELS = {
  // Fastest - great for classification, simple chat
  llama3_8b: 'llama-3.3-70b-versatile',
  // Best quality/speed balance
  llama3_70b: 'llama-3.3-70b-versatile', 
  // Mixtral - good for varied tasks
  mixtral: 'mixtral-8x7b-32768',
  // DeepSeek R1 - reasoning (slower but smarter)
  deepseek: 'deepseek-r1-distill-llama-70b',
} as const;

// Default model for speed-critical paths
export const GROQ_DEFAULT_MODEL = GROQ_MODELS.llama3_70b;

/**
 * Check if Groq is configured
 */
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

/**
 * Get Groq API key
 */
function getApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }
  return apiKey;
}

/**
 * Call Groq API for chat completion
 */
export async function groqCompletion(
  options: GroqCompletionOptions
): Promise<GroqResponse> {
  const apiKey = getApiKey();
  const model = options.model || GROQ_DEFAULT_MODEL;
  const startTime = Date.now();

  // Build messages array
  const messages: GroqMessage[] = [];
  
  if (options.systemPrompt) {
    messages.push({
      role: 'system',
      content: options.systemPrompt,
    });
  }
  
  messages.push(...options.messages);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature ?? 0.7,
    }),
  });

  const latencyMs = Date.now() - startTime;

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `Groq API error: ${response.status}`;
    
    try {
      const errorJson = JSON.parse(errorBody);
      if (errorJson.error?.message) {
        errorMessage = errorJson.error.message;
      }
    } catch {
      // Use status code message
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;
  const totalTokens = promptTokens + completionTokens;
  const content = data.choices?.[0]?.message?.content || '';
  
  // Calculate tokens per second (Groq's speed metric)
  const tokensPerSecond = latencyMs > 0 
    ? Math.round((completionTokens / latencyMs) * 1000)
    : 0;

  return {
    content,
    model,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens,
    },
    latencyMs,
    tokensPerSecond,
  };
}

/**
 * Simple query helper for quick lookups
 */
export async function groqQuery(
  query: string,
  options?: {
    model?: string;
    systemPrompt?: string;
    maxTokens?: number;
  }
): Promise<string> {
  const response = await groqCompletion({
    model: options?.model,
    messages: [{ role: 'user', content: query }],
    systemPrompt: options?.systemPrompt,
    maxTokens: options?.maxTokens,
  });
  
  return response.content;
}

/**
 * Fast classification - ideal for routing decisions
 */
export async function groqClassify(
  text: string,
  categories: string[],
  options?: {
    model?: string;
  }
): Promise<{ category: string; confidence: number }> {
  const systemPrompt = `You are a classifier. Respond with ONLY the category name, nothing else.
Valid categories: ${categories.join(', ')}`;

  const response = await groqCompletion({
    model: options?.model || GROQ_MODELS.llama3_8b, // Use fastest model
    messages: [{ role: 'user', content: `Classify this text:\n\n${text}` }],
    systemPrompt,
    maxTokens: 50,
    temperature: 0,
  });

  const category = response.content.trim().toLowerCase();
  const matchedCategory = categories.find(
    c => c.toLowerCase() === category || category.includes(c.toLowerCase())
  );

  return {
    category: matchedCategory || categories[0],
    confidence: matchedCategory ? 0.9 : 0.5,
  };
}
