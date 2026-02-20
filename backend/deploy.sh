#!/bin/bash

# Deploy script for Backend Webhooks
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-staging}

echo "🚀 Deploying Backend - Production - $ENVIRONMENT"
echo "============================================="
echo ""

# Step 1: Check if .env exists
echo "1️⃣  Checking environment..."
if [ ! -f .env ]; then
  echo "❌ .env not found! Copy .env.example and fill in your values"
  exit 1
fi

# Verify required variables

# Only verify essential variables for production
required_vars=(
  "DATABASE_URL"
  "PORT"
  "JWT_SECRET"
)

for var in "${required_vars[@]}"; do
  if ! grep -q "^$var=" .env; then
    echo "❌ Missing $var in .env"
    exit 1
  fi
done

echo "✓ Environment variables configured"
echo ""

# Step 2: Install dependencies
echo "2️⃣  Installing dependencies..."
npm install --omit=dev
echo "✓ Dependencies installed"
echo ""

# Step 3: Run tests
echo "3️⃣  Running integration tests..."
./integration-test.sh
echo ""

# Step 4: Build
echo "4️⃣  Building project..."
npm run build
echo "✓ Build successful"
echo ""

# Step 5: Summary
echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "  1. Execute DB migrations (apply SQL files in /backend/src/migrations as needed)"
echo ""
echo "  2. Create webhooks/endpoints in your hosting provider or API gateway as required:" 
echo "     - POST https://your-backend.onrender.com/api/jobs/analyze"
echo "     - POST https://your-backend.onrender.com/api/posts/moderate"
echo "     - POST https://your-backend.onrender.com/api/activity/score"
echo ""
echo "  3. Push to Render:"
echo "     git add ."
echo "     git commit -m 'feat: Backend webhooks microservices'"
echo "     git push origin main"
echo ""
echo "  4. Verify deployment:"
echo "     curl https://your-backend.onrender.com/api/health/webhooks"
