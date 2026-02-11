'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, MapPin, Send, CheckCircle } from 'lucide-react';
import { SkeletonCard } from '@/components/client-portal/SkeletonCard';
import { clsx } from 'clsx';

// Demo data
const DEMO_ADVISOR = {
  name: 'Sarah Adams',
  title: 'Senior Financial Advisor',
  firm: 'Adams Wealth Management',
  phone: '(555) 123-4567',
  email: 'sarah@adamswealth.com',
  address: '123 Financial Way, Suite 400\nNew York, NY 10001',
  availability: 'Mon-Fri, 9am-5pm EST',
  photo: undefined,
};

const PRIMARY_COLOR = '#4f46e5';

// L006: Skeleton matches layout
function ContactSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-40 bg-slate-200 rounded animate-pulse" />
      
      {/* Advisor card skeleton */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-slate-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
      
      <SkeletonCard lines={4} />
    </div>
  );
}

export default function ContactPage() {
  const [loading, setLoading] = useState(true);
  const [advisor, setAdvisor] = useState(DEMO_ADVISOR);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: just show success
    setMessageSent(true);
    setMessage('');
    setTimeout(() => setMessageSent(false), 3000);
  };

  if (loading) {
    return <ContactSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Contact Your Advisor</h1>

      {/* Advisor card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          {advisor.photo ? (
            <img 
              src={advisor.photo}
              alt={advisor.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div 
              className="h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              {advisor.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{advisor.name}</h2>
            <p className="text-slate-600">{advisor.title}</p>
            <p className="text-sm text-slate-500">{advisor.firm}</p>
          </div>
        </div>

        {/* Quick contact buttons - L002: 48px touch targets */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${advisor.phone.replace(/\D/g, '')}`}
            className={clsx(
              'flex items-center justify-center gap-2 min-h-[48px] px-4 py-3',
              'bg-slate-100 rounded-xl font-medium text-slate-700',
              'hover:bg-slate-200 transition-colors'
            )}
          >
            <Phone className="h-5 w-5" />
            Call
          </a>
          <a
            href={`mailto:${advisor.email}`}
            className={clsx(
              'flex items-center justify-center gap-2 min-h-[48px] px-4 py-3',
              'text-white rounded-xl font-medium',
              'hover:opacity-90 transition-opacity'
            )}
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            <Mail className="h-5 w-5" />
            Email
          </a>
        </div>
      </div>

      {/* Contact details */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">Phone</p>
              <a 
                href={`tel:${advisor.phone.replace(/\D/g, '')}`}
                className="text-slate-600 hover:underline"
              >
                {advisor.phone}
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">Email</p>
              <a 
                href={`mailto:${advisor.email}`}
                className="text-slate-600 hover:underline"
              >
                {advisor.email}
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">Availability</p>
              <p className="text-slate-600">{advisor.availability}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">Office</p>
              <p className="text-slate-600 whitespace-pre-line">{advisor.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick message form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-4">Send a Quick Message</h3>
        
        {messageSent ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span>Message sent! Your advisor will respond soon.</span>
          </div>
        ) : (
          <form onSubmit={handleSendMessage}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className={clsx(
                'w-full p-4 border border-slate-200 rounded-xl resize-none',
                'focus:outline-none focus:ring-2 focus:border-transparent',
                'text-base placeholder:text-slate-400'
              )}
              style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
              rows={4}
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className={clsx(
                // L002: 48px touch target
                'flex items-center justify-center gap-2 w-full min-h-[48px] mt-4 px-4 py-3',
                'text-white rounded-xl font-medium',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'hover:opacity-90 transition-opacity'
              )}
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <Send className="h-5 w-5" />
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
