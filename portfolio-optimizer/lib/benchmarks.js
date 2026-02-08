// Benchmark ETFs for geographic/asset class matching
const BENCHMARKS = {
  'US Equity': 'ITOT',
  'Intl Developed': 'IEFA', 
  'Emerging Markets': 'IEMG',
  'US Bonds': 'AGG'
};

// Calculate blended benchmark weights based on portfolio composition
function calculateBenchmarkWeights(holdings, fundsData) {
  const assetClassWeights = {
    'US Equity': 0,
    'Intl Developed': 0,
    'Emerging Markets': 0,
    'US Bonds': 0,
    'Other': 0
  };

  // Sum up weights by asset class
  for (const holding of holdings) {
    const fund = fundsData.find(f => f.ticker === holding.ticker);
    if (fund && fund.asset_class) {
      const assetClass = fund.asset_class;
      if (assetClass in assetClassWeights) {
        assetClassWeights[assetClass] += holding.weight;
      } else {
        assetClassWeights['Other'] += holding.weight;
      }
    }
  }

  // Convert to benchmark weights (excluding 'Other')
  const benchmarkWeights = {};
  let totalMapped = 0;
  
  for (const [assetClass, weight] of Object.entries(assetClassWeights)) {
    if (assetClass !== 'Other' && weight > 0) {
      benchmarkWeights[BENCHMARKS[assetClass]] = weight;
      totalMapped += weight;
    }
  }

  // Normalize if we have unmapped assets
  if (totalMapped > 0 && totalMapped < 1) {
    const scale = 1 / totalMapped;
    for (const ticker in benchmarkWeights) {
      benchmarkWeights[ticker] *= scale;
    }
  }

  return benchmarkWeights;
}

// Calculate blended benchmark returns
function calculateBenchmarkReturns(benchmarkWeights, benchmarkData) {
  const periods = ['return_1yr', 'return_3yr', 'return_5yr', 'return_10yr'];
  const blendedReturns = {};

  for (const period of periods) {
    let weightedReturn = 0;
    for (const [ticker, weight] of Object.entries(benchmarkWeights)) {
      const benchmark = benchmarkData.find(b => b.ticker === ticker);
      if (benchmark && benchmark[period] !== null) {
        weightedReturn += benchmark[period] * weight;
      }
    }
    blendedReturns[period] = weightedReturn;
  }

  return blendedReturns;
}

module.exports = {
  BENCHMARKS,
  calculateBenchmarkWeights,
  calculateBenchmarkReturns
};
