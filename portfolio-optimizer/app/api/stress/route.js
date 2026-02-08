import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const STRESS_SCENARIOS = {
  '2008 Financial Crisis': {
    description: 'Global financial meltdown similar to 2008-2009',
    impacts: { 'US Equity': -50, 'Intl Developed': -55, 'Emerging Markets': -60, 'US Bonds': 5, 'Other': -30 },
    duration: '18 months'
  },
  '2020 COVID Crash': {
    description: 'Sharp pandemic-driven selloff with quick recovery',
    impacts: { 'US Equity': -34, 'Intl Developed': -32, 'Emerging Markets': -35, 'US Bonds': 3, 'Other': -20 },
    duration: '1 month'
  },
  'Dot-Com Bust (2000-2002)': {
    description: 'Technology bubble burst with prolonged bear market',
    impacts: { 'US Equity': -45, 'Intl Developed': -48, 'Emerging Markets': -40, 'US Bonds': 15, 'Other': -25 },
    duration: '30 months'
  },
  '1970s Stagflation': {
    description: 'High inflation with economic stagnation',
    impacts: { 'US Equity': -25, 'Intl Developed': -30, 'Emerging Markets': -35, 'US Bonds': -15, 'Other': 10 },
    duration: '24 months'
  },
  'Rising Rates Shock': {
    description: 'Rapid Fed rate hikes causing bond selloff',
    impacts: { 'US Equity': -15, 'Intl Developed': -18, 'Emerging Markets': -25, 'US Bonds': -12, 'Other': -10 },
    duration: '12 months'
  },
  'EM Currency Crisis': {
    description: 'Emerging market contagion (like 1997 Asian crisis)',
    impacts: { 'US Equity': -15, 'Intl Developed': -20, 'Emerging Markets': -50, 'US Bonds': 5, 'Other': -15 },
    duration: '12 months'
  }
};

function getDb() {
  return new Database(path.join(process.cwd(), 'data', 'funds.db'));
}

export async function POST(request) {
  const { portfolioId, assetClassWeights } = await request.json();
  
  let weights = assetClassWeights;
  
  // If portfolioId provided, calculate weights from holdings
  if (portfolioId && !weights) {
    const db = getDb();
    const holdings = db.prepare(`
      SELECT ph.weight, f.asset_class 
      FROM portfolio_holdings ph
      LEFT JOIN funds f ON ph.ticker = f.ticker
      WHERE ph.portfolio_id = ?
    `).all(portfolioId);
    db.close();
    
    weights = {};
    for (const h of holdings) {
      const ac = h.asset_class || 'Other';
      weights[ac] = (weights[ac] || 0) + h.weight;
    }
  }
  
  if (!weights) {
    return NextResponse.json({ error: 'Provide portfolioId or assetClassWeights' }, { status: 400 });
  }
  
  // Run all stress tests
  const results = Object.entries(STRESS_SCENARIOS).map(([name, scenario]) => {
    let portfolioImpact = 0;
    const assetImpacts = [];
    
    for (const [ac, weight] of Object.entries(weights)) {
      const impact = scenario.impacts[ac] || scenario.impacts['Other'] || -20;
      portfolioImpact += weight * impact;
      assetImpacts.push({ assetClass: ac, weight, impact, contribution: weight * impact });
    }
    
    return {
      scenario: name,
      description: scenario.description,
      duration: scenario.duration,
      portfolioImpact,
      assetImpacts
    };
  });
  
  // Monte Carlo simulation
  const cma = {
    expectedReturns: { 'US Equity': 7.5, 'Intl Developed': 7.0, 'Emerging Markets': 8.5, 'US Bonds': 4.0, 'Other': 5.0 },
    volatility: { 'US Equity': 16.0, 'Intl Developed': 18.0, 'Emerging Markets': 24.0, 'US Bonds': 5.0, 'Other': 12.0 },
  };
  
  let expReturn = 0, variance = 0;
  const acs = Object.keys(weights);
  for (const ac of acs) {
    expReturn += weights[ac] * (cma.expectedReturns[ac] || 5);
  }
  for (const ac1 of acs) {
    for (const ac2 of acs) {
      const v1 = (cma.volatility[ac1] || 12) / 100;
      const v2 = (cma.volatility[ac2] || 12) / 100;
      const corr = ac1 === ac2 ? 1 : 0.5;
      variance += weights[ac1] * weights[ac2] * v1 * v2 * corr;
    }
  }
  const vol = Math.sqrt(variance);
  
  // Simple Monte Carlo
  const simulations = 1000;
  const years = 10;
  const finalValues = [];
  
  for (let s = 0; s < simulations; s++) {
    let value = 100;
    for (let y = 0; y < years; y++) {
      const u1 = Math.random(), u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      value *= (1 + expReturn / 100 + vol * z);
    }
    finalValues.push(value);
  }
  
  finalValues.sort((a, b) => a - b);
  const pct = (p) => finalValues[Math.floor(p * simulations / 100)];
  
  const monteCarlo = {
    years,
    simulations,
    percentiles: {
      '5th': pct(5),
      '25th': pct(25),
      '50th': pct(50),
      '75th': pct(75),
      '95th': pct(95)
    },
    probabilityOfLoss: finalValues.filter(v => v < 100).length / simulations * 100,
    expectedValue: 100 * Math.pow(1 + expReturn / 100, years)
  };
  
  return NextResponse.json({ stressTests: results, monteCarlo, assetClassWeights: weights });
}

export async function GET() {
  return NextResponse.json({ scenarios: STRESS_SCENARIOS });
}
