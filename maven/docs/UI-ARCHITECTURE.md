# Maven UI Architecture Guide

*Best practices for consistent, seamless user experience*

---

## Core Principle: Single Source of Truth

**Every piece of user data has ONE authoritative source.**

```
┌─────────────────────────────────────────────────────────────────┐
│                        UserProvider                              │
│  (React Context - wraps entire app)                             │
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Profile   │    │  Financials │    │   Actions   │         │
│  │   (state)   │────│  (computed) │    │  (methods)  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                                     │                  │
│         ▼                                     ▼                  │
│  ┌─────────────┐                    ┌─────────────────┐        │
│  │ localStorage│◄──sync──────────►  │    Database     │        │
│  │  (cache)    │                    │ (source of truth│        │
│  └─────────────┘                    │  when signed in)│        │
│                                     └─────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Rules for Components

### ✅ DO

```tsx
// CORRECT: Use the hook, get data from context
import { useUserProfile } from '@/providers/UserProvider';

function MyComponent() {
  const { profile, financials, updateProfile } = useUserProfile();
  
  // Use profile data
  return <div>Hello, {profile?.firstName}</div>;
}
```

### ❌ DON'T

```tsx
// WRONG: Reading directly from localStorage
function MyComponent() {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('maven_user_profile'); // ❌ NO!
    if (saved) setProfile(JSON.parse(saved));
  }, []);
}
```

```tsx
// WRONG: Fetching from API independently
function MyComponent() {
  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()); // ❌ NO!
  }, []);
}
```

---

## Data Flow Patterns

### 1. Reading Data

```tsx
// Always use the hook
const { profile, financials, isLoading } = useUserProfile();

// Show loading state while data loads
if (isLoading) return <Skeleton />;

// Handle missing data gracefully
if (!profile?.firstName) return <OnboardingPrompt />;
```

### 2. Writing Data

```tsx
const { updateProfile } = useUserProfile();

// Updates propagate to: state → localStorage → database (if signed in)
await updateProfile({ 
  firstName: 'Sam',
  riskTolerance: 'growth' 
});
```

### 3. Specialized Data (e.g., Social Security)

```tsx
// Use specialized hooks for modules
const { socialSecurity, updateSocialSecurity } = useSocialSecurity();

await updateSocialSecurity({
  benefitAt62: 1680,
  benefitAt70: 2976,
});
```

---

## Page Architecture

### Standard Page Template

```tsx
'use client';

import { useUserProfile, useOnboardingStatus } from '@/providers/UserProvider';
import Header from '@/components/Header';

export default function FeaturePage() {
  const { profile, financials, isLoading } = useUserProfile();
  const { isOnboarded } = useOnboardingStatus();

  // 1. Loading state
  if (isLoading) {
    return <PageSkeleton />;
  }

  // 2. Gate behind onboarding if needed
  if (!isOnboarded) {
    return <OnboardingGate />;
  }

  // 3. Render feature with guaranteed data
  return (
    <div>
      <Header />
      <main>
        {/* Feature content - profile is guaranteed to exist */}
      </main>
    </div>
  );
}
```

### Conditional Features

Some features require specific data (e.g., Social Security needs DOB):

```tsx
function SocialSecurityOptimizer() {
  const { profile } = useUserProfile();
  const { socialSecurity } = useSocialSecurity();

  // Check prerequisites
  const hasRequiredData = profile?.dateOfBirth && 
                          socialSecurity?.benefitAt62;

  if (!hasRequiredData) {
    return <SSDataCollector />;
  }

  return <SSAnalysis />;
}
```

---

## Component Communication

### Wrong: Props Drilling

```tsx
// ❌ Passing data through many levels
<App profile={profile}>
  <Dashboard profile={profile}>
    <Sidebar profile={profile}>
      <UserWidget profile={profile} /> // 4 levels deep!
    </Sidebar>
  </Dashboard>
</App>
```

### Right: Context Access

```tsx
// ✅ Each component reads what it needs
<App>
  <Dashboard>
    <Sidebar>
      <UserWidget /> // Uses useUserProfile() internally
    </Sidebar>
  </Dashboard>
</App>
```

---

## Feature Modules

When adding new features (like Social Security Optimizer):

### 1. Extend the Profile Type

```tsx
// In UserProvider.tsx
export interface UserProfile {
  // ... existing fields
  
  // New module
  socialSecurity?: SocialSecurityProfile;
}
```

### 2. Create Specialized Hook (if complex)

```tsx
export function useSocialSecurity() {
  const { profile, updateProfile } = useUserProfile();
  
  const updateSocialSecurity = async (updates) => {
    await updateProfile({
      socialSecurity: { ...profile?.socialSecurity, ...updates }
    });
  };
  
  return {
    socialSecurity: profile?.socialSecurity,
    updateSocialSecurity,
  };
}
```

### 3. Feature Reads from Context

```tsx
function SSOptimizer() {
  const { socialSecurity, updateSocialSecurity } = useSocialSecurity();
  const { profile } = useUserProfile(); // For general data like state, filingStatus
  
  // All data flows from the same source
}
```

---

## Persistence Strategy

| State Type | Storage | When |
|------------|---------|------|
| User profile | Database + localStorage | Always sync both |
| Session state | React state only | Tabs, modals, filters |
| Cached API data | React Query / SWR | Market data, quotes |
| Form drafts | localStorage only | Unsaved work |

### Why Both Database AND localStorage?

1. **Database**: Source of truth, survives device changes
2. **localStorage**: Fast reads, offline support, chat context

The UserProvider handles syncing automatically.

---

## Checklist for New Features

Before shipping any new feature:

- [ ] Does it read user data from `useUserProfile()`?
- [ ] Does it write through `updateProfile()` or specialized hook?
- [ ] Does it handle loading states?
- [ ] Does it gate behind onboarding if needed?
- [ ] Are new profile fields added to the TypeScript interface?
- [ ] Does it work for signed-in AND guest users?
- [ ] Is the UI consistent with other pages (Header, colors, spacing)?

---

## Common Mistakes to Avoid

1. **Creating new localStorage keys** — All user data goes through UserProvider
2. **Fetching /api/user/profile directly** — Use the hook
3. **Assuming data exists** — Always handle loading/missing states
4. **Duplicating state** — One source of truth, multiple readers
5. **Separate data per page** — The same profile should appear everywhere

---

## Future: When Adding Plaid/Real Accounts

The architecture supports this naturally:

```tsx
// UserProvider will fetch from database
// Database will include both manual AND Plaid accounts
// Components don't need to change

const { financials } = useUserProfile();
// financials.allHoldings includes manual + Plaid holdings
```

---

*This guide ensures Maven feels like ONE product, not a collection of tools.*
