-- Migration: add granular permission columns to admins
-- Date: 2026-02-20
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS perm_jobs BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS perm_trainings BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS perm_services BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS perm_faq BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS perm_users BOOLEAN DEFAULT FALSE;

-- Optional: enable all permissions for super_admin role (uncomment and adjust if needed)
-- UPDATE admins SET perm_jobs = TRUE, perm_trainings = TRUE, perm_services = TRUE, perm_faq = TRUE, perm_users = TRUE WHERE role = 'super_admin';
