import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  findClientByPortalCode,
  MOCK_ADVISOR,
  MOCK_INSIGHT_CURATIONS,
  MOCK_INSIGHTS,
} from '@/lib/advisor/types';

interface RouteParams {
  params: Promise<{ code: string }>;
}

/**
 * GET /api/client-portal/[code]
 * 
 * Returns client portal data for a given portal code.
 * This is the main endpoint for the client-facing portal at /c/[code].
 * 
 * Does NOT require authentication - portal codes act as access tokens.
 * However, portal access is tracked for advisor visibility.
 * 
 * @param {string} code - The client's unique portal code (e.g., MAVEN-JS123)
 * 
 * @returns {Object} Portal data including:
 *   - Client's enabled features
 *   - Curated insights (only those marked showToClient=true)
 *   - Advisor firm branding
 *   - Upcoming meetings (if any)
 * 
 * @example Response
 * {
 *   "portal": {
 *     "clientName": "John Smith",
 *     "tonePreference": "moderate",
 *     "enabledFeatures": ["portfolio", "retirement"],
 *     "lastAccess": "2024-02-10T19:00:00Z"
 *   },
 *   "advisor": {
 *     "firmName": "Adams Wealth Management",
 *     "firmLogo": null,
 *     "primaryColor": "#2563eb"
 *   },
 *   "insights": [...],  // Only curated insights with showToClient=true
 *   "meetings": [...]   // Upcoming meetings
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { code } = await params;
    
    // Validate code format (basic check)
    if (!code || code.length < 6) {
      return createErrorResponse(
        'Bad Request',
        'Invalid portal code format.',
        'INVALID_PORTAL_CODE',
        'Portal codes are in format MAVEN-XXXX.',
        400
      );
    }
    
    // Find client by portal code
    const client = findClientByPortalCode(code);
    
    if (!client) {
      return createErrorResponse(
        'Not Found',
        'Portal not found.',
        'PORTAL_NOT_FOUND',
        'Check the portal code or contact your advisor.',
        404
      );
    }
    
    // Check if portal is enabled
    if (!client.portalEnabled) {
      return createErrorResponse(
        'Forbidden',
        'Portal access has been disabled.',
        'PORTAL_DISABLED',
        'Contact your advisor to re-enable portal access.',
        403
      );
    }
    
    // Get advisor info (for branding)
    // In production, this would be a database lookup
    const advisor = MOCK_ADVISOR;
    
    // Get curated insights (only those marked as showToClient=true)
    const curations = MOCK_INSIGHT_CURATIONS.filter(
      c => c.relationshipId === client.id && c.showToClient
    );
    
    // Enrich with insight data
    const insights = curations.map(curation => {
      const insight = MOCK_INSIGHTS.find(i => i.id === curation.insightId);
      if (!insight) return null;
      
      return {
        id: insight.id,
        type: insight.type,
        title: insight.title,
        summary: insight.summary,
        priority: insight.priority,
        advisorContext: curation.advisorContext, // Advisor's added context
        createdAt: insight.createdAt,
      };
    }).filter(Boolean);
    
    // Mock upcoming meetings
    const meetings = [
      {
        id: 'mtg_1',
        title: 'Quarterly Review',
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        duration: 60,
        location: 'Zoom',
        agenda: 'Portfolio performance review, Q2 outlook, tax planning discussion',
      },
    ];
    
    // Update last portal access (mock - in production this would update DB)
    const now = new Date().toISOString();
    
    // Build response
    const portalData = {
      portal: {
        clientName: client.name,
        tonePreference: client.tonePreference,
        enabledFeatures: client.enabledFeatures,
        lastAccess: now,
      },
      advisor: {
        firmName: advisor.firmName,
        firmLogo: advisor.firmLogo,
        primaryColor: advisor.primaryColor,
        adv2Url: advisor.adv2Url,
      },
      insights,
      meetings,
      // Feature flags based on what's enabled for this client
      features: {
        portfolio: client.enabledFeatures.includes('portfolio'),
        retirement: client.enabledFeatures.includes('retirement'),
        tax: client.enabledFeatures.includes('tax'),
      },
    };
    
    return Response.json(portalData);
  } catch (error) {
    console.error('GET /api/client-portal/[code] error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to load portal.',
      'PORTAL_LOAD_ERROR',
      'Please try again or contact your advisor.',
      500
    );
  }
}

/**
 * POST /api/client-portal/[code]
 * 
 * Records client portal activity or feedback.
 * Used for tracking engagement and collecting client input.
 * 
 * @param {string} code - The client's unique portal code
 * @param {Object} body - Activity data
 * @param {string} body.action - Type of action: 'view_insight' | 'dismiss_insight' | 'feedback' | 'request_meeting'
 * @param {string} [body.insightId] - Insight ID for insight-related actions
 * @param {string} [body.feedback] - Feedback text for feedback action
 * @param {Object} [body.meetingRequest] - Meeting request details
 * 
 * @returns {Object} Confirmation
 * 
 * @example View Insight
 * POST /api/client-portal/MAVEN-JS123
 * { "action": "view_insight", "insightId": "insight_tax_loss_1" }
 * 
 * @example Request Meeting
 * POST /api/client-portal/MAVEN-JS123
 * { "action": "request_meeting", "meetingRequest": { "preferredTimes": ["morning", "afternoon"], "topic": "Tax planning" } }
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { code } = await params;
    
    // Find client by portal code
    const client = findClientByPortalCode(code);
    
    if (!client) {
      return createErrorResponse(
        'Not Found',
        'Portal not found.',
        'PORTAL_NOT_FOUND',
        'Check the portal code or contact your advisor.',
        404
      );
    }
    
    if (!client.portalEnabled) {
      return createErrorResponse(
        'Forbidden',
        'Portal access has been disabled.',
        'PORTAL_DISABLED',
        'Contact your advisor to re-enable portal access.',
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
    
    const { action, insightId, feedback, meetingRequest } = body as Record<string, unknown>;
    
    if (!action || typeof action !== 'string') {
      return createErrorResponse(
        'Bad Request',
        'Missing or invalid action field.',
        'INVALID_ACTION',
        'Provide action: view_insight | dismiss_insight | feedback | request_meeting',
        400
      );
    }
    
    // Handle different actions
    switch (action) {
      case 'view_insight':
        if (!insightId) {
          return createErrorResponse(
            'Bad Request',
            'Missing insightId for view_insight action.',
            'MISSING_INSIGHT_ID',
            'Provide the insightId to track the view.',
            400
          );
        }
        // Mock: Log insight view
        console.log(`Client ${client.id} viewed insight ${insightId}`);
        return Response.json({
          success: true,
          message: 'Insight view recorded.',
          insightId,
        });
        
      case 'dismiss_insight':
        if (!insightId) {
          return createErrorResponse(
            'Bad Request',
            'Missing insightId for dismiss_insight action.',
            'MISSING_INSIGHT_ID',
            'Provide the insightId to dismiss.',
            400
          );
        }
        // Mock: Record dismissal
        console.log(`Client ${client.id} dismissed insight ${insightId}`);
        return Response.json({
          success: true,
          message: 'Insight dismissed.',
          insightId,
        });
        
      case 'feedback':
        if (!feedback || typeof feedback !== 'string') {
          return createErrorResponse(
            'Bad Request',
            'Missing or invalid feedback text.',
            'INVALID_FEEDBACK',
            'Provide feedback as a non-empty string.',
            400
          );
        }
        // Mock: Store feedback
        console.log(`Client ${client.id} feedback: ${feedback}`);
        return Response.json({
          success: true,
          message: 'Feedback submitted. Your advisor will be notified.',
        });
        
      case 'request_meeting':
        // Mock: Create meeting request
        console.log(`Client ${client.id} requested meeting:`, meetingRequest);
        return Response.json({
          success: true,
          message: 'Meeting request submitted. Your advisor will contact you to schedule.',
          requestId: `req_${Date.now()}`,
        });
        
      default:
        return createErrorResponse(
          'Bad Request',
          `Unknown action: ${action}`,
          'UNKNOWN_ACTION',
          'Valid actions: view_insight, dismiss_insight, feedback, request_meeting',
          400
        );
    }
  } catch (error) {
    console.error('POST /api/client-portal/[code] error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to process portal action.',
      'PORTAL_ACTION_ERROR',
      'Please try again or contact your advisor.',
      500
    );
  }
}
