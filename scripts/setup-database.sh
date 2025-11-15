#!/bin/bash

# Database Setup Script for Supabase
# Usage: ./scripts/setup-database.sh

set -e

echo "🗄️  Setting up Crimson Club Database..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set!"
    echo ""
    echo "Please set your Supabase connection string:"
    echo "  export DATABASE_URL='postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres'"
    echo ""
    exit 1
fi

# Navigate to api directory
cd api

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🚀 Running database migrations..."
npx prisma migrate deploy

# Ask if user wants to seed data
echo ""
read -p "Would you like to seed sample data? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    npm run seed
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🔍 Verify in Supabase:"
echo "   Dashboard > Table Editor > Should see tables"
echo ""

