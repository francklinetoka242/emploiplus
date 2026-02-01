#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# DEPLOYMENT VERIFICATION SCRIPT FOR EMPLOIPLUS
# ═══════════════════════════════════════════════════════════════════════════════
# Verifies that both frontend and backend are ready for deployment
# Usage: bash verify-deployment-ready.sh

set -e

echo "════════════════════════════════════════════════════════════════"
echo "🔍 EMPLOIPLUS DEPLOYMENT VERIFICATION"
echo "════════════════════════════════════════════════════════════════"
echo ""

PROJECT_ROOT="/Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0

# Helper functions
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $description (NOT FOUND: $file)"
        ((CHECKS_FAILED++))
    fi
}

check_directory() {
    local dir=$1
    local description=$2
    
    if [ -d "$PROJECT_ROOT/$dir" ]; then
        echo -e "${GREEN}✓${NC} $description"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $description (NOT FOUND: $dir)"
        ((CHECKS_FAILED++))
    fi
}

run_build() {
    local dir=$1
    local description=$2
    
    echo -e "\n${BLUE}Building ${description}...${NC}"
    if cd "$PROJECT_ROOT/$dir" && npm run build > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} ${description} build successful"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} ${description} build failed"
        ((CHECKS_FAILED++))
    fi
    cd "$PROJECT_ROOT"
}

# ─────────────────────────────────────────────────────────────────────────────────
echo "1️⃣  CONFIGURATION FILES"
echo "─────────────────────────────────────────────────────────────────────────────────"

check_file "vercel.json" "Vercel configuration (frontend)"
# Render removed: ensure production deployment config handled elsewhere
echo "Note: Render deployment config removed; verify production host settings manually"
check_file ".env.production" "Production environment variables"
check_file "backend/.env.example" "Backend environment template"
check_file "backend/tsconfig.json" "Backend TypeScript config"

# ─────────────────────────────────────────────────────────────────────────────────
echo ""
echo "2️⃣  DEPLOYMENT DOCUMENTATION"
echo "─────────────────────────────────────────────────────────────────────────────────"

check_file "DEPLOYMENT_GUIDE.md" "Complete deployment guide"
check_file "QUICKSTART_DEPLOYMENT.md" "Quick start deployment (15 min)"
check_file "DEPLOYMENT_ARCHITECTURE.md" "Architecture documentation"
check_file "DEPLOYMENT_CONFIG.md" "Advanced configuration"
check_file "README_DEPLOYMENT.md" "Deployment overview"
check_file "DEPLOYMENT_BUILD_SUCCESS.md" "Build success report"

# ─────────────────────────────────────────────────────────────────────────────────
echo ""
echo "3️⃣  BUILD ARTIFACTS"
echo "─────────────────────────────────────────────────────────────────────────────────"

check_directory "backend/dist" "Backend compiled JavaScript (dist/)"
check_directory "dist" "Frontend compiled application (dist/)"

# ─────────────────────────────────────────────────────────────────────────────────
echo ""
echo "4️⃣  BUILDING APPLICATION"
echo "─────────────────────────────────────────────────────────────────────────────────"

run_build "backend" "Backend (TypeScript → JavaScript)"
run_build "." "Frontend (React + TypeScript + Vite)"

# ─────────────────────────────────────────────────────────────────────────────────
echo ""
echo "5️⃣  ENVIRONMENT VARIABLES"
echo "─────────────────────────────────────────────────────────────────────────────────"

if grep -q "VITE_API_BASE_URL" "$PROJECT_ROOT/.env.production"; then
    echo -e "${GREEN}✓${NC} .env.production has VITE_API_BASE_URL"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} .env.production missing VITE_API_BASE_URL"
    ((CHECKS_FAILED++))
fi

if grep -q "DATABASE_URL" "$PROJECT_ROOT/backend/.env.example"; then
    echo -e "${GREEN}✓${NC} Backend has DATABASE_URL template"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} Backend missing DATABASE_URL template"
    ((CHECKS_FAILED++))
fi

if grep -q "JWT_SECRET" "$PROJECT_ROOT/backend/.env.example"; then
    echo -e "${GREEN}✓${NC} Backend has JWT_SECRET template"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} Backend missing JWT_SECRET template"
    ((CHECKS_FAILED++))
fi

# ─────────────────────────────────────────────────────────────────────────────────
echo ""
echo "6️⃣  REPOSITORY NAMING"
echo "─────────────────────────────────────────────────────────────────────────────────"

if grep -q "emploiplus" "$PROJECT_ROOT/QUICKSTART_DEPLOYMENT.md"; then
    echo -e "${GREEN}✓${NC} Documentation uses 'emploiplus' repository name"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} Documentation doesn't reference 'emploiplus'"
    ((CHECKS_FAILED++))
fi

if grep -q "your-production-api.example.com" "$PROJECT_ROOT/.env.production"; then
    echo -e "${GREEN}✓${NC} .env.production points to production API placeholder"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠️${NC} .env.production does not contain production API placeholder; verify manually"
    ((CHECKS_FAILED++))
fi

# ─────────────────────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📊 VERIFICATION SUMMARY"
echo "════════════════════════════════════════════════════════════════"

TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))
echo -e "${GREEN}✓ Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}✗ Failed: $CHECKS_FAILED${NC}"
echo "Total: $TOTAL"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 ALL CHECKS PASSED - READY FOR DEPLOYMENT${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. Follow QUICKSTART_DEPLOYMENT.md for 15-minute setup"
    echo "  2. Verify .env.production has correct API_BASE_URL"
    echo "  3. Push to GitHub: git push origin main"
    echo "  4. Vercel will auto-deploy frontend"
    echo "  5. Your production host will auto-deploy backend (if configured)"
    echo ""
    exit 0
else
    echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}⚠️  SOME CHECKS FAILED - REVIEW ABOVE${NC}"
    echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    exit 1
fi
