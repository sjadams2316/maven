import { NextRequest, NextResponse } from 'next/server';
import { runMonteCarloSimulation, getDefaultParams, MonteCarloParams } from '@/lib/monte-carlo-engine';

export async function POST(request: NextRequest) {
  let body: any;
  
  // Parse request body with helpful error
  try {
    body = await request.json();
  } catch (parseError) {
    return NextResponse.json({
      error: 'Invalid request format',
      message: 'Request body must be valid JSON with portfolio and simulation parameters',
      code: 'INVALID_JSON',
      hint: 'Check that Content-Type is application/json and body is properly formatted'
    }, { status: 400 });
  }
  
  try {
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
    
    // Validate required parameters
    if (!params.currentAge || params.currentAge < 18 || params.currentAge > 100) {
      return NextResponse.json({
        error: 'Invalid age parameter',
        message: 'Current age must be between 18 and 100',
        code: 'INVALID_AGE',
        received: params.currentAge
      }, { status: 400 });
    }
    
    if (!params.retirementAge || params.retirementAge <= params.currentAge) {
      return NextResponse.json({
        error: 'Invalid retirement age',
        message: 'Retirement age must be greater than current age',
        code: 'INVALID_RETIREMENT_AGE',
        received: { currentAge: params.currentAge, retirementAge: params.retirementAge }
      }, { status: 400 });
    }
    
    if (params.currentPortfolioValue === undefined || params.currentPortfolioValue < 0) {
      return NextResponse.json({
        error: 'Invalid portfolio value',
        message: 'Current portfolio value must be a positive number',
        code: 'INVALID_PORTFOLIO',
        received: params.currentPortfolioValue
      }, { status: 400 });
    }
    
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
    
    // Provide specific guidance based on error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for common error patterns
    if (errorMessage.includes('allocation') || errorMessage.includes('percentage')) {
      return NextResponse.json({
        error: 'Invalid allocation parameters',
        message: 'Asset allocation percentages must sum to 100%',
        code: 'ALLOCATION_ERROR',
        hint: 'Check that stocks + bonds + cash + other = 100'
      }, { status: 400 });
    }
    
    // Generic simulation error with helpful context
    return NextResponse.json({
      error: 'Simulation calculation failed',
      message: 'Unable to complete the Monte Carlo simulation with the provided parameters',
      code: 'SIMULATION_ERROR',
      hint: 'Try adjusting your inputs: ensure reasonable portfolio values, valid age ranges, and allocation percentages that sum to 100%'
    }, { status: 500 });
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
