"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { bikeSchema } from "@/lib/validations/bike.schema";
import { getUserSubscription } from "@/lib/subscription";
import { PLAN_LIMITS } from "@/lib/plans";

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
  const { data: existingBike } = await supabase.from("bikes").select("strava_gear_id").eq("id", bikeId).single();
  const updateData = existingBike?.strava_gear_id
    ? { ...parsed.data, total_km: undefined, total_hours: undefined }
    : parsed.data;

  const { error } = await supabase.from("bikes").update(updateData).eq("id", bikeId);
  if (error) {
    redirect(`/bikes/${bikeId}/edit?error=${encodeURIComponent(error.message)}`);
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
