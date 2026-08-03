-- Months-type intervals need a base date to count from (last reset, or
-- else install date) — but a component may have neither an install date
-- nor any reset yet. Exposing the component's created_at lets the
-- calculation layer fall back to it as a last resort, so a months
-- reminder never gets stuck "not configured" just because the owner
-- left the optional install-date field blank.
drop view if exists component_interval_status;

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
