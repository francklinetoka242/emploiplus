#!/bin/bash
# docker-start-fast.sh
# Démarrage ultra-rapide avec optimisations

set -e

# Activer les optimisations Docker
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}⚡ DÉMARRAGE ULTRA-RAPIDE - Emploi Connect${NC}"

# Vérifier si les images existent déjà
if docker images | grep -q "emploi_backend\|emploi_frontend"; then
    echo -e "${YELLOW}📦 Images trouvées, démarrage rapide...${NC}"
    docker compose up -d
else
    echo -e "${YELLOW}🔨 Premiers builds, cela prendra plus de temps...${NC}"
    echo -e "${YELLOW}💡 Utilisez './docker-build-optimized.sh' pour pré-builder${NC}"

    # Build optimisé puis démarrage
    docker compose build --parallel --progress=plain
    docker compose up -d
fi

# Attendre que tout soit prêt (version accélérée)
echo -e "${YELLOW}⏳ Vérification rapide...${NC}"

# Vérifier DB rapidement
timeout 10 bash -c 'until docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done' && \
    echo -e "${GREEN}✅ DB prête${NC}" || echo -e "${YELLOW}⚠️ DB en cours...${NC}"

# Vérifier Backend rapidement
timeout 10 bash -c 'until docker compose exec -T backend curl -s http://localhost:5000/api/health >/dev/null 2>&1; do sleep 1; done' && \
    echo -e "${GREEN}✅ Backend prêt${NC}" || echo -e "${YELLOW}⚠️ Backend en cours...${NC}"

# Vérifier Frontend rapidement
timeout 5 bash -c 'until docker compose exec -T frontend wget -q --tries=1 --spider http://localhost/ >/dev/null 2>&1; do sleep 1; done' && \
    echo -e "${GREEN}✅ Frontend prêt${NC}" || echo -e "${YELLOW}⚠️ Frontend en cours...${NC}"

echo ""
echo -e "${GREEN}🎉 Application accessible :${NC}"
echo -e "   Frontend: ${YELLOW}http://localhost${NC}"
echo -e "   Backend:  ${YELLOW}http://localhost:5000${NC}"
echo ""
echo -e "${BLUE}💡 Commandes utiles :${NC}"
echo -e "   Logs: ${YELLOW}docker compose logs -f${NC}"
echo -e "   Stop: ${YELLOW}docker compose down${NC}"
echo -e "   Rebuild: ${YELLOW}./docker-build-optimized.sh${NC}"