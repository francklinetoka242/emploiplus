-- Migration: Add additional job fields for enhanced job descriptions
-- Date: 2026-03-07

-- Add benefits column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS benefits TEXT;

-- Add skills column (stored as JSON array)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;

-- Add contact_email column (different from application_email)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Add application_instructions column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_instructions TEXT;

-- Add contract_type column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contract_type TEXT;

-- Add comments
COMMENT ON COLUMN jobs.benefits IS 'Job benefits and perks description';
COMMENT ON COLUMN jobs.skills IS 'Required skills as JSON array';
COMMENT ON COLUMN jobs.contact_email IS 'Contact email for job inquiries';
COMMENT ON COLUMN jobs.application_instructions IS 'Special application instructions';
COMMENT ON COLUMN jobs.contract_type IS 'Type of contract (CDI, CDD, Freelance, etc.)';