-- Migration: 002_optimize_jobs_indexing.sql
-- Description: Ajoute les index essentiels pour optimiser les recherches et filtres sur la table jobs
-- Date: 2026-01-20

-- ============================================================================
-- 1. INDEX SUR LES COLONNES DE FILTRAGE LES PLUS UTILISÉES
-- ============================================================================

-- Index sur type de contrat (CDI, CDD, Stage, Freelance)
CREATE INDEX IF NOT EXISTS idx_jobs_type 
  ON jobs(type) 
  WHERE published = true;

-- Index sur localisation (pour recherches géographiques)
CREATE INDEX IF NOT EXISTS idx_jobs_location 
  ON jobs(location) 
  WHERE published = true;

-- Index sur secteur d'activité
CREATE INDEX IF NOT EXISTS idx_jobs_sector 
  ON jobs(sector) 
  WHERE published = true;

-- Index composite pour filtrage par type + location + sector
CREATE INDEX IF NOT EXISTS idx_jobs_type_location_sector 
  ON jobs(type, location, sector) 
  WHERE published = true;

-- Index sur la colonne published pour les requêtes WHERE published = true
CREATE INDEX IF NOT EXISTS idx_jobs_published 
  ON jobs(published, created_at DESC);

-- ============================================================================
-- 2. INDEX FULL TEXT SEARCH POUR LA RECHERCHE PAR MOTS-CLÉS
-- ============================================================================

-- Créer une colonne générée pour le Full Text Search (combine titre, description, entreprise, secteur)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS search_text tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('french', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('french', COALESCE(company, '')), 'B') ||
  setweight(to_tsvector('french', COALESCE(description, '')), 'C') ||
  setweight(to_tsvector('french', COALESCE(sector, '')), 'B')
) STORED;

-- Index GIN (Generalized Inverted Index) pour le Full Text Search
CREATE INDEX IF NOT EXISTS idx_jobs_search_text_gin 
  ON jobs 
  USING GIN(search_text);

-- ============================================================================
-- 3. AMÉLIORATION DE LA REQUÊTE DE RÉCUPÉRATION (VIEW)
-- ============================================================================

-- Créer une vue optimisée pour les listes (sans description complète)
CREATE OR REPLACE VIEW jobs_list_view AS
SELECT 
  id,
  title,
  company,
  company_id,
  company_logo,
  location,
  type,
  sector,
  salary,
  application_via_emploi,
  application_url,
  user_type,
  deadline,
  published_at,
  created_at,
  published
FROM jobs
WHERE published = true
ORDER BY created_at DESC;

-- Créer une vue complète pour les détails (avec description)
CREATE OR REPLACE VIEW jobs_detail_view AS
SELECT 
  id,
  title,
  company,
  company_id,
  company_logo,
  location,
  type,
  sector,
  salary,
  description,
  application_via_emploi,
  application_url,
  user_type,
  deadline,
  published_at,
  created_at,
  published
FROM jobs
WHERE published = true;

-- ============================================================================
-- 4. AMÉLIORATION DES PERFORMANCES GLOBALES
-- ============================================================================

-- ANALYZE permet à PostgreSQL de mettre à jour les statistiques pour l'optimiseur de requêtes
ANALYZE jobs;

-- ============================================================================
-- 5. LOGGING DE LA MIGRATION
-- ============================================================================

-- Insérer un log de cette migration
INSERT INTO schema_migrations (name, executed_at) 
VALUES ('002_optimize_jobs_indexing.sql', NOW())
ON CONFLICT DO NOTHING;
