#!/bin/bash

# Vercel Deployment Script for Crimson Club Frontend
# Usage: ./scripts/deploy-vercel.sh

set -e

echo "🚀 Deploying Crimson Club to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to web directory
cd web

# Check for environment variables
if ! vercel env ls production &> /dev/null; then
    echo "⚠️  Environment variables not set. Please run:"
    echo ""
    echo "  vercel env add VITE_API_URL production"
    echo "  vercel env add VITE_GOOGLE_CLIENT_ID production"
    echo ""
    read -p "Press Enter when environment variables are set, or Ctrl+C to exit..."
fi

# Deploy to production
echo "📦 Building and deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Copy your Vercel URL from above"
echo "  2. Update FRONTEND_URL in Render with this URL"
echo "  3. Update Google OAuth redirect URIs"
echo ""

