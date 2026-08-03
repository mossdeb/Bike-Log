-- Up to 3 independent, named maintenance intervals per component (e.g.
-- "Fork lower leg service" every 200km + "Brake bleed" every 6 months on
-- the same component), replacing the single flat interval_type/
-- interval_value pair on components. `slot` is display order and also the
-- identity used to replace a component's interval set on edit.
create table if not exists component_service_intervals (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references components(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, -- denormalized for simple RLS, matches components/interventions
  slot smallint not null check (slot between 1 and 3),
  name text not null,
  interval_type text not null check (interval_type in ('km', 'hours', 'months')),
  interval_value numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (component_id, slot)
);

create index if not exists component_service_intervals_component_id_idx on component_service_intervals (component_id);
create index if not exists component_service_intervals_user_id_idx on component_service_intervals (user_id);

create trigger component_service_intervals_set_updated_at
  before update on component_service_intervals
  for each row execute function set_updated_at();

alter table component_service_intervals enable row level security;

create policy "component_service_intervals_select_own" on component_service_intervals
  for select using ((select auth.uid()) = user_id);

create policy "component_service_intervals_insert_own" on component_service_intervals
  for insert with check (
    (select auth.uid()) = user_id
    and exists (select 1 from components c where c.id = component_id and c.user_id = (select auth.uid()))
  );

create policy "component_service_intervals_update_own" on component_service_intervals
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "component_service_intervals_delete_own" on component_service_intervals
  for delete using ((select auth.uid()) = user_id);

-- Backfill: every existing component with a configured interval becomes
-- slot 1, named per the owner's language preference (editable afterwards).
insert into component_service_intervals (component_id, user_id, slot, name, interval_type, interval_value)
select
  c.id,
  c.user_id,
  1,
  case when u.raw_user_meta_data->>'language' = 'pt' then 'Manutenção' else 'Maintenance' end,
  c.interval_type,
  c.interval_value
from components c
join auth.users u on u.id = c.user_id
where c.interval_type is not null and c.interval_value is not null;

-- Records which interval a "reset" intervention actually reset, resolved
-- server-side at creation time (whichever interval was active then).
-- Null when the intervention doesn't reset anything (resets_interval =
-- false) or the component had no intervals configured.
alter table interventions add column if not exists reset_interval_id uuid references component_service_intervals(id) on delete set null;
create index if not exists interventions_reset_interval_id_idx on interventions (reset_interval_id);

-- One row per configured interval, each with its OWN baseline (the most
-- recent intervention that specifically reset THAT interval) — replaces
-- components_status, which could only represent one baseline per
-- component. No row exists for a component with zero configured
-- intervals; callers must treat that as "not configured", same meaning as
-- today's interval_type IS NULL.
create view component_interval_status
with (security_invoker = true) -- critical: without this it bypasses RLS
as
select
  csi.id,
  csi.component_id,
  c.name as component_name,
  c.bike_id,
  c.user_id,
  c.active,
  csi.slot,
  csi.name,
  csi.interval_type,
  csi.interval_value,
  c.install_date,
  c.bike_km_at_install,
  c.bike_hours_at_install,
  li.date as last_intervention_date,
  li.bike_km_at_intervention as last_service_km,
  li.bike_hours_at_intervention as last_service_hours
from component_service_intervals csi
join components c on c.id = csi.component_id
left join lateral (
  select date, bike_km_at_intervention, bike_hours_at_intervention
  from interventions i
  where i.reset_interval_id = csi.id
  order by i.date desc, i.created_at desc
  limit 1
) li on true;

-- Lets the maintenance-reminder cron dedupe per interval, not just per
-- component — two intervals on the same component must be able to notify
-- independently instead of one send suppressing the other. Null for
-- weekly_summary (no interval of its own) and for rows logged before this
-- column existed.
alter table notification_log add column if not exists service_interval_id uuid references component_service_intervals(id) on delete cascade;
drop index if exists notification_log_episode_idx;
create unique index if not exists notification_log_episode_idx
  on notification_log (user_id, component_id, service_interval_id, type, episode_date);
