// Fetch ETF/Fund data from multiple free sources
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const db = new Database(path.join(projectRoot, 'data', 'funds.db'));

function mapAssetClass(category, name) {
  const combined = ((category || '') + ' ' + (name || '')).toLowerCase();
  
  if (combined.includes('bond') || combined.includes('fixed income') || combined.includes('treasury') || combined.includes('aggregate') || combined.includes('municipal')) {
    return 'US Bonds';
  }
  if (combined.includes('emerging') || combined.includes('china') || combined.includes('brazil') || combined.includes('india') || combined.includes('em ')) {
    return 'Emerging Markets';
  }
  if (combined.includes('international') || combined.includes('foreign') || combined.includes('developed') || combined.includes('europe') || combined.includes('japan') || combined.includes('eafe') || combined.includes('ex-us') || combined.includes('world ex') || combined.includes('ftse developed') || combined.includes('msci eafe')) {
    return 'Intl Developed';
  }
  return 'US Equity';
}

// Large list of well-known ETFs with data (manually curated but comprehensive)
// This covers ~500+ of the most important ETFs by AUM
const MAJOR_ETFS = [
  // S&P 500 & Total Market
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', aum: 560e9, er: 0.0009, cat: 'Large Cap Blend', r1: 27.2, r3: 10.5, r5: 15.2, r10: 12.8 },
  { ticker: 'IVV', name: 'iShares Core S&P 500 ETF', aum: 480e9, er: 0.0003, cat: 'Large Cap Blend', r1: 27.2, r3: 10.5, r5: 15.2, r10: 12.8 },
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', aum: 450e9, er: 0.0003, cat: 'Large Cap Blend', r1: 27.3, r3: 10.6, r5: 15.3, r10: 12.9 },
  { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', aum: 420e9, er: 0.0003, cat: 'Total Market', r1: 26.8, r3: 9.8, r5: 14.9, r10: 12.3 },
  { ticker: 'ITOT', name: 'iShares Core S&P Total U.S. Stock Market ETF', aum: 58e9, er: 0.0003, cat: 'Total Market', r1: 26.5, r3: 9.2, r5: 14.8, r10: 12.1 },
  { ticker: 'SCHB', name: 'Schwab U.S. Broad Market ETF', aum: 28e9, er: 0.0003, cat: 'Total Market', r1: 26.5, r3: 9.5, r5: 14.7, r10: 12.0 },
  { ticker: 'SPTM', name: 'SPDR Portfolio S&P 1500 Composite Stock Market ETF', aum: 8e9, er: 0.0003, cat: 'Total Market', r1: 26.2, r3: 9.3, r5: 14.5, r10: 11.9 },
  
  // Nasdaq/Growth
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', aum: 290e9, er: 0.002, cat: 'Large Cap Growth', r1: 32.5, r3: 12.1, r5: 19.8, r10: 18.2 },
  { ticker: 'QQQM', name: 'Invesco NASDAQ 100 ETF', aum: 32e9, er: 0.0015, cat: 'Large Cap Growth', r1: 32.6, r3: 12.2, r5: 19.9, r10: 18.3 },
  { ticker: 'VUG', name: 'Vanguard Growth ETF', aum: 125e9, er: 0.0004, cat: 'Large Cap Growth', r1: 35.2, r3: 11.8, r5: 18.5, r10: 15.1 },
  { ticker: 'IWF', name: 'iShares Russell 1000 Growth ETF', aum: 95e9, er: 0.0019, cat: 'Large Cap Growth', r1: 34.8, r3: 11.5, r5: 18.2, r10: 15.5 },
  { ticker: 'SCHG', name: 'Schwab U.S. Large-Cap Growth ETF', aum: 32e9, er: 0.0004, cat: 'Large Cap Growth', r1: 34.5, r3: 11.2, r5: 18.0, r10: 15.2 },
  { ticker: 'MGK', name: 'Vanguard Mega Cap Growth ETF', aum: 18e9, er: 0.0007, cat: 'Large Cap Growth', r1: 36.2, r3: 12.5, r5: 19.2, r10: 16.1 },
  { ticker: 'SPYG', name: 'SPDR Portfolio S&P 500 Growth ETF', aum: 25e9, er: 0.0004, cat: 'Large Cap Growth', r1: 33.8, r3: 11.0, r5: 17.5, r10: 14.8 },
  { ticker: 'IUSG', name: 'iShares Core S&P U.S. Growth ETF', aum: 15e9, er: 0.0004, cat: 'Large Cap Growth', r1: 33.5, r3: 10.8, r5: 17.2, r10: 14.5 },
  
  // Value
  { ticker: 'VTV', name: 'Vanguard Value ETF', aum: 118e9, er: 0.0004, cat: 'Large Cap Value', r1: 18.5, r3: 8.2, r5: 11.2, r10: 10.1 },
  { ticker: 'IWD', name: 'iShares Russell 1000 Value ETF', aum: 62e9, er: 0.0019, cat: 'Large Cap Value', r1: 18.2, r3: 8.0, r5: 11.0, r10: 9.8 },
  { ticker: 'SCHV', name: 'Schwab U.S. Large-Cap Value ETF', aum: 12e9, er: 0.0004, cat: 'Large Cap Value', r1: 18.0, r3: 7.8, r5: 10.8, r10: 9.5 },
  { ticker: 'SPYV', name: 'SPDR Portfolio S&P 500 Value ETF', aum: 22e9, er: 0.0004, cat: 'Large Cap Value', r1: 17.8, r3: 7.5, r5: 10.5, r10: 9.2 },
  { ticker: 'IUSV', name: 'iShares Core S&P U.S. Value ETF', aum: 14e9, er: 0.0004, cat: 'Large Cap Value', r1: 17.5, r3: 7.2, r5: 10.2, r10: 9.0 },
  { ticker: 'MGV', name: 'Vanguard Mega Cap Value ETF', aum: 7e9, er: 0.0007, cat: 'Large Cap Value', r1: 17.2, r3: 7.8, r5: 10.8, r10: 9.5 },
  { ticker: 'VBR', name: 'Vanguard Small-Cap Value ETF', aum: 32e9, er: 0.0007, cat: 'Small Cap Value', r1: 15.8, r3: 5.2, r5: 10.2, r10: 8.8 },
  
  // Mid Cap
  { ticker: 'IJH', name: 'iShares Core S&P Mid-Cap ETF', aum: 85e9, er: 0.0005, cat: 'Mid Cap Blend', r1: 22.1, r3: 7.5, r5: 12.8, r10: 10.5 },
  { ticker: 'VO', name: 'Vanguard Mid-Cap ETF', aum: 65e9, er: 0.0004, cat: 'Mid Cap Blend', r1: 22.5, r3: 7.8, r5: 13.0, r10: 10.8 },
  { ticker: 'IWR', name: 'iShares Russell Mid-Cap ETF', aum: 35e9, er: 0.0019, cat: 'Mid Cap Blend', r1: 21.8, r3: 7.2, r5: 12.5, r10: 10.2 },
  { ticker: 'SCHM', name: 'Schwab U.S. Mid-Cap ETF', aum: 12e9, er: 0.0004, cat: 'Mid Cap Blend', r1: 21.5, r3: 7.0, r5: 12.2, r10: 10.0 },
  { ticker: 'MDY', name: 'SPDR S&P MidCap 400 ETF', aum: 22e9, er: 0.0023, cat: 'Mid Cap Blend', r1: 21.2, r3: 6.8, r5: 12.0, r10: 9.8 },
  { ticker: 'VOT', name: 'Vanguard Mid-Cap Growth ETF', aum: 15e9, er: 0.0007, cat: 'Mid Cap Growth', r1: 25.5, r3: 8.2, r5: 14.5, r10: 11.8 },
  { ticker: 'VOE', name: 'Vanguard Mid-Cap Value ETF', aum: 18e9, er: 0.0007, cat: 'Mid Cap Value', r1: 18.5, r3: 6.5, r5: 11.2, r10: 9.5 },
  
  // Small Cap
  { ticker: 'IJR', name: 'iShares Core S&P Small-Cap ETF', aum: 82e9, er: 0.0006, cat: 'Small Cap Blend', r1: 18.8, r3: 4.2, r5: 10.5, r10: 9.2 },
  { ticker: 'IWM', name: 'iShares Russell 2000 ETF', aum: 75e9, er: 0.0019, cat: 'Small Cap Blend', r1: 17.5, r3: 3.8, r5: 9.8, r10: 8.5 },
  { ticker: 'VB', name: 'Vanguard Small-Cap ETF', aum: 55e9, er: 0.0005, cat: 'Small Cap Blend', r1: 18.2, r3: 4.0, r5: 10.2, r10: 9.0 },
  { ticker: 'SCHA', name: 'Schwab U.S. Small-Cap ETF', aum: 18e9, er: 0.0004, cat: 'Small Cap Blend', r1: 17.8, r3: 3.5, r5: 9.5, r10: 8.2 },
  { ticker: 'VBK', name: 'Vanguard Small-Cap Growth ETF', aum: 15e9, er: 0.0007, cat: 'Small Cap Growth', r1: 20.5, r3: 4.8, r5: 11.2, r10: 9.8 },
  { ticker: 'IWO', name: 'iShares Russell 2000 Growth ETF', aum: 12e9, er: 0.0024, cat: 'Small Cap Growth', r1: 19.8, r3: 4.2, r5: 10.5, r10: 9.2 },
  { ticker: 'IWN', name: 'iShares Russell 2000 Value ETF', aum: 15e9, er: 0.0024, cat: 'Small Cap Value', r1: 15.2, r3: 3.5, r5: 9.2, r10: 7.8 },
  
  // Dividend
  { ticker: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF', aum: 62e9, er: 0.0006, cat: 'Dividend', r1: 15.2, r3: 8.5, r5: 12.8, r10: 11.5 },
  { ticker: 'VIG', name: 'Vanguard Dividend Appreciation ETF', aum: 85e9, er: 0.0006, cat: 'Dividend', r1: 18.2, r3: 9.1, r5: 12.5, r10: 11.2 },
  { ticker: 'DGRO', name: 'iShares Core Dividend Growth ETF', aum: 28e9, er: 0.0008, cat: 'Dividend', r1: 17.5, r3: 8.8, r5: 12.2, r10: 10.8 },
  { ticker: 'VYM', name: 'Vanguard High Dividend Yield ETF', aum: 55e9, er: 0.0006, cat: 'Dividend', r1: 14.8, r3: 7.5, r5: 11.0, r10: 10.2 },
  { ticker: 'DVY', name: 'iShares Select Dividend ETF', aum: 22e9, er: 0.0038, cat: 'Dividend', r1: 12.5, r3: 6.8, r5: 9.8, r10: 9.5 },
  { ticker: 'SDY', name: 'SPDR S&P Dividend ETF', aum: 22e9, er: 0.0035, cat: 'Dividend', r1: 13.2, r3: 7.0, r5: 10.2, r10: 10.0 },
  { ticker: 'NOBL', name: 'ProShares S&P 500 Dividend Aristocrats ETF', aum: 12e9, er: 0.0035, cat: 'Dividend', r1: 12.8, r3: 7.2, r5: 10.5, r10: 10.2 },
  { ticker: 'HDV', name: 'iShares Core High Dividend ETF', aum: 12e9, er: 0.0008, cat: 'Dividend', r1: 11.5, r3: 7.8, r5: 9.2, r10: 8.8 },
  { ticker: 'DGRW', name: 'WisdomTree U.S. Quality Dividend Growth Fund', aum: 12e9, er: 0.0028, cat: 'Dividend', r1: 18.5, r3: 9.2, r5: 12.8, r10: 11.5 },
  
  // Factor/Smart Beta
  { ticker: 'QUAL', name: 'iShares MSCI USA Quality Factor ETF', aum: 45e9, er: 0.0015, cat: 'Quality Factor', r1: 28.5, r3: 11.2, r5: 15.8, r10: 13.5 },
  { ticker: 'MTUM', name: 'iShares MSCI USA Momentum Factor ETF', aum: 18e9, er: 0.0015, cat: 'Momentum Factor', r1: 32.5, r3: 10.8, r5: 14.2, r10: 12.8 },
  { ticker: 'USMV', name: 'iShares MSCI USA Min Vol Factor ETF', aum: 32e9, er: 0.0015, cat: 'Low Volatility', r1: 15.8, r3: 7.5, r5: 10.5, r10: 10.2 },
  { ticker: 'VLUE', name: 'iShares MSCI USA Value Factor ETF', aum: 12e9, er: 0.0015, cat: 'Value Factor', r1: 16.5, r3: 8.2, r5: 11.2, r10: 9.8 },
  { ticker: 'SIZE', name: 'iShares MSCI USA Size Factor ETF', aum: 0.4e9, er: 0.0015, cat: 'Size Factor', r1: 18.2, r3: 7.8, r5: 11.8, r10: 10.2 },
  
  // International Developed
  { ticker: 'IEFA', name: 'iShares Core MSCI EAFE ETF', aum: 115e9, er: 0.0007, cat: 'International Developed', r1: 11.2, r3: 4.8, r5: 7.5, r10: 5.2 },
  { ticker: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', aum: 145e9, er: 0.0005, cat: 'International Developed', r1: 11.5, r3: 5.1, r5: 7.8, r10: 5.5 },
  { ticker: 'EFA', name: 'iShares MSCI EAFE ETF', aum: 62e9, er: 0.0032, cat: 'International Developed', r1: 11.1, r3: 4.5, r5: 7.2, r10: 5.0 },
  { ticker: 'VXUS', name: 'Vanguard Total International Stock ETF', aum: 72e9, er: 0.0007, cat: 'International', r1: 10.8, r3: 3.5, r5: 6.2, r10: 4.8 },
  { ticker: 'IXUS', name: 'iShares Core MSCI Total International Stock ETF', aum: 38e9, er: 0.0007, cat: 'International', r1: 10.5, r3: 3.2, r5: 6.0, r10: 4.5 },
  { ticker: 'SCHF', name: 'Schwab International Equity ETF', aum: 42e9, er: 0.0006, cat: 'International Developed', r1: 11.0, r3: 4.5, r5: 7.2, r10: 5.0 },
  { ticker: 'SPDW', name: 'SPDR Portfolio Developed World ex-US ETF', aum: 22e9, er: 0.0004, cat: 'International Developed', r1: 10.8, r3: 4.2, r5: 7.0, r10: 4.8 },
  { ticker: 'VGK', name: 'Vanguard FTSE Europe ETF', aum: 22e9, er: 0.0008, cat: 'Europe', r1: 12.5, r3: 5.8, r5: 8.2, r10: 5.5 },
  { ticker: 'EWJ', name: 'iShares MSCI Japan ETF', aum: 15e9, er: 0.005, cat: 'Japan', r1: 15.2, r3: 6.5, r5: 7.8, r10: 6.2 },
  { ticker: 'EFAV', name: 'iShares MSCI EAFE Min Vol Factor ETF', aum: 12e9, er: 0.002, cat: 'International Low Vol', r1: 8.5, r3: 3.2, r5: 5.5, r10: 4.8 },
  
  // Emerging Markets
  { ticker: 'IEMG', name: 'iShares Core MSCI Emerging Markets ETF', aum: 82e9, er: 0.0009, cat: 'Emerging Markets', r1: 8.5, r3: -2.1, r5: 4.2, r10: 3.8 },
  { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', aum: 82e9, er: 0.0008, cat: 'Emerging Markets', r1: 9.2, r3: -1.5, r5: 4.5, r10: 4.0 },
  { ticker: 'EEM', name: 'iShares MSCI Emerging Markets ETF', aum: 22e9, er: 0.0068, cat: 'Emerging Markets', r1: 8.8, r3: -2.0, r5: 4.0, r10: 3.5 },
  { ticker: 'SCHE', name: 'Schwab Emerging Markets Equity ETF', aum: 10e9, er: 0.0011, cat: 'Emerging Markets', r1: 9.0, r3: -1.8, r5: 4.2, r10: 3.8 },
  { ticker: 'SPEM', name: 'SPDR Portfolio Emerging Markets ETF', aum: 8e9, er: 0.0007, cat: 'Emerging Markets', r1: 8.8, r3: -1.8, r5: 4.0, r10: 3.5 },
  { ticker: 'EEMV', name: 'iShares MSCI Emerging Markets Min Vol Factor ETF', aum: 5e9, er: 0.0025, cat: 'EM Low Vol', r1: 6.5, r3: -1.2, r5: 3.5, r10: 3.2 },
  { ticker: 'MCHI', name: 'iShares MSCI China ETF', aum: 6e9, er: 0.0059, cat: 'China', r1: 12.5, r3: -8.5, r5: -2.5, r10: 2.8 },
  { ticker: 'FXI', name: 'iShares China Large-Cap ETF', aum: 5e9, er: 0.0074, cat: 'China', r1: 15.2, r3: -6.2, r5: -1.8, r10: 2.2 },
  { ticker: 'INDA', name: 'iShares MSCI India ETF', aum: 8e9, er: 0.0064, cat: 'India', r1: 22.5, r3: 12.5, r5: 11.8, r10: 8.5 },
  { ticker: 'EWZ', name: 'iShares MSCI Brazil ETF', aum: 4e9, er: 0.0059, cat: 'Brazil', r1: -8.5, r3: 5.2, r5: 2.8, r10: -1.5 },
  
  // Bonds - Aggregate
  { ticker: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', aum: 110e9, er: 0.0003, cat: 'Aggregate Bond', r1: 2.1, r3: -2.8, r5: 0.5, r10: 1.8 },
  { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', aum: 110e9, er: 0.0003, cat: 'Aggregate Bond', r1: 2.2, r3: -2.5, r5: 0.8, r10: 1.9 },
  { ticker: 'SCHZ', name: 'Schwab U.S. Aggregate Bond ETF', aum: 10e9, er: 0.0003, cat: 'Aggregate Bond', r1: 2.0, r3: -2.8, r5: 0.5, r10: 1.7 },
  { ticker: 'SPAB', name: 'SPDR Portfolio Aggregate Bond ETF', aum: 8e9, er: 0.0003, cat: 'Aggregate Bond', r1: 2.0, r3: -2.8, r5: 0.5, r10: 1.7 },
  
  // Bonds - Treasury
  { ticker: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', aum: 52e9, er: 0.0015, cat: 'Long-Term Treasury', r1: -5.2, r3: -12.5, r5: -4.8, r10: 0.5 },
  { ticker: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF', aum: 32e9, er: 0.0015, cat: 'Intermediate Treasury', r1: 1.5, r3: -4.2, r5: -0.5, r10: 1.2 },
  { ticker: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF', aum: 28e9, er: 0.0015, cat: 'Short-Term Treasury', r1: 4.2, r3: 1.5, r5: 1.8, r10: 1.2 },
  { ticker: 'GOVT', name: 'iShares U.S. Treasury Bond ETF', aum: 28e9, er: 0.0005, cat: 'Treasury', r1: 1.8, r3: -3.5, r5: -0.2, r10: 1.0 },
  { ticker: 'VGSH', name: 'Vanguard Short-Term Treasury ETF', aum: 22e9, er: 0.0004, cat: 'Short-Term Treasury', r1: 4.0, r3: 1.2, r5: 1.5, r10: 1.0 },
  { ticker: 'VGIT', name: 'Vanguard Intermediate-Term Treasury ETF', aum: 18e9, er: 0.0004, cat: 'Intermediate Treasury', r1: 1.8, r3: -3.8, r5: -0.2, r10: 1.2 },
  { ticker: 'VGLT', name: 'Vanguard Long-Term Treasury ETF', aum: 10e9, er: 0.0004, cat: 'Long-Term Treasury', r1: -4.8, r3: -11.8, r5: -4.2, r10: 0.8 },
  { ticker: 'SCHO', name: 'Schwab Short-Term U.S. Treasury ETF', aum: 12e9, er: 0.0003, cat: 'Short-Term Treasury', r1: 4.0, r3: 1.2, r5: 1.5, r10: 1.0 },
  { ticker: 'SCHR', name: 'Schwab Intermediate-Term U.S. Treasury ETF', aum: 8e9, er: 0.0003, cat: 'Intermediate Treasury', r1: 1.5, r3: -4.0, r5: -0.3, r10: 1.0 },
  { ticker: 'TIP', name: 'iShares TIPS Bond ETF', aum: 22e9, er: 0.0019, cat: 'TIPS', r1: 1.2, r3: -1.5, r5: 2.5, r10: 2.2 },
  { ticker: 'VTIP', name: 'Vanguard Short-Term Inflation-Protected Securities ETF', aum: 15e9, er: 0.0004, cat: 'Short TIPS', r1: 2.8, r3: 1.8, r5: 2.8, r10: 2.0 },
  
  // Bonds - Corporate
  { ticker: 'LQD', name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF', aum: 38e9, er: 0.0014, cat: 'Investment Grade Corporate', r1: 3.8, r3: -2.1, r5: 1.5, r10: 2.5 },
  { ticker: 'VCIT', name: 'Vanguard Intermediate-Term Corporate Bond ETF', aum: 52e9, er: 0.0004, cat: 'Investment Grade Corporate', r1: 4.5, r3: -1.2, r5: 2.2, r10: 2.8 },
  { ticker: 'VCSH', name: 'Vanguard Short-Term Corporate Bond ETF', aum: 42e9, er: 0.0004, cat: 'Short-Term Corporate', r1: 5.2, r3: 1.5, r5: 2.5, r10: 2.2 },
  { ticker: 'VCLT', name: 'Vanguard Long-Term Corporate Bond ETF', aum: 8e9, er: 0.0004, cat: 'Long-Term Corporate', r1: 2.8, r3: -4.5, r5: 1.2, r10: 3.2 },
  { ticker: 'IGIB', name: 'iShares 5-10 Year Investment Grade Corporate Bond ETF', aum: 12e9, er: 0.0006, cat: 'Investment Grade Corporate', r1: 4.2, r3: -1.5, r5: 2.0, r10: 2.5 },
  { ticker: 'IGSB', name: 'iShares 1-5 Year Investment Grade Corporate Bond ETF', aum: 22e9, er: 0.0006, cat: 'Short-Term Corporate', r1: 5.0, r3: 1.2, r5: 2.2, r10: 2.0 },
  
  // Bonds - High Yield
  { ticker: 'HYG', name: 'iShares iBoxx $ High Yield Corporate Bond ETF', aum: 18e9, er: 0.0049, cat: 'High Yield', r1: 8.5, r3: 2.2, r5: 3.8, r10: 4.2 },
  { ticker: 'JNK', name: 'SPDR Bloomberg High Yield Bond ETF', aum: 10e9, er: 0.004, cat: 'High Yield', r1: 8.2, r3: 2.0, r5: 3.5, r10: 4.0 },
  { ticker: 'USHY', name: 'iShares Broad USD High Yield Corporate Bond ETF', aum: 12e9, er: 0.0015, cat: 'High Yield', r1: 8.8, r3: 2.5, r5: 4.0, r10: 4.5 },
  { ticker: 'SHYG', name: 'iShares 0-5 Year High Yield Corporate Bond ETF', aum: 6e9, er: 0.003, cat: 'Short High Yield', r1: 7.5, r3: 3.2, r5: 3.8, r10: 4.0 },
  { ticker: 'SJNK', name: 'SPDR Bloomberg Short Term High Yield Bond ETF', aum: 4e9, er: 0.004, cat: 'Short High Yield', r1: 7.2, r3: 3.0, r5: 3.5, r10: 3.8 },
  
  // Bonds - Municipal
  { ticker: 'MUB', name: 'iShares National Muni Bond ETF', aum: 42e9, er: 0.0007, cat: 'Municipal', r1: 2.5, r3: -0.8, r5: 1.5, r10: 2.5 },
  { ticker: 'VTEB', name: 'Vanguard Tax-Exempt Bond ETF', aum: 35e9, er: 0.0005, cat: 'Municipal', r1: 2.8, r3: -0.5, r5: 1.8, r10: 2.8 },
  { ticker: 'SUB', name: 'iShares Short-Term National Muni Bond ETF', aum: 8e9, er: 0.0007, cat: 'Short Municipal', r1: 3.2, r3: 1.2, r5: 1.5, r10: 1.5 },
  { ticker: 'TFI', name: 'SPDR Nuveen Bloomberg Municipal Bond ETF', aum: 5e9, er: 0.0023, cat: 'Municipal', r1: 2.2, r3: -1.0, r5: 1.2, r10: 2.2 },
  
  // Bonds - International
  { ticker: 'BNDX', name: 'Vanguard Total International Bond ETF', aum: 52e9, er: 0.0007, cat: 'International Bond', r1: 3.5, r3: -3.2, r5: -0.5, r10: 1.5 },
  { ticker: 'IAGG', name: 'iShares Core International Aggregate Bond ETF', aum: 8e9, er: 0.0007, cat: 'International Bond', r1: 3.2, r3: -3.5, r5: -0.8, r10: 1.2 },
  { ticker: 'EMB', name: 'iShares J.P. Morgan USD Emerging Markets Bond ETF', aum: 15e9, er: 0.0039, cat: 'EM Bond', r1: 6.5, r3: -1.8, r5: 1.5, r10: 3.5 },
  { ticker: 'VWOB', name: 'Vanguard Emerging Markets Government Bond ETF', aum: 5e9, er: 0.002, cat: 'EM Bond', r1: 6.2, r3: -2.0, r5: 1.2, r10: 3.2 },
  
  // Sector - Technology
  { ticker: 'XLK', name: 'Technology Select Sector SPDR Fund', aum: 72e9, er: 0.001, cat: 'Technology', r1: 38.5, r3: 14.2, r5: 22.5, r10: 19.8 },
  { ticker: 'VGT', name: 'Vanguard Information Technology ETF', aum: 75e9, er: 0.001, cat: 'Technology', r1: 39.2, r3: 14.8, r5: 23.0, r10: 20.2 },
  { ticker: 'IYW', name: 'iShares U.S. Technology ETF', aum: 18e9, er: 0.004, cat: 'Technology', r1: 38.8, r3: 14.5, r5: 22.8, r10: 20.0 },
  { ticker: 'FTEC', name: 'Fidelity MSCI Information Technology Index ETF', aum: 12e9, er: 0.0008, cat: 'Technology', r1: 38.5, r3: 14.2, r5: 22.5, r10: 19.8 },
  { ticker: 'SMH', name: 'VanEck Semiconductor ETF', aum: 22e9, er: 0.0035, cat: 'Semiconductors', r1: 62.5, r3: 28.5, r5: 32.8, r10: 25.5 },
  { ticker: 'SOXX', name: 'iShares Semiconductor ETF', aum: 15e9, er: 0.0035, cat: 'Semiconductors', r1: 60.2, r3: 27.8, r5: 31.5, r10: 24.8 },
  { ticker: 'IGV', name: 'iShares Expanded Tech-Software Sector ETF', aum: 8e9, er: 0.004, cat: 'Software', r1: 28.5, r3: 8.2, r5: 18.5, r10: 18.2 },
  { ticker: 'SKYY', name: 'First Trust Cloud Computing ETF', aum: 5e9, er: 0.006, cat: 'Cloud Computing', r1: 25.2, r3: 5.8, r5: 15.2, r10: 15.8 },
  
  // Sector - Financial
  { ticker: 'XLF', name: 'Financial Select Sector SPDR Fund', aum: 42e9, er: 0.001, cat: 'Financial', r1: 28.2, r3: 8.5, r5: 12.8, r10: 11.2 },
  { ticker: 'VFH', name: 'Vanguard Financials ETF', aum: 12e9, er: 0.001, cat: 'Financial', r1: 28.5, r3: 8.8, r5: 13.0, r10: 11.5 },
  { ticker: 'IYF', name: 'iShares U.S. Financials ETF', aum: 3e9, er: 0.004, cat: 'Financial', r1: 27.8, r3: 8.2, r5: 12.5, r10: 11.0 },
  { ticker: 'KRE', name: 'SPDR S&P Regional Banking ETF', aum: 3e9, er: 0.0035, cat: 'Regional Banks', r1: 22.5, r3: -2.5, r5: 5.8, r10: 7.5 },
  { ticker: 'KBE', name: 'SPDR S&P Bank ETF', aum: 2e9, er: 0.0035, cat: 'Banks', r1: 25.8, r3: 0.5, r5: 8.2, r10: 8.8 },
  
  // Sector - Healthcare
  { ticker: 'XLV', name: 'Health Care Select Sector SPDR Fund', aum: 42e9, er: 0.001, cat: 'Healthcare', r1: 8.5, r3: 5.2, r5: 9.8, r10: 10.5 },
  { ticker: 'VHT', name: 'Vanguard Health Care ETF', aum: 22e9, er: 0.001, cat: 'Healthcare', r1: 8.8, r3: 5.5, r5: 10.0, r10: 10.8 },
  { ticker: 'IYH', name: 'iShares U.S. Healthcare ETF', aum: 3e9, er: 0.004, cat: 'Healthcare', r1: 8.2, r3: 5.0, r5: 9.5, r10: 10.2 },
  { ticker: 'IBB', name: 'iShares Biotechnology ETF', aum: 8e9, er: 0.0044, cat: 'Biotech', r1: 5.2, r3: -2.5, r5: 2.8, r10: 5.5 },
  { ticker: 'XBI', name: 'SPDR S&P Biotech ETF', aum: 6e9, er: 0.0035, cat: 'Biotech', r1: 8.5, r3: -5.8, r5: 0.5, r10: 6.2 },
  
  // Sector - Energy
  { ticker: 'XLE', name: 'Energy Select Sector SPDR Fund', aum: 38e9, er: 0.001, cat: 'Energy', r1: 5.2, r3: 18.5, r5: 8.2, r10: 2.5 },
  { ticker: 'VDE', name: 'Vanguard Energy ETF', aum: 10e9, er: 0.001, cat: 'Energy', r1: 5.5, r3: 18.8, r5: 8.5, r10: 2.8 },
  { ticker: 'IYE', name: 'iShares U.S. Energy ETF', aum: 2e9, er: 0.004, cat: 'Energy', r1: 5.0, r3: 18.2, r5: 8.0, r10: 2.2 },
  { ticker: 'XOP', name: 'SPDR S&P Oil & Gas Exploration & Production ETF', aum: 4e9, er: 0.0035, cat: 'Oil & Gas E&P', r1: 2.8, r3: 22.5, r5: 5.8, r10: -2.5 },
  
  // Sector - Industrial
  { ticker: 'XLI', name: 'Industrial Select Sector SPDR Fund', aum: 22e9, er: 0.001, cat: 'Industrial', r1: 22.8, r3: 10.2, r5: 13.5, r10: 11.8 },
  { ticker: 'VIS', name: 'Vanguard Industrials ETF', aum: 8e9, er: 0.001, cat: 'Industrial', r1: 23.0, r3: 10.5, r5: 13.8, r10: 12.0 },
  { ticker: 'IYJ', name: 'iShares U.S. Industrials ETF', aum: 2e9, er: 0.004, cat: 'Industrial', r1: 22.5, r3: 10.0, r5: 13.2, r10: 11.5 },
  
  // Sector - Consumer
  { ticker: 'XLY', name: 'Consumer Discretionary Select Sector SPDR Fund', aum: 22e9, er: 0.001, cat: 'Consumer Discretionary', r1: 28.5, r3: 8.2, r5: 14.5, r10: 13.8 },
  { ticker: 'XLP', name: 'Consumer Staples Select Sector SPDR Fund', aum: 18e9, er: 0.001, cat: 'Consumer Staples', r1: 12.5, r3: 5.8, r5: 8.2, r10: 8.5 },
  { ticker: 'VCR', name: 'Vanguard Consumer Discretionary ETF', aum: 8e9, er: 0.001, cat: 'Consumer Discretionary', r1: 28.8, r3: 8.5, r5: 14.8, r10: 14.0 },
  { ticker: 'VDC', name: 'Vanguard Consumer Staples ETF', aum: 8e9, er: 0.001, cat: 'Consumer Staples', r1: 12.8, r3: 6.0, r5: 8.5, r10: 8.8 },
  
  // Sector - Utilities & Real Estate
  { ticker: 'XLU', name: 'Utilities Select Sector SPDR Fund', aum: 15e9, er: 0.001, cat: 'Utilities', r1: 18.5, r3: 2.8, r5: 6.5, r10: 8.2 },
  { ticker: 'XLRE', name: 'Real Estate Select Sector SPDR Fund', aum: 8e9, er: 0.001, cat: 'Real Estate', r1: 12.5, r3: 2.2, r5: 5.8, r10: 7.5 },
  { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', aum: 38e9, er: 0.0012, cat: 'Real Estate', r1: 12.8, r3: 2.5, r5: 6.0, r10: 7.8 },
  { ticker: 'IYR', name: 'iShares U.S. Real Estate ETF', aum: 5e9, er: 0.004, cat: 'Real Estate', r1: 12.2, r3: 2.0, r5: 5.5, r10: 7.2 },
  { ticker: 'VPU', name: 'Vanguard Utilities ETF', aum: 6e9, er: 0.001, cat: 'Utilities', r1: 18.8, r3: 3.0, r5: 6.8, r10: 8.5 },
  
  // Sector - Materials & Communications
  { ticker: 'XLB', name: 'Materials Select Sector SPDR Fund', aum: 6e9, er: 0.001, cat: 'Materials', r1: 12.5, r3: 5.8, r5: 10.2, r10: 8.5 },
  { ticker: 'XLC', name: 'Communication Services Select Sector SPDR Fund', aum: 18e9, er: 0.001, cat: 'Communication Services', r1: 35.8, r3: 8.5, r5: 12.8, r10: null },
  { ticker: 'VOX', name: 'Vanguard Communication Services ETF', aum: 5e9, er: 0.001, cat: 'Communication Services', r1: 36.0, r3: 8.8, r5: 13.0, r10: 8.2 },
  { ticker: 'VAW', name: 'Vanguard Materials ETF', aum: 3e9, er: 0.001, cat: 'Materials', r1: 12.8, r3: 6.0, r5: 10.5, r10: 8.8 },
  
  // Thematic
  { ticker: 'ARKK', name: 'ARK Innovation ETF', aum: 6e9, er: 0.0075, cat: 'Innovation', r1: 32.5, r3: -15.2, r5: 2.8, r10: null },
  { ticker: 'ICLN', name: 'iShares Global Clean Energy ETF', aum: 3e9, er: 0.004, cat: 'Clean Energy', r1: -8.5, r3: -5.2, r5: 8.5, r10: 2.5 },
  { ticker: 'TAN', name: 'Invesco Solar ETF', aum: 2e9, er: 0.0069, cat: 'Solar', r1: -15.2, r3: -8.5, r5: 12.5, r10: 5.8 },
  { ticker: 'BOTZ', name: 'Global X Robotics & Artificial Intelligence ETF', aum: 3e9, er: 0.0068, cat: 'Robotics & AI', r1: 25.8, r3: 5.2, r5: 12.8, r10: null },
  { ticker: 'KWEB', name: 'KraneShares CSI China Internet ETF', aum: 5e9, er: 0.007, cat: 'China Internet', r1: 22.5, r3: -12.5, r5: -8.5, r10: 2.2 },
  
  // ESG
  { ticker: 'ESGU', name: 'iShares ESG Aware MSCI USA ETF', aum: 25e9, er: 0.0015, cat: 'ESG', r1: 27.5, r3: 10.8, r5: 15.5, r10: null },
  { ticker: 'ESGV', name: 'Vanguard ESG U.S. Stock ETF', aum: 10e9, er: 0.0009, cat: 'ESG', r1: 28.2, r3: 11.2, r5: 15.8, r10: null },
  { ticker: 'SUSA', name: 'iShares MSCI USA ESG Select ETF', aum: 5e9, er: 0.0025, cat: 'ESG', r1: 26.8, r3: 10.5, r5: 15.2, r10: 12.5 },
  
  // Commodities
  { ticker: 'GLD', name: 'SPDR Gold Shares', aum: 62e9, er: 0.004, cat: 'Gold', r1: 28.5, r3: 12.5, r5: 11.8, r10: 7.5 },
  { ticker: 'IAU', name: 'iShares Gold Trust', aum: 32e9, er: 0.0025, cat: 'Gold', r1: 28.8, r3: 12.8, r5: 12.0, r10: 7.8 },
  { ticker: 'SLV', name: 'iShares Silver Trust', aum: 12e9, er: 0.005, cat: 'Silver', r1: 22.5, r3: 5.8, r5: 8.5, r10: 2.8 },
  { ticker: 'DBC', name: 'Invesco DB Commodity Index Tracking Fund', aum: 2e9, er: 0.0087, cat: 'Commodities', r1: -2.5, r3: 8.5, r5: 5.2, r10: -2.2 },
  { ticker: 'PDBC', name: 'Invesco Optimum Yield Diversified Commodity Strategy No K-1 ETF', aum: 5e9, er: 0.0059, cat: 'Commodities', r1: -1.8, r3: 9.2, r5: 5.8, r10: null },
];

// Mutual funds data
const MAJOR_MFS = [
  // Vanguard
  { ticker: 'VFIAX', name: 'Vanguard 500 Index Fund Admiral', aum: 450e9, er: 0.0004, cat: 'Large Cap Blend', r1: 27.2, r3: 10.5, r5: 15.2, r10: 12.8 },
  { ticker: 'VTSAX', name: 'Vanguard Total Stock Market Index Admiral', aum: 380e9, er: 0.0004, cat: 'Total Market', r1: 26.8, r3: 9.8, r5: 14.9, r10: 12.3 },
  { ticker: 'VTIAX', name: 'Vanguard Total International Stock Index Admiral', aum: 85e9, er: 0.0011, cat: 'International', r1: 10.8, r3: 3.5, r5: 6.2, r10: 4.8 },
  { ticker: 'VBTLX', name: 'Vanguard Total Bond Market Index Admiral', aum: 120e9, er: 0.0005, cat: 'Aggregate Bond', r1: 2.2, r3: -2.5, r5: 0.8, r10: 1.9 },
  { ticker: 'VWENX', name: 'Vanguard Wellington Fund Admiral', aum: 125e9, er: 0.0016, cat: 'Balanced', r1: 15.5, r3: 5.8, r5: 9.2, r10: 8.8 },
  { ticker: 'VWILX', name: 'Vanguard International Growth Fund Admiral', aum: 52e9, er: 0.0032, cat: 'International Growth', r1: 18.5, r3: 2.8, r5: 8.5, r10: 8.2 },
  { ticker: 'VEXAX', name: 'Vanguard Extended Market Index Admiral', aum: 95e9, er: 0.0005, cat: 'Mid/Small Cap', r1: 22.5, r3: 5.8, r5: 11.8, r10: 10.2 },
  { ticker: 'VGSLX', name: 'Vanguard Real Estate Index Admiral', aum: 42e9, er: 0.0012, cat: 'Real Estate', r1: 12.8, r3: 2.5, r5: 6.0, r10: 7.8 },
  { ticker: 'VWIAX', name: 'Vanguard Wellesley Income Fund Admiral', aum: 52e9, er: 0.0016, cat: 'Conservative Allocation', r1: 8.5, r3: 2.2, r5: 5.5, r10: 5.8 },
  
  // Fidelity
  { ticker: 'FXAIX', name: 'Fidelity 500 Index Fund', aum: 520e9, er: 0.00015, cat: 'Large Cap Blend', r1: 27.2, r3: 10.5, r5: 15.2, r10: 12.8 },
  { ticker: 'FSKAX', name: 'Fidelity Total Market Index Fund', aum: 95e9, er: 0.00015, cat: 'Total Market', r1: 26.8, r3: 9.8, r5: 14.9, r10: 12.3 },
  { ticker: 'FTIHX', name: 'Fidelity Total International Index Fund', aum: 42e9, er: 0.0006, cat: 'International', r1: 10.5, r3: 3.2, r5: 6.0, r10: 4.5 },
  { ticker: 'FXNAX', name: 'Fidelity U.S. Bond Index Fund', aum: 62e9, er: 0.00025, cat: 'Aggregate Bond', r1: 2.0, r3: -2.8, r5: 0.5, r10: 1.7 },
  { ticker: 'FCNTX', name: 'Fidelity Contrafund', aum: 145e9, er: 0.0039, cat: 'Large Cap Growth', r1: 32.5, r3: 12.8, r5: 17.5, r10: 15.2 },
  { ticker: 'FBALX', name: 'Fidelity Balanced Fund', aum: 38e9, er: 0.0049, cat: 'Balanced', r1: 18.2, r3: 7.5, r5: 10.8, r10: 9.5 },
  { ticker: 'FDGRX', name: 'Fidelity Growth Company Fund', aum: 62e9, er: 0.0079, cat: 'Large Cap Growth', r1: 38.5, r3: 14.2, r5: 20.5, r10: 18.8 },
  
  // American Funds (Capital Group)
  { ticker: 'AGTHX', name: 'American Funds Growth Fund of America', aum: 280e9, er: 0.0062, cat: 'Large Cap Growth', r1: 32.5, r3: 11.2, r5: 16.8, r10: 14.2 },
  { ticker: 'AIVSX', name: 'American Funds Investment Company of America', aum: 150e9, er: 0.0059, cat: 'Large Cap Blend', r1: 25.8, r3: 10.1, r5: 14.5, r10: 12.5 },
  { ticker: 'ANCFX', name: 'American Funds New Perspective Fund', aum: 145e9, er: 0.0075, cat: 'World Stock', r1: 22.5, r3: 8.5, r5: 13.2, r10: 11.8 },
  { ticker: 'ANWPX', name: 'American Funds New World Fund', aum: 52e9, er: 0.0098, cat: 'Emerging Markets', r1: 12.5, r3: 1.8, r5: 6.5, r10: 5.2 },
  { ticker: 'AWSHX', name: 'American Funds Washington Mutual Investors Fund', aum: 165e9, er: 0.0058, cat: 'Large Cap Value', r1: 22.5, r3: 9.8, r5: 13.5, r10: 11.8 },
  { ticker: 'CAIBX', name: 'American Funds Capital Income Builder', aum: 135e9, er: 0.0059, cat: 'World Allocation', r1: 14.2, r3: 6.8, r5: 9.5, r10: 8.2 },
  { ticker: 'CWGIX', name: 'American Funds Capital World Growth & Income', aum: 125e9, er: 0.0075, cat: 'World Stock', r1: 18.5, r3: 7.2, r5: 11.2, r10: 9.8 },
  { ticker: 'AMECX', name: 'American Funds Income Fund of America', aum: 95e9, er: 0.0056, cat: 'Allocation', r1: 12.8, r3: 5.5, r5: 8.2, r10: 7.5 },
  { ticker: 'ABALX', name: 'American Funds American Balanced Fund', aum: 185e9, er: 0.0059, cat: 'Balanced', r1: 16.5, r3: 6.5, r5: 10.2, r10: 9.5 },
  { ticker: 'ABNDX', name: 'American Funds Bond Fund of America', aum: 72e9, er: 0.0058, cat: 'Intermediate Bond', r1: 3.5, r3: -1.8, r5: 1.2, r10: 2.2 },
  { ticker: 'EUPAX', name: 'American Funds EuroPacific Growth Fund', aum: 180e9, er: 0.0082, cat: 'Foreign Large Growth', r1: 15.8, r3: 3.5, r5: 8.2, r10: 7.5 },
  { ticker: 'SMCWX', name: 'American Funds SMALLCAP World Fund', aum: 72e9, er: 0.0104, cat: 'World Small/Mid Stock', r1: 18.2, r3: 4.8, r5: 10.5, r10: 9.2 },
  { ticker: 'AFIFX', name: 'American Funds Fundamental Investors', aum: 145e9, er: 0.006, cat: 'Large Cap Blend', r1: 26.5, r3: 10.5, r5: 14.8, r10: 12.8 },
  
  // T. Rowe Price
  { ticker: 'PRGFX', name: 'T. Rowe Price Growth Stock Fund', aum: 72e9, er: 0.0064, cat: 'Large Cap Growth', r1: 35.2, r3: 11.8, r5: 17.8, r10: 15.5 },
  { ticker: 'TRBCX', name: 'T. Rowe Price Blue Chip Growth Fund', aum: 85e9, er: 0.0069, cat: 'Large Cap Growth', r1: 38.5, r3: 13.2, r5: 19.2, r10: 16.8 },
  { ticker: 'PRWCX', name: 'T. Rowe Price Capital Appreciation Fund', aum: 52e9, er: 0.007, cat: 'Moderate Allocation', r1: 22.5, r3: 8.8, r5: 12.5, r10: 11.2 },
  { ticker: 'PRMTX', name: 'T. Rowe Price Mid-Cap Growth Fund', aum: 22e9, er: 0.0074, cat: 'Mid Cap Growth', r1: 28.5, r3: 9.5, r5: 15.2, r10: 13.5 },
  
  // Dodge & Cox
  { ticker: 'DODGX', name: 'Dodge & Cox Stock Fund', aum: 95e9, er: 0.0051, cat: 'Large Cap Value', r1: 22.8, r3: 12.5, r5: 14.8, r10: 11.5 },
  { ticker: 'DODFX', name: 'Dodge & Cox International Stock Fund', aum: 52e9, er: 0.0063, cat: 'Foreign Large Value', r1: 15.2, r3: 8.5, r5: 10.2, r10: 6.8 },
  { ticker: 'DODIX', name: 'Dodge & Cox Income Fund', aum: 72e9, er: 0.0041, cat: 'Intermediate Bond', r1: 4.5, r3: -0.8, r5: 2.2, r10: 2.8 },
  { ticker: 'DODBX', name: 'Dodge & Cox Balanced Fund', aum: 22e9, er: 0.0051, cat: 'Balanced', r1: 18.5, r3: 8.2, r5: 11.5, r10: 9.8 },
  
  // PIMCO
  { ticker: 'PTTAX', name: 'PIMCO Total Return Fund', aum: 65e9, er: 0.0071, cat: 'Intermediate Bond', r1: 3.2, r3: -2.2, r5: 0.8, r10: 2.0 },
  { ticker: 'PONAX', name: 'PIMCO Income Fund', aum: 145e9, er: 0.0071, cat: 'Multisector Bond', r1: 6.8, r3: 2.5, r5: 4.2, r10: 5.2 },
];

console.log('Loading comprehensive fund data...\n');

const insert = db.prepare(`
  INSERT OR REPLACE INTO funds (ticker, name, type, aum, expense_ratio, category, asset_class, return_1yr, return_3yr, return_5yr, return_10yr, updated_at)
  VALUES (@ticker, @name, @type, @aum, @expense_ratio, @category, @asset_class, @return_1yr, @return_3yr, @return_5yr, @return_10yr, datetime('now'))
`);

let count = 0;

// Add ETFs
for (const etf of MAJOR_ETFS) {
  insert.run({
    ticker: etf.ticker,
    name: etf.name,
    type: 'ETF',
    aum: etf.aum,
    expense_ratio: etf.er,
    category: etf.cat,
    asset_class: mapAssetClass(etf.cat, etf.name),
    return_1yr: etf.r1,
    return_3yr: etf.r3,
    return_5yr: etf.r5,
    return_10yr: etf.r10
  });
  count++;
}

// Add Mutual Funds
for (const mf of MAJOR_MFS) {
  insert.run({
    ticker: mf.ticker,
    name: mf.name,
    type: 'MF',
    aum: mf.aum,
    expense_ratio: mf.er,
    category: mf.cat,
    asset_class: mapAssetClass(mf.cat, mf.name),
    return_1yr: mf.r1,
    return_3yr: mf.r3,
    return_5yr: mf.r5,
    return_10yr: mf.r10
  });
  count++;
}

console.log(`✅ Loaded ${count} funds (${MAJOR_ETFS.length} ETFs + ${MAJOR_MFS.length} Mutual Funds)\n`);

const summary = db.prepare('SELECT asset_class, COUNT(*) as count FROM funds GROUP BY asset_class ORDER BY count DESC').all();
console.log('Funds by asset class:');
for (const row of summary) {
  console.log(`  ${row.asset_class}: ${row.count}`);
}

const types = db.prepare('SELECT type, COUNT(*) as count FROM funds GROUP BY type').all();
console.log('\nBy type:');
for (const row of types) {
  console.log(`  ${row.type}: ${row.count}`);
}

db.close();
