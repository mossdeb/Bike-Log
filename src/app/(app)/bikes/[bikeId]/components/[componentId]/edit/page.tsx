import Link from "next/link";
import { notFound } from "next/navigation";
import { getBikeIndexManufacturers } from "@/lib/bikeindex";
import { createClient } from "@/lib/supabase/server";
import { updateComponent, deleteComponent } from "@/lib/actions/components";
import { COMPONENT_CATEGORIES, COMPONENT_NAME_SUGGESTIONS } from "@/lib/constants";
import { BrandField } from "@/components/brand-field";
import { IntervalField } from "@/components/interval-field";
import { FormError } from "@/components/form-error";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentOptionalFields } from "@/components/component-optional-fields";
import { componentOptionalFieldLabels } from "@/lib/component-optional-field-labels";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";
import { kmToUnit } from "@/lib/format";
import type { IntervalType } from "@/lib/validations/component.schema";

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
  const { data: userData } = await supabase.auth.getClaims();
  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";
  const dict = getDictionary(localeFromMetadata(userData?.claims?.user_metadata));

  const { data: bike } = await supabase.from("bikes").select("id, name").eq("id", bikeId).single();
  if (!bike) notFound();

  const { data: component } = await supabase
    .from("components")
    .select("*")
    .eq("id", componentId)
    .eq("bike_id", bikeId)
    .single();
  if (!component) notFound();

  const intervalValueDisplay =
    component.interval_value != null
      ? component.interval_type === "km"
        ? Math.round(kmToUnit(component.interval_value, distanceUnit) * 10) / 10
        : component.interval_value
      : null;

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
        <Link href={`/bikes/${bike.id}/components/${component.id}`} className="hover:text-foreground">
          {component.name}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{dict.components.form.editBreadcrumb}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">{dict.components.form.editTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.components.form.editSubtitle(component.name)}</p>
      </div>

      <FormError message={error} />

      <form
        action={updateComponent.bind(null, bike.id, component.id)}
        className="rounded-lg bg-card p-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <BrandField manufacturers={manufacturers} defaultValue={component.brand} dict={dict} />

          <div className="space-y-1.5">
            <Label htmlFor="model">{dict.components.form.model}</Label>
            <Input id="model" name="model" defaultValue={component.model ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">{dict.components.form.category}</Label>
            <select
              id="category"
              name="category"
              defaultValue={component.category ?? COMPONENT_CATEGORIES[0]}
              className="flex h-[42px] w-full items-center rounded-sm border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {COMPONENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">{dict.components.form.name}</Label>
            <Input
              id="name"
              name="name"
              list="component-suggestions"
              autoComplete="off"
              defaultValue={component.name}
            />
            <datalist id="component-suggestions">
              {COMPONENT_NAME_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <IntervalField
            defaultType={(component.interval_type as IntervalType) ?? "months"}
            defaultValue={intervalValueDisplay}
            label={dict.components.form.intervalLabel}
            hint={dict.components.form.intervalHint}
            kmLabel={dict.components.form.intervalTypeKm(distanceUnit)}
            hoursLabel={dict.components.form.intervalTypeHours}
            monthsLabel={dict.components.form.intervalTypeMonths}
          />

          <ComponentOptionalFields
            labels={componentOptionalFieldLabels(dict)}
            defaults={{
              install_date: component.install_date,
              serial_number: component.serial_number,
              purchase_date: component.purchase_date,
              warranty: component.warranty,
              year: component.year,
              notes: component.notes,
            }}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            render={<Link href={`/bikes/${bike.id}/components/${component.id}`} />}
            nativeButton={false}
            type="button"
            variant="outline"
            className="flex-1"
          >
            {dict.components.form.cancel}
          </Button>
          <Button type="submit" className="flex-1">{dict.components.form.saveEdit}</Button>
        </div>
      </form>

      <div className="mt-6 rounded-lg border border-destructive/30 bg-card p-6">
        <p className="text-sm font-semibold">{dict.components.form.deleteTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{dict.components.form.deleteDesc(component.name)}</p>
        <div className="mt-4">
          <DeleteConfirmButton
            action={deleteComponent.bind(null, bike.id, component.id)}
            title={dict.components.form.deleteConfirmTitle}
            description={dict.components.form.deleteConfirmDesc(component.name)}
            triggerLabel={dict.components.form.deleteButton}
            cancelLabel={dict.components.form.cancel}
          />
        </div>
      </div>
    </div>
  );
}
