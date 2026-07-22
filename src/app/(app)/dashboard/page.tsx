import Link from "next/link";
import { Bike, Cog, ClipboardList, Plus, Wrench, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateComponentStatus, type ServiceStatus } from "@/lib/maintenance/calculation";
import { formatDate, formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";

const STATUS_RANK: Record<ServiceStatus, number> = {
  overdue: 0,
  due_soon: 1,
  ok: 2,
  not_configured: 3,
};

function worstStatus(statuses: ServiceStatus[]): ServiceStatus {
  return statuses.reduce((worst, s) => (STATUS_RANK[s] < STATUS_RANK[worst] ? s : worst), "not_configured" as ServiceStatus);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getClaims();
  const claims = userData?.claims;
  const displayName =
    (claims?.user_metadata as { full_name?: string } | undefined)?.full_name?.split(" ")[0] ??
    (claims?.email as string | undefined)?.split("@")[0] ??
    "there";

  const [{ data: bikes }, { data: componentRows }, { data: recentRaw }] = await Promise.all([
    supabase.from("bikes").select("id, name, type, brand, model").order("created_at", { ascending: true }),
    supabase
      .from("components_status")
      .select("id, bike_id, name, interval_months, install_date, last_intervention_date")
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
    components.map((c) => [
      c.id,
      calculateComponentStatus({
        intervalMonths: c.interval_months,
        installDate: c.install_date,
        lastInterventionDate: c.last_intervention_date,
      }),
    ])
  );

  const totalBikes = bikes?.length ?? 0;
  const totalComponents = components.length;
  const loggedThisYear =
    recentRaw?.filter((iv) => new Date(iv.date).getFullYear() === new Date().getFullYear()).length ?? 0;

  const bikeStatuses = new Map<string, ServiceStatus>();
  for (const bike of bikes ?? []) {
    const statuses = components
      .filter((c) => c.bike_id === bike.id)
      .map((c) => statusByComponent.get(c.id)!.status);
    bikeStatuses.set(bike.id, worstStatus(statuses));
  }

  const needsAttention = components
    .map((c) => ({ component: c, cs: statusByComponent.get(c.id)! }))
    .filter(({ cs }) => cs.status === "overdue" || cs.status === "due_soon")
    .sort((a, b) => {
      if (a.cs.status !== b.cs.status) return a.cs.status === "overdue" ? -1 : 1;
      return (a.cs.daysRemaining ?? 0) - (b.cs.daysRemaining ?? 0);
    })
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl pt-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Welcome back, {displayName}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalBikes} {totalBikes === 1 ? "bike" : "bikes"} · {totalComponents}{" "}
            {totalComponents === 1 ? "component" : "components"} tracked
            {needsAttention.length > 0 && ` · ${needsAttention.length} need${needsAttention.length === 1 ? "s" : ""} attention`}
          </p>
        </div>
        <Button render={<Link href="/bikes" />} nativeButton={false} variant="outline">
          <Wrench className="size-4" />
          Log maintenance
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-lg bg-emphasis p-5 text-emphasis-foreground">
          <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-emphasis-foreground/10">
            <Bike className="size-4" />
          </div>
          <p className="text-xs text-emphasis-foreground/60">Total bikes</p>
          <p className="font-display text-2xl font-bold">{totalBikes}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-muted">
            <Cog className="size-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">Components tracked</p>
          <p className="font-display text-2xl font-bold">{totalComponents}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-muted">
            <ClipboardList className="size-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">Logged this year</p>
          <p className="font-display text-2xl font-bold">{loggedThisYear}</p>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-bold">Your bikes</h2>
        <Link href="/bikes" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
          View all
        </Link>
      </div>

      {!bikes || bikes.length === 0 ? (
        <div className="mb-6 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            No bikes yet. Add your first one to start tracking maintenance.
          </p>
          <Button render={<Link href="/bikes/new" />} nativeButton={false}>
            <Plus className="size-4" />
            Add bike
          </Button>
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bikes.map((bike) => (
            <Link
              key={bike.id}
              href={`/bikes/${bike.id}`}
              className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold">{bike.name}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{bike.type ?? "—"}</p>
                </div>
                <StatusBadge status={bikeStatuses.get(bike.id) ?? "not_configured"} />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 font-display font-bold">Needs attention</h2>
          {needsAttention.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing needs attention right now.
            </p>
          ) : (
            <div>
              {needsAttention.map(({ component, cs }, i) => {
                const bike = bikeInfo.get(component.bike_id!);
                const detail =
                  cs.status === "overdue"
                    ? `Overdue ${Math.abs(cs.daysRemaining!)}d`
                    : `Due in ${cs.daysRemaining}d`;
                return (
                  <Link
                    key={component.id}
                    href={`/bikes/${component.bike_id}/components/${component.id}`}
                    className={`flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/50 ${
                      i > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{component.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{bike?.name ?? "—"}</p>
                    </div>
                    <StatusBadge status={cs.status} label={detail} className="shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 font-display font-bold">Recent interventions</h2>
          {!recentRaw || recentRaw.length === 0 ? (
            <div className="py-6 text-center">
              <Inbox className="mx-auto mb-2 size-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No maintenance logged yet.</p>
            </div>
          ) : (
            <div>
              {recentRaw.map((iv, i) => {
                const component = componentInfo.get(iv.component_id);
                const bike = component?.bike_id ? bikeInfo.get(component.bike_id) : undefined;
                return (
                  <Link
                    key={iv.id}
                    href={`/bikes/${component?.bike_id}/components/${iv.component_id}`}
                    className={`flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/50 ${
                      i > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold capitalize">
                        {iv.type} — {component?.name ?? "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {bike?.name ?? "—"} · {formatDate(iv.date)}
                      </p>
                    </div>
                    <div className="shrink-0 font-mono text-xs text-muted-foreground">
                      {iv.kms != null ? `${formatNumber(iv.kms)} km` : iv.hours_used != null ? `${formatNumber(iv.hours_used)} h` : ""}
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
