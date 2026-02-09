'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Header from '../components/Header';
import { useUserProfile } from '@/providers/UserProvider';

export default function SettingsPage() {
  const { user } = useUser();
  const { profile, updateProfile, isLoading, isDemoMode } = useUserProfile();
  
  const [settings, setSettings] = useState({
    // Profile (loaded from UserProvider)
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    state: '',
    
    // Notifications
    emailInsights: true,
    emailWeeklyDigest: true,
    emailMarketAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    
    // Privacy
    shareWithAdvisor: true,
    anonymousAnalytics: true,
    
    // Display
    showCents: false,
    defaultView: 'dashboard',
    theme: 'dark',
    
    // Security
    twoFactorEnabled: true,
    sessionTimeout: '30',
  });
  
  // Load profile data
  useEffect(() => {
    if (profile) {
      setSettings(prev => ({
        ...prev,
        firstName: profile.firstName || user?.firstName || '',
        lastName: profile.lastName || user?.lastName || '',
        email: profile.email || user?.emailAddresses?.[0]?.emailAddress || '',
        dateOfBirth: profile.dateOfBirth || '',
        state: profile.state || '',
      }));
    }
  }, [profile, user]);
  
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'security'>('profile');
  
  const handleSave = async () => {
    if (isDemoMode) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return;
    }
    
    await updateProfile({
      firstName: settings.firstName,
      lastName: settings.lastName,
      email: settings.email,
      dateOfBirth: settings.dateOfBirth,
      state: settings.state,
    });
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  const STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ];
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-white/10 rounded mb-4" />
            <div className="h-64 bg-white/5 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account and preferences</p>
        </div>
        
        {/* Demo Mode Warning */}
        {isDemoMode && (
          <div className="mb-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center gap-3">
            <span>⚠️</span>
            <span className="text-amber-300">You're in demo mode. Changes won't be saved.</span>
          </div>
        )}
        
        {/* Save Success */}
        {saved && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <span>✓</span>
            <span className="text-emerald-300">Settings saved successfully</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar */}
          <div className="sm:w-48 flex-shrink-0">
            <nav className="flex sm:flex-col gap-2">
              {[
                { key: 'profile', label: 'Profile', icon: '👤' },
                { key: 'notifications', label: 'Notifications', icon: '🔔' },
                { key: 'privacy', label: 'Privacy', icon: '🔒' },
                { key: 'security', label: 'Security', icon: '🛡️' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${
                    activeTab === tab.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
            
            {/* Edit Full Profile Link */}
            <Link
              href="/profile/setup"
              className="mt-4 flex items-center gap-2 px-4 py-3 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded-xl transition text-sm"
            >
              <span>✏️</span>
              <span className="hidden sm:inline">Edit Full Profile</span>
            </Link>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl">
                      {settings.firstName ? settings.firstName[0].toUpperCase() : '👤'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {settings.firstName} {settings.lastName}
                      </h3>
                      <p className="text-gray-400">{settings.email}</p>
                      {profile?.filingStatus && (
                        <p className="text-sm text-gray-500 mt-1">{profile.filingStatus}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">First Name</label>
                      <input
                        type="text"
                        value={settings.firstName}
                        onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={settings.lastName}
                        onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={settings.dateOfBirth}
                        onChange={(e) => setSettings({ ...settings, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">State</label>
                      <select
                        value={settings.state}
                        onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none"
                      >
                        <option value="">Select state...</option>
                        {STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Financial Summary */}
                  {profile && (
                    <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <p className="text-indigo-300 font-medium mb-2">Financial Profile Summary</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Cash Accounts</p>
                          <p className="text-white font-medium">{profile.cashAccounts?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Retirement</p>
                          <p className="text-white font-medium">{profile.retirementAccounts?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Investment</p>
                          <p className="text-white font-medium">{profile.investmentAccounts?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Liabilities</p>
                          <p className="text-white font-medium">{profile.liabilities?.length || 0}</p>
                        </div>
                      </div>
                      <Link
                        href="/profile/setup"
                        className="mt-3 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm"
                      >
                        Edit detailed financial profile →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Personalized Insights</p>
                      <p className="text-sm text-gray-500">AI-generated insights about your portfolio</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, emailInsights: !settings.emailInsights })}
                      className={`w-12 h-6 rounded-full transition ${settings.emailInsights ? 'bg-indigo-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition transform ${settings.emailInsights ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Weekly Digest</p>
                      <p className="text-sm text-gray-500">Weekly summary of your financial health</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, emailWeeklyDigest: !settings.emailWeeklyDigest })}
                      className={`w-12 h-6 rounded-full transition ${settings.emailWeeklyDigest ? 'bg-indigo-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition transform ${settings.emailWeeklyDigest ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Market Alerts</p>
                      <p className="text-sm text-gray-500">Important market movements & news</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, emailMarketAlerts: !settings.emailMarketAlerts })}
                      className={`w-12 h-6 rounded-full transition ${settings.emailMarketAlerts ? 'bg-indigo-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition transform ${settings.emailMarketAlerts ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">Browser notifications for important updates</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, pushNotifications: !settings.pushNotifications })}
                      className={`w-12 h-6 rounded-full transition ${settings.pushNotifications ? 'bg-indigo-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition transform ${settings.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Privacy Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Share with Advisor</p>
                      <p className="text-sm text-gray-500">Allow your financial advisor to view your data</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, shareWithAdvisor: !settings.shareWithAdvisor })}
                      className={`w-12 h-6 rounded-full transition ${settings.shareWithAdvisor ? 'bg-indigo-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition transform ${settings.shareWithAdvisor ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Anonymous Analytics</p>
                      <p className="text-sm text-gray-500">Help improve Maven with anonymous usage data</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, anonymousAnalytics: !settings.anonymousAnalytics })}
                      className={`w-12 h-6 rounded-full transition ${settings.anonymousAnalytics ? 'bg-indigo-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition transform ${settings.anonymousAnalytics ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 font-medium mb-2">Danger Zone</p>
                    <p className="text-sm text-gray-400 mb-3">Delete your account and all associated data. This cannot be undone.</p>
                    <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Security Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, twoFactorEnabled: !settings.twoFactorEnabled })}
                      className={`w-12 h-6 rounded-full transition ${settings.twoFactorEnabled ? 'bg-indigo-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition transform ${settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-white font-medium mb-2">Session Timeout</p>
                    <p className="text-sm text-gray-500 mb-3">Auto-logout after inactivity</p>
                    <select
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-indigo-500 outline-none"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-white font-medium mb-2">Active Sessions</p>
                    <p className="text-sm text-gray-500 mb-3">Manage devices where you're logged in</p>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">🖥️ This device</span>
                        <span className="text-emerald-400">Active now</span>
                      </div>
                    </div>
                    <button className="text-sm text-indigo-400 hover:text-indigo-300 transition">
                      Sign out all other sessions
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
