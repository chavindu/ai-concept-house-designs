-- NextAuth.js Database Schema Migration (Fixed)
-- This script adds the required tables for NextAuth.js integration
-- Handles conflicts with existing JWT-based sessions table

-- Create accounts table for OAuth providers
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_account_id)
);

-- Create NextAuth sessions table (rename to avoid conflict with existing sessions table)
CREATE TABLE IF NOT EXISTS nextauth_sessions (
  id SERIAL PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create NextAuth verification_tokens table (rename to avoid conflict)
CREATE TABLE IF NOT EXISTS nextauth_verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider);
CREATE INDEX IF NOT EXISTS idx_nextauth_sessions_user_id ON nextauth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_nextauth_sessions_token ON nextauth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_nextauth_verification_tokens_token ON nextauth_verification_tokens(token);

-- Add triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nextauth_sessions_updated_at ON nextauth_sessions;
CREATE TRIGGER update_nextauth_sessions_updated_at
    BEFORE UPDATE ON nextauth_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a comment for documentation
COMMENT ON TABLE accounts IS 'NextAuth.js accounts table for OAuth providers';
COMMENT ON TABLE nextauth_sessions IS 'NextAuth.js sessions table for user sessions (renamed to avoid conflict)';
COMMENT ON TABLE nextauth_verification_tokens IS 'NextAuth.js verification tokens table for email verification (renamed to avoid conflict)';
