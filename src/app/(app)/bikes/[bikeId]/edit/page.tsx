import Link from "next/link";
import { notFound } from "next/navigation";
import { getBikeIndexManufacturers } from "@/lib/bikeindex";
import { createClient } from "@/lib/supabase/server";
import { updateBike, deleteBike } from "@/lib/actions/bikes";
import { BIKE_TYPES } from "@/lib/constants";
import { BrandField } from "@/components/brand-field";
import { FormError } from "@/components/form-error";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function EditBikePage({
  params,
  searchParams,
}: {
  params: Promise<{ bikeId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { bikeId } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: bike } = await supabase.from("bikes").select("*").eq("id", bikeId).single();
  if (!bike) notFound();

  const [manufacturers, { count: componentCount }] = await Promise.all([
    getBikeIndexManufacturers(),
    supabase.from("components").select("id", { count: "exact", head: true }).eq("bike_id", bikeId),
  ]);

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
        <span className="text-foreground">Edit</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Edit bike</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update details for {bike.name}.</p>
      </div>

      <FormError message={error} />

      <form
        action={updateBike.bind(null, bike.id)}
        className="rounded-3xl border border-border bg-card p-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={bike.name} required />
          </div>

          <BrandField manufacturers={manufacturers} defaultValue={bike.brand} />

          <div className="space-y-1.5">
            <Label htmlFor="model">Model</Label>
            <Input id="model" name="model" defaultValue={bike.model ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <Input id="year" name="year" type="number" defaultValue={bike.year ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              defaultValue={bike.type ?? "Enduro"}
              className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {BIKE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="color">Color</Label>
            <Input id="color" name="color" defaultValue={bike.color ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="serial_number">Serial number</Label>
            <Input id="serial_number" name="serial_number" defaultValue={bike.serial_number ?? ""} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={bike.notes ?? ""} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            render={<Link href={`/bikes/${bike.id}`} />}
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
        <p className="text-sm font-semibold">Delete this bike</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {`Permanently deletes ${bike.name} and all ${componentCount ?? 0} of its components and their maintenance history. This can't be undone.`}
        </p>
        <div className="mt-4">
          <DeleteConfirmButton
            action={deleteBike.bind(null, bike.id)}
            title="Delete this bike?"
            description={`This permanently deletes "${bike.name}" and all ${componentCount ?? 0} of its components and their maintenance history.`}
            triggerLabel="Delete bike"
          />
        </div>
      </div>
    </div>
  );
}
