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

-- Editor sessions table for collaborative editing
CREATE TABLE IF NOT EXISTS editor_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    repo_id INTEGER REFERENCES repos(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    active_users JSONB DEFAULT '[]', -- Array of active user IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- AI suggestions table for editor
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES editor_sessions(session_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    suggestion_text TEXT NOT NULL,
    suggestion_type VARCHAR(50) DEFAULT 'refactor', -- 'refactor', 'optimization', 'error_fix', etc.
    context JSONB, -- Code context where suggestion was made
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX IF NOT EXISTS idx_editor_sessions_session_id ON editor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_editor_sessions_repo_id ON editor_sessions(repo_id);
CREATE INDEX IF NOT EXISTS idx_editor_sessions_created_by ON editor_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_editor_sessions_active ON editor_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_session_id ON ai_suggestions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON ai_suggestions(suggestion_type);

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

CREATE TRIGGER update_editor_sessions_updated_at 
    BEFORE UPDATE ON editor_sessions 
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
COMMENT ON TABLE editor_sessions IS 'Collaborative editing sessions';
COMMENT ON TABLE ai_suggestions IS 'AI-generated code suggestions';

COMMENT ON COLUMN users.password_hash IS 'Hashed password using bcrypt';
COMMENT ON COLUMN sessions.token IS 'JWT session token';
COMMENT ON COLUMN sessions.expires_at IS 'Token expiration time';
COMMENT ON COLUMN accounts.provider IS 'OAuth provider name (github, google, etc.)';
COMMENT ON COLUMN accounts.provider_account_id IS 'Unique ID from the OAuth provider';
COMMENT ON COLUMN editor_sessions.session_id IS 'Unique identifier for collaborative session';
COMMENT ON COLUMN editor_sessions.active_users IS 'JSON array of active user IDs';
COMMENT ON COLUMN ai_suggestions.suggestion_type IS 'Type of AI suggestion (refactor, optimization, etc.)';
COMMENT ON COLUMN ai_suggestions.context IS 'Code context where suggestion was made';

-- DevOps configurations table for generated deployment configurations
CREATE TABLE IF NOT EXISTS deploy_configs (
    id SERIAL PRIMARY KEY,
    repo_id INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
    config_type VARCHAR(50) NOT NULL, -- 'dockerfile', 'cicd', 'infrastructure', 'kubernetes'
    config_name VARCHAR(255) NOT NULL,
    config_content TEXT NOT NULL,
    config_metadata JSONB, -- Additional metadata about the configuration
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- DevOps recommendations table for infrastructure suggestions
CREATE TABLE IF NOT EXISTS devops_recommendations (
    id SERIAL PRIMARY KEY,
    repo_id INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- 'hosting', 'database', 'caching', 'monitoring'
    recommendation_data JSONB NOT NULL, -- Structured recommendation data
    confidence_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 1.00
    is_accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- DevOps deployments table for tracking deployment history
CREATE TABLE IF NOT EXISTS devops_deployments (
    id SERIAL PRIMARY KEY,
    repo_id INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
    config_id INTEGER REFERENCES deploy_configs(id) ON DELETE SET NULL,
    deployment_type VARCHAR(50) NOT NULL, -- 'docker', 'kubernetes', 'serverless'
    deployment_target VARCHAR(255) NOT NULL, -- Target environment/platform
    deployment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'success', 'failed'
    deployment_log TEXT,
    deployment_metadata JSONB, -- Additional deployment information
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for DevOps tables
CREATE INDEX IF NOT EXISTS idx_deploy_configs_repo_id ON deploy_configs(repo_id);
CREATE INDEX IF NOT EXISTS idx_deploy_configs_config_type ON deploy_configs(config_type);
CREATE INDEX IF NOT EXISTS idx_deploy_configs_is_active ON deploy_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_deploy_configs_created_by ON deploy_configs(created_by);
CREATE INDEX IF NOT EXISTS idx_devops_recommendations_repo_id ON devops_recommendations(repo_id);
CREATE INDEX IF NOT EXISTS idx_devops_recommendations_type ON devops_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_devops_recommendations_is_accepted ON devops_recommendations(is_accepted);
CREATE INDEX IF NOT EXISTS idx_devops_recommendations_created_by ON devops_recommendations(created_by);
CREATE INDEX IF NOT EXISTS idx_devops_deployments_repo_id ON devops_deployments(repo_id);
CREATE INDEX IF NOT EXISTS idx_devops_deployments_config_id ON devops_deployments(config_id);
CREATE INDEX IF NOT EXISTS idx_devops_deployments_status ON devops_deployments(deployment_status);
CREATE INDEX IF NOT EXISTS idx_devops_deployments_created_by ON devops_deployments(created_by);

-- Triggers for DevOps tables
CREATE TRIGGER update_deploy_configs_updated_at 
    BEFORE UPDATE ON deploy_configs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for DevOps tables
COMMENT ON TABLE deploy_configs IS 'Generated DevOps configurations (Dockerfiles, CI/CD, etc.)';
COMMENT ON TABLE devops_recommendations IS 'AI-generated infrastructure and deployment recommendations';
COMMENT ON TABLE devops_deployments IS 'History of DevOps deployments and their status';
COMMENT ON COLUMN deploy_configs.config_type IS 'Type of configuration (dockerfile, cicd, infrastructure, kubernetes)';
COMMENT ON COLUMN deploy_configs.config_content IS 'Generated configuration content';
COMMENT ON COLUMN deploy_configs.config_metadata IS 'Additional metadata about the configuration';
COMMENT ON COLUMN devops_recommendations.recommendation_type IS 'Type of recommendation (hosting, database, caching, monitoring)';
COMMENT ON COLUMN devops_recommendations.recommendation_data IS 'Structured recommendation data';
COMMENT ON COLUMN devops_recommendations.confidence_score IS 'AI confidence score (0.00 to 1.00)';
COMMENT ON COLUMN devops_deployments.deployment_type IS 'Type of deployment (docker, kubernetes, serverless)';
COMMENT ON COLUMN devops_deployments.deployment_target IS 'Target environment or platform';
COMMENT ON COLUMN devops_deployments.deployment_status IS 'Current status of deployment';
COMMENT ON COLUMN devops_deployments.deployment_log IS 'Deployment logs and output';
