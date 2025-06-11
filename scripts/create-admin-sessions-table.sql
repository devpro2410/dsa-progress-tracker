-- Create admin_sessions table for secure authentication
CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS admin_sessions_token_idx ON admin_sessions(token);

-- Enable RLS but allow server-side access
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all operations from server-side (authenticated with service role)
CREATE POLICY admin_sessions_policy ON admin_sessions USING (true);
