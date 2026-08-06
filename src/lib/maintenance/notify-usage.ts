import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { selectActiveInterval, type NamedIntervalStatusInput } from "@/lib/maintenance/calculation";
import { healthPercent, classifyHealth } from "@/lib/maintenance/health";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";
import { formatDistance, formatHours } from "@/lib/format";
import { sendPushToUser } from "@/lib/push";

/**
 * The real-time half of the maintenance alerts: one bike, push only, and only
 * the criteria a ride can actually move.
 *
 * The daily cron stays the complete pass — every bike, both channels, every
 * criterion — and remains the only thing that sends email or that notices a
 * months-based reminder coming due, because time passing produces no event to
 * react to. This runs off the Strava webhook so that wearing a component into
 * a worse band during a ride is news within minutes of the ride landing,
 * rather than the following morning.
 *
 * The two paths deliberately share the arithmetic (selectActiveInterval,
 * classifyHealth) rather than the plumbing. Thresholds drifting apart is the
 * failure this project has actually had; a second copy of "load, decide,
 * send" is cheap by comparison, and collapsing them into one function would
 * mean rewriting the only notification path that currently works.
 *
 * Nothing here throws at the caller: it runs after the webhook's response, so
 * a failure costs at most a push that the cron will send in the morning.
 */
export async function notifyUsageServicesForBike(
  admin: SupabaseClient<Database>,
  userId: string,
  bikeId: string
): Promise<void> {
  try {
    const { data: userData } = await admin.auth.admin.getUserById(userId);
    const meta = userData.user?.user_metadata ?? {};
    // Same defaults as the cron: both maintenance alerts are opt-out.
    const pushDueSoon = (meta.push_due_soon as boolean) ?? true;
    const pushOverdue = (meta.push_overdue as boolean) ?? true;
    if (!pushDueSoon && !pushOverdue) return;

    const locale = localeFromMetadata(meta);
    const dict = getDictionary(locale);
    const distanceUnit = ((meta.distance_unit as string) ?? "km") as "km" | "mi";

    const { data: bike } = await admin
      .from("bikes")
      .select("id, name, total_km, total_hours")
      .eq("id", bikeId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!bike) return;

    const { data: components } = await admin
      .from("components")
      .select("id, name")
      .eq("user_id", userId)
      .eq("bike_id", bikeId)
      .is("retired_at", null);
    if (!components?.length) return;

    const componentIds = components.map((c) => c.id);
    const { data: intervalRows } = await admin
      .from("component_interval_status")
      .select(
        "id, component_id, name, interval_type, interval_value, install_date, component_created_at, last_intervention_date, bike_km_at_install, bike_hours_at_install, last_service_km, last_service_hours"
      )
      .in("component_id", componentIds);

    const intervalsByComponent = new Map<string, NamedIntervalStatusInput[]>();
    for (const row of intervalRows ?? []) {
      if (!row.component_id || !row.id || !row.name) continue;
      const list = intervalsByComponent.get(row.component_id) ?? [];
      list.push({
        id: row.id,
        name: row.name,
        intervalType: row.interval_type as "km" | "hours" | "months" | null,
        intervalValue: row.interval_value,
        installDate: row.install_date,
        componentCreatedAt: row.component_created_at,
        lastInterventionDate: row.last_intervention_date,
        currentKm: bike.total_km,
        currentHours: bike.total_hours,
        bikeKmAtInstall: row.bike_km_at_install,
        bikeHoursAtInstall: row.bike_hours_at_install,
        bikeKmAtLastService: row.last_service_km,
        bikeHoursAtLastService: row.last_service_hours,
      });
      intervalsByComponent.set(row.component_id, list);
    }

    for (const component of components) {
      // The active interval is picked across all of the component's
      // reminders, exactly as the badge in the UI does — filtering to km and
      // hours first would promote a different reminder here than the one the
      // app is showing, and the notification would name the wrong thing.
      const activeResult = selectActiveInterval(intervalsByComponent.get(component.id) ?? []);
      if (!activeResult) continue;
      const { interval, status } = activeResult;
      if (interval.intervalType !== "km" && interval.intervalType !== "hours") continue;

      const percent = healthPercent(status.fractionUsed);
      const health = percent == null ? null : classifyHealth(percent);
      const level = health === "critical" ? "critical" : health === "attention" ? "attention" : null;
      if (!level) continue;

      const type = level === "critical" ? "overdue" : "due_soon";
      if (type === "due_soon" ? !pushDueSoon : !pushOverdue) continue;

      // km/hours criteria always carry an amount; a null would mean the
      // interval isn't configured, which can't produce a level above.
      const { amountRemaining } = status;
      if (amountRemaining == null) continue;
      const amountDetail =
        interval.intervalType === "km"
          ? formatDistance(Math.abs(amountRemaining), distanceUnit, locale)
          : formatHours(Math.abs(amountRemaining), locale);

      const componentLabel = `${component.name} — ${interval.name}`;
      const componentUrl = `/bikes/${bikeId}/components/${component.id}`;
      const emailDict = type === "due_soon" ? dict.email.dueSoon : dict.email.overdue;
      const body =
        type === "due_soon"
          ? dict.email.dueSoon.bodyByAmount(componentLabel, bike.name, amountDetail)
          : dict.email.overdue.bodyByAmount(componentLabel, bike.name, amountDetail, amountRemaining <= 0);

      // Claim before sending, not after. Both this and the cron can be
      // evaluating the same interval at the same time, and read-then-write
      // would let them both decide nothing had been sent yet. Whoever the
      // database hands the band to is the one that sends.
      const { data: claims } = await admin.rpc("claim_interval_notification", {
        p_service_interval_id: interval.id,
        p_channel: "push",
        p_user_id: userId,
        p_level: level,
      });
      const claim = claims?.[0];
      if (!claim?.claimed) continue;

      let delivered = false;
      try {
        delivered = await sendPushToUser(admin, userId, {
          title: emailDict.heading,
          body,
          url: componentUrl,
          tag: `${type}:${interval.id}`,
        });
      } catch (e) {
        console.error("[notify-usage] push send threw", e);
      }

      if (!delivered) {
        // Hand the band back, or the interval would sit there looking as
        // though the owner had been told and stay silent until it recovered.
        await admin.rpc("release_interval_notification", {
          p_service_interval_id: interval.id,
          p_channel: "push",
          p_claimed_level: level,
          p_previous_level: claim.previous_level,
          p_previous_notified_at: claim.previous_notified_at,
        });
        continue;
      }

      await admin.from("notification_log").insert({
        user_id: userId,
        component_id: component.id,
        service_interval_id: interval.id,
        type,
        episode_date: interval.lastInterventionDate ?? interval.installDate ?? null,
        channel: "push",
      });
    }
  } catch (e) {
    console.error("[notify-usage] failed for bike", bikeId, e);
  }
}
