-- ============================================================================
-- Migration: Complete Super Admin System Setup
-- Description: Creates tables for admin users, roles, permissions, and content
-- ============================================================================

-- ============================================================================
-- 1. ALTER USERS TABLE: Transform full_name to first_name & last_name
-- ============================================================================

-- Add new columns first
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Migrate existing data (split full_name)
UPDATE users
SET 
  first_name = COALESCE(NULLIF(SPLIT_PART(full_name, ' ', 1), ''), 'User'),
  last_name = COALESCE(NULLIF(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1), ''), '')
WHERE full_name IS NOT NULL AND first_name IS NULL;

-- Keep full_name as computed column for backward compatibility
-- (Optional: can be removed later after frontend migration)

-- ============================================================================
-- 2. CREATE ADMIN ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- 'super_admin', 'admin_content', 'admin_users'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO admin_roles (name, description) VALUES
  ('super_admin', 'Accès complet au système'),
  ('admin_content', 'Gestion du contenu (jobs, formations, services, FAQ)'),
  ('admin_users', 'Gestion des utilisateurs et des permissions')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 3. CREATE PERMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE, -- 'perm_jobs', 'perm_trainings', etc.
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO permissions (slug, description) VALUES
  ('perm_jobs', 'Gestion des offres d''emploi'),
  ('perm_trainings', 'Gestion des formations'),
  ('perm_services', 'Gestion des services et catalogue'),
  ('perm_faq', 'Gestion des FAQ'),
  ('perm_users', 'Gestion des utilisateurs'),
  ('perm_editoriale', 'Gestion éditoriale (politique, mentions légales, etc.)'),
  ('perm_dashboard', 'Accès au tableau de bord'),
  ('perm_admin_management', 'Gestion des administrateurs'),
  ('perm_system_health', 'Consultation de la santé du système')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 4. CREATE ROLE_PERMISSIONS JUNCTION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Super Admin: ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Admin Content: Content permissions only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r, permissions p
WHERE r.name = 'admin_content' 
  AND p.slug IN ('perm_jobs', 'perm_trainings', 'perm_services', 'perm_faq', 'perm_editoriale', 'perm_dashboard')
ON CONFLICT DO NOTHING;

-- Admin Users: User and dashboard permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r, permissions p
WHERE r.name = 'admin_users'
  AND p.slug IN ('perm_users', 'perm_dashboard', 'perm_system_health')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. CREATE ADMINS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES admin_roles(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP NULL,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP NULL, -- For brute force protection
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role_id ON admins(role_id);
CREATE INDEX idx_admins_user_id ON admins(user_id);

-- ============================================================================
-- 6. CREATE ADMIN_CUSTOM_PERMISSIONS TABLE (Override permissions per admin)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_custom_permissions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN NOT NULL DEFAULT true, -- true = grant, false = revoke
  created_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(admin_id, permission_id)
);

-- ============================================================================
-- 7. CREATE JOBS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location VARCHAR(255),
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  job_type VARCHAR(50), -- 'CDI', 'CDD', 'Stage', 'Freelance'
  experience_level VARCHAR(50), -- 'Junior', 'Confirmed', 'Senior'
  contract_type VARCHAR(50),
  posted_date TIMESTAMP DEFAULT NOW(),
  deadline_date TIMESTAMP,
  is_closed BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_deadline_date ON jobs(deadline_date);
CREATE INDEX idx_jobs_is_closed ON jobs(is_closed);

-- ============================================================================
-- 8. CREATE TRAININGS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS trainings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  provider VARCHAR(255),
  duration VARCHAR(50),
  level VARCHAR(50), -- 'Beginner', 'Intermediate', 'Advanced'
  category VARCHAR(100),
  posted_date TIMESTAMP DEFAULT NOW(),
  deadline_date TIMESTAMP,
  is_closed BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  certification BOOLEAN DEFAULT false,
  cost DECIMAL(10, 2) DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trainings_deadline_date ON trainings(deadline_date);
CREATE INDEX idx_trainings_is_closed ON trainings(is_closed);

-- ============================================================================
-- 9. CREATE FAQS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_is_active ON faqs(is_active);

-- ============================================================================
-- 10. CREATE STATIC_PAGES TABLE (Gestion éditoriale)
-- ============================================================================

CREATE TABLE IF NOT EXISTS static_pages (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE, -- 'privacy-policy', 'terms-of-service', 'user-guide', 'legal'
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- Rich HTML content
  meta_description TEXT,
  published BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO static_pages (slug, title, content, published) VALUES
  ('privacy-policy', 'Politique de Confidentialité', '<p>Politique de confidentialité à compléter</p>', true),
  ('terms-of-service', 'Conditions d''Utilisation', '<p>Conditions d''utilisation à compléter</p>', true),
  ('user-guide', 'Guide Utilisateur', '<p>Guide utilisateur à compléter</p>', true),
  ('legal', 'Mentions Légales', '<p>Mentions légales à compléter</p>', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 11. CREATE AUDIT_LOG TABLE (Track admin actions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  table_name VARCHAR(100),
  record_id INTEGER,
  changes JSONB, -- {'field': {'old': '...', 'new': '...'}}
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- 12. CREATE PROMOTION_BADGES TABLE (Service promotions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS promotion_badges (
  id SERIAL PRIMARY KEY,
  service_catalog_id INTEGER REFERENCES service_catalogs(id) ON DELETE CASCADE,
  badge_text VARCHAR(100),
  badge_color VARCHAR(20), -- 'red', 'yellow', 'green', 'blue'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 13. CREATE SERVICE_RATINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_ratings (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5), -- 0-5 stars
  review_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 14. ADD INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_service_catalogs_visible ON service_catalogs(is_visible);
CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON static_pages(slug);
CREATE INDEX IF NOT EXISTS idx_static_pages_published ON static_pages(published);
