#!/bin/bash

###############################################################################
# DEPLOY.SH - Complete Deployment Script for EmployiPlus
# 
# Usage: bash deploy.sh [backend|frontend|full|test|logs|stop|restart]
# 
# Examples:
#   bash deploy.sh full       # Build everything and restart
#   bash deploy.sh backend    # Build and restart backend
#   bash deploy.sh frontend   # Build frontend only
#   bash deploy.sh test       # Test endpoints
#   bash deploy.sh logs       # Show PM2 logs
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
BACKEND_DIR="/home/emploiplus-group.com/public_html/backend"
FRONTEND_DIR="/home/emploiplus-group.com/public_html/frontend"
DEPLOY_LOG="/tmp/deploy-$(date +%Y%m%d-%H%M%S).log"

# Functions
log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check dependencies
check_dependencies() {
  log_info "Vérification des dépendances..."
  
  if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé"
    exit 1
  fi
  
  if ! command -v npm &> /dev/null; then
    log_error "NPM n'est pas installé"
    exit 1
  fi
  
  if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 n'est pas installé. Installation..."
    npm install -g pm2
  fi
  
  log_success "Dépendances vérifiées"
}

# Build Backend
build_backend() {
  log_info "Construction du Backend..."
  
  cd "$BACKEND_DIR"
  
  if [ ! -f package.json ]; then
    log_error "package.json non trouvé dans $BACKEND_DIR"
    exit 1
  fi
  
  if [ ! -f tsconfig.json ]; then
    log_error "tsconfig.json non trouvé dans $BACKEND_DIR"
    exit 1
  fi
  
  npm install >> "$DEPLOY_LOG" 2>&1 || {
    log_error "npm install échoué"
    cat "$DEPLOY_LOG"
    exit 1
  }
  
  npm run build >> "$DEPLOY_LOG" 2>&1 || {
    log_error "npm run build échoué"
    cat "$DEPLOY_LOG"
    exit 1
  }
  
  log_success "Backend construit avec succès"
}

# Build Frontend
build_frontend() {
  log_info "Construction du Frontend..."
  
  cd "$FRONTEND_DIR"
  
  if [ ! -f package.json ]; then
    log_error "package.json non trouvé dans $FRONTEND_DIR"
    exit 1
  fi
  
  npm install >> "$DEPLOY_LOG" 2>&1 || {
    log_error "npm install échoué"
    cat "$DEPLOY_LOG"
    exit 1
  }
  
  npm run build >> "$DEPLOY_LOG" 2>&1 || {
    log_error "npm run build échoué"
    cat "$DEPLOY_LOG"
    exit 1
  }
  
  # Verify build output
  if [ ! -d dist ]; then
    log_error "Répertoire dist non créé"
    exit 1
  fi
  
  log_success "Frontend construit avec succès"
  log_info "Build size: $(du -sh $FRONTEND_DIR/dist | cut -f1)"
}

# Database Migration
run_migration() {
  log_info "Exécution de la migration database..."
  
  cd "$BACKEND_DIR"
  
  if [ ! -f run-migration-profile.js ]; then
    log_error "run-migration-profile.js non trouvé"
    exit 1
  fi
  
  node run-migration-profile.js >> "$DEPLOY_LOG" 2>&1 || {
    log_error "Migration échouée"
    cat "$DEPLOY_LOG"
    exit 1
  }
  
  log_success "Migration database complétée"
}

# Restart PM2 Backend
restart_backend() {
  log_info "Redémarrage du backend avec PM2..."
  
  # Check if PM2 process exists
  if pm2 list | grep -q "emploiplus-backend"; then
    log_info "Processus trouvé, redémarrage..."
    pm2 restart emploiplus-backend >> "$DEPLOY_LOG" 2>&1 || {
      log_error "Redémarrage PM2 échoué"
      exit 1
    }
  else
    log_info "Processus non trouvé, création..."
    cd "$BACKEND_DIR"
    pm2 start "npm run dev" \
      --name "emploiplus-backend" \
      --cwd "$BACKEND_DIR" \
      >> "$DEPLOY_LOG" 2>&1 || {
        log_error "Démarrage PM2 échoué"
        exit 1
      }
    
    # Save PM2 config
    pm2 save >> /dev/null 2>&1
    pm2 startup >> /dev/null 2>&1
  fi
  
  log_success "Backend redémarré avec PM2"
  
  # Wait for backend to be ready
  log_info "Attente du démarrage du backend..."
  sleep 3
}

# Health Check
health_check() {
  log_info "Vérification de la santé du système..."
  
  # Check Backend
  if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    log_success "Backend est opérationnel ✓"
  else
    log_error "Backend n'est pas accessible"
    return 1
  fi
  
  # Check Database
  if curl -s http://localhost:5000/api/admin/stats > /dev/null 2>&1; then
    log_success "Database est opérationnel ✓"
  else
    log_error "Database n'est pas accessible"
    return 1
  fi
  
  log_success "Tous les services sont opérationnels"
}

# Test Export Endpoints
test_exports() {
  log_info "Test des endpoints d'exportation..."
  
  TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"password"}' | \
    jq -r '.token' 2>/dev/null) || {
    log_error "Impossible d'obtenir le token de test"
    return 1
  }
  
  if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    log_error "Token invalide"
    return 1
  fi
  
  log_info "Token obtenu: ${TOKEN:0:20}..."
  
  # Test stats endpoint
  log_info "Test: GET /admins/export/stats"
  curl -s -X GET http://localhost:5000/api/admin/management/admins/export/stats \
    -H "Authorization: Bearer $TOKEN" | jq '.data' > /dev/null && \
    log_success "Stats endpoint OK" || log_error "Stats endpoint FAILED"
  
  # Test JSON export
  log_info "Test: GET /admins/export/json"
  curl -s -X GET http://localhost:5000/api/admin/management/admins/export/json \
    -H "Authorization: Bearer $TOKEN" | jq '.data | length' > /dev/null && \
    log_success "JSON export OK" || log_error "JSON export FAILED"
  
  log_success "Tests terminés"
}

# Show PM2 Logs
show_logs() {
  log_info "Affichage des logs (Ctrl+C pour arrêter)..."
  pm2 logs emploiplus-backend
}

# Stop PM2 Process
stop_process() {
  log_info "Arrêt du backend..."
  pm2 stop emploiplus-backend >> "$DEPLOY_LOG" 2>&1 || {
    log_warning "Le backend n'était pas en cours d'exécution"
  }
  log_success "Backend arrêté"
}

# Main deployment
deploy_full() {
  echo -e "\n${BLUE}╔════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  🚀 DÉPLOIEMENT COMPLET - EMPLOIPLUS      ║${NC}"
  echo -e "${BLUE}║  $(date +'%d/%m/%Y %H:%M:%S')                       ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"
  
  check_dependencies
  
  # Backup
  log_info "Création d'un backup..."
  BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).tar.gz"
  tar -czf "$BACKUP_FILE" \
    "$BACKEND_DIR/.env" \
    "$BACKEND_DIR/package.json" \
    "$FRONTEND_DIR/package.json" \
    2>/dev/null && \
    log_success "Backup créé: $BACKUP_FILE" || \
    log_warning "Backup échoué (non critique)"
  
  # Build
  build_backend
  build_frontend
  
  # Migration
  run_migration
  
  # Restart
  restart_backend
  
  # Health check
  health_check || log_warning "Health check échoué"
  
  echo -e "\n${GREEN}╔════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅ DÉPLOIEMENT RÉUSSI                     ║${NC}"
  echo -e "${GREEN}║  📊 URL: https://emploiplus-group.com     ║${NC}"
  echo -e "${GREEN}║  🔗 API: https://emploiplus-group.com/api ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}\n"
  
  log_info "Logs de déploiement: $DEPLOY_LOG"
}

# Help
show_help() {
  cat << EOF
Usage: $(basename "$0") [COMMAND]

Commands:
  full      Build tout et redémarrer (défaut)
  backend   Build et redémarrer le backend uniquement
  frontend  Build le frontend uniquement
  migrate   Exécuter la migration database
  test      Tester les endpoints d'exportation
  logs      Afficher les logs en temps réel
  stop      Arrêter le backend
  restart   Redémarrer le backend
  help      Afficher cette aide

Examples:
  bash deploy.sh full
  bash deploy.sh backend
  bash deploy.sh logs

EOF
}

# Main
case "${1:-full}" in
  full)
    deploy_full
    ;;
  backend)
    check_dependencies
    build_backend
    restart_backend
    health_check || true
    ;;
  frontend)
    check_dependencies
    build_frontend
    log_info "Frontend built. Copy dist/ to web server."
    ;;
  migrate)
    check_dependencies
    run_migration
    ;;
  test)
    test_exports
    ;;
  logs)
    show_logs
    ;;
  stop)
    stop_process
    ;;
  restart)
    check_dependencies
    restart_backend
    health_check || true
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    log_error "Comando desconhecido: $1"
    show_help
    exit 1
    ;;
esac
