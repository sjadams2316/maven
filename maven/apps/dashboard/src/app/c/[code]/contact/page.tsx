'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

// Demo advisor data
const DEMO_ADVISOR = {
  name: 'Sam Adams',
  title: 'Wealth Advisor, CFP®',
  firm: 'Maven Partners',
  email: 'sam@adamswealth.com',
  phone: '(555) 123-4567',
  photo: null,
  bio: "With over 15 years of experience in wealth management, I'm dedicated to helping families achieve their financial goals. I specialize in retirement planning, tax optimization, and multi-generational wealth strategies.",
  credentials: ['CFP®', 'CFA', 'MBA'],
  yearsExperience: 15,
  clientsSince: '2022-03-15',
};

// Demo meeting slots
const DEMO_MEETING_SLOTS = [
  { date: '2026-02-12', time: '10:00 AM', available: true },
  { date: '2026-02-12', time: '2:00 PM', available: true },
  { date: '2026-02-13', time: '11:00 AM', available: true },
  { date: '2026-02-14', time: '9:00 AM', available: true },
  { date: '2026-02-14', time: '3:00 PM', available: true },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
  });
}

export default function ContactPage() {
  const params = useParams();
  const [messageType, setMessageType] = useState<'general' | 'meeting' | 'urgent'>('general');
  const [message, setMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send the message
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-white mb-2">Message Sent!</h2>
          <p className="text-gray-400 mb-6">
            {messageType === 'meeting' 
              ? "We'll confirm your meeting shortly." 
              : "Your advisor will respond within 1 business day."}
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setMessage('');
              setSelectedSlot(null);
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors min-h-[44px]"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Contact Your Advisor</h1>
        <p className="text-gray-400">We're here to help with any questions</p>
      </div>

      {/* Advisor Card */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {DEMO_ADVISOR.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <h2 className="text-white font-semibold text-lg">{DEMO_ADVISOR.name}</h2>
            <p className="text-indigo-300 text-sm">{DEMO_ADVISOR.title}</p>
            <p className="text-gray-400 text-sm mt-1">{DEMO_ADVISOR.firm}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {DEMO_ADVISOR.credentials.map((cred) => (
                <span key={cred} className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded">
                  {cred}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-300 text-sm mt-4 leading-relaxed">
          {DEMO_ADVISOR.bio}
        </p>
      </div>

      {/* Quick Contact Options */}
      <div className="grid grid-cols-2 gap-4">
        <a
          href={`tel:${DEMO_ADVISOR.phone.replace(/\D/g, '')}`}
          className="flex flex-col items-center gap-2 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors min-h-[100px] justify-center"
        >
          <span className="text-2xl">📞</span>
          <span className="text-white text-sm font-medium">Call</span>
          <span className="text-gray-500 text-xs">{DEMO_ADVISOR.phone}</span>
        </a>
        <a
          href={`mailto:${DEMO_ADVISOR.email}`}
          className="flex flex-col items-center gap-2 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors min-h-[100px] justify-center"
        >
          <span className="text-2xl">✉️</span>
          <span className="text-white text-sm font-medium">Email</span>
          <span className="text-gray-500 text-xs">{DEMO_ADVISOR.email}</span>
        </a>
      </div>

      {/* Message Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Send a Message</h3>
          
          {/* Message Type */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: 'general', label: '💬 General Question', icon: '💬' },
              { id: 'meeting', label: '📅 Schedule Meeting', icon: '📅' },
              { id: 'urgent', label: '🔴 Urgent Matter', icon: '🔴' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setMessageType(type.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  messageType === type.id
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Meeting Slots */}
          {messageType === 'meeting' && (
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-3">Select a time that works for you:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_MEETING_SLOTS.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedSlot(`${slot.date}-${slot.time}`)}
                    className={`p-3 rounded-lg text-left text-sm transition-colors min-h-[48px] ${
                      selectedSlot === `${slot.date}-${slot.time}`
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="font-medium">{formatDate(slot.date)}</span>
                    <span className="text-gray-500 ml-2">{slot.time}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Urgent Notice */}
          {messageType === 'urgent' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">
                <strong>For true emergencies:</strong> Call {DEMO_ADVISOR.phone} directly. 
                We'll prioritize your message and respond as quickly as possible.
              </p>
            </div>
          )}

          {/* Message Input */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              {messageType === 'meeting' ? 'What would you like to discuss?' : 'Your message'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                messageType === 'general' 
                  ? "Ask us anything about your finances..." 
                  : messageType === 'meeting'
                    ? "Topics for our meeting..."
                    : "Describe your urgent matter..."
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[120px] resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!message.trim() || (messageType === 'meeting' && !selectedSlot)}
            className="w-full mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors min-h-[48px]"
          >
            {messageType === 'meeting' ? 'Request Meeting' : 'Send Message'}
          </button>
        </div>
      </form>

      {/* Response Time */}
      <div className="text-center text-gray-500 text-sm">
        <p>Typical response time: Within 1 business day</p>
      </div>
    </div>
  );
}
