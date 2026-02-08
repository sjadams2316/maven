import { NextRequest, NextResponse } from 'next/server';
import { runMonteCarloSimulation, getDefaultParams, MonteCarloParams } from '@/lib/monte-carlo-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Merge user params with defaults
    const defaultParams = getDefaultParams(body.userProfile);
    const params: MonteCarloParams = {
      ...defaultParams,
      ...body.params,
      allocation: {
        ...defaultParams.allocation,
        ...body.params?.allocation,
      },
    };
    
    // Validate params
    if (params.numSimulations > 10000) {
      params.numSimulations = 10000; // Cap for performance
    }
    if (params.numSimulations < 100) {
      params.numSimulations = 100;
    }
    
    // Run simulation
    const result = runMonteCarloSimulation(params);
    
    // Return results (limit sample paths to reduce response size)
    return NextResponse.json({
      ...result,
      samplePaths: result.samplePaths.slice(0, 50), // Limit for network
    });
  } catch (error) {
    console.error('Monte Carlo API error:', error);
    return NextResponse.json(
      { error: 'Failed to run simulation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Return statistics about historical data
  const stats = {
    sp500: {
      years: 97,
      startYear: 1928,
      meanReturn: 0.118,
      stdDev: 0.197,
      bestYear: { year: 1954, return: 0.526 },
      worstYear: { year: 1931, return: -0.438 },
    },
    bonds: {
      years: 97,
      startYear: 1928,
      meanReturn: 0.052,
      stdDev: 0.078,
    },
    methodology: {
      simulationMethods: ['historical_bootstrap', 'parametric', 'block_bootstrap'],
      fatTails: 'Student-t distribution with 5 degrees of freedom',
      correlation: 'Historical correlation matrix (1972-2024)',
      inflation: 'Historical bootstrap or stochastic mean-reversion',
    },
    lastUpdated: new Date().toISOString(),
  };
  
  return NextResponse.json(stats);
}
