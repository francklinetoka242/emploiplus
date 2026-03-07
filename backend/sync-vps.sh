#!/bin/bash

# Script de synchronisation du VPS avec la version locale
# À exécuter sur le VPS

set -e

echo "=========================================="
echo "Synchronisation du VPS - Emploiplus"
echo "=========================================="
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "server.js" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le répertoire backend"
    exit 1
fi

echo "[1/5] Mise à jour du code depuis Git..."
git pull origin main
if [ $? -eq 0 ]; then
    echo "✅ Code mis à jour avec succès"
else
    echo "❌ Erreur lors de la mise à jour du code"
    exit 1
fi
echo ""

echo "[2/5] Installation des dépendances..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dépendances installées"
else
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi
echo ""

echo "[3/5] Exécution des migrations de base de données..."
node migrations/runAllMigrations.js
if [ $? -eq 0 ]; then
    echo "✅ Migrations exécutées"
else
    echo "❌ Erreur lors des migrations"
    exit 1
fi
echo ""

echo "[4/5] Redémarrage de l'application PM2..."
pm2 restart backend-prod
if [ $? -eq 0 ]; then
    echo "✅ Application redémarrée"
else
    echo "❌ Erreur lors du redémarrage"
    exit 1
fi
echo ""

echo "[5/5] Attente du démarrage de l'application..."
sleep 3
pm2 status
echo ""

echo "=========================================="
echo "✅ Synchronisation complète!"
echo "=========================================="
