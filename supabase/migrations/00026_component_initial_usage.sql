-- The usage a component already carried when it was fitted — what the "Total
-- kms / Total hours" fields on the create form mean. Until now that figure was
-- only ever folded into the baseline (bike_km_at_install = bike total −
-- initial), and since the bike's total at that moment isn't kept either, it
-- couldn't be recovered afterwards. The timeline wants to show it.
--
-- Deliberately nullable with no default: existing rows genuinely don't know.
-- Backfilling them with 0 would be a guess that reads as fact for any
-- second-hand part logged before this migration.
alter table components
  add column initial_km numeric,
  add column initial_hours numeric;

comment on column components.initial_km is
  'Usage the part already carried when fitted, in km. Null for rows created before this was recorded.';
comment on column components.initial_hours is
  'Usage the part already carried when fitted, in hours. Null for rows created before this was recorded.';
