'use client';

import { useState, useRef, useEffect } from 'react';

interface InfoTooltipProps {
  term: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Financial terms glossary
const GLOSSARY: Record<string, { title: string; explanation: string; example?: string }> = {
  // Portfolio metrics
  'sharpe-ratio': {
    title: 'Sharpe Ratio',
    explanation: 'Measures risk-adjusted returns. Higher is better — it shows how much extra return you get for each unit of risk taken.',
    example: 'A Sharpe of 1.0+ is good, 2.0+ is excellent.'
  },
  'sortino-ratio': {
    title: 'Sortino Ratio',
    explanation: 'Like Sharpe but only penalizes downside volatility. Better for investors who care more about losses than general swings.',
    example: 'A Sortino of 2.0+ indicates strong downside protection.'
  },
  'max-drawdown': {
    title: 'Maximum Drawdown',
    explanation: 'The largest peak-to-trough decline in your portfolio\'s history. Shows the worst-case scenario you would have experienced.',
    example: 'A -30% max drawdown means at worst, you\'d have lost 30%.'
  },
  'beta': {
    title: 'Beta',
    explanation: 'How much your portfolio moves relative to the market. Beta of 1 = moves with market. >1 = more volatile, <1 = less volatile.',
    example: 'Beta 1.2 means if market drops 10%, expect ~12% drop.'
  },
  'alpha': {
    title: 'Alpha',
    explanation: 'Your excess return above what the market delivered, adjusted for risk. Positive alpha means you\'re beating expectations.',
    example: 'Alpha of 2% = beating benchmark by 2% annually.'
  },
  'volatility': {
    title: 'Volatility',
    explanation: 'How much your portfolio value swings up and down. Measured as standard deviation of returns.',
    example: '15% volatility means returns typically range ±15% from average.'
  },
  'correlation': {
    title: 'Correlation',
    explanation: 'How assets move together. +1 = move identically, 0 = no relationship, -1 = move opposite. Lower correlation = better diversification.',
    example: 'Stocks and bonds often have low or negative correlation.'
  },
  
  // Allocation concepts
  'rebalancing': {
    title: 'Rebalancing',
    explanation: 'Periodically selling winners and buying losers to return to your target allocation. Enforces "buy low, sell high" discipline.',
    example: 'If stocks grew from 60% to 70%, sell some to get back to 60%.'
  },
  'asset-allocation': {
    title: 'Asset Allocation',
    explanation: 'How you divide investments across different asset classes (stocks, bonds, cash, etc). The #1 driver of long-term returns.',
    example: '60/40 portfolio = 60% stocks, 40% bonds.'
  },
  'diversification': {
    title: 'Diversification',
    explanation: 'Spreading investments across different assets to reduce risk. "Don\'t put all your eggs in one basket."',
    example: 'Owning US + international + bonds reduces single-market risk.'
  },
  'concentration-risk': {
    title: 'Concentration Risk',
    explanation: 'The danger of having too much in one position. If that investment drops, your entire portfolio suffers.',
    example: 'Having 40% in one stock is high concentration risk.'
  },
  
  // Tax concepts
  'tax-loss-harvesting': {
    title: 'Tax-Loss Harvesting',
    explanation: 'Selling investments at a loss to offset capital gains, reducing your tax bill. The losses "harvest" tax savings.',
    example: 'A $10K loss can offset $10K in gains, saving ~$2-3K in taxes.'
  },
  'wash-sale': {
    title: 'Wash Sale Rule',
    explanation: 'IRS rule: If you sell for a loss and buy back within 30 days, you can\'t claim the tax loss. Must wait 31+ days.',
    example: 'Sell VTI at loss → wait 31 days → buy back (or buy ITOT immediately).'
  },
  'cost-basis': {
    title: 'Cost Basis',
    explanation: 'What you originally paid for an investment. Your profit/loss is calculated from this number.',
    example: 'Bought at $100, now worth $150 = $50 gain per share.'
  },
  'unrealized-gains': {
    title: 'Unrealized Gains',
    explanation: 'Profits that exist on paper but haven\'t been "realized" by selling. You don\'t owe taxes until you sell.',
    example: '$10K unrealized gain = no taxes yet. Sell = taxes due.'
  },
  'capital-gains': {
    title: 'Capital Gains',
    explanation: 'Profit from selling investments. Long-term (held 1+ year) taxed lower than short-term (held <1 year).',
    example: 'Long-term: 0-20% tax. Short-term: up to 37% (as income).'
  },
  
  // Retirement concepts
  'roth-conversion': {
    title: 'Roth Conversion',
    explanation: 'Moving money from Traditional IRA/401k to Roth. You pay taxes now but future growth is tax-free.',
    example: 'Convert $50K in low-income year, pay ~$6K tax, never pay on gains.'
  },
  'rmd': {
    title: 'Required Minimum Distribution',
    explanation: 'After age 73, the IRS requires you to withdraw a minimum amount from tax-deferred accounts annually.',
    example: 'At 75 with $1M IRA, RMD might be ~$43K/year.'
  },
  'tax-deferred': {
    title: 'Tax-Deferred',
    explanation: 'Investments where you don\'t pay taxes on growth until withdrawal (Traditional IRA, 401k).',
    example: '$100K grows to $200K tax-free, taxed when withdrawn.'
  },
  
  // Risk metrics
  'var': {
    title: 'Value at Risk (VaR)',
    explanation: 'The maximum expected loss over a period at a given confidence level. "How bad could it get?"',
    example: '95% VaR of $50K = 5% chance of losing $50K+ in the period.'
  },
  'sequence-risk': {
    title: 'Sequence of Returns Risk',
    explanation: 'The risk that poor returns early in retirement devastate your portfolio, even if average returns are fine.',
    example: 'A -30% year right after retiring is worse than one 10 years in.'
  },
  'duration': {
    title: 'Duration',
    explanation: 'How sensitive a bond is to interest rate changes. Higher duration = more price swings when rates move.',
    example: 'Duration 7 = ~7% price drop if rates rise 1%.'
  },
  
  // Income/Withdrawal
  'safe-withdrawal-rate': {
    title: 'Safe Withdrawal Rate',
    explanation: 'The percentage you can withdraw annually without running out of money. The "4% rule" is a common guideline.',
    example: '$1M portfolio × 4% = $40K/year sustainable withdrawal.'
  },
  'bucket-strategy': {
    title: 'Bucket Strategy',
    explanation: 'Dividing retirement savings into time-based buckets: cash for near-term, bonds for medium-term, stocks for long-term.',
    example: 'Bucket 1: 2 years cash. Bucket 2: 3-7 years bonds. Bucket 3: 8+ years stocks.'
  },
  
  // Maven-specific / Gamification
  'wealth-velocity': {
    title: 'Wealth Velocity',
    explanation: 'Maven\'s composite score measuring how fast you\'re building wealth. Combines savings rate, investment returns, debt paydown, and tax savings.',
    example: 'Score of 100+ means you\'re on track for excellent wealth building.'
  },
  'fi-countdown': {
    title: 'FI Countdown',
    explanation: 'Financial Independence countdown — estimated years until your investments can cover your expenses (typically at 4% withdrawal rate).',
    example: '25x annual expenses = FI number. If you spend $60K/year, FI = $1.5M.'
  },
  'tax-alpha': {
    title: 'Tax Alpha',
    explanation: 'Extra returns generated through tax-smart strategies: loss harvesting, asset location, Roth conversions, etc. Real money saved that compounds.',
    example: 'Harvesting $10K loss = ~$2-3K tax savings = tax alpha.'
  },
  'fire-number': {
    title: 'FIRE Number',
    explanation: 'Financial Independence, Retire Early — the portfolio size where investment returns cover your living expenses indefinitely.',
    example: '25x annual spending. Spend $80K/year? FIRE number = $2M.'
  },
  'expense-ratio': {
    title: 'Expense Ratio',
    explanation: 'Annual fee charged by funds, expressed as a percentage. Lower is better — fees compound against you over time.',
    example: '0.03% (VTI) vs 1.0% (active fund) = ~$970 savings per $100K over 10 years.'
  },
  'market-cap': {
    title: 'Market Capitalization',
    explanation: 'The total value of a company\'s shares. Calculated as share price × total shares outstanding. Used to categorize companies by size.',
    example: 'Large-cap: >$10B (Apple, Microsoft). Mid-cap: $2-10B. Small-cap: <$2B.'
  },
  'pe-ratio': {
    title: 'P/E Ratio (Price-to-Earnings)',
    explanation: 'How much investors pay for each dollar of earnings. Higher P/E = higher expectations for growth. Compare within same industry.',
    example: 'P/E of 20 means you pay $20 for $1 of annual earnings. S&P 500 average: ~20-25.'
  },
  'dividend-yield': {
    title: 'Dividend Yield',
    explanation: 'Annual dividend income as a percentage of stock price. Higher yield = more income, but extremely high yields can signal trouble.',
    example: '4% yield on $100 stock = $4/year in dividends. S&P 500 average: ~1.5%.'
  },
  'tracking-error': {
    title: 'Tracking Error',
    explanation: 'How closely a fund follows its benchmark index. Lower tracking error = more predictable index-like returns.',
    example: 'Tracking error of 0.1% means returns stay very close to the index.'
  },
  
  // Factor exposures
  'factor-exposure': {
    title: 'Factor Exposure',
    explanation: 'How much your portfolio tilts toward specific investment factors that historically drive returns. Think of factors as "ingredients" that explain why investments perform differently.',
    example: 'High value exposure = your portfolio leans toward cheaper stocks relative to their fundamentals.'
  },
  'market-beta': {
    title: 'Market Beta',
    explanation: 'Your portfolio\'s sensitivity to overall market movements. Beta of 1.0 = moves with market. Higher = more volatile, lower = more defensive.',
    example: 'Beta 1.2 means if market drops 10%, expect ~12% drop. Beta 0.8 = ~8% drop.'
  },
  'size-factor': {
    title: 'Size Factor (SMB)',
    explanation: '"Small Minus Big" — exposure to smaller companies. Historically, small caps have higher returns but more risk. Positive = tilted toward small caps.',
    example: 'Positive size exposure = more small-cap stocks than the market average.'
  },
  'value-factor': {
    title: 'Value Factor (HML)',
    explanation: '"High Minus Low" — exposure to value stocks (cheap relative to fundamentals). Positive = value tilt, negative = growth tilt.',
    example: 'Positive value = more "cheap" stocks like banks. Negative = more "expensive" growth like tech.'
  },
  'momentum-factor': {
    title: 'Momentum Factor',
    explanation: 'Exposure to stocks with strong recent performance. Momentum investors believe recent winners tend to keep winning short-term.',
    example: 'High momentum exposure = holding stocks that have outperformed recently.'
  },
  'quality-factor': {
    title: 'Quality Factor',
    explanation: 'Exposure to financially healthy companies with strong profitability, low debt, and stable earnings. Quality stocks tend to be more resilient.',
    example: 'High quality = companies like Microsoft with steady profits and strong balance sheets.'
  },
};

export default function InfoTooltip({ term, children, position = 'top' }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const glossaryEntry = GLOSSARY[term];
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
  // Position the tooltip
  useEffect(() => {
    if (isOpen && triggerRef.current && tooltipRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      
      let style: React.CSSProperties = {};
      
      // Calculate position based on available space
      if (position === 'top' && trigger.top > tooltip.height + 10) {
        style = { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' };
      } else if (position === 'bottom' || trigger.top <= tooltip.height + 10) {
        style = { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' };
      } else if (position === 'left') {
        style = { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' };
      } else if (position === 'right') {
        style = { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' };
      }
      
      setTooltipStyle(style);
    }
  }, [isOpen, position]);
  
  if (!glossaryEntry) {
    // If term not in glossary, render children with custom tooltip content
    return (
      <span className="relative inline-flex items-center gap-1">
        {children}
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition text-[10px] font-bold"
          aria-label="More information"
        >
          i
        </button>
        {isOpen && (
          <div 
            ref={tooltipRef}
            style={tooltipStyle}
            className="absolute z-50 w-72 p-4 bg-[#1a1a24] border border-white/20 rounded-xl shadow-xl"
          >
            <p className="text-sm text-gray-300">No definition available for this term.</p>
          </div>
        )}
      </span>
    );
  }
  
  return (
    <span className="relative inline-flex items-center gap-1">
      {children}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 hover:text-indigo-300 transition text-[10px] font-bold cursor-help"
        aria-label={`Learn about ${glossaryEntry.title}`}
      >
        i
      </button>
      
      {isOpen && (
        <div 
          ref={tooltipRef}
          style={tooltipStyle}
          className="absolute z-50 w-80 p-4 bg-[#1a1a24] border border-indigo-500/30 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-white text-sm">{glossaryEntry.title}</h4>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-300 mb-2">{glossaryEntry.explanation}</p>
          {glossaryEntry.example && (
            <p className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
              💡 {glossaryEntry.example}
            </p>
          )}
        </div>
      )}
    </span>
  );
}

// Inline usage helper - wraps text with tooltip
export function Term({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <InfoTooltip term={id}>
      <span className="border-b border-dotted border-indigo-500/50 cursor-help">{children}</span>
    </InfoTooltip>
  );
}
