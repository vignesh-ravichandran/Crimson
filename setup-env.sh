#!/bin/bash

# Setup Environment Variables for Development
# Run this script to create .env files for both backend and frontend

set -e

echo "🔧 Setting up Crimson Club environment variables..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env files already exist
if [ -f "api/.env" ]; then
    echo -e "${YELLOW}⚠️  api/.env already exists. Skipping...${NC}"
else
    echo "📝 Creating api/.env..."
    cat > api/.env << 'EOF'
# Backend Environment Variables
# DO NOT COMMIT THIS FILE TO GIT

# Database
DATABASE_URL="postgresql://crimson:crimson_dev_password@localhost:5433/crimson_club"

# JWT Secret (generate a secure one for production!)
JWT_SECRET="dev_secret_key_change_in_production_32chars"

# Google OAuth (you need to add your own credentials)
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_HERE"

# Server Configuration
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=1000
EOF
    echo -e "${GREEN}✅ Created api/.env${NC}"
fi

if [ -f "web/.env" ]; then
    echo -e "${YELLOW}⚠️  web/.env already exists. Skipping...${NC}"
else
    echo "📝 Creating web/.env..."
    cat > web/.env << 'EOF'
# Frontend Environment Variables
# DO NOT COMMIT THIS FILE TO GIT

# Google OAuth Client ID (same as backend)
VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"

# API Base URL
VITE_API_URL="http://localhost:3000/api"
EOF
    echo -e "${GREEN}✅ Created web/.env${NC}"
fi

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: You need to add your Google OAuth credentials!${NC}"
echo ""
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable Google+ API"
echo "4. Create OAuth 2.0 credentials (Web application)"
echo "5. Add authorized redirect URIs:"
echo "   - http://localhost:5173"
echo "6. Copy the Client ID and Client Secret"
echo "7. Replace YOUR_GOOGLE_CLIENT_ID_HERE in both .env files"
echo "8. Replace YOUR_GOOGLE_CLIENT_SECRET_HERE in api/.env"
echo ""
echo -e "${GREEN}✅ Environment setup complete!${NC}"

