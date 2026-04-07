-- =================================================================
-- Migration v2: novos contatos por dia, resposta humana, canal
-- Rodar no Supabase SQL Editor
-- =================================================================

-- 1. Novos contatos por dia (primeiro contato de cada contact_id)
CREATE OR REPLACE VIEW v_new_contacts_per_day AS
SELECT
  location_id,
  date_trunc('day', primeiro_contato AT TIME ZONE 'America/Sao_Paulo') AS day,
  COUNT(*) AS new_contacts
FROM (
  SELECT contact_id, location_id, MIN(last_message_at) AS primeiro_contato
  FROM conversations
  WHERE contact_id IS NOT NULL
  GROUP BY contact_id, location_id
) sub
GROUP BY 1, 2
ORDER BY 2 DESC;

-- 2. Tempo de primeira resposta HUMANA
--    user_id IS NOT NULL em messages = mensagem enviada por humano (não bot)
CREATE OR REPLACE VIEW v_human_response_stats AS
SELECT
  c.location_id,
  date_trunc('day', c.last_message_at AT TIME ZONE 'America/Sao_Paulo') AS day,
  COUNT(DISTINCT c.id)                                                   AS total_conversations,
  ROUND(AVG(resp.seconds))::INT                                          AS avg_response_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resp.seconds)::INT        AS p50_response_seconds,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY resp.seconds)::INT       AS p95_response_seconds
FROM conversations c
JOIN LATERAL (
  SELECT
    EXTRACT(EPOCH FROM (
      MIN(m_out.sent_at) - MIN(m_in.sent_at)
    ))::INT AS seconds
  FROM messages m_in
  CROSS JOIN messages m_out
  WHERE m_in.conversation_id  = c.id
    AND m_in.direction         = 'inbound'
    AND m_out.conversation_id  = c.id
    AND m_out.direction        = 'outbound'
    AND m_out.user_id IS NOT NULL        -- só humano
    AND m_out.sent_at > m_in.sent_at
  HAVING MIN(m_out.sent_at) > MIN(m_in.sent_at)
) resp ON true
GROUP BY 1, 2
ORDER BY 2 DESC;

-- 3. Contatos por canal (com location_id)
CREATE OR REPLACE VIEW v_contacts_by_channel AS
SELECT
  location_id,
  channel,
  COUNT(DISTINCT contact_id) AS contact_count,
  COUNT(*)                   AS conversation_count
FROM conversations
WHERE channel IS NOT NULL
GROUP BY 1, 2
ORDER BY contact_count DESC;

-- 4. Contatos por tag (com location_id)
CREATE OR REPLACE VIEW v_contacts_by_tag AS
SELECT
  location_id,
  tag,
  COUNT(DISTINCT contact_id) AS contact_count,
  COUNT(*)                   AS conversation_count
FROM conversations, UNNEST(tags) AS tag
WHERE cardinality(tags) > 0
GROUP BY 1, 2
ORDER BY contact_count DESC;

-- 5. Lista de subcontas disponíveis
CREATE OR REPLACE VIEW v_locations AS
SELECT
  location_id,
  COUNT(DISTINCT contact_id) AS total_contacts,
  COUNT(*)                   AS total_conversations,
  MAX(last_message_at)       AS last_activity
FROM conversations
GROUP BY location_id
ORDER BY total_conversations DESC;
