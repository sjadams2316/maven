'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useUserProfile } from '@/providers/UserProvider';

const GOALS = [
  { id: 'retirement', icon: '🏖️', label: 'Retire comfortably', desc: 'Build wealth for financial independence' },
  { id: 'grow', icon: '📈', label: 'Grow my wealth', desc: 'Maximize returns on my investments' },
  { id: 'protect', icon: '🛡️', label: 'Protect what I have', desc: 'Preserve capital, minimize risk' },
  { id: 'income', icon: '💰', label: 'Generate income', desc: 'Create passive income streams' },
  { id: 'education', icon: '🎓', label: 'Save for education', desc: 'Fund college for kids or myself' },
  { id: 'house', icon: '🏠', label: 'Buy a home', desc: 'Save for down payment or new home' },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: "I'm new to investing", icon: '🌱' },
  { id: 'intermediate', label: 'Intermediate', desc: 'I know the basics', icon: '🌿' },
  { id: 'advanced', label: 'Advanced', desc: 'I actively manage my portfolio', icon: '🌳' },
];

const RISK_LEVELS = [
  { id: 'conservative', label: 'Conservative', desc: 'Prefer stability over growth', color: 'from-blue-500 to-cyan-500' },
  { id: 'moderate', label: 'Moderate', desc: 'Balance of growth and safety', color: 'from-emerald-500 to-teal-500' },
  { id: 'aggressive', label: 'Aggressive', desc: 'Maximize growth, accept volatility', color: 'from-orange-500 to-red-500' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { updateProfile } = useUserProfile();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    goals: [] as string[],
    experience: '',
    risk: '',
    netWorth: '',
    hasAdvisor: null as boolean | null,
  });
  
  // Get user's first name for personalization
  const firstName = user?.firstName || 'there';
  
  const totalSteps = 5;
  
  const toggleGoal = (goalId: string) => {
    setSelections(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId],
    }));
  };
  
  const canProceed = () => {
    switch (step) {
      case 1: return selections.goals.length > 0;
      case 2: return selections.experience !== '';
      case 3: return selections.risk !== '';
      case 4: return selections.netWorth !== '';
      case 5: return selections.hasAdvisor !== null;
      default: return true;
    }
  };
  
  const handleComplete = async () => {
    // Save basic preferences to profile
    await updateProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.emailAddresses?.[0]?.emailAddress || '',
      primaryGoal: selections.goals[0] || '',
      riskTolerance: selections.risk as any,
      investmentExperience: selections.experience as any,
    });
    
    // Also save to localStorage for backward compatibility
    localStorage.setItem('maven_onboarding', JSON.stringify({
      ...selections,
      completedAt: new Date().toISOString(),
    }));
    
    // Go to detailed financial profile setup
    router.push('/profile/setup');
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
              M
            </div>
            <span className="text-xl font-bold text-white">Maven</span>
          </Link>
          
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition text-sm"
          >
            Skip for now
          </button>
        </div>
      </header>
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Step 1: Goals */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Hey {firstName}! What are your financial goals?
              </h1>
              <p className="text-gray-400">Select all that apply. We'll personalize Maven for you.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-3">
              {GOALS.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-xl border text-left transition ${
                    selections.goals.includes(goal.id)
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <p className={`font-medium ${selections.goals.includes(goal.id) ? 'text-white' : 'text-gray-300'}`}>
                        {goal.label}
                      </p>
                      <p className="text-sm text-gray-500">{goal.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                How experienced are you with investing?
              </h1>
              <p className="text-gray-400">This helps us tailor our explanations and insights.</p>
            </div>
            
            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelections({ ...selections, experience: level.id })}
                  className={`w-full p-5 rounded-xl border text-left transition ${
                    selections.experience === level.id
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{level.icon}</span>
                    <div>
                      <p className={`font-medium text-lg ${selections.experience === level.id ? 'text-white' : 'text-gray-300'}`}>
                        {level.label}
                      </p>
                      <p className="text-gray-500">{level.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 3: Risk Tolerance */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                What's your risk tolerance?
              </h1>
              <p className="text-gray-400">How do you feel about market volatility?</p>
            </div>
            
            <div className="space-y-3">
              {RISK_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelections({ ...selections, risk: level.id })}
                  className={`w-full p-5 rounded-xl border text-left transition ${
                    selections.risk === level.id
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center`}>
                      {level.id === 'conservative' && '🐢'}
                      {level.id === 'moderate' && '⚖️'}
                      {level.id === 'aggressive' && '🚀'}
                    </div>
                    <div>
                      <p className={`font-medium text-lg ${selections.risk === level.id ? 'text-white' : 'text-gray-300'}`}>
                        {level.label}
                      </p>
                      <p className="text-gray-500">{level.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 4: Net Worth */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                What's your approximate net worth?
              </h1>
              <p className="text-gray-400">This helps us provide relevant insights. Your data is private.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: '<100k', label: 'Under $100K' },
                { id: '100k-250k', label: '$100K - $250K' },
                { id: '250k-500k', label: '$250K - $500K' },
                { id: '500k-1m', label: '$500K - $1M' },
                { id: '1m-5m', label: '$1M - $5M' },
                { id: '5m+', label: '$5M+' },
              ].map(range => (
                <button
                  key={range.id}
                  onClick={() => setSelections({ ...selections, netWorth: range.id })}
                  className={`p-4 rounded-xl border text-center transition ${
                    selections.netWorth === range.id
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className={`font-medium ${selections.netWorth === range.id ? 'text-white' : 'text-gray-300'}`}>
                    {range.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 5: Advisor */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Do you work with a financial advisor?
              </h1>
              <p className="text-gray-400">Maven can work alongside your advisor or solo.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => setSelections({ ...selections, hasAdvisor: true })}
                className={`p-6 rounded-xl border text-center transition ${
                  selections.hasAdvisor === true
                    ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-4xl block mb-3">🤝</span>
                <p className={`font-medium text-lg ${selections.hasAdvisor === true ? 'text-white' : 'text-gray-300'}`}>
                  Yes, I have an advisor
                </p>
                <p className="text-sm text-gray-500 mt-1">Maven will complement their guidance</p>
              </button>
              
              <button
                onClick={() => setSelections({ ...selections, hasAdvisor: false })}
                className={`p-6 rounded-xl border text-center transition ${
                  selections.hasAdvisor === false
                    ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-4xl block mb-3">🦸</span>
                <p className={`font-medium text-lg ${selections.hasAdvisor === false ? 'text-white' : 'text-gray-300'}`}>
                  No, I manage myself
                </p>
                <p className="text-sm text-gray-500 mt-1">Maven will be your AI wealth partner</p>
              </button>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            className={`px-4 py-2 text-gray-400 hover:text-white transition ${step === 1 ? 'invisible' : ''}`}
          >
            ← Back
          </button>
          
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canProceed()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium rounded-xl transition"
            >
              Continue to Profile Setup →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
