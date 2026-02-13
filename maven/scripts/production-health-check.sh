#!/bin/bash

# PRODUCTION HEALTH CHECK - Run every 2 minutes
# Alerts if Maven API endpoints are broken

set -e

DOMAIN="https://mavenwealth.ai"
PASSWORD="MavenAlpha1"
ALERT_PHONE="+1234567890"  # Sam's phone for SMS alerts

echo "🔍 Maven Production Health Check - $(date)"

# Test 1: Password gate
echo "Testing password gate..."
GATE_RESPONSE=$(curl -s -X POST "$DOMAIN/api/gate" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$PASSWORD\"}" \
  -c /tmp/health-cookies.txt)

if [[ "$GATE_RESPONSE" != *'"ok":true'* ]]; then
  echo "❌ CRITICAL: Password gate broken - $GATE_RESPONSE"
  # Send SMS alert here
  exit 1
fi

echo "✅ Password gate working"

# Test 2: Demo profile API
echo "Testing demo profile API..."
PROFILE_RESPONSE=$(curl -s "$DOMAIN/api/user/profile" \
  -b /tmp/health-cookies.txt)

if [[ "$PROFILE_RESPONSE" == *"Redirecting"* ]] || [[ "$PROFILE_RESPONSE" == *"<html"* ]]; then
  echo "❌ CRITICAL: Demo API returning HTML/redirects - $PROFILE_RESPONSE"
  # Send SMS alert here
  exit 1
fi

echo "✅ Demo profile API working"

# Test 3: Market data
echo "Testing market data API..."
MARKET_RESPONSE=$(curl -s "$DOMAIN/api/market-data")

if [[ "$MARKET_RESPONSE" == *"Redirecting"* ]] || [[ "$MARKET_RESPONSE" == *"<html"* ]]; then
  echo "❌ CRITICAL: Market data API broken - $MARKET_RESPONSE"
  # Send SMS alert here
  exit 1
fi

echo "✅ Market data API working"

# Test 4: Health endpoint
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$DOMAIN/api/health")

if [[ "$HEALTH_RESPONSE" == *"Redirecting"* ]] || [[ "$HEALTH_RESPONSE" == *"<html"* ]]; then
  echo "❌ CRITICAL: Health API broken - $HEALTH_RESPONSE"
  # Send SMS alert here
  exit 1
fi

echo "✅ Health endpoint working"

echo "🎉 ALL SYSTEMS HEALTHY - $(date)"

# Cleanup
rm -f /tmp/health-cookies.txt