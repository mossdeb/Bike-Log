import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const STRAVA_API = "https://www.strava.com/api/v3";
const STRAVA_OAUTH = "https://www.strava.com/oauth";

// Every cycling variant Strava distinguishes — an activity counts if either
// its (newer) sport_type or (older) type field matches one of these.
const CYCLING_TYPES = new Set([
  "Ride",
  "VirtualRide",
  "GravelRide",
  "MountainBikeRide",
  "EBikeRide",
  "Handcycle",
  "Velomobile",
]);

export function stravaAuthorizeUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "auto",
    // activity:read_all so activities marked private still count (wear on a
    // component doesn't care whether the ride was shared publicly);
    // profile:read_all so GET /athlete actually includes the athlete's
    // registered bikes — without it the `bikes` field comes back empty.
    scope: "activity:read_all,profile:read_all",
  });
  return `${STRAVA_OAUTH}/authorize?${params.toString()}`;
}

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
  athlete?: { id: number };
}

async function requestStravaToken(body: Record<string, string>): Promise<StravaTokenResponse> {
  const res = await fetch(`${STRAVA_OAUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      ...body,
    }),
  });
  if (!res.ok) throw new Error(`Strava token request failed: ${res.status}`);
  return res.json();
}

export function exchangeStravaCode(code: string): Promise<StravaTokenResponse> {
  return requestStravaToken({ code, grant_type: "authorization_code" });
}

/** Returns a usable access token, refreshing (and persisting the refresh)
 * first if the stored one is at or near expiry. Null if never connected. */
export async function getValidStravaAccessToken(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string | null> {
  const { data: connection } = await supabase
    .from("strava_connections")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!connection) return null;

  const expiresAt = new Date(connection.expires_at).getTime();
  if (expiresAt - Date.now() > 5 * 60 * 1000) {
    return connection.access_token;
  }

  const refreshed = await requestStravaToken({
    refresh_token: connection.refresh_token,
    grant_type: "refresh_token",
  });
  await supabase
    .from("strava_connections")
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: new Date(refreshed.expires_at * 1000).toISOString(),
    })
    .eq("user_id", userId);
  return refreshed.access_token;
}

export interface StravaGear {
  id: string;
  name: string;
}

/** The athlete's bikes as registered on Strava — used to populate the gear
 * picker on a Bikit bike's edit page. */
export async function fetchStravaBikes(accessToken: string): Promise<StravaGear[]> {
  const res = await fetch(`${STRAVA_API}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];
  const athlete = (await res.json()) as { bikes?: { id: string; name: string }[] };
  return (athlete.bikes ?? []).map((b) => ({ id: b.id, name: b.name }));
}

export interface StravaActivity {
  id: number;
  type: string;
  sport_type: string;
  distance: number; // meters
  moving_time: number; // seconds
  gear_id: string | null;
}

export async function fetchStravaActivity(accessToken: string, activityId: number): Promise<StravaActivity | null> {
  const res = await fetch(`${STRAVA_API}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export function isCyclingActivity(activity: StravaActivity): boolean {
  return CYCLING_TYPES.has(activity.sport_type) || CYCLING_TYPES.has(activity.type);
}
