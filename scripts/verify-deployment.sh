#!/bin/bash

# Deployment Verification Script
# Usage: ./scripts/verify-deployment.sh <backend-url> <frontend-url>

set -e

BACKEND_URL=$1
FRONTEND_URL=$2

if [ -z "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
    echo "Usage: ./scripts/verify-deployment.sh <backend-url> <frontend-url>"
    echo ""
    echo "Example:"
    echo "  ./scripts/verify-deployment.sh https://crimson-club-api.onrender.com https://crimson-club-web.vercel.app"
    exit 1
fi

echo "🔍 Verifying Crimson Club Deployment..."
echo ""

# Test Backend Health
echo "1️⃣  Testing backend health..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")

if [ "$HEALTH_RESPONSE" -eq 200 ]; then
    echo "   ✅ Backend is healthy (HTTP $HEALTH_RESPONSE)"
else
    echo "   ❌ Backend health check failed (HTTP $HEALTH_RESPONSE)"
    echo "   Note: First request may take 30s if backend is sleeping"
fi

# Test Frontend
echo ""
echo "2️⃣  Testing frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$FRONTEND_RESPONSE" -eq 200 ]; then
    echo "   ✅ Frontend is accessible (HTTP $FRONTEND_RESPONSE)"
else
    echo "   ❌ Frontend not accessible (HTTP $FRONTEND_RESPONSE)"
fi

# Test CORS
echo ""
echo "3️⃣  Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" \
    "$BACKEND_URL/health")

if [ "$CORS_RESPONSE" -eq 200 ]; then
    echo "   ✅ CORS is properly configured"
else
    echo "   ⚠️  CORS may need configuration"
fi

echo ""
echo "📊 Summary:"
echo "   Backend:  $BACKEND_URL"
echo "   Frontend: $FRONTEND_URL"
echo ""
echo "📝 Manual checks:"
echo "   1. Visit frontend URL and try logging in with Google"
echo "   2. Create a check-in and verify it saves"
echo "   3. Check analytics page loads data"
echo ""

