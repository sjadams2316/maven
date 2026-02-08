import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  // Add protected routes here if needed
]);

// Marketing/public routes that signed-in users with data should skip
const isMarketingRoute = createRouteMatcher([
  '/',
  '/landing',
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId } = await auth();
  
  // If user is signed in and hitting the marketing page, redirect to dashboard
  // We check for a cookie that indicates onboarding is complete
  if (userId && isMarketingRoute(request)) {
    const onboardingComplete = request.cookies.get('maven_onboarded')?.value;
    
    if (onboardingComplete === 'true') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Protect routes that require auth
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Run for API routes EXCEPT voice APIs (transcribe/speak need to handle large files without middleware interference)
    '/(api(?!/transcribe|/speak)|trpc)(.*)',
  ],
};
