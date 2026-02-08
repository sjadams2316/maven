import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const SCENARIOS = {
  historical: [
    {
      id: 'gfc_2008',
      name: '2008 Global Financial Crisis',
      description: 'Lehman collapse, global credit freeze',
      period: '2008-2009',
      shocks: { 'US Equity': -52, 'Intl Developed': -56, 'Emerging Markets': -61, 'US Bonds': 5 }
    },
    {
      id: 'dotcom_crash',
      name: '2000-2002 Dot-Com Crash',
      description: 'Tech bubble burst',
      period: '2000-2002',
      shocks: { 'US Equity': -45, 'Intl Developed': -48, 'Emerging Markets': -35, 'US Bonds': 32 }
    },
    {
      id: 'covid_crash',
      name: '2020 COVID Crash',
      description: 'Fastest bear market in history',
      period: 'Feb-Mar 2020',
      shocks: { 'US Equity': -34, 'Intl Developed': -33, 'Emerging Markets': -32, 'US Bonds': 3.5 }
    },
    {
      id: 'rate_shock_2022',
      name: '2022 Rate Shock',
      description: 'Stocks and bonds down together',
      period: '2022',
      shocks: { 'US Equity': -19, 'Intl Developed': -16, 'Emerging Markets': -22, 'US Bonds': -13 }
    },
    {
      id: 'stagflation_70s',
      name: '1973-1974 Stagflation',
      description: 'Oil crisis, high inflation',
      period: '1973-1974',
      shocks: { 'US Equity': -48, 'Intl Developed': -42, 'Emerging Markets': -30, 'US Bonds': -5 }
    },
    {
      id: 'black_monday',
      name: '1987 Black Monday',
      description: 'Single-day 22% crash',
      period: 'Oct 1987',
      shocks: { 'US Equity': -33, 'Intl Developed': -28, 'Emerging Markets': -25, 'US Bonds': 2 }
    }
  ],
  hypothetical: [
    {
      id: 'severe_recession',
      name: 'Severe Recession',
      description: 'Deep recession, risk-off',
      shocks: { 'US Equity': -40, 'Intl Developed': -45, 'Emerging Markets': -50, 'US Bonds': 8 }
    },
    {
      id: 'inflation_spike',
      name: 'Inflation Spike',
      description: 'Unexpected inflation, rates rise',
      shocks: { 'US Equity': -25, 'Intl Developed': -20, 'Emerging Markets': -30, 'US Bonds': -15 }
    },
    {
      id: 'ai_bubble_burst',
      name: 'AI Bubble Burst',
      description: 'Tech/AI valuations collapse',
      shocks: { 'US Equity': -35, 'Intl Developed': -20, 'Emerging Markets': -25, 'US Bonds': 5 }
    }
  ]
};

function getDb() {
  return new Database(path.join(process.cwd(), 'data', 'funds.db'));
}

function applyScenario(holdings, scenario) {
  let portfolioImpact = 0;
  const details = [];
  
  for (const h of holdings) {
    const ac = h.asset_class || 'US Equity';
    const shock = scenario.shocks[ac] ?? scenario.shocks['US Equity'] ?? -20;
    const impact = shock * h.weight;
    portfolioImpact += impact;
    
    details.push({
      ticker: h.ticker,
      name: h.name,
      weight: h.weight,
      assetClass: ac,
      shock,
      impact
    });
  }
  
  return { ...scenario, portfolioImpact, details };
}

function runMonteCarlo(holdings, cma, years = 10, sims = 1000) {
  // Calculate portfolio expected return and vol
  let expRet = 0, vol = 0;
  for (const h of holdings) {
    const ac = h.asset_class || 'US Equity';
    const acData = cma.assetClasses[ac] || { expectedReturn: 6, volatility: 15 };
    expRet += acData.expectedReturn * h.weight;
    vol += acData.volatility * h.weight; // simplified
  }
  
  const results = [];
  for (let i = 0; i < sims; i++) {
    let value = 100;
    for (let y = 0; y < years; y++) {
      const u1 = Math.random(), u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const ret = (expRet + z * vol) / 100;
      value *= (1 + ret);
    }
    results.push(value);
  }
  
  results.sort((a, b) => a - b);
  
  return {
    years,
    simulations: sims,
    expectedReturn: expRet,
    volatility: vol,
    percentiles: {
      p5: results[Math.floor(sims * 0.05)],
      p25: results[Math.floor(sims * 0.25)],
      p50: results[Math.floor(sims * 0.50)],
      p75: results[Math.floor(sims * 0.75)],
      p95: results[Math.floor(sims * 0.95)]
    },
    worst: results[0],
    best: results[sims - 1],
    mean: results.reduce((a, b) => a + b, 0) / sims
  };
}

export async function POST(request) {
  try {
    const { portfolioId } = await request.json();
    
    const db = getDb();
    
    const holdings = db.prepare(`
      SELECT ph.*, f.name, f.asset_class
      FROM portfolio_holdings ph
      LEFT JOIN funds f ON ph.ticker = f.ticker
      WHERE ph.portfolio_id = ?
    `).all(portfolioId);
    
    db.close();
    
    if (holdings.length === 0) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    
    // Run all scenarios
    const results = {
      historical: SCENARIOS.historical.map(s => applyScenario(holdings, s)),
      hypothetical: SCENARIOS.hypothetical.map(s => applyScenario(holdings, s))
    };
    
    // Sort by impact
    results.historical.sort((a, b) => a.portfolioImpact - b.portfolioImpact);
    results.hypothetical.sort((a, b) => a.portfolioImpact - b.portfolioImpact);
    
    // Run Monte Carlo
    const cma = {
      assetClasses: {
        'US Equity': { expectedReturn: 7.5, volatility: 16.5 },
        'Intl Developed': { expectedReturn: 6.5, volatility: 18.0 },
        'Emerging Markets': { expectedReturn: 8.0, volatility: 23.0 },
        'US Bonds': { expectedReturn: 4.0, volatility: 5.5 }
      }
    };
    
    const monteCarlo = runMonteCarlo(holdings, cma);
    
    return NextResponse.json({ scenarios: results, monteCarlo });
  } catch (error) {
    console.error('Stress test error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
