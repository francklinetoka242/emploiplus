-- ============================================================================
-- Migration: Login Attempts Security System
-- Description: Add brute force attack protection for admin authentication
-- ============================================================================

-- ============================================================================
-- 1. CREATE LOGIN_ATTEMPTS TABLE
-- Records each login attempt by email and IP address
-- ============================================================================

CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  attempt_type VARCHAR(20) NOT NULL DEFAULT 'failed', -- 'failed' or 'success'
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (email) REFERENCES admins(email) ON DELETE CASCADE
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created ON login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created ON login_attempts(ip_address, created_at DESC);

-- ============================================================================
-- 2. ADD BLOCKING COLUMNS TO ADMINS TABLE
-- ============================================================================

ALTER TABLE admins 
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
  ADD COLUMN IF NOT EXISTS blocked_ips INET[] DEFAULT ARRAY[]::INET[],
  ADD COLUMN IF NOT EXISTS last_failed_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_admins_locked_until ON admins(locked_until) 
  WHERE locked_until IS NOT NULL;

-- ============================================================================
-- 3. FUNCTION TO CLEAN UP OLD LOGIN ATTEMPTS
-- Keep only last 30 days of login attempts
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. AUTOMATED CLEANUP TRIGGER
-- Remove old attempts every day
-- ============================================================================

-- Note: This requires pg_cron extension (usually available on managed systems)
-- If not available, run cleanup manually or via scheduled task:
-- SELECT cleanup_old_login_attempts();

COMMENT ON TABLE login_attempts IS 'Tracks all login attempts for brute force protection. Records email, IP, and attempt type.';
COMMENT ON FUNCTION cleanup_old_login_attempts() IS 'Removes login attempts older than 30 days to manage table size.';
