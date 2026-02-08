import { NextRequest, NextResponse } from 'next/server';
import { getPolygonClient } from '@/lib/polygon-client';

/**
 * Get crypto quotes from Polygon.io
 * 
 * GET /api/crypto-quote?symbol=BTC
 * GET /api/crypto-quote?symbols=BTC,ETH,TAO
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const symbols = searchParams.get('symbols');
  
  if (!symbol && !symbols) {
    return NextResponse.json({ error: 'Symbol(s) required' }, { status: 400 });
  }
  
  const polygonClient = getPolygonClient();
  
  if (!polygonClient) {
    return NextResponse.json({ 
      error: 'Polygon API not configured',
      hint: 'Add POLYGON_API_KEY to environment variables'
    }, { status: 503 });
  }
  
  try {
    if (symbol) {
      // Single symbol
      const quote = await polygonClient.getCryptoQuote(symbol);
      
      if (!quote) {
        return NextResponse.json({ error: `No data for ${symbol}` }, { status: 404 });
      }
      
      return NextResponse.json(quote);
    }
    
    if (symbols) {
      // Multiple symbols
      const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
      const quotes = await polygonClient.getCryptoQuotes(symbolList);
      
      const result: Record<string, any> = {};
      quotes.forEach((quote, sym) => {
        result[sym] = quote;
      });
      
      return NextResponse.json({
        count: quotes.size,
        quotes: result
      });
    }
    
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Crypto quote error:', error);
    return NextResponse.json({ error: 'Failed to fetch crypto quote' }, { status: 500 });
  }
}
