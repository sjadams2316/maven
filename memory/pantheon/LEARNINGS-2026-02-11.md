# Learnings — 2026-02-11

## Bug-Driven Learnings

### L011: Never ship a link without its destination page
**Trigger:** Messages 404 in client portal
**Pattern:** Navigation links that lead nowhere
**Check:** Before deploy, click EVERY nav link in dev

### L012: ALL internal links must use `demoHref()` in demo-aware pages
**Trigger:** Demo mode lost when clicking internal links
**Pattern:** Links that don't preserve query params
**Check:** Grep for `href=` in demo pages, verify all use helper

### L013: Use `usePathname()` not `useState` for URL tracking
**Trigger:** Race condition flicker on Partners page
**Pattern:** useState init from window.location before hydration
**Check:** Never use useState for URL-derived values

### L014: Search for placeholder/old brand names before release
**Trigger:** "Adams Wealth" instead of "Maven Partners"
**Pattern:** Find/replace that missed instances
**Check:** `git grep` for old brand names before deploy

### L015: Update hardcoded fallback data when market prices shift
**Trigger:** Stale BTC price ($67,250 vs $97K actual)
**Pattern:** Fallback data gets stale over time
**Check:** Monthly review of FALLBACK_PRICES constants

### L016: Data shown to users must NEVER be more than 1 hour stale
**Trigger:** Sam saw stale market data
**Pattern:** Cache not refreshing, relying on fallbacks
**Check:** Health endpoint monitors freshness, alerts if >1hr

### L017: Display actual ticker symbols, not index names
**Trigger:** Landing page showed "S&P 500" instead of "SPY"
**Pattern:** Inconsistent naming between pages
**Check:** Market data should show what users can trade (SPY not S&P 500)

### L018: Test ALL pages where market data appears
**Trigger:** QA only checked demo page, missed landing page
**Pattern:** Different pages have different implementations
**Check:** Include landing page, dashboard, demo in market data QA rotation

### L019: Never use `timestamp === Date.now()` for freshness checks
**Trigger:** Cache never updated because Date.now() was called at different moments
**Pattern:** `price.timestamp === Date.now()` in conditional, but both calls return different values
**Check:** Use explicit flags (`freshlyFetched = true`) instead of timestamp comparison

### L020: Health checks must only monitor actively-fetched symbols
**Trigger:** Legacy ETF symbols (SPY, QQQ) in cache made health check appear stale
**Pattern:** Cache has old entries from previous code versions
**Check:** Explicitly list symbols to monitor, don't rely on "all keys in cache"

---

## Pattern Summary

| ID | Pattern | One-Line Check |
|----|---------|----------------|
| L011 | Missing pages | Click every nav link |
| L012 | Lost query params | All demo links use `demoHref()` |
| L013 | Hydration race | No `useState` from URL |
| L014 | Old branding | `git grep` old names |
| L015 | Stale fallbacks | Monthly fallback review |
| L016 | Stale data | Health endpoint freshness |
| L017 | Index vs ticker | Show tradeable symbols |
| L018 | Page coverage | Test ALL market data pages |
