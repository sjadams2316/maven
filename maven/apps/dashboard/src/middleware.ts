import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// SECURITY HEADERS
// ============================================================================
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
};

// ============================================================================
// RATE LIMITING (Simple in-memory for demo - use Redis in production)
// ============================================================================
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (resets on server restart)
// For production: use Redis, Upstash, or Vercel KV
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configs per route type
const RATE_LIMITS = {
  // AI chat is expensive - limit to 30 requests per minute
  chat: { requests: 30, windowMs: 60 * 1000 },
  // Stock quotes - more generous, 100 per minute
  quotes: { requests: 100, windowMs: 60 * 1000 },
  // Monte Carlo simulations are CPU-intensive - 20 per minute
  compute: { requests: 20, windowMs: 60 * 1000 },
  // Default for other API routes
  default: { requests: 60, windowMs: 60 * 1000 },
};

function getRateLimitKey(request: NextRequest): string {
  // Use IP for anonymous users, or combine with a more unique identifier
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';
  const pathname = request.nextUrl.pathname;
  return `${ip}:${pathname}`;
}

function getRateLimitConfig(pathname: string): { requests: number; windowMs: number } {
  if (pathname.startsWith('/api/chat')) return RATE_LIMITS.chat;
  if (pathname.startsWith('/api/stock-quote') || pathname.startsWith('/api/crypto-quote')) return RATE_LIMITS.quotes;
  if (pathname.startsWith('/api/monte-carlo') || pathname.startsWith('/api/fragility')) return RATE_LIMITS.compute;
  return RATE_LIMITS.default;
}

function checkRateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetIn: number } {
  const key = getRateLimitKey(request);
  const config = getRateLimitConfig(request.nextUrl.pathname);
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Clean up expired entries periodically (simple garbage collection)
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore) {
      if (v.resetTime < now) rateLimitStore.delete(k);
    }
  }
  
  // Reset if window has passed
  if (!entry || entry.resetTime < now) {
    entry = { count: 0, resetTime: now + config.windowMs };
    rateLimitStore.set(key, entry);
  }
  
  entry.count++;
  const allowed = entry.count <= config.requests;
  const remaining = Math.max(0, config.requests - entry.count);
  const resetIn = Math.ceil((entry.resetTime - now) / 1000);
  
  return { allowed, remaining, resetIn };
}

// ============================================================================
// ROUTE MATCHERS
// ============================================================================

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  // Add protected routes here if needed
]);

// Marketing/public routes that signed-in users with data should skip
const isMarketingRoute = createRouteMatcher([
  '/',
  '/landing',
]);

// Voice API routes that should skip Clerk middleware entirely
const isVoiceAPIRoute = createRouteMatcher([
  '/api/transcribe',
  '/api/speak',
]);

// API routes that should be rate-limited
const isRateLimitedRoute = createRouteMatcher([
  '/api/chat',
  '/api/stock-quote',
  '/api/crypto-quote',
  '/api/monte-carlo',
  '/api/fragility-index',
  '/api/market-data',
  '/api/fund-profile',
  '/api/stock-search',
  '/api/stock-research',
  '/api/valuations',
]);

// ============================================================================
// MIDDLEWARE
// ============================================================================

function addSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

// ============================================================================
// PASSWORD GATE — Simple site-wide password protection
// ============================================================================
const SITE_PASSWORD = (process.env.SITE_PASSWORD || 'BanksNavy10').trim();
const PASSWORD_COOKIE = 'maven_access';

function checkPasswordGate(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  const isDemoMode = searchParams.get('demo') === 'true';
  
  // Allow the password page, its API, cron jobs, and static assets
  if (pathname === '/gate' || pathname === '/api/gate') return null;
  
  // Allow cron job endpoints (public market data only)
  if (pathname.startsWith('/api/cron/')) return null;
  
  // Allow demo mode for specific routes OR public demo routes that don't need ?demo=true
  const isDemoRoute = pathname.startsWith('/partners/dashboard') ||
                     pathname.startsWith('/partners/advisor-demo') ||
                     pathname.startsWith('/advisor') ||
                     pathname.startsWith('/demo') ||
                     pathname.startsWith('/tax-harvesting') ||
                     pathname.startsWith('/c/DEMO-') ||
                     pathname.startsWith('/dashboard') ||
                     pathname.startsWith('/oracle') ||
                     pathname.startsWith('/portfolio') ||
                     pathname.startsWith('/stock-research') ||
                     pathname === '/' ||
                     pathname === '/advisor-pro';

  const isPublicDemoRoute = pathname === '/advisor-pro' ||
                           pathname === '/partners/advisor-demo' ||
                           pathname.startsWith('/c/DEMO-');
                           
  if ((isDemoMode && isDemoRoute) || isPublicDemoRoute) {
    return null;
  }
  
  // Check for valid password cookie
  const accessCookie = request.cookies.get(PASSWORD_COOKIE)?.value;
  if (accessCookie === 'authenticated') return null;
  
  // Not authenticated — redirect to gate
  const gateUrl = new URL('/gate', request.url);
  gateUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(gateUrl);
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  
  // Password gate — blocks everything before any other logic
  const gateResponse = checkPasswordGate(request);
  if (gateResponse) return addSecurityHeaders(gateResponse);
  
  // Apply rate limiting to public API routes
  if (isRateLimitedRoute(request)) {
    const { allowed, remaining, resetIn } = checkRateLimit(request);
    
    if (!allowed) {
      const response = NextResponse.json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please slow down.',
        code: 'RATE_LIMITED',
        hint: `Try again in ${resetIn} seconds`,
        retryAfter: resetIn,
      }, { status: 429 });
      
      response.headers.set('Retry-After', String(resetIn));
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', String(resetIn));
      
      return addSecurityHeaders(response);
    }
    
    // Continue but add rate limit headers to response later
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(resetIn));
    return addSecurityHeaders(response);
  }
  
  // Skip Clerk processing for voice APIs - they handle file uploads and shouldn't go through auth
  if (isVoiceAPIRoute(request)) {
    return addSecurityHeaders(NextResponse.next());
  }
  
  const { userId } = await auth();
  
  // If user is signed in and hitting the marketing page, redirect to dashboard
  // We check for a cookie that indicates onboarding is complete
  if (userId && isMarketingRoute(request)) {
    const onboardingComplete = request.cookies.get('maven_onboarded')?.value;
    
    if (onboardingComplete === 'true') {
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
      return addSecurityHeaders(redirectResponse);
    }
  }
  
  // Protect routes that require auth
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
  
  return addSecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
