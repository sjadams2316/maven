'use client';

import { useState } from 'react';

export default function PartnersSettings() {
  const [firmName, setFirmName] = useState('Adams Wealth Advisory');
  const [email, setEmail] = useState('advisor@adamswealthadvisory.com');
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your firm and account settings</p>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* Firm Info */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Firm Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Firm Name</label>
              <input
                type="text"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Primary Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Firm Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">A</span>
                </div>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                  Upload Logo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Default Client Settings */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Default Client Settings</h2>
          <p className="text-gray-400 text-sm mb-4">
            Set default features enabled for new clients. You can customize these per-client.
          </p>
          <div className="space-y-3">
            {['Dashboard', 'Goals Tracker', 'Retirement Projections', 'Oracle Chat'].map((feature) => (
              <label key={feature} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={feature !== 'Oracle Chat'}
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-white">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-white">Email Alerts</div>
                <div className="text-gray-500 text-sm">Get notified about important client insights</div>
              </div>
              <div className="w-12 h-7 bg-amber-600 rounded-full p-1">
                <div className="w-5 h-5 rounded-full bg-white translate-x-5" />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-white">Weekly Summary</div>
                <div className="text-gray-500 text-sm">Receive a weekly digest of client activity</div>
              </div>
              <div className="w-12 h-7 bg-amber-600 rounded-full p-1">
                <div className="w-5 h-5 rounded-full bg-white translate-x-5" />
              </div>
            </label>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Subscription</h2>
          <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div>
              <div className="text-amber-400 font-medium">Maven Partners Pro</div>
              <div className="text-gray-400 text-sm">Unlimited clients • All features</div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">$299/mo</div>
              <div className="text-gray-500 text-sm">Next billing: Mar 1</div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
