#!/bin/bash

# Script de déploiement Backend - PRODUCTION
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying Backend - PRODUCTION"
echo "============================================="
echo ""

# Étape 1 : Vérification de l'environnement
echo "1️⃣  Checking environment..."
if [ ! -f .env ]; then
  echo "❌ .env not found! Assurez-vous que le fichier .env existe sur le serveur."
  exit 1
fi

# Vérification des variables essentielles pour PostgreSQL et JWT
required_vars=(
  "DATABASE_URL"
  "PORT"
  "JWT_SECRET"
)

for var in "${required_vars[@]}"; do
  if ! grep -q "^$var=" .env; then
    echo "❌ Missing $var in .env"
    exit 1
  fi
done

echo "✓ Environment variables configured"
echo ""

# Étape 2 : Installation des dépendances
echo "2️⃣  Installing dependencies..."
npm install --omit=dev
echo "✓ Dependencies installed"
echo ""

# Étape 3 : Build (On ignore les tests d'intégration obsolètes)
echo "3️⃣  Building project..."
rm -rf dist/
npm run build
echo "✓ Build successful"
echo ""

# Étape 4 : Redémarrage du service (PM2)
echo "4️⃣  Restarting application..."
# On essaie de restart, si le processus n'existe pas, on le start
pm2 restart emploiplus-backend || pm2 start dist/server.js --name "emploiplus-backend"
echo ""

echo "✅ DEPLOYMENT COMPLETE!"
echo "---------------------------------------------"
echo "Le serveur tourne maintenant sur le port $(grep PORT .env | cut -d '=' -f2)"
echo "Utilisez 'pm2 logs emploiplus-backend' pour voir les logs."