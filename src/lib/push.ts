import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";
import { formatDistance, formatHours } from "@/lib/format";

/** What the service worker's `push` handler expects to find in event.data. */
export interface PushPayload {
  title: string;
  body: string;
  /** App-relative path the notification opens on click. */
  url: string;
  /** Collapse key — a second notification with the same tag replaces the
   * first instead of stacking, which is what keeps a component from piling
   * up one banner per cron run. */
  tag?: string;
}

// Same lazy shape as the Resend client in email.ts: configured on first use
// so the app (and the cron routes) still run before the keys exist — they
// just don't send. setVapidDetails validates the key pair and throws on a
// malformed one, so a bad config surfaces here rather than per-send.
let vapidState: "unconfigured" | "ready" | "unavailable" = "unconfigured";

function ensureVapid(): boolean {
  if (vapidState !== "unconfigured") return vapidState === "ready";

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn("VAPID keys are not set — skipping push send.");
    vapidState = "unavailable";
    return false;
  }

  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:hello@bikit.app", publicKey, privateKey);
    vapidState = "ready";
    return true;
  } catch (e) {
    console.error("[push] invalid VAPID configuration", e);
    vapidState = "unavailable";
    return false;
  }
}

/**
 * Delivers one notification to every device the user has subscribed, and
 * returns whether at least one of them accepted it — callers use that the
 * same way the email helpers use their boolean, to only log a dedupe entry
 * for a send that really happened.
 *
 * A subscription dies silently when the user uninstalls the PWA, clears site
 * data, or the browser rotates it. The push service reports that as 404/410,
 * and it's permanent, so those rows are deleted on the spot — otherwise every
 * future run pays a failing request for a device that no longer exists.
 */
export async function sendPushToUser(
  admin: SupabaseClient<Database>,
  userId: string,
  payload: PushPayload
): Promise<boolean> {
  if (!ensureVapid()) return false;

  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);
  if (!subscriptions?.length) return false;

  const body = JSON.stringify(payload);
  const results = await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          body
        );
        return { endpoint: subscription.endpoint, delivered: true, gone: false };
      } catch (e) {
        const statusCode = (e as { statusCode?: number }).statusCode;
        const gone = statusCode === 404 || statusCode === 410;
        if (!gone) console.error("[push] send failed", statusCode, (e as Error).message);
        return { endpoint: subscription.endpoint, delivered: false, gone };
      }
    })
  );

  const gone = results.filter((r) => r.gone).map((r) => r.endpoint);
  const delivered = results.filter((r) => r.delivered).map((r) => r.endpoint);

  await Promise.all([
    gone.length ? admin.from("push_subscriptions").delete().in("endpoint", gone) : null,
    delivered.length
      ? admin.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).in("endpoint", delivered)
      : null,
  ]);

  return delivered.length > 0;
}

export interface SyncedBike {
  id: string;
  name: string;
  km: number;
  hours: number;
}

/**
 * "Your bike's totals moved" notification, one per bike rather than one per
 * ride — a cron pass that backfills four rides on the same bike should read
 * as a single update. Only the automatic paths call this: the manual "Reload"
 * button already reports itself with a toast on a screen the rider is looking
 * at, and a push on top of that is just the same news twice.
 *
 * Unlike the maintenance reminders this reads the preference itself, because
 * its callers (the webhook, the sync cron) have no reason to load the user's
 * metadata otherwise.
 */
export async function sendStravaSyncPush(
  admin: SupabaseClient<Database>,
  userId: string,
  bikes: SyncedBike[]
): Promise<void> {
  if (!bikes.length || !ensureVapid()) return;

  const { data } = await admin.auth.admin.getUserById(userId);
  const meta = data.user?.user_metadata ?? {};
  // Opt-in — absent metadata means off, unlike the two maintenance alerts.
  if (meta.push_strava_sync !== true) return;

  const locale = localeFromMetadata(meta);
  const dict = getDictionary(locale).push.stravaSync;
  const unit = ((meta.distance_unit as string) ?? "km") as "km" | "mi";

  await Promise.all(
    bikes.map((bike) =>
      sendPushToUser(admin, userId, {
        title: dict.title(bike.name),
        body: dict.body(formatDistance(bike.km, unit, locale), formatHours(bike.hours, locale)),
        url: `/bikes/${bike.id}`,
        tag: `strava:${bike.id}`,
      })
    )
  );
}
