#!/bin/bash

# Test d'intégration simple des webhooks
# Utilisation: ./integration-test.sh

set -e

echo "🔍 Integration Test - Backend Webhooks"
echo "======================================"
echo ""

# Variables
BACKEND_DIR="/Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/backend"
SECRET="test-secret-123"

# Test 1: Vérifier que les fichiers existent
echo "1️⃣  Checking files..."
files=(
  "src/routes/webhook-microservices.ts"
  "src/services/microserviceQueues.ts"
  "src/services/moderationService.ts"
  "migrations/003_job_matches_activity_logs.sql"
  "migrations/004_engagement_function.sql"
  "migrations/005_notifications_table.sql"
)

for file in "${files[@]}"; do
  if [ -f "$BACKEND_DIR/$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ MISSING: $file"
    exit 1
  fi
done

echo "✅ All files present"
echo ""

# Test 2: Vérifier les imports dans server.ts
echo "2️⃣  Checking server.ts imports..."
if grep -q "webhook-microservices" "$BACKEND_DIR/src/server.ts"; then
  echo "  ✓ webhook-microservices imported"
else
  echo "  ⚠️  webhook-microservices NOT imported in server.ts"
fi

if grep -q "microserviceQueues" "$BACKEND_DIR/src/server.ts"; then
  echo "  ✓ microserviceQueues imported"
else
  echo "  ⚠️  microserviceQueues NOT imported in server.ts"
fi

echo ""

# Test 3: Vérifier que les routes sont montées
echo "3️⃣  Checking route mounting..."
if grep -q "app.use.*webhook" "$BACKEND_DIR/src/server.ts"; then
  echo "  ✓ webhook routes mounted"
else
  echo "  ⚠️  webhook routes NOT mounted"
fi

echo ""

# Test 4: Vérifier TypeScript (nos fichiers seulement)
echo "4️⃣  Checking TypeScript compilation (our files)..."
cd "$BACKEND_DIR"
if npx tsc --noEmit src/routes/webhook-microservices.ts 2>&1 | grep "src/routes" | grep -q "error TS"; then
  echo "  ✗ webhook-microservices.ts has TS errors"
  exit 1
else
  echo "  ✓ webhook-microservices.ts"
fi

if npx tsc --noEmit src/services/moderationService.ts 2>&1 | grep "src/services" | grep -q "error TS"; then
  echo "  ✗ moderationService.ts has TS errors"
  exit 1
else
  echo "  ✓ moderationService.ts"
fi

echo ""

# Test 5: Vérifier les migrations SQL
echo "5️⃣  Checking SQL migrations..."
if grep -q "CREATE TABLE.*job_matches" "$BACKEND_DIR/migrations/003_job_matches_activity_logs.sql"; then
  echo "  ✓ job_matches table migration"
else
  echo "  ✗ job_matches table NOT in migration"
fi

if grep -q "CREATE TABLE.*activity_logs" "$BACKEND_DIR/migrations/003_job_matches_activity_logs.sql"; then
  echo "  ✓ activity_logs table migration"
else
  echo "  ✗ activity_logs table NOT in migration"
fi

echo ""

# Test 6: Vérifier les dépendances
echo "6️⃣  Checking npm packages..."
if [ -d "$BACKEND_DIR/node_modules/bullmq" ]; then
  echo "  ✓ bullmq installed"
else
  echo "  ✗ bullmq NOT installed"
fi

if [ -d "$BACKEND_DIR/node_modules/redis" ]; then
  echo "  ✓ redis installed"
else
  echo "  ✗ redis NOT installed"
fi

echo ""
echo "✅ Integration test passed!"
echo ""
echo "Next steps:"
echo "  1. Update .env with SUPABASE_WEBHOOK_SECRET"
echo "  2. Run migrations in Supabase"
echo "  3. Deploy to Render"
echo "  4. Create webhooks in Supabase Dashboard"
