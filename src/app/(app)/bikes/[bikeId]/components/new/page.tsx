import Link from "next/link";
import { notFound } from "next/navigation";
import { getBikeIndexManufacturers } from "@/lib/bikeindex";
import { createClient } from "@/lib/supabase/server";
import { createComponent } from "@/lib/actions/components";
import { COMPONENT_CATEGORIES, COMPONENT_NAME_SUGGESTIONS } from "@/lib/constants";
import { BrandField } from "@/components/brand-field";
import { FormError } from "@/components/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";

export default async function NewComponentPage({
  params,
  searchParams,
}: {
  params: Promise<{ bikeId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { bikeId } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";
  const dict = getDictionary(localeFromMetadata(userData?.claims?.user_metadata));

  const { data: bike } = await supabase.from("bikes").select("id, name").eq("id", bikeId).single();
  if (!bike) notFound();

  const manufacturers = await getBikeIndexManufacturers();

  return (
    <div className="max-w-2xl pt-8">
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/bikes" className="hover:text-foreground">
          {dict.bikes.breadcrumb}
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={`/bikes/${bike.id}`} className="hover:text-foreground">
          {bike.name}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{dict.bikes.detail.addComponent}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">{dict.components.form.addTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.components.form.addSubtitle(bike.name)}</p>
      </div>

      <FormError message={error} />

      <form
        action={createComponent.bind(null, bike.id)}
        className="rounded-lg bg-card p-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">{dict.components.form.name}</Label>
            <Input
              id="name"
              name="name"
              list="component-suggestions"
              autoComplete="off"
              placeholder={dict.components.form.namePlaceholder}
              required
            />
            <datalist id="component-suggestions">
              {COMPONENT_NAME_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">{dict.components.form.category}</Label>
            <select
              id="category"
              name="category"
              defaultValue={COMPONENT_CATEGORIES[0]}
              className="flex h-8 w-full items-center rounded-sm border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {COMPONENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <BrandField manufacturers={manufacturers} dict={dict} />

          <div className="space-y-1.5">
            <Label htmlFor="model">{dict.components.form.model}</Label>
            <Input id="model" name="model" placeholder={dict.components.form.modelPlaceholder} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="serial_number">{dict.components.form.serialNumber}</Label>
            <Input id="serial_number" name="serial_number" placeholder={dict.components.form.optional} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="install_date">{dict.components.form.installDate}</Label>
            <Input id="install_date" name="install_date" type="date" />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="interval_months">{dict.components.form.intervalMonths}</Label>
            <Input
              id="interval_months"
              name="interval_months"
              type="number"
              placeholder={dict.components.form.intervalPlaceholder}
              className="max-w-[140px]"
            />
            <p className="text-xs text-muted-foreground">{dict.components.form.intervalHint}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="total_km">{dict.components.form.totalDistance(distanceUnit)}</Label>
            <Input
              id="total_km"
              name="total_km"
              type="number"
              step="0.1"
              placeholder={dict.components.form.optional}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="total_hours">{dict.components.form.totalHours}</Label>
            <Input
              id="total_hours"
              name="total_hours"
              type="number"
              step="0.1"
              placeholder={dict.components.form.optional}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">{dict.components.form.notes}</Label>
            <Textarea id="notes" name="notes" placeholder={dict.components.form.optional} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            render={<Link href={`/bikes/${bike.id}`} />}
            nativeButton={false}
            type="button"
            variant="outline"
          >
            {dict.components.form.cancel}
          </Button>
          <Button type="submit">{dict.components.form.saveNew}</Button>
        </div>
      </form>
    </div>
  );
}
