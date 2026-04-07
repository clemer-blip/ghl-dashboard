-- =================================================================
-- Migration: tags + views por canal e por tag
-- Rodar no Supabase SQL Editor
-- =================================================================

-- 1. Adiciona coluna tags na tabela conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_conversations_tags
  ON conversations USING GIN(tags);

-- 2. View: contatos únicos por canal
CREATE OR REPLACE VIEW v_contacts_by_channel AS
SELECT
  channel,
  COUNT(DISTINCT contact_id) AS contact_count,
  COUNT(*) AS conversation_count
FROM conversations
WHERE channel IS NOT NULL
GROUP BY channel
ORDER BY contact_count DESC;

-- 3. View: contatos únicos por tag
CREATE OR REPLACE VIEW v_contacts_by_tag AS
SELECT
  tag,
  COUNT(DISTINCT contact_id) AS contact_count,
  COUNT(*) AS conversation_count
FROM conversations, UNNEST(tags) AS tag
WHERE cardinality(tags) > 0
GROUP BY tag
ORDER BY contact_count DESC;

-- 4. Permissões de leitura para anon/authenticated
CREATE POLICY "anon read v_contacts_by_channel"
  ON conversations FOR SELECT TO anon, authenticated USING (true);

-- As views herdam as permissões das tabelas subjacentes,
-- então não é necessário policy adicional nas views.
