-- Migration: Create or update publications table
CREATE TABLE IF NOT EXISTS publications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for faster queries  
CREATE INDEX IF NOT EXISTS idx_publications_author_id ON publications(author_id);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON publications(created_at);

-- Ensure all needed columns exist (idempotent)
ALTER TABLE publications ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE publications ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS author_id INTEGER;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE publications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

COMMENT ON TABLE publications IS 'Stores user publications/articles';
COMMENT ON COLUMN publications.title IS 'Title of the publication';
COMMENT ON COLUMN publications.content IS 'Full content of the publication';
COMMENT ON COLUMN publications.author_id IS 'ID of the user who created the publication';
COMMENT ON COLUMN publications.image_url IS 'Optional image URL for the publication';
