// Fetch ETF data from stockanalysis.com
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const db = new Database(path.join(projectRoot, 'data', 'funds.db'));

// Ensure table exists
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

// Asset class mapping
function mapAssetClass(category) {
  if (!category) return 'US Equity';
  const cat = category.toLowerCase();
  
  if (cat.includes('fixed income') || cat.includes('bond')) return 'US Bonds';
  if (cat.includes('currency') && (cat.includes('yen') || cat.includes('euro') || cat.includes('pound'))) return 'Intl Developed';
  if (cat.includes('commodity')) return 'Other';
  if (cat.includes('alternative') || cat.includes('asset allocation')) return 'Other';
  return 'US Equity';
}

function parseAUM(aumStr) {
  if (!aumStr || aumStr === '-') return null;
  const str = String(aumStr).toUpperCase().replace(/[,$]/g, '');
  let multiplier = 1;
  if (str.includes('T')) multiplier = 1e12;
  else if (str.includes('B')) multiplier = 1e9;
  else if (str.includes('M')) multiplier = 1e6;
  else if (str.includes('K')) multiplier = 1e3;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num * multiplier;
}

// Raw data from stockanalysis.com scrape
const rawData = \`[AAA](/etf/aaa/)Alternative Access First Priority CLO Bond ETFFixed Income42.61M
[AAAA](/etf/aaaa/)Amplius Aggressive Asset Allocation ETFAsset Allocation252.40M
[AAAU](/etf/aaau/)Goldman Sachs Physical Gold ETFCommodity3.31B
[AAEQ](/etf/aaeq/)Alpha Architect US Equity 2 ETFEquity476.62M
[AAPU](/etf/aapu/)Direxion Daily AAPL Bull 2X SharesEquity255.83M
[AAUS](/etf/aaus/)Alpha Architect US Equity ETFEquity493.64M
[AAXJ](/etf/aaxj/)iShares MSCI All Country Asia ex Japan ETFEquity3.68B
[ABEQ](/etf/abeq/)Absolute Select Value ETFEquity128.11M
[ABFL](/etf/abfl/)Abacus FCF Leaders ETFEquity805.70M
[ACIO](/etf/acio/)Aptus Collared Investment Opportunity ETFEquity2.23B
[ACLC](/etf/aclc/)American Century Large Cap Equity ETFEquity296.01M
[ACLO](/etf/aclo/)TCW AAA CLO ETFFixed Income352.70M
[ACSI](/etf/acsi/)American Customer Satisfaction ETFEquity104.07M
[ACVF](/etf/acvf/)American Conservative Values ETFEquity139.28M
[ACWI](/etf/acwi/)iShares MSCI ACWI ETFEquity27.14B
[ACWV](/etf/acwv/)iShares MSCI Global Min Vol Factor ETFEquity3.35B
[ACWX](/etf/acwx/)iShares MSCI ACWI ex U.S. ETFEquity8.81B
[ADME](/etf/adme/)Aptus Drawdown Managed Equity ETFEquity250.29M
[ADPV](/etf/adpv/)Adaptiv Select ETFEquity171.15M
[AEMS](/etf/aems/)Anfield Enhanced Market ETFEquity130.68M
[AESR](/etf/aesr/)Anfield U.S. Equity Sector Rotation ETFEquity153.51M
[AFIF](/etf/afif/)Anfield Universal Fixed Income ETFFixed Income225.85M
[AFIX](/etf/afix/)Allspring Broad Market Core Bond ETFFixed Income178.26M
[AFK](/etf/afk/)VanEck Africa Index ETFEquity151.48M
[AFLG](/etf/aflg/)First Trust Active Factor Large Cap ETFEquity484.56M
[AFMC](/etf/afmc/)First Trust Active Factor Mid Cap ETFEquity112.32M
[AFOS](/etf/afos/)ARS Focused Opportunity Strategy ETFEquity239.05M
[AGG](/etf/agg/)iShares Core U.S. Aggregate Bond ETFFixed Income138.42B
[AGGA](/etf/agga/)EA Astoria Dynamic Core US Fixed Income ETFFixed Income72.04M
[AGGH](/etf/aggh/)Simplify Aggregate Bond ETFFixed Income360.05M
[AGGY](/etf/aggy/)WisdomTree Yield Enhanced U.S. Aggregate Bond FundFixed Income884.26M
[AGIX](/etf/agix/)KraneShares Artificial Intelligence & Technology ETFEquity181.90M
[AGOX](/etf/agox/)Adaptive Alpha Opportunities ETFAsset Allocation375.79M
[AGQ](/etf/agq/)ProShares Ultra SilverCommodity6.16B
[AGRW](/etf/agrw/)Allspring LT Large Growth ETFEquity114.84M
[AGZ](/etf/agz/)iShares Agency Bond ETFFixed Income572.66M
[AHYB](/etf/ahyb/)American Century Select High Yield ETFFixed Income58.55M
[AIA](/etf/aia/)iShares Asia 50 ETFEquity2.28B
[AIEQ](/etf/aieq/)Amplify AI Powered Equity ETFEquity117.91M
[AINP](/etf/ainp/)Allspring Income Plus ETFFixed Income199.49M
[AIPI](/etf/aipi/)REX AI Equity Premium Income ETFEquity416.68M
[AIPO](/etf/aipo/)Defiance AI & Power Infrastructure ETFEquity164.78M
[AIQ](/etf/aiq/)Global X Artificial Intelligence & Technology ETFEquity8.62B
[AIRR](/etf/airr/)First Trust RBA American Industrial Renaissance ETFEquity7.84B
[AIS](/etf/ais/)VistaShares Artificial Intelligence Supercycle ETFEquity147.11M
[AIVL](/etf/aivl/)WisdomTree U.S. AI Enhanced Value FundEquity391.41M
[AKRE](/etf/akre/)Akre Focus ETFEquity8.63B
[ALAI](/etf/alai/)Alger AI Enablers & Adopters ETFEquity302.33M
[ALLW](/etf/allw/)SPDR Bridgewater All Weather ETFAsset Allocation814.69M
[AMDL](/etf/amdl/)GraniteShares 2x Long AMD Daily ETFEquity742.79M
[AMDY](/etf/amdy/)YieldMax AMD Option Income Strategy ETFEquity181.55M
[AMID](/etf/amid/)Argent Mid Cap ETFEquity107.15M
[AMLP](/etf/amlp/)Alerian MLP ETFEquity11.37B
[AMZA](/etf/amza/)InfraCap MLP ETFEquity408.19M
[AMZU](/etf/amzu/)Direxion Daily AMZN Bull 2X SharesEquity355.38M
[AMZY](/etf/amzy/)YieldMax AMZN Option Income Strategy ETFEquity259.37M
[ANGL](/etf/angl/)VanEck Fallen Angel High Yield Bond ETFFixed Income3.12B
[AOA](/etf/aoa/)iShares Core 80/20 Aggressive Allocation ETFAsset Allocation2.84B
[AOHY](/etf/aohy/)Angel Oak High Yield Opportunities ETFFixed Income123.40M
[AOK](/etf/aok/)iShares Core 30/70 Conservative Allocation ETFAsset Allocation737.06M
[AOM](/etf/aom/)iShares Core 40/60 Moderate Allocation ETFAsset Allocation1.69B
[AOR](/etf/aor/)iShares Core 60/40 Balanced Allocation ETFAsset Allocation3.20B
[APCB](/etf/apcb/)ActivePassive Core Bond ETFFixed Income909.64M
[APIE](/etf/apie/)ActivePassive International Equity ETFEquity1.01B
[APLU](/etf/aplu/)Allspring Core Plus ETFFixed Income344.27M
[APMU](/etf/apmu/)ActivePassive Intermediate Municipal Bond ETFFixed Income215.49M
[APUE](/etf/apue/)ActivePassive U.S. Equity ETFEquity2.25B
[AQEC](/etf/aqec/)AQE Core ETFEquity610.89M
[AQLT](/etf/aqlt/)iShares MSCI Global Quality Factor ETFEquity221.53M
[ARB](/etf/arb/)AltShares Merger Arbitrage ETFAlternatives102.84M
[ARGT](/etf/argt/)Global X MSCI Argentina ETFEquity905.28M
[ARKB](/etf/arkb/)ARK 21Shares Bitcoin ETFCurrency3.01B
[ARKF](/etf/arkf/)ARK Blockchain & Fintech Innovation ETFEquity1.00B
[ARKG](/etf/arkg/)ARK Genomic Revolution ETFEquity1.31B
[ARKK](/etf/arkk/)ARK Innovation ETFEquity6.93B
[ARKQ](/etf/arkq/)ARK Autonomous Technology & Robotics ETFEquity2.11B
[ARKW](/etf/arkw/)ARK Next Generation Internet ETFEquity1.89B
[ARKX](/etf/arkx/)ARK Space & Defense Innovation ETFEquity850.22M
[ARTY](/etf/arty/)iShares Future AI & Tech ETFEquity2.33B
[ASHR](/etf/ashr/)Xtrackers Harvest CSI 300 China A-Shares ETFEquity1.82B
[ASLV](/etf/aslv/)Allspring Special Large Value ETFEquity251.10M
[ASTX](/etf/astx/)Tradr 2X Long ASTS Daily ETFEquity331.10M
[ATFV](/etf/atfv/)Alger 35 ETFEquity126.83M
[AUSF](/etf/ausf/)Global X Adaptive U.S. Factor ETFEquity788.89M
[AVDE](/etf/avde/)Avantis International Equity ETFEquity13.35B
[AVDV](/etf/avdv/)Avantis International Small Cap Value ETFEquity17.21B
[AVEM](/etf/avem/)Avantis Emerging Markets Equity ETFEquity18.78B
[AVES](/etf/aves/)Avantis Emerging Markets Value ETFEquity1.17B
[AVGE](/etf/avge/)Avantis All Equity Markets ETFEquity754.64M
[AVGX](/etf/avgx/)Defiance Daily Target 2X Long AVGO ETFEquity227.42M
[AVIG](/etf/avig/)Avantis Core Fixed Income ETFFixed Income1.59B
[AVIV](/etf/aviv/)Avantis International Large Cap Value ETFEquity1.12B
[AVL](/etf/avl/)Direxion Daily AVGO Bull 2X SharesEquity199.41M
[AVLC](/etf/avlc/)Avantis U.S. Large Cap Equity ETFEquity1.02B
[AVLV](/etf/avlv/)Avantis U.S. Large Cap Value ETFEquity10.08B
[AVMC](/etf/avmc/)Avantis U.S. Mid Cap Equity ETFEquity285.07M
[AVMV](/etf/avmv/)Avantis U.S. Mid Cap Value ETFEquity444.38M
[AVNM](/etf/avnm/)Avantis All International Markets Equity ETFEquity532.99M
[AVRE](/etf/avre/)Avantis Real Estate ETFEquity700.80M
[AVSC](/etf/avsc/)Avantis U.S Small Cap Equity ETFEquity2.31B
[AVSD](/etf/avsd/)Avantis Responsible International Equity ETFEquity439.12M
[AVSF](/etf/avsf/)Avantis Short-Term Fixed Income ETFFixed Income669.95M
[AVSU](/etf/avsu/)Avantis Responsible U.S. Equity ETFEquity451.36M
[AVUS](/etf/avus/)Avantis U.S. Equity ETFEquity11.14B
[AVUV](/etf/avuv/)Avantis U.S. Small Cap Value ETFEquity22.30B
[AVXC](/etf/avxc/)Avantis Emerging Markets ex-China Equity ETFEquity249.18M
[BAFE](/etf/bafe/)Brown Advisory Flexible Equity ETFEquity1.56B
[BAI](/etf/bai/)iShares A.I. Innovation and Tech Active ETFEquity8.83B
[BALI](/etf/bali/)iShares U.S. Large Cap Premium Income Active ETFEquity768.99M
[BALT](/etf/balt/)Innovator Defined Wealth Shield ETFAlternatives2.08B
[BAR](/etf/bar/)GraniteShares Gold SharesCommodity1.73B
[BASG](/etf/basg/)Brown Advisory Sustainable Growth ETFEquity487.55M
[BASV](/etf/basv/)Brown Advisory Sustainable Value ETFEquity289.70M
[BATT](/etf/batt/)Amplify Lithium & Battery Technology ETFEquity119.66M
[BBAG](/etf/bbag/)JPMorgan BetaBuilders U.S. Aggregate Bond ETFFixed Income1.14B
[BBAX](/etf/bbax/)JPMorgan BetaBuilders Developed Asia Pacific ex-Japan ETFEquity6.21B
[BBBI](/etf/bbbi/)BondBloxx BBB Rated 5-10 Year Corporate Bond ETFFixed Income133.05M
[BBBS](/etf/bbbs/)BondBloxx BBB Rated 1-5 Year Corporate Bond ETFFixed Income154.90M
[BBCA](/etf/bbca/)JPMorgan BetaBuilders Canada ETFEquity10.01B
[BBEM](/etf/bbem/)JPMorgan BetaBuilders Emerging Markets Equity ETFEquity794.92M
[BBEU](/etf/bbeu/)JPMorgan BetaBuilders Europe ETFEquity9.14B
[BBH](/etf/bbh/)VanEck Biotech ETFEquity393.77M
[BBHL](/etf/bbhl/)BBH Select Large Cap ETFEquity493.30M
[BBHM](/etf/bbhm/)BBH Select Mid Cap ETFEquity495.81M
[BBHY](/etf/bbhy/)JPMorgan BetaBuilders USD High Yield Corporate Bond ETFFixed Income711.72M
[BBIN](/etf/bbin/)JPMorgan BetaBuilders International Equity ETFEquity6.35B
[BBJP](/etf/bbjp/)JPMorgan BetaBuilders Japan ETFEquity14.86B
[BBLU](/etf/bblu/)EA Bridgeway Blue Chip ETFEquity368.19M
[BBMC](/etf/bbmc/)JPMorgan BetaBuilders U.S. Mid Cap Equity ETFEquity1.97B
[BBRE](/etf/bbre/)JPMorgan BetaBuilders MSCI US REIT ETFEquity1.04B
[BBSC](/etf/bbsc/)JPMorgan BetaBuilders U.S. Small Cap Equity FundEquity672.71M
[BBUS](/etf/bbus/)JPMorgan BetaBuilders U.S. Equity ETFEquity7.14B
[BCD](/etf/bcd/)abrdn Bloomberg All Commodity Longer Dated Strategy K-1 Free ETFCommodity356.97M
[BCHP](/etf/bchp/)Principal Focused Blue Chip ETFEquity200.52M
[BCI](/etf/bci/)abrdn Bloomberg All Commodity Strategy K-1 Free ETFCommodity2.25B
[BCPL](/etf/bcpl/)BNY Mellon Core Plus ETFFixed Income373.64M
[BCTK](/etf/bctk/)Baron Technology ETFEquity152.04M
[BDBT](/etf/bdbt/)Bluemonte Core Bond ETFFixed Income413.88M
[BDVL](/etf/bdvl/)iShares Disciplined Volatility Equity Active ETF Trust UnitEquity1.50B
[BDYN](/etf/bdyn/)iShares Dynamic Equity Active ETFEquity2.49B
[BEDY](/etf/bedy/)BNY Mellon Enhanced Dividend and Income ETFEquity124.23M
[BEEX](/etf/beex/)Beehive ETFEquity189.60M
[BENJ](/etf/benj/)Horizon Landmark ETFFixed Income213.21M
[BGDV](/etf/bgdv/)Bahl & Gaynor Dividend ETFEquity739.67M
[BGIG](/etf/bgig/)Bahl & Gaynor Income Growth ETFEquity413.30M
[BHYB](/etf/bhyb/)Xtrackers USD High Yield BB-B ex Financials ETFFixed Income1.96B
[BIBL](/etf/bibl/)Inspire 100 ETFEquity385.52M
[BIDD](/etf/bidd/)iShares International Dividend Active ETFEquity477.55M
[BIL](/etf/bil/)State Street SPDR Bloomberg 1-3 Month T-Bill ETFFixed Income42.20B
[BILS](/etf/bils/)State Street SPDR Bloomberg 3-12 Month T-Bill ETFFixed Income3.88B
[BILZ](/etf/bilz/)PIMCO Ultra Short Government Active Exchange-Traded FundFixed Income941.51M
[BINC](/etf/binc/)iShares Flexible Income Active ETFFixed Income16.39B
[BINT](/etf/bint/)Bluemonte Global Equity ETFEquity295.14M
[BINV](/etf/binv/)Brandes International ETFEquity438.54M
[BITB](/etf/bitb/)Bitwise Bitcoin ETF TrustCurrency3.16B
[BITI](/etf/biti/)ProShares Short Bitcoin ETFCurrency126.88M
[BITO](/etf/bito/)ProShares Bitcoin ETFCurrency2.46B
[BITQ](/etf/bitq/)Bitwise Crypto Industry Innovators ETFEquity433.78M
[BITU](/etf/bitu/)ProShares Ultra Bitcoin ETFCurrency554.02M
[BITW](/etf/bitw/)Bitwise 10 Crypto Index ETFCurrency947.97M
[BITX](/etf/bitx/)2x Bitcoin Strategy ETFCurrency1.34B
[BIV](/etf/biv/)Vanguard Intermediate-Term Bond ETFFixed Income27.84B
[BIZD](/etf/bizd/)VanEck BDC Income ETFEquity1.60B
[BKAG](/etf/bkag/)BNY Mellon Core Bond ETFFixed Income2.21B
[BKCG](/etf/bkcg/)BNY Mellon Concentrated Growth ETFEquity122.85M
[BKCH](/etf/bkch/)Global X Blockchain ETFEquity365.50M
[BKCI](/etf/bkci/)BNY Mellon Concentrated International ETFEquity184.79M
[BKDV](/etf/bkdv/)BNY Mellon Dynamic Value ETFEquity879.26M
[BKFI](/etf/bkfi/)BNY Mellon Active Core Bond ETFFixed Income379.05M
[BKGI](/etf/bkgi/)BNY Mellon Global Infrastructure Income ETFEquity557.09M
[BKHY](/etf/bkhy/)BNY Mellon High Yield ETFFixed Income384.06M
[BKIE](/etf/bkie/)BNY Mellon International Equity ETFEquity1.20B
[BKLC](/etf/bklc/)BNY Mellon US Large Cap Core Equity ETFEquity5.19B
[BKLN](/etf/bkln/)Invesco Senior Loan ETFFixed Income7.56B
[BKMC](/etf/bkmc/)BNY Mellon US Mid Cap Core Equity ETFEquity641.69M
[BKMI](/etf/bkmi/)BNY Mellon Municipal Intermediate ETFFixed Income1.78B
[BKMS](/etf/bkms/)BNY Mellon Municipal Short Duration ETFFixed Income458.19M
[BLCN](/etf/blcn/)Siren NexGen Economy ETFEquity37.27M
[BLCR](/etf/blcr/)iShares Large Cap Core Active ETFEquity107.44M
[BLCV](/etf/blcv/)iShares Large Cap Value Active ETFEquity104.78M
[BLDG](/etf/bldg/)Cambria Global Real Estate ETFEquity48.83M
[BLES](/etf/bles/)Inspire Global Hope ETFEquity141.42M
[BLGR](/etf/blgr/)Bluemonte Large Cap Growth ETFEquity211.62M
[BLOK](/etf/blok/)Amplify Blockchain Technology ETFEquity1.28B
[BLOX](/etf/blox/)Nicholas Crypto Income ETFAsset Allocation263.60M
[BLST](/etf/blst/)Bluemonte Short Term Bond ETFFixed Income144.27M
[BLTD](/etf/bltd/)Bluemonte Long Term Bond ETFFixed Income142.39M
[BLUC](/etf/bluc/)Bluemonte Large Cap Core ETFEquity256.76M
[BLUI](/etf/blui/)Bluemonte Diversified Income ETFAsset Allocation94.70M
[BLUX](/etf/blux/)Bluemonte Dynamic Total Market ETFEquity426.34M
[BLV](/etf/blv/)Vanguard Long-Term Bond ETFFixed Income5.98B
[BMOP](/etf/bmop/)BNY Mellon Municipal Opportunities ETFFixed Income1.86B
[BMVP](/etf/bmvp/)Invesco Bloomberg MVP Multi-factor ETFEquity101.91M
[BND](/etf/bnd/)Vanguard Total Bond Market ETFFixed Income149.78B
[BNDC](/etf/bndc/)FlexShares Core Select Bond Fund Core Select Bond FundFixed Income150.24M
[BNDI](/etf/bndi/)NEOS Enhanced Income Aggregate Bond ETFFixed Income140.96M
[BNDP](/etf/bndp/)Vanguard Core-Plus Bond Index ETFFixed Income107.07M
[BNDW](/etf/bndw/)Vanguard Total World Bond ETFFixed Income1.58B
[BNDX](/etf/bndx/)Vanguard Total International Bond ETFFixed Income75.48B
[BNDY](/etf/bndy/)Horizon Core Bond ETFFixed Income186.13M
[BNO](/etf/bno/)United States Brent Oil Fund LPCommodity132.74M
[BOAT](/etf/boat/)SonicShares Global Shipping ETFEquity50.11M
[BOIL](/etf/boil/)ProShares Ultra Bloomberg Natural GasCommodity340.54M
[BOND](/etf/bond/)PIMCO Active Bond Exchange-Traded FundFixed Income7.23B
[BOTZ](/etf/botz/)Global X Robotics & Artificial Intelligence ETFEquity3.42B
[BOXX](/etf/boxx/)Alpha Architect 1-3 Month Box ETFAlternatives9.84B
[BPRO](/etf/bpro/)Bitwise Proficio Currency Debasement ETFAsset Allocation104.46M
[BRHY](/etf/brhy/)iShares High Yield Active ETFFixed Income87.47M
[BRIE](/etf/brie/)MFS Blended Research International Equity ETFEquity78.30M
[BRIF](/etf/brif/)FIS Bright Portfolios Focused Equity ETFEquity109.84M
[BRLN](/etf/brln/)iShares Floating Rate Loan Active ETFFixed Income59.38M
[BRNY](/etf/brny/)Burney U.S. Factor Rotation ETFEquity607.76M
[BRRR](/etf/brrr/)Coinshares Bitcoin ETFCurrency506.86M
[BRTR](/etf/brtr/)iShares Total Return Active ETFFixed Income534.85M
[BRZU](/etf/brzu/)Direxion Daily MSCI Brazil Bull 2X SharesEquity148.51M
[BSCQ](/etf/bscq/)Invesco BulletShares 2026 Corporate Bond ETFFixed Income4.22B
[BSCR](/etf/bscr/)Invesco BulletShares 2027 Corporate Bond ETFFixed Income4.55B
[BSCS](/etf/bscs/)Invesco BulletShares 2028 Corporate Bond ETFFixed Income3.33B
[BSCT](/etf/bsct/)Invesco BulletShares 2029 Corporate Bond ETFFixed Income2.74B
[BSCU](/etf/bscu/)Invesco BulletShares 2030 Corporate Bond ETFFixed Income2.38B
[BSCV](/etf/bscv/)Invesco BulletShares 2031 Corporate Bond ETFFixed Income1.58B
[BSCW](/etf/bscw/)Invesco BulletShares 2032 Corporate Bond ETFFixed Income1.35B
[BSCX](/etf/bscx/)Invesco BulletShares 2033 Corporate Bond ETFFixed Income902.39M
[BSCY](/etf/bscy/)Invesco BulletShares 2034 Corporate Bond ETFFixed Income431.08M
[BSJQ](/etf/bsjq/)Invesco BulletShares 2026 High Yield Corp Bond ETFFixed Income1.15B
[BSJR](/etf/bsjr/)Invesco BulletShares 2027 High Yield Corporate Bond ETFFixed Income785.92M
[BSJS](/etf/bsjs/)Invesco BulletShares 2028 High Yield Corporate Bond ETFFixed Income628.66M
[BSJT](/etf/bsjt/)Invesco BulletShares 2029 High Yield Corporate Bond ETFFixed Income435.56M
[BSJV](/etf/bsjv/)Invesco BulletShares 2031 High Yield Corporate Bond ETFFixed Income77.12M
[BSMC](/etf/bsmc/)Brandes U.S. Small-Mid Cap Value ETFEquity152.09M\`;

// Parse the data
const lines = rawData.trim().split('\\n');
let added = 0;

const insert = db.prepare(\`
  INSERT OR REPLACE INTO funds (ticker, name, type, aum, category, asset_class, updated_at)
  VALUES (@ticker, @name, @type, @aum, @category, @asset_class, datetime('now'))
\`);

for (const line of lines) {
  // Parse format: [TICKER](/etf/ticker/)NameCategoryAUM
  const match = line.match(/\\[([A-Z]+)\\].*?\\/(.*?)([A-Z][a-z].*?)(Fixed Income|Equity|Commodity|Currency|Alternatives|Asset Allocation)([\\d.]+[BMK]?)$/);
  if (!match) continue;
  
  const [_, ticker, , name, category, aumStr] = match;
  const aum = parseAUM(aumStr);
  
  if (!aum || aum < 100000000) continue;
  
  const fund = {
    ticker,
    name: name.trim(),
    type: 'ETF',
    aum,
    category,
    asset_class: mapAssetClass(category)
  };
  
  try {
    insert.run(fund);
    added++;
  } catch (e) {
    // Skip duplicates
  }
}

console.log(\`Added \${added} ETFs from initial scrape.\\n\`);
console.log('Note: This is partial data. For complete coverage, use CSV import.');

const summary = db.prepare('SELECT asset_class, COUNT(*) as count FROM funds GROUP BY asset_class ORDER BY count DESC').all();
console.log('\\nTotal funds by asset class:');
for (const row of summary) {
  console.log(\`  \${row.asset_class}: \${row.count}\`);
}

const total = db.prepare('SELECT COUNT(*) as count FROM funds').get();
console.log(\`\\nTotal funds in database: \${total.count}\`);

db.close();
