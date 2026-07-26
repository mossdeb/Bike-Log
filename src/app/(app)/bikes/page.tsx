import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateComponentStatus, worstStatus } from "@/lib/maintenance/calculation";
import { Button } from "@/components/ui/button";
import { BikeIcon } from "@/components/bike-icon";
import { StatusBadge } from "@/components/status-badge";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";
import { formatDistance } from "@/lib/format";

export default async function BikesPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const dict = getDictionary(localeFromMetadata(userData?.claims?.user_metadata));
  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";

  const [{ data: bikes }, { data: components }] = await Promise.all([
    supabase
      .from("bikes")
      .select("id, name, type, brand, model, year, total_km, total_hours")
      .order("created_at", { ascending: false }),
    supabase
      .from("components_status")
      .select(
        "bike_id, interval_type, interval_value, install_date, last_intervention_date, bike_km_at_install, bike_hours_at_install, last_service_km, last_service_hours"
      ),
  ]);

  const bikeStatuses = new Map(
    (bikes ?? []).map((bike) => {
      const statuses = (components ?? [])
        .filter((c) => c.bike_id === bike.id)
        .map(
          (c) =>
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
            }).status
        );
      return [bike.id, worstStatus(statuses)];
    })
  );

  return (
    <div className="pt-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">{dict.bikes.breadcrumb}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{dict.bikes.fleetCount(bikes?.length ?? 0)}</p>
        </div>
        <Button render={<Link href="/bikes/new" />} nativeButton={false} size="lg">
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
              className="rounded-lg bg-card p-5 transition-colors hover:border-foreground/20"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <BikeIcon type={bike.type} />
                <StatusBadge status={bikeStatuses.get(bike.id) ?? "not_configured"} dict={dict} />
              </div>
              <h2 className="font-display font-bold">{bike.name}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{bike.type ?? "—"}</p>
              {bike.total_km != null && (
                <p className="mt-0.5 text-sm text-muted-foreground">{formatDistance(bike.total_km, distanceUnit)}</p>
              )}
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {[bike.brand, bike.model, bike.year].filter(Boolean).join(" · ") || dict.bikes.noDetailsYet}
                </p>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
