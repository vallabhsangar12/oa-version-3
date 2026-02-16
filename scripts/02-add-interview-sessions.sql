-- =============================================
-- Add interview_sessions table
-- =============================================

CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('technical', 'behavioral')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  job_role TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add session_id FK to interview_results if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_results' AND column_name = 'interview_session_id'
  ) THEN
    ALTER TABLE interview_results ADD COLUMN interview_session_id UUID REFERENCES interview_sessions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_results_interview_session_id ON interview_results(interview_session_id);
