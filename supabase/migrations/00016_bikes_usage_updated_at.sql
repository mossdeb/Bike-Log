-- Tracks when a bike's total_km/total_hours last changed (manual edit or
-- Strava sync), independent of the generic updated_at bumped by any edit
-- (name, brand, etc). Powers "most recently used" ordering on the dashboard.

alter table bikes add column if not exists usage_updated_at timestamptz;

-- Backfill: best available approximation for existing rows.
update bikes set usage_updated_at = updated_at where usage_updated_at is null;

create or replace function set_bike_usage_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.usage_updated_at = now();
  return new;
end;
$$;

drop trigger if exists bikes_set_usage_updated_at on bikes;

create trigger bikes_set_usage_updated_at
  before update on bikes
  for each row
  when (
    old.total_km is distinct from new.total_km
    or old.total_hours is distinct from new.total_hours
  )
  execute function set_bike_usage_updated_at();
