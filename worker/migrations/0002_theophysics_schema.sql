-- Theophysics Universal Media Pipeline Schema

-- Drop old ClipSync tables
DROP TABLE IF EXISTS hotkeys;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS custom_pages;
DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS prompts;
DROP TABLE IF EXISTS note_tags;
DROP TABLE IF EXISTS clip_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS clips;

-- Update users table
ALTER TABLE users RENAME COLUMN email TO username;

-- Create jobs table for media ingestion pipeline
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  source_url TEXT,
  r2_key TEXT,
  transcript_key TEXT,
  summary_key TEXT,
  metadata TEXT,
  error_message TEXT,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at INTEGER,
  completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);

-- Create artifacts table for processed outputs
CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  metadata TEXT,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_artifacts_job_id ON artifacts(job_id);

-- Create distributions table for platform publishing
CREATE TABLE IF NOT EXISTS distributions (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  external_id TEXT,
  external_url TEXT,
  metadata TEXT,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_distributions_job_id ON distributions(job_id);
CREATE INDEX IF NOT EXISTS idx_distributions_platform ON distributions(platform);
