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
// PASSWORD GATE — Simple site-wide password protection
// ============================================================================
const SITE_PASSWORD = (process.env.SITE_PASSWORD || 'MavenAlpha1').trim();
const PASSWORD_COOKIE = 'maven_access';

function checkPasswordGate(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  const hasDemoParam = searchParams.get('demo') === 'true';
  const hasDemoCookie = request.cookies.get(PASSWORD_COOKIE)?.value === 'authenticated';
  const isDemoMode = hasDemoParam || hasDemoCookie;
  
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
                     pathname.startsWith('/api/') ||  // CRITICAL: Allow ALL API routes in demo mode
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

function addSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

// ============================================================================
// MIDDLEWARE — SIMPLIFIED FOR DEMO MODE
// ============================================================================
export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // **FIRST**: Check password gate (this prevents Clerk initialization conflicts)
  const gateResponse = checkPasswordGate(request);
  if (gateResponse) return addSecurityHeaders(gateResponse);
  
  // **Check if we're in password-authenticated demo mode**
  const hasDemoCookie = request.cookies.get(PASSWORD_COOKIE)?.value === 'authenticated';
  
  if (hasDemoCookie) {
    // **DEMO MODE**: Skip all Clerk authentication, just apply security headers
    console.log(`[DEMO MODE] Allowing access to ${pathname}`);
    return addSecurityHeaders(NextResponse.next());
  }
  
  // **PRODUCTION MODE**: Use Clerk authentication (when password gate is not used)
  // This code path only runs if someone accesses the site without the password gate
  return clerkMiddleware(async (auth, req) => {
    // For now, in demo mode, we don't need Clerk protection
    // This can be enabled later for production authentication
    return addSecurityHeaders(NextResponse.next());
  })(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};