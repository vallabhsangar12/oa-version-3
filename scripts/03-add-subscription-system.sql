-- Add subscription system tables
-- Run this migration to add subscription and interview management to the database

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL DEFAULT 'free', -- free, basic, pro
  interviews_today INTEGER NOT NULL DEFAULT 0,
  interviews_limit INTEGER NOT NULL DEFAULT 1,
  start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, cancelled, expired
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create interview_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS interview_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interview_type VARCHAR(50) NOT NULL, -- 'technical', 'behavioral', 'mixed'
  difficulty VARCHAR(50) NOT NULL, -- 'easy', 'medium', 'hard'
  job_role VARCHAR(255),
  experience_years INTEGER,
  tech_stack JSONB, -- Array of technologies as JSON
  resume_id INTEGER REFERENCES resumes(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create interview_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS interview_results (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  overall_score DECIMAL(5,2),
  emotion_score DECIMAL(5,2),
  speech_score DECIMAL(5,2),
  technical_score DECIMAL(5,2),
  confidence_score DECIMAL(5,2),
  communication_score DECIMAL(5,2),
  summary TEXT,
  feedback TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_results_user_id ON interview_results(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_results_session_id ON interview_results(session_id);

-- Add created_at to resumes table if it doesn't exist
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Ensure users table has required fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id INTEGER REFERENCES subscriptions(id);
