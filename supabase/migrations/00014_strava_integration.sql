-- Strava integration: one OAuth connection per user, an optional gear
-- mapping per bike, and an idempotency log so webhook retries/duplicate
-- events never double-count an activity's distance/time.

create table if not exists strava_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  athlete_id bigint not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table strava_connections enable row level security;

create policy "strava_connections_select_own" on strava_connections
  for select using ((select auth.uid()) = user_id);
create policy "strava_connections_insert_own" on strava_connections
  for insert with check ((select auth.uid()) = user_id);
create policy "strava_connections_update_own" on strava_connections
  for update using ((select auth.uid()) = user_id);
create policy "strava_connections_delete_own" on strava_connections
  for delete using ((select auth.uid()) = user_id);

create trigger strava_connections_set_updated_at
  before update on strava_connections
  for each row execute function set_updated_at();

alter table bikes add column if not exists strava_gear_id text;
create unique index if not exists bikes_strava_gear_id_idx on bikes (strava_gear_id) where strava_gear_id is not null;

create table if not exists strava_activities (
  strava_activity_id bigint primary key,
  bike_id uuid not null references bikes(id) on delete cascade,
  distance_km numeric not null,
  moving_time_hours numeric not null,
  processed_at timestamptz not null default now()
);

alter table strava_activities enable row level security;

create policy "strava_activities_select_own" on strava_activities
  for select using (
    exists (select 1 from bikes b where b.id = strava_activities.bike_id and b.user_id = (select auth.uid()))
  );
