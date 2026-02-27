#!/bin/bash

# ============================================================
# Tests du Module d'Authentification - API Emploi Connect Congo
# ============================================================

API_BASE="http://localhost:5000/api"
ADMIN_EMAIL="admin@emploiplus-group.com"
ADMIN_PASSWORD="changeme123"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║      Tests du Module d'Authentification (Phase 2)      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Health Check
echo "📋 Test 1: Health Check"
curl -X GET "$API_BASE/health" \
  -H "Content-Type: application/json" \
  -s | jq .
echo ""

# Test 2: Info API
echo "📋 Test 2: Info API (endpoints disponibles)"
curl -X GET "$API_BASE/" \
  -H "Content-Type: application/json" \
  -s | jq .
echo ""

# Test 3: Login avec credentials invalides
echo "📋 Test 3: Login avec email/password invalides"
curl -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@test.com","password":"wrongpassword"}' \
  -s | jq .
echo ""

# Test 4: Login sans email
echo "📋 Test 4: Login sans email (validation)"
curl -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"password":"test123"}' \
  -s | jq .
echo ""

# Test 5: Login sans password
echo "📋 Test 5: Login sans password (validation)"
curl -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com"}' \
  -s | jq .
echo ""

# Test 6: Login réussi (À adapter selon les credentials réels)
echo "📋 Test 6: Login réussi (À adapter avec credentials réels)"
LOGIN_RESPONSE=$(curl -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  -s)
echo "$LOGIN_RESPONSE" | jq .
echo ""

# Extraire le token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')
echo "Token extrait: ${TOKEN:0:20}..."
echo ""

# Test 7: GET /api/auth/me avec token valide (si login réussi)
if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "📋 Test 7: GET /api/auth/me (avec token valide)"
  curl -X GET "$API_BASE/auth/me" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -s | jq .
  echo ""
fi

# Test 8: GET /api/auth/me sans token
echo "📋 Test 8: GET /api/auth/me (sans token - Unauthorized)"
curl -X GET "$API_BASE/auth/me" \
  -H "Content-Type: application/json" \
  -s | jq .
echo ""

# Test 9: POST /api/auth/logout avec token (si token valide)
if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "📋 Test 9: POST /api/auth/logout (avec token valide)"
  curl -X POST "$API_BASE/auth/logout" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -s | jq .
  echo ""
fi

# Test 10: Jobs ne doit pas être affecté par les erreurs d'auth
echo "📋 Test 10: Jobs (isolation - doit fonctionner indépendamment)"
curl -X GET "$API_BASE/jobs?limit=5" \
  -H "Content-Type: application/json" \
  -s | jq .
echo ""

# Test 11: Formations ne doit pas être affecté par les erreurs d'auth
echo "📋 Test 11: Formations (isolation - doit fonctionner indépendamment)"
curl -X GET "$API_BASE/formations?limit=5" \
  -H "Content-Type: application/json" \
  -s | jq .
echo ""

# Test 12: GET /api/auth/me avec token invalide
echo "📋 Test 12: GET /api/auth/me (avec token invalide)"
curl -X GET "$API_BASE/auth/me" \
  -H "Authorization: Bearer invalid_token_12345" \
  -H "Content-Type: application/json" \
  -s | jq .
echo ""

# Test 13: GET /api/auth/me avec format Bearer manquant
echo "📋 Test 13: GET /api/auth/me (sans 'Bearer' prefix)"
curl -X GET "$API_BASE/auth/me" \
  -H "Authorization: invalid_token_12345" \
  -H "Content-Type: application/json" \
  -s | jq .
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║              Tests terminés                            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
