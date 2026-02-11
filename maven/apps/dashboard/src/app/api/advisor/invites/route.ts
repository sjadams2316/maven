import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  ClientInviteCreateSchema,
  getMockAdvisor,
  MOCK_INVITES,
  ClientInvite,
  generateInviteCode,
} from '@/lib/advisor/types';

/**
 * GET /api/advisor/invites
 * 
 * Returns all client invites for the current advisor.
 * Supports filtering by status.
 * 
 * @query {string} [status] - Filter by status: 'pending' | 'accepted' | 'expired'
 * 
 * @returns {Object} List of invites with summary stats
 * 
 * @example Response
 * {
 *   "invites": [...],
 *   "total": 5,
 *   "byStatus": { "pending": 2, "accepted": 2, "expired": 1 }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const advisor = getMockAdvisor();
    
    if (!advisor) {
      return createErrorResponse(
        'Unauthorized',
        'You must be logged in as an advisor to access this endpoint.',
        'ADVISOR_NOT_FOUND',
        'Complete advisor onboarding at /partners/setup',
        401
      );
    }
    
    // Parse query params
    const { searchParams } = request.nextUrl;
    const statusFilter = searchParams.get('status');
    
    // Filter invites
    let invites = MOCK_INVITES.filter(i => i.advisorId === advisor.id);
    
    // Check for expired invites and update status
    const now = new Date();
    invites = invites.map(invite => {
      if (invite.status === 'pending' && new Date(invite.expiresAt) < now) {
        return { ...invite, status: 'expired' as const };
      }
      return invite;
    });
    
    if (statusFilter && ['pending', 'accepted', 'expired'].includes(statusFilter)) {
      invites = invites.filter(i => i.status === statusFilter);
    }
    
    // Calculate summary stats
    const allInvites = MOCK_INVITES.filter(i => i.advisorId === advisor.id);
    const byStatus = {
      pending: allInvites.filter(i => i.status === 'pending' && new Date(i.expiresAt) >= now).length,
      accepted: allInvites.filter(i => i.status === 'accepted').length,
      expired: allInvites.filter(i => i.status === 'expired' || (i.status === 'pending' && new Date(i.expiresAt) < now)).length,
    };
    
    return Response.json({
      invites,
      total: allInvites.length,
      filtered: invites.length,
      byStatus,
    });
  } catch (error) {
    console.error('GET /api/advisor/invites error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to fetch invites.',
      'INVITES_FETCH_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}

/**
 * POST /api/advisor/invites
 * 
 * Creates a new client invite.
 * Generates a unique invite code that can be shared with the prospective client.
 * 
 * @param {Object} body - Invite details
 * @param {string} [body.email] - Pre-filled email for the invite
 * @param {string} [body.name] - Pre-filled name for the invite
 * @param {number} [body.expiresInDays] - Days until invite expires (default: 7, max: 90)
 * 
 * @returns {ClientInvite} The created invite with unique code
 * 
 * @example Request
 * POST /api/advisor/invites
 * { "email": "prospect@example.com", "name": "Alex Thompson", "expiresInDays": 14 }
 * 
 * @example Response
 * {
 *   "id": "inv_123",
 *   "code": "INVITE-ABC123",
 *   "email": "prospect@example.com",
 *   "status": "pending",
 *   "expiresAt": "2024-02-24T00:00:00Z",
 *   "inviteUrl": "https://maven.app/invite/INVITE-ABC123"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const advisor = getMockAdvisor();
    
    if (!advisor) {
      return createErrorResponse(
        'Unauthorized',
        'You must be logged in as an advisor to access this endpoint.',
        'ADVISOR_NOT_FOUND',
        'Complete advisor onboarding at /partners/setup',
        401
      );
    }
    
    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      // Empty body is allowed - all fields are optional
      body = {};
    }
    
    // Validate with Zod (L007)
    const parseResult = ClientInviteCreateSchema.safeParse(body);
    if (!parseResult.success) {
      const issues = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      return createErrorResponse(
        'Validation Error',
        `Invalid input: ${issues}`,
        'VALIDATION_ERROR',
        'Check the field types and constraints.',
        400
      );
    }
    
    const data = parseResult.data;
    
    // Generate unique invite code
    const code = generateInviteCode();
    
    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 7));
    
    // Create new invite
    const now = new Date().toISOString();
    const newInvite: ClientInvite = {
      id: `inv_${Date.now()}`,
      advisorId: advisor.id,
      code,
      email: data.email || null,
      name: data.name || null,
      status: 'pending',
      expiresAt: expiresAt.toISOString(),
      acceptedAt: null,
      acceptedByUserId: null,
      createdAt: now,
    };
    
    // Build invite URL (would be real domain in production)
    const inviteUrl = `https://maven.app/invite/${code}`;
    
    return Response.json(
      {
        ...newInvite,
        inviteUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/advisor/invites error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to create invite.',
      'INVITE_CREATE_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}

/**
 * DELETE /api/advisor/invites
 * 
 * Revokes/deletes a client invite.
 * Pass the invite code as a query parameter.
 * 
 * @query {string} code - The invite code to revoke
 * 
 * @returns {Object} Confirmation message
 * 
 * @example Request
 * DELETE /api/advisor/invites?code=INVITE-ABC123
 */
export async function DELETE(request: NextRequest) {
  try {
    const advisor = getMockAdvisor();
    
    if (!advisor) {
      return createErrorResponse(
        'Unauthorized',
        'You must be logged in as an advisor to access this endpoint.',
        'ADVISOR_NOT_FOUND',
        'Complete advisor onboarding at /partners/setup',
        401
      );
    }
    
    const code = request.nextUrl.searchParams.get('code');
    
    if (!code) {
      return createErrorResponse(
        'Bad Request',
        'Missing code query parameter.',
        'MISSING_INVITE_CODE',
        'Provide ?code=INVITE-XXX to specify which invite to revoke.',
        400
      );
    }
    
    // Find the invite
    const invite = MOCK_INVITES.find(
      i => i.advisorId === advisor.id && i.code === code
    );
    
    if (!invite) {
      return createErrorResponse(
        'Not Found',
        `Invite with code "${code}" not found.`,
        'INVITE_NOT_FOUND',
        'Check the invite code and try again.',
        404
      );
    }
    
    if (invite.status === 'accepted') {
      return createErrorResponse(
        'Conflict',
        'Cannot revoke an invite that has already been accepted.',
        'INVITE_ALREADY_ACCEPTED',
        'The invite was accepted by the client.',
        409
      );
    }
    
    // Mock delete
    return Response.json({
      success: true,
      message: 'Invite revoked.',
      deletedCode: code,
    });
  } catch (error) {
    console.error('DELETE /api/advisor/invites error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to revoke invite.',
      'INVITE_DELETE_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}
