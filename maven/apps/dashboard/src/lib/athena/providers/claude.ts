/**
 * Claude Provider
 * The synthesis brain of Athena
 * 
 * Claude's role in Athena:
 * - NOT just another LLM option
 * - THE reasoning layer that synthesizes all inputs
 * - Takes outputs from Groq, Chutes, Perplexity, xAI
 * - Produces final wisdom for wealth management decisions
 * 
 * This is the multiplier effect - Claude directs and synthesizes.
 */

import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// TYPES
// ============================================================================

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeSynthesisInput {
  query: string;
  
  // Raw response from initial LLM (Groq/Chutes)
  initialResponse?: string;
  
  // Research from Perplexity (with citations)
  research?: {
    content: string;
    citations: Array<{ url: string; title?: string }>;
  };
  
  // Sentiment from xAI
  sentiment?: {
    symbol: string;
    direction: 'bullish' | 'bearish' | 'neutral';
    score: number;
    confidence: number;
    summary: string;
  }[];
  
  // Trading signals from Vanta
  tradingSignals?: {
    symbol: string;
    direction: 'LONG' | 'SHORT' | 'FLAT';
    confidence: number;
  }[];
  
  // Client context
  context?: {
    holdings?: string[];
    riskTolerance?: string;
  };
}

export interface ClaudeResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  latencyMs: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const CLAUDE_MODELS = {
  // Sonnet for most synthesis tasks (fast, capable)
  sonnet: 'claude-sonnet-4-20250514',
  // Opus for complex reasoning (slower but deeper)
  opus: 'claude-opus-4-20250514',
  // Haiku for simple tasks (fastest, cheapest)
  haiku: 'claude-3-5-haiku-20241022',
} as const;

export const CLAUDE_DEFAULT_MODEL = CLAUDE_MODELS.sonnet;

// ============================================================================
// AVAILABILITY
// ============================================================================

export function isClaudeConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export function getClaudeStatus(): { configured: boolean; model: string } {
  return {
    configured: isClaudeConfigured(),
    model: CLAUDE_DEFAULT_MODEL,
  };
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Get Anthropic client
 */
function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  return new Anthropic({ apiKey });
}

/**
 * Simple Claude completion
 */
export async function claudeCompletion(
  messages: ClaudeMessage[],
  options?: {
    model?: string;
    systemPrompt?: string;
    maxTokens?: number;
  }
): Promise<ClaudeResponse> {
  const client = getClient();
  const model = options?.model || CLAUDE_DEFAULT_MODEL;
  const startTime = Date.now();

  const response = await client.messages.create({
    model,
    max_tokens: options?.maxTokens || 2048,
    system: options?.systemPrompt,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  });

  const content = response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';

  return {
    content,
    model,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
    latencyMs: Date.now() - startTime,
  };
}

/**
 * Claude synthesis - THE BRAIN
 * Takes all gathered intelligence and produces unified wisdom
 */
export async function claudeSynthesize(
  input: ClaudeSynthesisInput
): Promise<ClaudeResponse> {
  const client = getClient();
  const startTime = Date.now();

  // Build the synthesis prompt
  const synthesisPrompt = buildSynthesisPrompt(input);

  const response = await client.messages.create({
    model: CLAUDE_DEFAULT_MODEL,
    max_tokens: 2048,
    system: `You are Maven Oracle's synthesis brain. Your job is to take multiple intelligence sources and produce a unified, actionable response for wealth management.

You have access to:
- Initial analysis from fast/cheap models
- Real-time research with citations from Perplexity
- Twitter sentiment from xAI
- Trading signals from Vanta (when available)
- Client context (holdings, risk tolerance)

Your response should:
1. Synthesize all sources into coherent advice
2. Highlight where sources agree or disagree
3. Be specific and actionable
4. Cite sources when relevant
5. Consider the client's context

Do NOT just summarize each source - SYNTHESIZE them into wisdom.`,
    messages: [{ role: 'user', content: synthesisPrompt }],
  });

  const content = response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';

  return {
    content,
    model: CLAUDE_DEFAULT_MODEL,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
    latencyMs: Date.now() - startTime,
  };
}

/**
 * Build the synthesis prompt from all inputs
 */
function buildSynthesisPrompt(input: ClaudeSynthesisInput): string {
  const sections: string[] = [];
  
  sections.push(`## User Query\n${input.query}`);
  
  if (input.context?.holdings?.length) {
    sections.push(`## Client Holdings\n${input.context.holdings.join(', ')}`);
  }
  
  if (input.context?.riskTolerance) {
    sections.push(`## Risk Tolerance\n${input.context.riskTolerance}`);
  }
  
  if (input.initialResponse) {
    sections.push(`## Initial Analysis\n${input.initialResponse}`);
  }
  
  if (input.research) {
    let researchSection = `## Research (Perplexity)\n${input.research.content}`;
    if (input.research.citations.length > 0) {
      researchSection += '\n\nSources:\n' + input.research.citations
        .map((c, i) => `${i + 1}. ${c.title || c.url}`)
        .join('\n');
    }
    sections.push(researchSection);
  }
  
  if (input.sentiment && input.sentiment.length > 0) {
    const sentimentLines = input.sentiment.map(s => 
      `- ${s.symbol}: ${s.direction} (score: ${s.score.toFixed(2)}, confidence: ${(s.confidence * 100).toFixed(0)}%)`
    );
    sections.push(`## Twitter Sentiment (xAI)\n${sentimentLines.join('\n')}`);
  }
  
  if (input.tradingSignals && input.tradingSignals.length > 0) {
    const signalLines = input.tradingSignals.map(s =>
      `- ${s.symbol}: ${s.direction} (confidence: ${(s.confidence * 100).toFixed(0)}%)`
    );
    sections.push(`## Trading Signals (Vanta)\n${signalLines.join('\n')}`);
  }
  
  sections.push(`## Your Task\nSynthesize all the above into a clear, actionable response. Where sources agree, emphasize confidence. Where they disagree, explain the nuance. Be specific to this client's situation.`);
  
  return sections.join('\n\n');
}

/**
 * Quick Claude query for simple reasoning tasks
 */
export async function claudeQuery(
  query: string,
  options?: {
    systemPrompt?: string;
    model?: string;
  }
): Promise<string> {
  const response = await claudeCompletion(
    [{ role: 'user', content: query }],
    options
  );
  return response.content;
}
