#!/bin/bash
# start-docker.sh
# Script simple et fiable pour démarrer Emploi Connect

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 DÉMARRAGE EMPLOI CONNECT${NC}"
echo "=============================="

# Variables d'environnement
ENV_FILE=".env.docker"

# Vérifications préalables
echo -e "\n${YELLOW}Vérifications...${NC}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Fichier $ENV_FILE manquant${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prérequis OK${NC}"

# Activer optimisations
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Nettoyer les conteneurs existants
echo -e "\n${YELLOW}Nettoyage...${NC}"
docker compose --env-file "$ENV_FILE" down 2>/dev/null || true

# Démarrer les services
echo -e "\n${YELLOW}Démarrage des services...${NC}"
docker compose --env-file "$ENV_FILE" up -d --build

# Attendre que tout soit prêt
echo -e "\n${YELLOW}Attente de la disponibilité...${NC}"

# Attendre DB
echo -n "  Base de données... "
timeout=30
count=0
while [ $count -lt $timeout ]; do
    if docker compose --env-file "$ENV_FILE" exec -T db pg_isready -U postgres >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Prête${NC}"
        break
    fi
    sleep 1
    count=$((count + 1))
done

if [ $count -eq $timeout ]; then
    echo -e "${RED}❌ Timeout${NC}"
    exit 1
fi

# Attendre Backend
echo -n "  Backend API... "
count=0
while [ $count -lt $timeout ]; do
    if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Prêt${NC}"
        break
    fi
    sleep 1
    count=$((count + 1))
done

if [ $count -eq $timeout ]; then
    echo -e "${YELLOW}⚠️ Timeout (peut démarrer en arrière-plan)${NC}"
fi

# Attendre Frontend
echo -n "  Frontend... "
count=0
while [ $count -lt 15 ]; do
    if curl -s http://localhost/ >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Prêt${NC}"
        break
    fi
    sleep 1
    count=$((count + 1))
done

if [ $count -eq 15 ]; then
    echo -e "${YELLOW}⚠️ Timeout (peut démarrer en arrière-plan)${NC}"
fi

echo -e "\n${GREEN}🎉 EMPLOI CONNECT EST PRÊT !${NC}"
echo ""
echo -e "${BLUE}🌐 URLs d'accès :${NC}"
echo -e "   Frontend: ${YELLOW}http://localhost${NC}"
echo -e "   Backend:  ${YELLOW}http://localhost:5000${NC}"
echo -e "   DB:       ${YELLOW}localhost:5432${NC}"
echo ""
echo -e "${BLUE}📊 Commandes utiles :${NC}"
echo -e "   Logs:     ${YELLOW}docker compose --env-file .env.docker logs -f${NC}"
echo -e "   Status:   ${YELLOW}docker compose --env-file .env.docker ps${NC}"
echo -e "   Arrêter:  ${YELLOW}docker compose --env-file .env.docker down${NC}"
echo ""
echo -e "${BLUE}📚 Voir DOCKER-GUIDE.md pour plus d'infos${NC}"