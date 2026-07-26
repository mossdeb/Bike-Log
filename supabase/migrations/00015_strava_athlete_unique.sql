-- A Strava athlete should only ever be connected to one Bikit account —
-- otherwise the webhook's athlete_id lookup becomes ambiguous (it expects
-- exactly one match) and silently stops syncing for everyone sharing that
-- athlete.
create unique index if not exists strava_connections_athlete_id_idx
  on strava_connections (athlete_id);
