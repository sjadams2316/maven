/**
 * Maven Investment Thesis - Current Views
 * 
 * This is the intelligence layer. Updated based on ongoing research.
 * Every view has: structural case, valuation, regime context, and honest uncertainty.
 * 
 * Last Updated: 2026-02-08
 */

export interface AssetClassView {
  id: string;
  name: string;
  category: 'equity' | 'fixed-income' | 'alternative' | 'cash';
  
  // Core thesis
  structuralCase: string;
  portfolioRole: string;
  
  // Valuation
  valuation: {
    current: string;
    vsHistory: 'cheap' | 'fair' | 'expensive';
    keyMetrics: { name: string; value: string; historical: string }[];
  };
  
  // Regime context
  regime: {
    current: string;
    catalysts: string[];
    headwinds: string[];
  };
  
  // Forward expectations
  expectedReturn: {
    tenYear: { low: number; mid: number; high: number };
    source: string;
  };
  
  // Honest uncertainty
  uncertainty: {
    timingRisk: string;
    whatCouldGoWrong: string[];
    historicalBaseRate: string;
  };
  
  // Our recommendation
  recommendation: {
    stance: 'underweight' | 'neutral' | 'overweight';
    targetRange: { min: number; max: number };
    reasoning: string;
    caveats: string[];
  };
}

export const CURRENT_VIEWS: AssetClassView[] = [
  // ============================================
  // US EQUITIES
  // ============================================
  {
    id: 'us-large-cap',
    name: 'US Large Cap Stocks',
    category: 'equity',
    
    structuralCase: `US large caps represent the world's most liquid, innovative companies. The US has structural advantages: rule of law, deep capital markets, entrepreneurial culture, and dominant tech platforms. Home bias is often criticized, but US outperformance has been earned through superior earnings growth.`,
    
    portfolioRole: 'Core growth engine. Provides equity risk premium and long-term wealth building.',
    
    valuation: {
      current: 'Expensive by historical standards, but supported by earnings quality',
      vsHistory: 'expensive',
      keyMetrics: [
        { name: 'CAPE', value: '32x', historical: '17x average' },
        { name: 'Forward P/E', value: '21x', historical: '16x average' },
        { name: 'Earnings Yield vs 10Y', value: '4.8% vs 4.3%', historical: 'Stocks usually 2-3% premium' },
      ],
    },
    
    regime: {
      current: 'Late cycle with AI productivity gains. Fed on hold. Earnings resilient.',
      catalysts: [
        'AI productivity boost to margins',
        'Continued earnings growth',
        'Flight to quality in uncertainty',
      ],
      headwinds: [
        'Elevated valuations limit upside',
        'Concentration risk (Mag 7 = 30% of S&P)',
        'Higher-for-longer rates pressure multiples',
      ],
    },
    
    expectedReturn: {
      tenYear: { low: 4, mid: 6, high: 8 },
      source: 'Blend of Vanguard, BlackRock, AQR CMAs',
    },
    
    uncertainty: {
      timingRisk: 'Expensive stocks can get more expensive. Japan 1989 and US 2000 show valuations can stay extreme for years.',
      whatCouldGoWrong: [
        'AI hype disappoints, multiples compress',
        'Recession hits earnings',
        'Antitrust breaks up tech dominance',
        'Rising rates force multiple compression',
      ],
      historicalBaseRate: 'Starting CAPE > 30 has historically led to 0-4% real returns over next decade (vs 6% average).',
    },
    
    recommendation: {
      stance: 'neutral',
      targetRange: { min: 35, max: 50 },
      reasoning: 'US quality and innovation deserve core allocation, but don\'t overweight at current valuations. The structural case is strong, but the price you pay matters.',
      caveats: [
        'If valuations normalize, expect 5-7 years of below-average returns',
        'Diversification into international provides valuation hedge',
        'Consider tilting to equal-weight or value within US',
      ],
    },
  },

  // ============================================
  // INTERNATIONAL DEVELOPED
  // ============================================
  {
    id: 'intl-developed',
    name: 'International Developed Markets',
    category: 'equity',
    
    structuralCase: `Non-US developed markets (Europe, Japan, UK, Australia) represent ~40% of global market cap. Includes world-class companies: ASML, Novo Nordisk, LVMH, Toyota. Provides currency diversification and exposure to different economic cycles.`,
    
    portfolioRole: 'Diversification and valuation hedge against expensive US stocks.',
    
    valuation: {
      current: 'Significantly cheaper than US on all metrics',
      vsHistory: 'cheap',
      keyMetrics: [
        { name: 'CAPE', value: '16x', historical: '15x average (fair)' },
        { name: 'Forward P/E', value: '13x', historical: '14x average' },
        { name: 'Discount to US', value: '50%', historical: '10-20% normal' },
        { name: 'Dividend Yield', value: '3.2%', historical: '2.8% average' },
      ],
    },
    
    regime: {
      current: 'Turning point? Dollar peaked, Europe/Japan showing resilience, reshoring benefits.',
      catalysts: [
        'Dollar weakness = instant returns for US investors',
        'Europe energy crisis resolved',
        'Japan corporate governance reforms',
        'Defense spending boost',
        'China reopening benefits exporters',
      ],
      headwinds: [
        'Demographics (aging populations)',
        'Lower growth potential vs US',
        'Political fragmentation in Europe',
        'Currency volatility',
      ],
    },
    
    expectedReturn: {
      tenYear: { low: 6, mid: 8, high: 10 },
      source: 'Blend of Vanguard, BlackRock, JPMorgan CMAs',
    },
    
    uncertainty: {
      timingRisk: 'International has been "cheap" since 2015. Value trap is real. Could take another 5 years to work.',
      whatCouldGoWrong: [
        'US exceptionalism continues',
        'Dollar strengthens further',
        'Europe recession',
        'Japan deflation returns',
      ],
      historicalBaseRate: 'When US/Int\'l valuation gap > 40%, international has outperformed over following decade 70% of the time. But timing is +/- 5 years.',
    },
    
    recommendation: {
      stance: 'overweight',
      targetRange: { min: 15, max: 25 },
      reasoning: 'Valuations are compelling and the US/int\'l gap is historically extreme. However, we\'ve been saying this for years. Recommend meaningful allocation for diversification, but don\'t bet the farm on mean reversion.',
      caveats: [
        'Cheap can stay cheap — don\'t overweight just for valuation',
        'Currency is a wildcard (+/- 5% annually)',
        'Consider hedged vs unhedged based on dollar view',
        'Japan specifically showing momentum — worth tactical tilt',
      ],
    },
  },

  // ============================================
  // EMERGING MARKETS
  // ============================================
  {
    id: 'emerging-markets',
    name: 'Emerging Markets',
    category: 'equity',
    
    structuralCase: `Emerging markets (China, India, Taiwan, Brazil, etc.) represent higher growth potential but with higher volatility. Demographic tailwinds in India/SE Asia. Contains tech champions (TSMC, Samsung). Commodity exposure.`,
    
    portfolioRole: 'Growth kicker and diversification. Higher risk, higher potential reward.',
    
    valuation: {
      current: 'Cheap, but China overhang keeps it depressed',
      vsHistory: 'cheap',
      keyMetrics: [
        { name: 'Forward P/E', value: '11x', historical: '12x average' },
        { name: 'P/B', value: '1.5x', historical: '1.8x average' },
        { name: 'Discount to US', value: '50%', historical: '25-30% normal' },
      ],
    },
    
    regime: {
      current: 'China drag, but India/Taiwan carrying. Dollar strength hurts EM. Commodity prices supportive.',
      catalysts: [
        'China stimulus / property resolution',
        'India growth story accelerating',
        'Semiconductor supercycle (TSMC)',
        'Commodity supercycle',
        'Dollar weakness',
      ],
      headwinds: [
        'China structural slowdown',
        'Geopolitical risk (Taiwan, Russia)',
        'Currency crises possible',
        'Governance concerns',
      ],
    },
    
    expectedReturn: {
      tenYear: { low: 5, mid: 8, high: 11 },
      source: 'Blend of major CMAs',
    },
    
    uncertainty: {
      timingRisk: 'EM has disappointed for 15 years. China weight is problematic. Very hard to time.',
      whatCouldGoWrong: [
        'China property crisis worsens',
        'Taiwan conflict',
        'EM debt crises',
        'Commodity collapse',
        'Dollar surge',
      ],
      historicalBaseRate: 'EM has underperformed US in 13 of last 15 years. But when it works, it really works (2000-2010).',
    },
    
    recommendation: {
      stance: 'neutral',
      targetRange: { min: 5, max: 15 },
      reasoning: 'EM is cheap but has been a value trap. China uncertainty is the elephant in the room. Recommend modest allocation for diversification, consider ex-China or India-specific exposure.',
      caveats: [
        'China risk is real — consider EM ex-China ETFs',
        'India is expensive within EM but has momentum',
        'Taiwan = semiconductor bet',
        'Very volatile — right allocation depends on your risk tolerance',
      ],
    },
  },

  // ============================================
  // US BONDS
  // ============================================
  {
    id: 'us-bonds',
    name: 'US Investment Grade Bonds',
    category: 'fixed-income',
    
    structuralCase: `Bonds provide income, portfolio stability, and deflation protection. The "risk-free" rate anchors all other asset valuations. After 2022's reset, bonds finally offer real yield.`,
    
    portfolioRole: 'Stability and income. Hedge against equity drawdowns (usually). Dry powder for rebalancing.',
    
    valuation: {
      current: 'Fair value after 2022 reset. Real yields positive for first time in years.',
      vsHistory: 'fair',
      keyMetrics: [
        { name: '10Y Treasury', value: '4.3%', historical: '4.0% long-term avg' },
        { name: 'Real Yield (10Y TIPS)', value: '2.0%', historical: '1.0% avg' },
        { name: 'Aggregate Yield', value: '4.8%', historical: '4.5% avg' },
      ],
    },
    
    regime: {
      current: 'Fed on hold. Inflation normalizing. Fiscal concerns linger.',
      catalysts: [
        'Recession = rates fall, bonds rally',
        'Flight to quality in equity selloff',
        'Inflation continues falling',
      ],
      headwinds: [
        'Fiscal deficits keep supply high',
        'Sticky inflation = higher-for-longer',
        'Duration risk if rates rise further',
        'Correlation with stocks was positive in 2022 (bad for diversification)',
      ],
    },
    
    expectedReturn: {
      tenYear: { low: 4, mid: 5, high: 6 },
      source: 'Current yield + rolldown - defaults',
    },
    
    uncertainty: {
      timingRisk: 'Bonds are more predictable than stocks (you know the yield). But duration risk is real if rates rise.',
      whatCouldGoWrong: [
        'Inflation re-accelerates',
        'Fiscal crisis forces higher yields',
        'Fed stays restrictive longer',
        'Stock-bond correlation stays positive',
      ],
      historicalBaseRate: 'Starting yield has predicted bond returns with ~90% accuracy over 10 years. Current yield ~4.5-5% is your expected return.',
    },
    
    recommendation: {
      stance: 'neutral',
      targetRange: { min: 15, max: 35 },
      reasoning: 'Bonds are finally "back" after 2022. Yields are attractive, real returns are positive. Appropriate allocation depends on your risk tolerance and timeline.',
      caveats: [
        'Younger investors with long horizons can hold less',
        'Consider TIPS for inflation protection',
        'Short duration reduces rate risk',
        'Municipal bonds for high tax brackets',
      ],
    },
  },

  // ============================================
  // CRYPTO (Bitcoin/TAO)
  // ============================================
  {
    id: 'crypto',
    name: 'Cryptocurrency (BTC, TAO)',
    category: 'alternative',
    
    structuralCase: `Bitcoin: Digital gold, scarce supply, institutional adoption growing (ETFs). TAO/Bittensor: Decentralized AI network, pure play on AI compute demand. High conviction thesis but extreme volatility.`,
    
    portfolioRole: 'Asymmetric upside. Hedge against fiat debasement. High risk, high reward.',
    
    valuation: {
      current: 'Traditional valuation doesn\'t apply. Network effects, adoption curves, and narrative drive price.',
      vsHistory: 'fair',
      keyMetrics: [
        { name: 'BTC Market Cap', value: '~$2T', historical: 'Growing vs gold ($14T)' },
        { name: 'TAO Market Cap', value: '~$3B', historical: 'Early stage' },
        { name: 'Halving Cycle', value: 'Mid-cycle (2024 halving)', historical: '12-18 months post-halving = strength' },
      ],
    },
    
    regime: {
      current: 'Institutional adoption phase. ETF inflows strong. AI narrative boosting TAO. Macro supportive.',
      catalysts: [
        'Continued ETF inflows',
        'Sovereign adoption (nation-states)',
        'AI compute demand (TAO)',
        'Halving supply shock',
        'Rate cuts = risk-on',
      ],
      headwinds: [
        'Regulatory crackdown',
        '80% drawdowns are normal',
        'Correlation to tech/risk assets',
        'Concentrated holdings',
      ],
    },
    
    expectedReturn: {
      tenYear: { low: -50, mid: 15, high: 50 },
      source: 'Very wide range reflects extreme uncertainty',
    },
    
    uncertainty: {
      timingRisk: 'Crypto can drop 80% in a year. Position sizing is everything. Only invest what you can lose.',
      whatCouldGoWrong: [
        'Regulatory ban',
        'Better technology emerges',
        'Correlation to traditional assets increases',
        'Permanent bear market',
      ],
      historicalBaseRate: 'BTC has returned >100% annually on average, but with 80%+ drawdowns. Survival bias is extreme.',
    },
    
    recommendation: {
      stance: 'overweight',
      targetRange: { min: 3, max: 10 },
      reasoning: 'High conviction on BTC as digital gold and TAO as AI infrastructure play. BUT position sizing must reflect volatility. 5% allocation can become 15% if it runs — that\'s fine. Never more than you can afford to lose entirely.',
      caveats: [
        'This is NOT financial advice — crypto is speculative',
        'Dollar-cost average, don\'t lump sum',
        'Take profits on the way up',
        'Tax implications are complex',
        'Sam\'s position (215 TAO across accounts) is significant — size appropriately',
      ],
    },
  },
];

// Helper to get view by ID
export function getAssetClassView(id: string): AssetClassView | undefined {
  return CURRENT_VIEWS.find(v => v.id === id);
}

// Get all views by category
export function getViewsByCategory(category: AssetClassView['category']): AssetClassView[] {
  return CURRENT_VIEWS.filter(v => v.category === category);
}

// Summary for quick display
export function getViewsSummary(): { id: string; name: string; stance: string; reasoning: string }[] {
  return CURRENT_VIEWS.map(v => ({
    id: v.id,
    name: v.name,
    stance: v.recommendation.stance,
    reasoning: v.recommendation.reasoning,
  }));
}
