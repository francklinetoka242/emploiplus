#!/bin/bash

###############################################################################
# PM2 MANAGEMENT SCRIPT - EmployiPlus Backend Process Management
#
# Usage: bash pm2-manage.sh [start|stop|restart|status|logs|delete|save]
#
# Examples:
#   bash pm2-manage.sh start       # Start backend
#   bash pm2-manage.sh restart     # Restart backend
#   bash pm2-manage.sh logs        # Show logs
#   bash pm2-manage.sh status      # Show status
###############################################################################

set -e

# Configuration
BACKEND_DIR="/home/emploiplus-group.com/public_html/backend"
APP_NAME="emploiplus-backend"
PORT=5000

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check PM2 installation
check_pm2() {
  if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 non installé. Installation..."
    npm install -g pm2
  fi
}

# Start Backend
start_backend() {
  log_info "Démarrage du backend..."
  
  check_pm2
  
  # Check if already running
  if pm2 list | grep -q "$APP_NAME"; then
    log_warning "Le backend est déjà en cours d'exécution"
    pm2 describe "$APP_NAME"
    return 0
  fi
  
  # Check backend directory
  if [ ! -d "$BACKEND_DIR" ]; then
    log_error "Répertoire backend non trouvé: $BACKEND_DIR"
    exit 1
  fi
  
  cd "$BACKEND_DIR"
  
  # Check package.json
  if [ ! -f package.json ]; then
    log_error "package.json non trouvé"
    exit 1
  fi
  
  # Start with PM2
  pm2 start "npm run dev" \
    --name "$APP_NAME" \
    --cwd "$BACKEND_DIR" \
    --env PORT=$PORT \
    --watch false \
    --error "logs/error.log" \
    --output "logs/output.log" \
    --time || {
      log_error "Démarrage échoué"
      exit 1
    }
  
  log_success "Backend démarré avec succès"
  
  # Save PM2 config
  log_info "Sauvegarde de la configuration PM2..."
  pm2 save >> /dev/null 2>&1 || true
  
  # Setup startup
  log_info "Configuration du démarrage automatique..."
  pm2 startup >> /dev/null 2>&1 || true
  
  sleep 2
  
  # Show process info
  log_info "Détails du processus:"
  pm2 describe "$APP_NAME"
  
  log_success "Configuration complétée"
}

# Stop Backend
stop_backend() {
  log_info "Arrêt du backend..."
  
  check_pm2
  
  if ! pm2 list | grep -q "$APP_NAME"; then
    log_warning "Le backend n'est pas en cours d'exécution"
    return 0
  fi
  
  pm2 stop "$APP_NAME" || {
    log_error "Arrêt échoué"
    exit 1
  }
  
  log_success "Backend arrêté"
}

# Restart Backend
restart_backend() {
  log_info "Redémarrage du backend..."
  
  check_pm2
  
  if pm2 list | grep -q "$APP_NAME"; then
    pm2 restart "$APP_NAME" || {
      log_error "Redémarrage échoué"
      exit 1
    }
    log_success "Backend redémarré"
  else
    log_warning "Le backend n'est pas en cours d'exécution, démarrage..."
    start_backend
  fi
  
  sleep 2
  
  # Health check
  log_info "Vérification de la santé..."
  if curl -s http://localhost:$PORT/api/health > /dev/null 2>&1; then
    log_success "Backend opérationnel ✓"
  else
    log_warning "Backend ne répond pas encore, attendez quelques secondes"
  fi
}

# Show Status
show_status() {
  log_info "État des processus PM2:"
  echo ""
  pm2 status
  echo ""
  
  if pm2 list | grep -q "$APP_NAME"; then
    log_info "Informations détaillées du backend:"
    pm2 describe "$APP_NAME"
    
    # Show ports
    log_info "Ports écoutés:"
    lsof -i :$PORT 2>/dev/null || log_warning "Port $PORT non utilisé"
  fi
}

# Show Logs
show_logs() {
  log_info "Affichage des logs du backend (Ctrl+C pour arrêter)..."
  echo ""
  pm2 logs "$APP_NAME"
}

# Show Error Logs
show_error_logs() {
  log_info "Affichage des logs d'erreur..."
  echo ""
  
  if [ -f "$BACKEND_DIR/logs/error.log" ]; then
    tail -50 "$BACKEND_DIR/logs/error.log"
  else
    log_warning "Fichier d'erreur non trouvé"
  fi
}

# Delete Process
delete_process() {
  log_warning "Suppression du processus PM2..."
  
  check_pm2
  
  if pm2 list | grep -q "$APP_NAME"; then
    pm2 delete "$APP_NAME" || {
      log_error "Suppression échouée"
      exit 1
    }
    log_success "Processus supprimé"
  else
    log_warning "Le processus n'existe pas"
  fi
}

# Save PM2 Config
save_config() {
  log_info "Sauvegarde de la configuration PM2..."
  
  check_pm2
  
  pm2 save || {
    log_error "Sauvegarde échouée"
    exit 1
  }
  
  log_success "Configuration sauvegardée"
  
  # Also setup startup
  log_info "Configuration du démarrage automatique..."
  pm2 startup > /dev/null 2>&1 || true
  
  log_success "Démarrage automatique configuré"
}

# Monitor Mode
monitor() {
  log_info "Mode monitoring en temps réel (Ctrl+C pour arrêter)..."
  echo ""
  pm2 monit
}

# Health Check
health_check() {
  log_info "Vérification de la santé du backend..."
  
  local tries=0
  local max_tries=5
  
  while [ $tries -lt $max_tries ]; do
    if curl -s http://localhost:$PORT/api/health > /dev/null 2>&1; then
      log_success "Backend sain ✓"
      return 0
    fi
    
    tries=$((tries + 1))
    log_warning "Tentative $tries/$max_tries..."
    sleep 1
  done
  
  log_error "Backend ne répond pas"
  return 1
}

# Show Help
show_help() {
  cat << EOF
Usage: $(basename "$0") [COMMAND]

Commands:
  start     Démarrer le backend
  stop      Arrêter le backend
  restart   Redémarrer le backend
  status    Afficher l'état des processus
  logs      Afficher les logs en temps réel
  errors    Afficher les logs d'erreur
  delete    Supprimer le processus PM2
  monitor   Mode monitoring
  health    Vérification de santé
  save      Sauvegarder la configuration

Examples:
  bash pm2-manage.sh start
  bash pm2-manage.sh restart
  bash pm2-manage.sh logs
  bash pm2-manage.sh status

Configuration:
  APP_NAME: $APP_NAME
  PORT:     $PORT
  DIR:      $BACKEND_DIR

EOF
}

# Main
case "${1:-status}" in
  start)
    start_backend
    ;;
  stop)
    stop_backend
    ;;
  restart)
    restart_backend
    ;;
  status)
    show_status
    ;;
  logs)
    show_logs
    ;;
  errors)
    show_error_logs
    ;;
  delete)
    delete_process
    ;;
  monitor)
    monitor
    ;;
  health)
    health_check
    ;;
  save)
    save_config
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    log_error "Commande inconnue: $1"
    show_help
    exit 1
    ;;
esac
