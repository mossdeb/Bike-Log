import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateComponentStatus } from "@/lib/maintenance/calculation";
import { bikeHealthLevel, healthPercent } from "@/lib/maintenance/health";
import { formatDate, formatDistance, formatNumber, kmToUnit } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HealthBadge, HealthPercentBadge } from "@/components/health-badge";
import { ServiceIntervalBar } from "@/components/service-interval-bar";
import { BikeIcon } from "@/components/bike-icon";
import { BikeDetailsToggle } from "@/components/bike-details-toggle";
import { StravaBadgeIcon } from "@/components/strava-icon";
import { ComponentIcon } from "@/components/component-icon";
import { COMPONENT_CATEGORY_ICON } from "@/components/component-category-icon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BikeTimeline } from "@/components/bike-timeline";
import { buildBikeTimeline, type TimelineIntervention } from "@/lib/timeline";
import type { InterventionType } from "@/lib/intervention-type";
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
  const bikeHealth = bikeHealthLevel(
    [...statusByComponent.values()].map((s) => healthPercent(s.fractionUsed))
  );

  const componentIds = (components ?? [])
    .map((c) => c.id)
    .filter((id): id is string => id != null);
  const componentNameById = new Map((components ?? []).map((c) => [c.id, c.name]));
  const { data: bikeInterventions } =
    componentIds.length > 0
      ? await supabase
          .from("interventions")
          .select("id, component_id, type, date, description, kms, hours_used")
          .in("component_id", componentIds)
          .order("date", { ascending: false })
          .order("created_at", { ascending: false })
      : { data: [] };

  const timelineInterventions: TimelineIntervention[] = (bikeInterventions ?? []).map((iv) => ({
    id: iv.id,
    componentId: iv.component_id,
    componentName: componentNameById.get(iv.component_id) ?? "",
    type: iv.type as InterventionType,
    date: iv.date,
    description: iv.description,
    kms: iv.kms,
    hoursUsed: iv.hours_used,
  }));

  const timelineEvents = buildBikeTimeline({
    bike: {
      brand: bike.brand,
      year: bike.year,
      purchase_date: bike.purchase_date,
      warranty: bike.warranty,
      created_at: bike.created_at,
    },
    interventions: timelineInterventions,
  });

  const distanceDetail = bike.total_km != null ? formatDistance(bike.total_km, distanceUnit) : null;
  const hoursDetail = bike.total_hours != null ? `${formatNumber(bike.total_hours)} h` : null;

  const addComponentButton = (
    <Button
      render={<Link href={`/bikes/${bike.id}/components/new`} />}
      nativeButton={false}
      variant="outline"
      size="sm"
      className="h-[52px] w-[187px] border-transparent bg-foreground text-sm text-background hover:bg-foreground/90 hover:text-background"
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
      <DetailField label={dict.bikes.form.type} value={bike.type ?? "—"} className={fieldBasis} />
      <DetailField label={dict.bikes.detail.totalDistance} value={distanceDetail} mono className={fieldBasis} />
      <DetailField label={dict.bikes.detail.totalHours} value={hoursDetail} mono className={fieldBasis} />
      {bike.serial_number && (
        <DetailField label={dict.bikes.form.serialNumber} value={bike.serial_number} mono className={fieldBasis} />
      )}
      {bike.purchase_date && (
        <DetailField label={dict.bikes.form.purchaseDate} value={formatDate(bike.purchase_date)} className={fieldBasis} />
      )}
      {bike.warranty && (
        <DetailField label={dict.bikes.form.warranty} value={bike.warranty} className={fieldBasis} />
      )}
      {bike.year && <DetailField label={dict.bikes.form.year} value={bike.year} className={fieldBasis} />}
      {bike.frame_size && (
        <DetailField label={dict.bikes.form.frameSize} value={bike.frame_size} className={fieldBasis} />
      )}
      {bike.color && <DetailField label={dict.bikes.form.color} value={bike.color} className={fieldBasis} />}
      {bike.wheel_size && (
        <DetailField label={dict.bikes.form.wheelSize} value={bike.wheel_size} className={fieldBasis} />
      )}
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

      <div className="-mx-5 mb-6 rounded-b-lg bg-card px-5 pt-[37px] pb-6 sm:mx-0 sm:rounded-lg sm:px-6 sm:pt-6">
        <div className="flex flex-wrap items-end justify-between gap-6 sm:items-center">
          <div className="flex items-end gap-4 sm:items-center">
            <BikeIcon type={bike.type} size="lg" plain />
            <div>
              <h1 className="text-[26px] leading-none font-display font-bold sm:text-xl sm:leading-normal">{bike.name}</h1>
              <HealthBadge level={bikeHealth} dict={dict} className="mt-1.5 hidden sm:block" />
            </div>
          </div>

          <HealthBadge level={bikeHealth} dict={dict} className="sm:hidden" />

          <div className="hidden flex-1 sm:block">{detailsGrid}</div>

          <div className="hidden sm:block">{editButton}</div>
        </div>

        <div className="mt-[51px] sm:hidden">
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

      <Tabs defaultValue="components">
        <div className="mb-6 flex items-center justify-center sm:mb-3 sm:justify-between">
          <TabsList variant="line" className="h-auto gap-6 bg-transparent p-0">
            <TabsTrigger
              value="components"
              className="h-auto flex-none px-0 py-1 text-base font-display font-bold data-active:bg-transparent"
            >
              {dict.bikes.detail.componentsTitle}
              {components && components.length > 0 && (
                <span className="ml-1.5 font-normal text-muted-foreground">({components.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="h-auto flex-none px-0 py-1 text-base font-display font-bold data-active:bg-transparent"
            >
              {dict.bikes.detail.timelineTab}
            </TabsTrigger>
          </TabsList>
          <div className="hidden sm:block">{addComponentButton}</div>
        </div>

        <TabsContent value="components" className="rounded-xl bg-muted/40 pb-4 sm:bg-transparent sm:pb-0">
        {!components || components.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">{dict.bikes.detail.noComponentsYet}</p>
          </div>
        ) : (
          <div className="rounded-lg bg-card">
            {components.map((component, i) => {
              const { fractionUsed } = statusByComponent.get(component.id)!;
              const percent = healthPercent(fractionUsed);
              return (
                <div
                  key={component.id}
                  className={`px-5 py-6 transition-colors hover:bg-muted/50 sm:py-4 ${
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
                        <p className="mt-0.5 text-sm text-muted-foreground sm:text-xs">
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
                          fraction={fractionUsed}
                          className="mt-2 hidden sm:block sm:max-w-[220px]"
                        />
                      </div>
                    </Link>
                    <HealthPercentBadge percent={percent} className="shrink-0" />
                    <Link
                      href={`/bikes/${bike.id}/components/${component.id}/interventions/new`}
                      title={dict.bikes.detail.logIntervention}
                      aria-label={dict.bikes.detail.logInterventionFor(component.name ?? "")}
                      className="hidden size-10 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground sm:flex"
                    >
                      <Plus className="size-4" />
                    </Link>
                  </div>
                  <ServiceIntervalBar fraction={fractionUsed} className="mt-3 sm:hidden" />
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex justify-center sm:hidden">{addComponentButton}</div>
        </TabsContent>

        <TabsContent value="timeline">
          <BikeTimeline
            events={timelineEvents}
            dict={dict}
            distanceUnit={distanceUnit}
            bikeId={bike.id}
            bikeType={bike.type}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
