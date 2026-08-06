-- Archiving a component: retired_at is the day the part came off the bike, and
-- the single answer to whether it is still fitted.
--
-- It replaces `active`, a boolean that had been in the schema since 00001 and
-- was never once written — no screen could set it, and all 27 rows were true.
-- Only the two notification paths ever read it. A boolean also answers the
-- wrong question: the timeline, the archive list and the frozen usage figures
-- all need to know *when*, and "false" carries no date.
--
-- A date rather than a timestamptz, to match install_date and to sort straight
-- into the timeline. Slicing a timestamptz into yyyy-MM-dd is how the warranty
-- expiry lost a day for anyone ahead of UTC; the hour it was archived at is not
-- information anyone needs.
alter table components
  add column retired_at date,
  add column bike_km_at_retire numeric,
  add column bike_hours_at_retire numeric;

comment on column components.retired_at is
  'The day the part came off the bike. Null means still fitted.';
comment on column components.bike_km_at_retire is
  'The bike total at the moment the part was archived. Usage is always derived (bike total - baseline) and never stored, so without this an archived part would go on accruing kilometres it never rode. It is also what restoring needs, to push the baseline forward by the distance the bike covered without it.';
comment on column components.bike_hours_at_retire is
  'As bike_km_at_retire, in hours.';

-- Both views read c.active, so neither can stand while the column goes.
-- Dropped and recreated rather than replaced: create or replace can append a
-- column but cannot change one's name or type.
--
-- components_status is the pre-00020 view, superseded by component_interval_status
-- when a component gained more than one interval, and read by nothing in the
-- app since. It is rebuilt rather than dropped so this migration stays about
-- archiving; it remains a candidate for deletion on its own terms.
drop view if exists component_interval_status;
drop view if exists components_status;

alter table components drop column active;

create view component_interval_status
with (security_invoker = true) -- critical: without this it bypasses RLS
as
select
  csi.id,
  csi.component_id,
  c.name as component_name,
  c.bike_id,
  c.user_id,
  c.retired_at,
  csi.slot,
  csi.name,
  csi.interval_type,
  csi.interval_value,
  c.install_date,
  c.created_at::date as component_created_at,
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

create view components_status
with (security_invoker = true) -- critical: without this it bypasses RLS
as
select
  c.*,
  li.date as last_intervention_date,
  li.bike_km_at_intervention as last_service_km,
  li.bike_hours_at_intervention as last_service_hours
from components c
left join lateral (
  select date, bike_km_at_intervention, bike_hours_at_intervention
  from interventions i
  where i.component_id = c.id and i.resets_interval = true
  order by i.date desc, i.created_at desc
  limit 1
) li on true;

-- Every list of a bike's fitted parts now carries this predicate.
create index components_bike_fitted_idx on components (bike_id) where retired_at is null;
