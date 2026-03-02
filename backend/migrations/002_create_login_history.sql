-- Migration: create admin login history table
-- Run on your VPS database when deploying the updated backend

CREATE TABLE IF NOT EXISTS admin_login_history (
    id SERIAL PRIMARY KEY,
    admin_id INT,
    admin_email VARCHAR(255),
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_login_history_admin_idx ON admin_login_history(admin_id);
CREATE INDEX IF NOT EXISTS admin_login_history_created_idx ON admin_login_history(created_at);
