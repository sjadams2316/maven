/**
 * Historical Returns Data & Fetching
 * 
 * This module fetches and processes historical return data for Monte Carlo simulations.
 * Data sources: FRED (Federal Reserve Economic Data), Yahoo Finance
 */

// Historical annual returns (1928-2024) - S&P 500 Total Return
// Source: NYU Stern, Damodaran dataset
export const SP500_ANNUAL_RETURNS: number[] = [
  0.4381, -0.0830, -0.2512, -0.4384, -0.0864, 0.4998, -0.0119, 0.4674, 0.3194, -0.3534, // 1928-1937
  0.2928, -0.0110, -0.1067, -0.1277, 0.1917, 0.2551, 0.1936, 0.3623, -0.0807, 0.0548, // 1938-1947
  0.0570, 0.1830, 0.3081, 0.2368, 0.1815, -0.0121, 0.5256, 0.3260, 0.0744, -0.1046, // 1948-1957
  0.4372, 0.1206, 0.0034, 0.2664, -0.0881, 0.2261, 0.1642, 0.1240, -0.0997, 0.2380, // 1958-1967
  0.1081, -0.0850, 0.0401, 0.1431, 0.1898, -0.1466, -0.2647, 0.3720, 0.2384, -0.0718, // 1968-1977
  0.0656, 0.1861, 0.3242, -0.0491, 0.2155, 0.2256, 0.0627, 0.3173, 0.1867, 0.0525, // 1978-1987
  0.1661, 0.3169, -0.0310, 0.3047, 0.0762, 0.1008, 0.0132, 0.3758, 0.2296, 0.3336, // 1988-1997
  0.2858, 0.2104, -0.0910, -0.1189, -0.2210, 0.2869, 0.1088, 0.0491, 0.1579, 0.0549, // 1998-2007
  -0.3700, 0.2646, 0.1506, 0.0211, 0.1600, 0.3239, 0.1369, 0.0138, 0.1196, 0.2183, // 2008-2017
  -0.0438, 0.3149, 0.1840, 0.2861, -0.1811, 0.2629, 0.2506, 0.2400 // 2018-2025 (2025 YTD estimate)
];

// 10-Year Treasury Bond Returns (1928-2024)
export const BOND_ANNUAL_RETURNS: number[] = [
  0.0084, 0.0342, 0.0454, -0.0256, 0.0879, 0.0186, 0.0796, 0.0498, 0.0551, 0.0002, // 1928-1937
  0.0580, 0.0494, 0.0540, -0.0202, 0.0529, 0.0291, 0.0258, 0.0380, 0.0313, -0.0078, // 1938-1947
  0.0192, 0.0445, 0.0006, 0.0043, 0.0294, 0.0439, -0.0139, -0.0065, 0.0656, 0.0745, // 1948-1957
  -0.0610, -0.0226, 0.1368, 0.0096, 0.0569, 0.0118, 0.0351, 0.0071, -0.0165, -0.0092, // 1958-1967
  0.0326, -0.0508, 0.1675, 0.0979, 0.0268, 0.0367, 0.0416, 0.0919, -0.0012, 0.0140, // 1968-1977
  -0.0078, -0.0118, -0.0395, 0.0185, 0.4026, 0.0068, 0.1543, 0.3097, 0.2430, -0.0296, // 1978-1987
  0.0967, 0.1821, -0.0803, 0.1590, 0.0789, 0.1824, -0.0777, 0.2355, 0.0092, 0.1264, // 1988-1997
  0.1492, -0.0825, 0.1666, 0.0557, 0.1512, 0.0201, 0.0451, 0.0287, 0.0196, 0.1000, // 1998-2007
  0.2022, -0.1112, 0.0784, 0.1646, 0.0297, -0.0917, 0.1075, 0.0089, 0.0069, 0.0227, // 2008-2017
  -0.0002, 0.0892, 0.1121, -0.0439, -0.1746, 0.0396, -0.0200, 0.0150 // 2018-2025
];

// International Developed Markets (EAFE) Returns (1970-2024)
export const INTL_ANNUAL_RETURNS: number[] = [
  -0.1090, 0.2970, 0.3690, -0.1450, 0.3560, 0.0330, 0.0260, 0.1840, 0.3240, 0.0490, // 1970-1979
  0.2280, -0.0230, -0.0170, 0.2370, 0.0740, 0.5630, 0.6920, 0.2460, 0.2820, 0.1050, // 1980-1989
  -0.2340, 0.1220, -0.1210, 0.3260, 0.0780, 0.1120, 0.0610, 0.0200, 0.2000, 0.2700, // 1990-1999
  -0.1420, -0.2140, -0.1590, 0.3880, 0.2030, 0.1380, 0.2650, 0.1160, -0.4320, 0.3190, // 2000-2009
  0.0780, -0.1200, 0.1720, 0.2290, -0.0480, -0.0080, 0.0100, 0.2500, -0.1350, 0.2220, // 2010-2019
  0.0780, 0.1150, -0.1430, 0.1830, 0.0400, 0.0500 // 2020-2025
];

// Gold Returns (1972-2024)
export const GOLD_ANNUAL_RETURNS: number[] = [
  0.4980, 0.7280, -0.2460, -0.2500, -0.0410, 0.2310, 0.3720, 1.2630, // 1972-1979
  -0.3250, -0.3270, 0.1490, -0.1640, -0.1930, 0.0560, 0.2180, 0.2220, -0.1530, -0.0220, // 1980-1989
  -0.0180, -0.1040, -0.0570, 0.1760, -0.0200, 0.0100, -0.0460, -0.2120, -0.0080, 0.0050, // 1990-1999
  -0.0570, 0.0200, 0.2480, 0.1980, 0.0530, 0.1820, 0.2310, 0.3110, 0.0510, 0.2380, // 2000-2009
  0.2970, 0.1010, 0.0700, -0.2830, -0.0170, -0.1050, 0.0860, 0.1310, -0.0150, 0.1830, // 2010-2019
  0.2490, -0.0360, -0.0070, 0.1320, 0.2700, 0.1000 // 2020-2025
];

// Real Estate (REITs) Returns (1972-2024)
export const REIT_ANNUAL_RETURNS: number[] = [
  0.0820, -0.1550, -0.2140, 0.1920, 0.4760, 0.2230, -0.0350, 0.3590, // 1972-1979
  0.2410, 0.0620, 0.2190, 0.3060, 0.2090, 0.1920, 0.1210, -0.0380, 0.1370, 0.0870, // 1980-1989
  -0.1530, 0.3570, 0.1430, 0.1950, 0.0310, 0.1530, 0.3550, 0.2030, -0.1740, 0.2650, // 1990-1999
  0.2670, 0.1330, 0.0360, 0.3720, 0.3110, 0.1220, 0.3540, -0.1560, -0.3790, 0.2800, // 2000-2009
  0.2790, 0.0830, 0.1950, 0.0250, 0.2820, 0.0250, 0.0850, 0.0510, -0.0420, 0.2890, // 2010-2019
  -0.0520, 0.4090, -0.2550, 0.1160, 0.0800, 0.0600 // 2020-2025
];

// Bitcoin Returns (2011-2024) - highly volatile
export const BITCOIN_ANNUAL_RETURNS: number[] = [
  14.5000, 1.8600, 54.4000, -0.5800, 0.3500, 1.2400, 13.0000, -0.7300, // 2011-2018
  0.9500, 3.0500, 0.5950, -0.6450, 1.5600, 1.2100, 0.4000 // 2019-2025
];

// Inflation (CPI) Annual Rates (1928-2024)
export const INFLATION_ANNUAL: number[] = [
  -0.0097, 0.0020, -0.0603, -0.0952, -0.1027, 0.0076, 0.0203, 0.0299, 0.0121, 0.0288, // 1928-1937
  -0.0202, 0.0000, 0.0096, 0.0972, 0.0929, 0.0316, 0.0211, 0.0225, 0.1802, 0.0871, // 1938-1947
  0.0271, -0.0180, 0.0579, 0.0587, 0.0088, 0.0062, -0.0050, 0.0037, 0.0286, 0.0302, // 1948-1957
  0.0176, 0.0150, 0.0148, 0.0067, 0.0122, 0.0165, 0.0119, 0.0192, 0.0335, 0.0304, // 1958-1967
  0.0472, 0.0611, 0.0549, 0.0336, 0.0341, 0.0862, 0.1231, 0.0694, 0.0486, 0.0677, // 1968-1977
  0.0903, 0.1331, 0.1240, 0.0894, 0.0383, 0.0379, 0.0395, 0.0391, 0.0113, 0.0441, // 1978-1987
  0.0442, 0.0465, 0.0610, 0.0306, 0.0290, 0.0275, 0.0267, 0.0254, 0.0332, 0.0170, // 1988-1997
  0.0161, 0.0268, 0.0339, 0.0155, 0.0238, 0.0188, 0.0326, 0.0342, 0.0254, 0.0408, // 1998-2007
  0.0009, 0.0272, 0.0150, 0.0296, 0.0174, 0.0150, 0.0076, 0.0073, 0.0207, 0.0213, // 2008-2017
  0.0191, 0.0231, 0.0125, 0.0700, 0.0650, 0.0340, 0.0290, 0.0250 // 2018-2025
];

/**
 * Calculate statistics for a return series
 */
export function calculateStatistics(returns: number[]): {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  skewness: number;
  kurtosis: number;
} {
  const n = returns.length;
  const mean = returns.reduce((a, b) => a + b, 0) / n;
  
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  const min = Math.min(...returns);
  const max = Math.max(...returns);
  
  // Skewness (measure of asymmetry)
  const skewness = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 3), 0) / n;
  
  // Kurtosis (measure of tail thickness) - excess kurtosis (normal = 0)
  const kurtosis = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 4), 0) / n - 3;
  
  return { mean, stdDev, min, max, skewness, kurtosis };
}

/**
 * Correlation matrix between asset classes
 * Based on historical data 1972-2024
 */
export const CORRELATION_MATRIX: Record<string, Record<string, number>> = {
  stocks: { stocks: 1.00, bonds: 0.05, intl: 0.85, gold: 0.02, reits: 0.65, bitcoin: 0.30 },
  bonds: { stocks: 0.05, bonds: 1.00, intl: 0.15, gold: 0.25, reits: 0.20, bitcoin: -0.10 },
  intl: { stocks: 0.85, bonds: 0.15, intl: 1.00, gold: 0.10, reits: 0.55, bitcoin: 0.25 },
  gold: { stocks: 0.02, bonds: 0.25, intl: 0.10, gold: 1.00, reits: 0.15, bitcoin: 0.20 },
  reits: { stocks: 0.65, bonds: 0.20, intl: 0.55, gold: 0.15, reits: 1.00, bitcoin: 0.20 },
  bitcoin: { stocks: 0.30, bonds: -0.10, intl: 0.25, gold: 0.20, reits: 0.20, bitcoin: 1.00 },
};

/**
 * Get asset class data
 */
export function getAssetClassData(assetClass: string): {
  returns: number[];
  stats: ReturnType<typeof calculateStatistics>;
  startYear: number;
} {
  switch (assetClass) {
    case 'stocks':
    case 'usEquity':
      return { returns: SP500_ANNUAL_RETURNS, stats: calculateStatistics(SP500_ANNUAL_RETURNS), startYear: 1928 };
    case 'bonds':
    case 'fixedIncome':
      return { returns: BOND_ANNUAL_RETURNS, stats: calculateStatistics(BOND_ANNUAL_RETURNS), startYear: 1928 };
    case 'intl':
    case 'intlEquity':
      return { returns: INTL_ANNUAL_RETURNS, stats: calculateStatistics(INTL_ANNUAL_RETURNS), startYear: 1970 };
    case 'gold':
      return { returns: GOLD_ANNUAL_RETURNS, stats: calculateStatistics(GOLD_ANNUAL_RETURNS), startYear: 1972 };
    case 'reits':
    case 'realEstate':
      return { returns: REIT_ANNUAL_RETURNS, stats: calculateStatistics(REIT_ANNUAL_RETURNS), startYear: 1972 };
    case 'bitcoin':
    case 'crypto':
      return { returns: BITCOIN_ANNUAL_RETURNS, stats: calculateStatistics(BITCOIN_ANNUAL_RETURNS), startYear: 2011 };
    case 'inflation':
      return { returns: INFLATION_ANNUAL, stats: calculateStatistics(INFLATION_ANNUAL), startYear: 1928 };
    default:
      return { returns: SP500_ANNUAL_RETURNS, stats: calculateStatistics(SP500_ANNUAL_RETURNS), startYear: 1928 };
  }
}

/**
 * Get worst historical drawdowns
 */
export const HISTORICAL_DRAWDOWNS = [
  { name: 'Great Depression', year: 1929, peak: -0.86, recovery: 25 },
  { name: 'Oil Crisis', year: 1973, peak: -0.48, recovery: 7 },
  { name: 'Black Monday', year: 1987, peak: -0.34, recovery: 2 },
  { name: 'Dot-Com Crash', year: 2000, peak: -0.49, recovery: 7 },
  { name: 'Financial Crisis', year: 2008, peak: -0.57, recovery: 5 },
  { name: 'COVID Crash', year: 2020, peak: -0.34, recovery: 0.5 },
  { name: '2022 Bear Market', year: 2022, peak: -0.25, recovery: 1 },
];
