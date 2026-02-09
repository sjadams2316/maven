#!/bin/bash
# Maven Deploy Script - Bypasses GitHub, deploys directly to Vercel
# Usage: ./scripts/deploy.sh [--prod]

set -e

cd "$(dirname "$0")/../apps/dashboard"

echo "🚀 Maven Deploy Script"
echo "======================"

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Check for --prod flag
if [ "$1" == "--prod" ]; then
    echo "📦 Deploying to PRODUCTION..."
    vercel --prod --yes
else
    echo "📦 Deploying to preview..."
    echo "   (Use --prod for production deploy)"
    vercel --yes
fi

echo ""
echo "✅ Deploy complete!"
echo ""
echo "🔗 Check status at: https://vercel.com/sjadams2316-3721s-projects/dashboard/deployments"
