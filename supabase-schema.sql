-- 1. Crea la tabella per gli screenshot e l'analisi AI
CREATE TABLE IF NOT EXISTS screenshots (
  id BIGSERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  category TEXT,
  summary TEXT,
  ocr_text TEXT,
  tags JSONB,
  entities JSONB,
  language TEXT,
  embedding JSONB,
  is_sensitive INTEGER DEFAULT 0,
  source_id TEXT,
  external_id TEXT UNIQUE,
  user_id TEXT
);

-- 2. Crea la tabella per le sorgenti cloud
CREATE TABLE IF NOT EXISTS cloud_sources (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  email TEXT,
  local_path TEXT,
  access_token TEXT,
  refresh_token TEXT,
  status TEXT DEFAULT 'connected',
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_sync TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}'::jsonb
);