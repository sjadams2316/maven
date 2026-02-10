'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'client_joined' | 'insight_alert' | 'meeting_reminder' | 'client_activity';
  title: string;
  description: string;
  clientId?: string;
  clientName?: string;
  timestamp: Date;
  read: boolean;
}

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'insight_alert',
    title: 'Tax-loss harvest opportunity',
    description: 'Sam Adams has $4,200 potential savings',
    clientId: '1',
    clientName: 'Sam Adams',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    read: false,
  },
  {
    id: '2',
    type: 'meeting_reminder',
    title: 'Meeting in 2 hours',
    description: 'Review with Sam Adams at 2:00 PM',
    clientId: '1',
    clientName: 'Sam Adams',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'client_activity',
    title: 'Client viewed Fragility Index',
    description: 'Sam Adams checked market conditions',
    clientId: '1',
    clientName: 'Sam Adams',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '4',
    type: 'insight_alert',
    title: 'Concentration risk detected',
    description: 'Jane Smith: AAPL at 42%',
    clientId: '2',
    clientName: 'Jane Smith',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    read: true,
  },
];

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'client_joined': return '🎉';
    case 'insight_alert': return '💡';
    case 'meeting_reminder': return '📅';
    case 'client_activity': return '📱';
    default: return '🔔';
  }
}

export default function AdvisorNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notifications]')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);
  
  return (
    <div className="relative" data-notifications>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-white/10 transition"
      >
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#12121a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition min-h-[44px] px-2 flex items-center"
              >
                Mark all read
              </button>
            )}
          </div>
          
          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <Link
                  key={notification.id}
                  href={notification.clientId ? `/advisor/clients/${notification.clientId}` : '#'}
                  onClick={() => markAsRead(notification.id)}
                  className={`block px-4 py-3 min-h-[48px] border-b border-white/5 hover:bg-white/5 transition ${
                    !notification.read ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm truncate ${!notification.read ? 'font-medium text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{notification.description}</p>
                      <p className="text-xs text-gray-600 mt-1">{getRelativeTime(notification.timestamp)}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/10 bg-white/5">
            <Link
              href="/advisor"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition min-h-[44px] flex items-center"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
