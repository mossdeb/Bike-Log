-- Until now the cron was the only thing that evaluated health bands, so
-- reading the stored band and writing the new one as two separate statements
-- was safe: nothing else could interleave. The Strava webhook is about to
-- become a second caller, and two callers doing read-then-write can both
-- read "nothing outstanding" and both send.
--
-- claim_interval_notification collapses that into one locked statement:
-- whoever claims the band is the one that sends. The claim happens *before*
-- the send rather than after, which is what makes it atomic — and is also
-- why release_interval_notification exists, to hand the band back when the
-- send turns out to have failed. Without that, a failed send would leave a
-- row saying the owner had been told and silence the interval until it
-- recovered.

create or replace function claim_interval_notification(
  p_service_interval_id uuid,
  p_channel text,
  p_user_id uuid,
  p_level text
) returns table (claimed boolean, previous_level text, previous_notified_at timestamptz)
language plpgsql
as $$
declare
  v_rank int := case p_level when 'critical' then 2 when 'attention' then 1 else 0 end;
  v_prev_level text;
  v_prev_at timestamptz;
begin
  if v_rank = 0 then
    raise exception 'claim_interval_notification: unknown level %', p_level;
  end if;

  -- Locks the row for the rest of this statement's transaction. A second
  -- caller blocks here and, under read committed, re-reads the row the
  -- winner just wrote — so it sees the new band and declines.
  select level, notified_at into v_prev_level, v_prev_at
    from component_interval_notifications
   where service_interval_id = p_service_interval_id
     and channel = p_channel
     for update;

  if found then
    -- Same band as last time, or a milder one, is not news.
    if (case v_prev_level when 'critical' then 2 when 'attention' then 1 else 0 end) >= v_rank then
      return query select false, v_prev_level, v_prev_at;
      return;
    end if;

    update component_interval_notifications
       set level = p_level, notified_at = now(), user_id = p_user_id
     where service_interval_id = p_service_interval_id
       and channel = p_channel;
    return query select true, v_prev_level, v_prev_at;
    return;
  end if;

  -- No row to lock. Two callers can both get here, so the unique index is
  -- what actually arbitrates: the loser blocks on insert until the winner
  -- commits and then fails, which is the same answer as losing the lock.
  begin
    insert into component_interval_notifications (service_interval_id, channel, user_id, level, notified_at)
    values (p_service_interval_id, p_channel, p_user_id, p_level, now());
    return query select true, null::text, null::timestamptz;
  exception when unique_violation then
    return query select false, null::text, null::timestamptz;
  end;
end;
$$;

-- Puts the band back the way it was, for a claim whose send then failed.
-- Guarded on the claimed level still being the stored one, so a legitimate
-- claim that landed in between (a worse band, from another caller) is never
-- undone by a late rollback.
create or replace function release_interval_notification(
  p_service_interval_id uuid,
  p_channel text,
  p_claimed_level text,
  p_previous_level text,
  p_previous_notified_at timestamptz
) returns void
language plpgsql
as $$
begin
  if p_previous_level is null then
    delete from component_interval_notifications
     where service_interval_id = p_service_interval_id
       and channel = p_channel
       and level = p_claimed_level;
  else
    update component_interval_notifications
       set level = p_previous_level, notified_at = p_previous_notified_at
     where service_interval_id = p_service_interval_id
       and channel = p_channel
       and level = p_claimed_level;
  end if;
end;
$$;

-- Only the cron and the webhook call these, both through the service-role
-- client. Nothing signed in as a user has any business claiming a band.
revoke execute on function claim_interval_notification(uuid, text, uuid, text) from public, anon, authenticated;
revoke execute on function release_interval_notification(uuid, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function claim_interval_notification(uuid, text, uuid, text) to service_role;
grant execute on function release_interval_notification(uuid, text, text, text, timestamptz) to service_role;
