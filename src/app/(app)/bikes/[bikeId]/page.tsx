import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateComponentStatus, worstStatus } from "@/lib/maintenance/calculation";
import { formatDistance, formatNumber, kmToUnit } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ServiceIntervalBar } from "@/components/service-interval-bar";
import { BikeIcon } from "@/components/bike-icon";
import { StravaBadgeIcon } from "@/components/strava-icon";
import { ComponentIcon } from "@/components/component-icon";
import { COMPONENT_CATEGORY_ICON } from "@/components/component-category-icon";
import type { ComponentCategory } from "@/lib/constants";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";

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

  return (
    <div className="pt-8">
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/bikes" className="hover:text-foreground">
          {dict.bikes.breadcrumb}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{bike.name}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-5 rounded-lg bg-card p-6">
        <BikeIcon type={bike.type} size="lg" />
        <div className="min-w-[200px] flex-1">
          <h1 className="text-xl font-display font-bold">{bike.name}</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            {bike.strava_gear_id && <StravaBadgeIcon className="size-[16.8px] shrink-0" />}
            {[bike.type, bike.brand, bike.model, bike.year, bike.color]
              .filter(Boolean)
              .join(" · ") || dict.bikes.noDetailsYet}
          </p>
        </div>
        <div className="flex gap-5">
          <div>
            <p className="text-xs text-muted-foreground">{dict.bikes.detail.components}</p>
            <p className="font-mono text-sm font-semibold">{components?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{dict.bikes.detail.serial}</p>
            <p className="font-mono text-sm font-semibold">{bike.serial_number ?? "—"}</p>
          </div>
          {bike.total_km != null && (
            <div>
              <p className="text-xs text-muted-foreground">{dict.bikes.detail.totalDistance}</p>
              <p className="font-mono text-sm font-semibold">{formatDistance(bike.total_km, distanceUnit)}</p>
            </div>
          )}
          {bike.total_hours != null && (
            <div>
              <p className="text-xs text-muted-foreground">{dict.bikes.detail.totalHours}</p>
              <p className="font-mono text-sm font-semibold">{formatNumber(bike.total_hours)} h</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">{dict.bikes.detail.status}</p>
            <StatusBadge status={bikeStatus} dict={dict} className="mt-0.5" />
          </div>
        </div>
        <Button
          render={<Link href={`/bikes/${bike.id}/edit`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          <Pencil className="size-3.5" />
          {dict.bikes.detail.edit}
        </Button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-bold">{dict.bikes.detail.componentsTitle}</h2>
        <Button
          render={<Link href={`/bikes/${bike.id}/components/new`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          <Plus className="size-3.5" />
          {dict.bikes.detail.addComponent}
        </Button>
      </div>

      {!components || components.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">{dict.bikes.detail.noComponentsYet}</p>
        </div>
      ) : (
        <div className="rounded-lg bg-card">
          {components.map((component, i) => {
            const { status, fractionUsed } = statusByComponent.get(component.id)!;
            return (
              <div
                key={component.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <Link
                  href={`/bikes/${bike.id}/components/${component.id}`}
                  className="flex min-w-0 flex-1 items-center gap-4"
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
                    <ServiceIntervalBar status={status} fraction={fractionUsed} className="mt-2 max-w-[220px]" />
                  </div>
                  <StatusBadge status={status} dict={dict} />
                </Link>
                <Link
                  href={`/bikes/${bike.id}/components/${component.id}/interventions/new`}
                  title={dict.bikes.detail.logIntervention}
                  aria-label={dict.bikes.detail.logInterventionFor(component.name ?? "")}
                  className="flex size-9 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  <Plus className="size-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
