// Model Portfolios from Major Asset Managers
// Based on publicly available target allocation models

const MODEL_PORTFOLIOS = {
  // BlackRock Target Allocation Models
  blackrock_conservative: {
    manager: 'BlackRock',
    name: 'Conservative',
    riskLevel: 1,
    description: 'Capital preservation focus, lower volatility',
    allocation: { 'US Equity': 0.25, 'Intl Developed': 0.05, 'Emerging Markets': 0.00, 'US Bonds': 0.70 },
    targetReturn: 4.5,
    targetVolatility: 6.0
  },
  blackrock_moderate: {
    manager: 'BlackRock',
    name: 'Moderate',
    riskLevel: 2,
    description: 'Balanced growth and income',
    allocation: { 'US Equity': 0.40, 'Intl Developed': 0.10, 'Emerging Markets': 0.05, 'US Bonds': 0.45 },
    targetReturn: 5.5,
    targetVolatility: 9.0
  },
  blackrock_growth: {
    manager: 'BlackRock',
    name: 'Growth',
    riskLevel: 3,
    description: 'Long-term capital appreciation',
    allocation: { 'US Equity': 0.55, 'Intl Developed': 0.15, 'Emerging Markets': 0.05, 'US Bonds': 0.25 },
    targetReturn: 6.5,
    targetVolatility: 12.0
  },
  blackrock_aggressive: {
    manager: 'BlackRock',
    name: 'Aggressive Growth',
    riskLevel: 4,
    description: 'Maximum growth, higher volatility tolerance',
    allocation: { 'US Equity': 0.65, 'Intl Developed': 0.20, 'Emerging Markets': 0.10, 'US Bonds': 0.05 },
    targetReturn: 7.5,
    targetVolatility: 16.0
  },

  // Vanguard LifeStrategy Models
  vanguard_income: {
    manager: 'Vanguard',
    name: 'LifeStrategy Income',
    riskLevel: 1,
    description: 'Current income with some capital growth',
    allocation: { 'US Equity': 0.15, 'Intl Developed': 0.05, 'Emerging Markets': 0.00, 'US Bonds': 0.80 },
    targetReturn: 4.0,
    targetVolatility: 5.5
  },
  vanguard_conservative: {
    manager: 'Vanguard',
    name: 'LifeStrategy Conservative',
    riskLevel: 2,
    description: 'Income and moderate growth',
    allocation: { 'US Equity': 0.25, 'Intl Developed': 0.10, 'Emerging Markets': 0.05, 'US Bonds': 0.60 },
    targetReturn: 5.0,
    targetVolatility: 7.5
  },
  vanguard_moderate: {
    manager: 'Vanguard',
    name: 'LifeStrategy Moderate Growth',
    riskLevel: 3,
    description: 'Capital growth with moderate income',
    allocation: { 'US Equity': 0.40, 'Intl Developed': 0.15, 'Emerging Markets': 0.05, 'US Bonds': 0.40 },
    targetReturn: 5.8,
    targetVolatility: 10.0
  },
  vanguard_growth: {
    manager: 'Vanguard',
    name: 'LifeStrategy Growth',
    riskLevel: 4,
    description: 'Long-term capital growth',
    allocation: { 'US Equity': 0.55, 'Intl Developed': 0.20, 'Emerging Markets': 0.05, 'US Bonds': 0.20 },
    targetReturn: 6.5,
    targetVolatility: 13.0
  },

  // Fidelity Asset Manager Models
  fidelity_20: {
    manager: 'Fidelity',
    name: 'Asset Manager 20%',
    riskLevel: 1,
    description: '20% equity target, income focus',
    allocation: { 'US Equity': 0.15, 'Intl Developed': 0.05, 'Emerging Markets': 0.00, 'US Bonds': 0.80 },
    targetReturn: 4.2,
    targetVolatility: 5.0
  },
  fidelity_40: {
    manager: 'Fidelity',
    name: 'Asset Manager 40%',
    riskLevel: 2,
    description: '40% equity target, balanced',
    allocation: { 'US Equity': 0.30, 'Intl Developed': 0.08, 'Emerging Markets': 0.02, 'US Bonds': 0.60 },
    targetReturn: 5.2,
    targetVolatility: 8.0
  },
  fidelity_60: {
    manager: 'Fidelity',
    name: 'Asset Manager 60%',
    riskLevel: 3,
    description: '60% equity target, growth & income',
    allocation: { 'US Equity': 0.45, 'Intl Developed': 0.12, 'Emerging Markets': 0.03, 'US Bonds': 0.40 },
    targetReturn: 6.0,
    targetVolatility: 11.0
  },
  fidelity_85: {
    manager: 'Fidelity',
    name: 'Asset Manager 85%',
    riskLevel: 4,
    description: '85% equity target, growth focus',
    allocation: { 'US Equity': 0.60, 'Intl Developed': 0.18, 'Emerging Markets': 0.07, 'US Bonds': 0.15 },
    targetReturn: 7.0,
    targetVolatility: 14.5
  },

  // Capital Group / American Funds Models
  capitalgroup_conservative: {
    manager: 'Capital Group',
    name: 'Conservative Growth & Income',
    riskLevel: 2,
    description: 'Emphasizes income with growth potential',
    allocation: { 'US Equity': 0.30, 'Intl Developed': 0.10, 'Emerging Markets': 0.05, 'US Bonds': 0.55 },
    targetReturn: 5.3,
    targetVolatility: 8.5
  },
  capitalgroup_moderate: {
    manager: 'Capital Group',
    name: 'Moderate Growth',
    riskLevel: 3,
    description: 'Balance of growth and stability',
    allocation: { 'US Equity': 0.45, 'Intl Developed': 0.15, 'Emerging Markets': 0.05, 'US Bonds': 0.35 },
    targetReturn: 6.2,
    targetVolatility: 11.0
  },
  capitalgroup_growth: {
    manager: 'Capital Group',
    name: 'Growth',
    riskLevel: 4,
    description: 'Long-term capital appreciation',
    allocation: { 'US Equity': 0.55, 'Intl Developed': 0.20, 'Emerging Markets': 0.10, 'US Bonds': 0.15 },
    targetReturn: 7.2,
    targetVolatility: 14.0
  },
  capitalgroup_aggressive: {
    manager: 'Capital Group',
    name: 'Aggressive Growth',
    riskLevel: 5,
    description: 'Maximum growth, global diversification',
    allocation: { 'US Equity': 0.55, 'Intl Developed': 0.25, 'Emerging Markets': 0.15, 'US Bonds': 0.05 },
    targetReturn: 8.0,
    targetVolatility: 17.0
  },

  // JP Morgan Models
  jpmorgan_income: {
    manager: 'JP Morgan',
    name: 'Income Builder',
    riskLevel: 1,
    description: 'Stable income generation',
    allocation: { 'US Equity': 0.20, 'Intl Developed': 0.05, 'Emerging Markets': 0.00, 'US Bonds': 0.75 },
    targetReturn: 4.3,
    targetVolatility: 5.5
  },
  jpmorgan_balanced: {
    manager: 'JP Morgan',
    name: 'Balanced',
    riskLevel: 3,
    description: 'Classic 60/40 approach',
    allocation: { 'US Equity': 0.45, 'Intl Developed': 0.10, 'Emerging Markets': 0.05, 'US Bonds': 0.40 },
    targetReturn: 5.8,
    targetVolatility: 10.5
  },
  jpmorgan_growth: {
    manager: 'JP Morgan',
    name: 'Growth Advantage',
    riskLevel: 4,
    description: 'Growth-oriented with quality tilt',
    allocation: { 'US Equity': 0.60, 'Intl Developed': 0.15, 'Emerging Markets': 0.05, 'US Bonds': 0.20 },
    targetReturn: 6.8,
    targetVolatility: 13.5
  }
};

function compareToModels(userAllocation) {
  const comparisons = [];
  
  for (const [modelId, model] of Object.entries(MODEL_PORTFOLIOS)) {
    // Calculate allocation differences
    const diffs = {};
    let totalDiff = 0;
    
    for (const ac of ['US Equity', 'Intl Developed', 'Emerging Markets', 'US Bonds']) {
      const userWeight = userAllocation[ac] || 0;
      const modelWeight = model.allocation[ac] || 0;
      const diff = userWeight - modelWeight;
      diffs[ac] = diff;
      totalDiff += Math.abs(diff);
    }
    
    // Similarity score (0-100, higher = more similar)
    const similarity = Math.max(0, 100 - (totalDiff * 50));
    
    comparisons.push({
      modelId,
      ...model,
      diffs,
      totalDiff,
      similarity
    });
  }
  
  // Sort by similarity
  comparisons.sort((a, b) => b.similarity - a.similarity);
  
  return comparisons;
}

function findClosestModel(userAllocation) {
  const comparisons = compareToModels(userAllocation);
  return comparisons[0];
}

function getModelsByManager(manager) {
  return Object.entries(MODEL_PORTFOLIOS)
    .filter(([id, model]) => model.manager === manager)
    .map(([id, model]) => ({ id, ...model }));
}

function getAllModels() {
  return Object.entries(MODEL_PORTFOLIOS).map(([id, model]) => ({ id, ...model }));
}

module.exports = {
  MODEL_PORTFOLIOS,
  compareToModels,
  findClosestModel,
  getModelsByManager,
  getAllModels
};
