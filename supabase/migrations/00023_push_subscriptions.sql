-- Web Push endpoints, one row per browser/device that opted in. A single
-- account can have several (phone home screen, laptop Chrome, …) and each
-- has its own endpoint URL and encryption keys; the push service treats
-- them as completely independent recipients, so we fan out to all of them.
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- The push service's URL for this device. Globally unique by definition,
  -- and the only stable identity a subscription has — re-subscribing on the
  -- same device returns the same endpoint, so upserting on it keeps one row
  -- per device instead of accumulating duplicates.
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists push_subscriptions_user_id_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_select_own" on push_subscriptions
  for select using ((select auth.uid()) = user_id);

create policy "push_subscriptions_insert_own" on push_subscriptions
  for insert with check ((select auth.uid()) = user_id);

create policy "push_subscriptions_update_own" on push_subscriptions
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "push_subscriptions_delete_own" on push_subscriptions
  for delete using ((select auth.uid()) = user_id);

-- Email and push are toggled independently, so they must dedupe
-- independently too — without this, whichever channel sent first for an
-- episode would suppress the other one forever. Existing rows are all
-- email sends.
alter table notification_log add column if not exists channel text not null default 'email';
alter table notification_log drop constraint if exists notification_log_channel_check;
alter table notification_log add constraint notification_log_channel_check check (channel in ('email', 'push'));

drop index if exists notification_log_episode_idx;
create unique index if not exists notification_log_episode_idx
  on notification_log (user_id, component_id, service_interval_id, type, episode_date, channel);
