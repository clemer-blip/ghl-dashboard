-- =================================================================
-- Migration v4: view de tempo de atendimento calculada direto
--               da tabela messages (inbound → outbound)
-- Rodar no Supabase SQL Editor
-- =================================================================

CREATE OR REPLACE VIEW v_response_time_per_day AS
WITH first_inbound AS (
  SELECT
    conversation_id,
    location_id,
    MIN(sent_at) AS first_in
  FROM messages
  WHERE direction = 'inbound'
  GROUP BY conversation_id, location_id
),
first_outbound AS (
  SELECT
    m.conversation_id,
    MIN(m.sent_at) AS first_out
  FROM messages m
  JOIN first_inbound fi ON m.conversation_id = fi.conversation_id
  WHERE m.direction = 'outbound'
    AND m.sent_at > fi.first_in
  GROUP BY m.conversation_id
),
response_times AS (
  SELECT
    fi.location_id,
    date_trunc('day', fi.first_in AT TIME ZONE 'America/Sao_Paulo') AS day,
    EXTRACT(EPOCH FROM (fo.first_out - fi.first_in))::INT AS seconds
  FROM first_inbound fi
  JOIN first_outbound fo ON fi.conversation_id = fo.conversation_id
  WHERE EXTRACT(EPOCH FROM (fo.first_out - fi.first_in)) BETWEEN 0 AND 86400
)
SELECT
  location_id,
  day,
  COUNT(*)                                                           AS total_conversations,
  ROUND(AVG(seconds))::INT                                           AS avg_response_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY seconds)::INT         AS p50_response_seconds,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY seconds)::INT        AS p95_response_seconds
FROM response_times
GROUP BY location_id, day
ORDER BY day DESC;
