/**
 * DEMO FAMILY DATA - Single Source of Truth for Family/Household Section
 * 
 * Demo household for DEMO-JS123 (John Smith family)
 * This ties into the client portal's calm, warm approach to wealth management
 */

// ============================================================================
// TYPES
// ============================================================================

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  relationship: 'primary' | 'spouse' | 'child' | 'parent' | 'dependent';
  relationshipLabel: string;
  dateOfBirth: string;
  age: number;
  avatar?: string; // Optional photo URL
  initials: string;
  color: string; // Avatar background color gradient
}

export interface FamilyAccount {
  id: string;
  name: string;
  type: string;
  institution: string;
  balance: number;
  ownerId: string; // Family member who owns this
  ownershipType: 'sole' | 'joint' | 'custodial' | 'beneficiary';
  icon: string;
}

export interface BeneficiaryDesignation {
  id: string;
  accountName: string;
  accountType: string;
  percentage: number;
  beneficiaryId: string;
  contingent: boolean;
}

export interface FamilyHousehold {
  code: string;
  householdName: string;
  totalNetWorth: number;
  totalAccounts: number;
  members: FamilyMember[];
  accounts: FamilyAccount[];
  beneficiaryDesignations: BeneficiaryDesignation[];
}

// ============================================================================
// DEMO FAMILY: JOHN SMITH HOUSEHOLD (DEMO-JS123)
// ============================================================================

export const DEMO_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'john-smith',
    firstName: 'John',
    lastName: 'Smith',
    relationship: 'primary',
    relationshipLabel: 'Primary',
    dateOfBirth: '1968-03-15',
    age: 58,
    initials: 'JS',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'sarah-smith',
    firstName: 'Sarah',
    lastName: 'Smith',
    relationship: 'spouse',
    relationshipLabel: 'Spouse',
    dateOfBirth: '1971-08-22',
    age: 55,
    initials: 'SS',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'emily-smith',
    firstName: 'Emily',
    lastName: 'Smith',
    relationship: 'child',
    relationshipLabel: 'Daughter',
    dateOfBirth: '2002-01-10',
    age: 24,
    initials: 'ES',
    color: 'from-pink-500 to-pink-600',
  },
  {
    id: 'michael-smith',
    firstName: 'Michael',
    lastName: 'Smith',
    relationship: 'child',
    relationshipLabel: 'Son',
    dateOfBirth: '2005-06-28',
    age: 21,
    initials: 'MS',
    color: 'from-emerald-500 to-emerald-600',
  },
];

export const DEMO_FAMILY_ACCOUNTS: FamilyAccount[] = [
  // John's accounts
  {
    id: 'john-401k',
    name: 'Employer 401(k)',
    type: '401(k)',
    institution: 'Fidelity',
    balance: 485000,
    ownerId: 'john-smith',
    ownershipType: 'sole',
    icon: '💼',
  },
  {
    id: 'john-ira',
    name: 'Traditional IRA',
    type: 'Traditional IRA',
    institution: 'Schwab',
    balance: 125000,
    ownerId: 'john-smith',
    ownershipType: 'sole',
    icon: '🏦',
  },
  {
    id: 'john-roth',
    name: 'Roth IRA',
    type: 'Roth IRA',
    institution: 'Schwab',
    balance: 85000,
    ownerId: 'john-smith',
    ownershipType: 'sole',
    icon: '🌱',
  },
  // Sarah's accounts
  {
    id: 'sarah-401k',
    name: 'Employer 401(k)',
    type: '401(k)',
    institution: 'Vanguard',
    balance: 320000,
    ownerId: 'sarah-smith',
    ownershipType: 'sole',
    icon: '💼',
  },
  {
    id: 'sarah-roth',
    name: 'Roth IRA',
    type: 'Roth IRA',
    institution: 'Vanguard',
    balance: 72000,
    ownerId: 'sarah-smith',
    ownershipType: 'sole',
    icon: '🌱',
  },
  // Joint accounts
  {
    id: 'joint-brokerage',
    name: 'Joint Brokerage',
    type: 'Taxable Brokerage',
    institution: 'Fidelity',
    balance: 245000,
    ownerId: 'john-smith', // Primary, but joint with Sarah
    ownershipType: 'joint',
    icon: '📈',
  },
  {
    id: 'joint-checking',
    name: 'Joint Checking',
    type: 'Checking',
    institution: 'Chase',
    balance: 28000,
    ownerId: 'john-smith',
    ownershipType: 'joint',
    icon: '💳',
  },
  {
    id: 'joint-savings',
    name: 'Joint Savings',
    type: 'High-Yield Savings',
    institution: 'Marcus',
    balance: 65000,
    ownerId: 'sarah-smith',
    ownershipType: 'joint',
    icon: '🏧',
  },
  // Children's accounts
  {
    id: 'emily-529',
    name: 'Emily College 529',
    type: '529 Plan',
    institution: 'Virginia529',
    balance: 45000,
    ownerId: 'emily-smith',
    ownershipType: 'custodial',
    icon: '🎓',
  },
  {
    id: 'michael-529',
    name: 'Michael College 529',
    type: '529 Plan',
    institution: 'Virginia529',
    balance: 72000,
    ownerId: 'michael-smith',
    ownershipType: 'custodial',
    icon: '🎓',
  },
  {
    id: 'emily-utma',
    name: 'Emily UTMA',
    type: 'UTMA',
    institution: 'Fidelity',
    balance: 18500,
    ownerId: 'emily-smith',
    ownershipType: 'custodial',
    icon: '🎁',
  },
];

export const DEMO_BENEFICIARY_DESIGNATIONS: BeneficiaryDesignation[] = [
  // John's 401k beneficiaries
  {
    id: 'ben-1',
    accountName: 'John\'s 401(k)',
    accountType: '401(k)',
    percentage: 100,
    beneficiaryId: 'sarah-smith',
    contingent: false,
  },
  {
    id: 'ben-2',
    accountName: 'John\'s 401(k)',
    accountType: '401(k)',
    percentage: 50,
    beneficiaryId: 'emily-smith',
    contingent: true,
  },
  {
    id: 'ben-3',
    accountName: 'John\'s 401(k)',
    accountType: '401(k)',
    percentage: 50,
    beneficiaryId: 'michael-smith',
    contingent: true,
  },
  // John's IRA beneficiaries
  {
    id: 'ben-4',
    accountName: 'John\'s Traditional IRA',
    accountType: 'Traditional IRA',
    percentage: 100,
    beneficiaryId: 'sarah-smith',
    contingent: false,
  },
  {
    id: 'ben-5',
    accountName: 'John\'s Traditional IRA',
    accountType: 'Traditional IRA',
    percentage: 50,
    beneficiaryId: 'emily-smith',
    contingent: true,
  },
  {
    id: 'ben-6',
    accountName: 'John\'s Traditional IRA',
    accountType: 'Traditional IRA',
    percentage: 50,
    beneficiaryId: 'michael-smith',
    contingent: true,
  },
  // John's Roth beneficiaries
  {
    id: 'ben-7',
    accountName: 'John\'s Roth IRA',
    accountType: 'Roth IRA',
    percentage: 100,
    beneficiaryId: 'sarah-smith',
    contingent: false,
  },
  // Sarah's 401k beneficiaries
  {
    id: 'ben-8',
    accountName: 'Sarah\'s 401(k)',
    accountType: '401(k)',
    percentage: 100,
    beneficiaryId: 'john-smith',
    contingent: false,
  },
  {
    id: 'ben-9',
    accountName: 'Sarah\'s 401(k)',
    accountType: '401(k)',
    percentage: 50,
    beneficiaryId: 'emily-smith',
    contingent: true,
  },
  {
    id: 'ben-10',
    accountName: 'Sarah\'s 401(k)',
    accountType: '401(k)',
    percentage: 50,
    beneficiaryId: 'michael-smith',
    contingent: true,
  },
  // Sarah's Roth beneficiaries
  {
    id: 'ben-11',
    accountName: 'Sarah\'s Roth IRA',
    accountType: 'Roth IRA',
    percentage: 100,
    beneficiaryId: 'john-smith',
    contingent: false,
  },
  // Life insurance (assumed)
  {
    id: 'ben-12',
    accountName: 'John\'s Life Insurance',
    accountType: 'Life Insurance',
    percentage: 100,
    beneficiaryId: 'sarah-smith',
    contingent: false,
  },
  {
    id: 'ben-13',
    accountName: 'Sarah\'s Life Insurance',
    accountType: 'Life Insurance',
    percentage: 100,
    beneficiaryId: 'john-smith',
    contingent: false,
  },
];

// ============================================================================
// COMPLETE HOUSEHOLD OBJECT
// ============================================================================

export const DEMO_JS123_HOUSEHOLD: FamilyHousehold = {
  code: 'DEMO-JS123',
  householdName: 'Smith Family',
  totalNetWorth: 1560500, // Sum of all accounts
  totalAccounts: DEMO_FAMILY_ACCOUNTS.length,
  members: DEMO_FAMILY_MEMBERS,
  accounts: DEMO_FAMILY_ACCOUNTS,
  beneficiaryDesignations: DEMO_BENEFICIARY_DESIGNATIONS,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getMemberById(memberId: string): FamilyMember | undefined {
  return DEMO_FAMILY_MEMBERS.find(m => m.id === memberId);
}

export function getAccountsByOwner(memberId: string): FamilyAccount[] {
  return DEMO_FAMILY_ACCOUNTS.filter(a => a.ownerId === memberId);
}

export function getJointAccounts(): FamilyAccount[] {
  return DEMO_FAMILY_ACCOUNTS.filter(a => a.ownershipType === 'joint');
}

export function getBeneficiaryDesignationsForMember(memberId: string): BeneficiaryDesignation[] {
  return DEMO_BENEFICIARY_DESIGNATIONS.filter(b => b.beneficiaryId === memberId);
}

export function getMemberTotalAssets(memberId: string): number {
  const member = getMemberById(memberId);
  if (!member) return 0;
  
  // Sole-owned accounts
  const soleTotal = DEMO_FAMILY_ACCOUNTS
    .filter(a => a.ownerId === memberId && a.ownershipType === 'sole')
    .reduce((sum, a) => sum + a.balance, 0);
  
  // Custodial accounts (for children)
  const custodialTotal = DEMO_FAMILY_ACCOUNTS
    .filter(a => a.ownerId === memberId && a.ownershipType === 'custodial')
    .reduce((sum, a) => sum + a.balance, 0);
  
  return soleTotal + custodialTotal;
}

export function getMemberAccountsSummary(memberId: string): string {
  const accounts = getAccountsByOwner(memberId);
  const jointAccounts = DEMO_FAMILY_ACCOUNTS.filter(
    a => a.ownershipType === 'joint' && (a.ownerId === memberId || 
      (memberId === 'sarah-smith' && a.ownerId === 'john-smith') ||
      (memberId === 'john-smith' && a.ownerId === 'sarah-smith'))
  );
  
  const totalAccounts = accounts.length + (memberId === 'john-smith' || memberId === 'sarah-smith' ? jointAccounts.length : 0);
  const uniqueAccounts = new Set([...accounts, ...jointAccounts]).size;
  
  if (totalAccounts === 0) return 'No accounts';
  if (totalAccounts === 1) return '1 account';
  return `${totalAccounts} accounts`;
}

export function getHouseholdByCode(code: string): FamilyHousehold | null {
  if (code === 'DEMO-JS123') {
    return DEMO_JS123_HOUSEHOLD;
  }
  return null;
}
