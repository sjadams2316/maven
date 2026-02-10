'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

export default function AdvisorSettingsPage() {
  const [settings, setSettings] = useState({
    // Notification preferences
    emailOnClientJoin: true,
    emailOnHighPriorityInsight: true,
    emailOnMeetingReminder: true,
    emailDigestFrequency: 'daily',
    
    // Default client settings
    defaultClientTone: 'moderate',
    autoShowTaxInsights: true,
    autoShowRebalanceInsights: true,
    
    // Display preferences
    showAUMOnDashboard: true,
    showClientActivity: true,
    
    // Firm info
    firmName: 'Adams Wealth Management',
    advisorName: 'Jon Adams',
    advisorEmail: 'jon@adamswm.com',
    advisorPhone: '(555) 123-4567',
  });
  
  const [saved, setSaved] = useState(false);
  
  const handleSave = () => {
    // In production, this would save to backend
    localStorage.setItem('maven_advisor_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Link href="/advisor" className="hover:text-white transition">Advisor</Link>
            <span>/</span>
            <span className="text-white">Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Advisor Settings</h1>
          <p className="text-gray-400 mt-1">Configure your Maven experience</p>
        </div>
        
        {/* Save Success Banner */}
        {saved && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <span className="text-xl">✓</span>
            <span className="text-emerald-300">Settings saved successfully</span>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Firm Information */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>🏢</span> Firm Information
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Firm Name</label>
                <input
                  type="text"
                  value={settings.firmName}
                  onChange={(e) => setSettings({ ...settings, firmName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Your Name</label>
                <input
                  type="text"
                  value={settings.advisorName}
                  onChange={(e) => setSettings({ ...settings, advisorName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email</label>
                <input
                  type="email"
                  value={settings.advisorEmail}
                  onChange={(e) => setSettings({ ...settings, advisorEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={settings.advisorPhone}
                  onChange={(e) => setSettings({ ...settings, advisorPhone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
          
          {/* Notification Preferences */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>🔔</span> Notification Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Email when client joins</p>
                  <p className="text-sm text-gray-500">Get notified when a client completes onboarding</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, emailOnClientJoin: !settings.emailOnClientJoin })}
                  className={`w-14 h-8 min-h-[48px] min-w-[48px] rounded-full transition-colors ${
                    settings.emailOnClientJoin ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    settings.emailOnClientJoin ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">High-priority insight alerts</p>
                  <p className="text-sm text-gray-500">Email for urgent insights (tax harvest, concentration, etc.)</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, emailOnHighPriorityInsight: !settings.emailOnHighPriorityInsight })}
                  className={`w-14 h-8 min-h-[48px] min-w-[48px] rounded-full transition-colors ${
                    settings.emailOnHighPriorityInsight ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    settings.emailOnHighPriorityInsight ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Meeting reminders</p>
                  <p className="text-sm text-gray-500">Get reminded 24 hours before client meetings</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, emailOnMeetingReminder: !settings.emailOnMeetingReminder })}
                  className={`w-14 h-8 min-h-[48px] min-w-[48px] rounded-full transition-colors ${
                    settings.emailOnMeetingReminder ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    settings.emailOnMeetingReminder ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Email digest frequency</label>
                <select
                  value={settings.emailDigestFrequency}
                  onChange={(e) => setSettings({ ...settings, emailDigestFrequency: e.target.value })}
                  className="w-full sm:w-64 px-4 py-3 min-h-[48px] bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="realtime">Real-time</option>
                  <option value="daily">Daily digest</option>
                  <option value="weekly">Weekly digest</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Default Client Settings */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>👥</span> Default Client Settings
            </h2>
            <p className="text-sm text-gray-500 mb-4">These defaults apply to new clients. You can override per-client.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Default client tone</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'conservative', label: 'Conservative', desc: 'Minimal alerts' },
                    { value: 'moderate', label: 'Moderate', desc: 'Balanced' },
                    { value: 'engaged', label: 'Engaged', desc: 'Full insights' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSettings({ ...settings, defaultClientTone: option.value })}
                      className={`p-3 min-h-[48px] rounded-xl border transition text-center ${
                        settings.defaultClientTone === option.value
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs opacity-70">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Auto-show tax insights</p>
                  <p className="text-sm text-gray-500">Show tax-loss harvest opportunities to clients by default</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, autoShowTaxInsights: !settings.autoShowTaxInsights })}
                  className={`w-14 h-8 min-h-[48px] min-w-[48px] rounded-full transition-colors ${
                    settings.autoShowTaxInsights ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    settings.autoShowTaxInsights ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Auto-show rebalance insights</p>
                  <p className="text-sm text-gray-500">Show portfolio drift alerts to clients by default</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, autoShowRebalanceInsights: !settings.autoShowRebalanceInsights })}
                  className={`w-14 h-8 min-h-[48px] min-w-[48px] rounded-full transition-colors ${
                    settings.autoShowRebalanceInsights ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    settings.autoShowRebalanceInsights ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Display Preferences */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>🎨</span> Display Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Show AUM on dashboard</p>
                  <p className="text-sm text-gray-500">Display total assets under management</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showAUMOnDashboard: !settings.showAUMOnDashboard })}
                  className={`w-14 h-8 min-h-[48px] min-w-[48px] rounded-full transition-colors ${
                    settings.showAUMOnDashboard ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    settings.showAUMOnDashboard ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Show client activity feed</p>
                  <p className="text-sm text-gray-500">See when clients log in and what they view</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showClientActivity: !settings.showClientActivity })}
                  className={`w-14 h-8 min-h-[48px] min-w-[48px] rounded-full transition-colors ${
                    settings.showClientActivity ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    settings.showClientActivity ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-3 min-h-[48px] bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
