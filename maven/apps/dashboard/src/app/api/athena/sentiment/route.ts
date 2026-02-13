/**
 * Athena Sentiment API
 * Combined xAI (Twitter) + Desearch (Reddit) sentiment analysis
 * 
 * GET /api/athena/sentiment?symbol=BTC
 * GET /api/athena/sentiment?symbols=BTC,ETH,AAPL
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getCombinedSentiment, 
  isXAIConfigured,
  batchXSentiment,
} from '@/lib/athena/providers/xai';
import { 
  fetchDesearchSentiment, 
  isDesearchConfigured,
  getMarketIntelligence,
} from '@/lib/athena/providers/bittensor';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const symbols = searchParams.get('symbols')?.split(',').map(s => s.trim().toUpperCase());
  const full = searchParams.get('full') === 'true'; // Include full market intelligence
  
  if (!symbol && !symbols) {
    return NextResponse.json({
      error: 'Missing required parameter: symbol or symbols',
      example: '/api/athena/sentiment?symbol=BTC',
    }, { status: 400 });
  }

  try {
    const startTime = Date.now();
    
    // Check provider status
    const providers = {
      xai: isXAIConfigured(),
      desearch: isDesearchConfigured(),
    };
    
    if (!providers.xai && !providers.desearch) {
      return NextResponse.json({
        error: 'No sentiment providers configured',
        message: 'Set XAI_API_KEY (Twitter via xAI) and/or DESEARCH_API_KEY (Reddit + Twitter validation)',
        providers,
        mockData: true,
        // Return mock data so UI can still work
        data: symbol 
          ? await getCombinedSentiment(symbol)
          : await Promise.all((symbols || []).map(s => getCombinedSentiment(s))),
      });
    }

    // Single symbol
    if (symbol) {
      // Get Desearch data first (for Reddit coverage)
      const desearchData = await fetchDesearchSentiment([symbol.toUpperCase()]);
      const desearchSymbol = desearchData.sentiments.find(
        s => s.symbol === symbol.toUpperCase()
      );
      
      // Get combined sentiment
      const sentiment = await getCombinedSentiment(
        symbol.toUpperCase(),
        desearchSymbol ? {
          sentiment: desearchSymbol.sentiment,
          score: desearchSymbol.score,
          sources: desearchSymbol.sources,
        } : undefined
      );
      
      // Optionally get full market intelligence
      let fullIntel = null;
      if (full) {
        fullIntel = await getMarketIntelligence();
      }

      return NextResponse.json({
        success: true,
        providers,
        latencyMs: Date.now() - startTime,
        data: sentiment,
        fullIntelligence: fullIntel,
      });
    }

    // Multiple symbols
    if (symbols && symbols.length > 0) {
      // Rate limit to 5 symbols max
      const limitedSymbols = symbols.slice(0, 5);
      
      // Get all Desearch data in one call
      const desearchData = await fetchDesearchSentiment(limitedSymbols);
      
      // Get combined sentiment for each symbol
      const results = await Promise.all(
        limitedSymbols.map(async (sym) => {
          const desearchSymbol = desearchData.sentiments.find(
            s => s.symbol === sym
          );
          return getCombinedSentiment(
            sym,
            desearchSymbol ? {
              sentiment: desearchSymbol.sentiment,
              score: desearchSymbol.score,
              sources: desearchSymbol.sources,
            } : undefined
          );
        })
      );

      return NextResponse.json({
        success: true,
        providers,
        latencyMs: Date.now() - startTime,
        count: results.length,
        data: results,
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    console.error('Sentiment API error:', error);
    return NextResponse.json({
      error: 'Sentiment analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * POST - Analyze custom query sentiment
 * 
 * POST /api/athena/sentiment
 * { "query": "Bitcoin ETF approval", "source": "twitter" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, source = 'all' } = body;
    
    if (!query) {
      return NextResponse.json({
        error: 'Missing required field: query',
      }, { status: 400 });
    }

    const startTime = Date.now();
    
    // Import xAI search function
    const { searchXSentiment } = await import('@/lib/athena/providers/xai');
    
    // Get sentiment for custom query
    const result = await searchXSentiment(query, {
      minFollowers: 500,
      excludeRetweets: true,
      excludeReplies: true,
    });

    return NextResponse.json({
      success: true,
      latencyMs: Date.now() - startTime,
      query,
      source,
      data: result,
    });

  } catch (error) {
    console.error('Sentiment POST error:', error);
    return NextResponse.json({
      error: 'Sentiment analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
