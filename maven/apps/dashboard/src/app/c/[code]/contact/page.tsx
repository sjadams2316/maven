'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, MapPin, Send, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

// Demo data
const DEMO_ADVISOR = {
  name: 'Sarah Adams',
  title: 'Senior Financial Advisor',
  firm: 'Maven Partners',
  phone: '(555) 123-4567',
  email: 'sarah@mavenpartners.com',
  address: '123 Financial Way, Suite 400\nNew York, NY 10001',
  availability: 'Mon-Fri, 9am-5pm EST',
  photo: undefined,
};

// L006: Skeleton matches layout - dark theme
function ContactSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-40 bg-white/10 rounded animate-pulse" />
      
      {/* Advisor card skeleton */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-white/10 animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 w-full bg-white/10 rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-white/10 rounded-xl animate-pulse" />
        </div>
      </div>
      
      {/* Contact details skeleton */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <div className="h-5 w-40 bg-white/10 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-5 w-5 bg-white/10 rounded animate-pulse" />
              <div className="space-y-1 flex-1">
                <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
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
      <h1 className="text-2xl font-bold text-white">Contact Your Advisor</h1>

      {/* Advisor card */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <div className="flex items-center gap-4 mb-6">
          {advisor.photo ? (
            <img 
              src={advisor.photo}
              alt={advisor.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div 
              className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/20"
            >
              {advisor.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-white">{advisor.name}</h2>
            <p className="text-gray-400">{advisor.title}</p>
            <p className="text-sm text-amber-400">{advisor.firm}</p>
          </div>
        </div>

        {/* Quick contact buttons - L002: 48px touch targets */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${advisor.phone.replace(/\D/g, '')}`}
            className={clsx(
              'flex items-center justify-center gap-2 min-h-[48px] px-4 py-3',
              'bg-white/5 rounded-xl font-medium text-gray-300 border border-white/10',
              'hover:bg-white/10 hover:border-amber-500/20 transition-all duration-200'
            )}
          >
            <Phone className="h-5 w-5" />
            Call
          </a>
          <a
            href={`mailto:${advisor.email}`}
            className={clsx(
              'flex items-center justify-center gap-2 min-h-[48px] px-4 py-3',
              'bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-medium text-black',
              'hover:from-amber-400 hover:to-amber-500 transition-all duration-200',
              'shadow-lg shadow-amber-500/20'
            )}
          >
            <Mail className="h-5 w-5" />
            Email
          </a>
        </div>
      </div>

      {/* Contact details */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <h3 className="font-semibold text-white mb-4">Contact Information</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-white">Phone</p>
              <a 
                href={`tel:${advisor.phone.replace(/\D/g, '')}`}
                className="text-gray-400 hover:text-amber-400 transition-colors"
              >
                {advisor.phone}
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-white">Email</p>
              <a 
                href={`mailto:${advisor.email}`}
                className="text-gray-400 hover:text-amber-400 transition-colors"
              >
                {advisor.email}
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-white">Availability</p>
              <p className="text-gray-400">{advisor.availability}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-white">Office</p>
              <p className="text-gray-400 whitespace-pre-line">{advisor.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick message form */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <h3 className="font-semibold text-white mb-4">Send a Quick Message</h3>
        
        {messageSent ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
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
                'w-full p-4 bg-white/5 border border-white/10 rounded-xl resize-none',
                'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50',
                'text-white text-base placeholder:text-gray-500',
                'transition-all duration-200'
              )}
              rows={4}
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className={clsx(
                // L002: 48px touch target
                'flex items-center justify-center gap-2 w-full min-h-[48px] mt-4 px-4 py-3',
                'bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-medium text-black',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'hover:from-amber-400 hover:to-amber-500 transition-all duration-200',
                'shadow-lg shadow-amber-500/20'
              )}
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
