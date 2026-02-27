#!/bin/bash

# ✅ Checklist de Déploiement Complète

echo "✅ CHECKLIST DEPLOIEMENT EMPLOIPLUS"
echo "========================================"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

check() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
        ((CHECKS_PASSED++))
    else
        echo "❌ $1"
        ((CHECKS_FAILED++))
    fi
}

echo "📋 VÉRIFICATIONS DE BASE"
echo "------------------------"

# Check directory
[ -f "package.json" ]
check "Root package.json existe"

[ -f "backend/package.json" ]
check "Backend package.json existe"

[ -f "DEPLOYMENT_GUIDE.md" ]
check "DEPLOYMENT_GUIDE.md existe"

[ -f "QUICKSTART_DEPLOYMENT.md" ]
check "QUICKSTART_DEPLOYMENT.md existe"

[ -f "vercel.json" ]
check "vercel.json existe"

[ -f "render.yaml" ]
check "render.yaml existe"

[ -f ".env.production" ]
check ".env.production existe"

[ -f "backend/.env.example" ]
check "backend/.env.example existe"

echo ""
echo "🔨 BUILD CHECKS"
echo "---------------"

cd backend
npm run build > /dev/null 2>&1
check "Backend build"
cd ..

npm run build > /dev/null 2>&1
check "Frontend build"

echo ""
echo "📝 CONFIGURATION CHECKS"
echo "----------------------"

grep -q "VITE_API_BASE_URL" .env.production
check ".env.production contient VITE_API_BASE_URL"

grep -q "DATABASE_URL" backend/.env.example
check "backend/.env.example contient DATABASE_URL"

grep -q "JWT_SECRET" backend/.env.example
check "backend/.env.example contient JWT_SECRET"

echo ""
echo "🔍 GIT CHECKS"
echo "-------------"

[ -d ".git" ]
check "Repository Git configuré"

git remote -v | grep -q "origin"
check "Git remote 'origin' configuré"

echo ""
echo "📊 RÉSUMÉ"
echo "---------"
echo "✅ Réussi: $CHECKS_PASSED"
echo "❌ Échoué: $CHECKS_FAILED"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo "🎉 TOUS LES CHECKS PASSENT!"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Lire QUICKSTART_DEPLOYMENT.md"
    echo "2. Créer un compte Supabase"
    echo "3. Créer un compte Render"
    echo "4. Créer un compte Vercel"
    echo "5. Commencer le déploiement!"
    exit 0
else
    echo "⚠️  Certains checks ont échoué"
    echo "Résolvez les problèmes ci-dessus avant de déployer"
    exit 1
fi
