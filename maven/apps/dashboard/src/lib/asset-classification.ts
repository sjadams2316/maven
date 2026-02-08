/**
 * COMPREHENSIVE ASSET CLASSIFICATION
 * 
 * Based on Morningstar's full category taxonomy
 * Maps all Morningstar categories to our primary classes
 */

// Our primary asset classes for portfolio display
export type PrimaryAssetClass = 
  | 'usEquity'      // US stocks
  | 'intlEquity'    // International stocks (developed + emerging)
  | 'globalEquity'  // World/Global (mix of US + International)
  | 'fixedIncome'   // Bonds, fixed income
  | 'cash'          // Money markets, cash
  | 'crypto'        // Cryptocurrency
  | 'realAssets'    // REITs, commodities, real estate
  | 'alternatives'  // Alternatives, multi-asset
  | 'other';

// Secondary classification for more detail
export type SecondaryAssetClass = 
  | 'largeCap' | 'midCap' | 'smallCap'           // US equity
  | 'value' | 'blend' | 'growth'                  // Style
  | 'developed' | 'emerging' | 'frontier'         // International regions
  | 'corporate' | 'government' | 'municipal' | 'highYield' | 'tips'  // Bonds
  | 'shortTerm' | 'intermediate' | 'longTerm'     // Duration
  | 'moneyMarket' | 'ultraShort'                  // Cash
  | 'reit' | 'commodities' | 'infrastructure'     // Real assets
  | 'sector' | 'thematic'                         // Specialty
  | null;

export interface AssetClassification {
  primary: PrimaryAssetClass;
  secondary?: SecondaryAssetClass;
  morningstarCategory?: string;
  description: string;
}

/**
 * MORNINGSTAR CATEGORY MAPPINGS
 * 
 * Maps Morningstar category strings to our classification system
 * Categories sourced from Morningstar's official taxonomy
 */
export const MORNINGSTAR_CATEGORY_MAP: Record<string, AssetClassification> = {
  // ============================================
  // US EQUITY - Large Cap
  // ============================================
  'large growth': { primary: 'usEquity', secondary: 'largeCap', description: 'US Large Cap Growth' },
  'large blend': { primary: 'usEquity', secondary: 'largeCap', description: 'US Large Cap Blend' },
  'large value': { primary: 'usEquity', secondary: 'largeCap', description: 'US Large Cap Value' },
  'large-cap growth': { primary: 'usEquity', secondary: 'largeCap', description: 'US Large Cap Growth' },
  'large-cap blend': { primary: 'usEquity', secondary: 'largeCap', description: 'US Large Cap Blend' },
  'large-cap value': { primary: 'usEquity', secondary: 'largeCap', description: 'US Large Cap Value' },
  
  // ============================================
  // US EQUITY - Mid Cap
  // ============================================
  'mid-cap growth': { primary: 'usEquity', secondary: 'midCap', description: 'US Mid Cap Growth' },
  'mid-cap blend': { primary: 'usEquity', secondary: 'midCap', description: 'US Mid Cap Blend' },
  'mid-cap value': { primary: 'usEquity', secondary: 'midCap', description: 'US Mid Cap Value' },
  'mid growth': { primary: 'usEquity', secondary: 'midCap', description: 'US Mid Cap Growth' },
  'mid blend': { primary: 'usEquity', secondary: 'midCap', description: 'US Mid Cap Blend' },
  'mid value': { primary: 'usEquity', secondary: 'midCap', description: 'US Mid Cap Value' },
  
  // ============================================
  // US EQUITY - Small Cap
  // ============================================
  'small growth': { primary: 'usEquity', secondary: 'smallCap', description: 'US Small Cap Growth' },
  'small blend': { primary: 'usEquity', secondary: 'smallCap', description: 'US Small Cap Blend' },
  'small value': { primary: 'usEquity', secondary: 'smallCap', description: 'US Small Cap Value' },
  'small-cap growth': { primary: 'usEquity', secondary: 'smallCap', description: 'US Small Cap Growth' },
  'small-cap blend': { primary: 'usEquity', secondary: 'smallCap', description: 'US Small Cap Blend' },
  'small-cap value': { primary: 'usEquity', secondary: 'smallCap', description: 'US Small Cap Value' },
  
  // ============================================
  // US EQUITY - Sectors
  // ============================================
  'technology': { primary: 'usEquity', secondary: 'sector', description: 'US Technology' },
  'health': { primary: 'usEquity', secondary: 'sector', description: 'US Healthcare' },
  'healthcare': { primary: 'usEquity', secondary: 'sector', description: 'US Healthcare' },
  'financial': { primary: 'usEquity', secondary: 'sector', description: 'US Financials' },
  'financials': { primary: 'usEquity', secondary: 'sector', description: 'US Financials' },
  'consumer cyclical': { primary: 'usEquity', secondary: 'sector', description: 'US Consumer Cyclical' },
  'consumer defensive': { primary: 'usEquity', secondary: 'sector', description: 'US Consumer Defensive' },
  'industrials': { primary: 'usEquity', secondary: 'sector', description: 'US Industrials' },
  'energy': { primary: 'usEquity', secondary: 'sector', description: 'US Energy' },
  'utilities': { primary: 'usEquity', secondary: 'sector', description: 'US Utilities' },
  'communications': { primary: 'usEquity', secondary: 'sector', description: 'US Communications' },
  'natural resources': { primary: 'realAssets', secondary: 'commodities', description: 'Natural Resources' },
  'equity energy': { primary: 'usEquity', secondary: 'sector', description: 'Energy Equity' },
  
  // ============================================
  // GLOBAL / WORLD EQUITY (Mix of US + International)
  // ============================================
  'world large stock': { primary: 'globalEquity', secondary: 'largeCap', description: 'World Large Stock' },
  'world large-stock': { primary: 'globalEquity', secondary: 'largeCap', description: 'World Large Stock' },
  'world large-stock growth': { primary: 'globalEquity', secondary: 'growth', description: 'World Large Stock Growth' },
  'world large-stock blend': { primary: 'globalEquity', secondary: 'blend', description: 'World Large Stock Blend' },
  'world large-stock value': { primary: 'globalEquity', secondary: 'value', description: 'World Large Stock Value' },
  'world small/mid stock': { primary: 'globalEquity', secondary: 'smallCap', description: 'World Small/Mid Stock' },
  'world stock': { primary: 'globalEquity', secondary: null, description: 'World Stock' },
  'global large-stock growth': { primary: 'globalEquity', secondary: 'growth', description: 'Global Large Stock Growth' },
  'global large-stock blend': { primary: 'globalEquity', secondary: 'blend', description: 'Global Large Stock Blend' },
  'global large-stock value': { primary: 'globalEquity', secondary: 'value', description: 'Global Large Stock Value' },
  
  // ============================================
  // INTERNATIONAL EQUITY - Developed Markets
  // ============================================
  'foreign large growth': { primary: 'intlEquity', secondary: 'developed', description: 'Foreign Large Growth' },
  'foreign large blend': { primary: 'intlEquity', secondary: 'developed', description: 'Foreign Large Blend' },
  'foreign large value': { primary: 'intlEquity', secondary: 'developed', description: 'Foreign Large Value' },
  'foreign large-growth': { primary: 'intlEquity', secondary: 'developed', description: 'Foreign Large Growth' },
  'foreign large-blend': { primary: 'intlEquity', secondary: 'developed', description: 'Foreign Large Blend' },
  'foreign large-value': { primary: 'intlEquity', secondary: 'developed', description: 'Foreign Large Value' },
  'foreign small/mid growth': { primary: 'intlEquity', secondary: 'developed', description: 'Foreign Small/Mid Growth' },
  'foreign small/mid blend': { primary: 'intlEquity', secondary: 'developed', description: 'Foreign Small/Mid Blend' },
  'foreign small/mid value': { primary: 'intlEquity', secondary: 'developed', description: 'Foreign Small/Mid Value' },
  'europe stock': { primary: 'intlEquity', secondary: 'developed', description: 'Europe Stock' },
  'japan stock': { primary: 'intlEquity', secondary: 'developed', description: 'Japan Stock' },
  'pacific/asia ex-japan stk': { primary: 'intlEquity', secondary: 'developed', description: 'Pacific/Asia ex-Japan' },
  
  // ============================================
  // INTERNATIONAL EQUITY - Emerging Markets
  // ============================================
  'diversified emerging mkts': { primary: 'intlEquity', secondary: 'emerging', description: 'Diversified Emerging Markets' },
  'diversified emerging markets': { primary: 'intlEquity', secondary: 'emerging', description: 'Diversified Emerging Markets' },
  'emerging markets': { primary: 'intlEquity', secondary: 'emerging', description: 'Emerging Markets' },
  'china region': { primary: 'intlEquity', secondary: 'emerging', description: 'China Region' },
  'india equity': { primary: 'intlEquity', secondary: 'emerging', description: 'India Equity' },
  'latin america stock': { primary: 'intlEquity', secondary: 'emerging', description: 'Latin America Stock' },
  'pacific/asia emerging': { primary: 'intlEquity', secondary: 'emerging', description: 'Pacific/Asia Emerging' },
  
  // ============================================
  // FIXED INCOME - Taxable
  // ============================================
  'long government': { primary: 'fixedIncome', secondary: 'government', description: 'Long Government Bonds' },
  'long-term bond': { primary: 'fixedIncome', secondary: 'longTerm', description: 'Long-Term Bond' },
  'intermediate government': { primary: 'fixedIncome', secondary: 'government', description: 'Intermediate Government' },
  'intermediate core bond': { primary: 'fixedIncome', secondary: 'intermediate', description: 'Intermediate Core Bond' },
  'intermediate core-plus bond': { primary: 'fixedIncome', secondary: 'intermediate', description: 'Intermediate Core-Plus Bond' },
  'intermediate-term bond': { primary: 'fixedIncome', secondary: 'intermediate', description: 'Intermediate-Term Bond' },
  'short government': { primary: 'fixedIncome', secondary: 'government', description: 'Short Government' },
  'short-term bond': { primary: 'fixedIncome', secondary: 'shortTerm', description: 'Short-Term Bond' },
  'ultrashort bond': { primary: 'fixedIncome', secondary: 'ultraShort', description: 'Ultrashort Bond' },
  'corporate bond': { primary: 'fixedIncome', secondary: 'corporate', description: 'Corporate Bond' },
  'high yield bond': { primary: 'fixedIncome', secondary: 'highYield', description: 'High Yield Bond' },
  'bank loan': { primary: 'fixedIncome', secondary: 'corporate', description: 'Bank Loan' },
  'inflation-protected bond': { primary: 'fixedIncome', secondary: 'tips', description: 'Inflation-Protected Bond' },
  'tips': { primary: 'fixedIncome', secondary: 'tips', description: 'TIPS' },
  'multisector bond': { primary: 'fixedIncome', secondary: null, description: 'Multisector Bond' },
  'nontraditional bond': { primary: 'fixedIncome', secondary: null, description: 'Nontraditional Bond' },
  'world bond': { primary: 'fixedIncome', secondary: null, description: 'World Bond' },
  'world bond-usd hedged': { primary: 'fixedIncome', secondary: null, description: 'World Bond USD Hedged' },
  'emerging markets bond': { primary: 'fixedIncome', secondary: 'emerging', description: 'Emerging Markets Bond' },
  'emerging-markets bond': { primary: 'fixedIncome', secondary: 'emerging', description: 'Emerging Markets Bond' },
  'emerging-markets local-currency bond': { primary: 'fixedIncome', secondary: 'emerging', description: 'EM Local Currency Bond' },
  
  // ============================================
  // FIXED INCOME - Municipal
  // ============================================
  'muni national long': { primary: 'fixedIncome', secondary: 'municipal', description: 'Muni National Long' },
  'muni national interm': { primary: 'fixedIncome', secondary: 'municipal', description: 'Muni National Intermediate' },
  'muni national short': { primary: 'fixedIncome', secondary: 'municipal', description: 'Muni National Short' },
  'muni single state long': { primary: 'fixedIncome', secondary: 'municipal', description: 'Muni Single State Long' },
  'muni single state interm': { primary: 'fixedIncome', secondary: 'municipal', description: 'Muni Single State Intermediate' },
  'muni single state short': { primary: 'fixedIncome', secondary: 'municipal', description: 'Muni Single State Short' },
  'high yield muni': { primary: 'fixedIncome', secondary: 'municipal', description: 'High Yield Muni' },
  'muni california long': { primary: 'fixedIncome', secondary: 'municipal', description: 'Muni California Long' },
  'muni new york long': { primary: 'fixedIncome', secondary: 'municipal', description: 'Muni New York Long' },
  
  // ============================================
  // CASH / MONEY MARKET
  // ============================================
  'money market': { primary: 'cash', secondary: 'moneyMarket', description: 'Money Market' },
  'money market-taxable': { primary: 'cash', secondary: 'moneyMarket', description: 'Money Market Taxable' },
  'taxable money market': { primary: 'cash', secondary: 'moneyMarket', description: 'Taxable Money Market' },
  'money market-tax-free': { primary: 'cash', secondary: 'moneyMarket', description: 'Money Market Tax-Free' },
  'prime money market': { primary: 'cash', secondary: 'moneyMarket', description: 'Prime Money Market' },
  'government money market': { primary: 'cash', secondary: 'moneyMarket', description: 'Government Money Market' },
  'treasury money market': { primary: 'cash', secondary: 'moneyMarket', description: 'Treasury Money Market' },
  
  // ============================================
  // REAL ASSETS
  // ============================================
  'real estate': { primary: 'realAssets', secondary: 'reit', description: 'Real Estate' },
  'equity precious metals': { primary: 'realAssets', secondary: 'commodities', description: 'Precious Metals Equity' },
  'commodities broad basket': { primary: 'realAssets', secondary: 'commodities', description: 'Commodities Broad Basket' },
  'commodities focused': { primary: 'realAssets', secondary: 'commodities', description: 'Commodities Focused' },
  'commodities agriculture': { primary: 'realAssets', secondary: 'commodities', description: 'Commodities Agriculture' },
  'commodities energy': { primary: 'realAssets', secondary: 'commodities', description: 'Commodities Energy' },
  'commodities precious metals': { primary: 'realAssets', secondary: 'commodities', description: 'Commodities Precious Metals' },
  'global real estate': { primary: 'realAssets', secondary: 'reit', description: 'Global Real Estate' },
  'infrastructure': { primary: 'realAssets', secondary: 'infrastructure', description: 'Infrastructure' },
  
  // ============================================
  // ALTERNATIVES / MULTI-ASSET
  // ============================================
  'allocation--15% to 30% equity': { primary: 'alternatives', secondary: null, description: 'Conservative Allocation' },
  'allocation--30% to 50% equity': { primary: 'alternatives', secondary: null, description: 'Moderate Allocation' },
  'allocation--50% to 70% equity': { primary: 'alternatives', secondary: null, description: 'Balanced Allocation' },
  'allocation--70% to 85% equity': { primary: 'alternatives', secondary: null, description: 'Growth Allocation' },
  'allocation--85%+ equity': { primary: 'alternatives', secondary: null, description: 'Aggressive Allocation' },
  'tactical allocation': { primary: 'alternatives', secondary: null, description: 'Tactical Allocation' },
  'world allocation': { primary: 'alternatives', secondary: null, description: 'World Allocation' },
  'target-date': { primary: 'alternatives', secondary: null, description: 'Target-Date' },
  'target date': { primary: 'alternatives', secondary: null, description: 'Target-Date' },
  'retirement income': { primary: 'alternatives', secondary: null, description: 'Retirement Income' },
  'convertibles': { primary: 'alternatives', secondary: null, description: 'Convertibles' },
  'preferred stock': { primary: 'alternatives', secondary: null, description: 'Preferred Stock' },
  'long-short equity': { primary: 'alternatives', secondary: null, description: 'Long-Short Equity' },
  'market neutral': { primary: 'alternatives', secondary: null, description: 'Market Neutral' },
  'multialternative': { primary: 'alternatives', secondary: null, description: 'Multi-Alternative' },
  'options-based': { primary: 'alternatives', secondary: null, description: 'Options-Based' },
  'trading--leveraged equity': { primary: 'alternatives', secondary: null, description: 'Leveraged Equity' },
  'trading--inverse equity': { primary: 'alternatives', secondary: null, description: 'Inverse Equity' },
  
  // ============================================
  // CRYPTO
  // ============================================
  'digital assets': { primary: 'crypto', secondary: null, description: 'Digital Assets' },
  'cryptocurrency': { primary: 'crypto', secondary: null, description: 'Cryptocurrency' },
  'bitcoin': { primary: 'crypto', secondary: null, description: 'Bitcoin' },
  'ethereum': { primary: 'crypto', secondary: null, description: 'Ethereum' },
};

/**
 * Classify an asset based on Morningstar category
 */
export function classifyByMorningstarCategory(category: string | undefined): AssetClassification {
  if (!category) {
    return { primary: 'other', description: 'Unknown' };
  }
  
  const normalizedCategory = category.toLowerCase().trim();
  
  // Direct match
  if (MORNINGSTAR_CATEGORY_MAP[normalizedCategory]) {
    return {
      ...MORNINGSTAR_CATEGORY_MAP[normalizedCategory],
      morningstarCategory: category
    };
  }
  
  // Fuzzy matching - check if category contains key phrases
  for (const [key, classification] of Object.entries(MORNINGSTAR_CATEGORY_MAP)) {
    if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
      return {
        ...classification,
        morningstarCategory: category
      };
    }
  }
  
  // Fallback based on keywords
  if (normalizedCategory.includes('money market') || normalizedCategory.includes('cash')) {
    return { primary: 'cash', secondary: 'moneyMarket', description: 'Money Market', morningstarCategory: category };
  }
  if (normalizedCategory.includes('bond') || normalizedCategory.includes('fixed') || normalizedCategory.includes('income')) {
    return { primary: 'fixedIncome', description: 'Fixed Income', morningstarCategory: category };
  }
  if (normalizedCategory.includes('crypto') || normalizedCategory.includes('bitcoin') || normalizedCategory.includes('digital')) {
    return { primary: 'crypto', description: 'Cryptocurrency', morningstarCategory: category };
  }
  if (normalizedCategory.includes('real estate') || normalizedCategory.includes('reit')) {
    return { primary: 'realAssets', secondary: 'reit', description: 'Real Estate', morningstarCategory: category };
  }
  if (normalizedCategory.includes('commodit')) {
    return { primary: 'realAssets', secondary: 'commodities', description: 'Commodities', morningstarCategory: category };
  }
  if (normalizedCategory.includes('world') || normalizedCategory.includes('global')) {
    return { primary: 'globalEquity', description: 'Global Equity', morningstarCategory: category };
  }
  if (normalizedCategory.includes('foreign') || normalizedCategory.includes('international') || normalizedCategory.includes('emerging')) {
    return { primary: 'intlEquity', description: 'International Equity', morningstarCategory: category };
  }
  if (normalizedCategory.includes('target') && normalizedCategory.includes('date')) {
    return { primary: 'alternatives', description: 'Target-Date Fund', morningstarCategory: category };
  }
  if (normalizedCategory.includes('allocation')) {
    return { primary: 'alternatives', description: 'Allocation Fund', morningstarCategory: category };
  }
  
  // Default to US Equity for anything with "stock" or "equity"
  if (normalizedCategory.includes('stock') || normalizedCategory.includes('equity')) {
    return { primary: 'usEquity', description: 'US Equity', morningstarCategory: category };
  }
  
  return { primary: 'other', description: 'Other', morningstarCategory: category };
}

/**
 * Get display-friendly name for primary class
 */
export function getPrimaryClassDisplayName(primaryClass: PrimaryAssetClass): string {
  const names: Record<PrimaryAssetClass, string> = {
    usEquity: 'US Stocks',
    intlEquity: 'International Stocks',
    globalEquity: 'Global Stocks',
    fixedIncome: 'Bonds',
    cash: 'Cash',
    crypto: 'Crypto',
    realAssets: 'Real Assets',
    alternatives: 'Alternatives',
    other: 'Other'
  };
  return names[primaryClass] || 'Other';
}

/**
 * Get color for primary class (for charts)
 */
export function getPrimaryClassColor(primaryClass: PrimaryAssetClass): string {
  const colors: Record<PrimaryAssetClass, string> = {
    usEquity: '#6366f1',      // Indigo
    intlEquity: '#8b5cf6',    // Purple
    globalEquity: '#a855f7',  // Violet
    fixedIncome: '#22c55e',   // Green
    cash: '#9ca3af',          // Gray
    crypto: '#f59e0b',        // Amber
    realAssets: '#14b8a6',    // Teal
    alternatives: '#ec4899',  // Pink
    other: '#64748b'          // Slate
  };
  return colors[primaryClass] || '#64748b';
}

/**
 * Map old 5-class system to new expanded system for backwards compatibility
 */
export function mapLegacyClass(legacyClass: string): PrimaryAssetClass {
  const mapping: Record<string, PrimaryAssetClass> = {
    'usEquity': 'usEquity',
    'intlEquity': 'intlEquity',
    'bonds': 'fixedIncome',
    'cash': 'cash',
    'crypto': 'crypto',
    'other': 'other'
  };
  return mapping[legacyClass] || 'other';
}

/**
 * Collapse expanded classes back to simple 5-class for backwards compatibility
 */
export function toSimpleClass(primaryClass: PrimaryAssetClass): 'usEquity' | 'intlEquity' | 'bonds' | 'cash' | 'crypto' | 'other' {
  switch (primaryClass) {
    case 'usEquity': return 'usEquity';
    case 'intlEquity':
    case 'globalEquity': return 'intlEquity';  // Global includes intl portion
    case 'fixedIncome': return 'bonds';
    case 'cash': return 'cash';
    case 'crypto': return 'crypto';
    case 'realAssets':
    case 'alternatives':
    case 'other':
    default: return 'other';
  }
}
