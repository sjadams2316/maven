'use client';

import { useState } from 'react';
import HybridModelView from './HybridModelView';

// Research-backed risk profiling based on asset allocation frameworks
const QUESTIONS = [
  {
    id: 'time_horizon',
    question: 'When do you expect to need this money?',
    subtext: 'Time horizon is the most important factor in determining risk capacity.',
    options: [
      { value: 1, label: 'Less than 3 years', desc: 'Short-term savings, emergency fund' },
      { value: 2, label: '3-5 years', desc: 'Near-term goals like home purchase' },
      { value: 3, label: '5-10 years', desc: 'Medium-term goals' },
      { value: 4, label: '10-20 years', desc: 'Long-term growth' },
      { value: 5, label: '20+ years', desc: 'Retirement, generational wealth' },
    ]
  },
  {
    id: 'drawdown_tolerance',
    question: 'If your portfolio dropped 30% in a market crash, what would you do?',
    subtext: 'Past behavior in downturns is the most informative measure of risk tolerance.',
    options: [
      { value: 1, label: 'Sell everything', desc: "I can't handle that kind of loss" },
      { value: 2, label: 'Sell some to reduce risk', desc: 'Protect what I have left' },
      { value: 3, label: 'Hold steady', desc: 'Ride it out, markets recover' },
      { value: 4, label: 'Buy a little more', desc: 'Opportunity to get in cheaper' },
      { value: 5, label: 'Buy aggressively', desc: 'This is when wealth is built' },
    ]
  },
  {
    id: 'income_stability',
    question: 'How stable is your income?',
    subtext: 'Human capital affects risk capacity. Stable income = bond-like, so you can take more portfolio risk.',
    options: [
      { value: 1, label: 'Very unstable', desc: 'Commission-based, gig work, volatile' },
      { value: 2, label: 'Somewhat unstable', desc: 'Bonus-heavy, cyclical industry' },
      { value: 3, label: 'Moderately stable', desc: 'Steady job but not guaranteed' },
      { value: 4, label: 'Very stable', desc: 'Government, tenured, long-term contract' },
      { value: 5, label: 'Extremely stable + growing', desc: 'High earner with career runway' },
    ]
  },
  {
    id: 'loss_experience',
    question: 'Have you experienced a significant investment loss before?',
    subtext: 'Real experience with losses reveals true risk tolerance better than hypotheticals.',
    options: [
      { value: 1, label: 'Yes, and I never want to again', desc: 'It was traumatic' },
      { value: 2, label: 'Yes, it was very stressful', desc: 'Lost sleep over it' },
      { value: 3, label: 'Yes, but I handled it okay', desc: 'Uncomfortable but manageable' },
      { value: 4, label: 'Yes, and I learned from it', desc: 'Made me a better investor' },
      { value: 5, label: "No, or it didn't bother me", desc: 'Losses are part of investing' },
    ]
  },
  {
    id: 'portfolio_purpose',
    question: 'What is the primary purpose of this portfolio?',
    subtext: 'Goals drive the required return and acceptable risk level.',
    options: [
      { value: 1, label: 'Preserve capital', desc: "Don't lose what I have" },
      { value: 2, label: 'Generate income', desc: 'Steady cash flow for living expenses' },
      { value: 3, label: 'Balanced growth & income', desc: 'Grow while managing risk' },
      { value: 4, label: 'Long-term growth', desc: 'Maximize wealth over time' },
      { value: 5, label: 'Aggressive growth', desc: 'Maximum returns, accept high volatility' },
    ]
  }
];

// Research-backed allocation recommendations
const RISK_PROFILES = {
  conservative: {
    name: 'Conservative',
    score: [5, 9],
    description: 'Capital preservation focus. Prioritize stability over growth.',
    allocation: {
      'US Equity': 20,
      'Intl Developed': 5,
      'Emerging Markets': 0,
      'US Bonds': 55,
      'TIPS': 10,
      'Short-Term Bonds': 10,
    },
    expectedReturn: '4.5-5.5%',
    expectedVolatility: '6-8%',
    maxDrawdown: '-10 to -15%',
    color: 'blue'
  },
  moderate_conservative: {
    name: 'Moderately Conservative',
    score: [10, 13],
    description: 'Income with some growth. Lower volatility than balanced.',
    allocation: {
      'US Equity': 30,
      'Intl Developed': 8,
      'Emerging Markets': 2,
      'US Bonds': 45,
      'TIPS': 10,
      'REITs': 5,
    },
    expectedReturn: '5.0-6.0%',
    expectedVolatility: '8-10%',
    maxDrawdown: '-15 to -20%',
    color: 'cyan'
  },
  moderate: {
    name: 'Moderate',
    score: [14, 17],
    description: 'Classic balanced approach. Growth and income in equilibrium.',
    allocation: {
      'US Equity': 40,
      'Intl Developed': 12,
      'Emerging Markets': 8,
      'US Bonds': 30,
      'TIPS': 5,
      'REITs': 5,
    },
    expectedReturn: '5.5-6.5%',
    expectedVolatility: '10-12%',
    maxDrawdown: '-20 to -30%',
    color: 'green'
  },
  growth: {
    name: 'Growth',
    score: [18, 21],
    description: 'Higher equity allocation. Accept volatility for better long-term returns.',
    allocation: {
      'US Equity': 50,
      'Intl Developed': 18,
      'Emerging Markets': 12,
      'US Bonds': 15,
      'REITs': 5,
    },
    expectedReturn: '6.0-7.5%',
    expectedVolatility: '13-16%',
    maxDrawdown: '-30 to -40%',
    color: 'emerald'
  },
  aggressive: {
    name: 'Aggressive',
    score: [22, 25],
    description: 'Maximum growth focus. Long time horizon required.',
    allocation: {
      'US Equity': 55,
      'Intl Developed': 22,
      'Emerging Markets': 15,
      'US Bonds': 5,
      'REITs': 3,
    },
    expectedReturn: '6.5-8.0%',
    expectedVolatility: '16-20%',
    maxDrawdown: '-40 to -55%',
    color: 'orange'
  }
};

function getProfile(score) {
  for (const [key, profile] of Object.entries(RISK_PROFILES)) {
    if (score >= profile.score[0] && score <= profile.score[1]) {
      return { key, ...profile };
    }
  }
  return { key: 'moderate', ...RISK_PROFILES.moderate };
}

export default function RiskProfiler({ onComplete, onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showHybridAnalysis, setShowHybridAnalysis] = useState(false);

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const profile = getProfile(totalScore);

  const handleApply = () => {
    // Convert to the format AutoOptimizer expects
    const simpleAllocation = {
      'US Equity': (profile.allocation['US Equity'] || 0),
      'Intl Developed': (profile.allocation['Intl Developed'] || 0),
      'Emerging Markets': (profile.allocation['Emerging Markets'] || 0),
      'US Bonds': (profile.allocation['US Bonds'] || 0) + 
                  (profile.allocation['TIPS'] || 0) + 
                  (profile.allocation['Short-Term Bonds'] || 0),
    };
    onComplete(simpleAllocation, profile);
  };

  if (showResult) {
    // If showing hybrid analysis, render fullscreen analysis view
    if (showHybridAnalysis) {
      return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-50 rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowHybridAnalysis(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back to Profile
                </button>
                <div>
                  <p className="text-sm text-gray-500">Your Profile: <span className="font-medium">{profile.name}</span></p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Hybrid Model Analysis */}
            <div className="p-6">
              <HybridModelView 
                riskProfile={profile.key} 
                onGeneratePortfolio={(portfolioData) => {
                  // portfolioData contains { allocation, recommendations, modelName, insights }
                  onComplete(portfolioData, profile);
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className={`bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-80 mb-1">Your Risk Profile</p>
                <h2 className="text-3xl font-bold">{profile.name}</h2>
                <p className="mt-2 opacity-90">{profile.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Score</p>
                <p className="text-4xl font-bold">{totalScore}/25</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* PRIMARY CTA - All-Star Analysis */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">🏆 Build Your All-Star Portfolio</h3>
              <p className="opacity-90 mb-4 text-sm">
                We analyzed models from Vanguard, BlackRock, JPMorgan, Fidelity & more. 
                See how we combine their best ideas into one optimized portfolio.
              </p>
              <button
                onClick={() => setShowHybridAnalysis(true)}
                className="w-full py-4 bg-white text-indigo-700 rounded-xl font-bold text-lg hover:bg-indigo-50 transition shadow-lg"
              >
                ⭐ View All-Star Hybrid Model →
              </button>
            </div>

            {/* Expected Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Expected Return</p>
                <p className="text-xl font-bold text-green-600">{profile.expectedReturn}</p>
                <p className="text-xs text-gray-400">10-year annualized</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Expected Volatility</p>
                <p className="text-xl font-bold text-blue-600">{profile.expectedVolatility}</p>
                <p className="text-xs text-gray-400">annual std dev</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Max Drawdown</p>
                <p className="text-xl font-bold text-red-600">{profile.maxDrawdown}</p>
                <p className="text-xs text-gray-400">worst case</p>
              </div>
            </div>

            {/* Recommended Allocation */}
            <div>
              <h3 className="font-semibold mb-3">Recommended Allocation</h3>
              <div className="space-y-2">
                {Object.entries(profile.allocation).filter(([_, v]) => v > 0).map(([asset, weight]) => (
                  <div key={asset} className="flex items-center gap-3">
                    <span className="w-32 text-sm text-gray-600">{asset}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${weight}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-bold">{weight}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Research Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
              <p className="font-medium text-blue-800 mb-1">📚 Based on Research</p>
              <p className="text-blue-700">
                This allocation is informed by capital market assumptions from Vanguard, JPMorgan, and BlackRock's 
                2025 outlooks. Expected returns reflect current valuations (lower than historical averages) 
                and assume a 10-15 year investment horizon.
              </p>
            </div>

            {/* Answer Summary */}
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                View your answers →
              </summary>
              <div className="mt-3 space-y-2 text-gray-600">
                {QUESTIONS.map(q => (
                  <div key={q.id} className="flex justify-between">
                    <span>{q.question.substring(0, 40)}...</span>
                    <span className="font-medium">{answers[q.id]}/5</span>
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* Actions */}
          <div className="border-t p-4 space-y-3">
            <button
              onClick={handleApply}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition shadow-lg"
            >
              🚀 Generate My Optimized Portfolio
            </button>
            <p className="text-center text-sm text-gray-500">
              We'll build you a diversified portfolio using the best funds for each asset class
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowResult(false); setStep(0); setAnswers({}); }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Retake Quiz
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl">
        {/* Progress */}
        <div className="h-1 bg-gray-100 rounded-t-2xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Question {step + 1} of {QUESTIONS.length}</p>
              <h2 className="text-xl font-semibold mt-1">{currentQuestion.question}</h2>
              <p className="text-sm text-gray-500 mt-1">{currentQuestion.subtext}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-500 flex items-center justify-center transition">
                  <span className="text-transparent group-hover:text-white font-bold text-sm">
                    {option.value}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="p-4 border-t flex justify-between">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            disabled={step === 0}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-30"
          >
            ← Back
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            Skip Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
