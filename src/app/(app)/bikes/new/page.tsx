import Link from "next/link";
import { getBikeIndexManufacturers } from "@/lib/bikeindex";
import { createClient } from "@/lib/supabase/server";
import { createBike } from "@/lib/actions/bikes";
import { getValidStravaAccessToken, fetchStravaBikes } from "@/lib/strava";
import { BIKE_TYPES } from "@/lib/constants";
import { BrandField } from "@/components/brand-field";
import { StravaIcon } from "@/components/strava-icon";
import { StravaConnectRow } from "@/components/strava-connect-row";
import { FormError } from "@/components/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BikeOptionalFields } from "@/components/bike-optional-fields";
import { bikeOptionalFieldLabels } from "@/lib/bike-optional-field-labels";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";

export default async function NewBikePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";
  const dict = getDictionary(localeFromMetadata(userData?.claims?.user_metadata));
  const userId = userData?.claims?.sub as string | undefined;
  const manufacturers = await getBikeIndexManufacturers();

  const stravaAccessToken = userId ? await getValidStravaAccessToken(supabase, userId) : null;
  const stravaBikes = stravaAccessToken ? await fetchStravaBikes(stravaAccessToken) : [];
  const gearOwnerByGearId = new Map<string, string>();
  if (stravaBikes.length > 0 && userId) {
    const { data: linkedBikes } = await supabase
      .from("bikes")
      .select("name, strava_gear_id")
      .eq("user_id", userId)
      .not("strava_gear_id", "is", null);
    for (const b of linkedBikes ?? []) {
      if (b.strava_gear_id) gearOwnerByGearId.set(b.strava_gear_id, b.name);
    }
  }

  return (
    <div className="max-w-2xl pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">{dict.bikes.form.addTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.bikes.form.addSubtitle}</p>
      </div>

      <FormError message={error} />

      <form action={createBike} className="rounded-lg bg-card p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <BrandField manufacturers={manufacturers} dict={dict} />

          <div className="space-y-1.5">
            <Label htmlFor="model">{dict.bikes.form.model}</Label>
            <Input id="model" name="model" placeholder={dict.bikes.form.modelPlaceholder} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">{dict.bikes.form.type}</Label>
            <select
              id="type"
              name="type"
              defaultValue="Enduro"
              className="flex h-[42px] w-full items-center rounded-sm border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {BIKE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">{dict.bikes.form.name}</Label>
            <Input id="name" name="name" placeholder={dict.bikes.form.namePlaceholder} />
          </div>

          <div className="grid grid-cols-2 gap-5 sm:contents">
            <div className="space-y-1.5">
              <Label htmlFor="total_km">{dict.bikes.form.totalDistance(distanceUnit)}</Label>
              <Input
                id="total_km"
                name="total_km"
                type="number"
                step="0.1"
                placeholder={dict.bikes.form.optional}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="total_hours">{dict.bikes.form.totalHours}</Label>
              <Input
                id="total_hours"
                name="total_hours"
                type="number"
                step="0.1"
                placeholder={dict.bikes.form.optional}
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>{dict.bikes.form.stravaTitle}</Label>
            {stravaAccessToken ? (
              <div className="flex items-center gap-3 rounded-sm bg-muted px-3.5 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-inset ring-border">
                  <StravaIcon className="size-4" />
                </span>
                <select
                  id="strava_gear_id"
                  name="strava_gear_id"
                  defaultValue=""
                  className="ml-auto flex h-[42px] w-56 items-center rounded-sm border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value="">{dict.bikes.form.stravaNone}</option>
                  {stravaBikes.map((gear) => {
                    const linkedTo = gearOwnerByGearId.get(gear.id);
                    return (
                      <option key={gear.id} value={gear.id} disabled={!!linkedTo}>
                        {linkedTo ? dict.bikes.form.stravaAlreadyLinked(gear.name, linkedTo) : gear.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <StravaConnectRow label={dict.settings.strava.strava} connectLabel={dict.settings.strava.connect} />
            )}
            <p className="text-xs text-muted-foreground">{dict.bikes.form.stravaDescription}</p>
          </div>

          <BikeOptionalFields labels={bikeOptionalFieldLabels(dict)} />
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            render={<Link href="/bikes" />}
            nativeButton={false}
            type="button"
            variant="outline"
            className="flex-1"
          >
            {dict.bikes.form.cancel}
          </Button>
          <Button type="submit" className="flex-1">{dict.bikes.form.saveNew}</Button>
        </div>
      </form>
    </div>
  );
}
