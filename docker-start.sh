#!/bin/bash
# docker-start.sh
# Script de démarrage Docker pour Emploi Connect

set -e  # Exit si une erreur survient

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║   🚀 EMPLOI CONNECT - Docker Start    ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé!${NC}"
    exit 1
fi

# Vérifier que docker-compose est disponible
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé!${NC}"
    exit 1
fi

# Vérifier que le fichier .env.docker existe
if [ ! -f ".env.docker" ]; then
    echo -e "${YELLOW}⚠️  .env.docker non trouvé!${NC}"
    echo -e "${YELLOW}   Création d'un fichier .env.docker par défaut...${NC}"
    cp .env.docker.example .env.docker || {
        echo -e "${RED}❌ Impossible de créer .env.docker${NC}"
        echo "   Créez manuellement: cp .env.docker.example .env.docker"
        exit 1
    }
    echo -e "${GREEN}✅ .env.docker créé${NC}"
fi

# Étape 1: Build des images
echo ""
echo -e "${BLUE}📦 Étape 1: Construction des images Docker...${NC}"
docker compose build --pull

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Images construites avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de la construction${NC}"
    exit 1
fi

# Étape 2: Arrêter les conteneurs existants
echo ""
echo -e "${BLUE}🛑 Étape 2: Arrêt des conteneurs existants...${NC}"
docker compose down 2>/dev/null || true
echo -e "${GREEN}✅ Conteneurs arrêtés${NC}"

# Étape 3: Démarrer les services
echo ""
echo -e "${BLUE}🚀 Étape 3: Démarrage des services...${NC}"
docker compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Services démarrés${NC}"
else
    echo -e "${RED}❌ Erreur lors du démarrage${NC}"
    exit 1
fi

# Étape 4: Attendre que tout soit prêt
echo ""
echo -e "${BLUE}⏳ Étape 4: Attente que les services deviennent sains...${NC}"

# Attendre DB
echo "  ⏳ Attente de PostgreSQL..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker compose exec -T db pg_isready -U postgres &>/dev/null; then
        echo "  ✅ PostgreSQL est prêt"
        break
    fi
    attempt=$((attempt+1))
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ PostgreSQL n'a pas répondu à temps${NC}"
    exit 1
fi

# Attendre Backend
echo "  ⏳ Attente du Backend..."
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker compose exec -T backend curl -s http://localhost:5000/api/health &>/dev/null; then
        echo "  ✅ Backend est prêt"
        break
    fi
    attempt=$((attempt+1))
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${YELLOW}⚠️  Backend n'a pas répondu à temps (peut démarrer en arrière-plan)${NC}"
fi

# Attendre Frontend
echo "  ⏳ Attente du Frontend..."
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker compose exec -T frontend wget -q --tries=1 --spider http://localhost/ 2>/dev/null; then
        echo "  ✅ Frontend est prêt"
        break
    fi
    attempt=$((attempt+1))
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${YELLOW}⚠️  Frontend n'a pas répondu à temps${NC}"
fi

# Afficher le résumé
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✅ DÉMARRAGE RÉUSSI!           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🌐 URLs d'accès:${NC}"
echo "   Frontend:  ${YELLOW}http://localhost${NC}"
echo "   Backend:   ${YELLOW}http://localhost:5000${NC}"
echo "   DB:        ${YELLOW}localhost:5432${NC}"
echo ""
echo -e "${BLUE}📊 Commandes utiles:${NC}"
echo "   Logs (tous):       ${YELLOW}docker compose logs -f${NC}"
echo "   Logs (backend):    ${YELLOW}docker compose logs -f backend${NC}"
echo "   Status:            ${YELLOW}docker compose ps${NC}"
echo "   Arrêter:           ${YELLOW}docker compose down${NC}"
echo "   Terminal backend:  ${YELLOW}docker compose exec backend sh${NC}"
echo "   Terminal DB:       ${YELLOW}docker compose exec db psql -U postgres${NC}"
echo ""
echo -e "${BLUE}📚 Voir DOCKER.md pour plus d'infos${NC}"
