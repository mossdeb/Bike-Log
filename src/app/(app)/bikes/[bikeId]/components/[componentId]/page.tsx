import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Inbox } from "lucide-react";
import { ToolIcon } from "@/components/tool-icon";
import { createClient } from "@/lib/supabase/server";
import {
  calculateComponentStatus,
  calculateComponentUsage,
  selectActiveInterval,
  type NamedIntervalStatusInput,
} from "@/lib/maintenance/calculation";
import { healthPercent, classifyHealth } from "@/lib/maintenance/health";
import { formatDate, formatDistance, formatNumber, kmToUnit } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HealthBadge, HealthPercentBadge } from "@/components/health-badge";
import { ServiceIntervalBar } from "@/components/service-interval-bar";
import { MaintenanceIcon } from "@/components/interval-icons";
import { TypeBadge, INTERVENTION_TYPE_DOT_STYLES } from "@/components/type-badge";
import { ComponentIcon } from "@/components/component-icon";
import { COMPONENT_CATEGORY_ICON } from "@/components/component-category-icon";
import type { ComponentCategory } from "@/lib/constants";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";

function DetailField({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  if (value == null || value === "") return null;
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 truncate text-sm font-semibold", mono && "font-mono")}>{value}</p>
    </div>
  );
}

const fieldBasis = "shrink-0 grow-0 basis-[calc(33.333%-0.75rem)] sm:basis-[calc(25%-1.125rem)] lg:basis-[calc(16.666%-1.25rem)]";

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ bikeId: string; componentId: string }>;
}) {
  const { bikeId, componentId } = await params;
  const supabase = await createClient();

  // None of these depend on each other's results (all keyed off the URL's
  // bikeId/componentId), so they fire as one round trip instead of five.
  const [{ data: userData }, { data: bike }, { data: component }, { data: interventions }, { data: rawIntervals }] =
    await Promise.all([
      supabase.auth.getClaims(),
      supabase.from("bikes").select("id, name, total_km, total_hours").eq("id", bikeId).single(),
      supabase.from("components").select("*").eq("id", componentId).eq("bike_id", bikeId).single(),
      supabase
        .from("interventions")
        .select("*")
        .eq("component_id", componentId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("component_service_intervals").select("*").eq("component_id", componentId).order("slot"),
    ]);

  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";
  const dict = getDictionary(localeFromMetadata(userData?.claims?.user_metadata));

  if (!bike) notFound();
  if (!component) notFound();

  const usage = calculateComponentUsage({
    bikeTotalKm: bike.total_km,
    bikeTotalHours: bike.total_hours,
    bikeKmAtInstall: component.bike_km_at_install,
    bikeHoursAtInstall: component.bike_hours_at_install,
  });

  // Each interval's own baseline is the most recent intervention that
  // specifically reset THAT interval (not just the most recent one on the
  // component) — derived from the already-fetched interventions array
  // (sorted newest-first) rather than a second round-trip.
  const intervals = (rawIntervals ?? []).map((interval) => {
    const lastReset = (interventions ?? []).find((iv) => iv.reset_interval_id === interval.id) ?? null;
    const input: NamedIntervalStatusInput = {
      id: interval.id,
      name: interval.name,
      intervalType: interval.interval_type as "km" | "hours" | "months",
      intervalValue: interval.interval_value,
      installDate: component.install_date,
      componentCreatedAt: component.created_at.slice(0, 10),
      lastInterventionDate: lastReset?.date ?? null,
      currentKm: bike.total_km,
      currentHours: bike.total_hours,
      bikeKmAtInstall: component.bike_km_at_install,
      bikeHoursAtInstall: component.bike_hours_at_install,
      bikeKmAtLastService: lastReset?.bike_km_at_intervention ?? null,
      bikeHoursAtLastService: lastReset?.bike_hours_at_intervention ?? null,
    };
    return { interval: input, status: calculateComponentStatus(input) };
  });

  const activeResult = selectActiveInterval(intervals.map((i) => i.interval));
  const percent = healthPercent(activeResult?.status.fractionUsed ?? null);
  const healthLevel = percent != null ? classifyHealth(percent) : null;

  const distanceDetail = usage.km != null ? formatDistance(usage.km, distanceUnit) : null;
  const hoursDetail = usage.hours != null ? `${formatNumber(usage.hours)} h` : null;

  const editButton = (
    <Button
      render={<Link href={`/bikes/${bike.id}/components/${component.id}/edit`} />}
      nativeButton={false}
      variant="outline"
      size="sm"
      className="bg-transparent"
    >
      <Pencil className="size-3.5" />
      {dict.components.detail.edit}
    </Button>
  );

  const logMaintenanceButton = (
    <Button
      render={<Link href={`/bikes/${bike.id}/components/${component.id}/interventions/new`} />}
      nativeButton={false}
      size="sm"
      className="h-[52px] w-[196px] border-transparent bg-foreground text-sm text-background hover:bg-foreground/90 hover:text-background"
    >
      <ToolIcon className="size-3.5" />
      {dict.dashboard.logMaintenance}
    </Button>
  );

  return (
    <div className="pt-4 sm:pt-8">
      <div className="hidden text-sm text-muted-foreground sm:mb-2 sm:block">
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

      <div className="mb-6 rounded-lg bg-card px-6 pt-6 pb-6">
        {/* Desktop: icon + name/badge, full details grid inline, edit far right */}
        <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div className="flex items-center gap-4">
            <ComponentIcon size="flat" icon={COMPONENT_CATEGORY_ICON[component.category as ComponentCategory]} />
            <div>
              <h1 className="text-xl font-display font-bold">{component.name}</h1>
              <HealthBadge level={healthLevel} dict={dict} className="mt-1.5" />
            </div>
          </div>
          <div className="flex flex-1 flex-wrap gap-x-4 gap-y-5 sm:gap-x-6">
            <DetailField label={dict.brandField.brand} value={component.brand ?? "—"} className={fieldBasis} />
            <DetailField label={dict.components.form.model} value={component.model ?? "—"} className={fieldBasis} />
            <DetailField label={dict.components.form.category} value={component.category ?? "—"} className={fieldBasis} />
            <DetailField label={dict.components.detail.totalDistance} value={distanceDetail} mono className={fieldBasis} />
            <DetailField label={dict.components.detail.totalHours} value={hoursDetail} mono className={fieldBasis} />
            {component.serial_number && (
              <DetailField label={dict.components.form.serialNumber} value={component.serial_number} mono className={fieldBasis} />
            )}
            {component.install_date && (
              <DetailField label={dict.components.form.installDate} value={formatDate(component.install_date)} className={fieldBasis} />
            )}
            {component.purchase_date && (
              <DetailField label={dict.components.form.purchaseDate} value={formatDate(component.purchase_date)} className={fieldBasis} />
            )}
            {component.warranty && (
              <DetailField label={dict.components.form.warranty} value={component.warranty} className={fieldBasis} />
            )}
            {component.year && (
              <DetailField label={dict.components.form.year} value={component.year} className={fieldBasis} />
            )}
            {component.notes && (
              <DetailField label={dict.components.form.notes} value={component.notes} className="min-w-[220px] flex-1" />
            )}
          </div>
          {editButton}
        </div>

        {/* Mobile: icon + name/subtitle, then compact stat rows */}
        <div className="sm:hidden">
          <div className="flex items-center gap-4">
            <ComponentIcon size="flat" icon={COMPONENT_CATEGORY_ICON[component.category as ComponentCategory]} />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-display font-bold">{component.name}</h1>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {[bike.name, component.category, component.brand, component.model].filter(Boolean).join(" · ") ||
                  dict.bikes.noDetailsYet}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6">
            <DetailField label={dict.components.detail.totalDistance} value={distanceDetail} mono />
            <DetailField label={dict.components.detail.totalHours} value={hoursDetail} mono />
          </div>
        </div>

        {intervals.length > 0 ? (
          <div className="mt-6">
            {intervals.map(({ interval, status }, i) => {
              const isActive = activeResult?.interval.id === interval.id;
              const rowPercent = healthPercent(status.fractionUsed);
              const cadence =
                interval.intervalType && interval.intervalValue != null
                  ? dict.components.detail.every(
                      interval.intervalType === "km"
                        ? Math.round(kmToUnit(interval.intervalValue, distanceUnit) * 10) / 10
                        : interval.intervalValue,
                      interval.intervalType,
                      distanceUnit
                    )
                  : null;
              const remaining =
                status.amountRemaining != null
                  ? status.amountRemaining <= 0
                    ? dict.components.detail.overdueLabel(
                        interval.intervalType === "km"
                          ? formatDistance(Math.abs(status.amountRemaining), distanceUnit)
                          : `${formatNumber(Math.abs(status.amountRemaining))} h`
                      )
                    : dict.components.detail.remainingLabel(
                        interval.intervalType === "km"
                          ? formatDistance(status.amountRemaining, distanceUnit)
                          : `${formatNumber(status.amountRemaining)} h`
                      )
                  : status.daysRemaining != null
                    ? status.daysRemaining <= 0
                      ? dict.components.detail.overdueLabel(`${Math.abs(status.daysRemaining)}d`)
                      : dict.components.detail.remainingLabel(`${status.daysRemaining}d`)
                    : null;

              return (
                <div key={interval.id} className={cn("py-5", i > 0 && "border-t border-border")}>
                  <div className="flex items-center gap-4">
                    <MaintenanceIcon className="size-8 shrink-0 text-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {interval.name}
                        {cadence ? ` — ${cadence}` : ""}
                        {isActive && (
                          <span className="ml-2 inline-block shrink-0 rounded-[7px] bg-muted px-2 py-0.5 align-middle text-[11px] font-semibold text-muted-foreground">
                            {dict.components.detail.activeIntervalTag}
                          </span>
                        )}
                      </p>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        {remaining && <p className="text-sm text-muted-foreground">{remaining}</p>}
                        <HealthPercentBadge percent={rowPercent} className="ml-auto shrink-0" />
                      </div>
                    </div>
                  </div>
                  <ServiceIntervalBar fraction={status.fractionUsed} className="mt-1 w-full" />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">{dict.components.detail.noIntervalsYet}</p>
        )}

        <div className="mt-6 flex justify-center sm:hidden">{logMaintenanceButton}</div>
      </div>

      <div className="mb-6 flex items-center justify-center sm:mb-3 sm:justify-between">
        <h2 className="font-display font-bold">{dict.components.detail.history}</h2>
        <div className="hidden sm:block">{logMaintenanceButton}</div>
      </div>

      {!interventions || interventions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <Inbox className="mx-auto mb-2 size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{dict.components.detail.noInterventionsYet}</p>
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute top-2 bottom-2 left-[5.5px] border-l border-dashed border-foreground/30" />
          {interventions.map((iv) => (
            <div key={iv.id} className="relative mb-4 last:mb-0">
              <span
                className={cn(
                  "absolute top-1/2 -left-6 size-[11px] -translate-y-1/2 rounded-full border-2",
                  INTERVENTION_TYPE_DOT_STYLES[iv.type as "service" | "repair" | "replacement"]
                )}
              />
              <Link
                href={`/bikes/${bike.id}/components/${component.id}/interventions/${iv.id}/edit`}
                className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-5 sm:flex-nowrap"
              >
                <div className="w-28 shrink-0">
                  <TypeBadge type={iv.type as "service" | "repair" | "replacement"} dict={dict} />
                  <p className="mt-3 text-sm text-muted-foreground">{formatDate(iv.date)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{iv.description || dict.components.detail.noDescription}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {iv.kms != null && <span>{formatDistance(iv.kms, distanceUnit)}</span>}
                    {iv.hours_used != null && <span>{formatNumber(iv.hours_used)} h</span>}
                  </div>
                  {iv.notes && (
                    <p className="mt-3 rounded-[7px] bg-muted/50 px-4 py-3 text-sm text-muted-foreground">{iv.notes}</p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
