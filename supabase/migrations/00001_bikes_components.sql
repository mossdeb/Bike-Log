-- Bikes and components schema for BikeLog.
-- Interventions land in a later migration (Phase 3).

create table if not exists bikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text,
  model text,
  year integer,
  type text,
  color text,
  serial_number text,
  image_url text,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists components (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid not null references bikes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, -- denormalized for simple RLS
  name text not null,
  category text,
  brand text,
  model text,
  serial_number text,
  install_date date,
  interval_months integer,   -- used in V1 "next service due" calculation
  interval_km numeric,       -- stored for future use, not used in V1 calculation
  interval_hours numeric,    -- ditto
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bikes_user_id_idx on bikes (user_id);
create index if not exists components_bike_id_idx on components (bike_id);
create index if not exists components_user_id_idx on components (user_id);

-- Keeps updated_at current on every row change.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bikes_set_updated_at
  before update on bikes
  for each row execute function set_updated_at();

create trigger components_set_updated_at
  before update on components
  for each row execute function set_updated_at();
