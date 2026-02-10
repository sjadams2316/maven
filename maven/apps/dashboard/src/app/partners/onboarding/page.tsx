'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Types
interface BasicInfo {
  clientType: 'individual' | 'joint';
  firstName: string;
  lastName: string;
  jointFirstName: string;
  jointLastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  jointDateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface FinancialProfile {
  annualIncome: string;
  netWorth: string;
  employmentStatus: string;
  employer: string;
  occupation: string;
  investmentExperience: number;
}

interface RiskAssessment {
  q1: number; // Market drop reaction
  q2: number; // Investment timeline preference
  q3: number; // Risk vs return preference
  q4: number; // Portfolio volatility comfort
  q5: number; // Loss tolerance
  q6: number; // Investment knowledge
  q7: number; // Income stability
}

interface GoalsTimeline {
  primaryGoal: string;
  secondaryGoals: string[];
  targetRetirementAge: number;
  investmentTimeline: string;
  specificConcerns: string;
}

interface AccountSetup {
  accountTypes: string[];
  fundingMethod: string;
  fundingAmount: string;
  beneficiaryName: string;
  beneficiaryRelation: string;
  beneficiaryPercent: number;
}

interface OnboardingData {
  basicInfo: BasicInfo;
  financialProfile: FinancialProfile;
  riskAssessment: RiskAssessment;
  goalsTimeline: GoalsTimeline;
  accountSetup: AccountSetup;
  currentStep: number;
  lastUpdated: string;
}

const STORAGE_KEY = 'maven-onboarding-draft';

const INITIAL_DATA: OnboardingData = {
  basicInfo: {
    clientType: 'individual',
    firstName: '',
    lastName: '',
    jointFirstName: '',
    jointLastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    jointDateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  },
  financialProfile: {
    annualIncome: '',
    netWorth: '',
    employmentStatus: '',
    employer: '',
    occupation: '',
    investmentExperience: 0,
  },
  riskAssessment: {
    q1: 3,
    q2: 3,
    q3: 3,
    q4: 3,
    q5: 3,
    q6: 3,
    q7: 3,
  },
  goalsTimeline: {
    primaryGoal: '',
    secondaryGoals: [],
    targetRetirementAge: 65,
    investmentTimeline: '',
    specificConcerns: '',
  },
  accountSetup: {
    accountTypes: [],
    fundingMethod: '',
    fundingAmount: '',
    beneficiaryName: '',
    beneficiaryRelation: '',
    beneficiaryPercent: 100,
  },
  currentStep: 1,
  lastUpdated: '',
};

const INCOME_RANGES = [
  { value: 'under-50k', label: 'Under $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '100k-200k', label: '$100,000 - $200,000' },
  { value: '200k-500k', label: '$200,000 - $500,000' },
  { value: '500k-1m', label: '$500,000 - $1,000,000' },
  { value: 'over-1m', label: 'Over $1,000,000' },
];

const NET_WORTH_RANGES = [
  { value: 'under-100k', label: 'Under $100,000' },
  { value: '100k-500k', label: '$100,000 - $500,000' },
  { value: '500k-1m', label: '$500,000 - $1,000,000' },
  { value: '1m-5m', label: '$1,000,000 - $5,000,000' },
  { value: '5m-10m', label: '$5,000,000 - $10,000,000' },
  { value: 'over-10m', label: 'Over $10,000,000' },
];

const EMPLOYMENT_STATUS = [
  { value: 'employed', label: 'Employed' },
  { value: 'self-employed', label: 'Self-Employed' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'student', label: 'Student' },
];

const RISK_QUESTIONS = [
  {
    key: 'q1',
    question: 'If your portfolio dropped 20% in a month, what would you do?',
    options: [
      { value: 1, label: 'Sell everything immediately' },
      { value: 2, label: 'Sell some to reduce risk' },
      { value: 3, label: 'Hold and wait it out' },
      { value: 4, label: 'Buy more at lower prices' },
      { value: 5, label: 'Significantly increase my position' },
    ],
  },
  {
    key: 'q2',
    question: 'What is your preferred investment timeline?',
    options: [
      { value: 1, label: 'Less than 1 year' },
      { value: 2, label: '1-3 years' },
      { value: 3, label: '3-7 years' },
      { value: 4, label: '7-15 years' },
      { value: 5, label: 'More than 15 years' },
    ],
  },
  {
    key: 'q3',
    question: 'How do you balance risk vs. potential return?',
    options: [
      { value: 1, label: 'Minimize risk, accept lower returns' },
      { value: 2, label: 'Prefer stability with modest growth' },
      { value: 3, label: 'Balance between risk and return' },
      { value: 4, label: 'Accept higher risk for better returns' },
      { value: 5, label: 'Maximize returns, accept high risk' },
    ],
  },
  {
    key: 'q4',
    question: 'How comfortable are you with portfolio value fluctuations?',
    options: [
      { value: 1, label: 'Very uncomfortable - need stability' },
      { value: 2, label: 'Somewhat uncomfortable' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Somewhat comfortable' },
      { value: 5, label: 'Very comfortable with volatility' },
    ],
  },
  {
    key: 'q5',
    question: 'What maximum annual loss could you tolerate?',
    options: [
      { value: 1, label: '0-5%' },
      { value: 2, label: '5-10%' },
      { value: 3, label: '10-20%' },
      { value: 4, label: '20-30%' },
      { value: 5, label: 'Over 30%' },
    ],
  },
  {
    key: 'q6',
    question: 'How would you rate your investment knowledge?',
    options: [
      { value: 1, label: 'Beginner - new to investing' },
      { value: 2, label: 'Basic understanding' },
      { value: 3, label: 'Intermediate knowledge' },
      { value: 4, label: 'Advanced understanding' },
      { value: 5, label: 'Expert - professional experience' },
    ],
  },
  {
    key: 'q7',
    question: 'How stable is your current income?',
    options: [
      { value: 1, label: 'Very unstable / variable' },
      { value: 2, label: 'Somewhat unstable' },
      { value: 3, label: 'Moderately stable' },
      { value: 4, label: 'Stable' },
      { value: 5, label: 'Very stable / guaranteed' },
    ],
  },
];

const PRIMARY_GOALS = [
  { value: 'retirement', label: 'Retirement', icon: '🏖️' },
  { value: 'education', label: 'Education Funding', icon: '🎓' },
  { value: 'home', label: 'Home Purchase', icon: '🏠' },
  { value: 'wealth', label: 'Wealth Building', icon: '📈' },
  { value: 'income', label: 'Generate Income', icon: '💰' },
  { value: 'preservation', label: 'Wealth Preservation', icon: '🛡️' },
];

const INVESTMENT_TIMELINES = [
  { value: 'short', label: 'Short-term (1-3 years)' },
  { value: 'medium', label: 'Medium-term (3-7 years)' },
  { value: 'long', label: 'Long-term (7-15 years)' },
  { value: 'very-long', label: 'Very long-term (15+ years)' },
];

const ACCOUNT_TYPES = [
  { value: 'individual', label: 'Individual Brokerage', desc: 'Taxable investment account' },
  { value: 'joint', label: 'Joint Brokerage', desc: 'Shared taxable account' },
  { value: 'traditional-ira', label: 'Traditional IRA', desc: 'Tax-deferred retirement' },
  { value: 'roth-ira', label: 'Roth IRA', desc: 'Tax-free growth retirement' },
  { value: '401k-rollover', label: '401(k) Rollover', desc: 'Transfer from employer plan' },
  { value: 'trust', label: 'Trust Account', desc: 'For estate planning' },
];

const FUNDING_METHODS = [
  { value: 'bank-transfer', label: 'Bank Transfer (ACH)', desc: '3-5 business days' },
  { value: 'wire', label: 'Wire Transfer', desc: '1-2 business days' },
  { value: 'rollover', label: 'Rollover/Transfer', desc: 'From existing accounts' },
  { value: 'check', label: 'Check Deposit', desc: '5-7 business days' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);
  const [agreements, setAgreements] = useState({ terms: false, privacy: false, advisory: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  const TOTAL_STEPS = 6;

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as OnboardingData;
        setData(parsed);
        setHasDraft(true);
      } catch {
        // Invalid data, use defaults
      }
    }
    setIsLoading(false);
  }, []);

  // Auto-save progress
  const saveProgress = useCallback((newData: OnboardingData) => {
    const toSave = { ...newData, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, []);

  type OnboardingSections = 'basicInfo' | 'financialProfile' | 'riskAssessment' | 'goalsTimeline' | 'accountSetup';
  
  const updateData = <K extends OnboardingSections>(
    section: K,
    updates: Partial<OnboardingData[K]>
  ) => {
    setData(prev => {
      const newData = {
        ...prev,
        [section]: { ...(prev[section] as object), ...updates },
      };
      saveProgress(newData);
      return newData;
    });
  };

  const goToStep = (step: number) => {
    setData(prev => {
      const newData = { ...prev, currentStep: step };
      saveProgress(newData);
      return newData;
    });
  };

  const nextStep = () => {
    if (data.currentStep < TOTAL_STEPS) {
      goToStep(data.currentStep + 1);
    }
  };

  const prevStep = () => {
    if (data.currentStep > 1) {
      goToStep(data.currentStep - 1);
    }
  };

  const calculateRiskScore = (): { score: number; label: string; color: string } => {
    const { riskAssessment } = data;
    const total = riskAssessment.q1 + riskAssessment.q2 + riskAssessment.q3 +
                  riskAssessment.q4 + riskAssessment.q5 + riskAssessment.q6 + riskAssessment.q7;
    const avg = total / 7;
    
    if (avg <= 1.5) return { score: Math.round(avg * 20), label: 'Very Conservative', color: 'text-blue-400' };
    if (avg <= 2.5) return { score: Math.round(avg * 20), label: 'Conservative', color: 'text-cyan-400' };
    if (avg <= 3.5) return { score: Math.round(avg * 20), label: 'Moderate', color: 'text-emerald-400' };
    if (avg <= 4.5) return { score: Math.round(avg * 20), label: 'Growth', color: 'text-amber-400' };
    return { score: Math.round(avg * 20), label: 'Aggressive', color: 'text-red-400' };
  };

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(INITIAL_DATA);
    setHasDraft(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate invite link
    const clientId = Math.random().toString(36).substring(7);
    setInviteLink(`https://maven.app/invite/${clientId}`);
    
    // Clear the draft
    localStorage.removeItem(STORAGE_KEY);
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
  };

  const getClientName = () => {
    const { basicInfo } = data;
    if (basicInfo.clientType === 'joint' && basicInfo.jointFirstName) {
      return `${basicInfo.firstName} ${basicInfo.lastName} & ${basicInfo.jointFirstName} ${basicInfo.jointLastName}`;
    }
    return `${basicInfo.firstName} ${basicInfo.lastName}`.trim() || 'New Client';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Success screen
  if (submitSuccess) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 md:p-8 text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Client Created Successfully!</h1>
          <p className="text-gray-400 mb-8">
            {getClientName()} has been added to your client roster.
            {sendWelcomeEmail && ' A welcome email has been sent.'}
          </p>

          <div className="bg-white/5 rounded-xl p-4 mb-8">
            <div className="text-gray-400 text-sm mb-2">Client Invite Link</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm min-h-[48px]"
              />
              <button
                onClick={() => navigator.clipboard.writeText(inviteLink)}
                className="px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors min-h-[48px] min-w-[48px]"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/partners/clients"
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px] flex items-center justify-center font-medium"
            >
              View All Clients
            </Link>
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setData(INITIAL_DATA);
                setAgreements({ terms: false, privacy: false, advisory: false });
              }}
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors min-h-[48px] flex items-center justify-center font-medium"
            >
              Add Another Client
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">New Client Onboarding</h1>
            <p className="text-gray-400 text-sm md:text-base mt-1">
              {getClientName() !== 'New Client' ? getClientName() : 'Complete the wizard to add a new client'}
            </p>
          </div>
          <Link
            href="/partners/clients"
            className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </Link>
        </div>

        {/* Draft notice */}
        {hasDraft && data.lastUpdated && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="text-amber-400 text-sm">
              Draft saved {new Date(data.lastUpdated).toLocaleString()}
            </div>
            <button
              onClick={clearDraft}
              className="text-amber-400 hover:text-amber-300 text-sm underline min-h-[48px] sm:min-h-0"
            >
              Start Over
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="bg-white/5 rounded-full h-2 mb-4">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(data.currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-between text-xs text-gray-500 overflow-x-auto">
          {['Basic Info', 'Financial', 'Risk', 'Goals', 'Account', 'Review'].map((label, i) => (
            <button
              key={i}
              onClick={() => goToStep(i + 1)}
              className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center transition-colors px-2 ${
                data.currentStep === i + 1 ? 'text-amber-500' : 
                data.currentStep > i + 1 ? 'text-emerald-500' : ''
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${
                data.currentStep === i + 1 ? 'bg-amber-500 text-white' :
                data.currentStep > i + 1 ? 'bg-emerald-500 text-white' : 'bg-white/10'
              }`}>
                {data.currentStep > i + 1 ? '✓' : i + 1}
              </span>
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form content */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 md:p-8">
        {/* Step 1: Basic Info */}
        {data.currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>

            {/* Client Type */}
            <div>
              <label className="block text-gray-400 text-sm mb-3">Account Type</label>
              <div className="flex gap-3">
                {(['individual', 'joint'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => updateData('basicInfo', { clientType: type })}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-colors min-h-[48px] ${
                      data.basicInfo.clientType === type
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                        : 'border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    {type === 'individual' ? '👤 Individual' : '👥 Joint'}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">First Name *</label>
                <input
                  type="text"
                  value={data.basicInfo.firstName}
                  onChange={(e) => updateData('basicInfo', { firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Last Name *</label>
                <input
                  type="text"
                  value={data.basicInfo.lastName}
                  onChange={(e) => updateData('basicInfo', { lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Joint Name */}
            {data.basicInfo.clientType === 'joint' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Joint Holder First Name *</label>
                  <input
                    type="text"
                    value={data.basicInfo.jointFirstName}
                    onChange={(e) => updateData('basicInfo', { jointFirstName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Joint Holder Last Name *</label>
                  <input
                    type="text"
                    value={data.basicInfo.jointLastName}
                    onChange={(e) => updateData('basicInfo', { jointLastName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email *</label>
                <input
                  type="email"
                  value={data.basicInfo.email}
                  onChange={(e) => updateData('basicInfo', { email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Phone *</label>
                <input
                  type="tel"
                  value={data.basicInfo.phone}
                  onChange={(e) => updateData('basicInfo', { phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* DOB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={data.basicInfo.dateOfBirth}
                  onChange={(e) => updateData('basicInfo', { dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                />
              </div>
              {data.basicInfo.clientType === 'joint' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Joint Holder DOB *</label>
                  <input
                    type="date"
                    value={data.basicInfo.jointDateOfBirth}
                    onChange={(e) => updateData('basicInfo', { jointDateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  />
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Street Address *</label>
              <input
                type="text"
                value={data.basicInfo.address}
                onChange={(e) => updateData('basicInfo', { address: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 sm:col-span-2">
                <label className="block text-gray-400 text-sm mb-2">City *</label>
                <input
                  type="text"
                  value={data.basicInfo.city}
                  onChange={(e) => updateData('basicInfo', { city: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">State *</label>
                <select
                  value={data.basicInfo.state}
                  onChange={(e) => updateData('basicInfo', { state: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                >
                  <option value="">Select</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">ZIP *</label>
                <input
                  type="text"
                  value={data.basicInfo.zipCode}
                  onChange={(e) => updateData('basicInfo', { zipCode: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  placeholder="10001"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Financial Profile */}
        {data.currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Financial Profile</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Annual Income *</label>
                <select
                  value={data.financialProfile.annualIncome}
                  onChange={(e) => updateData('financialProfile', { annualIncome: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                >
                  <option value="">Select range</option>
                  {INCOME_RANGES.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Net Worth *</label>
                <select
                  value={data.financialProfile.netWorth}
                  onChange={(e) => updateData('financialProfile', { netWorth: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                >
                  <option value="">Select range</option>
                  {NET_WORTH_RANGES.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Employment Status *</label>
              <select
                value={data.financialProfile.employmentStatus}
                onChange={(e) => updateData('financialProfile', { employmentStatus: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
              >
                <option value="">Select status</option>
                {EMPLOYMENT_STATUS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {(data.financialProfile.employmentStatus === 'employed' || data.financialProfile.employmentStatus === 'self-employed') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Employer</label>
                  <input
                    type="text"
                    value={data.financialProfile.employer}
                    onChange={(e) => updateData('financialProfile', { employer: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Occupation</label>
                  <input
                    type="text"
                    value={data.financialProfile.occupation}
                    onChange={(e) => updateData('financialProfile', { occupation: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                    placeholder="Job title"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Investment Experience: {data.financialProfile.investmentExperience} years
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={data.financialProfile.investmentExperience}
                onChange={(e) => updateData('financialProfile', { investmentExperience: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>None</span>
                <span>30+ years</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Risk Assessment */}
        {data.currentStep === 3 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Risk Assessment</h2>
              <div className="text-right">
                <div className={`text-2xl font-bold ${calculateRiskScore().color}`}>
                  {calculateRiskScore().score}/100
                </div>
                <div className={`text-sm ${calculateRiskScore().color}`}>
                  {calculateRiskScore().label}
                </div>
              </div>
            </div>

            {RISK_QUESTIONS.map((q, index) => (
              <div key={q.key} className="space-y-3">
                <div className="text-white font-medium">
                  {index + 1}. {q.question}
                </div>
                <div className="space-y-2">
                  {q.options.map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateData('riskAssessment', { [q.key]: option.value })}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors min-h-[48px] ${
                        data.riskAssessment[q.key as keyof RiskAssessment] === option.value
                          ? 'border-amber-500 bg-amber-500/10 text-white'
                          : 'border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Goals & Timeline */}
        {data.currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Goals & Timeline</h2>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Primary Investment Goal *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRIMARY_GOALS.map(goal => (
                  <button
                    key={goal.value}
                    onClick={() => updateData('goalsTimeline', { primaryGoal: goal.value })}
                    className={`p-4 rounded-xl border transition-colors min-h-[80px] flex flex-col items-center justify-center gap-2 ${
                      data.goalsTimeline.primaryGoal === goal.value
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    <span className="text-2xl">{goal.icon}</span>
                    <span className="text-sm font-medium">{goal.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Secondary Goals (optional)</label>
              <div className="flex flex-wrap gap-2">
                {PRIMARY_GOALS.filter(g => g.value !== data.goalsTimeline.primaryGoal).map(goal => (
                  <button
                    key={goal.value}
                    onClick={() => {
                      const current = data.goalsTimeline.secondaryGoals;
                      const updated = current.includes(goal.value)
                        ? current.filter(g => g !== goal.value)
                        : [...current, goal.value];
                      updateData('goalsTimeline', { secondaryGoals: updated });
                    }}
                    className={`px-4 py-2 rounded-lg border transition-colors min-h-[48px] ${
                      data.goalsTimeline.secondaryGoals.includes(goal.value)
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                        : 'border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    {goal.icon} {goal.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Target Retirement Age: {data.goalsTimeline.targetRetirementAge}
              </label>
              <input
                type="range"
                min="50"
                max="80"
                value={data.goalsTimeline.targetRetirementAge}
                onChange={(e) => updateData('goalsTimeline', { targetRetirementAge: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50</span>
                <span>80</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Investment Timeline *</label>
              <select
                value={data.goalsTimeline.investmentTimeline}
                onChange={(e) => updateData('goalsTimeline', { investmentTimeline: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
              >
                <option value="">Select timeline</option>
                {INVESTMENT_TIMELINES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Specific Concerns or Notes</label>
              <textarea
                value={data.goalsTimeline.specificConcerns}
                onChange={(e) => updateData('goalsTimeline', { specificConcerns: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none"
                placeholder="Any specific financial concerns, life events, or considerations..."
              />
            </div>
          </div>
        )}

        {/* Step 5: Account Setup */}
        {data.currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Account Setup</h2>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Account Types to Open *</label>
              <div className="space-y-2">
                {ACCOUNT_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => {
                      const current = data.accountSetup.accountTypes;
                      const updated = current.includes(type.value)
                        ? current.filter(t => t !== type.value)
                        : [...current, type.value];
                      updateData('accountSetup', { accountTypes: updated });
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-colors min-h-[64px] flex items-center gap-4 ${
                      data.accountSetup.accountTypes.includes(type.value)
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      data.accountSetup.accountTypes.includes(type.value)
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-gray-500'
                    }`}>
                      {data.accountSetup.accountTypes.includes(type.value) && (
                        <span className="text-white text-sm">✓</span>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{type.label}</div>
                      <div className="text-gray-500 text-sm">{type.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Funding Method *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FUNDING_METHODS.map(method => (
                  <button
                    key={method.value}
                    onClick={() => updateData('accountSetup', { fundingMethod: method.value })}
                    className={`p-4 rounded-xl border transition-colors min-h-[64px] text-left ${
                      data.accountSetup.fundingMethod === method.value
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-white font-medium">{method.label}</div>
                    <div className="text-gray-500 text-sm">{method.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Initial Funding Amount</label>
              <input
                type="text"
                value={data.accountSetup.fundingAmount}
                onChange={(e) => updateData('accountSetup', { fundingAmount: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                placeholder="$50,000"
              />
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-white font-medium mb-4">Beneficiary Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-gray-400 text-sm mb-2">Beneficiary Name</label>
                  <input
                    type="text"
                    value={data.accountSetup.beneficiaryName}
                    onChange={(e) => updateData('accountSetup', { beneficiaryName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Relationship</label>
                  <select
                    value={data.accountSetup.beneficiaryRelation}
                    onChange={(e) => updateData('accountSetup', { beneficiaryRelation: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  >
                    <option value="">Select</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="trust">Trust</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review & Submit */}
        {data.currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Review & Submit</h2>

            {/* Summary Sections */}
            <div className="space-y-4">
              {/* Basic Info Summary */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Basic Information</h3>
                  <button
                    onClick={() => goToStep(1)}
                    className="text-amber-500 text-sm hover:text-amber-400 min-h-[48px] min-w-[48px] flex items-center justify-center"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Name:</div>
                  <div className="text-white">{getClientName()}</div>
                  <div className="text-gray-500">Email:</div>
                  <div className="text-white">{data.basicInfo.email || '—'}</div>
                  <div className="text-gray-500">Phone:</div>
                  <div className="text-white">{data.basicInfo.phone || '—'}</div>
                  <div className="text-gray-500">Location:</div>
                  <div className="text-white">{data.basicInfo.city}, {data.basicInfo.state} {data.basicInfo.zipCode}</div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Financial Profile</h3>
                  <button
                    onClick={() => goToStep(2)}
                    className="text-amber-500 text-sm hover:text-amber-400 min-h-[48px] min-w-[48px] flex items-center justify-center"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Income:</div>
                  <div className="text-white">{INCOME_RANGES.find(r => r.value === data.financialProfile.annualIncome)?.label || '—'}</div>
                  <div className="text-gray-500">Net Worth:</div>
                  <div className="text-white">{NET_WORTH_RANGES.find(r => r.value === data.financialProfile.netWorth)?.label || '—'}</div>
                  <div className="text-gray-500">Employment:</div>
                  <div className="text-white">{EMPLOYMENT_STATUS.find(s => s.value === data.financialProfile.employmentStatus)?.label || '—'}</div>
                  <div className="text-gray-500">Experience:</div>
                  <div className="text-white">{data.financialProfile.investmentExperience} years</div>
                </div>
              </div>

              {/* Risk Summary */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Risk Assessment</h3>
                  <button
                    onClick={() => goToStep(3)}
                    className="text-amber-500 text-sm hover:text-amber-400 min-h-[48px] min-w-[48px] flex items-center justify-center"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-3xl font-bold ${calculateRiskScore().color}`}>
                    {calculateRiskScore().score}
                  </div>
                  <div>
                    <div className={`font-medium ${calculateRiskScore().color}`}>
                      {calculateRiskScore().label}
                    </div>
                    <div className="text-gray-500 text-sm">Risk tolerance score</div>
                  </div>
                </div>
              </div>

              {/* Goals Summary */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Goals & Timeline</h3>
                  <button
                    onClick={() => goToStep(4)}
                    className="text-amber-500 text-sm hover:text-amber-400 min-h-[48px] min-w-[48px] flex items-center justify-center"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Primary Goal:</div>
                  <div className="text-white">{PRIMARY_GOALS.find(g => g.value === data.goalsTimeline.primaryGoal)?.label || '—'}</div>
                  <div className="text-gray-500">Retirement Age:</div>
                  <div className="text-white">{data.goalsTimeline.targetRetirementAge}</div>
                  <div className="text-gray-500">Timeline:</div>
                  <div className="text-white">{INVESTMENT_TIMELINES.find(t => t.value === data.goalsTimeline.investmentTimeline)?.label || '—'}</div>
                </div>
              </div>

              {/* Account Summary */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Account Setup</h3>
                  <button
                    onClick={() => goToStep(5)}
                    className="text-amber-500 text-sm hover:text-amber-400 min-h-[48px] min-w-[48px] flex items-center justify-center"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Account Types:</div>
                  <div className="text-white">
                    {data.accountSetup.accountTypes.map(t => ACCOUNT_TYPES.find(at => at.value === t)?.label).join(', ') || '—'}
                  </div>
                  <div className="text-gray-500">Funding:</div>
                  <div className="text-white">{FUNDING_METHODS.find(m => m.value === data.accountSetup.fundingMethod)?.label || '—'}</div>
                  <div className="text-gray-500">Initial Amount:</div>
                  <div className="text-white">{data.accountSetup.fundingAmount || '—'}</div>
                </div>
              </div>
            </div>

            {/* Welcome Email Option */}
            <div className="border-t border-white/10 pt-6">
              <button
                onClick={() => setSendWelcomeEmail(!sendWelcomeEmail)}
                className="flex items-center gap-3 w-full text-left p-4 rounded-xl border border-white/10 hover:border-white/30 transition-colors min-h-[48px]"
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  sendWelcomeEmail ? 'border-amber-500 bg-amber-500' : 'border-gray-500'
                }`}>
                  {sendWelcomeEmail && <span className="text-white text-sm">✓</span>}
                </div>
                <div>
                  <div className="text-white">Send welcome email to client</div>
                  <div className="text-gray-500 text-sm">Client will receive login instructions at {data.basicInfo.email}</div>
                </div>
              </button>
            </div>

            {/* Agreements */}
            <div className="border-t border-white/10 pt-6 space-y-3">
              <h3 className="text-white font-medium mb-4">Required Agreements</h3>
              
              {[
                { key: 'terms', label: 'I confirm the client has reviewed and agreed to the Terms of Service' },
                { key: 'privacy', label: 'I confirm the client has reviewed and agreed to the Privacy Policy' },
                { key: 'advisory', label: 'I confirm the client has received and understands the Investment Advisory Agreement' },
              ].map(agreement => (
                <button
                  key={agreement.key}
                  onClick={() => setAgreements(prev => ({ ...prev, [agreement.key]: !prev[agreement.key as keyof typeof agreements] }))}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-xl border border-white/10 hover:border-white/30 transition-colors min-h-[48px]"
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    agreements[agreement.key as keyof typeof agreements] ? 'border-amber-500 bg-amber-500' : 'border-gray-500'
                  }`}>
                    {agreements[agreement.key as keyof typeof agreements] && <span className="text-white text-sm">✓</span>}
                  </div>
                  <div className="text-gray-300 text-sm">{agreement.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 pt-6 border-t border-white/10">
          {data.currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 sm:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px] font-medium"
            >
              ← Back
            </button>
          )}
          <div className="flex-1" />
          {data.currentStep < TOTAL_STEPS ? (
            <button
              onClick={nextStep}
              className="flex-1 sm:flex-none px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors min-h-[48px] font-medium"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!agreements.terms || !agreements.privacy || !agreements.advisory || isSubmitting}
              className="flex-1 sm:flex-none px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors min-h-[48px] font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                'Create Client'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
