// Capital Market Assumptions (CMA)
// Default assumptions based on long-term historical averages and forward-looking estimates

const DEFAULT_CMA = {
  name: 'Default CMA (10-Year Forward)',
  assetClasses: {
    'US Equity': {
      expectedReturn: 7.5,
      volatility: 16.5,
      sharpeProxy: 0.45
    },
    'Intl Developed': {
      expectedReturn: 6.5,
      volatility: 18.0,
      sharpeProxy: 0.36
    },
    'Emerging Markets': {
      expectedReturn: 8.0,
      volatility: 23.0,
      sharpeProxy: 0.35
    },
    'US Bonds': {
      expectedReturn: 4.0,
      volatility: 5.5,
      sharpeProxy: 0.73
    }
  },
  // Correlation matrix
  correlations: {
    'US Equity': { 'US Equity': 1.00, 'Intl Developed': 0.85, 'Emerging Markets': 0.75, 'US Bonds': 0.05 },
    'Intl Developed': { 'US Equity': 0.85, 'Intl Developed': 1.00, 'Emerging Markets': 0.80, 'US Bonds': 0.10 },
    'Emerging Markets': { 'US Equity': 0.75, 'Emerging Markets': 1.00, 'Intl Developed': 0.80, 'US Bonds': 0.15 },
    'US Bonds': { 'US Equity': 0.05, 'Intl Developed': 0.10, 'Emerging Markets': 0.15, 'US Bonds': 1.00 }
  },
  riskFreeRate: 4.5 // Current T-bill rate
};

// Calculate portfolio expected return based on CMA
function calculateExpectedReturn(holdings, fundsData, cma = DEFAULT_CMA) {
  let expectedReturn = 0;
  
  for (const holding of holdings) {
    const fund = fundsData.find(f => f.ticker === holding.ticker);
    if (fund && fund.asset_class && cma.assetClasses[fund.asset_class]) {
      expectedReturn += cma.assetClasses[fund.asset_class].expectedReturn * holding.weight;
    }
  }
  
  return expectedReturn;
}

// Calculate portfolio volatility (standard deviation)
function calculatePortfolioVolatility(holdings, fundsData, cma = DEFAULT_CMA) {
  const assetClasses = Object.keys(cma.assetClasses);
  
  // Get weight by asset class
  const weights = {};
  for (const ac of assetClasses) weights[ac] = 0;
  
  for (const holding of holdings) {
    const fund = fundsData.find(f => f.ticker === holding.ticker);
    if (fund && fund.asset_class && weights.hasOwnProperty(fund.asset_class)) {
      weights[fund.asset_class] += holding.weight;
    }
  }
  
  // Calculate variance using correlation matrix
  let variance = 0;
  for (const ac1 of assetClasses) {
    for (const ac2 of assetClasses) {
      const w1 = weights[ac1] || 0;
      const w2 = weights[ac2] || 0;
      const vol1 = cma.assetClasses[ac1]?.volatility || 0;
      const vol2 = cma.assetClasses[ac2]?.volatility || 0;
      const corr = cma.correlations[ac1]?.[ac2] || 0;
      
      variance += w1 * w2 * (vol1/100) * (vol2/100) * corr;
    }
  }
  
  return Math.sqrt(variance) * 100; // Return as percentage
}

// Calculate Sharpe Ratio
function calculateSharpeRatio(expectedReturn, volatility, riskFreeRate = DEFAULT_CMA.riskFreeRate) {
  if (volatility === 0) return 0;
  return (expectedReturn - riskFreeRate) / volatility;
}

// Generate efficient frontier points
function generateEfficientFrontier(fundsData, cma = DEFAULT_CMA, points = 20) {
  const frontier = [];
  
  // Simple approach: vary allocation between stocks and bonds
  for (let i = 0; i <= points; i++) {
    const stockWeight = i / points;
    const bondWeight = 1 - stockWeight;
    
    // Split stock weight between US/Intl/EM (70/20/10)
    const holdings = [
      { ticker: 'ITOT', weight: stockWeight * 0.70, asset_class: 'US Equity' },
      { ticker: 'IEFA', weight: stockWeight * 0.20, asset_class: 'Intl Developed' },
      { ticker: 'IEMG', weight: stockWeight * 0.10, asset_class: 'Emerging Markets' },
      { ticker: 'AGG', weight: bondWeight, asset_class: 'US Bonds' }
    ];
    
    const expectedReturn = holdings.reduce((sum, h) => {
      return sum + (cma.assetClasses[h.asset_class]?.expectedReturn || 0) * h.weight;
    }, 0);
    
    const volatility = calculatePortfolioVolatility(
      holdings.map(h => ({ ticker: h.ticker, weight: h.weight })),
      holdings.map(h => ({ ticker: h.ticker, asset_class: h.asset_class })),
      cma
    );
    
    frontier.push({
      stockAllocation: stockWeight * 100,
      bondAllocation: bondWeight * 100,
      expectedReturn,
      volatility,
      sharpe: calculateSharpeRatio(expectedReturn, volatility, cma.riskFreeRate)
    });
  }
  
  return frontier;
}

module.exports = {
  DEFAULT_CMA,
  calculateExpectedReturn,
  calculatePortfolioVolatility,
  calculateSharpeRatio,
  generateEfficientFrontier
};
