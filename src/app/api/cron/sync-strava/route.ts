import { createAdminClient } from "@/lib/supabase/admin";
import { checkStravaSubscriptionHealth, getValidStravaAccessToken, syncActivityToBike, type StravaActivity } from "@/lib/strava";

export const dynamic = "force-dynamic";

const LOOKBACK_DAYS = 3;

// Safety net for the Strava webhook: fetches each connected user's recent
// activities directly and backfills anything the webhook never delivered.
// Runs daily, so a silent webhook outage self-heals within a day instead of
// permanently losing rides.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await checkStravaSubscriptionHealth();

  const admin = createAdminClient();
  const { data: connections, error } = await admin.from("strava_connections").select("user_id");
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const after = Math.floor(Date.now() / 1000) - LOOKBACK_DAYS * 86_400;
  let synced = 0;

  for (const connection of connections ?? []) {
    const accessToken = await getValidStravaAccessToken(admin, connection.user_id);
    if (!accessToken) continue;

    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=30`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) {
      console.error("[strava sync] failed to list activities for user", connection.user_id, res.status);
      continue;
    }

    const activities: StravaActivity[] = await res.json();
    for (const activity of activities) {
      const result = await syncActivityToBike(admin, connection.user_id, activity);
      if (result === "synced") synced += 1;
    }
  }

  return Response.json({ synced });
}
