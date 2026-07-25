import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateComponentStatus, calculateComponentUsage } from "@/lib/maintenance/calculation";
import { formatDate, formatDistance, formatNumber, kmToUnit } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ServiceIntervalBar } from "@/components/service-interval-bar";
import { TypeBadge } from "@/components/type-badge";
import { ComponentIcon } from "@/components/component-icon";
import { COMPONENT_CATEGORY_ICON } from "@/components/component-category-icon";
import type { ComponentCategory } from "@/lib/constants";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ bikeId: string; componentId: string }>;
}) {
  const { bikeId, componentId } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getClaims();
  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";
  const dict = getDictionary(localeFromMetadata(userData?.claims?.user_metadata));

  const { data: bike } = await supabase
    .from("bikes")
    .select("id, name, total_km, total_hours")
    .eq("id", bikeId)
    .single();
  if (!bike) notFound();

  const { data: component } = await supabase
    .from("components")
    .select("*")
    .eq("id", componentId)
    .eq("bike_id", bikeId)
    .single();
  if (!component) notFound();

  const usage = calculateComponentUsage({
    bikeTotalKm: bike.total_km,
    bikeTotalHours: bike.total_hours,
    bikeKmAtInstall: component.bike_km_at_install,
    bikeHoursAtInstall: component.bike_hours_at_install,
  });

  const { data: interventions } = await supabase
    .from("interventions")
    .select("*")
    .eq("component_id", componentId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const lastIntervention = interventions?.[0] ?? null;
  const intervalType = component.interval_type as "km" | "hours" | "months" | null;

  const { status, nextDueDate, daysRemaining, amountRemaining, fractionUsed } = calculateComponentStatus({
    intervalType,
    intervalValue: component.interval_value,
    installDate: component.install_date,
    lastInterventionDate: lastIntervention?.date ?? null,
    currentKm: bike.total_km,
    currentHours: bike.total_hours,
    bikeKmAtInstall: component.bike_km_at_install,
    bikeHoursAtInstall: component.bike_hours_at_install,
    bikeKmAtLastService: lastIntervention?.bike_km_at_intervention ?? null,
    bikeHoursAtLastService: lastIntervention?.bike_hours_at_intervention ?? null,
  });

  const amountRemainingDetail =
    amountRemaining != null
      ? intervalType === "km"
        ? formatDistance(Math.abs(amountRemaining), distanceUnit)
        : `${formatNumber(Math.abs(amountRemaining))} h`
      : null;

  const statusDetail =
    status === "overdue"
      ? amountRemainingDetail
        ? dict.dashboard.overdueBy(amountRemainingDetail)
        : dict.dashboard.overdueDays(Math.abs(daysRemaining!))
      : status === "due_soon"
        ? amountRemainingDetail
          ? dict.dashboard.dueInAmount(amountRemainingDetail)
          : dict.dashboard.dueInDays(daysRemaining!)
        : status === "ok" && nextDueDate
          ? dict.components.detail.dueOn(formatDate(nextDueDate))
          : undefined;

  return (
    <div className="pt-8">
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/bikes" className="hover:text-foreground">
          {dict.bikes.breadcrumb}
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={`/bikes/${bike.id}`} className="hover:text-foreground">
          {bike.name}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{component.name}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-5 rounded-lg bg-card p-6">
        <ComponentIcon size="lg" icon={COMPONENT_CATEGORY_ICON[component.category as ComponentCategory]} />
        <div className="min-w-[200px] flex-1">
          <h1 className="text-xl font-display font-bold">{component.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {[component.category, component.brand, component.model].filter(Boolean).join(" · ") ||
              dict.bikes.noDetailsYet}
          </p>
        </div>
        <div className="flex gap-5">
          <div>
            <p className="text-xs text-muted-foreground">{dict.components.detail.interval}</p>
            <p className="font-mono text-sm font-semibold">
              {intervalType && component.interval_value != null
                ? dict.components.detail.every(
                    intervalType === "km"
                      ? Math.round(kmToUnit(component.interval_value, distanceUnit) * 10) / 10
                      : component.interval_value,
                    intervalType,
                    distanceUnit
                  )
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{dict.components.detail.serial}</p>
            <p className="font-mono text-sm font-semibold">{component.serial_number ?? "—"}</p>
          </div>
          {usage.km != null && (
            <div>
              <p className="text-xs text-muted-foreground">{dict.components.detail.totalDistance}</p>
              <p className="font-mono text-sm font-semibold">{formatDistance(usage.km, distanceUnit)}</p>
            </div>
          )}
          {usage.hours != null && (
            <div>
              <p className="text-xs text-muted-foreground">{dict.components.detail.totalHours}</p>
              <p className="font-mono text-sm font-semibold">{formatNumber(usage.hours)} h</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">{dict.components.detail.status}</p>
            <StatusBadge status={status} label={statusDetail} dict={dict} className="mt-0.5" />
          </div>
        </div>
        <Button
          render={<Link href={`/bikes/${bike.id}/components/${component.id}/edit`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          <Pencil className="size-3.5" />
          {dict.components.detail.edit}
        </Button>
        {fractionUsed != null && <ServiceIntervalBar status={status} fraction={fractionUsed} className="w-full" />}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-bold">{dict.components.detail.history}</h2>
        <Button
          render={<Link href={`/bikes/${bike.id}/components/${component.id}/interventions/new`} />}
          nativeButton={false}
          size="sm"
        >
          <Plus className="size-3.5" />
          {dict.components.detail.logIntervention}
        </Button>
      </div>

      {!interventions || interventions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <Inbox className="mx-auto mb-2 size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{dict.components.detail.noInterventionsYet}</p>
        </div>
      ) : (
        <div className="rounded-lg bg-card">
          {interventions.map((iv, i) => (
            <Link
              key={iv.id}
              href={`/bikes/${bike.id}/components/${component.id}/interventions/${iv.id}/edit`}
              className={`flex gap-4 px-5 py-4 transition-colors hover:bg-muted/50 ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="w-24 shrink-0 pt-0.5 font-mono text-sm text-muted-foreground">
                {formatDate(iv.date)}
              </div>
              <div className="min-w-0 flex-1">
                <TypeBadge type={iv.type as "service" | "repair" | "replacement"} dict={dict} />
                <p className="mt-1.5 font-semibold">{iv.description || dict.components.detail.noDescription}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {iv.kms != null && <span>{formatDistance(iv.kms, distanceUnit)}</span>}
                  {iv.hours_used != null && <span>{formatNumber(iv.hours_used)} h</span>}
                </div>
                {iv.notes && (
                  <p className="mt-2 rounded-sm bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                    {iv.notes}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
