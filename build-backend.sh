#!/bin/bash

###############################################################################
# BUILD BACKEND - TypeScript Build Script
#
# Usage: bash build-backend.sh
#
###############################################################################

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Paths
BACKEND_DIR="/home/emploiplus-group.com/public_html/backend"

log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

###############################################################################
# BACKEND BUILD
###############################################################################

echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🏗️  BUILD BACKEND - TYPESCRIPT        ║${NC}"
echo -e "${BLUE}║  $(date +'%d/%m/%Y %H:%M:%S')                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

if [ ! -d "$BACKEND_DIR" ]; then
  log_error "Répertoire backend non trouvé"
  exit 1
fi

cd "$BACKEND_DIR"

# Check files
if [ ! -f package.json ]; then
  log_error "package.json non trouvé"
  exit 1
fi

if [ ! -f tsconfig.json ]; then
  log_error "tsconfig.json non trouvé"
  exit 1
fi

# Install dependencies
log_info "Installation des dépendances..."
npm install || {
  log_error "npm install échoué"
  exit 1
}
log_success "Dépendances installées"

# Build
log_info "Compilation TypeScript..."
npm run build || {
  log_error "npm run build échoué"
  exit 1
}

# Verify dist
if [ ! -d dist ]; then
  log_error "Répertoire dist non créé"
  exit 1
fi

# Stats
DIST_SIZE=$(du -sh dist | cut -f1)
FILE_COUNT=$(find dist -type f | wc -l)

log_success "Build terminé avec succès"
log_info "Taille: $DIST_SIZE (fichiers: $FILE_COUNT)"

echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ BACKEND BUILD RÉUSSI              ║${NC}"
echo -e "${GREEN}║  📁 Répertoire: $BACKEND_DIR/dist     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"
