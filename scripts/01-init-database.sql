-- =============================================
-- PostgreSQL Schema for OneselfAI
-- =============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Resumes metadata
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Interview results
CREATE TABLE IF NOT EXISTS interview_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  score INTEGER,
  summary TEXT,
  breakdown JSONB,
  face_metrics JSONB,
  voice_metrics JSONB,
  text_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contact submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_results_user_id ON interview_results(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_results_session_id ON interview_results(session_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
