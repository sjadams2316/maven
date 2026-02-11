'use client';

import { Calendar, TrendingUp, Clock, DollarSign } from 'lucide-react';

// Demo Social Security data
const SS_DATA = {
  client: {
    name: 'John',
    birthDate: '1968-05-15',
    fra: 67, // Full Retirement Age
    currentAge: 57,
    estimatedBenefit: {
      at62: 2150,
      atFRA: 3100,
      at70: 3850,
    },
  },
  spouse: {
    name: 'Sarah',
    birthDate: '1970-03-22',
    fra: 67,
    currentAge: 55,
    estimatedBenefit: {
      at62: 1800,
      atFRA: 2600,
      at70: 3225,
    },
  },
  recommendedStrategy: 'delayed',
  projectedLifetimeBenefit: {
    early: 612000,
    fra: 744000,
    delayed: 832000,
  },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export default function SocialSecurityPage() {
  const yearsToFRA = SS_DATA.client.fra - SS_DATA.client.currentAge;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Social Security</h1>
        <p className="text-gray-400">Your claiming strategy and projected benefits</p>
      </div>

      {/* Strategy Recommendation */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-emerald-400 font-semibold mb-1">Recommended: Delay to 70</h2>
            <p className="text-gray-300 text-sm">
              Based on your health, portfolio, and goals, delaying benefits to age 70 could provide 
              an additional <span className="text-emerald-400 font-medium">{formatCurrency(SS_DATA.projectedLifetimeBenefit.delayed - SS_DATA.projectedLifetimeBenefit.fra)}</span> in 
              lifetime benefits compared to claiming at full retirement age.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          Your Timeline
        </h2>
        <div className="relative">
          {/* Timeline bar */}
          <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-white/10" />
          
          <div className="space-y-6">
            {/* Age 62 */}
            <div className="flex items-start gap-4 relative">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center z-10 flex-shrink-0">
                <span className="text-gray-400 text-xs font-bold">62</span>
              </div>
              <div className="flex-1 pb-2">
                <p className="text-gray-400 font-medium">Earliest Claiming Age</p>
                <p className="text-white text-lg font-semibold">{formatCurrency(SS_DATA.client.estimatedBenefit.at62)}/mo</p>
                <p className="text-gray-500 text-sm">~30% reduction from FRA benefit</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">In {62 - SS_DATA.client.currentAge} years</p>
              </div>
            </div>

            {/* FRA */}
            <div className="flex items-start gap-4 relative">
              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center z-10 flex-shrink-0">
                <span className="text-white text-xs font-bold">67</span>
              </div>
              <div className="flex-1 pb-2">
                <p className="text-amber-400 font-medium">Full Retirement Age (FRA)</p>
                <p className="text-white text-lg font-semibold">{formatCurrency(SS_DATA.client.estimatedBenefit.atFRA)}/mo</p>
                <p className="text-gray-500 text-sm">100% of your earned benefit</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">In {yearsToFRA} years</p>
              </div>
            </div>

            {/* Age 70 */}
            <div className="flex items-start gap-4 relative">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center z-10 flex-shrink-0">
                <span className="text-white text-xs font-bold">70</span>
              </div>
              <div className="flex-1">
                <p className="text-emerald-400 font-medium">Maximum Benefit Age ✓</p>
                <p className="text-white text-lg font-semibold">{formatCurrency(SS_DATA.client.estimatedBenefit.at70)}/mo</p>
                <p className="text-gray-500 text-sm">~24% increase from FRA benefit</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">In {70 - SS_DATA.client.currentAge} years</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-gray-400 text-sm mb-2">Claim at 62</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(SS_DATA.projectedLifetimeBenefit.early)}</p>
          <p className="text-gray-500 text-sm mt-1">Lifetime estimate</p>
        </div>
        <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-5 text-center">
          <p className="text-gray-400 text-sm mb-2">Claim at FRA (67)</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(SS_DATA.projectedLifetimeBenefit.fra)}</p>
          <p className="text-gray-500 text-sm mt-1">Lifetime estimate</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center">
          <p className="text-emerald-400 text-sm mb-2">Claim at 70 ✓</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(SS_DATA.projectedLifetimeBenefit.delayed)}</p>
          <p className="text-gray-500 text-sm mt-1">Lifetime estimate</p>
        </div>
      </div>

      {/* Spouse */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-400" />
          Spouse Benefits — {SS_DATA.spouse.name}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <p className="text-gray-500 text-sm">At 62</p>
            <p className="text-white font-semibold">{formatCurrency(SS_DATA.spouse.estimatedBenefit.at62)}/mo</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <p className="text-gray-500 text-sm">At FRA</p>
            <p className="text-white font-semibold">{formatCurrency(SS_DATA.spouse.estimatedBenefit.atFRA)}/mo</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <p className="text-gray-500 text-sm">At 70</p>
            <p className="text-white font-semibold">{formatCurrency(SS_DATA.spouse.estimatedBenefit.at70)}/mo</p>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-4 text-center">
          Coordinating claiming strategies between spouses can maximize household benefits
        </p>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-gray-500 text-xs px-4">
        <p>Estimates based on current SSA projections and assume continued work history. Actual benefits may vary. 
        This is not tax or legal advice — consult your advisor for personalized guidance.</p>
      </div>
    </div>
  );
}
