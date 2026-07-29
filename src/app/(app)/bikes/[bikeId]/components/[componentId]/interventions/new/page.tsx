import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createIntervention } from "@/lib/actions/interventions";
import { FormError } from "@/components/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";
import { calculateComponentUsage } from "@/lib/maintenance/calculation";
import { kmToUnit } from "@/lib/format";

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
  const { data: userData } = await supabase.auth.getClaims();
  const dict = getDictionary(localeFromMetadata(userData?.claims?.user_metadata));
  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";

  const { data: bike } = await supabase
    .from("bikes")
    .select("id, name, total_km, total_hours")
    .eq("id", bikeId)
    .single();
  if (!bike) notFound();

  const { data: component } = await supabase
    .from("components")
    .select("id, name, bike_km_at_install, bike_hours_at_install")
    .eq("id", componentId)
    .eq("bike_id", bikeId)
    .single();
  if (!component) notFound();

  const usage = calculateComponentUsage({
    bikeTotalKm: bike.total_km,
    bikeTotalHours: bike.total_hours,
    bikeKmAtInstall: component.bike_km_at_install,
    bikeHoursAtInstall: component.bike_hours_at_install,
  });
  const hoursUsedValue = usage.hours != null ? Math.round(usage.hours * 10) / 10 : "";
  const kmsValue = usage.km != null ? Math.round(kmToUnit(usage.km, distanceUnit) * 10) / 10 : "";

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
        <span className="text-foreground">{dict.components.detail.logIntervention}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">{dict.interventions.form.addTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.interventions.form.addSubtitle(component.name)}
        </p>
      </div>

      <FormError message={error} />

      <form
        action={createIntervention.bind(null, bike.id, component.id)}
        className="rounded-lg bg-card p-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{dict.interventions.form.type}</Label>
            <div className="flex gap-2">
              {(["service", "repair", "replacement"] as const).map((type, i) => (
                <label
                  key={type}
                  className="flex flex-1 items-center justify-center rounded-sm border border-input px-3 py-2 text-sm font-semibold has-checked:border-transparent has-checked:bg-foreground has-checked:text-background"
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    defaultChecked={i === 0}
                    className="sr-only"
                  />
                  {dict.interventionType[type]}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">{dict.interventions.form.date}</Label>
            <Input id="date" name="date" type="date" required />
          </div>
          <div />

          <div className="space-y-1.5">
            <Label htmlFor="hours_used">{dict.interventions.form.hoursOfUse}</Label>
            <Input
              id="hours_used"
              name="hours_used"
              type="number"
              step="0.1"
              defaultValue={hoursUsedValue}
              placeholder={dict.interventions.form.optional}
              readOnly
              className="cursor-not-allowed bg-muted/50 text-muted-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kms">{dict.interventions.form.distance(distanceUnit)}</Label>
            <Input
              id="kms"
              name="kms"
              type="number"
              step="0.1"
              defaultValue={kmsValue}
              placeholder={dict.interventions.form.optional}
              readOnly
              className="cursor-not-allowed bg-muted/50 text-muted-foreground"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">{dict.interventions.form.description}</Label>
            <Input
              id="description"
              name="description"
              placeholder={dict.interventions.form.descriptionPlaceholder}
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">{dict.interventions.form.notes}</Label>
            <Textarea id="notes" name="notes" placeholder={dict.interventions.form.notesPlaceholder} />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            render={<Link href={`/bikes/${bike.id}/components/${component.id}`} />}
            nativeButton={false}
            type="button"
            variant="outline"
            className="flex-1"
          >
            {dict.interventions.form.cancel}
          </Button>
          <Button type="submit" className="flex-1">{dict.interventions.form.saveNew}</Button>
        </div>
      </form>
    </div>
  );
}
