'use client';

import { useState, useEffect } from 'react';
import { useSocialSecurity } from '@/providers/UserProvider';
import { SocialSecurityProfile } from '@/providers/UserProvider';

interface SocialSecurityFormProps {
  onComplete?: () => void;
  initialData?: Partial<SocialSecurityProfile>;
}

export default function SocialSecurityForm({ onComplete, initialData }: SocialSecurityFormProps) {
  const { socialSecurity, updateSocialSecurity, isLoading } = useSocialSecurity();
  
  const [formData, setFormData] = useState<SocialSecurityProfile>({
    dateOfBirth: '',
    lifeExpectancy: 85,
    benefitAt62: undefined,
    benefitAtFRA: undefined,
    benefitAt70: undefined,
    currentlyWorking: false,
    expectedEarnings: undefined,
    retirementAge: undefined,
    spouseDOB: '',
    spouseBenefitAt62: undefined,
    spouseBenefitAtFRA: undefined,
    spouseBenefitAt70: undefined,
    marriageDate: '',
    previousMarriages: [],
  });
  
  const [step, setStep] = useState(1);
  const [isMarried, setIsMarried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSSAHelp, setShowSSAHelp] = useState(false);

  // Load existing data
  useEffect(() => {
    if (socialSecurity) {
      setFormData(prev => ({ ...prev, ...socialSecurity }));
      if (socialSecurity.spouseDOB || socialSecurity.spouseBenefitAtFRA) {
        setIsMarried(true);
      }
    }
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [socialSecurity, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? (value === '' ? undefined : Number(value)) : 
              value
    }));
  };

  const handleSliderChange = (name: string, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate required fields
      if (!formData.dateOfBirth || !formData.benefitAtFRA) {
        alert('Please fill in your date of birth and benefit at Full Retirement Age');
        setSaving(false);
        return;
      }
      
      await updateSocialSecurity(formData);
      onComplete?.();
    } catch (error) {
      console.error('Error saving SS profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = () => {
    if (!formData.dateOfBirth) return null;
    const birth = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getFRA = () => {
    if (!formData.dateOfBirth) return { years: 67, months: 0 };
    const birthYear = new Date(formData.dateOfBirth).getFullYear();
    if (birthYear <= 1954) return { years: 66, months: 0 };
    if (birthYear === 1955) return { years: 66, months: 2 };
    if (birthYear === 1956) return { years: 66, months: 4 };
    if (birthYear === 1957) return { years: 66, months: 6 };
    if (birthYear === 1958) return { years: 66, months: 8 };
    if (birthYear === 1959) return { years: 66, months: 10 };
    return { years: 67, months: 0 };
  };

  const currentAge = calculateAge();
  const fra = getFRA();

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>📅</span> Basic Information
        </h3>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {currentAge && (
              <p className="text-xs text-gray-500 mt-1">
                Current age: {currentAge} • FRA: {fra.years} years{fra.months > 0 ? `, ${fra.months} months` : ''}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Marital Status
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsMarried(false)}
                className={`flex-1 px-4 py-3 rounded-xl border transition ${
                  !isMarried 
                    ? 'bg-indigo-500/20 border-indigo-500 text-white' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                Single
              </button>
              <button
                type="button"
                onClick={() => setIsMarried(true)}
                className={`flex-1 px-4 py-3 rounded-xl border transition ${
                  isMarried 
                    ? 'bg-indigo-500/20 border-indigo-500 text-white' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                Married
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Life Expectancy Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Life Expectancy Estimate: <span className="text-white font-semibold">{formData.lifeExpectancy} years</span>
        </label>
        <div className="relative pt-2">
          <input
            type="range"
            min="70"
            max="100"
            value={formData.lifeExpectancy || 85}
            onChange={(e) => handleSliderChange('lifeExpectancy', Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>70</span>
            <span>85 (avg)</span>
            <span>100</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Consider your health, family history, and lifestyle. The average 65-year-old lives to about 85.
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>💰</span> Your Social Security Benefits
        </h3>
        <button
          type="button"
          onClick={() => setShowSSAHelp(!showSSAHelp)}
          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          <span>❓</span> Where do I find these?
        </button>
      </div>

      {showSSAHelp && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-4">
          <h4 className="font-medium text-indigo-400 mb-2">📋 Finding Your Benefit Estimates</h4>
          <ol className="text-sm text-gray-300 space-y-2">
            <li>1. Go to <a href="https://www.ssa.gov/myaccount/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">ssa.gov/myaccount</a></li>
            <li>2. Sign in or create an account</li>
            <li>3. Click "View Estimated Benefits"</li>
            <li>4. Find your estimates at ages 62, Full Retirement Age, and 70</li>
          </ol>
          <p className="text-xs text-gray-400 mt-3">
            Don't have access? Enter your best estimates. You can always update later.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Benefit at 62 <span className="text-gray-500">(monthly)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              name="benefitAt62"
              value={formData.benefitAt62 || ''}
              onChange={handleChange}
              placeholder="1,800"
              min={0}
              max={10000}
              className={`w-full pl-8 pr-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none ${
                formData.benefitAt62 !== undefined && formData.benefitAt62 < 0
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-indigo-500'
              }`}
            />
          </div>
          {formData.benefitAt62 !== undefined && formData.benefitAt62 < 0 ? (
            <p className="text-xs text-red-400 mt-1">⚠️ Benefit cannot be negative</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Earliest claiming age</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Benefit at FRA <span className="text-gray-500">(monthly)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              name="benefitAtFRA"
              value={formData.benefitAtFRA || ''}
              onChange={handleChange}
              placeholder="2,500"
              min={0}
              max={10000}
              className={`w-full pl-8 pr-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none ${
                formData.benefitAtFRA !== undefined && formData.benefitAtFRA < 0
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-indigo-500'
              }`}
            />
          </div>
          {formData.benefitAtFRA !== undefined && formData.benefitAtFRA < 0 ? (
            <p className="text-xs text-red-400 mt-1">⚠️ Benefit cannot be negative</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Full retirement age ({fra.years})</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Benefit at 70 <span className="text-gray-500">(monthly)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              name="benefitAt70"
              value={formData.benefitAt70 || ''}
              onChange={handleChange}
              placeholder="3,100"
              min={0}
              max={10000}
              className={`w-full pl-8 pr-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none ${
                formData.benefitAt70 !== undefined && formData.benefitAt70 < 0
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-indigo-500'
              }`}
            />
          </div>
          {formData.benefitAt70 !== undefined && formData.benefitAt70 < 0 ? (
            <p className="text-xs text-red-400 mt-1">⚠️ Benefit cannot be negative</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Maximum benefit age</p>
          )}
        </div>
      </div>

      {/* Quick estimate helper */}
      {formData.benefitAtFRA && !formData.benefitAt62 && !formData.benefitAt70 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-3">
            💡 We can estimate your benefits at 62 and 70 based on your FRA benefit:
          </p>
          <button
            type="button"
            onClick={() => {
              const fra_benefit = formData.benefitAtFRA || 0;
              setFormData(prev => ({
                ...prev,
                benefitAt62: Math.round(fra_benefit * 0.70),
                benefitAt70: Math.round(fra_benefit * 1.24),
              }));
            }}
            className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition text-sm"
          >
            Auto-calculate estimates
          </button>
        </div>
      )}

      {/* Working Status */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="text-md font-medium text-white mb-4">Work Status</h4>
        
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="currentlyWorking"
            name="currentlyWorking"
            checked={formData.currentlyWorking || false}
            onChange={handleChange}
            className="w-5 h-5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
          />
          <label htmlFor="currentlyWorking" className="text-gray-300">
            I plan to continue working while claiming Social Security
          </label>
        </div>

        {formData.currentlyWorking && (
          <div className="grid sm:grid-cols-2 gap-4 pl-8">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Expected Annual Earnings
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="expectedEarnings"
                  value={formData.expectedEarnings || ''}
                  onChange={handleChange}
                  placeholder="50,000"
                  className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Planned Retirement Age
              </label>
              <input
                type="number"
                name="retirementAge"
                value={formData.retirementAge || ''}
                onChange={handleChange}
                placeholder="67"
                min="62"
                max="75"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>💑</span> Spouse Information
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Spouse's Date of Birth
          </label>
          <input
            type="date"
            name="spouseDOB"
            value={formData.spouseDOB || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Marriage Date
          </label>
          <input
            type="date"
            name="marriageDate"
            value={formData.marriageDate || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Spouse's Benefit at 62
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              name="spouseBenefitAt62"
              value={formData.spouseBenefitAt62 || ''}
              onChange={handleChange}
              placeholder="1,500"
              className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Spouse's Benefit at FRA
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              name="spouseBenefitAtFRA"
              value={formData.spouseBenefitAtFRA || ''}
              onChange={handleChange}
              placeholder="2,000"
              className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Spouse's Benefit at 70
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              name="spouseBenefitAt70"
              value={formData.spouseBenefitAt70 || ''}
              onChange={handleChange}
              placeholder="2,500"
              className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
        <p className="text-sm text-purple-300">
          💡 <strong>Spousal Coordination Matters:</strong> The higher earner delaying to 70 can significantly
          increase the survivor benefit, which may be worth more than individual break-even analysis suggests.
        </p>
      </div>
    </div>
  );

  const totalSteps = isMarried ? 3 : 2;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
      {/* Progress Bar */}
      <div className="h-1 bg-white/5">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-6">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
          <span className={step >= 1 ? 'text-indigo-400' : ''}>1. Basics</span>
          <span className="text-gray-600">→</span>
          <span className={step >= 2 ? 'text-indigo-400' : ''}>2. Benefits</span>
          {isMarried && (
            <>
              <span className="text-gray-600">→</span>
              <span className={step >= 3 ? 'text-indigo-400' : ''}>3. Spouse</span>
            </>
          )}
        </div>

        {/* Form Steps */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && isMarried && renderStep3()}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              step === 1 
                ? 'text-gray-600 cursor-not-allowed' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            disabled={step === 1}
          >
            ← Back
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !formData.dateOfBirth || !formData.benefitAtFRA}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Analyze My Benefits ✨
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          border: none;
        }
      `}</style>
    </div>
  );
}
