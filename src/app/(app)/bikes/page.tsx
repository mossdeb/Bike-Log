import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function BikesPage() {
  const supabase = await createClient();
  const { data: bikes } = await supabase
    .from("bikes")
    .select("id, name, type, brand, model, year")
    .order("created_at", { ascending: false });

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
              className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display font-bold">{bike.name}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{bike.type ?? "—"}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {[bike.brand, bike.model, bike.year].filter(Boolean).join(" · ") || "No details yet"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
