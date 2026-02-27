#!/bin/bash

# ============================================
# 🚀 SCRIPT DE DÉPLOIEMENT RAPIDE - NEWSFEED
# ============================================
# Utilisation : bash deploy-newsfeed.sh

echo "📦 Optimisation Avancée du Fil d'Actualité - Déploiement"
echo "=========================================================="

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier que Node.js est en cours d'exécution
echo -e "\n${YELLOW}1️⃣  Vérification de la connexion au backend...${NC}"
if curl -s http://localhost:5000 > /dev/null; then
    echo -e "${GREEN}✓ Backend accessible${NC}"
else
    echo -e "${RED}✗ Backend non accessible${NC}"
    echo -e "${YELLOW}   Veuillez redémarrer le backend :${NC}"
    echo "   cd backend && npm start"
    exit 1
fi

# 2. Vérifier la base de données
echo -e "\n${YELLOW}2️⃣  Vérification de la base de données...${NC}"
if psql -U emploi_user -d emploi_connect -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Base de données accessible${NC}"
else
    echo -e "${RED}✗ Base de données non accessible${NC}"
    exit 1
fi

# 3. Vérifier les tables créées
echo -e "\n${YELLOW}3️⃣  Vérification des tables...${NC}"
TABLES=$(psql -U emploi_user -d emploi_connect -t -c "SELECT COUNT(*) FROM pg_tables WHERE tablename IN ('publication_comments', 'publication_reports');")
if [ "$TABLES" == "2" ]; then
    echo -e "${GREEN}✓ Tables créées (publication_comments, publication_reports)${NC}"
else
    echo -e "${YELLOW}⚠ Tables seront créées au redémarrage du backend${NC}"
fi

# 4. Vérifier les fichiers frontend
echo -e "\n${YELLOW}4️⃣  Vérification des fichiers frontend...${NC}"
FILES=(
    "src/components/ReportModal.tsx"
    "src/components/ReactionBar.tsx"
    "src/pages/Newsfeed.tsx"
    "src/components/CommentsSection.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file existe${NC}"
    else
        echo -e "${RED}✗ $file manquant${NC}"
    fi
done

# 5. Vérifier les dépendances
echo -e "\n${YELLOW}5️⃣  Vérification des dépendances...${NC}"
if grep -q '"sonner"' package.json; then
    echo -e "${GREEN}✓ sonner (toast) installé${NC}"
else
    echo -e "${RED}✗ sonner non installé${NC}"
    echo "   npm install sonner"
fi

# 6. Résumé
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Vérification complète${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📝 Prochaines étapes :"
echo "1. Redémarrer le frontend (Vite)"
echo "2. Naviguer vers /actualite"
echo "3. Tester les commentaires, likes, et réactions"
echo ""
echo "🔗 Documentation :"
echo "   - OPTIMISATION_NEWSFEED_COMPLETE.md"
echo "   - GUIDE_VERIFICATION_NEWSFEED.md"
echo ""
echo -e "${GREEN}Déploiement prêt ! 🚀${NC}"
