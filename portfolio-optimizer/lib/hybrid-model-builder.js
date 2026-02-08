/**
 * Hybrid Model Builder
 * 
 * Analyzes model portfolios from major asset managers and constructs
 * an optimized "All-Star" hybrid model for each risk profile.
 */

// Comprehensive model portfolio data from major asset managers
// Each model includes allocation, historical performance, and source year
const ASSET_MANAGER_MODELS = {
  // ============ CONSERVATIVE (20-40% equity) ============
  conservative: [
    {
      manager: 'Vanguard',
      model: 'LifeStrategy Conservative Growth',
      allocation: { 'US Equity': 24, 'Intl Equity': 16, 'US Bonds': 42, 'Intl Bonds': 18 },
      historicalReturn: 5.2, // 10yr annualized
      historicalVol: 6.8,
      sharpe: 0.54,
      expenseRatio: 0.12,
      source: '2024'
    },
    {
      manager: 'BlackRock',
      model: 'Target Allocation Conservative',
      allocation: { 'US Equity': 20, 'Intl Equity': 10, 'US Bonds': 50, 'Intl Bonds': 10, 'Alternatives': 10 },
      historicalReturn: 4.8,
      historicalVol: 5.9,
      sharpe: 0.56,
      expenseRatio: 0.25,
      source: '2024'
    },
    {
      manager: 'Fidelity',
      model: 'Asset Manager 20%',
      allocation: { 'US Equity': 14, 'Intl Equity': 6, 'US Bonds': 55, 'Short-Term': 25 },
      historicalReturn: 4.1,
      historicalVol: 4.2,
      sharpe: 0.62,
      expenseRatio: 0.53,
      source: '2024'
    },
    {
      manager: 'Schwab',
      model: 'Conservative',
      allocation: { 'US Equity': 18, 'Intl Equity': 12, 'US Bonds': 45, 'Intl Bonds': 15, 'Cash': 10 },
      historicalReturn: 4.5,
      historicalVol: 5.5,
      sharpe: 0.55,
      expenseRatio: 0.08,
      source: '2024'
    },
  ],

  // ============ MODERATE (40-60% equity) ============
  moderate: [
    {
      manager: 'Vanguard',
      model: 'LifeStrategy Moderate Growth',
      allocation: { 'US Equity': 36, 'Intl Equity': 24, 'US Bonds': 28, 'Intl Bonds': 12 },
      historicalReturn: 6.8,
      historicalVol: 10.2,
      sharpe: 0.51,
      expenseRatio: 0.13,
      source: '2024'
    },
    {
      manager: 'BlackRock',
      model: 'Target Allocation Moderate',
      allocation: { 'US Equity': 32, 'Intl Equity': 18, 'US Bonds': 30, 'Intl Bonds': 10, 'Alternatives': 10 },
      historicalReturn: 6.5,
      historicalVol: 9.8,
      sharpe: 0.50,
      expenseRatio: 0.28,
      source: '2024'
    },
    {
      manager: 'JPMorgan',
      model: 'SmartRetirement Blend Moderate',
      allocation: { 'US Equity': 35, 'Intl Equity': 15, 'US Bonds': 35, 'Intl Bonds': 10, 'Alternatives': 5 },
      historicalReturn: 6.4,
      historicalVol: 9.5,
      sharpe: 0.51,
      expenseRatio: 0.45,
      source: '2024'
    },
    {
      manager: 'Capital Group',
      model: 'American Balanced',
      allocation: { 'US Equity': 40, 'Intl Equity': 10, 'US Bonds': 45, 'Cash': 5 },
      historicalReturn: 7.2,
      historicalVol: 10.5,
      sharpe: 0.53,
      expenseRatio: 0.58,
      source: '2024'
    },
    {
      manager: 'Fidelity',
      model: 'Balanced',
      allocation: { 'US Equity': 42, 'Intl Equity': 8, 'US Bonds': 40, 'Short-Term': 10 },
      historicalReturn: 7.0,
      historicalVol: 10.8,
      sharpe: 0.50,
      expenseRatio: 0.49,
      source: '2024'
    },
    {
      manager: 'Schwab',
      model: 'Balanced',
      allocation: { 'US Equity': 35, 'Intl Equity': 15, 'US Bonds': 30, 'Intl Bonds': 15, 'Cash': 5 },
      historicalReturn: 6.6,
      historicalVol: 9.6,
      sharpe: 0.52,
      expenseRatio: 0.08,
      source: '2024'
    },
  ],

  // ============ GROWTH (60-80% equity) ============
  growth: [
    {
      manager: 'Vanguard',
      model: 'LifeStrategy Growth',
      allocation: { 'US Equity': 48, 'Intl Equity': 32, 'US Bonds': 14, 'Intl Bonds': 6 },
      historicalReturn: 8.2,
      historicalVol: 13.5,
      sharpe: 0.48,
      expenseRatio: 0.14,
      source: '2024'
    },
    {
      manager: 'BlackRock',
      model: 'Target Allocation Growth',
      allocation: { 'US Equity': 45, 'Intl Equity': 25, 'US Bonds': 15, 'Intl Bonds': 5, 'Alternatives': 10 },
      historicalReturn: 8.0,
      historicalVol: 13.2,
      sharpe: 0.47,
      expenseRatio: 0.30,
      source: '2024'
    },
    {
      manager: 'JPMorgan',
      model: 'SmartRetirement Blend Growth',
      allocation: { 'US Equity': 50, 'Intl Equity': 20, 'US Bonds': 18, 'Intl Bonds': 7, 'Alternatives': 5 },
      historicalReturn: 8.3,
      historicalVol: 13.8,
      sharpe: 0.48,
      expenseRatio: 0.48,
      source: '2024'
    },
    {
      manager: 'Capital Group',
      model: 'Growth Portfolio',
      allocation: { 'US Equity': 55, 'Intl Equity': 25, 'US Bonds': 15, 'Cash': 5 },
      historicalReturn: 8.8,
      historicalVol: 14.5,
      sharpe: 0.49,
      expenseRatio: 0.62,
      source: '2024'
    },
    {
      manager: 'Fidelity',
      model: 'Asset Manager 70%',
      allocation: { 'US Equity': 49, 'Intl Equity': 21, 'US Bonds': 25, 'Short-Term': 5 },
      historicalReturn: 8.1,
      historicalVol: 13.4,
      sharpe: 0.47,
      expenseRatio: 0.56,
      source: '2024'
    },
    {
      manager: 'Schwab',
      model: 'Growth',
      allocation: { 'US Equity': 47, 'Intl Equity': 23, 'US Bonds': 18, 'Intl Bonds': 9, 'Cash': 3 },
      historicalReturn: 7.9,
      historicalVol: 13.0,
      sharpe: 0.47,
      expenseRatio: 0.08,
      source: '2024'
    },
  ],

  // ============ AGGRESSIVE (80%+ equity) ============
  aggressive: [
    {
      manager: 'Vanguard',
      model: 'LifeStrategy Equity Growth',
      allocation: { 'US Equity': 60, 'Intl Equity': 40, 'US Bonds': 0, 'Intl Bonds': 0 },
      historicalReturn: 9.1,
      historicalVol: 16.2,
      sharpe: 0.45,
      expenseRatio: 0.14,
      source: '2024'
    },
    {
      manager: 'BlackRock',
      model: 'Target Allocation Aggressive',
      allocation: { 'US Equity': 55, 'Intl Equity': 30, 'Emerging Markets': 5, 'Alternatives': 10 },
      historicalReturn: 9.0,
      historicalVol: 15.8,
      sharpe: 0.46,
      expenseRatio: 0.32,
      source: '2024'
    },
    {
      manager: 'JPMorgan',
      model: 'SmartRetirement Blend Aggressive',
      allocation: { 'US Equity': 58, 'Intl Equity': 27, 'Emerging Markets': 5, 'US Bonds': 5, 'Alternatives': 5 },
      historicalReturn: 9.3,
      historicalVol: 16.0,
      sharpe: 0.47,
      expenseRatio: 0.50,
      source: '2024'
    },
    {
      manager: 'Capital Group',
      model: 'Aggressive Growth',
      allocation: { 'US Equity': 60, 'Intl Equity': 30, 'Emerging Markets': 10 },
      historicalReturn: 9.8,
      historicalVol: 17.2,
      sharpe: 0.46,
      expenseRatio: 0.65,
      source: '2024'
    },
    {
      manager: 'Schwab',
      model: 'Aggressive',
      allocation: { 'US Equity': 55, 'Intl Equity': 30, 'Emerging Markets': 10, 'US Bonds': 5 },
      historicalReturn: 9.0,
      historicalVol: 15.5,
      sharpe: 0.47,
      expenseRatio: 0.08,
      source: '2024'
    },
  ],
};

// Normalize allocation keys to standard format
const ALLOCATION_MAPPING = {
  'US Equity': 'US Equity',
  'Intl Equity': 'Intl Developed',
  'Intl Developed': 'Intl Developed',
  'International': 'Intl Developed',
  'Emerging Markets': 'Emerging Markets',
  'EM': 'Emerging Markets',
  'US Bonds': 'US Bonds',
  'Intl Bonds': 'US Bonds', // Combine for simplicity
  'Short-Term': 'US Bonds',
  'Cash': 'US Bonds',
  'Alternatives': 'US Equity', // Map to equity for now (most alts are equity-like risk)
};

function normalizeAllocation(allocation) {
  const normalized = {
    'US Equity': 0,
    'Intl Developed': 0,
    'Emerging Markets': 0,
    'US Bonds': 0,
  };
  
  for (const [key, value] of Object.entries(allocation)) {
    const mappedKey = ALLOCATION_MAPPING[key] || key;
    if (normalized.hasOwnProperty(mappedKey)) {
      normalized[mappedKey] += value;
    }
  }
  
  return normalized;
}

/**
 * Build hybrid "All-Star" model for a given risk profile
 * Weights models by their historical Sharpe ratio
 */
function buildHybridModel(riskProfile) {
  const models = ASSET_MANAGER_MODELS[riskProfile];
  if (!models || models.length === 0) {
    return null;
  }

  // Calculate weights based on Sharpe ratio (higher = better)
  const totalSharpe = models.reduce((sum, m) => sum + m.sharpe, 0);
  const weights = models.map(m => m.sharpe / totalSharpe);

  // Build weighted average allocation
  const hybridAllocation = {
    'US Equity': 0,
    'Intl Developed': 0,
    'Emerging Markets': 0,
    'US Bonds': 0,
  };

  models.forEach((model, i) => {
    const normalized = normalizeAllocation(model.allocation);
    for (const key of Object.keys(hybridAllocation)) {
      hybridAllocation[key] += normalized[key] * weights[i];
    }
  });

  // Round to whole numbers
  for (const key of Object.keys(hybridAllocation)) {
    hybridAllocation[key] = Math.round(hybridAllocation[key]);
  }

  // Ensure it sums to 100
  const total = Object.values(hybridAllocation).reduce((a, b) => a + b, 0);
  if (total !== 100) {
    hybridAllocation['US Equity'] += (100 - total);
  }

  // Calculate expected metrics (weighted average)
  const expectedReturn = models.reduce((sum, m, i) => sum + m.historicalReturn * weights[i], 0);
  const expectedVol = models.reduce((sum, m, i) => sum + m.historicalVol * weights[i], 0);
  const avgExpense = models.reduce((sum, m, i) => sum + m.expenseRatio * weights[i], 0);

  return {
    name: `Maven All-Star ${riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)}`,
    allocation: hybridAllocation,
    expectedReturn: expectedReturn.toFixed(1),
    expectedVol: expectedVol.toFixed(1),
    sharpe: (expectedReturn / expectedVol).toFixed(2),
    methodology: 'Sharpe-weighted average of leading asset managers',
    sourceModels: models.map(m => ({
      manager: m.manager,
      model: m.model,
      weight: (weights[models.indexOf(m)] * 100).toFixed(1) + '%',
      sharpe: m.sharpe,
    })),
    recommendations: generateRecommendations(hybridAllocation, riskProfile),
  };
}

/**
 * Actual funds used by each asset manager in their model portfolios
 * Mix of active and passive, proprietary and third-party
 */
const MANAGER_FUNDS = {
  'Vanguard': {
    'US Equity': [
      { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'Passive ETF', expense: 0.03, 
        aum: '430.5B', asOf: '12/31/2025',
        description: 'The ultimate one-stop shop for US stocks. Holds 4,000+ companies from mega-caps to small-caps.',
        bullets: ['Tracks CRSP US Total Market Index', '4,000+ holdings across all market caps', '$430B+ AUM — largest total market ETF', '0.03% expense = $3 per $10K invested'],
        bestFor: 'Core US equity exposure' },
      { ticker: 'VFIAX', name: 'Vanguard 500 Index Admiral', type: 'Passive Mutual Fund', expense: 0.04,
        aum: '520.8B', asOf: '12/31/2025',
        description: 'The original index fund, tracking the S&P 500. Warren Buffett recommends this for most investors.',
        bullets: ['Tracks S&P 500 (large-cap US)', 'Admiral shares = institutional pricing', 'Buffett\'s recommendation for his wife\'s trust', '$3K minimum investment'],
        bestFor: 'Large-cap US exposure' },
    ],
    'Intl Developed': [
      { ticker: 'VXUS', name: 'Vanguard Total Intl Stock ETF', type: 'Passive ETF', expense: 0.08,
        aum: '78.2B', asOf: '12/31/2025',
        description: 'Everything outside the US in one fund. Developed + emerging markets combined.',
        bullets: ['8,000+ stocks across 40+ countries', 'Market-cap weighted global exposure', 'Includes both developed & emerging', 'Single fund for all international'],
        bestFor: 'Complete international exposure' },
    ],
    'Emerging Markets': [
      { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', type: 'Passive ETF', expense: 0.08,
        aum: '82.5B', asOf: '12/31/2025',
        description: 'Access to China, India, Brazil, Taiwan, and other fast-growing economies.',
        bullets: ['5,000+ stocks in 25 emerging markets', 'Heavy China/Taiwan/India weighting', '$82B+ AUM — most liquid EM ETF', 'FTSE index (excludes South Korea)'],
        bestFor: 'Emerging markets exposure' },
    ],
    'US Bonds': [
      { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'Passive ETF', expense: 0.03,
        aum: '115.3B', asOf: '12/31/2025',
        description: 'The bond market in one fund. Government, corporate, and mortgage-backed bonds.',
        bullets: ['10,000+ investment-grade bonds', '~6.2 year average duration', '$115B+ AUM — largest bond ETF', 'Monthly income distributions'],
        bestFor: 'Core bond allocation' },
    ],
  },
  'BlackRock': {
    'US Equity': [
      { ticker: 'IVV', name: 'iShares Core S&P 500 ETF', type: 'Passive ETF', expense: 0.03,
        aum: '565.2B', asOf: '12/31/2025',
        description: 'BlackRock\'s S&P 500 tracker. $565B AUM with institutional-grade liquidity.',
        bullets: ['Tracks S&P 500 Index', '$565B+ AUM — massive liquidity', 'Penny-wide bid-ask spreads', 'Tax-efficient ETF structure'],
        bestFor: 'Large-cap US equity' },
    ],
    'Intl Developed': [
      { ticker: 'IEFA', name: 'iShares Core MSCI EAFE ETF', type: 'Passive ETF', expense: 0.07,
        aum: '118.5B', asOf: '12/31/2025',
        description: 'Europe, Australasia, and Far East developed markets. The ex-US developed world.',
        bullets: ['2,500+ stocks in 21 developed markets', '$118B+ AUM — most liquid EAFE ETF', 'Japan, UK, France, Germany heavy', 'MSCI EAFE Index'],
        bestFor: 'Developed international' },
    ],
    'Emerging Markets': [
      { ticker: 'IEMG', name: 'iShares Core MSCI Emerging Mkts ETF', type: 'Passive ETF', expense: 0.09,
        aum: '82.3B', asOf: '12/31/2025',
        description: 'Broad emerging markets exposure including small-caps for extra diversification.',
        bullets: ['2,800+ stocks (includes small-caps)', 'Broader than EEM (includes small cap)', '$82B+ AUM', 'MSCI EM Investable Market Index'],
        bestFor: 'Emerging markets with small-cap' },
    ],
    'US Bonds': [
      { ticker: 'AGG', name: 'iShares Core US Aggregate Bond ETF', type: 'Passive ETF', expense: 0.03,
        aum: '118.8B', asOf: '12/31/2025',
        description: 'The "Agg" - the most widely used bond benchmark. What most bond funds try to beat.',
        bullets: ['Bloomberg US Aggregate Index', '$119B+ AUM — the benchmark', '10,000+ investment-grade bonds', 'Government + corporate + MBS'],
        bestFor: 'Core bond allocation' },
    ],
  },
  'JPMorgan': {
    'US Equity': [
      { ticker: 'JEPI', name: 'JPMorgan Equity Premium Income ETF', type: 'Active ETF', expense: 0.35,
        aum: '38.5B', asOf: '12/31/2025',
        description: 'The income monster. Generates 7-9% yield by selling covered calls on the S&P 500.',
        bullets: ['7-9% distribution yield', '$38B+ AUM — largest covered call ETF', 'Lower volatility than S&P 500', 'Trades some upside for income'],
        bestFor: 'High income with lower volatility' },
      { ticker: 'JQUA', name: 'JPMorgan US Quality Factor ETF', type: 'Active ETF', expense: 0.12,
        aum: '5.2B', asOf: '12/31/2025',
        description: 'Quality factor exposure - profitable companies with clean balance sheets.',
        bullets: ['Quality factor strategy', 'High ROE, low debt companies', 'Defensive characteristics', 'Factor-based systematic approach'],
        bestFor: 'Quality factor tilt' },
      { ticker: 'JGRO', name: 'JPMorgan Growth Advantage I', type: 'Active Mutual Fund (I shares)', expense: 0.44,
        aum: '8.8B', asOf: '12/31/2025',
        description: 'JPMorgan\'s flagship growth fund. Active management seeking tomorrow\'s winners.',
        bullets: ['Institutional share class', 'Active growth stock selection', 'Concentrated 50-80 holdings', 'JPMorgan equity research team'],
        bestFor: 'Active growth exposure' },
    ],
    'Intl Developed': [
      { ticker: 'JIRE', name: 'JPMorgan Intl Research Enhanced Eq ETF', type: 'Active ETF', expense: 0.24,
        aum: '12.5B', asOf: '12/31/2025',
        description: 'Research-enhanced international. Data-driven tilts on a passive base.',
        bullets: ['Enhanced indexing approach', 'Data-driven stock selection', '$12.5B AUM', 'Lower tracking error than pure active'],
        bestFor: 'Enhanced international' },
    ],
    'Emerging Markets': [
      { ticker: 'JEMA', name: 'JPMorgan ActiveBuilders EM Equity ETF', type: 'Active ETF', expense: 0.33,
        aum: '4.8B', asOf: '12/31/2025',
        description: 'Active emerging markets with JPMorgan\'s global research team.',
        bullets: ['Active EM stock selection', 'JPMorgan global research platform', 'Flexible country allocation', 'Can adjust China weighting'],
        bestFor: 'Active emerging markets' },
    ],
    'US Bonds': [
      { ticker: 'JBND', name: 'JPMorgan Active Bond ETF', type: 'Active ETF', expense: 0.30,
        aum: '2.8B', asOf: '12/31/2025',
        description: 'Active bond management in an ETF. Can adjust duration and credit based on outlook.',
        bullets: ['Active duration management', 'Flexible credit allocation', 'Can go defensive in rising rates', 'JPMorgan fixed income expertise'],
        bestFor: 'Active core bonds' },
      { ticker: 'JPST', name: 'JPMorgan Ultra-Short Income ETF', type: 'Active ETF', expense: 0.18,
        aum: '28.5B', asOf: '12/31/2025',
        description: 'Better than money market. Ultra-short bonds for cash you need somewhat soon.',
        bullets: ['Ultra-short duration (<1 year)', '$28B+ AUM — largest ultra-short', 'Higher yield than money market', 'Monthly distributions'],
        bestFor: 'Cash alternative' },
    ],
  },
  'Capital Group': {
    'US Equity': [
      { ticker: 'CGUS', name: 'Capital Group Core Equity ETF', type: 'Active ETF', expense: 0.33,
        aum: '8.2B', asOf: '12/31/2025',
        description: 'Capital Group\'s multi-manager approach in an ETF. Multiple PMs, one fund.',
        bullets: ['Multi-manager system', 'Each PM runs their sleeve independently', '50+ years of American Funds heritage', 'Blend of growth and value'],
        bestFor: 'Active core US equity' },
      { ticker: 'GFFFX', name: 'Growth Fund of America F-2', type: 'Active Mutual Fund (F2)', expense: 0.40,
        aum: '336.0B', asOf: '12/31/2025', sharpe: 0.86, holdings: 296, turnover: '32%',
        description: 'One of the largest actively managed funds in the world. 12 portfolio managers with 50+ years of track record.',
        bullets: ['F-2 = fee-based advisory share class', '$336B AUM — massive scale advantage', '12 portfolio managers, multi-sleeve approach', '10-year Sharpe: 0.86 (below avg risk, solid return)'],
        bestFor: 'Active large-cap growth' },
      { ticker: 'AFIFX', name: 'Fundamental Investors F-1', type: 'Active Mutual Fund (F1)', expense: 0.65,
        aum: '161.8B', asOf: '12/31/2025', sharpe: 0.88, holdings: 221, turnover: '28%',
        description: 'Fundamental research-driven. Seeks undervalued companies with strong products and market positions.',
        bullets: ['F-1 share class (F-2 = AFFFX at 0.37%)', '$162B AUM with 9 portfolio managers', '10-year Sharpe: 0.88 — excellent risk-adjusted returns', 'Lower turnover (28%) = tax efficiency'],
        bestFor: 'Fundamental value investing' },
      { ticker: 'AICFX', name: 'Investment Company of America F-2', type: 'Active Mutual Fund (F2)', expense: 0.35,
        aum: '145.0B', asOf: '12/31/2025',
        description: 'The original American Fund since 1934. Growth-and-income focus with 90-year track record.',
        bullets: ['F-2 fee-based share class', 'Oldest American Fund — 90 year track record', 'Growth + value + income balance', 'Conservative large-cap approach'],
        bestFor: 'Core equity with income' },
    ],
    'Intl Developed': [
      { ticker: 'CGIE', name: 'Capital Group Intl Equity ETF', type: 'Active ETF', expense: 0.54,
        aum: '4.1B', asOf: '12/31/2025',
        description: 'Capital Group\'s international expertise in ETF form. Active country/stock selection.',
        bullets: ['Multi-manager international', 'Active country allocation', 'Can significantly underweight/overweight', 'Research offices worldwide'],
        bestFor: 'Active international' },
      { ticker: 'AEGFX', name: 'EuroPacific Growth F-2', type: 'Active Mutual Fund (F2)', expense: 0.53,
        aum: '152.0B', asOf: '12/31/2025',
        description: 'The flagship international growth fund. One of the best long-term track records outside the US.',
        bullets: ['F-2 = fee-based advisory pricing', '$152B+ in assets', 'Growth bias in developed + EM', 'Multi-manager approach'],
        bestFor: 'International growth' },
      { ticker: 'ANWFX', name: 'New Perspective Fund F-2', type: 'Active Mutual Fund (F2)', expense: 0.51,
        aum: '162.7B', asOf: '12/31/2025', sharpe: 0.77, holdings: 260, turnover: '23%',
        description: 'Global fund focused on multinational companies changing world trade patterns. 54% US, 43% international.',
        bullets: ['F-2 fee-based class — 0.51% expense', '$163B AUM with 10 portfolio managers', 'Global approach (not just ex-US)', '23% turnover — tax efficient'],
        bestFor: 'Global growth' },
    ],
    'Emerging Markets': [
      { ticker: 'NWFFX', name: 'New World Fund F-2', type: 'Active Mutual Fund (F2)', expense: 0.68,
        aum: '38.5B', asOf: '12/31/2025',
        description: 'Unique approach: EM stocks PLUS developed market companies with significant EM revenue exposure.',
        bullets: ['F-2 fee-based share class', 'EM stocks + EM-exposed developed stocks', 'More diversified than pure EM funds', 'Lower volatility than straight EM'],
        bestFor: 'Broader EM exposure' },
    ],
    'US Bonds': [
      { ticker: 'CGCP', name: 'Capital Group Core Plus Income ETF', type: 'Active ETF', expense: 0.34,
        aum: '3.8B', asOf: '12/31/2025',
        description: 'Core-plus means they can reach for yield when it makes sense. Multi-sector flexibility.',
        bullets: ['Investment-grade core + high yield sleeve', 'Active duration management', 'Multi-sector approach', 'Can add credit risk for yield'],
        bestFor: 'Active core-plus bonds' },
      { ticker: 'BFAFX', name: 'Bond Fund of America F-2', type: 'Active Mutual Fund (F2)', expense: 0.37,
        aum: '68.2B', asOf: '12/31/2025',
        description: 'Conservative bond fund focused on capital preservation and income. High-quality focus.',
        bullets: ['F-2 fee-based pricing', 'High-quality investment grade focus', 'Lower risk profile than peers', 'Consistent monthly income'],
        bestFor: 'Conservative bonds' },
    ],
  },
  'Fidelity': {
    'US Equity': [
      { ticker: 'FXAIX', name: 'Fidelity 500 Index Fund', type: 'Passive Mutual Fund', expense: 0.015,
        aum: '582.3B', asOf: '12/31/2025',
        description: 'Fidelity\'s S&P 500 fund. The lowest cost mutual fund option available anywhere.',
        bullets: ['0.015% expense = $1.50 per $10K', '$582B+ AUM — one of the largest funds', 'No minimum investment', 'Great for any account type'],
        bestFor: 'Ultra-low-cost S&P 500' },
      { ticker: 'FCNTX', name: 'Fidelity Contrafund', type: 'Active Mutual Fund', expense: 0.39,
        aum: '148.5B', asOf: '12/31/2025',
        description: 'Will Danoff\'s legendary fund. 30+ years of finding tomorrow\'s leaders at reasonable prices.',
        bullets: ['Will Danoff — manager since 1990', '$148B AUM — among largest active funds', 'Growth at reasonable price (GARP)', '30+ year track record'],
        bestFor: 'Active large-cap growth' },
      { ticker: 'FDGRX', name: 'Fidelity Growth Company', type: 'Active Mutual Fund', expense: 0.79,
        aum: '68.2B', asOf: '12/31/2025',
        description: 'Aggressive growth fund. Willing to pay up for the fastest growing companies.',
        bullets: ['Steven Wymer manager', 'Aggressive growth focus', 'Can hold smaller companies', 'Check availability — sometimes closed'],
        bestFor: 'Aggressive growth' },
      { ticker: 'FBGRX', name: 'Fidelity Blue Chip Growth', type: 'Active Mutual Fund', expense: 0.48,
        aum: '85.4B', asOf: '12/31/2025',
        description: 'Large-cap growth focused on established blue chip companies with growth potential.',
        bullets: ['Blue chip growth focus', '$85B+ AUM', 'Quality bias with growth tilt', 'Lower risk than aggressive growth'],
        bestFor: 'Blue chip growth' },
    ],
    'Intl Developed': [
      { ticker: 'FSPSX', name: 'Fidelity Intl Index Fund', type: 'Passive Mutual Fund', expense: 0.035,
        aum: '45.8B', asOf: '12/31/2025',
        description: 'Low-cost international index. Simple, cheap, effective passive exposure.',
        bullets: ['MSCI EAFE Index', '0.035% expense ratio', 'No minimum investment', 'Developed markets ex-US'],
        bestFor: 'Low-cost international' },
      { ticker: 'FIGRX', name: 'Fidelity International Growth', type: 'Active Mutual Fund', expense: 0.56,
        aum: '12.8B', asOf: '12/31/2025',
        description: 'Active international with growth bias. Research-driven global stock picking.',
        bullets: ['Active management', 'Growth-oriented', 'Fidelity global research team', 'Developed + some EM'],
        bestFor: 'Active international growth' },
    ],
    'Emerging Markets': [
      { ticker: 'FPADX', name: 'Fidelity Emerging Markets Index', type: 'Passive Mutual Fund', expense: 0.075,
        aum: '8.5B', asOf: '12/31/2025',
        description: 'Cheap EM index exposure. Set it and forget it passive approach.',
        bullets: ['MSCI Emerging Markets Index', 'Passive approach', '0.075% — low cost for EM', 'Broad diversification'],
        bestFor: 'Low-cost emerging markets' },
    ],
    'US Bonds': [
      { ticker: 'FXNAX', name: 'Fidelity US Bond Index Fund', type: 'Passive Mutual Fund', expense: 0.025,
        aum: '78.2B', asOf: '12/31/2025',
        description: 'Bloomberg Aggregate tracking at rock-bottom cost. Set it and forget it.',
        bullets: ['Bloomberg US Agg Index', '0.025% expense — near zero cost', '$78B+ AUM', 'No minimum investment'],
        bestFor: 'Ultra-low-cost bonds' },
      { ticker: 'FTBFX', name: 'Fidelity Total Bond Fund', type: 'Active Mutual Fund', expense: 0.45,
        aum: '42.5B', asOf: '12/31/2025',
        description: 'Active total bond fund with multi-sector flexibility.',
        bullets: ['Active management', 'Multi-sector approach', 'Can adjust duration and credit', '$42B+ AUM'],
        bestFor: 'Active core bonds' },
    ],
  },
  'PGIM': {
    'US Equity': [
      { ticker: 'PJFZX', name: 'PGIM Jennison Growth Z', type: 'Active Mutual Fund (Z)', expense: 0.60,
        aum: '12.8B', asOf: '12/31/2025',
        description: 'Jennison\'s growth investing expertise. Concentrated high-conviction portfolio of 40-50 holdings.',
        bullets: ['Z share class = institutional/fee-based pricing', 'Jennison Associates sub-advisor', 'Concentrated 40-50 stock portfolio', 'High-conviction growth investing'],
        bestFor: 'Concentrated growth' },
      { ticker: 'SPGZX', name: 'PGIM QMA US Broad Market Index Z', type: 'Passive Mutual Fund (Z)', expense: 0.03,
        aum: '5.2B', asOf: '12/31/2025',
        description: 'Prudential\'s total market index. Institutional Z shares for advisors.',
        bullets: ['Z = fee-based advisor share class', 'Total US market exposure (3,500+ stocks)', 'QMA quantitative index management', '0.03% = near-ETF pricing'],
        bestFor: 'Low-cost total market' },
    ],
    'Intl Developed': [
      { ticker: 'PJIZX', name: 'PGIM Jennison International Opps Z', type: 'Active Mutual Fund (Z)', expense: 0.79,
        aum: '8.4B', asOf: '12/31/2025',
        description: 'International growth with Jennison\'s research-driven active approach.',
        bullets: ['Z share class = institutional pricing', 'Jennison global research team', 'Growth-oriented stock selection', 'Active country/stock selection'],
        bestFor: 'Active international growth' },
    ],
    'Emerging Markets': [
      { ticker: 'PGEMX', name: 'PGIM Emerging Markets Equity Z', type: 'Active Mutual Fund (Z)', expense: 0.97,
        aum: '2.1B', asOf: '12/31/2025',
        description: 'Active emerging markets with fundamental research. Bottom-up stock picking.',
        bullets: ['Z institutional share class', 'Active EM management', 'Bottom-up fundamental research', 'Flexible country allocation'],
        bestFor: 'Active emerging markets' },
    ],
    'US Bonds': [
      { ticker: 'PDBZX', name: 'PGIM Total Return Bond Z', type: 'Active Mutual Fund (Z)', expense: 0.41,
        aum: '52.2B', asOf: '12/31/2025', duration: 5.8, stdDev3yr: 6.05,
        description: 'Core-plus bond fund with $52B in assets. Flexible multi-sector approach.',
        bullets: ['Z share class = fee-based pricing', '$52B AUM — significant scale', '5.8 year duration', '4-star Morningstar rating'],
        bestFor: 'Active core-plus bonds' },
    ],
  },
  'Schwab': {
    'US Equity': [
      { ticker: 'SCHB', name: 'Schwab US Broad Market ETF', type: 'Passive ETF', expense: 0.03,
        aum: '32.5B', asOf: '12/31/2025',
        description: 'Total US market at Schwab\'s trademark low cost. 2,500+ stocks.',
        bullets: ['Dow Jones US Broad Stock Market', '2,500+ holdings', '0.03% expense ratio', 'Commission-free at Schwab'],
        bestFor: 'Total US market' },
      { ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', type: 'Passive ETF', expense: 0.06,
        aum: '62.8B', asOf: '12/31/2025',
        description: 'Dividend growth strategy. Quality companies that grow their dividends consistently.',
        bullets: ['10-year dividend growth requirement', '$62B+ AUM — most popular dividend ETF', '100 holdings, quality screened', '3%+ dividend yield'],
        bestFor: 'Dividend growth' },
    ],
    'Intl Developed': [
      { ticker: 'SCHF', name: 'Schwab Intl Equity ETF', type: 'Passive ETF', expense: 0.06,
        aum: '38.2B', asOf: '12/31/2025',
        description: 'Developed international markets at Schwab\'s low cost.',
        bullets: ['FTSE Developed ex-US Index', '1,500+ holdings', '0.06% expense ratio', '$38B+ AUM'],
        bestFor: 'Low-cost developed intl' },
    ],
    'Emerging Markets': [
      { ticker: 'SCHE', name: 'Schwab Emerging Markets Equity ETF', type: 'Passive ETF', expense: 0.11,
        aum: '12.5B', asOf: '12/31/2025',
        description: 'Broad emerging markets at low cost. FTSE index based.',
        bullets: ['FTSE Emerging Index', '1,700+ holdings', 'Includes South Korea (unlike MSCI)', '0.11% = low cost for EM'],
        bestFor: 'Low-cost emerging markets' },
    ],
    'US Bonds': [
      { ticker: 'SCHZ', name: 'Schwab US Aggregate Bond ETF', type: 'Passive ETF', expense: 0.03,
        aum: '18.5B', asOf: '12/31/2025',
        description: 'The Agg at Schwab pricing. Core bonds done right.',
        bullets: ['Bloomberg US Aggregate', '0.03% expense ratio', '$18B+ AUM', 'Monthly distributions'],
        bestFor: 'Core bonds' },
    ],
  },
};

// Model personality and market condition insights
const MODEL_INSIGHTS = {
  conservative: {
    nickname: 'The Steady Hand',
    quote: '"The goal of the nonprofessional should not be to pick winners, but should rather be to own a cross-section of businesses that in aggregate are bound to do well." — Warren Buffett',
    philosophy: 'Preservation first, growth second. Sleep well at night knowing your portfolio can weather any storm.',
    bullets: [
      'Designed for capital preservation with modest growth',
      'Bond-heavy allocation provides income and stability',
      'Equity sleeve focused on quality, dividend-paying companies',
      'Lower correlation to market swings'
    ],
    marketConditions: {
      bullMarket: 'Will lag during strong equity rallies — and that\'s okay. You\'re not trying to maximize upside.',
      bearMarket: 'Shines when markets fall. Bonds provide ballast, quality equities hold up better.',
      risingRates: 'Some bond pain, but shorter duration and quality tilt helps.',
      recession: 'Built for this. Stable income, defensive positioning.',
    }
  },
  moderate: {
    nickname: 'The Balanced Builder',
    quote: '"The essence of investment management is the management of risks, not the management of returns." — Benjamin Graham',
    philosophy: 'The classic 60/40 evolved. Enough equity for growth, enough bonds to smooth the ride.',
    bullets: [
      'Time-tested balanced approach updated for today',
      'Diversified across asset classes, geographies, and managers',
      'Core-satellite structure: cheap beta + active alpha',
      'Rebalancing opportunities in volatile markets'
    ],
    marketConditions: {
      bullMarket: 'Participates meaningfully in upside with ~60% equity exposure.',
      bearMarket: 'Bonds cushion the fall. Historically recovers faster than aggressive portfolios.',
      risingRates: 'Some headwinds on bonds, but equity growth can offset.',
      recession: 'Balanced approach means balanced pain — and balanced recovery.',
    }
  },
  growth: {
    nickname: 'The Wealth Compounder',
    quote: '"In the short run, the market is a voting machine, but in the long run, it is a weighing machine." — Benjamin Graham',
    philosophy: 'You have time on your side. Accept volatility as the price of admission to long-term wealth building.',
    bullets: [
      'Equity-heavy for maximum long-term compounding',
      'International diversification captures global growth',
      'Active managers seeking tomorrow\'s winners',
      'Small bond allocation for opportunistic rebalancing'
    ],
    marketConditions: {
      bullMarket: 'In its element. High equity exposure captures most of the upside.',
      bearMarket: 'Will feel the pain. But if your timeline is 10+ years, corrections are buying opportunities.',
      risingRates: 'Less bond exposure means less interest rate sensitivity.',
      recession: 'Short-term pain, long-term gain. Quality companies survive and thrive post-recession.',
    }
  },
  aggressive: {
    nickname: 'The Maximum Compounder',
    quote: '"Risk comes from not knowing what you\'re doing." — Warren Buffett',
    philosophy: 'All-in on equities. This is for money you won\'t touch for 20+ years and an iron stomach.',
    bullets: [
      'Near-100% equity for maximum long-term growth',
      'Significant international and emerging markets exposure',
      'Tilts toward growth and momentum factors',
      'Only for investors who can watch 50% drops without panic selling'
    ],
    marketConditions: {
      bullMarket: 'Maximum participation. This is what the portfolio is built for.',
      bearMarket: 'Will drop hard. 40-50% drawdowns are possible. You need to hold through it.',
      risingRates: 'Growth stocks may struggle short-term, but quality wins long-term.',
      recession: 'Painful but ultimately rewarding if you stay the course. The biggest gains come after the biggest drops.',
    }
  },
};

/**
 * Generate fund recommendations - MIX of active and passive from all managers
 */
function generateRecommendations(allocation, riskProfile) {
  const recs = [];
  const managers = Object.keys(MANAGER_FUNDS);

  for (const [assetClass, weight] of Object.entries(allocation)) {
    if (weight <= 0) continue;

    // Collect all funds for this asset class from all managers
    const allFunds = [];
    for (const manager of managers) {
      const funds = MANAGER_FUNDS[manager][assetClass] || [];
      funds.forEach(f => allFunds.push({ ...f, manager }));
    }

    if (allFunds.length === 0) continue;

    // Split by type for variety
    const activeFunds = allFunds.filter(f => f.type.includes('Active'));
    const passiveFunds = allFunds.filter(f => f.type.includes('Passive'));

    // For each asset class, recommend: 1 passive (low cost) + 1-2 active (alpha potential)
    if (passiveFunds.length > 0) {
      // Pick lowest cost passive
      const bestPassive = passiveFunds.sort((a, b) => a.expense - b.expense)[0];
      recs.push({
        asset: assetClass,
        ticker: bestPassive.ticker,
        name: bestPassive.name,
        weight: Math.round(weight * 0.5), // 50% to passive
        type: bestPassive.type,
        manager: bestPassive.manager,
        expense: bestPassive.expense,
        description: bestPassive.description,
        bullets: bestPassive.bullets,
        bestFor: bestPassive.bestFor,
        rationale: `Low-cost beta: ${bestPassive.expense}% expense`,
        category: 'Core (Passive)'
      });
    }

    if (activeFunds.length > 0) {
      // Pick 1-2 active funds from different managers
      const shuffled = activeFunds.sort(() => Math.random() - 0.5);
      const selectedActive = shuffled.slice(0, 2);
      const activeWeight = Math.round(weight * 0.5 / selectedActive.length);
      
      selectedActive.forEach(fund => {
        recs.push({
          asset: assetClass,
          ticker: fund.ticker,
          name: fund.name,
          weight: activeWeight,
          type: fund.type,
          manager: fund.manager,
          expense: fund.expense,
          description: fund.description,
          bullets: fund.bullets,
          bestFor: fund.bestFor,
          rationale: `Active alpha from ${fund.manager}`,
          category: 'Satellite (Active)'
        });
      });
    } else if (passiveFunds.length > 1) {
      // If no active, add another passive from different manager
      const secondPassive = passiveFunds.sort((a, b) => a.expense - b.expense)[1];
      if (secondPassive) {
        recs.push({
          asset: assetClass,
          ticker: secondPassive.ticker,
          name: secondPassive.name,
          weight: Math.round(weight * 0.5),
          type: secondPassive.type,
          manager: secondPassive.manager,
          expense: secondPassive.expense,
          description: secondPassive.description,
          bullets: secondPassive.bullets,
          bestFor: secondPassive.bestFor,
          rationale: `Diversified beta from ${secondPassive.manager}`,
          category: 'Core (Passive)'
        });
      }
    }
  }

  return recs;
}

/**
 * Get all source models for display
 */
function getSourceModels(riskProfile) {
  return ASSET_MANAGER_MODELS[riskProfile] || [];
}

/**
 * Analyze model consensus and divergence
 */
function analyzeModelConsensus(riskProfile) {
  const models = ASSET_MANAGER_MODELS[riskProfile];
  if (!models || models.length === 0) return null;

  const allocations = models.map(m => normalizeAllocation(m.allocation));
  
  const analysis = {};
  for (const key of ['US Equity', 'Intl Developed', 'Emerging Markets', 'US Bonds']) {
    const values = allocations.map(a => a[key]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min;
    
    analysis[key] = {
      average: Math.round(avg),
      min: Math.round(min),
      max: Math.round(max),
      spread: Math.round(spread),
      consensus: spread < 10 ? 'Strong' : spread < 20 ? 'Moderate' : 'Weak',
    };
  }

  return analysis;
}

/**
 * Get model personality and market insights
 */
function getModelInsights(riskProfile) {
  return MODEL_INSIGHTS[riskProfile] || MODEL_INSIGHTS.moderate;
}

module.exports = {
  buildHybridModel,
  getSourceModels,
  analyzeModelConsensus,
  getModelInsights,
  ASSET_MANAGER_MODELS,
  MANAGER_FUNDS,
};
