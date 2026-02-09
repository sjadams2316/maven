# Pantheon Patterns — Lessons Learned

*Common fixes and patterns that agents keep rediscovering. Read this before building.*

---

## TypeScript Patterns

### InsightCard Types
The `InsightCard` component only accepts these `type` values:
```typescript
type: 'tax' | 'rebalance' | 'opportunity' | 'risk' | 'milestone'
```
❌ Don't use: `'info'`, `'warning'`, `'alert'`
✅ Map to closest valid type (info → opportunity, warning → risk)

### Array Type Inference
When declaring empty arrays, always type them:
```typescript
// ❌ Bad — TypeScript can't infer
let items = [];

// ✅ Good
let items: MyType[] = [];
```

### Optional Chaining for API Data
Always use optional chaining when accessing API response data:
```typescript
// ❌ Bad — will crash if data is undefined
const price = data.chart.result[0].meta.regularMarketPrice;

// ✅ Good
const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice || 0;
```

---

## Component Patterns

### Adding to Portfolio Lab Tabs
Portfolio Lab uses a tab system. To add a new section to the Analysis tab:

1. Create component in `apps/dashboard/src/app/components/`
2. Import in `portfolio-lab/page.tsx`
3. Add to the Analysis tab content (after existing sections)
4. Follow the existing card styling pattern

### Demo Page Data
The demo page (`demo/page.tsx`) uses:
- `DEMO_PROFILE` — user info, accounts
- `DEMO_HOLDINGS` — array of holdings with ticker, shares, value
- `DEMO_INSIGHTS` — array of insight objects

When adding features, check if demo data exists or needs extending.

### InsightCard with Learn More
To add educational tooltips to insights:
```typescript
{
  type: 'tax' as const,
  title: 'Your Title',
  description: 'Main description',
  learnMoreText: 'Expanded explanation shown on ? click',
  actionHref: '/destination',
}
```

---

## API Patterns

### CORS Issues
Yahoo Finance and some APIs block browser requests. Solutions:
1. Create API route in `app/api/` for server-side fetching
2. Use APIs that support CORS (CoinGecko does, Yahoo doesn't)

### Price Validation
Always validate prices before displaying:
- Stocks: $0.01 - $10,000
- Crypto: $0.0001 - $1,000,000
- Use fallback/cached values for invalid data

---

## Build Patterns

### Running Builds
```bash
cd maven/apps/dashboard && npm run build 2>&1 | tail -30
```

### Common Build Fixes
1. **Type errors** — Check the line number, usually missing type annotation
2. **Import errors** — Verify the export exists in source file
3. **Module not found** — Check file path, case sensitivity matters

### After Making Changes
Always run build before committing. Don't commit broken code.

---

## Git Patterns

### Commit Messages
Follow conventional commits:
- `feat(scope): description` — new feature
- `fix(scope): description` — bug fix
- `docs(scope): description` — documentation only

### Before Committing
```bash
git add -A && git status  # Review what's staged
npm run build             # Ensure it builds
git commit -m "..."       # Commit with good message
```

---

## Task Scoping

### Ideal Task Size
- **Good:** Single component, single feature, <200 lines changed
- **Too big:** Multiple components, cross-cutting changes, >500 lines
- **Break down:** "Add retiree demo" → "Add demo selector UI" + "Add retiree profile data" + "Add retiree insights"

### Dependencies
Before starting, identify:
1. What files will I touch?
2. What existing code do I need to understand?
3. Are there parallel agents that might conflict?

---

*Add new patterns as you discover them. This file saves future agents hours of debugging.*
