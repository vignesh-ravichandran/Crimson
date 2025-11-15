#!/bin/bash

# Start Development Environment for Crimson Club
# This script starts PostgreSQL with Docker and guides you through starting the app

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔥 Crimson Club - Development Startup${NC}"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check if .env files exist
if [ ! -f "api/.env" ] || [ ! -f "web/.env" ]; then
    echo -e "${YELLOW}⚠️  Environment files not found. Running setup...${NC}"
    bash setup-env.sh
    echo ""
    echo -e "${YELLOW}⚠️  Please edit the .env files to add your Google OAuth credentials${NC}"
    echo -e "${YELLOW}   Then run this script again.${NC}"
    exit 0
fi

# Start PostgreSQL with Docker Compose
echo "🐘 Starting PostgreSQL with Docker..."
docker-compose up -d postgres

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is ready
if docker-compose exec -T postgres pg_isready -U crimson > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${YELLOW}⏳ Still waiting for PostgreSQL...${NC}"
    sleep 5
fi

echo ""
echo -e "${BLUE}📦 Setup Instructions:${NC}"
echo ""
echo "The database is running! Now open 3 terminal windows:"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend Setup & Start:${NC}"
echo "  cd api"
echo "  npm install"
echo "  npm run migrate"
echo "  npm run seed"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend Setup & Start:${NC}"
echo "  cd web"
echo "  npm install"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Terminal 3 - Database GUI (Optional):${NC}"
echo "  cd api"
echo "  npm run studio"
echo ""
echo -e "${GREEN}Then open: http://localhost:5173${NC}"
echo ""
echo -e "${BLUE}To stop PostgreSQL:${NC}"
echo "  docker-compose down"
echo ""

