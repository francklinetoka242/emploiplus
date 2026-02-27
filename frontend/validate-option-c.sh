#!/bin/bash

# ================================================================
# SCRIPT DE VALIDATION - OPTION C
# ================================================================
# Vérifie que la migration BD et synchronisation code sont OK
# Utilisation: ./validate-option-c.sh
# ================================================================

set -e

# Couleurs pour terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-emploip01_admin}"
DB_NAME="${DB_NAME:-emploiplus_db}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Compteurs
CHECKS_PASSED=0
CHECKS_FAILED=0

# Functions
log_check() {
  echo -e "${BLUE}[CHECK]${NC} $1"
}

log_pass() {
  echo -e "${GREEN}[✓ PASS]${NC} $1"
  ((CHECKS_PASSED++))
}

log_fail() {
  echo -e "${RED}[✗ FAIL]${NC} $1"
  ((CHECKS_FAILED++))
}

log_info() {
  echo -e "${YELLOW}[INFO]${NC} $1"
}

# ================================================================
# CHECKS - STRUCTURE BD
# ================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}1. VALIDATION STRUCTURE BASE DE DONNÉES${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

# Check 1: Connexion à la BD
log_check "Connexion à la BD..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
  log_pass "Connexion BD réussie"
else
  log_fail "Impossible de se connecter à la BD"
  exit 1
fi

# Check 2: Table jobs existe
log_check "Table jobs existe..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt jobs" | grep -q jobs; then
  log_pass "Table jobs trouvée"
else
  log_fail "Table jobs n'existe pas"
fi

# Check 3: Colonnes jobs attendues
log_check "Colonnes jobs (admin panel)..."
REQUIRED_COLS=("company_id" "requirements" "salary_min" "salary_max" "job_type" "experience_level" "is_closed" "updated_at")
MISSING_COLS=()

for col in "${REQUIRED_COLS[@]}"; do
  if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\d jobs" | grep -q "$col"; then
    MISSING_COLS+=("$col")
  fi
done

if [ ${#MISSING_COLS[@]} -eq 0 ]; then
  log_pass "Toutes les colonnes admin panel présentes"
else
  log_fail "Colonnes manquantes: ${MISSING_COLS[*]}"
fi

# Check 4: Colonnes jobs bonus (API publique)
log_check "Colonnes jobs (API publique - bonus)..."
BONUS_COLS=("company" "type" "salary" "sector" "image_url" "application_url")
PRESENT_BONUS=()

for col in "${BONUS_COLS[@]}"; do
  if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\d jobs" | grep -q "$col"; then
    PRESENT_BONUS+=("$col")
  fi
done

log_info "Colonnes bonus présentes: ${PRESENT_BONUS[*]}"

# Check 5: Table trainings existe
log_check "Table trainings existe..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt trainings" | grep -q trainings; then
  log_pass "Table trainings trouvée"
else
  log_fail "Table trainings n'existe pas (nécessaire pour admin panel)"
fi

# Check 6: Table faqs colonnes timestamps
log_check "Table faqs (timestamps)..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\d faqs" | grep -q "created_at"; then
  log_pass "Colonne created_at présente dans faqs"
else
  log_fail "Colonne created_at manquante dans faqs"
fi

if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\d faqs" | grep -q "updated_at"; then
  log_pass "Colonne updated_at présente dans faqs"
else
  log_fail "Colonne updated_at manquante dans faqs"
fi

# Check 7: Triggers existent
log_check "Triggers updated_at..."
TRIGGER_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_table IN ('jobs', 'faqs')" | tail -1 | awk '{print $1}')

if [ "$TRIGGER_COUNT" -ge 2 ]; then
  log_pass "Triggers créés ($TRIGGER_COUNT trouvés)"
else
  log_fail "Triggers manquants (trouvé: $TRIGGER_COUNT, attendu: 2+)"
fi

# ================================================================
# CHECKS - CODE TYPESCRIPT
# ================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}2. VALIDATION CODE TYPESCRIPT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

# Check 8: Types Job dans index.ts
log_check "Types Job dans backend/src/types/index.ts..."
if grep -q "company_id?" backend/src/types/index.ts && \
   grep -q "salary_min?" backend/src/types/index.ts && \
   grep -q "job_type?" backend/src/types/index.ts; then
  log_pass "Types Job contiennent les champs admin panel"
else
  log_fail "Types Job incomplets"
fi

# Check 9: Types Training
log_check "Types Training dans backend/src/types/index.ts..."
if grep -q "interface Training" backend/src/types/index.ts; then
  log_pass "Interface Training trouvée"
else
  log_fail "Interface Training manquante"
fi

# Check 10: Types FAQ
log_check "Types FAQ dans backend/src/types/index.ts..."
if grep -q "created_at?" backend/src/types/index.ts && \
   grep -q "updated_at?" backend/src/types/index.ts; then
  log_pass "Types FAQ contiennent timestamps"
else
  log_fail "Types FAQ incomplets"
fi

# Check 11: Contrôleur admin-dashboard.controller.ts
log_check "Contrôleur admin-dashboard.controller.ts..."
if grep -q "company_id" backend/src/controllers/admin-dashboard.controller.ts && \
   grep -q "salary_min" backend/src/controllers/admin-dashboard.controller.ts && \
   grep -q "createTraining" backend/src/controllers/admin-dashboard.controller.ts; then
  log_pass "Contrôleur admin-dashboard compatible Option C"
else
  log_fail "Contrôleur admin-dashboard incomplet"
fi

# Check 12: Contrôleur jobs.controller.ts (compatibilité API)
log_check "Contrôleur jobs.controller.ts (API publique)..."
if grep -q "SELECT.*company.*FROM jobs" backend/src/controllers/jobs.controller.ts && \
   grep -q "SELECT.*type.*FROM jobs" backend/src/controllers/jobs.controller.ts; then
  log_pass "Contrôleur jobs compatible avec colonnes bonus"
else
  log_fail "Contrôleur jobs incomplet"
fi

# ================================================================
# CHECKS - FICHIERS DE DOCUMENTATION
# ================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}3. VALIDATION DOCUMENTATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

# Check 13: Migration SQL
log_check "Fichier migration SQL (migrations/001_hybrid_option_c.sql)..."
if [ -f "migrations/001_hybrid_option_c.sql" ]; then
  log_pass "Fichier migration trouvé"
else
  log_fail "Fichier migration manquant"
fi

# Check 14: Audit doc
log_check "Fichier AUDIT_BD_CODE_DIVERGENCES.md..."
if [ -f "AUDIT_BD_CODE_DIVERGENCES.md" ]; then
  log_pass "Fichier audit trouvé"
else
  log_fail "Fichier audit manquant"
fi

# Check 15: Implementation doc
log_check "Fichier IMPLEMENTATION_OPTION_C.md..."
if [ -f "IMPLEMENTATION_OPTION_C.md" ]; then
  log_pass "Fichier implémentation trouvé"
else
  log_fail "Fichier implémentation manquant"
fi

# ================================================================
# RÉSUMÉ
# ================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}RÉSUMÉ VALIDATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))
echo -e "Checks Passés:  ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks Échoués: ${RED}$CHECKS_FAILED${NC}"
echo -e "Total:          $TOTAL\n"

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ VALIDATION RÉUSSIE!${NC}"
  echo -e "L'Option C est prête à être déployée!\n"
  exit 0
else
  echo -e "${RED}✗ VALIDATION ÉCHOUÉE${NC}"
  echo -e "Veuillez corriger les erreurs ci-dessus avant de déployer.\n"
  exit 1
fi
