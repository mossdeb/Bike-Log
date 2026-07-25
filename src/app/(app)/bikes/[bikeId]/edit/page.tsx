import Link from "next/link";
import { notFound } from "next/navigation";
import { getBikeIndexManufacturers } from "@/lib/bikeindex";
import { createClient } from "@/lib/supabase/server";
import { updateBike, deleteBike } from "@/lib/actions/bikes";
import { updateBikeStravaGear } from "@/lib/actions/strava";
import { getValidStravaAccessToken, fetchStravaBikes } from "@/lib/strava";
import { BIKE_TYPES } from "@/lib/constants";
import { BrandField } from "@/components/brand-field";
import { FormError } from "@/components/form-error";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";

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
  const { data: userData } = await supabase.auth.getClaims();
  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";
  const dict = getDictionary(localeFromMetadata(userData?.claims?.user_metadata));

  const { data: bike } = await supabase.from("bikes").select("*").eq("id", bikeId).single();
  if (!bike) notFound();

  const [manufacturers, { count: componentCount }] = await Promise.all([
    getBikeIndexManufacturers(),
    supabase.from("components").select("id", { count: "exact", head: true }).eq("bike_id", bikeId),
  ]);

  const userId = userData?.claims?.sub as string | undefined;
  const stravaAccessToken = userId ? await getValidStravaAccessToken(supabase, userId) : null;
  const stravaBikes = stravaAccessToken ? await fetchStravaBikes(stravaAccessToken) : [];
  const gearOwnerByGearId = new Map<string, string>();
  if (stravaBikes.length > 0 && userId) {
    const { data: linkedBikes } = await supabase
      .from("bikes")
      .select("name, strava_gear_id")
      .eq("user_id", userId)
      .not("strava_gear_id", "is", null)
      .neq("id", bikeId);
    for (const b of linkedBikes ?? []) {
      if (b.strava_gear_id) gearOwnerByGearId.set(b.strava_gear_id, b.name);
    }
  }
  const isStravaLinked = !!bike.strava_gear_id;

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
        <span className="text-foreground">{dict.bikes.form.editBreadcrumb}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">{dict.bikes.form.editTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.bikes.form.editSubtitle(bike.name)}</p>
      </div>

      <FormError message={error} />

      <form
        action={updateBike.bind(null, bike.id)}
        className="rounded-lg bg-card p-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">{dict.bikes.form.name}</Label>
            <Input id="name" name="name" defaultValue={bike.name} required />
          </div>

          <BrandField manufacturers={manufacturers} defaultValue={bike.brand} dict={dict} />

          <div className="space-y-1.5">
            <Label htmlFor="model">{dict.bikes.form.model}</Label>
            <Input id="model" name="model" defaultValue={bike.model ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year">{dict.bikes.form.year}</Label>
            <Input id="year" name="year" type="number" defaultValue={bike.year ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">{dict.bikes.form.type}</Label>
            <select
              id="type"
              name="type"
              defaultValue={bike.type ?? "Enduro"}
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
            <Label htmlFor="color">{dict.bikes.form.color}</Label>
            <Input id="color" name="color" defaultValue={bike.color ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="serial_number">{dict.bikes.form.serialNumber}</Label>
            <Input id="serial_number" name="serial_number" defaultValue={bike.serial_number ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="total_km">{dict.bikes.form.totalDistance(distanceUnit)}</Label>
            <Input
              id="total_km"
              name="total_km"
              type="number"
              step="0.1"
              defaultValue={bike.total_km ?? ""}
              placeholder={dict.bikes.form.optional}
              readOnly={isStravaLinked}
              className={isStravaLinked ? "bg-muted text-muted-foreground" : undefined}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="total_hours">{dict.bikes.form.totalHours}</Label>
            <Input
              id="total_hours"
              name="total_hours"
              type="number"
              step="0.1"
              defaultValue={bike.total_hours ?? ""}
              placeholder={dict.bikes.form.optional}
              readOnly={isStravaLinked}
              className={isStravaLinked ? "bg-muted text-muted-foreground" : undefined}
            />
          </div>
          {isStravaLinked && (
            <p className="text-xs text-muted-foreground sm:col-span-2">{dict.bikes.form.stravaHint}</p>
          )}

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">{dict.bikes.form.notes}</Label>
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
            {dict.bikes.form.cancel}
          </Button>
          <Button type="submit">{dict.bikes.form.saveEdit}</Button>
        </div>
      </form>

      <div className="mt-6 rounded-lg bg-card p-6">
        <p className="text-sm font-semibold">{dict.bikes.form.stravaTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{dict.bikes.form.stravaDescription}</p>
        {stravaAccessToken ? (
          <form action={updateBikeStravaGear.bind(null, bike.id)} className="mt-4 flex items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="strava_gear_id">{dict.bikes.form.stravaGearLabel}</Label>
              <select
                id="strava_gear_id"
                name="strava_gear_id"
                defaultValue={bike.strava_gear_id ?? ""}
                className="flex h-8 w-56 items-center rounded-sm border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
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
            <Button type="submit" variant="outline" size="sm">
              {dict.bikes.form.stravaSave}
            </Button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">{dict.bikes.form.stravaNotConnected}</p>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-destructive/30 bg-card p-6">
        <p className="text-sm font-semibold">{dict.bikes.form.deleteTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.bikes.form.deleteDesc(bike.name, componentCount ?? 0)}
        </p>
        <div className="mt-4">
          <DeleteConfirmButton
            action={deleteBike.bind(null, bike.id)}
            title={dict.bikes.form.deleteConfirmTitle}
            description={dict.bikes.form.deleteConfirmDesc(bike.name, componentCount ?? 0)}
            triggerLabel={dict.bikes.form.deleteButton}
            cancelLabel={dict.bikes.form.cancel}
          />
        </div>
      </div>
    </div>
  );
}
