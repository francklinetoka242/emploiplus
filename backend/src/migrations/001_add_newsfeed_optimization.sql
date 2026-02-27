-- ============================================================================
-- Migration: Add Newsfeed Sorting & Filtering Optimization
-- Description: Adds columns and indexes for hybrid sorting, profanity filtering,
--              discreet mode, and account status verification
-- ============================================================================

-- ============================================================================
-- 1. ADD COLUMNS TO USERS TABLE FOR CERTIFICATION & STATUS
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_certified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active'; -- 'active', 'suspended', 'blocked', 'deleted'
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status_changed_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profanity_violation_count INTEGER DEFAULT 0;

-- ============================================================================
-- 2. ADD COLUMNS TO PUBLICATIONS TABLE FOR FILTERING & SORTING
-- ============================================================================

ALTER TABLE publications ADD COLUMN IF NOT EXISTS contains_unmoderated_profanity BOOLEAN DEFAULT false;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS profanity_check_status TEXT DEFAULT 'pending'; -- 'pending', 'checked', 'flagged'
ALTER TABLE publications ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending'; -- 'pending', 'approved', 'rejected'
ALTER TABLE publications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS author_is_certified BOOLEAN DEFAULT false;

-- ============================================================================
-- 3. CREATE PROFANITY_VIOLATIONS TABLE FOR TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS profanity_violations (
    id SERIAL PRIMARY KEY,
    publication_id INTEGER NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    violation_type TEXT DEFAULT 'banned_words', -- 'banned_words', 'context_violation'
    flagged_words TEXT[],
    moderation_notes TEXT,
    moderated_by_admin_id INTEGER NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (moderated_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- ============================================================================
-- 4. CREATE BANNED_WORDS_BACKEND TABLE (centralized management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS banned_words_backend (
    id SERIAL PRIMARY KEY,
    word TEXT NOT NULL UNIQUE,
    severity TEXT DEFAULT 'high', -- 'low', 'medium', 'high'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Pre-populate with common banned words (in French and English)
-- If you have custom list, populate accordingly
INSERT INTO banned_words_backend (word, severity, is_active) VALUES
    ('insulte', 'high', true),
    ('harcèlement', 'high', true),
    ('discrimination', 'high', true),
    ('spam', 'medium', true),
    ('arnaque', 'high', true),
    ('escroquerie', 'high', true),
    ('violence', 'high', true),
    ('haine', 'high', true),
    ('racisme', 'high', true),
    ('sexisme', 'high', true)
ON CONFLICT (word) DO NOTHING;

-- ============================================================================
-- 5. CREATE DISCREET_MODE_INTERACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS discreet_mode_interactions (
    id SERIAL PRIMARY KEY,
    interaction_id INTEGER NOT NULL,
    publication_id INTEGER NOT NULL,
    viewer_user_id INTEGER NOT NULL,
    author_user_id INTEGER NOT NULL,
    author_company_id INTEGER NOT NULL,
    viewer_company_id INTEGER NOT NULL,
    interaction_type TEXT DEFAULT 'like', -- 'like', 'comment', 'share'
    is_masked BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
    FOREIGN KEY (viewer_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 6. CREATE PUBLICATION_VISIBILITY_LOG TABLE FOR AUDIT
-- ============================================================================

CREATE TABLE IF NOT EXISTS publication_visibility_log (
    id SERIAL PRIMARY KEY,
    publication_id INTEGER NOT NULL,
    filter_reason TEXT NOT NULL, -- 'blocked_author', 'unmoderated_profanity', 'discreet_mode', 'suspended_account', 'deleted_publication'
    viewer_user_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
    FOREIGN KEY (viewer_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Index on created_at for chronological sorting (DESC)
CREATE INDEX IF NOT EXISTS idx_publications_created_at_desc 
    ON publications(created_at DESC) 
    WHERE is_active = true AND deleted_at IS NULL;

-- Index on author certification for priority sorting
CREATE INDEX IF NOT EXISTS idx_publications_author_certified 
    ON publications(author_is_certified DESC, created_at DESC) 
    WHERE is_active = true AND deleted_at IS NULL;

-- Index for filtering by account status
CREATE INDEX IF NOT EXISTS idx_users_account_status 
    ON users(account_status) 
    WHERE is_deleted = false;

-- Index for certification status
CREATE INDEX IF NOT EXISTS idx_users_is_certified 
    ON users(is_certified) 
    WHERE is_deleted = false AND account_status = 'active';

-- Combined index for hybrid sort (Certified + Recent)
CREATE INDEX IF NOT EXISTS idx_publications_hybrid_sort 
    ON publications(
        CASE WHEN author_is_certified = true THEN 0 ELSE 1 END,
        created_at DESC
    )
    WHERE is_active = true AND deleted_at IS NULL AND contains_unmoderated_profanity = false;

-- Index for profanity filtering
CREATE INDEX IF NOT EXISTS idx_publications_profanity_check 
    ON publications(profanity_check_status, contains_unmoderated_profanity) 
    WHERE is_active = true AND deleted_at IS NULL;

-- Index for moderation status
CREATE INDEX IF NOT EXISTS idx_publications_moderation_status 
    ON publications(moderation_status) 
    WHERE is_active = true;

-- Index for discreet mode queries
CREATE INDEX IF NOT EXISTS idx_users_discreet_mode 
    ON users(discreet_mode_enabled) 
    WHERE account_status = 'active';

-- Index for publication with author info (for JOIN optimization)
CREATE INDEX IF NOT EXISTS idx_publications_author_id 
    ON publications(author_id) 
    WHERE is_active = true AND deleted_at IS NULL;

-- Index for profanity violations lookup
CREATE INDEX IF NOT EXISTS idx_profanity_violations_status 
    ON profanity_violations(status, created_at DESC);

-- ============================================================================
-- 8. CREATE FUNCTION FOR AUTOMATIC DISCREET MODE FILTERING
-- ============================================================================

CREATE OR REPLACE FUNCTION check_discreet_mode_visibility(
    p_publication_id INTEGER,
    p_author_id INTEGER,
    p_viewer_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_author_discreet BOOLEAN;
    v_author_company_id INTEGER;
    v_viewer_company_id INTEGER;
BEGIN
    -- Get author's discreet mode status and company
    SELECT discreet_mode_enabled, company_id 
    INTO v_author_discreet, v_author_company_id
    FROM users 
    WHERE id = p_author_id AND is_deleted = false;

    -- If author doesn't have discreet mode enabled, publication is visible
    IF NOT v_author_discreet OR v_author_company_id IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Get viewer's company
    SELECT company_id 
    INTO v_viewer_company_id
    FROM users 
    WHERE id = p_viewer_id AND is_deleted = false;

    -- If viewer is from same company as author, hide the publication
    IF v_viewer_company_id IS NOT NULL AND v_viewer_company_id = v_author_company_id THEN
        RETURN FALSE;
    END IF;

    -- Otherwise, publication is visible
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. CREATE FUNCTION FOR AUTOMATIC ACCOUNT STATUS FILTERING
-- ============================================================================

CREATE OR REPLACE FUNCTION is_author_active(p_user_id INTEGER) RETURNS BOOLEAN AS $$
DECLARE
    v_account_status TEXT;
    v_is_deleted BOOLEAN;
    v_is_blocked BOOLEAN;
BEGIN
    SELECT account_status, is_deleted, is_blocked 
    INTO v_account_status, v_is_deleted, v_is_blocked
    FROM users 
    WHERE id = p_user_id;

    -- Author is active only if not deleted, not blocked, and account status is 'active'
    RETURN (NOT COALESCE(v_is_deleted, false) 
        AND NOT COALESCE(v_is_blocked, false) 
        AND v_account_status = 'active');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. CREATE VIEW FOR CLEAN PUBLICATION RETRIEVAL
-- ============================================================================

CREATE OR REPLACE VIEW publications_for_newsfeed AS
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
    u.user_type,
    u.company_id as author_company_id,
    u.is_certified,
    u.discreet_mode_enabled,
    u.account_status,
    u.job_title,
    -- Certification priority: 0 for certified, 1 for not certified
    CASE WHEN u.is_certified = true THEN 0 ELSE 1 END as certification_priority
FROM publications p
LEFT JOIN users u ON p.author_id = u.id
WHERE 
    p.is_active = true 
    AND p.deleted_at IS NULL
    AND p.contains_unmoderated_profanity = false
    AND is_author_active(p.author_id);

-- ============================================================================
-- COMMIT & LOG
-- ============================================================================
-- Migration complete: Newsfeed optimization infrastructure created
