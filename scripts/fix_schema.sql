-- SENTINEL: Recreate classifications and alerts tables
-- These tables conflicted with BASR's schema. Run this in Supabase SQL Editor.

-- Step 1: Drop BASR's alerts (has FK to time_series which is BASR-only)
DROP POLICY IF EXISTS "svc_all" ON alerts;
DROP POLICY IF EXISTS "anon_read" ON alerts;
DROP TABLE IF EXISTS alerts CASCADE;

-- Step 2: Drop BASR's classifications (has columns: raw_doc_id, sentiment_score, etc.)
DROP POLICY IF EXISTS "svc_all" ON classifications;
DROP POLICY IF EXISTS "anon_read" ON classifications;
DROP TABLE IF EXISTS classifications CASCADE;

-- Step 3: Create SENTINEL's classifications
CREATE TABLE classifications (
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
ALTER TABLE classifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc_all" ON classifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "anon_read" ON classifications FOR SELECT USING (true);

-- Step 4: Create SENTINEL's alerts
CREATE TABLE alerts (
  id bigserial PRIMARY KEY,
  incident_id bigint REFERENCES incidents(id) ON DELETE CASCADE,
  severity text NOT NULL DEFAULT 'medium',
  sector text,
  summary text,
  dispatch_channel text DEFAULT 'dashboard',
  acknowledged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc_all" ON alerts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "anon_read" ON alerts FOR SELECT USING (true);

-- Verify all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('incidents', 'validations', 'classifications', 'alerts', 'geofence_zones', 'pipeline_runs')
ORDER BY table_name;
