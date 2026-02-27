-- =================================================================
-- MIGRATION BD - OPTION C (APPROCHE HYBRIDE)
-- =================================================================
-- Date: 21 février 2026
-- Objectif: Adapter la BD pour correspondre au code admin-dashboard
-- 
-- Stratégie:
-- 1. Corriger divergences table `jobs`
-- 2. Créer table complète `trainings`
-- 3. Ajouter timestamps à table `faqs`
-- 4. Garder champs "bonus" en BD
-- =================================================================

-- ============================================================
-- 1. MIGRATION TABLE JOBS
-- ============================================================

-- Vérifier l'état actuel
-- \d jobs

-- 1.1 Ajouter colonnes manquantes à jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_id INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requirements TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_min NUMERIC(12, 2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_max NUMERIC(12, 2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type VARCHAR(100);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_level VARCHAR(100);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 1.2 Migrer données existantes (si nécessaire)
-- Copier les valeurs de 'type' vers 'job_type' si vide
UPDATE jobs SET job_type = type WHERE job_type IS NULL AND type IS NOT NULL;

-- Copier les valeurs de 'deadline' vers 'deadline_date' si vide
UPDATE jobs SET deadline_date = deadline WHERE deadline_date IS NULL AND deadline IS NOT NULL;

-- Parser salary (format attendu: "50000-70000" ou "50000" ou similaire)
-- Cette partie dépend de vos données réelles - exemple:
UPDATE jobs 
SET salary_min = CAST(SPLIT_PART(TRIM(LEADING FROM salary), '-', 1) AS NUMERIC),
    salary_max = CASE 
                   WHEN salary LIKE '%-%' THEN CAST(TRIM(SPLIT_PART(salary, '-', 2)) AS NUMERIC)
                   ELSE CAST(TRIM(salary) AS NUMERIC)
                 END
WHERE salary IS NOT NULL AND (salary_min IS NULL OR salary_max IS NULL);

-- 1.3 Garder les colonnes "bonus" (ne pas les supprimer)
-- Les colonnes suivantes restent mais ne sont pas utilisées par le code admin:
-- - sector (text)
-- - image_url (text)
-- - application_url (text)
-- - published (boolean)
-- - published_at (timestamp)

-- 1.4 Optionnel: Créer une FK vers users/companies pour company_id
-- Si company_id représente l'ID de l'utilisateur/company qui poste l'offre:
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_company_id 
  FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================
-- 2. CRÉER TABLE TRAININGS
-- ============================================================

CREATE TABLE IF NOT EXISTS trainings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  provider VARCHAR(255),
  duration VARCHAR(100),
  level VARCHAR(50),
  category VARCHAR(100),
  deadline_date TIMESTAMP,
  certification VARCHAR(255),
  cost NUMERIC(12, 2),
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_trainings_category ON trainings(category);
CREATE INDEX IF NOT EXISTS idx_trainings_deadline ON trainings(deadline_date);

-- ============================================================
-- 3. MIGRATION TABLE FAQS
-- ============================================================

-- 3.1 Ajouter timestamps manquants
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 3.2 Créer trigger pour auto-update updated_at
CREATE OR REPLACE FUNCTION update_timestamp_faqs()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_faqs_updated_at ON faqs;
CREATE TRIGGER trigger_faqs_updated_at
BEFORE UPDATE ON faqs
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_faqs();

-- ============================================================
-- 4. OPTIONNEL: CRÉER TRIGGER POUR JOBS.updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_timestamp_jobs()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_jobs_updated_at ON jobs;
CREATE TRIGGER trigger_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_jobs();

-- ============================================================
-- 5. VÉRIFICATION - AFFICHER LES STRUCTURES FINALES
-- ============================================================

-- À exécuter après la migration:
-- \d jobs
-- \d faqs
-- \d trainings

-- ============================================================
-- 6. NOTES IMPORTANTES
-- ============================================================

-- Migration Salary (si données différentes):
-- Les formats résultent possibles pour salary dans la BD:
-- - "50000-70000" → salary_min=50000, salary_max=70000
-- - "50000" → salary_min=50000, salary_max=50000
-- - "50K-70K" → Nécessite du parsing additionnel
-- 
-- Si vos données ont un format différent, adapter la requête UPDATE ci-dessus.

-- Company ID:
-- Si company_id devrait référencer une autre table (companies, teams, etc),
-- adapter la FK ci-dessus.

-- Colonnes Bonus (non supprimées):
-- Les champs sector, image_url, etc. restent en BD mais ne sont pas
-- utilisés par le panel admin. Ils peuvent être utilisés par d'autres
-- modules ou APIs.

-- ============================================================
-- FIN MIGRATION
-- ============================================================
