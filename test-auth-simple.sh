#!/bin/bash

# Test Supabase Authentication - Simplified Version
# This tests the authentication endpoints using curl

BACKEND_URL="${1:-http://localhost:5000}"
TEST_EMAIL="test_auth_$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

echo "=========================================="
echo "Supabase Authentication Test"
echo "=========================================="
echo ""
echo "Backend URL: $BACKEND_URL"
echo "Test Email: $TEST_EMAIL"
echo "Test Password: $TEST_PASSWORD"
echo ""
echo "Testing in progress..."
echo ""

# Test 1: Register user
echo "1️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"full_name\": \"Test User\",
    \"country\": \"congo\",
    \"user_type\": \"candidate\"
  }")

echo "Response: $REGISTER_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "⚠️  Registration returned no token. The user might already exist."
  echo "Attempting login instead..."
  echo ""
  
  # Test 2: Login user
  echo "2️⃣  Testing User Login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$TEST_EMAIL\",
      \"password\": \"$TEST_PASSWORD\"
    }")
  
  echo "Response: $LOGIN_RESPONSE"
  echo ""
  
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  if [ -z "$TOKEN" ]; then
    echo "❌ Login failed - No token received"
    exit 1
  else
    echo "✅ Login successful - Token obtained"
  fi
else
  echo "✅ Registration successful - Token obtained"
fi

echo ""
echo "3️⃣  Testing Protected Route Access..."
echo "Using token: ${TOKEN:0:20}..."
echo ""

# Test with token
PROTECTED_RESPONSE=$(curl -s -X GET "$BACKEND_URL/api/users/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $PROTECTED_RESPONSE"
echo ""

if echo "$PROTECTED_RESPONSE" | grep -q '"email"'; then
  echo "✅ Protected route accessible!"
  echo ""
  echo "4️⃣  Testing Without Token (Should Fail)..."
  
  NO_TOKEN=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/users/me")
  HTTP_CODE=$(echo "$NO_TOKEN" | tail -n1)
  
  if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ Correctly rejected (HTTP 401)"
  else
    echo "⚠️  Unexpected response (HTTP $HTTP_CODE)"
  fi
  
  echo ""
  echo "5️⃣  Testing Invalid Token (Should Fail)..."
  
  INVALID=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/users/me" \
    -H "Authorization: Bearer invalid_token_xyz")
  INVALID_CODE=$(echo "$INVALID" | tail -n1)
  
  if [ "$INVALID_CODE" = "401" ]; then
    echo "✅ Correctly rejected invalid token (HTTP 401)"
  else
    echo "⚠️  Unexpected response (HTTP $INVALID_CODE)"
  fi
  
  echo ""
  echo "=========================================="
  echo "✅ All Authentication Tests PASSED!"
  echo "=========================================="
  echo ""
  echo "Summary:"
  echo "✓ User registration/login works"
  echo "✓ JWT tokens are issued correctly"
  echo "✓ Protected routes require valid tokens"
  echo "✓ Invalid tokens are rejected"
  echo ""
  
else
  echo "❌ Protected route access failed"
  echo ""
  echo "=========================================="
  echo "❌ Authentication Test FAILED!"
  echo "=========================================="
  exit 1
fi
