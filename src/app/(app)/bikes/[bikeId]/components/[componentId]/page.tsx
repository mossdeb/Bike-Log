import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="mx-auto max-w-3xl pt-8">
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

      <div className="mb-6 flex flex-wrap items-center gap-5 rounded-3xl border border-border bg-card p-6">
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

      <div className="rounded-3xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Maintenance history (services, repairs, replacements) is coming in the next phase.
        </p>
      </div>
    </div>
  );
}
