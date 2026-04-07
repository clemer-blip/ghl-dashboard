-- =================================================================
-- GHL Dashboard — Supabase Schema
-- Run this once in the Supabase SQL Editor
-- =================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Reusable trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- TABLE: conversations
-- =================================================================
CREATE TABLE IF NOT EXISTS conversations (
  id                       TEXT PRIMARY KEY,
  location_id              TEXT NOT NULL,
  contact_id               TEXT,
  contact_name             TEXT,
  contact_email            TEXT,
  contact_phone            TEXT,
  channel                  TEXT,          -- SMS | EMAIL | WHATSAPP | etc.
  status                   TEXT,          -- open | closed | unread
  last_message_at          TIMESTAMPTZ,
  first_response_seconds   INT,           -- computed at ingestion time
  ai_evaluation            TEXT,          -- populated by AI agent later
  ai_evaluated_at          TIMESTAMPTZ,
  raw                      JSONB,         -- full GHL payload
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_location
  ON conversations(location_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message
  ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status
  ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_first_response
  ON conversations(first_response_seconds)
  WHERE first_response_seconds IS NOT NULL;

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- TABLE: messages
-- =================================================================
CREATE TABLE IF NOT EXISTS messages (
  id                TEXT PRIMARY KEY,
  conversation_id   TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  location_id       TEXT NOT NULL,
  direction         TEXT NOT NULL,   -- inbound | outbound
  message_type      TEXT,            -- SMS | Email | WhatsApp | Call | etc.
  body              TEXT,
  sent_at           TIMESTAMPTZ NOT NULL,
  user_id           TEXT,            -- agent who sent (outbound only)
  raw               JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sent_at
  ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conv_direction
  ON messages(conversation_id, direction, sent_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_day_location
  ON messages(location_id, sent_at DESC);

-- =================================================================
-- TABLE: ingestion_state
-- Tracks the cursor so the cron job is idempotent and restartable
-- =================================================================
CREATE TABLE IF NOT EXISTS ingestion_state (
  location_id           TEXT PRIMARY KEY,
  last_synced_at        TIMESTAMPTZ,
  last_run_at           TIMESTAMPTZ,
  conversations_synced  INT DEFAULT 0,
  messages_synced       INT DEFAULT 0,
  last_error            TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_ingestion_state_updated_at
  BEFORE UPDATE ON ingestion_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- VIEW: v_messages_per_day
-- KPI 1 — inbound messages grouped by calendar day (Brasília time)
-- =================================================================
CREATE OR REPLACE VIEW v_messages_per_day AS
SELECT
  location_id,
  date_trunc('day', sent_at AT TIME ZONE 'America/Sao_Paulo')  AS day,
  COUNT(*)                                                       AS total_messages,
  COUNT(*) FILTER (WHERE direction = 'inbound')                  AS inbound_count,
  COUNT(*) FILTER (WHERE direction = 'outbound')                 AS outbound_count
FROM messages
GROUP BY 1, 2
ORDER BY 2 DESC;

-- =================================================================
-- VIEW: v_first_response_stats
-- KPI 2 — avg / p50 / p95 first response time per day
-- first_response_seconds is pre-computed at ingestion (cheap integer)
-- =================================================================
CREATE OR REPLACE VIEW v_first_response_stats AS
SELECT
  location_id,
  date_trunc('day', last_message_at AT TIME ZONE 'America/Sao_Paulo') AS day,
  COUNT(*)                                                              AS total_conversations,
  ROUND(AVG(first_response_seconds))::INT                              AS avg_response_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP
    (ORDER BY first_response_seconds)::INT                             AS p50_response_seconds,
  PERCENTILE_CONT(0.95) WITHIN GROUP
    (ORDER BY first_response_seconds)::INT                             AS p95_response_seconds
FROM conversations
WHERE first_response_seconds IS NOT NULL
GROUP BY 1, 2
ORDER BY 2 DESC;

-- =================================================================
-- VIEW: v_evaluations
-- KPI 3 — conversations list for AI evaluation table
-- =================================================================
CREATE OR REPLACE VIEW v_evaluations AS
SELECT
  c.id,
  c.contact_name,
  c.contact_phone,
  c.channel,
  c.status,
  c.ai_evaluation,
  c.ai_evaluated_at,
  c.last_message_at,
  c.first_response_seconds,
  COUNT(m.id) AS message_count
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
GROUP BY c.id
ORDER BY c.last_message_at DESC;

-- =================================================================
-- RLS
-- =================================================================
ALTER TABLE conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_state ENABLE ROW LEVEL SECURITY;

-- Service role (Python ingestion) bypasses RLS automatically.
-- Anon/authenticated (Next.js dashboard) gets read-only access.
CREATE POLICY "anon read conversations"
  ON conversations FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anon read messages"
  ON messages FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anon read ingestion_state"
  ON ingestion_state FOR SELECT TO anon, authenticated USING (true);
