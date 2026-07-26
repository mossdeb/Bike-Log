"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { bikeSchema } from "@/lib/validations/bike.schema";
import { getUserSubscription } from "@/lib/subscription";
import { PLAN_LIMITS } from "@/lib/plans";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * A component's "usage since install" is anchored to the bike's total at
 * the moment it was installed (bike_km_at_install/bike_hours_at_install),
 * not to an absolute number that's meant to stay fixed. If the bike's
 * total is later corrected (e.g. a typo), leaving those baselines untouched
 * would silently invalidate every component's derived usage — shifting
 * them by the same delta keeps already-accrued usage unchanged instead.
 */
async function rebaseComponentBaselines(
  supabase: SupabaseServerClient,
  bikeId: string,
  deltaKm: number,
  deltaHours: number
) {
  const { data: components } = await supabase
    .from("components")
    .select("id, bike_km_at_install, bike_hours_at_install")
    .eq("bike_id", bikeId);
  if (!components || components.length === 0) return;

  await Promise.all(
    components.map((c) =>
      supabase
        .from("components")
        .update({
          bike_km_at_install: c.bike_km_at_install != null ? c.bike_km_at_install + deltaKm : null,
          bike_hours_at_install: c.bike_hours_at_install != null ? c.bike_hours_at_install + deltaHours : null,
        })
        .eq("id", c.id)
    )
  );

  const { data: interventions } = await supabase
    .from("interventions")
    .select("id, bike_km_at_intervention, bike_hours_at_intervention")
    .in(
      "component_id",
      components.map((c) => c.id)
    );
  if (!interventions || interventions.length === 0) return;

  await Promise.all(
    interventions.map((i) =>
      supabase
        .from("interventions")
        .update({
          bike_km_at_intervention: i.bike_km_at_intervention != null ? i.bike_km_at_intervention + deltaKm : null,
          bike_hours_at_intervention:
            i.bike_hours_at_intervention != null ? i.bike_hours_at_intervention + deltaHours : null,
        })
        .eq("id", i.id)
    )
  );
}

function parseBikeFormData(formData: FormData) {
  return bikeSchema.safeParse({
    name: formData.get("name"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: formData.get("year"),
    type: formData.get("type"),
    color: formData.get("color"),
    serial_number: formData.get("serial_number"),
    total_km: formData.get("total_km"),
    total_hours: formData.get("total_hours"),
    notes: formData.get("notes"),
  });
}

export async function createBike(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const userId = userData?.claims?.sub as string | undefined;
  if (!userId) redirect("/login");

  const parsed = parseBikeFormData(formData);
  if (!parsed.success) {
    redirect(`/bikes/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const { plan } = await getUserSubscription(userId);
  const maxBikes = PLAN_LIMITS[plan].maxBikes;
  if (maxBikes !== null) {
    const { count } = await supabase.from("bikes").select("id", { count: "exact", head: true }).eq("user_id", userId);
    if ((count ?? 0) >= maxBikes) {
      redirect(
        `/bikes/new?error=${encodeURIComponent(`Your ${plan} plan is limited to ${maxBikes} bike${maxBikes === 1 ? "" : "s"}. Upgrade in Settings to add more.`)}`
      );
    }
  }

  const stravaGearId = (formData.get("strava_gear_id") as string) || null;

  const { data: bike, error } = await supabase
    .from("bikes")
    .insert({ ...parsed.data, user_id: userId, strava_gear_id: stravaGearId })
    .select("id")
    .single();

  if (error || !bike) {
    redirect(`/bikes/new?error=${encodeURIComponent(error?.message ?? "Could not create bike")}`);
  }

  revalidatePath("/bikes");
  redirect(`/bikes/${bike.id}`);
}

export async function updateBike(bikeId: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = parseBikeFormData(formData);
  if (!parsed.success) {
    redirect(
      `/bikes/${bikeId}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  // Once a bike is linked to a Strava gear, its totals are Strava's to
  // manage — ignore whatever this form submitted for them (the fields are
  // read-only client-side, but a linked bike stays authoritative either way).
  const { data: existingBike } = await supabase
    .from("bikes")
    .select("strava_gear_id, total_km, total_hours")
    .eq("id", bikeId)
    .single();
  const updateData = existingBike?.strava_gear_id
    ? { ...parsed.data, total_km: undefined, total_hours: undefined }
    : parsed.data;

  const { error } = await supabase.from("bikes").update(updateData).eq("id", bikeId);
  if (error) {
    redirect(`/bikes/${bikeId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  if (existingBike && !existingBike.strava_gear_id) {
    const deltaKm = (parsed.data.total_km ?? 0) - (existingBike.total_km ?? 0);
    const deltaHours = (parsed.data.total_hours ?? 0) - (existingBike.total_hours ?? 0);
    if (deltaKm !== 0 || deltaHours !== 0) {
      await rebaseComponentBaselines(supabase, bikeId, deltaKm, deltaHours);
    }
  }

  revalidatePath("/bikes");
  revalidatePath(`/bikes/${bikeId}`);
  redirect(`/bikes/${bikeId}`);
}

export async function deleteBike(bikeId: string) {
  const supabase = await createClient();
  await supabase.from("bikes").delete().eq("id", bikeId);
  revalidatePath("/bikes");
  redirect("/bikes");
}
