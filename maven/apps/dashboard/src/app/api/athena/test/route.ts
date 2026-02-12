/**
 * Athena Test Endpoint
 * Test AI providers and routing
 * 
 * GET /api/athena/test - Check provider status
 * POST /api/athena/test - Test a query
 */

import { NextResponse } from 'next/server';
import { 
  chutesQuery, 
  isChutesConfigured, 
  getAvailableProviders,
  CHUTES_MODELS,
  classifyAndRoute,
  isGroqConfigured,
  GROQ_MODELS,
  getBittensorStatus,
} from '@/lib/athena';

export async function GET() {
  const providers = getAvailableProviders();
  
  return NextResponse.json({
    status: 'ok',
    athenaVersion: '1.0.0',
    featureFlags: {
      athenaEnabled: process.env.ATHENA_ENABLED === 'true',
      abTestPercent: parseInt(process.env.ATHENA_AB_PERCENT || '0', 10),
    },
    providers: {
      available: providers,
      chutes: {
        configured: isChutesConfigured(),
        models: CHUTES_MODELS,
      },
      groq: {
        configured: isGroqConfigured(),
        models: isGroqConfigured() ? GROQ_MODELS : null,
      },
      bittensor: getBittensorStatus(),
    },
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, provider = 'chutes', model } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Missing required field: query' },
        { status: 400 }
      );
    }

    // First, classify and route the query
    const { classification, routing } = await classifyAndRoute(query);

    // Then test the provider
    let providerResponse;
    let latencyMs = 0;
    let cost = 0;
    let error: string | null = null;

    if (provider === 'chutes') {
      if (!isChutesConfigured()) {
        return NextResponse.json(
          { error: 'Chutes not configured. Set CHUTES_API_KEY environment variable.' },
          { status: 400 }
        );
      }

      try {
        const startTime = Date.now();
        providerResponse = await chutesQuery(query, {
          model: model || CHUTES_MODELS.balanced,
          systemPrompt: 'You are a helpful financial assistant. Be concise and accurate.',
          maxTokens: 500,
        });
        latencyMs = Date.now() - startTime;
        // Rough cost estimate for balanced model
        cost = 0.0001; // ~$0.0001 per query at these rates
      } catch (e) {
        error = e instanceof Error ? e.message : 'Unknown error';
      }
    } else {
      return NextResponse.json(
        { error: `Provider '${provider}' not yet implemented` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      query,
      classification,
      routing,
      provider,
      response: error ? null : providerResponse,
      error,
      metrics: {
        latencyMs,
        estimatedCost: cost,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Athena test error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
