#!/bin/bash

# POST-DEPLOYMENT VERIFICATION
# Run this after EVERY deployment to ensure production works

set -e

DOMAIN="https://mavenwealth.ai"
PASSWORD="MavenAlpha1"

echo "🚀 Post-Deployment Verification - $(date)"

# Wait for deployment to propagate
echo "⏳ Waiting 30 seconds for CDN propagation..."
sleep 30

# Run full health check
echo "🔍 Running comprehensive health check..."

# Test complete demo flow
echo "Testing complete demo authentication flow..."

# Step 1: Password gate
GATE_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$DOMAIN/api/gate" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$PASSWORD\"}" \
  -c /tmp/verify-cookies.txt)

HTTP_CODE=${GATE_RESPONSE: -3}
RESPONSE_BODY=${GATE_RESPONSE%???}

if [ "$HTTP_CODE" != "200" ] || [[ "$RESPONSE_BODY" != *'"ok":true'* ]]; then
  echo "❌ DEPLOYMENT FAILED: Password gate broken"
  echo "HTTP Code: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
  exit 1
fi

# Step 2: Demo API access
PROFILE_RESPONSE=$(curl -s -w "%{http_code}" "$DOMAIN/api/user/profile" \
  -b /tmp/verify-cookies.txt)

PROFILE_HTTP_CODE=${PROFILE_RESPONSE: -3}
PROFILE_BODY=${PROFILE_RESPONSE%???}

if [ "$PROFILE_HTTP_CODE" != "200" ] || [[ "$PROFILE_BODY" == *"Redirecting"* ]] || [[ "$PROFILE_BODY" == *"<html"* ]]; then
  echo "❌ DEPLOYMENT FAILED: Demo API still broken"
  echo "HTTP Code: $PROFILE_HTTP_CODE"
  echo "Response: $PROFILE_BODY"
  exit 1
fi

# Step 3: Market data
MARKET_RESPONSE=$(curl -s -w "%{http_code}" "$DOMAIN/api/market-data")

MARKET_HTTP_CODE=${MARKET_RESPONSE: -3}
MARKET_BODY=${MARKET_RESPONSE%???}

if [ "$MARKET_HTTP_CODE" != "200" ] || [[ "$MARKET_BODY" == *"Redirecting"* ]]; then
  echo "❌ DEPLOYMENT FAILED: Market data API broken"
  echo "HTTP Code: $MARKET_HTTP_CODE"
  echo "Response: $MARKET_BODY"
  exit 1
fi

# Step 4: Test advisor dashboard
ADVISOR_RESPONSE=$(curl -s -w "%{http_code}" "$DOMAIN/advisor" -b /tmp/verify-cookies.txt)

ADVISOR_HTTP_CODE=${ADVISOR_RESPONSE: -3}

if [ "$ADVISOR_HTTP_CODE" != "200" ]; then
  echo "❌ DEPLOYMENT FAILED: Advisor dashboard inaccessible"
  echo "HTTP Code: $ADVISOR_HTTP_CODE"
  exit 1
fi

echo "✅ ALL TESTS PASSED - Deployment verified successfully!"
echo "🎉 Production is healthy and ready for client demos"

# Cleanup
rm -f /tmp/verify-cookies.txt

# Log success
echo "$(date): Deployment verification PASSED" >> /tmp/maven-deploy.log