/**
 * Claude Provider
 * Deep reasoning for complex queries that exceed fast path capabilities
 */

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeCompletionOptions {
  model?: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface ClaudeResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}

// Claude synthesis input (from orchestrator)
export interface ClaudeSynthesisInput {
  query: string;
  sources: Array<{
    id: string;
    response: string;
    metadata?: Record<string, unknown>;
  }>;
  context?: Record<string, unknown>;
}

// Claude synthesis output
export interface ClaudeSynthesisOutput {
  synthesis: string;
  confidence: number;
  citations: Array<{ sourceId: string; excerpt: string }>;
  reasoning?: string;
}

// Available Claude models
export const CLAUDE_MODELS = {
  sonnet: 'claude-sonnet-4-20250514',
  opus: 'claude-opus-4-20250514',
  haiku: 'claude-haiku-4-20250514',
} as const;

export const CLAUDE_DEFAULT_MODEL = CLAUDE_MODELS.sonnet;

/**
 * Check if Claude is configured
 */
export function isClaudeConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Get Claude API key
 */
function getApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set');
  }
  return apiKey;
}

/**
 * Call Claude API for chat completion
 */
export async function claudeCompletion(
  options: ClaudeCompletionOptions
): Promise<ClaudeResponse> {
  const apiKey = getApiKey();
  const model = options.model || CLAUDE_DEFAULT_MODEL;
  const startTime = Date.now();

  // Build messages array (Claude format)
  const messages: { role: 'user' | 'assistant'; content: string }[] = [];
  
  if (options.systemPrompt) {
    messages.push({ role: 'assistant', content: options.systemPrompt });
  }
  
  messages.push(...options.messages);

  const response = await fetch('https://api.anthropic.com/v1/complete', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      prompt: messages.map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`).join('\n\n'),
      max_tokens_to_sample: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
    }),
  });

  const latencyMs = Date.now() - startTime;

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  
  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;

  return {
    content: data.completion || '',
    model,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
    latencyMs,
  };
}

/**
 * Simple completion helper for queries
 */
export async function claudeQuery(
  query: string,
  options?: {
    model?: string;
    systemPrompt?: string;
    maxTokens?: number;
  }
): Promise<string> {
  const response = await claudeCompletion({
    model: options?.model,
    messages: [{ role: 'user', content: query }],
    systemPrompt: options?.systemPrompt,
    maxTokens: options?.maxTokens,
  });
  
  return response.content;
}

/**
 * Extended reasoning completion for complex queries
 */
export async function claudeReasoning(
  query: string,
  systemPrompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
  }
): Promise<{ response: string; reasoning: string }> {
  const response = await claudeCompletion({
    model: options?.model || CLAUDE_MODELS.opus,
    messages: [{ role: 'user', content: `${systemPrompt}\n\n${query}` }],
    maxTokens: options?.maxTokens || 8192,
    temperature: 0.5,
  });
  
  // Extract reasoning from response (Claude can output structured reasoning)
  const reasoningMatch = response.content.match(/<reasoning>([\s\S]*?)<\/reasoning>/);
  const reasoning = reasoningMatch ? reasoningMatch[1] : '';
  const cleanResponse = response.content.replace(/<reasoning>[\s\S]*?<\/reasoning>/g, '').trim();
  
  return {
    response: cleanResponse,
    reasoning: reasoning.trim(),
  };
}

/**
 * Synthesis function for multi-source queries
 * Combines responses from multiple sources into coherent answer
 */
export async function claudeSynthesize(
  input: ClaudeSynthesisInput,
  options?: {
    model?: string;
    maxTokens?: number;
  }
): Promise<ClaudeSynthesisOutput> {
  const { query, sources, context } = input;
  
  // Build synthesis prompt
  const sourceContext = sources
    .map((s, i) => `--- Source ${i + 1} (${s.id}) ---\n${s.response}`)
    .join('\n\n');
  
  const systemPrompt = `You are a synthesis engine. Combine information from multiple sources into a coherent, accurate response.
  
Respond in the same language as the query. Provide a clear, concise synthesis that:
1. Directly answers the user's question
2. Cites sources where appropriate
3. Acknowledges any uncertainty or conflicting information
4. Provides actionable insights when relevant

Context: ${JSON.stringify(context || {})}

If sources conflict, explain the different perspectives.`;

  const response = await claudeCompletion({
    model: options?.model || CLAUDE_MODELS.sonnet,
    messages: [{ role: 'user', content: `Query: ${query}\n\nSources:\n${sourceContext}` }],
    systemPrompt,
    maxTokens: options?.maxTokens || 2048,
    temperature: 0.3,
  });
  
  // Extract citations from response (format: [Source 1], [Source 2], etc.)
  const citations: ClaudeSynthesisOutput['citations'] = [];
  const citationRegex = /\[Source (\d+)\]/g;
  let match;
  while ((match = citationRegex.exec(response.content)) !== null) {
    const sourceIndex = parseInt(match[1]) - 1;
    if (sourceIndex >= 0 && sourceIndex < sources.length) {
      citations.push({
        sourceId: sources[sourceIndex].id,
        excerpt: sources[sourceIndex].response.substring(0, 200),
      });
    }
  }
  
  return {
    synthesis: response.content,
    confidence: 0.8, // Claude synthesis is generally high confidence
    citations,
  };
}
