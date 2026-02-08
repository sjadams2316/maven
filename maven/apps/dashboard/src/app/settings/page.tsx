'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Profile
    firstName: 'Sam',
    lastName: 'Adams',
    email: 'sam@example.com',
    phone: '(555) 123-4567',
    
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
  
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'security'>('profile');
  
  const handleSave = () => {
    localStorage.setItem('maven_user_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account and preferences</p>
        </div>
        
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
                      👨
                    </div>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition">
                      Change Avatar
                    </button>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">First Name</label>
                      <input
                        type="text"
                        value={settings.firstName}
                        onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Last Name</label>
                      <input
                        type="text"
                        value={settings.lastName}
                        onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Phone</label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'emailInsights', label: 'New insights & recommendations', desc: 'Tax savings, rebalancing opportunities, etc.' },
                        { key: 'emailWeeklyDigest', label: 'Weekly portfolio digest', desc: 'Summary of your portfolio performance' },
                        { key: 'emailMarketAlerts', label: 'Market alerts', desc: 'Significant market events affecting your portfolio' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div>
                            <p className="text-white">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              settings[item.key as keyof typeof settings] ? 'bg-indigo-600' : 'bg-gray-700'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-sm font-medium text-white mb-4">Other Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Push notifications</p>
                          <p className="text-sm text-gray-500">Receive alerts on your device</p>
                        </div>
                        <button
                          onClick={() => setSettings({ ...settings, pushNotifications: !settings.pushNotifications })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            settings.pushNotifications ? 'bg-indigo-600' : 'bg-gray-700'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">SMS alerts</p>
                          <p className="text-sm text-gray-500">Critical alerts via text message</p>
                        </div>
                        <button
                          onClick={() => setSettings({ ...settings, smsAlerts: !settings.smsAlerts })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            settings.smsAlerts ? 'bg-indigo-600' : 'bg-gray-700'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.smsAlerts ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Privacy Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Share data with advisor</p>
                      <p className="text-sm text-gray-500">Allow your financial advisor to view your portfolio</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, shareWithAdvisor: !settings.shareWithAdvisor })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.shareWithAdvisor ? 'bg-indigo-600' : 'bg-gray-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.shareWithAdvisor ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Anonymous analytics</p>
                      <p className="text-sm text-gray-500">Help improve Maven with anonymous usage data</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, anonymousAnalytics: !settings.anonymousAnalytics })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.anonymousAnalytics ? 'bg-indigo-600' : 'bg-gray-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.anonymousAnalytics ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-sm font-medium text-white mb-4">Data Management</h3>
                    <div className="space-y-3">
                      <button className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition">
                        <p className="text-white">Download my data</p>
                        <p className="text-sm text-gray-500">Get a copy of all your Maven data</p>
                      </button>
                      <button className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-left transition">
                        <p className="text-red-400">Delete my account</p>
                        <p className="text-sm text-red-400/70">Permanently remove all data</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        settings.twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {settings.twoFactorEnabled ? '✓' : '✕'}
                      </div>
                      <div>
                        <p className="text-white">Two-factor authentication</p>
                        <p className="text-sm text-gray-500">
                          {settings.twoFactorEnabled ? 'Enabled via authenticator app' : 'Not enabled'}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition">
                      {settings.twoFactorEnabled ? 'Manage' : 'Enable'}
                    </button>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Session timeout</label>
                    <select
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                      className="w-full sm:w-64 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="240">4 hours</option>
                    </select>
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-sm font-medium text-white mb-4">Password</h3>
                    <button className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition">
                      Change Password
                    </button>
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-sm font-medium text-white mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      {[
                        { device: 'Chrome on MacBook Pro', location: 'Vienna, VA', current: true },
                        { device: 'Safari on iPhone', location: 'Vienna, VA', current: false },
                      ].map((session, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{session.device.includes('iPhone') ? '📱' : '💻'}</span>
                            <div>
                              <p className="text-white text-sm">{session.device}</p>
                              <p className="text-xs text-gray-500">{session.location}</p>
                            </div>
                          </div>
                          {session.current ? (
                            <span className="text-xs text-emerald-400">Current</span>
                          ) : (
                            <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
                          )}
                        </div>
                      ))}
                    </div>
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
