import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateComponentStatus } from "@/lib/maintenance/calculation";
import { formatDate, formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { TypeBadge } from "@/components/type-badge";
import { ComponentIcon } from "@/components/component-icon";

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ bikeId: string; componentId: string }>;
}) {
  const { bikeId, componentId } = await params;
  const supabase = await createClient();

  const { data: bike } = await supabase.from("bikes").select("id, name").eq("id", bikeId).single();
  if (!bike) notFound();

  const { data: component } = await supabase
    .from("components")
    .select("*")
    .eq("id", componentId)
    .eq("bike_id", bikeId)
    .single();
  if (!component) notFound();

  const { data: interventions } = await supabase
    .from("interventions")
    .select("*")
    .eq("component_id", componentId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const { status, nextDueDate, daysRemaining } = calculateComponentStatus({
    intervalMonths: component.interval_months,
    installDate: component.install_date,
    lastInterventionDate: interventions?.[0]?.date ?? null,
  });

  const statusDetail =
    status === "overdue"
      ? `Overdue by ${Math.abs(daysRemaining!)}d`
      : status === "due_soon"
        ? `Due in ${daysRemaining}d`
        : status === "ok"
          ? `Due ${formatDate(nextDueDate!)}`
          : undefined;

  return (
    <div className="pt-8">
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/bikes" className="hover:text-foreground">
          Bikes
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={`/bikes/${bike.id}`} className="hover:text-foreground">
          {bike.name}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{component.name}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-5 rounded-lg bg-card p-6">
        <ComponentIcon size="lg" />
        <div className="min-w-[200px] flex-1">
          <h1 className="text-xl font-display font-bold">{component.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {[component.category, component.brand, component.model].filter(Boolean).join(" · ") ||
              "No details yet"}
          </p>
        </div>
        <div className="flex gap-5">
          <div>
            <p className="text-xs text-muted-foreground">Interval</p>
            <p className="font-mono text-sm font-semibold">
              {component.interval_months ? `Every ${component.interval_months} mo` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Serial</p>
            <p className="font-mono text-sm font-semibold">{component.serial_number ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <StatusBadge status={status} label={statusDetail} className="mt-0.5" />
          </div>
        </div>
        <Button
          render={<Link href={`/bikes/${bike.id}/components/${component.id}/edit`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-bold">History</h2>
        <Button
          render={<Link href={`/bikes/${bike.id}/components/${component.id}/interventions/new`} />}
          nativeButton={false}
          size="sm"
        >
          <Plus className="size-3.5" />
          Log intervention
        </Button>
      </div>

      {!interventions || interventions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <Inbox className="mx-auto mb-2 size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No interventions logged yet for this component.
          </p>
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
                <TypeBadge type={iv.type as "service" | "repair" | "replacement"} />
                <p className="mt-1.5 font-semibold">{iv.description || "No description"}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {iv.kms != null && <span>{formatNumber(iv.kms)} km</span>}
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
