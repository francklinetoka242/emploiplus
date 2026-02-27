#!/bin/bash

###############################################################################
#
# 🧹 NETTOYAGE SYSTÈME - Emploi Plus Backend
#
# Script de nettoyage automatique qui:
# ✅ Déplace les fichiers orphelins vers _archive_old/
# ✅ Supprime les doublons .js compilés
# ✅ Supprime le code mort (.bak, .old)
# ✅ Nettoie le cache de build
# ✅ Libère RAM du VPS
#
# Auteur: Copilot (Claude Haiku)
# Date: 24 Février 2026
# Usage: bash nettoyage_systeme.sh [--dry-run] [--verbose]
#
###############################################################################

set -o pipefail

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
DRY_RUN=false
VERBOSE=false
CONFIRM=true

# Répertoires de travail
PROJECT_ROOT="${1:-.}"
ARCHIVE_DIR="${PROJECT_ROOT}/_archive_old"
SRC_DIR="${PROJECT_ROOT}/src"
NODE_MODULES="${PROJECT_ROOT}/node_modules"
DIST_DIR="${PROJECT_ROOT}/dist"
BUILD_DIR="${PROJECT_ROOT}/build"

# Statistiques
TOTAL_FILES_ARCHIVED=0
TOTAL_FILES_DELETED=0
TOTAL_SPACE_FREED=0

# ═══════════════════════════════════════════════════════════════════════════════
# FONCTIONS UTILITAIRES
# ═══════════════════════════════════════════════════════════════════════════════

log() {
  echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $*"
}

log_warn() {
  echo -e "${YELLOW}[⚠]${NC} $*"
}

log_error() {
  echo -e "${RED}[✗]${NC} $*"
}

log_verbose() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[VERBOSE]${NC} $*"
  fi
}

get_size_readable() {
  local size=$1
  if [ "$size" -lt 1024 ]; then
    echo "${size}B"
  elif [ "$size" -lt 1048576 ]; then
    echo "$(( size / 1024 ))KB"
  else
    echo "$(( size / 1048576 ))MB"
  fi
}

get_size_bytes() {
  local path=$1
  if [ -f "$path" ]; then
    stat -f%z "$path" 2>/dev/null || stat -c%s "$path" 2>/dev/null || echo 0
  elif [ -d "$path" ]; then
    du -sb "$path" | awk '{print $1}'
  else
    echo 0
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 1 : Préparer le répertoire d'archive
# ═══════════════════════════════════════════════════════════════════════════════

setup_archive_dir() {
  log "Préparation du répertoire d'archive..."

  if [ ! -d "$ARCHIVE_DIR" ]; then
    if [ "$DRY_RUN" = false ]; then
      mkdir -p "$ARCHIVE_DIR"
      log_success "Répertoire d'archive créé: $ARCHIVE_DIR"
    else
      log_verbose "[DRY-RUN] Créer répertoire: $ARCHIVE_DIR"
    fi
  else
    log_verbose "Répertoire d'archive existe déjà: $ARCHIVE_DIR"
  fi

  # Créer un fichier README dans l'archive
  if [ "$DRY_RUN" = false ]; then
    cat > "$ARCHIVE_DIR/README.md" << 'EOF'
# Archive des Fichiers Supprimés

Ce répertoire contient les fichiers qui ont été supprimés lors du nettoyage du système.

## Contenu

- **Code mort** : Fichiers .old, .bak qui ne sont plus utilisés
- **Fichiers générés** : .js compilés, .map sourcemaps
- **Doublons** : Fichiers dupliqués avec différentes conventions de nommage

## Restauration

Pour restaurer un fichier:
```bash
cp _archive_old/path/to/file src/path/to/file
```

## Suppression permanente

Pour supprimer définitivement l'archive:
```bash
rm -rf _archive_old
```

---
Archivé le: $(date)
EOF
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 2 : Déplacer les fichiers orphelins (.bak, .old)
# ═══════════════════════════════════════════════════════════════════════════════

archive_dead_code() {
  log "Archivage du code mort (.bak, .old)..."

  # Patterns à archiver
  local patterns=(
    "*.bak"
    "*.old"
    "*.backup"
    "*.ts.bak"
    "*.js.bak"
    "server.old.ts"
    "server.ts.bak"
  )

  for pattern in "${patterns[@]}"; do
    local files=()
    
    # Trouver les fichiers avec ce pattern
    while IFS= read -r -d '' file; do
      files+=("$file")
    done < <(find "$SRC_DIR" -name "$pattern" -type f -print0 2>/dev/null)

    for file in "${files[@]}"; do
      local relative_path="${file#$PROJECT_ROOT/}"
      local archive_path="$ARCHIVE_DIR/$relative_path"
      local archive_path_dir=$(dirname "$archive_path")
      local file_size=$(get_size_bytes "$file")

      if [ "$DRY_RUN" = false ]; then
        mkdir -p "$archive_path_dir"
        mv "$file" "$archive_path"
        log_success "Archivé: $relative_path ($(get_size_readable $file_size))"
      else
        log_verbose "[DRY-RUN] Archiver: $relative_path ($(get_size_readable $file_size))"
      fi

      TOTAL_FILES_ARCHIVED=$((TOTAL_FILES_ARCHIVED + 1))
      TOTAL_SPACE_FREED=$((TOTAL_SPACE_FREED + file_size))
    done
  done
}

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 3 : Archiver les fichiers générés (.js, .d.ts, .map)
# ═══════════════════════════════════════════════════════════════════════════════

archive_compiled_files() {
  log "Archivage des fichiers générés (.js, .d.ts, .map)..."

  # Patterns à archiver (fichiers générés par tsc)
  local patterns=(
    "*.js"
    "*.d.ts"
    "*.d.ts.map"
    "*.js.map"
  )

  # EXCLUSIONS: Ne pas archiver les fichiers criitques
  local exclude_patterns=(
    "node_modules"
    "dist"
    "build"
    "public"
  )

  for pattern in "${patterns[@]}"; do
    local files=()
    
    # Trouver les fichiers avec ce pattern
    while IFS= read -r -d '' file; do
      files+=("$file")
    done < <(find "$SRC_DIR" -name "$pattern" -type f -print0 2>/dev/null)

    for file in "${files[@]}"; do
      # Vérifier si le fichier est dans une zone exclue
      local skip=false
      for exclude in "${exclude_patterns[@]}"; do
        if [[ "$file" == *"$exclude"* ]]; then
          skip=true
          break
        fi
      done

      if [ "$skip" = true ]; then
        log_verbose "Ignoré (zone exclue): $file"
        continue
      fi

      local relative_path="${file#$PROJECT_ROOT/}"
      local archive_path="$ARCHIVE_DIR/$relative_path"
      local archive_path_dir=$(dirname "$archive_path")
      local file_size=$(get_size_bytes "$file")

      if [ "$DRY_RUN" = false ]; then
        mkdir -p "$archive_path_dir"
        mv "$file" "$archive_path"
        log_success "Archivé: $relative_path ($(get_size_readable $file_size))"
      else
        log_verbose "[DRY-RUN] Archiver: $relative_path ($(get_size_readable $file_size))"
      fi

      TOTAL_FILES_ARCHIVED=$((TOTAL_FILES_ARCHIVED + 1))
      TOTAL_SPACE_FREED=$((TOTAL_SPACE_FREED + file_size))
    done
  done
}

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 4 : Détecter et archiver les doublons
# ═══════════════════════════════════════════════════════════════════════════════

archive_duplicates() {
  log "Détection et archivage des doublons..."

  # Doublons connus
  declare -A duplicates=(
    # Format: [canonical]="duplicate1 duplicate2 ..."
    ["auth-auth.ts"]="authMiddleware.ts authMiddleware.js"
    ["auth.controller.ts"]="authController.ts"
    ["admin-auth.ts"]="adminAuth.ts"
  )

  for canonical in "${!duplicates[@]}"; do
    local duplicates_list="${duplicates[$canonical]}"
    
    for duplicate in $duplicates_list; do
      local files=()
      
      while IFS= read -r -d '' file; do
        files+=("$file")
      done < <(find "$SRC_DIR" -name "$duplicate" -type f -print0 2>/dev/null)

      for file in "${files[@]}"; do
        local relative_path="${file#$PROJECT_ROOT/}"
        local archive_path="$ARCHIVE_DIR/$relative_path"
        local archive_path_dir=$(dirname "$archive_path")
        local file_size=$(get_size_bytes "$file")

        if [ "$DRY_RUN" = false ]; then
          mkdir -p "$archive_path_dir"
          mv "$file" "$archive_path"
          log_success "Archivé (doublon): $relative_path → Gardé: $canonical"
        else
          log_verbose "[DRY-RUN] Archiver (doublon): $relative_path"
        fi

        TOTAL_FILES_ARCHIVED=$((TOTAL_FILES_ARCHIVED + 1))
        TOTAL_SPACE_FREED=$((TOTAL_SPACE_FREED + file_size))
      done
    done
  done
}

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 5 : Nettoyer les répertoires de build
# ═══════════════════════════════════════════════════════════════════════════════

cleanup_build_cache() {
  log "Nettoyage du cache de build et de distribution..."

  local dirs_to_clean=(
    "$DIST_DIR"
    "$BUILD_DIR"
    "${PROJECT_ROOT}/.turbo"
    "${PROJECT_ROOT}/.next"
    "${PROJECT_ROOT}/.cache"
    "${PROJECT_ROOT}/coverage"
  )

  for dir in "${dirs_to_clean[@]}"; do
    if [ -d "$dir" ]; then
      local dir_size=$(get_size_bytes "$dir")

      if [ "$DRY_RUN" = false ]; then
        rm -rf "$dir"
        log_success "Supprimé: $dir ($(get_size_readable $dir_size))"
      else
        log_verbose "[DRY-RUN] Supprimer: $dir ($(get_size_readable $dir_size))"
      fi

      TOTAL_FILES_DELETED=$((TOTAL_FILES_DELETED + 1))
      TOTAL_SPACE_FREED=$((TOTAL_SPACE_FREED + dir_size))
    fi
  done
}

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 6 : Optimiser .gitignore
# ═══════════════════════════════════════════════════════════════════════════════

optimize_gitignore() {
  log "Optimisation du .gitignore..."

  local gitignore="${PROJECT_ROOT}/.gitignore"

  if [ "$DRY_RUN" = false ]; then
    cat >> "$gitignore" << 'EOF'

# ═════════════════════════════════════════════
# BUILD & COMPILATION ARTIFACTS (Auto-Generated)
# ═════════════════════════════════════════════
src/**/*.js
src/**/*.js.map
src/**/*.d.ts
src/**/*.d.ts.map
dist/
build/
.turbo/
.next/
coverage/

# ═════════════════════════════════════════════
# DEAD CODE & BACKUPS
# ═════════════════════════════════════════════
*.bak
*.backup
*.old
server.old.ts
server.ts.bak

# ═════════════════════════════════════════════
# ENVIRONMENT & SECRETS
# ═════════════════════════════════════════════
.env
.env.local
.env.*.local

# ═════════════════════════════════════════════
# DEPENDENCIES
# ═════════════════════════════════════════════
node_modules/
package-lock.json
yarn.lock

# ═════════════════════════════════════════════
# IDE & OS
# ═════════════════════════════════════════════
.vscode/
.idea/
*.swp
*.swo
.DS_Store
EOF
    log_success "Fichier .gitignore optimisé"
  else
    log_verbose "[DRY-RUN] Optimiser .gitignore"
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 7 : Libérer la mémoire du VPS
# ═══════════════════════════════════════════════════════════════════════════════

free_vps_memory() {
  log "Libération des ressources du VPS..."

  if [ "$DRY_RUN" = false ]; then
    # Vider le cache du système (safe, ne supprime que les caches)
    if command -v sync &> /dev/null; then
      sync
      log_success "Cache synchronisé"
    fi

    # Sur Linux: Nettoyer les caches du filesystem
    if [ -f /proc/sys/vm/drop_caches ] && [ "$EUID" -eq 0 ]; then
      echo 3 > /proc/sys/vm/drop_caches
      log_success "Caches du filesystem libérés"
    elif [ -f /proc/sys/vm/drop_caches ]; then
      log_warn "Caches du filesystem (nécessite root): sudo bash nettoyage_systeme.sh"
    fi

    # Redémarrer npm cache
    if command -v npm &> /dev/null; then
      npm cache clean --force
      log_success "Cache npm nettoyé"
    fi
  else
    log_verbose "[DRY-RUN] Libérer les ressources VPS"
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 8 : Rapport final
# ═══════════════════════════════════════════════════════════════════════════════

generate_report() {
  log ""
  log "════════════════════════════════════════════════════════════════"
  log "📊 RAPPORT FINAL DE NETTOYAGE"
  log "════════════════════════════════════════════════════════════════"
  log ""
  log_success "Fichiers archivés: $TOTAL_FILES_ARCHIVED"
  log_success "Répertoires supprimés: $TOTAL_FILES_DELETED"
  log_success "Espace libéré: $(get_size_readable $TOTAL_SPACE_FREED)"
  log ""

  if [ "$DRY_RUN" = true ]; then
    log_warn "Mode DRY-RUN: Aucun changement n'a été appliqué."
    log "Relancez sans --dry-run pour appliquer les changements:"
    log "  bash nettoyage_systeme.sh"
  else
    log_success "✅ Nettoyage terminé avec succès!"
    log ""
    log "Prochaines étapes:"
    log "  1. Relancer le backend: npm run build && npm start"
    log "  2. Vérifier les logs: tail -f logs/emploiplus-group.com.error_log"
    log "  3. Tester les endpoints: curl http://localhost:5000/_health"
  fi

  log ""
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

main() {
  # Parser les arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      --dry-run)
        DRY_RUN=true
        log_warn "Mode DRY-RUN activé"
        shift
        ;;
      --verbose|-v)
        VERBOSE=true
        shift
        ;;
      --no-confirm)
        CONFIRM=false
        shift
        ;;
      *)
        PROJECT_ROOT="$1"
        shift
        ;;
    esac
  done

  # Vérifier que le répertoire existe
  if [ ! -d "$PROJECT_ROOT" ]; then
    log_error "Répertoire invalide: $PROJECT_ROOT"
    exit 1
  fi

  # Prompt de confirmation (sauf en dry-run)
  if [ "$DRY_RUN" = false ] && [ "$CONFIRM" = true ]; then
    echo ""
    log_warn "⚠️  ATTENTION: Ce script va modifier/supprimer des fichiers."
    echo ""
    echo "Fichiers qui seront archivés:"
    echo "  - *.bak, *.old, *.backup"
    echo "  - *.js, *.d.ts, *.map (compilés)"
    echo "  - Doublons connus"
    echo ""
    echo "Répertoires qui seront supprimés:"
    echo "  - dist/, build/, .turbo/, .next/, coverage/"
    echo ""
    read -p "Continuer? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      log_error "Annulé par l'utilisateur."
      exit 1
    fi
  fi

  # Exécuter les étapes
  log ""
  setup_archive_dir
  archive_dead_code
  archive_compiled_files
  archive_duplicates
  cleanup_build_cache
  optimize_gitignore
  free_vps_memory
  generate_report
}

# Lancer le script
main "$@"
