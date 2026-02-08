/**
 * Data Sources Status API
 * 
 * GET /api/data-sources
 * Returns current data provider configuration and status
 */

import { NextResponse } from 'next/server';
import { dataConfig } from '@/lib/data-providers';

export async function GET() {
  const sources = dataConfig.getSummary();
  
  // Add details about each source
  const detailed = {
    portfolio: {
      mode: sources.portfolio,
      description: sources.portfolio === 'live' ? 'Plaid (real accounts)' : 'Demo portfolio',
      provider: sources.portfolio === 'live' ? 'Plaid' : 'Mock',
    },
    fund: {
      mode: sources.fund,
      description: sources.fund === 'live' ? 'Morningstar (fund X-ray)' : 'Sample fund data',
      provider: sources.fund === 'live' ? 'Morningstar' : 'Mock',
    },
    tax: {
      mode: sources.tax,
      description: sources.tax === 'live' ? 'Brokerage integration' : 'Demo tax lots',
      provider: sources.tax === 'live' ? 'Brokerage API' : 'Mock',
    },
    market: {
      mode: 'live', // Always live for market data
      description: 'Real-time quotes',
      providers: ['Yahoo Finance', 'CoinGecko', 'Polygon'],
    },
    economic: {
      mode: 'live', // Always live for FRED
      description: 'Federal Reserve data',
      provider: 'FRED',
    },
    analyst: {
      mode: 'live', // FMP for analyst data
      description: 'Analyst ratings & fundamentals',
      provider: 'Financial Modeling Prep',
    },
    risk: {
      mode: sources.risk,
      description: sources.risk === 'live' ? 'Institutional risk models' : 'Calculated from historical',
      provider: sources.risk === 'live' ? 'TBD' : 'Internal',
    },
    retirement: {
      mode: sources.retirement,
      description: sources.retirement === 'live' ? 'SSA integration' : 'Calculated estimates',
      provider: sources.retirement === 'live' ? 'SSA API' : 'Quick Calculator',
    },
  };

  return NextResponse.json({
    hasLiveData: dataConfig.hasLiveData,
    summary: sources,
    details: detailed,
    timestamp: new Date().toISOString(),
  });
}
