-- Maintenance due-date calculation becomes configurable per component:
-- exactly one of km, hours, or months drives when the next service is due,
-- replacing the old months-only interval_months column (interval_km /
-- interval_hours existed but were never wired up to any calculation).

drop view if exists components_status;

alter table components add column if not exists interval_type text check (interval_type in ('km', 'hours', 'months'));
alter table components add column if not exists interval_value numeric;

update components set interval_type = 'months', interval_value = interval_months where interval_months is not null;

alter table components drop column if exists interval_months;
alter table components drop column if exists interval_km;
alter table components drop column if exists interval_hours;

-- For km/hours criteria we need to know the bike's totals at the moment of
-- the component's last service, to measure usage accrued since then (the
-- same idea as bike_km_at_install, but reset by servicing). Rather than
-- caching this on the component (which would go stale if an intervention
-- is later edited or deleted), snapshot it on the intervention itself —
-- the components_status view can then always pull it live from the most
-- recent intervention, exactly like it already does for last_intervention_date.
alter table interventions add column if not exists bike_km_at_intervention numeric;
alter table interventions add column if not exists bike_hours_at_intervention numeric;

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
  where i.component_id = c.id
  order by i.date desc, i.created_at desc
  limit 1
) li on true;
