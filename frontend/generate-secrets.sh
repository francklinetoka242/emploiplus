#!/bin/bash

# 🔐 Script de Génération des Clés Secrètes

echo "🔐 Générateur de Clés Secrètes pour Déploiement"
echo "=================================================="
echo ""

echo "1️⃣  JWT_SECRET (pour Render):"
openssl rand -hex 32
echo ""

echo "2️⃣  Alternative avec Node.js:"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo ""

echo "💡 Utilisez l'une des deux clés générées ci-dessus pour JWT_SECRET sur Render"
echo ""

echo "📝 Checklist de Sécurité:"
echo "✅ Ne jamais committer les clés secrètes"
echo "✅ Régénérer les clés tous les 6 mois"
echo "✅ Utiliser des variables d'environnement"
echo "✅ Différentes clés pour dev/staging/production"
echo "✅ Activer 2FA sur tous les services cloud"
