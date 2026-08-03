-- Lets a logged intervention opt out of resetting the maintenance
-- countdown (e.g. a minor repair that shouldn't reset the service
-- interval), while still being recorded in the component's history.
-- Defaults to true so existing behavior (every intervention resets the
-- interval) is unchanged for interventions logged before this column
-- existed.

alter table interventions add column if not exists resets_interval boolean not null default true;

drop view if exists components_status;

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
