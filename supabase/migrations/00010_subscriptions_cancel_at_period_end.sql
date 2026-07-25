-- Tracks whether a subscription is scheduled to cancel at the end of the
-- current billing period (Stripe's default cancellation behavior), so the
-- UI can offer "Reactivate" during that grace window instead of only after
-- it has fully lapsed to the free plan.
alter table subscriptions
  add column if not exists cancel_at_period_end boolean not null default false;
