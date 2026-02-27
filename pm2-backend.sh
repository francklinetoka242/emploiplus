#!/bin/bash

###############################################################################
# PM2 BACKEND MANAGEMENT - Restart / Start / Stop Backend Service
#
# Usage:
#   bash pm2-backend.sh restart     # Redémarrer le backend
#   bash pm2-backend.sh start       # Lancer le backend
#   bash pm2-backend.sh stop        # Arrêter le backend
#   bash pm2-backend.sh status      # Afficher le statut
#   bash pm2-backend.sh logs        # Voir les logs
#
###############################################################################

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Config
APP_NAME="emploiplus-backend"
BACKEND_DIR="/home/emploiplus-group.com/public_html/backend"
PORT="5000"

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

###############################################################################
# FUNCTIONS
###############################################################################

check_pm2() {
  if ! command -v pm2 &> /dev/null; then
    log_error "PM2 n'est pas installé"
    log_info "Installation: npm install -g pm2"
    exit 1
  fi
}

check_backend_exists() {
  if [ ! -d "$BACKEND_DIR" ]; then
    log_error "Répertoire backend non trouvé: $BACKEND_DIR"
    exit 1
  fi
}

backend_start() {
  echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  🚀 LANCER LE BACKEND                 ║${NC}"
  echo -e "${BLUE}║  $(date +'%d/%m/%Y %H:%M:%S')                  ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
  
  check_pm2
  check_backend_exists
  
  # Check if already running
  if pm2 list | grep -q "$APP_NAME"; then
    log_warning "Le backend est déjà en cours d'exécution"
    log_info "Utiliser: bash pm2-backend.sh restart"
    pm2 info "$APP_NAME"
    return 0
  fi
  
  log_info "Lancement du backend sur le port $PORT..."
  
  cd "$BACKEND_DIR"
  
  pm2 start "npm run dev" \
    --name "$APP_NAME" \
    --cwd "$BACKEND_DIR" \
    --error "logs/error.log" \
    --output "logs/output.log" \
    --watch src || {
    log_error "Erreur au lancement du backend"
    exit 1
  }
  
  sleep 2
  
  # Verify
  if pm2 list | grep -q "$APP_NAME"; then
    log_success "Backend lancé avec succès"
    pm2 info "$APP_NAME"
  else
    log_error "Échec du lancement du backend"
    exit 1
  fi
  
  echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅ BACKEND LANCÉ                     ║${NC}"
  echo -e "${GREEN}║  URL: http://localhost:$PORT           ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"
}

backend_restart() {
  echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  🔄 REDÉMARRER LE BACKEND             ║${NC}"
  echo -e "${BLUE}║  $(date +'%d/%m/%Y %H:%M:%S')                  ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
  
  check_pm2
  check_backend_exists
  
  # Check if running
  if ! pm2 list | grep -q "$APP_NAME"; then
    log_warning "Le backend n'est pas en cours d'exécution"
    log_info "Lancement du backend..."
    backend_start
    return $?
  fi
  
  log_info "Redémarrage du backend..."
  
  pm2 restart "$APP_NAME" || {
    log_error "Erreur au redémarrage"
    exit 1
  }
  
  sleep 2
  
  log_success "Backend redémarré avec succès"
  
  # Show info
  pm2 info "$APP_NAME"
  
  echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅ BACKEND REDÉMARRÉ                 ║${NC}"
  echo -e "${GREEN}║  URL: http://localhost:$PORT           ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"
}

backend_stop() {
  echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  ⏹️  ARRÊTER LE BACKEND                ║${NC}"
  echo -e "${BLUE}║  $(date +'%d/%m/%Y %H:%M:%S')                  ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
  
  check_pm2
  
  if ! pm2 list | grep -q "$APP_NAME"; then
    log_warning "Le backend n'est pas en cours d'exécution"
    return 0
  fi
  
  log_info "Arrêt du backend..."
  
  pm2 stop "$APP_NAME" || {
    log_error "Erreur à l'arrêt"
    exit 1
  }
  
  log_success "Backend arrêté"
  
  echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅ BACKEND ARRÊTÉ                    ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"
}

backend_status() {
  echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  📊 STATUT DU BACKEND                 ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
  
  check_pm2
  
  echo -e "${CYAN}Tous les processus PM2:${NC}"
  pm2 list
  
  echo -e "\n${CYAN}Processus: $APP_NAME${NC}"
  if pm2 list | grep -q "$APP_NAME"; then
    pm2 info "$APP_NAME"
  else
    log_warning "Le backend n'est pas en cours d'exécution"
  fi
  
  echo ""
}

backend_logs() {
  check_pm2
  
  if ! pm2 list | grep -q "$APP_NAME"; then
    log_error "Le backend n'est pas en cours d'exécution"
    exit 1
  fi
  
  echo -e "\n${BLUE}Affichage des logs du backend (Ctrl+C pour quitter)${NC}\n"
  pm2 logs "$APP_NAME"
}

health_check() {
  echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  🏥 VÉRIFICATION DE SANTÉ             ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
  
  # Check if running
  if ! pm2 list | grep -q "$APP_NAME"; then
    log_error "Le backend n'est pas en cours d'exécution"
    return 1
  fi
  
  log_info "Vérification de l'endpoint /api/health..."
  
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health)
  
  if [ "$RESPONSE" = "200" ]; then
    log_success "Backend en bonne santé (HTTP $RESPONSE)"
    return 0
  else
    log_error "Backend pas accessible (HTTP $RESPONSE)"
    return 1
  fi
}

setup_startup() {
  echo -e "\n${BLUE}Configuration du démarrage automatique${NC}\n"
  check_pm2
  
  log_info "Configuration de PT2 pour démarrage au boot..."
  
  pm2 startup || {
    log_error "Erreur lors de la configuration du startup"
    exit 1
  }
  
  log_info "Sauvegarde de la configuration PM2..."
  pm2 save || {
    log_error "Erreur lors de la sauvegarde"
    exit 1
  }
  
  log_success "Configuration du démarrage automatique réussie"
  echo ""
}

###############################################################################
# MAIN
###############################################################################

case "${1:-status}" in
  start)
    backend_start
    ;;
  restart)
    backend_restart
    ;;
  stop)
    backend_stop
    ;;
  status)
    backend_status
    ;;
  logs)
    backend_logs
    ;;
  health)
    health_check
    ;;
  setup-startup)
    setup_startup
    ;;
  *)
    echo "╔════════════════════════════════════════╗"
    echo "║  PM2 BACKEND MANAGEMENT                ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "Usage: bash pm2-backend.sh COMMAND"
    echo ""
    echo "Commands:"
    echo "  start           - Lancer le backend"
    echo "  restart         - Redémarrer le backend"
    echo "  stop            - Arrêter le backend"
    echo "  status          - Afficher le statut"
    echo "  logs            - Voir les logs en direct"
    echo "  health          - Vérifier la santé du service"
    echo "  setup-startup   - Configurer démarrage au boot"
    echo ""
    exit 1
    ;;
esac
