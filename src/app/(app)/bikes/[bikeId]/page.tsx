import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateComponentStatus, worstStatus } from "@/lib/maintenance/calculation";
import { formatDistance, formatNumber, kmToUnit } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ServiceIntervalBar } from "@/components/service-interval-bar";
import { BikeIcon } from "@/components/bike-icon";
import { BikeDetailsToggle } from "@/components/bike-details-toggle";
import { StravaBadgeIcon } from "@/components/strava-icon";
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

export default async function BikeDetailPage({
  params,
}: {
  params: Promise<{ bikeId: string }>;
}) {
  const { bikeId } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getClaims();
  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";
  const dict = getDictionary(localeFromMetadata(userData?.claims?.user_metadata));

  const { data: bike } = await supabase.from("bikes").select("*").eq("id", bikeId).single();
  if (!bike) notFound();

  // components_status joins in each component's most recent intervention
  // date so status can be computed here without an N+1 query per row.
  const { data: components } = await supabase
    .from("components_status")
    .select(
      "id, name, category, brand, model, interval_type, interval_value, install_date, last_intervention_date, bike_km_at_install, bike_hours_at_install, last_service_km, last_service_hours"
    )
    .eq("bike_id", bikeId)
    .order("created_at", { ascending: true });

  const statusByComponent = new Map(
    (components ?? []).map((c) => [
      c.id,
      calculateComponentStatus({
        intervalType: c.interval_type as "km" | "hours" | "months" | null,
        intervalValue: c.interval_value,
        installDate: c.install_date,
        lastInterventionDate: c.last_intervention_date,
        currentKm: bike.total_km,
        currentHours: bike.total_hours,
        bikeKmAtInstall: c.bike_km_at_install,
        bikeHoursAtInstall: c.bike_hours_at_install,
        bikeKmAtLastService: c.last_service_km,
        bikeHoursAtLastService: c.last_service_hours,
      }),
    ])
  );
  const bikeStatus = worstStatus([...statusByComponent.values()].map((s) => s.status));

  const distanceDetail = bike.total_km != null ? formatDistance(bike.total_km, distanceUnit) : null;
  const hoursDetail = bike.total_hours != null ? `${formatNumber(bike.total_hours)} h` : null;

  const addComponentButton = (
    <Button
      render={<Link href={`/bikes/${bike.id}/components/new`} />}
      nativeButton={false}
      variant="outline"
      size="sm"
      className="border-transparent bg-foreground text-background hover:bg-foreground/90 hover:text-background"
    >
      <Plus className="size-3.5" />
      {dict.bikes.detail.addComponent}
    </Button>
  );

  const editButton = (
    <Button
      render={<Link href={`/bikes/${bike.id}/edit`} />}
      nativeButton={false}
      variant="outline"
      size="sm"
      className="bg-transparent"
    >
      <Pencil className="size-3.5" />
      {dict.bikes.detail.edit}
    </Button>
  );

  const fieldBasis = "shrink-0 grow-0 basis-[calc(33.333%-0.75rem)] sm:basis-[calc(25%-1.125rem)] lg:basis-[calc(16.666%-1.25rem)]";

  const detailsGrid = (
    <div className="flex flex-wrap gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-5">
      <DetailField label={dict.brandField.brand} value={bike.brand ?? "—"} className={fieldBasis} />
      <DetailField label={dict.bikes.form.model} value={bike.model ?? "—"} className={fieldBasis} />
      <DetailField label={dict.bikes.form.year} value={bike.year ?? "—"} className={fieldBasis} />
      <DetailField label={dict.bikes.form.serialNumber} value={bike.serial_number ?? "—"} mono className={fieldBasis} />
      <DetailField label={dict.bikes.form.color} value={bike.color ?? "—"} className={fieldBasis} />
      <DetailField label={dict.bikes.form.type} value={bike.type ?? "—"} className={fieldBasis} />
      <DetailField label={dict.bikes.detail.totalDistance} value={distanceDetail} mono className={fieldBasis} />
      <DetailField label={dict.bikes.detail.totalHours} value={hoursDetail} mono className={fieldBasis} />
      {bike.strava_gear_id && (
        <DetailField
          label={dict.bikes.detail.stravaGear}
          value={
            <span className="inline-flex items-center gap-1.5">
              <StravaBadgeIcon className="size-[14px] shrink-0" />
              {dict.settings.strava.connected}
            </span>
          }
          className={fieldBasis}
        />
      )}
      {bike.notes && (
        <DetailField label={dict.bikes.form.notes} value={bike.notes} className="min-w-[220px] flex-1" />
      )}
    </div>
  );

  return (
    <div className="sm:pt-8">
      <div className="hidden text-sm text-muted-foreground sm:mb-2 sm:block">
        <Link href="/bikes" className="hover:text-foreground">
          {dict.bikes.breadcrumb}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{bike.name}</span>
      </div>

      <div className="-mx-6 mb-6 rounded-b-lg bg-card px-6 pt-6 pb-6 sm:mx-0 sm:rounded-lg">
        <div className="mb-6 text-sm text-muted-foreground sm:hidden">
          <Link href="/bikes" className="hover:text-foreground">
            {dict.bikes.breadcrumb}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">{bike.name}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <BikeIcon type={bike.type} size="lg" plain />
            <div>
              <h1 className="text-xl font-display font-bold">{bike.name}</h1>
              <StatusBadge status={bikeStatus} dict={dict} className="mt-1.5" />
            </div>
          </div>

          <div className="sm:hidden">{editButton}</div>

          <div className="hidden flex-1 sm:block">{detailsGrid}</div>

          <div className="hidden sm:block">{editButton}</div>
        </div>

        <div className="mt-8 sm:hidden">
          <BikeDetailsToggle
            viewLabel={dict.bikes.detail.viewDetails}
            closeLabel={dict.bikes.detail.closeDetails}
            compact={
              <div className="flex flex-wrap gap-6">
                <DetailField label={dict.bikes.detail.totalDistance} value={distanceDetail} mono />
                <DetailField label={dict.bikes.detail.totalHours} value={hoursDetail} mono />
              </div>
            }
            expanded={detailsGrid}
          />
        </div>
      </div>

      <div className="rounded-xl bg-muted/40 pb-4 sm:bg-transparent sm:pb-0">
        <div className="mb-6 flex items-center justify-center sm:mb-3 sm:justify-between">
          <h2 className="font-display font-bold">
            {dict.bikes.detail.componentsTitle}
            {components && components.length > 0 && (
              <span className="ml-1.5 font-normal text-muted-foreground">({components.length})</span>
            )}
          </h2>
          <div className="hidden sm:block">{addComponentButton}</div>
        </div>

        {!components || components.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">{dict.bikes.detail.noComponentsYet}</p>
          </div>
        ) : (
          <div className="rounded-lg bg-card">
            {components.map((component, i) => {
              const { status, fractionUsed } = statusByComponent.get(component.id)!;
              return (
                <div
                  key={component.id}
                  className={`px-5 py-4 transition-colors hover:bg-muted/50 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/bikes/${bike.id}/components/${component.id}`}
                      className="flex min-w-0 flex-1 items-start gap-4"
                    >
                      <ComponentIcon icon={COMPONENT_CATEGORY_ICON[component.category as ComponentCategory]} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{component.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[
                            component.category,
                            component.interval_type && component.interval_value != null
                              ? dict.bikes.detail.every(
                                  component.interval_type === "km"
                                    ? Math.round(kmToUnit(component.interval_value, distanceUnit) * 10) / 10
                                    : component.interval_value,
                                  component.interval_type as "km" | "hours" | "months",
                                  distanceUnit
                                )
                              : null,
                            [component.brand, component.model].filter(Boolean).join(" "),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <ServiceIntervalBar
                          status={status}
                          fraction={fractionUsed}
                          className="mt-2 hidden sm:block sm:max-w-[220px]"
                        />
                      </div>
                    </Link>
                    <StatusBadge status={status} dict={dict} className="shrink-0" />
                    <Link
                      href={`/bikes/${bike.id}/components/${component.id}/interventions/new`}
                      title={dict.bikes.detail.logIntervention}
                      aria-label={dict.bikes.detail.logInterventionFor(component.name ?? "")}
                      className="hidden size-9 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground sm:flex"
                    >
                      <Plus className="size-4" />
                    </Link>
                  </div>
                  <ServiceIntervalBar status={status} fraction={fractionUsed} className="mt-3 sm:hidden" />
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex justify-center sm:hidden">{addComponentButton}</div>
      </div>
    </div>
  );
}
