-- Add missing fields to admins table for profile information
ALTER TABLE admins ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS profile_photo text;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'admin';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role_level integer DEFAULT 1;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role_level ON admins(role_level);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
