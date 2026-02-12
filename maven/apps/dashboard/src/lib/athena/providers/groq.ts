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
export async function groqClassifySimple(
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

type DataSourceId = 'groq' | 'claude' | 'perplexity' | 'xai' | 'chutes' | 'vanta' | 'precog' | 'desearch' | 'mantis' | 'bitquant' | 'numinous' | 'gopher';

/**
 * Query classification for Athena routing
 * Returns structured classification with type, urgency, complexity
 */
export async function groqClassify(
  query: string,
  holdings?: string[]
): Promise<{
  type: 'chat' | 'trading_decision' | 'portfolio_analysis' | 'research' | 'simple_lookup';
  urgency: 'realtime' | 'normal' | 'background';
  complexity: 'low' | 'medium' | 'high';
  dataSources: DataSourceId[];
  confidence: number;
  reasoning?: string;
}> {
  const systemPrompt = `You classify financial queries for routing. Respond with ONLY valid JSON, no markdown.

Query Types:
- chat: General conversation, greetings, off-topic
- trading_decision: Buy/sell/hold decisions, timing, position sizing
- portfolio_analysis: Allocation, rebalancing, risk, performance review
- research: Deep analysis, company fundamentals, market research
- simple_lookup: Price checks, quick facts, definitions

Urgency:
- realtime: Needs instant response (price, quick question)
- normal: Standard response time ok
- background: Can take longer for thorough analysis

Complexity:
- low: Simple question, single topic
- medium: Multiple factors, some analysis
- high: Complex reasoning, multiple assets, trade-offs

Data Sources (pick relevant ones):
- groq: Fast chat and classification
- chutes: Bulk analysis, cost-effective
- claude: Complex reasoning
- xai: Twitter sentiment
- vanta: Trading signals
- desearch: Reddit sentiment

${holdings ? `User holds: ${holdings.join(', ')}` : ''}

Respond with JSON: {"type":"...", "urgency":"...", "complexity":"...", "dataSources":["..."], "confidence":0.X}`;

  try {
    const response = await groqCompletion({
      model: GROQ_MODELS.llama3_8b,
      messages: [{ role: 'user', content: query }],
      systemPrompt,
      maxTokens: 150,
      temperature: 0,
    });

    // Parse JSON response
    const content = response.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate dataSources
    const validSources: DataSourceId[] = ['groq', 'claude', 'perplexity', 'xai', 'chutes', 'vanta', 'precog', 'desearch', 'mantis', 'bitquant', 'numinous', 'gopher'];
    const dataSources = (parsed.dataSources || ['groq']).filter(
      (s: string) => validSources.includes(s as DataSourceId)
    ) as DataSourceId[];
    
    return {
      type: parsed.type || 'chat',
      urgency: parsed.urgency || 'normal',
      complexity: parsed.complexity || 'low',
      dataSources: dataSources.length > 0 ? dataSources : ['groq'],
      confidence: parsed.confidence || 0.8,
      reasoning: `Groq classification (${response.latencyMs}ms)`,
    };
  } catch (e) {
    // Fallback to simple classification
    console.warn('Groq classification parse error, using defaults:', e);
    return {
      type: 'chat',
      urgency: 'normal',
      complexity: 'low',
      dataSources: ['groq'] as DataSourceId[],
      confidence: 0.5,
      reasoning: 'Fallback classification',
    };
  }
}
