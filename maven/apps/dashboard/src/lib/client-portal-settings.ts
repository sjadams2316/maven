/**
 * Client Portal Settings - Advisor Curation Layer
 * 
 * Advisors control which sections each client sees.
 * A 30-year-old doesn't need Social Security.
 * An anxious client doesn't need performance charts.
 * The advisor curates.
 * 
 * Implements L004: Single source of truth for demo data
 * Implements L013: Client portal = advisor-curated, calm
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ClientPortalSections {
  family: boolean;
  socialSecurity: boolean;
  estate: boolean;
  taxPlanning: boolean;
  philanthropy: boolean;
  documents: boolean;
  messages: boolean;
  portfolio: boolean;    // Holdings view
  goals: boolean;        // Goal progress
}

export interface ClientPortalSettings {
  clientId: string;
  
  // Section visibility (advisor toggles)
  sections: ClientPortalSections;
  
  // Content preferences
  showNetWorth: boolean;       // Some clients prefer hidden
  showPerformance: boolean;    // Some get anxious about returns
  showProjections: boolean;    // Show retirement projections?
  
  // Commentary preferences
  weeklyCommentary: boolean;   // Show AI-generated commentary?
  marketUpdates: boolean;      // Show market news?
  
  // Tone/communication style
  communicationTone: 'conservative' | 'moderate' | 'engaged';
}

export type LifeStagePreset = 
  | 'young-professional'   // 25-35
  | 'growing-family'       // 35-50
  | 'pre-retiree'          // 50-65
  | 'retiree'              // 65+
  | 'high-net-worth';      // Any age, HNW

// ============================================
// LIFE STAGE PRESET DEFINITIONS
// ============================================

export const LIFE_STAGE_PRESETS: Record<LifeStagePreset, Omit<ClientPortalSettings, 'clientId'>> = {
  'young-professional': {
    sections: {
      family: false,           // Usually no household yet
      socialSecurity: false,   // 30+ years away
      estate: false,           // Unless HNW
      taxPlanning: true,       // Always relevant
      philanthropy: false,     // Lower priority
      documents: true,         // Always useful
      messages: true,          // Communication
      portfolio: true,         // Core feature
      goals: true,             // Visualize progress
    },
    showNetWorth: true,
    showPerformance: true,     // Young investors can handle volatility
    showProjections: true,     // Motivating to see future
    weeklyCommentary: false,   // Keep it simple
    marketUpdates: false,      // Less noise
    communicationTone: 'engaged',
  },
  
  'growing-family': {
    sections: {
      family: true,            // Track household
      socialSecurity: false,   // Still far away
      estate: true,            // Important with kids
      taxPlanning: true,       // More complex now
      philanthropy: false,     // Lower priority
      documents: true,         // More documents now
      messages: true,          // Communication
      portfolio: true,         // Core feature
      goals: true,             // Education, house, etc.
    },
    showNetWorth: true,
    showPerformance: true,
    showProjections: true,
    weeklyCommentary: true,    // More engaged
    marketUpdates: false,
    communicationTone: 'moderate',
  },
  
  'pre-retiree': {
    sections: {
      family: true,            // Track household
      socialSecurity: true,    // Critical now!
      estate: true,            // Very important
      taxPlanning: true,       // Roth conversions, etc.
      philanthropy: true,      // Often giving now
      documents: true,         // Estate docs important
      messages: true,          // Communication
      portfolio: true,         // Core feature
      goals: true,             // Retirement countdown
    },
    showNetWorth: true,
    showPerformance: true,     // But may want to hide for anxious clients
    showProjections: true,     // Critical for retirement planning
    weeklyCommentary: true,    // Want to stay informed
    marketUpdates: true,       // More engaged
    communicationTone: 'moderate',
  },
  
  'retiree': {
    sections: {
      family: true,            // Legacy planning
      socialSecurity: true,    // Already claiming or optimizing
      estate: true,            // Very important
      taxPlanning: true,       // RMDs, Roth conversions
      philanthropy: true,      // Common at this stage
      documents: true,         // Estate docs critical
      messages: true,          // Communication
      portfolio: true,         // Monitor distributions
      goals: true,             // Legacy, travel, etc.
    },
    showNetWorth: true,
    showPerformance: false,    // Often causes anxiety
    showProjections: true,     // Withdrawal sustainability
    weeklyCommentary: true,
    marketUpdates: false,      // Less focus on daily noise
    communicationTone: 'conservative',
  },
  
  'high-net-worth': {
    sections: {
      family: true,            // Multi-generational
      socialSecurity: true,    // Still relevant
      estate: true,            // Critical
      taxPlanning: true,       // Complex strategies
      philanthropy: true,      // DAFs, foundations
      documents: true,         // Many documents
      messages: true,          // White-glove service
      portfolio: true,         // Core feature
      goals: true,             // Legacy, impact
    },
    showNetWorth: true,
    showPerformance: true,     // Sophisticated investors
    showProjections: true,     // Multi-scenario planning
    weeklyCommentary: true,    // Expect commentary
    marketUpdates: true,       // Want market context
    communicationTone: 'engaged',
  },
};

// ============================================
// DEMO SETTINGS
// ============================================

/**
 * Demo settings mapped by portal code
 * L004: Single source of truth for demo data
 */
export const DEMO_PORTAL_SETTINGS: Record<string, ClientPortalSettings> = {
  // Pre-retiree demo - show most sections (John Smith from MOCK_CLIENTS)
  'DEMO-JS123': {
    clientId: 'client_demo_js',
    sections: {
      family: true,
      socialSecurity: true,    // Pre-retiree needs this
      estate: true,
      taxPlanning: true,
      philanthropy: true,
      documents: true,
      messages: true,
      portfolio: true,
      goals: true,
    },
    showNetWorth: true,
    showPerformance: true,
    showProjections: true,
    weeklyCommentary: true,
    marketUpdates: true,
    communicationTone: 'moderate',
  },
  
  // Also support the MAVEN- format codes from MOCK_CLIENTS
  'MAVEN-JS123': {
    clientId: 'client_1',
    sections: {
      family: true,
      socialSecurity: true,
      estate: true,
      taxPlanning: true,
      philanthropy: false,     // Not a priority for this client
      documents: true,
      messages: true,
      portfolio: true,
      goals: true,
    },
    showNetWorth: true,
    showPerformance: true,
    showProjections: true,
    weeklyCommentary: true,
    marketUpdates: false,
    communicationTone: 'moderate',
  },
  
  'MAVEN-SJ456': {
    clientId: 'client_2',
    sections: {
      family: true,
      socialSecurity: true,
      estate: true,
      taxPlanning: true,       // Tax optimization focused
      philanthropy: true,      // HNW, likely giving
      documents: true,
      messages: true,
      portfolio: true,
      goals: true,
    },
    showNetWorth: true,
    showPerformance: true,
    showProjections: true,
    weeklyCommentary: true,
    marketUpdates: true,
    communicationTone: 'conservative',
  },
  
  // Young professional example - minimal sections
  'DEMO-YOUNG': {
    clientId: 'client_demo_young',
    sections: {
      family: false,           // No household yet
      socialSecurity: false,   // 30+ years away - irrelevant
      estate: false,           // Not HNW yet
      taxPlanning: true,       // Always relevant
      philanthropy: false,     // Lower priority
      documents: true,
      messages: true,
      portfolio: true,
      goals: true,             // Motivating
    },
    showNetWorth: true,
    showPerformance: true,     // Can handle volatility
    showProjections: true,     // Motivating to see compound growth
    weeklyCommentary: false,   // Keep it simple
    marketUpdates: false,      // Less noise
    communicationTone: 'engaged',
  },
  
  // Anxious retiree - hide performance
  'DEMO-ANXIOUS': {
    clientId: 'client_demo_anxious',
    sections: {
      family: true,
      socialSecurity: true,
      estate: true,
      taxPlanning: true,
      philanthropy: false,
      documents: true,
      messages: true,
      portfolio: true,         // But simplified
      goals: true,
    },
    showNetWorth: true,
    showPerformance: false,    // HIDDEN - causes anxiety
    showProjections: false,    // HIDDEN - volatility in projections causes stress
    weeklyCommentary: true,    // But calm tone
    marketUpdates: false,      // No market noise
    communicationTone: 'conservative',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get default settings for a new client
 * Based on life stage preset or sensible defaults
 */
export function getDefaultSettings(
  clientId: string,
  lifeStage?: LifeStagePreset
): ClientPortalSettings {
  const preset = lifeStage 
    ? LIFE_STAGE_PRESETS[lifeStage]
    : LIFE_STAGE_PRESETS['pre-retiree']; // Default to pre-retiree
    
  return {
    clientId,
    ...preset,
  };
}

/**
 * Get settings for a portal code (demo or database lookup)
 * For now: returns from demo data
 * Later: will come from database
 */
export function getSettingsByPortalCode(code: string): ClientPortalSettings | null {
  // Check demo settings first
  if (DEMO_PORTAL_SETTINGS[code]) {
    return DEMO_PORTAL_SETTINGS[code];
  }
  
  // Fallback: return default pre-retiree settings for unknown codes
  // This ensures the portal works even without specific settings
  return getDefaultSettings(code, 'pre-retiree');
}

/**
 * Check if a specific section is enabled
 */
export function isSectionEnabled(
  settings: ClientPortalSettings,
  section: keyof ClientPortalSections
): boolean {
  return settings.sections[section] ?? false;
}

/**
 * Get list of enabled section keys
 */
export function getEnabledSections(settings: ClientPortalSettings): (keyof ClientPortalSections)[] {
  return (Object.keys(settings.sections) as (keyof ClientPortalSections)[])
    .filter(key => settings.sections[key]);
}

/**
 * Map section keys to URL paths
 */
export const SECTION_PATH_MAP: Record<keyof ClientPortalSections, string> = {
  family: '/family',
  socialSecurity: '/social-security',
  estate: '/estate',
  taxPlanning: '/tax',
  philanthropy: '/philanthropy',
  documents: '/documents',
  messages: '/messages',
  portfolio: '/portfolio',
  goals: '/goals',
};

/**
 * Get section key from URL path
 */
export function getSectionFromPath(path: string): keyof ClientPortalSections | null {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  
  for (const [section, sectionPath] of Object.entries(SECTION_PATH_MAP)) {
    if (normalized === sectionPath || normalized.startsWith(`${sectionPath}/`)) {
      return section as keyof ClientPortalSections;
    }
  }
  
  return null;
}

/**
 * Check if a path is allowed given settings
 */
export function isPathAllowed(settings: ClientPortalSettings, path: string): boolean {
  const section = getSectionFromPath(path);
  
  // Home path and unknown paths are always allowed
  if (!section) return true;
  
  return isSectionEnabled(settings, section);
}

/**
 * Get hidden sections (for advisor preview mode)
 */
export function getHiddenSections(settings: ClientPortalSettings): (keyof ClientPortalSections)[] {
  return (Object.keys(settings.sections) as (keyof ClientPortalSections)[])
    .filter(key => !settings.sections[key]);
}

/**
 * Section display names for UI
 */
export const SECTION_DISPLAY_NAMES: Record<keyof ClientPortalSections, string> = {
  family: 'Family',
  socialSecurity: 'Social Security',
  estate: 'Estate Planning',
  taxPlanning: 'Tax Planning',
  philanthropy: 'Philanthropy',
  documents: 'Documents',
  messages: 'Messages',
  portfolio: 'Portfolio',
  goals: 'Goals',
};
