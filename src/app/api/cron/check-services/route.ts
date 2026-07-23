import { createAdminClient } from "@/lib/supabase/admin";
import { calculateComponentStatus } from "@/lib/maintenance/calculation";
import { localeFromMetadata } from "@/lib/i18n";
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

      const { data: bikes } = await admin.from("bikes").select("id, name").eq("user_id", user.id);
      const bikeNameById = new Map((bikes ?? []).map((b) => [b.id, b.name]));
      if (bikeNameById.size === 0) continue;

      const { data: components } = await admin
        .from("components_status")
        .select("id, name, bike_id, interval_months, install_date, last_intervention_date")
        .eq("user_id", user.id)
        .eq("active", true);

      const dueSoonItems: WeeklySummaryItem[] = [];
      const overdueItems: WeeklySummaryItem[] = [];

      for (const component of components ?? []) {
        if (!component.id || !component.bike_id || !component.name) continue;
        const bikeName = bikeNameById.get(component.bike_id);
        if (!bikeName) continue;

        const { status, nextDueDate, daysRemaining } = calculateComponentStatus({
          intervalMonths: component.interval_months,
          installDate: component.install_date,
          lastInterventionDate: component.last_intervention_date,
        });
        if (status !== "due_soon" && status !== "overdue") continue;

        // Guaranteed non-null here: reaching "due_soon"/"overdue" requires
        // calculateComponentStatus to have found a base date to work from.
        const episodeDate = (component.last_intervention_date ?? component.install_date)!;
        const componentUrl = `/bikes/${component.bike_id}/components/${component.id}`;

        if (status === "due_soon") {
          dueSoonItems.push({ componentName: component.name, bikeName, detail: nextDueDate ?? "", url: componentUrl });
        } else {
          overdueItems.push({
            componentName: component.name,
            bikeName,
            detail: `${Math.abs(daysRemaining ?? 0)}d`,
            url: componentUrl,
          });
        }

        const type = status;
        const shouldNotify = type === "due_soon" ? notifyDueSoon : notifyOverdue;
        if (!shouldNotify) continue;

        const { data: existingLog } = await admin
          .from("notification_log")
          .select("id")
          .eq("user_id", user.id)
          .eq("component_id", component.id)
          .eq("type", type)
          .eq("episode_date", episodeDate)
          .maybeSingle();
        if (existingLog) continue;

        const wasSent =
          type === "due_soon"
            ? await sendDueSoonEmail({
                to: user.email,
                locale,
                componentName: component.name,
                bikeName,
                dueDate: nextDueDate!,
                componentUrl,
              })
            : await sendOverdueEmail({
                to: user.email,
                locale,
                componentName: component.name,
                bikeName,
                daysOverdue: Math.abs(daysRemaining ?? 0),
                componentUrl,
              });
        if (!wasSent) continue;

        await admin.from("notification_log").insert({
          user_id: user.id,
          component_id: component.id,
          type,
          episode_date: episodeDate,
        });
        sent.push(`${type}:${component.id}`);
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
