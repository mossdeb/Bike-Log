import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateComponentStatus } from "@/lib/maintenance/calculation";
import { averageHealth, healthPercent } from "@/lib/maintenance/health";
import { Button } from "@/components/ui/button";
import { BikeIcon } from "@/components/bike-icon";
import { HealthBadge } from "@/components/health-badge";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";
import { formatDistance, formatNumber } from "@/lib/format";
import { StravaBadgeIcon } from "@/components/strava-icon";

export default async function BikesPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const dict = getDictionary(localeFromMetadata(userData?.claims?.user_metadata));
  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";

  const [{ data: bikes }, { data: components }] = await Promise.all([
    supabase
      .from("bikes")
      .select("id, name, type, brand, model, year, total_km, total_hours, strava_gear_id")
      .order("created_at", { ascending: false }),
    supabase
      .from("components_status")
      .select(
        "bike_id, interval_type, interval_value, install_date, last_intervention_date, bike_km_at_install, bike_hours_at_install, last_service_km, last_service_hours"
      ),
  ]);

  const bikeHealthById = new Map(
    (bikes ?? []).map((bike) => {
      const percents = (components ?? [])
        .filter((c) => c.bike_id === bike.id)
        .map((c) =>
          healthPercent(
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
            }).fractionUsed
          )
        );
      return [bike.id, averageHealth(percents)];
    })
  );

  return (
    <div className="pt-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">{dict.bikes.breadcrumb}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{dict.bikes.fleetCount(bikes?.length ?? 0)}</p>
        </div>
        <Button
          render={<Link href="/bikes/new" />}
          nativeButton={false}
          variant="outline"
          size="lg"
          className="border-transparent bg-foreground text-background hover:bg-foreground/90 hover:text-background"
        >
          <Plus className="size-4" />
          {dict.bikes.addBike}
        </Button>
      </div>

      {!bikes || bikes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">{dict.bikes.noBikesYet}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bikes.map((bike) => (
            <Link
              key={bike.id}
              href={`/bikes/${bike.id}`}
              className="flex h-full flex-col rounded-lg bg-card p-5 transition-colors hover:border-foreground/20"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <BikeIcon type={bike.type} plain />
                <HealthBadge percent={bikeHealthById.get(bike.id) ?? null} dict={dict} />
              </div>
              <h2 className="font-display text-[20px] font-bold">{bike.name}</h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                {bike.strava_gear_id && <StravaBadgeIcon className="size-[16.8px] shrink-0" />}
                {[bike.type, bike.brand, bike.model, bike.year].filter(Boolean).join(" · ") || dict.bikes.noDetailsYet}
              </p>
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
        </div>
      )}
    </div>
  );
}
