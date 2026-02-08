import { NextResponse } from 'next/server';
import { VantaClient, getPublicDashboardData, signalsToAllocation } from '@/lib/vanta';

// Initialize client (will use env vars if available)
const vanta = new VantaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'status';

  try {
    switch (type) {
      case 'status':
        // Check configuration status
        return NextResponse.json({
          configured: vanta.isConfigured(),
          message: vanta.isConfigured() 
            ? 'Vanta API configured and ready'
            : 'Vanta API not configured. Set VANTA_API_KEY and VANTA_VALIDATOR_URL in .env',
          setupUrl: 'https://request.taoshi.io',
          dashboardUrl: 'https://dashboard.taoshi.io'
        });

      case 'signals':
        // Get live trading signals (requires API key)
        if (!vanta.isConfigured()) {
          return NextResponse.json({
            error: 'API not configured',
            demo: true,
            signals: getDemoSignals(),
            note: 'Using demo data. Subscribe at https://request.taoshi.io for live signals.'
          });
        }
        const signals = await vanta.getSignals();
        return NextResponse.json(signals);

      case 'miners':
        // Get top miners
        const assetClass = searchParams.get('asset') || 'crypto';
        if (!vanta.isConfigured()) {
          return NextResponse.json({
            error: 'API not configured',
            demo: true,
            miners: getDemoMiners(assetClass),
            note: 'Using demo data. View live miners at https://dashboard.taoshi.io'
          });
        }
        const miners = await vanta.getTopMiners(assetClass);
        return NextResponse.json(miners);

      case 'allocation':
        // Convert signals to allocation recommendations
        let signalData;
        if (vanta.isConfigured()) {
          signalData = await vanta.getSignals();
        } else {
          signalData = getDemoSignals();
        }
        
        const allocation = signalsToAllocation(signalData);
        return NextResponse.json({
          demo: !vanta.isConfigured(),
          allocation,
          note: vanta.isConfigured() ? null : 'Based on demo data'
        });

      case 'dashboard':
        // Try to get public dashboard data
        const dashData = await getPublicDashboardData();
        return NextResponse.json(dashData);

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Vanta API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Demo signals for testing UI without API key
 * Based on typical Vanta signal structure
 */
function getDemoSignals() {
  return [
    {
      tradePair: 'BTCUSD',
      direction: 'LONG',
      leverage: 0.25,
      confidence: 0.72,
      minerId: 'demo-miner-1',
      timestamp: new Date().toISOString(),
      assetClass: 'crypto'
    },
    {
      tradePair: 'ETHUSD',
      direction: 'LONG',
      leverage: 0.15,
      confidence: 0.65,
      minerId: 'demo-miner-2',
      timestamp: new Date().toISOString(),
      assetClass: 'crypto'
    },
    {
      tradePair: 'EURUSD',
      direction: 'SHORT',
      leverage: 2.0,
      confidence: 0.58,
      minerId: 'demo-miner-3',
      timestamp: new Date().toISOString(),
      assetClass: 'forex'
    },
    {
      tradePair: 'GBPUSD',
      direction: 'FLAT',
      leverage: 0,
      confidence: 0.45,
      minerId: 'demo-miner-4',
      timestamp: new Date().toISOString(),
      assetClass: 'forex'
    },
    {
      tradePair: 'SOLUSD',
      direction: 'LONG',
      leverage: 0.3,
      confidence: 0.68,
      minerId: 'demo-miner-5',
      timestamp: new Date().toISOString(),
      assetClass: 'crypto'
    }
  ];
}

/**
 * Demo miners for testing UI
 */
function getDemoMiners(assetClass) {
  const cryptoMiners = [
    { rank: 1, minerId: '5CPtnt...VCJ6C3', status: 'Passing', return30d: 12.4, sharpe: 1.8, maxDrawdown: 4.2 },
    { rank: 2, minerId: '5Gzn3U...DiEaNi', status: 'Passing', return30d: 10.1, sharpe: 1.5, maxDrawdown: 5.1 },
    { rank: 3, minerId: '5CM9pB...BqQ5zb', status: 'Passing', return30d: 9.8, sharpe: 1.4, maxDrawdown: 3.8 },
    { rank: 4, minerId: '5GuVs9...a2FHV7', status: 'Passing', return30d: 8.5, sharpe: 1.3, maxDrawdown: 6.2 },
    { rank: 5, minerId: '5FvugY...skrEQY', status: 'Passing', return30d: 7.9, sharpe: 1.2, maxDrawdown: 5.5 }
  ];

  const forexMiners = [
    { rank: 1, minerId: '5CrGBJ...6tXMuN', status: 'Passing', return30d: 8.2, sharpe: 2.1, maxDrawdown: 2.8 },
    { rank: 2, minerId: '5ECXQN...xk21pV', status: 'Passing', return30d: 7.5, sharpe: 1.9, maxDrawdown: 3.2 },
    { rank: 3, minerId: '5DS51Z...AhXQo4', status: 'Passing', return30d: 6.9, sharpe: 1.7, maxDrawdown: 3.5 },
    { rank: 4, minerId: '5HDz9M...2FJyqG', status: 'Passing', return30d: 6.4, sharpe: 1.6, maxDrawdown: 4.0 },
    { rank: 5, minerId: '5FCPYq...zzFWL1', status: 'Passing', return30d: 5.8, sharpe: 1.5, maxDrawdown: 4.3 }
  ];

  return assetClass === 'forex' ? forexMiners : cryptoMiners;
}
