import { createAdminClient } from "@/lib/supabase/admin";
import { fetchStravaActivity, getValidStravaAccessToken, isCyclingActivity } from "@/lib/strava";

export const dynamic = "force-dynamic";

// One-time handshake Strava performs when the push subscription is created —
// echoes hub.challenge back only if hub.verify_token matches our secret.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN && challenge) {
    return Response.json({ "hub.challenge": challenge });
  }
  return Response.json({ error: "Invalid verify token" }, { status: 403 });
}

// A new activity was created on Strava. We only care about rides logged
// against a gear that's mapped to one of our bikes.
export async function POST(request: Request) {
  const event = await request.json();

  if (event.object_type !== "activity" || event.aspect_type !== "create") {
    return Response.json({ ok: true });
  }

  const admin = createAdminClient();

  const { data: connection } = await admin
    .from("strava_connections")
    .select("user_id")
    .eq("athlete_id", event.owner_id)
    .maybeSingle();
  if (!connection) return Response.json({ ok: true });

  const accessToken = await getValidStravaAccessToken(admin, connection.user_id);
  if (!accessToken) return Response.json({ ok: true });

  const activity = await fetchStravaActivity(accessToken, event.object_id);
  if (!activity || !activity.gear_id || !isCyclingActivity(activity)) {
    return Response.json({ ok: true });
  }

  const { data: bike } = await admin
    .from("bikes")
    .select("id, total_km, total_hours")
    .eq("strava_gear_id", activity.gear_id)
    .eq("user_id", connection.user_id)
    .maybeSingle();
  if (!bike) return Response.json({ ok: true });

  const distanceKm = activity.distance / 1000;
  const movingHours = activity.moving_time / 3600;

  // The unique primary key on strava_activity_id rejects a duplicate insert,
  // which is how a webhook retry (or Strava re-sending the same event) is
  // caught before the distance/time gets double-counted.
  const { error: insertError } = await admin.from("strava_activities").insert({
    strava_activity_id: activity.id,
    bike_id: bike.id,
    distance_km: distanceKm,
    moving_time_hours: movingHours,
  });
  if (insertError) return Response.json({ ok: true });

  await admin
    .from("bikes")
    .update({
      total_km: (bike.total_km ?? 0) + distanceKm,
      total_hours: (bike.total_hours ?? 0) + movingHours,
    })
    .eq("id", bike.id);

  return Response.json({ ok: true });
}
