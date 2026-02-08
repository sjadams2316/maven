# Maven QA Checklist

Run this after every deploy or during heartbeats.

## Quick Smoke Test (5 min)
- [ ] Landing page loads, CTA works
- [ ] Demo mode activates correctly  
- [ ] Dashboard shows correct net worth (~$732k in demo)
- [ ] Oracle opens, responds, voice toggle visible
- [ ] At least 3 tools load without errors

## Data Consistency (10 min)
- [ ] Net worth matches across: Dashboard, Oracle context, Family page
- [ ] User name shows correctly (Alex Demo in demo mode)
- [ ] Holdings appear in: Portfolio Lab, Rebalance, Tax Harvesting
- [ ] Social Security data flows to: SS page, Monte Carlo, Retirement

## Mobile Check (5 min)
- [ ] Dashboard cards stack properly (2-col on mobile)
- [ ] Oracle modal is usable on mobile
- [ ] Tables scroll horizontally
- [ ] Text is readable (no tiny fonts)
- [ ] Buttons are tappable (not too small)

## Live Data Check
- [ ] Market indices loading (S&P 500, Nasdaq, Dow)
- [ ] Crypto prices loading (BTC, ETH, TAO)
- [ ] Fragility Index calculating (not null)

## Common Issues to Watch
- Hardcoded data that should be dynamic
- Icons that don't match meaning (❤️ for "expensive")
- Links that go nowhere
- Console errors
- Infinite loading states

## After Finding Issues
1. Fix immediately if < 5 min
2. Add to known-issues.md if bigger
3. Tell Sam what you found and fixed
