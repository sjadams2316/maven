import { NextResponse } from 'next/server';

const MODEL_PORTFOLIOS = {
  blackrock_conservative: { manager: 'BlackRock', name: 'Conservative', riskLevel: 1, allocation: { 'US Equity': 0.25, 'Intl Developed': 0.05, 'Emerging Markets': 0.00, 'US Bonds': 0.70 }, targetReturn: 4.5 },
  blackrock_moderate: { manager: 'BlackRock', name: 'Moderate', riskLevel: 2, allocation: { 'US Equity': 0.40, 'Intl Developed': 0.10, 'Emerging Markets': 0.05, 'US Bonds': 0.45 }, targetReturn: 5.5 },
  blackrock_growth: { manager: 'BlackRock', name: 'Growth', riskLevel: 3, allocation: { 'US Equity': 0.55, 'Intl Developed': 0.15, 'Emerging Markets': 0.05, 'US Bonds': 0.25 }, targetReturn: 6.5 },
  blackrock_aggressive: { manager: 'BlackRock', name: 'Aggressive', riskLevel: 4, allocation: { 'US Equity': 0.65, 'Intl Developed': 0.20, 'Emerging Markets': 0.10, 'US Bonds': 0.05 }, targetReturn: 7.5 },
  
  vanguard_income: { manager: 'Vanguard', name: 'LifeStrategy Income', riskLevel: 1, allocation: { 'US Equity': 0.15, 'Intl Developed': 0.05, 'Emerging Markets': 0.00, 'US Bonds': 0.80 }, targetReturn: 4.0 },
  vanguard_conservative: { manager: 'Vanguard', name: 'LifeStrategy Conservative', riskLevel: 2, allocation: { 'US Equity': 0.25, 'Intl Developed': 0.10, 'Emerging Markets': 0.05, 'US Bonds': 0.60 }, targetReturn: 5.0 },
  vanguard_moderate: { manager: 'Vanguard', name: 'LifeStrategy Moderate', riskLevel: 3, allocation: { 'US Equity': 0.40, 'Intl Developed': 0.15, 'Emerging Markets': 0.05, 'US Bonds': 0.40 }, targetReturn: 5.8 },
  vanguard_growth: { manager: 'Vanguard', name: 'LifeStrategy Growth', riskLevel: 4, allocation: { 'US Equity': 0.55, 'Intl Developed': 0.20, 'Emerging Markets': 0.05, 'US Bonds': 0.20 }, targetReturn: 6.5 },
  
  fidelity_20: { manager: 'Fidelity', name: 'Asset Manager 20%', riskLevel: 1, allocation: { 'US Equity': 0.15, 'Intl Developed': 0.05, 'Emerging Markets': 0.00, 'US Bonds': 0.80 }, targetReturn: 4.2 },
  fidelity_40: { manager: 'Fidelity', name: 'Asset Manager 40%', riskLevel: 2, allocation: { 'US Equity': 0.30, 'Intl Developed': 0.08, 'Emerging Markets': 0.02, 'US Bonds': 0.60 }, targetReturn: 5.2 },
  fidelity_60: { manager: 'Fidelity', name: 'Asset Manager 60%', riskLevel: 3, allocation: { 'US Equity': 0.45, 'Intl Developed': 0.12, 'Emerging Markets': 0.03, 'US Bonds': 0.40 }, targetReturn: 6.0 },
  fidelity_85: { manager: 'Fidelity', name: 'Asset Manager 85%', riskLevel: 4, allocation: { 'US Equity': 0.60, 'Intl Developed': 0.18, 'Emerging Markets': 0.07, 'US Bonds': 0.15 }, targetReturn: 7.0 },
  
  capitalgroup_conservative: { manager: 'Capital Group', name: 'Conservative Growth', riskLevel: 2, allocation: { 'US Equity': 0.30, 'Intl Developed': 0.10, 'Emerging Markets': 0.05, 'US Bonds': 0.55 }, targetReturn: 5.3 },
  capitalgroup_moderate: { manager: 'Capital Group', name: 'Moderate Growth', riskLevel: 3, allocation: { 'US Equity': 0.45, 'Intl Developed': 0.15, 'Emerging Markets': 0.05, 'US Bonds': 0.35 }, targetReturn: 6.2 },
  capitalgroup_growth: { manager: 'Capital Group', name: 'Growth', riskLevel: 4, allocation: { 'US Equity': 0.55, 'Intl Developed': 0.20, 'Emerging Markets': 0.10, 'US Bonds': 0.15 }, targetReturn: 7.2 },
  capitalgroup_aggressive: { manager: 'Capital Group', name: 'Aggressive Growth', riskLevel: 5, allocation: { 'US Equity': 0.55, 'Intl Developed': 0.25, 'Emerging Markets': 0.15, 'US Bonds': 0.05 }, targetReturn: 8.0 },
  
  jpmorgan_income: { manager: 'JP Morgan', name: 'Income Builder', riskLevel: 1, allocation: { 'US Equity': 0.20, 'Intl Developed': 0.05, 'Emerging Markets': 0.00, 'US Bonds': 0.75 }, targetReturn: 4.3 },
  jpmorgan_balanced: { manager: 'JP Morgan', name: 'Balanced', riskLevel: 3, allocation: { 'US Equity': 0.45, 'Intl Developed': 0.10, 'Emerging Markets': 0.05, 'US Bonds': 0.40 }, targetReturn: 5.8 },
  jpmorgan_growth: { manager: 'JP Morgan', name: 'Growth Advantage', riskLevel: 4, allocation: { 'US Equity': 0.60, 'Intl Developed': 0.15, 'Emerging Markets': 0.05, 'US Bonds': 0.20 }, targetReturn: 6.8 }
};

export async function GET() {
  const models = Object.entries(MODEL_PORTFOLIOS).map(([id, model]) => ({
    id,
    ...model,
    totalEquity: (model.allocation['US Equity'] || 0) + (model.allocation['Intl Developed'] || 0) + (model.allocation['Emerging Markets'] || 0)
  }));
  
  // Group by manager
  const byManager = {};
  for (const model of models) {
    if (!byManager[model.manager]) byManager[model.manager] = [];
    byManager[model.manager].push(model);
  }
  
  return NextResponse.json({ models, byManager });
}

export async function POST(request) {
  const { allocation } = await request.json();
  
  const comparisons = [];
  
  for (const [modelId, model] of Object.entries(MODEL_PORTFOLIOS)) {
    const diffs = {};
    let totalDiff = 0;
    
    for (const ac of ['US Equity', 'Intl Developed', 'Emerging Markets', 'US Bonds']) {
      const userWeight = allocation[ac] || 0;
      const modelWeight = model.allocation[ac] || 0;
      const diff = userWeight - modelWeight;
      diffs[ac] = diff;
      totalDiff += Math.abs(diff);
    }
    
    const similarity = Math.max(0, 100 - (totalDiff * 50));
    
    comparisons.push({
      modelId,
      manager: model.manager,
      name: model.name,
      riskLevel: model.riskLevel,
      targetReturn: model.targetReturn,
      allocation: model.allocation,
      diffs,
      similarity
    });
  }
  
  comparisons.sort((a, b) => b.similarity - a.similarity);
  
  const closest = comparisons[0];
  const insights = [];
  
  if (closest.similarity >= 90) {
    insights.push({ type: 'match', text: `Your allocation closely matches ${closest.manager}'s ${closest.name} model (${closest.similarity.toFixed(0)}% similar)` });
  } else if (closest.similarity >= 70) {
    insights.push({ type: 'similar', text: `Your allocation is similar to ${closest.manager}'s ${closest.name} model (${closest.similarity.toFixed(0)}% match)` });
  }
  
  // Find where user differs from consensus
  const avgAlloc = { 'US Equity': 0, 'Intl Developed': 0, 'Emerging Markets': 0, 'US Bonds': 0 };
  const models = Object.values(MODEL_PORTFOLIOS);
  for (const m of models) {
    for (const ac of Object.keys(avgAlloc)) {
      avgAlloc[ac] += (m.allocation[ac] || 0) / models.length;
    }
  }
  
  for (const [ac, avgWeight] of Object.entries(avgAlloc)) {
    const userWeight = allocation[ac] || 0;
    const diff = userWeight - avgWeight;
    if (Math.abs(diff) > 0.1) {
      insights.push({
        type: diff > 0 ? 'overweight' : 'underweight',
        text: `${diff > 0 ? 'Overweight' : 'Underweight'} ${ac} by ${Math.abs(diff * 100).toFixed(0)}% vs model average`
      });
    }
  }
  
  return NextResponse.json({
    comparisons: comparisons.slice(0, 10),
    closest,
    insights
  });
}
