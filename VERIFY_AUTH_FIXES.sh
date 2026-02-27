#!/bin/bash

# 🔐 Super Admin Authentication - Deployment & Testing Guide
# Created: 2025-02-23
# Purpose: Verify and test the authentication fixes

echo "════════════════════════════════════════════════════════════════"
echo "🔐 Super Admin Authentication - Quick Verification"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check 1: Backend .env CORS configuration
echo -e "${BLUE}[1/6]${NC} Vérification CORS_ORIGINS..."
CORS_ORIGINS=$(grep "CORS_ORIGINS" /home/emploiplus-group.com/public_html/backend/.env | head -1)
if [[ $CORS_ORIGINS == *"https://emploiplus-group.com"* ]]; then
    echo -e "${GREEN}✅${NC} CORS_ORIGINS correctement configuré"
    echo "    $CORS_ORIGINS"
else
    echo -e "${RED}❌${NC} CORS_ORIGINS absent ou incorrect"
    echo "    Found: $CORS_ORIGINS"
fi
echo ""

# Check 2: Backend JWT Secret
echo -e "${BLUE}[2/6]${NC} Vérification JWT_SECRET..."
JWT_SECRET=$(grep "JWT_SECRET" /home/emploiplus-group.com/public_html/backend/.env | head -1)
if [[ -n $JWT_SECRET ]]; then
    echo -e "${GREEN}✅${NC} JWT_SECRET configuré"
    echo "    Length: ${#JWT_SECRET} chars"
else
    echo -e "${RED}❌${NC} JWT_SECRET non configuré"
fi
echo ""

# Check 3: Frontend API URL
echo -e "${BLUE}[3/6]${NC} Vérification VITE_API_URL..."
API_URL=$(grep "VITE_API_URL" /home/emploiplus-group.com/public_html/frontend/.env | head -1)
if [[ $API_URL == *"https://emploiplus-group.com"* ]]; then
    echo -e "${GREEN}✅${NC} VITE_API_URL correctement configuré"
    echo "    $API_URL"
else
    echo -e "${YELLOW}⚠️${NC} VITE_API_URL configuration"
    echo "    Found: $API_URL"
fi
echo ""

# Check 4: Verify apiFetch.ts has new logging
echo -e "${BLUE}[4/6]${NC} Vérification logs TOKEN SYNC..."
if grep -q "TOKEN SYNC" /home/emploiplus-group.com/public_html/frontend/src/lib/headers.ts; then
    echo -e "${GREEN}✅${NC} Logs TOKEN SYNC présents"
else
    echo -e "${RED}❌${NC} Logs TOKEN SYNC manquant"
fi
echo ""

# Check 5: Verify loginAdmin has credentials
echo -e "${BLUE}[5/6]${NC} Vérification credentials dans loginAdmin..."
if grep -A 5 "loginAdmin:" /home/emploiplus-group.com/public_html/frontend/src/lib/api.ts | grep -q "credentials:"; then
    echo -e "${GREEN}✅${NC} credentials: 'include' présent dans loginAdmin"
else
    echo -e "${RED}❌${NC} credentials: 'include' manquant"
fi
echo ""

# Check 6: Verify CORS middleware has credentials: true
echo -e "${BLUE}[6/6]${NC} Vérification CORS middleware..."
if grep -q "credentials: true" /home/emploiplus-group.com/public_html/backend/src/middleware/cors.ts; then
    echo -e "${GREEN}✅${NC} CORS middleware a credentials: true"
else
    echo -e "${RED}❌${NC} CORS middleware credentials manquant"
fi
echo ""

echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}Summary${NC}: All checks for authentication fixes"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📝 Next steps:"
echo "  1. Rebuild backend (if running compiled version)"
echo "  2. Rebuild frontend (npm run build)"
echo "  3. Deploy files to production"
echo "  4. Test login in browser (check console for 📊 logs)"
echo ""
echo "🔍 Testing in Browser Console:"
echo "  1. Open DevTools (F12)"
echo "  2. Go to Super Admin login at /#/admin/login"
echo "  3. Login with your credentials"
echo "  4. Watch console for: ⏰ [TOKEN SYNC] messages"
echo "  5. Check localStorage.getItem('adminToken')"
echo ""
echo "📊 Console logs to watch:"
echo "  ✅ ⏰ [TOKEN SYNC] Vérification synchronisation horloge"
echo "  ✅ ✅ Connexion réussie"
echo "  ✅ ✅ Token restauré depuis localStorage"
echo ""
echo "🚨 If issues persist:"
echo "  1. Check: ⏰ [TOKEN SYNC] ... secondsUntilExpiry"
echo "  2. Check if secondsUntilExpiry keeps decreasing"
echo "  3. Verify server time: date"
echo "  4. Check backend logs: tail -n 100 /var/log/backend.log"
echo ""
