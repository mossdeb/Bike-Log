import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateIntervention, deleteIntervention } from "@/lib/actions/interventions";
import { FormError } from "@/components/form-error";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function EditInterventionPage({
  params,
  searchParams,
}: {
  params: Promise<{ bikeId: string; componentId: string; interventionId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { bikeId, componentId, interventionId } = await params;
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

  const { data: intervention } = await supabase
    .from("interventions")
    .select("*")
    .eq("id", interventionId)
    .eq("component_id", componentId)
    .single();
  if (!intervention) notFound();

  return (
    <div className="mx-auto max-w-2xl pt-8">
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
        <span className="text-foreground">Edit intervention</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Edit intervention</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update this entry for {component.name}.
        </p>
      </div>

      <FormError message={error} />

      <form
        action={updateIntervention.bind(null, bike.id, component.id, intervention.id)}
        className="rounded-3xl border border-border bg-card p-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Type *</Label>
            <div className="flex gap-2">
              {(["service", "repair", "replacement"] as const).map((type) => (
                <label
                  key={type}
                  className="flex flex-1 items-center justify-center rounded-lg border border-input px-3 py-2 text-sm font-semibold capitalize has-checked:border-transparent has-checked:bg-foreground has-checked:text-background"
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    defaultChecked={intervention.type === type}
                    className="sr-only"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" name="date" type="date" defaultValue={intervention.date} required />
          </div>
          <div />

          <div className="space-y-1.5">
            <Label htmlFor="hours_used">Hours of use</Label>
            <Input
              id="hours_used"
              name="hours_used"
              type="number"
              step="0.1"
              defaultValue={intervention.hours_used ?? ""}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kms">Kms</Label>
            <Input id="kms" name="kms" type="number" step="0.1" defaultValue={intervention.kms ?? ""} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              name="description"
              defaultValue={intervention.description ?? ""}
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={intervention.notes ?? ""} />
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
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      <div className="mt-6 rounded-3xl border border-destructive/30 bg-card p-6">
        <p className="text-sm font-semibold">Delete this entry</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {`Permanently deletes this ${intervention.type} entry. This can't be undone.`}
        </p>
        <div className="mt-4">
          <DeleteConfirmButton
            action={deleteIntervention.bind(null, bike.id, component.id, intervention.id)}
            title="Delete this entry?"
            description={`This permanently deletes this ${intervention.type} entry from ${component.name}'s history.`}
            triggerLabel="Delete entry"
          />
        </div>
      </div>
    </div>
  );
}
