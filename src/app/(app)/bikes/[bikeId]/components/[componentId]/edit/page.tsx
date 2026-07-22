import Link from "next/link";
import { notFound } from "next/navigation";
import { getBikeIndexManufacturers } from "@/lib/bikeindex";
import { createClient } from "@/lib/supabase/server";
import { updateComponent, deleteComponent } from "@/lib/actions/components";
import { COMPONENT_CATEGORIES, COMPONENT_NAME_SUGGESTIONS } from "@/lib/constants";
import { BrandField } from "@/components/brand-field";
import { FormError } from "@/components/form-error";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function EditComponentPage({
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
    .select("*")
    .eq("id", componentId)
    .eq("bike_id", bikeId)
    .single();
  if (!component) notFound();

  const manufacturers = await getBikeIndexManufacturers();

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
        <span className="text-foreground">Edit</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Edit component</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update details for {component.name}.</p>
      </div>

      <FormError message={error} />

      <form
        action={updateComponent.bind(null, bike.id, component.id)}
        className="rounded-3xl border border-border bg-card p-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              list="component-suggestions"
              autoComplete="off"
              defaultValue={component.name}
              required
            />
            <datalist id="component-suggestions">
              {COMPONENT_NAME_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue={component.category ?? "Suspension"}
              className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {COMPONENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <BrandField manufacturers={manufacturers} defaultValue={component.brand} />

          <div className="space-y-1.5">
            <Label htmlFor="model">Model</Label>
            <Input id="model" name="model" defaultValue={component.model ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="serial_number">Serial number</Label>
            <Input
              id="serial_number"
              name="serial_number"
              defaultValue={component.serial_number ?? ""}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="install_date">Install date</Label>
            <Input
              id="install_date"
              name="install_date"
              type="date"
              defaultValue={component.install_date ?? ""}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="interval_months">Service interval (months)</Label>
            <Input
              id="interval_months"
              name="interval_months"
              type="number"
              defaultValue={component.interval_months ?? ""}
              className="max-w-[140px]"
            />
            <p className="text-xs text-muted-foreground">
              Used to calculate the next service due date.
            </p>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={component.notes ?? ""} />
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
        <p className="text-sm font-semibold">Delete this component</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {`Permanently deletes ${component.name} and its maintenance history. This can't be undone.`}
        </p>
        <div className="mt-4">
          <DeleteConfirmButton
            action={deleteComponent.bind(null, bike.id, component.id)}
            title="Delete this component?"
            description={`This permanently deletes "${component.name}" and its maintenance history.`}
            triggerLabel="Delete component"
          />
        </div>
      </div>
    </div>
  );
}
