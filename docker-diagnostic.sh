#!/bin/bash
# docker-diagnostic.sh
# Script de diagnostic pour Emploi Connect Docker

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 DIAGNOSTIC DOCKER - Emploi Connect${NC}"
echo "========================================"

# 1. Vérifier Docker
echo -e "\n${YELLOW}1. Vérification Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker et Docker Compose sont installés${NC}"

# 2. Vérifier les fichiers
echo -e "\n${YELLOW}2. Vérification des fichiers...${NC}"
files=("docker-compose.yml" ".env.docker" "backend/Dockerfile" "frontend/Dockerfile" "nginx/default.conf")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file existe${NC}"
    else
        echo -e "${RED}❌ $file manquant${NC}"
    fi
done

# 3. Vérifier les variables d'environnement
echo -e "\n${YELLOW}3. Vérification des variables d'environnement...${NC}"
if [ -f ".env.docker" ]; then
    required_vars=("DB_USER" "DB_PASSWORD" "DB_NAME" "JWT_SECRET" "GEMINI_API_KEY")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env.docker; then
            echo -e "${GREEN}✅ $var défini${NC}"
        else
            echo -e "${RED}❌ $var manquant dans .env.docker${NC}"
        fi
    done
else
    echo -e "${RED}❌ Fichier .env.docker manquant${NC}"
fi

# 4. Vérifier les conteneurs existants
echo -e "\n${YELLOW}4. État des conteneurs...${NC}"
if docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(emploi_|db)"; then
    echo -e "${GREEN}✅ Conteneurs trouvés${NC}"
else
    echo -e "${YELLOW}⚠️ Aucun conteneur Emploi Connect trouvé${NC}"
fi

# 5. Test de build rapide
echo -e "\n${YELLOW}5. Test de configuration Docker...${NC}"
if docker compose --env-file .env.docker config --quiet 2>/dev/null; then
    echo -e "${GREEN}✅ Configuration Docker valide${NC}"
else
    echo -e "${RED}❌ Erreur dans la configuration Docker${NC}"
    echo -e "${YELLOW}Détails de l'erreur :${NC}"
    docker compose --env-file .env.docker config
    exit 1
fi

echo -e "\n${GREEN}🎉 Diagnostic terminé !${NC}"
echo -e "${BLUE}Commandes recommandées :${NC}"
echo -e "  ${YELLOW}./docker-start-fast.sh${NC}     # Démarrage rapide"
echo -e "  ${YELLOW}docker compose logs -f${NC}     # Voir les logs"
echo -e "  ${YELLOW}docker compose ps${NC}          # État des services"