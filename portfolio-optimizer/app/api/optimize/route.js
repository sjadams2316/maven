import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const DEFAULT_CMA = {
  assetClasses: {
    'US Equity': { expectedReturn: 7.5, volatility: 16.5 },
    'Intl Developed': { expectedReturn: 6.5, volatility: 18.0 },
    'Emerging Markets': { expectedReturn: 8.0, volatility: 23.0 },
    'US Bonds': { expectedReturn: 4.0, volatility: 5.5 }
  },
  correlations: {
    'US Equity': { 'US Equity': 1.00, 'Intl Developed': 0.85, 'Emerging Markets': 0.75, 'US Bonds': 0.05 },
    'Intl Developed': { 'US Equity': 0.85, 'Intl Developed': 1.00, 'Emerging Markets': 0.80, 'US Bonds': 0.10 },
    'Emerging Markets': { 'US Equity': 0.75, 'Emerging Markets': 1.00, 'Intl Developed': 0.80, 'US Bonds': 0.15 },
    'US Bonds': { 'US Equity': 0.05, 'Intl Developed': 0.10, 'Emerging Markets': 0.15, 'US Bonds': 1.00 }
  },
  riskFreeRate: 4.5
};

function getDb() {
  return new Database(path.join(process.cwd(), 'data', 'funds.db'));
}

function calculatePortfolioVolatility(weights, cma) {
  const assetClasses = Object.keys(weights);
  let variance = 0;
  
  for (const ac1 of assetClasses) {
    for (const ac2 of assetClasses) {
      const w1 = weights[ac1] || 0;
      const w2 = weights[ac2] || 0;
      const vol1 = (cma.assetClasses[ac1]?.volatility || 15) / 100;
      const vol2 = (cma.assetClasses[ac2]?.volatility || 15) / 100;
      const corr = cma.correlations[ac1]?.[ac2] || 0.5;
      variance += w1 * w2 * vol1 * vol2 * corr;
    }
  }
  
  return Math.sqrt(variance) * 100;
}

export async function POST(request) {
  try {
    const { portfolioId, cma = DEFAULT_CMA } = await request.json();
    
    const db = getDb();
    
    // Get portfolio holdings
    const holdings = db.prepare(`
      SELECT ph.*, f.name, f.asset_class, f.expense_ratio
      FROM portfolio_holdings ph
      LEFT JOIN funds f ON ph.ticker = f.ticker
      WHERE ph.portfolio_id = ?
    `).all(portfolioId);
    
    if (holdings.length === 0) {
      db.close();
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    
    // Calculate asset class weights
    const acWeights = {};
    for (const h of holdings) {
      const ac = h.asset_class || 'US Equity';
      acWeights[ac] = (acWeights[ac] || 0) + h.weight;
    }
    
    // Expected return
    let expectedReturn = 0;
    for (const [ac, weight] of Object.entries(acWeights)) {
      expectedReturn += (cma.assetClasses[ac]?.expectedReturn || 6) * weight;
    }
    
    // Volatility
    const volatility = calculatePortfolioVolatility(acWeights, cma);
    
    // Sharpe ratio
    const sharpe = volatility > 0 ? (expectedReturn - cma.riskFreeRate) / volatility : 0;
    
    // Generate efficient frontier
    const frontier = [];
    for (let i = 0; i <= 20; i++) {
      const stockPct = i / 20;
      const bondPct = 1 - stockPct;
      
      const weights = {
        'US Equity': stockPct * 0.70,
        'Intl Developed': stockPct * 0.20,
        'Emerging Markets': stockPct * 0.10,
        'US Bonds': bondPct
      };
      
      let expRet = 0;
      for (const [ac, w] of Object.entries(weights)) {
        expRet += (cma.assetClasses[ac]?.expectedReturn || 6) * w;
      }
      
      const vol = calculatePortfolioVolatility(weights, cma);
      
      frontier.push({
        stockAllocation: stockPct * 100,
        expectedReturn: expRet,
        volatility: vol,
        sharpe: vol > 0 ? (expRet - cma.riskFreeRate) / vol : 0
      });
    }
    
    db.close();
    
    return NextResponse.json({
      portfolio: {
        expectedReturn,
        volatility,
        sharpe,
        assetClassWeights: acWeights
      },
      frontier,
      cma: {
        assetClasses: cma.assetClasses,
        riskFreeRate: cma.riskFreeRate
      }
    });
  } catch (error) {
    console.error('Optimize error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
