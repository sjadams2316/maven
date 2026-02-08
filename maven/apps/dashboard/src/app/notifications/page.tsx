'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Notification {
  id: string;
  type: 'insight' | 'alert' | 'milestone' | 'system' | 'advisor';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'insight',
    title: 'Tax-loss harvest opportunity',
    message: 'VWO is showing a $4,200 loss. Harvesting before year-end could save you ~$1,050 in taxes.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    actionUrl: '/tax-harvesting',
    actionLabel: 'Review',
  },
  {
    id: '2',
    type: 'alert',
    title: 'Market Fragility elevated',
    message: 'The Fragility Index has risen to 68 (Elevated). Consider reviewing your risk exposure.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    actionUrl: '/fragility',
    actionLabel: 'Check Index',
  },
  {
    id: '3',
    type: 'milestone',
    title: '🎉 Retirement goal 40% funded!',
    message: 'You\'ve reached $1.2M of your $3M retirement goal. Keep it up!',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: '/goals',
    actionLabel: 'View Goals',
  },
  {
    id: '4',
    type: 'system',
    title: 'Schwab account synced',
    message: 'Your Charles Schwab accounts have been updated with the latest data.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '5',
    type: 'advisor',
    title: 'Message from your advisor',
    message: 'Jon Adams shared a new document: "Q1 2026 Strategy Review"',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: '/documents',
    actionLabel: 'View Document',
  },
  {
    id: '6',
    type: 'insight',
    title: 'Portfolio rebalancing suggested',
    message: 'Your portfolio has drifted 8% from target allocation. Consider rebalancing.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: '/portfolio-lab',
    actionLabel: 'Review',
  },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  insight: { icon: '💡', color: 'from-amber-500 to-orange-500', label: 'Insight' },
  alert: { icon: '⚠️', color: 'from-red-500 to-rose-500', label: 'Alert' },
  milestone: { icon: '🏆', color: 'from-emerald-500 to-teal-500', label: 'Milestone' },
  system: { icon: '⚙️', color: 'from-gray-500 to-gray-600', label: 'System' },
  advisor: { icon: '👤', color: 'from-indigo-500 to-purple-500', label: 'Advisor' },
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<string>('all');
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'insight', label: 'Insights' },
            { key: 'alert', label: 'Alerts' },
            { key: 'milestone', label: 'Milestones' },
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
        
        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mx-auto mb-4">
              🔔
            </div>
            <p className="text-gray-400">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => {
              const config = TYPE_CONFIG[notification.type];
              
              return (
                <div
                  key={notification.id}
                  className={`bg-[#12121a] border rounded-xl p-4 transition ${
                    notification.read 
                      ? 'border-white/10' 
                      : 'border-indigo-500/30 bg-indigo-500/5'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-lg flex-shrink-0`}>
                      {config.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-600">{getRelativeTime(notification.timestamp)}</span>
                        
                        <div className="flex items-center gap-2">
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                            >
                              {notification.actionLabel || 'View'} →
                            </Link>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-gray-500 hover:text-gray-400 transition"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Settings Link */}
        <div className="mt-8 text-center">
          <Link
            href="/settings"
            className="text-sm text-gray-500 hover:text-gray-400 transition"
          >
            Manage notification preferences →
          </Link>
        </div>
      </main>
    </div>
  );
}
