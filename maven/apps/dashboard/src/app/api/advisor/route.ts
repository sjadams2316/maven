import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  AdvisorUpdateSchema,
  getMockAdvisor,
  MOCK_ADVISOR,
  Advisor,
} from '@/lib/advisor/types';

/**
 * GET /api/advisor
 * 
 * Returns the current advisor's profile.
 * Requires authentication as an advisor.
 * 
 * @returns {Advisor} The advisor profile
 * 
 * @example Response
 * {
 *   "id": "adv_demo",
 *   "firmName": "Adams Wealth Management",
 *   "crdNumber": "123456",
 *   "enabledFeatures": ["portfolio", "retirement", "tax"],
 *   ...
 * }
 */
export async function GET() {
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
    
    return Response.json(advisor);
  } catch (error) {
    console.error('GET /api/advisor error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to fetch advisor profile.',
      'ADVISOR_FETCH_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}

/**
 * PATCH /api/advisor
 * 
 * Updates the current advisor's profile.
 * Partial updates are supported - only include fields you want to change.
 * 
 * @param {Object} body - Update fields
 * @param {string} [body.firmName] - Firm name (1-200 chars)
 * @param {string} [body.firmLogo] - URL to firm logo
 * @param {string} [body.crdNumber] - FINRA CRD number
 * @param {string} [body.adv2Url] - URL to ADV Part 2 document
 * @param {string} [body.defaultClientTone] - Default tone: 'conservative' | 'moderate' | 'engaged'
 * @param {string[]} [body.enabledFeatures] - Features to enable for clients
 * @param {string} [body.primaryColor] - Hex color for client portal branding
 * 
 * @returns {Advisor} Updated advisor profile
 * 
 * @example Request
 * PATCH /api/advisor
 * { "firmName": "New Firm Name", "defaultClientTone": "conservative" }
 */
export async function PATCH(request: NextRequest) {
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
    const parseResult = AdvisorUpdateSchema.safeParse(body);
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
    const updatedAdvisor: Advisor = {
      ...MOCK_ADVISOR,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    return Response.json(updatedAdvisor);
  } catch (error) {
    console.error('PATCH /api/advisor error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to update advisor profile.',
      'ADVISOR_UPDATE_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}
