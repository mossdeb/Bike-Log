-- Maintenance history: one row per service/repair/replacement logged
-- against a component.

create table if not exists interventions (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references components(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, -- denormalized for simple RLS
  type text not null check (type in ('service', 'repair', 'replacement')),
  date date not null,
  hours_used numeric,  -- recorded, not used in the V1 date-based alert calculation
  kms numeric,         -- ditto
  description text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interventions_component_id_date_idx
  on interventions (component_id, date desc);
create index if not exists interventions_user_id_idx on interventions (user_id);

create trigger interventions_set_updated_at
  before update on interventions
  for each row execute function set_updated_at();
