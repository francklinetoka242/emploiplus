#!/bin/bash
# docker-build-optimized.sh
# Script de build Docker optimisé pour la vitesse

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Build Docker Optimisé - Emploi Connect${NC}"

# Activer BuildKit si pas déjà fait
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Fonction de build optimisé
build_optimized() {
    echo -e "${YELLOW}📦 Build avec optimisations...${NC}"

    # Build en parallèle avec cache
    docker compose build \
        --parallel \
        --progress=plain \
        --no-rm \
        "$@"

    echo -e "${GREEN}✅ Build terminé!${NC}"
}

# Fonction de build rapide (sans cache pour rebuild complet)
build_fast() {
    echo -e "${YELLOW}⚡ Build rapide (no-cache)...${NC}"

    docker compose build \
        --parallel \
        --progress=plain \
        --no-cache \
        --pull \
        "$@"

    echo -e "${GREEN}✅ Build rapide terminé!${NC}"
}

# Vérifier les arguments
case "${1:-}" in
    "fast"|"quick")
        build_fast
        ;;
    "cache"|"cached")
        build_optimized --no-cache=false
        ;;
    *)
        echo -e "${BLUE}Usage: $0 [fast|cache]${NC}"
        echo "  fast  : Build rapide sans cache"
        echo "  cache : Build avec cache optimisé"
        echo "  (défaut) : Build normal optimisé"
        echo ""
        build_optimized
        ;;
esac