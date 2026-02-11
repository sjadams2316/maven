'use client';

import Link from 'next/link';
import { 
  FamilyMember, 
  FamilyAccount,
  BeneficiaryDesignation,
  formatCurrency,
  getAccountsByOwner,
  getJointAccounts,
  getBeneficiaryDesignationsForMember,
  getMemberTotalAssets,
} from '@/lib/demo-family';

interface FamilyMemberDetailProps {
  member: FamilyMember;
  code: string;
}

// Account Card Component
function AccountCard({ account }: { account: FamilyAccount }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/15 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
          {account.icon}
        </div>
        <div>
          <p className="text-white font-medium text-sm">{account.name}</p>
          <p className="text-gray-500 text-xs">{account.institution} • {account.type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-white font-semibold">{formatCurrency(account.balance)}</p>
        {account.ownershipType === 'joint' && (
          <span className="text-xs text-amber-400/80">Joint</span>
        )}
        {account.ownershipType === 'custodial' && (
          <span className="text-xs text-purple-400/80">Custodial</span>
        )}
      </div>
    </div>
  );
}

// Beneficiary Card Component
function BeneficiaryCard({ designation }: { designation: BeneficiaryDesignation }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
          designation.contingent ? 'bg-gray-500/20' : 'bg-emerald-500/20'
        }`}>
          {designation.contingent ? '📋' : '✅'}
        </div>
        <div>
          <p className="text-white font-medium text-sm">{designation.accountName}</p>
          <p className="text-gray-500 text-xs">{designation.accountType}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${designation.contingent ? 'text-gray-400' : 'text-emerald-400'}`}>
          {designation.percentage}%
        </p>
        <span className={`text-xs ${designation.contingent ? 'text-gray-500' : 'text-emerald-400/80'}`}>
          {designation.contingent ? 'Contingent' : 'Primary'}
        </span>
      </div>
    </div>
  );
}

export function FamilyMemberDetail({ member, code }: FamilyMemberDetailProps) {
  const ownedAccounts = getAccountsByOwner(member.id);
  const beneficiaryDesignations = getBeneficiaryDesignationsForMember(member.id);
  const totalAssets = getMemberTotalAssets(member.id);
  
  // Get joint accounts for spouse
  const jointAccounts = member.relationship === 'spouse' || member.relationship === 'primary'
    ? getJointAccounts()
    : [];
  
  // Separate primary and contingent beneficiary designations
  const primaryBeneficiary = beneficiaryDesignations.filter(b => !b.contingent);
  const contingentBeneficiary = beneficiaryDesignations.filter(b => b.contingent);
  
  // Get education accounts (529, UTMA) for children
  const educationAccounts = ownedAccounts.filter(
    a => a.type === '529 Plan' || a.type === 'UTMA' || a.type === 'UGMA'
  );
  
  // Get retirement accounts
  const retirementAccounts = ownedAccounts.filter(
    a => a.type.includes('401') || a.type.includes('IRA')
  );
  
  // Relationship icon
  const relationshipIcon = {
    primary: '👤',
    spouse: '💑',
    child: member.age >= 18 ? '🧑' : '👧',
    parent: '👴',
    dependent: '👶',
  }[member.relationship];

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link 
        href={`/c/${code}/family`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors min-h-[44px]"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">Back to Family</span>
      </Link>

      {/* Member Profile Header */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div 
            className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 ring-4 ring-white/10`}
          >
            {member.initials}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {member.firstName} {member.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-gray-400">
              <span className="flex items-center gap-1.5">
                <span>{relationshipIcon}</span>
                <span>{member.relationshipLabel}</span>
              </span>
              <span className="text-gray-600">•</span>
              <span>Age {member.age}</span>
              {totalAssets > 0 && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-emerald-400 font-medium">{formatCurrency(totalAssets)} in assets</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Retirement Accounts (for adults) */}
      {retirementAccounts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🏦</span> Retirement Accounts
          </h2>
          <div className="space-y-3">
            {retirementAccounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-emerald-400 text-sm">
              <span className="font-semibold">Total Retirement: </span>
              {formatCurrency(retirementAccounts.reduce((sum, a) => sum + a.balance, 0))}
            </p>
          </div>
        </div>
      )}

      {/* Joint Accounts (for spouse/primary) */}
      {jointAccounts.length > 0 && (member.relationship === 'spouse' || member.relationship === 'primary') && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🤝</span> Joint Accounts
          </h2>
          <div className="space-y-3">
            {jointAccounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-amber-400 text-sm">
              <span className="font-semibold">Total Joint Assets: </span>
              {formatCurrency(jointAccounts.reduce((sum, a) => sum + a.balance, 0))}
            </p>
          </div>
        </div>
      )}

      {/* Education Accounts (for children) */}
      {educationAccounts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🎓</span> Education Savings
          </h2>
          <div className="space-y-3">
            {educationAccounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
          <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <p className="text-purple-400 text-sm">
              <span className="font-semibold">Education Fund Total: </span>
              {formatCurrency(educationAccounts.reduce((sum, a) => sum + a.balance, 0))}
            </p>
          </div>
        </div>
      )}

      {/* Other Owned Accounts */}
      {ownedAccounts.filter(a => !retirementAccounts.includes(a) && !educationAccounts.includes(a)).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>💳</span> Other Accounts
          </h2>
          <div className="space-y-3">
            {ownedAccounts
              .filter(a => !retirementAccounts.includes(a) && !educationAccounts.includes(a))
              .map(account => (
                <AccountCard key={account.id} account={account} />
              ))}
          </div>
        </div>
      )}

      {/* Beneficiary Designations */}
      {beneficiaryDesignations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📋</span> Beneficiary Designations
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            {member.firstName} is named as a beneficiary on the following accounts:
          </p>
          
          {/* Primary Beneficiary */}
          {primaryBeneficiary.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2 pl-1">Primary Beneficiary</h3>
              <div className="space-y-2">
                {primaryBeneficiary.map(designation => (
                  <BeneficiaryCard key={designation.id} designation={designation} />
                ))}
              </div>
            </div>
          )}
          
          {/* Contingent Beneficiary */}
          {contingentBeneficiary.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2 pl-1">Contingent Beneficiary</h3>
              <div className="space-y-2">
                {contingentBeneficiary.map(designation => (
                  <BeneficiaryCard key={designation.id} designation={designation} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {ownedAccounts.length === 0 && beneficiaryDesignations.length === 0 && (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
          <div className="text-4xl mb-4">👋</div>
          <h3 className="text-white font-medium mb-2">No Financial Accounts</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            {member.firstName} doesn't have any linked financial accounts yet. 
            They may still be included in your overall family planning.
          </p>
        </div>
      )}
    </div>
  );
}
