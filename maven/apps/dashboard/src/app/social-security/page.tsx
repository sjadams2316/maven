'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import SocialSecurityForm from '../components/SocialSecurityForm';
import { useSocialSecurity, useUserProfile } from '@/providers/UserProvider';
import {
  analyzeSocialSecurity,
  SSAnalysis,
  SSProfile,
  formatSSCurrency,
  getRecommendationSummary,
} from '@/lib/social-security-calculator';

export default function SocialSecurityPage() {
  const router = useRouter();
  const { socialSecurity, isLoading } = useSocialSecurity();
  const { profile } = useUserProfile();
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  
  // Check if we have enough data for analysis
  const hasData = socialSecurity?.dateOfBirth && socialSecurity?.benefitAtFRA;
  
  // Run analysis when data is available
  const analysis: SSAnalysis | null = useMemo(() => {
    if (!hasData || !socialSecurity) return null;
    
    try {
      const ssProfile: SSProfile = {
        dateOfBirth: socialSecurity.dateOfBirth!,
        lifeExpectancy: socialSecurity.lifeExpectancy || 85,
        benefitAt62: socialSecurity.benefitAt62 || Math.round((socialSecurity.benefitAtFRA || 0) * 0.7),
        benefitAtFRA: socialSecurity.benefitAtFRA!,
        benefitAt70: socialSecurity.benefitAt70 || Math.round((socialSecurity.benefitAtFRA || 0) * 1.24),
        currentlyWorking: socialSecurity.currentlyWorking,
        expectedEarnings: socialSecurity.expectedEarnings,
        retirementAge: socialSecurity.retirementAge,
        isMarried: !!socialSecurity.spouseDOB,
        spouseDOB: socialSecurity.spouseDOB,
        spouseBenefitAt62: socialSecurity.spouseBenefitAt62,
        spouseBenefitAtFRA: socialSecurity.spouseBenefitAtFRA,
        spouseBenefitAt70: socialSecurity.spouseBenefitAt70,
        marriageDate: socialSecurity.marriageDate,
      };
      
      return analyzeSocialSecurity(ssProfile);
    } catch (error) {
      console.error('Error running analysis:', error);
      return null;
    }
  }, [socialSecurity, hasData]);
  
  const recommendation = useMemo(() => {
    if (!analysis || !socialSecurity) return null;
    return getRecommendationSummary(analysis, {
      dateOfBirth: socialSecurity.dateOfBirth!,
      lifeExpectancy: socialSecurity.lifeExpectancy || 85,
      benefitAt62: socialSecurity.benefitAt62!,
      benefitAtFRA: socialSecurity.benefitAtFRA!,
      benefitAt70: socialSecurity.benefitAt70!,
      isMarried: !!socialSecurity.spouseDOB,
    });
  }, [analysis, socialSecurity]);

  // Set default selected scenario to optimal
  useEffect(() => {
    if (analysis && selectedScenario === null) {
      const optimalIdx = analysis.scenarios.findIndex(s => s.claimingAge === analysis.optimalClaimingAge);
      setSelectedScenario(optimalIdx >= 0 ? optimalIdx : 4); // Default to FRA if not found
    }
  }, [analysis, selectedScenario]);

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/social-security/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profile: socialSecurity,
          analysis,
          recommendation,
          userName: profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : undefined,
        }),
      });
      
      if (!response.ok) throw new Error('PDF generation failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social-security-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold animate-pulse">
          M
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header
        profile={profile ? { firstName: profile.firstName, netWorth: 0, totalInvestments: 0 } : null}
        showFinancialSummary={false}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <span>→</span>
          <span className="text-white">Social Security Optimizer</span>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">🎯</span>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Social Security Optimizer</h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                      Find your optimal claiming strategy • Worth $100K+ in lifetime benefits
                    </p>
                  </div>
                </div>
              </div>
              
              {hasData && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-white transition"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {!hasData || showForm ? (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">
                {hasData ? 'Update Your Information' : "Let's Get Started"}
              </h2>
              <p className="text-gray-400">
                Enter your Social Security information to see your personalized optimization analysis.
              </p>
            </div>
            <SocialSecurityForm 
              onComplete={() => setShowForm(false)}
              initialData={socialSecurity || undefined}
            />
          </div>
        ) : analysis ? (
          <div className="space-y-8">
            {/* Executive Summary Card */}
            <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                  ✨
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {recommendation?.headline}
                  </h2>
                  <p className="text-gray-300 mb-4">{analysis.optimalExplanation}</p>
                  
                  <div className="grid sm:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400">Monthly Benefit</p>
                      <p className="text-2xl font-bold text-white">
                        ${analysis.scenarios.find(s => s.claimingAge === analysis.optimalClaimingAge)?.monthlyBenefit.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400">Lifetime Total</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {formatSSCurrency(analysis.scenarios.find(s => s.claimingAge === analysis.optimalClaimingAge)?.lifetimeTotal || 0)}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400">vs. Claiming at 62</p>
                      <p className={`text-2xl font-bold ${analysis.lifetimeAdvantage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {analysis.lifetimeAdvantage >= 0 ? '+' : ''}{formatSSCurrency(analysis.lifetimeAdvantage)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Download PDF Button */}
              <div className="mt-6 pt-6 border-t border-emerald-500/20">
                <button
                  onClick={handleDownloadPDF}
                  disabled={generating}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      📄 Download PDF Report
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Take this report to your Social Security appointment
                </p>
              </div>
            </div>

            {/* Scenario Comparison */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📊</span> Claiming Age Comparison
              </h3>
              
              {/* Mobile-friendly card view */}
              <div className="block lg:hidden space-y-4">
                {analysis.scenarios.filter(s => [62, 67, 70].includes(s.claimingAge)).map((scenario, idx) => (
                  <div
                    key={scenario.claimingAge}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      scenario.claimingAge === analysis.optimalClaimingAge
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">Age {scenario.claimingAge}</span>
                        {scenario.claimingAge === analysis.optimalClaimingAge && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                            Optimal
                          </span>
                        )}
                      </div>
                      <span className={`text-sm ${scenario.percentOfPIA >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {scenario.percentOfPIA.toFixed(0)}% of PIA
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Monthly</p>
                        <p className="font-semibold text-white">${scenario.monthlyBenefit.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Lifetime</p>
                        <p className="font-semibold text-white">{formatSSCurrency(scenario.lifetimeTotal)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-white/10">
                      <th className="pb-3">Claiming Age</th>
                      <th className="pb-3">Monthly</th>
                      <th className="pb-3">% of PIA</th>
                      <th className="pb-3">By Age 80</th>
                      <th className="pb-3">By Age 85</th>
                      <th className="pb-3">Lifetime*</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.scenarios.map((scenario) => (
                      <tr
                        key={scenario.claimingAge}
                        className={`border-b border-white/5 ${
                          scenario.claimingAge === analysis.optimalClaimingAge
                            ? 'bg-emerald-500/10'
                            : ''
                        }`}
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{scenario.claimingAge}</span>
                            {scenario.claimingAge === analysis.optimalClaimingAge && (
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                Best
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-medium text-white">
                          ${scenario.monthlyBenefit.toLocaleString()}
                        </td>
                        <td className={`py-3 ${scenario.percentOfPIA >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {scenario.percentOfPIA.toFixed(0)}%
                        </td>
                        <td className="py-3 text-gray-400">
                          {formatSSCurrency(scenario.cumulativeByAge80)}
                        </td>
                        <td className="py-3 text-gray-400">
                          {formatSSCurrency(scenario.cumulativeByAge85)}
                        </td>
                        <td className="py-3 font-medium text-white">
                          {formatSSCurrency(scenario.lifetimeTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-3">
                  * Lifetime total based on your life expectancy of {socialSecurity?.lifeExpectancy || 85} years
                </p>
              </div>
            </div>

            {/* Break-Even Analysis */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>⚖️</span> Break-Even Analysis
              </h3>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">62 vs FRA ({analysis.fullRetirementAge})</span>
                  </div>
                  <p className="text-xl font-semibold text-white">
                    {analysis.breakEven62vsFRA.formattedBreakEven}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    FRA catches up after {Math.round(analysis.breakEven62vsFRA.monthsToRecoup / 12)} years
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">62 vs 70</span>
                  </div>
                  <p className="text-xl font-semibold text-white">
                    {analysis.breakEven62vs70.formattedBreakEven}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    70 catches up after {Math.round(analysis.breakEven62vs70.monthsToRecoup / 12)} years
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">FRA vs 70</span>
                  </div>
                  <p className="text-xl font-semibold text-white">
                    {analysis.breakEvenFRAvs70.formattedBreakEven}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    70 catches up after {Math.round(analysis.breakEvenFRAvs70.monthsToRecoup / 12)} years
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <p className="text-sm text-indigo-300">
                  💡 <strong>What this means:</strong> If you live past age {Math.ceil(analysis.breakEven62vs70.breakEvenAge)}, 
                  delaying to 70 will have been the better choice financially. Your estimated life expectancy 
                  of {socialSecurity?.lifeExpectancy || 85} is {(socialSecurity?.lifeExpectancy || 85) > analysis.breakEven62vs70.breakEvenAge 
                    ? `${Math.round((socialSecurity?.lifeExpectancy || 85) - analysis.breakEven62vs70.breakEvenAge)} years past` 
                    : `${Math.round(analysis.breakEven62vs70.breakEvenAge - (socialSecurity?.lifeExpectancy || 85))} years before`} this break-even point.
                </p>
              </div>
            </div>

            {/* Life Expectancy Sensitivity */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📈</span> What If You Live Longer (or Shorter)?
              </h3>
              
              <div className="overflow-x-auto">
                <div className="flex gap-3 min-w-max">
                  {analysis.lifetimeByLifeExpectancy.map((le) => (
                    <div
                      key={le.lifeExpectancy}
                      className={`flex-1 min-w-[100px] p-3 rounded-xl text-center ${
                        le.lifeExpectancy === (socialSecurity?.lifeExpectancy || 85)
                          ? 'bg-purple-500/20 border border-purple-500/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <p className="text-xs text-gray-500 mb-1">Live to {le.lifeExpectancy}</p>
                      <p className="text-lg font-bold text-white">Claim at {le.bestAge}</p>
                      <p className="text-xs text-gray-400">{formatSSCurrency(le.bestLifetime)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                The optimal claiming age depends heavily on how long you live. Purple highlights your estimated life expectancy.
              </p>
            </div>

            {/* Action Items */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>✅</span> Your Action Plan
              </h3>
              
              <div className="space-y-3">
                {recommendation?.actionItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-indigo-400">{idx + 1}</span>
                    </div>
                    <p className="text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-sm text-amber-300/80">
                ⚠️ <strong>Important:</strong> This analysis is for educational purposes only and should not be considered 
                financial advice. Actual benefits may vary based on your complete earnings history, changes in legislation, 
                and other factors. We recommend verifying your estimates at ssa.gov and consulting with a financial advisor 
                before making claiming decisions.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">Unable to generate analysis. Please check your inputs.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition"
            >
              Edit Profile
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
