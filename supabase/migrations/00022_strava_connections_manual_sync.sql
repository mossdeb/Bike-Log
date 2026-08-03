-- Tracks the last manual "Reload" sync per Strava connection, so the button
-- on the bike page can be rate-limited without a separate table.
alter table strava_connections add column if not exists last_manual_sync_at timestamptz;
