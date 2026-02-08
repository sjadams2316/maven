import { NextResponse } from 'next/server';
const { buildHybridModel, getSourceModels, analyzeModelConsensus, getModelInsights } = require('../../../lib/hybrid-model-builder');

export async function POST(request) {
  try {
    const { riskProfile } = await request.json();
    
    if (!riskProfile) {
      return NextResponse.json({ error: 'riskProfile required' }, { status: 400 });
    }

    const validProfiles = ['conservative', 'moderate', 'growth', 'aggressive'];
    const normalizedProfile = riskProfile.toLowerCase().replace('moderately ', '').replace('moderate_conservative', 'moderate');
    
    // Map risk profiler outputs to our model categories
    let mappedProfile = normalizedProfile;
    if (normalizedProfile.includes('conservative') && !normalizedProfile.includes('moderate')) {
      mappedProfile = 'conservative';
    } else if (normalizedProfile.includes('moderate')) {
      mappedProfile = 'moderate';
    } else if (normalizedProfile.includes('growth')) {
      mappedProfile = 'growth';
    } else if (normalizedProfile.includes('aggressive')) {
      mappedProfile = 'aggressive';
    }

    if (!validProfiles.includes(mappedProfile)) {
      mappedProfile = 'moderate'; // Default
    }

    const hybridModel = buildHybridModel(mappedProfile);
    const sourceModels = getSourceModels(mappedProfile);
    const consensus = analyzeModelConsensus(mappedProfile);
    const insights = getModelInsights(mappedProfile);

    return NextResponse.json({
      success: true,
      riskProfile: mappedProfile,
      hybridModel,
      insights,
      sourceModels: sourceModels.map(m => ({
        manager: m.manager,
        model: m.model,
        allocation: m.allocation,
        historicalReturn: m.historicalReturn,
        historicalVol: m.historicalVol,
        sharpe: m.sharpe,
        expenseRatio: m.expenseRatio,
      })),
      consensus,
    });
  } catch (error) {
    console.error('Hybrid model error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  // Return all available profiles
  const profiles = ['conservative', 'moderate', 'growth', 'aggressive'];
  const results = {};
  
  for (const profile of profiles) {
    results[profile] = buildHybridModel(profile);
  }
  
  return NextResponse.json(results);
}
