import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateComponentStatus, worstStatus } from "@/lib/maintenance/calculation";
import { Button } from "@/components/ui/button";
import { BikeIcon } from "@/components/bike-icon";
import { StatusBadge } from "@/components/status-badge";

export default async function BikesPage() {
  const supabase = await createClient();
  const [{ data: bikes }, { data: components }] = await Promise.all([
    supabase.from("bikes").select("id, name, type, brand, model, year").order("created_at", { ascending: false }),
    supabase
      .from("components_status")
      .select("bike_id, interval_months, install_date, last_intervention_date"),
  ]);

  const bikeStatuses = new Map(
    (bikes ?? []).map((bike) => {
      const statuses = (components ?? [])
        .filter((c) => c.bike_id === bike.id)
        .map(
          (c) =>
            calculateComponentStatus({
              intervalMonths: c.interval_months,
              installDate: c.install_date,
              lastInterventionDate: c.last_intervention_date,
            }).status
        );
      return [bike.id, worstStatus(statuses)];
    })
  );

  return (
    <div className="pt-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Bikes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {bikes?.length ?? 0} {bikes?.length === 1 ? "bike" : "bikes"} in your fleet
          </p>
        </div>
        <Button render={<Link href="/bikes/new" />} nativeButton={false} size="lg">
          <Plus className="size-4" />
          Add bike
        </Button>
      </div>

      {!bikes || bikes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No bikes yet. Add your first one to start tracking maintenance.
          </p>
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
                <BikeIcon bikeId={bike.id} />
                <StatusBadge status={bikeStatuses.get(bike.id) ?? "not_configured"} />
              </div>
              <h2 className="font-display font-bold">{bike.name}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{bike.type ?? "—"}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {[bike.brand, bike.model, bike.year].filter(Boolean).join(" · ") || "No details yet"}
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
