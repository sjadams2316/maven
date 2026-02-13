'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Brain, Users, Heart, Target, Clock, Star } from 'lucide-react';

interface OnboardingStepProps {
  title: string;
  description: string;
  children: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
}

function OnboardingStep({ title, description, children, isActive, isCompleted }: OnboardingStepProps) {
  if (!isActive && !isCompleted) {
    return (
      <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 opacity-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-400">?</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-400">{title}</h3>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl border transition-all ${
      isCompleted 
        ? 'bg-green-500/10 border-green-500/30' 
        : 'bg-[#12121a] border-white/20'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isCompleted ? 'bg-green-500' : 'bg-indigo-600'
        }`}>
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <span className="text-sm font-medium text-white">!</span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-300 mb-6">{description}</p>
      {children}
    </div>
  );
}

export default function ClientOnboardingSystem() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [responses, setResponses] = useState<any>({});

  const totalSteps = 6;

  const markStepCompleted = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const updateResponse = (key: string, value: any) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const steps = [
    {
      id: 1,
      title: "Personal Foundation & Money Psychology", 
      description: "Understanding your background and relationship with money",
      icon: <Brain className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-indigo-500"
                placeholder="John & Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Family Status</label>
              <select className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
                <option>Married with children</option>
                <option>Married, no children</option>
                <option>Single</option>
                <option>Divorced</option>
                <option>Widowed</option>
              </select>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              What drives your financial decisions most?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'security', label: '🛡️ Security & Safety', desc: 'Protecting what we have' },
                { key: 'growth', label: '📈 Wealth Building', desc: 'Growing our assets' },
                { key: 'legacy', label: '🏛️ Family Legacy', desc: 'Providing for future generations' },
                { key: 'freedom', label: '🗽 Independence', desc: 'Having choices and options' }
              ].map(option => (
                <button key={option.key} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors">
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-gray-400 text-sm">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">What's your biggest financial worry?</h4>
            <div className="space-y-2">
              {[
                'Market crashes wiping out savings',
                'Running out of money in retirement', 
                'Inflation eroding purchasing power',
                'Becoming a burden on family',
                'Not leaving anything for children',
                'Economic uncertainty and job security'
              ].map(worry => (
                <label key={worry} className="flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg cursor-pointer">
                  <input type="radio" name="biggest_worry" className="text-indigo-600" />
                  <span className="text-gray-300">{worry}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Family Dynamics & Decision Making",
      description: "How your family approaches financial decisions together",
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-medium mb-3">How are major financial decisions made in your household?</h4>
            <div className="space-y-3">
              {[
                '👤 I make most decisions independently',
                '🤝 We discuss everything together as partners',
                '👥 We involve extended family or advisors',
                '⚖️ One spouse typically leads financial decisions'
              ].map(style => (
                <button key={style} className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left text-white transition-colors">
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">How open is your family about money?</h4>
            <div className="space-y-3">
              {[
                '📖 Completely transparent - everyone knows everything',
                '📋 Generally open - share most information',
                '📁 Compartmentalized - different people know different things',
                '🔒 Private - financial details are need-to-know only'
              ].map(openness => (
                <button key={openness} className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left text-white transition-colors">
                  {openness}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">Family responsibilities to consider:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                '👴 Aging parents who may need care',
                '🎓 Supporting adult children',
                '🏢 Family business involvement',
                '💰 Expected inheritance',
                '🤝 Extended family obligations',
                '✨ None of these apply'
              ].map(responsibility => (
                <label key={responsibility} className="flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg cursor-pointer">
                  <input type="checkbox" className="rounded text-indigo-600" />
                  <span className="text-gray-300 text-sm">{responsibility}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Communication & Service Preferences",
      description: "How you prefer to work with your advisor",
      icon: <Heart className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-medium mb-3">How often would you like to hear from us?</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { freq: 'weekly', label: 'Weekly', desc: 'Regular check-ins', emoji: '📅' },
                { freq: 'monthly', label: 'Monthly', desc: 'Consistent updates', emoji: '📊' },
                { freq: 'quarterly', label: 'Quarterly', desc: 'Strategic reviews', emoji: '📈' },
                { freq: 'as_needed', label: 'As Needed', desc: 'When necessary', emoji: '🔔' }
              ].map(option => (
                <button key={option.freq} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors">
                  <div className="text-2xl mb-2">{option.emoji}</div>
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-gray-400 text-sm">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">Preferred communication methods:</h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { method: 'email', label: '📧 Email' },
                { method: 'phone', label: '📞 Phone' },
                { method: 'text', label: '💬 Text' },
                { method: 'video', label: '📹 Video' },
                { method: 'in_person', label: '🤝 In Person' }
              ].map(option => (
                <label key={option.method} className="flex flex-col items-center gap-2 p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg cursor-pointer">
                  <input type="checkbox" className="rounded text-indigo-600" />
                  <span className="text-gray-300 text-sm text-center">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">When markets get volatile, I prefer:</h4>
            <div className="space-y-3">
              {[
                '📞 Proactive calls explaining what\'s happening',
                '📊 Data and charts showing historical context',
                '🤝 Simple reassurance we\'re sticking to the plan',
                '📋 Detailed analysis of potential impacts',
                '🔕 Nothing unless I reach out first'
              ].map(pref => (
                <button key={pref} className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left text-white transition-colors">
                  {pref}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Goals & Life Vision",
      description: "What you're hoping to accomplish with your wealth",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-medium mb-3">Your most important financial goals:</h4>
            <div className="space-y-3">
              {[
                { type: 'retirement', label: '🏖️ Comfortable Retirement', desc: 'Maintaining lifestyle without work' },
                { type: 'education', label: '🎓 Children\'s Education', desc: 'College and beyond' },
                { type: 'home', label: '🏡 Dream Home', desc: 'Primary or vacation residence' },
                { type: 'business', label: '🚀 Start/Buy Business', desc: 'Entrepreneurial ventures' },
                { type: 'travel', label: '✈️ Travel & Experiences', desc: 'Creating memories' },
                { type: 'legacy', label: '🏛️ Family Legacy', desc: 'Generational wealth' },
                { type: 'philanthropy', label: '❤️ Charitable Giving', desc: 'Making an impact' }
              ].map(goal => (
                <div key={goal.type} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-white font-medium">{goal.label}</div>
                    <div className="text-gray-400 text-sm">{goal.desc}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs bg-green-600 hover:bg-green-500 text-white rounded transition-colors">Must Have</button>
                    <button className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors">Important</button>
                    <button className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">Nice to Have</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Ideal retirement age</label>
              <input type="number" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-indigo-500" placeholder="65" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Annual retirement income needed</label>
              <input type="text" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-indigo-500" placeholder="$100,000" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Describe your ideal retirement:</label>
            <textarea className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-indigo-500 h-24" placeholder="Where will you live? What will you do? How do you want to spend your time?"></textarea>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Previous Advisor Experience",
      description: "Learning from your past experiences to serve you better",
      icon: <Clock className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-medium mb-3">Have you worked with a financial advisor before?</h4>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">
                ✅ Yes, I have experience
              </button>
              <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">
                🆕 No, you're my first
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">What worked well with previous advisors?</h4>
            <div className="space-y-2">
              {[
                '📞 Excellent communication and responsiveness',
                '📈 Strong investment performance',
                '📋 Comprehensive financial planning',
                '🤝 Personal relationship and trust',
                '💰 Tax-efficient strategies',
                '🎓 Educational approach - helped me learn',
                '💡 Proactive advice and recommendations'
              ].map(positive => (
                <label key={positive} className="flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg cursor-pointer">
                  <input type="checkbox" className="rounded text-indigo-600" />
                  <span className="text-gray-300 text-sm">{positive}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">What caused frustration or didn't work?</h4>
            <div className="space-y-2">
              {[
                '😤 Poor communication - slow to respond',
                '📉 Disappointing investment performance',
                '💸 High fees without clear value',
                '🤖 Felt like just another account number',
                '🛒 Pushy sales tactics',
                '🤷 Didn\'t understand my situation',
                '😰 Made me uncomfortable with risk'
              ].map(negative => (
                <label key={negative} className="flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg cursor-pointer">
                  <input type="checkbox" className="rounded text-red-600" />
                  <span className="text-gray-300 text-sm">{negative}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">What would make you leave an advisor?</h4>
            <textarea className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-indigo-500 h-20" placeholder="Be honest - this helps us serve you better and avoid these pitfalls..."></textarea>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "Success Definition & Expectations",
      description: "How we'll know we're doing a great job for you",
      icon: <Star className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-medium mb-3">How will you measure our success? (Select top 3)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'performance', label: '📈 Strong Portfolio Performance', desc: 'Beating benchmarks consistently' },
                { key: 'goals', label: '🎯 Reaching Your Goals', desc: 'On track for retirement, education, etc.' },
                { key: 'peace', label: '😌 Peace of Mind', desc: 'Sleeping well at night' },
                { key: 'relationship', label: '🤝 Great Relationship', desc: 'Trust, communication, understanding' },
                { key: 'tax_efficiency', label: '💰 Tax Efficiency', desc: 'Keeping more of what you earn' },
                { key: 'legacy', label: '🏛️ Legacy Impact', desc: 'Building generational wealth' }
              ].map(measure => (
                <label key={measure.key} className="flex items-start gap-3 p-4 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg cursor-pointer">
                  <input type="checkbox" className="rounded text-indigo-600 mt-1" />
                  <div>
                    <div className="text-white font-medium">{measure.label}</div>
                    <div className="text-gray-400 text-sm">{measure.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">Response time expectations:</h4>
            <div className="grid grid-cols-3 gap-3">
              <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">
                ⚡ Same day
              </button>
              <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">
                📅 Within 2 days
              </button>
              <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">
                🗓️ Within a week
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">Additional expectations or concerns:</h4>
            <textarea className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-indigo-500 h-24" placeholder="Anything else we should know about your expectations, concerns, or what would make this a successful relationship?"></textarea>
          </div>

          <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-lg p-4">
            <h4 className="text-indigo-300 font-medium mb-2">🎯 Your Personalized Profile</h4>
            <p className="text-gray-300 text-sm">
              Based on your responses, we'll create a comprehensive client profile that helps us:
              • Customize our communication style to your preferences
              • Focus on your most important goals
              • Avoid the pitfalls you experienced with previous advisors
              • Deliver the type of service and relationship you value most
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Client Onboarding Journey</h1>
        <p className="text-gray-400">Building a personalized wealth management experience just for you</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              completedSteps.has(step.id) 
                ? 'bg-green-500 border-green-500 text-white' 
                : step.id === currentStep
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-400'
            }`}>
              {completedSteps.has(step.id) ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                step.icon
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-1 mx-2 ${
                completedSteps.has(step.id) ? 'bg-green-500' : 'bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step */}
      <div className="mb-8">
        <OnboardingStep
          title={currentStepData.title}
          description={currentStepData.description}
          isActive={true}
          isCompleted={false}
        >
          {currentStepData.content}
        </OnboardingStep>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-center text-gray-400">
          Step {currentStep} of {totalSteps}
        </div>

        <button
          onClick={markStepCompleted}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
        >
          {currentStep === totalSteps ? 'Complete Onboarding' : 'Continue'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}