-- Additional optional component attributes, revealed in the component form
-- via the same "Add Details" picker used for bikes (see
-- ComponentOptionalFields). Plain nullable columns — "active" is inferred
-- from having a value, not tracked separately.
alter table components add column if not exists purchase_date date;
alter table components add column if not exists warranty text;
alter table components add column if not exists year integer;

-- The component name is now optional in the form — a display name is
-- derived from brand/model/category server-side when left blank (see
-- deriveComponentName in lib/actions/components.ts), which always produces
-- a non-empty string, so the column itself stays not-null.
