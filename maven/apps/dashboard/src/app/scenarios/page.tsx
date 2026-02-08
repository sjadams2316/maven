"use client";

import { useState, useMemo, useCallback } from "react";
import { useUserProfile } from "@/providers/UserProvider";
import Header from "@/app/components/Header";
import DemoBanner from "@/app/components/DemoBanner";

interface ScenarioResult {
  year: number;
  age: number;
  portfolioValue: number;
  contributions: number;
  withdrawals: number;
  socialSecurity: number;
  totalIncome: number;
}

interface Scenario {
  id: string;
  name: string;
  icon: string;
  description: string;
  adjustments: {
    retirementAge?: number;
    monthlyContribution?: number;
    expectedReturn?: number;
    marketCrash?: { year: number; percent: number };
    inflationRate?: number;
    ssStartAge?: number;
    withdrawalRate?: number;
    oneTimeEvent?: { year: number; amount: number; description: string };
  };
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    id: "baseline",
    name: "Current Plan",
    icon: "📊",
    description: "Your current trajectory with no changes",
    adjustments: {},
  },
  {
    id: "early-retirement",
    name: "Retire 5 Years Earlier",
    icon: "🏖️",
    description: "What if you retire at 55 instead of 60?",
    adjustments: { retirementAge: -5 },
  },
  {
    id: "delayed-retirement",
    name: "Work 3 More Years",
    icon: "💼",
    description: "What if you delay retirement to 63?",
    adjustments: { retirementAge: 3 },
  },
  {
    id: "boost-savings",
    name: "Max Out Savings",
    icon: "💰",
    description: "Increase monthly contribution by $1,000",
    adjustments: { monthlyContribution: 1000 },
  },
  {
    id: "market-crash",
    name: "2008-Style Crash",
    icon: "📉",
    description: "50% market drop in year 1, then recovery",
    adjustments: { marketCrash: { year: 1, percent: -50 } },
  },
  {
    id: "mild-correction",
    name: "Mild Correction",
    icon: "📊",
    description: "20% drop next year, normal after",
    adjustments: { marketCrash: { year: 1, percent: -20 } },
  },
  {
    id: "high-inflation",
    name: "High Inflation",
    icon: "🔥",
    description: "5% inflation erodes purchasing power",
    adjustments: { inflationRate: 5 },
  },
  {
    id: "delay-ss",
    name: "Delay Social Security",
    icon: "🏛️",
    description: "Start SS at 70 for maximum benefit",
    adjustments: { ssStartAge: 70 },
  },
  {
    id: "early-ss",
    name: "Early Social Security",
    icon: "⏰",
    description: "Start SS at 62 (reduced benefit)",
    adjustments: { ssStartAge: 62 },
  },
  {
    id: "inheritance",
    name: "Receive Inheritance",
    icon: "🎁",
    description: "$200K windfall in 5 years",
    adjustments: { oneTimeEvent: { year: 5, amount: 200000, description: "Inheritance" } },
  },
  {
    id: "conservative",
    name: "Conservative Returns",
    icon: "🐢",
    description: "Assume 5% returns instead of 7%",
    adjustments: { expectedReturn: -2 },
  },
  {
    id: "aggressive",
    name: "Aggressive Returns",
    icon: "🚀",
    description: "Assume 9% returns (higher risk)",
    adjustments: { expectedReturn: 2 },
  },
];

export default function ScenariosPage() {
  const { profile: userProfile, financials } = useUserProfile();
  
  // Base assumptions (from profile or defaults)
  const currentAge = useMemo(() => {
    if (!userProfile?.dateOfBirth) return 40;
    const birth = new Date(userProfile.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }, [userProfile?.dateOfBirth]);
  
  const [baseAssumptions, setBaseAssumptions] = useState({
    retirementAge: 60,
    monthlyContribution: 2000,
    expectedReturn: 7,
    inflationRate: 2.5,
    ssStartAge: 67,
    ssMonthlyBenefit: userProfile?.socialSecurity?.benefitAtFRA || 3000,
    withdrawalRate: 4,
    lifeExpectancy: 90,
  });
  
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(["baseline"]);
  const [customScenario, setCustomScenario] = useState<Scenario | null>(null);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  
  // Custom scenario builder state
  const [customName, setCustomName] = useState("My Custom Scenario");
  const [customRetirementDelta, setCustomRetirementDelta] = useState(0);
  const [customContributionDelta, setCustomContributionDelta] = useState(0);
  const [customReturnDelta, setCustomReturnDelta] = useState(0);
  const [customCrashYear, setCustomCrashYear] = useState(0);
  const [customCrashPercent, setCustomCrashPercent] = useState(0);
  const [customWindfallYear, setCustomWindfallYear] = useState(0);
  const [customWindfallAmount, setCustomWindfallAmount] = useState(0);
  
  const currentPortfolio = financials?.totalInvestments || 500000;
  
  // Calculate scenario projections
  const calculateScenario = useCallback((scenario: Scenario): ScenarioResult[] => {
    const results: ScenarioResult[] = [];
    const adj = scenario.adjustments;
    
    const retirementAge = baseAssumptions.retirementAge + (adj.retirementAge || 0);
    const monthlyContrib = baseAssumptions.monthlyContribution + (adj.monthlyContribution || 0);
    const expectedReturn = (baseAssumptions.expectedReturn + (adj.expectedReturn || 0)) / 100;
    const inflationRate = (adj.inflationRate || baseAssumptions.inflationRate) / 100;
    const ssStartAge = adj.ssStartAge || baseAssumptions.ssStartAge;
    const withdrawalRate = baseAssumptions.withdrawalRate / 100;
    
    // SS benefit adjustment based on start age
    let ssBenefit = baseAssumptions.ssMonthlyBenefit;
    if (ssStartAge < 67) {
      ssBenefit = ssBenefit * (1 - (67 - ssStartAge) * 0.0567); // ~5.67% reduction per year before FRA
    } else if (ssStartAge > 67) {
      ssBenefit = ssBenefit * (1 + (ssStartAge - 67) * 0.08); // 8% increase per year after FRA
    }
    
    let portfolio = currentPortfolio;
    const yearsToProject = baseAssumptions.lifeExpectancy - currentAge;
    
    for (let i = 0; i <= yearsToProject; i++) {
      const age = currentAge + i;
      const year = new Date().getFullYear() + i;
      const isRetired = age >= retirementAge;
      const receivingSS = age >= ssStartAge;
      
      // Apply market crash if applicable
      let yearReturn = expectedReturn;
      if (adj.marketCrash && i === adj.marketCrash.year) {
        yearReturn = adj.marketCrash.percent / 100;
      }
      
      // Apply one-time event
      if (adj.oneTimeEvent && i === adj.oneTimeEvent.year) {
        portfolio += adj.oneTimeEvent.amount;
      }
      
      // Calculate contributions/withdrawals
      let contributions = 0;
      let withdrawals = 0;
      let ssIncome = 0;
      
      if (!isRetired) {
        contributions = monthlyContrib * 12;
      } else {
        withdrawals = portfolio * withdrawalRate;
        // Adjust for inflation in retirement
        const yearsRetired = age - retirementAge;
        withdrawals = withdrawals * Math.pow(1 + inflationRate, yearsRetired);
      }
      
      if (receivingSS) {
        ssIncome = ssBenefit * 12;
      }
      
      // Update portfolio
      portfolio = portfolio * (1 + yearReturn) + contributions - withdrawals;
      portfolio = Math.max(0, portfolio); // Can't go negative
      
      results.push({
        year,
        age,
        portfolioValue: portfolio,
        contributions,
        withdrawals,
        socialSecurity: ssIncome,
        totalIncome: withdrawals + ssIncome,
      });
    }
    
    return results;
  }, [baseAssumptions, currentAge, currentPortfolio]);
  
  // Calculate all selected scenarios
  const scenarioResults = useMemo(() => {
    const results: Record<string, ScenarioResult[]> = {};
    
    selectedScenarios.forEach(id => {
      const scenario = PRESET_SCENARIOS.find(s => s.id === id);
      if (scenario) {
        results[id] = calculateScenario(scenario);
      }
    });
    
    if (customScenario && selectedScenarios.includes("custom")) {
      results["custom"] = calculateScenario(customScenario);
    }
    
    return results;
  }, [selectedScenarios, customScenario, calculateScenario]);
  
  // Key metrics comparison
  const comparisonMetrics = useMemo(() => {
    const metrics: Record<string, {
      portfolioAtRetirement: number;
      portfolioAt80: number;
      portfolioAtEnd: number;
      totalWithdrawals: number;
      runsOutAge: number | null;
    }> = {};
    
    Object.entries(scenarioResults).forEach(([id, results]) => {
      const retirementResult = results.find(r => r.age === baseAssumptions.retirementAge);
      const at80 = results.find(r => r.age === 80);
      const atEnd = results[results.length - 1];
      const runsOut = results.find(r => r.portfolioValue <= 0);
      
      metrics[id] = {
        portfolioAtRetirement: retirementResult?.portfolioValue || 0,
        portfolioAt80: at80?.portfolioValue || 0,
        portfolioAtEnd: atEnd?.portfolioValue || 0,
        totalWithdrawals: results.filter(r => r.withdrawals > 0).reduce((sum, r) => sum + r.withdrawals, 0),
        runsOutAge: runsOut?.age || null,
      };
    });
    
    return metrics;
  }, [scenarioResults, baseAssumptions.retirementAge]);
  
  const toggleScenario = (id: string) => {
    if (selectedScenarios.includes(id)) {
      if (selectedScenarios.length > 1) {
        setSelectedScenarios(prev => prev.filter(s => s !== id));
      }
    } else {
      if (selectedScenarios.length < 4) {
        setSelectedScenarios(prev => [...prev, id]);
      }
    }
  };
  
  const buildCustomScenario = () => {
    const custom: Scenario = {
      id: "custom",
      name: customName,
      icon: "⚙️",
      description: "Your custom scenario",
      adjustments: {},
    };
    
    if (customRetirementDelta !== 0) custom.adjustments.retirementAge = customRetirementDelta;
    if (customContributionDelta !== 0) custom.adjustments.monthlyContribution = customContributionDelta;
    if (customReturnDelta !== 0) custom.adjustments.expectedReturn = customReturnDelta;
    if (customCrashYear > 0 && customCrashPercent !== 0) {
      custom.adjustments.marketCrash = { year: customCrashYear, percent: customCrashPercent };
    }
    if (customWindfallYear > 0 && customWindfallAmount > 0) {
      custom.adjustments.oneTimeEvent = { year: customWindfallYear, amount: customWindfallAmount, description: "Windfall" };
    }
    
    setCustomScenario(custom);
    if (!selectedScenarios.includes("custom")) {
      setSelectedScenarios(prev => [...prev.slice(0, 3), "custom"]);
    }
    setShowCustomBuilder(false);
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">What-If Scenarios</h1>
          <p className="text-gray-400 mb-8">Complete onboarding to explore your financial future.</p>
          <a href="/onboarding" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
            Get Started
          </a>
        </div>
      </div>
    );
  }

  const getScenarioColor = (id: string): string => {
    const colors: Record<string, string> = {
      baseline: "#6366f1", // indigo
      "early-retirement": "#f59e0b", // amber
      "delayed-retirement": "#10b981", // emerald
      "boost-savings": "#22c55e", // green
      "market-crash": "#ef4444", // red
      "mild-correction": "#f97316", // orange
      "high-inflation": "#dc2626", // red
      "delay-ss": "#8b5cf6", // violet
      "early-ss": "#06b6d4", // cyan
      inheritance: "#eab308", // yellow
      conservative: "#64748b", // slate
      aggressive: "#ec4899", // pink
      custom: "#14b8a6", // teal
    };
    return colors[id] || "#6366f1";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
      <Header />
      <DemoBanner />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🔮 What-If Scenario Planner
          </h1>
          <p className="text-gray-400">
            Explore different paths. See how retirement timing, savings rates, and market events could shape your future.
          </p>
        </div>

        {/* Base Assumptions */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">📐 Base Assumptions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-xs text-gray-400">Current Age</label>
              <p className="text-lg font-semibold text-white">{currentAge}</p>
            </div>
            <div>
              <label className="text-xs text-gray-400">Retirement Age</label>
              <input
                type="number"
                value={baseAssumptions.retirementAge}
                onChange={(e) => setBaseAssumptions(prev => ({ ...prev, retirementAge: parseInt(e.target.value) || 60 }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Monthly Contribution</label>
              <input
                type="number"
                value={baseAssumptions.monthlyContribution}
                onChange={(e) => setBaseAssumptions(prev => ({ ...prev, monthlyContribution: parseInt(e.target.value) || 0 }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Expected Return %</label>
              <input
                type="number"
                value={baseAssumptions.expectedReturn}
                onChange={(e) => setBaseAssumptions(prev => ({ ...prev, expectedReturn: parseFloat(e.target.value) || 7 }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                step="0.5"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">SS Start Age</label>
              <input
                type="number"
                value={baseAssumptions.ssStartAge}
                onChange={(e) => setBaseAssumptions(prev => ({ ...prev, ssStartAge: parseInt(e.target.value) || 67 }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Withdrawal Rate %</label>
              <input
                type="number"
                value={baseAssumptions.withdrawalRate}
                onChange={(e) => setBaseAssumptions(prev => ({ ...prev, withdrawalRate: parseFloat(e.target.value) || 4 }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                step="0.5"
              />
            </div>
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">📋 Select Scenarios (up to 4)</h2>
            <button
              onClick={() => setShowCustomBuilder(!showCustomBuilder)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition"
            >
              {showCustomBuilder ? "Cancel" : "+ Custom Scenario"}
            </button>
          </div>
          
          {/* Custom Builder */}
          {showCustomBuilder && (
            <div className="mb-4 p-4 bg-gray-900/50 rounded-xl border border-indigo-500/30">
              <h3 className="font-semibold text-indigo-400 mb-3">Build Custom Scenario</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-400">Scenario Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Retirement Age Δ</label>
                  <input
                    type="number"
                    value={customRetirementDelta}
                    onChange={(e) => setCustomRetirementDelta(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                    placeholder="-5 = 5 years earlier"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Monthly Contribution Δ</label>
                  <input
                    type="number"
                    value={customContributionDelta}
                    onChange={(e) => setCustomContributionDelta(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                    placeholder="+1000 = $1000 more"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Return Δ %</label>
                  <input
                    type="number"
                    value={customReturnDelta}
                    onChange={(e) => setCustomReturnDelta(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                    step="0.5"
                    placeholder="-2 = 2% lower"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Market Crash Year (0=none)</label>
                  <input
                    type="number"
                    value={customCrashYear}
                    onChange={(e) => setCustomCrashYear(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Crash % (negative)</label>
                  <input
                    type="number"
                    value={customCrashPercent}
                    onChange={(e) => setCustomCrashPercent(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                    placeholder="-30 = 30% drop"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Windfall Year (0=none)</label>
                  <input
                    type="number"
                    value={customWindfallYear}
                    onChange={(e) => setCustomWindfallYear(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Windfall Amount $</label>
                  <input
                    type="number"
                    value={customWindfallAmount}
                    onChange={(e) => setCustomWindfallAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  />
                </div>
              </div>
              <button
                onClick={buildCustomScenario}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition"
              >
                Create Scenario
              </button>
            </div>
          )}
          
          {/* Preset Scenarios */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {PRESET_SCENARIOS.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => toggleScenario(scenario.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedScenarios.includes(scenario.id)
                    ? "bg-indigo-600/20 border-indigo-500"
                    : "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                }`}
                disabled={!selectedScenarios.includes(scenario.id) && selectedScenarios.length >= 4}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{scenario.icon}</span>
                  <span className="font-medium text-white text-sm">{scenario.name}</span>
                </div>
                <p className="text-xs text-gray-400">{scenario.description}</p>
              </button>
            ))}
            
            {/* Custom scenario if exists */}
            {customScenario && (
              <button
                onClick={() => toggleScenario("custom")}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedScenarios.includes("custom")
                    ? "bg-teal-600/20 border-teal-500"
                    : "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">⚙️</span>
                  <span className="font-medium text-white text-sm">{customScenario.name}</span>
                </div>
                <p className="text-xs text-gray-400">Your custom scenario</p>
              </button>
            )}
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">📈 Portfolio Projection</h2>
          
          {/* Simple SVG Chart */}
          <div className="relative h-80 mb-4">
            <svg viewBox="0 0 800 300" className="w-full h-full">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={i}
                  x1="50"
                  y1={60 + i * 60}
                  x2="780"
                  y2={60 + i * 60}
                  stroke="#374151"
                  strokeWidth="1"
                />
              ))}
              
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map(i => {
                const maxValue = Math.max(
                  ...Object.values(scenarioResults).flatMap(r => r.map(p => p.portfolioValue))
                );
                const value = maxValue * (1 - i * 0.25);
                return (
                  <text
                    key={i}
                    x="45"
                    y={65 + i * 60}
                    textAnchor="end"
                    className="fill-gray-400 text-xs"
                  >
                    ${(value / 1000000).toFixed(1)}M
                  </text>
                );
              })}
              
              {/* Lines for each scenario */}
              {Object.entries(scenarioResults).map(([id, results]) => {
                const maxValue = Math.max(
                  ...Object.values(scenarioResults).flatMap(r => r.map(p => p.portfolioValue))
                );
                const points = results
                  .filter((_, i) => i % 2 === 0) // Sample every 2 years for cleaner chart
                  .map((r, i, arr) => {
                    const x = 50 + (i / (arr.length - 1)) * 730;
                    const y = 60 + (1 - r.portfolioValue / maxValue) * 240;
                    return `${x},${y}`;
                  })
                  .join(" ");
                
                return (
                  <polyline
                    key={id}
                    points={points}
                    fill="none"
                    stroke={getScenarioColor(id)}
                    strokeWidth="2"
                    className="transition-all duration-300"
                  />
                );
              })}
              
              {/* X-axis labels (ages) */}
              {[currentAge, currentAge + 10, currentAge + 20, currentAge + 30, currentAge + 40].map((age, i) => (
                <text
                  key={i}
                  x={50 + i * (730 / 4)}
                  y="295"
                  textAnchor="middle"
                  className="fill-gray-400 text-xs"
                >
                  Age {age}
                </text>
              ))}
              
              {/* Retirement line */}
              {(() => {
                const retireX = 50 + ((baseAssumptions.retirementAge - currentAge) / 40) * 730;
                return (
                  <>
                    <line
                      x1={retireX}
                      y1="60"
                      x2={retireX}
                      y2="270"
                      stroke="#6366f1"
                      strokeWidth="1"
                      strokeDasharray="4"
                    />
                    <text
                      x={retireX}
                      y="55"
                      textAnchor="middle"
                      className="fill-indigo-400 text-xs"
                    >
                      Retire
                    </text>
                  </>
                );
              })()}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4">
            {selectedScenarios.map(id => {
              const scenario = id === "custom" ? customScenario : PRESET_SCENARIOS.find(s => s.id === id);
              if (!scenario) return null;
              return (
                <div key={id} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getScenarioColor(id) }}
                  />
                  <span className="text-sm text-gray-300">{scenario.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metrics Comparison Table */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">📊 Key Metrics Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3">Scenario</th>
                  <th className="pb-3 text-right">At Retirement</th>
                  <th className="pb-3 text-right">At Age 80</th>
                  <th className="pb-3 text-right">At Age {baseAssumptions.lifeExpectancy}</th>
                  <th className="pb-3 text-right">Total Withdrawals</th>
                  <th className="pb-3 text-right">Runs Out?</th>
                </tr>
              </thead>
              <tbody>
                {selectedScenarios.map(id => {
                  const scenario = id === "custom" ? customScenario : PRESET_SCENARIOS.find(s => s.id === id);
                  const metrics = comparisonMetrics[id];
                  if (!scenario || !metrics) return null;
                  
                  return (
                    <tr key={id} className="border-b border-gray-800">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getScenarioColor(id) }}
                          />
                          <span className="text-white">{scenario.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-white">{formatCurrency(metrics.portfolioAtRetirement)}</td>
                      <td className="py-3 text-right text-white">{formatCurrency(metrics.portfolioAt80)}</td>
                      <td className="py-3 text-right text-white">{formatCurrency(metrics.portfolioAtEnd)}</td>
                      <td className="py-3 text-right text-gray-400">{formatCurrency(metrics.totalWithdrawals)}</td>
                      <td className="py-3 text-right">
                        {metrics.runsOutAge ? (
                          <span className="text-red-400">Age {metrics.runsOutAge}</span>
                        ) : (
                          <span className="text-green-400">Never ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">💡 Maven Insights</h2>
          
          <div className="space-y-3">
            {selectedScenarios.includes("early-retirement") && selectedScenarios.includes("baseline") && (
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <p className="text-gray-300">
                  <strong className="text-amber-400">Early Retirement Impact:</strong>{" "}
                  Retiring 5 years earlier would leave you with{" "}
                  {formatCurrency((comparisonMetrics["baseline"]?.portfolioAtEnd || 0) - (comparisonMetrics["early-retirement"]?.portfolioAtEnd || 0))}{" "}
                  less at age {baseAssumptions.lifeExpectancy}. Consider if the extra years of freedom are worth it.
                </p>
              </div>
            )}
            
            {selectedScenarios.includes("boost-savings") && selectedScenarios.includes("baseline") && (
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <p className="text-gray-300">
                  <strong className="text-green-400">Savings Boost:</strong>{" "}
                  Adding $1,000/month would grow your portfolio by{" "}
                  {formatCurrency((comparisonMetrics["boost-savings"]?.portfolioAtRetirement || 0) - (comparisonMetrics["baseline"]?.portfolioAtRetirement || 0))}{" "}
                  by retirement. That's the power of consistent saving.
                </p>
              </div>
            )}
            
            {selectedScenarios.includes("market-crash") && (
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <p className="text-gray-300">
                  <strong className="text-red-400">Crash Recovery:</strong>{" "}
                  Even with a 2008-style 50% crash, time in the market helps recovery. 
                  {comparisonMetrics["market-crash"]?.runsOutAge 
                    ? ` However, you'd run out of money at age ${comparisonMetrics["market-crash"].runsOutAge}.`
                    : " Your portfolio would still last through retirement."
                  }
                </p>
              </div>
            )}
            
            {Object.values(comparisonMetrics).some(m => m.runsOutAge) && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-gray-300">
                  <strong className="text-red-400">⚠️ Warning:</strong>{" "}
                  One or more scenarios show your portfolio running out before age {baseAssumptions.lifeExpectancy}. 
                  Consider adjusting your savings rate, retirement age, or withdrawal rate.
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
