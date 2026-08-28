-- SENTINEL Database Schema for Supabase
-- Safe to run multiple times (drops policies before recreating)

-- Drop existing policies
DROP POLICY IF EXISTS "svc_all" ON incidents;
DROP POLICY IF EXISTS "svc_all" ON validations;
DROP POLICY IF EXISTS "svc_all" ON classifications;
DROP POLICY IF EXISTS "svc_all" ON alerts;
DROP POLICY IF EXISTS "svc_all" ON geofence_zones;
DROP POLICY IF EXISTS "svc_all" ON pipeline_runs;
DROP POLICY IF EXISTS "anon_read" ON incidents;
DROP POLICY IF EXISTS "anon_read" ON validations;
DROP POLICY IF EXISTS "anon_read" ON classifications;
DROP POLICY IF EXISTS "anon_read" ON alerts;
DROP POLICY IF EXISTS "anon_read" ON geofence_zones;

-- Tables
CREATE TABLE IF NOT EXISTS incidents (
  id bigserial PRIMARY KEY,
  reporter_phone text NOT NULL,
  reporter_name text,
  incident_type text NOT NULL DEFAULT 'other',
  description text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  location_name text,
  language text DEFAULT 'en',
  source text DEFAULT 'app',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS validations (
  id bigserial PRIMARY KEY,
  incident_id bigint REFERENCES incidents(id) ON DELETE CASCADE,
  location_verified boolean DEFAULT false,
  number_verified boolean DEFAULT false,
  device_active boolean DEFAULT false,
  location_confidence double precision DEFAULT 0,
  overall_score double precision DEFAULT 0,
  validation_details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classifications (
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

CREATE TABLE IF NOT EXISTS alerts (
  id bigserial PRIMARY KEY,
  incident_id bigint REFERENCES incidents(id) ON DELETE CASCADE,
  severity text NOT NULL DEFAULT 'medium',
  sector text,
  summary text,
  dispatch_channel text DEFAULT 'dashboard',
  acknowledged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS geofence_zones (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  zone_type text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  radius_meters double precision DEFAULT 1000,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
  id bigserial PRIMARY KEY,
  run_type text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  source text,
  items_total int DEFAULT 0,
  items_new int DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz
);

-- Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofence_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "svc_all" ON incidents FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_all" ON validations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_all" ON classifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_all" ON alerts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_all" ON geofence_zones FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_all" ON pipeline_runs FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "anon_read" ON incidents FOR SELECT USING (true);
CREATE POLICY "anon_read" ON validations FOR SELECT USING (true);
CREATE POLICY "anon_read" ON classifications FOR SELECT USING (true);
CREATE POLICY "anon_read" ON alerts FOR SELECT USING (true);
CREATE POLICY "anon_read" ON geofence_zones FOR SELECT USING (true);
