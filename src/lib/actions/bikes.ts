"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { bikeSchema } from "@/lib/validations/bike.schema";

function parseBikeFormData(formData: FormData) {
  return bikeSchema.safeParse({
    name: formData.get("name"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: formData.get("year"),
    type: formData.get("type"),
    color: formData.get("color"),
    serial_number: formData.get("serial_number"),
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

  const { data: bike, error } = await supabase
    .from("bikes")
    .insert({ ...parsed.data, user_id: userId })
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

  const { error } = await supabase.from("bikes").update(parsed.data).eq("id", bikeId);
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
