import Link from "next/link";
import { Bike, Cog, ClipboardList, Plus, Wrench, Inbox, AlertTriangle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateComponentStatus } from "@/lib/maintenance/calculation";
import { averageHealth, classifyHealth, healthPercent } from "@/lib/maintenance/health";
import { formatDate, formatDistance, formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { HealthBadge, HealthPercentBadge } from "@/components/health-badge";
import { BikeIcon } from "@/components/bike-icon";
import { BikeCarousel } from "@/components/bike-carousel";
import { ComponentIcon } from "@/components/component-icon";
import { InterventionIcon } from "@/components/intervention-icon";
import { ServiceIntervalBar } from "@/components/service-interval-bar";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";
import { StravaBadgeIcon } from "@/components/strava-icon";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getClaims();
  const claims = userData?.claims;
  const displayName =
    (claims?.user_metadata as { full_name?: string } | undefined)?.full_name?.split(" ")[0] ??
    (claims?.email as string | undefined)?.split("@")[0] ??
    "there";
  const dict = getDictionary(localeFromMetadata(claims?.user_metadata));
  const distanceUnit = ((claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";

  const [{ data: bikes }, { data: componentRows }, { data: recentRaw }] = await Promise.all([
    supabase
      .from("bikes")
      .select("id, name, type, brand, model, year, total_km, total_hours, strava_gear_id")
      .order("usage_updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("components_status")
      .select(
        "id, bike_id, name, interval_type, interval_value, install_date, last_intervention_date, bike_km_at_install, bike_hours_at_install, last_service_km, last_service_hours"
      )
      .order("created_at", { ascending: true }),
    supabase
      .from("interventions")
      .select("id, type, date, kms, hours_used, component_id")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const components = componentRows ?? [];
  const componentInfo = new Map(components.map((c) => [c.id, c]));
  const bikeInfo = new Map((bikes ?? []).map((b) => [b.id, b]));

  const statusByComponent = new Map(
    components.map((c) => {
      const bike = c.bike_id ? bikeInfo.get(c.bike_id) : undefined;
      return [
        c.id,
        calculateComponentStatus({
          intervalType: c.interval_type as "km" | "hours" | "months" | null,
          intervalValue: c.interval_value,
          installDate: c.install_date,
          lastInterventionDate: c.last_intervention_date,
          currentKm: bike?.total_km ?? null,
          currentHours: bike?.total_hours ?? null,
          bikeKmAtInstall: c.bike_km_at_install,
          bikeHoursAtInstall: c.bike_hours_at_install,
          bikeKmAtLastService: c.last_service_km,
          bikeHoursAtLastService: c.last_service_hours,
        }),
      ];
    })
  );

  const totalBikes = bikes?.length ?? 0;
  const totalComponents = components.length;
  const loggedThisYear =
    recentRaw?.filter((iv) => new Date(iv.date).getFullYear() === new Date().getFullYear()).length ?? 0;

  const bikeHealthById = new Map<string, number | null>();
  for (const bike of bikes ?? []) {
    const percents = components
      .filter((c) => c.bike_id === bike.id)
      .map((c) => healthPercent(statusByComponent.get(c.id)!.fractionUsed));
    bikeHealthById.set(bike.id, averageHealth(percents));
  }

  const needsAttention = components
    .map((c) => {
      const fractionUsed = statusByComponent.get(c.id)!.fractionUsed;
      return { component: c, fractionUsed, percent: healthPercent(fractionUsed) };
    })
    .filter(
      (c): c is { component: (typeof components)[number]; fractionUsed: number; percent: number } =>
        c.percent != null && c.percent < 25
    )
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 6);

  return (
    <div className="pt-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">{dict.dashboard.welcome(displayName)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {dict.dashboard.bikeCount(totalBikes)} · {dict.dashboard.componentCount(totalComponents)}
            {needsAttention.length > 0 && ` · ${dict.dashboard.needsAttentionCount(needsAttention.length)}`}
          </p>
        </div>
        <Button render={<Link href="/bikes" />} nativeButton={false} variant="outline" className="hidden sm:inline-flex">
          <Wrench className="size-4" />
          {dict.dashboard.logMaintenance}
        </Button>
      </div>

      <div className="hidden gap-4 sm:mb-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-emphasis p-5 text-emphasis-foreground">
          <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-emphasis-foreground/10">
            <Bike className="size-4" />
          </div>
          <p className="text-xs text-emphasis-foreground/60">{dict.dashboard.totalBikes}</p>
          <p className="font-display text-2xl font-bold">{totalBikes}</p>
        </div>
        <div className="rounded-lg bg-card p-5">
          <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-muted">
            <Cog className="size-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">{dict.dashboard.componentsTracked}</p>
          <p className="font-display text-2xl font-bold">{totalComponents}</p>
        </div>
        <div className="rounded-lg bg-card p-5">
          <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-muted">
            <ClipboardList className="size-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">{dict.dashboard.loggedThisYear}</p>
          <p className="font-display text-2xl font-bold">{loggedThisYear}</p>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-bold">{dict.dashboard.yourBikes}</h2>
        <Link href="/bikes" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
          {dict.dashboard.viewAll}
        </Link>
      </div>

      {!bikes || bikes.length === 0 ? (
        <div className="mb-6 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="mb-4 text-sm text-muted-foreground">{dict.dashboard.noBikesYet}</p>
          <Button render={<Link href="/bikes/new" />} nativeButton={false}>
            <Plus className="size-4" />
            {dict.dashboard.addBike}
          </Button>
        </div>
      ) : (
        <div className="mb-6">
          <BikeCarousel>
            {bikes.map((bike) => (
              <Link
                key={bike.id}
                href={`/bikes/${bike.id}`}
                className="flex h-full min-h-[250px] flex-col rounded-lg bg-card p-6 transition-colors hover:border-foreground/20 sm:min-h-0 sm:p-5"
              >
                <div className="flex items-start justify-end gap-3 sm:justify-between">
                  <BikeIcon type={bike.type} plain className="hidden sm:block" />
                  <HealthBadge percent={bikeHealthById.get(bike.id) ?? null} dict={dict} />
                </div>
                <div className="flex flex-1 flex-col justify-center sm:flex-none sm:justify-start">
                  <BikeIcon type={bike.type} plain className="mb-1 sm:hidden" />
                  <h3 className="font-display text-[26px] font-bold sm:text-[20px]">{bike.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    {bike.strava_gear_id && <StravaBadgeIcon className="size-[16.8px] shrink-0" />}
                    {[bike.type, bike.brand, bike.model, bike.year].filter(Boolean).join(" · ") || dict.bikes.noDetailsYet}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <p className="text-sm text-muted-foreground">
                    {[
                      bike.total_km != null ? formatDistance(bike.total_km, distanceUnit) : null,
                      bike.total_hours != null ? `${formatNumber(bike.total_hours)} h` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <span className="flex h-11 shrink-0 items-center justify-center rounded-full bg-muted px-4 text-sm font-semibold">
                    {dict.bikes.viewBike}
                  </span>
                </div>
              </Link>
            ))}
          </BikeCarousel>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-card p-5">
          <h2 className="mb-3 font-display font-bold">{dict.dashboard.needsAttention}</h2>
          {needsAttention.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {dict.dashboard.nothingNeedsAttention}
            </p>
          ) : (
            <div>
              {needsAttention.map(({ component, fractionUsed, percent }, i) => {
                const bike = bikeInfo.get(component.bike_id!);
                return (
                  <Link
                    key={component.id}
                    href={`/bikes/${component.bike_id}/components/${component.id}`}
                    className={`flex items-center gap-3 py-3 transition-colors hover:bg-muted/50 ${
                      i > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <ComponentIcon icon={classifyHealth(percent) === "critical" ? AlertTriangle : Clock} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{component.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[bike?.type, bike?.name].filter(Boolean).join(" · ") || "—"}
                      </p>
                      <ServiceIntervalBar fraction={fractionUsed} className="mt-2 max-w-[220px]" />
                    </div>
                    <HealthPercentBadge percent={percent} className="shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg bg-card p-5">
          <h2 className="mb-3 font-display font-bold">{dict.dashboard.recentInterventions}</h2>
          {!recentRaw || recentRaw.length === 0 ? (
            <div className="py-6 text-center">
              <Inbox className="mx-auto mb-2 size-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{dict.dashboard.noMaintenanceLogged}</p>
            </div>
          ) : (
            <div>
              {recentRaw.map((iv, i) => {
                const component = componentInfo.get(iv.component_id);
                const bike = component?.bike_id ? bikeInfo.get(component.bike_id) : undefined;
                const type = iv.type as "service" | "repair" | "replacement";
                return (
                  <Link
                    key={iv.id}
                    href={`/bikes/${component?.bike_id}/components/${iv.component_id}`}
                    className={`flex items-center gap-3 py-3 transition-colors hover:bg-muted/50 ${
                      i > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <InterventionIcon type={type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {dict.interventionType[type]} — {component?.name ?? "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {bike?.name ?? "—"} · {formatDate(iv.date)}
                      </p>
                    </div>
                    <div className="shrink-0 font-mono text-xs text-muted-foreground">
                      {iv.kms != null ? formatDistance(iv.kms, distanceUnit) : iv.hours_used != null ? `${formatNumber(iv.hours_used)} h` : ""}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
