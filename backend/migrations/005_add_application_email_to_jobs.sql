-- Migration: Add application_email column to jobs table
-- This migration adds the application_email field to allow direct email applications

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_email TEXT;

-- Add comment for documentation
COMMENT ON COLUMN jobs.application_email IS 'Email address for direct job applications';