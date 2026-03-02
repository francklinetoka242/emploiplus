-- Migration: Add missing columns to admins table
-- This fixes the "column 'role' does not exist" error during login
-- Run this on your VPS database: psql -U your_user -d your_db -f 001_add_role_to_admins.sql

-- Add role column if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role character varying(50) DEFAULT 'admin' NOT NULL;

-- Add is_verified column if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Add is_active column if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add updated_at column if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Add verification_token if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS verification_token text;

-- Add perm_manage_users if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_manage_users boolean DEFAULT false;

-- Add perm_manage_roles if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_manage_roles boolean DEFAULT false;

-- Add perm_edit_content if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_edit_content boolean DEFAULT false;

-- Add perm_publish_content if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_publish_content boolean DEFAULT false;

-- Add perm_view_audit_logs if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_view_audit_logs boolean DEFAULT false;

-- Add perm_manage_services if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_manage_services boolean DEFAULT false;

-- Add perm_manage_faq if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_manage_faq boolean DEFAULT false;

-- Add perm_manage_settings if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_manage_settings boolean DEFAULT false;

-- Add perm_manage_catalog if it doesn't exist
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_manage_catalog boolean DEFAULT false;

-- Add other permission columns if missing
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_jobs boolean DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_trainings boolean DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_services boolean DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_faq boolean DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_users boolean DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS perm_editoriale boolean DEFAULT false;

-- Add other metadata columns
ALTER TABLE admins ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS department character varying(100);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}'::jsonb;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS subscription_id integer;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role_level integer DEFAULT 1;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS status character varying(20) DEFAULT 'pending'::character varying;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS profile_picture text;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS activation_token text;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS token_expires_at timestamp without time zone;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS reset_token character varying;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS reset_token_expires timestamp without time zone;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS bio text;

-- Create index on email for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS admins_email_idx ON admins(email);

-- Create index on role for filter queries
CREATE INDEX IF NOT EXISTS admins_role_idx ON admins(role);

-- Set all existing admins to 'super_admin' role if role is null (for first deployment)
UPDATE admins SET role = 'super_admin' WHERE role IS NULL;

-- Confirm changes
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'admins' ORDER BY ordinal_position;
