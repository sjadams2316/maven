import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MAVEN_KNOWLEDGE_BASE, getRelevantKnowledge } from '@/lib/knowledge-base';
import { parseLocalStorageProfile, buildContextForChat } from '@/lib/user-context';
import { extractSymbols } from '@/lib/athena/intelligence';
import { orchestrate, isOrchestratorReady } from '@/lib/athena/orchestrator';
import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Streaming chat endpoint using SSE
 * Falls back: tries Athena orchestrator first (non-streaming), then streams Claude synthesis
 */
export async function POST(request: NextRequest) {
  try {
    let clerkId: string | undefined;
    try {
      const authResult = await auth();
      clerkId = authResult.userId || undefined;
    } catch { /* not authenticated */ }

    const { message, conversationId, context, history: clientHistory, voiceMode } = await request.json();

    if (!message || !ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'Not available' }), { status: 400 });
    }

    const convId = conversationId || `conv_${Date.now()}`;
    const userContext = context ? parseLocalStorageProfile(context) : {
      netWorth: 0, totalInvestments: 0, totalRetirement: 0, totalCash: 0,
      totalCrypto: 0, totalDebt: 0, accounts: [], topHoldings: [],
      harvestablelosses: [], unrealizedGains: 0, unrealizedLosses: 0,
      assetAllocation: { usEquity: 0, intlEquity: 0, bonds: 0, cash: 0, crypto: 0, other: 0 },
      concentrationRisks: []
    };

    let history: { role: 'user' | 'assistant'; content: string }[] = [];
    if (clientHistory && Array.isArray(clientHistory)) {
      history = clientHistory.filter((m: any) => m.role && m.content).map((m: any) => ({ role: m.role, content: m.content }));
    }
    history.push({ role: 'user', content: message });
    if (history.length > 30) history = history.slice(-30);

    const detectedSymbols = extractSymbols(message);
    const isFinancialQuery = detectedSymbols.length > 0 ||
      /\b(buy|sell|invest|portfolio|stock|market|analyst|sentiment|research|price|earnings|dividend|etf|fund|crypto|bitcoin|eth|tao|position|holding|allocation|rebalance|tax|harvest|capital gain|roth|conversion|retirement|social security)\b/i.test(message);

    // For financial queries, run Athena orchestrator (non-streaming) then stream result
    // For simple queries, stream Claude directly
    const encoder = new TextEncoder();

    // Build system prompt
    let systemPrompt = `You are Maven, an AI wealth partner that serves as the user's financial Oracle. Be direct, specific, and actionable.`;
    systemPrompt += '\n\n' + MAVEN_KNOWLEDGE_BASE;
    systemPrompt += getRelevantKnowledge(message);
    systemPrompt += '\n\n' + buildContextForChat(userContext);

    // Determine complexity for thinking budget
    const complexPatterns = /\b(roth\s+conversion|tax\s+strateg|estate\s+plan|backdoor|mega\s+backdoor|asset\s+location|withdrawal\s+strateg|social\s+security\s+claim|required\s+minimum|charitable\s+giving\s+strateg)\b/i;
    const isComplex = complexPatterns.test(message);
    const isMedium = isFinancialQuery && !isComplex;
    
    let thinkingBudget = 0;
    if (isComplex) thinkingBudget = 10000;
    else if (isMedium) thinkingBudget = 4000;

    // If Athena is ready and it's financial, run orchestrator first for enrichment
    let orchestratorContext = '';
    let poweredBy = 'claude';
    
    if (isFinancialQuery && isOrchestratorReady()) {
      try {
        const allHoldings = userContext?.topHoldings?.map((h: any) => h.symbol) || [];
        const orchestratorResult = await orchestrate({
          query: message,
          systemPrompt,
          history: history.slice(-8),
          context: { holdings: allHoldings, riskTolerance: userContext?.riskTolerance as any },
          config: {
            useGroqClassification: true,
            includeSentiment: true,
            includeResearch: true,
            includeTradingSignals: true,
            useClaudeSynthesis: false, // We'll stream synthesis ourselves
          }
        });

        // Use orchestrator's gathered intelligence as context for streaming synthesis
        orchestratorContext = orchestratorResult.response;
        
        const providers = [orchestratorResult.providers.llm.provider];
        if (orchestratorResult.providers.sentiment) providers.push('xai');
        if (orchestratorResult.providers.signals) providers.push('vanta');
        if (orchestratorResult.debug?.providerResults.find(p => p.providerId === 'perplexity' && p.success)) {
          providers.push('perplexity');
        }
        providers.push('claude');
        poweredBy = `athena (${providers.join('+')})`;
        
        // Update thinking budget based on orchestrator classification
        if (orchestratorResult.classification.complexity === 'high' && thinkingBudget < 8000) {
          thinkingBudget = 8000;
        }
      } catch (e) {
        console.error('[Stream] Orchestrator failed, streaming direct Claude:', e);
      }
    }

    // Now stream Claude's response
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const userContent = orchestratorContext
      ? `Here is pre-gathered intelligence from multiple sources:\n\n${orchestratorContext}\n\n---\n\nUser's question: ${message}\n\nSynthesize the above intelligence into a clear, actionable response. Use real data when provided.`
      : message;

    const messagesForClaude = history.slice(0, -1).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    messagesForClaude.push({ role: 'user', content: userContent });

    const requestParams: any = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: thinkingBudget > 0 ? 16000 : 2048,
      system: systemPrompt,
      messages: messagesForClaude,
      stream: true,
    };

    if (thinkingBudget > 0) {
      requestParams.thinking = { type: 'enabled', budget_tokens: thinkingBudget };
    }

    const stream = await client.messages.stream(requestParams);

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send meta first
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'meta', poweredBy, conversationId: convId })}\n\n`));
          
          for await (const event of stream) {
            if (event.type === 'content_block_delta') {
              const delta = event.delta as any;
              if (delta.type === 'thinking_delta') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking', text: delta.thinking })}\n\n`));
              } else if (delta.type === 'text_delta') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text: delta.text })}\n\n`));
              }
            }
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        } catch (e) {
          console.error('[Stream] Error during streaming:', e);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Stream interrupted' })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error) {
    console.error('Stream API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to stream' }), { status: 500 });
  }
}
