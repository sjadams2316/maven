/**
 * Athena Research API
 * Real-time research with citations via Perplexity
 * 
 * This is the deep research path - ideal for:
 * - Stock/company research
 * - Market news and updates
 * - Regulatory/macro research
 * - Earnings analysis
 * 
 * GET /api/athena/research?q=What's the latest on NVDA earnings?
 * GET /api/athena/research?symbol=NVDA&focus=earnings
 * GET /api/athena/research?topic=Fed rate decision
 * 
 * POST /api/athena/research
 * { query: "...", type: "stock" | "market" | "general" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  isPerplexityConfigured, 
  perplexityResearch,
  researchStock,
  researchMarket,
  formatCitations,
} from '@/lib/athena/providers/perplexity';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Check configuration
  if (!isPerplexityConfigured()) {
    return NextResponse.json({
      error: 'Perplexity not configured',
      message: 'Set PERPLEXITY_API_KEY to enable research',
    }, { status: 503 });
  }
  
  // General query
  const query = searchParams.get('q') || searchParams.get('query');
  if (query) {
    try {
      const result = await perplexityResearch(query, {
        recency: (searchParams.get('recency') as any) || 'week',
      });
      
      return NextResponse.json({
        type: 'general',
        query,
        content: result.content,
        citations: result.citations,
        citationsFormatted: formatCitations(result.citations),
        latencyMs: result.latencyMs,
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  // Stock-specific research
  const symbol = searchParams.get('symbol');
  if (symbol) {
    try {
      const focus = (searchParams.get('focus') as any) || 'general';
      const result = await researchStock(symbol.toUpperCase(), {
        focus,
        recency: (searchParams.get('recency') as any) || 'week',
      });
      
      return NextResponse.json({
        type: 'stock',
        symbol: symbol.toUpperCase(),
        focus,
        summary: result.summary,
        keyPoints: result.keyPoints,
        sentiment: result.sentiment,
        citations: result.citations,
        latencyMs: result.latencyMs,
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  // Market/macro research
  const topic = searchParams.get('topic');
  if (topic) {
    try {
      const result = await researchMarket(topic, {
        recency: (searchParams.get('recency') as any) || 'day',
      });
      
      return NextResponse.json({
        type: 'market',
        topic,
        content: result.content,
        citations: result.citations,
        latencyMs: result.latencyMs,
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  // No valid query provided
  return NextResponse.json({
    error: 'Missing query parameter',
    usage: {
      general: '/api/athena/research?q=Your question here',
      stock: '/api/athena/research?symbol=NVDA&focus=earnings',
      market: '/api/athena/research?topic=Fed rate decision',
    },
    focusOptions: ['news', 'earnings', 'analysis', 'general'],
    recencyOptions: ['hour', 'day', 'week', 'month'],
  }, { status: 400 });
}

export async function POST(request: NextRequest) {
  // Check configuration
  if (!isPerplexityConfigured()) {
    return NextResponse.json({
      error: 'Perplexity not configured',
      message: 'Set PERPLEXITY_API_KEY to enable research',
    }, { status: 503 });
  }
  
  try {
    const body = await request.json();
    const { query, symbol, topic, type, focus, recency } = body;
    
    // Stock research
    if (type === 'stock' || symbol) {
      const sym = symbol || extractSymbolFromQuery(query);
      if (!sym) {
        return NextResponse.json({ error: 'Symbol required for stock research' }, { status: 400 });
      }
      
      const result = await researchStock(sym.toUpperCase(), {
        focus: focus || 'general',
        recency: recency || 'week',
      });
      
      return NextResponse.json({
        type: 'stock',
        symbol: sym.toUpperCase(),
        ...result,
      });
    }
    
    // Market research
    if (type === 'market' || topic) {
      const result = await researchMarket(topic || query, {
        recency: recency || 'day',
      });
      
      return NextResponse.json({
        type: 'market',
        topic: topic || query,
        ...result,
      });
    }
    
    // General research
    if (query) {
      const result = await perplexityResearch(query, {
        recency: recency || 'week',
      });
      
      return NextResponse.json({
        type: 'general',
        query,
        ...result,
      });
    }
    
    return NextResponse.json({ error: 'query or symbol required' }, { status: 400 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper to extract stock symbol from query
function extractSymbolFromQuery(query: string): string | null {
  if (!query) return null;
  
  // Match common patterns: $NVDA, NVDA, "about NVDA"
  const match = query.match(/\$?([A-Z]{1,5})(?:\s|$|'|,|\?)/);
  return match ? match[1] : null;
}
