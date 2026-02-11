import { NextRequest } from 'next/server';
import {
  createErrorResponse,
  findClientByPortalCode,
} from '@/lib/advisor/types';
import {
  getSettingsByPortalCode,
  SECTION_DISPLAY_NAMES,
  getHiddenSections,
  type ClientPortalSettings,
} from '@/lib/client-portal-settings';

interface RouteParams {
  params: Promise<{ code: string }>;
}

/**
 * GET /api/client-portal/[code]/settings
 * 
 * Returns visibility settings for a client portal.
 * Advisors control which sections each client sees.
 * 
 * Does NOT require authentication - portal codes act as access tokens.
 * 
 * @param {string} code - The client's unique portal code (e.g., DEMO-JS123, MAVEN-JS123)
 * 
 * @returns {Object} Settings including:
 *   - settings: ClientPortalSettings object
 *   - hiddenSections: Array of hidden section names (for preview mode)
 * 
 * @example Response
 * {
 *   "settings": {
 *     "clientId": "client_1",
 *     "sections": {
 *       "family": true,
 *       "socialSecurity": true,
 *       "estate": true,
 *       ...
 *     },
 *     "showNetWorth": true,
 *     "showPerformance": true,
 *     "showProjections": true,
 *     "weeklyCommentary": true,
 *     "marketUpdates": false,
 *     "communicationTone": "moderate"
 *   },
 *   "hiddenSections": ["philanthropy"],
 *   "hiddenSectionNames": ["Philanthropy"]
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
        'Portal codes are in format DEMO-XXXX or MAVEN-XXXX.',
        400
      );
    }
    
    // For MAVEN- codes, validate client exists
    if (code.startsWith('MAVEN-')) {
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
    }
    
    // Get settings for this portal code
    const settings = getSettingsByPortalCode(code);
    
    if (!settings) {
      return createErrorResponse(
        'Not Found',
        'Settings not found for this portal.',
        'SETTINGS_NOT_FOUND',
        'Contact your advisor to configure portal settings.',
        404
      );
    }
    
    // Get hidden sections for preview mode
    const hiddenSections = getHiddenSections(settings);
    const hiddenSectionNames = hiddenSections.map(
      section => SECTION_DISPLAY_NAMES[section]
    );
    
    // Build response
    return Response.json({
      settings,
      hiddenSections,
      hiddenSectionNames,
    });
  } catch (error) {
    console.error('GET /api/client-portal/[code]/settings error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to load portal settings.',
      'SETTINGS_LOAD_ERROR',
      'Please try again or contact your advisor.',
      500
    );
  }
}

/**
 * PATCH /api/client-portal/[code]/settings
 * 
 * Updates visibility settings for a client portal.
 * This endpoint is for advisors only (requires advisor auth).
 * 
 * For now: Mock implementation (not persisted)
 * Later: Will update database
 * 
 * @param {string} code - The client's unique portal code
 * @param {Object} body - Settings to update (partial update supported)
 * 
 * @example Request
 * PATCH /api/client-portal/MAVEN-JS123/settings
 * {
 *   "sections": {
 *     "socialSecurity": false
 *   },
 *   "showPerformance": false
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { code } = await params;
    
    // TODO: Add advisor authentication check
    // For now, this is a mock implementation
    
    // Parse request body
    let body: Partial<ClientPortalSettings>;
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
    
    // Get current settings
    const currentSettings = getSettingsByPortalCode(code);
    
    if (!currentSettings) {
      return createErrorResponse(
        'Not Found',
        'Settings not found for this portal.',
        'SETTINGS_NOT_FOUND',
        'Contact your advisor to configure portal settings.',
        404
      );
    }
    
    // Merge settings (mock - not persisted)
    const updatedSettings: ClientPortalSettings = {
      ...currentSettings,
      ...body,
      sections: {
        ...currentSettings.sections,
        ...(body.sections || {}),
      },
    };
    
    // In production, this would persist to database
    console.log(`[MOCK] Updated settings for ${code}:`, updatedSettings);
    
    // Get updated hidden sections
    const hiddenSections = getHiddenSections(updatedSettings);
    const hiddenSectionNames = hiddenSections.map(
      section => SECTION_DISPLAY_NAMES[section]
    );
    
    return Response.json({
      success: true,
      message: 'Settings updated successfully.',
      settings: updatedSettings,
      hiddenSections,
      hiddenSectionNames,
    });
  } catch (error) {
    console.error('PATCH /api/client-portal/[code]/settings error:', error);
    return createErrorResponse(
      'Internal Server Error',
      'Failed to update portal settings.',
      'SETTINGS_UPDATE_ERROR',
      'Please try again or contact support.',
      500
    );
  }
}
