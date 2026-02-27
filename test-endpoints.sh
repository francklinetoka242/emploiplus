#!/bin/bash

# 🧪 Script de Test des Endpoints

BACKEND_URL="${1:-http://localhost:5000}"

echo "🧪 Test des endpoints de ${BACKEND_URL}"
echo ""

# Test 1: Health check
echo "1️⃣  Test stats (Health check)..."
curl -s -X GET "${BACKEND_URL}/api/stats" | jq . || echo "❌ Échec"
echo ""

# Test 2: Search
echo "2️⃣  Test recherche (jobs)..."
curl -s -X GET "${BACKEND_URL}/api/search/jobs?q=developer" | jq . || echo "❌ Échec"
echo ""

# Test 3: Formations
echo "3️⃣  Test formations..."
curl -s -X GET "${BACKEND_URL}/api/search/formations?q=react" | jq . || echo "❌ Échec"
echo ""

# Test 4: Protected endpoint (should fail without auth)
echo "4️⃣  Test endpoint protégé (doit retourner 401)..."
response=$(curl -s -w "\n%{http_code}" -X GET "${BACKEND_URL}/api/saved-jobs")
body=$(echo "$response" | head -n 1)
code=$(echo "$response" | tail -n 1)
echo "Status: $code"
echo "Body: $body"
echo ""

# Test 5: Catalogs
echo "5️⃣  Test catalogues..."
curl -s -X GET "${BACKEND_URL}/api/catalogs" | jq . || echo "❌ Échec"
echo ""

echo "✅ Tests terminés"
echo ""
echo "💡 Pour tester les endpoints protégés:"
echo "  1. Générez un token JWT"
echo "  2. Exécutez: curl -H 'Authorization: Bearer YOUR_TOKEN' ${BACKEND_URL}/api/saved-jobs"
