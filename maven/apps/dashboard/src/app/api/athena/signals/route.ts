/**
 * Athena Signals API
 * Bittensor-powered market intelligence
 * 
 * GET /api/athena/signals?symbol=BTC - Get market intelligence for a symbol
 * GET /api/athena/signals/status - Check Bittensor subnet status
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getBittensorStatus,
  getMarketIntelligence,
  fetchVantaSignals,
  fetchDesearchSentiment,
  fetchPrecogForecast,
} from '@/lib/athena';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const action = searchParams.get('action');
  
  // Status check
  if (action === 'status' || !symbol) {
    const status = getBittensorStatus();
    return NextResponse.json({
      status: 'ok',
      bittensor: {
        ...status,
        subnets: {
          vanta: { configured: status.vanta, subnet: 'SN8', purpose: 'Trading signals' },
          desearch: { configured: status.desearch, subnet: 'SN22', purpose: 'Social sentiment' },
          precog: { configured: status.precog, subnet: 'SN55', purpose: 'BTC forecasting' },
        },
      },
      note: status.anyConfigured 
        ? 'Bittensor subnets connected' 
        : 'Using mock data. Set VANTA_API_KEY, DESEARCH_API_KEY, or PRECOG_API_KEY for live signals.',
      timestamp: new Date().toISOString(),
    });
  }
  
  // Get market intelligence for symbol
  try {
    const intelligence = await getMarketIntelligence(symbol.toUpperCase());
    
    return NextResponse.json({
      success: true,
      symbol: symbol.toUpperCase(),
      intelligence,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Signals API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch signals' },
      { status: 500 }
    );
  }
}

/**
 * POST - Batch fetch signals for multiple symbols
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols = ['BTC', 'ETH', 'SPY'], sources = ['all'] } = body;
    
    const results: Record<string, unknown> = {};
    
    // Fetch from requested sources
    if (sources.includes('all') || sources.includes('vanta')) {
      results.vanta = await fetchVantaSignals(symbols);
    }
    
    if (sources.includes('all') || sources.includes('desearch')) {
      results.desearch = await fetchDesearchSentiment(symbols);
    }
    
    if (sources.includes('all') || sources.includes('precog')) {
      results.precog = await fetchPrecogForecast();
    }
    
    // Get aggregated intelligence for each symbol
    const intelligence = await Promise.all(
      symbols.map(s => getMarketIntelligence(s))
    );
    
    return NextResponse.json({
      success: true,
      symbols,
      sources: results,
      intelligence,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Signals batch API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch signals' },
      { status: 500 }
    );
  }
}
