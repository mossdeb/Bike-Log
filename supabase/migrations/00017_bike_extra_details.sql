-- Additional optional bike attributes, revealed in the bike form via an
-- "Add Details" picker instead of being always-on fields (see
-- BikeOptionalFields). Kept as plain nullable columns — which fields are
-- "active" for a given bike is inferred from having a value, not tracked
-- separately.
alter table bikes add column if not exists purchase_date date;
alter table bikes add column if not exists warranty text;
alter table bikes add column if not exists frame_size text;
alter table bikes add column if not exists wheel_size text;

-- The bike name is now optional in the form — a display name is derived
-- from brand/model/type server-side when left blank (see deriveBikeName
-- in lib/actions/bikes.ts), which always produces a non-empty string, so
-- the column itself stays not-null.
