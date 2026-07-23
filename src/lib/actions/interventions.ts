"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { interventionSchema } from "@/lib/validations/intervention.schema";
import { unitToKm } from "@/lib/format";

function parseInterventionFormData(formData: FormData) {
  return interventionSchema.safeParse({
    type: formData.get("type"),
    date: formData.get("date"),
    hours_used: formData.get("hours_used"),
    kms: formData.get("kms"),
    description: formData.get("description"),
    notes: formData.get("notes"),
  });
}

export async function createIntervention(bikeId: string, componentId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const userId = userData?.claims?.sub as string | undefined;
  if (!userId) redirect("/login");

  const parsed = parseInterventionFormData(formData);
  if (!parsed.success) {
    redirect(
      `/bikes/${bikeId}/components/${componentId}/interventions/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";
  const kms = parsed.data.kms != null ? unitToKm(parsed.data.kms, distanceUnit) : null;

  const { error } = await supabase
    .from("interventions")
    .insert({ ...parsed.data, kms, component_id: componentId, user_id: userId });

  if (error) {
    redirect(
      `/bikes/${bikeId}/components/${componentId}/interventions/new?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/bikes/${bikeId}`);
  revalidatePath(`/bikes/${bikeId}/components/${componentId}`);
  redirect(`/bikes/${bikeId}/components/${componentId}`);
}

export async function updateIntervention(
  bikeId: string,
  componentId: string,
  interventionId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();

  const parsed = parseInterventionFormData(formData);
  if (!parsed.success) {
    redirect(
      `/bikes/${bikeId}/components/${componentId}/interventions/${interventionId}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";
  const kms = parsed.data.kms != null ? unitToKm(parsed.data.kms, distanceUnit) : null;

  const { error } = await supabase
    .from("interventions")
    .update({ ...parsed.data, kms })
    .eq("id", interventionId);

  if (error) {
    redirect(
      `/bikes/${bikeId}/components/${componentId}/interventions/${interventionId}/edit?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/bikes/${bikeId}`);
  revalidatePath(`/bikes/${bikeId}/components/${componentId}`);
  redirect(`/bikes/${bikeId}/components/${componentId}`);
}

export async function deleteIntervention(bikeId: string, componentId: string, interventionId: string) {
  const supabase = await createClient();
  await supabase.from("interventions").delete().eq("id", interventionId);
  revalidatePath(`/bikes/${bikeId}`);
  revalidatePath(`/bikes/${bikeId}/components/${componentId}`);
  redirect(`/bikes/${bikeId}/components/${componentId}`);
}
