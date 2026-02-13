'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, TrendingUp, AlertTriangle, Heart, Briefcase, Home, GraduationCap } from 'lucide-react';

// Enhanced client data structure for relationship intelligence
interface ClientIntelligence {
  id: string;
  name: string;
  nextMeeting: Date;
  personalContext: {
    familyMilestones: Array<{
      type: 'birthday' | 'anniversary' | 'graduation' | 'retirement';
      person: string;
      date: Date;
      significance: string;
    }>;
    careerUpdates: Array<{
      type: 'promotion' | 'job_change' | 'retirement_planning';
      description: string;
      date: Date;
      impact: string;
    }>;
    healthConsiderations: Array<{
      type: 'long_term_care' | 'major_medical' | 'health_savings';
      context: string;
      planningImplication: string;
    }>;
    lifeEvents: Array<{
      type: 'home_purchase' | 'divorce' | 'inheritance' | 'new_child';
      description: string;
      financialImpact: string;
      date?: Date;
    }>;
  };
  relationshipIntelligence: {
    communicationStyle: 'analytical' | 'intuitive' | 'collaborative';
    preferredContact: 'email' | 'phone' | 'text' | 'in_person';
    decisionMaking: 'independent' | 'spouse_involved' | 'family_council';
    meetingPreference: 'quarterly' | 'bi_annual' | 'as_needed';
    stressIndicators: Array<{
      indicator: string;
      frequency: 'low' | 'medium' | 'high';
      lastOccurrence: Date;
    }>;
  };
  portfolioContext: {
    recentChanges: Array<{
      type: 'allocation_shift' | 'new_position' | 'sale' | 'contribution';
      description: string;
      amount: number;
      date: Date;
      reason?: string;
    }>;
    performanceHighlights: {
      outperforming: string[];
      underperforming: string[];
      marketContext: string;
    };
    upcomingActions: Array<{
      type: 'rebalance' | 'tax_harvest' | 'contribution' | 'distribution';
      description: string;
      timeline: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
  meetingHistory: {
    lastMeeting: Date;
    keyTopics: string[];
    actionItems: Array<{
      item: string;
      status: 'pending' | 'completed' | 'deferred';
      dueDate?: Date;
    }>;
    clientConcerns: string[];
    opportunitiesDiscussed: string[];
  };
  marketContext: {
    relevantEvents: string[];
    impactToPortfolio: string;
    talkingPoints: string[];
  };
  opportunities: {
    newServices: string[];
    referralPotential: 'high' | 'medium' | 'low';
    upsellOpportunities: string[];
  };
}

// Mock comprehensive client data - would come from CRM integration
const MOCK_CLIENT_INTELLIGENCE: ClientIntelligence[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    nextMeeting: new Date('2026-02-18T11:00:00'),
    personalContext: {
      familyMilestones: [
        {
          type: 'graduation',
          person: 'Daughter Emma',
          date: new Date('2026-05-15'),
          significance: 'High school graduation - college planning critical'
        },
        {
          type: 'birthday',
          person: 'Sarah',
          date: new Date('2026-03-22'),
          significance: '50th birthday - retirement timeline discussion'
        }
      ],
      careerUpdates: [
        {
          type: 'promotion',
          description: 'VP of Engineering at TechCorp',
          date: new Date('2026-01-15'),
          impact: 'Salary increase to $180K, new stock options available'
        }
      ],
      healthConsiderations: [
        {
          type: 'long_term_care',
          context: 'Mother diagnosed with early dementia',
          planningImplication: 'LTC insurance discussion, potential caregiving costs'
        }
      ],
      lifeEvents: [
        {
          type: 'inheritance',
          description: 'Inherited $75K from grandmother',
          financialImpact: 'Tax-efficient investment placement needed',
          date: new Date('2026-01-30')
        }
      ]
    },
    relationshipIntelligence: {
      communicationStyle: 'analytical',
      preferredContact: 'email',
      decisionMaking: 'spouse_involved',
      meetingPreference: 'quarterly',
      stressIndicators: [
        {
          indicator: 'Frequent portfolio checks',
          frequency: 'high',
          lastOccurrence: new Date('2026-02-12')
        },
        {
          indicator: 'Multiple email questions',
          frequency: 'medium',
          lastOccurrence: new Date('2026-02-10')
        }
      ]
    },
    portfolioContext: {
      recentChanges: [
        {
          type: 'contribution',
          description: 'Inherited funds deposit',
          amount: 75000,
          date: new Date('2026-02-01'),
          reason: 'Grandmother inheritance - needs allocation'
        }
      ],
      performanceHighlights: {
        outperforming: ['Technology allocation (+12% vs S&P)', 'International bonds (+3.2%)'],
        underperforming: ['Small cap growth (-2.1%)', 'Real estate (-1.8%)'],
        marketContext: 'Tech surge benefiting her concentration in growth stocks'
      },
      upcomingActions: [
        {
          type: 'contribution',
          description: 'Q1 401k max-out strategy',
          timeline: 'Before March 31st',
          priority: 'high'
        },
        {
          type: 'tax_harvest',
          description: 'Harvest small cap losses',
          timeline: 'Before year-end',
          priority: 'medium'
        }
      ]
    },
    meetingHistory: {
      lastMeeting: new Date('2025-11-15'),
      keyTopics: ['College planning for Emma', 'Career transition prep', 'ESG investing interest'],
      actionItems: [
        {
          item: 'Research 529 plan options for Emma',
          status: 'completed',
        },
        {
          item: 'Evaluate ESG fund alternatives',
          status: 'pending',
          dueDate: new Date('2026-02-20')
        },
        {
          item: 'Long-term care insurance quotes',
          status: 'deferred'
        }
      ],
      clientConcerns: ['College costs rising faster than savings', 'Mother\'s care needs', 'Work-life balance'],
      opportunitiesDiscussed: ['Executive financial planning', 'Estate planning review']
    },
    marketContext: {
      relevantEvents: [
        'Tech earnings season strong',
        'Fed pause on rate hikes',
        'College cost inflation at 6% annually'
      ],
      impactToPortfolio: 'Tech allocation driving outperformance, bond positioning defensive',
      talkingPoints: [
        'Tech gains create rebalancing opportunity',
        'College inflation makes 529 contributions more urgent',
        'Rate environment favors current bond allocation'
      ]
    },
    opportunities: {
      newServices: ['Executive compensation planning', 'Family estate planning', 'Tax preparation coordination'],
      referralPotential: 'high',
      upsellOpportunities: ['LTC insurance placement', 'HSA optimization', 'Roth conversion strategy']
    }
  }
];

interface MeetingPrepCardProps {
  client: ClientIntelligence;
  onGenerateFullPrep: (clientId: string) => void;
}

function MeetingPrepCard({ client, onGenerateFullPrep }: MeetingPrepCardProps) {
  const daysUntilMeeting = Math.ceil((client.nextMeeting.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const getUrgencyColor = (days: number) => {
    if (days <= 2) return 'border-red-500/50 bg-red-500/10';
    if (days <= 7) return 'border-amber-500/50 bg-amber-500/10';
    return 'border-blue-500/50 bg-blue-500/10';
  };

  const getStressLevel = (indicators: typeof client.relationshipIntelligence.stressIndicators) => {
    const highStress = indicators.filter(i => i.frequency === 'high').length;
    if (highStress > 0) return { level: 'High', color: 'text-red-400', icon: '🚨' };
    const mediumStress = indicators.filter(i => i.frequency === 'medium').length;
    if (mediumStress > 0) return { level: 'Medium', color: 'text-amber-400', icon: '⚠️' };
    return { level: 'Low', color: 'text-green-400', icon: '✅' };
  };

  const stressLevel = getStressLevel(client.relationshipIntelligence.stressIndicators);

  return (
    <div className={`p-6 rounded-xl border-2 ${getUrgencyColor(daysUntilMeeting)} transition-all hover:bg-white/5`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{client.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              {client.nextMeeting.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
            <span className="text-xs text-gray-400">({daysUntilMeeting}d)</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">Stress Level:</span>
            <span className={`text-xs font-medium ${stressLevel.color}`}>
              {stressLevel.icon} {stressLevel.level}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Context Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Personal Highlights */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Heart className="w-3 h-3" />
            Personal Context
          </h4>
          {client.personalContext.familyMilestones.slice(0, 2).map((milestone, i) => (
            <div key={i} className="text-xs text-gray-400">
              <span className="text-white font-medium">{milestone.person}</span> - {milestone.type}
              <div className="text-xs text-gray-500">{milestone.significance}</div>
            </div>
          ))}
        </div>

        {/* Portfolio Highlights */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            Portfolio Focus
          </h4>
          {client.portfolioContext.upcomingActions.slice(0, 2).map((action, i) => (
            <div key={i} className="text-xs">
              <div className="text-white font-medium">{action.description}</div>
              <div className="text-gray-500">{action.timeline}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items Status */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Follow-up Status</h4>
        <div className="space-y-1">
          {client.meetingHistory.actionItems.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-gray-400 truncate flex-1 mr-2">{item.item}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                item.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Opportunities */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Opportunities</h4>
        <div className="flex flex-wrap gap-1">
          {client.opportunities.newServices.slice(0, 3).map((service, i) => (
            <span key={i} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
              {service}
            </span>
          ))}
        </div>
      </div>

      {/* Generate Full Prep Button */}
      <button
        onClick={() => onGenerateFullPrep(client.id)}
        className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium rounded-lg transition-all"
      >
        Generate Complete Meeting Brief
      </button>
    </div>
  );
}

export default function MeetingPrepIntelligence() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month'>('week');
  const [clients, setClients] = useState<ClientIntelligence[]>(MOCK_CLIENT_INTELLIGENCE);

  const filterClientsByTimeframe = (timeframe: 'week' | 'month') => {
    const now = new Date();
    const cutoff = new Date();
    
    if (timeframe === 'week') {
      cutoff.setDate(now.getDate() + 7);
    } else {
      cutoff.setMonth(now.getMonth() + 1);
    }
    
    return clients.filter(client => client.nextMeeting <= cutoff);
  };

  const filteredClients = filterClientsByTimeframe(selectedTimeframe);

  const handleGenerateFullPrep = async (clientId: string) => {
    // This would integrate with the AI system to generate comprehensive meeting briefs
    console.log('Generating full prep for client:', clientId);
    // Could open a modal or navigate to detailed prep page
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Meeting Prep Intelligence</h2>
          <p className="text-gray-400 mt-1">Relationship-driven preparation for every client interaction</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTimeframe('week')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              selectedTimeframe === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Next Week
          </button>
          <button
            onClick={() => setSelectedTimeframe('month')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              selectedTimeframe === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Next Month
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#12121a] border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{filteredClients.length}</div>
          <div className="text-sm text-gray-400">Upcoming Meetings</div>
        </div>
        
        <div className="bg-[#12121a] border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-400">
            {filteredClients.filter(c => getStressLevel(c.relationshipIntelligence.stressIndicators).level !== 'Low').length}
          </div>
          <div className="text-sm text-gray-400">High Attention Needed</div>
        </div>
        
        <div className="bg-[#12121a] border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {filteredClients.reduce((sum, c) => sum + c.meetingHistory.actionItems.filter(a => a.status === 'pending').length, 0)}
          </div>
          <div className="text-sm text-gray-400">Pending Actions</div>
        </div>
        
        <div className="bg-[#12121a] border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-indigo-400">
            {filteredClients.filter(c => c.opportunities.referralPotential === 'high').length}
          </div>
          <div className="text-sm text-gray-400">High Referral Potential</div>
        </div>
      </div>

      {/* Client Prep Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.map(client => (
          <MeetingPrepCard
            key={client.id}
            client={client}
            onGenerateFullPrep={handleGenerateFullPrep}
          />
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No meetings in this timeframe</h3>
          <p className="text-gray-500">All caught up! Check back later or expand your timeframe.</p>
        </div>
      )}
    </div>
  );
}

// Helper function for stress level calculation (defined outside component to be reusable)
function getStressLevel(indicators: ClientIntelligence['relationshipIntelligence']['stressIndicators']) {
  const highStress = indicators.filter(i => i.frequency === 'high').length;
  if (highStress > 0) return { level: 'High' as const, color: 'text-red-400', icon: '🚨' };
  const mediumStress = indicators.filter(i => i.frequency === 'medium').length;
  if (mediumStress > 0) return { level: 'Medium' as const, color: 'text-amber-400', icon: '⚠️' };
  return { level: 'Low' as const, color: 'text-green-400', icon: '✅' };
}