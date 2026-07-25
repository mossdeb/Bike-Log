-- A component's accumulated km/hours are no longer entered directly —
-- they're derived as (bike's current total) - (bike's total at the
-- moment the component was installed), so a component only accrues
-- usage from the point it joined the bike, not the bike's full history.

alter table components add column if not exists bike_km_at_install numeric;
alter table components add column if not exists bike_hours_at_install numeric;

-- Preserve any values already entered manually under the old model: back
-- into the install-time baseline that would reproduce the same figure.
update components c
set bike_km_at_install = coalesce(b.total_km, 0) - coalesce(c.total_km, 0),
    bike_hours_at_install = coalesce(b.total_hours, 0) - coalesce(c.total_hours, 0)
from bikes b
where c.bike_id = b.id;

alter table components drop column if exists total_km;
alter table components drop column if exists total_hours;
