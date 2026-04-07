-- =================================================================
-- Migration v3: DDD dos contatos + clientes únicos por dia
-- Rodar no Supabase SQL Editor
-- =================================================================

-- 1. Distribuição de DDD
--    Extrai DDD de números no formato +55XX... ou 55XX... ou XX...
CREATE OR REPLACE VIEW v_contacts_by_ddd AS
SELECT
  location_id,
  CASE
    WHEN contact_phone ~ '^\+55\d{10,11}$' THEN SUBSTRING(contact_phone FROM 4 FOR 2)
    WHEN contact_phone ~ '^55\d{10,11}$'   THEN SUBSTRING(contact_phone FROM 3 FOR 2)
    WHEN contact_phone ~ '^\d{10,11}$'     THEN SUBSTRING(contact_phone FROM 1 FOR 2)
    ELSE 'Outro'
  END AS ddd,
  COUNT(DISTINCT contact_id) AS contact_count
FROM conversations
WHERE contact_phone IS NOT NULL
  AND contact_id IS NOT NULL
GROUP BY 1, 2
ORDER BY contact_count DESC;

-- 2. Clientes únicos que enviaram mensagem por dia
--    direction = 'inbound' = mensagem do cliente
--    Conta conversation_id único por dia (proxy de cliente único)
CREATE OR REPLACE VIEW v_unique_contacts_per_day AS
SELECT
  location_id,
  date_trunc('day', sent_at AT TIME ZONE 'America/Sao_Paulo') AS day,
  COUNT(DISTINCT conversation_id) AS unique_contacts
FROM messages
WHERE direction = 'inbound'
GROUP BY 1, 2
ORDER BY 2 DESC;
