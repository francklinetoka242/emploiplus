-- Migration 010: Add email column to companies table
-- This adds support for company contact emails used in job postings

ALTER TABLE companies
ADD COLUMN email VARCHAR(255);

-- Create index on email for faster lookups
CREATE INDEX idx_companies_email ON companies(email);
