import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBikeIndexManufacturers } from "@/lib/bikeindex";
import { createClient } from "@/lib/supabase/server";
import { createComponent } from "@/lib/actions/components";
import { COMPONENT_CATEGORIES, COMPONENT_NAME_SUGGESTIONS } from "@/lib/constants";
import { BrandField } from "@/components/brand-field";
import { IntervalFieldGroup } from "@/components/interval-field";
import { FormError } from "@/components/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentOptionalFields } from "@/components/component-optional-fields";
import { componentOptionalFieldLabels } from "@/lib/component-optional-field-labels";
import { NewComponentWizard } from "@/components/new-component-wizard";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";
import { kmToUnit } from "@/lib/format";

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

  // Independent of each other (bike is keyed off the URL's id, manufacturers
  // is an external API call) — fired together instead of one after another.
  const [{ data: userData }, { data: bike }, manufacturers] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.from("bikes").select("id, name, total_km, total_hours").eq("id", bikeId).single(),
    getBikeIndexManufacturers(),
  ]);

  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";
  const dict = getDictionary(localeFromMetadata(userData?.claims?.user_metadata));

  if (!bike) notFound();

  // Most components being added are original equipment that's been on the
  // bike since day one, not a fresh part — so default the head start to the
  // bike's current totals (implying 0 usage so far) rather than 0, which
  // would instead imply the bike had already accumulated all its usage
  // without this component.
  const defaultInitialKm = Math.round(kmToUnit(bike.total_km ?? 0, distanceUnit) * 10) / 10;
  const defaultInitialHours = Math.round((bike.total_hours ?? 0) * 10) / 10;

  const step1 = (
    <Fragment key="step-1">
      <div className="space-y-1.5">
        <Label htmlFor="category">{dict.components.form.category}</Label>
        <select
          id="category"
          name="category"
          required
          defaultValue={COMPONENT_CATEGORIES[0]}
          className="flex h-[48px] w-full items-center rounded-sm border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          {COMPONENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <BrandField manufacturers={manufacturers} dict={dict} required />

      <div className="space-y-1.5">
        <Label htmlFor="model">{dict.components.form.model}</Label>
        <Input id="model" name="model" required placeholder={dict.components.form.modelPlaceholder} />
      </div>
    </Fragment>
  );

  const step2 = (
    <Fragment key="step-2">
      <div className="space-y-1.5">
        <Label htmlFor="name">{dict.components.form.name}</Label>
        <Input
          id="name"
          name="name"
          list="component-suggestions"
          autoComplete="off"
          placeholder={dict.components.form.namePlaceholder}
        />
        <datalist id="component-suggestions">
          {COMPONENT_NAME_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="initial_km">{dict.components.form.totalDistance(distanceUnit)}</Label>
            <Input id="initial_km" name="initial_km" type="number" step="0.1" defaultValue={defaultInitialKm} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="initial_hours">{dict.components.form.totalHours}</Label>
            <Input id="initial_hours" name="initial_hours" type="number" step="0.1" defaultValue={defaultInitialHours} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{dict.components.form.totalUsageHint}</p>
      </div>

      <ComponentOptionalFields labels={componentOptionalFieldLabels(dict)} />
    </Fragment>
  );

  const step3 = (
    <IntervalFieldGroup
      key="step-3"
      hint={dict.components.form.intervalHint}
      nameLabel={dict.components.form.intervalNameLabel}
      namePlaceholder={dict.components.form.intervalNamePlaceholder}
      kmLabel={dict.components.form.intervalTypeKm(distanceUnit)}
      hoursLabel={dict.components.form.intervalTypeHours}
      monthsLabel={dict.components.form.intervalTypeMonths}
      reminderToggleLabel={dict.components.form.reminderToggleLabel}
      addAnotherLabel={dict.components.form.addAnotherReminder}
    />
  );

  return (
    <div className="max-w-2xl pt-4 sm:pt-8">
      <div className="mb-2 hidden text-sm text-muted-foreground sm:block">
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

      <FormError message={error} />

      <NewComponentWizard
        action={createComponent.bind(null, bike.id)}
        title={dict.components.form.addTitle}
        desktopSubtitle={dict.components.form.addSubtitle(bike.name)}
        stepSubtitles={[
          dict.components.form.wizardStep1Subtitle,
          dict.components.form.wizardStep2Subtitle,
          dict.components.form.wizardStep3Subtitle,
        ]}
        stepLabels={[
          dict.components.form.wizardStep1Label,
          dict.components.form.wizardStep2Label,
          dict.components.form.wizardStep3Label,
        ]}
        cancelHref={`/bikes/${bike.id}`}
        nextLabel={dict.bikes.form.wizardNext}
        backLabel={dict.bikes.form.wizardBack}
        cancelLabel={dict.components.form.cancel}
        saveLabel={dict.components.form.saveNew}
        steps={[step1, step2, step3]}
      />
    </div>
  );
}
