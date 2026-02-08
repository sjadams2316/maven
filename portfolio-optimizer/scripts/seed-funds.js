const yahooFinance = require('yahoo-finance2');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'funds.db'));

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS funds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    aum REAL,
    expense_ratio REAL,
    inception_date TEXT,
    category TEXT,
    asset_class TEXT,
    return_1yr REAL,
    return_3yr REAL,
    return_5yr REAL,
    return_10yr REAL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Asset class mapping based on category keywords
function mapAssetClass(category, name) {
  if (!category) category = '';
  if (!name) name = '';
  const combined = (category + ' ' + name).toLowerCase();
  
  if (combined.includes('bond') || combined.includes('fixed income') || combined.includes('aggregate') || combined.includes('treasury') || combined.includes('income')) {
    return 'US Bonds';
  }
  if (combined.includes('emerging') || combined.includes('em ')) {
    return 'Emerging Markets';
  }
  if (combined.includes('international') || combined.includes('foreign') || combined.includes('developed') || combined.includes('eafe') || combined.includes('ex-us') || combined.includes('world ex')) {
    return 'Intl Developed';
  }
  return 'US Equity';
}

// Popular ETFs and mutual funds to seed
const SEED_TICKERS = [
  // Benchmark ETFs
  'ITOT', 'IEFA', 'IEMG', 'AGG',
  // Popular US Equity ETFs
  'SPY', 'VOO', 'IVV', 'VTI', 'QQQ', 'VUG', 'VTV', 'IJH', 'IJR', 'IWM', 'IWF', 'IWD',
  'SCHD', 'VIG', 'DGRO', 'NOBL', 'SDY', 'DVY',
  // International ETFs
  'VEA', 'VXUS', 'EFA', 'VWO', 'EEM', 'IXUS',
  // Bond ETFs
  'BND', 'SCHZ', 'TLT', 'IEF', 'SHY', 'LQD', 'HYG', 'TIP', 'VCIT', 'VCSH',
  // BlackRock/iShares popular
  'IUSG', 'IUSV', 'QUAL', 'MTUM', 'USMV', 'EFAV', 'EEMV',
  // Sector ETFs
  'XLK', 'XLF', 'XLV', 'XLE', 'XLI', 'XLY', 'XLP', 'XLU', 'XLRE', 'XLB', 'XLC',
  // Thematic
  'ARKK', 'ICLN', 'TAN', 'SOXX', 'SMH', 'IGV',
  // Vanguard Mutual Funds
  'VFIAX', 'VTSAX', 'VTIAX', 'VBTLX', 'VWELX', 'VWINX', 'VTMGX',
  // Fidelity Mutual Funds
  'FXAIX', 'FSKAX', 'FTIHX', 'FXNAX', 'FBALX',
  // American Funds (Capital Group!)
  'AGTHX', 'AIVSX', 'ANCFX', 'ANWPX', 'AWSHX', 'CAIBX', 'CWGIX', 'AMECX', 'ABALX', 'ABNDX'
];

async function fetchFundData(ticker) {
  try {
    // Use quoteSummary which works in newer yahoo-finance2
    const result = await yahooFinance.quoteSummary(ticker, { 
      modules: ['price', 'summaryDetail', 'defaultKeyStatistics', 'fundProfile'] 
    });
    
    const price = result.price || {};
    const summaryDetail = result.summaryDetail || {};
    const defaultKeyStats = result.defaultKeyStatistics || {};
    const fundProfile = result.fundProfile || {};

    const aum = summaryDetail.totalAssets || price.marketCap || null;
    const expenseRatio = fundProfile.feesExpensesInvestment?.annualReportExpenseRatio || 
                         defaultKeyStats.annualReportExpenseRatio || null;
    
    const inceptionDate = defaultKeyStats.fundInceptionDate || null;
    const category = fundProfile.categoryName || price.quoteType || '';
    
    // Get historical data for returns calculation
    const now = new Date();
    const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
    
    let return_1yr = null, return_3yr = null, return_5yr = null, return_10yr = null;
    
    try {
      const history = await yahooFinance.chart(ticker, {
        period1: tenYearsAgo,
        period2: now,
        interval: '1mo'
      });

      if (history.quotes && history.quotes.length > 0) {
        const quotes = history.quotes.filter(q => q.close);
        const currentPrice = quotes[quotes.length - 1]?.close;
        
        if (currentPrice) {
          const getReturnFromMonthsAgo = (months) => {
            const targetIdx = quotes.length - 1 - months;
            if (targetIdx >= 0 && quotes[targetIdx]?.close) {
              return ((currentPrice - quotes[targetIdx].close) / quotes[targetIdx].close) * 100;
            }
            return null;
          };
          
          return_1yr = getReturnFromMonthsAgo(12);
          return_3yr = getReturnFromMonthsAgo(36);
          return_5yr = getReturnFromMonthsAgo(60);
          return_10yr = getReturnFromMonthsAgo(120);
        }
      }
    } catch (e) {
      console.log(`  Could not fetch history for ${ticker}`);
    }

    return {
      ticker,
      name: price.longName || price.shortName || ticker,
      type: price.quoteType === 'ETF' ? 'ETF' : 'MF',
      aum,
      expense_ratio: expenseRatio,
      inception_date: inceptionDate ? new Date(inceptionDate * 1000).toISOString().split('T')[0] : null,
      category,
      asset_class: mapAssetClass(category, price.longName || ''),
      return_1yr,
      return_3yr,
      return_5yr,
      return_10yr
    };
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error.message);
    return null;
  }
}

async function seedDatabase() {
  console.log('Seeding fund database...\n');
  
  const insert = db.prepare(`
    INSERT OR REPLACE INTO funds (ticker, name, type, aum, expense_ratio, inception_date, category, asset_class, return_1yr, return_3yr, return_5yr, return_10yr, updated_at)
    VALUES (@ticker, @name, @type, @aum, @expense_ratio, @inception_date, @category, @asset_class, @return_1yr, @return_3yr, @return_5yr, @return_10yr, datetime('now'))
  `);

  let success = 0, failed = 0;
  
  for (const ticker of SEED_TICKERS) {
    console.log(`Fetching ${ticker}...`);
    const data = await fetchFundData(ticker);
    
    if (data) {
      try {
        insert.run(data);
        console.log(`  ✓ ${data.name} (${data.asset_class}) - AUM: $${data.aum ? (data.aum / 1e9).toFixed(2) + 'B' : 'N/A'}`);
        success++;
      } catch (e) {
        console.log(`  ✗ Failed to insert: ${e.message}`);
        failed++;
      }
    } else {
      failed++;
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\nDone! ${success} funds added, ${failed} failed.`);
  
  // Show summary
  const summary = db.prepare('SELECT asset_class, COUNT(*) as count FROM funds GROUP BY asset_class').all();
  console.log('\nFunds by asset class:');
  for (const row of summary) {
    console.log(`  ${row.asset_class}: ${row.count}`);
  }
}

seedDatabase().catch(console.error);
