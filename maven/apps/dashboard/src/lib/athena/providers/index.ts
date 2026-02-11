/**
 * Athena Providers Index
 * All AI providers available to Athena
 */

// Chutes - Decentralized LLM inference via Bittensor
export {
  chutesCompletion,
  chutesQuery,
  chutesBatch,
  analyzePortfolioWithChutes,
  isChutesConfigured,
  CHUTES_DEFAULT_MODEL,
  CHUTES_MODELS,
  type ChutesMessage,
  type ChutesCompletionOptions,
  type ChutesResponse,
} from './chutes';

// Groq - Ultra-fast inference for real-time queries
export {
  groqCompletion,
  groqQuery,
  groqClassify,
  isGroqConfigured,
  GROQ_DEFAULT_MODEL,
  GROQ_MODELS,
  type GroqMessage,
  type GroqCompletionOptions,
  type GroqResponse,
} from './groq';

// Provider availability check
export function getAvailableProviders(): string[] {
  const providers: string[] = [];
  
  // Check Chutes
  if (process.env.CHUTES_API_KEY) {
    providers.push('chutes');
  }
  
  // Check Anthropic/Claude
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push('claude');
  }
  
  // Check OpenAI (for Groq-like fast inference)
  if (process.env.OPENAI_API_KEY) {
    providers.push('openai');
  }
  
  // Check Groq
  if (process.env.GROQ_API_KEY) {
    providers.push('groq');
  }
  
  // Check Perplexity
  if (process.env.PERPLEXITY_API_KEY) {
    providers.push('perplexity');
  }
  
  return providers;
}
