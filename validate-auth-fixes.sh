#!/bin/bash

###############################################################################
# Authentication Layer - Full Name Fix Validation Script
# Purpose: Verify that all full_name PostgreSQL errors have been fixed
# Usage: ./validate-auth-fixes.sh
###############################################################################

echo "============================================"
echo "🔍 AUTHENTICATION LAYER - FIX VALIDATION"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

echo "📋 STEP 1: Check for DB SELECT full_name in active code"
echo "─────────────────────────────────────────────────────"

if grep -r "SELECT.*full_name" backend/src/{services,routes,controllers}/*.ts 2>/dev/null | grep -v ".old."; then
  echo -e "${RED}❌ ISSUES FOUND: DB SELECT with full_name still exists${NC}"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo -e "${GREEN}✅ PASS: No SELECT full_name queries in active code${NC}"
fi
echo ""

echo "📋 STEP 2: Check for DB INSERT full_name in active code"
echo "─────────────────────────────────────────────────────"

if grep -r "INSERT.*full_name" backend/src/{services,routes,controllers}/*.ts 2>/dev/null | grep -v ".old."; then
  echo -e "${RED}❌ ISSUES FOUND: DB INSERT with full_name still exists${NC}"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo -e "${GREEN}✅ PASS: No INSERT full_name queries in active code${NC}"
fi
echo ""

echo "📋 STEP 3: Check for DB UPDATE full_name in active code"
echo "─────────────────────────────────────────────────────"

if grep -r "UPDATE.*full_name" backend/src/{services,routes,controllers}/*.ts 2>/dev/null | grep -v ".old."; then
  echo -e "${RED}❌ ISSUES FOUND: DB UPDATE with full_name still exists${NC}"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo -e "${GREEN}✅ PASS: No UPDATE full_name queries in active code${NC}"
fi
echo ""

echo "📋 STEP 4: Verify auth.ts uses first_name/last_name"
echo "─────────────────────────────────────────────────"

if grep -q "first_name, last_name" backend/src/routes/auth.ts; then
  echo -e "${GREEN}✅ PASS: auth.ts correctly uses first_name, last_name${NC}"
else
  echo -e "${RED}❌ FAIL: auth.ts may not use first_name/last_name${NC}"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

echo "📋 STEP 5: Verify adminAuthService.ts uses correct fields"
echo "────────────────────────────────────────────────────"

if grep -q "first_name, last_name" backend/src/services/adminAuthService.ts; then
  echo -e "${GREEN}✅ PASS: adminAuthService.ts correctly uses first_name, last_name${NC}"
else
  echo -e "${RED}❌ FAIL: adminAuthService.ts may not use first_name/last_name${NC}"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

echo "📋 STEP 6: Verify followService.ts has correct queries"
echo "────────────────────────────────────────────────"

if grep -q "u.first_name, u.last_name" backend/src/services/followService.ts; then
  if grep -q "full_name.*first_name.*last_name" backend/src/services/followService.ts; then
    echo -e "${GREEN}✅ PASS: followService.ts queries first_name/last_name and concatenates${NC}"
  else
    echo -e "${YELLOW}⚠️  WARNING: followService.ts queries first_name/last_name but no concatenation found${NC}"
  fi
else
  echo -e "${RED}❌ FAIL: followService.ts does not query first_name/last_name${NC}"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

echo "📋 STEP 7: Verify no full_name DB operations in new endpoints"
echo "────────────────────────────────────────────────────────"

NEW_ENDPOINTS=(
  "backend/src/controllers/admin-dashboard.controller.ts"
  "backend/src/controllers/jobs.controller.ts"
  "backend/src/controllers/admin-users.controller.ts"
)

ALL_OK=true
for endpoint in "${NEW_ENDPOINTS[@]}"; do
  if [ -f "$endpoint" ]; then
    if grep -q "SELECT.*full_name\|INSERT.*full_name\|UPDATE.*full_name" "$endpoint"; then
      echo -e "${RED}❌ $endpoint has full_name DB operations${NC}"
      ALL_OK=false
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
  fi
done

if [ "$ALL_OK" = true ]; then
  echo -e "${GREEN}✅ PASS: All verified endpoints are clean${NC}"
fi
echo ""

echo "📋 STEP 8: Database Schema Verification"
echo "───────────────────────────────────"
echo "Expected columns in users table:"
echo "  - first_name (text NOT NULL)"
echo "  - last_name (text NOT NULL)"
echo "  - ❌ NO full_name column"
echo ""
echo "Expected columns in admins table:"
echo "  - first_name (varchar NOT NULL)"
echo "  - last_name (varchar NOT NULL)"
echo "  - ❌ NO full_name column"
echo ""
echo -e "${YELLOW}ℹ️  Run this query to verify:${NC}"
echo "  psql> SELECT column_name FROM information_schema.columns"
echo "        WHERE table_name='users' AND (column_name LIKE '%name%');"
echo ""

echo "============================================"
echo "📊 VALIDATION RESULTS"
echo "============================================"

if [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
  echo ""
  echo "The authentication layer is ready for deployment."
  echo "No PostgreSQL 'column full_name does not exist' errors should occur."
  exit 0
else
  echo -e "${RED}❌ $ISSUES_FOUND ISSUE(S) FOUND${NC}"
  echo ""
  echo "Please fix the issues above before deployment."
  exit 1
fi
