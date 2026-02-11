/**
 * Advisor & Client API Types and Mock Data
 * For Maven Partners Portal
 */

import { z } from 'zod';

// ============================================
// SHARED ERROR HELPER
// ============================================

/**
 * Create a standardized error response (L003: 4-part structure)
 */
export function createErrorResponse(
  error: string,
  message: string,
  code: string,
  hint?: string,
  status: number = 400
) {
  return Response.json(
    { error, message, code, hint: hint || null },
    { status }
  );
}

// ============================================
// ZOD SCHEMAS (L007: Validate data shapes)
// ============================================

export const AdvisorUpdateSchema = z.object({
  firmName: z.string().min(1).max(200).optional(),
  firmLogo: z.string().url().optional().nullable(),
  crdNumber: z.string().max(20).optional().nullable(),
  adv2Url: z.string().url().optional().nullable(),
  defaultClientTone: z.enum(['conservative', 'moderate', 'engaged']).optional(),
  enabledFeatures: z.array(z.string()).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
});

export const ClientCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  tonePreference: z.enum(['conservative', 'moderate', 'engaged']).optional(),
  enabledFeatures: z.array(z.string()).optional(),
  internalNotes: z.string().max(5000).optional(),
  aum: z.number().nonnegative().optional(),
});

export const ClientUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  tonePreference: z.enum(['conservative', 'moderate', 'engaged']).optional(),
  enabledFeatures: z.array(z.string()).optional(),
  internalNotes: z.string().max(5000).optional().nullable(),
  status: z.enum(['active', 'prospect', 'churned']).optional(),
  portalEnabled: z.boolean().optional(),
  aum: z.number().nonnegative().optional(),
});

export const InsightCurationSchema = z.object({
  insightId: z.string().min(1),
  showToClient: z.boolean().optional(),
  advisorContext: z.string().max(2000).optional().nullable(),
});

export const InsightCurationBulkSchema = z.object({
  curations: z.array(InsightCurationSchema),
});

export const ClientInviteCreateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().max(200).optional(),
  expiresInDays: z.number().int().min(1).max(90).optional().default(7),
});

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Advisor {
  id: string;
  userId: string;
  firmName: string;
  firmLogo: string | null;
  crdNumber: string | null;
  adv2Url: string | null;
  defaultClientTone: 'conservative' | 'moderate' | 'engaged';
  enabledFeatures: string[];
  primaryColor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRelationship {
  id: string;
  advisorId: string;
  clientId: string;
  name: string;
  email: string;
  portalCode: string;
  portalEnabled: boolean;
  lastPortalAccess: string | null;
  tonePreference: 'conservative' | 'moderate' | 'engaged';
  enabledFeatures: string[];
  internalNotes: string | null;
  status: 'active' | 'prospect' | 'churned';
  aum: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsightCuration {
  id: string;
  relationshipId: string;
  insightId: string;
  showToClient: boolean;
  advisorContext: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientInvite {
  id: string;
  advisorId: string;
  code: string;
  email: string | null;
  name: string | null;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  acceptedAt: string | null;
  acceptedByUserId: string | null;
  createdAt: string;
}

// ============================================
// MOCK DATA
// ============================================

export const MOCK_ADVISOR: Advisor = {
  id: 'adv_demo',
  userId: 'user_demo',
  firmName: 'Adams Wealth Management',
  firmLogo: null,
  crdNumber: '123456',
  adv2Url: null,
  defaultClientTone: 'moderate',
  enabledFeatures: ['portfolio', 'retirement', 'tax'],
  primaryColor: '#2563eb',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-02-10T14:30:00Z',
};

export const MOCK_CLIENTS: ClientRelationship[] = [
  {
    id: 'client_1',
    advisorId: 'adv_demo',
    clientId: 'user_client_1',
    name: 'John Smith',
    email: 'john@example.com',
    portalCode: 'MAVEN-JS123',
    portalEnabled: true,
    lastPortalAccess: '2024-02-09T15:30:00Z',
    tonePreference: 'moderate',
    enabledFeatures: ['portfolio', 'retirement'],
    internalNotes: 'Conservative investor, nearing retirement. Prefers quarterly calls.',
    status: 'active',
    aum: 850000,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-02-08T11:00:00Z',
  },
  {
    id: 'client_2',
    advisorId: 'adv_demo',
    clientId: 'user_client_2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    portalCode: 'MAVEN-SJ456',
    portalEnabled: true,
    lastPortalAccess: '2024-02-10T09:15:00Z',
    tonePreference: 'conservative',
    enabledFeatures: ['portfolio', 'retirement', 'tax'],
    internalNotes: 'High net worth. Interested in tax optimization strategies.',
    status: 'active',
    aum: 1200000,
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-02-10T09:15:00Z',
  },
  {
    id: 'client_3',
    advisorId: 'adv_demo',
    clientId: 'user_client_3',
    name: 'Michael Chen',
    email: 'michael@example.com',
    portalCode: 'MAVEN-MC789',
    portalEnabled: true,
    lastPortalAccess: null,
    tonePreference: 'engaged',
    enabledFeatures: ['portfolio'],
    internalNotes: 'New prospect. Meeting scheduled for next week.',
    status: 'prospect',
    aum: 450000,
    createdAt: '2024-02-05T16:00:00Z',
    updatedAt: '2024-02-05T16:00:00Z',
  },
  {
    id: 'client_4',
    advisorId: 'adv_demo',
    clientId: 'user_client_4',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    portalCode: 'MAVEN-ER012',
    portalEnabled: true,
    lastPortalAccess: '2024-02-07T18:45:00Z',
    tonePreference: 'moderate',
    enabledFeatures: ['portfolio', 'retirement'],
    internalNotes: 'Tech executive. Aggressive growth focus.',
    status: 'active',
    aum: 2100000,
    createdAt: '2024-01-22T11:30:00Z',
    updatedAt: '2024-02-07T18:45:00Z',
  },
  {
    id: 'client_5',
    advisorId: 'adv_demo',
    clientId: 'user_client_5',
    name: 'David Williams',
    email: 'david@example.com',
    portalCode: 'MAVEN-DW345',
    portalEnabled: false,
    lastPortalAccess: '2023-12-15T10:00:00Z',
    tonePreference: 'conservative',
    enabledFeatures: ['portfolio'],
    internalNotes: 'Moved to different firm. Keep relationship warm.',
    status: 'churned',
    aum: 0,
    createdAt: '2023-06-10T09:00:00Z',
    updatedAt: '2024-01-05T14:00:00Z',
  },
];

export const MOCK_INVITES: ClientInvite[] = [
  {
    id: 'inv_1',
    advisorId: 'adv_demo',
    code: 'INVITE-ABC123',
    email: 'prospect@example.com',
    name: 'Alex Thompson',
    status: 'pending',
    expiresAt: '2024-02-17T00:00:00Z',
    acceptedAt: null,
    acceptedByUserId: null,
    createdAt: '2024-02-10T10:00:00Z',
  },
  {
    id: 'inv_2',
    advisorId: 'adv_demo',
    code: 'INVITE-DEF456',
    email: 'newclient@example.com',
    name: 'Lisa Park',
    status: 'accepted',
    expiresAt: '2024-02-15T00:00:00Z',
    acceptedAt: '2024-02-08T14:30:00Z',
    acceptedByUserId: 'user_client_4',
    createdAt: '2024-02-01T09:00:00Z',
  },
];

export const MOCK_INSIGHT_CURATIONS: InsightCuration[] = [
  {
    id: 'cur_1',
    relationshipId: 'client_1',
    insightId: 'insight_tax_loss_1',
    showToClient: true,
    advisorContext: 'I recommend we execute this before year-end. Let\'s discuss in our next call.',
    createdAt: '2024-02-08T10:00:00Z',
    updatedAt: '2024-02-08T10:00:00Z',
  },
  {
    id: 'cur_2',
    relationshipId: 'client_1',
    insightId: 'insight_rebalance_1',
    showToClient: false,
    advisorContext: null,
    createdAt: '2024-02-07T15:00:00Z',
    updatedAt: '2024-02-07T15:00:00Z',
  },
  {
    id: 'cur_3',
    relationshipId: 'client_2',
    insightId: 'insight_tax_loss_1',
    showToClient: true,
    advisorContext: 'Great opportunity given your high income this year.',
    createdAt: '2024-02-09T11:00:00Z',
    updatedAt: '2024-02-09T11:00:00Z',
  },
];

// Mock insights that clients might have
export const MOCK_INSIGHTS = [
  {
    id: 'insight_tax_loss_1',
    type: 'tax_loss_harvest',
    title: 'Tax Loss Harvesting Opportunity',
    summary: 'AAPL position has unrealized losses of $2,500 that could offset gains.',
    priority: 'high',
    createdAt: '2024-02-08T08:00:00Z',
  },
  {
    id: 'insight_rebalance_1',
    type: 'rebalance',
    title: 'Portfolio Rebalancing Suggested',
    summary: 'Tech allocation has drifted 5% above target. Consider rebalancing.',
    priority: 'medium',
    createdAt: '2024-02-07T12:00:00Z',
  },
  {
    id: 'insight_dividend_1',
    type: 'dividend',
    title: 'Upcoming Dividend',
    summary: 'VTI dividend payment expected next week (~$450).',
    priority: 'low',
    createdAt: '2024-02-06T09:00:00Z',
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique portal code
 */
export function generatePortalCode(name: string): string {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `MAVEN-${initials}${random}`;
}

/**
 * Generate a unique invite code
 */
export function generateInviteCode(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INVITE-${random}`;
}

/**
 * Get mock advisor (simulating auth check)
 * In production, this would verify the user is an advisor
 */
export function getMockAdvisor(): Advisor | null {
  // Simulate authenticated advisor
  return MOCK_ADVISOR;
}

/**
 * Find client by ID
 */
export function findClientById(id: string): ClientRelationship | undefined {
  return MOCK_CLIENTS.find(c => c.id === id);
}

/**
 * Find client by portal code
 */
export function findClientByPortalCode(code: string): ClientRelationship | undefined {
  return MOCK_CLIENTS.find(c => c.portalCode === code);
}
