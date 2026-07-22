-- RLS for interventions, same per-user pattern as bikes/components. Written
-- with (select auth.uid()) from the start this time (see migration 00004
-- for why bikes/components needed a follow-up fix).

alter table interventions enable row level security;

create policy "interventions_select_own" on interventions
  for select using ((select auth.uid()) = user_id);

create policy "interventions_insert_own" on interventions
  for insert with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from components c
      where c.id = component_id and c.user_id = (select auth.uid())
    )
  );

create policy "interventions_update_own" on interventions
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "interventions_delete_own" on interventions
  for delete using ((select auth.uid()) = user_id);
