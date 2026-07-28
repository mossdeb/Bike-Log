"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { componentSchema, componentInitialUsageSchema } from "@/lib/validations/component.schema";
import { getUserSubscription } from "@/lib/subscription";
import { PLAN_LIMITS } from "@/lib/plans";
import { unitToKm } from "@/lib/format";

function parseComponentFormData(formData: FormData) {
  return componentSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    serial_number: formData.get("serial_number"),
    install_date: formData.get("install_date"),
    interval_type: formData.get("interval_type"),
    interval_value: formData.get("interval_value"),
    notes: formData.get("notes"),
    purchase_date: formData.get("purchase_date"),
    warranty: formData.get("warranty"),
    year: formData.get("year"),
  });
}

/**
 * The component name is optional in the form — when left blank, fall back
 * to a generated display name so component.name always has something to
 * show in lists/headers rather than storing an empty string.
 */
function deriveComponentName(data: { name: string | null; brand: string | null; model: string | null; category: string | null }) {
  if (data.name) return data.name;
  const brandModel = [data.brand, data.model].filter(Boolean).join(" ");
  return brandModel || data.category || "Unnamed component";
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

  // Distances are always stored in km — interval_value and initial_km are
  // entered in whichever unit the user prefers and need converting before
  // they're saved alongside bike/component totals, which are always km.
  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";
  if (parsed.data.interval_type === "km" && parsed.data.interval_value != null) {
    parsed.data.interval_value = unitToKm(parsed.data.interval_value, distanceUnit);
  }

  const { plan } = await getUserSubscription(userId);
  const maxComponents = PLAN_LIMITS[plan].maxComponents;
  if (maxComponents !== null) {
    const { count } = await supabase
      .from("components")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) >= maxComponents) {
      redirect(
        `/bikes/${bikeId}/components/new?error=${encodeURIComponent(`Your ${plan} plan is limited to ${maxComponents} components. Upgrade in Settings to add more.`)}`
      );
    }
  }

  // The user can give a new component a head start (e.g. a used part) via
  // initial_km/initial_hours — defaults to 0 for a brand-new part. From
  // then on usage is derived from the bike's totals, so this is folded
  // into the install-time baseline rather than stored directly.
  const initialUsage = componentInitialUsageSchema.safeParse({
    initial_km: formData.get("initial_km"),
    initial_hours: formData.get("initial_hours"),
  });
  const initialKmRaw = (initialUsage.success ? initialUsage.data.initial_km : null) ?? 0;
  const initialKm = unitToKm(initialKmRaw, distanceUnit);
  const initialHours = (initialUsage.success ? initialUsage.data.initial_hours : null) ?? 0;

  const { data: bike } = await supabase.from("bikes").select("total_km, total_hours").eq("id", bikeId).single();

  const { data: component, error } = await supabase
    .from("components")
    .insert({
      ...parsed.data,
      name: deriveComponentName(parsed.data),
      bike_id: bikeId,
      user_id: userId,
      bike_km_at_install: (bike?.total_km ?? 0) - initialKm,
      bike_hours_at_install: (bike?.total_hours ?? 0) - initialHours,
    })
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
  const { data: userData } = await supabase.auth.getClaims();

  const parsed = parseComponentFormData(formData);
  if (!parsed.success) {
    redirect(
      `/bikes/${bikeId}/components/${componentId}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const distanceUnit = ((userData?.claims?.user_metadata?.distance_unit as string) ?? "km") as "km" | "mi";
  if (parsed.data.interval_type === "km" && parsed.data.interval_value != null) {
    parsed.data.interval_value = unitToKm(parsed.data.interval_value, distanceUnit);
  }

  const { error } = await supabase
    .from("components")
    .update({ ...parsed.data, name: deriveComponentName(parsed.data) })
    .eq("id", componentId);
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
