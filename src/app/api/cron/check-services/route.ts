import { createAdminClient } from "@/lib/supabase/admin";
import { selectActiveInterval, type NamedIntervalStatusInput } from "@/lib/maintenance/calculation";
import { healthPercent, classifyHealth } from "@/lib/maintenance/health";
import { localeFromMetadata } from "@/lib/i18n";
import { formatDate, formatDistance, formatNumber } from "@/lib/format";
import { sendDueSoonEmail, sendOverdueEmail, sendWeeklySummaryEmail, type WeeklySummaryItem } from "@/lib/email";

export const dynamic = "force-dynamic";

const WEEKLY_SUMMARY_MIN_GAP_DAYS = 6;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const sent: string[] = [];
  const isWeeklySummaryDay = new Date().getUTCDay() === 1; // Monday
  const siteUrl = new URL(request.url).origin;

  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data: userPage, error: usersError } = await admin.auth.admin.listUsers({ page, perPage });
    if (usersError) {
      return Response.json({ error: usersError.message }, { status: 500 });
    }

    for (const user of userPage.users) {
      const meta = user.user_metadata ?? {};
      const notifyDueSoon = (meta.notify_due_soon as boolean) ?? true;
      const notifyOverdue = (meta.notify_overdue as boolean) ?? true;
      const notifyWeeklySummary = (meta.notify_weekly_summary as boolean) ?? false;
      if (!user.email || (!notifyDueSoon && !notifyOverdue && !notifyWeeklySummary)) continue;

      const locale = localeFromMetadata(meta);
      const distanceUnit = ((meta.distance_unit as string) ?? "km") as "km" | "mi";

      const { data: bikes } = await admin.from("bikes").select("id, name, total_km, total_hours").eq("user_id", user.id);
      const bikeById = new Map((bikes ?? []).map((b) => [b.id, b]));
      if (bikeById.size === 0) continue;

      const { data: components } = await admin
        .from("components")
        .select("id, name, bike_id, created_at")
        .eq("user_id", user.id)
        .eq("active", true);

      const { data: intervalRows } = await admin
        .from("component_interval_status")
        .select(
          "id, component_id, name, interval_type, interval_value, install_date, component_created_at, last_intervention_date, bike_km_at_install, bike_hours_at_install, last_service_km, last_service_hours"
        )
        .eq("user_id", user.id);

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
          currentKm: null,
          currentHours: null,
          bikeKmAtInstall: row.bike_km_at_install,
          bikeHoursAtInstall: row.bike_hours_at_install,
          bikeKmAtLastService: row.last_service_km,
          bikeHoursAtLastService: row.last_service_hours,
        });
        intervalsByComponent.set(row.component_id, list);
      }

      const dueSoonItems: WeeklySummaryItem[] = [];
      const overdueItems: WeeklySummaryItem[] = [];

      for (const component of components ?? []) {
        if (!component.id || !component.bike_id || !component.name) continue;
        const bike = bikeById.get(component.bike_id);
        if (!bike) continue;

        const intervals = (intervalsByComponent.get(component.id) ?? []).map((interval) => ({
          ...interval,
          currentKm: bike.total_km,
          currentHours: bike.total_hours,
        }));
        const activeResult = selectActiveInterval(intervals);
        if (!activeResult) continue;
        const { interval, status } = activeResult;
        const { status: statusKind, nextDueDate, daysRemaining, amountRemaining, fractionUsed } = status;

        // "Overdue" notifications now fire off the same Service Due threshold
        // (health < 5%) shown in the UI, rather than the old strict
        // amountRemaining/daysRemaining <= 0 check — so a component can reach
        // "overdue" here slightly before it's technically past due. isPastDue
        // tracks which wording the email should use for that edge.
        const percent = healthPercent(fractionUsed);
        const isCritical = percent != null && classifyHealth(percent) === "critical";
        const type: "due_soon" | "overdue" | null =
          isCritical ? "overdue" : statusKind === "due_soon" ? "due_soon" : null;
        if (!type) continue;
        const isPastDue = (daysRemaining ?? amountRemaining ?? 0) <= 0;

        // km/hours criteria have no base date at all — fall back to when the
        // component was created, which is stable until an intervention (or
        // edited install date) starts a new episode of its own.
        const episodeDate = interval.lastInterventionDate ?? interval.installDate ?? component.created_at!;
        const componentUrl = `/bikes/${component.bike_id}/components/${component.id}`;
        const componentLabel = `${component.name} — ${interval.name}`;
        const amountDetail =
          amountRemaining != null
            ? interval.intervalType === "km"
              ? formatDistance(Math.abs(amountRemaining), distanceUnit)
              : `${formatNumber(Math.abs(amountRemaining))} h`
            : null;

        if (type === "due_soon") {
          dueSoonItems.push({
            componentName: componentLabel,
            bikeName: bike.name,
            detail: amountDetail ?? formatDate(nextDueDate!),
            url: componentUrl,
          });
        } else {
          overdueItems.push({
            componentName: componentLabel,
            bikeName: bike.name,
            detail: amountDetail ?? `${Math.abs(daysRemaining ?? 0)}d`,
            url: componentUrl,
          });
        }

        const shouldNotify = type === "due_soon" ? notifyDueSoon : notifyOverdue;
        if (!shouldNotify) continue;

        const { data: existingLog } = await admin
          .from("notification_log")
          .select("id")
          .eq("user_id", user.id)
          .eq("component_id", component.id)
          .eq("service_interval_id", interval.id)
          .eq("type", type)
          .eq("episode_date", episodeDate)
          .maybeSingle();
        if (existingLog) continue;

        const wasSent =
          type === "due_soon"
            ? await sendDueSoonEmail({
                to: user.email,
                locale,
                componentName: componentLabel,
                bikeName: bike.name,
                detail: amountDetail ? { kind: "amount", amount: amountDetail } : { kind: "date", date: nextDueDate! },
                componentUrl,
                siteUrl,
              })
            : await sendOverdueEmail({
                to: user.email,
                locale,
                componentName: componentLabel,
                bikeName: bike.name,
                detail: amountDetail
                  ? { kind: "amount", amount: amountDetail }
                  : { kind: "days", days: Math.abs(daysRemaining ?? 0) },
                isPastDue,
                componentUrl,
                siteUrl,
              });
        if (!wasSent) continue;

        await admin.from("notification_log").insert({
          user_id: user.id,
          component_id: component.id,
          service_interval_id: interval.id,
          type,
          episode_date: episodeDate,
        });
        sent.push(`${type}:${component.id}:${interval.id}`);
      }

      if (notifyWeeklySummary && isWeeklySummaryDay) {
        const { data: recentSummary } = await admin
          .from("notification_log")
          .select("sent_at")
          .eq("user_id", user.id)
          .eq("type", "weekly_summary")
          .order("sent_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const daysSinceLast = recentSummary
          ? (Date.now() - new Date(recentSummary.sent_at).getTime()) / 86_400_000
          : Infinity;

        if (daysSinceLast >= WEEKLY_SUMMARY_MIN_GAP_DAYS) {
          const wasSent = await sendWeeklySummaryEmail({
            to: user.email,
            locale,
            overdue: overdueItems,
            dueSoon: dueSoonItems,
            siteUrl,
          });
          if (wasSent) {
            await admin.from("notification_log").insert({ user_id: user.id, component_id: null, type: "weekly_summary" });
            sent.push(`weekly_summary:${user.id}`);
          }
        }
      }
    }

    if (userPage.users.length < perPage) break;
    page += 1;
  }

  return Response.json({ sent: sent.length, details: sent });
}
