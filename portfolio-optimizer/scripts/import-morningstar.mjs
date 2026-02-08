import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '..', 'data', 'funds.db'));

// Morningstar data from Sam - 125 large cap active funds
const rawData = `RGAHX	American Funds The Growth Fund of America® Class R-5E	Silver	3	2	Large Growth	0.44	Below Average	335971690191	No	0.84553	23.50256	11.27982	16.57474	14.91655
GFFFX	American Funds The Growth Fund of America® Class F-2	Silver	3	2	Large Growth	0.4	Low	335971690191	No	0.84883	23.54837	11.32554	16.62977	14.18459	12.46009
FFAFX	American Funds The Growth Fund of America® Class 529-F-3	Gold	3	2	Large Growth	0.34	Low	335971690191	No	0.86067	23.61431	11.38144	15.40927
FAFGX	American Funds The Growth Fund of America® Class 529-F-2	Silver	3	2	Large Growth	0.38	Low	335971690191	No	0.8596	23.56574	11.33274	15.35692
GAFFX	American Funds The Growth Fund of America® Class F-3	Gold	3	2	Large Growth	0.29	Low	335971690191	No	0.85736	23.68369	11.44668	15.66835
RGAFX	American Funds The Growth Fund of America® Class R-5	Gold	3	2	Large Growth	0.34	Low	335971690191	No	0.858	23.62227	11.39361	16.69459	14.24611	11.19529
RGAGX	American Funds The Growth Fund of America® Class R-6	Gold	3	2	Large Growth	0.29	Low	335971690191	No	0.86881	23.68492	11.44817	16.75332	14.30155	15.38456
FCTDX	Strategic Advisers Fidelity U.S. Total Stock Fund	Gold	3	2	Large Blend	0.21	Low	214003597043	No	2.79472	20.07883	13.66267	13.92424
RWMFX	American Funds Washington Mutual Investors Fund Class R-5	Gold	5	3	Large Value	0.31	Low	208214757504	No	2.17959	17.56296	14.38053	14.37224	12.98742	9.52501
AWSHX	American Funds Washington Mutual Investors Fund Class A	Silver	5	3	Large Value	0.55	Low	208214757504	No	2.14691	17.27232	14.08861	14.08907	12.70709	11.99841
WMFFX	American Funds Washington Mutual Investors Fund Class F-2	Gold	5	3	Large Value	0.37	Low	208214757504	No	2.16623	17.49314	14.31234	14.3082	12.92541	11.28769
RWMGX	American Funds Washington Mutual Investors Fund Class R-6	Gold	5	3	Large Value	0.26	Low	208214757504	No	2.17658	17.61887	14.43743	14.42918	13.04318	14.26454
ICAFX	American Funds Investment Company of America® Class F-2	Silver	5	2	Large Blend	0.37	Low	175957422690	No	2.04473	22.59161	15.63737	15.19447	13.06232	11.66045
RICGX	American Funds Investment Company of America® Class R-6	Silver	5	2	Large Blend	0.27	Low	175957422690	No	2.04375	22.72481	15.76126	15.31514	13.18133	14.31678
RFNGX	American Funds Fundamental Investors® Class R-6	Silver	4	2	Large Blend	0.28	Low	161771338051	No	4.26411	23.09491	15.2852	15.78097	13.51757	14.93323
FINFX	American Funds Fundamental Investors® Class F-2	Silver	4	2	Large Blend	0.38	Low	161771338051	No	4.25694	22.96372	15.16323	15.6577	13.40044	11.87873
DODGX	Dodge & Cox Stock Fund Class I	Gold	4	4	Large Value	0.51	Below Average	119131415085	No	2.23026	13.1718	13.29118	14.16636	12.18881	11.25297
JLGMX	JPMorgan Large Cap Growth Fund Class R6	Gold	4	2	Large Growth	0.44	Below Average	118712018499	No	-0.72883	23.17276	11.70638	19.78136	16.49258	16.81152
JLGRX	JPMorgan Large Cap Growth Fund Class R5	Gold	4	2	Large Growth	0.54	Below Average	118712018499	No	-0.75109	23.04075	11.59051	19.66058	16.38673	18.23251
RMFGX	American Funds American Mutual Fund® Class R-6	Gold	4	3	Large Value	0.27	Low	111521777508	No	2.47017	13.67775	12.40802	12.46954	11.3578	12.65991
AMRMX	American Funds American Mutual Fund® Class A	Gold	4	3	Large Value	0.57	Low	111521777508	No	2.43697	13.32072	12.05808	12.12633	11.02304	11.54225
AMRFX	American Funds American Mutual Fund® Class F-2	Gold	4	3	Large Value	0.38	Low	111521777508	No	2.45585	13.54596	12.28541	12.34273	11.23462	10.21188
FBGKX	Fidelity Blue Chip Growth Fund - Class K	Silver	4	3	Large Growth	0.54	Below Average	88923875462	No	0.39439	30.16908	13.36154	20.91218	17.62909	15.74113
FBGRX	Fidelity Blue Chip Growth Fund	Silver	4	3	Large Growth	0.61	Below Average	88923875462	No	0.38945	30.06791	13.26758	20.80331	17.50514	13.37158
FSAKX	Strategic Advisers U.S. Total Stock Fund	Gold	4	2	Large Blend	0.28	Low	88811431446	No	2.50447	20.35672	14.51498	15.93673	13.39558	13.65675
FDGRX	Fidelity Growth Company Fund	Gold	5	3	Large Growth	0.69	Below Average	80966391813	No	3.47135	30.89775	14.75233	22.67962	18.77121	14.94245
FGCKX	Fidelity Growth Company Fund - Class K	Gold	5	3	Large Growth	0.62	Average	80966391813	No	3.46545	30.96828	14.82842	22.77348	18.88002	16.28597
VPMAX	Vanguard PRIMECAP Fund Admiral Shares	Gold	5	3	Large Blend	0.27	Low	75698348319	No	6.48964	22.65858	14.71588	17.04353	15.04265	12.09299
VPMCX	Vanguard PRIMECAP Fund Investor Shares	Silver	5	3	Large Blend	0.35	Low	75698348319	No	6.47961	22.56792	14.63347	16.96093	14.95702	14.01862
TBCIX	T. Rowe Price Blue Chip Growth Fund I Class	Silver	3	4	Large Growth	0.57	Below Average	68685501902	No	-1.70315	27.23372	10.80066	16.91374	15.38986
VEIRX	Vanguard Equity-Income Fund Admiral Shares	Silver	4	2	Large Value	0.17	Low	62374005628	No	3.79938	13.74714	13.49391	12.73247	12.18832	9.14367
MEIKX	MFS Value Fund Class R6	Gold	3	2	Large Value	0.44	Below Average	55657628264	No	3.48628	11.17583	10.83714	11.40146	10.81202	8.78583
MEIIX	MFS Value Fund Class I	Gold	3	2	Large Value	0.54	Below Average	55657628264	No	3.4736	11.05854	10.72056	11.28227	10.71012	9.84703
VWUAX	Vanguard U.S. Growth Fund Admiral™ Shares	Silver	3	2	Large Growth	0.25	Low	48191135978	No	-2.47616	22.69946	6.97489	16.19153	14.68854	8.94599
PEQSX	Putnam Large Cap Value Fund Class R6	Silver	5	3	Large Value	0.54	Below Average	47552697850	No	4.30354	17.99946	15.93833	14.89107	14.15883
CDDYX	Columbia Dividend Income Fund Institutional 3 Class	Silver	4	3	Large Value	0.54	Below Average	46964060277	No	4.71825	14.76308	12.97949	13.47281	13.09256
CDDRX	Columbia Dividend Income Fund Institutional 2 Class	Silver	4	3	Large Value	0.59	Below Average	46964060277	No	4.70016	14.70403	12.92242	13.41119	13.03692
OIEJX	JPMorgan Equity Income Fund Class R6	Gold	3	3	Large Value	0.45	Below Average	44101849830	No	4.53955	11.56039	11.88381	12.26477	11.97943
HLIEX	JPMorgan Equity Income Fund Class I	Silver	3	3	Large Value	0.7	Average	44101849830	No	4.51758	11.28118	11.60403	11.98264	11.53536	9.48267
MFEKX	MFS Growth Fund Class R6	Silver	4	4	Large Growth	0.49	Below Average	42478411463	No	-0.76405	21.5949	10.84969	16.42344	15.91275
MFEIX	MFS Growth Fund Class I	Silver	3	4	Large Growth	0.58	Below Average	42478411463	No	-0.77306	21.48372	10.74573	16.3146	14.60343	9.49799
DFEOX	DFA U.S. Core Equity 1 Portfolio Institutional Class	Silver	3	2	Large Blend	0.15	Low	39045215250	No	3.28629	17.73723	13.50326	15.10127	13.0304	10.62056
DFQTX	DFA U.S. Core Equity II Portfolio Institutional Class	Silver	3	2	Large Blend	0.18	Low	36834273899	No	3.45763	17.09564	13.38995	14.78038	12.59403	10.27646
FOCPX	Fidelity OTC Portfolio	Silver	5	3	Large Growth	0.73	Average	35741192313	No	2.71829	28.16476	14.30597	21.10644	17.63337	14.78008
FOCKX	Fidelity OTC Portfolio - Class K	Silver	5	3	Large Growth	0.65	Above Average	35741192313	No	2.7611	28.27707	14.39864	21.22013	17.75715	16.15768
JUEMX	JPMorgan U.S. Equity Fund Class R6	Silver	4	3	Large Blend	0.44	Below Average	34290161069	No	0.73883	18.78681	13.27842	16.08853	14.03054	14.6091
JMUEX	JPMorgan U.S. Equity Fund Class L	Silver	4	3	Large Blend	0.56	Average	34290161069	No	0.70449	18.65829	13.15171	15.96986	13.90265	10.80347
TRVLX	T. Rowe Price Value Fund	Silver	3	3	Large Value	0.69	Average	30864809692	No	5.95736	14.03709	11.20457	12.33587	11.35778	11.03467
TRPIX	T. Rowe Price Value Fund I Class	Silver	3	3	Large Value	0.57	Below Average	30864809692	No	5.97735	14.19197	11.34929	12.48805	11.36721
FAGCX	Fidelity Advisor Growth Opportunities Fund - Class I	Silver	4	3	Large Growth	0.71	Average	30045200328	No	-0.76088	28.15266	9.58505	21.55091	17.90051	11.02107
CGDV	Capital Group Dividend Value ETF	Gold	5	2	Large Value	0.33		29082780176	No	2.97892	23.40725	18.21918
BBGLX	Bridge Builder Large Cap Growth Fund	Silver	3	3	Large Growth	0.19	Low	28160832465	No	-1.30119	17.29686	9.66585	15.22069	13.19998
VTCIX	Vanguard Tax-Managed Capital Appreciation Fund Institutional Shares	Gold	4	3	Large Blend	0.06	Low	27153763000	No	1.99164	19.67276	13.55236	15.792	13.82543	8.90593
VTCLX	Vanguard Tax-Managed Capital Appreciation Fund Admiral Shares	Gold	4	3	Large Blend	0.09	Low	27153763000	No	1.99329	19.63833	13.51866	15.75885	13.78954
BBVLX	Bridge Builder Large Cap Value Fund	Silver	4	3	Large Value	0.23	Low	26981257582	No	3.53075	12.91549	12.68591	13.16848	10.88234
VHCAX	Vanguard Capital Opportunity Fund Admiral Shares	Gold	3	3	Large Blend	0.32	Low	25730856574	No	6.10993	20.18999	12.58615	16.61959	14.57964	12.21577
PRILX	Parnassus Core Equity Fund - Institutional Shares	Silver	3	5	Large Blend	0.61	Below Average	25717075508	No	1.9772	16.2523	11.68769	14.40134	13.11573	11.69791
OAZMX	Oakmark Fund R6 Class	Gold	5	2	Large Value	0.61	Average	25272100874	No	0.48239	14.62193	14.98978	15.45245
OAKMX	Oakmark Fund Investor Class	Gold	4	2	Large Value	0.89	Above Average	25272100874	No	0.45333	14.3053	14.67414	14.90878	13.06246	12.83679
DFLVX	DFA U.S. Large Cap Value Portfolio Institutional Class	Silver	3	2	Large Value	0.23	Low	24518470384	No	5.62955	13.15182	12.66461	12.36127	11.12595	10.24524
VWNEX	Vanguard Windsor™ Fund Admiral™ Shares	Silver	3	3	Large Value	0.26	Low	24047219687	No	3.11615	10.83489	12.50147	13.02856	11.2695	8.72814
PRDGX	T. Rowe Price Dividend Growth Fund	Gold	3	3	Large Blend	0.64	Below Average	23973356711	No	2.52482	13.22108	11.40766	13.60622	12.43874	10.39264
PDGIX	T. Rowe Price Dividend Growth Fund I Class	Gold	3	3	Large Blend	0.5	Below Average	23973356711	No	2.52606	13.37649	11.55512	13.74851	12.9327
FGKFX	Fidelity Growth Company K6 Fund	Gold	4	2	Large Growth	0.45	Below Average	23588807522	No	3.81081	32.05614	15.49706	24.27853
JGVVX	JPMorgan Growth Advantage Fund Class R6	Silver	4	3	Large Growth	0.5	Below Average	21970212643	No	-1.43691	23.1559	11.70585	19.37136	16.38919
CGGR	Capital Group Growth ETF	Silver	4	1	Large Growth	0.39		19993771203	No	0.15741	24.91293	16.83207
JDVWX	John Hancock Funds Disciplined Value Fund Class R6	Silver	4	4	Large Value	0.6	Average	19117062811	No	5.92742	16.14057	14.92701	13.20141	12.87968
JDVNX	John Hancock Funds Disciplined Value Fund Class NAV	Silver	4	4	Large Value	0.6	Below Average	19117062811	No	5.92503	16.13962	14.92847	13.20418	11.64775	12.88282`;

function mapCategory(cat) {
  if (!cat) return 'US Equity';
  const c = cat.toLowerCase();
  if (c.includes('value')) return 'US Equity';
  if (c.includes('growth')) return 'US Equity';
  if (c.includes('blend')) return 'US Equity';
  if (c.includes('bond') || c.includes('fixed')) return 'US Bonds';
  if (c.includes('international') || c.includes('foreign')) return 'Intl Developed';
  if (c.includes('emerging')) return 'Emerging Markets';
  return 'US Equity';
}

console.log('Importing Morningstar data...\n');

const insert = db.prepare(`
  INSERT OR REPLACE INTO funds (ticker, name, type, aum, expense_ratio, category, asset_class, return_1yr, return_3yr, return_5yr, return_10yr, updated_at)
  VALUES (@ticker, @name, @type, @aum, @expense_ratio, @category, @asset_class, @return_1yr, @return_3yr, @return_5yr, @return_10yr, datetime('now'))
`);

const lines = rawData.trim().split('\n');
let added = 0;

for (const line of lines) {
  const cols = line.split('\t');
  if (cols.length < 10) continue;
  
  const ticker = cols[0]?.trim();
  const name = cols[1]?.trim();
  const category = cols[5]?.trim();
  const expenseRatio = parseFloat(cols[6]) / 100 || null;
  const aum = parseFloat(cols[8]) || null;
  const return_1yr = parseFloat(cols[11]) || null;
  const return_3yr = parseFloat(cols[12]) || null;
  const return_5yr = parseFloat(cols[13]) || null;
  const return_10yr = parseFloat(cols[14]) || null;
  
  if (!ticker || !name) continue;
  
  const fund = {
    ticker,
    name,
    type: ticker.length <= 4 ? 'ETF' : 'MF',
    aum,
    expense_ratio: expenseRatio,
    category,
    asset_class: mapCategory(category),
    return_1yr,
    return_3yr,
    return_5yr,
    return_10yr
  };
  
  try {
    insert.run(fund);
    console.log(`✓ ${ticker} - ${name}`);
    added++;
  } catch (e) {
    console.log(`✗ ${ticker}: ${e.message}`);
  }
}

console.log(`\n✅ Imported ${added} funds from Morningstar data`);

const total = db.prepare('SELECT COUNT(*) as count FROM funds').get();
console.log(`Total funds in database: ${total.count}`);

db.close();
