"use client";

import { useState, useMemo } from "react";
import { useUserProfile } from "@/providers/UserProvider";
import Header from "@/app/components/Header";
import DemoBanner from "@/app/components/DemoBanner";
// Tooltip helper component
function HelpIcon({ tooltip }: { tooltip: string }) {
  return (
    <span 
      className="ml-2 w-5 h-5 inline-flex items-center justify-center rounded-full bg-gray-700 text-gray-400 text-xs cursor-help hover:bg-gray-600 hover:text-white transition"
      title={tooltip}
    >
      ?
    </span>
  );
}

// Fund expense ratio database (common funds)
const EXPENSE_RATIOS: Record<string, number> = {
  // American Funds (typically 0.5-0.7%)
  AGTHX: 0.64, AIVSX: 0.59, ANWFX: 0.75, AMRMX: 0.60, ANCFX: 0.77, ABALX: 0.59, CAIBX: 0.58,
  // Vanguard (low cost)
  VFIAX: 0.04, VTHRX: 0.13, VTI: 0.03, VXUS: 0.07, BND: 0.03, VNQ: 0.12, VGT: 0.10,
  VOO: 0.03, VEA: 0.05, VWO: 0.08,
  // Fidelity
  FZROX: 0.00, FXAIX: 0.015,
  // Others
  QQQ: 0.20, ARKK: 0.75, SMH: 0.35, SOXX: 0.35, SCHD: 0.06,
};

// Low-cost alternatives
const LOW_COST_ALTERNATIVES: Record<string, { ticker: string; name: string; expenseRatio: number }> = {
  AGTHX: { ticker: "VUG", name: "Vanguard Growth ETF", expenseRatio: 0.04 },
  AIVSX: { ticker: "VOO", name: "Vanguard S&P 500 ETF", expenseRatio: 0.03 },
  ANWFX: { ticker: "VXUS", name: "Vanguard Total Intl", expenseRatio: 0.07 },
  AMRMX: { ticker: "VIG", name: "Vanguard Div Appreciation", expenseRatio: 0.06 },
  ANCFX: { ticker: "VGT", name: "Vanguard Info Tech", expenseRatio: 0.10 },
  ABALX: { ticker: "VBINX", name: "Vanguard Balanced Index", expenseRatio: 0.06 },
  CAIBX: { ticker: "VYM", name: "Vanguard High Dividend", expenseRatio: 0.06 },
  ARKK: { ticker: "VGT", name: "Vanguard Info Tech", expenseRatio: 0.10 },
};

type TabId = "match" | "fees" | "allocation" | "old401k" | "rollover";

export default function RetirementOptimizerPage() {
  const { profile: userProfile, isDemoMode } = useUserProfile();
  const [activeTab, setActiveTab] = useState<TabId>("match");
  
  // Old 401(k) tracker state
  const [old401ks, setOld401ks] = useState<Array<{
    id: string;
    employer: string;
    balance: number;
    yearLeft: number;
    recordKeeper: string;
  }>>([]);
  const [newOld401k, setNewOld401k] = useState({
    employer: "",
    balance: "",
    yearLeft: "",
    recordKeeper: ""
  });
  
  // Extract retirement accounts
  const retirementAccounts = userProfile?.retirementAccounts || [];
  const primary401k = retirementAccounts.find(a => a.type === "401(k)");
  const allIRAs = retirementAccounts.filter(a => a.type?.includes("IRA"));
  
  // Calculate totals
  const total401kBalance = primary401k?.balance || 0;
  const totalIRABalance = allIRAs.reduce((sum, a) => sum + (a.balance || 0), 0);
  
  // Get all holdings across all accounts for overall allocation
  const allHoldings = useMemo(() => {
    const holdings: Array<{ ticker: string; value: number; accountType: string }> = [];
    
    retirementAccounts.forEach(account => {
      account.holdings?.forEach(h => {
        holdings.push({
          ticker: h.ticker,
          value: h.currentValue || h.shares * (h.currentPrice || 0),
          accountType: account.type || "Other"
        });
      });
    });
    
    userProfile?.investmentAccounts?.forEach(account => {
      account.holdings?.forEach(h => {
        holdings.push({
          ticker: h.ticker,
          value: h.currentValue || h.shares * (h.currentPrice || 0),
          accountType: "Taxable"
        });
      });
    });
    
    return holdings;
  }, [retirementAccounts, userProfile?.investmentAccounts]);

  // Calculate 401(k) fee metrics
  const feeAnalysis = useMemo(() => {
    if (!primary401k?.holdings) return null;
    
    const holdingsWithFees = primary401k.holdings.map(h => {
      const expenseRatio = EXPENSE_RATIOS[h.ticker] || 0.50; // Default to 0.5% if unknown
      const value = h.currentValue || h.shares * (h.currentPrice || 0);
      const annualFee = value * (expenseRatio / 100);
      const alternative = LOW_COST_ALTERNATIVES[h.ticker];
      
      return {
        ...h,
        value,
        expenseRatio,
        annualFee,
        alternative,
        potentialSavings: alternative ? value * ((expenseRatio - alternative.expenseRatio) / 100) : 0
      };
    });
    
    const totalValue = holdingsWithFees.reduce((sum, h) => sum + h.value, 0);
    const weightedER = holdingsWithFees.reduce((sum, h) => sum + (h.expenseRatio * h.value / totalValue), 0);
    const totalAnnualFees = holdingsWithFees.reduce((sum, h) => sum + h.annualFee, 0);
    const totalPotentialSavings = holdingsWithFees.reduce((sum, h) => sum + h.potentialSavings, 0);
    
    // 30-year fee drag calculation
    const years = 30;
    const avgReturn = 0.07;
    let currentBalance = totalValue;
    let lowCostBalance = totalValue;
    
    for (let i = 0; i < years; i++) {
      currentBalance = currentBalance * (1 + avgReturn - weightedER / 100);
      lowCostBalance = lowCostBalance * (1 + avgReturn - 0.05 / 100); // Assume 0.05% with index funds
    }
    
    const feeDragCost = lowCostBalance - currentBalance;
    
    return {
      holdings: holdingsWithFees,
      totalValue,
      weightedER,
      totalAnnualFees,
      totalPotentialSavings,
      feeDragCost,
      lowCostER: 0.05
    };
  }, [primary401k?.holdings]);

  // Employer match calculator
  const matchAnalysis = useMemo(() => {
    if (!primary401k) return null;
    
    const salary = getSalaryFromIncome(userProfile?.householdIncome);
    const currentContribPercent = primary401k.contributionPercent || 6;
    const employerMatchPercent = primary401k.employerMatchPercent || 3;
    const maxMatchPercent = employerMatchPercent; // Typically employer matches up to X%
    
    const currentContrib = salary * (currentContribPercent / 100);
    const currentMatch = Math.min(currentContribPercent, maxMatchPercent) * salary / 100;
    
    // Calculate optimal contribution to max match
    const optimalContribPercent = maxMatchPercent;
    const maxMatch = maxMatchPercent * salary / 100;
    
    // Money left on table
    const matchLeftOnTable = maxMatch - currentMatch;
    
    // IRS limits for 2026
    const irsLimit = 23500; // 2026 limit
    const catchUpLimit = 7500; // 50+ catch-up
    const age = calculateAge(userProfile?.dateOfBirth);
    const personalLimit = age >= 50 ? irsLimit + catchUpLimit : irsLimit;
    
    // Max contribution analysis
    const maxContrib = Math.min(salary * 0.90, personalLimit); // Can't contribute more than 90% of salary
    const maxContribPercent = (maxContrib / salary) * 100;
    
    // 30-year impact of leaving match on table
    const years = 30;
    const avgReturn = 0.07;
    let lostWealth = 0;
    let matchValue = matchLeftOnTable;
    for (let i = 0; i < years; i++) {
      lostWealth += matchValue * Math.pow(1 + avgReturn, years - i);
    }
    
    return {
      salary,
      currentContribPercent,
      currentContrib,
      employerMatchPercent,
      currentMatch,
      maxMatch,
      matchLeftOnTable,
      lostWealth,
      irsLimit: personalLimit,
      maxContribPercent,
      isMaxingMatch: currentContribPercent >= maxMatchPercent,
      isMaxing401k: currentContrib >= personalLimit
    };
  }, [primary401k, userProfile?.householdIncome, userProfile?.dateOfBirth]);

  // Allocation analysis
  const allocationAnalysis = useMemo(() => {
    if (!primary401k?.holdings || !allHoldings.length) return null;
    
    // Categorize holdings
    const categorize = (ticker: string): string => {
      const usEquity = ["VOO", "VTI", "VFIAX", "FXAIX", "FZROX", "SPY", "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "AGTHX", "AIVSX", "AMRMX", "ANCFX", "QQQ", "VGT", "SMH", "SOXX", "ARKK", "SCHD", "VIG", "VUG", "CIFR", "IREN"];
      const intlEquity = ["VXUS", "VEA", "VWO", "ANWFX", "CAIBX"];
      const bonds = ["BND", "ABALX", "AGG", "VCIT"];
      const realEstate = ["VNQ", "VNQI"];
      const crypto = ["BTC", "ETH", "TAO"];
      
      if (usEquity.includes(ticker)) return "US Equity";
      if (intlEquity.includes(ticker)) return "International";
      if (bonds.includes(ticker)) return "Bonds";
      if (realEstate.includes(ticker)) return "Real Estate";
      if (crypto.includes(ticker)) return "Crypto";
      if (ticker.includes("VTHR")) return "Target Date";
      return "Other";
    };
    
    // 401(k) allocation
    const k401Allocation: Record<string, number> = {};
    let k401Total = 0;
    primary401k.holdings.forEach(h => {
      const category = categorize(h.ticker);
      const value = h.currentValue || h.shares * (h.currentPrice || 0);
      k401Allocation[category] = (k401Allocation[category] || 0) + value;
      k401Total += value;
    });
    
    // Overall portfolio allocation
    const overallAllocation: Record<string, number> = {};
    let overallTotal = 0;
    allHoldings.forEach(h => {
      const category = categorize(h.ticker);
      overallAllocation[category] = (overallAllocation[category] || 0) + h.value;
      overallTotal += h.value;
    });
    
    // Convert to percentages
    const k401Pct: Record<string, number> = {};
    const overallPct: Record<string, number> = {};
    
    Object.keys(k401Allocation).forEach(k => {
      k401Pct[k] = (k401Allocation[k] / k401Total) * 100;
    });
    Object.keys(overallAllocation).forEach(k => {
      overallPct[k] = (overallAllocation[k] / overallTotal) * 100;
    });
    
    // Identify issues
    const issues: string[] = [];
    
    // Too much overlap
    const usEquity401k = k401Pct["US Equity"] || 0;
    const usEquityOverall = overallPct["US Equity"] || 0;
    if (usEquity401k > 70 && usEquityOverall > 70) {
      issues.push("High US equity concentration in both 401(k) and overall portfolio");
    }
    
    // Low international
    const intl401k = k401Pct["International"] || 0;
    if (intl401k < 15) {
      issues.push("Low international diversification in 401(k)");
    }
    
    // No bonds if age > 35
    const age = calculateAge(userProfile?.dateOfBirth);
    const bonds401k = k401Pct["Bonds"] || 0;
    if (age > 35 && bonds401k < 10) {
      issues.push("Consider adding bonds for age-appropriate diversification");
    }
    
    return {
      k401Allocation,
      k401Total,
      k401Pct,
      overallAllocation,
      overallTotal,
      overallPct,
      issues
    };
  }, [primary401k?.holdings, allHoldings, userProfile?.dateOfBirth]);

  // Rollover analysis
  const rolloverAnalysis = useMemo(() => {
    if (!primary401k || !feeAnalysis) return null;
    
    const k401Fees = feeAnalysis.weightedER;
    const iraFees = 0.03; // Assume low-cost index IRA
    
    const balance = feeAnalysis.totalValue;
    const annualSavings = balance * ((k401Fees - iraFees) / 100);
    
    // Investment options comparison
    const k401Options = primary401k.holdings?.length || 0;
    const iraOptions = "Unlimited"; // IRAs have full market access
    
    // Loan availability
    const k401HasLoans = true; // Most 401(k)s allow loans
    const iraHasLoans = false;
    
    // Creditor protection
    const k401Protection = "ERISA protected (unlimited)";
    const iraProtection = "State-dependent ($1.5M typical)";
    
    // RMD rules (for traditional)
    const k401RMD = "Age 73, but still-working exception";
    const iraRMD = "Age 73, no exceptions";
    
    // Considerations
    const prosForRollover = [
      `Potential fee savings of ${formatCurrency(annualSavings)}/year`,
      "Access to unlimited investment options",
      "Consolidated account management",
      "Easier estate planning",
      "Can convert to Roth strategically"
    ];
    
    const consForRollover = [
      "Lose 401(k) loan option",
      "May lose some creditor protection",
      "No still-working RMD exception",
      "Taxable event if converting to Roth"
    ];
    
    // If still employed, generally don't recommend rollover
    const stillEmployed = primary401k.employer && !primary401k.employer.includes("Former");
    
    return {
      k401Fees,
      iraFees,
      balance,
      annualSavings,
      k401Options,
      iraOptions,
      k401HasLoans,
      iraHasLoans,
      k401Protection,
      iraProtection,
      k401RMD,
      iraRMD,
      prosForRollover,
      consForRollover,
      recommendation: stillEmployed 
        ? "Keep in 401(k) while employed (maintain loan access and creditor protection)"
        : annualSavings > 500 
          ? "Consider rolling over to IRA for lower fees and more options"
          : "Either option is reasonable given similar costs"
    };
  }, [primary401k, feeAnalysis]);

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "match", label: "Employer Match", icon: "💰" },
    { id: "fees", label: "Fee Analysis", icon: "📊" },
    { id: "allocation", label: "Allocation", icon: "🎯" },
    { id: "old401k", label: "Old 401(k)s", icon: "🔍" },
    { id: "rollover", label: "Rollover Analysis", icon: "🔄" },
  ];

  const addOld401k = () => {
    if (!newOld401k.employer || !newOld401k.balance) return;
    
    setOld401ks(prev => [...prev, {
      id: Date.now().toString(),
      employer: newOld401k.employer,
      balance: parseFloat(newOld401k.balance),
      yearLeft: parseInt(newOld401k.yearLeft) || new Date().getFullYear(),
      recordKeeper: newOld401k.recordKeeper
    }]);
    
    setNewOld401k({ employer: "", balance: "", yearLeft: "", recordKeeper: "" });
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Retirement Optimizer</h1>
          <p className="text-gray-400 mb-8">Complete onboarding to analyze your retirement accounts.</p>
          <a href="/onboarding" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
            Get Started
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
      <Header />
      <DemoBanner />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🏦 Retirement Optimizer
          </h1>
          <p className="text-gray-400">
            Maximize your 401(k), track old accounts, and make smarter retirement decisions.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Current 401(k)</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(total401kBalance)}</p>
            <p className="text-xs text-gray-500">{primary401k?.employer || "Not connected"}</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total IRAs</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalIRABalance)}</p>
            <p className="text-xs text-gray-500">{allIRAs.length} account{allIRAs.length !== 1 ? "s" : ""}</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Employer Match</p>
            <p className="text-2xl font-bold text-white">
              {matchAnalysis?.isMaxingMatch ? (
                <span className="text-green-400">✓ Maxed</span>
              ) : (
                <span className="text-amber-400">{formatCurrency(matchAnalysis?.matchLeftOnTable || 0)}/yr left</span>
              )}
            </p>
            <p className="text-xs text-gray-500">{primary401k?.employerMatchPercent || 0}% match available</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Annual Fees</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(feeAnalysis?.totalAnnualFees || 0)}</p>
            <p className="text-xs text-gray-500">{feeAnalysis?.weightedER?.toFixed(2) || 0}% avg expense ratio</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-700 p-6">
          
          {/* Employer Match Tab */}
          {activeTab === "match" && matchAnalysis && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Employer Match Calculator</h2>
                <HelpIcon tooltip="The amount your employer contributes to your 401(k) based on your own contributions. This is free money — always try to max it." />
              </div>
              
              {!matchAnalysis.isMaxingMatch && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="text-amber-400 font-semibold">You&apos;re leaving money on the table!</p>
                      <p className="text-gray-300 mt-1">
                        You&apos;re missing out on <span className="font-bold text-white">{formatCurrency(matchAnalysis.matchLeftOnTable)}</span> per year in free employer match.
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Over 30 years, this could cost you <span className="text-amber-400 font-semibold">{formatCurrency(matchAnalysis.lostWealth)}</span> in lost wealth.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {matchAnalysis.isMaxingMatch && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="text-green-400 font-semibold">Great job! You&apos;re capturing your full employer match.</p>
                      <p className="text-gray-300 mt-1">
                        You&apos;re getting {formatCurrency(matchAnalysis.maxMatch)}/year in free money from your employer.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Your Current Contribution</h3>
                  <div className="bg-gray-900/50 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Contribution Rate</span>
                      <span className="text-white font-semibold">{matchAnalysis.currentContribPercent}%</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Annual Contribution</span>
                      <span className="text-white">{formatCurrency(matchAnalysis.currentContrib)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Your Employer Match</span>
                      <span className="text-green-400">{formatCurrency(matchAnalysis.currentMatch)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-700">
                      <span className="text-gray-400">Total Annual Savings</span>
                      <span className="text-white font-semibold">{formatCurrency(matchAnalysis.currentContrib + matchAnalysis.currentMatch)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Optimal Contribution</h3>
                  <div className="bg-gray-900/50 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">To Max Employer Match</span>
                      <span className="text-white">{matchAnalysis.employerMatchPercent}%</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">To Max 401(k) Limit</span>
                      <span className="text-white">{matchAnalysis.maxContribPercent.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">2026 IRS Limit</span>
                      <span className="text-white">{formatCurrency(matchAnalysis.irsLimit)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-700">
                      <span className="text-gray-400">Max Employer Match</span>
                      <span className="text-green-400 font-semibold">{formatCurrency(matchAnalysis.maxMatch)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recommendation */}
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                <h3 className="font-semibold text-indigo-400 mb-2">💡 Maven Recommendation</h3>
                {!matchAnalysis.isMaxingMatch ? (
                  <p className="text-gray-300">
                    Increase your contribution from {matchAnalysis.currentContribPercent}% to at least {matchAnalysis.employerMatchPercent}% 
                    to capture your full employer match. This is essentially a {matchAnalysis.employerMatchPercent * 100 / matchAnalysis.employerMatchPercent}% 
                    guaranteed return on that money.
                  </p>
                ) : !matchAnalysis.isMaxing401k ? (
                  <p className="text-gray-300">
                    You&apos;re maxing your employer match — great! Consider increasing to {formatCurrency(matchAnalysis.irsLimit)}/year 
                    (the IRS limit) for maximum tax-advantaged savings.
                  </p>
                ) : (
                  <p className="text-gray-300">
                    You&apos;re maxing both your employer match and your 401(k) contribution — excellent work! 
                    Consider a backdoor Roth IRA or taxable investing for additional savings.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Fee Analysis Tab */}
          {activeTab === "fees" && feeAnalysis && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Fee Analysis</h2>
                <HelpIcon tooltip="The annual fee charged by a fund, expressed as a percentage. A 0.5% expense ratio means you pay $50/year for every $10,000 invested." />
              </div>
              
              {/* Fee Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Weighted Expense Ratio</p>
                  <p className={`text-3xl font-bold ${feeAnalysis.weightedER > 0.5 ? "text-amber-400" : "text-green-400"}`}>
                    {feeAnalysis.weightedER.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500">vs 0.05% with index funds</p>
                </div>
                
                <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Annual Fees</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(feeAnalysis.totalAnnualFees)}</p>
                  <p className="text-xs text-gray-500">per year</p>
                </div>
                
                <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">30-Year Fee Drag</p>
                  <p className="text-3xl font-bold text-red-400">{formatCurrency(feeAnalysis.feeDragCost)}</p>
                  <p className="text-xs text-gray-500">potential lost growth</p>
                </div>
              </div>
              
              {feeAnalysis.totalPotentialSavings > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <p className="text-amber-400 font-semibold">
                    💡 Potential savings: {formatCurrency(feeAnalysis.totalPotentialSavings)}/year by switching to lower-cost alternatives
                  </p>
                </div>
              )}
              
              {/* Holdings Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3">Fund</th>
                      <th className="pb-3 text-right">Value</th>
                      <th className="pb-3 text-right">Expense Ratio</th>
                      <th className="pb-3 text-right">Annual Fee</th>
                      <th className="pb-3">Lower-Cost Alternative</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    {feeAnalysis.holdings.map((h, i) => (
                      <tr key={i} className="border-b border-gray-800">
                        <td className="py-3">
                          <span className="font-mono text-indigo-400">{h.ticker}</span>
                          <br />
                          <span className="text-sm text-gray-400">{h.name}</span>
                        </td>
                        <td className="py-3 text-right">{formatCurrency(h.value)}</td>
                        <td className="py-3 text-right">
                          <span className={h.expenseRatio > 0.5 ? "text-amber-400" : "text-green-400"}>
                            {h.expenseRatio.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 text-right">{formatCurrency(h.annualFee)}</td>
                        <td className="py-3">
                          {h.alternative ? (
                            <div>
                              <span className="font-mono text-green-400">{h.alternative.ticker}</span>
                              <span className="text-gray-400 text-sm ml-2">({h.alternative.expenseRatio}%)</span>
                              <br />
                              <span className="text-xs text-gray-500">Save {formatCurrency(h.potentialSavings)}/yr</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Recommendation */}
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                <h3 className="font-semibold text-indigo-400 mb-2">💡 Maven Recommendation</h3>
                {feeAnalysis.weightedER > 0.5 ? (
                  <p className="text-gray-300">
                    Your 401(k) has relatively high fees ({feeAnalysis.weightedER.toFixed(2)}% average). 
                    If your plan offers index funds, consider reallocating to reduce fees. 
                    Over 30 years, this could save you {formatCurrency(feeAnalysis.feeDragCost)} in fee drag.
                  </p>
                ) : (
                  <p className="text-gray-300">
                    Your 401(k) fees are reasonable ({feeAnalysis.weightedER.toFixed(2)}% average). 
                    Focus on maximizing contributions and maintaining proper asset allocation rather than fee optimization.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Allocation Tab */}
          {activeTab === "allocation" && allocationAnalysis && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Allocation Analysis</h2>
              
              {allocationAnalysis.issues.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <p className="text-amber-400 font-semibold mb-2">⚠️ Allocation Issues</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {allocationAnalysis.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 401(k) Allocation */}
                <div>
                  <h3 className="font-semibold text-white mb-4">401(k) Allocation</h3>
                  <div className="space-y-3">
                    {Object.entries(allocationAnalysis.k401Pct).sort((a, b) => b[1] - a[1]).map(([category, pct]) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{category}</span>
                          <span className="text-white">{pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getCategoryColor(category)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Overall Portfolio Allocation */}
                <div>
                  <h3 className="font-semibold text-white mb-4">Overall Portfolio</h3>
                  <div className="space-y-3">
                    {Object.entries(allocationAnalysis.overallPct).sort((a, b) => b[1] - a[1]).map(([category, pct]) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{category}</span>
                          <span className="text-white">{pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getCategoryColor(category)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Recommendation */}
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                <h3 className="font-semibold text-indigo-400 mb-2">💡 Maven Recommendation</h3>
                <p className="text-gray-300">
                  Think of your 401(k) as part of your overall portfolio, not in isolation. 
                  If you have heavy US equity elsewhere, consider using your 401(k) for bonds or international exposure 
                  to improve diversification. Asset location also matters — bonds are typically more tax-efficient in tax-advantaged accounts.
                </p>
              </div>
            </div>
          )}

          {/* Old 401(k) Tracker Tab */}
          {activeTab === "old401k" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Old 401(k) Tracker</h2>
                <HelpIcon tooltip="Moving money from a 401(k) to an IRA or another 401(k). Can provide more investment options and lower fees, but consider loan access and creditor protection." />
              </div>
              
              <p className="text-gray-400">
                Track 401(k) accounts from previous employers. Many people have forgotten accounts scattered across old jobs.
              </p>
              
              {/* Add New */}
              <div className="bg-gray-900/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-4">Add Old 401(k)</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Former Employer"
                    value={newOld401k.employer}
                    onChange={(e) => setNewOld401k(prev => ({ ...prev, employer: e.target.value }))}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Balance"
                    value={newOld401k.balance}
                    onChange={(e) => setNewOld401k(prev => ({ ...prev, balance: e.target.value }))}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Year Left"
                    value={newOld401k.yearLeft}
                    onChange={(e) => setNewOld401k(prev => ({ ...prev, yearLeft: e.target.value }))}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Record Keeper (Fidelity, etc.)"
                    value={newOld401k.recordKeeper}
                    onChange={(e) => setNewOld401k(prev => ({ ...prev, recordKeeper: e.target.value }))}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <button
                  onClick={addOld401k}
                  disabled={!newOld401k.employer || !newOld401k.balance}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add Account
                </button>
              </div>
              
              {/* List */}
              {old401ks.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-white">Your Old Accounts</h3>
                    <p className="text-gray-400">
                      Total: {formatCurrency(old401ks.reduce((sum, a) => sum + a.balance, 0))}
                    </p>
                  </div>
                  
                  {old401ks.map(account => (
                    <div key={account.id} className="bg-gray-900/50 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{account.employer}</p>
                        <p className="text-gray-400 text-sm">
                          Left in {account.yearLeft} • {account.recordKeeper || "Unknown record keeper"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">{formatCurrency(account.balance)}</p>
                        <button 
                          onClick={() => setOld401ks(prev => prev.filter(a => a.id !== account.id))}
                          className="text-red-400 text-sm hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                    <h3 className="font-semibold text-indigo-400 mb-2">💡 Consolidation Benefits</h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Easier to manage and track performance</li>
                      <li>• Potentially lower fees with modern IRA</li>
                      <li>• More investment options</li>
                      <li>• Simplified estate planning</li>
                      <li>• No risk of losing track of accounts</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-4">🔍</p>
                  <p>No old 401(k) accounts tracked yet.</p>
                  <p className="text-sm mt-2">Add accounts from previous employers above.</p>
                </div>
              )}
              
              {/* Finding Lost 401(k)s */}
              <div className="bg-gray-900/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">🔎 Finding Lost 401(k) Accounts</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Can&apos;t remember where your old accounts are? Here are some resources:
                </p>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• <span className="text-indigo-400">National Registry of Unclaimed Retirement Benefits</span> — Free search for abandoned accounts</li>
                  <li>• <span className="text-indigo-400">Contact former employers</span> — HR can tell you the plan administrator</li>
                  <li>• <span className="text-indigo-400">Check old tax returns</span> — Form 5498 shows IRA contributions</li>
                  <li>• <span className="text-indigo-400">DOL&apos;s Abandoned Plan Database</span> — For plans that have been terminated</li>
                </ul>
              </div>
            </div>
          )}

          {/* Rollover Analysis Tab */}
          {activeTab === "rollover" && rolloverAnalysis && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Rollover Analysis</h2>
                <HelpIcon tooltip="Moving money from a 401(k) to an IRA or another 401(k). Can provide more investment options and lower fees, but consider loan access and creditor protection." />
              </div>
              
              <p className="text-gray-400">
                Should you roll your 401(k) to an IRA? Here&apos;s a detailed comparison.
              </p>
              
              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-700">
                      <th className="pb-3">Factor</th>
                      <th className="pb-3">401(k)</th>
                      <th className="pb-3">IRA</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    <tr className="border-b border-gray-800">
                      <td className="py-3 text-gray-400">Average Fees</td>
                      <td className="py-3">{rolloverAnalysis.k401Fees.toFixed(2)}%</td>
                      <td className="py-3 text-green-400">{rolloverAnalysis.iraFees.toFixed(2)}%</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 text-gray-400">Annual Fee Cost</td>
                      <td className="py-3">{formatCurrency(rolloverAnalysis.balance * rolloverAnalysis.k401Fees / 100)}</td>
                      <td className="py-3 text-green-400">{formatCurrency(rolloverAnalysis.balance * rolloverAnalysis.iraFees / 100)}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 text-gray-400">Investment Options</td>
                      <td className="py-3">{rolloverAnalysis.k401Options} funds</td>
                      <td className="py-3 text-green-400">{rolloverAnalysis.iraOptions}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 text-gray-400">Loan Availability</td>
                      <td className="py-3 text-green-400">{rolloverAnalysis.k401HasLoans ? "Yes ✓" : "No"}</td>
                      <td className="py-3 text-red-400">{rolloverAnalysis.iraHasLoans ? "Yes" : "No ✗"}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 text-gray-400">Creditor Protection</td>
                      <td className="py-3 text-green-400">{rolloverAnalysis.k401Protection}</td>
                      <td className="py-3 text-amber-400">{rolloverAnalysis.iraProtection}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 text-gray-400">RMD Rules</td>
                      <td className="py-3 text-green-400">{rolloverAnalysis.k401RMD}</td>
                      <td className="py-3">{rolloverAnalysis.iraRMD}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Pros and Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <h3 className="font-semibold text-green-400 mb-3">✓ Reasons to Roll Over</h3>
                  <ul className="space-y-2 text-gray-300">
                    {rolloverAnalysis.prosForRollover.map((pro, i) => (
                      <li key={i}>• {pro}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <h3 className="font-semibold text-red-400 mb-3">✗ Reasons to Stay</h3>
                  <ul className="space-y-2 text-gray-300">
                    {rolloverAnalysis.consForRollover.map((con, i) => (
                      <li key={i}>• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Recommendation */}
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                <h3 className="font-semibold text-indigo-400 mb-2">💡 Maven Recommendation</h3>
                <p className="text-gray-300">{rolloverAnalysis.recommendation}</p>
              </div>
              
              {/* PTE 2020-02 Note */}
              <div className="bg-gray-900/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">📋 Documentation (PTE 2020-02)</h3>
                <p className="text-gray-400 text-sm">
                  Under DOL regulations, advisors must document why a rollover is in your best interest. 
                  This analysis serves as that documentation, comparing fees, services, and investment options 
                  between your current 401(k) and potential IRA.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper functions
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getSalaryFromIncome(income?: string): number {
  if (!income) return 100000;
  
  const map: Record<string, number> = {
    "Under $50,000": 40000,
    "$50,000 - $100,000": 75000,
    "$100,000 - $200,000": 150000,
    "$200,000 - $500,000": 350000,
    "Over $500,000": 750000,
  };
  
  return map[income] || 100000;
}

function calculateAge(dob?: string): number {
  if (!dob) return 40;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "US Equity": "bg-indigo-500",
    "International": "bg-cyan-500",
    "Bonds": "bg-green-500",
    "Real Estate": "bg-amber-500",
    "Crypto": "bg-orange-500",
    "Target Date": "bg-purple-500",
    "Other": "bg-gray-500",
  };
  return colors[category] || "bg-gray-500";
}
