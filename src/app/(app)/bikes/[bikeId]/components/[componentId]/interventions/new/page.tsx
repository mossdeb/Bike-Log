import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createIntervention } from "@/lib/actions/interventions";
import { FormError } from "@/components/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function NewInterventionPage({
  params,
  searchParams,
}: {
  params: Promise<{ bikeId: string; componentId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { bikeId, componentId } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: bike } = await supabase.from("bikes").select("id, name").eq("id", bikeId).single();
  if (!bike) notFound();

  const { data: component } = await supabase
    .from("components")
    .select("id, name")
    .eq("id", componentId)
    .eq("bike_id", bikeId)
    .single();
  if (!component) notFound();

  return (
    <div className="max-w-2xl pt-8">
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/bikes" className="hover:text-foreground">
          Bikes
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={`/bikes/${bike.id}`} className="hover:text-foreground">
          {bike.name}
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={`/bikes/${bike.id}/components/${component.id}`} className="hover:text-foreground">
          {component.name}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">Log intervention</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Log an intervention</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log a service, repair or replacement for {component.name}.
        </p>
      </div>

      <FormError message={error} />

      <form
        action={createIntervention.bind(null, bike.id, component.id)}
        className="rounded-lg bg-card p-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Type *</Label>
            <div className="flex gap-2">
              {(["service", "repair", "replacement"] as const).map((type, i) => (
                <label
                  key={type}
                  className="flex flex-1 items-center justify-center rounded-sm border border-input px-3 py-2 text-sm font-semibold capitalize has-checked:border-transparent has-checked:bg-foreground has-checked:text-background"
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    defaultChecked={i === 0}
                    className="sr-only"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" name="date" type="date" required />
          </div>
          <div />

          <div className="space-y-1.5">
            <Label htmlFor="hours_used">Hours of use</Label>
            <Input id="hours_used" name="hours_used" type="number" step="0.1" placeholder="Optional" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kms">Kms</Label>
            <Input id="kms" name="kms" type="number" step="0.1" placeholder="Optional" />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              name="description"
              placeholder="e.g. Full service, new seals and oil"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Anything else worth remembering" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            render={<Link href={`/bikes/${bike.id}/components/${component.id}`} />}
            nativeButton={false}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit">Save entry</Button>
        </div>
      </form>
    </div>
  );
}
