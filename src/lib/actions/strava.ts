"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stravaAuthorizeUrl, accessTokenForConnection, syncActivitiesToBikes, type StravaActivity } from "@/lib/strava";

const MANUAL_SYNC_LOOKBACK_DAYS = 30;
const MANUAL_SYNC_COOLDOWN_MINUTES = 60;

export async function connectStrava() {
  const origin = (await headers()).get("origin");
  redirect(stravaAuthorizeUrl(`${origin}/api/strava/callback`));
}

export async function disconnectStrava() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const userId = userData?.claims?.sub as string | undefined;
  if (!userId) redirect("/login");

  // Bikes keep their history, but the gear mapping is meaningless once the
  // connection (and its tokens) are gone.
  await supabase.from("bikes").update({ strava_gear_id: null }).eq("user_id", userId);
  await supabase.from("strava_connections").delete().eq("user_id", userId);

  revalidatePath("/settings");
  redirect("/settings");
}

/** Manual "Reload" button on a bike's detail page. Re-fetches the athlete's
 * last 30 days of Strava activities and re-runs the same idempotent sync the
 * webhook and daily cron use — this is the recovery path for activities that
 * had no gear assigned when ridden and only got one attached afterwards,
 * since Strava never sends a webhook event for a gear_id change. Rate
 * limited per connection (not per bike) since one sync call updates every
 * bike the athlete has gear-linked, not just the one the button was clicked
 * on. */
export async function manualSyncStrava(formData: FormData) {
  const bikeIdValue = formData.get("bikeId");
  const redirectTo = typeof bikeIdValue === "string" && bikeIdValue ? `/bikes/${bikeIdValue}` : "/bikes";

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const userId = userData?.claims?.sub as string | undefined;
  if (!userId) redirect("/login");

  const admin = createAdminClient();

  // The cooldown stamp and the tokens live in the same row, so they come back
  // in one read — asking for the tokens separately was a round trip spent
  // re-reading a row we already had.
  const { data: connection } = await admin
    .from("strava_connections")
    .select("last_manual_sync_at, access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!connection) {
    redirect(`${redirectTo}?syncStatus=not-connected`);
  }

  if (connection.last_manual_sync_at) {
    const elapsedMinutes = (Date.now() - new Date(connection.last_manual_sync_at).getTime()) / 60_000;
    const remainingMinutes = Math.ceil(MANUAL_SYNC_COOLDOWN_MINUTES - elapsedMinutes);
    if (remainingMinutes > 0) {
      redirect(`${redirectTo}?syncStatus=rate-limited&syncMinutes=${remainingMinutes}`);
    }
  }

  const accessToken = await accessTokenForConnection(admin, userId, connection);

  const after = Math.floor(Date.now() / 1000) - MANUAL_SYNC_LOOKBACK_DAYS * 86_400;

  // The cooldown stamp is recorded before the fetch resolves, so a failed or
  // slow request still starts it — otherwise a user hitting a transient Strava
  // error could retry in a tight loop. Nothing downstream reads it back, so it
  // rides along with the fetch instead of delaying it.
  const [, res] = await Promise.all([
    admin.from("strava_connections").update({ last_manual_sync_at: new Date().toISOString() }).eq("user_id", userId),
    fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  ]);
  if (!res.ok) {
    redirect(`${redirectTo}?syncStatus=error`);
  }

  const activities: StravaActivity[] = await res.json();
  const synced = await syncActivitiesToBikes(admin, userId, activities);

  revalidatePath("/bikes/[bikeId]", "page");
  redirect(`${redirectTo}?syncStatus=synced&syncCount=${synced}`);
}
