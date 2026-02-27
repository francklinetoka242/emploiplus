#!/bin/bash

# 🚀 Script de Préparation au Déploiement

set -e  # Exit on error

echo "📋 Vérification de la structure du projet..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé"
    echo "Exécutez ce script depuis la racine du projet"
    exit 1
fi

echo "✅ Racine du projet détectée"

# Check backends
if [ ! -d "backend" ]; then
    echo "❌ Erreur: dossier 'backend' non trouvé"
    exit 1
fi

echo "✅ Structure backend détectée"

# Build backend
echo ""
echo "🔧 Construction du backend..."
cd backend
npm install
npm run build
cd ..
echo "✅ Backend construit"

# Build frontend
echo ""
echo "🎨 Construction du frontend..."
npm install
npm run build
echo "✅ Frontend construit"

# Checks
echo ""
echo "🔍 Vérifications finales..."

# Check .env files
if [ ! -f "backend/.env.example" ]; then
    echo "⚠️  backend/.env.example manquant"
fi

if [ ! -f ".env.production" ]; then
    echo "⚠️  .env.production manquant"
fi

if [ ! -f "render.yaml" ]; then
    echo "⚠️  render.yaml manquant"
fi

if [ ! -f "vercel.json" ]; then
    echo "⚠️  vercel.json manquant"
fi

echo ""
echo "✅ Préparation complète!"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Configurez Supabase: https://supabase.com"
echo "2. Déployez le backend sur Render: https://render.com"
echo "3. Déployez le frontend sur Vercel: https://vercel.com"
echo ""
echo "📚 Voir DEPLOYMENT_GUIDE.md pour les instructions détaillées"
