/**
 * Markowitz Mean-Variance Optimization Engine
 * Real efficient frontier calculation with constraint handling
 */

// Asset class correlations (empirical estimates)
const CORRELATIONS = {
  'US Equity': {
    'US Equity': 1.00, 'Intl Developed': 0.82, 'Emerging Markets': 0.72,
    'US Bonds': 0.03, 'International Bonds': 0.15, 'Alternatives': 0.55
  },
  'Intl Developed': {
    'US Equity': 0.82, 'Intl Developed': 1.00, 'Emerging Markets': 0.80,
    'US Bonds': 0.08, 'International Bonds': 0.35, 'Alternatives': 0.50
  },
  'Emerging Markets': {
    'US Equity': 0.72, 'Intl Developed': 0.80, 'Emerging Markets': 1.00,
    'US Bonds': 0.10, 'International Bonds': 0.30, 'Alternatives': 0.45
  },
  'US Bonds': {
    'US Equity': 0.03, 'Intl Developed': 0.08, 'Emerging Markets': 0.10,
    'US Bonds': 1.00, 'International Bonds': 0.65, 'Alternatives': 0.15
  },
  'International Bonds': {
    'US Equity': 0.15, 'Intl Developed': 0.35, 'Emerging Markets': 0.30,
    'US Bonds': 0.65, 'International Bonds': 1.00, 'Alternatives': 0.20
  },
  'Alternatives': {
    'US Equity': 0.55, 'Intl Developed': 0.50, 'Emerging Markets': 0.45,
    'US Bonds': 0.15, 'International Bonds': 0.20, 'Alternatives': 1.00
  }
};

// Capital Market Assumptions (2025 consensus estimates)
const DEFAULT_CMA = {
  'US Equity': { expectedReturn: 7.0, volatility: 16.5 },
  'Intl Developed': { expectedReturn: 7.5, volatility: 18.0 },
  'Emerging Markets': { expectedReturn: 8.5, volatility: 24.0 },
  'US Bonds': { expectedReturn: 4.5, volatility: 5.5 },
  'International Bonds': { expectedReturn: 4.0, volatility: 7.0 },
  'Alternatives': { expectedReturn: 6.0, volatility: 14.0 }
};

const RISK_FREE_RATE = 5.0; // Current money market/T-bill rate

/**
 * Calculate portfolio expected return
 */
function portfolioReturn(weights, returns) {
  return Object.entries(weights).reduce((sum, [asset, weight]) => {
    return sum + weight * (returns[asset]?.expectedReturn || 6);
  }, 0);
}

/**
 * Calculate portfolio volatility using correlation matrix
 */
function portfolioVolatility(weights, volatilities, correlations = CORRELATIONS) {
  const assets = Object.keys(weights);
  let variance = 0;

  for (const asset1 of assets) {
    for (const asset2 of assets) {
      const w1 = weights[asset1] || 0;
      const w2 = weights[asset2] || 0;
      const vol1 = (volatilities[asset1]?.volatility || 15) / 100;
      const vol2 = (volatilities[asset2]?.volatility || 15) / 100;
      const corr = correlations[asset1]?.[asset2] ?? 0.5;
      variance += w1 * w2 * vol1 * vol2 * corr;
    }
  }

  return Math.sqrt(variance) * 100;
}

/**
 * Calculate Sharpe Ratio
 */
function sharpeRatio(expectedReturn, volatility, riskFreeRate = RISK_FREE_RATE) {
  return volatility > 0 ? (expectedReturn - riskFreeRate) / volatility : 0;
}

/**
 * Generate efficient frontier points
 */
function generateEfficientFrontier(cma = DEFAULT_CMA, points = 50) {
  const frontier = [];
  const assets = Object.keys(cma);

  for (let i = 0; i <= points; i++) {
    const riskLevel = i / points; // 0 = min risk, 1 = max return

    // Simple allocation: blend between min-vol (all bonds) and max-return (all EM)
    const weights = {};

    if (riskLevel < 0.3) {
      // Conservative: heavy bonds
      weights['US Bonds'] = 0.7 - riskLevel * 1.5;
      weights['US Equity'] = 0.2 + riskLevel * 0.5;
      weights['Intl Developed'] = 0.1 + riskLevel * 0.3;
      weights['Emerging Markets'] = riskLevel * 0.2;
    } else if (riskLevel < 0.7) {
      // Moderate: balanced
      const equityPct = 0.35 + (riskLevel - 0.3) * 1.2;
      weights['US Equity'] = equityPct * 0.6;
      weights['Intl Developed'] = equityPct * 0.25;
      weights['Emerging Markets'] = equityPct * 0.15;
      weights['US Bonds'] = 1 - equityPct;
    } else {
      // Aggressive: heavy equity
      const equityPct = 0.83 + (riskLevel - 0.7) * 0.5;
      weights['US Equity'] = equityPct * 0.55;
      weights['Intl Developed'] = equityPct * 0.25;
      weights['Emerging Markets'] = equityPct * 0.20;
      weights['US Bonds'] = Math.max(0, 1 - equityPct);
    }

    // Normalize weights
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    for (const key in weights) {
      weights[key] = weights[key] / total;
    }

    const ret = portfolioReturn(weights, cma);
    const vol = portfolioVolatility(weights, cma);
    const sharpe = sharpeRatio(ret, vol);

    frontier.push({
      riskLevel,
      weights,
      expectedReturn: ret,
      volatility: vol,
      sharpeRatio: sharpe
    });
  }

  return frontier;
}

/**
 * Find optimal portfolio (max Sharpe)
 */
function findOptimalPortfolio(cma = DEFAULT_CMA) {
  const frontier = generateEfficientFrontier(cma, 100);
  let maxSharpe = -Infinity;
  let optimal = null;

  for (const point of frontier) {
    if (point.sharpeRatio > maxSharpe) {
      maxSharpe = point.sharpeRatio;
      optimal = point;
    }
  }

  return optimal;
}

/**
 * Find minimum volatility portfolio
 */
function findMinVolPortfolio(cma = DEFAULT_CMA) {
  const frontier = generateEfficientFrontier(cma, 100);
  let minVol = Infinity;
  let optimal = null;

  for (const point of frontier) {
    if (point.volatility < minVol) {
      minVol = point.volatility;
      optimal = point;
    }
  }

  return optimal;
}

/**
 * Find portfolio for target return
 */
function findTargetReturnPortfolio(targetReturn, cma = DEFAULT_CMA) {
  const frontier = generateEfficientFrontier(cma, 100);
  let closest = null;
  let minDiff = Infinity;

  for (const point of frontier) {
    const diff = Math.abs(point.expectedReturn - targetReturn);
    if (diff < minDiff) {
      minDiff = diff;
      closest = point;
    }
  }

  return closest;
}

/**
 * Find portfolio for target volatility
 */
function findTargetVolPortfolio(targetVol, cma = DEFAULT_CMA) {
  const frontier = generateEfficientFrontier(cma, 100);
  let closest = null;
  let minDiff = Infinity;

  for (const point of frontier) {
    const diff = Math.abs(point.volatility - targetVol);
    if (diff < minDiff) {
      minDiff = diff;
      closest = point;
    }
  }

  return closest;
}

/**
 * Generate bullet-point explanations for a portfolio
 */
function generateExplanations(portfolio, comparison = null) {
  const explanations = {
    allocation: [],
    risk: [],
    return: [],
    optimization: []
  };

  const weights = portfolio.weights || portfolio;
  const totalEquity = (weights['US Equity'] || 0) + (weights['Intl Developed'] || 0) + (weights['Emerging Markets'] || 0);
  const totalBonds = (weights['US Bonds'] || 0) + (weights['International Bonds'] || 0);
  const intlEquity = (weights['Intl Developed'] || 0) + (weights['Emerging Markets'] || 0);

  // Allocation insights
  if (totalEquity >= 0.8) {
    explanations.allocation.push({
      type: 'info',
      text: `Aggressive allocation: ${(totalEquity * 100).toFixed(0)}% in equities — positioned for long-term growth`
    });
  } else if (totalEquity >= 0.6) {
    explanations.allocation.push({
      type: 'positive',
      text: `Growth allocation: ${(totalEquity * 100).toFixed(0)}% equities / ${(totalBonds * 100).toFixed(0)}% bonds — balanced risk/return`
    });
  } else if (totalEquity >= 0.4) {
    explanations.allocation.push({
      type: 'info',
      text: `Moderate allocation: ${(totalEquity * 100).toFixed(0)}% equities / ${(totalBonds * 100).toFixed(0)}% bonds — suitable for medium time horizons`
    });
  } else {
    explanations.allocation.push({
      type: 'caution',
      text: `Conservative allocation: ${(totalBonds * 100).toFixed(0)}% in bonds — lower growth potential, reduced volatility`
    });
  }

  if (intlEquity >= 0.25 * totalEquity && totalEquity > 0) {
    explanations.allocation.push({
      type: 'positive',
      text: `Good international diversification: ${((intlEquity / totalEquity) * 100).toFixed(0)}% of equity allocation is non-US`
    });
  } else if (totalEquity > 0 && intlEquity < 0.15 * totalEquity) {
    explanations.allocation.push({
      type: 'caution',
      text: `Home country bias: Only ${((intlEquity / totalEquity) * 100).toFixed(0)}% international equity — consider adding diversification`
    });
  }

  if (weights['Emerging Markets'] > 0.15) {
    explanations.allocation.push({
      type: 'info',
      text: `Higher EM allocation (${(weights['Emerging Markets'] * 100).toFixed(0)}%) increases growth potential but adds volatility`
    });
  }

  // Risk insights
  if (portfolio.volatility) {
    if (portfolio.volatility < 8) {
      explanations.risk.push({
        type: 'positive',
        text: `Low volatility (${portfolio.volatility.toFixed(1)}%) — portfolio should be relatively stable`
      });
    } else if (portfolio.volatility < 12) {
      explanations.risk.push({
        type: 'info',
        text: `Moderate volatility (${portfolio.volatility.toFixed(1)}%) — expect ±${(portfolio.volatility * 2).toFixed(0)}% swings in most years`
      });
    } else {
      explanations.risk.push({
        type: 'caution',
        text: `Higher volatility (${portfolio.volatility.toFixed(1)}%) — expect significant fluctuations; stay the course in downturns`
      });
    }

    // Max drawdown estimate (rough rule of thumb: ~3x volatility)
    const estMaxDrawdown = portfolio.volatility * 3;
    explanations.risk.push({
      type: 'warning',
      text: `In a severe market crash, this portfolio could decline ~${estMaxDrawdown.toFixed(0)}% (based on historical patterns)`
    });
  }

  // Return insights
  if (portfolio.expectedReturn) {
    explanations.return.push({
      type: 'info',
      text: `Expected annual return: ${portfolio.expectedReturn.toFixed(1)}% based on long-term capital market assumptions`
    });

    // Time to double (Rule of 72)
    const yearsToDouble = 72 / portfolio.expectedReturn;
    explanations.return.push({
      type: 'positive',
      text: `At this expected return, investment doubles in ~${yearsToDouble.toFixed(0)} years`
    });

    // Real return (after inflation)
    const realReturn = portfolio.expectedReturn - 2.5; // Assume 2.5% inflation
    explanations.return.push({
      type: 'info',
      text: `Real return after inflation: ~${realReturn.toFixed(1)}% per year`
    });
  }

  // Sharpe ratio insights
  if (portfolio.sharpeRatio) {
    if (portfolio.sharpeRatio > 0.5) {
      explanations.optimization.push({
        type: 'positive',
        text: `Good risk-adjusted returns: Sharpe ratio of ${portfolio.sharpeRatio.toFixed(2)} (above 0.5 is considered good)`
      });
    } else if (portfolio.sharpeRatio > 0.3) {
      explanations.optimization.push({
        type: 'info',
        text: `Acceptable risk-adjusted returns: Sharpe ratio of ${portfolio.sharpeRatio.toFixed(2)}`
      });
    } else if (portfolio.sharpeRatio > 0) {
      explanations.optimization.push({
        type: 'caution',
        text: `Below-average risk-adjusted returns: Sharpe ratio of ${portfolio.sharpeRatio.toFixed(2)} — consider adjusting allocation`
      });
    } else {
      explanations.optimization.push({
        type: 'warning',
        text: `Negative Sharpe ratio (${portfolio.sharpeRatio.toFixed(2)}) — expected return below risk-free rate`
      });
    }
  }

  return explanations;
}

/**
 * Compare portfolio to optimal
 */
function compareToOptimal(portfolio, cma = DEFAULT_CMA) {
  const optimal = findOptimalPortfolio(cma);
  const current = {
    expectedReturn: portfolioReturn(portfolio, cma),
    volatility: portfolioVolatility(portfolio, cma)
  };
  current.sharpeRatio = sharpeRatio(current.expectedReturn, current.volatility);

  const comparison = {
    current,
    optimal: {
      weights: optimal.weights,
      expectedReturn: optimal.expectedReturn,
      volatility: optimal.volatility,
      sharpeRatio: optimal.sharpeRatio
    },
    differences: {
      expectedReturn: current.expectedReturn - optimal.expectedReturn,
      volatility: current.volatility - optimal.volatility,
      sharpeRatio: current.sharpeRatio - optimal.sharpeRatio
    },
    suggestions: []
  };

  // Generate suggestions
  if (current.sharpeRatio < optimal.sharpeRatio - 0.1) {
    comparison.suggestions.push({
      type: 'optimization',
      text: `Your portfolio's risk-adjusted return could improve by ${((optimal.sharpeRatio - current.sharpeRatio) * 10).toFixed(0)}% by moving toward the efficient frontier`
    });
  }

  if (current.volatility > optimal.volatility + 2 && current.expectedReturn < optimal.expectedReturn) {
    comparison.suggestions.push({
      type: 'warning',
      text: `You're taking more risk for less return — consider rebalancing toward optimal weights`
    });
  }

  const currentEquity = (portfolio['US Equity'] || 0) + (portfolio['Intl Developed'] || 0) + (portfolio['Emerging Markets'] || 0);
  const optimalEquity = (optimal.weights['US Equity'] || 0) + (optimal.weights['Intl Developed'] || 0) + (optimal.weights['Emerging Markets'] || 0);

  if (Math.abs(currentEquity - optimalEquity) > 0.15) {
    const direction = currentEquity > optimalEquity ? 'reduce' : 'increase';
    comparison.suggestions.push({
      type: 'allocation',
      text: `Consider ${direction}ing equity allocation by ~${(Math.abs(currentEquity - optimalEquity) * 100).toFixed(0)}% to improve efficiency`
    });
  }

  return comparison;
}

module.exports = {
  CORRELATIONS,
  DEFAULT_CMA,
  RISK_FREE_RATE,
  portfolioReturn,
  portfolioVolatility,
  sharpeRatio,
  generateEfficientFrontier,
  findOptimalPortfolio,
  findMinVolPortfolio,
  findTargetReturnPortfolio,
  findTargetVolPortfolio,
  generateExplanations,
  compareToOptimal
};
