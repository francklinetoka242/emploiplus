-- ============================================================================
-- Migration: Fix Publications Schema - Remove user_id, Keep author_id Only
-- ============================================================================
-- This migration unifies the publications table to use only author_id
-- to match the application logic and avoid "column p.user_id does not exist" errors

-- ============================================================================
-- 1. CREATE TEMPORARY TABLE WITH CORRECT SCHEMA
-- ============================================================================

-- Make a backup of existing data
CREATE TABLE IF NOT EXISTS publications_backup AS SELECT * FROM publications;

-- ============================================================================
-- 2. DROP AND RECREATE PUBLICATIONS TABLE WITH CORRECT SCHEMA
-- ============================================================================

-- Drop dependent views/functions first (if any)
DROP VIEW IF EXISTS active_publications CASCADE;

-- Drop the old table
DROP TABLE IF EXISTS publications CASCADE;

-- Recreate with unified schema (author_id only, not user_id)
CREATE TABLE publications (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'annonce',
    achievement BOOLEAN DEFAULT false,
    hashtags TEXT[],
    visibility TEXT DEFAULT 'public',
    is_active BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    contains_unmoderated_profanity BOOLEAN DEFAULT false,
    profanity_check_status TEXT DEFAULT 'pending',
    moderation_status TEXT DEFAULT 'pending',
    deleted_at TIMESTAMP NULL,
    author_is_certified BOOLEAN DEFAULT false,
    moderation_notes TEXT,
    moderated_by_admin_id INTEGER,
    FOREIGN KEY (moderated_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- ============================================================================
-- 3. RECREATE DEPENDENT TABLES
-- ============================================================================

-- Recreate publication_likes with proper schema
DROP TABLE IF EXISTS publication_likes CASCADE;
CREATE TABLE publication_likes (
    id SERIAL PRIMARY KEY,
    publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(publication_id, user_id)
);

-- Recreate publication_comments with proper schema
DROP TABLE IF EXISTS publication_comments CASCADE;
CREATE TABLE publication_comments (
    id SERIAL PRIMARY KEY,
    publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_publications_author_id ON publications(author_id);
CREATE INDEX idx_publications_created_at ON publications(created_at DESC);
CREATE INDEX idx_publications_is_active ON publications(is_active);
CREATE INDEX idx_publications_author_id_active ON publications(author_id, is_active);
CREATE INDEX idx_publication_likes_publication_id ON publication_likes(publication_id);
CREATE INDEX idx_publication_likes_user_id ON publication_likes(user_id);
CREATE INDEX idx_publication_comments_publication_id ON publication_comments(publication_id);
CREATE INDEX idx_publication_comments_author_id ON publication_comments(author_id);

-- ============================================================================
-- 5. CREATE VIEW FOR ACTIVE PUBLICATIONS
-- ============================================================================

CREATE VIEW active_publications AS
SELECT 
    p.id,
    p.author_id,
    p.content,
    p.image_url,
    p.visibility,
    p.hashtags,
    p.is_active,
    p.category,
    p.achievement,
    p.created_at,
    p.updated_at,
    p.likes_count,
    p.comments_count,
    p.moderation_status,
    u.full_name,
    u.company_name,
    u.profile_image_url,
    u.user_type
FROM publications p
LEFT JOIN users u ON p.author_id = u.id
WHERE p.is_active = true AND p.deleted_at IS NULL;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- Note: Manual data restoration may be needed if you had existing publications
-- The publications_backup table contains the original data if needed
