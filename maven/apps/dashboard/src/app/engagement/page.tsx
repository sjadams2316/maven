"use client";

import { useState, useEffect, useMemo } from "react";
import { useUserProfile } from "@/providers/UserProvider";
import Header from "@/app/components/Header";
import DemoBanner from "@/app/components/DemoBanner";

interface EngagementEvent {
  type: "login" | "feature" | "action" | "milestone";
  page?: string;
  action?: string;
  timestamp: Date;
}

interface EngagementMetrics {
  loginStreak: number;
  lastLogin: Date | null;
  totalLogins: number;
  favoriteFeatures: { name: string; visits: number }[];
  timeOnPlatform: number; // minutes
  actionsCompleted: number;
  milestonesReached: string[];
  engagementScore: number;
  npsScore: number | null;
}

// Simulated engagement data (in production, would come from analytics)
const simulateEngagement = (): EngagementMetrics => {
  const now = new Date();
  const lastLogin = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000); // Within last 24 hours
  
  return {
    loginStreak: Math.floor(Math.random() * 14) + 1,
    lastLogin,
    totalLogins: Math.floor(Math.random() * 50) + 10,
    favoriteFeatures: [
      { name: "Dashboard", visits: Math.floor(Math.random() * 30) + 15 },
      { name: "Portfolio Lab", visits: Math.floor(Math.random() * 20) + 5 },
      { name: "Oracle", visits: Math.floor(Math.random() * 15) + 5 },
      { name: "Fragility Index", visits: Math.floor(Math.random() * 10) + 3 },
      { name: "Tax Harvesting", visits: Math.floor(Math.random() * 8) + 2 },
    ].sort((a, b) => b.visits - a.visits),
    timeOnPlatform: Math.floor(Math.random() * 120) + 30,
    actionsCompleted: Math.floor(Math.random() * 15) + 5,
    milestonesReached: ["Completed Onboarding", "First Portfolio Analysis", "Explored 3+ Features"],
    engagementScore: Math.floor(Math.random() * 30) + 65,
    npsScore: null,
  };
};

const FEATURE_CARDS = [
  { id: "dashboard", name: "Dashboard", icon: "📊", description: "Net worth & holdings overview" },
  { id: "portfolio-lab", name: "Portfolio Lab", icon: "🧪", description: "Analysis & stress testing" },
  { id: "oracle", name: "Oracle", icon: "🔮", description: "AI wealth advisor" },
  { id: "fragility", name: "Fragility Index", icon: "📉", description: "Market risk indicator" },
  { id: "tax-harvesting", name: "Tax Harvesting", icon: "🌾", description: "Tax-loss opportunities" },
  { id: "retirement-optimizer", name: "Retirement", icon: "🏦", description: "401(k) optimization" },
  { id: "scenarios", name: "What-If", icon: "🔮", description: "Scenario planning" },
  { id: "playbooks", name: "Playbooks", icon: "📖", description: "Life transition guides" },
];

const MILESTONES = [
  { id: "onboarding", name: "Completed Onboarding", icon: "✅", points: 100 },
  { id: "first-analysis", name: "First Portfolio Analysis", icon: "📊", points: 50 },
  { id: "explored-features", name: "Explored 5 Features", icon: "🗺️", points: 75 },
  { id: "stress-test", name: "Ran Stress Test", icon: "🧪", points: 50 },
  { id: "tax-harvest", name: "Reviewed Tax Opportunities", icon: "🌾", points: 50 },
  { id: "set-goals", name: "Set Financial Goals", icon: "🎯", points: 75 },
  { id: "oracle-chat", name: "Asked Oracle 3 Questions", icon: "🔮", points: 50 },
  { id: "login-streak-7", name: "7-Day Login Streak", icon: "🔥", points: 100 },
  { id: "login-streak-30", name: "30-Day Login Streak", icon: "⚡", points: 250 },
  { id: "referred-friend", name: "Referred a Friend", icon: "🤝", points: 200 },
];

const NPS_QUESTIONS = [
  "How likely are you to recommend Maven to a friend or colleague?",
];

export default function EngagementPage() {
  const { profile: userProfile, financials } = useUserProfile();
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [showNPSModal, setShowNPSModal] = useState(false);
  const [npsRating, setNpsRating] = useState<number | null>(null);
  const [npsFeedback, setNpsFeedback] = useState("");
  const [npsSubmitted, setNpsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "features" | "milestones" | "referrals">("overview");
  
  // Simulate loading engagement data
  useEffect(() => {
    const timer = setTimeout(() => {
      setMetrics(simulateEngagement());
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate engagement level
  const engagementLevel = useMemo(() => {
    if (!metrics) return { level: "New", color: "gray", nextLevel: "Engaged", pointsToNext: 100 };
    
    const score = metrics.engagementScore;
    if (score >= 90) return { level: "Champion", color: "purple", nextLevel: null, pointsToNext: 0 };
    if (score >= 75) return { level: "Power User", color: "indigo", nextLevel: "Champion", pointsToNext: 90 - score };
    if (score >= 60) return { level: "Engaged", color: "blue", nextLevel: "Power User", pointsToNext: 75 - score };
    if (score >= 40) return { level: "Active", color: "green", nextLevel: "Engaged", pointsToNext: 60 - score };
    return { level: "New", color: "gray", nextLevel: "Active", pointsToNext: 40 - score };
  }, [metrics]);
  
  const handleNPSSubmit = () => {
    if (npsRating !== null) {
      // In production, would send to analytics
      console.log("NPS submitted:", { rating: npsRating, feedback: npsFeedback });
      setNpsSubmitted(true);
      setTimeout(() => {
        setShowNPSModal(false);
        setNpsSubmitted(false);
        setNpsRating(null);
        setNpsFeedback("");
      }, 2000);
    }
  };
  
  const completedMilestones = metrics?.milestonesReached || [];
  const totalPoints = MILESTONES
    .filter(m => completedMilestones.some(cm => cm.toLowerCase().includes(m.name.toLowerCase().split(" ")[0])))
    .reduce((sum, m) => sum + m.points, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
      <Header />
      <DemoBanner />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎯 Your Maven Journey
          </h1>
          <p className="text-gray-400">
            Track your engagement, earn milestones, and see how you're using Maven to build wealth.
          </p>
        </div>

        {/* Engagement Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
            <p className="text-gray-400 text-sm">Engagement Level</p>
            <p className={`text-2xl font-bold text-${engagementLevel.color}-400`}>
              {engagementLevel.level}
            </p>
            {engagementLevel.nextLevel && (
              <p className="text-xs text-gray-500">{engagementLevel.pointsToNext} pts to {engagementLevel.nextLevel}</p>
            )}
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
            <p className="text-gray-400 text-sm">Login Streak</p>
            <p className="text-2xl font-bold text-orange-400">
              {metrics?.loginStreak || 0} days 🔥
            </p>
            <p className="text-xs text-gray-500">Keep it going!</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
            <p className="text-gray-400 text-sm">Milestones Earned</p>
            <p className="text-2xl font-bold text-green-400">
              {completedMilestones.length}
            </p>
            <p className="text-xs text-gray-500">{totalPoints} points</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
            <p className="text-gray-400 text-sm">Time on Maven</p>
            <p className="text-2xl font-bold text-blue-400">
              {metrics?.timeOnPlatform || 0}m
            </p>
            <p className="text-xs text-gray-500">This month</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "features", label: "Feature Usage", icon: "🗺️" },
            { id: "milestones", label: "Milestones", icon: "🏆" },
            { id: "referrals", label: "Referrals", icon: "🤝" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
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
          
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">📊 Engagement Overview</h2>
              
              {/* Engagement Score Gauge */}
              <div className="flex items-center justify-center py-8">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="12"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke={
                        (metrics?.engagementScore || 0) >= 75 ? "#8b5cf6" :
                        (metrics?.engagementScore || 0) >= 50 ? "#6366f1" :
                        (metrics?.engagementScore || 0) >= 25 ? "#3b82f6" : "#64748b"
                      }
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${((metrics?.engagementScore || 0) / 100) * 553} 553`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-4xl font-bold text-white">{metrics?.engagementScore || 0}</p>
                    <p className="text-sm text-gray-400">Engagement Score</p>
                  </div>
                </div>
              </div>
              
              {/* Activity Summary */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Total Logins</p>
                  <p className="text-2xl font-bold text-white">{metrics?.totalLogins || 0}</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Actions Taken</p>
                  <p className="text-2xl font-bold text-white">{metrics?.actionsCompleted || 0}</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Last Active</p>
                  <p className="text-2xl font-bold text-white">
                    {metrics?.lastLogin ? formatTimeAgo(metrics.lastLogin) : "Never"}
                  </p>
                </div>
              </div>
              
              {/* Quick Feedback */}
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">How's Maven working for you?</p>
                    <p className="text-sm text-gray-400">Share quick feedback to help us improve</p>
                  </div>
                  <button
                    onClick={() => setShowNPSModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                  >
                    Share Feedback
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feature Usage Tab */}
          {activeTab === "features" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">🗺️ Feature Usage</h2>
              <p className="text-gray-400">See which features you use most and discover ones you haven't tried.</p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {FEATURE_CARDS.map(feature => {
                  const usage = metrics?.favoriteFeatures.find(f => 
                    f.name.toLowerCase() === feature.name.toLowerCase()
                  );
                  const visits = usage?.visits || 0;
                  const isUnexplored = visits === 0;
                  
                  return (
                    <a
                      key={feature.id}
                      href={`/${feature.id}`}
                      className={`p-4 rounded-xl border transition ${
                        isUnexplored 
                          ? "bg-gray-900/30 border-gray-700 border-dashed hover:border-indigo-500" 
                          : "bg-gray-900/50 border-gray-700 hover:border-indigo-500"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{feature.icon}</span>
                        <div>
                          <p className={`font-medium ${isUnexplored ? "text-gray-500" : "text-white"}`}>
                            {feature.name}
                          </p>
                          <p className="text-xs text-gray-500">{feature.description}</p>
                        </div>
                      </div>
                      
                      {isUnexplored ? (
                        <p className="text-xs text-indigo-400 mt-2">✨ Try this feature</p>
                      ) : (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Visits</span>
                            <span className="text-white">{visits}</span>
                          </div>
                          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500" 
                              style={{ width: `${Math.min(100, (visits / 30) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === "milestones" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">🏆 Milestones</h2>
                <p className="text-indigo-400 font-semibold">{totalPoints} total points</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {MILESTONES.map(milestone => {
                  const isCompleted = completedMilestones.some(cm => 
                    cm.toLowerCase().includes(milestone.name.toLowerCase().split(" ")[0])
                  );
                  
                  return (
                    <div
                      key={milestone.id}
                      className={`p-4 rounded-xl border ${
                        isCompleted 
                          ? "bg-green-500/10 border-green-500/30" 
                          : "bg-gray-900/50 border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-3xl ${isCompleted ? "" : "grayscale opacity-50"}`}>
                          {milestone.icon}
                        </span>
                        <div className="flex-1">
                          <p className={`font-medium ${isCompleted ? "text-green-400" : "text-gray-400"}`}>
                            {milestone.name}
                          </p>
                          <p className="text-xs text-gray-500">{milestone.points} points</p>
                        </div>
                        {isCompleted && (
                          <span className="text-green-400 text-xl">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === "referrals" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">🤝 Refer Friends</h2>
              <p className="text-gray-400">
                Love Maven? Share it with friends and earn rewards when they join.
              </p>
              
              <div className="p-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-2">Your Referral Link</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://mavenwealth.ai/ref/${userProfile?.firstName?.toLowerCase() || "user"}123`}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                  <button 
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://mavenwealth.ai/ref/${userProfile?.firstName?.toLowerCase() || "user"}123`);
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-xl text-center">
                  <p className="text-3xl font-bold text-white">0</p>
                  <p className="text-gray-400 text-sm">Friends Referred</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-xl text-center">
                  <p className="text-3xl font-bold text-white">0</p>
                  <p className="text-gray-400 text-sm">Pending Invites</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-xl text-center">
                  <p className="text-3xl font-bold text-green-400">$0</p>
                  <p className="text-gray-400 text-sm">Rewards Earned</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-xl">
                <h3 className="font-semibold text-white mb-3">How It Works</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>1. Share your unique referral link with friends</p>
                  <p>2. They sign up and complete onboarding</p>
                  <p>3. Both you and your friend earn rewards</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* NPS Modal */}
        {showNPSModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
              {!npsSubmitted ? (
                <>
                  <h2 className="text-xl font-bold text-white mb-4">Quick Feedback</h2>
                  <p className="text-gray-300 mb-6">{NPS_QUESTIONS[0]}</p>
                  
                  {/* NPS Scale */}
                  <div className="flex justify-between gap-1 mb-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <button
                        key={num}
                        onClick={() => setNpsRating(num)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                          npsRating === num
                            ? num <= 6 ? "bg-red-500 text-white" : num <= 8 ? "bg-amber-500 text-white" : "bg-green-500 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-6">
                    <span>Not likely</span>
                    <span>Very likely</span>
                  </div>
                  
                  {/* Optional feedback */}
                  <textarea
                    placeholder="Any additional feedback? (optional)"
                    value={npsFeedback}
                    onChange={(e) => setNpsFeedback(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mb-4 h-24"
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowNPSModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNPSSubmit}
                      disabled={npsRating === null}
                      className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <span className="text-5xl mb-4 block">🙏</span>
                  <h2 className="text-xl font-bold text-white mb-2">Thank You!</h2>
                  <p className="text-gray-400">Your feedback helps us improve Maven.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
