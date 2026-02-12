/**
 * Athena Orchestrator API
 * 
 * Test endpoint for the full hybrid intelligence pipeline.
 * 
 * POST /api/athena/orchestrate
 * { 
 *   query: "Should I sell NVDA?",
 *   systemPrompt?: "...",
 *   context?: { holdings: ["NVDA", "AAPL"] }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  orchestrate, 
  quickOrchestrate, 
  isOrchestratorReady, 
  getOrchestratorStatus 
} from '@/lib/athena/orchestrator';

export async function GET(request: NextRequest) {
  // Return status
  const status = getOrchestratorStatus();
  
  return NextResponse.json({
    ready: status.ready,
    providers: status.providers,
    description: 'Athena Orchestrator - Hybrid Intelligence Layer',
    usage: {
      method: 'POST',
      body: {
        query: 'Your question (required)',
        systemPrompt: 'Custom system prompt (optional)',
        context: {
          holdings: ['AAPL', 'NVDA'],
          riskTolerance: 'moderate',
        },
        quick: 'Set true for fast mode without signals (optional)',
      },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, systemPrompt, context, quick, debug } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'query is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Check if orchestrator is ready
    if (!isOrchestratorReady()) {
      return NextResponse.json(
        { 
          error: 'Orchestrator not ready - no LLM providers configured',
          status: getOrchestratorStatus(),
        },
        { status: 503 }
      );
    }
    
    // Quick mode - just LLM, no signals
    if (quick) {
      const result = await quickOrchestrate(query, systemPrompt);
      return NextResponse.json({
        mode: 'quick',
        response: result.response,
        provider: result.provider,
        latencyMs: result.latencyMs,
      });
    }
    
    // Full orchestration
    const result = await orchestrate({
      query,
      systemPrompt,
      context,
    });
    
    // Build response
    const response: any = {
      mode: 'full',
      response: result.response,
      
      // What was used
      classification: {
        type: result.classification.type,
        urgency: result.classification.urgency,
        complexity: result.classification.complexity,
        confidence: result.classification.confidence,
      },
      
      routing: {
        path: result.routing.primaryPath,
        estimatedLatencyMs: result.routing.estimatedLatencyMs,
        estimatedCostUsd: result.routing.estimatedCostUsd,
      },
      
      providers: result.providers,
      
      // Synthesis results (if any)
      synthesis: result.synthesis,
      
      // Metrics
      metrics: {
        totalLatencyMs: result.totalLatencyMs,
        estimatedCostUsd: result.estimatedCostUsd,
      },
    };
    
    // Include debug info if requested
    if (debug) {
      response.debug = result.debug;
    }
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Orchestrator error:', error);
    return NextResponse.json(
      { 
        error: 'Orchestration failed',
        message: error.message,
        status: getOrchestratorStatus(),
      },
      { status: 500 }
    );
  }
}
