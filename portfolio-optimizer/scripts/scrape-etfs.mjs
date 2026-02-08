// Scrape ETF data from ETFdb.com
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const db = new Database(path.join(projectRoot, 'data', 'funds.db'));

function mapAssetClass(category) {
  if (!category) return 'US Equity';
  const cat = category.toLowerCase();
  
  if (cat.includes('bond') || cat.includes('fixed income') || cat.includes('treasury') || cat.includes('municipal') || cat.includes('corporate bond')) {
    return 'US Bonds';
  }
  if (cat.includes('emerging') || cat.includes('china') || cat.includes('brazil') || cat.includes('india')) {
    return 'Emerging Markets';
  }
  if (cat.includes('international') || cat.includes('foreign') || cat.includes('developed') || cat.includes('europe') || cat.includes('japan') || cat.includes('pacific') || cat.includes('eafe')) {
    return 'Intl Developed';
  }
  return 'US Equity';
}

async function fetchETFList() {
  console.log('Fetching ETF data from ETFdb.com...\n');
  
  const url = 'https://etfdb.com/api/screener/';
  
  const payload = {
    page: 1,
    per_page: 5000,
    sort_by: 'assets_under_management',
    sort_direction: 'desc',
    only: ['symbol', 'name', 'assets_under_management', 'expense_ratio', 'etfdb_category', 'one_year_return', 'three_year_return', 'five_year_return', 'ten_year_return', 'inception_date']
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

function parseNumber(val) {
  if (!val || val === 'N/A' || val === '--') return null;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[$%,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseAUM(val) {
  if (!val || val === 'N/A') return null;
  if (typeof val === 'number') return val;
  const str = String(val).toUpperCase();
  let multiplier = 1;
  if (str.includes('B')) multiplier = 1e9;
  else if (str.includes('M')) multiplier = 1e6;
  else if (str.includes('K')) multiplier = 1e3;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num * multiplier;
}

async function main() {
  try {
    const etfs = await fetchETFList();
    console.log(`Found ${etfs.length} ETFs\n`);

    const insert = db.prepare(`
      INSERT OR REPLACE INTO funds (ticker, name, type, aum, expense_ratio, inception_date, category, asset_class, return_1yr, return_3yr, return_5yr, return_10yr, updated_at)
      VALUES (@ticker, @name, @type, @aum, @expense_ratio, @inception_date, @category, @asset_class, @return_1yr, @return_3yr, @return_5yr, @return_10yr, datetime('now'))
    `);

    let added = 0, skipped = 0;

    for (const etf of etfs) {
      const aum = parseAUM(etf.assets_under_management);
      if (!aum || aum < 100000000) { skipped++; continue; }

      const ticker = etf.symbol?.trim();
      if (!ticker) continue;

      const fund = {
        ticker,
        name: etf.name || ticker,
        type: 'ETF',
        aum,
        expense_ratio: parseNumber(etf.expense_ratio) ? parseNumber(etf.expense_ratio) / 100 : null,
        inception_date: etf.inception_date || null,
        category: etf.etfdb_category || '',
        asset_class: mapAssetClass(etf.etfdb_category),
        return_1yr: parseNumber(etf.one_year_return),
        return_3yr: parseNumber(etf.three_year_return),
        return_5yr: parseNumber(etf.five_year_return),
        return_10yr: parseNumber(etf.ten_year_return)
      };

      insert.run(fund);
      added++;
      if (added % 100 === 0) console.log(`Added ${added} ETFs...`);
    }

    console.log(`\n✅ Added ${added} ETFs, skipped ${skipped}`);
    
    const summary = db.prepare('SELECT asset_class, COUNT(*) as count FROM funds GROUP BY asset_class').all();
    console.log('\nFunds by asset class:');
    for (const row of summary) {
      console.log(`  ${row.asset_class}: ${row.count}`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    db.close();
  }
}

main();
