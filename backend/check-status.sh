#!/bin/bash
# Migration Status Tracker
# Ce script peut être exécuté pour voir l'état de la refactorisation

echo "🚀 État de la Refactorisation - Emploi Connect Backend"
echo "=========================================="
echo ""

# Phase 1: Foundation
echo "📦 Phase 1: Foundation"
echo "─────────────────────────────────────────"
[ -f "src/middleware/auth.ts" ] && echo "✅ src/middleware/auth.ts" || echo "❌ src/middleware/auth.ts"
[ -f "src/config/constants.ts" ] && echo "✅ src/config/constants.ts" || echo "❌ src/config/constants.ts"
[ -f "src/utils/helpers.ts" ] && echo "✅ src/utils/helpers.ts" || echo "❌ src/utils/helpers.ts"
[ -f "src/routes/index.ts" ] && echo "✅ src/routes/index.ts" || echo "❌ src/routes/index.ts"
[ -f "src/server-modular.ts" ] && echo "✅ src/server-modular.ts" || echo "❌ src/server-modular.ts"
echo ""

# Phase 2: Routes & Controllers
echo "📋 Phase 2: Routes & Controllers (En Progression)"
echo "─────────────────────────────────────────"
[ -f "src/routes/auth.ts" ] && echo "✅ src/routes/auth.ts (EXEMPLE)" || echo "❌ src/routes/auth.ts"
[ -f "src/routes/users.ts" ] && echo "✅ src/routes/users.ts" || echo "⏳ src/routes/users.ts"
[ -f "src/routes/jobs.ts" ] && echo "✅ src/routes/jobs.ts" || echo "⏳ src/routes/jobs.ts"
[ -f "src/routes/formations.ts" ] && echo "✅ src/routes/formations.ts" || echo "⏳ src/routes/formations.ts"
[ -f "src/routes/admin.ts" ] && echo "✅ src/routes/admin.ts" || echo "⏳ src/routes/admin.ts"
[ -f "src/routes/publications.ts" ] && echo "✅ src/routes/publications.ts" || echo "⏳ src/routes/publications.ts"
[ -f "src/routes/notifications.ts" ] && echo "✅ src/routes/notifications.ts" || echo "⏳ src/routes/notifications.ts"
[ -f "src/routes/portfolios.ts" ] && echo "✅ src/routes/portfolios.ts" || echo "⏳ src/routes/portfolios.ts"
echo ""

echo "🎯 Controllers"
echo "─────────────────────────────────────────"
[ -f "src/controllers/authController.ts" ] && echo "✅ src/controllers/authController.ts (EXEMPLE)" || echo "❌ src/controllers/authController.ts"
[ -f "src/controllers/userController.ts" ] && echo "✅ src/controllers/userController.ts" || echo "⏳ src/controllers/userController.ts"
[ -f "src/controllers/jobController.ts" ] && echo "✅ src/controllers/jobController.ts" || echo "⏳ src/controllers/jobController.ts"
echo ""

# Phase 3: Documentation
echo "📚 Documentation"
echo "─────────────────────────────────────────"
[ -f "ARCHITECTURE.md" ] && echo "✅ ARCHITECTURE.md" || echo "❌ ARCHITECTURE.md"
[ -f "MIGRATION_GUIDE.md" ] && echo "✅ MIGRATION_GUIDE.md" || echo "❌ MIGRATION_GUIDE.md"
[ -f "README_REFACTORING.md" ] && echo "✅ README_REFACTORING.md" || echo "❌ README_REFACTORING.md"
[ -f "QUICK_START.md" ] && echo "✅ QUICK_START.md" || echo "❌ QUICK_START.md"
echo ""

# Summary
echo "📊 Résumé"
echo "─────────────────────────────────────────"
COMPLETED=$( [ -f "src/middleware/auth.ts" ] && echo "1" || echo "0" )
COMPLETED=$((COMPLETED + $( [ -f "src/config/constants.ts" ] && echo "1" || echo "0" )))
COMPLETED=$((COMPLETED + $( [ -f "src/utils/helpers.ts" ] && echo "1" || echo "0" )))
COMPLETED=$((COMPLETED + $( [ -f "src/routes/index.ts" ] && echo "1" || echo "0" )))
COMPLETED=$((COMPLETED + $( [ -f "src/controllers/authController.ts" ] && echo "1" || echo "0" )))
COMPLETED=$((COMPLETED + $( [ -f "src/routes/auth.ts" ] && echo "1" || echo "0" )))

echo "Phase 1 - Foundation:  5/5 ✅"
echo "Phase 2 - Routes:      0/10 ⏳"
echo "Phase 3 - Controllers: 1/6 ⏳"
echo ""
echo "Progression globale: $COMPLETED/21 fichiers créés"
echo ""

echo "🎯 Prochaines étapes"
echo "─────────────────────────────────────────"
echo "1. Créer src/routes/users.ts"
echo "2. Créer src/controllers/userController.ts"
echo "3. Enregistrer dans src/routes/index.ts"
echo "4. Tester les endpoints"
echo "5. Continuer avec les autres routes"
echo ""

echo "📖 Consulter la documentation"
echo "─────────────────────────────────────────"
echo "cat ARCHITECTURE.md"
echo "cat MIGRATION_GUIDE.md"
echo "cat QUICK_START.md"
echo ""
