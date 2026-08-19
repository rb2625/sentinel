-- SENTINEL Database Schema for Supabase

create table if not exists incidents (
  id bigserial primary key,
  reporter_phone text not null,
  reporter_name text,
  incident_type text not null default 'other',
  description text not null,
  latitude double precision not null,
  longitude double precision not null,
  location_name text,
  language text default 'en',
  source text default 'app',
  created_at timestamptz default now()
);

create table if not exists validations (
  id bigserial primary key,
  incident_id bigint references incidents(id) on delete cascade,
  location_verified boolean default false,
  number_verified boolean default false,
  device_active boolean default false,
  location_confidence double precision default 0,
  overall_score double precision default 0,
  validation_details jsonb,
  created_at timestamptz default now()
);

create table if not exists classifications (
  id bigserial primary key,
  incident_id bigint references incidents(id) on delete cascade,
  incident_type text,
  severity text,
  sector text,
  confidence double precision default 0,
  summary text,
  reasoning text,
  created_at timestamptz default now()
);

create table if not exists alerts (
  id bigserial primary key,
  incident_id bigint references incidents(id) on delete cascade,
  severity text not null default 'medium',
  sector text,
  summary text,
  dispatch_channel text default 'dashboard',
  acknowledged boolean default false,
  created_at timestamptz default now()
);

create table if not exists geofence_zones (
  id bigserial primary key,
  name text not null,
  zone_type text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius_meters double precision default 1000,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists pipeline_runs (
  id bigserial primary key,
  run_type text not null,
  status text not null default 'running',
  source text,
  items_total int default 0,
  items_new int default 0,
  error_message text,
  started_at timestamptz default now(),
  finished_at timestamptz
);

-- RLS
alter table incidents enable row level security;
alter table validations enable row level security;
alter table classifications enable row level security;
alter table alerts enable row level security;
alter table geofence_zones enable row level security;
alter table pipeline_runs enable row level security;

create policy "svc_all" on incidents for all using (auth.role() = 'service_role');
create policy "svc_all" on validations for all using (auth.role() = 'service_role');
create policy "svc_all" on classifications for all using (auth.role() = 'service_role');
create policy "svc_all" on alerts for all using (auth.role() = 'service_role');
create policy "svc_all" on geofence_zones for all using (auth.role() = 'service_role');
create policy "svc_all" on pipeline_runs for all using (auth.role() = 'service_role');

create policy "anon_read" on incidents for select using (true);
create policy "anon_read" on validations for select using (true);
create policy "anon_read" on classifications for select using (true);
create policy "anon_read" on alerts for select using (true);
create policy "anon_read" on geofence_zones for select using (true);
