-- Tracks each user's plan and Stripe subscription state. Absence of a row
-- (or plan = 'free') means the free tier — no Stripe customer is created
-- until a user actually upgrades.

create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free', 'personal', 'pro')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger subscriptions_set_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

alter table subscriptions enable row level security;

-- Read-only for the owner. All writes come from the Stripe webhook route
-- via the service-role admin client, which bypasses RLS.
create policy "subscriptions_select_own" on subscriptions
  for select using ((select auth.uid()) = user_id);
