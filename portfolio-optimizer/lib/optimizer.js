// Mean-Variance Portfolio Optimization (Markowitz)
const { DEFAULT_CMA, calculateExpectedReturn, calculatePortfolioVolatility, calculateSharpeRatio } = require('./cma');

const ASSET_CLASSES = ['US Equity', 'Intl Developed', 'Emerging Markets', 'US Bonds'];

// Generate efficient frontier points
function generateEfficientFrontier(cma = DEFAULT_CMA, points = 50, constraints = {}) {
  const { minWeight = 0, maxWeight = 1 } = constraints;
  
  const frontier = [];
  
  // Generate random portfolios and find efficient ones
  const portfolios = [];
  
  // Generate many random portfolios
  for (let i = 0; i < 5000; i++) {
    const weights = generateRandomWeights(ASSET_CLASSES.length, minWeight, maxWeight);
    const assetClassWeights = {};
    ASSET_CLASSES.forEach((ac, idx) => {
      assetClassWeights[ac] = weights[idx];
    });
    
    const expectedReturn = calculateExpectedReturn(assetClassWeights, cma);
    const volatility = calculatePortfolioVolatility(assetClassWeights, cma);
    const sharpe = calculateSharpeRatio(expectedReturn, volatility);
    
    portfolios.push({
      weights: assetClassWeights,
      expectedReturn,
      volatility,
      sharpe
    });
  }
  
  // Sort by volatility
  portfolios.sort((a, b) => a.volatility - b.volatility);
  
  // Find efficient frontier (highest return for each volatility level)
  const volBuckets = {};
  for (const p of portfolios) {
    const bucket = Math.round(p.volatility * 10) / 10; // Round to 0.1%
    if (!volBuckets[bucket] || volBuckets[bucket].expectedReturn < p.expectedReturn) {
      volBuckets[bucket] = p;
    }
  }
  
  // Convert to array and sort
  const efficientPortfolios = Object.values(volBuckets)
    .sort((a, b) => a.volatility - b.volatility);
  
  // Sample to get desired number of points
  const step = Math.max(1, Math.floor(efficientPortfolios.length / points));
  for (let i = 0; i < efficientPortfolios.length; i += step) {
    frontier.push(efficientPortfolios[i]);
  }
  
  return frontier;
}

// Generate random weights that sum to 1
function generateRandomWeights(n, min = 0, max = 1) {
  const weights = [];
  let remaining = 1;
  
  for (let i = 0; i < n - 1; i++) {
    const maxAllowed = Math.min(max, remaining - min * (n - i - 1));
    const minAllowed = Math.max(min, remaining - max * (n - i - 1));
    const weight = minAllowed + Math.random() * (maxAllowed - minAllowed);
    weights.push(weight);
    remaining -= weight;
  }
  weights.push(remaining);
  
  // Shuffle to randomize which asset gets the remainder
  for (let i = weights.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [weights[i], weights[j]] = [weights[j], weights[i]];
  }
  
  return weights;
}

// Find optimal portfolio for target return
function findOptimalForTargetReturn(targetReturn, cma = DEFAULT_CMA, constraints = {}) {
  const { minWeight = 0, maxWeight = 1 } = constraints;
  
  let bestPortfolio = null;
  let minVol = Infinity;
  
  // Monte Carlo search
  for (let i = 0; i < 10000; i++) {
    const weights = generateRandomWeights(ASSET_CLASSES.length, minWeight, maxWeight);
    const assetClassWeights = {};
    ASSET_CLASSES.forEach((ac, idx) => {
      assetClassWeights[ac] = weights[idx];
    });
    
    const expectedReturn = calculateExpectedReturn(assetClassWeights, cma);
    
    // Check if close to target return
    if (Math.abs(expectedReturn - targetReturn) < 0.5) {
      const volatility = calculatePortfolioVolatility(assetClassWeights, cma);
      if (volatility < minVol) {
        minVol = volatility;
        bestPortfolio = {
          weights: assetClassWeights,
          expectedReturn,
          volatility,
          sharpe: calculateSharpeRatio(expectedReturn, volatility)
        };
      }
    }
  }
  
  return bestPortfolio;
}

// Find maximum Sharpe ratio portfolio
function findMaxSharpePortfolio(cma = DEFAULT_CMA, constraints = {}) {
  const { minWeight = 0, maxWeight = 1 } = constraints;
  
  let bestPortfolio = null;
  let maxSharpe = -Infinity;
  
  for (let i = 0; i < 10000; i++) {
    const weights = generateRandomWeights(ASSET_CLASSES.length, minWeight, maxWeight);
    const assetClassWeights = {};
    ASSET_CLASSES.forEach((ac, idx) => {
      assetClassWeights[ac] = weights[idx];
    });
    
    const expectedReturn = calculateExpectedReturn(assetClassWeights, cma);
    const volatility = calculatePortfolioVolatility(assetClassWeights, cma);
    const sharpe = calculateSharpeRatio(expectedReturn, volatility);
    
    if (sharpe > maxSharpe) {
      maxSharpe = sharpe;
      bestPortfolio = {
        weights: assetClassWeights,
        expectedReturn,
        volatility,
        sharpe
      };
    }
  }
  
  return bestPortfolio;
}

// Find minimum volatility portfolio
function findMinVolPortfolio(cma = DEFAULT_CMA, constraints = {}) {
  const { minWeight = 0, maxWeight = 1 } = constraints;
  
  let bestPortfolio = null;
  let minVol = Infinity;
  
  for (let i = 0; i < 10000; i++) {
    const weights = generateRandomWeights(ASSET_CLASSES.length, minWeight, maxWeight);
    const assetClassWeights = {};
    ASSET_CLASSES.forEach((ac, idx) => {
      assetClassWeights[ac] = weights[idx];
    });
    
    const expectedReturn = calculateExpectedReturn(assetClassWeights, cma);
    const volatility = calculatePortfolioVolatility(assetClassWeights, cma);
    
    if (volatility < minVol) {
      minVol = volatility;
      bestPortfolio = {
        weights: assetClassWeights,
        expectedReturn,
        volatility,
        sharpe: calculateSharpeRatio(expectedReturn, volatility)
      };
    }
  }
  
  return bestPortfolio;
}

// Risk parity allocation
function calculateRiskParity(cma = DEFAULT_CMA) {
  // Simple risk parity: weight inversely proportional to volatility
  const invVols = {};
  let totalInvVol = 0;
  
  for (const ac of ASSET_CLASSES) {
    const invVol = 1 / (cma.volatility[ac] || 15);
    invVols[ac] = invVol;
    totalInvVol += invVol;
  }
  
  const weights = {};
  for (const ac of ASSET_CLASSES) {
    weights[ac] = invVols[ac] / totalInvVol;
  }
  
  const expectedReturn = calculateExpectedReturn(weights, cma);
  const volatility = calculatePortfolioVolatility(weights, cma);
  
  return {
    weights,
    expectedReturn,
    volatility,
    sharpe: calculateSharpeRatio(expectedReturn, volatility),
    method: 'Risk Parity'
  };
}

module.exports = {
  generateEfficientFrontier,
  findOptimalForTargetReturn,
  findMaxSharpePortfolio,
  findMinVolPortfolio,
  calculateRiskParity,
  ASSET_CLASSES
};
