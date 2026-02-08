'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface ActivityItem {
  id: string;
  type: 'login' | 'view' | 'action' | 'sync' | 'setting';
  description: string;
  details?: string;
  timestamp: Date;
  device?: string;
  location?: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    type: 'login',
    description: 'Signed in',
    device: 'Chrome on MacBook Pro',
    location: 'Vienna, VA',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: '2',
    type: 'view',
    description: 'Viewed Portfolio Lab',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: '3',
    type: 'action',
    description: 'Generated tax-loss harvest report',
    details: '3 opportunities, $4,200 potential savings',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '4',
    type: 'sync',
    description: 'Schwab accounts synced',
    details: '3 accounts updated',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '5',
    type: 'view',
    description: 'Viewed Market Fragility Index',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: '6',
    type: 'action',
    description: 'Asked Oracle a question',
    details: '"What\'s my current asset allocation?"',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: '7',
    type: 'login',
    description: 'Signed in',
    device: 'Safari on iPhone',
    location: 'Vienna, VA',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '8',
    type: 'setting',
    description: 'Updated notification preferences',
    details: 'Enabled push notifications',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '9',
    type: 'sync',
    description: 'Coinbase account linked',
    details: '1 account connected',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '10',
    type: 'action',
    description: 'Added new financial goal',
    details: 'Beach House - $400,000 target',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  login: { icon: '🔑', color: 'text-blue-400' },
  view: { icon: '👁️', color: 'text-gray-400' },
  action: { icon: '⚡', color: 'text-amber-400' },
  sync: { icon: '🔄', color: 'text-emerald-400' },
  setting: { icon: '⚙️', color: 'text-purple-400' },
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByDate(items: ActivityItem[]): Record<string, ActivityItem[]> {
  const groups: Record<string, ActivityItem[]> = {};
  
  items.forEach(item => {
    const date = item.timestamp.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  });
  
  return groups;
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<string>('all');
  
  const filteredActivity = MOCK_ACTIVITY.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });
  
  const groupedActivity = groupByDate(filteredActivity);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Activity Log</h1>
          <p className="text-gray-400 mt-1">Your recent activity on Maven</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {[
            { key: 'all', label: 'All Activity' },
            { key: 'login', label: 'Sign-ins' },
            { key: 'action', label: 'Actions' },
            { key: 'sync', label: 'Syncs' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                filter === f.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        {/* Activity Timeline */}
        {Object.keys(groupedActivity).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mx-auto mb-4">
              📋
            </div>
            <p className="text-gray-400">No activity found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedActivity).map(([date, items]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 mb-3">{date}</h3>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />
                  
                  <div className="space-y-4">
                    {items.map((item, idx) => {
                      const config = TYPE_CONFIG[item.type];
                      
                      return (
                        <div key={item.id} className="relative flex gap-4">
                          {/* Timeline dot */}
                          <div className={`w-10 h-10 rounded-full bg-[#12121a] border border-white/10 flex items-center justify-center text-lg z-10 ${config.color}`}>
                            {config.icon}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 bg-[#12121a] border border-white/10 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-white">{item.description}</p>
                                {item.details && (
                                  <p className="text-sm text-gray-500 mt-1">{item.details}</p>
                                )}
                                {item.device && (
                                  <p className="text-xs text-gray-600 mt-2">
                                    {item.device} • {item.location}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-gray-600 whitespace-nowrap">
                                {item.timestamp.toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Export */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <button className="text-sm text-gray-500 hover:text-gray-400 transition">
            Download activity log (CSV) →
          </button>
        </div>
      </main>
    </div>
  );
}
