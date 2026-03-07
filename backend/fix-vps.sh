#!/bin/bash

# Script pour corriger les offres d'emploi et les publications sur le VPS
# À exécuter sur le VPS depuis le répertoire backend

echo "=========================================="
echo "Diagnostic et Correction VPS - Emploiplus"
echo "=========================================="
echo ""

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. DIAGNOSTIC AVANT
echo "[1/6] Diagnostic avant correction..."
echo ""

echo -e "${YELLOW}Vérification de la table publications:${NC}"
psql postgresql://emploiplus_user:vcybk24235GDWe@127.0.0.1:5432/emploi_plus_db_cg \
  -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'publications' ORDER BY ordinal_position;" 2>/dev/null || echo -e "${RED}Table publications manquante ou erreur${NC}"

echo ""
echo -e "${YELLOW}Nombre d'offres d'emploi:${NC}"
psql postgresql://emploiplus_user:vcybk24235GDWe@127.0.0.1:5432/emploi_plus_db_cg \
  -c "SELECT COUNT(*) as total_jobs FROM jobs WHERE published = true;" 2>/dev/null

echo ""

# 2. CRÉER/CORRIGER TABLE PUBLICATIONS
echo "[2/6] Création/correction de la table publications..."

psql postgresql://emploiplus_user:vcybk24235GDWe@127.0.0.1:5432/emploi_plus_db_cg << 'EOSQL'
-- Create publications table if it doesn't exist
CREATE TABLE IF NOT EXISTS publications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_publications_author_id ON publications(author_id);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON publications(created_at);
EOSQL

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Table publications créée/vérifiée${NC}"
else
    echo -e "${RED}❌ Erreur lors de la création de la table${NC}"
fi

echo ""

# 3. VÉRIFIER LES OFFRES
echo "[3/6] Exécution des migrations..."
node migrations/runAllMigrations.js 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations exécutées${NC}"
else
    echo -e "${YELLOW}⚠️  Migrations terminées (certaines peuvent déjà exister)${NC}"
fi

echo ""

# 4. REDÉMARRER L'APPLICATION
echo "[4/6] Redémarrage de l'application PM2..."
pm2 restart backend-prod >> /dev/null 2>&1
sleep 2

if pm2 show backend-prod 2>/dev/null | grep -q "online"; then
    echo -e "${GREEN}✅ Application redémarrée avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors du redémarrage${NC}"
fi

echo ""

# 5. DIAGNOSTIC APRÈS
echo "[5/6] Diagnostic après correction..."
echo ""

echo -e "${YELLOW}Vérification de la table publications:${NC}"
psql postgresql://emploiplus_user:vcybk24235GDWe@127.0.0.1:5432/emploi_plus_db_cg \
  -c "SELECT COUNT(*) as publications_count FROM publications;" 2>/dev/null

echo ""
echo -e "${YELLOW}Nombre d'offres d'emploi (published):${NC}"
psql postgresql://emploiplus_user:vcybk24235GDWe@127.0.0.1:5432/emploi_plus_db_cg \
  -c "SELECT COUNT(*) as jobs_count FROM jobs WHERE published = true;" 2>/dev/null

echo ""
echo -e "${YELLOW}Nombre d'offres d'emploi (totales):${NC}"
psql postgresql://emploiplus_user:vcybk24235GDWe@127.0.0.1:5432/emploi_plus_db_cg \
  -c "SELECT COUNT(*) as jobs_count FROM jobs;" 2>/dev/null

echo ""

# 6. VÉRIFIER L'API
echo "[6/6] Vérification de l'API..."
echo ""
echo -e "${YELLOW}Status du backend:${NC}"
pm2 status backend-prod

echo ""
echo -e "${YELLOW}Derniers logs (30 lignes):${NC}"
pm2 logs backend-prod --lines 30 --nostream

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Synchronisation VPS terminée!${NC}"
echo "=========================================="
echo ""
echo "Prochaines étapes:"
echo "1. Vérifiez que le formulaire affiche les offres d'emploi"
echo "2. Testez la création d'une nouvelle offre"
echo "3. Vérifiez les publications"
echo ""
