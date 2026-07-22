-- Advisor flagged auth.uid() in RLS policies as re-evaluated per row instead
-- of once per query. Wrapping it as (select auth.uid()) lets Postgres treat
-- it as a stable subquery, evaluated once. See:
-- https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

drop policy if exists "bikes_select_own" on bikes;
drop policy if exists "bikes_insert_own" on bikes;
drop policy if exists "bikes_update_own" on bikes;
drop policy if exists "bikes_delete_own" on bikes;

create policy "bikes_select_own" on bikes
  for select using ((select auth.uid()) = user_id);

create policy "bikes_insert_own" on bikes
  for insert with check ((select auth.uid()) = user_id);

create policy "bikes_update_own" on bikes
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "bikes_delete_own" on bikes
  for delete using ((select auth.uid()) = user_id);

drop policy if exists "components_select_own" on components;
drop policy if exists "components_insert_own" on components;
drop policy if exists "components_update_own" on components;
drop policy if exists "components_delete_own" on components;

create policy "components_select_own" on components
  for select using ((select auth.uid()) = user_id);

create policy "components_insert_own" on components
  for insert with check (
    (select auth.uid()) = user_id
    and exists (select 1 from bikes b where b.id = bike_id and b.user_id = (select auth.uid()))
  );

create policy "components_update_own" on components
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "components_delete_own" on components
  for delete using ((select auth.uid()) = user_id);
