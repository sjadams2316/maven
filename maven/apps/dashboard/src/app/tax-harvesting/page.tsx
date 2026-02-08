"use client";

import { useState, useMemo } from "react";
import { useUserProfile } from "@/providers/UserProvider";
import Header from "@/app/components/Header";
import DemoBanner from "@/app/components/DemoBanner";
import { ToolExplainer } from "@/app/components/ToolExplainer";
import { OracleShowcase } from "@/app/components/OracleShowcase";

// Tax-efficient swap suggestions (similar ETFs that avoid wash sale)
const SWAP_SUGGESTIONS: Record<string, { ticker: string; name: string; reason: string }[]> = {
  // S&P 500 alternatives
  VOO: [{ ticker: "IVV", name: "iShares Core S&P 500", reason: "Same index, different provider" }],
  SPY: [{ ticker: "VOO", name: "Vanguard S&P 500", reason: "Same index, lower expense ratio" }],
  IVV: [{ ticker: "VOO", name: "Vanguard S&P 500", reason: "Same index, different provider" }],
  
  // Total market alternatives
  VTI: [{ ticker: "ITOT", name: "iShares Core Total US", reason: "Similar exposure, different provider" }],
  ITOT: [{ ticker: "VTI", name: "Vanguard Total Stock", reason: "Similar exposure, different provider" }],
  SWTSX: [{ ticker: "VTI", name: "Vanguard Total Stock", reason: "Similar exposure, ETF form" }],
  
  // Growth alternatives
  VUG: [{ ticker: "IWF", name: "iShares Russell 1000 Growth", reason: "Similar growth exposure" }],
  QQQ: [{ ticker: "VGT", name: "Vanguard Info Tech", reason: "Tech-heavy alternative" }],
  ARKK: [{ ticker: "VGT", name: "Vanguard Info Tech", reason: "Innovation/tech exposure, lower risk" }],
  
  // International alternatives
  VXUS: [{ ticker: "IXUS", name: "iShares Core Intl", reason: "Similar exposure, different provider" }],
  VEA: [{ ticker: "IEFA", name: "iShares Developed Markets", reason: "Similar exposure" }],
  VWO: [{ ticker: "IEMG", name: "iShares Emerging Markets", reason: "Similar exposure" }],
  
  // Bond alternatives
  BND: [{ ticker: "AGG", name: "iShares Core Bond", reason: "Similar bond exposure" }],
  AGG: [{ ticker: "BND", name: "Vanguard Total Bond", reason: "Similar bond exposure" }],
  
  // Dividend alternatives
  VYM: [{ ticker: "SCHD", name: "Schwab US Dividend", reason: "Similar dividend focus" }],
  SCHD: [{ ticker: "VYM", name: "Vanguard High Dividend", reason: "Similar dividend focus" }],
  
  // Sector alternatives
  VGT: [{ ticker: "XLK", name: "Tech Select SPDR", reason: "Tech sector alternative" }],
  SMH: [{ ticker: "SOXX", name: "iShares Semiconductor", reason: "Semiconductor alternative" }],
  SOXX: [{ ticker: "SMH", name: "VanEck Semiconductor", reason: "Semiconductor alternative" }],
  
  // Individual stocks - suggest sector ETFs
  AAPL: [{ ticker: "VGT", name: "Vanguard Info Tech", reason: "Diversified tech exposure" }],
  MSFT: [{ ticker: "VGT", name: "Vanguard Info Tech", reason: "Diversified tech exposure" }],
  GOOGL: [{ ticker: "VOX", name: "Vanguard Communication", reason: "Communication sector" }],
  AMZN: [{ ticker: "VCR", name: "Vanguard Consumer Disc", reason: "Consumer discretionary sector" }],
  NVDA: [{ ticker: "SMH", name: "VanEck Semiconductor", reason: "Semiconductor exposure" }],
  TSLA: [{ ticker: "VCR", name: "Vanguard Consumer Disc", reason: "Consumer discretionary sector" }],
  META: [{ ticker: "VOX", name: "Vanguard Communication", reason: "Communication sector" }],
  
  // Crypto miners - suggest each other or crypto ETFs
  CIFR: [{ ticker: "IREN", name: "Iris Energy", reason: "Alternative crypto miner" }],
  IREN: [{ ticker: "CIFR", name: "Cipher Mining", reason: "Alternative crypto miner" }],
};

interface HarvestOpportunity {
  ticker: string;
  name: string;
  shares: number;
  costBasis: number;
  currentValue: number;
  unrealizedLoss: number;
  lossPercent: number;
  accountType: string;
  accountName: string;
  taxSavings: {
    shortTerm: number;
    longTerm: number;
  };
  swapSuggestions: { ticker: string; name: string; reason: string }[];
  acquisitionDate?: string;
  holdingPeriod: "short" | "long" | "unknown";
  washSaleRisk: boolean;
}

interface WashSaleWarning {
  ticker: string;
  reason: string;
  accounts: string[];
}

export default function TaxHarvestingPage() {
  const { profile: userProfile, isDemoMode } = useUserProfile();
  const [selectedOpportunities, setSelectedOpportunities] = useState<Set<string>>(new Set());
  const [taxBracket, setTaxBracket] = useState(32); // Default to 32% federal
  const [stateTaxRate, setStateTaxRate] = useState(5); // Default 5% state
  const [showWashSaleInfo, setShowWashSaleInfo] = useState(false);
  
  // Calculate marginal tax rates
  const shortTermRate = (taxBracket + stateTaxRate) / 100;
  const longTermRate = (15 + stateTaxRate) / 100; // Assume 15% LTCG for most users
  
  // Analyze all holdings for harvest opportunities
  const { opportunities, washSaleWarnings, summary } = useMemo(() => {
    if (!userProfile) {
      return { opportunities: [], washSaleWarnings: [], summary: null };
    }
    
    const allOpportunities: HarvestOpportunity[] = [];
    const tickerAccounts: Record<string, string[]> = {};
    
    // Scan retirement accounts
    userProfile.retirementAccounts?.forEach(account => {
      account.holdings?.forEach(holding => {
        const currentValue = holding.currentValue || holding.shares * (holding.currentPrice || 0);
        const costBasis = holding.costBasis || 0;
        
        // Track which accounts hold each ticker (for wash sale detection)
        if (!tickerAccounts[holding.ticker]) {
          tickerAccounts[holding.ticker] = [];
        }
        tickerAccounts[holding.ticker].push(account.name);
        
        // Only interested in losses
        if (currentValue < costBasis && costBasis > 0) {
          const unrealizedLoss = costBasis - currentValue;
          const lossPercent = (unrealizedLoss / costBasis) * 100;
          
          // Determine holding period
          let holdingPeriod: "short" | "long" | "unknown" = "unknown";
          if (holding.acquisitionDate) {
            const acquired = new Date(holding.acquisitionDate);
            const now = new Date();
            const daysHeld = (now.getTime() - acquired.getTime()) / (1000 * 60 * 60 * 24);
            holdingPeriod = daysHeld > 365 ? "long" : "short";
          }
          
          // Note: Harvesting in retirement accounts doesn't provide tax benefit
          // but we'll show them anyway with a note
          allOpportunities.push({
            ticker: holding.ticker,
            name: holding.name || holding.ticker,
            shares: holding.shares,
            costBasis,
            currentValue,
            unrealizedLoss,
            lossPercent,
            accountType: account.type || "Retirement",
            accountName: account.name,
            taxSavings: {
              shortTerm: 0, // No tax benefit in retirement accounts
              longTerm: 0,
            },
            swapSuggestions: SWAP_SUGGESTIONS[holding.ticker] || [],
            acquisitionDate: holding.acquisitionDate,
            holdingPeriod,
            washSaleRisk: false,
          });
        }
      });
    });
    
    // Scan investment (taxable) accounts - these provide actual tax benefit
    userProfile.investmentAccounts?.forEach(account => {
      // Skip crypto accounts for now (different tax rules)
      if (account.name.toLowerCase().includes("crypto")) return;
      
      account.holdings?.forEach(holding => {
        const currentValue = holding.currentValue || holding.shares * (holding.currentPrice || 0);
        const costBasis = holding.costBasis || 0;
        
        // Track which accounts hold each ticker
        if (!tickerAccounts[holding.ticker]) {
          tickerAccounts[holding.ticker] = [];
        }
        tickerAccounts[holding.ticker].push(account.name);
        
        // Only interested in losses
        if (currentValue < costBasis && costBasis > 0) {
          const unrealizedLoss = costBasis - currentValue;
          const lossPercent = (unrealizedLoss / costBasis) * 100;
          
          // Determine holding period
          let holdingPeriod: "short" | "long" | "unknown" = "unknown";
          if (holding.acquisitionDate) {
            const acquired = new Date(holding.acquisitionDate);
            const now = new Date();
            const daysHeld = (now.getTime() - acquired.getTime()) / (1000 * 60 * 60 * 24);
            holdingPeriod = daysHeld > 365 ? "long" : "short";
          }
          
          // Calculate actual tax savings for taxable accounts
          const shortTermSavings = unrealizedLoss * shortTermRate;
          const longTermSavings = unrealizedLoss * longTermRate;
          
          allOpportunities.push({
            ticker: holding.ticker,
            name: holding.name || holding.ticker,
            shares: holding.shares,
            costBasis,
            currentValue,
            unrealizedLoss,
            lossPercent,
            accountType: account.type || "Taxable",
            accountName: account.name,
            taxSavings: {
              shortTerm: shortTermSavings,
              longTerm: longTermSavings,
            },
            swapSuggestions: SWAP_SUGGESTIONS[holding.ticker] || [],
            acquisitionDate: holding.acquisitionDate,
            holdingPeriod,
            washSaleRisk: tickerAccounts[holding.ticker]?.length > 1,
          });
        }
      });
    });
    
    // Sort by unrealized loss (biggest opportunities first)
    allOpportunities.sort((a, b) => b.unrealizedLoss - a.unrealizedLoss);
    
    // Detect wash sale risks (same security in multiple accounts)
    const washWarnings: WashSaleWarning[] = [];
    Object.entries(tickerAccounts).forEach(([ticker, accounts]) => {
      if (accounts.length > 1) {
        const hasLoss = allOpportunities.some(o => o.ticker === ticker);
        if (hasLoss) {
          washWarnings.push({
            ticker,
            reason: `Held in ${accounts.length} accounts`,
            accounts,
          });
        }
      }
    });
    
    // Calculate summary
    const taxableOpportunities = allOpportunities.filter(o => 
      !["401(k)", "Traditional IRA", "Roth IRA", "HSA", "Roth 401(k)"].includes(o.accountType)
    );
    
    const totalLoss = taxableOpportunities.reduce((sum, o) => sum + o.unrealizedLoss, 0);
    const totalShortTermSavings = taxableOpportunities.reduce((sum, o) => 
      o.holdingPeriod === "short" ? sum + o.taxSavings.shortTerm : sum, 0
    );
    const totalLongTermSavings = taxableOpportunities.reduce((sum, o) => 
      o.holdingPeriod === "long" ? sum + o.taxSavings.longTerm : sum + o.taxSavings.longTerm, 0
    );
    
    // IRS limits: $3,000 net capital loss deduction against ordinary income
    const capitalLossLimit = 3000;
    const excessLoss = Math.max(0, totalLoss - capitalLossLimit);
    
    return {
      opportunities: allOpportunities,
      washSaleWarnings: washWarnings,
      summary: {
        totalOpportunities: taxableOpportunities.length,
        totalUnrealizedLoss: totalLoss,
        estimatedTaxSavings: Math.min(totalLoss * shortTermRate, capitalLossLimit * shortTermRate) + 
          (excessLoss > 0 ? excessLoss * longTermRate : 0),
        capitalLossLimit,
        excessLoss,
        carryforwardNote: excessLoss > 0 ? 
          `${formatCurrency(excessLoss)} can be carried forward to future years` : null,
      },
    };
  }, [userProfile, shortTermRate, longTermRate]);

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedOpportunities);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedOpportunities(newSelection);
  };

  const selectAll = () => {
    const taxableOps = opportunities.filter(o => 
      !["401(k)", "Traditional IRA", "Roth IRA", "HSA", "Roth 401(k)"].includes(o.accountType)
    );
    setSelectedOpportunities(new Set(taxableOps.map(o => `${o.ticker}-${o.accountName}`)));
  };

  const clearSelection = () => {
    setSelectedOpportunities(new Set());
  };

  // Calculate selected totals
  const selectedTotals = useMemo(() => {
    let totalLoss = 0;
    let totalSavings = 0;
    
    opportunities.forEach(o => {
      if (selectedOpportunities.has(`${o.ticker}-${o.accountName}`)) {
        totalLoss += o.unrealizedLoss;
        totalSavings += o.holdingPeriod === "short" ? o.taxSavings.shortTerm : o.taxSavings.longTerm;
      }
    });
    
    return { totalLoss, totalSavings };
  }, [opportunities, selectedOpportunities]);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Tax-Loss Harvesting</h1>
          <p className="text-gray-400 mb-8">Complete onboarding to scan your portfolio for tax savings.</p>
          <a href="/onboarding" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
            Get Started
          </a>
        </div>
      </div>
    );
  }

  const taxableOpportunities = opportunities.filter(o => 
    !["401(k)", "Traditional IRA", "Roth IRA", "HSA", "Roth 401(k)"].includes(o.accountType)
  );
  
  const retirementOpportunities = opportunities.filter(o => 
    ["401(k)", "Traditional IRA", "Roth IRA", "HSA", "Roth 401(k)"].includes(o.accountType)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
      <Header />
      <DemoBanner />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🌾 Tax-Loss Harvesting
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-400">
              Turn market losses into tax savings. Harvest losses strategically while maintaining your investment exposure.
            </p>
            <ToolExplainer toolName="tax-harvesting" />
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Harvestable Losses</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(summary.totalUnrealizedLoss)}</p>
              <p className="text-xs text-gray-500">{summary.totalOpportunities} positions in taxable accounts</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Estimated Tax Savings</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(summary.estimatedTaxSavings)}</p>
              <p className="text-xs text-gray-500">At {taxBracket}% federal + {stateTaxRate}% state</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Capital Loss Limit</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.capitalLossLimit)}</p>
              <p className="text-xs text-gray-500">Annual deduction vs ordinary income</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Carryforward</p>
              <p className="text-2xl font-bold text-amber-400">
                {summary.excessLoss > 0 ? formatCurrency(summary.excessLoss) : "$0"}
              </p>
              <p className="text-xs text-gray-500">Excess loss to future years</p>
            </div>
          </div>
        )}

        {/* Oracle Explain Button */}
        {summary && summary.totalOpportunities > 0 && (
          <div className="mb-6">
            <OracleShowcase
              trigger={<span>Have Maven Oracle Walk Me Through This</span>}
              data={{
                type: 'tax_harvest',
                title: 'Tax-Loss Harvesting Analysis',
                metrics: [
                  { label: 'Harvestable Losses', current: summary.totalUnrealizedLoss, good: true },
                  { label: 'Estimated Tax Savings', current: summary.estimatedTaxSavings, good: true },
                  { label: 'Opportunities Found', current: summary.totalOpportunities },
                  { label: 'Federal Rate', current: `${taxBracket}%` },
                  { label: 'State Rate', current: `${stateTaxRate}%` },
                  { label: 'Capital Loss Limit', current: 3000 },
                ],
                actionItems: opportunities.slice(0, 5).map(opp => ({
                  priority: opp.unrealizedLoss > 5000 ? 'high' as const : opp.unrealizedLoss > 1000 ? 'medium' as const : 'low' as const,
                  action: `Harvest ${opp.ticker} (${formatCurrency(opp.unrealizedLoss)} loss)`,
                  impact: `Save ~${formatCurrency(Math.abs(opp.unrealizedLoss) * (taxBracket / 100 + stateTaxRate / 100))} in taxes`
                })),
                insights: [
                  'Tax-loss harvesting lets you turn paper losses into real tax savings',
                  'Losses offset gains dollar-for-dollar',
                  'Up to $3,000 of net losses can offset ordinary income each year',
                  'Excess losses carry forward indefinitely'
                ]
              }}
              onAnalyze={async () => {
                const topOpps = opportunities.slice(0, 5);
                const response = await fetch('/api/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    message: `Walk me through my tax-loss harvesting opportunities like I'm new to this. I have ${summary.totalOpportunities} positions with total harvestable losses of ${formatCurrency(summary.totalUnrealizedLoss)}. Estimated tax savings: ${formatCurrency(summary.estimatedTaxSavings)} at my ${taxBracket}% federal + ${stateTaxRate}% state rate. Top opportunities: ${topOpps.map(o => `${o.symbol} with ${formatCurrency(o.unrealizedLoss)} loss`).join(', ')}. Explain: 1) What is tax-loss harvesting and why it matters 2) How much I could actually save 3) What I need to watch out for (wash sales) 4) Step-by-step what to do. Keep it simple and actionable.`
                  })
                });
                const data = await response.json();
                return data.response || 'Unable to generate analysis.';
              }}
              className="w-full justify-center"
            />
          </div>
        )}

        {/* Tax Rate Settings */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm text-gray-400 mr-2">Federal Tax Bracket:</label>
              <select
                value={taxBracket}
                onChange={(e) => setTaxBracket(parseInt(e.target.value))}
                className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white"
              >
                <option value={10}>10%</option>
                <option value={12}>12%</option>
                <option value={22}>22%</option>
                <option value={24}>24%</option>
                <option value={32}>32%</option>
                <option value={35}>35%</option>
                <option value={37}>37%</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mr-2">State Tax Rate:</label>
              <input
                type="number"
                value={stateTaxRate}
                onChange={(e) => setStateTaxRate(parseFloat(e.target.value) || 0)}
                className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white w-20"
                min="0"
                max="15"
                step="0.1"
              />
              <span className="text-gray-400 ml-1">%</span>
            </div>
            
            <div className="text-sm text-gray-500 ml-auto">
              Short-term rate: {(shortTermRate * 100).toFixed(1)}% | Long-term rate: {(longTermRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Wash Sale Warning */}
        {washSaleWarnings.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-amber-400 font-semibold">Wash Sale Risk Detected</p>
                  <button 
                    onClick={() => setShowWashSaleInfo(!showWashSaleInfo)}
                    className="text-xs text-amber-500 hover:text-amber-400 underline"
                  >
                    {showWashSaleInfo ? "Hide info" : "What's this?"}
                  </button>
                </div>
                
                {showWashSaleInfo && (
                  <div className="mt-2 p-3 bg-gray-900/50 rounded-lg text-sm text-gray-300">
                    <p className="mb-2">
                      <strong>Wash Sale Rule:</strong> If you sell a security at a loss and buy a "substantially identical" 
                      security within 30 days (before or after), the IRS disallows the loss deduction.
                    </p>
                    <p>
                      Since you hold these securities in multiple accounts, be careful not to buy in one account 
                      while selling in another within the 30-day window.
                    </p>
                  </div>
                )}
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {washSaleWarnings.map(w => (
                    <span 
                      key={w.ticker}
                      className="px-2 py-1 bg-amber-500/20 text-amber-300 text-sm rounded"
                      title={`Held in: ${w.accounts.join(", ")}`}
                    >
                      {w.ticker}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selection Controls */}
        {taxableOpportunities.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={selectAll}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                Clear
              </button>
              {selectedOpportunities.size > 0 && (
                <span className="text-sm text-gray-400">
                  {selectedOpportunities.size} selected: {formatCurrency(selectedTotals.totalLoss)} loss → {formatCurrency(selectedTotals.totalSavings)} savings
                </span>
              )}
            </div>
            
            {selectedOpportunities.size > 0 && (
              <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition">
                Generate Harvest Report →
              </button>
            )}
          </div>
        )}

        {/* Taxable Account Opportunities */}
        <div className="bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            💰 Taxable Account Opportunities
          </h2>
          
          {taxableOpportunities.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-4">✨</p>
              <p>No harvestable losses in taxable accounts.</p>
              <p className="text-sm mt-2">Your positions are in the green — that's a good problem!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {taxableOpportunities.map((opp, idx) => (
                <div 
                  key={`${opp.ticker}-${opp.accountName}-${idx}`}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedOpportunities.has(`${opp.ticker}-${opp.accountName}`)
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => toggleSelection(`${opp.ticker}-${opp.accountName}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedOpportunities.has(`${opp.ticker}-${opp.accountName}`)}
                        onChange={() => toggleSelection(`${opp.ticker}-${opp.accountName}`)}
                        className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
                      />
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg text-indigo-400">{opp.ticker}</span>
                          <span className="text-sm text-gray-400">{opp.name}</span>
                          {opp.washSaleRisk && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                              Wash Sale Risk
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            opp.holdingPeriod === "long" 
                              ? "bg-purple-500/20 text-purple-400" 
                              : opp.holdingPeriod === "short"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-gray-500/20 text-gray-400"
                          }`}>
                            {opp.holdingPeriod === "long" ? "Long-term" : opp.holdingPeriod === "short" ? "Short-term" : "Unknown"}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-1">
                          {opp.shares.toLocaleString()} shares in {opp.accountName}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-400">
                            Cost: {formatCurrency(opp.costBasis)}
                          </span>
                          <span className="text-gray-400">
                            Value: {formatCurrency(opp.currentValue)}
                          </span>
                          <span className="text-red-400 font-semibold">
                            Loss: {formatCurrency(opp.unrealizedLoss)} ({opp.lossPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Tax Savings</p>
                      <p className="text-xl font-bold text-green-400">
                        {formatCurrency(opp.holdingPeriod === "short" ? opp.taxSavings.shortTerm : opp.taxSavings.longTerm)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Swap Suggestions */}
                  {opp.swapSuggestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">💡 Tax-efficient swap to maintain exposure:</p>
                      <div className="flex flex-wrap gap-2">
                        {opp.swapSuggestions.map(swap => (
                          <div 
                            key={swap.ticker}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg"
                          >
                            <span className="font-mono text-green-400">{swap.ticker}</span>
                            <span className="text-gray-400 text-sm">→</span>
                            <span className="text-gray-300 text-sm">{swap.name}</span>
                            <span className="text-gray-500 text-xs">({swap.reason})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Retirement Account Notice */}
        {retirementOpportunities.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-2">
              🏦 Retirement Account Positions (No Tax Benefit)
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              These positions have losses, but harvesting in retirement accounts doesn't provide tax benefits. 
              Consider rebalancing only if you want to change your allocation.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-2">Ticker</th>
                    <th className="pb-2">Account</th>
                    <th className="pb-2 text-right">Loss</th>
                    <th className="pb-2 text-right">Loss %</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {retirementOpportunities.slice(0, 5).map((opp, idx) => (
                    <tr key={idx} className="border-b border-gray-800">
                      <td className="py-2 font-mono text-indigo-400">{opp.ticker}</td>
                      <td className="py-2 text-gray-400">{opp.accountName}</td>
                      <td className="py-2 text-right text-red-400">{formatCurrency(opp.unrealizedLoss)}</td>
                      <td className="py-2 text-right text-red-400">{opp.lossPercent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {retirementOpportunities.length > 5 && (
                <p className="text-sm text-gray-500 mt-2">
                  + {retirementOpportunities.length - 5} more positions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Educational Section */}
        <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📚 Tax-Loss Harvesting 101</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-indigo-400 mb-2">How It Works</h3>
              <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                <li>Sell a position that has declined in value</li>
                <li>Use the loss to offset capital gains or up to $3,000 of ordinary income</li>
                <li>Buy a similar (but not identical) investment to maintain exposure</li>
                <li>Excess losses carry forward to future years</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-indigo-400 mb-2">Key Rules</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li><strong className="text-white">Wash Sale Rule:</strong> Can't buy substantially identical security 30 days before or after the sale</li>
                <li><strong className="text-white">Short vs Long:</strong> Short-term losses offset short-term gains first, then long-term</li>
                <li><strong className="text-white">$3,000 Limit:</strong> Maximum deduction against ordinary income per year</li>
                <li><strong className="text-white">Carryforward:</strong> Unused losses carry forward indefinitely</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-400">
              <strong className="text-amber-400">⚠️ Important:</strong> This tool is for educational purposes. 
              Tax-loss harvesting involves complex tax rules. Consult with a tax professional before executing 
              any harvesting strategy, especially for large positions or if you have unusual tax situations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
