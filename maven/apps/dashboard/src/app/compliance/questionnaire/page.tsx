'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  category: string;
  question: string;
  type: 'single' | 'scale' | 'multi';
  options?: { value: number; label: string; description?: string }[];
  weight: number;
}

const questions: Question[] = [
  {
    id: 'time_horizon',
    category: 'Investment Timeline',
    question: 'When do you expect to need the majority of this money?',
    type: 'single',
    weight: 2,
    options: [
      { value: 1, label: 'Less than 3 years', description: 'Short-term goals or near retirement' },
      { value: 2, label: '3-5 years', description: 'Medium-term goals' },
      { value: 3, label: '6-10 years', description: 'Longer-term planning' },
      { value: 4, label: '11-20 years', description: 'Long-term wealth building' },
      { value: 5, label: 'More than 20 years', description: 'Maximum growth horizon' },
    ],
  },
  {
    id: 'loss_reaction',
    category: 'Risk Tolerance',
    question: 'If your portfolio lost 20% of its value in a month, what would you do?',
    type: 'single',
    weight: 3,
    options: [
      { value: 1, label: 'Sell everything immediately', description: 'Protect remaining capital at all costs' },
      { value: 2, label: 'Sell some to reduce exposure', description: 'Reduce risk but stay invested' },
      { value: 3, label: 'Hold and wait for recovery', description: 'Stay the course' },
      { value: 4, label: 'Buy more at lower prices', description: 'See volatility as opportunity' },
    ],
  },
  {
    id: 'experience',
    category: 'Investment Experience',
    question: 'How would you describe your investment experience?',
    type: 'single',
    weight: 1,
    options: [
      { value: 1, label: 'Beginner', description: 'New to investing, mostly savings accounts' },
      { value: 2, label: 'Some experience', description: 'Have owned stocks or mutual funds' },
      { value: 3, label: 'Experienced', description: 'Actively manage investments, understand markets' },
      { value: 4, label: 'Sophisticated', description: 'Use advanced strategies, options, alternatives' },
    ],
  },
  {
    id: 'income_stability',
    category: 'Financial Situation',
    question: 'How stable is your current income?',
    type: 'single',
    weight: 1.5,
    options: [
      { value: 1, label: 'Unstable / Variable', description: 'Freelance, commission-based, or uncertain' },
      { value: 2, label: 'Somewhat stable', description: 'Generally reliable with some variation' },
      { value: 3, label: 'Very stable', description: 'Steady salary or guaranteed income' },
      { value: 4, label: 'Multiple income sources', description: 'Diversified and resilient' },
    ],
  },
  {
    id: 'emergency_fund',
    category: 'Financial Situation',
    question: 'How many months of expenses do you have in easily accessible savings?',
    type: 'single',
    weight: 1,
    options: [
      { value: 1, label: 'Less than 1 month' },
      { value: 2, label: '1-3 months' },
      { value: 3, label: '3-6 months' },
      { value: 4, label: '6-12 months' },
      { value: 5, label: 'More than 12 months' },
    ],
  },
  {
    id: 'volatility_comfort',
    category: 'Risk Tolerance',
    question: 'On a scale of 1-10, how comfortable are you with seeing your portfolio value fluctuate significantly?',
    type: 'scale',
    weight: 2,
    options: [
      { value: 1, label: '1 - Very uncomfortable' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' },
      { value: 5, label: '5 - Neutral' },
      { value: 6, label: '6' },
      { value: 7, label: '7' },
      { value: 8, label: '8' },
      { value: 9, label: '9' },
      { value: 10, label: '10 - Very comfortable' },
    ],
  },
  {
    id: 'primary_goal',
    category: 'Investment Goals',
    question: 'What is your primary investment goal?',
    type: 'single',
    weight: 2,
    options: [
      { value: 1, label: 'Preserve capital', description: 'Protect what I have, minimal risk' },
      { value: 2, label: 'Generate income', description: 'Regular dividends and interest' },
      { value: 3, label: 'Balanced growth', description: 'Grow wealth with moderate risk' },
      { value: 4, label: 'Aggressive growth', description: 'Maximize returns, accept higher risk' },
    ],
  },
  {
    id: 'withdrawal_needs',
    category: 'Investment Timeline',
    question: 'Do you anticipate needing to withdraw from this portfolio regularly?',
    type: 'single',
    weight: 1.5,
    options: [
      { value: 4, label: 'No withdrawals planned', description: 'Fully accumulating' },
      { value: 3, label: 'Occasional withdrawals', description: 'Every few years for major expenses' },
      { value: 2, label: 'Annual withdrawals', description: 'Supplement income yearly' },
      { value: 1, label: 'Regular monthly income', description: 'Living off portfolio' },
    ],
  },
];

const riskProfiles = [
  { min: 0, max: 25, name: 'Conservative', color: 'blue', allocation: { stocks: 20, bonds: 70, cash: 10 }, description: 'Focus on capital preservation with minimal volatility.' },
  { min: 26, max: 45, name: 'Moderately Conservative', color: 'cyan', allocation: { stocks: 35, bonds: 55, cash: 10 }, description: 'Emphasis on stability with modest growth potential.' },
  { min: 46, max: 65, name: 'Moderate', color: 'green', allocation: { stocks: 50, bonds: 40, cash: 10 }, description: 'Balanced approach seeking growth with managed risk.' },
  { min: 66, max: 80, name: 'Moderately Aggressive', color: 'yellow', allocation: { stocks: 70, bonds: 25, cash: 5 }, description: 'Growth-oriented with tolerance for market fluctuations.' },
  { min: 81, max: 100, name: 'Aggressive', color: 'red', allocation: { stocks: 90, bonds: 8, cash: 2 }, description: 'Maximum growth potential, comfortable with significant volatility.' },
];

export default function RiskQuestionnairePage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (value: number) => {
    const question = questions[currentQuestion];
    setAnswers({ ...answers, [question.id]: value });
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let totalWeight = 0;
    
    questions.forEach(q => {
      if (answers[q.id]) {
        const maxValue = Math.max(...(q.options?.map(o => o.value) || [1]));
        const normalizedScore = (answers[q.id] / maxValue) * 100;
        totalScore += normalizedScore * q.weight;
        totalWeight += q.weight;
      }
    });
    
    return Math.round(totalScore / totalWeight);
  };

  const getProfile = (score: number) => {
    return riskProfiles.find(p => score >= p.min && score <= p.max) || riskProfiles[2];
  };

  if (showResults) {
    const score = calculateScore();
    const profile = getProfile(score);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-3xl font-bold mb-2">Your Risk Profile</h1>
            <p className="text-slate-400">Based on your responses</p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 mb-6">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">{profile.name}</div>
              <div className="text-slate-400">Risk Score: {score}/100</div>
            </div>

            {/* Score Bar */}
            <div className="mb-8">
              <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500 transition-all duration-1000"
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Conservative</span>
                <span>Moderate</span>
                <span>Aggressive</span>
              </div>
            </div>

            <p className="text-slate-300 text-center mb-8">{profile.description}</p>

            {/* Suggested Allocation */}
            <div className="bg-slate-900/50 rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-center">Suggested Asset Allocation</h3>
              <div className="flex gap-4 justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-purple-500/20 border-4 border-purple-500 flex items-center justify-center mb-2">
                    <span className="text-xl font-bold">{profile.allocation.stocks}%</span>
                  </div>
                  <span className="text-sm text-slate-400">Stocks</span>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-blue-500/20 border-4 border-blue-500 flex items-center justify-center mb-2">
                    <span className="text-xl font-bold">{profile.allocation.bonds}%</span>
                  </div>
                  <span className="text-sm text-slate-400">Bonds</span>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center mb-2">
                    <span className="text-xl font-bold">{profile.allocation.cash}%</span>
                  </div>
                  <span className="text-sm text-slate-400">Cash</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers({});
              }}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
            >
              Retake Questionnaire
            </button>
            <button
              onClick={() => router.push('/compliance')}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
            >
              Save & Continue
            </button>
          </div>

          <p className="text-center text-slate-500 text-sm mt-6">
            This assessment is for informational purposes and helps guide investment discussions.
            Your advisor will review these results with you.
          </p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>{question.category}</span>
            <span>{currentQuestion + 1} of {questions.length}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-8">{question.question}</h2>

          {question.type === 'scale' ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                {question.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      answers[question.id] === option.value
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-slate-600 hover:border-purple-400'
                    }`}
                  >
                    {option.value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Very Uncomfortable</span>
                <span>Very Comfortable</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {question.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    answers[question.id] === option.value
                      ? 'bg-purple-500/20 border-purple-500'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-slate-400 mt-1">{option.description}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          {currentQuestion < questions.length - 1 && answers[question.id] && (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
