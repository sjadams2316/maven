"use client";

import { useState } from "react";
import { useUserProfile } from "@/providers/UserProvider";
import Header from "@/app/components/Header";
import DemoBanner from "@/app/components/DemoBanner";
import Link from "next/link";

interface PlaybookStep {
  title: string;
  description: string;
  timeframe: string;
  priority: "critical" | "high" | "medium" | "low";
  checklist: string[];
  mavenFeature?: string;
  mavenLink?: string;
}

interface Playbook {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  emotionalNote: string;
  steps: PlaybookStep[];
  resources: { title: string; url?: string; type: "article" | "tool" | "professional" }[];
}

const PLAYBOOKS: Playbook[] = [
  {
    id: "inheritance",
    name: "Receiving an Inheritance",
    icon: "🎁",
    tagline: "Sudden wealth brings opportunity and complexity",
    description: "Inheriting money can be emotionally and financially overwhelming. This playbook helps you navigate the transition thoughtfully.",
    emotionalNote: "Take your time. There's no rush to make decisions. It's okay to grieve while also planning for the future.",
    steps: [
      {
        title: "Pause and Breathe",
        description: "Don't make any major financial decisions for at least 6 months. Park inherited assets in a safe place while you process.",
        timeframe: "First 30 days",
        priority: "critical",
        checklist: [
          "Deposit checks/transfers into a high-yield savings account",
          "Don't quit your job, buy a house, or make large purchases",
          "Tell only trusted family/friends — avoid 'advice' from acquaintances",
          "Find a grief counselor if needed — this is emotionally heavy",
        ],
      },
      {
        title: "Understand What You've Inherited",
        description: "Take inventory of all inherited assets and their tax implications.",
        timeframe: "30-90 days",
        priority: "high",
        checklist: [
          "Get a complete list of assets from the estate executor",
          "Understand the cost basis 'step-up' for inherited investments",
          "Identify any inherited IRAs and their RMD requirements",
          "Check for any debts or liens attached to the estate",
          "Review any life insurance policies and beneficiary designations",
        ],
        mavenFeature: "Use the Dashboard to add inherited accounts",
        mavenLink: "/dashboard",
      },
      {
        title: "Assemble Your Team",
        description: "Complex inheritances need professional guidance. Build a team of trusted advisors.",
        timeframe: "60-90 days",
        priority: "high",
        checklist: [
          "Estate attorney — for probate and trust administration",
          "CPA/Tax advisor — inheritance has significant tax implications",
          "Financial advisor (fiduciary) — for investment and planning help",
          "Insurance specialist — if you inherited business or real estate",
        ],
      },
      {
        title: "Optimize Inherited Retirement Accounts",
        description: "Inherited IRAs have specific rules. The SECURE Act changed everything.",
        timeframe: "90-180 days",
        priority: "high",
        checklist: [
          "If spouse: can roll into your own IRA or keep as inherited",
          "If non-spouse: must empty account within 10 years (SECURE Act)",
          "Calculate optimal withdrawal strategy to minimize taxes",
          "Consider Roth conversions if in a low tax year",
        ],
        mavenFeature: "Retirement Optimizer can analyze inherited IRA strategies",
        mavenLink: "/retirement-optimizer",
      },
      {
        title: "Integrate Into Your Financial Plan",
        description: "Now that you've processed emotionally and understand the assets, thoughtfully integrate them.",
        timeframe: "6-12 months",
        priority: "medium",
        checklist: [
          "Update your financial plan with new assets",
          "Rebalance overall portfolio if inheritance skewed allocation",
          "Consider tax-loss harvesting to offset any realized gains",
          "Update estate documents — you may need new beneficiaries",
          "Review insurance needs — more assets may need more protection",
        ],
        mavenFeature: "Use What-If Scenarios to model your new trajectory",
        mavenLink: "/scenarios",
      },
      {
        title: "Honor the Legacy",
        description: "Consider how this inheritance can serve your values and the wishes of the person who left it.",
        timeframe: "12+ months",
        priority: "low",
        checklist: [
          "Set aside a portion for charitable giving if meaningful",
          "Consider a donor-advised fund for tax-efficient giving",
          "Create a family mission statement about wealth",
          "Teach children about money if they're old enough",
          "Document the story for future generations",
        ],
      },
    ],
    resources: [
      { title: "IRS: Inherited IRA Rules", type: "article" },
      { title: "Find a Fee-Only Financial Planner (NAPFA)", type: "professional" },
      { title: "Estate Attorney Locator (ACTEC)", type: "professional" },
    ],
  },
  {
    id: "job-loss",
    name: "Job Loss",
    icon: "💼",
    tagline: "A setback that can become a reset",
    description: "Losing a job is stressful, but with the right steps, you can protect your finances and potentially find something better.",
    emotionalNote: "This isn't a reflection of your worth. Many successful people have been laid off. Focus on what you can control.",
    steps: [
      {
        title: "Secure Immediate Cash Flow",
        description: "Before anything else, understand your financial runway and stabilize cash.",
        timeframe: "Week 1",
        priority: "critical",
        checklist: [
          "Calculate your emergency fund coverage (how many months?)",
          "File for unemployment benefits immediately — there's a waiting period",
          "Understand your severance package (if any) — negotiate if possible",
          "List all recurring expenses and identify what can be paused",
          "Do NOT touch retirement accounts unless absolutely necessary",
        ],
        mavenFeature: "Dashboard shows your cash position and runway",
        mavenLink: "/dashboard",
      },
      {
        title: "Handle Health Insurance",
        description: "Don't let coverage lapse. This is often the most expensive surprise.",
        timeframe: "Week 1-2",
        priority: "critical",
        checklist: [
          "Understand COBRA options — expensive but seamless coverage",
          "Check Healthcare.gov marketplace — job loss is a qualifying event",
          "Compare spouse's employer plan if applicable",
          "Look into health sharing ministries as alternative",
          "Don't go uninsured — one accident can be financially devastating",
        ],
      },
      {
        title: "Protect Retirement Assets",
        description: "Your 401(k) from your old employer needs attention, but don't panic-sell.",
        timeframe: "30-60 days",
        priority: "high",
        checklist: [
          "Leave 401(k) where it is for now — no rush",
          "Understand rollover options (new employer 401k, IRA)",
          "Do NOT cash out — 10% penalty + income tax is brutal",
          "If you need cash, 401(k) loans (from new employer) are better than withdrawals",
          "Review investment allocation — is it too aggressive for your situation?",
        ],
        mavenFeature: "Retirement Optimizer has rollover analysis tools",
        mavenLink: "/retirement-optimizer",
      },
      {
        title: "Reduce Expenses Strategically",
        description: "Cut spending without destroying quality of life. This is temporary.",
        timeframe: "Month 1",
        priority: "high",
        checklist: [
          "Pause subscriptions you can live without",
          "Call providers (internet, phone, insurance) — many have hardship programs",
          "Reduce dining out but keep some social budget — mental health matters",
          "Defer large purchases but don't stop maintenance (car, health)",
          "Talk to mortgage/landlord if needed — they'd rather work with you",
        ],
      },
      {
        title: "Job Search & Reinvention",
        description: "This is also an opportunity to reassess your career.",
        timeframe: "Month 1-6",
        priority: "high",
        checklist: [
          "Update resume and LinkedIn immediately",
          "Reach out to your network — most jobs come through connections",
          "Consider if you want the same role or something new",
          "Explore consulting/freelance as a bridge",
          "Upskill if needed — many free resources available",
          "Don't undersell yourself — you have more leverage than you think",
        ],
      },
      {
        title: "Tax Planning for the Transition Year",
        description: "A job loss year can actually create tax opportunities.",
        timeframe: "Throughout",
        priority: "medium",
        checklist: [
          "Lower income = potential for Roth conversions at lower rates",
          "Harvest tax losses if market is down",
          "Maximize deductions (job search expenses, moving costs if applicable)",
          "Adjust estimated tax payments",
          "Consider IRA contributions if you have earned income",
        ],
        mavenFeature: "Tax-Loss Harvesting scanner",
        mavenLink: "/tax-harvesting",
      },
    ],
    resources: [
      { title: "Unemployment Insurance Finder (CareerOneStop)", type: "tool" },
      { title: "Healthcare.gov Special Enrollment", type: "tool" },
      { title: "NAPFA Fee-Only Advisor Search", type: "professional" },
    ],
  },
  {
    id: "new-baby",
    name: "Having a Baby",
    icon: "👶",
    tagline: "The most expensive (and rewarding) thing you'll ever do",
    description: "A new child changes everything — your priorities, your budget, and your legacy. Plan ahead to enjoy the journey.",
    emotionalNote: "You don't need to be perfect. Kids are resilient. Focus on the big things and let go of the small stuff.",
    steps: [
      {
        title: "Adjust Your Budget",
        description: "Babies are expensive upfront, but ongoing costs are manageable with planning.",
        timeframe: "Before birth",
        priority: "critical",
        checklist: [
          "Estimate first-year costs: $12,000-$15,000 (diapers, gear, medical)",
          "Research daycare costs — often the biggest expense ($15,000-$30,000/year)",
          "Review your health insurance — add baby within 30 days of birth",
          "Understand your parental leave policies and income impact",
          "Build up cash buffer for unexpected baby expenses",
        ],
      },
      {
        title: "Get Life Insurance",
        description: "You now have dependents. Life insurance is no longer optional.",
        timeframe: "Before birth",
        priority: "critical",
        checklist: [
          "Calculate coverage needed: 10-15x income + debts + college",
          "Term life is usually best — 20 or 30 year term",
          "Both parents need coverage, even non-working parent",
          "Get insured while healthy — pregnancy doesn't disqualify",
          "Review and update beneficiaries",
        ],
      },
      {
        title: "Update Estate Documents",
        description: "You need a will now. Who raises your child if something happens?",
        timeframe: "Before birth",
        priority: "critical",
        checklist: [
          "Create or update your will — name a guardian",
          "Set up a trust if you have significant assets",
          "Update all beneficiary designations (401k, IRA, life insurance)",
          "Consider a power of attorney and healthcare proxy",
          "Store documents securely and tell executor where they are",
        ],
      },
      {
        title: "Start Saving for College (529 Plan)",
        description: "Time is your biggest asset. Even small amounts grow significantly.",
        timeframe: "First year",
        priority: "high",
        checklist: [
          "Open a 529 plan — tax-free growth for education",
          "Check your state's 529 for potential state tax deduction",
          "Start with automatic monthly contributions (even $100 helps)",
          "Ask grandparents to contribute instead of toys",
          "$200/month from birth = ~$70,000 by age 18",
        ],
        mavenFeature: "Financial Snapshot can project college savings",
        mavenLink: "/financial-snapshot",
      },
      {
        title: "Revisit Your Financial Plan",
        description: "Your goals, timeline, and risk tolerance may have shifted.",
        timeframe: "First year",
        priority: "medium",
        checklist: [
          "Re-run retirement projections with new expenses",
          "Consider if one parent should stay home (run the numbers)",
          "Adjust emergency fund — now need 6 months minimum",
          "Review investment allocation — may want less risk",
          "Plan for maternity/paternity leave income gap",
        ],
        mavenFeature: "What-If Scenarios with child expense modeling",
        mavenLink: "/scenarios",
      },
      {
        title: "Maximize Tax Benefits",
        description: "Kids come with tax benefits. Don't leave money on the table.",
        timeframe: "Ongoing",
        priority: "medium",
        checklist: [
          "Child Tax Credit — up to $2,000 per child",
          "Dependent Care FSA — up to $5,000 pre-tax for daycare",
          "Claim medical expenses (delivery, pediatrician visits)",
          "File as head of household if single parent",
          "Update W-4 withholdings for new dependent",
        ],
      },
    ],
    resources: [
      { title: "College Savings Calculator (Vanguard)", type: "tool" },
      { title: "Term Life Insurance Comparison (Policygenius)", type: "tool" },
      { title: "Estate Planning Attorney (ACTEC)", type: "professional" },
    ],
  },
];

export default function PlaybooksPage() {
  const { profile: userProfile } = useUserProfile();
  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});
  
  const activePlaybook = PLAYBOOKS.find(p => p.id === selectedPlaybook);
  
  const toggleStepComplete = (playbookId: string, stepIndex: number) => {
    setCompletedSteps(prev => {
      const playbookSteps = new Set(prev[playbookId] || []);
      if (playbookSteps.has(stepIndex)) {
        playbookSteps.delete(stepIndex);
      } else {
        playbookSteps.add(stepIndex);
      }
      return { ...prev, [playbookId]: playbookSteps };
    });
  };
  
  const getProgress = (playbookId: string, totalSteps: number): number => {
    const completed = completedSteps[playbookId]?.size || 0;
    return (completed / totalSteps) * 100;
  };
  
  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      critical: "text-red-400 bg-red-500/10 border-red-500/30",
      high: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      medium: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      low: "text-gray-400 bg-gray-500/10 border-gray-500/30",
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
      <Header />
      <DemoBanner />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📖 Life Transition Playbooks
          </h1>
          <p className="text-gray-400">
            Major life events require major planning. These step-by-step guides help you navigate transitions without missing critical steps.
          </p>
        </div>

        {!selectedPlaybook ? (
          <>
            {/* Playbook Selection */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {PLAYBOOKS.map(playbook => {
                const progress = getProgress(playbook.id, playbook.steps.length);
                return (
                  <button
                    key={playbook.id}
                    onClick={() => setSelectedPlaybook(playbook.id)}
                    className="text-left p-6 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 hover:border-indigo-500 transition group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{playbook.icon}</span>
                      <div>
                        <h2 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition">
                          {playbook.name}
                        </h2>
                        <p className="text-sm text-gray-400">{playbook.tagline}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {playbook.description}
                    </p>
                    
                    {progress > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all" 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-indigo-400 group-hover:text-indigo-300">
                      <span>{playbook.steps.length} steps</span>
                      <span className="ml-auto">Start →</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Coming Soon */}
            <div className="bg-gray-800/30 rounded-xl border border-gray-700 border-dashed p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">More Playbooks Coming Soon</h3>
              <p className="text-gray-500 text-sm">
                Divorce • Business Sale • Retirement Transition • Death of Spouse • Major Medical Event • Relocation
              </p>
            </div>
          </>
        ) : activePlaybook && (
          <>
            {/* Playbook Header */}
            <button
              onClick={() => setSelectedPlaybook(null)}
              className="text-indigo-400 hover:text-indigo-300 mb-4 flex items-center gap-2"
            >
              ← Back to All Playbooks
            </button>
            
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <span className="text-5xl">{activePlaybook.icon}</span>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{activePlaybook.name}</h1>
                  <p className="text-gray-300 mb-4">{activePlaybook.description}</p>
                  
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-indigo-300">
                      💙 <strong>Emotional Note:</strong> {activePlaybook.emotionalNote}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Your Progress</span>
                  <span className="text-white font-medium">
                    {completedSteps[activePlaybook.id]?.size || 0} / {activePlaybook.steps.length} steps
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" 
                    style={{ width: `${getProgress(activePlaybook.id, activePlaybook.steps.length)}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-6 mb-8">
              {activePlaybook.steps.map((step, idx) => {
                const isCompleted = completedSteps[activePlaybook.id]?.has(idx);
                return (
                  <div 
                    key={idx}
                    className={`bg-gray-800/50 backdrop-blur rounded-xl border transition ${
                      isCompleted ? "border-green-500/50" : "border-gray-700"
                    }`}
                  >
                    {/* Step Header */}
                    <div 
                      className="p-4 flex items-start gap-4 cursor-pointer"
                      onClick={() => toggleStepComplete(activePlaybook.id, idx)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
                      }`}>
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`font-semibold ${isCompleted ? "text-green-400" : "text-white"}`}>
                            {step.title}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(step.priority)}`}>
                            {step.priority.charAt(0).toUpperCase() + step.priority.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">{step.timeframe}</span>
                        </div>
                        <p className="text-sm text-gray-400">{step.description}</p>
                      </div>
                    </div>
                    
                    {/* Checklist */}
                    <div className="px-4 pb-4 ml-12">
                      <ul className="space-y-2">
                        {step.checklist.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-gray-500">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                      
                      {step.mavenFeature && step.mavenLink && (
                        <Link 
                          href={step.mavenLink}
                          className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 text-sm rounded-lg hover:bg-indigo-600/30 transition"
                        >
                          <span>🔮</span>
                          {step.mavenFeature}
                          <span>→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resources */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">📚 Helpful Resources</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {activePlaybook.resources.map((resource, i) => (
                  <div 
                    key={i}
                    className="p-3 bg-gray-900/50 rounded-lg"
                  >
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      resource.type === "article" ? "bg-blue-500/20 text-blue-400" :
                      resource.type === "tool" ? "bg-green-500/20 text-green-400" :
                      "bg-purple-500/20 text-purple-400"
                    }`}>
                      {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                    </span>
                    <p className="text-white mt-2">{resource.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
