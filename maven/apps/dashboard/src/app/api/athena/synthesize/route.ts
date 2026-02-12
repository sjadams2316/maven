/**
 * Athena Synthesis API
 * 
 * Combines all intelligence sources into a unified assessment.
 * This is the "brain" endpoint - the full power of Athena.
 * 
 * GET /api/athena/synthesize?symbol=NVDA
 * GET /api/athena/synthesize?symbols=NVDA,AAPL,BTC
 * 
 * Returns weighted consensus from:
 * - Twitter sentiment (xAI)
 * - Reddit sentiment (Desearch)
 * - Trading signals (Vanta)
 * - Price forecasts (Precog)
 * - Agreement/disagreement analysis
 * - Confidence scoring
 * - Proactive alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSymbol, synthesizeBatch, formatSynthesisForDisplay } from '@/lib/athena/synthesis';
import { isXAIConfigured } from '@/lib/athena/providers/xai';
import { isVantaConfigured, isDesearchConfigured, isPrecogConfigured } from '@/lib/athena/providers/bittensor';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol')?.toUpperCase();
  const symbols = searchParams.get('symbols')?.split(',').map(s => s.trim().toUpperCase());
  const format = searchParams.get('format'); // 'json' (default) or 'text'
  
  // Options
  const includeSentiment = searchParams.get('sentiment') !== 'false';
  const includeTrading = searchParams.get('trading') !== 'false';
  const includeForecasts = searchParams.get('forecasts') !== 'false';
  
  if (!symbol && !symbols) {
    return NextResponse.json({
      error: 'Missing required parameter: symbol or symbols',
      examples: [
        '/api/athena/synthesize?symbol=NVDA',
        '/api/athena/synthesize?symbols=NVDA,AAPL,BTC',
        '/api/athena/synthesize?symbol=BTC&format=text',
      ],
    }, { status: 400 });
  }

  try {
    const startTime = Date.now();
    
    // Provider status
    const providers = {
      xai: isXAIConfigured(),
      desearch: isDesearchConfigured(),
      vanta: isVantaConfigured(),
      precog: isPrecogConfigured(),
    };
    
    const activeProviders = Object.entries(providers)
      .filter(([_, active]) => active)
      .map(([name]) => name);
    
    const options = {
      includeSentiment,
      includeTrading,
      includeForecasts,
    };

    // Single symbol
    if (symbol) {
      const result = await synthesizeSymbol(symbol, options);
      
      // Text format for debugging
      if (format === 'text') {
        return new NextResponse(formatSynthesisForDisplay(result), {
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      
      return NextResponse.json({
        success: true,
        providers,
        activeProviders,
        latencyMs: Date.now() - startTime,
        result,
      });
    }

    // Multiple symbols
    if (symbols && symbols.length > 0) {
      // Limit to 5 symbols
      const limitedSymbols = symbols.slice(0, 5);
      
      const results = await synthesizeBatch(limitedSymbols, options);
      
      // Convert Map to object for JSON
      const resultsObj: Record<string, any> = {};
      results.forEach((result, sym) => {
        resultsObj[sym] = result;
      });
      
      // Summary stats
      const allResults = Array.from(results.values());
      const bullish = allResults.filter(r => r.direction === 'bullish').length;
      const bearish = allResults.filter(r => r.direction === 'bearish').length;
      const neutral = allResults.filter(r => r.direction === 'neutral').length;
      const avgConfidence = allResults.reduce((sum, r) => sum + r.confidence, 0) / allResults.length;
      
      return NextResponse.json({
        success: true,
        providers,
        activeProviders,
        latencyMs: Date.now() - startTime,
        summary: {
          symbolsAnalyzed: limitedSymbols.length,
          bullish,
          bearish,
          neutral,
          avgConfidence,
        },
        results: resultsObj,
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    console.error('Synthesis API error:', error);
    return NextResponse.json({
      error: 'Synthesis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
