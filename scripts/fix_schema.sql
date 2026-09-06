-- SENTINEL: sentinel_classifications and sentinel_alerts tables
-- NOTE (Sep 2026): SENTINEL and BASR share one Supabase project. SENTINEL's
-- tables are prefixed sentinel_* so they never collide with BASR's
-- classifications/alerts again. This script ONLY touches sentinel_* tables.
-- Run this in the Supabase SQL editor. Idempotent.

-- Step 1: Drop SENTINEL's own tables if present (never BASR's).
DROP POLICY IF EXISTS "svc_all" ON sentinel_alerts;
DROP POLICY IF EXISTS "anon_read" ON sentinel_alerts;
DROP TABLE IF EXISTS sentinel_alerts CASCADE;

DROP POLICY IF EXISTS "svc_all" ON sentinel_classifications;
DROP POLICY IF EXISTS "anon_read" ON sentinel_classifications;
DROP TABLE IF EXISTS sentinel_classifications CASCADE;

-- Step 2: Create SENTINEL's classifications
CREATE TABLE IF NOT EXISTS sentinel_classifications (
  id bigserial PRIMARY KEY,
  incident_id bigint REFERENCES incidents(id) ON DELETE CASCADE,
  incident_type text,
  severity text,
  sector text,
  confidence double precision DEFAULT 0,
  summary text,
  reasoning text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE sentinel_classifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc_all" ON sentinel_classifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "anon_read" ON sentinel_classifications FOR SELECT USING (true);

-- Step 3: Create SENTINEL's alerts
CREATE TABLE IF NOT EXISTS sentinel_alerts (
  id bigserial PRIMARY KEY,
  incident_id bigint REFERENCES incidents(id) ON DELETE CASCADE,
  severity text NOT NULL DEFAULT 'medium',
  sector text,
  summary text,
  dispatch_channel text DEFAULT 'dashboard',
  acknowledged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE sentinel_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc_all" ON sentinel_alerts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "anon_read" ON sentinel_alerts FOR SELECT USING (true);

-- Step 4: Sanity check
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('classifications', 'alerts', 'sentinel_classifications', 'sentinel_alerts')
ORDER BY table_name;
