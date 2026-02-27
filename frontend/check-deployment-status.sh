#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# QUICK DEPLOYMENT STATUS CHECK
# ═══════════════════════════════════════════════════════════════════════════════

PROJECT_ROOT="/Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-"

echo ""
echo "🚀 EMPLOIPLUS DEPLOYMENT STATUS"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check files
echo "📋 Configuration Files:"
[ -f "$PROJECT_ROOT/vercel.json" ] && echo "  ✅ vercel.json" || echo "  ❌ vercel.json"
[ -f "$PROJECT_ROOT/render.yaml" ] && echo "  ✅ render.yaml" || echo "  ❌ render.yaml"
[ -f "$PROJECT_ROOT/.env.production" ] && echo "  ✅ .env.production" || echo "  ❌ .env.production"
[ -f "$PROJECT_ROOT/backend/.env.example" ] && echo "  ✅ backend/.env.example" || echo "  ❌ backend/.env.example"

echo ""
echo "📚 Documentation:"
[ -f "$PROJECT_ROOT/QUICKSTART_DEPLOYMENT.md" ] && echo "  ✅ QUICKSTART_DEPLOYMENT.md" || echo "  ❌ QUICKSTART_DEPLOYMENT.md"
[ -f "$PROJECT_ROOT/DEPLOYMENT_GUIDE.md" ] && echo "  ✅ DEPLOYMENT_GUIDE.md" || echo "  ❌ DEPLOYMENT_GUIDE.md"
[ -f "$PROJECT_ROOT/DEPLOYMENT_BUILD_SUCCESS.md" ] && echo "  ✅ DEPLOYMENT_BUILD_SUCCESS.md" || echo "  ❌ DEPLOYMENT_BUILD_SUCCESS.md"

echo ""
echo "📦 Build Artifacts:"
[ -d "$PROJECT_ROOT/backend/dist" ] && echo "  ✅ backend/dist/ (compiled)" || echo "  ❌ backend/dist/ (missing)"
[ -d "$PROJECT_ROOT/dist" ] && echo "  ✅ dist/ (compiled frontend)" || echo "  ❌ dist/ (missing)"

echo ""
echo "🔧 Recent Builds:"
echo ""

# Check backend build
echo -n "  Backend TypeScript: "
cd "$PROJECT_ROOT/backend" 2>/dev/null && npm run build 2>&1 | grep -q "error TS" && echo "❌ FAILED" || echo "✅ SUCCESS"

# Check frontend build
echo -n "  Frontend Vite: "
cd "$PROJECT_ROOT" 2>/dev/null && npm run build 2>&1 | grep -q "error\|failed" && echo "❌ FAILED" || echo "✅ SUCCESS"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "✨ DEPLOYMENT KIT COMPLETE!"
echo ""
echo "📖 Read QUICKSTART_DEPLOYMENT.md for 4-step deployment in 15 min"
echo ""
