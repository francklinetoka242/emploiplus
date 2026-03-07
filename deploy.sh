#!/bin/bash
# Script de déploiement simple
# Usage: bash deploy.sh

set -e  # Exit on error

echo "🚀 Déploiement emploiplus-group.com"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Erreur: package.json non trouvé${NC}"
  echo "Lancez ce script depuis la racine du projet"
  exit 1
fi

# 2. Commit et push les changements
echo -e "${YELLOW}📝 Préparation des changements...${NC}"
git add .
git diff --cached --quiet && echo "Rien à committer" || (
  read -p "Message de commit: " COMMIT_MSG
  git commit -m "$COMMIT_MSG"
  git push origin main
  echo -e "${GREEN}✓ Changements poussés${NC}"
)

# 3. Redémarrer le serveur backend
echo -e "${YELLOW}🔄 Redémarrage du serveur...${NC}"
cd backend || exit 1
npm install
pm2 restart backend-prod
echo -e "${GREEN}✓ Serveur redémarré${NC}"

# 4. Afficher les logs
echo -e "${YELLOW}📋 Logs en direct (30 secondes)${NC}"
pm2 logs backend-prod --lines 20 --noStream &
sleep 30
pkill -f "pm2 logs"

echo -e "${GREEN}✅ Déploiement terminé!${NC}"
echo "Vérifiez le statut avec: pm2 status"
