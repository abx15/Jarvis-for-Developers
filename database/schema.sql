-- AI Developer OS Database Schema
-- PostgreSQL Schema for Authentication and User Management

-- Enable UUID extension for better primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Sessions table for JWT token management
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Repositories table for user repositories
CREATE TABLE IF NOT EXISTS repos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    repo_name VARCHAR(255) NOT NULL,
    repo_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- OAuth accounts table for third-party integrations
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'github', 'google', etc.
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(provider, provider_account_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_repos_user_id ON repos(user_id);
CREATE INDEX IF NOT EXISTS idx_repos_active ON repos(is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repos_updated_at 
    BEFORE UPDATE ON repos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- INSERT INTO users (email, password_hash, name) VALUES 
-- ('test@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAquOH7jvKKK4.1L.8v2.1.8v2.1.8v2.1', 'Test User');

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for the AI Developer OS platform';
COMMENT ON TABLE sessions IS 'User sessions for JWT token management';
COMMENT ON TABLE repos IS 'User repositories and projects';
COMMENT ON TABLE accounts IS 'OAuth provider accounts linked to users';

COMMENT ON COLUMN users.password_hash IS 'Hashed password using bcrypt';
COMMENT ON COLUMN sessions.token IS 'JWT session token';
COMMENT ON COLUMN sessions.expires_at IS 'Token expiration time';
COMMENT ON COLUMN accounts.provider IS 'OAuth provider name (github, google, etc.)';
COMMENT ON COLUMN accounts.provider_account_id IS 'Unique ID from the OAuth provider';
