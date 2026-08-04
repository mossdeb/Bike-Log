import { createAdminClient } from "@/lib/supabase/admin";
import { fetchStravaActivity, getValidStravaAccessToken, syncActivityToBike } from "@/lib/strava";
import { sendStravaSyncPush } from "@/lib/push";

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
  if (!accessToken) {
    console.error("[strava webhook] no valid access token for user", connection.user_id);
    return Response.json({ ok: true });
  }

  const activity = await fetchStravaActivity(accessToken, event.object_id);
  if (!activity) {
    console.error("[strava webhook] failed to fetch activity", event.object_id);
    return Response.json({ ok: true });
  }

  const result = await syncActivityToBike(admin, connection.user_id, activity);
  if (result.status === "error") {
    console.error("[strava webhook] failed to sync activity", activity.id);
  }
  if (result.status === "synced") {
    await sendStravaSyncPush(admin, connection.user_id, [
      { id: result.bikeId, name: result.bikeName, km: result.distanceKm, hours: result.movingHours },
    ]);
  }

  return Response.json({ ok: true });
}
