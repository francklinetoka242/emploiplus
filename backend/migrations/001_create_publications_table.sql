-- Migration 001: Create publications table
-- This migration creates the publications table if it doesn't exist

-- ensure table exists with required columns (idempotent)
CREATE TABLE IF NOT EXISTS publications (
  id SERIAL PRIMARY KEY
);

-- add missing columns if they do not already exist
-- title is added nullable first so that existing rows don't violate constraint
ALTER TABLE publications ADD COLUMN IF NOT EXISTS title VARCHAR(255);
-- fill null titles with default placeholder (could be overwritten later)
UPDATE publications SET title = 'Untitled' WHERE title IS NULL;
-- now enforce NOT NULL constraint
ALTER TABLE publications ALTER COLUMN title SET NOT NULL;

ALTER TABLE publications ADD COLUMN IF NOT EXISTS content TEXT NOT NULL;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE publications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_publications_author_id ON publications(author_id);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON publications(created_at);

-- Add comment for documentation
COMMENT ON TABLE publications IS 'Stores user publications/articles';

-- comments only if columns exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='publications' AND column_name='title') THEN
    COMMENT ON COLUMN publications.title IS 'Title of the publication';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='publications' AND column_name='content') THEN
    COMMENT ON COLUMN publications.content IS 'Full content of the publication';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='publications' AND column_name='author_id') THEN
    COMMENT ON COLUMN publications.author_id IS 'ID of the user who created the publication';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='publications' AND column_name='image_url') THEN
    COMMENT ON COLUMN publications.image_url IS 'Optional image URL for the publication';
  END IF;
END$$;
