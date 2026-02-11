'use client';

import Link from 'next/link';
import { 
  FamilyMember, 
  getMemberTotalAssets, 
  formatCurrency,
  getAccountsByOwner,
  getBeneficiaryDesignationsForMember,
} from '@/lib/demo-family';

interface FamilyMemberCardProps {
  member: FamilyMember;
  code: string;
}

export function FamilyMemberCard({ member, code }: FamilyMemberCardProps) {
  const totalAssets = getMemberTotalAssets(member.id);
  const accounts = getAccountsByOwner(member.id);
  const beneficiaryOf = getBeneficiaryDesignationsForMember(member.id);
  
  // Get account type summary
  const accountTypes = [...new Set(accounts.map(a => a.type))];
  const accountSummary = accountTypes.length > 0 
    ? accountTypes.slice(0, 2).join(', ') + (accountTypes.length > 2 ? '...' : '')
    : 'No direct accounts';

  // Relationship icon
  const relationshipIcon = {
    primary: '👤',
    spouse: '💑',
    child: member.age >= 18 ? '🧑' : '👧',
    parent: '👴',
    dependent: '👶',
  }[member.relationship];

  return (
    <Link
      href={`/c/${code}/family/${member.id}`}
      className="group block bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200 min-h-[160px]"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div 
          className={`w-14 h-14 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ring-2 ring-white/10 group-hover:ring-white/20 transition-all`}
        >
          {member.initials}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Name and relationship */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold text-lg truncate">
              {member.firstName} {member.lastName}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
            <span>{relationshipIcon}</span>
            <span>{member.relationshipLabel}</span>
            <span className="text-gray-600">•</span>
            <span>Age {member.age}</span>
          </div>
          
          {/* Assets summary */}
          {totalAssets > 0 ? (
            <div className="space-y-1">
              <p className="text-emerald-400 font-semibold text-lg">
                {formatCurrency(totalAssets)}
              </p>
              <p className="text-gray-500 text-xs truncate">
                {accountSummary}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-gray-400 text-sm">
                {beneficiaryOf.length > 0 
                  ? `Beneficiary on ${beneficiaryOf.filter(b => !b.contingent).length} account${beneficiaryOf.filter(b => !b.contingent).length !== 1 ? 's' : ''}`
                  : 'Family member'
                }
              </p>
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className="text-gray-600 group-hover:text-gray-400 transition-colors pt-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
