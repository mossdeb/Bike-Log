-- Notifications now fire on a *transition* into a worse health band rather
-- than on a component happening to sit inside a window on the morning the
-- cron runs. That needs the last band we told the owner about, per interval
-- and per channel — one row while an interval is in a state worth notifying
-- about, no row once it recovers.
--
-- Replaces the episode_date dedupe in notification_log, which had two holes:
-- it could only ever fire once per state per episode even after the owner
-- serviced and re-wore the part within the same episode, and editing an
-- unrelated field (the install date) silently opened a new episode and
-- re-sent everything.
create table if not exists component_interval_notifications (
  service_interval_id uuid not null references component_service_intervals(id) on delete cascade,
  channel text not null check (channel in ('email', 'push')),
  user_id uuid not null references auth.users(id) on delete cascade,
  level text not null check (level in ('attention', 'critical')),
  notified_at timestamptz not null default now(),
  primary key (service_interval_id, channel)
);

create index if not exists component_interval_notifications_user_id_idx
  on component_interval_notifications (user_id);

alter table component_interval_notifications enable row level security;

-- Written only by the cron through the service-role client (which bypasses
-- RLS). Owners get select for consistency, and delete so that logging an
-- intervention can clear the state immediately instead of waiting for the
-- next cron pass to notice the component recovered.
create policy "component_interval_notifications_select_own" on component_interval_notifications
  for select using ((select auth.uid()) = user_id);

create policy "component_interval_notifications_delete_own" on component_interval_notifications
  for delete using ((select auth.uid()) = user_id);

-- Seed from what's already been sent, so switching to transition tracking
-- doesn't re-announce components the owner has already heard about. Rows
-- predating the multi-interval migration have service_interval_id null; the
-- 00020 backfill put each component's single old interval in slot 1, so
-- that's where they map. "critical" wins over "attention" for the same
-- interval, because having been told the worse news implies the milder one.
insert into component_interval_notifications (service_interval_id, channel, user_id, level, notified_at)
select
  interval_id,
  'email',
  user_id,
  case when bool_or(type = 'overdue') then 'critical' else 'attention' end,
  max(sent_at)
from (
  select
    coalesce(
      nl.service_interval_id,
      (select csi.id from component_service_intervals csi where csi.component_id = nl.component_id and csi.slot = 1)
    ) as interval_id,
    nl.user_id,
    nl.type,
    nl.sent_at
  from notification_log nl
  where nl.type in ('due_soon', 'overdue')
) mapped
where interval_id is not null
group by interval_id, user_id
on conflict do nothing;

-- notification_log goes back to being a plain audit trail: it no longer
-- gates anything for due_soon/overdue, so a unique key on the episode would
-- only reject legitimate repeat sends.
drop index if exists notification_log_episode_idx;
create index if not exists notification_log_episode_idx
  on notification_log (user_id, component_id, service_interval_id, type, channel);
