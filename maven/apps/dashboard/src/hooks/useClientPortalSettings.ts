'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  ClientPortalSettings, 
  ClientPortalSections 
} from '@/lib/client-portal-settings';

// ============================================
// TYPES
// ============================================

export interface UseClientPortalSettingsResult {
  settings: ClientPortalSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Convenience helpers
  isSectionEnabled: (section: keyof ClientPortalSections) => boolean;
  getEnabledSections: () => (keyof ClientPortalSections)[];
  isPathAllowed: (path: string) => boolean;
  
  // Refetch
  refetch: () => Promise<void>;
}

// ============================================
// CACHE
// ============================================

// Simple in-memory cache to avoid refetching on navigation
const settingsCache: Record<string, {
  settings: ClientPortalSettings;
  fetchedAt: number;
}> = {};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedSettings(code: string): ClientPortalSettings | null {
  const cached = settingsCache[code];
  if (!cached) return null;
  
  const age = Date.now() - cached.fetchedAt;
  if (age > CACHE_TTL_MS) {
    delete settingsCache[code];
    return null;
  }
  
  return cached.settings;
}

function setCachedSettings(code: string, settings: ClientPortalSettings): void {
  settingsCache[code] = {
    settings,
    fetchedAt: Date.now(),
  };
}

// ============================================
// SECTION PATH MAPPING
// ============================================

const SECTION_PATH_MAP: Record<keyof ClientPortalSections, string> = {
  family: '/family',
  socialSecurity: '/social-security',
  estate: '/estate',
  taxPlanning: '/tax',
  philanthropy: '/philanthropy',
  documents: '/documents',
  messages: '/messages',
  portfolio: '/portfolio',
  goals: '/goals',
  explore: '/explore',
};

function getSectionFromPath(path: string): keyof ClientPortalSections | null {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  
  for (const [section, sectionPath] of Object.entries(SECTION_PATH_MAP)) {
    if (normalized === sectionPath || normalized.startsWith(`${sectionPath}/`)) {
      return section as keyof ClientPortalSections;
    }
  }
  
  return null;
}

// ============================================
// HOOK
// ============================================

/**
 * Hook to fetch and manage client portal settings
 * 
 * Usage:
 * ```tsx
 * const { settings, isLoading, isSectionEnabled } = useClientPortalSettings(code);
 * 
 * // Filter nav items
 * const visibleItems = navItems.filter(item => 
 *   isSectionEnabled(item.sectionKey)
 * );
 * 
 * // Check if path is allowed
 * if (!isPathAllowed('/social-security')) {
 *   router.push(`/c/${code}`); // Redirect to home
 * }
 * ```
 */
export function useClientPortalSettings(code: string): UseClientPortalSettingsResult {
  const [settings, setSettings] = useState<ClientPortalSettings | null>(() => {
    // Initialize from cache if available
    return getCachedSettings(code);
  });
  const [isLoading, setIsLoading] = useState(!getCachedSettings(code));
  const [error, setError] = useState<string | null>(null);
  
  const fetchSettings = useCallback(async () => {
    if (!code) {
      setError('No portal code provided');
      setIsLoading(false);
      return;
    }
    
    // Check cache first
    const cached = getCachedSettings(code);
    if (cached) {
      setSettings(cached);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/client-portal/${code}/settings`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load portal settings');
      }
      
      const data = await response.json();
      
      // Cache the settings
      setCachedSettings(code, data.settings);
      setSettings(data.settings);
    } catch (err) {
      console.error('useClientPortalSettings error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [code]);
  
  // Fetch on mount and when code changes
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  // Convenience method: Check if a section is enabled
  const isSectionEnabled = useCallback((section: keyof ClientPortalSections): boolean => {
    if (!settings) return true; // Default to showing while loading
    return settings.sections[section] ?? false;
  }, [settings]);
  
  // Convenience method: Get list of enabled sections
  const getEnabledSections = useCallback((): (keyof ClientPortalSections)[] => {
    if (!settings) return [];
    return (Object.keys(settings.sections) as (keyof ClientPortalSections)[])
      .filter(key => settings.sections[key]);
  }, [settings]);
  
  // Convenience method: Check if a path is allowed
  const isPathAllowed = useCallback((path: string): boolean => {
    if (!settings) return true; // Default to allowing while loading
    
    const section = getSectionFromPath(path);
    
    // Home path and unknown paths are always allowed
    if (!section) return true;
    
    return isSectionEnabled(section);
  }, [settings, isSectionEnabled]);
  
  // Refetch method
  const refetch = useCallback(async () => {
    // Clear cache to force refetch
    delete settingsCache[code];
    await fetchSettings();
  }, [code, fetchSettings]);
  
  return useMemo(() => ({
    settings,
    isLoading,
    error,
    isSectionEnabled,
    getEnabledSections,
    isPathAllowed,
    refetch,
  }), [settings, isLoading, error, isSectionEnabled, getEnabledSections, isPathAllowed, refetch]);
}

/**
 * Hook for advisor preview mode
 * Shows which sections are hidden for this client
 */
export function useAdvisorPreviewInfo(code: string) {
  const { settings, isLoading } = useClientPortalSettings(code);
  
  const hiddenSections = useMemo(() => {
    if (!settings) return [];
    
    return (Object.keys(settings.sections) as (keyof ClientPortalSections)[])
      .filter(key => !settings.sections[key]);
  }, [settings]);
  
  const hiddenFeatures = useMemo(() => {
    if (!settings) return [];
    
    const features: string[] = [];
    if (!settings.showNetWorth) features.push('Net Worth');
    if (!settings.showPerformance) features.push('Performance');
    if (!settings.showProjections) features.push('Projections');
    if (!settings.weeklyCommentary) features.push('Weekly Commentary');
    if (!settings.marketUpdates) features.push('Market Updates');
    
    return features;
  }, [settings]);
  
  return {
    settings,
    isLoading,
    hiddenSections,
    hiddenFeatures,
    hasHiddenContent: hiddenSections.length > 0 || hiddenFeatures.length > 0,
  };
}
