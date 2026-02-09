# Maven Deployment Guide

## Automatic Deploys (Default)
Vercel automatically deploys when you push to `main` on GitHub.

**Check status:** https://vercel.com/sjadams2316-3721s-projects/dashboard/deployments

---

## Manual Deploy (Backup)

When GitHub is down or auto-deploys fail, use the direct Vercel CLI:

### Option 1: Deploy Script
```bash
cd maven
./scripts/deploy.sh --prod
```

### Option 2: Direct Vercel CLI
```bash
cd maven/apps/dashboard
vercel --prod --yes
```

---

## Troubleshooting

### All deploys showing "Error" after 2-3 seconds
**Cause:** GitHub outage preventing repo clone
**Fix:** Use manual deploy (above)

### 404 on new pages
**Cause:** Deploy hasn't completed or failed
**Fix:** 
1. Check https://vercel.com/sjadams2316-3721s-projects/dashboard/deployments
2. If failed, use manual deploy
3. Wait 2-3 min for build to complete

### Check GitHub Status
https://githubstatus.com — if degraded, use manual deploy

### Check Vercel Status  
https://vercel-status.com

---

## Deploy Verification

After deploying, verify with:
```bash
curl -s -o /dev/null -w "%{http_code}" https://mavenwealth.ai/[new-route]
```

Should return `200`. If `404`, deploy is still building or failed.

---

## For Eli/Pantheon Agents

Before announcing a feature as "shipped":
1. Commit and push to GitHub
2. Check if deploy succeeded (not just commit)
3. If GitHub is degraded, run `./scripts/deploy.sh --prod`
4. Verify the route returns 200
