'use client';

import { useState } from 'react';

export default function PartnersSettings() {
  const [firmName, setFirmName] = useState('Adams Wealth Advisory');
  const [email, setEmail] = useState('advisor@adamswealthadvisory.com');
  
  // Feature toggles state
  const [enabledFeatures, setEnabledFeatures] = useState({
    dashboard: true,
    goalsTracker: true,
    retirementProjections: true,
    oracleChat: false,
  });
  
  // Notification toggles state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  
  // Save state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  const showComingSoon = (feature: string) => {
    alert(`${feature} - Coming soon! This feature is under development.`);
  };
  
  const toggleFeature = (key: keyof typeof enabledFeatures) => {
    setEnabledFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Settings</h1>
        <p className="text-gray-400 text-sm md:text-base">Manage your firm and account settings</p>
      </div>

      <div className="max-w-2xl space-y-6 md:space-y-8">
        {/* Firm Info */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Firm Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Firm Name</label>
              <input
                type="text"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Primary Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Firm Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-2xl">A</span>
                </div>
                <button 
                  onClick={() => showComingSoon('Logo Upload')}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
                >
                  Upload Logo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Default Client Settings */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Default Client Settings</h2>
          <p className="text-gray-400 text-sm mb-4">
            Set default features enabled for new clients. You can customize these per-client.
          </p>
          <div className="space-y-3">
            {[
              { key: 'dashboard' as const, label: 'Dashboard' },
              { key: 'goalsTracker' as const, label: 'Goals Tracker' },
              { key: 'retirementProjections' as const, label: 'Retirement Projections' },
              { key: 'oracleChat' as const, label: 'Oracle Chat' },
            ].map((feature) => (
              <button
                key={feature.key}
                onClick={() => toggleFeature(feature.key)}
                className="flex items-center gap-3 w-full text-left min-h-[48px] p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  enabledFeatures[feature.key]
                    ? 'bg-amber-600 border-amber-600'
                    : 'border-gray-500'
                }`}>
                  {enabledFeatures[feature.key] && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-white">{feature.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Notifications</h2>
          <div className="space-y-4">
            <button
              onClick={() => setEmailAlerts(!emailAlerts)}
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/5 transition-colors min-h-[64px]"
            >
              <div className="text-left">
                <div className="text-white">Email Alerts</div>
                <div className="text-gray-500 text-sm">Get notified about important client insights</div>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${emailAlerts ? 'bg-amber-600' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${emailAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>
            <button
              onClick={() => setWeeklySummary(!weeklySummary)}
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/5 transition-colors min-h-[64px]"
            >
              <div className="text-left">
                <div className="text-white">Weekly Summary</div>
                <div className="text-gray-500 text-sm">Receive a weekly digest of client activity</div>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${weeklySummary ? 'bg-amber-600' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${weeklySummary ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Subscription</h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div>
              <div className="text-amber-400 font-medium">Maven Partners Pro</div>
              <div className="text-gray-400 text-sm">Unlimited clients • All features</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-white font-bold">$299/mo</div>
              <div className="text-gray-500 text-sm">Next billing: Mar 1</div>
            </div>
          </div>
          <button
            onClick={() => showComingSoon('Billing Management')}
            className="mt-4 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px] w-full sm:w-auto"
          >
            Manage Billing
          </button>
        </div>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <span>✓</span>
              <span>Changes saved successfully</span>
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 text-white font-medium rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
