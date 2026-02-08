"use client";

import { useState, useEffect, useMemo } from "react";
import { useUserProfile } from "@/providers/UserProvider";
import Header from "@/app/components/Header";
import DemoBanner from "@/app/components/DemoBanner";
import Link from "next/link";

interface FragilityData {
  score: number;
  pillars: Record<string, { score: number; indicators: Record<string, number> }>;
  dataQuality: number;
  indicatorCount: number;
  timestamp: string;
}

interface PortfolioImpact {
  scenarioName: string;
  probability: string;
  yourLoss: number;
  yourLossPercent: number;
  recoveryTime: string;
  recommendation: string;
}

// Historical crash data for stress testing
const HISTORICAL_CRASHES = [
  { name: "2008 Financial Crisis", drop: -0.509, recovery: "4 years", conditions: "Valuation high, Credit extreme, Structure fragile" },
  { name: "2020 COVID Crash", drop: -0.339, recovery: "6 months", conditions: "External shock, liquidity crisis" },
  { name: "2022 Rate Hikes", drop: -0.254, recovery: "2 years", conditions: "Valuation high, Macro tightening" },
  { name: "Dot-Com Bust", drop: -0.491, recovery: "7 years", conditions: "Valuation extreme, Sentiment euphoric" },
  { name: "1987 Black Monday", drop: -0.226, recovery: "2 years", conditions: "Structure fragile, Volatility spike" },
];

// Risk factor sensitivities by asset class
const ASSET_SENSITIVITIES: Record<string, Record<string, number>> = {
  // Pillar -> Asset class multiplier (1 = average, >1 = more sensitive)
  valuation: { usEquity: 1.2, intlEquity: 1.0, bonds: 0.3, crypto: 1.5, cash: 0 },
  credit: { usEquity: 1.0, intlEquity: 1.1, bonds: 1.5, crypto: 0.5, cash: 0 },
  volatility: { usEquity: 1.0, intlEquity: 1.1, bonds: 0.5, crypto: 2.0, cash: 0 },
  sentiment: { usEquity: 1.1, intlEquity: 1.0, bonds: 0.4, crypto: 1.8, cash: 0 },
  structure: { usEquity: 1.2, intlEquity: 1.0, bonds: 0.6, crypto: 1.5, cash: 0 },
  macro: { usEquity: 1.0, intlEquity: 1.2, bonds: 0.8, crypto: 1.0, cash: 0 },
  liquidity: { usEquity: 0.8, intlEquity: 1.0, bonds: 0.7, crypto: 1.5, cash: 0 },
  contagion: { usEquity: 1.0, intlEquity: 1.3, bonds: 0.6, crypto: 1.8, cash: 0 },
};

export default function FragilityAlertsPage() {
  const { profile: userProfile, financials } = useUserProfile();
  const [fragilityData, setFragilityData] = useState<FragilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(60);
  const [emailAlerts, setEmailAlerts] = useState(false);
  
  // Fetch fragility data
  useEffect(() => {
    async function fetchFragility() {
      try {
        const res = await fetch("/api/fragility-index");
        if (res.ok) {
          const data = await res.json();
          setFragilityData(data);
        }
      } catch (error) {
        console.error("Failed to fetch fragility data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFragility();
  }, []);
  
  // Calculate portfolio allocation
  const portfolioAllocation = useMemo(() => {
    if (!userProfile) return { usEquity: 0.6, intlEquity: 0.1, bonds: 0.1, crypto: 0.1, cash: 0.1 };
    
    const allocation = { usEquity: 0, intlEquity: 0, bonds: 0, crypto: 0, cash: 0 };
    let total = 0;
    
    // Categorize holdings
    const categorize = (ticker: string): keyof typeof allocation => {
      const intl = ["VXUS", "VEA", "VWO", "IXUS", "IEFA", "IEMG"];
      const bonds = ["BND", "AGG", "VCIT", "TLT", "IEF", "GOVT"];
      const crypto = ["BTC", "ETH", "SOL", "TAO", "COIN", "MSTR"];
      const cash = ["VMFXX", "SPAXX", "SWVXX", "SHV", "BIL"];
      
      if (intl.includes(ticker)) return "intlEquity";
      if (bonds.includes(ticker)) return "bonds";
      if (crypto.includes(ticker)) return "crypto";
      if (cash.includes(ticker)) return "cash";
      return "usEquity";
    };
    
    // Sum up holdings
    [...(userProfile.retirementAccounts || []), ...(userProfile.investmentAccounts || [])].forEach(account => {
      account.holdings?.forEach(h => {
        const value = h.currentValue || h.shares * (h.currentPrice || 0);
        const category = categorize(h.ticker);
        allocation[category] += value;
        total += value;
      });
    });
    
    // Add cash accounts
    userProfile.cashAccounts?.forEach(a => {
      allocation.cash += a.balance || 0;
      total += a.balance || 0;
    });
    
    // Convert to percentages
    if (total > 0) {
      Object.keys(allocation).forEach(k => {
        allocation[k as keyof typeof allocation] /= total;
      });
    }
    
    return allocation;
  }, [userProfile]);
  
  const portfolioValue = financials?.totalInvestments || 500000;
  
  // Calculate personalized risk score based on portfolio composition
  const personalizedRisk = useMemo(() => {
    if (!fragilityData) return { score: 50, factors: [] };
    
    let weightedScore = 0;
    const factors: { pillar: string; contribution: number; exposure: string }[] = [];
    
    Object.entries(fragilityData.pillars).forEach(([pillar, data]) => {
      // Calculate portfolio sensitivity to this pillar
      let sensitivity = 0;
      Object.entries(portfolioAllocation).forEach(([asset, weight]) => {
        const pillarSensitivity = ASSET_SENSITIVITIES[pillar.toLowerCase()]?.[asset] || 1;
        sensitivity += weight * pillarSensitivity;
      });
      
      const contribution = data.score * sensitivity;
      weightedScore += contribution;
      
      if (data.score > 50) {
        const highExposure = Object.entries(portfolioAllocation)
          .filter(([asset]) => (ASSET_SENSITIVITIES[pillar.toLowerCase()]?.[asset] || 1) > 1)
          .map(([asset, weight]) => `${(weight * 100).toFixed(0)}% ${asset}`)
          .join(", ");
        
        factors.push({
          pillar: pillar.charAt(0).toUpperCase() + pillar.slice(1),
          contribution: data.score,
          exposure: highExposure || "Moderate",
        });
      }
    });
    
    // Normalize to 0-100
    const normalizedScore = Math.min(100, weightedScore / Object.keys(fragilityData.pillars).length);
    
    return { score: normalizedScore, factors: factors.sort((a, b) => b.contribution - a.contribution) };
  }, [fragilityData, portfolioAllocation]);
  
  // Calculate potential portfolio impacts
  const portfolioImpacts = useMemo((): PortfolioImpact[] => {
    if (!fragilityData) return [];
    
    const score = personalizedRisk.score;
    const impacts: PortfolioImpact[] = [];
    
    // Mild correction scenario
    if (score > 30) {
      const drop = 0.15 * (1 + (score - 30) / 100);
      impacts.push({
        scenarioName: "Mild Correction (15-20%)",
        probability: score > 60 ? "Elevated" : score > 45 ? "Moderate" : "Low",
        yourLoss: portfolioValue * drop * (1 - portfolioAllocation.cash - portfolioAllocation.bonds * 0.3),
        yourLossPercent: drop * 100 * (1 - portfolioAllocation.cash - portfolioAllocation.bonds * 0.3),
        recoveryTime: "6-12 months",
        recommendation: "Ensure 3-6 months expenses in cash. Consider rebalancing if equity heavy.",
      });
    }
    
    // Significant pullback scenario
    if (score > 45) {
      const drop = 0.30 * (1 + (score - 45) / 100);
      impacts.push({
        scenarioName: "Significant Pullback (25-35%)",
        probability: score > 70 ? "Elevated" : "Moderate",
        yourLoss: portfolioValue * drop * (1 - portfolioAllocation.cash - portfolioAllocation.bonds * 0.4),
        yourLossPercent: drop * 100 * (1 - portfolioAllocation.cash - portfolioAllocation.bonds * 0.4),
        recoveryTime: "1-3 years",
        recommendation: "Review asset allocation. Consider hedging concentrated positions.",
      });
    }
    
    // Major crash scenario
    if (score > 60) {
      const drop = 0.50 * (1 + (score - 60) / 150);
      impacts.push({
        scenarioName: "Major Crash (40-50%)",
        probability: score > 80 ? "Elevated" : "Low-Moderate",
        yourLoss: portfolioValue * drop * (1 - portfolioAllocation.cash - portfolioAllocation.bonds * 0.5),
        yourLossPercent: drop * 100 * (1 - portfolioAllocation.cash - portfolioAllocation.bonds * 0.5),
        recoveryTime: "3-7 years",
        recommendation: "Build cash reserves. Consider protective puts on large positions. Stress test retirement timeline.",
      });
    }
    
    return impacts;
  }, [fragilityData, personalizedRisk, portfolioValue, portfolioAllocation]);
  
  // Determine alert status
  const alertStatus = useMemo(() => {
    if (!fragilityData) return { level: "unknown", message: "Loading..." };
    
    const score = personalizedRisk.score;
    
    if (score >= 80) return { level: "critical", message: "Critical fragility — extreme caution advised" };
    if (score >= 65) return { level: "high", message: "High fragility — review positioning" };
    if (score >= 50) return { level: "elevated", message: "Elevated fragility — stay alert" };
    if (score >= 35) return { level: "normal", message: "Normal conditions — maintain strategy" };
    return { level: "low", message: "Low fragility — conditions favorable" };
  }, [fragilityData, personalizedRisk]);
  
  const getAlertColor = (level: string): string => {
    const colors: Record<string, string> = {
      critical: "from-red-600 to-red-800",
      high: "from-orange-500 to-red-600",
      elevated: "from-amber-500 to-orange-500",
      normal: "from-blue-500 to-indigo-600",
      low: "from-green-500 to-emerald-600",
      unknown: "from-gray-500 to-gray-600",
    };
    return colors[level] || colors.unknown;
  };
  
  const getAlertBorder = (level: string): string => {
    const borders: Record<string, string> = {
      critical: "border-red-500",
      high: "border-orange-500",
      elevated: "border-amber-500",
      normal: "border-blue-500",
      low: "border-green-500",
      unknown: "border-gray-500",
    };
    return borders[level] || borders.unknown;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
      <Header />
      <DemoBanner />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Alert Banner */}
        <div className={`bg-gradient-to-r ${getAlertColor(alertStatus.level)} rounded-2xl p-6 mb-8 shadow-xl`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">
                  {alertStatus.level === "critical" ? "🚨" : 
                   alertStatus.level === "high" ? "⚠️" : 
                   alertStatus.level === "elevated" ? "📊" : 
                   alertStatus.level === "low" ? "✅" : "🔔"}
                </span>
                <h1 className="text-2xl font-bold text-white">
                  Your Portfolio Fragility: {personalizedRisk.score.toFixed(0)}
                </h1>
              </div>
              <p className="text-white/90">{alertStatus.message}</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-white/70">Market Fragility Index</p>
              <p className="text-3xl font-bold text-white">{fragilityData?.score?.toFixed(0) || "--"}</p>
              <Link href="/fragility" className="text-sm text-white/70 hover:text-white underline">
                View Details →
              </Link>
            </div>
          </div>
        </div>

        {/* Personalized Impact Assessment */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Your Risk Factors */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">🎯 Your Risk Exposures</h2>
            
            {personalizedRisk.factors.length > 0 ? (
              <div className="space-y-3">
                {personalizedRisk.factors.slice(0, 4).map((factor, i) => (
                  <div key={i} className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{factor.pillar}</span>
                      <span className={`text-sm ${factor.contribution > 70 ? "text-red-400" : factor.contribution > 50 ? "text-amber-400" : "text-gray-400"}`}>
                        {factor.contribution.toFixed(0)} / 100
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Your exposure: {factor.exposure}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No elevated risk factors detected. Your portfolio is well-positioned for current conditions.</p>
            )}
          </div>
          
          {/* Portfolio Composition */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">📊 Your Allocation</h2>
            
            <div className="space-y-3">
              {[
                { key: "usEquity", label: "US Equity", color: "bg-blue-500" },
                { key: "intlEquity", label: "International", color: "bg-purple-500" },
                { key: "bonds", label: "Bonds", color: "bg-green-500" },
                { key: "crypto", label: "Crypto", color: "bg-orange-500" },
                { key: "cash", label: "Cash", color: "bg-gray-500" },
              ].map(item => {
                const value = portfolioAllocation[item.key as keyof typeof portfolioAllocation];
                if (value < 0.01) return null;
                return (
                  <div key={item.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white">{(value * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${value * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Total Portfolio: {formatCurrency(portfolioValue)}
            </p>
          </div>
        </div>

        {/* Scenario Impact Analysis */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">💥 Potential Impact Scenarios</h2>
          
          {portfolioImpacts.length > 0 ? (
            <div className="space-y-4">
              {portfolioImpacts.map((impact, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-xl border ${
                    impact.probability === "Elevated" ? "bg-red-500/10 border-red-500/30" :
                    impact.probability === "Moderate" ? "bg-amber-500/10 border-amber-500/30" :
                    "bg-gray-900/50 border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{impact.scenarioName}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          impact.probability === "Elevated" ? "bg-red-500/20 text-red-400" :
                          impact.probability === "Moderate" ? "bg-amber-500/20 text-amber-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {impact.probability} Probability
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">Recovery time: {impact.recoveryTime}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-400">-{formatCurrency(impact.yourLoss)}</p>
                      <p className="text-sm text-gray-500">-{impact.yourLossPercent.toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <span className="text-indigo-400 font-medium">Recommendation:</span> {impact.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">✨</p>
              <p className="text-gray-400">Market conditions are currently favorable. No elevated impact scenarios.</p>
            </div>
          )}
        </div>

        {/* Historical Context */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">📚 Historical Context</h2>
          <p className="text-gray-400 text-sm mb-4">
            How would your current portfolio have fared in past market crises?
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3">Event</th>
                  <th className="pb-3 text-right">Market Drop</th>
                  <th className="pb-3 text-right">Your Est. Loss</th>
                  <th className="pb-3 text-right">Recovery</th>
                  <th className="pb-3">Conditions Then</th>
                </tr>
              </thead>
              <tbody>
                {HISTORICAL_CRASHES.map((crash, i) => {
                  const yourLoss = portfolioValue * Math.abs(crash.drop) * 
                    (1 - portfolioAllocation.cash - portfolioAllocation.bonds * 0.4);
                  return (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="py-3 text-white">{crash.name}</td>
                      <td className="py-3 text-right text-red-400">{(crash.drop * 100).toFixed(1)}%</td>
                      <td className="py-3 text-right text-red-400">-{formatCurrency(yourLoss)}</td>
                      <td className="py-3 text-right text-gray-400">{crash.recovery}</td>
                      <td className="py-3 text-sm text-gray-500">{crash.conditions}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">🔔 Alert Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Alert me when your personalized fragility exceeds:
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-white font-semibold w-12">{alertThreshold}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Sensitive</span>
                <span>Only Critical</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <p className="text-white font-medium">Email Alerts</p>
                <p className="text-sm text-gray-400">Get notified when fragility crosses your threshold</p>
              </div>
              <button
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-12 h-6 rounded-full transition ${emailAlerts ? "bg-indigo-600" : "bg-gray-600"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${emailAlerts ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            
            {emailAlerts && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <p className="text-sm text-indigo-400">
                  ✓ You'll receive an email when your personalized fragility score exceeds {alertThreshold}.
                  <br />
                  <span className="text-gray-400">(Email delivery requires account setup — coming soon)</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
