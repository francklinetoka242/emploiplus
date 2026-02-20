-- Migration: add perm_editoriale column to admins
-- Date: 2026-02-20
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS perm_editoriale BOOLEAN DEFAULT FALSE;

-- Optional: enable perm_editoriale for super_admin role
-- UPDATE admins SET perm_editoriale = TRUE WHERE role = 'super_admin';
