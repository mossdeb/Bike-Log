-- Row Level Security for bikes and components: every user only ever sees
-- their own data. Policies are per-operation (not FOR ALL) so each grant is
-- explicit and auditable.

alter table bikes enable row level security;
alter table components enable row level security;

create policy "bikes_select_own" on bikes
  for select using (auth.uid() = user_id);

create policy "bikes_insert_own" on bikes
  for insert with check (auth.uid() = user_id);

create policy "bikes_update_own" on bikes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "bikes_delete_own" on bikes
  for delete using (auth.uid() = user_id);

-- Components additionally confirm the parent bike belongs to the same user,
-- so a stale/forged bike_id can't be used to smuggle a row onto someone
-- else's bike.
create policy "components_select_own" on components
  for select using (auth.uid() = user_id);

create policy "components_insert_own" on components
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from bikes b where b.id = bike_id and b.user_id = auth.uid())
  );

create policy "components_update_own" on components
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "components_delete_own" on components
  for delete using (auth.uid() = user_id);
