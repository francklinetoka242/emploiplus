-- Migration: Create documentations table
-- This table stores legal documents and policies that can be managed from the admin panel

CREATE TABLE IF NOT EXISTS documentations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL DEFAULT 'document',
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_by INTEGER,
  updated_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES admins(id) ON DELETE SET NULL,
  CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) 
    REFERENCES admins(id) ON DELETE SET NULL
);

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_documentations_slug ON documentations(slug);

-- Create index for faster type lookups
CREATE INDEX IF NOT EXISTS idx_documentations_type ON documentations(type);

-- Create index for published status
CREATE INDEX IF NOT EXISTS idx_documentations_published ON documentations(is_published);
