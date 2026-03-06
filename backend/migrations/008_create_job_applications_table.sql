-- Migration: Create job_applications table for tracking applications submitted via Emploi+
-- Adds support for storing anonymous and authenticated applications and enabling admin review

CREATE TABLE IF NOT EXISTS job_applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  applicant_email TEXT,
  cv_url TEXT,
  cover_letter_url TEXT,
  receipt_url TEXT,
  additional_docs JSONB,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE job_applications IS 'Records of job applications submitted through the public form';
