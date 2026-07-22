-- Raw data for the "next service due" calculation (no status logic here —
-- that lives in src/lib/maintenance/calculation.ts so it's unit-testable
-- and reusable between the component page and the Phase 4 dashboard).
create view components_status
with (security_invoker = true) -- critical: without this it bypasses RLS
as
select
  c.*,
  li.date as last_intervention_date
from components c
left join lateral (
  select date
  from interventions i
  where i.component_id = c.id
  order by i.date desc, i.created_at desc
  limit 1
) li on true;
