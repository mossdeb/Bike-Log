-- Tracks sent maintenance-reminder emails so the cron job only sends once
-- per "episode" (due_soon/overdue) or once per week (weekly_summary),
-- instead of re-sending every time it runs while the condition holds.

create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  component_id uuid references components(id) on delete cascade,
  type text not null check (type in ('due_soon', 'overdue', 'weekly_summary')),
  -- The component's status base date (last intervention, or install date)
  -- at send time. Logging a new intervention changes this, which is what
  -- lets the same component be notified again for a new episode. Null for
  -- weekly_summary, which has no component/episode of its own.
  episode_date date,
  sent_at timestamptz not null default now()
);

create unique index if not exists notification_log_episode_idx
  on notification_log (user_id, component_id, type, episode_date);

create index if not exists notification_log_user_type_sent_idx
  on notification_log (user_id, type, sent_at desc);

alter table notification_log enable row level security;

-- Written only by the cron route via the service-role admin client (which
-- bypasses RLS), but owner-only read access is added for consistency with
-- every other table.
create policy "notification_log_select_own" on notification_log
  for select using ((select auth.uid()) = user_id);
