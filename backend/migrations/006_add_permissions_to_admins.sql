-- Add permissions column to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]'::jsonb;

-- Add index for permissions queries
CREATE INDEX IF NOT EXISTS idx_admins_permissions ON admins USING gin(permissions);