-- Advisor flagged set_updated_at() for a mutable search_path (a function
-- without a pinned search_path can be tricked by a malicious search_path
-- into resolving to attacker-controlled objects). Pin it explicitly.
create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
