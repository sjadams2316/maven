import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  ClientCreateSchema,
  getMockAdvisor,
  MOCK_CLIENTS,
  ClientRelationship,
  generatePortalCode,
} from '@/lib/advisor/types';

/**
 * GET /api/advisor/clients
 * 
 * Returns all clients for the current advisor.
 * Supports optional filtering by status.
 * 
 * @query {string} [status] - Filter by status: 'active' | 'prospect' | 'churned'
 * @query {string} [search] - Search by name or email
 * 
 * @returns {Object} List of clients with summary stats
 * 
 * @example Response
 * {
 *   "clients": [...],
 *   "total": 5,
 *   "byStatus": { "active": 3, "prospect": 1, "churned": 1 },
 *   "totalAUM": 4600000
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
    const searchQuery = searchParams.get('search')?.toLowerCase();
    
    // Filter clients
    let clients = MOCK_CLIENTS.filter(c => c.advisorId === advisor.id);
    
    if (statusFilter && ['active', 'prospect', 'churned'].includes(statusFilter)) {
      clients = clients.filter(c => c.status === statusFilter);
    }
    
    if (searchQuery) {
      clients = clients.filter(
        c =>
          c.name.toLowerCase().includes(searchQuery) ||
          c.email.toLowerCase().includes(searchQuery)
      );
    }
    
    // Calculate summary stats
    const allClients = MOCK_CLIENTS.filter(c => c.advisorId === advisor.id);
    const byStatus = {
      active: allClients.filter(c => c.status === 'active').length,
      prospect: allClients.filter(c => c.status === 'prospect').length,
      churned: allClients.filter(c => c.status === 'churned').length,
    };
    const totalAUM = allClients
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + c.aum, 0);
    
    return Response.json({
      clients,
      total: allClients.length,
      filtered: clients.length,
      byStatus,
      totalAUM,
    });
  } catch (error) {
    console.error('GET /api/advisor/clients error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to fetch clients.',
      'CLIENTS_FETCH_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}

/**
 * POST /api/advisor/clients
 * 
 * Creates a new client relationship.
 * Automatically generates a portal code for client access.
 * 
 * @param {Object} body - Client details
 * @param {string} body.name - Client's full name (required)
 * @param {string} body.email - Client's email address (required)
 * @param {string} [body.tonePreference] - Communication tone preference
 * @param {string[]} [body.enabledFeatures] - Features to enable for this client
 * @param {string} [body.internalNotes] - Advisor-only notes
 * @param {number} [body.aum] - Assets under management
 * 
 * @returns {ClientRelationship} The created client relationship
 * 
 * @example Request
 * POST /api/advisor/clients
 * { "name": "Jane Doe", "email": "jane@example.com", "tonePreference": "moderate" }
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
      return createErrorResponse(
        'Bad Request',
        'Invalid JSON in request body.',
        'INVALID_JSON',
        'Ensure the request body is valid JSON.',
        400
      );
    }
    
    // Validate with Zod (L007)
    const parseResult = ClientCreateSchema.safeParse(body);
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
    
    // Check for duplicate email
    const existingClient = MOCK_CLIENTS.find(
      c => c.advisorId === advisor.id && c.email.toLowerCase() === data.email.toLowerCase()
    );
    if (existingClient) {
      return createErrorResponse(
        'Conflict',
        'A client with this email already exists.',
        'CLIENT_EMAIL_EXISTS',
        `Existing client: ${existingClient.name} (${existingClient.id})`,
        409
      );
    }
    
    // Generate portal code
    const portalCode = generatePortalCode(data.name);
    
    // Create new client (mock - in production this would insert into database)
    const now = new Date().toISOString();
    const newClient: ClientRelationship = {
      id: `client_${Date.now()}`,
      advisorId: advisor.id,
      clientId: `user_client_${Date.now()}`,
      name: data.name,
      email: data.email,
      portalCode,
      portalEnabled: true,
      lastPortalAccess: null,
      tonePreference: data.tonePreference || advisor.defaultClientTone,
      enabledFeatures: data.enabledFeatures || advisor.enabledFeatures,
      internalNotes: data.internalNotes || null,
      status: 'prospect',
      aum: data.aum || 0,
      createdAt: now,
      updatedAt: now,
    };
    
    // In production: MOCK_CLIENTS.push(newClient) or database insert
    
    return Response.json(newClient, { status: 201 });
  } catch (error) {
    console.error('POST /api/advisor/clients error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to create client.',
      'CLIENT_CREATE_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}
