'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'deadline' | 'reminder' | 'market';
  date: Date;
  time?: string;
  duration?: number;
  description?: string;
  attendees?: string[];
  location?: string;
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Q1 Portfolio Review',
    type: 'meeting',
    date: new Date('2026-02-15'),
    time: '2:00 PM',
    duration: 60,
    description: 'Review Q1 performance and discuss rebalancing',
    attendees: ['Jon Adams (Advisor)'],
    location: 'Video Call',
  },
  {
    id: '2',
    title: '401(k) Contribution Deadline',
    type: 'deadline',
    date: new Date('2026-04-15'),
    description: 'Last day to make 2025 401(k) contributions',
  },
  {
    id: '3',
    title: 'Tax Filing Deadline',
    type: 'deadline',
    date: new Date('2026-04-15'),
    description: 'Federal tax return due',
  },
  {
    id: '4',
    title: 'Review Insurance Coverage',
    type: 'reminder',
    date: new Date('2026-03-01'),
    description: 'Annual review of life and disability insurance',
  },
  {
    id: '5',
    title: 'Fed Interest Rate Decision',
    type: 'market',
    date: new Date('2026-03-19'),
    time: '2:00 PM',
    description: 'FOMC meeting rate decision announcement',
  },
  {
    id: '6',
    title: 'Estimated Tax Payment Due',
    type: 'deadline',
    date: new Date('2026-06-15'),
    description: 'Q2 estimated tax payment',
  },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; bgColor: string }> = {
  meeting: { icon: '📅', color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/30' },
  deadline: { icon: '⏰', color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/30' },
  reminder: { icon: '🔔', color: 'text-amber-400', bgColor: 'bg-amber-500/20 border-amber-500/30' },
  market: { icon: '📊', color: 'text-purple-400', bgColor: 'bg-purple-500/20 border-purple-500/30' },
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getDaysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CalendarPage() {
  const [view, setView] = useState<'upcoming' | 'month'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const sortedEvents = [...MOCK_EVENTS].sort((a, b) => a.date.getTime() - b.date.getTime());
  const upcomingEvents = sortedEvents.filter(e => getDaysUntil(e.date) >= 0);
  
  // Group events by month
  const groupByMonth = (events: CalendarEvent[]) => {
    const groups: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const key = event.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });
    return groups;
  };
  
  const groupedEvents = groupByMonth(upcomingEvents);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Financial Calendar</h1>
            <p className="text-gray-400 mt-1">Meetings, deadlines, and important dates</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setView('upcoming')}
              className={`px-4 py-2 rounded-xl transition ${
                view === 'upcoming' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-xl transition ${
                view === 'month' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              Month
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'This Week', count: upcomingEvents.filter(e => getDaysUntil(e.date) <= 7).length, color: 'text-blue-400' },
            { label: 'Meetings', count: upcomingEvents.filter(e => e.type === 'meeting').length, color: 'text-emerald-400' },
            { label: 'Deadlines', count: upcomingEvents.filter(e => e.type === 'deadline').length, color: 'text-red-400' },
            { label: 'Reminders', count: upcomingEvents.filter(e => e.type === 'reminder').length, color: 'text-amber-400' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#12121a] border border-white/10 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
        
        {/* Upcoming View */}
        {view === 'upcoming' && (
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([month, events]) => (
              <div key={month}>
                <h2 className="text-lg font-semibold text-white mb-4">{month}</h2>
                
                <div className="space-y-3">
                  {events.map((event) => {
                    const config = TYPE_CONFIG[event.type];
                    const daysUntil = getDaysUntil(event.date);
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full ${config.bgColor} border rounded-xl p-4 text-left hover:opacity-90 transition`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-2xl">{config.icon}</div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-white">{event.title}</h3>
                              {daysUntil <= 7 && daysUntil >= 0 && (
                                <span className="px-2 py-0.5 bg-red-500/30 text-red-400 text-xs rounded-full">
                                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              {formatDate(event.date)}
                              {event.time && ` at ${event.time}`}
                              {event.duration && ` (${event.duration} min)`}
                            </p>
                            {event.description && (
                              <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                            )}
                          </div>
                          
                          <span className="text-gray-500">→</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Month View */}
        {view === 'month' && (
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white">February 2026</h2>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the 1st */}
              {[...Array(0)].map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square" />
              ))}
              
              {/* Days of the month */}
              {[...Array(28)].map((_, idx) => {
                const day = idx + 1;
                const dateStr = `2026-02-${day.toString().padStart(2, '0')}`;
                const dayEvents = MOCK_EVENTS.filter(e => 
                  e.date.toISOString().split('T')[0] === dateStr
                );
                const isToday = day === 8; // Mock today
                
                return (
                  <div
                    key={day}
                    className={`aspect-square p-1 rounded-lg ${
                      isToday ? 'bg-indigo-600/30 ring-1 ring-indigo-500' : ''
                    } ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-white/5' : ''}`}
                  >
                    <p className={`text-sm ${isToday ? 'text-indigo-400 font-bold' : 'text-gray-400'}`}>
                      {day}
                    </p>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              e.type === 'meeting' ? 'bg-blue-400' :
                              e.type === 'deadline' ? 'bg-red-400' :
                              e.type === 'reminder' ? 'bg-amber-400' : 'bg-purple-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Add Event CTA */}
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition">
            + Add Event
          </button>
        </div>
      </main>
      
      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{TYPE_CONFIG[selectedEvent.type].icon}</span>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedEvent.title}</h2>
                  <p className={`text-sm ${TYPE_CONFIG[selectedEvent.type].color}`}>
                    {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-white/10 rounded-lg">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="text-white">
                  {formatDate(selectedEvent.date)}
                  {selectedEvent.time && ` at ${selectedEvent.time}`}
                </p>
              </div>
              
              {selectedEvent.duration && (
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-white">{selectedEvent.duration} minutes</p>
                </div>
              )}
              
              {selectedEvent.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-white">{selectedEvent.description}</p>
                </div>
              )}
              
              {selectedEvent.attendees && (
                <div>
                  <p className="text-sm text-gray-500">Attendees</p>
                  <p className="text-white">{selectedEvent.attendees.join(', ')}</p>
                </div>
              )}
              
              {selectedEvent.location && (
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-white">{selectedEvent.location}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition">
                Edit
              </button>
              {selectedEvent.type === 'meeting' && (
                <Link
                  href={`/advisor/clients/1/prep`}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition text-center"
                >
                  Prepare
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
