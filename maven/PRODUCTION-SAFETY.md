# PRODUCTION SAFETY PROTOCOL

## IMMEDIATE DEPLOYMENTS SAFETY

### Pre-Deploy Checklist
- [ ] All API routes tested locally with demo auth
- [ ] Build passes with no TypeScript errors  
- [ ] Middleware changes tested with actual HTTP calls
- [ ] Demo password authentication verified

### Post-Deploy Verification (MANDATORY)
```bash
# Test sequence after EVERY deployment
curl -s -X POST https://mavenwealth.ai/api/gate -H "Content-Type: application/json" -d '{"password":"MavenAlpha1"}' -c test.txt
curl -s https://mavenwealth.ai/api/user/profile -b test.txt
curl -s https://mavenwealth.ai/api/market-data
```

Expected: All should return JSON (not "Redirecting..." or HTML)

### Rollback Procedure
If ANY API returns "Redirecting..." or HTML:
1. Immediately revert to last working deployment URL
2. Update DNS/CDN to point to working deployment  
3. Alert team of production failure

## MONITORING & ALERTING

### Health Check Endpoints
- `/api/health` - System status
- `/api/gate` - Authentication working
- `/api/user/profile` - Demo profile access
- `/api/market-data` - Data pipeline

### Automated Monitoring
- Every 2 minutes: Health check all endpoints
- Alert if any endpoint returns HTML instead of JSON
- Alert if response time > 5 seconds
- Alert if any 5xx errors

### Uptime Monitoring
- External service (UptimeRobot/Pingdom)
- Multi-location checks
- SMS alerts to Sam immediately

## DEVELOPMENT WORKFLOW

### Staging Environment
- Pre-production testing environment
- Identical to production configuration
- Test ALL client-facing flows before production

### Demo Mode Testing
- Automated tests for demo authentication
- API integration tests with real HTTP calls
- Client presentation scenarios tested

## INFRASTRUCTURE

### CDN Management
- Vercel edge cache purging scripts
- Health check before DNS updates
- Backup domain for emergency access

### Deployment Pipeline
- Automatic rollback on health check failure
- Blue/green deployment pattern
- Canary releases for middleware changes

## BUSINESS CONTINUITY

### Client Demo Backup
- Secondary demo environment
- Offline demo capabilities
- Alternative presentation materials

### RIA Launch Protection  
- Pre-launch full system verification
- Client onboarding dry runs
- Backup systems for critical meetings

---

**CRITICAL RULE: No production deployment without successful demo auth test**