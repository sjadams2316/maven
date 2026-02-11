import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  InsightCurationSchema,
  InsightCurationBulkSchema,
  getMockAdvisor,
  findClientById,
  MOCK_INSIGHT_CURATIONS,
  MOCK_INSIGHTS,
  InsightCuration,
} from '@/lib/advisor/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/advisor/clients/[id]/insights
 * 
 * Returns curated insights for a specific client.
 * Shows which insights are visible to the client and any advisor context added.
 * 
 * @param {string} id - Client relationship ID
 * 
 * @returns {Object} Curated insights with full insight details
 * 
 * @example Response
 * {
 *   "clientId": "client_1",
 *   "curations": [
 *     {
 *       "id": "cur_1",
 *       "insightId": "insight_tax_loss_1",
 *       "showToClient": true,
 *       "advisorContext": "I recommend we execute this before year-end.",
 *       "insight": {
 *         "id": "insight_tax_loss_1",
 *         "type": "tax_loss_harvest",
 *         "title": "Tax Loss Harvesting Opportunity",
 *         ...
 *       }
 *     }
 *   ],
 *   "availableInsights": [...] // Insights not yet curated
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
    
    // Get curations for this client
    const curations = MOCK_INSIGHT_CURATIONS.filter(
      c => c.relationshipId === id
    );
    
    // Enrich curations with full insight data
    const enrichedCurations = curations.map(curation => ({
      ...curation,
      insight: MOCK_INSIGHTS.find(i => i.id === curation.insightId) || null,
    }));
    
    // Get insights not yet curated (L010: Could use Promise.all for parallel fetches)
    const curatedInsightIds = new Set(curations.map(c => c.insightId));
    const availableInsights = MOCK_INSIGHTS.filter(
      i => !curatedInsightIds.has(i.id)
    );
    
    return Response.json({
      clientId: id,
      clientName: client.name,
      curations: enrichedCurations,
      availableInsights,
    });
  } catch (error) {
    console.error('GET /api/advisor/clients/[id]/insights error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to fetch insight curations.',
      'INSIGHTS_FETCH_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}

/**
 * POST /api/advisor/clients/[id]/insights
 * 
 * Creates or updates insight curations for a client.
 * Use this to control which insights a client sees and add advisor context.
 * 
 * @param {string} id - Client relationship ID
 * @param {Object} body - Single curation or bulk curations
 * @param {string} body.insightId - ID of the insight to curate (for single)
 * @param {boolean} [body.showToClient] - Whether to show this insight to the client
 * @param {string} [body.advisorContext] - Additional context from the advisor
 * @param {Array} [body.curations] - Array of curations for bulk update
 * 
 * @returns {InsightCuration | InsightCuration[]} Created/updated curation(s)
 * 
 * @example Single Request
 * POST /api/advisor/clients/client_1/insights
 * { "insightId": "insight_tax_loss_1", "showToClient": true, "advisorContext": "Let's discuss" }
 * 
 * @example Bulk Request
 * POST /api/advisor/clients/client_1/insights
 * {
 *   "curations": [
 *     { "insightId": "insight_1", "showToClient": true },
 *     { "insightId": "insight_2", "showToClient": false }
 *   ]
 * }
 */
export async function POST(
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
    
    // Parse request body
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
    
    // Try bulk schema first, then single
    const bulkResult = InsightCurationBulkSchema.safeParse(body);
    if (bulkResult.success) {
      // Bulk update
      const curations = bulkResult.data.curations;
      const now = new Date().toISOString();
      
      const results: InsightCuration[] = curations.map((c, index) => {
        // Check if insight exists
        const insight = MOCK_INSIGHTS.find(i => i.id === c.insightId);
        if (!insight) {
          // In a real implementation, we'd handle this more gracefully
          console.warn(`Insight ${c.insightId} not found, skipping`);
        }
        
        return {
          id: `cur_new_${Date.now()}_${index}`,
          relationshipId: id,
          insightId: c.insightId,
          showToClient: c.showToClient ?? true,
          advisorContext: c.advisorContext ?? null,
          createdAt: now,
          updatedAt: now,
        };
      });
      
      return Response.json({
        success: true,
        curations: results,
        count: results.length,
      }, { status: 201 });
    }
    
    // Try single curation schema
    const singleResult = InsightCurationSchema.safeParse(body);
    if (!singleResult.success) {
      const issues = singleResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      return createErrorResponse(
        'Validation Error',
        `Invalid input: ${issues}`,
        'VALIDATION_ERROR',
        'Provide either a single curation object or { curations: [...] } for bulk.',
        400
      );
    }
    
    const data = singleResult.data;
    
    // Verify insight exists
    const insight = MOCK_INSIGHTS.find(i => i.id === data.insightId);
    if (!insight) {
      return createErrorResponse(
        'Not Found',
        `Insight with ID "${data.insightId}" not found.`,
        'INSIGHT_NOT_FOUND',
        'Check the insight ID and try again.',
        404
      );
    }
    
    // Create curation
    const now = new Date().toISOString();
    const newCuration: InsightCuration = {
      id: `cur_${Date.now()}`,
      relationshipId: id,
      insightId: data.insightId,
      showToClient: data.showToClient ?? true,
      advisorContext: data.advisorContext ?? null,
      createdAt: now,
      updatedAt: now,
    };
    
    return Response.json(newCuration, { status: 201 });
  } catch (error) {
    console.error('POST /api/advisor/clients/[id]/insights error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to create insight curation.',
      'CURATION_CREATE_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}

/**
 * DELETE /api/advisor/clients/[id]/insights
 * 
 * Removes an insight curation (resets to default visibility).
 * Pass the insightId as a query parameter.
 * 
 * @param {string} id - Client relationship ID
 * @query {string} insightId - ID of the insight curation to remove
 * 
 * @returns {Object} Confirmation message
 * 
 * @example Request
 * DELETE /api/advisor/clients/client_1/insights?insightId=insight_tax_loss_1
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
    
    const insightId = request.nextUrl.searchParams.get('insightId');
    
    if (!insightId) {
      return createErrorResponse(
        'Bad Request',
        'Missing insightId query parameter.',
        'MISSING_INSIGHT_ID',
        'Provide ?insightId=xxx to specify which curation to delete.',
        400
      );
    }
    
    // Find the curation
    const curation = MOCK_INSIGHT_CURATIONS.find(
      c => c.relationshipId === id && c.insightId === insightId
    );
    
    if (!curation) {
      return createErrorResponse(
        'Not Found',
        `No curation found for insight "${insightId}" on client "${id}".`,
        'CURATION_NOT_FOUND',
        'The insight may not be curated for this client.',
        404
      );
    }
    
    // Mock delete
    return Response.json({
      success: true,
      message: 'Insight curation removed.',
      deletedCurationId: curation.id,
      insightId,
    });
  } catch (error) {
    console.error('DELETE /api/advisor/clients/[id]/insights error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to delete insight curation.',
      'CURATION_DELETE_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}
