-- Accumulated distance/usage totals, entered directly on the bike or
-- component (an odometer-style running total), separate from the
-- per-intervention kms/hours_used already recorded on interventions.

alter table bikes add column if not exists total_km numeric;
alter table bikes add column if not exists total_hours numeric;

alter table components add column if not exists total_km numeric;
alter table components add column if not exists total_hours numeric;
