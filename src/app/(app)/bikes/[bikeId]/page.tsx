import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function BikeDetailPage({
  params,
}: {
  params: Promise<{ bikeId: string }>;
}) {
  const { bikeId } = await params;
  const supabase = await createClient();

  const { data: bike } = await supabase.from("bikes").select("*").eq("id", bikeId).single();
  if (!bike) notFound();

  const { data: components } = await supabase
    .from("components")
    .select("id, name, category, brand, model, interval_months")
    .eq("bike_id", bikeId)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl pt-8">
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/bikes" className="hover:text-foreground">
          Bikes
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{bike.name}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-5 rounded-3xl border border-border bg-card p-6">
        <div className="min-w-[200px] flex-1">
          <h1 className="text-xl font-display font-bold">{bike.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {[bike.type, bike.brand, bike.model, bike.year, bike.color]
              .filter(Boolean)
              .join(" · ") || "No details yet"}
          </p>
        </div>
        <div className="flex gap-5">
          <div>
            <p className="text-xs text-muted-foreground">Components</p>
            <p className="font-mono text-sm font-semibold">{components?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Serial</p>
            <p className="font-mono text-sm font-semibold">{bike.serial_number ?? "—"}</p>
          </div>
        </div>
        <Button
          render={<Link href={`/bikes/${bike.id}/edit`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-bold">Components</h2>
        <Button
          render={<Link href={`/bikes/${bike.id}/components/new`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          <Plus className="size-3.5" />
          Add component
        </Button>
      </div>

      {!components || components.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No components yet. Add suspension, drivetrain, brakes — anything you want to track
            maintenance for.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card">
          {components.map((component, i) => (
            <Link
              key={component.id}
              href={`/bikes/${bike.id}/components/${component.id}`}
              className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50 ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{component.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[
                    component.category,
                    component.interval_months ? `every ${component.interval_months} mo` : null,
                    [component.brand, component.model].filter(Boolean).join(" "),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
