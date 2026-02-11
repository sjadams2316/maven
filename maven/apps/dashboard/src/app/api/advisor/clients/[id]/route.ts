import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  ClientUpdateSchema,
  getMockAdvisor,
  findClientById,
  ClientRelationship,
} from '@/lib/advisor/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/advisor/clients/[id]
 * 
 * Returns a specific client by ID.
 * Includes full client details with portal access info.
 * 
 * @param {string} id - Client relationship ID
 * 
 * @returns {ClientRelationship} The client details
 * 
 * @example Response
 * {
 *   "id": "client_1",
 *   "name": "John Smith",
 *   "email": "john@example.com",
 *   "portalCode": "MAVEN-JS123",
 *   "status": "active",
 *   "aum": 850000,
 *   ...
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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
    
    const { id } = await params;
    const client = findClientById(id);
    
    if (!client) {
      return createErrorResponse(
        'Not Found',
        `Client with ID "${id}" not found.`,
        'CLIENT_NOT_FOUND',
        'Check the client ID and try again.',
        404
      );
    }
    
    // Verify this client belongs to the advisor
    if (client.advisorId !== advisor.id) {
      return createErrorResponse(
        'Forbidden',
        'You do not have access to this client.',
        'CLIENT_ACCESS_DENIED',
        'This client belongs to a different advisor.',
        403
      );
    }
    
    return Response.json(client);
  } catch (error) {
    console.error('GET /api/advisor/clients/[id] error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to fetch client.',
      'CLIENT_FETCH_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}

/**
 * PATCH /api/advisor/clients/[id]
 * 
 * Updates a specific client's details.
 * Partial updates are supported - only include fields you want to change.
 * 
 * @param {string} id - Client relationship ID
 * @param {Object} body - Update fields
 * @param {string} [body.name] - Client's full name
 * @param {string} [body.email] - Client's email address
 * @param {string} [body.tonePreference] - Communication tone preference
 * @param {string[]} [body.enabledFeatures] - Features to enable
 * @param {string} [body.internalNotes] - Advisor-only notes
 * @param {string} [body.status] - Client status: 'active' | 'prospect' | 'churned'
 * @param {boolean} [body.portalEnabled] - Enable/disable portal access
 * @param {number} [body.aum] - Assets under management
 * 
 * @returns {ClientRelationship} Updated client details
 * 
 * @example Request
 * PATCH /api/advisor/clients/client_1
 * { "status": "active", "aum": 900000 }
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
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
    
    const { id } = await params;
    const client = findClientById(id);
    
    if (!client) {
      return createErrorResponse(
        'Not Found',
        `Client with ID "${id}" not found.`,
        'CLIENT_NOT_FOUND',
        'Check the client ID and try again.',
        404
      );
    }
    
    // Verify this client belongs to the advisor
    if (client.advisorId !== advisor.id) {
      return createErrorResponse(
        'Forbidden',
        'You do not have access to this client.',
        'CLIENT_ACCESS_DENIED',
        'This client belongs to a different advisor.',
        403
      );
    }
    
    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(
        'Bad Request',
        'Invalid JSON in request body.',
        'INVALID_JSON',
        'Ensure the request body is valid JSON.',
        400
      );
    }
    
    // Validate with Zod (L007)
    const parseResult = ClientUpdateSchema.safeParse(body);
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
    
    const updates = parseResult.data;
    
    // Mock update - in production this would update the database
    const updatedClient: ClientRelationship = {
      ...client,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    return Response.json(updatedClient);
  } catch (error) {
    console.error('PATCH /api/advisor/clients/[id] error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to update client.',
      'CLIENT_UPDATE_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}

/**
 * DELETE /api/advisor/clients/[id]
 * 
 * Deletes a client relationship.
 * This removes the advisor-client relationship but does not delete the client's user account.
 * Consider using PATCH to set status='churned' instead for record keeping.
 * 
 * @param {string} id - Client relationship ID
 * 
 * @returns {Object} Confirmation message
 * 
 * @example Response
 * { "success": true, "message": "Client relationship deleted.", "deletedId": "client_1" }
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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
    
    const { id } = await params;
    const client = findClientById(id);
    
    if (!client) {
      return createErrorResponse(
        'Not Found',
        `Client with ID "${id}" not found.`,
        'CLIENT_NOT_FOUND',
        'Check the client ID and try again.',
        404
      );
    }
    
    // Verify this client belongs to the advisor
    if (client.advisorId !== advisor.id) {
      return createErrorResponse(
        'Forbidden',
        'You do not have access to this client.',
        'CLIENT_ACCESS_DENIED',
        'This client belongs to a different advisor.',
        403
      );
    }
    
    // Mock delete - in production this would delete from database
    // Note: Consider soft delete (status='churned') instead of hard delete
    
    return Response.json({
      success: true,
      message: 'Client relationship deleted.',
      deletedId: id,
    });
  } catch (error) {
    console.error('DELETE /api/advisor/clients/[id] error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to delete client.',
      'CLIENT_DELETE_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}
