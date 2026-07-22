"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { componentSchema } from "@/lib/validations/component.schema";

function parseComponentFormData(formData: FormData) {
  return componentSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    serial_number: formData.get("serial_number"),
    install_date: formData.get("install_date"),
    interval_months: formData.get("interval_months"),
    notes: formData.get("notes"),
  });
}

export async function createComponent(bikeId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const userId = userData?.claims?.sub as string | undefined;
  if (!userId) redirect("/login");

  const parsed = parseComponentFormData(formData);
  if (!parsed.success) {
    redirect(
      `/bikes/${bikeId}/components/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const { data: component, error } = await supabase
    .from("components")
    .insert({ ...parsed.data, bike_id: bikeId, user_id: userId })
    .select("id")
    .single();

  if (error || !component) {
    redirect(
      `/bikes/${bikeId}/components/new?error=${encodeURIComponent(error?.message ?? "Could not create component")}`
    );
  }

  revalidatePath(`/bikes/${bikeId}`);
  redirect(`/bikes/${bikeId}/components/${component.id}`);
}

export async function updateComponent(bikeId: string, componentId: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = parseComponentFormData(formData);
  if (!parsed.success) {
    redirect(
      `/bikes/${bikeId}/components/${componentId}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const { error } = await supabase.from("components").update(parsed.data).eq("id", componentId);
  if (error) {
    redirect(
      `/bikes/${bikeId}/components/${componentId}/edit?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/bikes/${bikeId}`);
  revalidatePath(`/bikes/${bikeId}/components/${componentId}`);
  redirect(`/bikes/${bikeId}/components/${componentId}`);
}

export async function deleteComponent(bikeId: string, componentId: string) {
  const supabase = await createClient();
  await supabase.from("components").delete().eq("id", componentId);
  revalidatePath(`/bikes/${bikeId}`);
  redirect(`/bikes/${bikeId}`);
}
