'use client';

import { useState } from 'react';

interface ToolExplainerProps {
  toolName: string;
  shortDescription?: string;
  className?: string;
}

// Pre-written explanations for each tool
const TOOL_EXPLANATIONS: Record<string, {
  title: string;
  summary: string;
  methodology: string;
  dataSources: string[];
  limitations: string[];
  learnMore?: string;
}> = {
  'monte-carlo': {
    title: 'Monte Carlo Retirement Simulator',
    summary: 'Monte Carlo simulation runs thousands of possible future scenarios to estimate the probability your retirement plan will succeed. Instead of assuming a fixed return every year, it uses historical market data to model the unpredictable nature of real markets.',
    methodology: `The simulator uses **historical bootstrap sampling** from 97 years of market data (1928-2024). For each simulation:

1. **Random year selection**: We randomly pick historical years and use their actual returns for stocks, bonds, international equities, REITs, gold, and inflation.

2. **Correlation preservation**: Asset returns within each sampled year maintain their real-world correlations (e.g., bonds often rise when stocks fall).

3. **Fat-tail modeling**: Optional Student's t-distribution adds realistic crash scenarios that normal distributions underestimate.

4. **Sequence of returns**: By running 1,000-10,000 simulations, we capture how the *order* of returns matters—bad years early in retirement are more damaging than bad years later.

5. **Withdrawal strategies**: We model fixed withdrawals, flexible spending (reduce in bad years), and guardrails (adjust at thresholds).`,
    dataSources: [
      'S&P 500 total returns (1928-2024)',
      '10-Year Treasury bonds',
      'MSCI EAFE (International developed markets)',
      'NAREIT (Real estate investment trusts)',
      'Gold spot prices',
      'Bitcoin (2011-2024)',
      'CPI inflation data'
    ],
    limitations: [
      'Past performance doesn\'t guarantee future results',
      'Assumes you can actually stick to your plan during market crashes',
      'Doesn\'t account for major life changes (health emergencies, inheritance, etc.)',
      'Tax modeling is simplified',
      'Sequence of returns risk is modeled but not perfectly predictable'
    ],
    learnMore: 'https://www.investopedia.com/terms/m/montecarlosimulation.asp'
  },
  
  'fragility-index': {
    title: 'Market Fragility Index™',
    summary: 'The Fragility Index measures how vulnerable markets are to a significant downturn by analyzing 8 key pillars: valuation, credit conditions, volatility, sentiment, liquidity, macro indicators, technical factors, and cross-asset signals.',
    methodology: `We aggregate 40+ indicators into a single 0-100 score:

**Valuation (weight: 20%)**
- Shiller CAPE ratio vs historical average
- Buffett Indicator (market cap / GDP)
- Forward P/E vs 25-year average

**Credit & Spreads (15%)**
- High-yield bond spreads
- Investment-grade spreads
- TED spread (banking stress)

**Volatility (15%)**
- VIX level and term structure
- Realized vs implied volatility gap
- Put/call ratio

**Sentiment (15%)**
- AAII investor sentiment
- CNN Fear & Greed Index
- Margin debt levels

**Liquidity (10%)**
- Bid-ask spreads
- Trading volume trends
- Fed balance sheet changes

**Macro (10%)**
- Yield curve shape
- Leading economic indicators
- Unemployment trends

**Technicals (10%)**
- Market breadth
- % stocks above 200-day MA
- New highs vs new lows

**Cross-Asset (5%)**
- Gold/equity ratio
- Currency stress indicators`,
    dataSources: [
      'FRED (Federal Reserve Economic Data)',
      'Yahoo Finance (market data)',
      'CBOE (VIX, options data)',
      'AAII (sentiment surveys)',
      'ICE BofA (credit spreads)'
    ],
    limitations: [
      'High fragility doesn\'t mean an imminent crash—markets can stay "fragile" for years',
      'The index measures vulnerability, not timing',
      'Some indicators lag (sentiment surveys are weekly)',
      'Novel risks (pandemics, wars) may not be captured by historical patterns'
    ]
  },
  
  'social-security': {
    title: 'Social Security Optimizer',
    summary: 'This tool calculates your optimal Social Security claiming strategy by comparing the lifetime value of claiming at different ages (62-70), accounting for life expectancy, spousal benefits, and the time value of money.',
    methodology: `The optimizer considers:

1. **Break-even analysis**: At what age does waiting to claim "pay off"? Delaying from 62 to 70 increases your benefit by ~77%, but you miss 8 years of payments.

2. **Life expectancy modeling**: We use actuarial tables adjusted for your health factors. If you expect to live longer, delaying is usually better.

3. **Spousal coordination**: For married couples, we analyze all 81 combinations of claiming ages to find the optimal joint strategy.

4. **Present value calculation**: Future dollars are worth less than today's dollars. We discount at various rates (2-5%) to show how the optimal age changes.

5. **Survivor benefits**: The higher earner's benefit becomes the survivor benefit—delaying often protects the surviving spouse.`,
    dataSources: [
      'Social Security Administration benefit formulas (2024)',
      'SSA actuarial life tables',
      'Historical COLA adjustments'
    ],
    limitations: [
      'Assumes current Social Security rules continue (Congress may change them)',
      'Doesn\'t account for state taxes on SS benefits',
      'Health and family longevity are hard to predict',
      'Doesn\'t consider the psychological value of "bird in hand"'
    ],
    learnMore: 'https://www.ssa.gov/benefits/retirement/planner/delayret.html'
  },
  
  'tax-harvesting': {
    title: 'Tax-Loss Harvesting Scanner',
    summary: 'Tax-loss harvesting lets you sell investments at a loss to offset capital gains taxes, then immediately reinvest in similar (but not "substantially identical") assets to maintain your market exposure.',
    methodology: `The scanner:

1. **Identifies losses**: Scans your portfolio for positions with unrealized losses.

2. **Calculates tax savings**: Estimates savings based on your tax bracket. Losses offset gains dollar-for-dollar, plus up to $3,000 of ordinary income annually.

3. **Wash sale detection**: Flags positions where you've bought the same security within 30 days (before or after), which would disallow the loss.

4. **Swap suggestions**: Recommends similar ETFs/funds that maintain your asset allocation without triggering wash sales (e.g., swap VTI for ITOT).

5. **Carryforward tracking**: Unused losses carry forward indefinitely to offset future gains.`,
    dataSources: [
      'Your portfolio holdings',
      'Current market prices',
      'IRS wash sale rules (26 U.S.C. § 1091)',
      'ETF similarity database'
    ],
    limitations: [
      'You must actually execute the trades—this is analysis, not advice',
      'Wash sale rules are complex; consult a tax professional for edge cases',
      'State tax treatment may differ',
      'Transaction costs and bid-ask spreads reduce net benefit'
    ]
  },
  
  'portfolio-lab': {
    title: 'Portfolio Lab',
    summary: 'Portfolio Lab analyzes your holdings across multiple dimensions: risk metrics, factor exposures, sector concentration, and optimization opportunities. It helps you understand what you actually own and how to improve it.',
    methodology: `The lab includes:

**Risk Analysis**
- Portfolio volatility (standard deviation)
- Beta (market sensitivity)
- Maximum drawdown (worst peak-to-trough decline)
- Value at Risk (95% confidence)

**Factor Exposures**
- Size (large vs small cap)
- Value vs growth tilt
- Momentum
- Quality
- Low volatility

**Optimization**
- Mean-variance optimization (Markowitz)
- Risk parity allocation
- Black-Litterman with your views
- Minimum volatility portfolio

**Stress Testing**
- Historical scenarios (2008, 2020, etc.)
- Custom shocks (rates +2%, oil +50%, etc.)`,
    dataSources: [
      'Your portfolio holdings',
      'Historical returns (1928-2024)',
      'Fund holdings data (when available)',
      'Factor return series'
    ],
    limitations: [
      'Optimization is based on historical data—future correlations may differ',
      'Doesn\'t account for taxes or transaction costs in rebalancing suggestions',
      'Factor exposures are estimates based on returns-based analysis',
      'Real-time fund holdings may not be available for all funds'
    ]
  },
  
  'safe-withdrawal': {
    title: 'Safe Withdrawal Rate Analyzer',
    summary: 'The "4% rule" is famous, but is it right for you? This tool analyzes sustainable withdrawal rates using historical data, Monte Carlo simulation, and your specific situation.',
    methodology: `We analyze withdrawal rates through multiple lenses:

1. **Historical success rates**: What % of 30-year periods in history would have survived at each withdrawal rate?

2. **Sequence of returns risk**: The same average return can succeed or fail depending on the order. We visualize this risk.

3. **Guardrails approach**: Instead of fixed withdrawals, adjust spending based on portfolio performance (e.g., Guyton-Klinger rules).

4. **Floor-and-ceiling**: Set minimum spending (floor) and maximum (ceiling), adjust between them based on portfolio.

5. **CAPE-based adjustments**: Lower withdrawal rate when valuations are high (Shiller CAPE > 25).`,
    dataSources: [
      'Historical market returns (1928-2024)',
      'Trinity Study methodology',
      'Bengen\'s original 4% rule research',
      'Current CAPE ratio'
    ],
    limitations: [
      'Historical safe rates may not apply to future conditions',
      'Assumes a 30-year retirement—longer retirements need lower rates',
      'Doesn\'t account for Social Security, pensions, or other income',
      'Psychological difficulty of actually cutting spending in downturns'
    ],
    learnMore: 'https://www.investopedia.com/terms/f/four-percent-rule.asp'
  },
  
  'stress-test': {
    title: 'Historical Stress Test',
    summary: 'See how your portfolio would have performed during major market crises—2008 financial crisis, COVID crash, dot-com bust, Black Monday, and more. Understand your true risk exposure.',
    methodology: `For each crisis scenario:

1. **Apply historical returns**: We use the actual daily/monthly returns from each crisis period to your current holdings.

2. **Account for correlations**: During crises, correlations spike—assets that normally diversify may fall together.

3. **Recovery analysis**: Show not just the drawdown, but how long recovery took.

4. **Portfolio-specific impact**: Your actual holdings, not a generic 60/40 portfolio.

The scenarios include:
- **2008 GFC**: Oct 2007 - Mar 2009 (-56.8% S&P 500)
- **COVID Crash**: Feb-Mar 2020 (-33.9%)
- **Dot-Com Bust**: Mar 2000 - Oct 2002 (-49.1%)
- **Black Monday**: Oct 1987 (-22.6% in one day)
- **1970s Stagflation**: 1973-1974 (-48.2%)
- **Rate Shock 2022**: Jan-Oct 2022 (-25.4%)`,
    dataSources: [
      'Historical daily/monthly returns',
      'Your portfolio holdings',
      'Asset-class-level data for funds'
    ],
    limitations: [
      'Future crises will be different—this shows vulnerability, not prediction',
      'Fund holdings may have changed since historical periods',
      'Doesn\'t account for behavioral reactions (panic selling)',
      'Some asset classes lack data for older crises'
    ]
  },

  'market-outlook': {
    title: 'Market Outlook & Valuations',
    summary: 'Track key market valuation indicators to understand whether markets are cheap, fair, or expensive by historical standards. Valuations don\'t predict short-term moves, but they\'re the best predictor of long-term returns.',
    methodology: `We track several valuation metrics:

**Shiller CAPE (Cyclically Adjusted P/E)**
Current price divided by 10-year average inflation-adjusted earnings. Smooths out business cycle effects.
- Historical average: ~17
- Above 25: Historically expensive
- Above 30: Very expensive (dot-com peaked at 44)

**Buffett Indicator**
Total stock market cap divided by GDP. Warren Buffett's favorite valuation metric.
- Below 75%: Undervalued
- 75-100%: Fair value
- Above 100%: Overvalued

**Fed Model (Equity Risk Premium)**
Earnings yield (1/PE) minus 10-year Treasury yield. Shows stocks vs bonds attractiveness.
- Positive: Stocks relatively attractive
- Negative: Bonds relatively attractive`,
    dataSources: [
      'Robert Shiller\'s CAPE data',
      'FRED (GDP, market cap)',
      'Federal Reserve (interest rates)',
      'S&P 500 earnings data'
    ],
    limitations: [
      'Valuations can stay "expensive" or "cheap" for years',
      'Not useful for market timing',
      'Better for setting long-term return expectations',
      'Different sectors may have different "normal" valuations'
    ],
    learnMore: 'http://www.econ.yale.edu/~shiller/data.htm'
  },

  'oracle': {
    title: 'Maven Oracle',
    summary: 'Maven Oracle is your AI wealth partner, powered by Claude (Anthropic). It sees your complete financial picture 24/7 and learns from every conversation to give increasingly personalized advice.',
    methodology: `Maven Oracle combines:

1. **Claude by Anthropic**: State-of-the-art reasoning and natural language understanding. Claude is known for being helpful, harmless, and honest.

2. **Your complete financial context**: Oracle sees your full portfolio, accounts, holdings, tax situation, and financial goals. Every response is personalized to YOUR situation.

3. **Conversation memory**: Oracle remembers your entire conversation history. Ask follow-up questions, reference previous discussions, build on past advice.

4. **Real-time data integration**: Oracle can pull live market data, stock research, economic indicators, and news to inform its analysis.

5. **Tool calling**: Oracle can run Monte Carlo simulations, calculate tax scenarios, analyze Social Security timing, stress test portfolios, and more — all mid-conversation.

6. **Guardrails**: Oracle gives educational information and analysis, not specific investment advice. For major decisions, it recommends consulting licensed professionals.

**Note**: Oracle requires an API key to function. Without it, you'll see "Limited Mode" and receive basic responses.`,
    dataSources: [
      'Your Maven profile and portfolio (real-time)',
      'Live market data and stock quotes',
      'Financial news and research',
      'Economic indicators (FRED, etc.)',
      'Claude\'s training data (general financial knowledge)'
    ],
    limitations: [
      'Not a licensed financial advisor — for educational purposes',
      'Requires ANTHROPIC_API_KEY to be configured',
      'Cannot execute trades or access external brokerage accounts',
      'Complex tax situations require a CPA',
      'Conversation memory is per-session (clears if you clear chat)'
    ]
  },

  'retirement-optimizer': {
    title: '401(k) & Retirement Optimizer',
    summary: 'Analyze your 401(k) and other retirement accounts for hidden fees, suboptimal allocations, and missed employer match opportunities. Find thousands in potential savings.',
    methodology: `The optimizer examines:

**Fee Analysis**
- Expense ratios of your fund options
- Administrative fees
- Comparison to low-cost alternatives (index funds)

**Employer Match**
- Are you contributing enough to get the full match?
- Match formula analysis (e.g., 50% up to 6%)

**Allocation Analysis**
- Target-date fund appropriateness for your age
- Overlap detection (owning the same stocks in multiple funds)
- Asset location optimization (which assets in which account type)

**Old 401(k) Tracking**
- Do you have orphaned accounts at previous employers?
- Rollover analysis: stay, roll to IRA, or roll to current 401(k)?
- Fee comparison across options`,
    dataSources: [
      'Your reported 401(k) holdings',
      'Fund expense ratio databases',
      'Employer plan documents (when provided)',
      'IRS contribution limits'
    ],
    limitations: [
      'Requires you to input your plan details accurately',
      'Some plan fees are buried and hard to find',
      'Doesn\'t account for plan-specific features (loans, hardship withdrawals)',
      'Rollover decisions have tax implications—consult a professional'
    ]
  },

  'sensitivity': {
    title: 'Sensitivity Analysis (Tornado Charts)',
    summary: 'Understand which assumptions matter most to your retirement plan. Sensitivity analysis shows how changes in returns, inflation, spending, and other variables impact your success rate.',
    methodology: `We vary each input while holding others constant:

**Tornado Chart**
Shows which variables have the biggest impact on your outcome. The wider the bar, the more sensitive your plan is to that assumption.

**Two-Way Tables**
See how combinations of two variables interact. For example: What if returns are low AND inflation is high?

**Break-Even Analysis**
What's the minimum return you need? Maximum spending you can sustain? When does delaying retirement pay off?

Variables we test:
- Investment returns (±2%)
- Inflation rate (±1%)
- Retirement spending (±10%)
- Retirement age (±3 years)
- Social Security timing
- Life expectancy`,
    dataSources: [
      'Your Monte Carlo parameters',
      'Historical return/inflation ranges',
      'Your financial profile'
    ],
    limitations: [
      'Assumes other variables truly stay constant (they don\'t in reality)',
      'Doesn\'t capture tail risks or black swan events',
      'Sensitivity is based on your current plan—different plans have different sensitivities'
    ]
  },

  'asset-location': {
    title: 'Asset Location Optimizer',
    summary: 'Asset location is about putting the right investments in the right account types. Tax-inefficient assets (bonds, REITs) belong in tax-advantaged accounts; tax-efficient assets (index funds) can go in taxable.',
    methodology: `The optimizer considers:

**Tax Efficiency Ranking**
- Municipal bonds: Tax-free, best in taxable
- Index funds: Low turnover, tax-efficient
- Growth stocks: Unrealized gains, defer taxes
- REITs: High dividends taxed as ordinary income
- Bonds: Interest taxed as ordinary income
- Actively managed funds: High turnover, tax-inefficient

**Account Types**
- Taxable: Pay taxes annually on dividends/gains
- Traditional IRA/401(k): Tax-deferred, ordinary income on withdrawal
- Roth IRA/401(k): Tax-free growth and withdrawal

**Optimal Placement**
1. Max tax-inefficient assets in tax-deferred accounts
2. Put tax-free munis in taxable accounts
3. Roth gets highest expected growth (tax-free upside)
4. Taxable gets tax-efficient index funds`,
    dataSources: [
      'Your portfolio by account type',
      'Fund tax efficiency data',
      'Your tax bracket information'
    ],
    limitations: [
      'Rebalancing across accounts can be complex',
      'Doesn\'t account for state taxes',
      'Your specific situation may have nuances (NUA, estate planning)',
      'Transaction costs of repositioning'
    ]
  },

  'income': {
    title: 'Retirement Income Planner',
    summary: 'Visualize where your retirement income will come from year by year: portfolio withdrawals, Social Security, pensions, rental income, and part-time work. Build a sustainable income ladder.',
    methodology: `The planner maps out:

**Income Sources**
- Portfolio withdrawals (from which accounts?)
- Social Security (when to claim?)
- Pensions (if applicable)
- Rental income
- Part-time work
- Annuities

**Tax Bracket Management**
- Fill lower tax brackets with traditional IRA withdrawals
- Roth conversions in low-income years
- Qualified dividends and long-term gains at 0% bracket

**Income Ladder**
- Early retirement (before SS): Taxable account draws
- Social Security starts: Reduce portfolio withdrawals
- RMDs begin (73+): Required distributions from traditional accounts

**Bucketing Strategy**
- Bucket 1 (1-2 years): Cash/short-term bonds for stability
- Bucket 2 (3-7 years): Bonds for income
- Bucket 3 (8+ years): Stocks for growth`,
    dataSources: [
      'Your retirement accounts',
      'Social Security estimates',
      'Pension information',
      'Other income sources'
    ],
    limitations: [
      'Assumes income sources are accurately reported',
      'Tax rules change—current projections may not hold',
      'Doesn\'t account for healthcare costs (Medicare, ACA)',
      'Longevity risk if you outlive projections'
    ]
  }
};

export function ToolExplainer({ toolName, shortDescription, className = '' }: ToolExplainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const explanation = TOOL_EXPLANATIONS[toolName];

  if (!explanation) {
    return null;
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-purple-400 transition-colors ${className}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{shortDescription || 'How does this work?'}</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 px-6 py-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{explanation.title}</h2>
                    <p className="text-xs text-purple-300">Powered by Maven Oracle</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6 space-y-6">
              {/* Summary */}
              <div>
                <p className="text-slate-300 leading-relaxed">{explanation.summary}</p>
              </div>
              
              {/* Methodology */}
              <div>
                <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-3">How It Works</h3>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line prose prose-invert prose-sm max-w-none">
                    {explanation.methodology.split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
                    )}
                  </div>
                </div>
              </div>
              
              {/* Data Sources */}
              <div>
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">Data Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {explanation.dataSources.map((source, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-xs border border-emerald-500/20">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Limitations */}
              <div>
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Limitations & Caveats</h3>
                <ul className="space-y-2">
                  {explanation.limitations.map((limitation, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-amber-500 mt-0.5">⚠️</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Learn More */}
              {explanation.learnMore && (
                <div className="pt-4 border-t border-slate-700">
                  <a 
                    href={explanation.learnMore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <span>Learn more about this methodology</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                This tool is for educational purposes. Consult a qualified financial advisor for personalized advice.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ToolExplainer;
