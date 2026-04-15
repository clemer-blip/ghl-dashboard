-- =================================================================
-- Central de Criativos — tabelas de ad-level insights
-- Execute no Supabase SQL Editor
-- =================================================================

-- Catálogo de criativos (um registro por ad_id, atualizado a cada sync)
CREATE TABLE IF NOT EXISTS meta_ad_creatives (
  ad_id         TEXT PRIMARY KEY,
  ad_name       TEXT,
  account_id    TEXT NOT NULL,
  campaign_id   TEXT,
  campaign_name TEXT,
  adset_id      TEXT,
  adset_name    TEXT,
  thumbnail_url TEXT,
  video_url     TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE meta_ad_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read meta_ad_creatives"
  ON meta_ad_creatives FOR SELECT TO anon, authenticated USING (true);

-- Métricas diárias por ad
CREATE TABLE IF NOT EXISTS meta_ad_insights (
  id                  TEXT PRIMARY KEY,  -- {account_id}_{ad_id}_{date}
  account_id          TEXT NOT NULL,
  ad_id               TEXT NOT NULL,
  location_id         TEXT NOT NULL,
  date                DATE NOT NULL,
  spend               DECIMAL(10,2) DEFAULT 0,
  impressions         INT DEFAULT 0,
  reach               INT DEFAULT 0,
  inline_link_clicks  INT DEFAULT 0,
  video_3sec_watched  INT DEFAULT 0,
  video_p75_watched   INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_meta_ad_insights_date
  ON meta_ad_insights(date DESC);
CREATE INDEX IF NOT EXISTS idx_meta_ad_insights_ad_id
  ON meta_ad_insights(ad_id);
CREATE INDEX IF NOT EXISTS idx_meta_ad_insights_location
  ON meta_ad_insights(location_id);

ALTER TABLE meta_ad_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read meta_ad_insights"
  ON meta_ad_insights FOR SELECT TO anon, authenticated USING (true);
