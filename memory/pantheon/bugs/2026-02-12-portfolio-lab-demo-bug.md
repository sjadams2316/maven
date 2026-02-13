# BUG: Portfolio Lab Demo Mode — $0 Display

**Discovered:** 2026-02-12 (from Pantheon QA)
**Severity:** HIGH (user-facing, demo credibility)
**Priority:** HIGH
**Status:** FIXED ✅

## Symptom
Demo users navigate to `/portfolio-lab` — all values show $0 instead of the $800K sample portfolio.

## Root Cause
`/api/user/profile` returns 401 error for demo users. The API requires Clerk authentication, but demo users are authenticated via cookie only (not Clerk).

## Fix Applied
Added demo mode detection to `/api/user/profile/route.ts`:
1. GET: Returns `DEMO_PROFILE` directly if demo mode enabled
2. POST: Returns 403 (demo mode is read-only)

## Verification
Deploy to Vercel, test demo mode flow:
1. Click "Try Demo" on login page
2. Navigate to `/portfolio-lab`
3. Verify holdings display correctly with real values
