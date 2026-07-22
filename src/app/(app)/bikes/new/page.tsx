import Link from "next/link";
import { getBikeIndexManufacturers } from "@/lib/bikeindex";
import { createBike } from "@/lib/actions/bikes";
import { BIKE_TYPES } from "@/lib/constants";
import { BrandField } from "@/components/brand-field";
import { FormError } from "@/components/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function NewBikePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const manufacturers = await getBikeIndexManufacturers();

  return (
    <div className="mx-auto max-w-2xl pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Add a bike</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your bike so you can start tracking its components.
        </p>
      </div>

      <FormError message={error} />

      <form action={createBike} className="rounded-lg border border-border bg-card p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" placeholder="e.g. Canyon Spectral CF 8" required />
          </div>

          <BrandField manufacturers={manufacturers} />

          <div className="space-y-1.5">
            <Label htmlFor="model">Model</Label>
            <Input id="model" name="model" placeholder="e.g. Spectral CF 8" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <Input id="year" name="year" type="number" placeholder="2024" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              defaultValue="Enduro"
              className="flex h-8 w-full items-center rounded-sm border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
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
            <Input id="color" name="color" placeholder="e.g. Raw Carbon" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="serial_number">Serial number</Label>
            <Input id="serial_number" name="serial_number" placeholder="Optional" />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Anything worth remembering about this bike"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            render={<Link href="/bikes" />}
            nativeButton={false}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit">Save bike</Button>
        </div>
      </form>
    </div>
  );
}
